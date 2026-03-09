# NotaPrint Master Project

Starter project React + TypeScript + Vite + Tailwind untuk aplikasi desktop nota pengganti perusahaan.

## Cara jalanin (web)

```bash
npm install
npm run dev
```

## Cara jalanin (Electron desktop)

```bash
npm install
npm run dev:electron
```

## Build installer Windows (.exe)

```bash
npm install
npm run dist:win
```

## Yang sudah ada

- Dashboard
- Multi-step create note flow
- Kategori nota: makan, parkir, lain
- Template per kategori
- Form dinamis per kategori
- Edit item transaksi
- Live preview thermal 80mm
- Riwayat data
- Setup Electron + electron-builder (Windows)

## Yang belum ada

- Database lokal
- Export PDF
- Print thermal asli
- Penyimpanan riwayat nyata
- Integrasi direct thermal driver (ESC/POS native)

## Saran next step

1. Rapikan komponen jadi folder `components/`
2. Tambahkan state management / form validation
3. Tambahkan local database (SQLite / IndexedDB)
4. Pisahkan layout print dan layout aplikasi
5. Tambahkan auto-update untuk rilis app berikutnya
