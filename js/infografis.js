/**
 * SIKEREN DINPUTARU DEMAK - Sistem Informasi Keterangan Pelayanan Perizinan
 * Public Infographics Module: Agregat Layanan Otentik Excel & Filter Bulanan Interaktif
 */

const Infografis = {
  currentMonth: "ALL",

  init() {
    this.renderMonthSelector();
    this.renderInfographics();
    this.setupListeners();
  },

  setMonth(monthKey) {
    this.currentMonth = String(monthKey);
    this.updateMonthSelectorActiveState();
    this.renderInfographics();
  },

  renderMonthSelector() {
    const container = document.getElementById('month-selector-container');
    if (!container) return;

    container.innerHTML = MONTHLY_STATS_2026.months.map(m => `
      <button type="button" class="month-pill-btn ${m.key === this.currentMonth ? 'active' : ''}" data-month-key="${m.key}">
        <span class="pill-full">${m.label}</span>
        <span class="pill-short">${m.shortLabel}</span>
      </button>
    `).join('');
  },

  updateMonthSelectorActiveState() {
    document.querySelectorAll('.month-pill-btn').forEach(btn => {
      if (btn.dataset.monthKey === this.currentMonth) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const selectEl = document.getElementById('mobile-month-select');
    if (selectEl) {
      selectEl.value = this.currentMonth;
    }
  },

  renderInfographics() {
    const data = getMonthlyInfographicData(this.currentMonth);
    const sysTexts = getStoredSystemTexts();

    // 1. Update Header Badge Periode
    const periodeBadge = document.getElementById('infografis-periode-title');
    if (periodeBadge) {
      periodeBadge.innerHTML = `<i class="fas fa-calendar-alt"></i> Periode Terpilih: <strong>${data.monthLabel}</strong>`;
    }

    // 2. Update KPI Summary Cards di Halaman Publik (5 Metrik Informasi)
    const elTotal = document.getElementById('pub-kpi-total');
    const elSelesai = document.getElementById('pub-kpi-selesai');
    const elOnProgress = document.getElementById('pub-kpi-onprogress');
    const elBelum = document.getElementById('pub-kpi-belum');
    const elDikembalikan = document.getElementById('pub-kpi-dikembalikan');
    const elPersen = document.getElementById('pub-kpi-persen');

    if (elTotal) elTotal.textContent = data.summary.total.toLocaleString('id-ID');
    if (elSelesai) elSelesai.textContent = data.summary.sudahDilayani.toLocaleString('id-ID');
    if (elOnProgress) elOnProgress.textContent = data.summary.onProgress.toLocaleString('id-ID');
    if (elBelum) elBelum.textContent = data.summary.onProgress.toLocaleString('id-ID');
    if (elDikembalikan) elDikembalikan.textContent = data.summary.berkasDikembalikan.toLocaleString('id-ID');
    if (elPersen) elPersen.textContent = `${data.summary.tingkatPenyelesaian}%`;

    // 3. Render 4 Kartu Layanan Strategis (KTTR, OSS, PBG, SLF)
    const cardsContainer = document.getElementById('pub-services-cards-grid');
    if (cardsContainer) {
      const s = data.services;
      const serviceConfig = [
        {
          key: "KTTR",
          icon: "fa-map-marked-alt",
          colorClass: "card-kttr",
          badgeColor: "#0284c7",
          badgeBg: "#e0f2fe",
          sla: sysTexts.slaKttr || "5 Hari Kerja",
          directUrl: "https://bit.ly/pendaftaranKTTRDemak",
          btnColor: "#0284c7",
          actionBtnText: "Daftar KTTR",
          titleText: "Keterangan Rencana Tata Ruang (KTTR)"
        },
        {
          key: "OSS",
          icon: "fa-network-wired",
          colorClass: "card-oss",
          badgeColor: "#16a34a",
          badgeBg: "#dcfce7",
          sla: sysTexts.slaOss || "5 Hari Kerja",
          directUrl: "https://bit.ly/validasioss",
          btnColor: "#16a34a",
          actionBtnText: "Validasi OSS",
          titleText: "Validasi Kesesuaian Tata Ruang (OSS)"
        },
        {
          key: "PBG",
          icon: "fa-building",
          colorClass: "card-pbg",
          badgeColor: "#d97706",
          badgeBg: "#fef3c7",
          sla: sysTexts.slaPbg || "28 Hari Kerja",
          directUrl: "https://simbg.pu.go.id",
          btnColor: "#d97706",
          actionBtnText: "Daftar PBG",
          titleText: "Persetujuan Bangunan Gedung (PBG)"
        },
        {
          key: "SLF",
          icon: "fa-award",
          colorClass: "card-slf",
          badgeColor: "#9333ea",
          badgeBg: "#f3e8ff",
          sla: sysTexts.slaSlf || "28 Hari Kerja",
          directUrl: "https://simbg.pu.go.id",
          btnColor: "#9333ea",
          actionBtnText: "Daftar SLF",
          titleText: "Sertifikat Laik Fungsi (SLF)"
        }
      ];

      cardsContainer.innerHTML = serviceConfig.map(cfg => {
        const item = s[cfg.key];
        if (!item) return '';

        const total = item.total || 0;
        const sudahDilayani = item.sudahDilayani || 0;
        const onProgress = item.onProgress || 0;
        const berkasDikembalikan = item.berkasDikembalikan || 0;
        const persenSelesai = item.tingkatPenyelesaian || 0;

        const pDilayani = total > 0 ? (sudahDilayani / total) * 100 : 0;
        const pKembali = total > 0 ? (berkasDikembalikan / total) * 100 : 0;
        const pProgress = total > 0 ? (onProgress / total) * 100 : 0;

        return `
          <div class="infographic-service-card ${cfg.colorClass}">
            <!-- Top Row: Big Title on Left & Action Button on Right (Di Samping Judul) -->
            <div class="service-card-top-header">
              <div class="service-title-container">
                <div class="service-badge-pill-row">
                  <span class="service-badge-pill" style="color: ${cfg.badgeColor}; background: ${cfg.badgeBg}; border: 1.5px solid ${cfg.badgeColor}40;">
                    <i class="fas ${cfg.icon}"></i> ${item.kode}
                  </span>
                  <span class="service-sla-tag">
                    <i class="fas fa-clock"></i> SLA: <strong>${cfg.sla}</strong>
                  </span>
                  <span class="service-bidang-tag">
                    ${item.bidang}
                  </span>
                </div>
                <h3 class="service-title-prominent">${cfg.titleText || item.nama}</h3>
              </div>

              <!-- Action Link Button (Kotak Link Bersebelahan dengan Judul) -->
              <div class="service-action-container">
                <a href="${cfg.directUrl}" target="_blank" rel="noopener noreferrer" class="btn-service-direct" style="background: ${cfg.btnColor}; border-color: ${cfg.btnColor};" title="Buka ${cfg.actionBtnText}">
                  <span>${cfg.actionBtnText}</span>
                  <i class="fas fa-external-link-alt"></i>
                </a>
              </div>
            </div>

            <!-- Status & Metrics Row (5 Indikator Lengkap di Bawah Judul & Tombol Link) -->
            <div class="service-stat-row service-stat-5-grid">
              <div class="stat-box stat-total">
                <span class="stat-label">Total Masuk</span>
                <span class="stat-number">${total.toLocaleString('id-ID')}</span>
                <span class="stat-sub">Pengajuan</span>
              </div>
              <div class="stat-box stat-selesai">
                <span class="stat-label">Sudah Dilayani</span>
                <span class="stat-number text-success">${sudahDilayani.toLocaleString('id-ID')}</span>
                <span class="stat-sub badge-sub-success">Terbit</span>
              </div>
              <div class="stat-box stat-belum">
                <span class="stat-label">On Progress</span>
                <span class="stat-number text-warning">${onProgress.toLocaleString('id-ID')}</span>
                <span class="stat-sub badge-sub-warning">Diproses</span>
              </div>
              <div class="stat-box" style="background: #eef2ff;">
                <span class="stat-label" style="color: #4338ca;">Dikembalikan</span>
                <span class="stat-number" style="color: #4f46e5;">${berkasDikembalikan.toLocaleString('id-ID')}</span>
                <span class="stat-sub" style="background: #e0e7ff; color: #3730a3;">Revisi</span>
              </div>
              <div class="stat-box" style="background: #faf5ff;">
                <span class="stat-label" style="color: #7e22ce;">Penyelesaian</span>
                <span class="stat-number" style="color: #9333ea;">${persenSelesai}%</span>
                <span class="stat-sub" style="background: #f3e8ff; color: #6b21a8;">Tingkat</span>
              </div>
            </div>

            <!-- Visual Bar Comparison -->
            <div class="visual-progress-block">
              <div class="progress-labels">
                <span>Tingkat Penyelesaian: <strong>${persenSelesai}%</strong></span>
                <span>${sudahDilayani + berkasDikembalikan} Selesai / ${onProgress} On Progress</span>
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill fill-selesai" style="width: ${pDilayani}%;" title="Sudah Dilayani / Terbit: ${sudahDilayani}"></div>
                <div class="progress-bar-fill" style="width: ${pKembali}%; background: #6366f1;" title="Berkas Dikembalikan (Dianggap Selesai): ${berkasDikembalikan}"></div>
                <div class="progress-bar-fill fill-belum" style="width: ${pProgress}%;" title="On Progress: ${onProgress}"></div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 4. Render Visual Chart Komparasi Antar Layanan
    this.renderComparativeChart(data);
  },

  renderComparativeChart(data) {
    const chartContainer = document.getElementById('pub-comparative-bars');
    if (!chartContainer) return;

    const s = data.services;
    const maxVal = Math.max(...Object.values(s).map(v => v.total), 1);

    chartContainer.innerHTML = Object.keys(s).map(key => {
      const item = s[key];
      const total = item.total || 0;
      const dilayani = item.sudahDilayani || 0;
      const kembali = item.berkasDikembalikan || 0;
      const progress = item.onProgress || 0;

      const widthPct = Math.round((total / maxVal) * 100);
      const dilayaniPct = total > 0 ? (dilayani / total) * 100 : 0;
      const kembaliPct = total > 0 ? (kembali / total) * 100 : 0;
      const progressPct = total > 0 ? (progress / total) * 100 : 0;

      return `
        <div class="chart-comparison-row">
          <div class="chart-label-col">
            <strong>${key}</strong>
            <span style="font-size: 0.72rem; color: var(--slate-500);">${item.bidang.split(' ')[0]}</span>
          </div>

          <div class="chart-bar-col">
            <div class="stacked-bar-wrapper" style="width: ${Math.max(widthPct, 15)}%;">
              <div class="stacked-bar-fill bg-success" style="width: ${dilayaniPct}%;" title="${key} Sudah Dilayani: ${dilayani} (${Math.round(dilayaniPct)}%)">
                ${dilayaniPct >= 12 ? `<span class="bar-inner-text">${dilayani}</span>` : ''}
              </div>
              <div class="stacked-bar-fill" style="width: ${kembaliPct}%; background: #6366f1;" title="${key} Berkas Dikembalikan: ${kembali} (${Math.round(kembaliPct)}%)">
                ${kembaliPct >= 10 ? `<span class="bar-inner-text">${kembali}</span>` : ''}
              </div>
              <div class="stacked-bar-fill bg-warning" style="width: ${progressPct}%;" title="${key} On Progress: ${progress} (${Math.round(progressPct)}%)">
                ${progressPct >= 12 ? `<span class="bar-inner-text">${progress}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="chart-total-col">
            <strong>${total.toLocaleString('id-ID')}</strong> <span style="font-size: 0.75rem; color: var(--slate-500);">Berkas</span>
          </div>
        </div>
      `;
    }).join('');
  },

  setupListeners() {
    // Delegation for Month Pill clicks
    const container = document.getElementById('month-selector-container');
    if (container) {
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('.month-pill-btn');
        if (btn) {
          const mKey = btn.dataset.monthKey;
          this.setMonth(mKey);
        }
      });
    }

    // Mobile select dropdown listener
    const mobileSelect = document.getElementById('mobile-month-select');
    if (mobileSelect) {
      mobileSelect.addEventListener('change', (e) => {
        this.setMonth(e.target.value);
      });
    }

    // Ajukan Layanan Button Delegation (KTTR / OSS)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-ajukan-layanan');
      if (btn) {
        const layanan = btn.dataset.layanan;
        if (typeof App !== 'undefined') {
          App.handleAjukanLayanan(layanan);
        }
      }
    });
  }
};
