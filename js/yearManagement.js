/**
 * SIKEREN DINPUTARU DEMAK - Manajemen Tahun Pelayanan
 * Sistem Informasi Layanan Perizinan DINPUTARU Kab. Demak
 * Fitur Pengelolaan Tahun Periode Pelaporan (Superadmin)
 */

const YearManagement = {
  years: [],
  editingYear: null,

  async init() {
    await this.refreshYears();
    this.setupListeners();
  },

  async refreshYears() {
    try {
      const res = await fetch('/api/years');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          this.years = json.data;
          saveStoredYears(this.years);
        } else {
          this.years = getStoredYears();
        }
      } else {
        this.years = getStoredYears();
      }
    } catch (e) {
      this.years = getStoredYears();
    }

    this.renderYearsTable();
  },

  renderYearsTable() {
    const tbody = document.getElementById('year-management-tbody');
    if (!tbody) return;

    if (!this.years || this.years.length === 0) {
      this.years = getStoredYears();
    }

    // Sort descending by year
    const sorted = [...this.years].sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));

    // Get current counts if in offline mode
    const submissions = typeof getStoredSubmissions === 'function' ? getStoredSubmissions() : [];

    tbody.innerHTML = sorted.map(y => {
      const isDefault = y.isDefault || y.is_default === 1 || y.is_default === true;
      const isAktif = (y.status || 'AKTIF').toUpperCase() === 'AKTIF';
      const yearCount = y.totalSubmissions !== undefined ? 
        y.totalSubmissions : 
        submissions.filter(s => (s.tglPengajuan || '').startsWith(String(y.year))).length;

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-weight: 800; font-size: 1.05rem; color: #0f172a;">${y.year}</span>
              ${isDefault ? `<span class="badge" style="background: #e0f2fe; color: #0284c7; font-weight: 700; font-size: 0.7rem;"><i class="fas fa-star"></i> Default</span>` : ''}
            </div>
          </td>
          <td>
            <span style="font-weight: 600; color: #1e293b;">${y.label || ('Tahun ' + y.year)}</span>
          </td>
          <td>
            <span class="badge ${isAktif ? 'badge-selesai' : 'badge-batal'}" style="font-size: 0.72rem;">
              ${isAktif ? '<i class="fas fa-check-circle"></i> AKTIF' : '<i class="fas fa-times-circle"></i> NONAKTIF'}
            </span>
          </td>
          <td>
            ${isDefault ? 
              `<span class="badge" style="background: #ecfdf5; color: #047857; font-weight: 700; font-size: 0.72rem;">Tahun Utama Aktif</span>` : 
              `<button type="button" class="btn btn-outline btn-sm" onclick="YearManagement.setDefaultYear('${y.year}')" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;" title="Jadikan tahun default sistem">
                <i class="far fa-star"></i> Jadikan Default
              </button>`
            }
          </td>
          <td>
            <span class="badge" style="background: #f1f5f9; color: #334155; font-weight: 700;">
              ${yearCount.toLocaleString('id-ID')} Berkas
            </span>
          </td>
          <td>
            <span style="font-size: 0.8rem; color: #64748b;">${y.keterangan || '-'}</span>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; gap: 0.35rem;">
              <button type="button" class="btn btn-outline btn-sm" onclick="YearManagement.openEditModal('${y.year}')" title="Edit Tahun" style="padding: 0.3rem 0.6rem;">
                <i class="fas fa-edit"></i> Edit
              </button>
              ${(String(y.year) !== '2026' && !isDefault) ? `
                <button type="button" class="btn btn-danger btn-sm" onclick="YearManagement.deleteYear('${y.year}')" title="Hapus Tahun" style="padding: 0.3rem 0.6rem;">
                  <i class="fas fa-trash-alt"></i>
                </button>
              ` : `
                <button type="button" class="btn btn-outline btn-sm" disabled style="opacity: 0.4; cursor: not-allowed; padding: 0.3rem 0.6rem;" title="Tahun dasar / default tidak dapat dihapus">
                  <i class="fas fa-lock"></i>
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openAddModal() {
    this.editingYear = null;
    const modal = document.getElementById('modal-year-form');
    const title = document.getElementById('modal-year-title');
    const inputYear = document.getElementById('year-input-val');
    const inputLabel = document.getElementById('year-input-label');
    const selectStatus = document.getElementById('year-input-status');
    const checkDefault = document.getElementById('year-input-default');
    const inputDesc = document.getElementById('year-input-desc');

    if (title) title.innerHTML = '<i class="fas fa-calendar-plus" style="color: var(--primary-600);"></i> Tambah Tahun Pelayanan Baru';
    if (inputYear) {
      inputYear.value = '';
      inputYear.removeAttribute('readonly');
      inputYear.placeholder = 'Contoh: 2027';
    }
    if (inputLabel) inputLabel.value = '';
    if (selectStatus) selectStatus.value = 'AKTIF';
    if (checkDefault) checkDefault.checked = false;
    if (inputDesc) inputDesc.value = '';

    if (modal) modal.style.display = 'flex';
  },

  openEditModal(year) {
    const y = this.years.find(item => String(item.year) === String(year));
    if (!y) return;

    this.editingYear = String(year);
    const modal = document.getElementById('modal-year-form');
    const title = document.getElementById('modal-year-title');
    const inputYear = document.getElementById('year-input-val');
    const inputLabel = document.getElementById('year-input-label');
    const selectStatus = document.getElementById('year-input-status');
    const checkDefault = document.getElementById('year-input-default');
    const inputDesc = document.getElementById('year-input-desc');

    if (title) title.innerHTML = `<i class="fas fa-edit" style="color: var(--primary-600);"></i> Edit Periode Tahun ${year}`;
    if (inputYear) {
      inputYear.value = y.year;
      inputYear.setAttribute('readonly', 'readonly');
    }
    if (inputLabel) inputLabel.value = y.label || `Tahun ${y.year}`;
    if (selectStatus) selectStatus.value = y.status || 'AKTIF';
    if (checkDefault) checkDefault.checked = (y.isDefault || y.is_default === 1);
    if (inputDesc) inputDesc.value = y.keterangan || '';

    if (modal) modal.style.display = 'flex';
  },

  closeModal() {
    const modal = document.getElementById('modal-year-form');
    if (modal) modal.style.display = 'none';
    this.editingYear = null;
  },

  async handleSave(e) {
    if (e) e.preventDefault();

    const inputYear = document.getElementById('year-input-val');
    const inputLabel = document.getElementById('year-input-label');
    const selectStatus = document.getElementById('year-input-status');
    const checkDefault = document.getElementById('year-input-default');
    const inputDesc = document.getElementById('year-input-desc');

    const yearVal = String(inputYear.value || '').trim();
    if (!/^\d{4}$/.test(yearVal)) {
      alert('Tahun harus terdiri dari 4 digit angka (contoh: 2027).');
      return;
    }

    const payload = {
      year: yearVal,
      label: inputLabel.value.trim() || `Tahun ${yearVal}`,
      status: selectStatus.value || 'AKTIF',
      isDefault: checkDefault ? checkDefault.checked : false,
      keterangan: inputDesc.value.trim() || `Tahun Pelayanan ${yearVal}`
    };

    try {
      if (this.editingYear) {
        // Edit Mode
        const res = await fetch(`/api/years/${this.editingYear}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        storeUpdatedYear(this.editingYear, payload);
      } else {
        // Add Mode
        const res = await fetch('/api/years', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        storeAddedYear(payload);
      }
    } catch (err) {
      if (this.editingYear) {
        storeUpdatedYear(this.editingYear, payload);
      } else {
        storeAddedYear(payload);
      }
    }

    if (payload.isDefault) {
      setActiveYear(payload.year);
    }

    this.closeModal();
    await this.refreshYears();

    // Trigger sync across modules
    if (typeof Infografis !== 'undefined' && typeof Infografis.renderYearSelector === 'function') {
      Infografis.renderYearSelector();
    }
    if (typeof Monitoring !== 'undefined') {
      if (typeof Monitoring.renderYearSelector === 'function') Monitoring.renderYearSelector();
      Monitoring.refreshData();
    }

    alert(`Periode Tahun ${payload.year} berhasil disimpan.`);
  },

  async setDefaultYear(year) {
    if (!confirm(`Jadikan Tahun ${year} sebagai tahun default sistem? Semua tampilan publik dan internal akan mengacu pada tahun ini secara default.`)) {
      return;
    }

    try {
      await fetch(`/api/years/${year}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true })
      });
    } catch(e) {}

    storeUpdatedYear(year, { isDefault: true });
    setActiveYear(year);

    await this.refreshYears();

    if (typeof Infografis !== 'undefined') {
      Infografis.setYear(year);
    }
    if (typeof Monitoring !== 'undefined') {
      if (typeof Monitoring.setYearFilter === 'function') {
        Monitoring.setYearFilter(year);
      }
      Monitoring.refreshData();
    }

    alert(`Tahun ${year} sekarang aktif sebagai Tahun Default Sistem.`);
  },

  async deleteYear(year) {
    if (String(year) === '2026') {
      alert('Tahun 2026 adalah data tahun dasar dan tidak dapat dihapus.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus Tahun ${year}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/years/${year}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        alert(json.message || 'Gagal menghapus tahun.');
        return;
      }
    } catch(e) {}

    storeDeletedYear(year);
    await this.refreshYears();

    if (typeof Infografis !== 'undefined' && typeof Infografis.renderYearSelector === 'function') {
      Infografis.renderYearSelector();
    }
    if (typeof Monitoring !== 'undefined') {
      if (typeof Monitoring.renderYearSelector === 'function') Monitoring.renderYearSelector();
      Monitoring.refreshData();
    }

    alert(`Tahun ${year} berhasil dihapus.`);
  },

  setupListeners() {
    const form = document.getElementById('form-year-management');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSave(e));
    }
  }
};
