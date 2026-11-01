/**
 * SIMOPEL DINPUTARU DEMAK - Authentication & Role Permission Manager
 */

const Auth = {
  currentUser: null,

  init() {
    this.currentUser = getStoredCurrentUser();
    this.updateUserUI();
  },

  getCurrentUser() {
    return this.currentUser;
  },

  login(username, password) {
    const users = getStoredUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return { success: false, message: "Username tidak ditemukan di sistem!" };
    }

    if (user.password !== password && password !== "password123") {
      return { success: false, message: "Kata sandi salah! Coba password demo: password123" };
    }

    this.currentUser = user;
    saveStoredCurrentUser(user);
    this.updateUserUI();
    return { success: true, user };
  },

  loginAs(username) {
    const users = getStoredUsers();
    const user = users.find(u => u.username === username);
    if (user) {
      this.currentUser = user;
      saveStoredCurrentUser(user);
      this.updateUserUI();
      return true;
    }
    return false;
  },

  logout() {
    // Return to guest / login state
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
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
    const userBadges = document.querySelectorAll('.dynamic-user-badge');
    const userNames = document.querySelectorAll('.dynamic-user-name');
    const userRoles = document.querySelectorAll('.dynamic-user-role');
    const userAvatars = document.querySelectorAll('.dynamic-user-avatar');
    const roleSwitchBtns = document.querySelectorAll('.role-switch-btn');
    const superadminOnlyEls = document.querySelectorAll('.superadmin-only');
    const btnLogouts = document.querySelectorAll('.btn-logout');
    const btnLogins = document.querySelectorAll('.btn-login');

    if (this.currentUser) {
      userNames.forEach(el => el.textContent = this.currentUser.nama);
      userRoles.forEach(el => el.textContent = this.currentUser.roleLabel + (this.currentUser.bidangLabel ? ` (${this.currentUser.bidangLabel})` : ''));
      userAvatars.forEach(el => el.src = this.currentUser.avatar || 'assets/logo.svg');

      // Update active state on quick role switcher
      roleSwitchBtns.forEach(btn => {
        if (btn.dataset.roleUsername === this.currentUser.username) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Show Superadmin menus if superadmin
      superadminOnlyEls.forEach(el => {
        el.style.display = this.isSuperAdmin() ? '' : 'none';
      });

      // Show logout button, hide login button
      btnLogouts.forEach(el => el.style.display = 'inline-flex');
      btnLogins.forEach(el => el.style.display = 'none');
    } else {
      userNames.forEach(el => el.textContent = "Tamu / Pengunjung");
      userRoles.forEach(el => el.textContent = "Belum Masuk");
      superadminOnlyEls.forEach(el => el.style.display = 'none');
      roleSwitchBtns.forEach(btn => btn.classList.remove('active'));

      // Hide logout button, show login button
      btnLogouts.forEach(el => el.style.display = 'none');
      btnLogins.forEach(el => el.style.display = 'inline-flex');
    }
  }
};
