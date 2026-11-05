/**
 * SILAN DINPUTARU DEMAK - Sistem Monitoring Layanan
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

    // 2. Update KPI Summary Cards di Halaman Publik
    const elTotal = document.getElementById('pub-kpi-total');
    const elSelesai = document.getElementById('pub-kpi-selesai');
    const elBelum = document.getElementById('pub-kpi-belum');
    const elPersen = document.getElementById('pub-kpi-persen');

    if (elTotal) elTotal.textContent = data.summary.total.toLocaleString('id-ID');
    if (elSelesai) elSelesai.textContent = data.summary.selesai.toLocaleString('id-ID');
    if (elBelum) elBelum.textContent = data.summary.belum.toLocaleString('id-ID');
    if (elPersen) elPersen.textContent = `${data.summary.persenSelesai}%`;

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
          desc: sysTexts.descKttr || "Keterangan kesesuaian ruang, zonasi RTRW/RDTR, Garis Sempadan Bangunan (GSB), KDB & KLB di Kabupaten Demak.",
          isGoogleForm: true,
          actionLabel: "Ajukan Permohonan KTTR",
          bitly: sysTexts.urlFormKttrBitly || "https://bit.ly/pendaftaranKTTRDemak"
        },
        {
          key: "OSS",
          icon: "fa-network-wired",
          colorClass: "card-oss",
          badgeColor: "#16a34a",
          badgeBg: "#dcfce7",
          sla: sysTexts.slaOss || "5 Hari Kerja",
          desc: sysTexts.descOss || "Validasi Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR) terintegrasi sistem perizinan berusaha OSS RBA & poligon SHP.",
          isGoogleForm: true,
          actionLabel: "Ajukan Validasi OSS",
          bitly: sysTexts.urlFormOssBitly || "https://bit.ly/validasioss"
        },
        {
          key: "PBG",
          icon: "fa-building",
          colorClass: "card-pbg",
          badgeColor: "#d97706",
          badgeBg: "#fef3c7",
          sla: sysTexts.slaPbg || "28 Hari Kerja",
          desc: sysTexts.descPbg || "Persetujuan Bangunan Gedung (pengganti IMB) untuk bangunan baru atau renovasi dengan standar arsitektur & struktur TPA.",
          isGoogleForm: false,
          isSimbg: true,
          actionLabel: "Buka Portal SIMBG (simbg.pu.go.id)",
          url: sysTexts.urlSimbgWebsite || "https://simbg.pu.go.id"
        },
        {
          key: "SLF",
          icon: "fa-award",
          colorClass: "card-slf",
          badgeColor: "#9333ea",
          badgeBg: "#f3e8ff",
          sla: sysTexts.slaSlf || "28 Hari Kerja",
          desc: sysTexts.descSlf || "Sertifikat Laik Fungsi pembuktian kelaikan gedung selesai terbangun dari aspek keselamatan kebakaran & kenyamanan.",
          isGoogleForm: false,
          isSimbg: true,
          actionLabel: "Buka Portal SIMBG (simbg.pu.go.id)",
          url: sysTexts.urlSimbgWebsite || "https://simbg.pu.go.id"
        }
      ];

      cardsContainer.innerHTML = serviceConfig.map(cfg => {
        const item = s[cfg.key];
        if (!item) return '';

        const persenSelesai = item.persenSelesai;
        const persenBelum = 100 - persenSelesai;

        // Tombol aksi sesuai jenis layanan
        let actionBtnHtml = '';
        if (cfg.isGoogleForm) {
          actionBtnHtml = `
            <div style="margin-top: 1.15rem; padding-top: 0.85rem; border-top: 1px dashed var(--slate-200); display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button type="button" class="btn btn-primary btn-sm btn-ajukan-layanan" data-layanan="${cfg.key}" style="flex: 1; justify-content: center;">
                <i class="fas fa-file-signature"></i> ${cfg.actionLabel}
              </button>
              <a href="${cfg.bitly}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" title="Buka Google Form di Tab Baru" style="padding: 0.4rem 0.65rem;">
                <i class="fas fa-external-link-alt"></i>
              </a>
            </div>
          `;
        } else if (cfg.isSimbg) {
          actionBtnHtml = `
            <div style="margin-top: 1.15rem; padding-top: 0.85rem; border-top: 1px dashed var(--slate-200);">
              <a href="${cfg.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none; font-weight: 700; color: #1e3a8a; border-color: #93c5fd; background: #eff6ff;">
                <i class="fas fa-landmark"></i> ${cfg.actionLabel}
              </a>
            </div>
          `;
        }

        return `
          <div class="infographic-service-card ${cfg.colorClass}">
            <div class="service-card-header">
              <div class="service-header-left">
                <div class="service-icon-box" style="background: ${cfg.badgeBg}; color: ${cfg.badgeColor};">
                  <i class="fas ${cfg.icon}"></i>
                </div>
                <div>
                  <h3 class="service-title">${item.nama}</h3>
                  <div class="service-subtitle">${item.bidang} &bull; <span class="sla-text"><i class="fas fa-clock"></i> SLA: ${cfg.sla}</span></div>
                </div>
              </div>
              <div class="service-badge-pill" style="color: ${cfg.badgeColor}; background: ${cfg.badgeBg};">
                ${item.kode}
              </div>
            </div>

            <p class="service-brief-desc">${cfg.desc}</p>

            <!-- Metrics Figures Row -->
            <div class="service-stat-row">
              <div class="stat-box stat-total">
                <span class="stat-label">Total Masuk</span>
                <span class="stat-number">${item.total.toLocaleString('id-ID')}</span>
                <span class="stat-sub">Pengajuan</span>
              </div>
              <div class="stat-box stat-selesai">
                <span class="stat-label">Sudah Dilayani</span>
                <span class="stat-number text-success">${item.selesai.toLocaleString('id-ID')}</span>
                <span class="stat-sub badge-sub-success">${persenSelesai}%</span>
              </div>
              <div class="stat-box stat-belum">
                <span class="stat-label">Belum Diproses</span>
                <span class="stat-number text-warning">${item.belum.toLocaleString('id-ID')}</span>
                <span class="stat-sub badge-sub-warning">${persenBelum}%</span>
              </div>
            </div>

            <!-- Visual Bar Comparison -->
            <div class="visual-progress-block">
              <div class="progress-labels">
                <span>Rasio Penyelesaian: <strong>${persenSelesai}%</strong></span>
                <span>${item.selesai} Terbit / ${item.belum} On Progress</span>
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill fill-selesai" style="width: ${persenSelesai}%;" title="Sudah Dilayani: ${item.selesai}"></div>
                <div class="progress-bar-fill fill-belum" style="width: ${persenBelum}%;" title="Belum Diproses / On Progress: ${item.belum}"></div>
              </div>
            </div>

            ${actionBtnHtml}
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
      const widthPct = Math.round((item.total / maxVal) * 100);
      const selesaiPct = item.total > 0 ? Math.round((item.selesai / item.total) * 100) : 0;
      const belumPct = 100 - selesaiPct;

      return `
        <div class="chart-comparison-row">
          <div class="chart-label-col">
            <strong>${key}</strong>
            <span style="font-size: 0.72rem; color: var(--slate-500);">${item.bidang.split(' ')[0]}</span>
          </div>

          <div class="chart-bar-col">
            <div class="stacked-bar-wrapper" style="width: ${Math.max(widthPct, 15)}%;">
              <div class="stacked-bar-fill bg-success" style="width: ${selesaiPct}%;" title="${key} Sudah Dilayani: ${item.selesai} (${selesaiPct}%)">
                ${selesaiPct >= 15 ? `<span class="bar-inner-text">${item.selesai}</span>` : ''}
              </div>
              <div class="stacked-bar-fill bg-warning" style="width: ${belumPct}%;" title="${key} Belum Diproses: ${item.belum} (${belumPct}%)">
                ${belumPct >= 15 ? `<span class="bar-inner-text">${item.belum}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="chart-total-col">
            <strong>${item.total.toLocaleString('id-ID')}</strong> <span style="font-size: 0.75rem; color: var(--slate-500);">Berkas</span>
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
