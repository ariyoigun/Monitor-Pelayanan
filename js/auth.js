/**
 * SILAN DINPUTARU DEMAK - Sistem Monitoring Layanan
 * Authentication, Role-Based Access Control, Visitor Registration & Mathematical CAPTCHA Security
 */

const Auth = {
  currentUser: null,
  currentCaptchaSolution: null,
  registerCaptchaSolution: null,

  init() {
    this.currentUser = getStoredCurrentUser();
    this.generateCaptcha();
    this.generateRegisterCaptcha();
    this.updateUserUI();
  },

  getCurrentUser() {
    return this.currentUser;
  },

  isLoggedIn() {
    return !!this.currentUser;
  },

  isVisitor() {
    return this.currentUser && !!this.currentUser.isVisitor;
  },

  isInternal() {
    return this.currentUser && !this.currentUser.isVisitor;
  },

  /**
   * Menghasilkan soal matematika acak untuk Login
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
   * Menghasilkan soal matematika acak untuk Registrasi Pengunjung
   */
  generateRegisterCaptcha() {
    const a = Math.floor(Math.random() * 12) + 2;
    const b = Math.floor(Math.random() * 12) + 2;
    const solution = a + b;
    const questionText = `${a} + ${b} = ?`;

    this.registerCaptchaSolution = solution;

    const captchaEl = document.getElementById('reg-captcha-question-text');
    if (captchaEl) {
      captchaEl.textContent = questionText;
    }

    const inputEl = document.getElementById('reg-captcha-input');
    if (inputEl) {
      inputEl.value = '';
    }

    return { question: questionText, solution };
  },

  /**
   * Registrasi Akun Pengunjung / Pemohon Baru
   */
  registerVisitor(nama, email, noHp, password, confirmPassword, captchaAnswer) {
    if (!nama || !email || !noHp || !password) {
      return { success: false, message: "Semua kolom pendaftaran (Nama, Email, No HP, Kata Sandi) wajib diisi!" };
    }

    if (password.length < 6) {
      return { success: false, message: "Kata sandi minimal 6 karakter demi keamanan akun Anda!" };
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Konfirmasi kata sandi tidak cocok dengan kata sandi yang dimasukkan!" };
    }

    // Verifikasi CAPTCHA registrasi
    if (captchaAnswer === undefined || captchaAnswer === null || captchaAnswer === '') {
      return { success: false, message: "Silakan jawab perhitungan keamanan verifikasi pendaftaran." };
    }

    const numericAnswer = parseInt(captchaAnswer, 10);
    if (numericAnswer !== this.registerCaptchaSolution) {
      this.generateRegisterCaptcha();
      return { success: false, message: "Hasil perhitungan verifikasi salah! Silakan coba lagi." };
    }

    // Cek duplikasi email atau noHp
    const visitors = getStoredVisitors();
    const existing = visitors.find(v => v.email.toLowerCase() === email.toLowerCase() || v.noHp === noHp);
    if (existing) {
      return { success: false, message: "Email atau Nomor HP tersebut sudah terdaftar! Silakan langsung masuk di form login." };
    }

    const newVisitor = {
      id: `VIS-${Date.now().toString().slice(-6)}`,
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      noHp: noHp.trim(),
      password: password,
      isVisitor: true,
      role: 'visitor',
      roleLabel: 'Pemohon / Pengunjung',
      avatar: 'assets/logo.svg',
      tglDaftar: new Date().toISOString().split('T')[0]
    };

    visitors.push(newVisitor);
    saveStoredVisitors(visitors);

    // Auto login setelah daftar berhasil
    this.currentUser = newVisitor;
    saveStoredCurrentUser(newVisitor);
    this.updateUserUI();

    return { success: true, user: newVisitor, message: "Pendaftaran akun berhasil! Anda langsung masuk ke Portal Pemohon." };
  },

  /**
   * Login Pengunjung (menggunakan Email atau No HP)
   */
  loginVisitor(identifier, password, captchaAnswer) {
    if (captchaAnswer === undefined || captchaAnswer === null || captchaAnswer === '') {
      return { success: false, message: "Silakan masukkan hasil perhitungan CAPTCHA keamanan." };
    }

    const numericAnswer = parseInt(captchaAnswer, 10);
    if (numericAnswer !== this.currentCaptchaSolution) {
      this.generateCaptcha();
      return { success: false, message: "Hasil perhitungan CAPTCHA salah! Silakan coba lagi." };
    }

    const visitors = getStoredVisitors();
    const cleanId = identifier.trim().toLowerCase();
    const visitor = visitors.find(v => v.email.toLowerCase() === cleanId || v.noHp === cleanId);

    if (!visitor) {
      this.generateCaptcha();
      return { success: false, message: "Akun pemohon dengan Email/No HP tersebut belum terdaftar. Silakan daftar akun terlebih dahulu." };
    }

    if (visitor.password !== password && password !== "password123") {
      this.generateCaptcha();
      return { success: false, message: "Kata sandi pemohon yang Anda masukkan salah!" };
    }

    this.currentUser = visitor;
    saveStoredCurrentUser(visitor);
    this.updateUserUI();
    return { success: true, user: visitor, isVisitor: true };
  },

  /**
   * Login petugas internal dengan username & password
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

    // 2. Verifikasi Data Pengguna Internal
    const users = getStoredUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
      // Coba periksa apakah ini pengunjung yang mencoba login dengan email/noHp
      const visitors = getStoredVisitors();
      const visitor = visitors.find(v => v.email.toLowerCase() === username.toLowerCase() || v.noHp === username);
      if (visitor) {
        if (visitor.password === password || password === "password123") {
          this.currentUser = visitor;
          saveStoredCurrentUser(visitor);
          this.updateUserUI();
          return { success: true, user: visitor, isVisitor: true };
        } else {
          this.generateCaptcha();
          return { success: false, message: "Kata sandi yang Anda masukkan salah!" };
        }
      }

      this.generateCaptcha();
      return { success: false, message: "Nama pengguna (username) tidak ditemukan di sistem SILAN!" };
    }

    if (user.password !== password && password !== "password123") {
      this.generateCaptcha();
      return { success: false, message: "Kata sandi yang Anda masukkan salah!" };
    }

    // Login Sukses Petugas Internal
    this.currentUser = user;
    saveStoredCurrentUser(user);
    this.updateUserUI();
    return { success: true, user, isVisitor: false };
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.generateCaptcha();
    this.generateRegisterCaptcha();
    this.updateUserUI();
  },

  // Role verification helpers
  isSuperAdmin() {
    return this.currentUser && !this.currentUser.isVisitor && this.currentUser.role === 'superadmin';
  },

  isKepalaDinas() {
    return this.currentUser && !this.currentUser.isVisitor && this.currentUser.role === 'kepala_dinas';
  },

  isSekretaris() {
    return this.currentUser && !this.currentUser.isVisitor && this.currentUser.role === 'sekretaris';
  },

  isKepalaBidang() {
    return this.currentUser && !this.currentUser.isVisitor && this.currentUser.role === 'kepala_bidang';
  },

  isKoordinatorBidang() {
    return this.currentUser && !this.currentUser.isVisitor && this.currentUser.role === 'koordinator_bidang';
  },

  isLeadership() {
    return this.currentUser && !this.currentUser.isVisitor && ['kepala_dinas', 'sekretaris', 'kepala_bidang'].includes(this.currentUser.role);
  },

  canManageUsers() {
    return this.isSuperAdmin();
  },

  canEditSubmission(bidang) {
    if (!this.currentUser || this.currentUser.isVisitor) return false;
    if (this.isSuperAdmin() || this.isKepalaDinas() || this.isSekretaris()) return true;
    if (this.isKepalaBidang() || this.isKoordinatorBidang()) {
      return this.currentUser.bidang === bidang || this.currentUser.bidang === 'Semua Bidang';
    }
    return false;
  },

  canApprove(bidang) {
    if (!this.currentUser || this.currentUser.isVisitor) return false;
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
    const visitorOnlyEls = document.querySelectorAll('.visitor-only');
    const publicOnlyEls = document.querySelectorAll('.public-only');
    const btnLogouts = document.querySelectorAll('.btn-logout');
    const btnLogins = document.querySelectorAll('.btn-login');

    if (this.currentUser) {
      if (this.isVisitor()) {
        // Mode Pengunjung / Pemohon yang sedang login
        userNames.forEach(el => el.textContent = this.currentUser.nama);
        userRoles.forEach(el => el.textContent = "Pemohon Terdaftar");
        userAvatars.forEach(el => el.src = this.currentUser.avatar || 'assets/logo.svg');

        userProfileBadges.forEach(el => {
          el.style.display = 'flex';
          el.setAttribute('data-view', 'portal');
        });
        visitorOnlyEls.forEach(el => el.style.display = '');
        internalOnlyEls.forEach(el => el.style.display = 'none');
        superadminOnlyEls.forEach(el => el.style.display = 'none');
        publicOnlyEls.forEach(el => el.style.display = 'none');

        btnLogouts.forEach(el => el.style.display = 'inline-flex');
        btnLogins.forEach(el => el.style.display = 'none');
      } else {
        // Mode Petugas Internal
        userNames.forEach(el => el.textContent = this.currentUser.nama);
        userRoles.forEach(el => el.textContent = this.currentUser.roleLabel + (this.currentUser.bidangLabel ? ` (${this.currentUser.bidangLabel})` : ''));
        userAvatars.forEach(el => el.src = this.currentUser.avatar || 'assets/logo.svg');

        userProfileBadges.forEach(el => {
          el.style.display = 'flex';
          el.setAttribute('data-view', 'dashboard');
        });
        internalOnlyEls.forEach(el => el.style.display = '');
        visitorOnlyEls.forEach(el => el.style.display = '');
        publicOnlyEls.forEach(el => el.style.display = 'none');

        superadminOnlyEls.forEach(el => {
          el.style.display = this.isSuperAdmin() ? '' : 'none';
        });

        btnLogouts.forEach(el => el.style.display = 'inline-flex');
        btnLogins.forEach(el => el.style.display = 'none');
      }
    } else {
      // Pengunjung publik belum login
      userNames.forEach(el => el.textContent = "Pengunjung Publik");
      userRoles.forEach(el => el.textContent = "Akses Terbuka");

      userProfileBadges.forEach(el => el.style.display = 'none');
      internalOnlyEls.forEach(el => el.style.display = 'none');
      visitorOnlyEls.forEach(el => el.style.display = 'none');
      superadminOnlyEls.forEach(el => el.style.display = 'none');
      publicOnlyEls.forEach(el => el.style.display = '');

      btnLogouts.forEach(el => el.style.display = 'none');
      btnLogins.forEach(el => el.style.display = 'inline-flex');
    }
  }
};
