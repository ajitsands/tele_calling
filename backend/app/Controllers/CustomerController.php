<?php
// backend/app/Controllers/CustomerController.php

namespace App\Controllers;

use Core\Controller;
use Core\Database;

class CustomerController extends Controller {
    public function index(): void {
        $db = Database::getConnection();
        $search = trim($_GET['search'] ?? '');

        if (!empty($search)) {
            $term = '%' . $search . '%';
            $stmt = $db->prepare("
                SELECT c.*, 
                       (SELECT COUNT(*) FROM call_logs cl WHERE cl.customer_id = c.id) as total_calls,
                       (SELECT MAX(start_time) FROM call_logs cl WHERE cl.customer_id = c.id) as last_contact_at
                FROM customers c
                WHERE c.phone_number LIKE ? OR c.full_name LIKE ? OR c.company_name LIKE ?
                ORDER BY c.updated_at DESC
                LIMIT 50
            ");
            $stmt->execute([$term, $term, $term]);
        } else {
            $stmt = $db->query("
                SELECT c.*, 
                       (SELECT COUNT(*) FROM call_logs cl WHERE cl.customer_id = c.id) as total_calls,
                       (SELECT MAX(start_time) FROM call_logs cl WHERE cl.customer_id = c.id) as last_contact_at
                FROM customers c
                ORDER BY c.updated_at DESC
                LIMIT 50
            ");
        }

        $customers = $stmt->fetchAll();
        $this->success('Customers retrieved', ['customers' => $customers]);
    }

    public function show(array $params): void {
        $id = (int)($params['id'] ?? 0);
        $db = Database::getConnection();

        $stmt = $db->prepare("SELECT * FROM customers WHERE id = ?");
        $stmt->execute([$id]);
        $customer = $stmt->fetch();

        if (!$customer) {
            $this->error('Customer not found', 404);
        }

        // Call history
        $callStmt = $db->prepare("
            SELECT cl.*, u.name as agent_name, d.device_name, cr.file_path as recording_path
            FROM call_logs cl
            LEFT JOIN users u ON cl.user_id = u.id
            LEFT JOIN devices d ON cl.device_id = d.id
            LEFT JOIN call_recordings cr ON cl.id = cr.call_log_id
            WHERE cl.customer_id = ?
            ORDER BY cl.start_time DESC
        ");
        $callStmt->execute([$id]);
        $calls = $callStmt->fetchAll();

        // Notes
        $notesStmt = $db->prepare("
            SELECT cn.*, u.name as agent_name
            FROM customer_notes cn
            JOIN users u ON cn.user_id = u.id
            WHERE cn.customer_id = ?
            ORDER BY cn.created_at DESC
        ");
        $notesStmt->execute([$id]);
        $notes = $notesStmt->fetchAll();

        $customer['calls'] = $calls;
        $customer['notes'] = $notes;

        $this->success('Customer details', ['customer' => $customer]);
    }

    public function store(): void {
        $body = $this->getJsonBody();
        $phone = trim($body['phone_number'] ?? '');
        $name = trim($body['full_name'] ?? '');
        $company = trim($body['company_name'] ?? '');
        $email = trim($body['email'] ?? '');
        $city = trim($body['city'] ?? '');
        $tags = trim($body['tags'] ?? '');
        $status = $body['lead_status'] ?? 'NEW';

        if (empty($phone)) {
            $this->error('Phone number is required');
        }

        $cleanPhone = preg_replace('/[^\+0-9]/', '', $phone);

        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO customers (phone_number, full_name, email, company_name, city, tags, lead_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                full_name = VALUES(full_name),
                email = VALUES(email),
                company_name = VALUES(company_name),
                city = VALUES(city),
                tags = VALUES(tags),
                lead_status = VALUES(lead_status)
        ");
        $stmt->execute([$cleanPhone, $name, $email, $company, $city, $tags, $status]);

        $this->success('Customer saved successfully');
    }
}

