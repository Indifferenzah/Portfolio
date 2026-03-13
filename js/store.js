/**
 * store.js — localStorage data manager for portfolio content.
 * Provides typed CRUD operations for all portfolio sections.
 */

import { STORAGE_KEYS } from './config.js';
import { nextId, deepClone } from './utils.js';

// ── Default Data ─────────────────────────────────────────

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
  constructor() {
    this._key = STORAGE_KEYS.portfolioData;
    this._initialize();
  }

  // ── Internal ───────────────────────────────────────────

  _initialize() {
    if (!localStorage.getItem(this._key)) {
      this._save(DEFAULT_DATA);
    }
  }

  _load() {
    try {
      const raw = localStorage.getItem(this._key);
      return raw ? JSON.parse(raw) : deepClone(DEFAULT_DATA);
    } catch {
      return deepClone(DEFAULT_DATA);
    }
  }

  _save(data) {
    localStorage.setItem(this._key, JSON.stringify(data));
  }

  // ── Personal Info ──────────────────────────────────────

  getPersonalInfo() {
    return this._load().personalInfo;
  }

  updatePersonalInfo(info) {
    const data = this._load();
    data.personalInfo = { ...data.personalInfo, ...info };
    this._save(data);
    return { success: true, message: 'Personal info updated!' };
  }

  // ── About ──────────────────────────────────────────────

  getAbout() {
    return this._load().about;
  }

  updateAbout(about) {
    const data = this._load();
    data.about = { ...data.about, ...about };
    this._save(data);
    return { success: true, message: 'About section updated!' };
  }

  // ── Experiences ────────────────────────────────────────

  getExperiences() {
    return this._load().experiences ?? [];
  }

  addExperience(exp) {
    const data = this._load();
    const item = { ...exp, id: nextId(data.experiences) };
    data.experiences.push(item);
    this._save(data);
    return { success: true, message: 'Experience added!', data: item };
  }

  updateExperience(id, exp) {
    const data = this._load();
    const idx = data.experiences.findIndex(e => e.id === id);
    if (idx === -1) return { success: false, message: 'Experience not found.' };
    data.experiences[idx] = { ...data.experiences[idx], ...exp };
    this._save(data);
    return { success: true, message: 'Experience updated!' };
  }

  deleteExperience(id) {
    const data = this._load();
    data.experiences = data.experiences.filter(e => e.id !== id);
    this._save(data);
    return { success: true, message: 'Experience deleted.' };
  }

  // ── Skills ─────────────────────────────────────────────

  getSkills() {
    return this._load().skills ?? [];
  }

  addSkill(skill) {
    const data = this._load();
    const item = { ...skill, id: nextId(data.skills) };
    data.skills.push(item);
    this._save(data);
    return { success: true, message: 'Skill added!', data: item };
  }

  updateSkill(id, skill) {
    const data = this._load();
    const idx = data.skills.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, message: 'Skill not found.' };
    data.skills[idx] = { ...data.skills[idx], ...skill };
    this._save(data);
    return { success: true, message: 'Skill updated!' };
  }

  deleteSkill(id) {
    const data = this._load();
    data.skills = data.skills.filter(s => s.id !== id);
    this._save(data);
    return { success: true, message: 'Skill deleted.' };
  }

  // ── Projects ───────────────────────────────────────────

  getProjects() {
    return this._load().projects ?? [];
  }

  addProject(project) {
    const data = this._load();
    const item = { ...project, id: nextId(data.projects), technologies: project.technologies ?? [] };
    data.projects.push(item);
    this._save(data);
    return { success: true, message: 'Project added!', data: item };
  }

  updateProject(id, project) {
    const data = this._load();
    const idx = data.projects.findIndex(p => p.id === id);
    if (idx === -1) return { success: false, message: 'Project not found.' };
    data.projects[idx] = { ...data.projects[idx], ...project };
    this._save(data);
    return { success: true, message: 'Project updated!' };
  }

  deleteProject(id) {
    const data = this._load();
    data.projects = data.projects.filter(p => p.id !== id);
    this._save(data);
    return { success: true, message: 'Project deleted.' };
  }

  // ── Education ──────────────────────────────────────────

  getEducation() {
    return this._load().education ?? [];
  }

  addEducation(edu) {
    const data = this._load();
    const item = { ...edu, id: nextId(data.education) };
    data.education.push(item);
    this._save(data);
    return { success: true, message: 'Education entry added!', data: item };
  }

  updateEducation(id, edu) {
    const data = this._load();
    const idx = data.education.findIndex(e => e.id === id);
    if (idx === -1) return { success: false, message: 'Education not found.' };
    data.education[idx] = { ...data.education[idx], ...edu };
    this._save(data);
    return { success: true, message: 'Education updated!' };
  }

  deleteEducation(id) {
    const data = this._load();
    data.education = data.education.filter(e => e.id !== id);
    this._save(data);
    return { success: true, message: 'Education entry deleted.' };
  }

  // ── Import / Export ────────────────────────────────────

  exportAll() {
    return JSON.stringify(this._load(), null, 2);
  }

  importAll(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      // Basic validation
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON structure');
      this._save(data);
      return { success: true, message: 'Data imported successfully!' };
    } catch (e) {
      return { success: false, message: `Import failed: ${e.message}` };
    }
  }

  reset() {
    this._save(deepClone(DEFAULT_DATA));
    return { success: true, message: 'Data reset to defaults.' };
  }

  // ── Full data ──────────────────────────────────────────

  getAll() {
    return this._load();
  }
}

// Export singleton
export const store = new Store();
