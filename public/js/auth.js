// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) {
        strength++;
    } else {
        feedback.push('Au moins 8 caractères');
    }
    
    if (password.length >= 12) {
        strength++;
    }
    
    // Character variety
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        strength++;
    } else {
        feedback.push('Majuscules et minuscules');
    }
    
    if (/[0-9]/.test(password)) {
        strength++;
    } else {
        feedback.push('Au moins un chiffre');
    }
    
    if (/[^a-zA-Z0-9]/.test(password)) {
        strength++;
    } else {
        feedback.push('Caractères spéciaux');
    }
    
    return { strength, feedback };
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthElement = document.getElementById('passwordStrength');
    if (!strengthElement) return;
    
    const { strength, feedback } = checkPasswordStrength(password);
    const strengthBar = strengthElement.querySelector('.strength-bar');
    const strengthText = strengthElement.querySelector('.strength-text');
    
    if (strengthBar) {
        const percentage = (strength / 5) * 100;
        strengthBar.style.width = `${percentage}%`;
        
        // Update color based on strength
        strengthBar.style.backgroundColor = getColorForStrength(strength);
        strengthBar.style.transition = 'all 0.3s ease';
    }
    
    if (strengthText) {
        if (strength <= 2) {
            strengthText.textContent = 'Faible';
            strengthText.style.color = 'var(--danger-color)';
        } else if (strength <= 3) {
            strengthText.textContent = 'Moyen';
            strengthText.style.color = 'var(--warning-color)';
        } else if (strength <= 4) {
            strengthText.textContent = 'Fort';
            strengthText.style.color = '#fbbf24';
        } else {
            strengthText.textContent = 'Très fort';
            strengthText.style.color = 'var(--secondary-color)';
        }
    }
    
    // Show feedback if password is being typed
    if (password.length > 0 && strength < 3) {
        showPasswordFeedback(feedback);
    } else {
        hidePasswordFeedback();
    }
}

function getColorForStrength(strength) {
    switch (strength) {
        case 0:
        case 1:
            return '#ef4444'; // red
        case 2:
            return '#f59e0b'; // orange
        case 3:
            return '#fbbf24'; // yellow
        case 4:
            return '#84cc16'; // lime
        case 5:
            return '#10b981'; // green
        default:
            return '#e5e7eb'; // gray
    }
}

function showPasswordFeedback(feedback) {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;
    
    // Remove existing feedback
    hidePasswordFeedback();
    
    // Create feedback element
    const feedbackElement = document.createElement('div');
    feedbackElement.className = 'password-feedback';
    feedbackElement.innerHTML = `
        <div class="feedback-title">Pour un mot de passe plus fort :</div>
        <ul class="feedback-list">
            ${feedback.map(item => `<li>${item}</li>`).join('')}
        </ul>
    `;
    
    // Style the feedback
    Object.assign(feedbackElement.style, {
        position: 'absolute',
        top: '100%',
        left: '0',
        right: '0',
        backgroundColor: 'var(--white)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginTop: '0.5rem',
        boxShadow: 'var(--shadow-lg)',
        zIndex: '1000',
        fontSize: '0.875rem'
    });
    
    passwordInput.parentNode.style.position = 'relative';
    passwordInput.parentNode.appendChild(feedbackElement);
}

function hidePasswordFeedback() {
    const existingFeedback = document.querySelector('.password-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
}

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Real-time email validation
function validateEmailInput(input) {
    const email = input.value.trim();
    const isValid = validateEmail(email);
    
    if (email.length > 0) {
        if (isValid) {
            input.style.borderColor = 'var(--secondary-color)';
            showEmailValidation(input, true);
        } else {
            input.style.borderColor = 'var(--danger-color)';
            showEmailValidation(input, false);
        }
    } else {
        input.style.borderColor = '';
        hideEmailValidation(input);
    }
    
    return isValid;
}

function showEmailValidation(input, isValid) {
    hideEmailValidation(input);
    
    const validationElement = document.createElement('div');
    validationElement.className = 'email-validation';
    validationElement.innerHTML = `
        <i class="fas fa-${isValid ? 'check' : 'times'}"></i>
        <span>${isValid ? 'Email valide' : 'Email invalide'}</span>
    `;
    
    Object.assign(validationElement.style, {
        position: 'absolute',
        top: '50%',
        right: '3rem',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        fontSize: '0.75rem',
        color: isValid ? 'var(--secondary-color)' : 'var(--danger-color)'
    });
    
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(validationElement);
}

function hideEmailValidation(input) {
    const existingValidation = input.parentNode.querySelector('.email-validation');
    if (existingValidation) {
        existingValidation.remove();
    }
}

// Password confirmation validation
function validatePasswordConfirmation(passwordInput, confirmInput) {
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    
    if (confirmPassword.length > 0) {
        if (password === confirmPassword) {
            confirmInput.style.borderColor = 'var(--secondary-color)';
            showPasswordMatch(confirmInput, true);
            return true;
        } else {
            confirmInput.style.borderColor = 'var(--danger-color)';
            showPasswordMatch(confirmInput, false);
            return false;
        }
    } else {
        confirmInput.style.borderColor = '';
        hidePasswordMatch(confirmInput);
        return false;
    }
}

function showPasswordMatch(input, isMatch) {
    hidePasswordMatch(input);
    
    const matchElement = document.createElement('div');
    matchElement.className = 'password-match';
    matchElement.innerHTML = `
        <i class="fas fa-${isMatch ? 'check' : 'times'}"></i>
        <span>${isMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}</span>
    `;
    
    Object.assign(matchElement.style, {
        position: 'absolute',
        top: '100%',
        left: '0',
        right: '0',
        fontSize: '0.75rem',
        color: isMatch ? 'var(--secondary-color)' : 'var(--danger-color)',
        marginTop: '0.25rem'
    });
    
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(matchElement);
}

function hidePasswordMatch(input) {
    const existingMatch = input.parentNode.querySelector('.password-match');
    if (existingMatch) {
        existingMatch.remove();
    }
}

// Form validation
function validateAuthForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    const errors = [];
    
    inputs.forEach(input => {
        const value = input.value.trim();
        
        if (!value) {
            showFieldError(input, 'Ce champ est requis');
            isValid = false;
            errors.push(`${input.name} est requis`);
        } else {
            clearFieldError(input);
            
            // Specific validations
            if (input.type === 'email' && !validateEmail(value)) {
                showFieldError(input, 'Email invalide');
                isValid = false;
                errors.push('Email invalide');
            }
            
            if (input.id === 'password' && value.length < 6) {
                showFieldError(input, 'Le mot de passe doit contenir au moins 6 caractères');
                isValid = false;
                errors.push('Mot de passe trop court');
            }
            
            if (input.id === 'confirmPassword') {
                const passwordInput = document.getElementById('password');
                if (passwordInput && value !== passwordInput.value) {
                    showFieldError(input, 'Les mots de passe ne correspondent pas');
                    isValid = false;
                    errors.push('Les mots de passe ne correspondent pas');
                }
            }
        }
    });
    
    return { isValid, errors };
}

function showFieldError(input, message) {
    clearFieldError(input);
    
    input.style.borderColor = 'var(--danger-color)';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    
    Object.assign(errorElement.style, {
        color: 'var(--danger-color)',
        fontSize: '0.875rem',
        marginTop: '0.25rem'
    });
    
    input.parentNode.appendChild(errorElement);
}

function clearFieldError(input) {
    input.style.borderColor = '';
    const errorElement = input.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Initialize auth page
document.addEventListener('DOMContentLoaded', () => {
    // Password strength checker
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            updatePasswordStrength(e.target.value);
        });
    }
    
    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', (e) => {
            validateEmailInput(e.target);
        });
        
        emailInput.addEventListener('blur', (e) => {
            validateEmailInput(e.target);
        });
    }
    
    // Password confirmation validation
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', (e) => {
            validatePasswordConfirmation(passwordInput, e.target);
        });
    }
    
    // Form validation on submit
    const authForm = document.querySelector('.auth-form');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            const { isValid, errors } = validateAuthForm(authForm);
            
            if (!isValid) {
                e.preventDefault();
                
                // Show error notification
                if (window.utils && window.utils.showNotification) {
                    window.utils.showNotification('Veuillez corriger les erreurs du formulaire', 'error');
                }
                
                console.log('Form validation errors:', errors);
            } else {
                // Set loading state
                const submitButton = authForm.querySelector('button[type="submit"]');
                if (submitButton && window.utils && window.utils.setButtonLoading) {
                    window.utils.setButtonLoading(submitButton, true);
                }
            }
        });
    }
    
    // Social login buttons (placeholder)
    const socialButtons = document.querySelectorAll('.btn-google, .btn-facebook');
    socialButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (window.utils && window.utils.showNotification) {
                window.utils.showNotification('Connexion sociale bientôt disponible', 'info');
            }
        });
    });
});

// Export functions
window.authUtils = {
    togglePassword,
    checkPasswordStrength,
    validateEmail,
    validateAuthForm
};
