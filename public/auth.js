/**
 * auth.js — handles login and register form submissions
 * Works on both login.html and register.html
 */

(function () {
  'use strict';

  const loginForm    = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm)    setupLoginForm(loginForm);
  if (registerForm) setupRegisterForm(registerForm);

  // ── Login ─────────────────────────────────────────────────
  function setupLoginForm(form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearErrors();

      const email    = form.email.value.trim();
      const password = form.password.value;

      let valid = true;
      if (!email)    { showFieldError('email-error',    'Email is required.');    valid = false; }
      if (!password) { showFieldError('password-error', 'Password is required.'); valid = false; }
      if (!valid) return;

      setSubmitting(true);
      try {
        const res  = await fetch('/api/auth/login', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          showBannerError(data.error || 'Sign in failed.');
          return;
        }

        window.location.href = '/';
      } catch (_) {
        showBannerError('Network error — please try again.');
      } finally {
        setSubmitting(false);
      }
    });
  }

  // ── Register ──────────────────────────────────────────────
  function setupRegisterForm(form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearErrors();

      const username        = form.username.value.trim();
      const email           = form.email.value.trim();
      const password        = form.password.value;
      const confirmPassword = form['confirm-password'].value;

      let valid = true;
      if (!username || username.length < 2) {
        showFieldError('username-error', 'Username must be at least 2 characters.');
        valid = false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError('email-error', 'Enter a valid email address.');
        valid = false;
      }
      if (!password || password.length < 8) {
        showFieldError('password-error', 'Password must be at least 8 characters.');
        valid = false;
      }
      if (password !== confirmPassword) {
        showFieldError('confirm-error', 'Passwords do not match.');
        valid = false;
      }
      if (!valid) return;

      setSubmitting(true);
      try {
        const res  = await fetch('/api/auth/register', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ username, email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          showBannerError(data.error || 'Registration failed.');
          return;
        }

        showBannerSuccess('Account created! Redirecting to sign in\u2026');
        setTimeout(function () { window.location.href = '/login'; }, 1500);
      } catch (_) {
        showBannerError('Network error — please try again.');
      } finally {
        setSubmitting(false);
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  function setSubmitting(state) {
    const btn = document.getElementById('submit-btn');
    if (btn) btn.disabled = state;
  }

  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(function (el) { el.textContent = ''; });
    document.querySelectorAll('.form-group input').forEach(function (el) { el.classList.remove('error'); });
    hideBanners();
  }

  function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    const input = el.closest('.form-group') && el.closest('.form-group').querySelector('input');
    if (input) input.classList.add('error');
  }

  function showBannerError(msg) {
    var el = document.getElementById('auth-error');
    if (el) { el.textContent = msg; el.classList.add('visible'); }
  }

  function showBannerSuccess(msg) {
    var el = document.getElementById('auth-success');
    if (el) { el.textContent = msg; el.classList.add('visible'); }
  }

  function hideBanners() {
    var err = document.getElementById('auth-error');
    var suc = document.getElementById('auth-success');
    if (err) { err.textContent = ''; err.classList.remove('visible'); }
    if (suc) { suc.textContent = ''; suc.classList.remove('visible'); }
  }

})();
