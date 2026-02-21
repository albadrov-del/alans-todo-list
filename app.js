'use strict';

require('dotenv').config();

const express      = require('express');
const cookieParser = require('cookie-parser');
const path         = require('path');

const authRoutes  = require('./routes/auth');
const panelRoutes = require('./routes/panels');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Static files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API routes ────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/panels', panelRoutes);

// ── Page routes ───────────────────────────────────────────────
app.get('/login',    (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));

// ── SPA catch-all ─────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
