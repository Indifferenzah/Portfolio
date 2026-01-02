class DataManager {
    constructor() {
        this.STORAGE_KEY = 'portfolio_data';
        this.initializeData();
    }

    initializeData() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            const defaultData = {
                personalInfo: {
                    name: 'Indifferenzah',
                    title: 'Web Developer & Python Developer',
                    description: 'Web Developer & Python Developer with over 2 years of experience in HTML, CSS, JS, and Python.',
                    email: 'info@indifferenzah.com',
                    discord: '@indifferenzah',
                    github: 'https://github.com/indifferenzah',
                    yearsExperience: '2+',
                    projectsCompleted: '10+'
                },
                about: {
                    text1: 'I have been developing with HTML, CSS, JS, and Python for over 2 years. My journey in web development started with a passion for creating interactive and visually appealing websites. I specialize in front-end technologies and have a strong foundation in back-end scripting with Python. I enjoy solving complex problems and building efficient, scalable solutions. Outside of coding, I love exploring new technologies and contributing to open-source projects.',
                    text2: 'With a focus on clean code and user experience, I strive to deliver high-quality work that meets client needs. I am always eager to learn and adapt to new challenges in the ever-evolving tech landscape.'
                },
                experiences: [
                    {
                        id: 1,
                        title: 'Freelance Web Developer',
                        period: '2022 - Present',
                        description: 'Developed responsive websites for various clients using HTML, CSS, and JavaScript. Integrated back-end functionalities with Python for dynamic content.'
                    },
                    {
                        id: 2,
                        title: 'Python Automation Specialist',
                        period: '2021 - 2022',
                        description: 'Created automation scripts for data processing and web scraping. Improved efficiency by 50% in repetitive tasks.'
                    },
                    {
                        id: 3,
                        title: 'Open-Source Contributor',
                        period: 'Ongoing',
                        description: 'Contributed to various open-source projects on GitHub, focusing on front-end enhancements and bug fixes.'
                    }
                ],
                skills: [
                    { id: 1, name: 'HTML', level: 100 },
                    { id: 2, name: 'CSS', level: 100 },
                    { id: 3, name: 'JavaScript', level: 75 },
                    { id: 4, name: 'Python', level: 100 }
                ],
                projects: [
                    {
                        id: 1,
                        title: 'Responsive Portfolio Website',
                        description: 'A modern portfolio site built with HTML, CSS, and JS, featuring animations and interactive elements.',
                        link: '',
                        image: '',
                        technologies: ['HTML', 'CSS', 'JavaScript']
                    },
                    {
                        id: 2,
                        title: 'JavaScript Discord Bot',
                        description: 'A bot for managing Discord servers, automating tasks, and enhancing user interaction using JS. You can find the bot online here: https://discord.gg/bQbqVnNb .',
                        link: 'https://github.com/Indifferenzah/Valiancejs',
                        image: '',
                        technologies: ['JavaScript', 'Discord.js']
                    },
                    {
                        id: 3,
                        title: 'AI Detector',
                        description: 'A Python AI Detector using Python libraries.',
                        link: 'https://github.com/Indifferenzah/AiDetector',
                        image: '',
                        technologies: ['Python', 'AI/ML']
                    },
                    {
                        id: 4,
                        title: 'Valiance Website',
                        description: 'A simple modern website with a forum for the Valiance Clan.',
                        link: 'https://github.com/Indifferenzah/ValianceSite',
                        image: '',
                        technologies: ['HTML', 'CSS', 'JavaScript']
                    }
                ],
                education: [
                    {
                        id: 1,
                        title: 'Self-Taught Developer',
                        period: '2020 - Present',
                        description: 'Learned web development and Python through online courses, tutorials, and hands-on projects. Completed certifications in HTML, CSS, JavaScript, and Python.'
                    },
                    {
                        id: 2,
                        title: 'High School',
                        period: '2022 - Present',
                        description: 'Currently in school, ITIS Informatico in Italy.'
                    }
                ]
            };
            this.saveData(defaultData);
        }
    }

    getData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    }

    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }

    getPersonalInfo() {
        return this.getData().personalInfo;
    }

    updatePersonalInfo(personalInfo) {
        const data = this.getData();
        data.personalInfo = { ...data.personalInfo, ...personalInfo };
        this.saveData(data);
        return { success: true, message: 'Informazioni personali aggiornate!' };
    }

    getAbout() {
        return this.getData().about;
    }

    updateAbout(about) {
        const data = this.getData();
        data.about = { ...data.about, ...about };
        this.saveData(data);
        return { success: true, message: 'Sezione About aggiornata!' };
    }

    getExperiences() {
        return this.getData().experiences;
    }

    addExperience(experience) {
        const data = this.getData();
        const newId = Math.max(...data.experiences.map(e => e.id), 0) + 1;
        experience.id = newId;
        data.experiences.push(experience);
        this.saveData(data);
        return { success: true, message: 'Esperienza aggiunta!', data: experience };
    }

    updateExperience(id, experience) {
        const data = this.getData();
        const index = data.experiences.findIndex(e => e.id === id);
        if (index !== -1) {
            data.experiences[index] = { ...data.experiences[index], ...experience };
            this.saveData(data);
            return { success: true, message: 'Esperienza aggiornata!' };
        }
        return { success: false, message: 'Esperienza non trovata!' };
    }

    deleteExperience(id) {
        const data = this.getData();
        data.experiences = data.experiences.filter(e => e.id !== id);
        this.saveData(data);
        return { success: true, message: 'Esperienza eliminata!' };
    }

    getSkills() {
        return this.getData().skills;
    }

    addSkill(skill) {
        const data = this.getData();
        const newId = Math.max(...data.skills.map(s => s.id), 0) + 1;
        skill.id = newId;
        data.skills.push(skill);
        this.saveData(data);
        return { success: true, message: 'Skill aggiunta!', data: skill };
    }

    updateSkill(id, skill) {
        const data = this.getData();
        const index = data.skills.findIndex(s => s.id === id);
        if (index !== -1) {
            data.skills[index] = { ...data.skills[index], ...skill };
            this.saveData(data);
            return { success: true, message: 'Skill aggiornata!' };
        }
        return { success: false, message: 'Skill non trovata!' };
    }

    deleteSkill(id) {
        const data = this.getData();
        data.skills = data.skills.filter(s => s.id !== id);
        this.saveData(data);
        return { success: true, message: 'Skill eliminata!' };
    }

    getProjects() {
        return this.getData().projects;
    }

    addProject(project) {
        const data = this.getData();
        const newId = Math.max(...data.projects.map(p => p.id), 0) + 1;
        project.id = newId;
        if (!project.technologies) project.technologies = [];
        data.projects.push(project);
        this.saveData(data);
        return { success: true, message: 'Progetto aggiunto!', data: project };
    }

    updateProject(id, project) {
        const data = this.getData();
        const index = data.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            data.projects[index] = { ...data.projects[index], ...project };
            this.saveData(data);
            return { success: true, message: 'Progetto aggiornato!' };
        }
        return { success: false, message: 'Progetto non trovato!' };
    }

    deleteProject(id) {
        const data = this.getData();
        data.projects = data.projects.filter(p => p.id !== id);
        this.saveData(data);
        return { success: true, message: 'Progetto eliminato!' };
    }

    getEducation() {
        return this.getData().education;
    }

    addEducation(edu) {
        const data = this.getData();
        const newId = Math.max(...data.education.map(e => e.id), 0) + 1;
        edu.id = newId;
        data.education.push(edu);
        this.saveData(data);
        return { success: true, message: 'Educazione aggiunta!', data: edu };
    }

    updateEducation(id, edu) {
        const data = this.getData();
        const index = data.education.findIndex(e => e.id === id);
        if (index !== -1) {
            data.education[index] = { ...data.education[index], ...edu };
            this.saveData(data);
            return { success: true, message: 'Educazione aggiornata!' };
        }
        return { success: false, message: 'Educazione non trovata!' };
    }

    deleteEducation(id) {
        const data = this.getData();
        data.education = data.education.filter(e => e.id !== id);
        this.saveData(data);
        return { success: true, message: 'Educazione eliminata!' };
    }

    exportData() {
        return JSON.stringify(this.getData(), null, 2);
    }

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.saveData(data);
            return { success: true, message: 'Dati importati con successo!' };
        } catch (e) {
            return { success: false, message: 'Errore nel parsing del JSON!' };
        }
    }

    resetData() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.initializeData();
        return { success: true, message: 'Dati resettati ai valori di default!' };
    }
}

if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
}
