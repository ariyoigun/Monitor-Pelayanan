/**
 * SIMOPEL DINPUTARU DEMAK - Main Application Controller
 */

const App = {
  currentView: 'landing',

  init() {
    // 1. Initialize Auth
    Auth.init();

    // 2. Initialize Monitoring Engine
    Monitoring.init();

    // 3. Initialize User Management
    UserManagement.init();

    // 4. Setup Global Nav & View Switcher
    this.setupNavigation();

    // 5. Setup Quick Role Switcher in Top Bar
    this.setupQuickRoleSwitcher();

    // 6. Check URL hash or default view
    this.handleRouting();
  },

  showView(viewName) {
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

    // Special checks per view
    if (viewName === 'dashboard') {
      Monitoring.refreshData();
    } else if (viewName === 'users') {
      if (!Auth.isSuperAdmin()) {
        alert('Akses Terbatas: Hanya role Superadmin yang dapat mengakses Manajemen User.');
        this.showView('dashboard');
        return;
      }
      UserManagement.refreshUsers();
    }

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

    // Login Form Submission
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        const result = Auth.login(username, password);
        if (result.success) {
          alert(`Selamat datang, ${result.user.nama} (${result.user.roleLabel})!`);
          this.showView('dashboard');
          window.location.hash = 'dashboard';
        } else {
          alert(result.message);
        }
      });
    }

    // Logout buttons
    document.querySelectorAll('.btn-logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        alert('Anda telah keluar dari sesi.');
        this.showView('landing');
        window.location.hash = 'landing';
      });
    });

    // Fast Public Tracker button in Landing
    const btnTrack = document.getElementById('btn-public-track');
    const inputTrack = document.getElementById('public-track-input');
    if (btnTrack && inputTrack) {
      btnTrack.addEventListener('click', () => {
        Tracker.trackPublicSubmission(inputTrack.value);
      });

      inputTrack.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          Tracker.trackPublicSubmission(inputTrack.value);
        }
      });
    }

    // Sample tags click in Public Tracker
    document.querySelectorAll('.sample-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        if (inputTrack) {
          inputTrack.value = tag.textContent.trim();
          Tracker.trackPublicSubmission(inputTrack.value);
        }
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

    // Reset Data Button (Developer / Demo helper)
    const btnReset = document.getElementById('btn-reset-demo-data');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Kembalikan semua data ke kondisi default awal (16 pengajuan percontohan Demak)?')) {
          resetToDefaultData();
          Auth.init();
          Monitoring.init();
          UserManagement.init();
          alert('Data percontohan berhasil direset!');
        }
      });
    }
  },

  setupQuickRoleSwitcher() {
    document.querySelectorAll('.role-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.dataset.roleUsername;
        if (username) {
          Auth.loginAs(username);
          const currentUser = Auth.getCurrentUser();
          Monitoring.refreshData();
          if (this.currentView === 'users' && !Auth.isSuperAdmin()) {
            this.showView('dashboard');
          }
          // Flash feedback
          console.log(`Role dialihkan ke: ${currentUser.nama} (${currentUser.roleLabel})`);
        }
      });
    });
  }
};

// Initialize App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
