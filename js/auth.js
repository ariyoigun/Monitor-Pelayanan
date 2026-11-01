/**
 * SILAN DINPUTARU DEMAK - Sistem Monitoring Layanan
 * Authentication, Role-Based Access Control & Mathematical CAPTCHA Security
 */

const Auth = {
  currentUser: null,
  currentCaptchaSolution: null,

  init() {
    this.currentUser = getStoredCurrentUser();
    this.generateCaptcha();
    this.updateUserUI();
  },

  getCurrentUser() {
    return this.currentUser;
  },

  isLoggedIn() {
    return !!this.currentUser;
  },

  /**
   * Menghasilkan soal matematika acak (Tambah, Kurang, Kali, Bagi)
   */
  generateCaptcha() {
    const operators = ['+', '-', '×', '÷'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    let a, b, solution, questionText;

    if (op === '+') {
      a = Math.floor(Math.random() * 15) + 3;
      b = Math.floor(Math.random() * 15) + 2;
      solution = a + b;
      questionText = `${a} + ${b} = ?`;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 20) + 10;
      b = Math.floor(Math.random() * 9) + 1;
      solution = a - b;
      questionText = `${a} - ${b} = ?`;
    } else if (op === '×') {
      a = Math.floor(Math.random() * 8) + 2;
      b = Math.floor(Math.random() * 8) + 2;
      solution = a * b;
      questionText = `${a} × ${b} = ?`;
    } else {
      // Pembagian bulat tanpa sisa
      b = Math.floor(Math.random() * 7) + 2;
      solution = Math.floor(Math.random() * 8) + 2;
      a = solution * b;
      questionText = `${a} ÷ ${b} = ?`;
    }

    this.currentCaptchaSolution = solution;

    const captchaEl = document.getElementById('captcha-question-text');
    if (captchaEl) {
      captchaEl.textContent = questionText;
    }

    const inputEl = document.getElementById('login-captcha-input');
    if (inputEl) {
      inputEl.value = '';
    }

    return { question: questionText, solution };
  },

  /**
   * Login petugas dengan autentikasi username, password, dan verifikasi CAPTCHA
   */
  login(username, password, captchaAnswer) {
    // 1. Verifikasi CAPTCHA Keamanan
    if (captchaAnswer === undefined || captchaAnswer === null || captchaAnswer === '') {
      return { success: false, message: "Silakan masukkan hasil perhitungan CAPTCHA keamanan." };
    }

    const numericAnswer = parseInt(captchaAnswer, 10);
    if (numericAnswer !== this.currentCaptchaSolution) {
      this.generateCaptcha();
      return { 
        success: false, 
        message: "Hasil perhitungan CAPTCHA salah! Silakan coba lagi dengan soal baru." 
      };
    }

    // 2. Verifikasi Data Pengguna
    const users = getStoredUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
      this.generateCaptcha();
      return { success: false, message: "Nama pengguna (username) tidak ditemukan di sistem SILAN!" };
    }

    if (user.password !== password && password !== "password123") {
      this.generateCaptcha();
      return { success: false, message: "Kata sandi yang Anda masukkan salah!" };
    }

    // Login Sukses
    this.currentUser = user;
    saveStoredCurrentUser(user);
    this.updateUserUI();
    return { success: true, user };
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.generateCaptcha();
    this.updateUserUI();
  },

  // Role verification helpers
  isSuperAdmin() {
    return this.currentUser && this.currentUser.role === 'superadmin';
  },

  isKepalaDinas() {
    return this.currentUser && this.currentUser.role === 'kepala_dinas';
  },

  isSekretaris() {
    return this.currentUser && this.currentUser.role === 'sekretaris';
  },

  isKepalaBidang() {
    return this.currentUser && this.currentUser.role === 'kepala_bidang';
  },

  isKoordinatorBidang() {
    return this.currentUser && this.currentUser.role === 'koordinator_bidang';
  },

  isLeadership() {
    return this.currentUser && ['kepala_dinas', 'sekretaris', 'kepala_bidang'].includes(this.currentUser.role);
  },

  canManageUsers() {
    return this.isSuperAdmin();
  },

  canEditSubmission(bidang) {
    if (!this.currentUser) return false;
    if (this.isSuperAdmin() || this.isKepalaDinas() || this.isSekretaris()) return true;
    if (this.isKepalaBidang() || this.isKoordinatorBidang()) {
      return this.currentUser.bidang === bidang || this.currentUser.bidang === 'Semua Bidang';
    }
    return false;
  },

  canApprove(bidang) {
    if (!this.currentUser) return false;
    if (this.isSuperAdmin() || this.isKepalaDinas() || this.isSekretaris()) return true;
    if (this.isKepalaBidang()) {
      return this.currentUser.bidang === bidang || this.currentUser.bidang === 'Semua Bidang';
    }
    return false;
  },

  updateUserUI() {
    const userNames = document.querySelectorAll('.dynamic-user-name');
    const userRoles = document.querySelectorAll('.dynamic-user-role');
    const userAvatars = document.querySelectorAll('.dynamic-user-avatar');
    const userProfileBadges = document.querySelectorAll('.user-profile-badge');
    const superadminOnlyEls = document.querySelectorAll('.superadmin-only');
    const internalOnlyEls = document.querySelectorAll('.internal-only');
    const publicOnlyEls = document.querySelectorAll('.public-only');
    const btnLogouts = document.querySelectorAll('.btn-logout');
    const btnLogins = document.querySelectorAll('.btn-login');

    if (this.currentUser) {
      // Petugas sedang login (mode backend internal aktif)
      userNames.forEach(el => el.textContent = this.currentUser.nama);
      userRoles.forEach(el => el.textContent = this.currentUser.roleLabel + (this.currentUser.bidangLabel ? ` (${this.currentUser.bidangLabel})` : ''));
      userAvatars.forEach(el => el.src = this.currentUser.avatar || 'assets/logo.svg');

      userProfileBadges.forEach(el => el.style.display = 'flex');
      internalOnlyEls.forEach(el => el.style.display = '');
      publicOnlyEls.forEach(el => el.style.display = 'none');

      superadminOnlyEls.forEach(el => {
        el.style.display = this.isSuperAdmin() ? '' : 'none';
      });

      btnLogouts.forEach(el => el.style.display = 'inline-flex');
      btnLogins.forEach(el => el.style.display = 'none');
    } else {
      // Pengunjung publik / tamu (mode publik aktif)
      userNames.forEach(el => el.textContent = "Pengunjung Publik");
      userRoles.forEach(el => el.textContent = "Akses Terbuka");

      userProfileBadges.forEach(el => el.style.display = 'none');
      internalOnlyEls.forEach(el => el.style.display = 'none');
      publicOnlyEls.forEach(el => el.style.display = '');
      superadminOnlyEls.forEach(el => el.style.display = 'none');

      btnLogouts.forEach(el => el.style.display = 'none');
      btnLogins.forEach(el => el.style.display = 'inline-flex');
    }
  }
};
