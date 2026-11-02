<?php
// backend/app/Controllers/DeviceController.php

namespace App\Controllers;

use Core\Controller;
use Core\Database;

class DeviceController extends Controller {
    public function index(): void {
        $db = Database::getConnection();
        $stmt = $db->query("
            SELECT d.*,
                   da.id as assignment_id,
                   da.user_id as active_user_id,
                   da.shift_name,
                   da.started_at as shift_started_at,
                   u.name as active_user_name,
                   u.email as active_user_email
            FROM devices d
            LEFT JOIN device_assignments da ON d.id = da.device_id AND da.status = 'ACTIVE'
            LEFT JOIN users u ON da.user_id = u.id
            ORDER BY d.id ASC
        ");
        $devices = $stmt->fetchAll();

        $this->success('Devices retrieved', ['devices' => $devices]);
    }

    public function assignShift(): void {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();

        $deviceId = (int)($body['device_id'] ?? 0);
        $targetUserId = (int)($body['user_id'] ?? ($user ? $user['id'] : 0));
        $shiftName = trim($body['shift_name'] ?? 'General Shift');
        $forceTakeover = (bool)($body['force_takeover'] ?? false);

        if (!$deviceId || !$targetUserId) {
            $this->error('Device ID and User ID are required');
        }

        $db = Database::getConnection();

        // 1. Verify device exists
        $devStmt = $db->prepare("SELECT * FROM devices WHERE id = ?");
        $devStmt->execute([$deviceId]);
        $device = $devStmt->fetch();
        if (!$device) {
            $this->error('Device not found', 404);
        }

        // 2. Check if device is currently assigned to another user
        $activeStmt = $db->prepare("
            SELECT da.*, u.name as current_user_name 
            FROM device_assignments da
            JOIN users u ON da.user_id = u.id
            WHERE da.device_id = ? AND da.status = 'ACTIVE'
        ");
        $activeStmt->execute([$deviceId]);
        $existing = $activeStmt->fetch();

        if ($existing && (int)$existing['user_id'] !== $targetUserId) {
            if (!$forceTakeover) {
                $this->json([
                    'success' => false,
                    'conflict' => true,
                    'message' => sprintf(
                        'Device "%s" is currently in use by %s (Shift: %s). Do you want to take over this phone for your shift?',
                        $device['device_name'],
                        $existing['current_user_name'],
                        $existing['shift_name']
                    ),
                    'current_assignment' => $existing
                ], 409);
                return;
            }

            // Force handover: close existing assignment
            $closeStmt = $db->prepare("UPDATE device_assignments SET status = 'COMPLETED', ended_at = NOW() WHERE id = ?");
            $closeStmt->execute([$existing['id']]);
        }

        // 3. Ensure target user isn't holding any other active device (1 phone per caller rule)
        $userActiveStmt = $db->prepare("UPDATE device_assignments SET status = 'COMPLETED', ended_at = NOW() WHERE user_id = ? AND status = 'ACTIVE'");
        $userActiveStmt->execute([$targetUserId]);

        // 4. Create new active assignment
        $insertStmt = $db->prepare("
            INSERT INTO device_assignments (device_id, user_id, shift_name, started_at, status)
            VALUES (?, ?, ?, NOW(), 'ACTIVE')
        ");
        $insertStmt->execute([$deviceId, $targetUserId, $shiftName]);
        $assignmentId = $db->lastInsertId();

        $this->success('Device successfully assigned to caller', [
            'assignment_id' => $assignmentId,
            'device_id' => $deviceId,
            'device_name' => $device['device_name'],
            'sim_number' => $device['sim_number'],
            'user_id' => $targetUserId,
            'shift_name' => $shiftName
        ]);
    }

    public function releaseShift(): void {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();
        $deviceId = (int)($body['device_id'] ?? 0);
        $userId = (int)($body['user_id'] ?? ($user ? $user['id'] : 0));

        $db = Database::getConnection();
        $stmt = $db->prepare("
            UPDATE device_assignments 
            SET status = 'COMPLETED', ended_at = NOW() 
            WHERE (device_id = ? OR ? = 0) AND (user_id = ? OR ? = 0) AND status = 'ACTIVE'
        ");
        $stmt->execute([$deviceId, $deviceId, $userId, $userId]);

        $this->success('Shift released. Phone is now available for other callers.');
    }

    public function heartbeat(): void {
        $body = $this->getJsonBody();
        $deviceUuid = $body['device_uuid'] ?? '';
        $battery = isset($body['battery_level']) ? (int)$body['battery_level'] : null;
        $ip = $body['ip_address'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? null;
        if ($ip === '127.0.0.1' && !empty($body['ip_address'])) {
            $ip = $body['ip_address'];
        }

        if (empty($deviceUuid)) {
            $this->error('Device UUID is required');
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            UPDATE devices 
            SET last_heartbeat = CURRENT_TIMESTAMP, 
                status = 'ONLINE', 
                battery_level = COALESCE(?, battery_level), 
                ip_address = COALESCE(?, ip_address)
            WHERE device_uuid = ?
        ");
        $stmt->execute([$battery, $ip, $deviceUuid]);

        $this->success('Heartbeat received', [
            'device_uuid' => $deviceUuid,
            'ip_address' => $ip,
            'battery_level' => $battery
        ]);
    }

    public function register(): void {
        $body = $this->getJsonBody();
        $uuid = trim($body['device_uuid'] ?? '');
        $name = trim($body['device_name'] ?? 'Android Phone');
        $simNumber = trim($body['sim_number'] ?? '');
        $androidVer = trim($body['android_version'] ?? 'Android');
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;

        if (empty($uuid) || empty($simNumber)) {
            $this->error('device_uuid and sim_number are required');
        }

        $db = Database::getConnection();
        $check = $db->prepare("SELECT id FROM devices WHERE device_uuid = ?");
        $check->execute([$uuid]);
        $existing = $check->fetch();

        if ($existing) {
            $stmt = $db->prepare("
                UPDATE devices 
                SET device_name = ?, sim_number = ?, android_version = ?, ip_address = COALESCE(?, ip_address), last_heartbeat = CURRENT_TIMESTAMP, status = 'ONLINE'
                WHERE device_uuid = ?
            ");
            $stmt->execute([$name, $simNumber, $androidVer, $ip, $uuid]);
            $deviceId = $existing['id'];
        } else {
            $stmt = $db->prepare("
                INSERT INTO devices (device_uuid, device_name, sim_number, android_version, ip_address, last_heartbeat, status)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'ONLINE')
            ");
            $stmt->execute([$uuid, $name, $simNumber, $androidVer, $ip]);
            $deviceId = $db->lastInsertId();
        }

        $this->success('Device registered/updated successfully', [
            'id' => $deviceId,
            'device_uuid' => $uuid,
            'device_name' => $name,
            'sim_number' => $simNumber
        ]);
    }
}

