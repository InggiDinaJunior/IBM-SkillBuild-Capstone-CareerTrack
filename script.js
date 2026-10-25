/**
 * CareerTrack — script.js
 * Client-side Job Application Management Dashboard
 * Uses localStorage for persistence. No frameworks required.
 */

'use strict';

/* =====================================================
   CONSTANTS & SAMPLE DATA
   ===================================================== */

const STORAGE_KEY = 'careertrack_apps';

/** Default sample data — loaded only on first launch */
const SAMPLE_DATA = [
  {
    id: 'ct-001',
    company: 'Google',
    jobTitle: 'Software Engineer Intern',
    appDate: '2025-05-10',
    status: 'Interview',
    interviewDate: '2025-06-05',
    interviewTime: '10:00',
    notes: 'Referred by university career fair. Technical phone screen scheduled.'
  },
  {
    id: 'ct-002',
    company: 'Microsoft',
    jobTitle: 'Cloud Solutions Intern',
    appDate: '2025-05-08',
    status: 'Applied',
    interviewDate: '',
    interviewTime: '',
    notes: 'Applied through careers portal. Waiting for HR response.'
  },
  {
    id: 'ct-003',
    company: 'Meta',
    jobTitle: 'Data Analyst Intern',
    appDate: '2025-04-28',
    status: 'Rejected',
    interviewDate: '',
    interviewTime: '',
    notes: 'Received automated rejection email after initial screen.'
  },
  {
    id: 'ct-004',
    company: 'Shopify',
    jobTitle: 'Frontend Developer',
    appDate: '2025-05-14',
    status: 'Offer',
    interviewDate: '2025-05-22',
    interviewTime: '14:00',
    notes: 'Offer letter received! Deadline to accept is June 15.'
  },
  {
    id: 'ct-005',
    company: 'IBM',
    jobTitle: 'AI / ML Graduate Trainee',
    appDate: '2025-05-18',
    status: 'Interview',
    interviewDate: '2025-06-10',
    interviewTime: '09:30',
    notes: 'Two-round panel interview. Prepare IBM Cloud case study.'
  },
  {
    id: 'ct-006',
    company: 'Airbnb',
    jobTitle: 'Product Designer',
    appDate: '2025-05-02',
    status: 'Applied',
    interviewDate: '',
    interviewTime: '',
    notes: 'Portfolio submitted. Waiting for design take-home challenge.'
  },
  {
    id: 'ct-007',
    company: 'Stripe',
    jobTitle: 'Backend Engineer',
    appDate: '2025-04-20',
    status: 'Rejected',
    interviewDate: '',
    interviewTime: '',
    notes: 'Did not proceed after technical assessment.'
  },
  {
    id: 'ct-008',
    company: 'Notion',
    jobTitle: 'Growth Marketing Intern',
    appDate: '2025-05-20',
    status: 'Applied',
    interviewDate: '',
    interviewTime: '',
    notes: 'Submitted cover letter and resume via LinkedIn Easy Apply.'
  }
];

/* =====================================================
   STATE
   ===================================================== */

let applications = [];    // Working array of application objects
let pendingDeleteId = ''; // ID of application awaiting delete confirmation
let currentView = 'dashboard'; // 'dashboard' | 'applications' | 'add'

/* =====================================================
   localStorage HELPERS
   ===================================================== */

/**
 * Load applications from localStorage.
 * Seeds SAMPLE_DATA when storage is empty (first launch).
 */
function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      applications = JSON.parse(raw);
    } catch {
      applications = [...SAMPLE_DATA];
      saveToStorage();
    }
  } else {
    applications = [...SAMPLE_DATA];
    saveToStorage();
  }
}

/** Persist the current applications array to localStorage */
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

/* =====================================================
   ID GENERATOR
   ===================================================== */

/** Generate a simple unique ID based on timestamp + random suffix */
function generateId() {
  return 'ct-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* =====================================================
   DATE FORMATTING
   ===================================================== */

/**
 * Format ISO date string (YYYY-MM-DD) to a readable form.
 * Returns '—' when blank.
 */
function formatDate(isoDate) {
  if (!isoDate) return '—';
  const [year, month, day] = isoDate.split('-');
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Format time string (HH:MM) to 12-hour format */
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/* =====================================================
   DOM REFERENCES  (cached after DOMContentLoaded)
   ===================================================== */

let DOM = {};

function cacheDOMRefs() {
  DOM = {
    // Views
    viewDashboard:    document.getElementById('view-dashboard'),
    viewApplications: document.getElementById('view-applications'),
    viewAdd:          document.getElementById('view-add'),
    // Header
    headerTitle:      document.getElementById('headerTitle'),
    headerAddBtn:     document.getElementById('headerAddBtn'),
    hamburger:        document.getElementById('hamburger'),
    sidebar:          document.getElementById('sidebar'),
    overlay:          document.getElementById('overlay'),
    // Stats
    statTotal:        document.getElementById('statTotal'),
    statInterview:    document.getElementById('statInterview'),
    statOffer:        document.getElementById('statOffer'),
    statRejected:     document.getElementById('statRejected'),
    // Chart
    chartBars:        document.getElementById('chartBars'),
    // Upcoming
    upcomingList:     document.getElementById('upcomingList'),
    // Table
    appTableBody:     document.getElementById('appTableBody'),
    emptyState:       document.getElementById('emptyState'),
    // Toolbar
    searchInput:      document.getElementById('searchInput'),
    filterStatus:     document.getElementById('filterStatus'),
    clearFiltersBtn:  document.getElementById('clearFiltersBtn'),
    // Form
    appForm:          document.getElementById('appForm'),
    formTitle:        document.getElementById('formTitle'),
    editId:           document.getElementById('editId'),
    fCompany:         document.getElementById('fCompany'),
    fTitle:           document.getElementById('fTitle'),
    fDate:            document.getElementById('fDate'),
    fStatus:          document.getElementById('fStatus'),
    interviewFields:  document.getElementById('interviewFields'),
    fInterviewDate:   document.getElementById('fInterviewDate'),
    fInterviewTime:   document.getElementById('fInterviewTime'),
    fNotes:           document.getElementById('fNotes'),
    charCount:        document.getElementById('charCount'),
    submitBtn:        document.getElementById('submitBtn'),
    cancelBtn:        document.getElementById('cancelBtn'),
    // Error spans
    errCompany:       document.getElementById('errCompany'),
    errTitle:         document.getElementById('errTitle'),
    errDate:          document.getElementById('errDate'),
    errStatus:        document.getElementById('errStatus'),
    errInterviewDate: document.getElementById('errInterviewDate'),
    // Modal
    modalBackdrop:    document.getElementById('modalBackdrop'),
    modalBody:        document.getElementById('modalBody'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    cancelDeleteBtn:  document.getElementById('cancelDeleteBtn'),
    // Nav links
    navLinks:         document.querySelectorAll('.nav-link')
  };
}

/* =====================================================
   VIEW NAVIGATION
   ===================================================== */

const VIEW_TITLES = {
  dashboard:    'Dashboard',
  applications: 'My Applications',
  add:          'Add New Application'
};

/**
 * Switch the active view.
 * @param {string} viewName  'dashboard' | 'applications' | 'add'
 * @param {string} [editIdValue]  When editing, the application ID
 */
function showView(viewName, editIdValue) {
  currentView = viewName;

  // Hide all views
  DOM.viewDashboard.classList.add('hidden');
  DOM.viewApplications.classList.add('hidden');
  DOM.viewAdd.classList.add('hidden');

  // Show selected view
  const activeView = document.getElementById('view-' + viewName);
  if (activeView) activeView.classList.remove('hidden');

  // Update header title
  let title = VIEW_TITLES[viewName] || 'CareerTrack';
  if (viewName === 'add' && editIdValue) title = 'Edit Application';
  DOM.headerTitle.textContent = title;

  // Update nav active state
  DOM.navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.view === viewName);
    link.setAttribute('aria-current', link.dataset.view === viewName ? 'page' : '');
  });

  // View-specific setup
  if (viewName === 'dashboard') renderDashboard();
  if (viewName === 'applications') renderTable();
  if (viewName === 'add') {
    if (editIdValue) {
      populateForm(editIdValue);
    } else {
      resetForm();
    }
  }

  // Close mobile sidebar
  closeSidebar();
}

/* =====================================================
   SIDEBAR / MOBILE
   ===================================================== */

function openSidebar() {
  DOM.sidebar.classList.add('open');
  DOM.overlay.classList.add('active');
  DOM.overlay.setAttribute('aria-hidden', 'false');
  DOM.hamburger.setAttribute('aria-expanded', 'true');
}

function closeSidebar() {
  DOM.sidebar.classList.remove('open');
  DOM.overlay.classList.remove('active');
  DOM.overlay.setAttribute('aria-hidden', 'true');
  DOM.hamburger.setAttribute('aria-expanded', 'false');
}

/* =====================================================
   DASHBOARD — STATS
   ===================================================== */

/** Count applications by status */
function countByStatus(status) {
  return applications.filter(a => a.status === status).length;
}

/** Refresh the four summary stat cards */
function renderStats() {
  DOM.statTotal.textContent     = applications.length;
  DOM.statInterview.textContent = countByStatus('Interview');
  DOM.statOffer.textContent     = countByStatus('Offer');
  DOM.statRejected.textContent  = countByStatus('Rejected');
}

/* =====================================================
   DASHBOARD — STATUS BAR CHART
   ===================================================== */

const STATUS_CONFIG = [
  { status: 'Applied',   label: 'Applied',   fillClass: 'fill--applied'   },
  { status: 'Interview', label: 'Interview',  fillClass: 'fill--interview' },
  { status: 'Offer',     label: 'Offer',      fillClass: 'fill--offer'     },
  { status: 'Rejected',  label: 'Rejected',   fillClass: 'fill--rejected'  }
];

function renderChart() {
  const total = applications.length || 1; // avoid /0

  DOM.chartBars.innerHTML = STATUS_CONFIG.map(({ status, label, fillClass }) => {
    const count = countByStatus(status);
    const pct   = Math.round((count / total) * 100);
    return `
      <div class="chart-row" role="group" aria-label="${label}: ${count}">
        <span class="chart-label">${label}</span>
        <div class="chart-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${label} ${pct}%">
          <div class="chart-fill ${fillClass}" style="width:${pct}%"></div>
        </div>
        <span class="chart-count">${count}</span>
      </div>`;
  }).join('');
}

/* =====================================================
   DASHBOARD — UPCOMING INTERVIEWS
   ===================================================== */

function renderUpcoming() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = applications
    .filter(a => a.status === 'Interview' && a.interviewDate)
    .filter(a => {
      const d = new Date(a.interviewDate + 'T00:00:00');
      return d >= today;
    })
    .sort((a, b) => a.interviewDate.localeCompare(b.interviewDate))
    .slice(0, 5);

  if (upcoming.length === 0) {
    DOM.upcomingList.innerHTML = `<p class="empty-upcoming">No upcoming interviews scheduled.</p>`;
    return;
  }

  DOM.upcomingList.innerHTML = upcoming.map(a => {
    const timeStr = a.interviewTime ? ` at ${formatTime(a.interviewTime)}` : '';
    return `
      <div class="upcoming-item">
        <div class="upcoming-dot" aria-hidden="true"></div>
        <div class="upcoming-info">
          <div class="upcoming-company">${escapeHTML(a.company)}</div>
          <div class="upcoming-role">${escapeHTML(a.jobTitle)}</div>
          <div class="upcoming-time">${formatDate(a.interviewDate)}${timeStr}</div>
        </div>
      </div>`;
  }).join('');
}

/* =====================================================
   FULL DASHBOARD RENDER
   ===================================================== */

function renderDashboard() {
  renderStats();
  renderChart();
  renderUpcoming();
}

/* =====================================================
   APPLICATIONS TABLE
   ===================================================== */

/** Return filtered + searched subset of applications */
function getFilteredApplications() {
  const query  = DOM.searchInput.value.trim().toLowerCase();
  const status = DOM.filterStatus.value;

  return applications.filter(app => {
    const matchesSearch = !query ||
      app.company.toLowerCase().includes(query) ||
      app.jobTitle.toLowerCase().includes(query);
    const matchesStatus = !status || app.status === status;
    return matchesSearch && matchesStatus;
  });
}

/** Build status badge HTML */
function statusBadge(status) {
  const cls = status.toLowerCase();
  return `<span class="badge badge--${cls}">${escapeHTML(status)}</span>`;
}

/** Render the application table with current filters */
function renderTable() {
  const filtered = getFilteredApplications();

  if (filtered.length === 0) {
    DOM.appTableBody.innerHTML = '';
    DOM.emptyState.classList.remove('hidden');
    return;
  }

  DOM.emptyState.classList.add('hidden');

  // Sort by application date descending (newest first)
  const sorted = [...filtered].sort((a, b) => b.appDate.localeCompare(a.appDate));

  DOM.appTableBody.innerHTML = sorted.map(app => {
    const interviewInfo = (app.status === 'Interview' && app.interviewDate)
      ? `${formatDate(app.interviewDate)}${app.interviewTime ? ' ' + formatTime(app.interviewTime) : ''}`
      : '—';

    return `
      <tr>
        <td><span class="company-name">${escapeHTML(app.company)}</span></td>
        <td><span class="job-title">${escapeHTML(app.jobTitle)}</span></td>
        <td class="date-cell">${formatDate(app.appDate)}</td>
        <td>${statusBadge(app.status)}</td>
        <td class="date-cell">${interviewInfo}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon btn-icon--edit"
              aria-label="Edit application at ${escapeHTML(app.company)}"
              onclick="handleEdit('${app.id}')">&#9998;</button>
            <button class="btn-icon btn-icon--delete"
              aria-label="Delete application at ${escapeHTML(app.company)}"
              onclick="handleDeletePrompt('${app.id}')">&#128465;</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

/* =====================================================
   FORM — RESET, POPULATE, VALIDATE
   ===================================================== */

/** Reset all form fields and error states */
function resetForm() {
  DOM.appForm.reset();
  DOM.editId.value = '';
  DOM.formTitle.textContent = 'Add New Application';
  DOM.submitBtn.textContent = 'Save Application';
  DOM.interviewFields.classList.add('hidden');
  DOM.charCount.textContent = '0 / 500';

  // Clear errors
  clearFieldError(DOM.fCompany, DOM.errCompany);
  clearFieldError(DOM.fTitle, DOM.errTitle);
  clearFieldError(DOM.fDate, DOM.errDate);
  clearFieldError(DOM.fStatus, DOM.errStatus);
  clearFieldError(DOM.fInterviewDate, DOM.errInterviewDate);

  // Default the application date to today
  DOM.fDate.value = new Date().toISOString().split('T')[0];
}

/** Populate form fields with an existing application's data */
function populateForm(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;

  resetForm();
  DOM.editId.value       = app.id;
  DOM.formTitle.textContent = 'Edit Application';
  DOM.submitBtn.textContent = 'Update Application';

  DOM.fCompany.value       = app.company;
  DOM.fTitle.value         = app.jobTitle;
  DOM.fDate.value          = app.appDate;
  DOM.fStatus.value        = app.status;
  DOM.fInterviewDate.value = app.interviewDate || '';
  DOM.fInterviewTime.value = app.interviewTime || '';
  DOM.fNotes.value         = app.notes || '';
  DOM.charCount.textContent = `${(app.notes || '').length} / 500`;

  // Show interview fields if applicable
  if (app.status === 'Interview') {
    DOM.interviewFields.classList.remove('hidden');
  }
}

/* ---- Validation helpers ---- */

function setFieldError(inputEl, errorEl, message) {
  inputEl.classList.add('error');
  errorEl.textContent = message;
}

function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove('error');
  errorEl.textContent = '';
}

/**
 * Validate form fields.
 * @returns {boolean} true if valid
 */
function validateForm() {
  let valid = true;

  // Company
  if (!DOM.fCompany.value.trim()) {
    setFieldError(DOM.fCompany, DOM.errCompany, 'Company name is required.');
    valid = false;
  } else {
    clearFieldError(DOM.fCompany, DOM.errCompany);
  }

  // Job title
  if (!DOM.fTitle.value.trim()) {
    setFieldError(DOM.fTitle, DOM.errTitle, 'Job title is required.');
    valid = false;
  } else {
    clearFieldError(DOM.fTitle, DOM.errTitle);
  }

  // Application date
  if (!DOM.fDate.value) {
    setFieldError(DOM.fDate, DOM.errDate, 'Application date is required.');
    valid = false;
  } else {
    clearFieldError(DOM.fDate, DOM.errDate);
  }

  // Status
  if (!DOM.fStatus.value) {
    setFieldError(DOM.fStatus, DOM.errStatus, 'Please select a status.');
    valid = false;
  } else {
    clearFieldError(DOM.fStatus, DOM.errStatus);
  }

  // Interview date required when status is Interview
  if (DOM.fStatus.value === 'Interview' && !DOM.fInterviewDate.value) {
    setFieldError(DOM.fInterviewDate, DOM.errInterviewDate, 'Interview date is required when status is Interview.');
    valid = false;
  } else {
    clearFieldError(DOM.fInterviewDate, DOM.errInterviewDate);
  }

  return valid;
}

/* =====================================================
   CRUD OPERATIONS
   ===================================================== */

/** Create a new application from form data */
function createApplication() {
  const app = {
    id:            generateId(),
    company:       DOM.fCompany.value.trim(),
    jobTitle:      DOM.fTitle.value.trim(),
    appDate:       DOM.fDate.value,
    status:        DOM.fStatus.value,
    interviewDate: DOM.fStatus.value === 'Interview' ? DOM.fInterviewDate.value : '',
    interviewTime: DOM.fStatus.value === 'Interview' ? DOM.fInterviewTime.value : '',
    notes:         DOM.fNotes.value.trim()
  };
  applications.unshift(app);
  saveToStorage();
  showToast('Application added successfully!', 'success');
  showView('applications');
}

/** Update an existing application by ID */
function updateApplication(id) {
  const idx = applications.findIndex(a => a.id === id);
  if (idx === -1) return;

  applications[idx] = {
    ...applications[idx],
    company:       DOM.fCompany.value.trim(),
    jobTitle:      DOM.fTitle.value.trim(),
    appDate:       DOM.fDate.value,
    status:        DOM.fStatus.value,
    interviewDate: DOM.fStatus.value === 'Interview' ? DOM.fInterviewDate.value : '',
    interviewTime: DOM.fStatus.value === 'Interview' ? DOM.fInterviewTime.value : '',
    notes:         DOM.fNotes.value.trim()
  };
  saveToStorage();
  showToast('Application updated.', 'success');
  showView('applications');
}

/** Delete an application by ID */
function deleteApplication(id) {
  applications = applications.filter(a => a.id !== id);
  saveToStorage();
  showToast('Application deleted.', 'success');
  // Always refresh table (filters may be active)
  renderTable();
  // Refresh dashboard data (stats + chart + upcoming)
  renderDashboard();
}

/* =====================================================
   EVENT HANDLERS
   ===================================================== */

/** Edit button clicked from table */
function handleEdit(id) {
  showView('add', id);
}

/** Delete icon clicked — show confirmation modal */
function handleDeletePrompt(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;
  pendingDeleteId = id;
  DOM.modalBody.textContent =
    `Are you sure you want to delete the application for "${app.jobTitle}" at ${app.company}? This action cannot be undone.`;
  DOM.modalBackdrop.classList.remove('hidden');
}

/** Confirmed delete from modal */
function handleConfirmDelete() {
  if (pendingDeleteId) {
    deleteApplication(pendingDeleteId);
    pendingDeleteId = '';
  }
  DOM.modalBackdrop.classList.add('hidden');
}

/** Cancel delete modal */
function handleCancelDelete() {
  pendingDeleteId = '';
  DOM.modalBackdrop.classList.add('hidden');
}

/* =====================================================
   FORM SUBMIT
   ===================================================== */

function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) return;

  const id = DOM.editId.value;
  if (id) {
    updateApplication(id);
  } else {
    createApplication();
  }
}

/* =====================================================
   TOAST NOTIFICATION
   ===================================================== */

let toastContainer;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|''} type
 */
function showToast(message, type) {
  ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast${type ? ' ' + type : ''}`;
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s ease';
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}

/* =====================================================
   XSS SAFETY — HTML ESCAPE
   ===================================================== */

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* =====================================================
   EVENT LISTENERS SETUP
   ===================================================== */

function setupEventListeners() {

  /* ---- Navigation ---- */
  DOM.navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showView(link.dataset.view);
    });
  });

  /* ---- Header ---- */
  DOM.headerAddBtn.addEventListener('click', () => showView('add'));

  DOM.hamburger.addEventListener('click', () => {
    const isOpen = DOM.sidebar.classList.contains('open');
    if (isOpen) closeSidebar(); else openSidebar();
  });

  DOM.overlay.addEventListener('click', closeSidebar);

  /* ---- Toolbar (search + filter) ---- */
  DOM.searchInput.addEventListener('input', renderTable);
  DOM.filterStatus.addEventListener('change', renderTable);
  DOM.clearFiltersBtn.addEventListener('click', () => {
    DOM.searchInput.value  = '';
    DOM.filterStatus.value = '';
    renderTable();
  });

  /* ---- Form: status change toggles interview fields ---- */
  DOM.fStatus.addEventListener('change', () => {
    if (DOM.fStatus.value === 'Interview') {
      DOM.interviewFields.classList.remove('hidden');
    } else {
      DOM.interviewFields.classList.add('hidden');
      DOM.fInterviewDate.value = '';
      DOM.fInterviewTime.value = '';
      clearFieldError(DOM.fInterviewDate, DOM.errInterviewDate);
    }
  });

  /* ---- Form: notes character counter ---- */
  DOM.fNotes.addEventListener('input', () => {
    DOM.charCount.textContent = `${DOM.fNotes.value.length} / 500`;
  });

  /* ---- Form inline validation on blur ---- */
  DOM.fCompany.addEventListener('blur', () => {
    if (!DOM.fCompany.value.trim()) {
      setFieldError(DOM.fCompany, DOM.errCompany, 'Company name is required.');
    } else {
      clearFieldError(DOM.fCompany, DOM.errCompany);
    }
  });
  DOM.fTitle.addEventListener('blur', () => {
    if (!DOM.fTitle.value.trim()) {
      setFieldError(DOM.fTitle, DOM.errTitle, 'Job title is required.');
    } else {
      clearFieldError(DOM.fTitle, DOM.errTitle);
    }
  });

  /* ---- Form submit ---- */
  DOM.appForm.addEventListener('submit', handleFormSubmit);

  /* ---- Form cancel ---- */
  DOM.cancelBtn.addEventListener('click', () => {
    showView('applications');
  });

  /* ---- Modal ---- */
  DOM.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
  DOM.cancelDeleteBtn.addEventListener('click',  handleCancelDelete);

  // Close modal on backdrop click
  DOM.modalBackdrop.addEventListener('click', e => {
    if (e.target === DOM.modalBackdrop) handleCancelDelete();
  });

  // Close modal on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !DOM.modalBackdrop.classList.contains('hidden')) {
      handleCancelDelete();
    }
  });
}

/* =====================================================
   GLOBAL BINDINGS
   Inline onclick handlers in dynamically generated HTML require
   the called functions to be accessible on the global window object.
   ===================================================== */

window.handleEdit         = handleEdit;
window.handleDeletePrompt = handleDeletePrompt;

/* =====================================================
   INIT
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  cacheDOMRefs();
  loadFromStorage();
  setupEventListeners();
  showView('dashboard');
});
