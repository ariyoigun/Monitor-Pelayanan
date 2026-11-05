/**
 * SIMOPEL DINPUTARU DEMAK - User Management Module (Superadmin Exclusive)
 */

const UserManagement = {
  users: [],

  init() {
    this.users = getStoredUsers();
    this.renderUsersTable();
    this.setupListeners();
  },

  refreshUsers() {
    this.users = getStoredUsers();
    this.renderUsersTable();
  },

  renderUsersTable() {
    const tbody = document.getElementById('user-management-tbody');
    if (!tbody) return;

    if (this.users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Belum ada user.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.users.map(u => {
      const isSuper = u.role === 'superadmin';
      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${u.avatar || 'assets/logo.svg'}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid var(--slate-300);" alt="${u.nama}" />
              <div>
                <div style="font-weight: 700; color: var(--slate-900); font-size: 0.88rem;">${u.nama}</div>
                <div style="font-size: 0.74rem; color: var(--slate-400);">NIP: ${u.nip || '-'}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="font-family: monospace; font-weight: 600; color: var(--slate-800);">${u.username}</span>
            <div style="font-size: 0.72rem; color: var(--slate-500);">${u.email || '-'}</div>
          </td>
          <td>
            <span class="badge ${this.getRoleBadgeClass(u.role)}">
              ${u.roleLabel || u.role}
            </span>
          </td>
          <td>
            <strong style="color: var(--slate-800); font-size: 0.82rem;">${u.bidangLabel || u.bidang || 'Semua Bidang'}</strong>
            <div style="font-size: 0.72rem; color: var(--slate-500);">${u.jabatan || '-'}</div>
          </td>
          <td>
            <span class="badge ${u.status === 'Aktif' ? 'badge-selesai' : 'badge-ditolak'}">
              ${u.status || 'Aktif'}
            </span>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn btn-outline btn-sm" onclick="UserManagement.openEditModal('${u.id}')" title="Edit Data User">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-outline btn-sm" onclick="UserManagement.resetPassword('${u.id}')" title="Reset Password">
              <i class="fas fa-key"></i> Reset
            </button>
            ${!isSuper ? `
              <button class="btn btn-danger btn-sm" onclick="UserManagement.deleteUser('${u.id}')" title="Hapus User">
                <i class="fas fa-trash"></i>
              </button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');
  },

  getRoleBadgeClass(role) {
    switch (role) {
      case 'superadmin': return 'badge-ditolak';
      case 'kepala_dinas': return 'badge-selesai';
      case 'sekretaris': return 'badge-sidang';
      case 'kepala_bidang': return 'badge-proses';
      case 'koordinator_bidang': return 'badge-pending';
      default: return 'badge-proses';
    }
  },

  /* Open Add User Modal */
  openAddModal() {
    const modal = document.getElementById('modal-user-form');
    if (!modal) return;
    document.getElementById('form-user').reset();
    document.getElementById('user-form-id').value = '';
    document.getElementById('modal-user-title').textContent = 'Tambah Pengguna Sistem Baru';
    modal.classList.add('active');
  },

  /* Open Edit User Modal */
  openEditModal(id) {
    const user = this.users.find(u => u.id === id);
    if (!user) return;

    const modal = document.getElementById('modal-user-form');
    if (!modal) return;

    document.getElementById('user-form-id').value = user.id;
    document.getElementById('modal-user-title').textContent = 'Ubah Data Pengguna: ' + user.nama;
    document.getElementById('user-input-nama').value = user.nama;
    document.getElementById('user-input-nip').value = user.nip || '';
    document.getElementById('user-input-username').value = user.username;
    document.getElementById('user-input-email').value = user.email || '';
    document.getElementById('user-input-hp').value = user.noHp || '';
    document.getElementById('user-input-role').value = user.role;
    document.getElementById('user-input-bidang').value = user.bidang || 'Semua Bidang';
    document.getElementById('user-input-jabatan').value = user.jabatan || '';
    document.getElementById('user-input-status').value = user.status || 'Aktif';

    modal.classList.add('active');
  },

  /* Save User (Create or Update) */
  handleSaveUser(e) {
    e.preventDefault();
    const id = document.getElementById('user-form-id').value;
    const nama = document.getElementById('user-input-nama').value;
    const nip = document.getElementById('user-input-nip').value;
    const username = document.getElementById('user-input-username').value;
    const email = document.getElementById('user-input-email').value;
    const noHp = document.getElementById('user-input-hp').value;
    const role = document.getElementById('user-input-role').value;
    const bidang = document.getElementById('user-input-bidang').value;
    const jabatan = document.getElementById('user-input-jabatan').value;
    const status = document.getElementById('user-input-status').value;

    const roleLabels = {
      superadmin: "Superadmin Sistem",
      kepala_dinas: "Kepala Dinas",
      sekretaris: "Sekretaris Dinas",
      kepala_bidang: "Kepala Bidang " + (bidang === 'TRP' ? 'TRP' : 'Cipta Karya'),
      koordinator_bidang: "Koordinator Teknis " + (bidang === 'TRP' ? 'TRP' : 'Cipta Karya')
    };

    const bidangLabels = {
      TRP: "Tata Ruang & Pertanahan",
      CK: "Cipta Karya",
      "Semua Bidang": "Semua Bidang"
    };

    if (id) {
      // Update existing
      const user = this.users.find(u => u.id === id);
      if (user) {
        user.nama = nama;
        user.nip = nip;
        user.username = username;
        user.email = email;
        user.noHp = noHp;
        user.role = role;
        user.roleLabel = roleLabels[role] || role;
        user.bidang = bidang;
        user.bidangLabel = bidangLabels[bidang] || bidang;
        user.jabatan = jabatan;
        user.status = status;

        if (typeof DataAPI !== 'undefined' && DataAPI.updateUser) {
          DataAPI.updateUser(id, user);
        }
      }
    } else {
      // Add new
      const newId = `USR-${String(this.users.length + 1).padStart(3, '0')}`;
      const newUser = {
        id: newId,
        username,
        password: "*Dinput4ru_01",
        nama,
        nip,
        email,
        noHp,
        role,
        roleLabel: roleLabels[role] || role,
        bidang,
        bidangLabel: bidangLabels[bidang] || bidang,
        jabatan,
        avatar: "assets/logo.svg",
        status
      };
      this.users.push(newUser);

      if (typeof DataAPI !== 'undefined' && DataAPI.saveUser) {
        DataAPI.saveUser(newUser);
      }
    }

    saveStoredUsers(this.users);
    this.renderUsersTable();
    document.getElementById('modal-user-form').classList.remove('active');
    alert('Data user berhasil disimpan!');
  },

  resetPassword(id) {
    const user = this.users.find(u => u.id === id);
    if (!user) return;
    if (confirm(`Reset password untuk ${user.nama} ke default "*Dinput4ru_01"?`)) {
      user.password = "*Dinput4ru_01";
      saveStoredUsers(this.users);
      if (typeof DataAPI !== 'undefined' && DataAPI.updateUser) {
        DataAPI.updateUser(id, user);
      }
      alert(`Password untuk ${user.username} berhasil di-reset menjadi "*Dinput4ru_01"`);
    }
  },

  deleteUser(id) {
    const user = this.users.find(u => u.id === id);
    if (!user) return;
    if (confirm(`Apakah Anda yakin ingin menghapus user ${user.nama} (${user.username})?`)) {
      this.users = this.users.filter(u => u.id !== id);
      saveStoredUsers(this.users);
      if (typeof DataAPI !== 'undefined' && DataAPI.deleteUser) {
        DataAPI.deleteUser(id);
      }
      this.renderUsersTable();
      alert(`User ${user.nama} berhasil dihapus.`);
    }
  },

  setupListeners() {
    const form = document.getElementById('form-user');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSaveUser(e));
    }
  }
};
