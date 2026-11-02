-- ========================================================
-- Tele Calling Application Seed Data
-- ========================================================

USE `tele_calling_db`;

-- Passwords are all hashed 'password123' using PHP password_hash(..., PASSWORD_BCRYPT)
-- $2y$10$wE7QG1w2sC73q8n82B5iGeH5iJjY6zE1WdG6.p3V2QoUoT6vU7e3m
SET @PWD_HASH = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; -- standard 'password'

-- 1. Insert Users
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `theme_preference`, `status`) VALUES
(1, 'System Administrator', 'admin@telecalling.lan', @PWD_HASH, 'ADMIN', 'light', 'ACTIVE'),
(2, 'Priya Sharma', 'priya@telecalling.lan', @PWD_HASH, 'TELECALLER', 'light', 'ACTIVE'),
(3, 'Rahul Verma', 'rahul@telecalling.lan', @PWD_HASH, 'TELECALLER', 'blue', 'ACTIVE'),
(4, 'Ananya Patel', 'ananya@telecalling.lan', @PWD_HASH, 'TELECALLER', 'emerald', 'ACTIVE'),
(5, 'Vikram Singh', 'vikram@telecalling.lan', @PWD_HASH, 'TELECALLER', 'dark', 'ACTIVE'),
(6, 'Sneha Roy', 'sneha@telecalling.lan', @PWD_HASH, 'TELECALLER', 'light', 'ACTIVE'),
(7, 'Amit Kumar (Evening Shift)', 'amit@telecalling.lan', @PWD_HASH, 'TELECALLER', 'light', 'ACTIVE');

-- 2. Insert 5+ Devices (Telecaller Mobile Phones)
INSERT INTO `devices` (`id`, `device_uuid`, `device_name`, `sim_number`, `android_version`, `ip_address`, `battery_level`, `last_heartbeat`, `status`) VALUES
(1, 'dev-samsung-s21-01', 'Samsung Galaxy S21 (Terminal-1)', '+91 98100 11001', 'Android 14', '192.168.1.101', 92, NOW(), 'ONLINE'),
(2, 'dev-redmi-note12-02', 'Redmi Note 12 5G (Terminal-2)', '+91 98100 22002', 'Android 13', '192.168.1.102', 78, NOW(), 'ONLINE'),
(3, 'dev-oneplus-nord-03', 'OnePlus Nord CE 3 (Terminal-3)', '+91 98100 33003', 'Android 14', '192.168.1.103', 85, NOW(), 'ONLINE'),
(4, 'dev-vivo-v29-04', 'Vivo V29 Pro (Terminal-4)', '+91 98100 44004', 'Android 13', '192.168.1.104', 64, NOW(), 'ONLINE'),
(5, 'dev-realme-11-05', 'Realme 11 Pro+ (Terminal-5)', '+91 98100 55005', 'Android 12', '192.168.1.105', 90, NOW(), 'ONLINE');

-- 3. Shift Assignments (1 active user mapped to 1 phone)
INSERT INTO `device_assignments` (`id`, `device_id`, `user_id`, `shift_name`, `started_at`, `status`) VALUES
(1, 1, 2, 'Morning Shift (09:00 - 17:00)', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'ACTIVE'), -- Priya on Terminal-1
(2, 2, 3, 'Morning Shift (09:00 - 17:00)', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'ACTIVE'), -- Rahul on Terminal-2
(3, 3, 4, 'Morning Shift (09:00 - 17:00)', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'ACTIVE'), -- Ananya on Terminal-3
(4, 4, 5, 'Morning Shift (09:00 - 17:00)', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'ACTIVE'), -- Vikram on Terminal-4
(5, 5, 6, 'Morning Shift (09:00 - 17:00)', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'ACTIVE'); -- Sneha on Terminal-5

-- 4. Sample Customers / Leads
INSERT INTO `customers` (`id`, `phone_number`, `alternate_phone`, `full_name`, `email`, `company_name`, `city`, `tags`, `lead_status`) VALUES
(1, '+919876543210', '+919876543211', 'Rajesh Gupta', 'rajesh@guptatraders.in', 'Gupta Global Traders', 'Mumbai', 'Wholesale, High Value, Followup', 'QUALIFIED'),
(2, '+919823456789', NULL, 'Sunita Deshmukh', 'sunita@apexpharma.org', 'Apex Healthcare Pvt Ltd', 'Pune', 'Pharma, Decision Maker', 'PROPOSAL_SENT'),
(3, '+919711223344', '+919711223345', 'Manish Agarwal', 'manish@agarwalinfra.com', 'Agarwal Infrastructure', 'Delhi NCR', 'B2B, Urgent', 'CONTACTED'),
(4, '+919988776655', NULL, 'Kavita Nair', 'kavita@greentech.io', 'GreenTech Solutions', 'Bengaluru', 'Enterprise, Tech', 'CONVERTED'),
(5, '+919845012345', NULL, 'Rohan Mehta', 'rohan@mehtatextiles.com', 'Mehta Textiles & Fabrics', 'Surat', 'Retail, Inbound Inquiry', 'NEW');

-- 5. Prior Call Logs with History
INSERT INTO `call_logs` (`id`, `device_id`, `user_id`, `customer_id`, `call_type`, `call_status`, `customer_number`, `start_time`, `answer_time`, `end_time`, `duration_seconds`, `disposition`, `disposition_notes`, `next_followup_date`) VALUES
(1, 1, 2, 1, 'INCOMING', 'COMPLETED', '+919876543210', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 3 DAY), INTERVAL 240 SECOND), 240, 'INTERESTED', 'Customer inquired about enterprise pricing for 50 licenses. Requested quotation over email.', DATE_ADD(NOW(), INTERVAL 1 DAY)),
(2, 1, 2, 1, 'OUTGOING', 'COMPLETED', '+919876543210', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 1 DAY), INTERVAL 185 SECOND), 185, 'CALLBACK_REQUESTED', 'Followed up on proposal. Rajesh was in meeting, asked to call back today afternoon.', NOW()),
(3, 2, 3, 2, 'OUTGOING', 'COMPLETED', '+919823456789', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 5 DAY), INTERVAL 410 SECOND), 410, 'INTERESTED', 'Demo provided. Client very satisfied with dashboard and reports. Sent agreement draft.', DATE_ADD(NOW(), INTERVAL 2 DAY)),
(4, 3, 4, 3, 'INCOMING', 'MISSED', '+919711223344', DATE_SUB(NOW(), INTERVAL 4 HOUR), NULL, NULL, 0, NULL, 'Missed call during lunch break.', NULL),
(5, 4, 5, 4, 'OUTGOING', 'COMPLETED', '+919988776655', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 2 DAY), INTERVAL 620 SECOND), 620, 'SALE_CLOSED', 'Subscription finalized for 1 Year Annual Contract. Invoice generated.', NULL);

-- 6. Customer Interaction Notes
INSERT INTO `customer_notes` (`id`, `customer_id`, `call_log_id`, `user_id`, `note`, `created_at`) VALUES
(1, 1, 1, 2, 'Customer has 3 branches across Maharashtra. Budget approved by board.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 1, 2, 2, 'Decision maker is available mostly between 2 PM and 5 PM.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 2, 3, 3, 'Shared custom SLA requirements with technical team.', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 4, 5, 5, 'Client onboarded successfully. Assigned account manager Rohit.', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 7. Mock Call Recording Entries
INSERT INTO `call_recordings` (`id`, `call_log_id`, `file_name`, `file_path`, `file_size_bytes`, `audio_format`, `duration_seconds`, `upload_status`) VALUES
(1, 1, 'rec_20261030_9876543210.mp3', 'storage/recordings/sample_call_1.mp3', 1920000, 'mp3', 240, 'UPLOADED'),
(2, 2, 'rec_20261101_9876543210.mp3', 'storage/recordings/sample_call_2.mp3', 1480000, 'mp3', 185, 'UPLOADED'),
(3, 3, 'rec_20261028_9823456789.mp3', 'storage/recordings/sample_call_3.mp3', 3280000, 'mp3', 410, 'UPLOADED');

