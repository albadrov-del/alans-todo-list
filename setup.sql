-- Alan's To Do List — database setup
-- Run once: psql -U postgres -p 5433 -d alans_todo -f setup.sql

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS todo_panels (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  panel_order INTEGER      NOT NULL DEFAULT 0,
  panel_name  VARCHAR(255) NOT NULL DEFAULT 'To Do List',
  content     JSONB,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  dark_mode  BOOLEAN   DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
