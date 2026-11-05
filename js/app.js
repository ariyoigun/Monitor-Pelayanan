/**
 * SILAN DINPUTARU DEMAK - Main Application Controller
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
    // Route Guards for Protected Views
    if (viewName === 'portal') {
      if (!Auth.isLoggedIn()) {
        alert('Untuk mengakses formulir pengajuan KTTR dan Validasi OSS, pemohon/pengunjung harus masuk (login) atau mendaftar akun terlebih dahulu.');
        this.showView('login');
        window.location.hash = 'login';
        return;
      }
      if (typeof Portal !== 'undefined') {
        Portal.updateVisitorProfile();
      }
    } else if (viewName === 'dashboard') {
      if (!Auth.isLoggedIn()) {
        alert('Akses Terbatas: Dashboard monitoring internal memerlukan autentikasi login petugas.');
        this.showView('login');
        window.location.hash = 'login';
        return;
      }
      if (Auth.isVisitor()) {
        alert('Perhatian: Akun Anda adalah akun Pemohon Layanan. Anda diarahkan ke Portal Pengajuan Layanan.');
        this.showView('portal');
        window.location.hash = 'portal';
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
    } else if (viewName === 'settings') {
      if (!Auth.isLoggedIn()) {
        this.showView('login');
        window.location.hash = 'login';
        return;
      }
      if (!Auth.isSuperAdmin()) {
        alert('Akses Terbatas: Hanya role Superadmin yang dapat mengakses Pengaturan Teks Sistem.');
        this.showView('dashboard');
        window.location.hash = 'dashboard';
        return;
      }
      if (typeof SystemSettings !== 'undefined') {
        SystemSettings.refresh();
      }
    } else if (viewName === 'login') {
      // Regenerate CAPTCHAs when visiting login page
      Auth.generateCaptcha();
      Auth.generateRegisterCaptcha();
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
    if (['landing', 'portal', 'login', 'dashboard', 'users', 'settings'].includes(hash)) {
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

    // Login Form Submission
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const identifier = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const captchaInput = document.getElementById('login-captcha-input').value.trim();

        const result = Auth.login(identifier, password, captchaInput);
        if (result.success) {
          alert(`Selamat datang di SILAN, ${result.user.nama} (${result.user.roleLabel})!`);
          
          if (result.isVisitor) {
            const pendingService = sessionStorage.getItem('pending_service');
            this.showView('portal');
            window.location.hash = 'portal';
            if (pendingService) {
              sessionStorage.removeItem('pending_service');
              setTimeout(() => {
                if (typeof Portal !== 'undefined') Portal.openService(pendingService);
              }, 200);
            }
          } else {
            this.showView('dashboard');
            window.location.hash = 'dashboard';
          }
        } else {
          alert(result.message);
        }
      });
    }

    // Visitor Registration Form Submission
    const registerForm = document.getElementById('form-register-visitor');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nama = document.getElementById('reg-nama').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const noHp = document.getElementById('reg-nohp').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        const confirmPassword = document.getElementById('reg-password-confirm').value.trim();
        const captcha = document.getElementById('reg-captcha-input').value.trim();

        const result = Auth.registerVisitor(nama, email, noHp, password, confirmPassword, captcha);
        if (result.success) {
          alert(result.message);
          const pendingService = sessionStorage.getItem('pending_service');
          this.showView('portal');
          window.location.hash = 'portal';
          if (pendingService) {
            sessionStorage.removeItem('pending_service');
            setTimeout(() => {
              if (typeof Portal !== 'undefined') Portal.openService(pendingService);
            }, 200);
          }
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
        alert('Anda telah keluar dari sesi SILAN.');
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
