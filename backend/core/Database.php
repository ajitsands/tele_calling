<?php
// backend/core/Database.php

namespace Core;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $config = require __DIR__ . '/../config/config.php';
        $db = $config['db'];

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        // 1. Try MySQL Connection
        try {
            $dsn = sprintf('mysql:host=%s;port=%d;charset=%s', $db['host'], $db['port'], $db['charset']);
            $pdo = new PDO($dsn, $db['username'], $db['password'], $options);
            
            // Auto-create database if not exists
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . $db['dbname'] . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `" . $db['dbname'] . "`");

            // Check if tables exist, if not initialize
            $tables = $pdo->query("SHOW TABLES LIKE 'devices'")->fetchAll();
            if (empty($tables)) {
                $schemaFile = __DIR__ . '/../../database/schema.sql';
                $seedFile = __DIR__ . '/../../database/seed.sql';
                if (file_exists($schemaFile)) {
                    $pdo->exec(file_get_contents($schemaFile));
                }
                if (file_exists($seedFile)) {
                    $pdo->exec(file_get_contents($seedFile));
                }
            }

            self::$instance = $pdo;
            return self::$instance;

        } catch (PDOException $mySqlEx) {
            error_log('MySQL connection failed on port ' . $db['port'] . ': ' . $mySqlEx->getMessage() . '. Falling back to high-speed SQLite.');
        }

        // 2. Fallback to SQLite (Guarantees zero 500 errors and persistent storage)
        $storageDir = __DIR__ . '/../storage';
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0777, true);
        }
        $sqliteFile = $storageDir . '/tele_calling.sqlite';
        $isNew = !file_exists($sqliteFile);

        $pdo = new PDO('sqlite:' . $sqliteFile, null, null, $options);
        $pdo->exec('PRAGMA foreign_keys = ON;');

        if ($isNew || filesize($sqliteFile) < 100) {
            self::initSqliteTables($pdo);
        }

        self::$instance = $pdo;
        return self::$instance;
    }

    private static function initSqliteTables(PDO $pdo): void {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'TELECALLER',
                theme_preference TEXT DEFAULT 'light',
                status TEXT DEFAULT 'ACTIVE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_uuid TEXT NOT NULL UNIQUE,
                device_name TEXT NOT NULL,
                sim_number TEXT NOT NULL,
                android_version TEXT,
                ip_address TEXT,
                battery_level INTEGER DEFAULT 100,
                last_heartbeat DATETIME,
                status TEXT DEFAULT 'OFFLINE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS device_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                shift_name TEXT DEFAULT 'General Shift',
                started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                ended_at DATETIME,
                status TEXT DEFAULT 'ACTIVE',
                FOREIGN KEY (device_id) REFERENCES devices(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone_number TEXT NOT NULL UNIQUE,
                alternate_phone TEXT,
                full_name TEXT,
                email TEXT,
                company_name TEXT,
                city TEXT,
                tags TEXT,
                lead_status TEXT DEFAULT 'NEW',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS call_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                customer_id INTEGER,
                call_type TEXT NOT NULL,
                call_status TEXT DEFAULT 'RINGING',
                customer_number TEXT NOT NULL,
                start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                answer_time DATETIME,
                end_time DATETIME,
                duration_seconds INTEGER DEFAULT 0,
                disposition TEXT,
                disposition_notes TEXT,
                next_followup_date DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (device_id) REFERENCES devices(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            );

            CREATE TABLE IF NOT EXISTS customer_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                call_log_id INTEGER,
                user_id INTEGER NOT NULL,
                note TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        ");

        // Seed initial users and devices
        $pwd = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
        $pdo->exec("
            INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES
            (1, 'System Administrator', 'admin@telecalling.lan', '$pwd', 'ADMIN'),
            (2, 'Priya Sharma', 'priya@telecalling.lan', '$pwd', 'TELECALLER'),
            (3, 'Rahul Verma', 'rahul@telecalling.lan', '$pwd', 'TELECALLER'),
            (4, 'Ananya Patel', 'ananya@telecalling.lan', '$pwd', 'TELECALLER'),
            (5, 'Vikram Singh', 'vikram@telecalling.lan', '$pwd', 'TELECALLER'),
            (6, 'Sneha Roy', 'sneha@telecalling.lan', '$pwd', 'TELECALLER');

            INSERT OR IGNORE INTO devices (id, device_uuid, device_name, sim_number, android_version, status) VALUES
            (1, 'dev-samsung-s21-01', 'Samsung Galaxy S21 (Terminal-1)', '+91 98100 11001', 'Android 14', 'ONLINE'),
            (2, 'dev-redmi-note12-02', 'Redmi Note 12 5G (Terminal-2)', '+91 98100 22002', 'Android 13', 'ONLINE'),
            (3, 'dev-oneplus-nord-03', 'OnePlus Nord CE 3 (Terminal-3)', '+91 98100 33003', 'Android 14', 'ONLINE'),
            (4, 'dev-vivo-v29-04', 'Vivo V29 Pro (Terminal-4)', '+91 98100 44004', 'Android 13', 'ONLINE'),
            (5, 'dev-realme-11-05', 'Realme 11 Pro+ (Terminal-5)', '+91 98100 55005', 'Android 12', 'ONLINE');

            INSERT OR IGNORE INTO device_assignments (id, device_id, user_id, shift_name, status) VALUES
            (1, 1, 2, 'Morning Shift', 'ACTIVE'),
            (2, 2, 3, 'Morning Shift', 'ACTIVE'),
            (3, 3, 4, 'Morning Shift', 'ACTIVE'),
            (4, 4, 5, 'Morning Shift', 'ACTIVE'),
            (5, 5, 6, 'Morning Shift', 'ACTIVE');

            INSERT OR IGNORE INTO customers (id, phone_number, full_name, company_name, city, lead_status) VALUES
            (1, '+919876543210', 'Rajesh Gupta', 'Gupta Global Traders', 'Mumbai', 'QUALIFIED'),
            (2, '+919823456789', 'Sunita Deshmukh', 'Apex Healthcare Pvt Ltd', 'Pune', 'PROPOSAL_SENT'),
            (3, '+919711223344', 'Manish Agarwal', 'Agarwal Infrastructure', 'Delhi NCR', 'CONTACTED');
        ");
    }
}
