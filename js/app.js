/**
 * SILAN DINPUTARU DEMAK - Main Application Controller
 * Routing, Navigation & Authentication Guards
 */

const App = {
  currentView: 'landing',

  init() {
    // 1. Initialize Auth
    Auth.init();

    // 2. Initialize Public Infographics Engine
    if (typeof Infografis !== 'undefined') {
      Infografis.init();
    }

    // 3. Initialize Internal Monitoring Engine
    if (typeof Monitoring !== 'undefined') {
      Monitoring.init();
    }

    // 4. Initialize User Management
    if (typeof UserManagement !== 'undefined') {
      UserManagement.init();
    }

    // 5. Setup Global Navigation & Event Listeners
    this.setupNavigation();

    // 6. Handle initial URL hash
    this.handleRouting();
  },

  showView(viewName) {
    // Route Guards for Protected Internal Views
    if (viewName === 'dashboard') {
      if (!Auth.isLoggedIn()) {
        alert('Akses Terbatas: Dashboard monitoring internal memerlukan autentikasi login petugas.');
        this.showView('login');
        window.location.hash = 'login';
        return;
      }
      Monitoring.refreshData();
    } else if (viewName === 'users') {
      if (!Auth.isLoggedIn()) {
        this.showView('login');
        window.location.hash = 'login';
        return;
      }
      if (!Auth.isSuperAdmin()) {
        alert('Akses Terbatas: Hanya role Superadmin yang dapat mengakses Manajemen Pengguna.');
        this.showView('dashboard');
        window.location.hash = 'dashboard';
        return;
      }
      UserManagement.refreshUsers();
    } else if (viewName === 'login') {
      // Regenerate CAPTCHA when visiting login page
      Auth.generateCaptcha();
    } else if (viewName === 'landing') {
      if (typeof Infografis !== 'undefined') {
        Infografis.renderInfographics();
      }
    }

    this.currentView = viewName;

    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update nav links active status
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update UI elements based on auth state
    Auth.updateUserUI();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  handleRouting() {
    const hash = window.location.hash.replace('#', '');
    if (['landing', 'login', 'dashboard', 'users'].includes(hash)) {
      this.showView(hash);
    } else {
      this.showView('landing');
    }
  },

  setupNavigation() {
    // Links with data-view
    document.querySelectorAll('[data-view]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = el.dataset.view;
        this.showView(targetView);
        window.location.hash = targetView;
      });
    });

    // Hash change listener
    window.addEventListener('hashchange', () => {
      this.handleRouting();
    });

    // Login Form Submission with Mathematical CAPTCHA Verification
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const captchaInput = document.getElementById('login-captcha-input').value.trim();

        const result = Auth.login(username, password, captchaInput);
        if (result.success) {
          alert(`Selamat datang di SILAN, ${result.user.nama} (${result.user.roleLabel})!`);
          this.showView('dashboard');
          window.location.hash = 'dashboard';
        } else {
          alert(result.message);
        }
      });
    }

    // CAPTCHA Refresh Button
    const btnRefreshCaptcha = document.getElementById('btn-refresh-captcha');
    if (btnRefreshCaptcha) {
      btnRefreshCaptcha.addEventListener('click', () => {
        Auth.generateCaptcha();
      });
    }

    // Logout buttons
    document.querySelectorAll('.btn-logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        alert('Anda telah keluar dari sesi internal SILAN.');
        this.showView('landing');
        window.location.hash = 'landing';
      });
    });

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('btn-mobile-menu');
    const navMenu = document.querySelector('.nav-center-menu');
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('mobile-open');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          if (navMenu.classList.contains('mobile-open')) {
            icon.className = 'fas fa-times';
          } else {
            icon.className = 'fas fa-bars';
          }
        }
      });

      // Close menu on link click
      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('mobile-open');
          const icon = mobileToggle.querySelector('i');
          if (icon) icon.className = 'fas fa-bars';
        });
      });
    }
  }
};

// Initialize App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
