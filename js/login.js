// إدارة صفحة تسجيل الدخول
class LoginPage {
    constructor() {
        this.form = document.getElementById('login-form');
        this.init();
    }
    
    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.initPasswordToggle();
            this.checkRememberMe();
        }
    }
    
    initPasswordToggle() {
        const passwordInput = document.getElementById('password');
        if (!passwordInput) return;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'password-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        toggleBtn.style.cssText =
            'position: absolute;' +
            'left: 10px;' +
            'top: 50%;' +
            'transform: translateY(-50%);' +
            'background: none;' +
            'border: none;' +
            'color: var(--gray-color);' +
            'cursor: pointer;' +
            'font-size: var(--font-size-base);';
        
        const inputContainer = passwordInput.parentElement;
        inputContainer.style.position = 'relative';
        inputContainer.appendChild(toggleBtn);
        
        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            toggleBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    checkRememberMe() {
        // التحقق إذا كان هناك بيانات محفوظة
        const savedUsername = localStorage.getItem('remembered_username');
        const rememberCheckbox = document.getElementById('remember');
        
        if (savedUsername && rememberCheckbox) {
            const usernameInput = document.getElementById('username');
            if (usernameInput) {
                usernameInput.value = savedUsername;
                rememberCheckbox.checked = true;
            }
        }
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const username = document.getElementById('username')?.value.trim();
        const password = document.getElementById('password')?.value.trim();
        const rememberMe = document.getElementById('remember')?.checked;
        
        if (!username || !password) {
            this.showAlert('danger', 'يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        
        // حفظ اسم المستخدم إذا طلب التذكر
        if (rememberMe) {
            localStorage.setItem('remembered_username', username);
        } else {
            localStorage.removeItem('remembered_username');
        }
        
        // محاكاة تسجيل الدخول
        this.showAlert('info', 'جارٍ تسجيل الدخول...');
        
        // محاكاة الاتصال بالخادم
        setTimeout(() => {
            // التحقق من بيانات المستخدم (محاكاة)
            const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
            
            // بيانات افتراضية للاختبار إذا لم يكن هناك حساب
            if (!userData.username && username === 'admin' && password === '123456') {
                userData.username = 'admin';
                userData.fullname = 'مستخدم تجريبي';
                userData.email = 'test@example.com';
                userData.phone = '0551234567';
                userData.password = '123456';
            }
            
            if ((username === userData.username || username === userData.email) && 
                password === userData.password) {
                
                // تسجيل دخول ناجح
                localStorage.setItem('is_logged_in', 'true');
                localStorage.setItem('current_user', JSON.stringify(userData));

                // إذا لم يكن هناك نقاط مخزنة، قم بتهيئتها
                if (!localStorage.getItem('user_points')) {
                    localStorage.setItem('user_points', '1250');
                }
                
                // إنشاء ID للمستخدم إذا لم يكن موجوداً
                if (!localStorage.getItem('user_id')) {
                    localStorage.setItem('user_id', 'USER-' + Math.random().toString(36).substr(2, 9).toUpperCase());
                }
                
                this.showAlert('success', 'تم تسجيل الدخول بنجاح!');
                
                // توجيه إلى الصفحة الرئيسية
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                
            } else if (username === 'admin' && password === '123456') {
                // دخول تجريبي للاختبار
                const testUser = {
                    fullname: 'مستخدم تجريبي',
                    username: 'admin',
                    email: 'test@example.com',
                    phone: '0551234567',
                    password: '123456'
                };
                
                localStorage.setItem('user_data', JSON.stringify(testUser));
                localStorage.setItem('is_logged_in', 'true');
                localStorage.setItem('current_user', JSON.stringify(testUser));
                localStorage.setItem('user_points', '1250');
                localStorage.setItem('user_id', 'USER-TEST-123456');
                
                this.showAlert('success', 'تم تسجيل الدخول بنجاح (وضع تجريبي)!');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                
            } else {
                // بيانات غير صحيحة
                this.showAlert('danger', 'اسم المستخدم أو كلمة المرور غير صحيحة');
                
                // اهتزاز الحقول
                const inputs = [document.getElementById('username'), document.getElementById('password')];
                inputs.forEach(input => {
                    if (input) {
                        input.style.borderColor = '#ef4444';
                        input.classList.add('error');
                        setTimeout(() => {
                            input.style.borderColor = '';
                            input.classList.remove('error');
                        }, 1000);
                    }
                });
            }
        }, 1500);
    }
    
    showAlert(type, message) {
        const existingAlert = this.form.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        
        const iconClass = {
            'success': 'fa-check-circle',
            'danger': 'fa-exclamation-circle',
            'info': 'fa-info-circle'
        }[type];
        
        alertDiv.innerHTML = 
            `<div>
                <i class="fas ${iconClass}"></i>
                <span>${message}</span>
            </div>`;
        
        this.form.insertBefore(alertDiv, this.form.firstChild);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});