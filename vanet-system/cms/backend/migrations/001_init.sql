CREATE DATABASE IF NOT EXISTS vanet_cms;
USE vanet_cms;
CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(64) UNIQUE,
  firmware_version VARCHAR(32),
  last_seen DATETIME,
  meta JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_uuid CHAR(36) UNIQUE,
  device_id VARCHAR(64),
  rsu_id VARCHAR(64),
  event_type ENUM('CRASH','FIRE','TEST'),
  severity ENUM('MINOR','MAJOR','CRITICAL') DEFAULT 'MINOR',
  confidence FLOAT DEFAULT 0,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  speed_kmh SMALLINT,
  payload JSON,
  timestamp DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
