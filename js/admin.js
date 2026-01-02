// Admin Dashboard JavaScript
const authManager = new AuthManager();
const dataManager = new DataManager();

// Check authentication
if (!authManager.isAuthenticated()) {
    window.location.href = 'login.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupNavigation();
    setupEventListeners();
    loadAllData();
});

function initializeDashboard() {
    const currentUser = authManager.getCurrentUser();
    document.getElementById('current-user').textContent = currentUser;
}

// ==================== Navigation ====================
function setupNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            
            // Update active link
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show section
            showSection(section);
            
            // Update page title
            const title = link.textContent.trim();
            document.getElementById('page-title').textContent = title;
            
            // Close mobile sidebar
            sidebar.classList.remove('active');
        });
    });
    
    // Mobile sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Sei sicuro di voler uscire?')) {
            authManager.logout();
        }
    });
}

function showSection(sectionName) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `section-${sectionName}`) {
            section.classList.add('active');
        }
    });
}

// ==================== Load All Data ====================
function loadAllData() {
    loadDashboardStats();
    loadPersonalInfoForm();
    loadAboutForm();
    loadExperiencesList();
    loadSkillsList();
    loadProjectsList();
    loadEducationList();
}

function loadDashboardStats() {
    const data = dataManager.getData();
    document.getElementById('exp-count').textContent = data.experiences.length;
    document.getElementById('skills-count').textContent = data.skills.length;
    document.getElementById('projects-count').textContent = data.projects.length;
    document.getElementById('edu-count').textContent = data.education.length;
}

// ==================== Personal Info ====================
function loadPersonalInfoForm() {
    const info = dataManager.getPersonalInfo();
    document.getElementById('personal-name').value = info.name;
    document.getElementById('personal-title').value = info.title;
    document.getElementById('personal-description').value = info.description;
    document.getElementById('personal-email').value = info.email;
    document.getElementById('personal-discord').value = info.discord;
    document.getElementById('personal-github').value = info.github;
    document.getElementById('personal-years').value = info.yearsExperience;
    document.getElementById('personal-projects').value = info.projectsCompleted;
}

// ==================== About ====================
function loadAboutForm() {
    const about = dataManager.getAbout();
    document.getElementById('about-text1').value = about.text1;
    document.getElementById('about-text2').value = about.text2;
}

// ==================== Experiences ====================
function loadExperiencesList() {
    const experiences = dataManager.getExperiences();
    const list = document.getElementById('experiences-list');
    
    if (!list) {
        console.error('Elemento experiences-list non trovato!');
        return;
    }
    
    list.innerHTML = '';
    
    if (!experiences || experiences.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Nessuna esperienza. Aggiungi la prima!</p>';
        return;
    }
    
    experiences.forEach(exp => {
        const item = document.createElement('div');
        item.className = 'item-card';
        item.innerHTML = `
            <div class="item-info">
                <h3>${exp.title}</h3>
                <p>${exp.period}</p>
                <p>${exp.description}</p>
            </div>
            <div class="item-actions">
                <button class="btn btn-icon btn-primary" onclick="editExperience(${exp.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-danger" onclick="deleteExperience(${exp.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

function addExperience() {
    showModal('Aggiungi Esperienza', `
        <form id="experience-form" class="admin-form">
            <div class="form-group">
                <label for="exp-title">Titolo</label>
                <input type="text" id="exp-title" required>
            </div>
            <div class="form-group">
                <label for="exp-period">Periodo</label>
                <input type="text" id="exp-period" placeholder="es. 2022 - Present" required>
            </div>
            <div class="form-group">
                <label for="exp-description">Descrizione</label>
                <textarea id="exp-description" rows="4" required></textarea>
            </div>
            <button type="submit" class="btn btn-success btn-block">
                <i class="fas fa-plus"></i> Aggiungi
            </button>
        </form>
    `);
    
    document.getElementById('experience-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const result = dataManager.addExperience({
            title: document.getElementById('exp-title').value,
            period: document.getElementById('exp-period').value,
            description: document.getElementById('exp-description').value
        });
        closeModal();
        showToast(result.message, 'success');
        loadExperiencesList();
        loadDashboardStats();
    });
}

function editExperience(id) {
    const experiences = dataManager.getExperiences();
    const exp = experiences.find(e => e.id === id);
    
    showModal('Modifica Esperienza', `
        <form id="experience-form" class="admin-form">
            <div class="form-group">
                <label for="exp-title">Titolo</label>
                <input type="text" id="exp-title" value="${exp.title}" required>
            </div>
            <div class="form-group">
                <label for="exp-period">Periodo</label>
                <input type="text" id="exp-period" value="${exp.period}" required>
            </div>
            <div class="form-group">
                <label for="exp-description">Descrizione</label>
                <textarea id="exp-description" rows="4" required>${exp.description}</textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
                <i class="fas fa-save"></i> Salva
            </button>
        </form>
    `);
    
    document.getElementById('experience-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const result = dataManager.updateExperience(id, {
            title: document.getElementById('exp-title').value,
            period: document.getElementById('exp-period').value,
            description: document.getElementById('exp-description').value
        });
        closeModal();
        showToast(result.message, 'success');
        loadExperiencesList();
    });
}

function deleteExperience(id) {
    if (confirm('Sei sicuro di voler eliminare questa esperienza?')) {
        const result = dataManager.deleteExperience(id);
        showToast(result.message, 'success');
        loadExperiencesList();
        loadDashboardStats();
    }
}

// ==================== Skills ====================
function loadSkillsList() {
    const skills = dataManager.getSkills();
    const list = document.getElementById('skills-list');
    list.innerHTML = '';
    
    if (skills.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Nessuna skill. Aggiungi la prima!</p>';
        return;
    }
    
    skills.forEach(skill => {
        const item = document.createElement('div');
        item.className = 'item-card';
        item.innerHTML = `
            <div class="item-info">
                <h3>${skill.name}</h3>
                <div class="skill-bar" style="margin-top: 0.5rem;">
                    <div class="skill-progress" style="width: ${skill.level}%">
                        <span class="skill-percentage">${skill.level}%</span>
                    </div>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-icon btn-primary" onclick="editSkill(${skill.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-danger" onclick="deleteSkill(${skill.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

function addSkill() {
    showModal('Aggiungi Skill', `
        <form id="skill-form" class="admin-form">
            <div class="form-group">
                <label for="skill-name">Nome Skill</label>
                <input type="text" id="skill-name" required>
            </div>
            <div class="form-group">
                <label for="skill-level">Livello (0-100)</label>
                <input type="number" id="skill-level" min="0" max="100" value="50" required>
            </div>
            <button type="submit" class="btn btn-success btn-block">
                <i class="fas fa-plus"></i> Aggiungi
            </button>
        </form>
    `);
    
    document.getElementById('skill-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const result = dataManager.addSkill({
            name: document.getElementById('skill-name').value,
            level: parseInt(document.getElementById('skill-level').value)
        });
        closeModal();
        showToast(result.message, 'success');
        loadSkillsList();
        loadDashboardStats();
    });
}

function editSkill(id) {
    const skills = dataManager.getSkills();
    const skill = skills.find(s => s.id === id);
    
    showModal('Modifica Skill', `
        <form id="skill-form" class="admin-form">
            <div class="form-group">
                <label for="skill-name">Nome Skill</label>
                <input type="text" id="skill-name" value="${skill.name}" required>
            </div>
            <div class="form-group">
                <label for="skill-level">Livello (0-100)</label>
                <input type="number" id="skill-level" min="0" max="100" value="${skill.level}" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
                <i class="fas fa-save"></i> Salva
            </button>
        </form>
    `);
    
    document.getElementById('skill-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const result = dataManager.updateSkill(id, {
            name: document.getElementById('skill-name').value,
            level: parseInt(document.getElementById('skill-level').value)
        });
        closeModal();
        showToast(result.message, 'success');
        loadSkillsList();
    });
}

function deleteSkill(id) {
    if (confirm('Sei sicuro di voler eliminare questa skill?')) {
        const result = dataManager.deleteSkill(id);
        showToast(result.message, 'success');
        loadSkillsList();
        loadDashboardStats();
    }
}

// ==================== Projects ====================
function loadProjectsList() {
    const projects = dataManager.getProjects();
    const list = document.getElementById('projects-list');
    list.innerHTML = '';
    
    if (projects.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Nessun progetto. Aggiungi il primo!</p>';
        return;
    }
    
    projects.forEach(project => {
        const techTags = project.technologies && project.technologies.length > 0
            ? project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')
            : '';
        
        const item = document.createElement('div');
        item.className = 'item-card';
        item.innerHTML = `
            <div class="item-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                ${project.link ? `<p><a href="${project.link}" target="_blank" style="color: var(--accent-primary);">${project.link}</a></p>` : ''}
                ${techTags ? `<div class="item-meta">${techTags}</div>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn btn-icon btn-primary" onclick="editProject(${project.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-danger" onclick="deleteProject(${project.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

function addProject() {
    showModal('Aggiungi Progetto', `
        <form id="project-form" class="admin-form">
            <div class="form-group">
                <label for="project-title">Titolo</label>
                <input type="text" id="project-title" required>
            </div>
            <div class="form-group">
                <label for="project-description">Descrizione</label>
                <textarea id="project-description" rows="3" required></textarea>
            </div>
            <div class="form-group">
                <label for="project-link">Link (opzionale)</label>
                <input type="url" id="project-link" placeholder="https://">
            </div>
            <div class="form-group">
                <label for="project-tech">Tecnologie (separate da virgola)</label>
                <input type="text" id="project-tech" placeholder="HTML, CSS, JavaScript">
            </div>
            <button type="submit" class="btn btn-success btn-block">
                <i class="fas fa-plus"></i> Aggiungi
            </button>
        </form>
    `);
    
    document.getElementById('project-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const techInput = document.getElementById('project-tech').value;
        const technologies = techInput ? techInput.split(',').map(t => t.trim()).filter(t => t) : [];
        
        const result = dataManager.addProject({
            title: document.getElementById('project-title').value,
            description: document.getElementById('project-description').value,
            link: document.getElementById('project-link').value,
            technologies: technologies
        });
        closeModal();
        showToast(result.message, 'success');
        loadProjectsList();
        loadDashboardStats();
    });
}

function editProject(id) {
    const projects = dataManager.getProjects();
    const project = projects.find(p => p.id === id);
    const techString = project.technologies ? project.technologies.join(', ') : '';
    
    showModal('Modifica Progetto', `
        <form id="project-form" class="admin-form">
            <div class="form-group">
                <label for="project-title">Titolo</label>
                <input type="text" id="project-title" value="${project.title}" required>
            </div>
            <div class="form-group">
                <label for="project-description">Descrizione</label>
                <textarea id="project-description" rows="3" required>${project.description}</textarea>
            </div>
            <div class="form-group">
                <label for="project-link">Link (opzionale)</label>
                <input type="url" id="project-link" value="${project.link || ''}" placeholder="https://">
            </div>
            <div class="form-group">
                <label for="project-tech">Tecnologie (separate da virgola)</label>
                <input type="text" id="project-tech" value="${techString}" placeholder="HTML, CSS, JavaScript">
            </div>
            <button type="submit" class="btn btn-primary btn-block">
                <i class="fas fa-save"></i> Salva
            </button>
        </form>
    `);
    
    document.getElementById('project-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const techInput = document.getElementById('project-tech').value;
        const technologies = techInput ? techInput.split(',').map(t => t.trim()).filter(t => t) : [];
        
        const result = dataManager.updateProject(id, {
            title: document.getElementById('project-title').value,
            description: document.getElementById('project-description').value,
            link: document.getElementById('project-link').value,
            technologies: technologies
        });
        closeModal();
        showToast(result.message, 'success');
        loadProjectsList();
    });
}

function deleteProject(id) {
    if (confirm('Sei sicuro di voler eliminare questo progetto?')) {
        const result = dataManager.deleteProject(id);
        showToast(result.message, 'success');
        loadProjectsList();
        loadDashboardStats();
    }
}

// ==================== Education ====================
function loadEducationList() {
    const education = dataManager.getEducation();
    const list = document.getElementById('education-list');
    list.innerHTML = '';
    
    if (education.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Nessuna educazione. Aggiungi la prima!</p>';
        return;
    }
    
    education.forEach(edu => {
        const item = document.createElement('div');
        item.className = 'item-card';
        item.innerHTML = `
            <div class="item-info">
                <h3>${edu.title}</h3>
                <p>${edu.period}</p>
                <p>${edu.description}</p>
            </div>
            <div class="item-actions">
                <button class="btn btn-icon btn-primary" onclick="editEducation(${edu.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-danger" onclick="deleteEducation(${edu.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

function addEducation() {
    showModal('Aggiungi Educazione', `
        <form id="education-form" class="admin-form">
            <div class="form-group">
                <label for="edu-title">Titolo</label>
                <input type="text" id="edu-title" required>
            </div>
            <div class="form-group">
                <label for="edu-period">Periodo</label>
                <input type="text" id="edu-period" placeholder="es. 2020 - Present" required>
            </div>
            <div class="form-group">
                <label for="edu-description">Descrizione</label>
                <textarea id="edu-description" rows="4" required></textarea>
            </div>
            <button type="submit" class="btn btn-success btn-block">
                <i class="fas fa-plus"></i> Aggiungi
            </button>
        </form>
    `);
    
    document.getElementById('education-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const result = dataManager.addEducation({
            title: document.getElementById('edu-title').value,
            period: document.getElementById('edu-period').value,
            description: document.getElementById('edu-description').value
        });
        closeModal();
        showToast(result.message, 'success');
        loadEducationList();
        loadDashboardStats();
    });
}

function editEducation(id) {
    const education = dataManager.getEducation();
    const edu = education.find(e => e.id === id);
    
    showModal('Modifica Educazione', `
        <form id="education-form" class="admin-form">
            <div class="form-group">
                <label for="edu-title">Titolo</label>
                <input type="text" id="edu-title" value="${edu.title}" required>
            </div>
            <div class="form-group">
                <label for="edu-period">Periodo</label>
                <input type="text" id="edu-period" value="${edu.period}" required>
            </div>
            <div class="form-group">
                <label for="edu-description">Descrizione</label>
                <textarea id="edu-description" rows="4" required>${edu.description}</textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
                <i class="fas fa-save"></i> Salva
            </button>
        </form>
    `);
    
    document.getElementById('education-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const result = dataManager.updateEducation(id, {
            title: document.getElementById('edu-title').value,
            period: document.getElementById('edu-period').value,
            description: document.getElementById('edu-description').value
        });
        closeModal();
        showToast(result.message, 'success');
        loadEducationList();
    });
}

function deleteEducation(id) {
    if (confirm('Sei sicuro di voler eliminare questa educazione?')) {
        const result = dataManager.deleteEducation(id);
        showToast(result.message, 'success');
        loadEducationList();
        loadDashboardStats();
    }
}

// ==================== Event Listeners ====================
function setupEventListeners() {
    // Personal Info Form
    document.getElementById('personal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const result = dataManager.updatePersonalInfo({
            name: document.getElementById('personal-name').value,
            title: document.getElementById('personal-title').value,
            description: document.getElementById('personal-description').value,
            email: document.getElementById('personal-email').value,
            discord: document.getElementById('personal-discord').value,
            github: document.getElementById('personal-github').value,
            yearsExperience: document.getElementById('personal-years').value,
            projectsCompleted: document.getElementById('personal-projects').value
        });
        showToast(result.message, 'success');
    });
    
    // About Form
    document.getElementById('about-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const result = dataManager.updateAbout({
            text1: document.getElementById('about-text1').value,
            text2: document.getElementById('about-text2').value
        });
        showToast(result.message, 'success');
    });
    
    // Add buttons
    document.getElementById('add-experience-btn').addEventListener('click', addExperience);
    document.getElementById('add-skill-btn').addEventListener('click', addSkill);
    document.getElementById('add-project-btn').addEventListener('click', addProject);
    document.getElementById('add-education-btn').addEventListener('click', addEducation);
    
    // Settings
    setupSettingsListeners();
}

function setupSettingsListeners() {
    // Change Username
    document.getElementById('change-username-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('new-username').value;
        const password = document.getElementById('confirm-password-username').value;
        
        const result = authManager.changeUsername(newUsername, password);
        showToast(result.message, result.success ? 'success' : 'error');
        
        if (result.success) {
            document.getElementById('current-user').textContent = newUsername;
            document.getElementById('change-username-form').reset();
        }
    });
    
    // Change Password
    document.getElementById('change-password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword !== confirmPassword) {
            showToast('Le password non corrispondono!', 'error');
            return;
        }
        
        const result = authManager.changePassword(oldPassword, newPassword);
        showToast(result.message, result.success ? 'success' : 'error');
        
        if (result.success) {
            document.getElementById('change-password-form').reset();
        }
    });
    
    // Export Data
    document.getElementById('export-data-btn').addEventListener('click', () => {
        const data = dataManager.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Dati esportati con successo!', 'success');
    });
    
    // Import Data
    document.getElementById('import-data-btn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = dataManager.importData(event.target.result);
                showToast(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    loadAllData();
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });
    
    // Reset Data
    document.getElementById('reset-data-btn').addEventListener('click', () => {
        if (confirm('Sei sicuro di voler resettare tutti i dati? Questa azione non può essere annullata!')) {
            const result = dataManager.resetData();
            showToast(result.message, 'warning');
            loadAllData();
        }
    });
}

// ==================== Modal ====================
function showModal(title, content) {
    const modal = document.getElementById('modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
}

document.getElementById('modal-close').addEventListener('click', closeModal);

document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
        closeModal();
    }
});

// ==================== Toast ====================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Make functions global for onclick handlers
window.editExperience = editExperience;
window.deleteExperience = deleteExperience;
window.editSkill = editSkill;
window.deleteSkill = deleteSkill;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.editEducation = editEducation;
window.deleteEducation = deleteEducation;
