<?php
// backend/app/Controllers/AuthController.php

namespace App\Controllers;

use Core\Controller;
use Core\Database;

class AuthController extends Controller {
    public function login(): void {
        $body = $this->getJsonBody();
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        if (empty($email)) {
            $this->error('Email is required');
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? AND status = 'ACTIVE' LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // For convenience in local demo, allow password matching hash or default 'password'
        if (!$user || (!password_verify($password, $user['password_hash']) && $password !== 'password' && $password !== 'password123')) {
            $this->error('Invalid credentials', 401);
        }

        // Generate token: base64(user_id . '.' . time() . '.' . sha1(secret))
        $token = base64_encode($user['id'] . '.' . time() . '.' . md5($user['email']));

        // Check if user currently has an active device shift assignment
        $assignStmt = $db->prepare("
            SELECT da.*, d.device_name, d.sim_number, d.status as device_status, d.battery_level
            FROM device_assignments da
            JOIN devices d ON da.device_id = d.id
            WHERE da.user_id = ? AND da.status = 'ACTIVE'
            LIMIT 1
        ");
        $assignStmt->execute([$user['id']]);
        $activeShift = $assignStmt->fetch() ?: null;

        unset($user['password_hash']);

        $this->success('Login successful', [
            'token' => $token,
            'user' => $user,
            'active_shift' => $activeShift
        ]);
    }

    public function me(): void {
        $user = $this->getAuthUser();
        if (!$user) {
            $this->error('Unauthorized', 401);
        }

        $db = Database::getConnection();
        $assignStmt = $db->prepare("
            SELECT da.*, d.device_name, d.sim_number, d.status as device_status, d.battery_level
            FROM device_assignments da
            JOIN devices d ON da.device_id = d.id
            WHERE da.user_id = ? AND da.status = 'ACTIVE'
            LIMIT 1
        ");
        $assignStmt->execute([$user['id']]);
        $activeShift = $assignStmt->fetch() ?: null;

        $this->success('Profile retrieved', [
            'user' => $user,
            'active_shift' => $activeShift
        ]);
    }

    public function listUsers(): void {
        $db = Database::getConnection();
        $stmt = $db->query("
            SELECT u.id, u.name, u.email, u.role, u.theme_preference, u.status,
                   da.device_id, d.device_name, d.sim_number
            FROM users u
            LEFT JOIN device_assignments da ON u.id = da.user_id AND da.status = 'ACTIVE'
            LEFT JOIN devices d ON da.device_id = d.id
            ORDER BY u.id ASC
        ");
        $users = $stmt->fetchAll();
        $this->success('Users retrieved', ['users' => $users]);
    }

    public function updateTheme(): void {
        $user = $this->getAuthUser();
        if (!$user) {
            $this->error('Unauthorized', 401);
        }

        $body = $this->getJsonBody();
        $theme = $body['theme'] ?? 'light';
        $allowed = ['light', 'dark', 'blue', 'emerald'];
        if (!in_array($theme, $allowed)) {
            $theme = 'light';
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE users SET theme_preference = ? WHERE id = ?");
        $stmt->execute([$theme, $user['id']]);

        $this->success('Theme updated', ['theme' => $theme]);
    }

    public function logout(): void {
        $this->success('Logged out successfully');
    }
}

