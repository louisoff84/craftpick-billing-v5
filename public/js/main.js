// Navigation toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.innerHTML = navMenu.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
}

// User dropdown toggle
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (userMenu && !userMenu.contains(e.target) && dropdown) {
        dropdown.classList.remove('show');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            showError(input, 'Ce champ est requis');
            isValid = false;
        } else {
            clearError(input);
        }
    });
    
    return isValid;
}

// Show error message
function showError(input, message) {
    clearError(input);
    
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    error.style.color = 'var(--danger-color)';
    error.style.fontSize = '0.875rem';
    error.style.marginTop = '0.25rem';
    
    input.style.borderColor = 'var(--danger-color)';
    input.parentNode.appendChild(error);
}

// Clear error message
function clearError(input) {
    const error = input.parentNode.querySelector('.error-message');
    if (error) {
        error.remove();
    }
    input.style.borderColor = '';
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return strength;
}

// Update password strength indicator
function updatePasswordStrength(password, strengthElement) {
    if (!strengthElement) return;
    
    const strength = checkPasswordStrength(password);
    const strengthBar = strengthElement.querySelector('.strength-bar');
    const strengthText = strengthElement.querySelector('.strength-text');
    
    if (strengthBar) {
        strengthBar.style.width = `${(strength / 5) * 100}%`;
        
        if (strength <= 2) {
            strengthBar.style.backgroundColor = 'var(--danger-color)';
            strengthText.textContent = 'Faible';
        } else if (strength <= 3) {
            strengthBar.style.backgroundColor = 'var(--warning-color)';
            strengthText.textContent = 'Moyen';
        } else if (strength <= 4) {
            strengthBar.style.backgroundColor = '#fbbf24';
            strengthText.textContent = 'Fort';
        } else {
            strengthBar.style.backgroundColor = 'var(--secondary-color)';
            strengthText.textContent = 'Très fort';
        }
    }
}

// Service filter
function initServiceFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filter = button.dataset.filter;
            
            // Filter services
            serviceCards.forEach(card => {
                if (filter === 'all' || card.dataset.type === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Order service function
function orderService(serviceId) {
    // This would typically open a modal or redirect to order page
    window.location.href = `/client/order?service=${serviceId}`;
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copié dans le presse-papiers', 'success');
    }).catch(() => {
        showNotification('Erreur lors de la copie', 'error');
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = 'var(--secondary-color)';
            break;
        case 'error':
            notification.style.backgroundColor = 'var(--danger-color)';
            break;
        case 'warning':
            notification.style.backgroundColor = 'var(--warning-color)';
            break;
        default:
            notification.style.backgroundColor = 'var(--primary-color)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize tooltips
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.dataset.tooltip;
            
            Object.assign(tooltip.style, {
                position: 'absolute',
                backgroundColor: 'var(--dark-color)',
                color: 'white',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                zIndex: '9999',
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
            });
            
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
            
            element.tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', (e) => {
            if (element.tooltip) {
                document.body.removeChild(element.tooltip);
                element.tooltip = null;
            }
        });
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initServiceFilter();
    initTooltips();
    
    // Password strength checker
    const passwordInputs = document.querySelectorAll('input[type="password"][id*="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', () => {
            const strengthElement = document.getElementById('passwordStrength');
            if (strengthElement) {
                updatePasswordStrength(input.value, strengthElement);
            }
        });
    });
    
    // Form validation on submit
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!validateForm(form)) {
                e.preventDefault();
            }
        });
    });
});

// Loading state for buttons
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || button.textContent;
    }
}

// Confirm dialog
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Format currency
function formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Format date
function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    return new Date(date).toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality
function initSearch(searchInput, itemsContainer, itemSelector) {
    if (!searchInput || !itemsContainer) return;
    
    const searchItems = debounce((query) => {
        const items = itemsContainer.querySelectorAll(itemSelector);
        const lowerQuery = query.toLowerCase();
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(lowerQuery)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
        searchItems(e.target.value);
    });
}

// Export functions for use in other scripts
window.utils = {
    showNotification,
    copyToClipboard,
    formatCurrency,
    formatDate,
    setButtonLoading,
    confirmAction,
    validateForm,
    orderService
};
