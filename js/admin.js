/**
 * admin.js — Admin dashboard controller.
 * Full CRUD operations, modals, toasts, import/export.
 * All operations are async-aware for Web Crypto API usage.
 */

import { auth } from './auth.js';
import { store } from './store.js';
import { escapeHtml, $, $$, addClass, removeClass, toggleClass, downloadFile, readFile } from './utils.js';
import { TOAST_DURATION_MS } from './config.js';
import { measurePasswordStrength } from './crypto.js';

// ── Auth Guard ────────────────────────────────────────────

if (!auth.requireAuth()) {
  // requireAuth() handles the redirect
  throw new Error('Not authenticated');
}

// ── Boot ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initTopbar();
  initSidebar();
  initLogout();
  loadSection('dashboard');
  bindSidebarNav();
  bindModalClose();
});

// ── Topbar ────────────────────────────────────────────────

function initTopbar() {
  const usernameEl = document.getElementById('topbar-username');
  const avatarEl   = document.getElementById('topbar-avatar');
  const user = auth.getCurrentUser() ?? 'Admin';

  if (usernameEl) usernameEl.textContent = user;
  if (avatarEl)   avatarEl.textContent = user.charAt(0).toUpperCase();
}

// ── Sidebar ───────────────────────────────────────────────

function initSidebar() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebar-overlay');

  const open = () => {
    addClass(sidebar, 'is-open');
    addClass(overlay, 'is-visible');
  };

  const close = () => {
    removeClass(sidebar, 'is-open');
    removeClass(overlay, 'is-visible');
  };

  if (toggleBtn) toggleBtn.addEventListener('click', () => {
    sidebar.classList.contains('is-open') ? close() : open();
  });

  if (overlay) overlay.addEventListener('click', close);
}

function bindSidebarNav() {
  const links = $$('.sidebar__link[data-section]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      loadSection(section);

      // Update active state
      links.forEach(l => removeClass(l, 'is-active'));
      addClass(link, 'is-active');

      // Update topbar title
      const titleEl = document.getElementById('topbar-title');
      if (titleEl) titleEl.textContent = link.querySelector('span')?.textContent ?? section;

      // Close mobile sidebar
      removeClass(document.getElementById('sidebar'), 'is-open');
      removeClass(document.getElementById('sidebar-overlay'), 'is-visible');
    });
  });
}

// ── Logout ────────────────────────────────────────────────

function initLogout() {
  const btn = document.getElementById('logout-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out?')) {
        auth.logout('../index.html');
      }
    });
  }
}

// ── Section Loader ────────────────────────────────────────

function loadSection(name) {
  // Hide all sections
  $$('.content-section').forEach(s => removeClass(s, 'is-active'));

  // Show target
  const target = document.getElementById(`section-${name}`);
  if (target) addClass(target, 'is-active');

  // Load section data
  switch (name) {
    case 'dashboard':   loadDashboard();       break;
    case 'personal':    loadPersonalForm();    break;
    case 'about':       loadAboutForm();       break;
    case 'experiences': loadExperiencesList(); break;
    case 'skills':      loadSkillsList();      break;
    case 'projects':    loadProjectsList();    break;
    case 'education':   loadEducationList();   break;
    case 'settings':    loadSettings();        break;
  }
}

// ── Dashboard ─────────────────────────────────────────────

function loadDashboard() {
  const data = store.getAll();
  setText('stat-exp-count',      data.experiences?.length ?? 0);
  setText('stat-skills-count',   data.skills?.length ?? 0);
  setText('stat-projects-count', data.projects?.length ?? 0);
  setText('stat-edu-count',      data.education?.length ?? 0);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ── Personal Info ─────────────────────────────────────────

function loadPersonalForm() {
  const info = store.getPersonalInfo();
  setVal('personal-name',        info.name);
  setVal('personal-title',       info.title);
  setVal('personal-description', info.description);
  setVal('personal-email',       info.email);
  setVal('personal-discord',     info.discord);
  setVal('personal-github',      info.github);
  setVal('personal-kofi',        info.kofi);
  setVal('personal-years',       info.yearsExperience);
  setVal('personal-projects',    info.projectsCompleted);

  const form = document.getElementById('personal-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const result = store.updatePersonalInfo({
        name:              getVal('personal-name'),
        title:             getVal('personal-title'),
        description:       getVal('personal-description'),
        email:             getVal('personal-email'),
        discord:           getVal('personal-discord'),
        github:            getVal('personal-github'),
        kofi:              getVal('personal-kofi'),
        yearsExperience:   getVal('personal-years'),
        projectsCompleted: getVal('personal-projects'),
      });
      showToast(result.message, result.success ? 'success' : 'error');
    };
  }
}

// ── About ─────────────────────────────────────────────────

function loadAboutForm() {
  const about = store.getAbout();
  setVal('about-text1', about.text1);
  setVal('about-text2', about.text2);

  const form = document.getElementById('about-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const result = store.updateAbout({
        text1: getVal('about-text1'),
        text2: getVal('about-text2'),
      });
      showToast(result.message, result.success ? 'success' : 'error');
    };
  }
}

// ── Experiences ───────────────────────────────────────────

function loadExperiencesList() {
  const list = document.getElementById('experiences-list');
  if (!list) return;

  const items = store.getExperiences();

  if (items.length === 0) {
    list.innerHTML = emptyState('No experiences yet. Click "Add Experience" to get started.');
    return;
  }

  list.innerHTML = items.map(exp => `
    <div class="item-card">
      <div class="item-card__info">
        <p class="item-card__title">${escapeHtml(exp.title)}</p>
        <p class="item-card__meta">${escapeHtml(exp.period)}</p>
        <p class="item-card__desc">${escapeHtml(exp.description)}</p>
      </div>
      <div class="item-card__actions">
        <button class="btn btn--primary btn--icon" title="Edit" onclick="window._admin.editExperience(${exp.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn--danger btn--icon" title="Delete" onclick="window._admin.deleteExperience(${exp.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

  bindAddBtn('add-experience-btn', () => showAddExperienceModal());
}

function showAddExperienceModal(existingExp = null) {
  const isEdit = !!existingExp;
  const exp = existingExp ?? { title: '', period: '', description: '' };

  showModal(isEdit ? 'Edit Experience' : 'Add Experience', `
    <form id="exp-modal-form" class="admin-form">
      <div class="form-group">
        <label class="form-label" for="m-exp-title">Title</label>
        <input class="form-input" type="text" id="m-exp-title" value="${escapeHtml(exp.title)}" placeholder="e.g. Freelance Developer" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="m-exp-period">Period</label>
        <input class="form-input" type="text" id="m-exp-period" value="${escapeHtml(exp.period)}" placeholder="e.g. 2022 - Present" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="m-exp-desc">Description</label>
        <textarea class="form-input form-textarea" id="m-exp-desc" rows="4" required>${escapeHtml(exp.description)}</textarea>
      </div>
      <button type="submit" class="btn btn--primary btn--block">
        <i class="fas fa-${isEdit ? 'save' : 'plus'}"></i> ${isEdit ? 'Save Changes' : 'Add Experience'}
      </button>
    </form>
  `);

  document.getElementById('exp-modal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      title:       getVal('m-exp-title'),
      period:      getVal('m-exp-period'),
      description: getVal('m-exp-desc'),
    };

    const result = isEdit
      ? store.updateExperience(existingExp.id, payload)
      : store.addExperience(payload);

    closeModal();
    showToast(result.message, result.success ? 'success' : 'error');
    loadExperiencesList();
    loadDashboard();
  });
}

// ── Skills ────────────────────────────────────────────────

function loadSkillsList() {
  const list = document.getElementById('skills-list');
  if (!list) return;

  const items = store.getSkills();

  if (items.length === 0) {
    list.innerHTML = emptyState('No skills yet. Click "Add Skill" to get started.');
    return;
  }

  list.innerHTML = items.map(skill => `
    <div class="item-card">
      <div class="item-card__info">
        <p class="item-card__title">${escapeHtml(skill.name)}</p>
        <div class="progress-bar" style="margin-top: var(--space-2);">
          <div class="progress-bar__fill" style="width: ${skill.level}%;"></div>
        </div>
        <p class="item-card__meta" style="margin-top: var(--space-1);">${skill.level}%</p>
      </div>
      <div class="item-card__actions">
        <button class="btn btn--primary btn--icon" title="Edit" onclick="window._admin.editSkill(${skill.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn--danger btn--icon" title="Delete" onclick="window._admin.deleteSkill(${skill.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

  bindAddBtn('add-skill-btn', () => showAddSkillModal());
}

function showAddSkillModal(existingSkill = null) {
  const isEdit = !!existingSkill;
  const skill = existingSkill ?? { name: '', level: 50 };

  showModal(isEdit ? 'Edit Skill' : 'Add Skill', `
    <form id="skill-modal-form" class="admin-form">
      <div class="form-group">
        <label class="form-label" for="m-skill-name">Skill Name</label>
        <input class="form-input" type="text" id="m-skill-name" value="${escapeHtml(skill.name)}" placeholder="e.g. JavaScript" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="m-skill-level">Level (0–100)</label>
        <input class="form-input" type="number" id="m-skill-level" min="0" max="100" value="${skill.level}" required>
      </div>
      <button type="submit" class="btn btn--primary btn--block">
        <i class="fas fa-${isEdit ? 'save' : 'plus'}"></i> ${isEdit ? 'Save Changes' : 'Add Skill'}
      </button>
    </form>
  `);

  document.getElementById('skill-modal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      name:  getVal('m-skill-name'),
      level: parseInt(getVal('m-skill-level'), 10),
    };

    const result = isEdit
      ? store.updateSkill(existingSkill.id, payload)
      : store.addSkill(payload);

    closeModal();
    showToast(result.message, result.success ? 'success' : 'error');
    loadSkillsList();
    loadDashboard();
  });
}

// ── Projects ──────────────────────────────────────────────

function loadProjectsList() {
  const list = document.getElementById('projects-list');
  if (!list) return;

  const items = store.getProjects();

  if (items.length === 0) {
    list.innerHTML = emptyState('No projects yet. Click "Add Project" to get started.');
    return;
  }

  list.innerHTML = items.map(project => {
    const tags = (project.technologies ?? [])
      .map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`)
      .join('');

    return `
      <div class="item-card">
        <div class="item-card__info">
          <p class="item-card__title">${escapeHtml(project.title)}</p>
          <p class="item-card__desc">${escapeHtml(project.description)}</p>
          ${project.link ? `<p class="item-card__link"><a href="${escapeHtml(project.link)}" target="_blank" rel="noopener">${escapeHtml(project.link)}</a></p>` : ''}
          ${tags ? `<div class="item-card__tags" style="margin-top: var(--space-2);">${tags}</div>` : ''}
        </div>
        <div class="item-card__actions">
          <button class="btn btn--primary btn--icon" title="Edit" onclick="window._admin.editProject(${project.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn--danger btn--icon" title="Delete" onclick="window._admin.deleteProject(${project.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  bindAddBtn('add-project-btn', () => showAddProjectModal());
}

function showAddProjectModal(existingProject = null) {
  const isEdit = !!existingProject;
  const project = existingProject ?? { title: '', description: '', link: '', technologies: [] };
  const techString = (project.technologies ?? []).join(', ');

  showModal(isEdit ? 'Edit Project' : 'Add Project', `
    <form id="project-modal-form" class="admin-form">
      <div class="form-group">
        <label class="form-label" for="m-proj-title">Title</label>
        <input class="form-input" type="text" id="m-proj-title" value="${escapeHtml(project.title)}" placeholder="Project name" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="m-proj-desc">Description</label>
        <textarea class="form-input form-textarea" id="m-proj-desc" rows="3" required>${escapeHtml(project.description)}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="m-proj-link">Link (optional)</label>
        <input class="form-input" type="url" id="m-proj-link" value="${escapeHtml(project.link ?? '')}" placeholder="https://github.com/...">
      </div>
      <div class="form-group">
        <label class="form-label" for="m-proj-tech">Technologies (comma-separated)</label>
        <input class="form-input" type="text" id="m-proj-tech" value="${escapeHtml(techString)}" placeholder="HTML, CSS, JavaScript">
      </div>
      <button type="submit" class="btn btn--primary btn--block">
        <i class="fas fa-${isEdit ? 'save' : 'plus'}"></i> ${isEdit ? 'Save Changes' : 'Add Project'}
      </button>
    </form>
  `);

  document.getElementById('project-modal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const techInput = getVal('m-proj-tech');
    const technologies = techInput
      ? techInput.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const payload = {
      title:       getVal('m-proj-title'),
      description: getVal('m-proj-desc'),
      link:        getVal('m-proj-link'),
      technologies,
    };

    const result = isEdit
      ? store.updateProject(existingProject.id, payload)
      : store.addProject(payload);

    closeModal();
    showToast(result.message, result.success ? 'success' : 'error');
    loadProjectsList();
    loadDashboard();
  });
}

// ── Education ─────────────────────────────────────────────

function loadEducationList() {
  const list = document.getElementById('education-list');
  if (!list) return;

  const items = store.getEducation();

  if (items.length === 0) {
    list.innerHTML = emptyState('No education entries yet. Click "Add Education" to get started.');
    return;
  }

  list.innerHTML = items.map(edu => `
    <div class="item-card">
      <div class="item-card__info">
        <p class="item-card__title">${escapeHtml(edu.title)}</p>
        <p class="item-card__meta">${escapeHtml(edu.period)}</p>
        <p class="item-card__desc">${escapeHtml(edu.description)}</p>
      </div>
      <div class="item-card__actions">
        <button class="btn btn--primary btn--icon" title="Edit" onclick="window._admin.editEducation(${edu.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn--danger btn--icon" title="Delete" onclick="window._admin.deleteEducation(${edu.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

  bindAddBtn('add-education-btn', () => showAddEducationModal());
}

function showAddEducationModal(existingEdu = null) {
  const isEdit = !!existingEdu;
  const edu = existingEdu ?? { title: '', period: '', description: '' };

  showModal(isEdit ? 'Edit Education' : 'Add Education', `
    <form id="edu-modal-form" class="admin-form">
      <div class="form-group">
        <label class="form-label" for="m-edu-title">Title</label>
        <input class="form-input" type="text" id="m-edu-title" value="${escapeHtml(edu.title)}" placeholder="e.g. Self-Taught Developer" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="m-edu-period">Period</label>
        <input class="form-input" type="text" id="m-edu-period" value="${escapeHtml(edu.period)}" placeholder="e.g. 2020 - Present" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="m-edu-desc">Description</label>
        <textarea class="form-input form-textarea" id="m-edu-desc" rows="4" required>${escapeHtml(edu.description)}</textarea>
      </div>
      <button type="submit" class="btn btn--primary btn--block">
        <i class="fas fa-${isEdit ? 'save' : 'plus'}"></i> ${isEdit ? 'Save Changes' : 'Add Education'}
      </button>
    </form>
  `);

  document.getElementById('edu-modal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      title:       getVal('m-edu-title'),
      period:      getVal('m-edu-period'),
      description: getVal('m-edu-desc'),
    };

    const result = isEdit
      ? store.updateEducation(existingEdu.id, payload)
      : store.addEducation(payload);

    closeModal();
    showToast(result.message, result.success ? 'success' : 'error');
    loadEducationList();
    loadDashboard();
  });
}

// ── Settings ──────────────────────────────────────────────

function loadSettings() {
  // Change Username
  const usernameForm = document.getElementById('change-username-form');
  if (usernameForm) {
    usernameForm.onsubmit = async (e) => {
      e.preventDefault();
      const newUsername = getVal('new-username');
      const confirmPass = getVal('confirm-password-for-username');

      const result = await auth.changeUsername(newUsername, confirmPass);
      showToast(result.message, result.success ? 'success' : 'error');

      if (result.success) {
        usernameForm.reset();
        document.getElementById('topbar-username').textContent = newUsername;
        document.getElementById('topbar-avatar').textContent  = newUsername.charAt(0).toUpperCase();
      }
    };
  }

  // Change Password
  const passwordForm = document.getElementById('change-password-form');
  if (passwordForm) {
    passwordForm.onsubmit = async (e) => {
      e.preventDefault();
      const currentPass = getVal('current-password');
      const newPass     = getVal('new-password');
      const confirmPass = getVal('confirm-new-password');

      if (newPass !== confirmPass) {
        showToast('New passwords do not match.', 'error');
        return;
      }

      const result = await auth.changePassword(currentPass, newPass);
      showToast(result.message, result.success ? 'success' : 'error');
      if (result.success) passwordForm.reset();
    };

    // Password strength meter
    const newPassInput = document.getElementById('new-password');
    if (newPassInput) {
      newPassInput.addEventListener('input', () => {
        updatePasswordStrength('settings-strength', newPassInput.value);
      });
    }
  }

  // Export
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.onclick = () => {
      const json = store.exportAll();
      const date = new Date().toISOString().split('T')[0];
      downloadFile(json, `portfolio-data-${date}.json`);
      showToast('Data exported successfully!', 'success');
    };
  }

  // Import
  const importBtn = document.getElementById('import-data-btn');
  if (importBtn) {
    importBtn.onclick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const text = await readFile(file);
          const result = store.importAll(text);
          showToast(result.message, result.success ? 'success' : 'error');
          if (result.success) loadSection('dashboard');
        } catch (err) {
          showToast(`Import error: ${err.message}`, 'error');
        }
      };
      input.click();
    };
  }

  // Reset
  const resetBtn = document.getElementById('reset-data-btn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm('Reset ALL portfolio data to defaults? This cannot be undone.')) {
        const result = store.reset();
        showToast(result.message, 'warning');
        loadSection('dashboard');
      }
    };
  }
}

// ── Global onclick handlers ───────────────────────────────
// These are called from innerHTML onclick attributes

window._admin = {
  editExperience: (id) => {
    const exp = store.getExperiences().find(e => e.id === id);
    if (exp) showAddExperienceModal(exp);
  },
  deleteExperience: (id) => {
    if (confirm('Delete this experience?')) {
      const result = store.deleteExperience(id);
      showToast(result.message, 'success');
      loadExperiencesList();
      loadDashboard();
    }
  },
  editSkill: (id) => {
    const skill = store.getSkills().find(s => s.id === id);
    if (skill) showAddSkillModal(skill);
  },
  deleteSkill: (id) => {
    if (confirm('Delete this skill?')) {
      const result = store.deleteSkill(id);
      showToast(result.message, 'success');
      loadSkillsList();
      loadDashboard();
    }
  },
  editProject: (id) => {
    const project = store.getProjects().find(p => p.id === id);
    if (project) showAddProjectModal(project);
  },
  deleteProject: (id) => {
    if (confirm('Delete this project?')) {
      const result = store.deleteProject(id);
      showToast(result.message, 'success');
      loadProjectsList();
      loadDashboard();
    }
  },
  editEducation: (id) => {
    const edu = store.getEducation().find(e => e.id === id);
    if (edu) showAddEducationModal(edu);
  },
  deleteEducation: (id) => {
    if (confirm('Delete this education entry?')) {
      const result = store.deleteEducation(id);
      showToast(result.message, 'success');
      loadEducationList();
      loadDashboard();
    }
  },
};

// ── Modal ─────────────────────────────────────────────────

function showModal(title, bodyHtml) {
  const modal     = document.getElementById('modal');
  const titleEl   = document.getElementById('modal-title');
  const bodyEl    = document.getElementById('modal-body');

  if (!modal) return;

  if (titleEl) titleEl.textContent = title;
  if (bodyEl)  bodyEl.innerHTML = bodyHtml;

  addClass(modal, 'is-open');
  document.body.style.overflow = 'hidden';

  // Auto-focus first input
  setTimeout(() => {
    const first = modal.querySelector('input, textarea, select');
    if (first) first.focus();
  }, 100);
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  removeClass(modal, 'is-open');
  document.body.style.overflow = '';
}

function bindModalClose() {
  const closeBtn = document.getElementById('modal-close');
  const modal    = document.getElementById('modal');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ── Toast ─────────────────────────────────────────────────

const TOAST_ICONS = {
  success: 'fas fa-check-circle',
  error:   'fas fa-times-circle',
  warning: 'fas fa-exclamation-triangle',
  info:    'fas fa-info-circle',
};

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <i class="toast__icon ${TOAST_ICONS[type] ?? TOAST_ICONS.info}"></i>
    <span class="toast__message">${escapeHtml(message)}</span>
    <button class="toast__close" aria-label="Close"><i class="fas fa-times"></i></button>
  `;

  container.appendChild(toast);

  const dismiss = () => {
    addClass(toast, 'is-hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 600);
  };

  toast.querySelector('.toast__close')?.addEventListener('click', dismiss);
  setTimeout(dismiss, TOAST_DURATION_MS);
}

// ── Password Strength ─────────────────────────────────────

function updatePasswordStrength(wrapperId, password) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  const { score, label } = measurePasswordStrength(password);
  const bars  = wrapper.querySelectorAll('.password-strength__bar');
  const lbl   = wrapper.querySelector('.password-strength__label');

  const classes = ['is-weak', 'is-medium', 'is-strong'];

  bars.forEach((bar, i) => {
    bar.className = 'password-strength__bar';
    if (i < score) addClass(bar, classes[score - 1]);
  });

  if (lbl) lbl.textContent = password ? label : '';
}

// ── Helpers ───────────────────────────────────────────────

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val ?? '';
}

function emptyState(message) {
  return `
    <div class="empty-state">
      <i class="fas fa-inbox"></i>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

// Bind the "Add" button (re-bind to avoid duplicate listeners)
const _addBtnListeners = new WeakMap();

function bindAddBtn(id, handler) {
  const btn = document.getElementById(id);
  if (!btn) return;

  if (_addBtnListeners.has(btn)) {
    btn.removeEventListener('click', _addBtnListeners.get(btn));
  }
  _addBtnListeners.set(btn, handler);
  btn.addEventListener('click', handler);
}
