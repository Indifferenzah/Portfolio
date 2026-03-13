/**
 * store.js — Server-backed data manager for portfolio content.
 * All CRUD operations are async; data persists to data/portfolio.json
 * via the Node.js HTTP server API.
 */

import { API_ENDPOINTS } from './config.js';
import { auth } from './auth.js';
import { nextId, deepClone } from './utils.js';

// ── Default Data ─────────────────────────────────────────
// Used for the reset() operation only; server holds the live copy.

const DEFAULT_DATA = {
  personalInfo: {
    name: 'Indifferenzah',
    title: 'Web Developer & Python Developer',
    description: 'Passionate developer crafting elegant solutions with HTML, CSS, JavaScript, and Python. Over 2 years of hands-on experience building web applications and automation tools.',
    email: 'contact@indifferenzah.dev',
    discord: 'indifferenzah',
    github: 'Indifferenzah',
    kofi: 'indifferenzah',
    yearsExperience: '2+',
    projectsCompleted: '10+',
  },
  about: {
    text1: "I'm a passionate web and Python developer with over 2 years of experience building interactive, visually appealing websites and automation tools. My journey started with a fascination for how the web works, which led me to dive deep into front-end technologies and back-end scripting with Python.",
    text2: "I believe in clean code, intuitive design, and continuous learning. Whether it's crafting pixel-perfect interfaces or building efficient backend scripts, I approach every project with attention to detail and a drive to deliver excellent results.",
  },
  experiences: [
    {
      id: 1,
      title: 'Freelance Web Developer',
      period: '2022 - Present',
      description: 'Developed responsive websites and web applications for various clients using HTML, CSS, and JavaScript. Integrated back-end functionalities with Python for dynamic content and automation.',
    },
    {
      id: 2,
      title: 'Python Automation Specialist',
      period: '2021 - 2022',
      description: 'Created automation scripts for data processing and web scraping. Improved efficiency by 50% in repetitive tasks through smart tooling.',
    },
    {
      id: 3,
      title: 'Open-Source Contributor',
      period: 'Ongoing',
      description: 'Contributed to various open-source projects on GitHub, focusing on front-end enhancements and bug fixes.',
    },
  ],
  skills: [
    { id: 1, name: 'HTML',       level: 100 },
    { id: 2, name: 'CSS',        level: 100 },
    { id: 3, name: 'JavaScript', level: 75  },
    { id: 4, name: 'Python',     level: 100 },
  ],
  projects: [
    {
      id: 1,
      title: 'Valiance Discord Bot',
      description: 'A feature-rich Discord bot built with JavaScript and Discord.js. Handles server management, automated tasks, and enhanced user interaction.',
      link: 'https://github.com/Indifferenzah/Valiancejs',
      image: '',
      technologies: ['JavaScript', 'Discord.js', 'Node.js'],
    },
    {
      id: 2,
      title: 'AI Detector',
      description: 'AI-powered content detection tool built with Python machine learning libraries.',
      link: 'https://github.com/Indifferenzah/AiDetector',
      image: '',
      technologies: ['Python', 'Machine Learning'],
    },
    {
      id: 3,
      title: 'Valiance Website',
      description: 'A modern website with a forum for the Valiance community. Clean UI with responsive design.',
      link: 'https://github.com/Indifferenzah/ValianceSite',
      image: '',
      technologies: ['HTML', 'CSS', 'JavaScript'],
    },
    {
      id: 4,
      title: 'Portfolio Website',
      description: 'This portfolio — built from scratch with a glassmorphism design, admin dashboard, and secure authentication.',
      link: '',
      image: '',
      technologies: ['HTML', 'CSS', 'JavaScript', 'Web Crypto API'],
    },
  ],
  education: [
    {
      id: 1,
      title: 'Self-Taught Developer',
      period: '2020 - Present',
      description: 'Continuous self-education through online courses, documentation, tutorials, and hands-on projects. Completed certifications in HTML, CSS, JavaScript, and Python.',
    },
    {
      id: 2,
      title: 'ITIS Informatico',
      period: '2022 - Present',
      description: 'High school focused on computer science and programming in Italy. Studying software development, algorithms, and IT systems.',
    },
  ],
};

// ── Store Class ──────────────────────────────────────────

class Store {
  // ── Internal ───────────────────────────────────────────

  /**
   * Load data from the server (public API, no auth required).
   * @returns {Promise<object>}
   */
  async _load() {
    try {
      const res = await fetch(API_ENDPOINTS.data);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return deepClone(DEFAULT_DATA);
    }
  }

  /**
   * Save data to the server (requires valid auth token).
   * @param {object} data
   */
  async _save(data) {
    const res = await fetch(API_ENDPOINTS.data, {
      method: 'PUT',
      headers: auth._authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Save failed' }));
      throw new Error(err.error || 'Save failed');
    }
  }

  // ── Full data ──────────────────────────────────────────

  async getAll() {
    return this._load();
  }

  // ── Personal Info ──────────────────────────────────────

  async getPersonalInfo() {
    return (await this._load()).personalInfo;
  }

  async updatePersonalInfo(info) {
    const data = await this._load();
    data.personalInfo = { ...data.personalInfo, ...info };
    try {
      await this._save(data);
      return { success: true, message: 'Personal info updated!' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // ── About ──────────────────────────────────────────────

  async getAbout() {
    return (await this._load()).about;
  }

  async updateAbout(about) {
    const data = await this._load();
    data.about = { ...data.about, ...about };
    try {
      await this._save(data);
      return { success: true, message: 'About section updated!' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // ── Experiences ────────────────────────────────────────

  async getExperiences() {
    return (await this._load()).experiences ?? [];
  }

  async addExperience(exp) {
    const data = await this._load();
    const item = { ...exp, id: nextId(data.experiences) };
    data.experiences.push(item);
    try {
      await this._save(data);
      return { success: true, message: 'Experience added!', data: item };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async updateExperience(id, exp) {
    const data = await this._load();
    const idx = data.experiences.findIndex(e => e.id === id);
    if (idx === -1) return { success: false, message: 'Experience not found.' };
    data.experiences[idx] = { ...data.experiences[idx], ...exp };
    try {
      await this._save(data);
      return { success: true, message: 'Experience updated!' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async deleteExperience(id) {
    const data = await this._load();
    data.experiences = data.experiences.filter(e => e.id !== id);
    try {
      await this._save(data);
      return { success: true, message: 'Experience deleted.' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // ── Skills ─────────────────────────────────────────────

  async getSkills() {
    return (await this._load()).skills ?? [];
  }

  async addSkill(skill) {
    const data = await this._load();
    const item = { ...skill, id: nextId(data.skills) };
    data.skills.push(item);
    try {
      await this._save(data);
      return { success: true, message: 'Skill added!', data: item };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async updateSkill(id, skill) {
    const data = await this._load();
    const idx = data.skills.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, message: 'Skill not found.' };
    data.skills[idx] = { ...data.skills[idx], ...skill };
    try {
      await this._save(data);
      return { success: true, message: 'Skill updated!' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async deleteSkill(id) {
    const data = await this._load();
    data.skills = data.skills.filter(s => s.id !== id);
    try {
      await this._save(data);
      return { success: true, message: 'Skill deleted.' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // ── Projects ───────────────────────────────────────────

  async getProjects() {
    return (await this._load()).projects ?? [];
  }

  async addProject(project) {
    const data = await this._load();
    const item = { ...project, id: nextId(data.projects), technologies: project.technologies ?? [] };
    data.projects.push(item);
    try {
      await this._save(data);
      return { success: true, message: 'Project added!', data: item };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async updateProject(id, project) {
    const data = await this._load();
    const idx = data.projects.findIndex(p => p.id === id);
    if (idx === -1) return { success: false, message: 'Project not found.' };
    data.projects[idx] = { ...data.projects[idx], ...project };
    try {
      await this._save(data);
      return { success: true, message: 'Project updated!' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async deleteProject(id) {
    const data = await this._load();
    data.projects = data.projects.filter(p => p.id !== id);
    try {
      await this._save(data);
      return { success: true, message: 'Project deleted.' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // ── Education ──────────────────────────────────────────

  async getEducation() {
    return (await this._load()).education ?? [];
  }

  async addEducation(edu) {
    const data = await this._load();
    const item = { ...edu, id: nextId(data.education) };
    data.education.push(item);
    try {
      await this._save(data);
      return { success: true, message: 'Education entry added!', data: item };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async updateEducation(id, edu) {
    const data = await this._load();
    const idx = data.education.findIndex(e => e.id === id);
    if (idx === -1) return { success: false, message: 'Education not found.' };
    data.education[idx] = { ...data.education[idx], ...edu };
    try {
      await this._save(data);
      return { success: true, message: 'Education updated!' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async deleteEducation(id) {
    const data = await this._load();
    data.education = data.education.filter(e => e.id !== id);
    try {
      await this._save(data);
      return { success: true, message: 'Education entry deleted.' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // ── Import / Export ────────────────────────────────────

  async exportAll() {
    const data = await this._load();
    return JSON.stringify(data, null, 2);
  }

  async importAll(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON structure');
      await this._save(data);
      return { success: true, message: 'Data imported successfully!' };
    } catch (e) {
      return { success: false, message: `Import failed: ${e.message}` };
    }
  }

  async reset() {
    try {
      await this._save(deepClone(DEFAULT_DATA));
      return { success: true, message: 'Data reset to defaults.' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }
}

// Export singleton
export const store = new Store();
