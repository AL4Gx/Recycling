// js/auth.js
class AuthManager {
    constructor() {
        // ⚠️ backend المحلي (لن يعمل عند مستخدمين آخرين)
        this.baseUrl = 'http://localhost/Recycling/api/';
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUser();
        this.checkAuthState();
    }

    loadUser() {
        try {
            const userData = localStorage.getItem('user_data');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                console.log('تم تحميل بيانات المستخدم:', this.currentUser.username);
            }
        } catch (e) {
            console.error('خطأ في تحميل المستخدم:', e);
            this.logout(false);
        }
    }

    // =========================
    // تسجيل الدخول
    // =========================
    async login(usernameOrEmail, password, rememberMe = false) {
        if (!usernameOrEmail || !password) {
            this.showErrorMessage('يرجى إدخال اسم المستخدم/البريد وكلمة المرور');
            return { success: false };
        }

        try {
            this.showLoading('جاري تسجيل الدخول...');

            const response = await fetch(this.baseUrl + 'login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: usernameOrEmail,
                    password: password
                })
            });

            const result = await response.json();
            this.hideLoading();

            if (response.ok && result.success && result.user) {
                this.currentUser = result.user;

                localStorage.setItem('user_data', JSON.stringify(result.user));
                localStorage.setItem('current_user_id', result.user.id);
                localStorage.setItem('isLoggedIn', 'true');

                if (rememberMe) {
                    localStorage.setItem('rememberedUsername', usernameOrEmail);
                } else {
                    localStorage.removeItem('rememberedUsername');
                }

                this.showSuccessMessage('مرحباً ' + result.user.full_name);

                document.dispatchEvent(
                    new CustomEvent('userLoggedIn', { detail: result.user })
                );

                return { success: true, user: result.user };
            } else {
                this.showErrorMessage(result.message || 'بيانات الدخول غير صحيحة');
                return { success: false };
            }

        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            this.hideLoading();
            this.showErrorMessage('تعذر الاتصال بالخادم');
            return { success: false };
        }
    }

    // =========================
    // تسجيل الخروج
    // =========================
    logout(confirmBox = true) {
        if (confirmBox && !confirm('هل تريد تسجيل الخروج؟')) return;

        this.currentUser = null;
        localStorage.removeItem('user_data');
        localStorage.removeItem('current_user_id');
        localStorage.removeItem('isLoggedIn');

        document.dispatchEvent(new CustomEvent('userLoggedOut'));

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
    }

    // =========================
    // التحقق من حالة الدخول
    // =========================
    isLoggedIn() {
        return (
            localStorage.getItem('isLoggedIn') === 'true' &&
            this.currentUser !== null
        );
    }

    getCurrentUser() {
        return this.currentUser;
    }

    checkAuthState() {
        const page = window.location.pathname.split('/').pop();
        const publicPages = ['index.html', 'signup.html', ''];
        const protectedPages = ['dashboard.html', 'profile.html'];

        if (this.isLoggedIn() && publicPages.includes(page)) {
            window.location.href = 'dashboard.html';
        }

        if (!this.isLoggedIn() && protectedPages.includes(page)) {
            window.location.href = 'index.html';
        }
    }

    // =========================
    // تحميل المستخدم المحفوظ
    // =========================
    loadRememberedUser() {
        const remembered = localStorage.getItem('rememberedUsername');
        if (remembered) {
            const input = document.getElementById('username');
            if (input) {
                input.value = remembered;
                const remember = document.getElementById('remember');
                if (remember) remember.checked = true;
            }
        }
    }

    // =========================
    // رسائل الواجهة
    // =========================
    showSuccessMessage(msg) {
        this.showMessage(msg, 'success');
    }

    showErrorMessage(msg) {
        this.showMessage(msg, 'error');
    }

    showMessage(msg, type) {
        const old = document.querySelector('.auth-message');
        if (old) old.remove();

        const div = document.createElement('div');
        div.className = `auth-message ${type}`;
        div.textContent = msg;

        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: #fff;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 9999;
            font-family: Cairo, sans-serif;
        `;

        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    showLoading(text = 'جاري التحميل...') {
        this.hideLoading();

        const div = document.createElement('div');
        div.className = 'auth-loading';
        div.innerHTML = `<div style="
            background:#fff;
            padding:25px;
            border-radius:10px;
            font-size:16px;
        ">${text}</div>`;

        div.style.cssText = `
            position:fixed;
            top:0;left:0;
            width:100%;height:100%;
            display:flex;
            align-items:center;
            justify-content:center;
            background:rgba(0,0,0,.4);
            z-index:9998;
        `;

        document.body.appendChild(div);
    }

    hideLoading() {
        const div = document.querySelector('.auth-loading');
        if (div) div.remove();
    }
}

// =========================
// التهيئة
// =========================
const authManager = new AuthManager();

document.addEventListener('DOMContentLoaded', () => {
    authManager.loadRememberedUser();
    authManager.checkAuthState();
});
