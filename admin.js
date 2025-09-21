import { auth, db } from '../assets/js/firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc,
    query,
    orderBy,
    where,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.initializeAuth();
        this.initializeNavigation();
        this.initializeModals();
        this.initializeFileUpload();
    }

    initializeAuth() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                // Verificar se é admin
                const isAdmin = await this.checkAdminRole(user.uid);
                if (!isAdmin) {
                    alert('Acesso negado. Você não tem permissões de administrador.');
                    window.location.href = '/';
                    return;
                }
                this.updateUserUI(user);
                this.loadDashboardData();
            } else {
                window.location.href = '/';
            }
        });
    }

    async checkAdminRole(uid) {
        try {
            const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)));
            if (!userDoc.empty) {
                const userData = userDoc.docs[0].data();
                return userData.role === 'admin';
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar permissões:', error);
            return false;
        }
    }

    updateUserUI(user) {
        document.getElementById('userName').textContent = user.displayName;
        document.getElementById('userAvatar').src = user.photoURL;
    }

    initializeNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });
    }

    switchSection(sectionName) {
        // Remover classe active de todos os itens de navegação
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Adicionar classe active ao item clicado
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        // Esconder todas as seções
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar seção selecionada
        document.getElementById(`${sectionName}-section`).classList.add('active');
        
        this.currentSection = sectionName;
        
        // Carregar dados da seção
        this.loadSectionData(sectionName);
    }

    async loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'courses':
                await this.loadCoursesData();
                break;
            case 'users':
                await this.loadUsersData();
                break;
            case 'content':
                await this.loadContentData();
                break;
        }
    }

    async loadDashboardData() {
        try {
            // Carregar estatísticas
            const [usersSnapshot, coursesSnapshot] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'courses'))
            ]);

            document.getElementById('totalUsers').textContent = usersSnapshot.size;
            document.getElementById('totalCourses').textContent = coursesSnapshot.size;
            
            // Simular outras métricas (implementar conforme necessário)
            document.getElementById('totalViews').textContent = '1,234';
            document.getElementById('totalRevenue').textContent = 'R$ 12,345';

            // Carregar atividade recente
            this.loadRecentActivity();
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
    }

    async loadRecentActivity() {
        const activities = [
            { type: 'user', message: 'Novo usuário registrado', time: '2 min atrás' },
            { type: 'course', message: 'Curso "JavaScript Avançado" foi publicado', time: '1 hora atrás' },
            { type: 'purchase', message: 'Nova compra realizada', time: '3 horas atrás' }
        ];

        const container = document.getElementById('recentActivity');
        container.innerHTML = activities.map(activity => `
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div class="flex-shrink-0">
                    <i class="fas fa-${this.getActivityIcon(activity.type)} text-primary-500"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm text-gray-900">${activity.message}</p>
                    <p class="text-xs text-gray-500">${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            user: 'user-plus',
            course: 'book',
            purchase: 'shopping-cart'
        };
        return icons[type] || 'info-circle';
    }

    async loadCoursesData() {
        try {
            const coursesSnapshot = await getDocs(query(collection(db, 'courses'), orderBy('createdAt', 'desc')));
            const courses = [];
            
            coursesSnapshot.forEach(doc => {
                courses.push({ id: doc.id, ...doc.data() });
            });

            this.renderCoursesTable(courses);
        } catch (error) {
            console.error('Erro ao carregar cursos:', error);
        }
    }

    renderCoursesTable(courses) {
        const tbody = document.getElementById('coursesTable');
        
        if (courses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        Nenhum curso encontrado
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = courses.map(course => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <i class="fas fa-book text-gray-500"></i>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${course.title}</div>
                            <div class="text-sm text-gray-500">${course.category || 'Sem categoria'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${course.instructor || 'Não definido'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        course.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }">
                        ${course.published ? 'Publicado' : 'Rascunho'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${course.enrolledCount || 0}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="adminPanel.editCourse('${course.id}')" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="adminPanel.deleteCourse('${course.id}')" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadUsersData() {
        try {
            const usersSnapshot = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
            const users = [];
            
            usersSnapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });

            this.renderUsersTable(users);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        }
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('usersTable');
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        Nenhum usuário encontrado
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full" src="${user.photoURL || '/assets/img/default-avatar.png'}" alt="">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${user.displayName}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${user.email}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                        user.role === 'instructor' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                    }">
                        ${this.getRoleLabel(user.role)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${user.lastLogin ? new Date(user.lastLogin.toDate()).toLocaleDateString('pt-BR') : 'Nunca'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="adminPanel.editUser('${user.id}')" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="adminPanel.toggleUserStatus('${user.id}')" class="text-yellow-600 hover:text-yellow-900">
                        <i class="fas fa-ban"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getRoleLabel(role) {
        const labels = {
            admin: 'Administrador',
            instructor: 'Instrutor',
            student: 'Estudante'
        };
        return labels[role] || 'Estudante';
    }

    initializeModals() {
        // Modal de criar curso
        const createCourseBtn = document.getElementById('createCourseBtn');
        const createCourseModal = document.getElementById('createCourseModal');
        const closeCourseModal = document.getElementById('closeCourseModal');
        const cancelCourseBtn = document.getElementById('cancelCourseBtn');
        const createCourseForm = document.getElementById('createCourseForm');

        createCourseBtn.addEventListener('click', () => {
            createCourseModal.classList.remove('hidden');
        });

        [closeCourseModal, cancelCourseBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                createCourseModal.classList.add('hidden');
                createCourseForm.reset();
            });
        });

        createCourseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createCourse();
        });
    }

    async createCourse() {
        try {
            const courseData = {
                title: document.getElementById('courseTitle').value,
                description: document.getElementById('courseDescription').value,
                category: document.getElementById('courseCategory').value,
                price: parseFloat(document.getElementById('coursePrice').value) || 0,
                featured: document.getElementById('courseFeatured').checked,
                published: document.getElementById('coursePublished').checked,
                instructor: this.currentUser.displayName,
                instructorId: this.currentUser.uid,
                createdAt: new Date(),
                updatedAt: new Date(),
                enrolledCount: 0,
                rating: 5.0,
                lessons: [],
                duration: '0h'
            };

            await addDoc(collection(db, 'courses'), courseData);
            
            // Fechar modal e recarregar dados
            document.getElementById('createCourseModal').classList.add('hidden');
            document.getElementById('createCourseForm').reset();
            
            alert('Curso criado com sucesso!');
            this.loadCoursesData();
        } catch (error) {
            console.error('Erro ao criar curso:', error);
            alert('Erro ao criar curso. Tente novamente.');
        }
    }

    async deleteCourse(courseId) {
        if (confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
            try {
                await deleteDoc(doc(db, 'courses', courseId));
                alert('Curso excluído com sucesso!');
                this.loadCoursesData();
            } catch (error) {
                console.error('Erro ao excluir curso:', error);
                alert('Erro ao excluir curso. Tente novamente.');
            }
        }
    }

    editCourse(courseId) {
        // Implementar edição de curso
        alert(`Editar curso ${courseId} - Funcionalidade em desenvolvimento`);
    }

    editUser(userId) {
        // Implementar edição de usuário
        alert(`Editar usuário ${userId} - Funcionalidade em desenvolvimento`);
    }

    toggleUserStatus(userId) {
        // Implementar suspensão/ativação de usuário
        alert(`Alterar status do usuário ${userId} - Funcionalidade em desenvolvimento`);
    }

    initializeFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('border-primary-500');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('border-primary-500');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('border-primary-500');
            const files = e.dataTransfer.files;
            this.handleFileUpload(files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    async handleFileUpload(files) {
        if (files.length === 0) return;

        const uploadProgress = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('progressBar');
        const uploadStatus = document.getElementById('uploadStatus');

        uploadProgress.classList.remove('hidden');

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            uploadStatus.textContent = `Enviando ${file.name}...`;
            
            // Simular upload para Kekoweb.org
            await this.simulateUpload(file, progressBar);
            
            // Salvar referência no Firestore
            await this.saveFileReference(file);
        }

        uploadStatus.textContent = 'Upload concluído!';
        setTimeout(() => {
            uploadProgress.classList.add('hidden');
            progressBar.style.width = '0%';
        }, 2000);

        this.loadContentData();
    }

    async simulateUpload(file, progressBar) {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    resolve();
                }
                progressBar.style.width = `${progress}%`;
            }, 200);
        });
    }

    async saveFileReference(file) {
        try {
            const fileData = {
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedBy: this.currentUser.uid,
                uploadedAt: new Date(),
                url: `https://kekoweb.org/uploads/${Date.now()}_${file.name}`, // URL simulada
                category: this.getFileCategory(file.type)
            };

            await addDoc(collection(db, 'media'), fileData);
        } catch (error) {
            console.error('Erro ao salvar referência do arquivo:', error);
        }
    }

    getFileCategory(mimeType) {
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.includes('pdf')) return 'document';
        return 'other';
    }

    async loadContentData() {
        try {
            const mediaSnapshot = await getDocs(query(collection(db, 'media'), orderBy('uploadedAt', 'desc')));
            const mediaFiles = [];
            
            mediaSnapshot.forEach(doc => {
                mediaFiles.push({ id: doc.id, ...doc.data() });
            });

            this.renderMediaLibrary(mediaFiles);
        } catch (error) {
            console.error('Erro ao carregar mídia:', error);
        }
    }

    renderMediaLibrary(files) {
        const container = document.getElementById('mediaLibrary');
        
        if (files.length === 0) {
            container.innerHTML = `
                <div class="col-span-2 text-center py-8 text-gray-500">
                    <i class="fas fa-folder-open text-3xl mb-2"></i>
                    <p>Nenhum arquivo encontrado</p>
                </div>
            `;
            return;
        }

        container.innerHTML = files.map(file => `
            <div class="border rounded-lg p-3 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-center h-20 bg-gray-100 rounded mb-2">
                    <i class="fas fa-${this.getFileIcon(file.category)} text-2xl text-gray-500"></i>
                </div>
                <p class="text-sm font-medium truncate" title="${file.name}">${file.name}</p>
                <p class="text-xs text-gray-500">${this.formatFileSize(file.size)}</p>
                <button onclick="adminPanel.deleteFile('${file.id}')" class="mt-2 text-red-500 hover:text-red-700 text-xs">
                    <i class="fas fa-trash mr-1"></i>Excluir
                </button>
            </div>
        `).join('');
    }

    getFileIcon(category) {
        const icons = {
            video: 'play-circle',
            image: 'image',
            document: 'file-pdf',
            other: 'file'
        };
        return icons[category] || 'file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async deleteFile(fileId) {
        if (confirm('Tem certeza que deseja excluir este arquivo?')) {
            try {
                await deleteDoc(doc(db, 'media', fileId));
                alert('Arquivo excluído com sucesso!');
                this.loadContentData();
            } catch (error) {
                console.error('Erro ao excluir arquivo:', error);
                alert('Erro ao excluir arquivo. Tente novamente.');
            }
        }
    }
}

// Inicializar painel administrativo
const adminPanel = new AdminPanel();

// Tornar disponível globalmente para os event handlers inline
window.adminPanel = adminPanel;