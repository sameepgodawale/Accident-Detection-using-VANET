-- init_db.sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'operator'
);
CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  incident_id TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  severity TEXT,
  confidence INT,
  vehicle TEXT,
  rsu TEXT,
  ts BIGINT,
  summary TEXT,
  status TEXT
);
-- seed admin (password: admin123 hashed with bcrypt)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE username='admin') THEN
    INSERT INTO users(username, password_hash, role) VALUES('admin', '$2b$10$Zq3fJ8a9u6r1pQYcJ9dH5O3k1sDq1Qv6yZq8fJ7sG1k9eO', 'admin');
  END IF;
END$$;
