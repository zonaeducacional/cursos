import { auth, googleProvider, db } from './firebase-config.js';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    doc,
    setDoc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initializeAuth();
    }

    initializeAuth() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.currentUser = user;
                this.handleUserLogin(user);
            } else {
                this.currentUser = null;
                this.handleUserLogout();
            }
        });
    }

    async loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Salvar dados do usuário no Firestore
            await this.saveUserData(user);

            return user;
        } catch (error) {
            console.error('Erro no login:', error);
            alert('Erro ao fazer login. Tente novamente.');
        }
    }

    async saveUserData(user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Novo usuário - criar perfil
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: 'student', // padrão: estudante
                createdAt: new Date(),
                lastLogin: new Date(),
                progress: {},
                achievements: []
            });
        } else {
            // Usuário existente - atualizar último login
            await setDoc(userRef, {
                lastLogin: new Date()
            }, { merge: true });
        }
    }

    async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Erro ao sair:', error);
        }
    }

    async getUserRole() {
        if (!this.currentUser) return null;

        const userRef = doc(db, 'users', this.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data().role;
        }
        return 'student';
    }

    handleUserLogin(user) {
        // Atualizar UI
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('userMenu').classList.remove('hidden');
        document.getElementById('userName').textContent = user.displayName;
        document.getElementById('userAvatar').src = user.photoURL;

        // Verificar se é admin
        this.getUserRole().then(role => {
            if (role === 'admin') {
                document.getElementById('adminLink').classList.remove('hidden');
            }
        });
    }

    handleUserLogout() {
        // Atualizar UI
        document.getElementById('loginBtn').classList.remove('hidden');
        document.getElementById('userMenu').classList.add('hidden');
        document.getElementById('adminLink').classList.add('hidden');
    }
}

// Inicializar gerenciador de autenticação
const authManager = new AuthManager();

// Event listeners
document.getElementById('loginBtn').addEventListener('click', () => {
    authManager.loginWithGoogle();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    authManager.logout();
});

document.getElementById('userMenuBtn').addEventListener('click', () => {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
});

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('userMenu');
    const dropdown = document.getElementById('userDropdown');

    if (!userMenu.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

export { authManager };