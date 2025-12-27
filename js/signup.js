// إدارة صفحة إنشاء الحساب
class SignupPage {
    constructor() {
        this.form = document.getElementById('signup-form');
        this.init();
    }
    
    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.initPasswordStrength();
            this.initPasswordToggle();
            this.initUsernameAvailability();
        }
    }
    
    initPasswordStrength() {
        const passwordInput = document.getElementById('password');
        
        if (passwordInput) {
            const strengthMeter = document.createElement('div');
            strengthMeter.className = 'strength-meter';
            
            const strengthContainer = document.createElement('div');
            strengthContainer.className = 'password-strength';
            strengthContainer.appendChild(strengthMeter);
            
            passwordInput.parentElement.appendChild(strengthContainer);
            
            passwordInput.addEventListener('input', () => {
                const strength = this.calculatePasswordStrength(passwordInput.value);
                strengthMeter.style.width = strength.percentage + '%';
                strengthMeter.style.backgroundColor = strength.color;
            });
        }
    }
    
    calculatePasswordStrength(password) {
        let strength = 0;
        
        // طول كلمة المرور
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 15;
        
        // التنوع
        if (/[a-z]/.test(password)) strength += 10;
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;
        
        let color;
        if (strength < 50) color = '#e71d36'; // ضعيف
        else if (strength < 75) color = '#ff9f1c'; // متوسط
        else color = '#2ec4b6'; // قوي
        
        return { percentage: Math.min(strength, 100), color };
    }
    
    initPasswordToggle() {
        const passwordInputs = ['password', 'confirm-password'];
        
        passwordInputs.forEach(inputId => {
            const passwordInput = document.getElementById(inputId);
            
            if (passwordInput) {
                const toggleBtn = document.createElement('button');
                toggleBtn.type = 'button';
                toggleBtn.className = 'password-toggle';
                toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
                toggleBtn.style.cssText = 
                    "position: absolute;" +
                    "left: 10px;" +
                    "top: 50%;" +
                    "transform: translateY(-50%);" +
                    "background: none;" +
                    "border: none;" +
                    "color: var(--gray-color);" +
                    "cursor: pointer;" +
                    "font-size: var(--font-size-base);";
                
                const inputContainer = passwordInput.parentElement;
                inputContainer.style.position = 'relative';
                inputContainer.appendChild(toggleBtn);
                
                toggleBtn.addEventListener('click', () => {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);
                    toggleBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
                });
            }
        });
    }
    
    initUsernameAvailability() {
        const usernameInput = document.getElementById('username');
        
        if (usernameInput) {
            // محاكاة التحقق من اسم المستخدم عند الخروج من الحقل
            usernameInput.addEventListener('blur', () => {
const username = usernameInput.value.trim();
                
                if (username.length < 3) return;
                
                // محاكاة الاتصال بالخادم للتحقق
                setTimeout(() => {
                    // أسماء مستخدمين محجوزة (محاكاة)
                    const reservedUsernames = ['admin', 'user', 'test', 'moderator'];
                    
                    if (reservedUsernames.includes(username.toLowerCase())) {
                        this.showFieldError(usernameInput, 'اسم المستخدم محجوز، اختر اسمًا آخر');
                    } else if (username.length < 4) {
                        this.showFieldError(usernameInput, 'اسم المستخدم يجب أن يكون 4 أحرف على الأقل');
                    } else {
                        this.clearFieldError(usernameInput);
                    }
                }, 500);
            });
        }
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        // التحقق من جميع الحقول
        const isValid = this.validateForm();
        
        if (!isValid) return;
        
        // التحقق من تطابق كلمات المرور
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            this.showAlert('danger', 'كلمات المرور غير متطابقة');
            document.getElementById('confirm-password').focus();
            return;
        }
        
        // محاكاة إنشاء الحساب
        this.showAlert('success', 'جارٍ إنشاء حسابك...');
        
        // جمع البيانات
        const formData = {
            fullname: document.getElementById('fullname').value,
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: password,
            timestamp: new Date().toISOString()
        };
        
        // محاكاة إرسال البيانات
        setTimeout(() => {
            console.log('✅ بيانات التسجيل:', formData);
            
            // حفظ بيانات المستخدم في localStorage
            localStorage.setItem('user_data', JSON.stringify(formData));
            localStorage.setItem('is_logged_in', 'true');
            localStorage.setItem('current_user', JSON.stringify(formData));
            
            // إعداد نقاط ابتدائية
            localStorage.setItem('user_points', '500'); // نقاط ابتدائية
            localStorage.setItem('user_id', 'USER-' + Math.random().toString(36).substr(2, 9).toUpperCase());
            
            this.showAlert('success', 'تم إنشاء حسابك بنجاح!');
            
            // توجيه إلى الصفحة الرئيسية بعد 2 ثانية
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }, 1500);
    }
    
    validateForm() {
        const requiredFields = [
            'fullname',
            'username', 
            'email',
            'phone',
            'password',
            'confirm-password'
        ];
        
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                this.showFieldError(field, 'هذا الحقل مطلوب');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });
        
        // التحقق من صحة البريد الإلكتروني
        const emailField = document.getElementById('email');
        if (emailField && emailField.value.trim() && !this.isValidEmail(emailField.value)) {
            this.showFieldError(emailField, 'يرجى إدخال بريد إلكتروني صحيح');
            isValid = false;
}
        
        // التحقق من صحة الهاتف
        const phoneField = document.getElementById('phone');
        if (phoneField && phoneField.value.trim() && !this.isValidPhone(phoneField.value)) {
            this.showFieldError(phoneField, 'يرجى إدخال رقم هاتف صحيح');
            isValid = false;
        }
        
        // التحقق من كلمة المرور
        const passwordField = document.getElementById('password');
        if (passwordField && passwordField.value.length < 8) {
            this.showFieldError(passwordField, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            isValid = false;
        }
        
        // التحقق من الموافقة على الشروط
        const termsCheckbox = document.getElementById('terms');
        if (termsCheckbox && !termsCheckbox.checked) {
            this.showAlert('danger', 'يرجى الموافقة على الشروط والأحكام');
            isValid = false;
        }
        
        return isValid;
    }
    
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    isValidPhone(phone) {
        // قبول أي تنسيق للهاتف
        const re = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        return re.test(phone);
    }
    
    showFieldError(field, message) {
        if (!field) return;
        
        // إزالة أي رسالة خطأ سابقة
        this.clearFieldError(field);
        
        // إضافة بوردر أحمر
        field.style.borderColor = '#ef4444';
        
        // إضافة رسالة الخطأ
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 
            "color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem;";
        errorDiv.textContent = message;
        
        field.parentElement.appendChild(errorDiv);
    }
    
    clearFieldError(field) {
        if (!field) return;
        
        field.style.borderColor = '';
        
        const errorDiv = field.parentElement.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    showAlert(type, message) {
        const existingAlert = this.form.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        

        const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
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
    new SignupPage();
});