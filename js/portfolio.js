const dataManager = new DataManager();

window.addEventListener('load', () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);
});

document.addEventListener('DOMContentLoaded', () => {
    loadPortfolioData();
    initializeNavigation();
    initializeAnimations();
    initializeBackground();
    
    document.getElementById('year').textContent = new Date().getFullYear();
});

function loadPortfolioData() {
    const data = dataManager.getData();
    
    loadPersonalInfo(data.personalInfo);
    loadAbout(data.about);
    loadExperiences(data.experiences);
    loadSkills(data.skills);
    loadProjects(data.projects);
    loadEducation(data.education);
}

function loadPersonalInfo(info) {
    document.getElementById('hero-name').textContent = info.name;
    document.getElementById('nav-name').textContent = info.name;
    document.getElementById('loading-text').textContent = info.name;
    document.getElementById('footer-name').textContent = info.name;
    document.getElementById('hero-title').textContent = info.title;
    document.getElementById('hero-description').textContent = info.description;
    document.getElementById('years-exp').textContent = info.yearsExperience;
    document.getElementById('projects-count').textContent = info.projectsCompleted;
    
    document.getElementById('contact-email').textContent = info.email;
    document.getElementById('email-link').href = 'mailto:' + info.email;
    document.getElementById('contact-discord').textContent = info.discord;
    document.getElementById('contact-github').textContent = info.github.replace('https://', '');
    document.getElementById('contact-github').href = info.github;
    document.getElementById('github-link').href = info.github;
}

function loadAbout(about) {
    document.getElementById('about-text-1').textContent = about.text1;
    document.getElementById('about-text-2').textContent = about.text2;
}

function loadExperiences(experiences) {
    const timeline = document.getElementById('experience-timeline');
    timeline.innerHTML = '';
    
    experiences.forEach((exp, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.style.animationDelay = `${index * 0.1}s`;
        item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content card">
                <h3>${exp.title}</h3>
                <p class="timeline-period">${exp.period}</p>
                <p>${exp.description}</p>
            </div>
        `;
        timeline.appendChild(item);
    });
}

function loadSkills(skills) {
    const skillsGrid = document.getElementById('skills-grid');
    skillsGrid.innerHTML = '';
    
    skills.forEach((skill, index) => {
        const skillCard = document.createElement('div');
        skillCard.className = 'skill-card card';
        skillCard.style.animationDelay = `${index * 0.1}s`;
        skillCard.innerHTML = `
            <h3>${skill.name}</h3>
            <div class="skill-bar">
                <div class="skill-progress" style="width: ${skill.level}%" data-level="${skill.level}">
                    <span class="skill-percentage">${skill.level}%</span>
                </div>
            </div>
        `;
        skillsGrid.appendChild(skillCard);
    });
    
    observeSkills();
}

function loadProjects(projects) {
    const projectsGrid = document.getElementById('projects-grid');
    projectsGrid.innerHTML = '';
    
    projects.forEach((project, index) => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card card';
        projectCard.style.animationDelay = `${index * 0.1}s`;
        
        const technologiesHTML = project.technologies && project.technologies.length > 0
            ? `<div class="project-tech">
                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
               </div>`
            : '';
        
        const linkHTML = project.link 
            ? `<a href="${project.link}" class="project-link" target="_blank" rel="noopener">
                <i class="fas fa-external-link-alt"></i> View Project
               </a>`
            : '';
        
        projectCard.innerHTML = `
            <div class="project-icon">
                <i class="fas fa-folder-open"></i>
            </div>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            ${technologiesHTML}
            ${linkHTML}
        `;
        projectsGrid.appendChild(projectCard);
    });
}

function loadEducation(education) {
    const educationGrid = document.getElementById('education-grid');
    educationGrid.innerHTML = '';
    
    education.forEach((edu, index) => {
        const eduCard = document.createElement('div');
        eduCard.className = 'education-card card';
        eduCard.style.animationDelay = `${index * 0.1}s`;
        eduCard.innerHTML = `
            <div class="education-icon">
                <i class="fas fa-graduation-cap"></i>
            </div>
            <h3>${edu.title}</h3>
            <p class="education-period">${edu.period}</p>
            <p>${edu.description}</p>
        `;
        educationGrid.appendChild(eduCard);
    });
}

function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    const sections = document.querySelectorAll('section[id]');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-100px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => observer.observe(card));
    
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function observeSkills() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => observer.observe(bar));
}

function initializeBackground() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 80;
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(34, 211, 238, 0.3)';
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(34, 211, 238, ${0.15 * (1 - distance / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        
        particles.forEach(particle => particle.reset());
    });
    
    let mouse = { x: null, y: null };
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        particles.forEach(particle => {
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                particle.vx -= dx / distance * 0.05;
                particle.vy -= dy / distance * 0.05;
            }
        });
    });
}
