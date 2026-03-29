/**
 * CraftPick Hosting - Premium JavaScript Enhanced
 * Glassmorphism Design, Mouse Effects, PayPal Integration, Advanced Features
 */

class CraftPickHosting {
  constructor() {
    this.init();
    this.setupEventListeners();
    this.initializeComponents();
    this.setupMouseEffects();
    this.setupPayPal();
    this.setupAdvancedFeatures();
  }

  init() {
    console.log('🚀 CraftPick Hosting Premium Enhanced Initialized');
    
    // Set up global variables
    this.isMobile = window.innerWidth <= 768;
    this.isScrolling = false;
    this.currentScroll = 0;
    this.particles = [];
    this.animations = [];
    
    // Initialize animations
    this.setupScrollAnimations();
    this.setupIntersectionObserver();
    
    // Initialize theme
    this.setupTheme();
    
    // Initialize performance monitoring
    this.setupPerformanceMonitoring();
    
    // Initialize particles
    this.setupParticles();
    
    // Initialize 3D effects
    this.setup3DEffects();
    
    // Initialize voice commands
    this.setupVoiceCommands();
  }

  setupAdvancedFeatures() {
    // Advanced search with autocomplete
    this.setupAdvancedSearch();
    
    // Real-time notifications
    this.setupRealTimeNotifications();
    
    // Dark mode with system detection
    this.setupAdvancedTheme();
    
    // Keyboard shortcuts
    this.setupAdvancedKeyboardShortcuts();
    
    // Gesture support
    this.setupGestures();
    
    // Offline support
    this.setupOfflineSupport();
    
    // Performance optimization
    this.setupPerformanceOptimization();
  }

  setupAdvancedSearch() {
    const searchInputs = document.querySelectorAll('[data-search]');
    
    searchInputs.forEach(input => {
      let searchTimeout;
      
      input.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value;
        
        if (query.length < 2) {
          this.hideSearchResults(input);
          return;
        }
        
        searchTimeout = setTimeout(() => {
          this.performSearch(query, input);
        }, 300);
      });
      
      input.addEventListener('focus', () => {
        if (input.value.length >= 2) {
          this.performSearch(input.value, input);
        }
      });
      
      // Close on escape
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hideSearchResults(input);
        }
      });
    });
  }

  async performSearch(query, input) {
    try {
      // Simulate API call
      const results = await this.searchAPI(query);
      this.showSearchResults(results, input);
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  searchAPI(query) {
    return new Promise((resolve) => {
      // Simulate search results
      const mockResults = [
        { title: 'Hébergement Web Starter', url: '/services/web-hosting', type: 'service' },
        { title: 'Serveur VPS Pro', url: '/services/vps', type: 'service' },
        { title: 'Guide de démarrage', url: '/help/getting-started', type: 'help' },
        { title: 'Centre d\'aide', url: '/help', type: 'help' }
      ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      
      setTimeout(() => resolve(mockResults), 200);
    });
  }

  showSearchResults(results, input) {
    // Remove existing results
    this.hideSearchResults(input);
    
    if (results.length === 0) {
      return;
    }
    
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    resultsContainer.innerHTML = `
      <div class="search-results-header">
        <span>${results.length} résultat(s)</span>
      </div>
      <div class="search-results-list">
        ${results.map(result => `
          <a href="${result.url}" class="search-result-item">
            <div class="search-result-icon">
              <i class="fas fa-${result.type === 'service' ? 'server' : 'question-circle'}"></i>
            </div>
            <div class="search-result-content">
              <div class="search-result-title">${result.title}</div>
              <div class="search-result-type">${result.type}</div>
            </div>
          </a>
        `).join('')}
      </div>
    `;
    
    // Position results
    const rect = input.getBoundingClientRect();
    resultsContainer.style.top = `${rect.bottom + window.scrollY + 5}px`;
    resultsContainer.style.left = `${rect.left + window.scrollX}px`;
    resultsContainer.style.width = `${rect.width}px`;
    
    document.body.appendChild(resultsContainer);
    
    // Animate in
    setTimeout(() => {
      resultsContainer.classList.add('show');
    }, 10);
  }

  hideSearchResults(input) {
    const existingResults = document.querySelector('.search-results');
    if (existingResults) {
      existingResults.classList.remove('show');
      setTimeout(() => {
        existingResults.remove();
      }, 200);
    }
  }

  setupRealTimeNotifications() {
    // WebSocket connection for real-time updates
    this.connectWebSocket();
    
    // Notification permission
    this.requestNotificationPermission();
  }

  connectWebSocket() {
    if ('WebSocket' in window) {
      // In production, connect to actual WebSocket server
      // this.ws = new WebSocket('wss://api.craftpick-hosting.com/ws');
      
      // Mock WebSocket for development
      this.simulateWebSocket();
    }
  }

  simulateWebSocket() {
    // Simulate real-time notifications
    setInterval(() => {
      const notifications = [
        { type: 'info', message: 'Nouvelle mise à jour système disponible' },
        { type: 'success', message: 'Votre sauvegarde est terminée' },
        { type: 'warning', message: 'Maintenance prévue dans 2 heures' }
      ];
      
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      
      if (Math.random() > 0.8) { // 20% chance
        this.showRealTimeNotification(randomNotification);
      }
    }, 30000); // Every 30 seconds
  }

  showRealTimeNotification(notification) {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('CraftPick Hosting', {
        body: notification.message,
        icon: '/images/favicon-32x32.png',
        badge: '/images/favicon-16x16.png'
      });
    }
    
    // In-app notification
    this.showNotification(notification.message, notification.type);
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }

  setupAdvancedTheme() {
    // Detect system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check for saved theme or use system preference
    const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
    this.applyTheme(savedTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.innerHTML = `<i class="fas fa-${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
    }
  }

  setupAdvancedKeyboardShortcuts() {
    const shortcuts = {
      'Ctrl+K': () => this.openAdvancedSearch(),
      'Ctrl+/': () => this.showKeyboardShortcuts(),
      'Ctrl+Shift+D': () => this.toggleTheme(),
      'Ctrl+Shift+N': () => this.openNotifications(),
      'Ctrl+Shift+S': () => this.openSettings(),
      'Escape': () => this.closeAllModals(),
      'Ctrl+Enter': () => this.submitActiveForm()
    };
    
    document.addEventListener('keydown', (e) => {
      const key = this.getShortcutKey(e);
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    });
  }

  getShortcutKey(e) {
    const parts = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    parts.push(e.key);
    return parts.join('+');
  }

  openAdvancedSearch() {
    const searchModal = document.createElement('div');
    searchModal.className = 'search-modal';
    searchModal.innerHTML = `
      <div class="search-modal-content">
        <div class="search-modal-header">
          <h3>Recherche Avancée</h3>
          <button class="search-modal-close">&times;</button>
        </div>
        <div class="search-modal-body">
          <input type="text" class="search-modal-input" placeholder="Rechercher des services, de l'aide, de la documentation..." autofocus>
          <div class="search-filters">
            <label><input type="checkbox" name="services" checked> Services</label>
            <label><input type="checkbox" name="help" checked> Aide</label>
            <label><input type="checkbox" name="docs" checked> Documentation</label>
            <label><input type="checkbox" name="blog"> Blog</label>
          </div>
          <div class="search-results-container"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(searchModal);
    
    // Focus input
    const input = searchModal.querySelector('.search-modal-input');
    input.focus();
    
    // Setup search
    this.setupModalSearch(searchModal);
    
    // Close handlers
    searchModal.querySelector('.search-modal-close').addEventListener('click', () => {
      searchModal.remove();
    });
    
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        searchModal.remove();
      }
    });
  }

  setupModalSearch(modal) {
    const input = modal.querySelector('.search-modal-input');
    const resultsContainer = modal.querySelector('.search-results-container');
    let searchTimeout;
    
    input.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value;
      
      if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
      }
      
      searchTimeout = setTimeout(() => {
        this.performModalSearch(query, resultsContainer);
      }, 300);
    });
  }

  async performModalSearch(query, container) {
    container.innerHTML = '<div class="search-loading"><i class="fas fa-spinner fa-spin"></i> Recherche...</div>';
    
    try {
      const results = await this.searchAPI(query);
      
      if (results.length === 0) {
        container.innerHTML = '<div class="search-no-results">Aucun résultat trouvé</div>';
        return;
      }
      
      container.innerHTML = `
        <div class="search-modal-results">
          ${results.map(result => `
            <a href="${result.url}" class="search-modal-result">
              <div class="search-result-icon">
                <i class="fas fa-${result.type === 'service' ? 'server' : 'question-circle'}"></i>
              </div>
              <div class="search-result-content">
                <div class="search-result-title">${this.highlightMatch(result.title, query)}</div>
                <div class="search-result-type">${result.type}</div>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    } catch (error) {
      container.innerHTML = '<div class="search-error">Erreur de recherche</div>';
    }
  }

  highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  showKeyboardShortcuts() {
    const shortcutsModal = document.createElement('div');
    shortcutsModal.className = 'shortcuts-modal';
    shortcutsModal.innerHTML = `
      <div class="shortcuts-modal-content">
        <div class="shortcuts-modal-header">
          <h3>Raccourcis Clavier</h3>
          <button class="shortcuts-modal-close">&times;</button>
        </div>
        <div class="shortcuts-modal-body">
          <div class="shortcuts-list">
            <div class="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>K</kbd>
              <span>Recherche avancée</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>/</kbd>
              <span>Raccourcis clavier</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>
              <span>Changer le thème</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd>
              <span>Notifications</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd>
              <span>Paramètres</span>
            </div>
            <div class="shortcut-item">
              <kbd>Échap</kbd>
              <span>Fermer les modales</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(shortcutsModal);
    
    // Close handlers
    shortcutsModal.querySelector('.shortcuts-modal-close').addEventListener('click', () => {
      shortcutsModal.remove();
    });
    
    shortcutsModal.addEventListener('click', (e) => {
      if (e.target === shortcutsModal) {
        shortcutsModal.remove();
      }
    });
  }

  setupGestures() {
    if ('TouchEvent' in window) {
      this.setupTouchGestures();
    }
    
    // Mouse gestures
    this.setupMouseGestures();
  }

  setupTouchGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Swipe detection
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
        if (deltaX > 0) {
          this.handleSwipeRight();
        } else {
          this.handleSwipeLeft();
        }
      }
    });
  }

  setupMouseGestures() {
    let mouseDown = false;
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('mousedown', (e) => {
      if (e.button === 2) { // Right click
        mouseDown = true;
        startX = e.clientX;
        startY = e.clientY;
      }
    });
    
    document.addEventListener('mouseup', (e) => {
      if (e.button === 2 && mouseDown) {
        mouseDown = false;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        if (Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            this.handleGestureRight();
          } else {
            this.handleGestureLeft();
          }
        }
      }
    });
    
    // Prevent context menu for gestures
    document.addEventListener('contextmenu', (e) => {
      if (mouseDown) {
        e.preventDefault();
      }
    });
  }

  handleSwipeLeft() {
    console.log('Swipe left detected');
    // Navigate to previous page or open menu
  }

  handleSwipeRight() {
    console.log('Swipe right detected');
    // Navigate to next page or close menu
  }

  handleGestureLeft() {
    console.log('Mouse gesture left');
    // Custom gesture action
  }

  handleGestureRight() {
    console.log('Mouse gesture right');
    // Custom gesture action
  }

  setupOfflineSupport() {
    // Service Worker for offline support
    this.registerServiceWorker();
    
    // Online/offline detection
    window.addEventListener('online', () => {
      this.showNotification('Connexion rétablie', 'success');
      this.syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
      this.showNotification('Hors connexion - Mode hors ligne activé', 'warning');
      this.enableOfflineMode();
    });
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }

  syncOfflineData() {
    // Sync data when back online
    const offlineData = localStorage.getItem('offlineData');
    if (offlineData) {
      try {
        const data = JSON.parse(offlineData);
        // Send to server
        this.sendOfflineData(data);
        localStorage.removeItem('offlineData');
      } catch (error) {
        console.error('Error parsing offline data:', error);
      }
    }
  }

  sendOfflineData(data) {
    // Send offline actions to server
    fetch('/api/sync-offline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }

  enableOfflineMode() {
    // Enable offline functionality
    document.body.classList.add('offline-mode');
  }

  setupPerformanceOptimization() {
    // Lazy loading for images
    this.setupLazyLoading();
    
    // Code splitting
    this.setupCodeSplitting();
    
    // Resource hints
    this.setupResourceHints();
    
    // Critical CSS
    this.setupCriticalCSS();
  }

  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    }
  }

  setupCodeSplitting() {
    // Dynamic import for code splitting
    const loadModule = async (moduleName) => {
      try {
        const module = await import(`/js/modules/${moduleName}.js`);
        return module.default;
      } catch (error) {
        console.error(`Error loading module ${moduleName}:`, error);
      }
    };
    
    window.loadModule = loadModule;
  }

  setupResourceHints() {
    // Preload critical resources
    const criticalResources = [
      '/css/style.css',
      '/js/main.js',
      '/fonts/inter.woff2'
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.endsWith('.woff2')) {
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
    });
  }

  setupCriticalCSS() {
    // Inline critical CSS for faster rendering
    const criticalCSS = `
      body{font-family:var(--font-family);line-height:1.6;color:var(--light);background:var(--gradient-dark)}
      .navbar{position:fixed;top:0;left:0;right:0;z-index:var(--z-fixed);background:var(--glass-bg);backdrop-filter:blur(20px);border-bottom:1px solid var(--glass-border)}
      .btn{display:inline-flex;align-items:center;justify-content:center;padding:var(--spacing-md) var(--spacing-xl);font-weight:600;font-size:0.9rem;border:none;border-radius:var(--radius-lg);cursor:pointer;transition:all var(--transition-normal);text-decoration:none}
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }

  setup3DEffects() {
    // 3D transforms for enhanced visual effects
    const elements3D = document.querySelectorAll('[data-3d]');
    
    elements3D.forEach(element => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }

  setupVoiceCommands() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.initializeVoiceRecognition();
    }
  }

  initializeVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'fr-FR';
    
    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase();
      
      this.processVoiceCommand(transcript);
    };
    
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
  }

  processVoiceCommand(command) {
    const commands = {
      'recherche': () => this.openAdvancedSearch(),
      'accueil': () => window.location.href = '/',
      'services': () => window.location.href = '/services',
      'tableau de bord': () => window.location.href = '/client/dashboard',
      'thème clair': () => this.applyTheme('light'),
      'thème sombre': () => this.applyTheme('dark'),
      'notifications': () => this.openNotifications(),
      'paramètres': () => this.openSettings()
    };
    
    for (const [key, action] of Object.entries(commands)) {
      if (command.includes(key)) {
        action();
        break;
      }
    }
  }

  startVoiceRecognition() {
    if (this.recognition) {
      this.recognition.start();
      this.showNotification('Reconnaissance vocale activée', 'info');
    }
  }

  stopVoiceRecognition() {
    if (this.recognition) {
      this.recognition.stop();
      this.showNotification('Reconnaissance vocale désactivée', 'info');
    }
  }

  // Enhanced utility methods
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Enhanced animation methods
  animateValue(element, start, end, duration, callback) {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = this.easeInOutCubic(progress);
      const currentValue = start + (end - start) * easeProgress;
      
      if (typeof callback === 'function') {
        callback(currentValue, progress);
      } else {
        element.textContent = Math.round(currentValue);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Enhanced notification system
  showNotification(message, type = 'info', options = {}) {
    const {
      duration = 5000,
      persistent = false,
      actions = [],
      icon = null
    } = options;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} animate-slideInRight`;
    
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          <i class="fas fa-${icon || this.getNotificationIcon(type)}"></i>
        </div>
        <div class="notification-message">
          <span>${message}</span>
          ${actions.length > 0 ? `
            <div class="notification-actions">
              ${actions.map(action => `
                <button class="notification-action" data-action="${action.id}">
                  ${action.label}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Action handlers
    actions.forEach(action => {
      const actionBtn = notification.querySelector(`[data-action="${action.id}"]`);
      if (actionBtn) {
        actionBtn.addEventListener('click', () => {
          action.handler();
          if (!persistent) {
            this.hideNotification(notification);
          }
        });
      }
    });
    
    // Auto-hide
    if (!persistent) {
      setTimeout(() => {
        this.hideNotification(notification);
      }, duration);
    }
    
    // Close handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.hideNotification(notification);
    });
  }

  hideNotification(notification) {
    notification.classList.add('animate-slideOutRight');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }

  // Existing methods from previous implementation...
  // [Include all the previous methods like setupMouseEffects, setupPayPal, etc.]
}

  setupMouseEffects() {
    // Custom cursor
    if (!this.isMobile) {
      this.createCustomCursor();
    }
    
    // Mouse parallax effects
    this.setupParallaxEffects();
    
    // Mouse glow effects
    this.setupGlowEffects();
  }

  createCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    const follower = document.createElement('div');
    follower.className = 'cursor-follower';
    document.body.appendChild(follower);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const animateCursor = () => {
      // Smooth cursor movement
      cursorX += (mouseX - cursorX) * 0.5;
      cursorY += (mouseY - cursorY) * 0.5;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';

      // Smooth follower movement
      followerX += (mouseX - followerX) * 0.1;
      followerY += (mouseY - followerY) * 0.1;
      follower.style.left = followerX + 'px';
      follower.style.top = followerY + 'px';

      requestAnimationFrame(animateCursor);
    };

    animateCursor();

    // Hover effects
    const interactiveElements = document.querySelectorAll('a, button, .btn, .feature-card, .service-card');
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        follower.classList.add('hover');
      });
      element.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        follower.classList.remove('hover');
      });
    });
  }

  setupParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.hero-graphic, .feature-icon, .service-icon');
    
    document.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;

      parallaxElements.forEach(element => {
        const speed = element.dataset.parallaxSpeed || 10;
        const x = mouseX * speed;
        const y = mouseY * speed;
        
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
  }

  setupGlowEffects() {
    const glowElements = document.querySelectorAll('.btn-primary, .service-card:hover, .feature-card:hover');
    
    document.addEventListener('mousemove', (e) => {
      glowElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        element.style.setProperty('--mouse-x', `${x}px`);
        element.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  setupParticles() {
    this.createHeroParticles();
    this.createFloatingElements();
  }

  createHeroParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const particleCount = 50;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 1}px;
        height: ${Math.random() * 4 + 1}px;
        background: rgba(233, 69, 96, ${Math.random() * 0.5 + 0.2});
        border-radius: 50%;
        pointer-events: none;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 10 + 10}s infinite ease-in-out;
      `;
      
      hero.appendChild(particle);
      particles.push(particle);
    }

    // Animate particles
    this.animateParticles(particles);
  }

  animateParticles(particles) {
    const animate = () => {
      particles.forEach(particle => {
        const currentTop = parseFloat(particle.style.top);
        const newTop = currentTop - 0.1;
        
        if (newTop < -10) {
          particle.style.top = '110%';
          particle.style.left = Math.random() * 100 + '%';
        } else {
          particle.style.top = newTop + '%';
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  createFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating');
    
    floatingElements.forEach(element => {
      const speed = element.dataset.floatSpeed || 2;
      const amplitude = element.dataset.floatAmplitude || 10;
      
      let offset = Math.random() * Math.PI * 2;
      
      const float = () => {
        offset += 0.01 * speed;
        const y = Math.sin(offset) * amplitude;
        element.style.transform = `translateY(${y}px)`;
        requestAnimationFrame(float);
      };
      
      float();
    });
  }

  setupPayPal() {
    // PayPal SDK configuration
    this.payPalConfig = {
      clientId: 'YOUR_PAYPAL_CLIENT_ID', // Replace with actual client ID
      currency: 'EUR',
      intent: 'capture'
    };

    // Initialize PayPal buttons when DOM is ready
    if (document.querySelector('.paypal-button-container')) {
      this.initializePayPalButtons();
    }
  }

  initializePayPalButtons() {
    const containers = document.querySelectorAll('.paypal-button-container');
    
    containers.forEach(container => {
      const amount = container.dataset.amount || '0.00';
      const description = container.dataset.description || 'CraftPick Hosting Service';
      
      // Create PayPal button
      const button = document.createElement('div');
      button.className = 'paypal-button';
      button.innerHTML = `
        <button class="btn btn-primary paypal-btn" onclick="window.craftpick.initiatePayPalPayment('${amount}', '${description}')">
          <i class="fab fa-paypal"></i> Payer avec PayPal
        </button>
      `;
      
      container.appendChild(button);
    });
  }

  initiatePayPalPayment(amount, description) {
    this.showNotification('Redirection vers PayPal...', 'info');
    
    // Create payment
    this.createPayPalPayment(amount, description)
      .then(paymentData => {
        // Redirect to PayPal for approval
        window.location.href = paymentData.approvalUrl;
      })
      .catch(error => {
        this.showNotification('Erreur lors de la création du paiement PayPal', 'error');
        console.error('PayPal payment error:', error);
      });
  }

  async createPayPalPayment(amount, description) {
    // Simulate PayPal payment creation
    // In production, this would make an actual API call to PayPal
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const paymentData = {
          id: 'PAY-' + Math.random().toString(36).substr(2, 9),
          approvalUrl: 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=' + Math.random().toString(36).substr(2, 9),
          amount: amount,
          description: description
        };
        
        resolve(paymentData);
      }, 1000);
    });
  }

  setupEventListeners() {
    // Navigation
    this.setupNavigation();
    
    // Scroll events
    this.setupScrollEvents();
    
    // Form interactions
    this.setupFormInteractions();
    
    // Service filtering
    this.setupServiceFilter();
    
    // Modal system
    this.setupModals();
    
    // Notifications
    this.setupNotifications();
    
    // Keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Resize events
    this.setupResizeEvents();
    
    // Payment events
    this.setupPaymentEvents();
  }

  setupNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = navToggle.querySelector('i');
        if (icon) {
          icon.className = navMenu.classList.contains('active') 
            ? 'fas fa-times' 
            : 'fas fa-bars';
        }
      });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu && !navMenu.contains(e.target) && !navToggle?.contains(e.target)) {
        navMenu.classList.remove('active');
        if (navToggle) {
          const icon = navToggle.querySelector('i');
          if (icon) icon.className = 'fas fa-bars';
        }
      }
    });

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            this.smoothScrollTo(target);
            // Close mobile menu
            navMenu?.classList.remove('active');
            if (navToggle) {
              const icon = navToggle.querySelector('i');
              if (icon) icon.className = 'fas fa-bars';
            }
          }
        }
      });
    });

    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (navbar) {
        if (currentScroll > 100) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }

        // Hide/show navbar on scroll
        if (currentScroll > lastScroll && currentScroll > 300) {
          navbar.style.transform = 'translateY(-100%)';
        } else {
          navbar.style.transform = 'translateY(0)';
        }
      }
      
      lastScroll = currentScroll;
    });
  }

  setupPaymentEvents() {
    // Payment form submissions
    const paymentForms = document.querySelectorAll('.payment-form');
    paymentForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePaymentForm(form);
      });
    });

    // Payment method switching
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
      method.addEventListener('change', (e) => {
        this.handlePaymentMethodChange(e.target.value);
      });
    });
  }

  handlePaymentForm(form) {
    const formData = new FormData(form);
    const paymentData = Object.fromEntries(formData.entries());
    const paymentMethod = paymentData.paymentMethod;
    
    if (paymentMethod === 'paypal') {
      const amount = paymentData.amount || '0.00';
      const description = paymentData.description || 'CraftPick Hosting Service';
      this.initiatePayPalPayment(amount, description);
    } else {
      this.processAlternativePayment(paymentData);
    }
  }

  handlePaymentMethodChange(method) {
    const cardDetails = document.getElementById('cardDetails');
    const bankDetails = document.getElementById('bankDetails');
    
    if (cardDetails) {
      cardDetails.style.display = method === 'card' ? 'block' : 'none';
    }
    if (bankDetails) {
      bankDetails.style.display = method === 'bank' ? 'block' : 'none';
    }
  }

  processAlternativePayment(paymentData) {
    this.showNotification('Traitement du paiement...', 'info');
    
    // Simulate payment processing
    setTimeout(() => {
      this.showNotification('Paiement traité avec succès!', 'success');
      
      // Close modal if open
      const modal = document.querySelector('.modal.show');
      if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
      }
      
      // Redirect to success page
      setTimeout(() => {
        window.location.href = '/payment/success';
      }, 2000);
    }, 3000);
  }

  setupScrollEvents() {
    let ticking = false;
    
    const updateScrollState = () => {
      this.currentScroll = window.pageYOffset;
      this.isScrolling = false;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      this.isScrolling = true;
      if (!ticking) {
        requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    });
  }

  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .service-card, .stat-item').forEach(el => {
      observer.observe(el);
    });
  }

  setupIntersectionObserver() {
    // Lazy loading for images
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  setupTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Theme toggle (if implemented)
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      });
    }
  }

  setupFormInteractions() {
    // Enhanced form validation
    const forms = document.querySelectorAll('.form');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', () => {
          this.validateField(input);
        });

        input.addEventListener('input', () => {
          if (input.classList.contains('error')) {
            this.validateField(input);
          }
        });

        // Floating labels
        if (input.placeholder) {
          input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
          });

          input.addEventListener('blur', () => {
            if (!input.value) {
              input.parentElement.classList.remove('focused');
            }
          });
        }
      });

      // Form submission
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
          this.showNotification('Please correct the errors in the form', 'error');
        }
      });
    });

    // Password strength indicator
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
      input.addEventListener('input', () => {
        this.updatePasswordStrength(input);
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    let isValid = true;
    let message = '';

    // Remove previous error
    this.clearFieldError(field);

    // Required validation
    if (required && !value) {
      isValid = false;
      message = 'This field is required';
    }

    // Type-specific validation
    if (value) {
      switch (type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
          }
          break;
        case 'password':
          if (value.length < 8) {
            isValid = false;
            message = 'Password must be at least 8 characters long';
          }
          break;
        case 'tel':
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          if (!phoneRegex.test(value)) {
            isValid = false;
            message = 'Please enter a valid phone number';
          }
          break;
      }
    }

    if (!isValid) {
      this.showFieldError(field, message);
    }

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    
    field.parentElement.appendChild(errorElement);
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  updatePasswordStrength(input) {
    const strengthIndicator = document.getElementById('passwordStrength');
    if (!strengthIndicator) return;

    const password = input.value;
    let strength = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) strength++;
    else feedback.push('At least 8 characters');

    // Uppercase check
    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('One uppercase letter');

    // Lowercase check
    if (/[a-z]/.test(password)) strength++;
    else feedback.push('One lowercase letter');

    // Number check
    if (/\d/.test(password)) strength++;
    else feedback.push('One number');

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    else feedback.push('One special character');

    // Update UI
    const strengthBar = strengthIndicator.querySelector('.strength-bar');
    const strengthText = strengthIndicator.querySelector('.strength-text');
    const strengthFeedback = strengthIndicator.querySelector('.strength-feedback');

    if (strengthBar) {
      strengthBar.style.width = `${(strength / 5) * 100}%`;
      
      // Update color based on strength
      const colors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981'];
      strengthBar.style.backgroundColor = colors[strength - 1] || colors[0];
    }

    if (strengthText) {
      const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
      strengthText.textContent = labels[strength - 1] || 'Very Weak';
    }

    if (strengthFeedback && feedback.length > 0) {
      strengthFeedback.innerHTML = feedback.map(item => `<span>${item}</span>`).join('');
    }
  }

  setupServiceFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    if (!filterButtons.length || !serviceCards.length) return;

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Filter services
        const filter = button.dataset.filter;
        
        serviceCards.forEach(card => {
          if (filter === 'all' || card.dataset.type === filter) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  setupModals() {
    // Modal triggers
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close, .modal-overlay');

    // Open modal
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.dataset.modal;
        const modal = document.getElementById(modalId);
        if (modal) {
          this.openModal(modal);
        }
      });
    });

    // Close modal
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        if (modal) {
          this.closeModal(modal);
        }
      });
    });

    // Close modal on overlay click
    modals.forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
          this.closeModal(openModal);
        }
      }
    });
  }

  openModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Focus management
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length) {
      focusableElements[0].focus();
    }
  }

  closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  setupNotifications() {
    // Auto-hide notifications
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
      setTimeout(() => {
        this.hideNotification(notification);
      }, 5000);
    });
  }

  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${this.getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto-hide
    setTimeout(() => {
      this.hideNotification(notification);
    }, duration);

    // Manual close
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.hideNotification(notification);
    });
  }

  hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
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

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for search (if implemented)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearch();
      }

      // Ctrl/Cmd + / for help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        this.showHelp();
      }
    });
  }

  setupResizeEvents() {
    let resizeTimer;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.isMobile = window.innerWidth <= 768;
        this.handleResize();
      }, 250);
    });
  }

  handleResize() {
    // Recalculate layout-dependent features
    this.updateNavigationLayout();
    this.updateServiceCards();
    
    // Reinitialize mouse effects on desktop
    if (!this.isMobile && !document.querySelector('.cursor')) {
      this.createCustomCursor();
    } else if (this.isMobile) {
      // Remove custom cursor on mobile
      const cursor = document.querySelector('.cursor');
      const follower = document.querySelector('.cursor-follower');
      if (cursor) cursor.remove();
      if (follower) follower.remove();
    }
  }

  updateNavigationLayout() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && !this.isMobile) {
      navMenu.classList.remove('active');
    }
  }

  updateServiceCards() {
    // Adjust service cards layout based on screen size
    const serviceGrid = document.querySelector('.services-grid');
    if (serviceGrid) {
      if (this.isMobile) {
        serviceGrid.style.gridTemplateColumns = '1fr';
      } else {
        serviceGrid.style.gridTemplateColumns = '';
      }
    }
  }

  smoothScrollTo(target) {
    const headerHeight = document.querySelector('.navbar')?.offsetHeight || 0;
    const targetPosition = target.offsetTop - headerHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  setupPerformanceMonitoring() {
    // Monitor page load performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Performance:', {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          totalTime: perfData.loadEventEnd - perfData.navigationStart
        });
      });
    }

    // Monitor Core Web Vitals (simplified)
    this.monitorCoreWebVitals();
  }

  monitorCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  // Utility methods
  debounce(func, wait) {
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

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return new Date(date).toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
  }

  copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showNotification('Copied to clipboard!', 'success');
      }).catch(() => {
        this.fallbackCopyToClipboard(text);
      });
    } else {
      this.fallbackCopyToClipboard(text);
    }
  }

  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showNotification('Copied to clipboard!', 'success');
    } catch (err) {
      this.showNotification('Failed to copy text', 'error');
    }
    
    document.body.removeChild(textArea);
  }

  // Service ordering with PayPal
  orderService(serviceId) {
    // Show loading state
    const button = document.querySelector(`[data-service-id="${serviceId}"]`);
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirection...';
    }

    // Get service details
    const serviceData = this.getServiceDetails(serviceId);
    
    // Initiate PayPal payment
    this.initiatePayPalPayment(serviceData.price, serviceData.description);
  }

  getServiceDetails(serviceId) {
    const services = {
      'starter': {
        price: '4.99',
        description: 'Starter Hosting Plan'
      },
      'professional': {
        price: '9.99',
        description: 'Professional Hosting Plan'
      },
      'vps': {
        price: '29.99',
        description: 'VPS Hosting Plan'
      }
    };
    
    return services[serviceId] || { price: '0.00', description: 'Service' };
  }

  // Search functionality
  openSearch() {
    console.log('Search functionality would be implemented here');
    this.showNotification('Search coming soon!', 'info');
  }

  // Help system
  showHelp() {
    this.showNotification('Help system coming soon!', 'info');
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.craftpick = new CraftPickHosting();
});

// Export for external use
window.CraftPickHosting = CraftPickHosting;
