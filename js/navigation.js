// إدارة التنقل وروابط الصفحات
class NavigationManager {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-links a');
        this.init();
    }
    
    init() {
        this.setActiveLink();
    }
    
    setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop();
        
        this.navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// تصدير الفئة لاستخدامها في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}