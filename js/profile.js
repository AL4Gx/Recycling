// js/profile.js - النسخة الكاملة مع إصلاح النقاط
class ProfilePage {
    constructor() {
        this.baseUrl = 'http://localhost/Recycling/api/';
        this.currentUserId = localStorage.getItem('current_user_id');
        this.user = null;
        this.init();
    }
    
    async init() {
        console.log('🚀 بدء تحميل صفحة الملف الشخصي...');
        this.checkAuth();
        this.setupThemeToggle();
        await this.loadUserData();
        this.setupEventListeners();
        this.setupDarkModeToggle();
        this.setupNotificationsToggle();
        this.setupTwoFactorToggle();
    }
    
    checkAuth() {
        if (!this.currentUserId) {
            console.log('❌ لا يوجد مستخدم مسجل');
            this.showToast('يجب تسجيل الدخول أولاً', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            console.log('✅ تم العثور على معرف المستخدم:', this.currentUserId);
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
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
        
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
    
    async loadUserData() {
        try {
            console.log(`🌐 جلب بيانات المستخدم: ${this.baseUrl}get_profile.php?user_id=${this.currentUserId}`);
            
            const response = await fetch(`${this.baseUrl}get_profile.php?user_id=${this.currentUserId}`);
            
            if (!response.ok) {
                throw new Error(`خطأ HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 بيانات المستخدم من الخادم:', data);
            
            if (data && data.id) {
                this.user = data;
                
                // 🔥 **إصلاح النقاط: جلب النقاط من API منفصل** 🔥
                await this.loadUserPoints();
                
                // تحديث عرض البيانات
                this.updateProfileDisplay();
                
                // تحديث حقول التعديل
                this.updateEditFields();
                
                // حفظ البيانات محلياً
                localStorage.setItem('user_data', JSON.stringify(this.user));
                
                console.log('✅ تم تحميل بيانات المستخدم بنجاح');
            } else {
                console.error('❌ بيانات المستخدم غير صحيحة:', data);
                this.showToast('فشل في تحميل البيانات', 'error');
                this.loadLocalData();
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل بيانات المستخدم:', error);
            this.showToast('خطأ في الاتصال بالخادم', 'error');
            this.loadLocalData();
        }
    }
    
    async loadUserPoints() {
        try {
            console.log(`💰 جلب النقاط: ${this.baseUrl}get_points.php?user_id=${this.currentUserId}`);
            
            const response = await fetch(`${this.baseUrl}get_points.php?user_id=${this.currentUserId}`);
            
            if (response.ok) {
                const pointsData = await response.json();
                console.log('💎 بيانات النقاط:', pointsData);
                
                if (pointsData.success && pointsData.points !== undefined) {
                    // تحديث النقاط في بيانات المستخدم
                    this.user.points = parseInt(pointsData.points) || 0;
                    console.log(`✅ نقاط المستخدم: ${this.user.points}`);
                } else {
                    console.warn('⚠️ بيانات النقاط غير صحيحة:', pointsData);
                    this.user.points = this.user.points || 0;
                }
            } else {
                console.warn('⚠️ فشل في جلب النقاط، استخدام القيمة المحلية');
                this.user.points = this.user.points || 0;
            }
        } catch (error) {
            console.error('❌ خطأ في جلب النقاط:', error);
            this.user.points = this.user.points || 0;
        }
    }
    
    updateProfileDisplay() {
        if (!this.user) return;
        
        console.log('🎨 تحديث عرض الملف الشخصي...');
        
        // البيانات الأساسية
        const nameElement = document.getElementById('profile-name');
        const usernameElement = document.getElementById('profile-username');
        const emailElement = document.getElementById('profile-email');
        const phoneElement = document.getElementById('profile-phone');
        
        if (nameElement) nameElement.textContent = this.user.full_name || 'المستخدم';
        if (usernameElement) usernameElement.textContent = '@' + (this.user.username || 'username');
        if (emailElement) emailElement.textContent = this.user.email || 'لا يوجد';
        if (phoneElement) phoneElement.textContent = this.user.phone || 'لا يوجد';
        
        // 🔥 **تحديث النقاط بخط إنجليزي** 🔥
        this.updatePointsDisplay();
        
        // تاريخ الانضمام
        if (this.user.created_at) {
            const joinDate = new Date(this.user.created_at).toLocaleDateString('ar-EG');
            const joinDateElement = document.getElementById('join-date');
            if (joinDateElement) joinDateElement.textContent = joinDate;
        }
        
        console.log('✅ تم تحديث عرض الملف الشخصي');
    }
    
    updatePointsDisplay() {
        if (!this.user) return;
        
        const points = this.user.points || 0;
        console.log(`🔢 تحديث عرض النقاط في الملف الشخصي: ${points}`);
        
        // تحديث العنصر الرئيسي للنقاط
        const pointsElement = document.getElementById('profilePoints');
        if (pointsElement) {
            // عرض النقاط بخط إنجليزي مع فاصلة
            const formattedPoints = points.toLocaleString('en-US');
            pointsElement.textContent = formattedPoints;
            console.log(`✅ تحديث profilePoints: ${formattedPoints}`);
        }
        
        // تحديث أي عناصر أخرى للنقاط في الصفحة
        const otherPointsElements = document.querySelectorAll('.user-points, .points-counter, .points-value');
        otherPointsElements.forEach(element => {
            element.textContent = points.toLocaleString('en-US');
        });
        
        // تحديث localStorage
        localStorage.setItem('user_points', points.toString());
    }
    
    updateEditFields() {
        if (!this.user) return;
        
        document.getElementById('edit-fullname').value = this.user.full_name || '';
        document.getElementById('edit-username').value = this.user.username || '';
        document.getElementById('edit-email').value = this.user.email || '';
        document.getElementById('edit-phone').value = this.user.phone || '';
    }
    
    loadLocalData() {
        try {
            const localData = JSON.parse(localStorage.getItem('user_data') || '{}');
            if (localData.full_name) {
                this.user = localData;
                this.updateProfileDisplay();
                this.updateEditFields();
                console.log('📂 تم تحميل البيانات المحلية:', localData);
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل البيانات المحلية:', error);
        }
    }
    
    loadSettings() {
        // إعدادات الإشعارات
        const notificationsEnabled = localStorage.getItem('notifications');
        const notificationsToggle = document.getElementById('notifications-toggle');
        if (notificationsToggle && notificationsEnabled !== null) {
            notificationsToggle.checked = notificationsEnabled === 'true';
        }
        
        // إعدادات المصادقة الثنائية
        const twoFactorEnabled = localStorage.getItem('twoFactor');
        const twoFactorToggle = document.getElementById('twofactor-toggle');
        if (twoFactorToggle && twoFactorEnabled !== null) {
            twoFactorToggle.checked = twoFactorEnabled === 'true';
        }
        
        // إعدادات الوضع الداكن
        const savedTheme = localStorage.getItem('theme') || 'light';
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = savedTheme === 'dark';
        }
    }
    
    setupEventListeners() {
        // حفظ التغييرات
        const saveBtn = document.getElementById('save-profile');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfile());
        }
        
        // تغيير كلمة المرور
        const changePassBtn = document.getElementById('change-password');
        if (changePassBtn) {
            changePassBtn.addEventListener('click', () => this.changePassword());
        }
        
        // تصدير البيانات
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        // حذف الحساب
        const deleteBtn = document.getElementById('delete-account');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteAccount());
        }
        
        // تسجيل الخروج
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // تحديث النقاط عند فتح الصفحة
        window.addEventListener('focus', async () => {
            await this.loadUserPoints();
            this.updatePointsDisplay();
        });
    }
    
    setupDarkModeToggle() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', () => {
                const newTheme = darkModeToggle.checked ? 'dark' : 'light';
                document.body.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                this.showToast(`تم التبديل إلى الوضع ${newTheme === 'dark' ? 'الليلي' : 'النهاري'}`, 'success');
            });
        }
    }
    
    setupNotificationsToggle() {
        const notificationsToggle = document.getElementById('notifications-toggle');
        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', () => {
                localStorage.setItem('notifications', notificationsToggle.checked);
                this.showToast(`تم ${notificationsToggle.checked ? 'تفعيل' : 'تعطيل'} الإشعارات`, 'success');
            });
        }
    }
    
    setupTwoFactorToggle() {
        const twoFactorToggle = document.getElementById('twofactor-toggle');
        if (twoFactorToggle) {
            twoFactorToggle.addEventListener('change', () => {
                if (twoFactorToggle.checked) {
                    const phone = prompt('أدخل رقم الهاتف لتلقي رمز التحقق:');
                    if (phone) {
                        localStorage.setItem('twoFactor', 'true');
                        localStorage.setItem('twoFactorPhone', phone);
                        this.showToast('تم تفعيل المصادقة الثنائية', 'success');
                    } else {
                        twoFactorToggle.checked = false;
                    }
                } else {
                    localStorage.setItem('twoFactor', 'false');
                    this.showToast('تم تعطيل المصادقة الثنائية', 'info');
                }
            });
        }
    }
    
    async saveProfile() {
        const full_name = document.getElementById('edit-fullname').value.trim();
        const username = document.getElementById('edit-username').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        const phone = document.getElementById('edit-phone').value.trim();
        
        // التحقق من البيانات
        if (!full_name) {
            this.showToast('يرجى إدخال الاسم الكامل', 'error');
            return;
        }
        
        if (!username) {
            this.showToast('يرجى إدخال اسم المستخدم', 'error');
            return;
        }
        
        if (email && !this.isValidEmail(email)) {
            this.showToast('يرجى إدخال بريد إلكتروني صحيح', 'error');
            return;
        }
        
        if (!this.currentUserId) {
            this.showToast('يجب تسجيل الدخول أولاً', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${this.baseUrl}update_profile.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: this.currentUserId,
                    full_name: full_name,
                    username: username,
                    email: email,
                    phone: phone
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // تحديث البيانات المحلية
                const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
                userData.full_name = full_name;
                userData.username = username;
                userData.email = email;
                userData.phone = phone;
                localStorage.setItem('user_data', JSON.stringify(userData));
                
                this.showToast('تم حفظ التغييرات بنجاح', 'success');
                
                // تحديث العرض
                await this.loadUserData();
            } else {
                this.showToast(data.message || 'فشل في حفظ التغييرات', 'error');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showToast('خطأ في الاتصال بالخادم', 'error');
        }
    }
    
    async changePassword() {
        const currentPassword = prompt('أدخل كلمة المرور الحالية:');
        if (!currentPassword) return;
        
        const newPassword = prompt('أدخل كلمة المرور الجديدة:');
        if (!newPassword) return;
        
        const confirmPassword = prompt('أكد كلمة المرور الجديدة:');
        if (newPassword !== confirmPassword) {
            alert('كلمات المرور غير متطابقة');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }
        
        if (!this.currentUserId) {
            this.showToast('يجب تسجيل الدخول أولاً', 'error');
            return;
        }
        
        try {
            // التحقق من كلمة المرور الحالية أولاً
            const verifyResponse = await fetch(`${this.baseUrl}login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: this.user.username, 
                    password: currentPassword 
                })
            });
            
            const verifyData = await verifyResponse.json();
            
            if (!verifyResponse.ok || !verifyData.success) {
                this.showToast('كلمة المرور الحالية غير صحيحة', 'error');
                return;
            }
            
            // تحديث كلمة المرور
            const updateResponse = await fetch(`${this.baseUrl}update_profile.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: this.currentUserId,
                    password: newPassword
                })
            });
            
            const data = await updateResponse.json();
            
            if (updateResponse.ok && data.success) {
                this.showToast('تم تغيير كلمة المرور بنجاح', 'success');
            } else {
                this.showToast(data.message || 'فشل في تغيير كلمة المرور', 'error');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            this.showToast('خطأ في الاتصال بالخادم', 'error');
        }
    }
    
    async exportData() {
        try {
            const response = await fetch(`${this.baseUrl}get_profile.php?user_id=${this.currentUserId}`);
            const userData = await response.json();
            
            if (response.ok && userData.id) {
                const data = {
                    ...userData,
                    exportDate: new Date().toISOString(),
                    notifications: localStorage.getItem('notifications'),
                    twoFactor: localStorage.getItem('twoFactor'),
                    theme: localStorage.getItem('theme')
                };
                
                const dataStr = JSON.stringify(data, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `user_data_${new Date().getTime()}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
                
                this.showToast('تم تصدير البيانات بنجاح', 'success');
            } else {
                this.showToast('فشل في تحميل البيانات للتصدير', 'error');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showToast('خطأ في الاتصال بالخادم', 'error');
        }
    }
    
    async deleteAccount() {
        if (confirm('⚠️ هل أنت متأكد من حذف الحساب؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            const confirmText = prompt('اكتب "حذف" للتأكيد:');
            if (confirmText !== 'حذف') {
                this.showToast('تم إلغاء عملية الحذف', 'info');
                return;
            }
            
            const password = prompt('أدخل كلمة المرور للتأكيد:');
            if (!password) return;
            
            if (!this.currentUserId) {
                this.showToast('يجب تسجيل الدخول أولاً', 'error');
                return;
            }
            
            try {
                // التحقق من كلمة المرور أولاً
                const verifyResponse = await fetch(`${this.baseUrl}login.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username: this.user.username, 
                        password: password 
                    })
                });
                
                const verifyData = await verifyResponse.json();
                
                if (!verifyResponse.ok || !verifyData.success) {
                    this.showToast('كلمة المرور غير صحيحة', 'error');
                    return;
                }
                
                // حذف الحساب
                const deleteResponse = await fetch(`${this.baseUrl}delete_account.php`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: this.currentUserId })
                });
                
                const data = await deleteResponse.json();
                
                if (deleteResponse.ok && data.success) {
                    // مسح جميع البيانات المحلية
                    localStorage.clear();
                    
                    // إظهار رسالة وداع
                    this.showGoodbyeMessage('تم حذف الحساب بنجاح، نأسف لرحيلك!');
                    
                    // توجيه إلى صفحة تسجيل الدخول
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    this.showToast(data.message || 'فشل في حذف الحساب', 'error');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                this.showToast('خطأ في الاتصال بالخادم', 'error');
            }
        }
    }
    
    logout() {
        const userName = document.getElementById('profile-name').textContent || 'العزيز';
        
        if (confirm(`مرحباً ${userName}، هل تريد تسجيل الخروج؟`)) {
            // إظهار رسالة الوداع
            this.showGoodbyeMessage(`وداعاً ${userName}، نتمنى لك يوماً سعيداً!`);
            
            // حفظ إعدادات المظهر
            const currentTheme = document.body.getAttribute('data-theme');
            const notificationsEnabled = document.getElementById('notifications-toggle').checked;
            const twoFactorEnabled = document.getElementById('twofactor-toggle').checked;
            
            setTimeout(() => {
                // مسح بيانات المستخدم فقط
                localStorage.removeItem('user_data');
                localStorage.removeItem('user_points');
                localStorage.removeItem('current_user_id');
                localStorage.removeItem('isLoggedIn');
                
                // الاحتفاظ بإعدادات المظهر
                if (currentTheme) {
                    localStorage.setItem('theme', currentTheme);
                }
                localStorage.setItem('notifications', notificationsEnabled);
                localStorage.setItem('twoFactor', twoFactorEnabled);
                
                // إعادة التوجيه
                window.location.href = 'index.html';
            }, 1500);
        }
    }
    
    showGoodbyeMessage(message) {
        const goodbyeText = document.getElementById('goodbye-text');
        const logoutMessage = document.getElementById('logout-message');
        
        if (goodbyeText && logoutMessage) {
            goodbyeText.textContent = message;
            logoutMessage.style.display = 'block';
            
            setTimeout(() => {
                logoutMessage.style.display = 'none';
            }, 3000);
        } else {
            this.showToast(message, 'info');
        }
    }
    
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `custom-toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                           type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 
                         type === 'error' ? 'var(--danger-color)' : 'var(--info-color)'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 3000);
    }
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 صفحة الملف الشخصي جاهزة للتحميل');
    new ProfilePage();
});