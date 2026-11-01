/**
 * SIMOPEL DINPUTARU DEMAK - Monitoring Engine
 * Table Rendering, Filtering, KPI Metrics, Leadership Focus, & Submission Operations
 */

const Monitoring = {
  submissions: [],
  filters: {
    bidang: 'ALL',
    layanan: 'ALL',
    status: 'ALL',
    search: ''
  },

  init() {
    this.submissions = getStoredSubmissions();
    this.renderAll();
    this.setupEventListeners();
  },

  refreshData() {
    this.submissions = getStoredSubmissions();
    this.renderAll();
  },

  renderAll() {
    this.renderKPIs();
    this.renderLeadershipFocus();
    this.renderTable();
  },

  /* =========================================================
     KPI METRICS
     ========================================================= */
  renderKPIs() {
    const total = this.submissions.length;
    const selesai = this.submissions.filter(s => s.status === 'SELESAI').length;
    const proses = this.submissions.filter(s => s.status === 'PROSES' || s.status === 'MENUNGGU_APPROVAL').length;
    const pending = this.submissions.filter(s => s.status === 'PENDING_PEMOHON' || s.status === 'SIDANG_SURVEY').length;
    const overdue = this.submissions.filter(s => s.slaStatus === 'OVERDUE' && s.status !== 'SELESAI' && s.status !== 'DITOLAK').length;
    const belumSelesai = this.submissions.filter(s => s.status !== 'SELESAI' && s.status !== 'DITOLAK').length;

    const rate = total > 0 ? Math.round((selesai / total) * 100) : 0;

    const elTotal = document.getElementById('kpi-total-pengajuan');
    const elSelesai = document.getElementById('kpi-selesai');
    const elProses = document.getElementById('kpi-proses');
    const elBelumSelesai = document.getElementById('kpi-belum-selesai');
    const elOverdue = document.getElementById('kpi-overdue');

    if (elTotal) elTotal.textContent = total;
    if (elSelesai) elSelesai.innerHTML = `${selesai} <span style="font-size: 1rem; color: #059669; font-weight: 700;">(${rate}%)</span>`;
    if (elProses) elProses.textContent = proses;
    if (elBelumSelesai) elBelumSelesai.textContent = belumSelesai;
    if (elOverdue) elOverdue.textContent = overdue;
  },

  /* =========================================================
     LEADERSHIP FOCUS WIDGET: "Pengajuan Belum Selesai & Kendalanya"
     ========================================================= */
  renderLeadershipFocus() {
    const container = document.getElementById('leadership-focus-container');
    if (!container) return;

    // Filter unfinished applications, prioritize overdue and pending items
    const unfinished = this.submissions.filter(s => s.status !== 'SELESAI' && s.status !== 'DITOLAK');
    
    // Sort so that OVERDUE items come first
    unfinished.sort((a, b) => {
      if (a.slaStatus === 'OVERDUE' && b.slaStatus !== 'OVERDUE') return -1;
      if (b.slaStatus === 'OVERDUE' && a.slaStatus !== 'OVERDUE') return 1;
      return 0;
    });

    const topItems = unfinished.slice(0, 4);

    if (topItems.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--success-700);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 0.5rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <div style="font-weight: 700; font-size: 1.1rem;">Semua Pengajuan Telah Terselesaikan!</div>
          <div style="font-size: 0.85rem; color: var(--slate-500);">Tidak ada pengajuan yang tertahan atau mengalami kendala saat ini.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = topItems.map(item => `
      <div class="focus-item-card" onclick="Monitoring.openDetailModal('${item.id}')" style="cursor: pointer;">
        <div class="focus-card-top">
          <span class="service-pill ${item.layanan.toLowerCase()}">${item.layanan} - ${item.bidang}</span>
          <span class="sla-tag ${item.slaStatus.toLowerCase().replace('_', '-')}">
            ${item.slaStatus === 'OVERDUE' ? '⚠️ SLA Lewat' : item.slaStatus === 'WARNING' ? '⏳ Mendekati SLA' : '✅ On Schedule'}
          </span>
        </div>

        <div>
          <div class="focus-applicant">${item.namaPemohon}</div>
          <div class="focus-project-name">${item.namaKegiatan}</div>
        </div>

        <div class="focus-bottleneck-detail">
          <strong>Keterangan / Kendala:</strong> ${item.keteranganKendala}
        </div>

        <div class="focus-card-footer">
          <span><i class="fas fa-desktop"></i> Posisi: <strong>${item.posisiMeja}</strong></span>
          <span style="color: var(--primary-600); font-weight: 700;">Lihat Detail &rarr;</span>
        </div>
      </div>
    `).join('');
  },

  /* =========================================================
     FILTERING LOGIC
     ========================================================= */
  getFilteredSubmissions() {
    return this.submissions.filter(item => {
      // Bidang filter
      if (this.filters.bidang !== 'ALL' && item.bidang !== this.filters.bidang) {
        return false;
      }

      // Layanan filter
      if (this.filters.layanan !== 'ALL' && item.layanan !== this.filters.layanan) {
        return false;
      }

      // Status filter
      if (this.filters.status === 'BELUM_SELESAI') {
        if (item.status === 'SELESAI' || item.status === 'DITOLAK') return false;
      } else if (this.filters.status === 'OVERDUE') {
        if (item.slaStatus !== 'OVERDUE' || item.status === 'SELESAI') return false;
      } else if (this.filters.status !== 'ALL') {
        if (item.status !== this.filters.status) return false;
      }

      // Search filter
      if (this.filters.search.trim() !== '') {
        const q = this.filters.search.toLowerCase();
        const match = 
          (item.noRegistrasi || '').toLowerCase().includes(q) ||
          (item.namaPemohon || '').toLowerCase().includes(q) ||
          (item.namaKegiatan || '').toLowerCase().includes(q) ||
          (item.kecamatan || '').toLowerCase().includes(q) ||
          (item.posisiMeja || '').toLowerCase().includes(q) ||
          (item.keteranganKendala || '').toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  },

  /* =========================================================
     TABLE RENDERING
     ========================================================= */
  renderTable() {
    const tbody = document.getElementById('monitoring-table-body');
    const countBadge = document.getElementById('table-count-badge');
    if (!tbody) return;

    const items = this.getFilteredSubmissions();
    if (countBadge) countBadge.textContent = `${items.length} Data Ditampilkan`;

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="table-empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.25rem;">Tidak Ada Data Pengajuan Ditemukan</div>
              <div>Coba sesuaikan kata kunci pencarian atau ganti filter layanan di atas.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(item => {
      const isOverdue = item.slaStatus === 'OVERDUE' && item.status !== 'SELESAI';
      const statusBadgeClass = this.getStatusBadgeClass(item.status);
      const statusLabel = this.getStatusLabel(item.status);

      return `
        <tr class="${isOverdue ? 'highlight-overdue' : ''}">
          <!-- 1. No Reg & Layanan -->
          <td>
            <div style="font-family: monospace; font-weight: 700; color: var(--slate-900); font-size: 0.85rem;">
              ${item.noRegistrasi}
            </div>
            <div style="margin-top: 0.3rem;">
              <span class="service-pill ${item.layanan.toLowerCase()}">${item.layanan}</span>
              <span style="font-size: 0.72rem; color: var(--slate-500); font-weight: 600;">${item.bidang}</span>
            </div>
          </td>

          <!-- 2. Pemohon & Kontak -->
          <td class="col-applicant">
            <div class="applicant-name">${item.namaPemohon}</div>
            <div class="applicant-meta">
              <span><strong>${item.namaKegiatan}</strong></span>
              <span><i class="fas fa-id-card"></i> ${item.nikNib}</span>
              <span><i class="fas fa-phone-alt"></i> ${item.noHp}</span>
            </div>
          </td>

          <!-- 3. Lokasi & Tanggal -->
          <td class="col-location">
            <div><strong style="color: var(--slate-900);">Kec. ${item.kecamatan}</strong></div>
            <div style="font-size: 0.74rem; color: var(--slate-500); margin-top: 0.2rem;">${item.lokasiProyek}</div>
            <div style="margin-top: 0.35rem; font-size: 0.72rem; color: var(--slate-600);">
              Tgl Masuk: <strong>${item.tglPengajuan}</strong>
            </div>
          </td>

          <!-- 4. Tahap & Posisi Meja -->
          <td class="col-stage">
            <div class="stage-title">${item.tahapSaatIni}</div>
            <div class="stage-desk">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--primary-500); margin-right: 4px;"></span>
              Posisi: <strong>${item.posisiMeja}</strong>
            </div>
            <div style="font-size: 0.7rem; color: var(--slate-400); margin-top: 0.2rem;">
              PJ: ${item.penanggungJawab}
            </div>
          </td>

          <!-- 5. Keterangan / Kendala (Leadership Bottleneck) -->
          <td class="col-bottleneck">
            <div class="bottleneck-box ${item.status === 'SELESAI' ? 'clean' : (isOverdue ? 'overdue-box' : '')}">
              <strong>${item.status === 'SELESAI' ? 'Keterangan Selesai:' : 'Keterangan / Kendala:'}</strong>
              <div style="margin-top: 0.2rem;">${item.keteranganKendala}</div>
            </div>
            ${item.noSuratKeputusan && item.noSuratKeputusan !== '-' ? `
              <div style="margin-top: 0.3rem; font-size: 0.7rem; color: var(--success-700); font-weight: 700;">
                No SK/Sertifikat: ${item.noSuratKeputusan}
              </div>
            ` : ''}
          </td>

          <!-- 6. Status & SLA -->
          <td>
            <div style="display: flex; flex-direction: column; gap: 0.35rem; align-items: flex-start;">
              <span class="badge ${statusBadgeClass}">
                <span class="badge-dot"></span> ${statusLabel}
              </span>
              <span class="sla-tag ${item.slaStatus.toLowerCase().replace('_', '-')}">
                ${item.slaStatus === 'OVERDUE' ? '⚠️ Overdue' : item.slaStatus === 'WARNING' ? '⏳ Warning' : '✅ Aman'}
              </span>
            </div>
          </td>

          <!-- 7. Aksi -->
          <td class="col-actions">
            <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
              <button class="btn btn-outline btn-sm" title="Lihat Detail & Jejak Berkas" onclick="Monitoring.openDetailModal('${item.id}')">
                <i class="fas fa-eye"></i> Detail
              </button>
              
              ${Auth.canEditSubmission(item.bidang) ? `
                <button class="btn btn-primary btn-sm" title="Update Status & Catatan" onclick="Monitoring.openUpdateModal('${item.id}')">
                  <i class="fas fa-edit"></i> Update
                </button>
              ` : ''}

              <button class="btn btn-outline btn-sm" title="Cetak Lembar Disposisi" onclick="Tracker.printDisposition('${item.id}')">
                <i class="fas fa-print"></i>
              </button>

              ${Auth.isSuperAdmin() ? `
                <button class="btn btn-danger btn-sm" title="Hapus Berkas Pengajuan" onclick="Monitoring.deleteSubmission('${item.id}')">
                  <i class="fas fa-trash"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  getStatusBadgeClass(status) {
    switch (status) {
      case 'SELESAI': return 'badge-selesai';
      case 'PROSES': return 'badge-proses';
      case 'PENDING_PEMOHON': return 'badge-pending';
      case 'SIDANG_SURVEY': return 'badge-sidang';
      case 'MENUNGGU_APPROVAL': return 'badge-proses';
      case 'DITOLAK': return 'badge-ditolak';
      default: return 'badge-proses';
    }
  },

  getStatusLabel(status) {
    switch (status) {
      case 'SELESAI': return 'Selesai / Terbit';
      case 'PROSES': return 'On Progress';
      case 'PENDING_PEMOHON': return 'Menunggu Pemohon';
      case 'SIDANG_SURVEY': return 'Sidang / Tinjauan';
      case 'MENUNGGU_APPROVAL': return 'Menunggu Approval';
      case 'DITOLAK': return 'Ditolak';
      default: return status;
    }
  },

  /* =========================================================
     MODAL DETAIL & TIMELINE
     ========================================================= */
  openDetailModal(id) {
    const item = this.submissions.find(s => s.id === id);
    if (!item) return;

    const modal = document.getElementById('modal-detail-submission');
    const container = document.getElementById('detail-modal-content');
    if (!modal || !container) return;

    const config = LAYANAN_CONFIG[item.layanan];

    container.innerHTML = `
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
            <span class="service-pill ${item.layanan.toLowerCase()}" style="font-size: 0.85rem; padding: 0.3rem 0.75rem;">
              ${item.layanan} - ${config ? config.nama : ''}
            </span>
            <span class="badge ${this.getStatusBadgeClass(item.status)}">
              ${this.getStatusLabel(item.status)}
            </span>
            <span class="sla-tag ${item.slaStatus.toLowerCase().replace('_', '-')}">
              ${item.slaStatus === 'OVERDUE' ? '⚠️ Overdue SLA' : item.slaStatus === 'WARNING' ? '⏳ Mendekati Batas' : '✅ Sesuai SLA'}
            </span>
          </div>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--slate-900);">${item.namaKegiatan}</h2>
          <div style="font-size: 0.85rem; color: var(--slate-500); font-family: monospace; margin-top: 0.2rem;">
            No. Registrasi: <strong>${item.noRegistrasi}</strong> &bull; Bidang: <strong>${item.bidang}</strong>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-outline btn-sm" onclick="Tracker.printDisposition('${item.id}')">
            <i class="fas fa-print"></i> Cetak Lembar Kendali
          </button>
          ${Auth.canEditSubmission(item.bidang) ? `
            <button class="btn btn-primary btn-sm" onclick="Monitoring.openUpdateModal('${item.id}')">
              <i class="fas fa-edit"></i> Perbarui Status
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Grid Data Pemohon & Lokasi Proyek -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;">
        <div style="background: #f8fafc; border: 1px solid var(--slate-200); border-radius: var(--radius-lg); padding: 1.1rem;">
          <h4 style="font-size: 0.82rem; text-transform: uppercase; color: var(--slate-500); margin-bottom: 0.75rem; letter-spacing: 0.05em;">
            Data Pemohon / Perusahaan
          </h4>
          <table style="font-size: 0.84rem; width: 100%;">
            <tr><td style="color: var(--slate-500); width: 35%; padding-bottom: 0.4rem;">Nama:</td><td><strong>${item.namaPemohon}</strong></td></tr>
            <tr><td style="color: var(--slate-500); padding-bottom: 0.4rem;">Kategori:</td><td>${item.jenisPemohon}</td></tr>
            <tr><td style="color: var(--slate-500); padding-bottom: 0.4rem;">NIK/NIB:</td><td>${item.nikNib}</td></tr>
            <tr><td style="color: var(--slate-500); padding-bottom: 0.4rem;">Telepon:</td><td><a href="https://wa.me/${item.noHp.replace(/[^0-9]/g, '')}" target="_blank" style="color: var(--primary-600); font-weight: 600;"><i class="fab fa-whatsapp"></i> ${item.noHp}</a></td></tr>
            <tr><td style="color: var(--slate-500);">Email:</td><td>${item.email}</td></tr>
          </table>
        </div>

        <div style="background: #f8fafc; border: 1px solid var(--slate-200); border-radius: var(--radius-lg); padding: 1.1rem;">
          <h4 style="font-size: 0.82rem; text-transform: uppercase; color: var(--slate-500); margin-bottom: 0.75rem; letter-spacing: 0.05em;">
            Data Teknis & Lokasi di Demak
          </h4>
          <table style="font-size: 0.84rem; width: 100%;">
            <tr><td style="color: var(--slate-500); width: 35%; padding-bottom: 0.4rem;">Kecamatan:</td><td><strong>${item.kecamatan}</strong></td></tr>
            <tr><td style="color: var(--slate-500); padding-bottom: 0.4rem;">Alamat Proyek:</td><td>${item.lokasiProyek}</td></tr>
            <tr><td style="color: var(--slate-500); padding-bottom: 0.4rem;">Luas Lahan:</td><td>${item.luasLahan}</td></tr>
            <tr><td style="color: var(--slate-500); padding-bottom: 0.4rem;">Luas Bangunan:</td><td>${item.luasBangunan}</td></tr>
            <tr><td style="color: var(--slate-500);">Tgl Pengajuan:</td><td>${item.tglPengajuan} (Estimasi SLA: ${item.estimasiSelesai})</td></tr>
          </table>
        </div>
      </div>

      <!-- Kotak Catatan Pimpinan & Bottleneck Detail -->
      <div style="background: #fffbeb; border: 1px solid #fed7aa; border-left: 4px solid #f59e0b; border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.75rem;">
        <div style="font-weight: 800; color: #92400e; font-size: 0.88rem; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
          <i class="fas fa-exclamation-circle"></i> Keterangan Kendala / Catatan Pimpinan Terkini:
        </div>
        <div style="font-size: 0.84rem; color: #78350f; line-height: 1.5; margin-bottom: 0.5rem;">
          ${item.keteranganKendala}
        </div>
        ${item.catatanPimpinan ? `
          <div style="font-size: 0.78rem; color: #92400e; border-top: 1px dashed #fde68a; padding-top: 0.4rem;">
            <strong>Catatan Arahan Pejabat:</strong> ${item.catatanPimpinan}
          </div>
        ` : ''}
        <div style="margin-top: 0.5rem; font-size: 0.78rem; color: #b45309;">
          Posisi Berkas Saat Ini: <strong>${item.posisiMeja}</strong> | Penanggung Jawab: <strong>${item.penanggungJawab}</strong>
        </div>
      </div>

      <!-- Jejak Berkas / Timeline Visual Tracking -->
      <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--slate-900); margin-bottom: 1rem;">
        <i class="fas fa-history" style="color: var(--primary-600);"></i> Jejak Berkas & Riwayat Verifikasi
      </h3>

      <div class="timeline-stepper">
        ${item.timeline.map((step, idx) => `
          <div class="timeline-step ${step.status === 'DONE' ? 'completed' : (step.status === 'ACTIVE' ? 'active' : 'hold')}">
            <div class="timeline-icon">
              ${step.status === 'DONE' ? '<i class="fas fa-check"></i>' : (step.status === 'ACTIVE' ? '<i class="fas fa-clock"></i>' : '<i class="fas fa-pause"></i>')}
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">${step.tahap}</span>
                <span class="timeline-time">${step.waktu}</span>
              </div>
              <div class="timeline-officer">Petugas: ${step.petugas}</div>
              <div class="timeline-note">${step.catatan}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    modal.classList.add('active');
  },

  /* =========================================================
     MODAL UPDATE STATUS & KENDALA
     ========================================================= */
  openUpdateModal(id) {
    const item = this.submissions.find(s => s.id === id);
    if (!item) return;

    // Check permission
    if (!Auth.canEditSubmission(item.bidang)) {
      alert("Anda tidak memiliki hak akses untuk mengubah pengajuan di bidang " + item.bidang);
      return;
    }

    const modal = document.getElementById('modal-update-status');
    const form = document.getElementById('form-update-status');
    if (!modal || !form) return;

    form.dataset.subId = item.id;
    document.getElementById('update-modal-sub-id').value = item.id;
    document.getElementById('update-modal-reg').textContent = item.noRegistrasi + " - " + item.namaPemohon;

    const selectStatus = document.getElementById('update-status-select');
    selectStatus.value = item.status;

    const selectSLA = document.getElementById('update-sla-select');
    if (selectSLA) selectSLA.value = item.slaStatus;

    document.getElementById('update-tahap-input').value = item.tahapSaatIni;
    document.getElementById('update-posisi-input').value = item.posisiMeja;
    document.getElementById('update-keterangan-input').value = item.keteranganKendala;
    document.getElementById('update-catatan-input').value = item.catatanPimpinan || '';
    document.getElementById('update-sk-input').value = item.noSuratKeputusan || '';
    const logNoteInput = document.getElementById('update-log-note');
    if (logNoteInput) logNoteInput.value = '';

    modal.classList.add('active');
  },

  deleteSubmission(id) {
    if (!Auth.isSuperAdmin()) {
      alert("Hanya Superadmin yang memiliki hak akses untuk menghapus data pengajuan.");
      return;
    }
    const item = this.submissions.find(s => s.id === id);
    if (!item) return;

    if (confirm(`Apakah Anda yakin ingin menghapus data permohonan ${item.noRegistrasi} (${item.namaPemohon})? Tindakan ini tidak dapat dibatalkan.`)) {
      this.submissions = this.submissions.filter(s => s.id !== id);
      saveStoredSubmissions(this.submissions);
      this.renderAll();
      alert(`Pengajuan ${item.noRegistrasi} berhasil dihapus.`);
    }
  },

  handleSaveStatusUpdate(e) {
    e.preventDefault();
    const subId = document.getElementById('update-modal-sub-id').value;
    const item = this.submissions.find(s => s.id === subId);
    if (!item) return;

    const newStatus = document.getElementById('update-status-select').value;
    const newSLA = document.getElementById('update-sla-select').value;
    const newTahap = document.getElementById('update-tahap-input').value;
    const newPosisi = document.getElementById('update-posisi-input').value;
    const newKeterangan = document.getElementById('update-keterangan-input').value;
    const newCatatan = document.getElementById('update-catatan-input').value;
    const newSK = document.getElementById('update-sk-input').value;
    const newLogNote = document.getElementById('update-log-note').value;

    item.status = newStatus;
    item.slaStatus = newSLA;
    item.tahapSaatIni = newTahap;
    item.posisiMeja = newPosisi;
    item.keteranganKendala = newKeterangan;
    item.catatanPimpinan = newCatatan;
    item.noSuratKeputusan = newSK;

    if (newStatus === 'SELESAI' && !item.tglSelesai) {
      item.tglSelesai = new Date().toISOString().split('T')[0];
    }

    // Add entry to timeline
    const now = new Date();
    const formattedTime = now.getFullYear() + '-' + 
      String(now.getMonth()+1).padStart(2,'0') + '-' + 
      String(now.getDate()).padStart(2,'0') + ' ' + 
      String(now.getHours()).padStart(2,'0') + ':' + 
      String(now.getMinutes()).padStart(2,'0');

    item.timeline.push({
      waktu: formattedTime,
      tahap: newTahap,
      status: newStatus === 'SELESAI' ? 'DONE' : (newStatus === 'PENDING_PEMOHON' ? 'HOLD' : 'ACTIVE'),
      petugas: Auth.getCurrentUser() ? Auth.getCurrentUser().nama : 'Petugas Dinas',
      catatan: newLogNote || ('Status diperbarui menjadi ' + newStatus + '. Keterangan: ' + newKeterangan)
    });

    saveStoredSubmissions(this.submissions);
    this.renderAll();

    // Close modal
    document.getElementById('modal-update-status').classList.remove('active');
    alert('Status berkas pengajuan berhasil diperbarui!');
  },

  /* =========================================================
     MODAL TAMBAH PENGAJUAN BARU
     ========================================================= */
  openNewSubmissionModal() {
    if (!Auth.getCurrentUser()) {
      alert("Akses Terbatas: Silakan masuk (login) sebagai petugas terlebih dahulu untuk menambahkan pengajuan.");
      App.showView('login');
      return;
    }
    const modal = document.getElementById('modal-new-submission');
    if (!modal) return;
    document.getElementById('form-new-submission').reset();
    modal.classList.add('active');
  },

  handleSaveNewSubmission(e) {
    e.preventDefault();
    const layanan = document.getElementById('new-sub-layanan').value;
    const bidang = (layanan === 'KTTR' || layanan === 'OSS') ? 'TRP' : 'CK';

    const count = this.submissions.length + 1;
    const regCode = `REG/${bidang}/2026/${String(count).padStart(3, '0')}`;
    const newId = `SUB-2026-${String(count).padStart(3, '0')}`;

    const tgl = new Date().toISOString().split('T')[0];
    const targetDays = LAYANAN_CONFIG[layanan] ? LAYANAN_CONFIG[layanan].standarSLA : 7;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + targetDays);
    const estDateStr = targetDate.toISOString().split('T')[0];

    const newSub = {
      id: newId,
      noRegistrasi: regCode,
      layanan: layanan,
      bidang: bidang,
      namaPemohon: document.getElementById('new-sub-pemohon').value,
      jenisPemohon: document.getElementById('new-sub-jenis-pemohon').value,
      nikNib: document.getElementById('new-sub-nik').value,
      noHp: document.getElementById('new-sub-hp').value,
      email: document.getElementById('new-sub-email').value,
      namaKegiatan: document.getElementById('new-sub-kegiatan').value,
      lokasiProyek: document.getElementById('new-sub-lokasi').value,
      kecamatan: document.getElementById('new-sub-kecamatan').value,
      luasLahan: document.getElementById('new-sub-luas-lahan').value + " m²",
      luasBangunan: document.getElementById('new-sub-luas-bangunan').value + " m²",
      tglPengajuan: tgl,
      estimasiSelesai: estDateStr,
      tglSelesai: null,
      status: "PROSES",
      slaStatus: "ON_TRACK",
      tahapSaatIni: "Verifikasi Administrasi Berkas",
      tahapIndex: 0,
      posisiMeja: "Loket Pelayanan Terpadu DINPUTARU",
      penanggungJawab: Auth.getCurrentUser() ? Auth.getCurrentUser().nama : "Koordinator Bidang " + bidang,
      noSuratKeputusan: "-",
      keteranganKendala: document.getElementById('new-sub-keterangan').value || "Berkas baru didaftarkan, dalam verifikasi kelengkapan administrasi.",
      catatanPimpinan: "",
      timeline: [
        {
          waktu: tgl + " 09:00",
          tahap: "Verifikasi Administrasi Berkas",
          status: "ACTIVE",
          petugas: Auth.getCurrentUser() ? Auth.getCurrentUser().nama : "Front Office",
          catatan: "Pendaftaran berkas pengajuan baru berhasil dibuat."
        }
      ]
    };

    this.submissions.unshift(newSub);
    saveStoredSubmissions(this.submissions);
    this.renderAll();

    document.getElementById('modal-new-submission').classList.remove('active');
    alert(`Pengajuan berhasil ditambahkan dengan Nomor Registrasi: ${regCode}`);
  },

  /* =========================================================
     LISTENERS SETUP
     ========================================================= */
  setupEventListeners() {
    // Quick filter chips (Status)
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.filters.status = chip.dataset.status;
        this.renderTable();
      });
    });

    // Select filters
    const filterBidang = document.getElementById('filter-bidang');
    if (filterBidang) {
      filterBidang.addEventListener('change', (e) => {
        this.filters.bidang = e.target.value;
        this.renderTable();
      });
    }

    const filterLayanan = document.getElementById('filter-layanan');
    if (filterLayanan) {
      filterLayanan.addEventListener('change', (e) => {
        this.filters.layanan = e.target.value;
        this.renderTable();
      });
    }

    // Search input
    const searchInput = document.getElementById('monitoring-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value;
        this.renderTable();
      });
    }

    // Modal Close buttons
    const closeBtns = document.querySelectorAll('.modal-close-btn, .modal-cancel-btn');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      });
    });

    // Form Save listeners
    const formUpdate = document.getElementById('form-update-status');
    if (formUpdate) {
      formUpdate.addEventListener('submit', (e) => this.handleSaveStatusUpdate(e));
    }

    const formNew = document.getElementById('form-new-submission');
    if (formNew) {
      formNew.addEventListener('submit', (e) => this.handleSaveNewSubmission(e));
    }
  }
};
