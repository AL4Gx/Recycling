// theme.js - إدارة الوضع الليلي
class ThemeManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.setupThemeToggle();
    }
    
    loadTheme() {
        // تحميل الوضع المحفوظ أو استخدام الوضع الافتراضي
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        // تطبيق الوضع على body إذا كان موجوداً
        const body = document.body;
        if (body) {
            body.setAttribute('data-theme', theme);
            
            // تحديث زر التبديل إذا كان موجوداً
            const themeToggle = document.querySelector('.theme-toggle');
            if (themeToggle) {
                const icon = themeToggle.querySelector('i');
                if (icon) {
                    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            }
        }
        
        localStorage.setItem('theme', theme);
    }
    
    setupThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.body.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.body.setAttribute('data-theme', newTheme);
                
                // تحديث الأيقونة
                const icon = themeToggle.querySelector('i');
                if (icon) {
                    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
                
                localStorage.setItem('theme', newTheme);
            });
        }
    }
}