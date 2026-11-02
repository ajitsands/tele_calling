<?php
// backend/core/Controller.php

namespace Core;

class Controller {
    protected function json(array $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    protected function success(string $message = 'Success', array $data = [], int $statusCode = 200): void {
        $this->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    protected function error(string $message = 'Error', int $statusCode = 400, array $errors = []): void {
        $this->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $statusCode);
    }

    protected function getJsonBody(): array {
        $input = file_get_contents('php://input');
        if (empty($input)) {
            return [];
        }
        $data = json_decode($input, true);
        return is_array($data) ? $data : [];
    }

    protected function getAuthUser(): ?array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        $token = null;
        if (preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
        } elseif (isset($_GET['token'])) {
            $token = $_GET['token'];
        }

        if (!$token) {
            return null;
        }

        // Lightweight reversible session/token decoding: user_id:base64_sig
        $parts = explode('.', base64_decode($token));
        if (count($parts) >= 2) {
            $userId = (int)$parts[0];
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT id, name, email, role, theme_preference, status FROM users WHERE id = ? AND status = 'ACTIVE'");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            return $user ?: null;
        }

        return null;
    }
}

