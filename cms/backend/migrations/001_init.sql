CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(64) UNIQUE,
    last_seen DATETIME
);
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(64),
    event_type VARCHAR(32),
    severity VARCHAR(32),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    timestamp DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);