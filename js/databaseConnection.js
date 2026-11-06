/**
 * SIKEREN DINPUTARU DEMAK - Database Diagnostic & Connection Test
 * Handles MySQL / phpMyAdmin Connection Testing for sikeren.satuputarudemak.id
 */

const DatabaseHelper = {
  isChecking: false,

  openModal() {
    const modal = document.getElementById('modal-db-connection');
    if (!modal) return;
    modal.classList.add('active');
    this.testConnection();
  },

  closeModal() {
    const modal = document.getElementById('modal-db-connection');
    if (modal) modal.classList.remove('active');
  },

  async testConnection() {
    const container = document.getElementById('modal-db-connection-body');
    if (!container) return;

    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem;">
        <div class="spinner" style="width: 48px; height: 48px; border-width: 4px; margin: 0 auto 1.25rem auto;"></div>
        <div style="font-weight: 700; font-size: 1.1rem; color: var(--slate-800);">Menguji Koneksi Database Server...</div>
        <div style="font-size: 0.85rem; color: var(--slate-500); margin-top: 0.35rem;">
          Menghubungkan ke <strong>u490770675_sikeren</strong> di <strong>sikeren.satuputarudemak.id</strong>
        </div>
      </div>
    `;

    this.isChecking = true;
    const res = await DataAPI.checkDatabaseConnection();
    this.isChecking = false;

    this.renderResult(res);
  },

  renderResult(res) {
    const container = document.getElementById('modal-db-connection-body');
    if (!container) return;

    const isOk = res && res.success;
    const counts = res.counts || {};
    const subCount = counts.submissions ? Number(counts.submissions).toLocaleString('id-ID') : '0';
    const userCount = counts.users ? Number(counts.users).toLocaleString('id-ID') : '0';
    const settingCount = counts.system_texts ? Number(counts.system_texts).toLocaleString('id-ID') : '0';

    container.innerHTML = `
      <div style="margin-bottom: 1.25rem;">
        <!-- Status Alert Banner -->
        <div style="background: ${isOk ? '#ecfdf5' : '#fef2f2'}; border: 1px solid ${isOk ? '#a7f3d0' : '#fecaca'}; border-radius: 10px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 0.85rem;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: ${isOk ? '#10b981' : '#ef4444'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
            <i class="fas ${isOk ? 'fa-check' : 'fa-times'}"></i>
          </div>
          <div>
            <div style="font-weight: 800; color: ${isOk ? '#065f46' : '#991b1b'}; font-size: 0.95rem;">
              ${isOk ? 'KONEKSI DATABASE BERHASIL (TERHUBUNG)' : 'GAGAL TERHUBUNG KE DATABASE'}
            </div>
            <div style="font-size: 0.82rem; color: ${isOk ? '#047857' : '#b91c1c'}; margin-top: 0.15rem;">
              ${res.message || 'Koneksi ke server database aktif.'}
            </div>
          </div>
        </div>

        <!-- Connection Parameters Grid -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.15rem; margin-top: 1rem; font-size: 0.82rem;">
          <div style="font-weight: 700; color: #1e293b; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.4rem; display: flex; justify-content: space-between; align-items: center;">
            <span><i class="fas fa-server" style="color: #0284c7;"></i> Parameter Database Server</span>
            <span class="badge" style="background: #e0f2fe; color: #0369a1; font-size: 0.7rem;">${res.driver || 'MySQL'}</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.65rem;">
            <div>
              <span style="color: #64748b;">Nama Database:</span><br>
              <strong style="font-family: monospace; color: #0f172a; font-size: 0.88rem;">${res.database || 'u490770675_sikeren'}</strong>
            </div>
            <div>
              <span style="color: #64748b;">Username Database:</span><br>
              <strong style="font-family: monospace; color: #0f172a; font-size: 0.88rem;">${res.user || 'u490770675_adminsikeren'}</strong>
            </div>
            <div>
              <span style="color: #64748b;">Host Database:</span><br>
              <strong>${res.host || 'localhost'}</strong>
            </div>
            <div>
              <span style="color: #64748b;">Target Domain Web:</span><br>
              <strong style="color: #2563eb;">${res.web_domain || 'sikeren.satuputarudemak.id'}</strong>
            </div>
            <div>
              <span style="color: #64748b;">Latensi / Ping:</span><br>
              <strong style="color: ${res.latency_ms < 50 ? '#059669' : '#d97706'};">${res.latency_ms || 1} ms</strong>
            </div>
            <div>
              <span style="color: #64748b;">Waktu Server:</span><br>
              <strong>${res.server_time || '-'}</strong>
            </div>
          </div>
        </div>

        <!-- Verified Tables & Rows Count -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem; margin-top: 1rem;">
          <div style="font-weight: 700; color: #1e293b; font-size: 0.85rem; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
            <i class="fas fa-table" style="color: #10b981;"></i> Status Tabel & Verifikasi Data (phpMyAdmin)
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; text-align: center;">
            <div style="background: #f1f5f9; padding: 0.65rem 0.5rem; border-radius: 8px;">
              <div style="font-size: 0.72rem; color: #64748b; font-weight: 600;">Tabel submissions</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-top: 0.2rem;">${subCount}</div>
              <div style="font-size: 0.68rem; color: #059669; font-weight: 600;">Rekap Berkas</div>
            </div>
            <div style="background: #f1f5f9; padding: 0.65rem 0.5rem; border-radius: 8px;">
              <div style="font-size: 0.72rem; color: #64748b; font-weight: 600;">Tabel users</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-top: 0.2rem;">${userCount}</div>
              <div style="font-size: 0.68rem; color: #059669; font-weight: 600;">Akun Aparatur</div>
            </div>
            <div style="background: #f1f5f9; padding: 0.65rem 0.5rem; border-radius: 8px;">
              <div style="font-size: 0.72rem; color: #64748b; font-weight: 600;">Tabel system_texts</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-top: 0.2rem;">${settingCount}</div>
              <div style="font-size: 0.68rem; color: #059669; font-weight: 600;">Pengaturan Teks</div>
            </div>
          </div>
        </div>

        <!-- Independence & Persistence Notice -->
        <div style="margin-top: 1rem; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 0.85rem 1rem; font-size: 0.78rem; color: #92400e; display: flex; align-items: flex-start; gap: 0.6rem;">
          <i class="fas fa-info-circle" style="color: #d97706; margin-top: 0.15rem; font-size: 0.95rem;"></i>
          <div style="line-height: 1.45;">
            <strong>Jaminan Keamanan & Persistensi Data:</strong><br>
            Seluruh data permohonan, status berkas, dan pengguna yang diubah melalui web tersimpan langsung secara mandiri di database MySQL Hostinger. 
            <strong>Pembaruan aplikasi melalui GitHub / Antigravity tidak akan mereset atau menghapus isi database ini.</strong>
          </div>
        </div>

        <!-- Download SQL Button -->
        <div style="margin-top: 1rem; text-align: center;">
          <a href="database/sikeren_u490770675.sql" download="sikeren_u490770675.sql" class="btn btn-outline btn-sm" style="width: 100%; border-color: #0284c7; color: #0284c7; padding: 0.6rem;">
            <i class="fas fa-download"></i> Unduh File SQL (sikeren_u490770675.sql) untuk Impor di phpMyAdmin
          </a>
        </div>
      </div>
    `;
  }
};

