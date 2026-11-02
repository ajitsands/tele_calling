<?php
// backend/app/Controllers/CallController.php

namespace App\Controllers;

use Core\Controller;
use Core\Database;

class CallController extends Controller {
    public function ingestEvent(): void {
        $body = $this->getJsonBody();
        $deviceUuid = $body['device_uuid'] ?? '';
        $deviceId = (int)($body['device_id'] ?? 0);
        $callerNumber = trim($body['caller_number'] ?? $body['customer_number'] ?? '');
        $event = strtoupper(trim($body['event'] ?? 'RINGING')); // RINGING, ANSWERED, ENDED, MISSED
        $callType = strtoupper(trim($body['call_type'] ?? 'INCOMING'));

        if (empty($callerNumber)) {
            $this->error('caller_number is required');
        }

        $db = Database::getConnection();

        // 1. Resolve Device (or Auto-Register on the fly)
        if ($deviceId > 0) {
            $devStmt = $db->prepare("SELECT * FROM devices WHERE id = ?");
            $devStmt->execute([$deviceId]);
            $device = $devStmt->fetch();
        } else {
            $devStmt = $db->prepare("SELECT * FROM devices WHERE device_uuid = ?");
            $devStmt->execute([$deviceUuid]);
            $device = $devStmt->fetch();
        }

        if (!$device) {
            // Auto-register new mobile phone (e.g. OPPO CPH2697)
            $devName = trim($body['device_name'] ?? 'Mobile Phone (' . substr($deviceUuid, 0, 14) . ')');
            $simNum = trim($body['sim_number'] ?? '+91 98100 99999');
            $androidVer = trim($body['android_version'] ?? 'Android 16');
            $ip = $_SERVER['REMOTE_ADDR'] ?? '192.168.1.1';

            $insertDev = $db->prepare("
                INSERT INTO devices (device_uuid, device_name, sim_number, android_version, ip_address, last_heartbeat, status)
                VALUES (?, ?, ?, ?, ?, NOW(), 'ONLINE')
            ");
            $insertDev->execute([$deviceUuid, $devName, $simNum, $androidVer, $ip]);
            $deviceId = (int)$db->lastInsertId();

            $device = [
                'id' => $deviceId,
                'device_uuid' => $deviceUuid,
                'device_name' => $devName,
                'sim_number' => $simNum,
                'android_version' => $androidVer,
                'status' => 'ONLINE'
            ];
        } else {
            $deviceId = (int)$device['id'];
        }

        // 2. Identify Active Telecaller mapped to this device
        $assignStmt = $db->prepare("
            SELECT da.*, u.name as user_name, u.email as user_email
            FROM device_assignments da
            JOIN users u ON da.user_id = u.id
            WHERE da.device_id = ? AND da.status = 'ACTIVE'
            LIMIT 1
        ");
        $assignStmt->execute([$deviceId]);
        $assignment = $assignStmt->fetch();

        // If device has no active shift assignment, map to Priya Sharma (user_id 2) by default
        $activeUserId = $assignment ? (int)$assignment['user_id'] : 2;

        // 3. Normalize Phone Number and Find/Create Customer
        $cleanNumber = preg_replace('/[^\+0-9]/', '', $callerNumber);
        $custStmt = $db->prepare("SELECT * FROM customers WHERE phone_number = ? OR alternate_phone = ? LIMIT 1");
        $custStmt->execute([$cleanNumber, $cleanNumber]);
        $customer = $custStmt->fetch();

        if (!$customer) {
            // Auto-create customer lead record
            $createCust = $db->prepare("
                INSERT INTO customers (phone_number, full_name, lead_status, tags) 
                VALUES (?, 'New Caller', 'NEW', 'Inbound')
            ");
            $createCust->execute([$cleanNumber]);
            $customerId = (int)$db->lastInsertId();

            $customer = [
                'id' => $customerId,
                'phone_number' => $cleanNumber,
                'full_name' => 'New Caller',
                'company_name' => '',
                'city' => '',
                'lead_status' => 'NEW',
                'tags' => 'Inbound'
            ];
        } else {
            $customerId = (int)$customer['id'];
        }

        // 4. Fetch Customer's Previous Call History and Notes
        $historyStmt = $db->prepare("
            SELECT cl.id, cl.call_type, cl.call_status, cl.duration_seconds, cl.disposition, 
                   cl.disposition_notes, cl.start_time, u.name as agent_name, d.device_name
            FROM call_logs cl
            LEFT JOIN users u ON cl.user_id = u.id
            LEFT JOIN devices d ON cl.device_id = d.id
            WHERE cl.customer_id = ?
            ORDER BY cl.start_time DESC
            LIMIT 6
        ");
        $historyStmt->execute([$customerId]);
        $history = $historyStmt->fetchAll();

        $notesStmt = $db->prepare("
            SELECT cn.id, cn.note, cn.created_at, u.name as agent_name
            FROM customer_notes cn
            JOIN users u ON cn.user_id = u.id
            WHERE cn.customer_id = ?
            ORDER BY cn.created_at DESC
            LIMIT 5
        ");
        $notesStmt->execute([$customerId]);
        $notes = $notesStmt->fetchAll();

        // 5. Handle State Machine (RINGING, ANSWERED, ENDED)
        $callLogId = 0;

        if ($event === 'RINGING') {
            // Create call log entry
            $insertLog = $db->prepare("
                INSERT INTO call_logs (device_id, user_id, customer_id, call_type, call_status, customer_number, start_time)
                VALUES (?, ?, ?, ?, 'RINGING', ?, NOW())
            ");
            $insertLog->execute([$deviceId, $activeUserId, $customerId, $callType, $cleanNumber]);
            $callLogId = (int)$db->lastInsertId();

            // Mark device as BUSY
            $db->prepare("UPDATE devices SET status = 'BUSY' WHERE id = ?")->execute([$deviceId]);

        } elseif ($event === 'ANSWERED' || $event === 'OFFHOOK') {
            // Find latest ringing call on this device
            $findLog = $db->prepare("
                SELECT id FROM call_logs 
                WHERE device_id = ? AND call_status = 'RINGING' 
                ORDER BY id DESC LIMIT 1
            ");
            $findLog->execute([$deviceId]);
            $existing = $findLog->fetch();

            if ($existing) {
                $callLogId = (int)$existing['id'];
                $db->prepare("
                    UPDATE call_logs 
                    SET call_status = 'IN_PROGRESS', answer_time = NOW() 
                    WHERE id = ?
                ")->execute([$callLogId]);
            }
        } elseif ($event === 'ENDED' || $event === 'IDLE' || $event === 'MISSED') {
            $findLog = $db->prepare("
                SELECT id, answer_time, start_time, call_status FROM call_logs 
                WHERE device_id = ? AND call_status IN ('RINGING', 'IN_PROGRESS') 
                ORDER BY id DESC LIMIT 1
            ");
            $findLog->execute([$deviceId]);
            $existing = $findLog->fetch();

            if ($existing) {
                $callLogId = (int)$existing['id'];
                $finalStatus = ($existing['call_status'] === 'RINGING' || $event === 'MISSED') ? 'MISSED' : 'COMPLETED';
                $db->prepare("
                    UPDATE call_logs 
                    SET call_status = ?, 
                        end_time = NOW(),
                        duration_seconds = CASE 
                            WHEN answer_time IS NOT NULL THEN TIMESTAMPDIFF(SECOND, answer_time, NOW())
                            ELSE 0 
                        END
                    WHERE id = ?
                ")->execute([$finalStatus, $callLogId]);
            }

            // Mark device as ONLINE again
            $db->prepare("UPDATE devices SET status = 'ONLINE' WHERE id = ?")->execute([$deviceId]);
        }

        // 6. Broadcast / Realtime Event Notification Store
        // Write event to a temporary file/table for immediate SSE polling
        $eventPayload = [
            'id' => time() . '_' . rand(1000, 9999),
            'event' => $event,
            'call_log_id' => $callLogId,
            'device_id' => $deviceId,
            'device_name' => $device['device_name'],
            'sim_number' => $device['sim_number'],
            'user_id' => $activeUserId,
            'caller_number' => $cleanNumber,
            'customer' => $customer,
            'history' => $history,
            'notes' => $notes,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        // Store active event in storage/active_event.json for SSE broadcaster
        $eventFile = __DIR__ . '/../../storage/active_event.json';
        file_put_contents($eventFile, json_encode($eventPayload));

        $this->success('Call event processed successfully', $eventPayload);
    }

    public function getActiveCall(): void {
        $user = $this->getAuthUser();
        $userId = $user ? (int)$user['id'] : 0;

        $db = Database::getConnection();

        // Find if any call is currently RINGING or IN_PROGRESS on device assigned to this user
        $stmt = $db->prepare("
            SELECT cl.*, d.device_name, d.sim_number,
                   c.full_name as customer_name, c.company_name, c.lead_status, c.city, c.tags
            FROM call_logs cl
            JOIN devices d ON cl.device_id = d.id
            JOIN device_assignments da ON d.id = da.device_id AND da.status = 'ACTIVE'
            LEFT JOIN customers c ON cl.customer_id = c.id
            WHERE da.user_id = ? AND cl.call_status IN ('RINGING', 'IN_PROGRESS')
            ORDER BY cl.id DESC
            LIMIT 1
        ");
        $stmt->execute([$userId]);
        $call = $stmt->fetch();

        if (!$call) {
            $this->success('No active call', ['active_call' => null]);
            return;
        }

        // Fetch past history for this customer
        $historyStmt = $db->prepare("
            SELECT cl.id, cl.call_type, cl.call_status, cl.duration_seconds, cl.disposition, 
                   cl.disposition_notes, cl.start_time, u.name as agent_name
            FROM call_logs cl
            LEFT JOIN users u ON cl.user_id = u.id
            WHERE cl.customer_id = ? AND cl.id != ?
            ORDER BY cl.start_time DESC
            LIMIT 5
        ");
        $historyStmt->execute([$call['customer_id'], $call['id']]);
        $history = $historyStmt->fetchAll();

        $call['history'] = $history;

        $this->success('Active call found', ['active_call' => $call]);
    }

    public function saveDisposition(array $params): void {
        $callId = (int)($params['id'] ?? 0);
        $user = $this->getAuthUser();
        $userId = $user ? (int)$user['id'] : 1;

        $body = $this->getJsonBody();
        $disposition = $body['disposition'] ?? 'INTERESTED';
        $notes = trim($body['disposition_notes'] ?? '');
        $leadStatus = $body['lead_status'] ?? null;
        $nextFollowup = !empty($body['next_followup_date']) ? $body['next_followup_date'] : null;

        if (!$callId) {
            $this->error('Call ID is required');
        }

        $db = Database::getConnection();

        // Update call log
        $stmt = $db->prepare("
            UPDATE call_logs 
            SET disposition = ?, disposition_notes = ?, next_followup_date = ?, call_status = 'COMPLETED'
            WHERE id = ?
        ");
        $stmt->execute([$disposition, $notes, $nextFollowup, $callId]);

        // Get customer ID
        $callStmt = $db->prepare("SELECT customer_id FROM call_logs WHERE id = ?");
        $callStmt->execute([$callId]);
        $call = $callStmt->fetch();

        if ($call && $call['customer_id']) {
            $custId = $call['customer_id'];

            // Insert into customer_notes
            if (!empty($notes)) {
                $noteStmt = $db->prepare("
                    INSERT INTO customer_notes (customer_id, call_log_id, user_id, note)
                    VALUES (?, ?, ?, ?)
                ");
                $noteStmt->execute([$custId, $callId, $userId, $notes]);
            }

            // Update lead status if provided
            if ($leadStatus) {
                $db->prepare("UPDATE customers SET lead_status = ? WHERE id = ?")->execute([$leadStatus, $custId]);
            }
        }

        $this->success('Call disposition and notes saved successfully');
    }

    public function index(): void {
        $db = Database::getConnection();

        $where = ["1=1"];
        $params = [];

        if (!empty($_GET['type'])) {
            $where[] = "cl.call_type = ?";
            $params[] = strtoupper($_GET['type']);
        }
        if (!empty($_GET['disposition'])) {
            $where[] = "cl.disposition = ?";
            $params[] = strtoupper($_GET['disposition']);
        }
        if (!empty($_GET['search'])) {
            $term = '%' . $_GET['search'] . '%';
            $where[] = "(cl.customer_number LIKE ? OR c.full_name LIKE ? OR c.company_name LIKE ?)";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql = "
            SELECT cl.*, 
                   d.device_name, d.sim_number,
                   u.name as agent_name,
                   c.full_name as customer_name, c.company_name, c.city, c.lead_status,
                   cr.file_path as recording_file_path, cr.duration_seconds as recording_duration
            FROM call_logs cl
            LEFT JOIN devices d ON cl.device_id = d.id
            LEFT JOIN users u ON cl.user_id = u.id
            LEFT JOIN customers c ON cl.customer_id = c.id
            LEFT JOIN call_recordings cr ON cl.id = cr.call_log_id
            WHERE " . implode(" AND ", $where) . "
            ORDER BY cl.start_time DESC
            LIMIT 100
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $logs = $stmt->fetchAll();

        $this->success('Call logs retrieved', ['calls' => $logs]);
    }

    public function stats(): void {
        $db = Database::getConnection();

        $today = date('Y-m-d 00:00:00');
        $stats = [
            'total_calls_today' => (int)$db->query("SELECT COUNT(*) FROM call_logs WHERE start_time >= '$today'")->fetchColumn(),
            'answered_today' => (int)$db->query("SELECT COUNT(*) FROM call_logs WHERE start_time >= '$today' AND call_status = 'COMPLETED'")->fetchColumn(),
            'missed_today' => (int)$db->query("SELECT COUNT(*) FROM call_logs WHERE start_time >= '$today' AND call_status = 'MISSED'")->fetchColumn(),
            'active_devices' => (int)$db->query("SELECT COUNT(*) FROM devices WHERE status != 'OFFLINE'")->fetchColumn(),
            'total_customers' => (int)$db->query("SELECT COUNT(*) FROM customers")->fetchColumn(),
        ];

        $this->success('Analytics stats retrieved', ['stats' => $stats]);
    }
}

