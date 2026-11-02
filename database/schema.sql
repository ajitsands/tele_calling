-- ========================================================
-- Tele Calling Application Database Schema
-- Database: tele_calling_db
-- ========================================================

CREATE DATABASE IF NOT EXISTS `tele_calling_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tele_calling_db`;

-- Drop existing tables in correct order if re-initializing
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `customer_notes`;
DROP TABLE IF EXISTS `call_recordings`;
DROP TABLE IF EXISTS `call_logs`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `device_assignments`;
DROP TABLE IF EXISTS `devices`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table (Telecallers, Supervisors, Admins)
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'SUPERVISOR', 'TELECALLER') DEFAULT 'TELECALLER',
  `theme_preference` VARCHAR(30) DEFAULT 'light',
  `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Devices Table (Mobile Phones / Terminals)
CREATE TABLE `devices` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `device_uuid` VARCHAR(64) NOT NULL UNIQUE,
  `device_name` VARCHAR(100) NOT NULL,
  `sim_number` VARCHAR(20) NOT NULL,
  `android_version` VARCHAR(20) NULL,
  `ip_address` VARCHAR(45) NULL,
  `battery_level` INT DEFAULT 100,
  `last_heartbeat` DATETIME NULL,
  `status` ENUM('ONLINE', 'OFFLINE', 'BUSY') DEFAULT 'OFFLINE',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Device Shift Assignments
-- Business Rule: At a given time, exactly one user has an 'ACTIVE' assignment per device
CREATE TABLE `device_assignments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `device_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `shift_name` VARCHAR(50) DEFAULT 'General Shift',
  `started_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `ended_at` DATETIME NULL,
  `status` ENUM('ACTIVE', 'COMPLETED', 'REVOKED') DEFAULT 'ACTIVE',
  FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX idx_device_active (`device_id`, `status`),
  INDEX idx_user_active (`user_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Customers / Leads Table
CREATE TABLE `customers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `phone_number` VARCHAR(20) NOT NULL UNIQUE,
  `alternate_phone` VARCHAR(20) NULL,
  `full_name` VARCHAR(120) NULL,
  `email` VARCHAR(120) NULL,
  `company_name` VARCHAR(150) NULL,
  `city` VARCHAR(80) NULL,
  `tags` VARCHAR(255) NULL,
  `lead_status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED', 'LOST') DEFAULT 'NEW',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Call Logs Table
CREATE TABLE `call_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `device_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `customer_id` INT UNSIGNED NULL,
  `call_type` ENUM('INCOMING', 'OUTGOING', 'MISSED', 'REJECTED') NOT NULL,
  `call_status` ENUM('RINGING', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'BUSY') DEFAULT 'RINGING',
  `customer_number` VARCHAR(20) NOT NULL,
  `start_time` DATETIME NOT NULL,
  `answer_time` DATETIME NULL,
  `end_time` DATETIME NULL,
  `duration_seconds` INT UNSIGNED DEFAULT 0,
  `disposition` ENUM('INTERESTED', 'NOT_INTERESTED', 'CALLBACK_REQUESTED', 'BUSY', 'WRONG_NUMBER', 'SALE_CLOSED', 'OTHER') NULL,
  `disposition_notes` TEXT NULL,
  `next_followup_date` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL,
  INDEX idx_customer_lookup (`customer_number`, `created_at`),
  INDEX idx_call_status (`call_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Call Recordings Table
CREATE TABLE `call_recordings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `call_log_id` INT UNSIGNED NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size_bytes` BIGINT UNSIGNED DEFAULT 0,
  `audio_format` VARCHAR(10) DEFAULT 'mp3',
  `duration_seconds` INT UNSIGNED DEFAULT 0,
  `upload_status` ENUM('PENDING', 'UPLOADED', 'FAILED') DEFAULT 'UPLOADED',
  `uploaded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`call_log_id`) REFERENCES `call_logs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Customer Notes / Interaction Timeline
CREATE TABLE `customer_notes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT UNSIGNED NOT NULL,
  `call_log_id` INT UNSIGNED NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `note` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

