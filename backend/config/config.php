<?php
// backend/config/config.php

return [
    'db' => [
        'host' => '127.0.0.1',
        'port' => 6061,
        'dbname' => 'tele_calling_db',
        'username' => 'root',
        'password' => 'S@nds1@b',
        'charset' => 'utf8mb4'
    ],
    'app' => [
        'name' => 'TeleCalling Pro',
        'base_url' => 'http://localhost:8000',
        'cors_allowed_origins' => ['*'],
        'storage_path' => __DIR__ . '/../storage/recordings'
    ]
];

