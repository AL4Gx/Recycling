// إدارة شريط التقدم
class ProgressBar {
    constructor() {
        this.progressBar = document.querySelector('.progress-bar');
        this.init();
    }
    
    init() {
        if (this.progressBar) {
            window.addEventListener('scroll', () => this.updateProgress());
        }
    }
    
    updateProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        if (this.progressBar) {
            this.progressBar.style.width = scrolled + "%";
        }
    }
}

// تصدير الفئة لاستخدامها في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressBar;
}