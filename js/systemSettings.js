/**
 * SIKEREN DINPUTARU DEMAK - Sistem Informasi Keterangan Pelayanan Perizinan
 * System Settings & Dynamic Text Management (Superadmin)
 */

const SystemSettings = {
  currentTexts: {},

  init() {
    this.currentTexts = getStoredSystemTexts();
    this.applyTextsToDOM();
    this.populateForm();
    this.setupListeners();
  },

  refresh() {
    this.currentTexts = getStoredSystemTexts();
    this.applyTextsToDOM();
    this.populateForm();
  },

  applyTextsToDOM() {
    const t = this.currentTexts;
    if (!t) return;

    // 1. Branding & Header
    const brandTitles = document.querySelectorAll('.dynamic-app-title');
    brandTitles.forEach(el => el.innerHTML = t.appTitle || 'SIKEREN <span class="highlight">DINPUTARU</span>');

    const brandSubs = document.querySelectorAll('.dynamic-app-subtitle');
    brandSubs.forEach(el => el.textContent = t.appSubtitle || 'Sistem Informasi Keterangan Pelayanan Perizinan - Kab. Demak');

    // 2. Public Infografis / Landing Page Texts
    const heroBadge = document.getElementById('dyn-hero-badge');
    if (heroBadge) heroBadge.innerHTML = `<i class="fas fa-shield-alt"></i> ${t.heroBadge}`;

    const heroTitle = document.getElementById('dyn-hero-title');
    if (heroTitle) heroTitle.innerHTML = t.heroTitle || 'Rangkuman Layanan <span class="text-gold">SIKEREN 2026</span>';

    const heroSubtitle = document.getElementById('dyn-hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = t.heroSubtitle || '';

    const sectionTitle = document.getElementById('dyn-section-title');
    if (sectionTitle) sectionTitle.textContent = t.sectionTitle || 'Infografis & Status 4 Layanan Utama DINPUTARU';

    const sectionDesc = document.getElementById('dyn-section-desc');
    if (sectionDesc) sectionDesc.textContent = t.sectionDesc || '';

    const compTitle = document.getElementById('dyn-comp-title');
    if (compTitle) compTitle.innerHTML = `<i class="fas fa-chart-bar" style="color: var(--primary-600);"></i> ${t.comparisonTitle}`;

    const compSubtitle = document.getElementById('dyn-comp-subtitle');
    if (compSubtitle) compSubtitle.textContent = t.comparisonSubtitle || '';

    // 3. Footer Texts
    const footInstansi = document.getElementById('dyn-footer-instansi');
    if (footInstansi) footInstansi.textContent = t.footerInstansi || 'DINPUTARU KABUPATEN DEMAK';

    const footDesc = document.getElementById('dyn-footer-desc');
    if (footDesc) footDesc.textContent = t.footerDesc || '';

    const footAlamat = document.getElementById('dyn-footer-alamat');
    if (footAlamat) footAlamat.innerHTML = `${t.footerAlamat || 'Jl. Kyai Jebat No. 35, Demak 59511'}<br/>Telp: ${t.footerTelp || '(0291) 685112'}<br/>Email: ${t.footerEmail || 'dinputaru@demakkab.go.id'}<br/>Website: ${t.footerWebsite || 'dinputaru.demakkab.go.id'}`;

    const footCopy = document.getElementById('dyn-footer-copy');
    if (footCopy) footCopy.textContent = t.footerCopyright || '© 2026 Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Demak. Hak Cipta Dilindungi.';

    // 4. Dashboard Internal Texts
    const dashTitle = document.getElementById('dyn-dash-title');
    if (dashTitle) dashTitle.textContent = t.dashboardTitle || 'Dashboard Pemantauan Pelayanan';

    const focusTitle = document.getElementById('dyn-focus-title');
    if (focusTitle) focusTitle.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${t.leadershipFocusTitle}`;

    const focusDesc = document.getElementById('dyn-focus-desc');
    if (focusDesc) focusDesc.textContent = t.leadershipFocusDesc || '';
  },

  populateForm() {
    const t = this.currentTexts;
    if (!t) return;

    const fields = [
      'appTitle', 'appSubtitle', 'heroBadge', 'heroTitle', 'heroSubtitle',
      'sectionTitle', 'sectionDesc', 'comparisonTitle', 'comparisonSubtitle',
      'slaKttr', 'slaOss', 'slaPbg', 'slaSlf',
      'descKttr', 'descOss', 'descPbg', 'descSlf',
      'footerInstansi', 'footerDesc', 'footerAlamat', 'footerTelp', 'footerEmail', 'footerWebsite',
      'dashboardTitle', 'leadershipFocusTitle', 'leadershipFocusDesc'
    ];

    fields.forEach(f => {
      const el = document.getElementById(`setting-${f}`);
      if (el) {
        el.value = t[f] || '';
      }
    });
  },

  setupListeners() {
    const form = document.getElementById('form-system-settings');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveFromForm();
      });
    }

    const btnReset = document.getElementById('btn-reset-system-settings');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mengembalikan semua teks dan pengaturan sistem ke setelan bawaan (default)?')) {
          this.resetToDefaults();
        }
      });
    }
  },

  saveFromForm() {
    const fields = [
      'appTitle', 'appSubtitle', 'heroBadge', 'heroTitle', 'heroSubtitle',
      'sectionTitle', 'sectionDesc', 'comparisonTitle', 'comparisonSubtitle',
      'slaKttr', 'slaOss', 'slaPbg', 'slaSlf',
      'descKttr', 'descOss', 'descPbg', 'descSlf',
      'footerInstansi', 'footerDesc', 'footerAlamat', 'footerTelp', 'footerEmail', 'footerWebsite',
      'dashboardTitle', 'leadershipFocusTitle', 'leadershipFocusDesc'
    ];

    const updated = { ...this.currentTexts };
    fields.forEach(f => {
      const el = document.getElementById(`setting-${f}`);
      if (el) {
        updated[f] = el.value.trim();
      }
    });

    this.currentTexts = updated;
    saveStoredSystemTexts(updated);
    if (typeof DataAPI !== 'undefined') {
      DataAPI.saveSettings(updated);
    }
    this.applyTextsToDOM();

    if (typeof Infografis !== 'undefined') {
      Infografis.renderInfographics();
    }

    alert('Pengaturan teks dan konfigurasi sistem berhasil disimpan! Seluruh halaman telah diperbarui.');
  },

  resetToDefaults() {
    this.currentTexts = { ...DEFAULT_SYSTEM_TEXTS };
    saveStoredSystemTexts(this.currentTexts);
    this.populateForm();
    this.applyTextsToDOM();

    if (typeof Infografis !== 'undefined') {
      Infografis.renderInfographics();
    }

    alert('Pengaturan teks telah dikembalikan ke setelan bawaan.');
  }
};

