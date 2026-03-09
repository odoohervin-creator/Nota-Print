import React from "react";

export default function CaraMenggunakan() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Cara Menggunakan</h2>
        <p className="mt-1 text-sm text-slate-600">
          Panduan penggunaan NotaPrint dari pembuatan nota sampai backup data.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">
          Alur Buat Nota
        </h3>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-700">
          <li>Buka menu `Buat Nota Baru`.</li>
          <li>Pilih kategori nota: `Makan`, `Parkir`, atau `Lain`.</li>
          <li>Pilih template yang sesuai kebutuhan.</li>
          <li>Isi informasi utama dan detail transaksi.</li>
          <li>Masuk Step 5 (`Preview & Simpan`).</li>
          <li>Centang `Saya yakin data sudah sesuai`.</li>
          <li>Klik `Cetak` atau `Simpan Nota ke Riwayat`.</li>
        </ol>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Riwayat Cetak
          </h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Gunakan pencarian dan filter status/jenis/tanggal.</li>
            <li>Aksi per baris: `Lihat`, `Cetak`, `Hapus`.</li>
            <li>Gunakan `Export CSV` untuk unduh data hasil filter.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Pengaturan & Backup
          </h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Default kertas thermal saat ini `58mm` (bisa diubah ke `80mm`).</li>
            <li>Gunakan `Export Data JSON` untuk backup penuh aplikasi.</li>
            <li>Gunakan `Import Data JSON` setelah update/pindah perangkat.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
