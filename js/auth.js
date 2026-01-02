class AuthManager {
    constructor() {
        this.STORAGE_KEY = 'portfolio_auth';
        this.CREDENTIALS_KEY = 'portfolio_credentials';
        this.initializeCredentials();
    }

    initializeCredentials() {
        if (!localStorage.getItem(this.CREDENTIALS_KEY)) {
            const defaultCredentials = {
                username: 'indifferenzah',
                password: this.hashPassword('112@Outofhead!') // Password di default
            };
            localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(defaultCredentials));
        }
    }

    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    login(username, password) {
        const credentials = JSON.parse(localStorage.getItem(this.CREDENTIALS_KEY));
        const hashedPassword = this.hashPassword(password);

        if (username === credentials.username && hashedPassword === credentials.password) {
            const session = {
                username: username,
                loginTime: new Date().toISOString(),
                token: this.generateToken()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
            return { success: true, message: 'Login effettuato con successo!' };
        }

        return { success: false, message: 'Credenziali non valide!' };
    }

    logout() {
        localStorage.removeItem(this.STORAGE_KEY);
        window.location.href = '../index.html';
    }

    isAuthenticated() {
        const session = localStorage.getItem(this.STORAGE_KEY);
        if (!session) return false;

        try {
            const sessionData = JSON.parse(session);
            const loginTime = new Date(sessionData.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

            return hoursDiff < 24;
        } catch (e) {
            return false;
        }
    }

    changePassword(oldPassword, newPassword) {
        const credentials = JSON.parse(localStorage.getItem(this.CREDENTIALS_KEY));
        const hashedOldPassword = this.hashPassword(oldPassword);

        if (hashedOldPassword === credentials.password) {
            credentials.password = this.hashPassword(newPassword);
            localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(credentials));
            return { success: true, message: 'Password modificata con successo!' };
        }

        return { success: false, message: 'Password attuale non corretta!' };
    }

    changeUsername(newUsername, password) {
        const credentials = JSON.parse(localStorage.getItem(this.CREDENTIALS_KEY));
        const hashedPassword = this.hashPassword(password);

        if (hashedPassword === credentials.password) {
            credentials.username = newUsername;
            localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(credentials));
            
            const session = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
            session.username = newUsername;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
            
            return { success: true, message: 'Username modificato con successo!' };
        }

        return { success: false, message: 'Password non corretta!' };
    }

    generateToken() {
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    }

    getCurrentUser() {
        const session = localStorage.getItem(this.STORAGE_KEY);
        if (!session) return null;
        
        try {
            const sessionData = JSON.parse(session);
            return sessionData.username;
        } catch (e) {
            return null;
        }
    }
}

if (typeof window !== 'undefined') {
    window.AuthManager = AuthManager;
}
