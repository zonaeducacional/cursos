import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

class CourseManager {
    constructor() {
        this.loadFeaturedCourses();
    }

    async loadFeaturedCourses() {
        try {
            const coursesRef = collection(db, 'courses');
            const q = query(
                coursesRef, 
                where('featured', '==', true),
                where('published', '==', true),
                orderBy('createdAt', 'desc'),
                limit(6)
            );
            
            const querySnapshot = await getDocs(q);
            const courses = [];
            
            querySnapshot.forEach((doc) => {
                courses.push({ id: doc.id, ...doc.data() });
            });

            this.renderCourses(courses);
        } catch (error) {
            console.error('Erro ao carregar cursos:', error);
            this.renderEmptyState();
        }
    }

    renderCourses(courses) {
        const container = document.getElementById('featuredCourses');
        
        if (courses.length === 0) {
            this.renderEmptyState();
            return;
        }

        container.innerHTML = courses.map(course => `
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
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${course.description}</p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-user mr-1"></i>
                        <span>${course.instructor || 'Instrutor'}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-clock mr-1"></i>
                        <span>${course.duration || '0h'}</span>
                    </div>
                </div>
                <div class="mt-3 flex items-center justify-between">
                    <span class="text-lg font-bold text-primary-600">
                        ${course.price ? `R$ ${course.price}` : 'Gratuito'}
                    </span>
                    <div class="flex items-center text-yellow-500">
                        <i class="fas fa-star"></i>
                        <span class="ml-1 text-sm">${course.rating || '5.0'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderEmptyState() {
        const container = document.getElementById('featuredCourses');
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-book-open text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">Nenhum curso encontrado</h3>
                <p class="text-gray-500">Os cursos em destaque aparecerão aqui em breve.</p>
            </div>
        `;
    }
}

// Função global para visualizar curso
window.viewCourse = function(courseId) {
    // Redirecionar para página do curso
    window.location.href = `/course.html?id=${courseId}`;
};

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new CourseManager();
});

// Navegação
document.getElementById('dashboardLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/dashboard/';
});

document.getElementById('adminLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/admin/';
});