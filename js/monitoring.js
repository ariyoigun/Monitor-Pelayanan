/**
 * SIKEREN DINPUTARU DEMAK - Monitoring Engine
 * Sistem Informasi Keterangan Pelayanan Perizinan
 * Table Rendering, Filtering, KPI Metrics, Leadership Focus, Internal Charts & Submission Operations
 */

const Monitoring = {
  submissions: [],
  filters: {
    tahun: (typeof getActiveYear === 'function') ? getActiveYear() : '2026',
    bidang: 'ALL',
    layanan: 'ALL',
    bulan: 'ALL',
    status: 'ALL',
    sort: 'tgl-desc',
    search: ''
  },
  chartFilterService: 'ALL',
  charts: {},
  currentSubView: 'ringkasan',
  currentPage: 1,
  itemsPerPage: 50,

  init() {
    this.submissions = getStoredSubmissions();
    this.filters.tahun = (typeof getActiveYear === 'function') ? getActiveYear() : '2026';
    this.renderYearSelector();
    this.renderAll();
    this.setupEventListeners();
  },

  refreshData() {
    this.submissions = getStoredSubmissions();
    this.renderAll();
    this.switchSubView(this.currentSubView || 'ringkasan');
  },

  switchSubView(tabName) {
    if (!['ringkasan', 'pengajuan', 'users', 'settings', 'years'].includes(tabName)) {
      tabName = 'ringkasan';
    }
    this.currentSubView = tabName;

    // 1. Toggle subview containers
    document.querySelectorAll('.internal-subview').forEach(view => {
      view.classList.remove('active');
    });
    const target = document.getElementById(`subview-${tabName}`);
    if (target) {
      target.classList.add('active');
    }

    // 2. Toggle active state in sidebar buttons
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
      if (btn.dataset.internalTab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 3. Update topbar titles
    const titleEl = document.getElementById('dyn-dash-title');
    const breadcrumbEl = document.getElementById('internal-breadcrumb');
    if (titleEl) {
      switch (tabName) {
        case 'ringkasan':
          titleEl.textContent = 'Ringkasan & Analitik Pelayanan';
          if (breadcrumbEl) breadcrumbEl.textContent = 'Dashboard Eksekutif • Analisis Volume & Sebaran Pelayanan';
          break;
        case 'pengajuan':
          titleEl.textContent = 'Menu Pengajuan - Semua Data Pelayanan';
          if (breadcrumbEl) breadcrumbEl.textContent = `Daftar Rekapitulasi ${this.submissions.length.toLocaleString('id-ID')} Berkas Pelayanan (${this.filters.tahun !== 'ALL' ? this.filters.tahun : 'Semua Tahun'})`;
          break;
        case 'users':
          titleEl.textContent = 'Manajemen Pengguna & Hak Akses';
          if (breadcrumbEl) breadcrumbEl.textContent = 'Kelola Akun Aparatur & Petugas Internal SIKEREN';
          break;
        case 'settings':
          titleEl.textContent = 'Pengaturan Teks & Keterangan Sistem';
          if (breadcrumbEl) breadcrumbEl.textContent = 'Kustomisasi Teks Dinamis Halaman Publik & Internal';
          break;
        case 'years':
          titleEl.textContent = 'Manajemen Tahun Pelayanan';
          if (breadcrumbEl) breadcrumbEl.textContent = 'Kelola Tahun Periode & Keberlangsungan Sistem SIKEREN';
          break;
      }
    }

    // 4. Update count badge in sidebar
    const badgeEl = document.getElementById('sidebar-count-pengajuan');
    if (badgeEl) {
      badgeEl.textContent = this.submissions.length.toLocaleString('id-ID');
    }

    // 5. Trigger subview-specific logic
    if (tabName === 'ringkasan') {
      this.renderKPIs();
      this.renderLeadershipFocus();
      this.renderInternalCharts();
      this.renderCategoryCards();
    } else if (tabName === 'pengajuan') {
      this.renderTable();
      this.renderCategoryCards();
      this.renderPengajuanMonthSummary();
    } else if (tabName === 'users') {
      if (typeof UserManagement !== 'undefined') {
        UserManagement.refreshUsers();
      }
    } else if (tabName === 'settings') {
      if (typeof SystemSettings !== 'undefined') {
        SystemSettings.refresh();
      }
    } else if (tabName === 'years') {
      if (typeof YearManagement !== 'undefined') {
        YearManagement.refreshYears();
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderAll() {
    this.renderYearSelector();
    this.renderCategoryCards();
    this.renderPengajuanMonthSummary();
    this.renderKPIs();
    this.renderLeadershipFocus();
    this.renderInternalCharts();
    this.renderTable();

    const badgeEl = document.getElementById('sidebar-count-pengajuan');
    if (badgeEl) {
      badgeEl.textContent = this.submissions.length.toLocaleString('id-ID');
    }

    // Live sync to Public Infographics so public page immediately reflects status updates
    if (typeof Infografis !== 'undefined' && typeof Infografis.renderInfographics === 'function') {
      Infografis.renderInfographics();
    }
  },

  /* =========================================================
     MULTI-YEAR SELECTOR & FILTER PER TAHUN
     ========================================================= */
  renderYearSelector() {
    const years = (typeof getStoredYears === 'function') ? getStoredYears() : [{ year: "2026", label: "Tahun 2026" }];
    const container = document.getElementById('dash-year-tabs');
    if (container) {
      container.innerHTML = `
        <button type="button" class="year-filter-btn ${this.filters.tahun === 'ALL' ? 'active' : ''}" data-year="ALL">
          <i class="fas fa-layer-group"></i> Semua Tahun
        </button>
        ${years.map(y => `
          <button type="button" class="year-filter-btn ${this.filters.tahun === String(y.year) ? 'active' : ''}" data-year="${y.year}">
            <i class="fas ${this.filters.tahun === String(y.year) ? 'fa-check-circle' : 'fa-calendar'}"></i>
            ${y.label || ('Tahun ' + y.year)}
          </button>
        `).join('')}
      `;
    }

    const selectEl = document.getElementById('filter-tahun');
    if (selectEl) {
      selectEl.innerHTML = `
        <option value="ALL" ${this.filters.tahun === 'ALL' ? 'selected' : ''}>📅 Semua Tahun</option>
        ${years.map(y => `
          <option value="${y.year}" ${this.filters.tahun === String(y.year) ? 'selected' : ''}>Tahun ${y.year}</option>
        `).join('')}
      `;
    }
  },

  setYearFilter(yearKey) {
    this.currentPage = 1;
    this.filters.tahun = String(yearKey);
    this.renderYearSelector();
    this.renderCategoryCards();
    this.renderPengajuanMonthSummary();
    this.renderKPIs();
    this.renderLeadershipFocus();
    this.renderInternalCharts();
    this.renderTable();
  },

  /* =========================================================
     4 KATEGORI PENGAJUAN DENGAN WARNA BERBEDA & FILTER BULAN
     ========================================================= */
  renderCategoryCards() {
    const container = document.getElementById('dash-category-cards');

    // Filter by active year & month if selected!
    let activeSubs = this.submissions;
    const selectedYear = this.filters.tahun || 'ALL';
    if (selectedYear !== 'ALL') {
      activeSubs = activeSubs.filter(s => (s.tglPengajuan || '').startsWith(selectedYear));
    }
    const selectedMonth = this.filters.bulan || 'ALL';
    if (selectedMonth !== 'ALL') {
      const m = parseInt(selectedMonth, 10);
      activeSubs = activeSubs.filter(s => {
        const itemMonth = parseInt((s.tglPengajuan || '').split('-')[1], 10);
        return itemMonth === m;
      });
    }

    // Update Category Badges in toolbar (Always matches active year & month!)
    const countAll = activeSubs.length;
    const countKttr = activeSubs.filter(s => s.layanan === 'KTTR').length;
    const countOss = activeSubs.filter(s => s.layanan === 'OSS').length;
    const countPbg = activeSubs.filter(s => s.layanan === 'PBG').length;
    const countSlf = activeSubs.filter(s => s.layanan === 'SLF').length;

    const elAll = document.getElementById('cat-count-all');
    const elKttr = document.getElementById('cat-count-kttr');
    const elOss = document.getElementById('cat-count-oss');
    const elPbg = document.getElementById('cat-count-pbg');
    const elSlf = document.getElementById('cat-count-slf');

    if (elAll) elAll.textContent = countAll.toLocaleString('id-ID');
    if (elKttr) elKttr.textContent = countKttr.toLocaleString('id-ID');
    if (elOss) elOss.textContent = countOss.toLocaleString('id-ID');
    if (elPbg) elPbg.textContent = countPbg.toLocaleString('id-ID');
    if (elSlf) elSlf.textContent = countSlf.toLocaleString('id-ID');

    if (!container) return;

    const monthNames = {
      'ALL': '',
      '1': 'Januari', '2': 'Februari', '3': 'Maret', '4': 'April',
      '5': 'Mei', '6': 'Juni', '7': 'Juli', '8': 'Agustus',
      '9': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
    };
    const monthSuffix = selectedMonth !== 'ALL' ? ` (${monthNames[selectedMonth]}${selectedYear !== 'ALL' ? ' ' + selectedYear : ''})` : (selectedYear !== 'ALL' ? ` (${selectedYear})` : '');

    const categories = [
      {
        key: 'KTTR',
        name: 'Keterangan Rencana Tata Ruang',
        bidang: 'Tata Ruang & Pertanahan (TRP)',
        sla: '5 Hari Kerja',
        color: '#0284c7',
        bg: '#e0f2fe',
        border: '#0284c7',
        icon: 'fa-map-marked-alt'
      },
      {
        key: 'OSS',
        name: 'Validasi Kesesuaian Tata Ruang (KKPR)',
        bidang: 'Tata Ruang & Pertanahan (TRP)',
        sla: '5 Hari Kerja',
        color: '#16a34a',
        bg: '#dcfce7',
        border: '#16a34a',
        icon: 'fa-network-wired'
      },
      {
        key: 'PBG',
        name: 'Persetujuan Bangunan Gedung',
        bidang: 'Cipta Karya (CK)',
        sla: '28 Hari Kerja',
        color: '#d97706',
        bg: '#fef3c7',
        border: '#d97706',
        icon: 'fa-building'
      },
      {
        key: 'SLF',
        name: 'Sertifikat Laik Fungsi',
        bidang: 'Cipta Karya (CK)',
        sla: '28 Hari Kerja',
        color: '#9333ea',
        bg: '#f3e8ff',
        border: '#9333ea',
        icon: 'fa-award'
      }
    ];

    container.innerHTML = categories.map(cat => {
      const subs = activeSubs.filter(s => s.layanan === cat.key || s.kategori === cat.key);
      const total = subs.length;
      const dilayani = subs.filter(s => s.status === 'SELESAI').length;
      const kembali = subs.filter(s => s.status === 'BERKAS_DIKEMBALIKAN').length;
      const progress = subs.filter(s => s.status === 'PROSES' || (!['SELESAI', 'BERKAS_DIKEMBALIKAN'].includes(s.status))).length;
      const rate = total > 0 ? Math.round(((dilayani + kembali) / total) * 100) : 0;

      const pDilayani = total > 0 ? (dilayani / total) * 100 : 0;
      const pKembali = total > 0 ? (kembali / total) * 100 : 0;
      const pProgress = total > 0 ? (progress / total) * 100 : 0;

      const isSelected = this.filters.layanan === cat.key;

      return `
        <div class="dash-cat-card ${isSelected ? 'active-filter' : ''}" style="border-top: 4px solid ${cat.border}; cursor: pointer;" onclick="Monitoring.setCategoryFilter('${cat.key}')">
          <div class="dash-cat-header">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div class="dash-cat-icon" style="background: ${cat.bg}; color: ${cat.color};">
                <i class="fas ${cat.icon}"></i>
              </div>
              <div>
                <h4 style="font-size: 1rem; font-weight: 800; color: var(--slate-900); margin: 0;">${cat.key}</h4>
                <div style="font-size: 0.72rem; color: var(--slate-500);">${cat.bidang.split(' ')[0]} &bull; SLA ${cat.sla}${monthSuffix}</div>
              </div>
            </div>
            <span class="badge" style="background: ${cat.bg}; color: ${cat.color}; font-weight: 700;">
              ${cat.key}
            </span>
          </div>

          <div class="dash-cat-title" style="font-size: 0.82rem; font-weight: 600; color: var(--slate-700); margin: 0.6rem 0;">
            ${cat.name}
          </div>

          <!-- 5 Metrics Figures -->
          <div class="dash-cat-stats-row">
            <div class="dash-cat-stat">
              <span class="lbl">Total Masuk</span>
              <span class="val">${total.toLocaleString('id-ID')}</span>
            </div>
            <div class="dash-cat-stat">
              <span class="lbl" style="color: #059669;">Dilayani</span>
              <span class="val" style="color: #059669;">${dilayani.toLocaleString('id-ID')}</span>
            </div>
            <div class="dash-cat-stat">
              <span class="lbl" style="color: #d97706;">On Progress</span>
              <span class="val" style="color: #d97706;">${progress.toLocaleString('id-ID')}</span>
            </div>
            <div class="dash-cat-stat">
              <span class="lbl" style="color: #4f46e5;">Dikembalikan</span>
              <span class="val" style="color: #4f46e5;">${kembali.toLocaleString('id-ID')}</span>
            </div>
            <div class="dash-cat-stat">
              <span class="lbl" style="color: #7e22ce;">Penyelesaian</span>
              <span class="val" style="color: #9333ea;">${rate}%</span>
            </div>
          </div>

          <!-- Visual Progress -->
          <div class="visual-progress-block" style="margin-top: 0.65rem;">
            <div class="progress-bar-track" style="height: 6px;">
              <div class="progress-bar-fill fill-selesai" style="width: ${pDilayani}%;" title="Sudah Dilayani: ${dilayani}"></div>
              <div class="progress-bar-fill" style="width: ${pKembali}%; background: #6366f1;" title="Berkas Dikembalikan: ${kembali}"></div>
              <div class="progress-bar-fill fill-belum" style="width: ${pProgress}%;" title="On Progress: ${progress}"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  /* =========================================================
     RINGKASAN METRIK PER LAYANAN BERDASARKAN BULAN DI PENGAJUAN
     ========================================================= */
  renderPengajuanMonthSummary() {
    const container = document.getElementById('dash-pengajuan-month-bar');
    if (!container) return;

    const selectedYear = this.filters.tahun || 'ALL';
    const monthKey = this.filters.bulan || 'ALL';
    const yrSuffix = selectedYear !== 'ALL' ? ` ${selectedYear}` : '';
    const monthNames = {
      'ALL': `Sepanjang Tahun${yrSuffix} (Semua Bulan)`,
      '1': `Januari${yrSuffix}`,
      '2': `Februari${yrSuffix}`,
      '3': `Maret${yrSuffix}`,
      '4': `April${yrSuffix}`,
      '5': `Mei${yrSuffix}`,
      '6': `Juni${yrSuffix}`,
      '7': `Juli${yrSuffix}`,
      '8': `Agustus${yrSuffix}`,
      '9': `September${yrSuffix}`,
      '10': `Oktober${yrSuffix}`,
      '11': `November${yrSuffix}`,
      '12': `Desember${yrSuffix}`
    };

    let activeSubs = this.submissions;
    if (selectedYear !== 'ALL') {
      activeSubs = activeSubs.filter(s => (s.tglPengajuan || '').startsWith(selectedYear));
    }
    if (monthKey !== 'ALL') {
      const m = parseInt(monthKey, 10);
      activeSubs = activeSubs.filter(s => {
        const itemMonth = parseInt((s.tglPengajuan || '').split('-')[1], 10);
        return itemMonth === m;
      });
    }

    const services = [
      { key: 'KTTR', name: 'KTTR', dotColor: '#0284c7', border: '#0284c7', sla: '5 Hari' },
      { key: 'OSS', name: 'Validasi OSS', dotColor: '#16a34a', border: '#16a34a', sla: '5 Hari' },
      { key: 'PBG', name: 'PBG', dotColor: '#d97706', border: '#d97706', sla: '28 Hari' },
      { key: 'SLF', name: 'SLF', dotColor: '#9333ea', border: '#9333ea', sla: '28 Hari' }
    ];

    const totalAll = activeSubs.length;
    const selesaiAll = activeSubs.filter(s => s.status === 'SELESAI').length;
    const kembaliAll = activeSubs.filter(s => s.status === 'BERKAS_DIKEMBALIKAN').length;
    const onProgAll = activeSubs.filter(s => s.status === 'PROSES' || (!['SELESAI', 'BERKAS_DIKEMBALIKAN', 'DITOLAK'].includes(s.status))).length;
    const rateAll = totalAll > 0 ? Math.round(((selesaiAll + kembaliAll) / totalAll) * 100) : 0;

    const chipsHtml = services.map(srv => {
      const sSubs = activeSubs.filter(s => s.layanan === srv.key || s.kategori === srv.key);
      const tot = sSubs.length;
      const sel = sSubs.filter(s => s.status === 'SELESAI').length;
      const onProg = sSubs.filter(s => s.status === 'PROSES' || (!['SELESAI', 'BERKAS_DIKEMBALIKAN', 'DITOLAK'].includes(s.status))).length;
      const kem = sSubs.filter(s => s.status === 'BERKAS_DIKEMBALIKAN').length;
      const rate = tot > 0 ? Math.round(((sel + kem) / tot) * 100) : 0;

      const isCurrentFilter = this.filters.layanan === srv.key;

      return `
        <div class="month-service-chip" style="border-left: 3px solid ${srv.border}; cursor: pointer; ${isCurrentFilter ? 'box-shadow: 0 0 0 2px ' + srv.border + ';' : ''}" onclick="Monitoring.setCategoryFilter('${srv.key}')" title="Klik untuk memfilter pengajuan ${srv.name}">
          <div class="month-service-chip-head">
            <span class="month-service-chip-name">
              <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${srv.dotColor};"></span>
              ${srv.name} <span style="font-size:0.7rem;font-weight:normal;color:#94a3b8;">(${srv.sla})</span>
            </span>
            <span class="month-service-chip-count" style="color:${srv.dotColor};">${tot.toLocaleString('id-ID')}</span>
          </div>
          <div class="month-service-chip-breakdown">
            <span style="color:#10b981;">Dilayani: <strong>${sel}</strong></span> &bull;
            <span style="color:#d97706;">On Progress: <strong>${onProg}</strong></span> &bull;
            <span style="color:#6366f1;">Kembali: <strong>${kem}</strong></span>
            <span style="margin-left:auto;font-weight:700;color:${rate >= 80 ? '#10b981' : '#64748b'};">${rate}%</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="pengajuan-month-bar-header">
        <div class="pengajuan-month-bar-title">
          <i class="fas fa-calendar-alt" style="color:var(--primary-600);"></i>
          Data Pengajuan Periode: <span style="color:var(--primary-700);">${monthNames[monthKey] || monthKey}</span>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;flex-wrap:wrap;">
          <span class="pengajuan-month-bar-badge">
            Total Masuk: <strong>${totalAll.toLocaleString('id-ID')}</strong> Berkas
          </span>
          <span class="pengajuan-month-bar-badge" style="background:#ecfdf5;color:#047857;border-color:#a7f3d0;">
            Dilayani: <strong>${selesaiAll.toLocaleString('id-ID')}</strong>
          </span>
          <span class="pengajuan-month-bar-badge" style="background:#fffbeb;color:#b45309;border-color:#fde68a;">
            On Progress: <strong>${onProgAll.toLocaleString('id-ID')}</strong>
          </span>
          <span class="pengajuan-month-bar-badge" style="background:#eef2ff;color:#4338ca;border-color:#c7d2fe;">
            Kembali: <strong>${kembaliAll.toLocaleString('id-ID')}</strong>
          </span>
          <span class="pengajuan-month-bar-badge" style="background:#f5f3ff;color:#6b21a8;border-color:#ddd6fe;">
            Penyelesaian: <strong>${rateAll}%</strong>
          </span>
        </div>
      </div>
      <div class="pengajuan-month-services-grid">
        ${chipsHtml}
      </div>
    `;
  },

  setCategoryFilter(categoryKey) {
    this.currentPage = 1;
    this.filters.layanan = categoryKey;
    if (categoryKey === 'PBG' || categoryKey === 'SLF') {
      this.filters.bidang = 'ALL';
      const elB = document.getElementById('filter-bidang');
      if (elB) elB.value = 'ALL';
    } else if (categoryKey === 'KTTR' || categoryKey === 'OSS') {
      this.filters.bidang = 'ALL';
      const elB = document.getElementById('filter-bidang');
      if (elB) elB.value = 'ALL';
    }
    const filterLayananSelect = document.getElementById('filter-layanan');
    if (filterLayananSelect) {
      filterLayananSelect.value = categoryKey;
    }
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      if (btn.dataset.category === categoryKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    this.renderCategoryCards();
    this.renderPengajuanMonthSummary();
    this.renderTable();
    this.switchSubView('pengajuan');
  },

  setMonthFilter(monthKey) {
    this.currentPage = 1;
    this.filters.bulan = String(monthKey);
    const filterBulanSelect = document.getElementById('filter-bulan');
    if (filterBulanSelect) {
      filterBulanSelect.value = String(monthKey);
    }
    document.querySelectorAll('.month-filter-btn').forEach(btn => {
      if (btn.dataset.month === String(monthKey)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderCategoryCards();
    this.renderPengajuanMonthSummary();
    this.renderKPIs();
    this.renderTable();
  },

  setStatusFilter(statusKey) {
    this.currentPage = 1;
    this.filters.status = statusKey;
    const filterStatusSelect = document.getElementById('filter-status-select');
    if (filterStatusSelect) {
      filterStatusSelect.value = statusKey;
    }
    document.querySelectorAll('.filter-chip').forEach(chip => {
      if (chip.dataset.status === statusKey) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
    this.renderTable();
  },

  setSortOrder(sortKey) {
    this.currentPage = 1;
    this.filters.sort = sortKey;
    const sortSelect = document.getElementById('sort-order');
    if (sortSelect) {
      sortSelect.value = sortKey;
    }
    this.renderTable();
  },

  setChartFilterService(srvKey) {
    this.chartFilterService = srvKey;
    document.querySelectorAll('.chart-filter-btn').forEach(btn => {
      if (btn.dataset.chartService === srvKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    const titleEl = document.getElementById('chart-monthly-comparison-title');
    if (titleEl) {
      const srvLabel = srvKey === 'ALL' ? 'Semua Layanan' : srvKey;
      titleEl.innerHTML = `<i class="fas fa-chart-bar" style="color: #0284c7;"></i> Komparasi Status Pengajuan Per Bulan (${srvLabel}) (2026)`;
    }
    this.renderInternalCharts();
  },

  /* =========================================================
     KPI METRICS (5 INDIKATOR INFORMASI)
     ========================================================= */
  renderKPIs() {
    let activeSubs = this.submissions;
    if (this.filters.tahun && this.filters.tahun !== 'ALL') {
      activeSubs = activeSubs.filter(s => (s.tglPengajuan || '').startsWith(this.filters.tahun));
    }
    if (this.filters.bulan && this.filters.bulan !== 'ALL') {
      const m = parseInt(this.filters.bulan, 10);
      activeSubs = activeSubs.filter(s => {
        const itemMonth = parseInt((s.tglPengajuan || '').split('-')[1], 10);
        return itemMonth === m;
      });
    }

    const total = activeSubs.length;
    const selesai = activeSubs.filter(s => s.status === 'SELESAI').length;
    const dikembalikan = activeSubs.filter(s => s.status === 'BERKAS_DIKEMBALIKAN').length;
    const onProgress = activeSubs.filter(s => s.status === 'PROSES' || (!['SELESAI', 'BERKAS_DIKEMBALIKAN', 'DITOLAK'].includes(s.status))).length;

    const rate = total > 0 ? Math.round(((selesai + dikembalikan) / total) * 100) : 0;

    const elTotal = document.getElementById('kpi-total-pengajuan');
    const elSelesai = document.getElementById('kpi-selesai');
    const elOnProgress = document.getElementById('kpi-onprogress');
    const elProses = document.getElementById('kpi-proses');
    const elDikembalikan = document.getElementById('kpi-dikembalikan');
    const elPersen = document.getElementById('kpi-persen-selesai');

    if (elTotal) elTotal.textContent = total.toLocaleString('id-ID');
    if (elSelesai) elSelesai.innerHTML = `${selesai.toLocaleString('id-ID')}`;
    if (elOnProgress) elOnProgress.textContent = onProgress.toLocaleString('id-ID');
    if (elProses) elProses.textContent = onProgress.toLocaleString('id-ID');
    if (elDikembalikan) elDikembalikan.textContent = dikembalikan.toLocaleString('id-ID');
    if (elPersen) elPersen.textContent = `${rate}%`;
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
     GRAFIK DI DASHBOARD INTERNAL (CHART.JS DYNAMIC & INTERACTIVE)
     ========================================================= */
  renderInternalCharts() {
    if (typeof Chart === 'undefined') return;

    // Destroy previous charts to avoid canvas re-use errors
    if (this.charts.monthlyStatus) this.charts.monthlyStatus.destroy();
    if (this.charts.trend) this.charts.trend.destroy();
    if (this.charts.status) this.charts.status.destroy();
    if (this.charts.services) this.charts.services.destroy();
    if (this.charts.kecamatan) this.charts.kecamatan.destroy();

    const activeYear = this.filters.tahun || 'ALL';
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const yearSubmissions = this.submissions.filter(s => {
      if (activeYear === 'ALL') return true;
      return (s.tglPengajuan || '').startsWith(activeYear);
    });

    // 1. Chart Utama: Komparasi Status Per Bulan (Interaktif & Multi-Service, 12 Bulan)
    const canvasMonthlyStatus = document.getElementById('chart-internal-monthly-status');
    if (canvasMonthlyStatus) {
      const srv = this.chartFilterService || 'ALL';
      const selesaiMonthly = [];
      const onProgressMonthly = [];
      const dikembalikanMonthly = [];

      for (let m = 1; m <= 12; m++) {
        const mSubs = yearSubmissions.filter(s => {
          const itemMonth = parseInt((s.tglPengajuan || '').split('-')[1], 10);
          if (itemMonth !== m) return false;
          if (srv !== 'ALL' && s.layanan !== srv && s.kategori !== srv) return false;
          return true;
        });

        const sel = mSubs.filter(s => s.status === 'SELESAI').length;
        const kem = mSubs.filter(s => s.status === 'BERKAS_DIKEMBALIKAN').length;
        const prog = mSubs.filter(s => s.status === 'PROSES' || (!['SELESAI', 'BERKAS_DIKEMBALIKAN'].includes(s.status))).length;

        selesaiMonthly.push(sel);
        onProgressMonthly.push(prog);
        dikembalikanMonthly.push(kem);
      }

      this.charts.monthlyStatus = new Chart(canvasMonthlyStatus.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
          datasets: [
            {
              label: 'Sudah Dilayani / Terbit',
              data: selesaiMonthly,
              backgroundColor: '#10b981',
              borderRadius: 4,
              stack: 'statusStack'
            },
            {
              label: 'On Progress',
              data: onProgressMonthly,
              backgroundColor: '#f59e0b',
              borderRadius: 4,
              stack: 'statusStack'
            },
            {
              label: 'Berkas Dikembalikan',
              data: dikembalikanMonthly,
              backgroundColor: '#6366f1',
              borderRadius: 4,
              stack: 'statusStack'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              position: 'top',
              labels: { boxWidth: 14, font: { weight: 600, size: 12 } }
            },
            tooltip: {
              callbacks: {
                footer: (tooltipItems) => {
                  let sum = 0;
                  tooltipItems.forEach(item => { sum += item.parsed.y; });
                  return 'Total Pengajuan: ' + sum.toLocaleString('id-ID');
                }
              }
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: { precision: 0 }
            }
          }
        }
      });
    }

    // 2. Chart Tren Bulanan Per Layanan (Dihitung Dinamis dari Submissions, 12 Bulan)
    const canvasTrend = document.getElementById('chart-internal-trend');
    if (canvasTrend) {
      const kttrMonthly = [];
      const ossMonthly = [];
      const pbgMonthly = [];
      const slfMonthly = [];

      for (let m = 1; m <= 12; m++) {
        const mSubs = yearSubmissions.filter(s => parseInt((s.tglPengajuan || '').split('-')[1], 10) === m);
        kttrMonthly.push(mSubs.filter(s => s.layanan === 'KTTR').length);
        ossMonthly.push(mSubs.filter(s => s.layanan === 'OSS').length);
        pbgMonthly.push(mSubs.filter(s => s.layanan === 'PBG').length);
        slfMonthly.push(mSubs.filter(s => s.layanan === 'SLF').length);
      }

      this.charts.trend = new Chart(canvasTrend.getContext('2d'), {
        type: 'bar',
        data: {
          labels: monthLabels,
          datasets: [
            { label: 'KTTR', data: kttrMonthly, backgroundColor: '#0284c7', borderRadius: 4 },
            { label: 'Validasi OSS', data: ossMonthly, backgroundColor: '#16a34a', borderRadius: 4 },
            { label: 'PBG', data: pbgMonthly, backgroundColor: '#d97706', borderRadius: 4 },
            { label: 'SLF', data: slfMonthly, backgroundColor: '#9333ea', borderRadius: 4 }
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

    // 3. Chart Status Penyelesaian Keseluruhan
    const canvasStatus = document.getElementById('chart-internal-status');
    if (canvasStatus) {
      const selesai = yearSubmissions.filter(s => s.status === 'SELESAI').length;
      const proses = yearSubmissions.filter(s => s.status === 'PROSES' || (!['SELESAI', 'BERKAS_DIKEMBALIKAN', 'DITOLAK'].includes(s.status))).length;
      const kembali = yearSubmissions.filter(s => s.status === 'BERKAS_DIKEMBALIKAN').length;
      const overdue = yearSubmissions.filter(s => s.slaStatus === 'OVERDUE' && s.status !== 'SELESAI').length;

      this.charts.status = new Chart(canvasStatus.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Sudah Dilayani / Terbit', 'On Progress', 'Berkas Dikembalikan', 'Overdue SLA'],
          datasets: [{
            data: [selesai, proses, kembali, overdue],
            backgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#ef4444'],
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

    // 4. Chart Proporsi Layanan
    const canvasServices = document.getElementById('chart-internal-services');
    if (canvasServices) {
      const countKttr = yearSubmissions.filter(s => s.layanan === 'KTTR').length;
      const countOss = yearSubmissions.filter(s => s.layanan === 'OSS').length;
      const countPbg = yearSubmissions.filter(s => s.layanan === 'PBG').length;
      const countSlf = yearSubmissions.filter(s => s.layanan === 'SLF').length;

      this.charts.services = new Chart(canvasServices.getContext('2d'), {
        type: 'pie',
        data: {
          labels: ['KTTR (Tata Ruang)', 'OSS-RBA (Tata Ruang)', 'PBG (Cipta Karya)', 'SLF (Cipta Karya)'],
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

    // 5. Chart Sebaran Kecamatan di Kab. Demak
    const canvasKecamatan = document.getElementById('chart-internal-kecamatan');
    if (canvasKecamatan) {
      const kecCounts = {};
      yearSubmissions.forEach(s => {
        const k = s.kecamatan || 'Demak';
        kecCounts[k] = (kecCounts[k] || 0) + 1;
      });

      const sortedKec = Object.entries(kecCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
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
     FILTERING & SORTING LOGIC
     ========================================================= */
  getFilteredSubmissions() {
    let result = this.submissions.filter(item => {
      // 0. Tahun Pengajuan filter
      if (this.filters.tahun && this.filters.tahun !== 'ALL') {
        const itemDate = item.tglPengajuan || '';
        if (!itemDate.startsWith(this.filters.tahun)) {
          return false;
        }
      }

      // 1. Bidang filter
      if (this.filters.bidang !== 'ALL' && item.bidang !== this.filters.bidang) {
        return false;
      }

      // 2. Layanan / Kategori filter
      if (this.filters.bidang !== 'ALL' && item.bidang !== this.filters.bidang) {
        return false;
      }

      // 2. Layanan / Kategori filter
      if (this.filters.layanan !== 'ALL') {
        if (item.layanan !== this.filters.layanan && item.kategori !== this.filters.layanan) {
          return false;
        }
      }

      // 3. Bulan Pengajuan filter (Jan - Nov 2026)
      if (this.filters.bulan !== 'ALL') {
        const itemDate = item.tglPengajuan || '';
        const parts = itemDate.split('-');
        if (parts.length >= 2) {
          const itemMonth = parseInt(parts[1], 10);
          if (itemMonth !== parseInt(this.filters.bulan, 10)) {
            return false;
          }
        } else {
          return false;
        }
      }

      // 4. Status filter
      if (this.filters.status === 'BELUM_SELESAI') {
        if (item.status === 'SELESAI' || item.status === 'DITOLAK') return false;
      } else if (this.filters.status === 'OVERDUE') {
        if (item.slaStatus !== 'OVERDUE' || item.status === 'SELESAI') return false;
      } else if (this.filters.status === 'PROSES') {
        if (item.status !== 'PROSES' && (item.status === 'SELESAI' || item.status === 'BERKAS_DIKEMBALIKAN' || item.status === 'DITOLAK')) return false;
      } else if (this.filters.status !== 'ALL') {
        if (item.status !== this.filters.status) return false;
      }

      // 5. Search filter
      if (this.filters.search && this.filters.search.trim() !== '') {
        const q = this.filters.search.toLowerCase().trim();
        const match =
          (item.noRegistrasi || '').toLowerCase().includes(q) ||
          (item.namaPemohon || '').toLowerCase().includes(q) ||
          (item.namaKegiatan || '').toLowerCase().includes(q) ||
          (item.lokasiProyek || '').toLowerCase().includes(q) ||
          (item.kecamatan || '').toLowerCase().includes(q) ||
          (item.posisiMeja || '').toLowerCase().includes(q) ||
          (item.penanggungJawab || '').toLowerCase().includes(q) ||
          (item.noSuratKeputusan || '').toLowerCase().includes(q) ||
          (item.keteranganKendala || '').toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });

    // 6. Sorting Logic
    const sort = this.filters.sort || 'tgl-desc';
    result.sort((a, b) => {
      if (sort === 'tgl-desc') {
        const dateComp = (b.tglPengajuan || '').localeCompare(a.tglPengajuan || '');
        if (dateComp !== 0) return dateComp;
        return (b.id || '').localeCompare(a.id || '');
      } else if (sort === 'tgl-asc') {
        const dateComp = (a.tglPengajuan || '').localeCompare(b.tglPengajuan || '');
        if (dateComp !== 0) return dateComp;
        return (a.id || '').localeCompare(b.id || '');
      } else if (sort === 'status') {
        const order = { 'PROSES': 1, 'PENDING_PEMOHON': 2, 'SIDANG_SURVEY': 3, 'MENUNGGU_APPROVAL': 4, 'BERKAS_DIKEMBALIKAN': 5, 'OVERDUE': 0, 'SELESAI': 6, 'DITOLAK': 7 };
        const oA = order[a.status] !== undefined ? order[a.status] : 10;
        const oB = order[b.status] !== undefined ? order[b.status] : 10;
        if (oA !== oB) return oA - oB;
        return (b.tglPengajuan || '').localeCompare(a.tglPengajuan || '');
      } else if (sort === 'pemohon-asc') {
        return (a.namaPemohon || '').localeCompare(b.namaPemohon || '');
      } else if (sort === 'noreg-desc') {
        return (b.noRegistrasi || '').localeCompare(a.noRegistrasi || '');
      }
      return 0;
    });

    return result;
  },

  /* =========================================================
     TABLE RENDERING
     ========================================================= */
  renderTable() {
    const tbody = document.getElementById('monitoring-table-body');
    const countBadge = document.getElementById('table-count-badge');
    const paginationBar = document.getElementById('table-pagination-bar');
    if (!tbody) return;

    const items = this.getFilteredSubmissions();
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / this.itemsPerPage));

    if (this.currentPage > totalPages) this.currentPage = totalPages;
    if (this.currentPage < 1) this.currentPage = 1;

    if (countBadge) {
      const monthNames = {
        'ALL': 'Semua Bulan',
        '1': 'Januari', '2': 'Februari', '3': 'Maret', '4': 'April',
        '5': 'Mei', '6': 'Juni', '7': 'Juli', '8': 'Agustus',
        '9': 'September', '10': 'Oktober', '11': 'November'
      };
      const monthLabel = monthNames[this.filters.bulan || 'ALL'] || this.filters.bulan;
      countBadge.textContent = `${totalItems.toLocaleString('id-ID')} Data Ditemukan (${monthLabel})`;
    }

    if (totalItems === 0) {
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
      if (paginationBar) paginationBar.style.display = 'none';
      return;
    }

    if (paginationBar) paginationBar.style.display = 'flex';

    const startIdx = (this.currentPage - 1) * this.itemsPerPage;
    const endIdx = Math.min(startIdx + this.itemsPerPage, totalItems);
    const displayItems = items.slice(startIdx, endIdx);

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

              ${Auth.canDeleteSubmission(item.bidang) ? `
                <button class="btn btn-danger btn-sm" title="Hapus Berkas Pengajuan" onclick="Monitoring.deleteSubmission('${item.id}')" style="background: #fee2e2; border-color: #fca5a5; color: #dc2626; padding: 0.25rem 0.5rem;">
                  <i class="fas fa-trash-alt"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.renderPaginationControls(totalItems, totalPages, startIdx, endIdx);
  },

  renderPaginationControls(totalItems, totalPages, startIdx, endIdx) {
    const infoEl = document.getElementById('pagination-info');
    const controlsEl = document.getElementById('pagination-controls');
    if (infoEl) {
      infoEl.textContent = `Menampilkan ${startIdx + 1} - ${endIdx} dari ${totalItems.toLocaleString('id-ID')} data permohonan`;
    }
    if (!controlsEl) return;

    let html = `
      <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="Monitoring.goToPage(1)" title="Halaman Pertama">
        <i class="fas fa-angle-double-left"></i>
      </button>
      <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="Monitoring.goToPage(${this.currentPage - 1})" title="Sebelumnya">
        <i class="fas fa-chevron-left"></i> Prev
      </button>
    `;

    const cur = this.currentPage;
    let startPage = Math.max(1, cur - 2);
    let endPage = Math.min(totalPages, cur + 2);

    if (startPage > 1) {
      html += `<button class="pagination-btn" onclick="Monitoring.goToPage(1)">1</button>`;
      if (startPage > 2) html += `<span style="padding: 0 0.3rem; color: #94a3b8;">...</span>`;
    }

    for (let p = startPage; p <= endPage; p++) {
      html += `<button class="pagination-btn ${p === cur ? 'active' : ''}" onclick="Monitoring.goToPage(${p})">${p}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += `<span style="padding: 0 0.3rem; color: #94a3b8;">...</span>`;
      html += `<button class="pagination-btn" onclick="Monitoring.goToPage(${totalPages})">${totalPages}</button>`;
    }

    html += `
      <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="Monitoring.goToPage(${this.currentPage + 1})" title="Berikutnya">
        Next <i class="fas fa-chevron-right"></i>
      </button>
      <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="Monitoring.goToPage(${totalPages})" title="Halaman Terakhir">
        <i class="fas fa-angle-double-right"></i>
      </button>
    `;

    controlsEl.innerHTML = html;
  },

  goToPage(page) {
    this.currentPage = page;
    this.renderTable();
    const tableEl = document.querySelector('.data-table');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');

    if (!item.timeline) item.timeline = [];
    item.timeline.push({
      waktu: formattedTime,
      tahap: newTahap,
      status: newStatus === 'SELESAI' ? 'DONE' : (newStatus === 'PENDING_PEMOHON' ? 'HOLD' : 'ACTIVE'),
      petugas: Auth.getCurrentUser() ? Auth.getCurrentUser().nama : 'Petugas Dinas',
      catatan: newLogNote || ('Status diperbarui menjadi ' + newStatus + '. Keterangan: ' + newKeterangan)
    });

    const updatePayload = {
      status: item.status,
      slaStatus: item.slaStatus,
      tahapSaatIni: item.tahapSaatIni,
      posisiMeja: item.posisiMeja,
      keteranganKendala: item.keteranganKendala,
      catatanPimpinan: item.catatanPimpinan,
      noSuratKeputusan: item.noSuratKeputusan,
      tglSelesai: item.tglSelesai,
      timeline: item.timeline
    };

    saveStoredSubmissions(this.submissions);
    if (typeof DataAPI !== 'undefined') {
      DataAPI.updateSubmission(item.id, updatePayload);
    } else {
      storeEditedSubmission(item.id, updatePayload);
    }
    this.submissions = getStoredSubmissions();
    this.renderAll();

    document.getElementById('modal-update-status').classList.remove('active');
    alert(`Status permohonan ${item.noRegistrasi} (${item.layanan}) berhasil diperbarui dan tersimpan ke database! Halaman publik dan dashboard internal otomatis sinkron.`);
  },

  deleteSubmission(id) {
    if (!Auth.canDeleteSubmission()) {
      alert("Akses Terbatas: Hanya Koordinator Bidang dan Superadmin yang memiliki hak akses untuk menghapus data pengajuan.");
      return;
    }
    const item = this.submissions.find(s => s.id === id);
    if (!item) return;

    if (confirm(`Apakah Anda yakin ingin menghapus data permohonan ${item.noRegistrasi} (${item.namaPemohon})? Data akan dihapus secara permanen dari database.`)) {
      this.submissions = this.submissions.filter(s => s.id !== id);
      saveStoredSubmissions(this.submissions);
      if (typeof DataAPI !== 'undefined') {
        DataAPI.deleteSubmission(id);
      } else {
        storeDeletedSubmission(id);
      }
      this.submissions = getStoredSubmissions();
      this.renderAll();
      alert(`Pengajuan ${item.noRegistrasi} berhasil dihapus dari sistem.`);
    }
  },

  openNewSubmissionModal() {
    if (!Auth.canAddSubmission()) {
      alert("Akses Terbatas: Silakan masuk (login) sebagai Koordinator Bidang atau Superadmin untuk menambahkan pengajuan.");
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
    } else {
      storeAddedSubmission(newSub);
    }
    this.submissions = getStoredSubmissions();
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
        this.setStatusFilter(chip.dataset.status);
      });
    });

    // Select filter: Tahun Pengajuan
    const filterTahun = document.getElementById('filter-tahun');
    if (filterTahun) {
      filterTahun.addEventListener('change', (e) => {
        this.setYearFilter(e.target.value);
      });
    }

    // Quick Year Tabs delegation
    const yearTabs = document.getElementById('dash-year-tabs');
    if (yearTabs) {
      yearTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.year-filter-btn');
        if (btn) {
          this.setYearFilter(btn.dataset.year);
        }
      });
    }

    // Select filter: Bidang
    const filterBidang = document.getElementById('filter-bidang');
    const filterLayanan = document.getElementById('filter-layanan');
    if (filterBidang) {
      filterBidang.addEventListener('change', (e) => {
        this.currentPage = 1;
        const val = e.target.value;
        this.filters.bidang = val;
        if (val === 'CK' && (this.filters.layanan === 'KTTR' || this.filters.layanan === 'OSS')) {
          this.filters.layanan = 'ALL';
          if (filterLayanan) filterLayanan.value = 'ALL';
          document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.category === 'ALL'));
        } else if (val === 'TRP' && (this.filters.layanan === 'PBG' || this.filters.layanan === 'SLF')) {
          this.filters.layanan = 'ALL';
          if (filterLayanan) filterLayanan.value = 'ALL';
          document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.category === 'ALL'));
        }
        this.renderTable();
      });
    }

    // Select filter: Layanan
    if (filterLayanan) {
      filterLayanan.addEventListener('change', (e) => {
        this.currentPage = 1;
        const val = e.target.value;
        this.filters.layanan = val;
        if (val === 'PBG' || val === 'SLF') {
          this.filters.bidang = 'ALL';
          if (filterBidang) filterBidang.value = 'ALL';
        } else if (val === 'KTTR' || val === 'OSS') {
          this.filters.bidang = 'ALL';
          if (filterBidang) filterBidang.value = 'ALL';
        }
        document.querySelectorAll('.cat-filter-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.category === val);
        });
        this.renderTable();
      });
    }

    // Select filter: Bulan Pengajuan
    const filterBulan = document.getElementById('filter-bulan');
    if (filterBulan) {
      filterBulan.addEventListener('change', (e) => {
        this.setMonthFilter(e.target.value);
      });
    }

    // Select filter: Status Pengajuan
    const filterStatusSelect = document.getElementById('filter-status-select');
    if (filterStatusSelect) {
      filterStatusSelect.addEventListener('change', (e) => {
        this.setStatusFilter(e.target.value);
      });
    }

    // Select filter: Sort Pengajuan
    const sortOrder = document.getElementById('sort-order');
    if (sortOrder) {
      sortOrder.addEventListener('change', (e) => {
        this.setSortOrder(e.target.value);
      });
    }

    // Quick Month Tabs delegation
    const monthTabs = document.getElementById('dash-month-tabs');
    if (monthTabs) {
      monthTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.month-filter-btn');
        if (btn) {
          this.setMonthFilter(btn.dataset.month);
        }
      });
    }

    // Search input
    const searchInput = document.getElementById('monitoring-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentPage = 1;
        this.filters.search = e.target.value;
        this.renderTable();
      });
    }

    // Category filter button delegation
    const catTabs = document.getElementById('dash-category-tabs');
    if (catTabs) {
      catTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.cat-filter-btn');
        if (btn) {
          this.setCategoryFilter(btn.dataset.category);
        }
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

    // Sidebar Internal Subview Tab Switching
    document.querySelectorAll('[data-internal-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.dataset.internalTab;
        this.switchSubView(tab);
        const sidebar = document.getElementById('internal-sidebar');
        if (sidebar) sidebar.classList.remove('sidebar-open');
      });
    });

    // Sidebar Mobile Toggle
    const toggleBtn = document.getElementById('btn-toggle-sidebar');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('internal-sidebar');
        if (sidebar) sidebar.classList.toggle('sidebar-open');
      });
    }

    // Real-time Date Badge in Internal Topbar
    const dateEl = document.getElementById('internal-current-date');
    if (dateEl) {
      try {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = today.toLocaleDateString('id-ID', options);
      } catch (e) {
        dateEl.textContent = 'Tahun 2026';
      }
    }
  }
};
