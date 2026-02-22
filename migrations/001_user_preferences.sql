-- Migration 001: Add user_preferences table
-- Idempotent — safe to run multiple times

CREATE TABLE IF NOT EXISTS user_preferences (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  dark_mode  BOOLEAN   DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
