<?php
// backend/app/Controllers/RecordingController.php

namespace App\Controllers;

use Core\Controller;
use Core\Database;

class RecordingController extends Controller {
    public function upload(): void {
        $callLogId = (int)($_POST['call_log_id'] ?? 0);
        $callerNumber = $_POST['caller_number'] ?? '';
        $durationSeconds = (int)($_POST['duration_seconds'] ?? 0);

        if (!isset($_FILES['audio']) || $_FILES['audio']['error'] !== UPLOAD_ERR_OK) {
            $this->error('Valid audio file is required');
        }

        $file = $_FILES['audio'];
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'mp3';
        $safeName = 'rec_' . date('Ymd_His') . '_' . uniqid() . '.' . $ext;
        
        $storageDir = __DIR__ . '/../../storage/recordings';
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0777, true);
        }

        $destPath = $storageDir . '/' . $safeName;
        $relPath = 'storage/recordings/' . $safeName;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            $this->error('Failed to save audio file to disk', 500);
        }

        $db = Database::getConnection();

        // If callLogId wasn't passed directly, find the latest completed call for this callerNumber
        if (!$callLogId && !empty($callerNumber)) {
            $cleanNum = preg_replace('/[^\+0-9]/', '', $callerNumber);
            $find = $db->prepare("SELECT id FROM call_logs WHERE customer_number = ? ORDER BY id DESC LIMIT 1");
            $find->execute([$cleanNum]);
            $row = $find->fetch();
            if ($row) {
                $callLogId = (int)$row['id'];
            }
        }

        if ($callLogId) {
            $stmt = $db->prepare("
                INSERT INTO call_recordings (call_log_id, file_name, file_path, file_size_bytes, audio_format, duration_seconds, upload_status)
                VALUES (?, ?, ?, ?, ?, ?, 'UPLOADED')
            ");
            $stmt->execute([
                $callLogId,
                $file['name'],
                $relPath,
                $file['size'],
                $ext,
                $durationSeconds
            ]);
        }

        $this->success('Recording uploaded successfully', [
            'file_name' => $safeName,
            'file_path' => $relPath,
            'call_log_id' => $callLogId
        ]);
    }

    public function stream(array $params): void {
        $id = (int)($params['id'] ?? 0);
        $db = Database::getConnection();

        $stmt = $db->prepare("SELECT * FROM call_recordings WHERE id = ?");
        $stmt->execute([$id]);
        $rec = $stmt->fetch();

        if (!$rec) {
            $this->error('Recording not found', 404);
        }

        $fullPath = __DIR__ . '/../../' . $rec['file_path'];
        if (!file_exists($fullPath)) {
            // Serve a graceful empty audio or 404
            $this->error('Audio file does not exist on server storage', 404);
        }

        $mime = 'audio/mpeg';
        if ($rec['audio_format'] === 'wav') $mime = 'audio/wav';
        if ($rec['audio_format'] === 'm4a') $mime = 'audio/mp4';

        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($fullPath));
        header('Accept-Ranges: bytes');
        header('Cache-Control: public, max-age=86400');
        readfile($fullPath);
        exit;
    }
}

