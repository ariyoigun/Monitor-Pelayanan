/**
 * SIKEREN DINPUTARU DEMAK - Main Application Controller
 * Sistem Informasi Keterangan Pelayanan Perizinan
 * Routing, Navigation & Authentication Guards
 */

const App = {
  currentView: 'landing',

  init() {
    // 1. Initialize Auth
    Auth.init();

    // 2. Initialize System Settings & Dynamic Texts
    if (typeof SystemSettings !== 'undefined') {
      SystemSettings.init();
    }

    // 3. Initialize Public Infographics Engine
    if (typeof Infografis !== 'undefined') {
      Infografis.init();
    }

    // 4. Initialize Visitor Portal Engine
    if (typeof Portal !== 'undefined') {
      Portal.init();
    }

    // 5. Initialize Internal Monitoring Engine
    if (typeof Monitoring !== 'undefined') {
      Monitoring.init();
    }

    // 6. Initialize User Management
    if (typeof UserManagement !== 'undefined') {
      UserManagement.init();
    }

    // 7. Setup Global Navigation & Event Listeners
    this.setupNavigation();

    // 8. Handle initial URL hash
    this.handleRouting();
  },

  showView(viewName) {
    let internalSubTab = null;
    if (['pengajuan', 'users', 'settings'].includes(viewName)) {
      internalSubTab = viewName;
      viewName = 'dashboard';
    }

    // Route Guards for Protected Views
    if (viewName === 'portal') {
      this.showView('landing');
      window.location.hash = 'landing';
      return;
    } else if (viewName === 'dashboard') {
      if (!Auth.isLoggedIn()) {
        alert('Akses Terbatas: Dashboard monitoring internal memerlukan autentikasi login petugas.');
        this.showView('login');
        window.location.hash = 'login';
        return;
      }
      Monitoring.refreshData();
      if (internalSubTab) {
        if ((internalSubTab === 'users' || internalSubTab === 'settings') && !Auth.isSuperAdmin()) {
          alert('Akses Terbatas: Hanya role Superadmin yang dapat mengakses menu tersebut.');
          Monitoring.switchSubView('ringkasan');
        } else {
          Monitoring.switchSubView(internalSubTab);
        }
      } else {
        Monitoring.switchSubView(Monitoring.currentSubView || 'ringkasan');
      }
    } else if (viewName === 'login') {
      // Regenerate CAPTCHA when visiting login page
      Auth.generateCaptcha();
    } else if (viewName === 'landing') {
      if (typeof Infografis !== 'undefined') {
        Infografis.renderInfographics();
      }
      if (typeof SystemSettings !== 'undefined') {
        SystemSettings.applyTextsToDOM();
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

    // Hide public footer when in internal dashboard for clean full-height admin workspace
    const footer = document.querySelector('.main-footer');
    if (footer) {
      footer.style.display = (viewName === 'dashboard') ? 'none' : '';
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
    if (['landing', 'login', 'dashboard', 'pengajuan', 'users', 'settings'].includes(hash)) {
      this.showView(hash);
    } else {
      this.showView('landing');
    }
  },

  handleAjukanLayanan(layanan) {
    if (!Auth.isLoggedIn()) {
      sessionStorage.setItem('pending_service', layanan);
      alert(`Untuk melakukan pengajuan permohonan ${layanan}, pengunjung/pemohon harus login terlebih dahulu. Silakan masuk atau daftar akun baru jika belum memiliki akun.`);
      this.showView('login');
      window.location.hash = 'login';
    } else {
      this.showView('portal');
      window.location.hash = 'portal';
      setTimeout(() => {
        if (typeof Portal !== 'undefined') {
          Portal.openService(layanan);
        }
      }, 150);
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

    // Tab Switching on Login/Register page
    const tabBtnLogin = document.getElementById('tab-btn-login');
    const tabBtnRegister = document.getElementById('tab-btn-register');
    const loginCardBody = document.getElementById('auth-login-card-body');
    const registerCardBody = document.getElementById('auth-register-card-body');

    if (tabBtnLogin && tabBtnRegister) {
      tabBtnLogin.addEventListener('click', () => {
        tabBtnLogin.classList.add('active');
        tabBtnRegister.classList.remove('active');
        if (loginCardBody) loginCardBody.style.display = 'block';
        if (registerCardBody) registerCardBody.style.display = 'none';
        Auth.generateCaptcha();
      });

      tabBtnRegister.addEventListener('click', () => {
        tabBtnRegister.classList.add('active');
        tabBtnLogin.classList.remove('active');
        if (loginCardBody) loginCardBody.style.display = 'none';
        if (registerCardBody) registerCardBody.style.display = 'block';
        Auth.generateRegisterCaptcha();
      });
    }

    // Direct link "Belum punya akun? Daftar" or "Sudah punya akun? Masuk"
    document.querySelectorAll('.switch-to-register').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (tabBtnRegister) tabBtnRegister.click();
      });
    });

    document.querySelectorAll('.switch-to-login').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (tabBtnLogin) tabBtnLogin.click();
      });
    });

    // Login Form Submission (Khusus Petugas Internal)
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const identifier = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const captchaInput = document.getElementById('login-captcha-input').value.trim();

        const result = Auth.login(identifier, password, captchaInput);
        if (result.success) {
          alert(`Selamat datang di SIKEREN, ${result.user.nama} (${result.user.roleLabel})!`);
          this.showView('dashboard');
          window.location.hash = 'dashboard';
        } else {
          alert(result.message);
        }
      });
    }

    // CAPTCHA Refresh Buttons
    const btnRefreshCaptcha = document.getElementById('btn-refresh-captcha');
    if (btnRefreshCaptcha) {
      btnRefreshCaptcha.addEventListener('click', () => {
        Auth.generateCaptcha();
      });
    }

    const btnRefreshRegCaptcha = document.getElementById('btn-refresh-reg-captcha');
    if (btnRefreshRegCaptcha) {
      btnRefreshRegCaptcha.addEventListener('click', () => {
        Auth.generateRegisterCaptcha();
      });
    }

    // Logout buttons
    document.querySelectorAll('.btn-logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        alert('Anda telah keluar dari sesi SIKEREN.');
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
