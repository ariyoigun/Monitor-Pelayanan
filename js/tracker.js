/**
 * SIMOPEL DINPUTARU DEMAK - Public Tracker & Executive Print Report Generator
 */

const Tracker = {
  trackPublicSubmission(query) {
    if (!query || query.trim() === '') {
      alert('Silakan masukkan Nomor Registrasi (contoh: REG/TRP/2026/001) atau Nama Pemohon');
      return;
    }

    const submissions = getStoredSubmissions();
    const q = query.trim().toLowerCase();
    
    const found = submissions.find(s => 
      s.noRegistrasi.toLowerCase() === q ||
      s.noRegistrasi.toLowerCase().includes(q) ||
      s.namaPemohon.toLowerCase().includes(q) ||
      s.nikNib.toLowerCase().includes(q)
    );

    if (!found) {
      alert(`Berkas dengan nomor atau kata kunci "${query}" tidak ditemukan. Pastikan nomor registrasi sesuai dengan tanda terima permohonan Anda.`);
      return;
    }

    // Open detail modal directly
    Monitoring.openDetailModal(found.id);
  },

  /* Print Official Lembar Kendali / Disposisi Berkas */
  printDisposition(id) {
    const submissions = getStoredSubmissions();
    const item = submissions.find(s => s.id === id);
    if (!item) return;

    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lembar Kendali Pelayanan - ${item.noRegistrasi}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 30px; font-size: 12pt; color: #000; line-height: 1.3; }
          .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 20px; }
          .kop h3 { margin: 0; font-size: 13pt; font-weight: normal; }
          .kop h2 { margin: 2px 0; font-size: 15pt; }
          .kop h1 { margin: 2px 0; font-size: 16pt; font-weight: 900; }
          .kop p { margin: 0; font-size: 9pt; }
          .title { text-align: center; font-weight: bold; font-size: 13pt; margin-bottom: 15px; text-decoration: underline; }
          table.data { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          table.data td { padding: 4px 6px; vertical-align: top; }
          .bordered { border: 1px solid #000; }
          .bordered th, .bordered td { border: 1px solid #000; padding: 6px; text-align: left; font-size: 11pt; }
          .badge-box { border: 2px solid #000; padding: 8px; margin-bottom: 15px; background: #fafafa; font-weight: bold; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; margin-top: 30px; }
          .sign-box { text-align: center; }
          @media print {
            body { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="kop">
          <h3>PEMERINTAH KABUPATEN DEMAK</h3>
          <h2>DINAS PEKERJAAN UMUM DAN PENATAAN RUANG</h2>
          <p>Jl. Kyai Singkil No. 7 Demak 59511 | Telp. (0291) 685112 | Email: dinputaru@demakkab.go.id | Website: dinputaru.demakkab.go.id</p>
        </div>

        <div class="title">LEMBAR MONITORING & KENDALI PROSES PELAYANAN</div>

        <table class="data">
          <tr><td style="width: 25%;"><strong>Nomor Registrasi</strong></td><td>: <strong>${item.noRegistrasi}</strong></td><td style="width: 20%;"><strong>Tanggal Masuk</strong></td><td>: ${item.tglPengajuan}</td></tr>
          <tr><td><strong>Layanan / Bidang</strong></td><td>: ${item.layanan} (${item.bidang === 'TRP' ? 'Tata Ruang & Pertanahan' : 'Cipta Karya'})</td><td><strong>Batas SLA</strong></td><td>: ${item.estimasiSelesai}</td></tr>
          <tr><td><strong>Nama Pemohon</strong></td><td>: <strong>${item.namaPemohon}</strong></td><td><strong>Kontak Pemohon</strong></td><td>: ${item.noHp}</td></tr>
          <tr><td><strong>Nama Rencana Usaha</strong></td><td>: ${item.namaKegiatan}</td><td><strong>Status Berkas</strong></td><td>: <strong>${item.status}</strong></td></tr>
          <tr><td><strong>Lokasi Proyek</strong></td><td colspan="3">: ${item.lokasiProyek}, Kec. ${item.kecamatan}, Kab. Demak</td></tr>
          <tr><td><strong>Luas Lahan / Bangunan</strong></td><td colspan="3">: ${item.luasLahan} / ${item.luasBangunan}</td></tr>
        </table>

        <div class="badge-box">
          POSISI BERKAS SAAT INI: ${item.posisiMeja}<br/>
          TAHAPAN TERAKHIR: ${item.tahapSaatIni}<br/>
          KETERANGAN / KENDALA: ${item.keteranganKendala}
        </div>

        <div style="font-weight: bold; margin-bottom: 5px;">CATATAN RIWAYAT DISPOSISI & VERIFIKASI:</div>
        <table class="data bordered">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="width: 15%;">Waktu</th>
              <th style="width: 30%;">Tahapan Proses</th>
              <th style="width: 20%;">Petugas / Verifikator</th>
              <th style="width: 35%;">Catatan Hasil Verifikasi</th>
            </tr>
          </thead>
          <tbody>
            ${item.timeline.map(t => `
              <tr>
                <td>${t.waktu}</td>
                <td><strong>${t.tahap}</strong></td>
                <td>${t.petugas}</td>
                <td>${t.catatan}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sign-box">
            Mengetahui,<br/>
            Kepala Bidang ${item.bidang === 'TRP' ? 'Tata Ruang & Pertanahan' : 'Cipta Karya'}<br/><br/><br/><br/>
            <strong><u>${item.bidang === 'TRP' ? 'Drs. Hendro Wibowo, M.Si.' : 'Ir. Sulistiyono, M.T.'}</u></strong><br/>
            NIP. ${item.bidang === 'TRP' ? '19780120 200312 1 005' : '19770805 200212 1 008'}
          </div>
          <div class="sign-box">
            Demak, ${today}<br/>
            Petugas Verifikator / Koordinator,<br/><br/><br/><br/>
            <strong><u>${item.penanggungJawab}</u></strong>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  },

  /* Print Executive Summary for Kepala Dinas & Rapat Koordinasi */
  printExecutiveReport() {
    const submissions = getStoredSubmissions();
    const unfinished = submissions.filter(s => s.status !== 'SELESAI' && s.status !== 'DITOLAK');
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Eksekutif Monitoring Pelayanan DINPUTARU Demak</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 25px; font-size: 11pt; color: #000; line-height: 1.25; }
          .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 6px; margin-bottom: 15px; }
          .kop h2 { margin: 0; font-size: 14pt; }
          .kop h1 { margin: 2px 0; font-size: 15pt; font-weight: 900; }
          .kop p { margin: 0; font-size: 9pt; }
          .title { text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #000; padding: 5px 6px; font-size: 9.5pt; text-align: left; vertical-align: top; }
          th { background: #eee; font-weight: bold; }
          .overdue-row { background: #fff2f2; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; margin-top: 25px; }
          .sign-box { text-align: center; font-size: 11pt; }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>PEMERINTAH KABUPATEN DEMAK</h2>
          <h1>DINAS PEKERJAAN UMUM DAN PENATAAN RUANG</h1>
          <p>Jl. Kyai Singkil No. 7 Demak 59511 | Laporan Pemantauan Pelayanan Terpadu</p>
        </div>

        <div class="title">
          REKAPITULASI BERKAS PENGAJUAN BELUM SELESAI & KENDALA PELAYANAN<br/>
          <span style="font-size: 10pt; font-weight: normal;">(Layanan KTTR & Validasi OSS Bidang TRP, Layanan PBG & SLF Bidang Cipta Karya)</span>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 3%;">No</th>
              <th style="width: 14%;">No. Registrasi / Tgl</th>
              <th style="width: 18%;">Nama Pemohon & Usaha</th>
              <th style="width: 8%;">Layanan</th>
              <th style="width: 12%;">Lokasi / Kec.</th>
              <th style="width: 15%;">Posisi Meja / Tahap</th>
              <th style="width: 22%;">Keterangan Kendala / Bottleneck</th>
              <th style="width: 8%;">Status SLA</th>
            </tr>
          </thead>
          <tbody>
            ${unfinished.map((item, index) => `
              <tr class="${item.slaStatus === 'OVERDUE' ? 'overdue-row' : ''}">
                <td style="text-align: center;">${index + 1}</td>
                <td><strong>${item.noRegistrasi}</strong><br/>${item.tglPengajuan}</td>
                <td><strong>${item.namaPemohon}</strong><br/>${item.namaKegiatan}</td>
                <td><strong>${item.layanan}</strong><br/>(${item.bidang})</td>
                <td>Kec. ${item.kecamatan}</td>
                <td><strong>${item.posisiMeja}</strong><br/>Tahap: ${item.tahapSaatIni}</td>
                <td>${item.keteranganKendala}</td>
                <td><strong>${item.slaStatus}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sign-box">
            Mengetahui,<br/>
            Sekretaris Dinas PUTARU Kab. Demak<br/><br/><br/><br/>
            <strong><u>Dra. Hj. Sri Wahyuni, M.M.</u></strong><br/>
            NIP. 19750914 200003 2 003
          </div>
          <div class="sign-box">
            Demak, ${today}<br/>
            Kepala Dinas PUTARU Kab. Demak<br/><br/><br/><br/>
            <strong><u>Dr. H. Akhmad Sugiharto, S.T., M.T.</u></strong><br/>
            NIP. 19720418 199803 1 006
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};
