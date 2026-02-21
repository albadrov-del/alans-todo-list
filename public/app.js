/**
 * Alan's To Do List — app.js (v3 — server-backed)
 *
 * Auth:   checks /api/auth/me on load; redirects to /login if not signed in
 * Panels: loaded from /api/panels (PostgreSQL); saved via PUT /api/panels/:id
 * Add:    POST /api/panels; Delete: DELETE /api/panels/:id
 */

(function () {
  'use strict';

  const TOOLBAR = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ header: [1, 2, 3, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
    [{ color: [] }, { background: [] }],
    ['link'],
    ['clean'],
  ];

  // ── State ─────────────────────────────────────────────────
  const quills    = {};  // { [panelId]: Quill instance }
  const committed = {};  // { [panelId]: Delta | null }  last saved server state

  // ── Boot ──────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async function () {
    // Auth guard — redirect to login if not signed in
    let me;
    try {
      me = await fetchJSON('/api/auth/me');
    } catch (_) {
      window.location.href = '/login';
      return;
    }

    // Show username in header
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) userDisplay.textContent = me.username;

    // Load panels from server
    const accordion = document.getElementById('accordion');
    let panels;
    try {
      panels = await fetchJSON('/api/panels');
    } catch (_) {
      panels = [];
    }

    // If user has no panels yet, create a first one automatically
    if (panels.length === 0) {
      try {
        const newPanel = await postJSON('/api/panels', { panel_name: 'My First List' });
        panels = [newPanel];
      } catch (_) { /* ignore */ }
    }

    panels.forEach(function (panel, index) {
      const item = createPanelElement(panel, index === 0);
      accordion.appendChild(item);
      initEditor(panel.id, panel.content);
      committed[panel.id] = panel.content;
    });

    // Single delegated listener
    accordion.addEventListener('click', onAccordionClick);

    document.getElementById('btn-add-new').addEventListener('click', addNewPanel);
    document.getElementById('btn-sign-out').addEventListener('click', handleSignOut);
  });

  // ── Accordion click dispatcher ────────────────────────────
  async function onAccordionClick(e) {
    const saveBtn   = e.target.closest('.btn-save');
    const cancelBtn = e.target.closest('.btn-cancel');
    const deleteBtn = e.target.closest('.btn-delete');
    const trigger   = e.target.closest('.accordion-trigger');

    if (saveBtn) {
      e.stopPropagation();
      await handleSave(Number(saveBtn.dataset.panel), saveBtn);
    } else if (cancelBtn) {
      e.stopPropagation();
      handleCancel(Number(cancelBtn.dataset.panel));
    } else if (deleteBtn) {
      e.stopPropagation();
      await handleDelete(Number(deleteBtn.dataset.panel));
    } else if (trigger) {
      const item   = trigger.closest('.accordion-item');
      const isOpen = item.classList.contains('expanded');
      setExpanded(item, trigger, !isOpen);
    }
  }

  // ── Save ──────────────────────────────────────────────────
  async function handleSave(id, btn) {
    const q = quills[id];
    if (!q) return;

    const delta    = q.getContents();
    const original = btn.textContent;

    try {
      await putJSON('/api/panels/' + id, { content: delta });
      committed[id] = delta;

      btn.textContent = 'Saved \u2713';
      btn.classList.add('saved');
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove('saved');
      }, 1500);
    } catch (_) {
      btn.textContent = 'Error!';
      setTimeout(function () { btn.textContent = original; }, 1500);
    }
  }

  // ── Cancel ────────────────────────────────────────────────
  function handleCancel(id) {
    const q = quills[id];
    if (!q) return;

    const lastSaved = committed[id];
    if (lastSaved) {
      q.setContents(lastSaved);
    } else {
      q.setText('');
    }

    const item    = document.querySelector('.accordion-item[data-panel="' + id + '"]');
    const trigger = item && item.querySelector('.accordion-trigger');
    if (item && trigger) setExpanded(item, trigger, false);
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete(id) {
    if (!window.confirm('Delete this list? This cannot be undone.')) return;

    try {
      await deleteRequest('/api/panels/' + id);
      const item = document.querySelector('.accordion-item[data-panel="' + id + '"]');
      if (item) item.remove();
      delete quills[id];
      delete committed[id];
    } catch (_) {
      window.alert('Failed to delete — please try again.');
    }
  }

  // ── Add New Panel ─────────────────────────────────────────
  async function addNewPanel() {
    try {
      const panel     = await postJSON('/api/panels', { panel_name: 'To Do List' });
      const accordion = document.getElementById('accordion');
      const item      = createPanelElement(panel, true);
      accordion.appendChild(item);

      committed[panel.id] = null;
      initEditor(panel.id, null);

      const trigger = item.querySelector('.accordion-trigger');
      trigger.setAttribute('aria-expanded', 'true');
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (quills[panel.id]) quills[panel.id].focus();
    } catch (_) {
      window.alert('Failed to create new list — please try again.');
    }
  }

  // ── Sign out ──────────────────────────────────────────────
  async function handleSignOut() {
    try { await postJSON('/api/auth/logout', {}); } catch (_) { /* ignore */ }
    window.location.href = '/login';
  }

  // ── Build panel DOM element ───────────────────────────────
  function createPanelElement(panel, expanded) {
    const item = document.createElement('div');
    item.className     = 'accordion-item' + (expanded ? ' expanded' : '');
    item.dataset.panel = panel.id;
    item.innerHTML     = buildPanelHTML(panel, expanded);
    return item;
  }

  // ── Editor init ───────────────────────────────────────────
  function initEditor(id, initialDelta) {
    const el = document.getElementById('editor-' + id);
    if (!el) return;

    const q = new Quill(el, {
      theme:   'snow',
      modules: { toolbar: TOOLBAR },
      placeholder: 'Start typing your list\u2026',
    });

    if (initialDelta) q.setContents(initialDelta);
    quills[id] = q;
  }

  // ── Expand / collapse ─────────────────────────────────────
  function setExpanded(item, trigger, open) {
    item.classList.toggle('expanded', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  // ── HTML template ─────────────────────────────────────────
  function buildPanelHTML(panel, expanded) {
    const id    = panel.id;
    const name  = escapeHtml(panel.panel_name || 'To Do List');
    const badge = String((panel.panel_order || 0) + 1).padStart(2, '0');
    const open  = expanded ? 'true' : 'false';

    return '<button class="accordion-trigger" id="trigger-' + id + '"' +
      ' aria-expanded="' + open + '" aria-controls="panel-' + id + '">' +
      '<div class="trigger-left">' +
      '<span class="panel-badge">' + badge + '</span>' +
      '<span class="panel-name">' + name + '</span>' +
      '</div>' +
      '<svg class="chevron" viewBox="0 0 24 24" fill="none"' +
      ' stroke="currentColor" stroke-width="2.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="6 9 12 15 18 9"></polyline>' +
      '</svg>' +
      '</button>' +
      '<div class="accordion-panel" id="panel-' + id + '"' +
      ' role="region" aria-labelledby="trigger-' + id + '">' +
      '<div class="panel-inner">' +
      '<div class="quill-editor" id="editor-' + id + '"></div>' +
      '<div class="panel-actions">' +
      '<button class="btn-delete" data-panel="' + id + '" aria-label="Delete list" title="Delete list">' +
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"' +
      ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="3 6 5 6 21 6"></polyline>' +
      '<path d="M19 6l-1 14H6L5 6"></path>' +
      '<path d="M10 11v6"></path><path d="M14 11v6"></path>' +
      '<path d="M9 6V4h6v2"></path>' +
      '</svg>' +
      ' Delete</button>' +
      '<button class="btn-cancel" data-panel="' + id + '">Cancel</button>' +
      '<button class="btn-save"   data-panel="' + id + '">Save</button>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  // ── Utility ───────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── HTTP helpers ──────────────────────────────────────────
  async function fetchJSON(url) {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (res.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error(res.status);
    return res.json();
  }

  async function postJSON(url, data) {
    const res = await fetch(url, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body:        JSON.stringify(data),
    });
    if (res.status === 401) { window.location.href = '/login'; throw new Error('Unauthorized'); }
    if (!res.ok) {
      const err = await res.json().catch(function () { return {}; });
      throw new Error(err.error || res.status);
    }
    return res.json();
  }

  async function putJSON(url, data) {
    const res = await fetch(url, {
      method:      'PUT',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body:        JSON.stringify(data),
    });
    if (res.status === 401) { window.location.href = '/login'; throw new Error('Unauthorized'); }
    if (!res.ok) {
      const err = await res.json().catch(function () { return {}; });
      throw new Error(err.error || res.status);
    }
    return res.json();
  }

  async function deleteRequest(url) {
    const res = await fetch(url, {
      method:      'DELETE',
      credentials: 'same-origin',
    });
    if (res.status === 401) { window.location.href = '/login'; throw new Error('Unauthorized'); }
    if (!res.ok) {
      const err = await res.json().catch(function () { return {}; });
      throw new Error(err.error || res.status);
    }
  }

})();
