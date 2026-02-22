'use strict';

const { Pool } = require('pg');
require('dotenv').config();

const connectionString =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  // Railway (and most cloud PG providers) require SSL in production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
