// js/dashboard.js - النظام الكامل مع الإصلاحات
class DashboardSystem {
    constructor() {
        this.user = null;
        this.notifications = [];
        this.activities = [];
        this.baseUrl = 'http://localhost/Recycling/api/';
        this.init();
    }
    
    async init() {
        console.log('🚀 بدء تحميل Dashboard...');
        await this.loadUserData();
        
        if (this.user && this.user.id) {
            console.log('✅ تم تحميل بيانات المستخدم:', this.user.username);
            await this.fetchUserData();
            this.updateUI();
            this.setupEventListeners();
            this.setupNotificationsDropdown();
            this.setupThemeToggle();
            this.setupAutoRefresh();
            this.showWelcome();
        } else {
            console.log('❌ لا يوجد مستخدم مسجل، إعادة التوجيه...');
            this.redirectToLogin();
        }
    }
    
    async loadUserData() {
        try {
            const userData = localStorage.getItem('user_data');
            const notificationsData = localStorage.getItem('notifications');
            const activitiesData = localStorage.getItem('activities');
            
            if (userData) {
                this.user = JSON.parse(userData);
                console.log('👤 تم تحميل بيانات المستخدم من localStorage:', {
                    username: this.user.username,
                    id: this.user.id,
                    points: this.user.points
                });
            } else {
                console.warn('⚠️ لا توجد بيانات مستخدم في localStorage');
            }
            
            if (notificationsData) {
                this.notifications = JSON.parse(notificationsData);
            }
            
            if (activitiesData) {
                this.activities = JSON.parse(activitiesData);
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل البيانات المحلية:', error);
        }
    }
    
    async fetchUserData() {
        try {
            if (!this.user || !this.user.id) {
                console.error('❌ لا يوجد معرف مستخدم');
                return;
            }
            
            console.log('🌐 جلب بيانات حديثة من الخادم...');
            
            // جلب بيانات الملف الشخصي
            const profileResponse = await fetch(`${this.baseUrl}get_profile.php?user_id=${this.user.id}`);
            
            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                console.log('📊 بيانات المستخدم من الخادم:', profileData);
                
                if (profileData.id) {
                    // تحديث بيانات المستخدم
                    this.user = { 
                        ...this.user, 
                        ...profileData,
                        points: parseInt(profileData.points) || 0
                    };
                    
                    localStorage.setItem('user_data', JSON.stringify(this.user));
                    localStorage.setItem('user_points', this.user.points.toString());
                    
                    console.log('✅ تم تحديث البيانات من الخادم:', {
                        username: this.user.username,
                        points: this.user.points
                    });
                }
            } else {
                console.warn('⚠️ لا يمكن الاتصال بالخادم، استخدام البيانات المحلية');
            }
        } catch (error) {
            console.error('❌ خطأ في جلب البيانات:', error);
        }
    }
    
    async fetchUserPoints() {
        try {
            if (!this.user || !this.user.id) {
                console.error('❌ لا يوجد معرف مستخدم');
                return;
            }
            
            const response = await fetch(`${this.baseUrl}get_points.php?user_id=${this.user.id}`);
            
            if (response.ok) {
                const pointsData = await response.json();
                console.log('💰 بيانات النقاط من الخادم:', pointsData);
                
                if (pointsData.success && pointsData.points !== undefined) {
                    const newPoints = parseInt(pointsData.points) || 0;
                    const oldPoints = this.user.points || 0;
                    
                    if (newPoints !== oldPoints) {
                        console.log(`🔄 تحديث النقاط: ${oldPoints} → ${newPoints}`);
                        this.user.points = newPoints;
                        
                        // تحديث localStorage
                        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
                        userData.points = this.user.points;
                        localStorage.setItem('user_data', JSON.stringify(userData));
                        localStorage.setItem('user_points', this.user.points.toString());
                        
                        // تحديث الواجهة فوراً
                        this.updatePoints();
                        
                        // إشعار إذا زادت النقاط
                        if (newPoints > oldPoints) {
                            this.showToast(`🎉 حصلت على ${newPoints - oldPoints} نقطة جديدة!`, 'success');
                        }
                    }
                }
            } else {
                console.warn('⚠️ فشل في جلب النقاط من الخادم');
            }
        } catch (error) {
            console.error('❌ خطأ في جلب النقاط:', error);
        }
    }
    
    updateUI() {
        if (!this.user) {
            console.error('❌ لا توجد بيانات مستخدم لتحديث الواجهة');
            return;
        }
        
        console.log('🎨 تحديث واجهة المستخدم...');
        this.updatePoints();
        this.updateElement('.user-name, .profile-name', this.user.full_name);
        this.updateElement('.user-email', this.user.email || '');
        
        if (this.user.login_streak > 0) {
            this.updateElement('.login-streak', `${this.user.login_streak} يوم متتالي`);
        }
        
        this.updateNotifications();
        this.updateActivities();
        this.addDailyPointsBar();
        this.updateNotificationCounter();
    }
    
    updatePoints() {
        if (!this.user) return;
        
        const points = this.user.points || 0;
        console.log(`🔢 تحديث عرض النقاط: ${points}`);
        
        const pointsElements = document.querySelectorAll('.points, #points, .user-points, .points-counter, .points-value');
        
        pointsElements.forEach(element => {
            // عرض النقاط بخط إنجليزي
            const formattedPoints = points.toLocaleString('en-US');
            const oldValue = element.textContent;
            
            if (oldValue !== formattedPoints) {
                element.textContent = formattedPoints;
                console.log(`✅ تحديث عنصر ${element.className}: ${oldValue} → ${formattedPoints}`);
                
                // إضافة تأثير إذا تغيرت النقاط
                if (element.dataset.oldPoints && parseInt(element.dataset.oldPoints) !== points) {
                    element.classList.add('points-updated');
                    setTimeout(() => element.classList.remove('points-updated'), 1000);
                }
            }
            
            element.dataset.oldPoints = points;
        });
        
        localStorage.setItem('user_points', points.toString());
    }
    
    updateElement(selector, value) {
        document.querySelectorAll(selector).forEach(el => {
            if (el.textContent !== value) {
                el.textContent = value;
            }
        });
    }
    
    updateNotifications() {
        const notificationsContainer = document.querySelector('.notifications-list, #notifications-list');
        if (!notificationsContainer) return;
        
        notificationsContainer.innerHTML = '';
        
        if (this.notifications.length === 0) {
            notificationsContainer.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>لا توجد إشعارات جديدة</p>
                </div>
            `;
            return;
        }
        
        this.notifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.className = `notification-item ${notification.type} ${notification.is_read ? 'read' : 'unread'}`;
            
            const icon = {
                'success': 'fa-check-circle',
                'error': 'fa-times-circle',
                'warning': 'fa-exclamation-triangle',
                'info': 'fa-info-circle'
            }[notification.type] || 'fa-info-circle';
            
            notificationElement.innerHTML = `
                <div class="notification-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <small>${this.formatDate(notification.created_at)}</small>
                </div>
                ${!notification.is_read ? '<span class="notification-badge"></span>' : ''}
            `;
            
            notificationsContainer.appendChild(notificationElement);
        });
    }
    
    updateActivities() {
        const activitiesContainer = document.querySelector('.activity-list, #activity-list');
        if (!activitiesContainer || !this.activities) return;
        
        activitiesContainer.innerHTML = '';
        
        this.activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            
            const pointsClass = activity.points_change > 0 ? 'positive' : 'negative';
            const pointsSign = activity.points_change > 0 ? '+' : '';
            
            activityElement.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-history"></i>
                </div>
                <div class="activity-details">
                    <h4>${activity.description}</h4>
                    <small>${this.formatDate(activity.created_at)}</small>
                </div>
                <div class="activity-points ${pointsClass}">
                    ${pointsSign}${activity.points_change} <i class="fas fa-coins"></i>
                </div>
            `;
            
            activitiesContainer.appendChild(activityElement);
        });
    }
    
    addDailyPointsBar() {
        const oldBar = document.querySelector('.daily-points-bar');
        if (oldBar) oldBar.remove();
        
        const today = new Date().toISOString().split('T')[0];
        const lastPointsDate = this.user.daily_points_date;
        
        const pointsBar = document.createElement('div');
        pointsBar.className = 'daily-points-bar';
        
        if (!lastPointsDate || lastPointsDate < today) {
            pointsBar.classList.add('available');
            pointsBar.innerHTML = `
                <div class="points-bar-content">
                    <i class="fas fa-gift"></i>
                    <span>🎁 النقاط اليومية متاحة! سجل الدخول غداً للحصول على نقاط إضافية</span>
                </div>
            `;
        } else {
            pointsBar.classList.add('claimed');
            pointsBar.innerHTML = `
                <div class="points-bar-content">
                    <i class="fas fa-check-circle"></i>
                    <span>✅ حصلت على النقاط اليومية! عد غداً للمزيد</span>
                </div>
            `;
        }
        
        document.body.insertBefore(pointsBar, document.body.firstChild);
        this.addPointsBarStyles();
    }
    
    setupEventListeners() {
        // تحديث النقاط عند النقر
        document.querySelectorAll('.points, #points').forEach(el => {
            el.addEventListener('click', () => this.showPointsDetails());
        });
        
        // زر تحديث البيانات
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await this.fetchUserData();
                await this.fetchUserPoints();
                this.updateUI();
                this.showToast('تم تحديث البيانات', 'success');
            });
        }
        
        // زر إضافة نقاط
        const addPointsBtn = document.getElementById('add-points-btn');
        if (addPointsBtn) {
            addPointsBtn.addEventListener('click', () => this.addRandomPoints());
        }
        
        // إضافة النقر على أيقونة النقاط
        const pointsIcon = document.querySelector('.points-icon');
        if (pointsIcon) {
            pointsIcon.addEventListener('click', () => this.showPointsDetails());
        }
        
        // تحديث النقاط عند فتح الصفحة
        window.addEventListener('focus', () => {
            this.fetchUserPoints();
        });
    }
    
    setupNotificationsDropdown() {
        const notificationsBtn = document.querySelector('.notifications-btn');
        const markAllReadBtn = document.querySelector('.mark-all-read');
        const viewAllBtn = document.querySelector('.view-all');
        
        // زر الإشعارات
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const menu = document.querySelector('.notifications-menu');
                if (!menu) {
                    console.error('❌ قائمة الإشعارات غير موجودة');
                    return;
                }
                
                // تبديل العرض
                if (menu.style.display === 'block') {
                    menu.style.display = 'none';
                    menu.classList.remove('active');
                } else {
                    menu.style.display = 'block';
                    menu.classList.add('active');
                    
                    // إضافة بعض الإشعارات التجريبية إذا كانت فارغة
                    this.addSampleNotifications();
                }
            });
            
            // إغلاق القائمة عند النقر خارجها
            document.addEventListener('click', (e) => {
                const menu = document.querySelector('.notifications-menu');
                if (menu && !menu.contains(e.target) && !notificationsBtn.contains(e.target)) {
                    menu.style.display = 'none';
                    menu.classList.remove('active');
                }
            });
            
            // منع إغلاق القائمة عند النقر داخلها
            const menu = document.querySelector('.notifications-menu');
            if (menu) {
                menu.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        } else {
            console.error('❌ زر الإشعارات غير موجود في الصفحة');
        }
        
        // تحديد الكل كمقروء
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.markAllNotificationsAsRead();
            });
        }
        
        // تحديد الإشعار كمقروء عند النقر عليه
        document.addEventListener('click', (e) => {
            const notificationItem = e.target.closest('.notification-item');
            if (notificationItem) {
                this.markNotificationAsRead(notificationItem);
            }
        });
        
        // عرض جميع الإشعارات
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAllNotifications();
            });
        }
    }
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        // تحميل الوضع المحفوظ
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
        
        // إضافة مستمع الحدث
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }
    
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // تغيير الوضع
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // تحديث الأيقونة
        this.updateThemeIcon(newTheme);
        
        // إظهار رسالة
        this.showToast(`تم التبديل إلى الوضع ${newTheme === 'dark' ? 'الليلي' : 'النهاري'}`, 'success');
    }
    
    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        const moonIcon = themeToggle.querySelector('.fa-moon');
        const sunIcon = themeToggle.querySelector('.fa-sun');
        
        if (theme === 'dark') {
            if (moonIcon) moonIcon.style.display = 'none';
            if (sunIcon) sunIcon.style.display = 'inline-block';
        } else {
            if (moonIcon) moonIcon.style.display = 'inline-block';
            if (sunIcon) sunIcon.style.display = 'none';
        }
    }
    
    setupAutoRefresh() {
        // تحديث النقاط كل 30 ثانية
        setInterval(async () => {
            if (this.user && this.user.id) {
                await this.fetchUserPoints();
            }
        }, 30000);
        
        // تحديث عند إعادة التركيز على الصفحة
        window.addEventListener('focus', () => {
            this.fetchUserPoints();
        });
    }
    
    addSampleNotifications() {
        const notificationsList = document.querySelector('.notifications-list');
        if (!notificationsList || notificationsList.children.length > 0) {
            return;
        }
        
        const sampleNotifications = [
            {
                title: 'مرحباً بك!',
                message: 'تم تسجيل دخولك بنجاح إلى نظام إعادة التدوير',
                type: 'success',
                time: 'الآن'
            },
            {
                title: 'حصلت على نقاط جديدة',
                message: 'لقد ربحت 50 نقطة لإعادة تدوير المواد البلاستيكية',
                type: 'info',
                time: 'منذ 5 دقائق'
            },
            {
                title: 'هدف أسبوعي',
                message: 'أنت على بعد 100 نقطة من تحقيق هدفك الأسبوعي',
                type: 'warning',
                time: 'منذ ساعة'
            }
        ];
        
        notificationsList.innerHTML = '';
        
        sampleNotifications.forEach((notification, index) => {
            const notificationElement = document.createElement('div');
            notificationElement.className = `notification-item unread ${notification.type}`;
            notificationElement.dataset.id = index;
            
            const icon = {
                'success': 'fa-check-circle',
                'info': 'fa-info-circle',
                'warning': 'fa-exclamation-circle'
            }[notification.type] || 'fa-info-circle';
            
            notificationElement.innerHTML = `
                <div class="notification-icon ${notification.type}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <small>${notification.time}</small>
                </div>
                <span class="notification-badge"></span>
            `;
            
            notificationsList.appendChild(notificationElement);
        });
        
        // تحديث العداد
        this.updateNotificationCounter();
    }
    
    updateNotificationCounter() {
        const notificationCount = document.querySelector('.notification-count');
        if (!notificationCount) return;
        
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        notificationCount.textContent = unreadCount;
        
        if (unreadCount > 0) {
            notificationCount.style.display = 'block';
        } else {
            notificationCount.style.display = 'none';
        }
    }
    
    markNotificationAsRead(item) {
        if (item.classList.contains('unread')) {
            item.classList.remove('unread');
            item.classList.add('read');
            
            // إزالة البادج
            const badge = item.querySelector('.notification-badge');
            if (badge) {
                badge.style.display = 'none';
            }
            
            // تحديث العداد
            this.updateNotificationCounter();
            
            this.showToast('تم تحديد الإشعار كمقروء', 'info');
        }
    }
    
    markAllNotificationsAsRead() {
        const notificationItems = document.querySelectorAll('.notification-item.unread');
        
        notificationItems.forEach(item => {
            item.classList.remove('unread');
            item.classList.add('read');
            
            const badge = item.querySelector('.notification-badge');
            if (badge) {
                badge.style.display = 'none';
            }
        });
        
        // تحديث العداد
        this.updateNotificationCounter();
        
        this.showToast('تم تحديد جميع الإشعارات كمقروء', 'success');
    }
    
    showAllNotifications() {
        this.showToast('عرض جميع الإشعارات', 'info');
    }
    
    async addRandomPoints() {
        try {
            if (!this.user || !this.user.id) {
                this.showToast('يجب تسجيل الدخول أولاً', 'error');
                return;
            }
            
            const randomPoints = Math.floor(Math.random() * 50) + 10;
            const newPoints = (this.user.points || 0) + randomPoints;
            
            const response = await fetch(`${this.baseUrl}update_points.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: this.user.id, points: newPoints })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.user.points = newPoints;
                localStorage.setItem('user_data', JSON.stringify(this.user));
                localStorage.setItem('user_points', newPoints.toString());
                
                this.updatePoints();
                this.showToast(`تم إضافة ${randomPoints} نقطة!`, 'success');
                
                // إضافة نشاط محلي
                this.addActivity(`كسب ${randomPoints} نقطة`, randomPoints);
                
                // إضافة إشعار جديد
                this.addSampleNotifications();
            } else {
                this.showToast(data.message || 'فشل في إضافة النقاط', 'error');
            }
        } catch (error) {
            console.error('Error adding points:', error);
            this.showToast('خطأ في الاتصال بالخادم', 'error');
        }
    }
    
    addActivity(description, pointsChange) {
        const newActivity = {
            description,
            points_change: pointsChange,
            created_at: new Date().toISOString()
        };
        
        if (!this.activities) this.activities = [];
        this.activities.unshift(newActivity);
        
        if (this.activities.length > 10) {
            this.activities.pop();
        }
        
        localStorage.setItem('activities', JSON.stringify(this.activities));
        this.updateActivities();
    }
    
    showPointsDetails() {
        const modal = document.createElement('div');
        modal.className = 'points-modal';
        
        const streakBonus = this.user.login_streak > 1 ? Math.min(this.user.login_streak * 2, 50) : 0;
        
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <h3><i class="fas fa-coins"></i> إحصائيات النقاط</h3>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #4CAF50;">
                            <i class="fas fa-wallet"></i>
                        </div>
                        <div class="stat-info">
                            <h4>النقاط الحالية</h4>
                            <p class="stat-value">${(this.user.points || 0).toLocaleString('en-US')}</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #2196F3;">
                            <i class="fas fa-fire"></i>
                        </div>
                        <div class="stat-info">
                            <h4>الأيام المتتالية</h4>
                            <p class="stat-value">${this.user.login_streak || 0}</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #FF9800;">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <div class="stat-info">
                            <h4>إجمالي النقاط</h4>
                            <p class="stat-value">${(this.user.total_points_earned || this.user.points || 0).toLocaleString('en-US')}</p>
                        </div>
                    </div>
                </div>
                
                <div class="daily-points-info">
                    <h4><i class="fas fa-calendar-day"></i> النقاط اليومية</h4>
                    <p>🎯 10 نقاط أساسية</p>
                    ${streakBonus > 0 ? `<p>🔥 +${streakBonus} نقاط مكافأة متتالية</p>` : ''}
                    <p>🎲 +0-20 نقطة عشوائية</p>
                </div>
                
                <button class="btn-close" onclick="this.parentElement.parentElement.remove()">إغلاق</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.addModalStyles();
    }
    
    showWelcome() {
        setTimeout(() => {
            if (this.user) {
                const welcomeMsg = `${this.user.full_name}، لديك ${(this.user.points || 0).toLocaleString('en-US')} نقطة!`;
                this.showToast(welcomeMsg, 'success');
            }
        }, 1000);
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `dashboard-toast ${type}`;
        
        const icon = {
            'success': 'fa-check-circle',
            'error': 'fa-times-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        }[type] || 'fa-info-circle';
        
        toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 3000);
    }
    
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit',
                day: 'numeric',
                month: 'short'
            });
        } catch (error) {
            return 'قريباً';
        }
    }
    
    redirectToLogin() {
        console.log('⚠️ لم يسجل الدخول، إعادة التوجيه إلى index.html');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
    
    addPointsBarStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .daily-points-bar {
                padding: 12px 20px;
                text-align: center;
                font-family: 'Cairo', sans-serif;
                animation: slideDown 0.5s ease;
                position: relative;
                z-index: 1000;
            }
            
            .daily-points-bar.available {
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                color: white;
            }
            
            .daily-points-bar.claimed {
                background: linear-gradient(90deg, #2196F3, #03A9F4);
                color: white;
            }
            
            .points-bar-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                font-size: 16px;
                font-weight: 600;
            }
            
            @keyframes slideDown {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .points-updated {
                animation: pulse 0.5s ease;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    addModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .points-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-overlay {
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
            }
            
            .modal-content {
                background: var(--card-bg);
                border-radius: 15px;
                padding: 25px;
                width: 90%;
                max-width: 500px;
                z-index: 10000;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: modalAppear 0.3s ease;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }
            
            .stat-card {
                background: var(--hover-color);
                border-radius: 10px;
                padding: 15px;
                text-align: center;
            }
            
            .stat-icon {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 10px;
                color: white;
                font-size: 24px;
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: bold;
                margin: 5px 0;
                font-family: 'Roboto', sans-serif;
                color: var(--text-color);
            }
            
            .btn-close {
                width: 100%;
                padding: 12px;
                background: var(--secondary-color);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                margin-top: 20px;
                font-family: 'Cairo', sans-serif;
                transition: background-color 0.3s;
            }
            
            .btn-close:hover {
                background: var(--primary-color);
            }
            
            @keyframes modalAppear {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 صفحة Dashboard جاهزة للتحميل');
    const dashboard = new DashboardSystem();
    window.dashboard = dashboard;
});