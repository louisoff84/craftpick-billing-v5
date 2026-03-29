/**
 * CraftPick Hosting - Premium Components
 * React-like component system for enhanced frontend
 */

class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.element = null;
    this.children = [];
    this.eventListeners = [];
  }

  setState(newState) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.onStateChange(prevState, this.state);
    this.render();
  }

  onStateChange(prevState, nextState) {
    // Override in subclasses
  }

  render() {
    // Override in subclasses
    return '';
  }

  mount(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (container) {
      container.innerHTML = this.render();
      this.element = container.firstElementChild;
      this.onMount();
    }
  }

  unmount() {
    this.onUnmount();
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  onMount() {
    // Override in subclasses
  }

  onUnmount() {
    // Override in subclasses
  }

  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }
}

// Service Card Component
class ServiceCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovered: false,
      isLoading: false
    };
  }

  onStateChange(prevState, nextState) {
    if (prevState.isHovered !== nextState.isHovered) {
      this.element.classList.toggle('hovered', nextState.isHovered);
    }
  }

  render() {
    const { service } = this.props;
    const { isHovered, isLoading } = this.state;

    return `
      <div class="service-card ${isHovered ? 'hovered' : ''} ${isLoading ? 'loading' : ''}" data-service-id="${service.id}">
        ${service.popular ? '<div class="popular-badge"><i class="fas fa-star"></i> Populaire</div>' : ''}
        
        <div class="service-header">
          <div class="service-icon">
            <i class="fas fa-${service.icon}"></i>
          </div>
          <h3 class="service-title">${service.name}</h3>
          <p class="service-description">${service.description}</p>
        </div>
        
        <div class="service-price">
          <div class="price-main">
            <span class="price">€${service.price}</span>
            <span class="period">/${service.period}</span>
          </div>
          ${service.yearlyPrice ? `
            <div class="price-yearly">
              <span class="price">€${service.yearlyPrice}</span>
              <span class="period">/année</span>
              <span class="discount">Économisez ${Math.round((service.price * 12 - service.yearlyPrice) / (service.price * 12) * 100)}%</span>
            </div>
          ` : ''}
        </div>
        
        <div class="service-features">
          <ul>
            ${service.features.map(feature => `
              <li class="${feature.included ? 'included' : 'not-included'}">
                <i class="fas fa-${feature.included ? 'check' : 'times'}"></i>
                <span>${feature.name}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        
        <div class="service-action">
          <a href="/services/${service.slug}" class="btn btn-outline">Détails</a>
          <button class="btn btn-primary order-btn" data-service-id="${service.id}">
            ${isLoading ? '<i class="fas fa-spinner fa-spin"></i> Chargement...' : '<i class="fas fa-shopping-cart"></i> Commander'}
          </button>
        </div>
      </div>
    `;
  }

  onMount() {
    const card = this.element;
    const orderBtn = card.querySelector('.order-btn');

    // Hover effects
    this.addEventListener(card, 'mouseenter', () => {
      this.setState({ isHovered: true });
    });

    this.addEventListener(card, 'mouseleave', () => {
      this.setState({ isHovered: false });
    });

    // Order button click
    this.addEventListener(orderBtn, 'click', () => {
      this.handleOrder();
    });
  }

  async handleOrder() {
    this.setState({ isLoading: true });
    
    try {
      await window.craftpick.orderService(this.props.service.id);
    } catch (error) {
      console.error('Order error:', error);
      window.craftpick.showNotification('Erreur lors de la commande', 'error');
    } finally {
      this.setState({ isLoading: false });
    }
  }
}

// Stats Counter Component
class StatsCounter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentValue: 0,
      hasAnimated: false
    };
  }

  render() {
    const { target, label, suffix = '', duration = 2000 } = this.props;
    const { currentValue } = this.state;

    return `
      <div class="stat-item">
        <div class="stat-number" data-target="${target}">${currentValue}${suffix}</div>
        <div class="stat-label">${label}</div>
      </div>
    `;
  }

  onMount() {
    const numberElement = this.element.querySelector('.stat-number');
    
    // Use Intersection Observer to trigger animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.state.hasAnimated) {
          this.animateNumber();
          this.setState({ hasAnimated: true });
        }
      });
    }, { threshold: 0.5 });

    observer.observe(numberElement);
  }

  animateNumber() {
    const { target, suffix = '', duration = 2000 } = this.props;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      this.setState({ currentValue: Math.floor(current) });
    }, 16);
  }
}

// Testimonial Slider Component
class TestimonialSlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
      isAnimating: false
    };
  }

  render() {
    const { testimonials } = this.props;
    const { currentIndex } = this.state;
    const currentTestimonial = testimonials[currentIndex];

    return `
      <div class="testimonial-slider">
        <div class="testimonial-container">
          <div class="testimonial-content">
            <div class="testimonial-rating">
              ${Array(5).fill('').map(() => '<i class="fas fa-star"></i>').join('')}
            </div>
            <p class="testimonial-text">"${currentTestimonial.text}"</p>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="author-info">
              <h4>${currentTestimonial.author}</h4>
              <p>${currentTestimonial.role}</p>
            </div>
          </div>
        </div>
        
        <div class="testimonial-controls">
          <button class="testimonial-prev" ${currentIndex === 0 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="testimonial-dots">
            ${testimonials.map((_, index) => `
              <button class="testimonial-dot ${index === currentIndex ? 'active' : ''}" data-index="${index}"></button>
            `).join('')}
          </div>
          <button class="testimonial-next" ${currentIndex === testimonials.length - 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
  }

  onMount() {
    const prevBtn = this.element.querySelector('.testimonial-prev');
    const nextBtn = this.element.querySelector('.testimonial-next');
    const dots = this.element.querySelectorAll('.testimonial-dot');

    // Navigation buttons
    this.addEventListener(prevBtn, 'click', () => this.previous());
    this.addEventListener(nextBtn, 'click', () => this.next());

    // Dot navigation
    dots.forEach((dot, index) => {
      this.addEventListener(dot, 'click', () => this.goTo(index));
    });

    // Auto-play
    this.startAutoPlay();
  }

  previous() {
    if (this.state.currentIndex > 0 && !this.state.isAnimating) {
      this.goTo(this.state.currentIndex - 1);
    }
  }

  next() {
    const { testimonials } = this.props;
    if (this.state.currentIndex < testimonials.length - 1 && !this.state.isAnimating) {
      this.goTo(this.state.currentIndex + 1);
    }
  }

  goTo(index) {
    if (index === this.state.currentIndex || this.state.isAnimating) return;

    this.setState({ isAnimating: true });

    const container = this.element.querySelector('.testimonial-container');
    container.style.opacity = '0';
    container.style.transform = 'translateX(-20px)';

    setTimeout(() => {
      this.setState({ currentIndex: index });
      container.style.opacity = '1';
      container.style.transform = 'translateX(0)';
      
      setTimeout(() => {
        this.setState({ isAnimating: false });
      }, 300);
    }, 300);
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      const { testimonials } = this.props;
      const nextIndex = (this.state.currentIndex + 1) % testimonials.length;
      this.goTo(nextIndex);
    }, 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  onUnmount() {
    this.stopAutoPlay();
  }
}

// Notification System Component
class NotificationSystem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: []
    };
  }

  addNotification(message, type = 'info', duration = 5000) {
    const id = Date.now();
    const notification = { id, message, type, duration };
    
    this.setState({
      notifications: [...this.state.notifications, notification]
    });

    // Auto-remove
    setTimeout(() => {
      this.removeNotification(id);
    }, duration);
  }

  removeNotification(id) {
    this.setState({
      notifications: this.state.notifications.filter(n => n.id !== id)
    });
  }

  render() {
    const { notifications } = this.state;

    return `
      <div class="notification-system">
        ${notifications.map(notification => `
          <div class="notification notification-${notification.type}" data-id="${notification.id}">
            <div class="notification-content">
              <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
              <span>${notification.message}</span>
              <button class="notification-close">&times;</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  onMount() {
    // Close button handlers
    this.element.addEventListener('click', (e) => {
      if (e.target.classList.contains('notification-close')) {
        const notification = e.target.closest('.notification');
        const id = parseInt(notification.dataset.id);
        this.removeNotification(id);
      }
    });
  }

  getNotificationIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  }
}

// Form Validator Component
class FormValidator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      isValid: false
    };
  }

  validateForm() {
    const { form } = this.props;
    const formData = new FormData(form);
    const errors = {};
    let isValid = true;

    // Email validation
    const email = formData.get('email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Veuillez entrer une adresse email valide';
      isValid = false;
    }

    // Password validation
    const password = formData.get('password');
    if (password && password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      isValid = false;
    }

    // Required fields
    const requiredFields = this.props.required || [];
    requiredFields.forEach(field => {
      const value = formData.get(field);
      if (!value || value.trim() === '') {
        errors[field] = 'Ce champ est requis';
        isValid = false;
      }
    });

    this.setState({ errors, isValid });
    return { isValid, errors };
  }

  render() {
    const { errors } = this.state;

    return `
      <div class="form-validator">
        ${Object.entries(errors).map(([field, message]) => `
          <div class="field-error" data-field="${field}">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  onMount() {
    const { form } = this.props;
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      this.addEventListener(input, 'blur', () => {
        this.validateForm();
      });

      this.addEventListener(input, 'input', () => {
        // Clear error on input
        const fieldName = input.name;
        if (this.state.errors[fieldName]) {
          this.setState({
            errors: { ...this.state.errors, [fieldName]: null }
          });
        }
      });
    });
  }
}

// Loading Spinner Component
class LoadingSpinner extends Component {
  render() {
    const { size = 'medium', text = 'Chargement...' } = this.props;

    return `
      <div class="loading-spinner loading-${size}">
        <div class="spinner"></div>
        ${text ? `<p class="loading-text">${text}</p>` : ''}
      </div>
    `;
  }
}

// Modal Component
class Modal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: props.isOpen || false
    };
  }

  open() {
    this.setState({ isOpen: true });
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.setState({ isOpen: false });
    document.body.style.overflow = '';
  }

  render() {
    const { isOpen } = this.state;
    const { title, children, size = 'medium' } = this.props;

    if (!isOpen) return '';

    return `
      <div class="modal modal-${size} show">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            ${children}
          </div>
        </div>
      </div>
    `;
  }

  onMount() {
    const closeBtn = this.element.querySelector('.modal-close');
    const backdrop = this.element.querySelector('.modal-backdrop');

    this.addEventListener(closeBtn, 'click', () => this.close());
    this.addEventListener(backdrop, 'click', () => this.close());

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  onUnmount() {
    document.body.style.overflow = '';
  }
}

// Export components
window.CraftPickComponents = {
  Component,
  ServiceCard,
  StatsCounter,
  TestimonialSlider,
  NotificationSystem,
  FormValidator,
  LoadingSpinner,
  Modal
};

// Auto-initialize components
document.addEventListener('DOMContentLoaded', () => {
  // Initialize service cards
  document.querySelectorAll('[data-component="service-card"]').forEach(element => {
    const serviceData = JSON.parse(element.dataset.service);
    const card = new ServiceCard({ service: serviceData });
    card.mount(element);
  });

  // Initialize stats counters
  document.querySelectorAll('[data-component="stats-counter"]').forEach(element => {
    const stats = JSON.parse(element.dataset.stats);
    const counter = new StatsCounter(stats);
    counter.mount(element);
  });

  // Initialize testimonial sliders
  document.querySelectorAll('[data-component="testimonial-slider"]').forEach(element => {
    const testimonials = JSON.parse(element.dataset.testimonials);
    const slider = new TestimonialSlider({ testimonials });
    slider.mount(element);
  });
});
