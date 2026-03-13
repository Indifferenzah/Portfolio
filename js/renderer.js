/**
 * renderer.js — Portfolio section rendering from store data.
 * Renders all dynamic sections on the main portfolio page.
 */

import { store } from './store.js';
import { escapeHtml, $, observe, addClass } from './utils.js';

/**
 * Render all portfolio sections from store data.
 */
export function renderAll() {
  const data = store.getAll();
  renderPersonalInfo(data.personalInfo);
  renderAbout(data.about);
  renderExperiences(data.experiences);
  renderSkills(data.skills);
  renderProjects(data.projects);
  renderEducation(data.education);
}

// ── Personal Info ─────────────────────────────────────────

export function renderPersonalInfo(info) {
  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text ?? '';
  };

  setEl('hero-name', info.name);
  setEl('nav-name', info.name);
  setEl('loading-name', info.name);
  setEl('footer-name', info.name);
  setEl('hero-description', info.description);

  // Hero subtitle: preserve <span> for accent coloring on first part
  const subtitleEl = document.getElementById('hero-subtitle');
  if (subtitleEl) {
    const parts = (info.title || '').split(' & ');
    if (parts.length >= 2) {
      subtitleEl.innerHTML = `<span>${escapeHtml(parts[0])}</span> &amp; ${escapeHtml(parts.slice(1).join(' & '))}`;
    } else {
      subtitleEl.textContent = info.title;
    }
  }
  setEl('stat-years', info.yearsExperience);
  setEl('stat-projects', info.projectsCompleted);
  setEl('contact-email-value', info.email);
  setEl('contact-discord-value', info.discord);

  // Links
  const githubUrl = `https://github.com/${info.github}`;
  const links = [
    ['link-github',   githubUrl],
    ['link-email',    `mailto:${info.email}`],
    ['contact-github-link', githubUrl],
  ];
  links.forEach(([id, href]) => {
    const el = document.getElementById(id);
    if (el) el.href = href;
  });

  const githubDisplay = document.getElementById('contact-github-value');
  if (githubDisplay) githubDisplay.textContent = `github.com/${info.github}`;

  // Footer year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ── About ─────────────────────────────────────────────────

export function renderAbout(about) {
  const el1 = document.getElementById('about-text-1');
  const el2 = document.getElementById('about-text-2');
  if (el1) el1.textContent = about.text1 ?? '';
  if (el2) el2.textContent = about.text2 ?? '';
}

// ── Experiences ───────────────────────────────────────────

export function renderExperiences(experiences) {
  const container = document.getElementById('experience-timeline');
  if (!container) return;

  if (!experiences || experiences.length === 0) {
    container.innerHTML = '<p class="empty-state">No experiences yet.</p>';
    return;
  }

  container.innerHTML = experiences.map(exp => `
    <div class="timeline-item reveal">
      <div class="timeline-item__dot">
        <i class="fas fa-briefcase"></i>
      </div>
      <div class="timeline-item__content">
        <h3 class="timeline-item__title">${escapeHtml(exp.title)}</h3>
        <p class="timeline-item__period">${escapeHtml(exp.period)}</p>
        <p class="timeline-item__description">${escapeHtml(exp.description)}</p>
      </div>
    </div>
  `).join('');

  // Re-observe newly created elements
  observeReveal(container);
}

// ── Skills ────────────────────────────────────────────────

export function renderSkills(skills) {
  const container = document.getElementById('skills-grid');
  if (!container) return;

  if (!skills || skills.length === 0) {
    container.innerHTML = '<p class="empty-state">No skills yet.</p>';
    return;
  }

  container.innerHTML = skills.map(skill => `
    <div class="skill-item reveal" data-skill-level="${skill.level}">
      <div class="skill-item__header">
        <span class="skill-item__name">${escapeHtml(skill.name)}</span>
        <span class="skill-item__level">${skill.level}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar__fill" style="--skill-level: ${skill.level}%"></div>
      </div>
    </div>
  `).join('');

  observeSkills(container);
  observeReveal(container);
}

// ── Projects ──────────────────────────────────────────────

export function renderProjects(projects) {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  if (!projects || projects.length === 0) {
    container.innerHTML = '<p class="empty-state">No projects yet.</p>';
    return;
  }

  container.innerHTML = projects.map(project => {
    const tagsHtml = (project.technologies ?? [])
      .map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`)
      .join('');

    const linkHtml = project.link
      ? `<a href="${escapeHtml(project.link)}" class="project-card__link" target="_blank" rel="noopener noreferrer">
           View Project <i class="fas fa-arrow-right"></i>
         </a>`
      : `<span class="project-card__link" style="opacity: 0.4; cursor: default;">No link</span>`;

    return `
      <article class="project-card reveal">
        <div class="project-card__icon">
          <i class="fas fa-folder-open"></i>
        </div>
        <h3 class="project-card__title">${escapeHtml(project.title)}</h3>
        <p class="project-card__description">${escapeHtml(project.description)}</p>
        ${tagsHtml ? `<div class="project-card__tags">${tagsHtml}</div>` : ''}
        <div class="project-card__footer">
          ${linkHtml}
          <i class="fab fa-github" style="color: var(--color-text-muted); font-size: var(--font-size-md);"></i>
        </div>
      </article>
    `;
  }).join('');

  observeReveal(container);
}

// ── Education ─────────────────────────────────────────────

export function renderEducation(education) {
  const container = document.getElementById('education-grid');
  if (!container) return;

  if (!education || education.length === 0) {
    container.innerHTML = '<p class="empty-state">No education entries yet.</p>';
    return;
  }

  container.innerHTML = education.map(edu => `
    <div class="education-card reveal">
      <div class="education-card__icon">
        <i class="fas fa-graduation-cap"></i>
      </div>
      <h3 class="education-card__title">${escapeHtml(edu.title)}</h3>
      <p class="education-card__period">${escapeHtml(edu.period)}</p>
      <p class="education-card__description">${escapeHtml(edu.description)}</p>
    </div>
  `).join('');

  observeReveal(container);
}

// ── Observers ─────────────────────────────────────────────

/**
 * Trigger reveal animation on elements with .reveal class.
 */
export function observeReveal(context = document) {
  observe('.reveal', (entry) => {
    addClass(entry.target, 'is-visible');
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
}

/**
 * Animate skill bars when they enter the viewport.
 */
export function observeSkills(context = document) {
  const skillItems = context.querySelectorAll('.skill-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Add class; CSS transition on .skill-item .progress-bar__fill handles animation
        addClass(el, 'is-animated');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  skillItems.forEach(el => observer.observe(el));
}
