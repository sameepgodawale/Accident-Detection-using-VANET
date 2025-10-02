CREATE TABLE IF NOT EXISTS events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_uuid CHAR(36) UNIQUE,
  device_id VARCHAR(64),
  rsu_id VARCHAR(64),
  event_type VARCHAR(32),
  severity VARCHAR(16) DEFAULT 'MINOR',
  confidence FLOAT DEFAULT 0,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  speed_kmh SMALLINT,
  payload JSON,
  timestamp DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
