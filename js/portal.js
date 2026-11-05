/**
 * SIKEREN DINPUTARU DEMAK - Sistem Informasi Keterangan Pelayanan Perizinan
 * Portal Pemohon / Pengunjung (Pengajuan KTTR & OSS via Google Form Embed & Akses SIMBG)
 */

const Portal = {
  currentService: null,

  init() {
    this.updateVisitorProfile();
    this.setupListeners();
  },

  updateVisitorProfile() {
    const user = Auth.getCurrentUser();
    const nameEl = document.getElementById('portal-user-name');
    const emailEl = document.getElementById('portal-user-email');
    const hpEl = document.getElementById('portal-user-hp');
    const badgeEl = document.getElementById('portal-user-badge');

    if (user) {
      if (nameEl) nameEl.textContent = user.nama;
      if (emailEl) emailEl.textContent = user.email || '-';
      if (hpEl) hpEl.textContent = user.noHp || '-';
      if (badgeEl) badgeEl.textContent = user.isVisitor ? 'Akun Pemohon Terverifikasi' : `${user.roleLabel} (${user.bidang || 'Internal'})`;
    }
  },

  openService(serviceKey) {
    this.currentService = serviceKey;
    const sysTexts = getStoredSystemTexts();
    const embedWrapper = document.getElementById('portal-embed-section');
    const iframeEl = document.getElementById('portal-form-iframe');
    const titleEl = document.getElementById('portal-form-title');
    const badgeEl = document.getElementById('portal-form-badge');
    const extLinkEl = document.getElementById('portal-form-external-link');

    if (!embedWrapper || !iframeEl) return;

    if (serviceKey === 'KTTR') {
      const embedUrl = sysTexts.urlFormKttrEmbed || "https://docs.google.com/forms/d/e/1FAIpQLSd0ds7oMQ1Ewc8UAT8umf-vq2_N_ZIIsMrD4oR2JG2Ii0Y6Wg/viewform?embedded=true";
      const bitlyUrl = sysTexts.urlFormKttrBitly || "https://bit.ly/pendaftaranKTTRDemak";

      iframeEl.src = embedUrl;
      if (titleEl) titleEl.textContent = "Formulir Pendaftaran KTTR (Keterangan Rencana Tata Ruang)";
      if (badgeEl) badgeEl.textContent = "SLA: " + (sysTexts.slaKttr || "5 Hari Kerja");
      if (extLinkEl) extLinkEl.href = bitlyUrl;

      embedWrapper.style.display = 'block';
      embedWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (serviceKey === 'OSS') {
      const embedUrl = sysTexts.urlFormOssEmbed || "https://docs.google.com/forms/d/e/1FAIpQLScmucXq7JfyGEsvOYnHKaY2zVLcz1dEjUSQqdhbIFhBtLkTzQ/viewform?embedded=true";
      const bitlyUrl = sysTexts.urlFormOssBitly || "https://bit.ly/validasioss";

      iframeEl.src = embedUrl;
      if (titleEl) titleEl.textContent = "Formulir Validasi Kesesuaian Tata Ruang (OSS-RBA)";
      if (badgeEl) badgeEl.textContent = "SLA: " + (sysTexts.slaOss || "5 Hari Kerja");
      if (extLinkEl) extLinkEl.href = bitlyUrl;

      embedWrapper.style.display = 'block';
      embedWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (serviceKey === 'PBG' || serviceKey === 'SLF') {
      const simbgUrl = sysTexts.urlSimbgWebsite || "https://simbg.pu.go.id";
      window.open(simbgUrl, '_blank', 'noopener,noreferrer');
    }
  },

  closeEmbed() {
    const embedWrapper = document.getElementById('portal-embed-section');
    const iframeEl = document.getElementById('portal-form-iframe');
    if (embedWrapper) {
      embedWrapper.style.display = 'none';
    }
    if (iframeEl) {
      iframeEl.src = 'about:blank';
    }
    this.currentService = null;
  },

  setupListeners() {
    // Buttons inside service cards in portal
    document.querySelectorAll('.portal-service-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const sKey = btn.dataset.service;
        this.openService(sKey);
      });
    });

    // Close embed button
    const btnClose = document.getElementById('btn-close-portal-embed');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        this.closeEmbed();
      });
    }
  }
};

