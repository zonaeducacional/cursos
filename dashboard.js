import { auth, db } from '../assets/js/firebase-config.js';
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc,
    query, 
    where, 
    orderBy,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

class StudentDashboard {
    constructor() {
        this.currentUser = null;
        this.userProgress = {};
        this.enrollments = [];
        this.initializeAuth();
    }

    initializeAuth() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                this.updateUserUI(user);
                await this.loadUserData();
                await this.loadDashboardData();
            } else {
                window.location.href = '/';
            }
        });
    }

    updateUserUI(user) {
        document.getElementById('userName').textContent = user.displayName;
        document.getElementById('userAvatar').src = user.photoURL;
    }

    async loadUserData() {
        try {
            // Carregar progresso do usuário
            const progressDoc = await getDoc(doc(db, 'progress', this.currentUser.uid));
            if (progressDoc.exists()) {
                this.userProgress = progressDoc.data();
            }

            // Carregar matrículas
            const enrollmentsQuery = query(
                collection(db, 'enrollments'),
                where('userId', '==', this.currentUser.uid),
                orderBy('enrolledAt', 'desc')
            );
            
            const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
            this.enrollments = [];
            enrollmentsSnapshot.forEach(doc => {
                this.enrollments.push({ id: doc.id, ...doc.data() });
            });
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }

    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadStats(),
                this.loadCoursesInProgress(),
                this.loadRecentAchievements(),
                this.loadUpcomingLessons(),
                this.loadAllCourses()
            ]);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
    }

    async loadStats() {
        const enrolledCount = this.enrollments.length;
        const completedCount = this.enrollments.filter(e => e.progress === 100).length;
        const totalHours = this.calculateTotalStudyHours();

        document.getElementById('enrolledCourses').textContent = enrolledCount;
        document.getElementById('completedCourses').textContent = completedCount;
        document.getElementById('studyHours').textContent = `${totalHours}h`;
    }

    calculateTotalStudyHours() {
        // Simular cálculo de horas estudadas
        return this.enrollments.reduce((total, enrollment) => {
            return total + (enrollment.timeSpent || 0);
        }, 0);
    }

    async loadCoursesInProgress() {
        const inProgressEnrollments = this.enrollments.filter(e => 
            e.progress > 0 && e.progress < 100
        );

        const container = document.getElementById('coursesInProgress');
        
        if (inProgressEnrollments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-book-open text-3xl mb-3"></i>
                    <p>Nenhum curso em progresso</p>
                    <a href="/" class="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                        Explorar cursos disponíveis
                    </a>
                </div>
            `;
            return;
        }

        const coursesData = await Promise.all(
            inProgressEnrollments.map(async (enrollment) => {
                const courseDoc = await getDoc(doc(db, 'courses', enrollment.courseId));
                return { 
                    enrollment, 
                    course: courseDoc.exists() ? { id: courseDoc.id, ...courseDoc.data() } : null 
                };
            })
        );

        container.innerHTML = coursesData
            .filter(item => item.course)
            .map(({ enrollment, course }) => `
                <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                     onclick="continueCourse('${course.id}')">
                    <div class="flex-shrink-0">
                        <div class="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-play text-primary-600 text-xl"></i>
                        </div>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900">${course.title}</h3>
                        <p class="text-sm text-gray-600 mb-2">${course.category || 'Categoria'}</p>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" 
                                 style="width: ${enrollment.progress || 0}%"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">${enrollment.progress || 0}% concluído</p>
                    </div>
                    <div class="flex-shrink-0">
                        <i class="fas fa-chevron-right text-gray-400"></i>
                    </div>
                </div>
            `).join('');
    }

    async loadRecentAchievements() {
        // Simular conquistas recentes
        const achievements = [
            { icon: 'trophy', title: 'Primeira Aula', description: 'Completou sua primeira aula' },
            { icon: 'fire', title: 'Sequência de 3 dias', description: 'Estudou por 3 dias seguidos' },
            { icon: 'star', title: 'Avaliação 5 estrelas', description: 'Recebeu nota máxima em um quiz' }
        ];

        const container = document.getElementById('recentAchievements');
        
        if (achievements.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <i class="fas fa-medal text-2xl mb-2"></i>
                    <p class="text-sm">Nenhuma conquista ainda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = achievements.map(achievement => `
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-${achievement.icon} text-yellow-600 text-sm"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">${achievement.title}</p>
                    <p class="text-xs text-gray-500">${achievement.description}</p>
                </div>
            </div>
        `).join('');
    }

    async loadUpcomingLessons() {
        // Simular próximas aulas
        const lessons = [
            { title: 'Introdução ao JavaScript', course: 'Programação Web', time: '14:00' },
            { title: 'Cores e Tipografia', course: 'Design Gráfico', time: '16:30' }
        ];

        const container = document.getElementById('upcomingLessons');
        
        if (lessons.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <i class="fas fa-calendar text-2xl mb-2"></i>
                    <p class="text-sm">Nenhuma aula agendada</p>
                </div>
            `;
            return;
        }

        container.innerHTML = lessons.map(lesson => `
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-clock text-blue-600 text-sm"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">${lesson.title}</p>
                    <p class="text-xs text-gray-500">${lesson.course} • ${lesson.time}</p>
                </div>
            </div>
        `).join('');
    }

    async loadAllCourses() {
        const container = document.getElementById('allCourses');
        
        if (this.enrollments.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-graduation-cap text-4xl text-gray-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">Nenhum curso matriculado</h3>
                    <p class="text-gray-500 mb-4">Comece sua jornada de aprendizado hoje!</p>
                    <a href="/" class="btn-primary">Explorar Cursos</a>
                </div>
            `;
            return;
        }

        const coursesData = await Promise.all(
            this.enrollments.map(async (enrollment) => {
                const courseDoc = await getDoc(doc(db, 'courses', enrollment.courseId));
                return { 
                    enrollment, 
                    course: courseDoc.exists() ? { id: courseDoc.id, ...courseDoc.data() } : null 
                };
            })
        );

        container.innerHTML = coursesData
            .filter(item => item.course)
            .map(({ enrollment, course }) => `
                <div class="card hover:shadow-lg transition-shadow cursor-pointer" onclick="viewCourse('${course.id}')">
                    <div class="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                        ${course.thumbnail ? 
                            `<img src="${course.thumbnail}" alt="${course.title}" class="w-full h-full object-cover">` :
                            `<div class="w-full h-full flex items-center justify-center text-gray-400">
                                <i class="fas fa-play-circle text-4xl"></i>
                            </div>`
                        }
                    </div>
                    <h4 class="font-semibold text-lg mb-2">${course.title}</h4>
                    <p class="text-gray-600 text-sm mb-3">${course.description}</p>
                    
                    <!-- Progress Bar -->
                    <div class="mb-3">
                        <div class="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progresso</span>
                            <span>${enrollment.progress || 0}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" 
                                 style="width: ${enrollment.progress || 0}%"></div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-500">
                            <i class="fas fa-clock mr-1"></i>
                            ${course.duration || '0h'}
                        </span>
                        <div class="flex items-center text-yellow-500">
                            <i class="fas fa-star"></i>
                            <span class="ml-1 text-sm">${course.rating || '5.0'}</span>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        ${enrollment.progress === 100 ? 
                            '<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><i class="fas fa-check mr-1"></i>Concluído</span>' :
                            enrollment.progress > 0 ? 
                                '<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><i class="fas fa-play mr-1"></i>Em progresso</span>' :
                                '<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><i class="fas fa-bookmark mr-1"></i>Não iniciado</span>'
                        }
                    </div>
                </div>
            `).join('');
    }

    filterCourses(filter) {
        // Implementar filtro de cursos
        console.log('Filtrar cursos:', filter);
        this.loadAllCourses();
    }
}

// Funções globais
window.continueCourse = function(courseId) {
    window.location.href = `/course.html?id=${courseId}`;
};

window.viewCourse = function(courseId) {
    window.location.href = `/course.html?id=${courseId}`;
};

// Inicializar dashboard
const dashboard = new StudentDashboard();

// Event listeners
document.getElementById('courseFilter')?.addEventListener('change', (e) => {
    dashboard.filterCourses(e.target.value);
});

// Menu dropdown
document.getElementById('userMenuBtn').addEventListener('click', () => {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('userMenu');
    const dropdown = document.getElementById('userDropdown');
    
    if (!userMenu.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

export { dashboard };