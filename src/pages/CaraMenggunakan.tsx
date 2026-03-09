import React from "react";

export default function CaraMenggunakan() {
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Cara Menggunakan</h2>
        <p className="mt-1 text-sm text-slate-600">
          Panduan ringkas agar proses buat nota, simpan, cetak, dan backup data
          berjalan rapi.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">1) Setup Awal</h3>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-700">
          <li>
            Pastikan printer sudah terinstall dengan benar di sistem operasi
            (Windows) dan bisa dipakai untuk tes cetak dasar.
          </li>
          <li>
            Buka menu <strong>Pengaturan</strong>.
          </li>
          <li>
            Atur <strong>Nama Printer Default</strong>.
          </li>
          <li>
            Pilih <strong>Lebar Kertas Thermal</strong> (`58mm` atau `80mm`).
          </li>
          <li>
            Isi <strong>Nama Perusahaan</strong> dan <strong>Alamat Perusahaan</strong>.
          </li>
          <li>
            Klik <strong>Simpan Pengaturan</strong>.
          </li>
        </ol>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">2) Buat Nota Baru</h3>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-700">
          <li>
            Buka menu <strong>Buat Nota Baru</strong>.
          </li>
          <li>
            <strong>Step 1</strong>: pilih kategori `Nota Makan`, `Nota Belanja`,
            `Nota Parkir`, atau `Nota Lain`.
          </li>
          <li>
            <strong>Step 2</strong>: pilih template (`A/B/C`) sesuai format yang
            dibutuhkan.
          </li>
          <li>
            Untuk <strong>Nota Belanja</strong>, ada pilihan format:
            <strong> format lengkap</strong> dan <strong>format ringkas</strong>.
          </li>
          <li>
            <strong>Step 3</strong>: isi informasi utama (toko, tanggal, nomor nota,
            metode pembayaran, upload logo, dll).
          </li>
          <li>
            <strong>Step 4</strong>: isi detail transaksi (item, qty, harga).
          </li>
          <li>
            <strong>Step 5</strong>: cek preview, centang konfirmasi data, lalu
            pilih <strong>Simpan Nota ke Riwayat</strong> atau <strong>Cetak</strong>.
          </li>
        </ol>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            3) Template Nota Tersimpan
          </h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>
              Simpan template dari <strong>Step 3</strong> dengan isi nama template.
            </li>
            <li>
              Di <strong>Step 2</strong>, pilih template tersimpan lalu klik{" "}
              <strong>Pakai</strong> untuk isi otomatis.
            </li>
            <li>
              Template dikelola di menu <strong>Template Tersimpan</strong>:
              pakai, edit nama, hapus.
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">4) Riwayat Cetak</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Gunakan pencarian dan filter status/jenis/tanggal.</li>
            <li>
              Klik <strong>Lihat</strong> untuk membuka preview nota asli.
            </li>
            <li>
              Cetak ulang dari modal <strong>Lihat Nota</strong> agar hasil tetap
              konsisten.
            </li>
            <li>
              Status akan berubah otomatis ke <strong>Sudah dicetak</strong> setelah
              cetak.
            </li>
            <li>Gunakan `Export CSV` untuk unduh data sesuai filter aktif.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">5) Backup & Restore</h3>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>
              Buka menu <strong>Pengaturan</strong>.
            </li>
            <li>
              Klik <strong>Export Data JSON</strong> untuk backup semua data (nota,
              riwayat, template, pengaturan).
            </li>
            <li>
              Setelah update aplikasi/pindah perangkat, klik{" "}
              <strong>Import Data JSON</strong>.
            </li>
          </ol>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            6) Tips Agar Tidak Bingung
          </h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>
              Untuk data toko yang sering dipakai, simpan sebagai template agar
              tidak isi ulang dari nol.
            </li>
            <li>
              Jika hasil cetak tidak sesuai, cek lagi <strong>lebar kertas</strong>{" "}
              di Pengaturan (`58mm` / `80mm`).
            </li>
            <li>
              Lakukan backup JSON berkala, terutama sebelum update aplikasi.
            </li>
            <li>
              Jika cetak thermal tidak sesuai, cek kembali driver printer dan
              ukuran kertas di Pengaturan.
            </li>
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
        <p>Dibuat oleh MIT Indotech Group.</p>
        <p className="mt-1">
          Hanya digunakan oleh Finance Accounting dan Tax PT Indotech Trimitra
          Abadi.
        </p>
      </section>
    </div>
  );
}
