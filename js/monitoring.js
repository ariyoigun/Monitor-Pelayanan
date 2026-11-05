/**
 * SILAN DINPUTARU DEMAK - Monitoring Engine
 * Table Rendering, Filtering, KPI Metrics, Leadership Focus, Internal Charts & Submission Operations
 */

const Monitoring = {
  submissions: [],
  filters: {
    bidang: 'ALL',
    layanan: 'ALL',
    status: 'ALL',
    search: ''
  },
  charts: {},

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
    this.renderInternalCharts();
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

    if (elTotal) elTotal.textContent = total.toLocaleString('id-ID');
    if (elSelesai) elSelesai.innerHTML = `${selesai.toLocaleString('id-ID')} <span style="font-size: 1rem; color: #059669; font-weight: 700;">(${rate}%)</span>`;
    if (elProses) elProses.textContent = proses.toLocaleString('id-ID');
    if (elBelumSelesai) elBelumSelesai.textContent = belumSelesai.toLocaleString('id-ID');
    if (elOverdue) elOverdue.textContent = overdue.toLocaleString('id-ID');
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
     GRAFIK DI DASHBOARD INTERNAL (CHART.JS)
     ========================================================= */
  renderInternalCharts() {
    if (typeof Chart === 'undefined') return;

    // Destroy previous charts to avoid canvas re-use errors
    if (this.charts.trend) this.charts.trend.destroy();
    if (this.charts.status) this.charts.status.destroy();
    if (this.charts.services) this.charts.services.destroy();
    if (this.charts.kecamatan) this.charts.kecamatan.destroy();

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'];

    // 1. Chart Tren Bulanan
    const canvasTrend = document.getElementById('chart-internal-trend');
    if (canvasTrend) {
      const kttrMonthly = [];
      const ossMonthly = [];
      const pbgMonthly = [];
      const slfMonthly = [];

      for (let m = 1; m <= 11; m++) {
        kttrMonthly.push(MONTHLY_STATS_2026.services.KTTR.monthly[String(m)]?.total || 0);
        ossMonthly.push(MONTHLY_STATS_2026.services.OSS.monthly[String(m)]?.total || 0);
        pbgMonthly.push(MONTHLY_STATS_2026.services.PBG.monthly[String(m)]?.total || 0);
        slfMonthly.push(MONTHLY_STATS_2026.services.SLF.monthly[String(m)]?.total || 0);
      }

      this.charts.trend = new Chart(canvasTrend.getContext('2d'), {
        type: 'bar',
        data: {
          labels: monthLabels,
          datasets: [
            { label: 'KTTR (Tata Ruang)', data: kttrMonthly, backgroundColor: '#0284c7', borderRadius: 4 },
            { label: 'Validasi OSS (KKPR)', data: ossMonthly, backgroundColor: '#16a34a', borderRadius: 4 },
            { label: 'PBG (Cipta Karya)', data: pbgMonthly, backgroundColor: '#d97706', borderRadius: 4 },
            { label: 'SLF (Cipta Karya)', data: slfMonthly, backgroundColor: '#9333ea', borderRadius: 4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { weight: 600 } } },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
          }
        }
      });
    }

    // 2. Chart Status Penyelesaian (Selesai vs Dalam Proses)
    const canvasStatus = document.getElementById('chart-internal-status');
    if (canvasStatus) {
      const selesai = this.submissions.filter(s => s.status === 'SELESAI').length;
      const proses = this.submissions.filter(s => s.status === 'PROSES' || s.status === 'MENUNGGU_APPROVAL').length;
      const pending = this.submissions.filter(s => s.status === 'PENDING_PEMOHON' || s.status === 'SIDANG_SURVEY').length;
      const ditolak = this.submissions.filter(s => s.status === 'DITOLAK').length;

      this.charts.status = new Chart(canvasStatus.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Selesai / Terbit', 'Dalam Proses', 'Tertahan / Revisi', 'Ditolak / Batal'],
          datasets: [{
            data: [selesai, proses, pending, ditolak],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12 } }
          },
          cutout: '65%'
        }
      });
    }

    // 3. Chart Proporsi Layanan
    const canvasServices = document.getElementById('chart-internal-services');
    if (canvasServices) {
      const countKttr = this.submissions.filter(s => s.layanan === 'KTTR').length;
      const countOss = this.submissions.filter(s => s.layanan === 'OSS').length;
      const countPbg = this.submissions.filter(s => s.layanan === 'PBG').length;
      const countSlf = this.submissions.filter(s => s.layanan === 'SLF').length;

      this.charts.services = new Chart(canvasServices.getContext('2d'), {
        type: 'pie',
        data: {
          labels: ['KTTR', 'OSS-RBA', 'PBG', 'SLF'],
          datasets: [{
            data: [countKttr, countOss, countPbg, countSlf],
            backgroundColor: ['#0284c7', '#16a34a', '#d97706', '#9333ea'],
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12 } }
          }
        }
      });
    }

    // 4. Chart Sebaran Kecamatan di Kab. Demak
    const canvasKecamatan = document.getElementById('chart-internal-kecamatan');
    if (canvasKecamatan) {
      const kecCounts = {};
      this.submissions.forEach(s => {
        const k = s.kecamatan || 'Lainnya';
        kecCounts[k] = (kecCounts[k] || 0) + 1;
      });

      const sortedKec = Object.entries(kecCounts).sort((a,b) => b[1] - a[1]).slice(0, 8);
      const labelsKec = sortedKec.map(x => x[0]);
      const dataKec = sortedKec.map(x => x[1]);

      this.charts.kecamatan = new Chart(canvasKecamatan.getContext('2d'), {
        type: 'bar',
        data: {
          labels: labelsKec,
          datasets: [{
            label: 'Jumlah Berkas',
            data: dataKec,
            backgroundColor: '#6366f1',
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            y: { grid: { display: false } }
          }
        }
      });
    }
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
    if (countBadge) countBadge.textContent = `${items.length.toLocaleString('id-ID')} Data Ditampilkan`;

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

    // Batasi render tabel 100 baris pertama untuk performa super mulus di browser
    const displayItems = items.slice(0, 100);

    tbody.innerHTML = displayItems.map(item => {
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

          <!-- 2. Pemohon & Kegiatan -->
          <td class="col-applicant">
            <div class="applicant-name">${item.namaPemohon}</div>
            <div class="applicant-meta">
              <span><strong>${item.namaKegiatan}</strong></span>
              <span><i class="fas fa-tag"></i> ${item.jenisPemohon}</span>
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

          <!-- 5. Keterangan / Kendala -->
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
              <button class="btn btn-outline btn-sm" title="Lihat Detail & Metadata Excel" onclick="Monitoring.openDetailModal('${item.id}')">
                <i class="fas fa-eye"></i> Detail
              </button>
              
              ${Auth.canEditSubmission(item.bidang) ? `
                <button class="btn btn-primary btn-sm" title="Update Status & Catatan" onclick="Monitoring.openUpdateModal('${item.id}')">
                  <i class="fas fa-edit"></i>
                </button>
              ` : ''}

              <button class="btn btn-outline btn-sm" title="Cetak Lembar Disposisi" onclick="Tracker.printDisposition('${item.id}')">
                <i class="fas fa-print"></i>
              </button>

              ${(Auth.isSuperAdmin() || Auth.isKepalaDinas()) ? `
                <button class="btn btn-danger btn-sm" title="Hapus Berkas Pengajuan" onclick="Monitoring.deleteSubmission('${item.id}')" style="background: #fee2e2; border-color: #fca5a5; color: #dc2626; padding: 0.25rem 0.5rem;">
                  <i class="fas fa-trash-alt"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (items.length > 100) {
      tbody.innerHTML += `
        <tr>
          <td colspan="7" style="text-align: center; padding: 1rem; color: var(--slate-500); font-size: 0.85rem; background: #f8fafc;">
            Menampilkan 100 dari total <strong>${items.length.toLocaleString('id-ID')}</strong> berkas. Gunakan kotak pencarian untuk mencari pemohon atau registrasi spesifik.
          </td>
        </tr>
      `;
    }
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
     MODAL DETAIL & METADATA EXCEL
     ========================================================= */
  openDetailModal(id) {
    const item = this.submissions.find(s => s.id === id);
    if (!item) return;

    const modal = document.getElementById('modal-detail-submission');
    const container = document.getElementById('detail-modal-content');
    if (!modal || !container) return;

    const config = LAYANAN_CONFIG[item.layanan];

    // Build specific metadata section based on Excel columns
    let metaExcelHtml = '';
    if (item.metaExcel) {
      const m = item.metaExcel;
      if (item.layanan === 'KTTR' || item.layanan === 'OSS') {
        metaExcelHtml = `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-lg); padding: 1.15rem; margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid #dcfce7; padding-bottom: 0.5rem;">
              <div style="font-weight: 800; color: #166534; font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fas fa-file-excel" style="color: #16a34a;"></i> Metadata Rekap Excel: <em>Layanan KTTR dan OSS.xlsx</em>
              </div>
              <span class="badge" style="background: #dcfce7; color: #166534; font-size: 0.72rem;">Sheet: PAKAI</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; font-size: 0.82rem;">
              <div><span style="color: #64748b;">No. Urut Excel:</span> <strong>${m.noUrut || '-'}</strong></div>
              <div><span style="color: #64748b;">Tgl Berkas Masuk:</span> <strong>${m.tglBerkasMasuk || item.tglPengajuan}</strong></div>
              <div><span style="color: #64748b;">Nama Pemohon:</span> <strong>${item.namaPemohon}</strong></div>
              <div><span style="color: #64748b;">Lokasi Proyek:</span> <strong>${item.lokasiProyek}</strong></div>
              <div><span style="color: #64748b;">Peruntukan:</span> <strong style="color: #166534;">${m.peruntukan || '-'}</strong></div>
              <div><span style="color: #64748b;">Luasan Dimohon:</span> <strong>${m.luasanDimohon || item.luasLahan}</strong></div>
              <div><span style="color: #64748b;">Petugas Pengolah:</span> <strong>${m.pengolah || '-'}</strong></div>
              <div><span style="color: #64748b;">Tgl ke Pengolah:</span> <strong>${m.tglKePengolah || '-'}</strong></div>
              <div><span style="color: #64748b;">Tgl Jadi (Kembali):</span> <strong>${m.tglJadiKembali || (item.tglSelesai || '-')}</strong></div>
              <div><span style="color: #64748b;">Keterangan Asli:</span> <strong style="color: #047857;">${m.keterangan || '-'}</strong></div>
            </div>
          </div>
        `;
      } else {
        // PBG or SLF from SIMBG Excel
        metaExcelHtml = `
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-lg); padding: 1.15rem; margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid #dbeafe; padding-bottom: 0.5rem;">
              <div style="font-weight: 800; color: #1e40af; font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fas fa-file-excel" style="color: #2563eb;"></i> Metadata Ekspor SIMBG: <em>${m.sumber || 'Ekspor SIMBG 2026'}</em>
              </div>
              <span class="badge" style="background: #dbeafe; color: #1e40af; font-size: 0.72rem;">Sistem SIMBG PUPR</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; font-size: 0.82rem;">
              <div><span style="color: #64748b;">Jenis Permohonan:</span> <strong>${m.jenisPermohonan || '-'}</strong></div>
              <div><span style="color: #64748b;">Nomor Registrasi:</span> <strong style="font-family: monospace;">${m.nomorRegistrasi || '-'}</strong></div>
              <div><span style="color: #64748b;">Nomor Dokumen SK:</span> <strong style="font-family: monospace;">${m.nomorDokumen || '-'}</strong></div>
              <div><span style="color: #64748b;">Tanggal Pengajuan:</span> <strong>${item.tglPengajuan}</strong></div>
              <div><span style="color: #64748b;">Status SIMBG:</span> <strong>${m.statusSimbg || '-'}</strong></div>
              <div><span style="color: #64748b;">Status SLF:</span> <strong>${m.statusSlf || '-'}</strong></div>
              <div><span style="color: #64748b;">Fungsi Bangunan:</span> <strong>${m.fungsi || '-'}</strong></div>
              <div><span style="color: #64748b;">Sub-Fungsi Bangunan:</span> <strong>${m.subFungsiBangunan || '-'}</strong></div>
              <div><span style="color: #64748b;">Tipe Konsultasi:</span> <strong>${m.tipeKonsultasi || '-'}</strong></div>
              <div><span style="color: #64748b;">Nama Bangunan:</span> <strong>${m.namaBangunan || '-'}</strong></div>
              <div><span style="color: #64748b;">Jumlah Unit / Okupansi:</span> <strong>${m.jumlahUnit || '-'} unit / ${m.okupansi || '-'} jiwa</strong></div>
              <div><span style="color: #64748b;">Luas Bangunan:</span> <strong>${m.luasBangunan || '-'}</strong></div>
              <div><span style="color: #64748b;">Lantai & Tinggi:</span> <strong>${m.lantai || '-'} lantai / ${m.tinggi || '-'} m</strong></div>
            </div>
          </div>
        `;
      }
    }

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

      ${metaExcelHtml}

      <!-- Grid Data Pemohon & Lokasi Proyek -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;">
        <div style="background: #f8fafc; border: 1px solid var(--slate-200); border-radius: var(--radius-lg); padding: 1.1rem;">
          <h4 style="font-size: 0.82rem; text-transform: uppercase; color: var(--slate-500); margin-bottom: 0.75rem; letter-spacing: 0.05em;">
            Data Pemohon / Pelaku Usaha
          </h4>
          <table style="font-size: 0.84rem; width: 100%;">
            <tr><td style="color: var(--slate-500); width: 35%; padding-bottom: 0.4rem;">Nama:</td><td><strong>${item.namaPemohon}</strong></td></tr>
            <tr><td style="color: var(--slate-500); padding-bottom: 0.4rem;">Kategori:</td><td>${item.jenisPemohon}</td></tr>
            <tr><td style="color: var(--slate-500); padding-bottom: 0.4rem;">Identitas:</td><td>${item.nikNib}</td></tr>
            <tr><td style="color: var(--slate-500); padding-bottom: 0.4rem;">Kecamatan:</td><td><strong>Kec. ${item.kecamatan}</strong></td></tr>
          </table>
        </div>

        <div style="background: #f8fafc; border: 1px solid var(--slate-200); border-radius: var(--radius-lg); padding: 1.1rem;">
          <h4 style="font-size: 0.82rem; text-transform: uppercase; color: var(--slate-500); margin-bottom: 0.75rem; letter-spacing: 0.05em;">
            Data Pelayanan & Waktu
          </h4>
          <table style="font-size: 0.84rem; width: 100%;">
            <tr><td style="color: var(--slate-500); width: 35%; padding-bottom: 0.4rem;">Tgl Pengajuan:</td><td><strong>${item.tglPengajuan}</strong></td></tr>
            <tr><td style="color: var(--slate-500); padding-bottom: 0.4rem;">Tgl Selesai:</td><td>${item.tglSelesai || 'Belum rampung'}</td></tr>
            <tr><td style="color: var(--slate-500); padding-bottom: 0.4rem;">Posisi Meja:</td><td>${item.posisiMeja}</td></tr>
            <tr><td style="color: var(--slate-500);">Penanggung Jawab:</td><td>${item.penanggungJawab}</td></tr>
          </table>
        </div>
      </div>

      <!-- Kotak Catatan Pimpinan & Bottleneck Detail -->
      <div style="background: #fffbeb; border: 1px solid #fed7aa; border-left: 4px solid #f59e0b; border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.75rem;">
        <div style="font-weight: 800; color: #92400e; font-size: 0.88rem; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
          <i class="fas fa-exclamation-circle"></i> Keterangan / Kendala Berkas:
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
        ${(item.timeline || []).map((step, idx) => `
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

    const now = new Date();
    const formattedTime = now.getFullYear() + '-' + 
      String(now.getMonth()+1).padStart(2,'0') + '-' + 
      String(now.getDate()).padStart(2,'0') + ' ' + 
      String(now.getHours()).padStart(2,'0') + ':' + 
      String(now.getMinutes()).padStart(2,'0');

    if (!item.timeline) item.timeline = [];
    item.timeline.push({
      waktu: formattedTime,
      tahap: newTahap,
      status: newStatus === 'SELESAI' ? 'DONE' : (newStatus === 'PENDING_PEMOHON' ? 'HOLD' : 'ACTIVE'),
      petugas: Auth.getCurrentUser() ? Auth.getCurrentUser().nama : 'Petugas Dinas',
      catatan: newLogNote || ('Status diperbarui menjadi ' + newStatus + '. Keterangan: ' + newKeterangan)
    });

    saveStoredSubmissions(this.submissions);
    if (typeof DataAPI !== 'undefined') {
      DataAPI.updateSubmission(item.id, {
        status: item.status,
        slaStatus: item.slaStatus,
        tahapSaatIni: item.tahapSaatIni,
        posisiMeja: item.posisiMeja,
        keteranganKendala: item.keteranganKendala,
        catatanPimpinan: item.catatanPimpinan,
        noSuratKeputusan: item.noSuratKeputusan,
        timeline: item.timeline
      });
    }
    this.renderAll();

    document.getElementById('modal-update-status').classList.remove('active');
    alert('Status berkas pengajuan berhasil diperbarui!');
  },

  deleteSubmission(id) {
    if (!Auth.isSuperAdmin() && !Auth.isKepalaDinas()) {
      alert("Hanya Superadmin atau Kepala Dinas yang memiliki hak akses untuk menghapus data pengajuan.");
      return;
    }
    const item = this.submissions.find(s => s.id === id);
    if (!item) return;

    if (confirm(`Apakah Anda yakin ingin menghapus data permohonan ${item.noRegistrasi} (${item.namaPemohon})? Data akan dihapus secara permanen dari database.`)) {
      this.submissions = this.submissions.filter(s => s.id !== id);
      saveStoredSubmissions(this.submissions);
      if (typeof DataAPI !== 'undefined') {
        DataAPI.deleteSubmission(id);
      }
      this.renderAll();
      alert(`Pengajuan ${item.noRegistrasi} berhasil dihapus dari sistem.`);
    }
  },

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
    const regCode = `REG/${bidang}/2026/${String(count).padStart(4, '0')}`;
    const newId = `SUB-2026-${String(count).padStart(4, '0')}`;

    const tgl = new Date().toISOString().split('T')[0];
    const targetDays = LAYANAN_CONFIG[layanan] ? LAYANAN_CONFIG[layanan].standarSLA : (layanan === 'PBG' || layanan === 'SLF' ? 28 : 5);
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
    if (typeof DataAPI !== 'undefined') {
      DataAPI.addSubmission(newSub);
    }
    this.renderAll();

    document.getElementById('modal-new-submission').classList.remove('active');
    alert(`Pengajuan berhasil ditambahkan dengan Nomor Registrasi: ${regCode}`);
  },

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
