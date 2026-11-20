<p align="center">
  <img src="public/favicon.svg" alt="PinjamIn Logo" width="96" height="96" />
</p>

<h1 align="center">📦 PinjamIn</h1>

<p align="center">
  <strong>Sistem Manajemen & Peminjaman Alat Laboratorium FIT</strong>
</p>

<p align="center">
  <a href="#-fitur-utama"><img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" alt="Status"/></a>
  <a href="https://github.com/cloudflare/security-audit-skill"><img src="https://img.shields.io/badge/Security-Cloudflare%20Audited-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Security Audit"/></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"/></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4"/></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/></a>
  <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/></a>
  <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Tested_with-Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest"/></a>
</p>

---

## 📖 Tentang PinjamIn

**PinjamIn** adalah platform berbasis web modern yang dirancang khusus untuk memfasilitasi dan mendigitalisasi seluruh siklus peminjaman alat dan aset di lingkungan **Laboratorium Fakultas Ilmu Terapan (FIT)**. 

Platform ini menggantikan sistem pencatatan peminjaman manual berbasis kertas atau spreadsheet yang rentan kesalahan dan sulit dilacak. Dengan **PinjamIn**, seluruh civitas akademika (Mahasiswa, Dosen, dan Tenaga Kependidikan) dapat mencari ketersediaan alat secara *real-time*, mengajukan booking, mendapatkan invoice digital resmi, serta memantau status peminjaman dengan transparansi penuh. Di sisi pengelola, staf laboran memiliki dasbor komprehensif untuk memverifikasi pengguna, mengontrol serah terima dan inspeksi fisik pengembalian barang, mengelola inventaris aset, dan menganalisis tren peminjaman.

---

## 📑 Daftar Isi

- [📖 Tentang PinjamIn](#-tentang-pinjamin)
- [✨ Fitur Utama](#-fitur-utama)
  - [🎒 Pengalaman Peminjam (User Experience)](#-pengalaman-peminjam-user-experience)
  - [🛡️ Panel Administrator & Laboran](#️-panel-administrator--laboran)
  - [📄 Invoice Digital & Bukti Peminjaman](#-invoice-digital--bukti-peminjaman)
- [🔄 Alur Peminjaman (Workflow)](#-alur-peminjaman-workflow)
- [🛠️ Tech Stack & Arsitektur](#️-tech-stack--arsitektur)
- [📂 Struktur Direktori](#-struktur-direktori)
- [🚀 Panduan Instalasi & Pengembangan](#-panduan-instalasi--pengembangan)
  - [Prasyarat](#prasyarat)
  - [Langkah Instalasi](#langkah-instalasi)
  - [Konfigurasi Firebase](#konfigurasi-firebase)
  - [Perintah Tersedia](#perintah-tersedia)
- [🔐 Aturan Keamanan & Hak Akses (RBAC)](#-aturan-keamanan--hak-akses-rbac)
- [📋 Kebijakan Default Peminjaman](#-kebijakan-default-peminjaman)
- [🤝 Kontribusi](#-kontribusi)
- [📄 Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 🎒 Pengalaman Peminjam (User Experience)
* **Single Sign-On (Google Auth):** Masuk cepat menggunakan akun Google dengan pencatatan email terverifikasi.
* **Lengkapi Profil Terstandarisasi:** Validasi data diri resmi mencakup Tipe Peminjam (Mahasiswa, Dosen, Tendik), Nomor Identitas (NIM / NIP / NIDN), Program Studi / Unit Kerja, Angkatan, serta Nomor WhatsApp aktif.
* **Katalog Aset Real-time:** 
  * Pencarian instan dan filter berdasarkan kategori (Kamera, Tripod, Audio, Jaringan, Komputer, VR/AR, dll.).
  * Filter ketersediaan barang (*Tersedia, Dipinjam, Perawatan, Rusak*) dan kondisi fisik (*Baik, Perlu Cek*).
  * **Quick Filter "Hanya Tersedia":** Tombol toggle instan 1-klik untuk menyaring hanya barang yang siap dipinjam saat ini.
  * Modal detail alat komprehensif: spesifikasi teknis, merek & tipe, nomor seri, lokasi penyimpanan, dan kelengkapan bawaan (misal: baterai cadangan, kabel data, tas).
* **Multi-Item Cart (Keranjang Booking):** Pilih beberapa alat sekaligus dalam satu kali pengajuan peminjaman.
* **Peminjaman Fleksibel Satu Hari (*Same-Day Loans*):** Dukungan peminjaman non-lintas hari dengan penentuan estimasi Jam Mulai Pinjam dan Jam Rencana Kembali (misal: 08:30 s/d 16:00 WIB). Memungkinkan penjadwalan multi-sesi yang akurat di hari yang sama tanpa bentrok jam, serta tercetak otomatis pada bukti formulir invoice.
* **Validasi Kebijakan Cerdas:** Form peminjaman secara otomatis memeriksa batas maksimal durasi hari dan kuota barang sesuai peran pengguna, serta mewajibkan dosen penanggung jawab untuk mahasiswa.
* **Global Toast Notification:** Umpan balik mikro (*toast banner*) terpusat dengan transisi halus saat menambah/menghapus alat dari keranjang, mengirim pengajuan peminjaman, maupun memperbarui data profil.
* **Integrasi WhatsApp Laboran:** Tombol kontak langsung ke petugas laboratorium dengan pesan terisi otomatis (*pre-filled message*) berisi nama, identitas, dan nomor invoice untuk mempermudah koordinasi serah terima di lab.
* **Riwayat Peminjaman Dinamis:** Tab riwayat dengan lencana status berwarna, estimasi waktu jatuh tempo, indikator peringatan keterlambatan (*overdue*), tampilan rentang jam untuk peminjaman satu hari, dan riwayat pengembalian barang.
* **Standar Desain Mobile-First & UI/UX Pro Max:**
  * Target sentuh jempol minimum 44px (`min-h-[44px] min-w-[44px]`) pada seluruh tombol navigasi dan aksi mobile.
  * Bilah navigasi bawah (*Bottom Navigation Bar*) responsif dengan penyesuaian area aman perangkat (*safe-area-inset-bottom*).
  * Bilah keranjang mengambang (*Floating Cart Bar*) dinamis yang diposisikan secara presisi di atas navigasi bawah.
  * Optimalisasi tata letak kartu peminjaman mobile: Penataan lencana status dinamis (seperti *"Siap Diserahkan di Lab"* dan *"Menunggu Persetujuan"*) serta tombol aksi (*"Catat Pengembalian"*, *"Lihat Invoice"*) secara modular agar bebas tumpang tindih visual (*zero overlap*) dan nyaman dioperasikan satu tangan.
  * Pencegahan auto-zoom Safari iOS melalui ukuran font adaptif (minimal 16px di mobile).
  * 100% menggunakan ikon vektor SVG resmi tanpa menggunakan emoji sebagai ikon antarmuka (*strict compliance*).
  * **Identitas Visual Bersih & Terpadu:** Logo vektor resmi PinjamIn dengan subtitle **Laboratorium FIT** pada header publik, navbar setelah login, layar pemuatan (*loading screen*), dan footer tanpa badge teks ganda yang berlebih.

### 🛡️ Panel Administrator & Laboran
* **Modal Aksi & Konfirmasi Tailwind Kustom:** Seluruh dialog konfirmasi operasional (serah terima barang, tolak pengajuan dengan alasan wajib, batalkan peminjaman, hapus inventaris/kategori, inisialisasi data, delegasi peran admin, hingga pengajuan permohonan pembaruan profil pengguna) 100% menggunakan modal Tailwind kustom menggantikan dialog native browser (`window.confirm` dan `window.prompt`). Dilengkapi dengan textarea masukan dinamis, varian warna semantik (*danger, warning, primary, success*), aksesibilitas pintasan keyboard `Escape`, penutupan latar belakang (*backdrop dismiss*), dan transisi halus.
* **Verifikasi Pengguna Terpusat:** Meninjau dan menyetujui akun baru sebelum diizinkan meminjam barang, serta memproses permintaan perubahan data identitas.
* **Delegasi Akses Admin (Superadmin Only):** Akun Superadmin dapat mempromosikan pengguna terdaftar menjadi Admin Lab atau mencabut akses admin langsung dari dasbor web tanpa perlu menyentuh kode sumber.
* **Manajemen Peminjaman & Serah Terima:**
  * **Persetujuan / Penolakan & Penyesuaian Jadwal:** Meninjau pengajuan, menyetujui, menolak dengan alasan yang transparan, atau menyesuaikan jadwal tanggal kembali sebelum pengajuan disetujui.
  * **Penambahan Barang di Hari-H (Skema Addendum Meja Lab):** Fasilitas fleksibel saat peminjam tiba di laboratorium pada hari-H dan membutuhkan alat tambahan yang berstatus *Tersedia*. Admin dapat memilih barang tambahan langsung dari modal interaktif, sekaligus menyesuaikan tanggal kembali jika diperlukan, mengevaluasi kuota peran dengan dukungan persetujuan khusus (*Admin Override*), serta memilih opsi simpan ke invoice atau simpan & langsung serahkan seluruh barang secara instan dalam 1 nomor invoice yang sama.
  * **Penyesuaian Jadwal Pengembalian (*Extend Loan Schedule*):** Fitur fleksibel untuk memperpanjang batas tanggal kembali sebelum barang diserahkan ke peminjam. Dilengkapi dengan validasi bentrok reservasi secara otomatis (*real-time conflict detection*), perhitungan durasi hari terhadap kuota role, persetujuan khusus admin (*Admin Override*), dan sinkronisasi instan ke invoice serta kalender ketersediaan alat.
  * **Serah Terima (*Handover*) & Akuntabilitas Petugas:** Mengonfirmasi penyerahan fisik barang kepada peminjam dengan validasi ketersediaan kondisi alat terbaru secara atomik, serta mewajibkan pengisian nama dan jabatan spesifik staf yang menyerahkan (contoh: *Laboran Prodi RPLA*, *Kaur Laboratorium FIT*, dll.) untuk jejak audit digital (*digital audit trail*).
  * **Pembatalan Peminjaman Cepat (*Instant Cancel*):** Tombol pembatalan pada kartu peminjaman aktif jika peminjam tidak jadi menggunakan alat di hari-H. Seluruh alat fisik otomatis dipulihkan ke status *Tersedia* dan slot kalender dibebaskan seketika tanpa perlu mengisi formulir checklist inspeksi pengembalian.
  * **Inspeksi Pengembalian Bertahap / Parsial & Penuh (*Partial & Full Return*):** Formulir inspeksi kondisi fisik barang (*Baik / Perlu Cek / Rusak*) dan checklist kelengkapan aksesoris dengan dukungan pengembalian bertahap jika peminjam meminjam lebih dari satu alat. Admin dapat memilih apakah peminjam mengembalikan seluruh barang sekaligus (*Full Return*) atau hanya sebagian alat tertentu (*Partial Return*). Barang yang telah kembali langsung berstatus *Tersedia* dan slot kalendernya dibebaskan seketika untuk peminjam lain (*zero phantom booking*), sementara transaksi peminjaman tetap aktif memantau sisa alat yang masih dibawa peminjam hingga seluruh barang tuntas dikembalikan.
* **Pencatatan Peminjaman Walk-In / Manual:** Staf laboran dapat mencatatkan peminjaman langsung untuk peminjam *offline* / di tempat dengan memilih pengguna terdaftar atau mengisi identitas peminjam kustom (Nama, Kontak, Tipe Peminjam, NIM/NIP, Unit Asal) serta memilih status awal langsung (*Disetujui* atau *Langsung Dipinjamkan*).
* **Manajemen Inventaris & Aset:** Tambah, edit, dan hapus aset laboratorium lengkap dengan foto, kode aset terstandarisasi, nomor seri, dan tahun perolehan.
* **Kategori & Prefix Otomatis:** Pengelompokan aset dengan kode prefix otomatis (misal: `CAM` untuk Kamera, `AUD` untuk Audio, `KOM` untuk Komputer).
* **Konfigurasi Kebijakan Fleksibel:** Pengaturan batas maksimal durasi pinjam, batas maksimal jumlah barang, dan kewajiban penanggung jawab yang dapat disesuaikan per kategori peminjam (Mahasiswa, Dosen, Tendik).
* **Statistik & Analisis Riwayat:** Ringkasan metrik peminjaman aktif, barang dalam perbaikan, dan grafik tren peminjaman berdasarkan filter waktu (30 hari, 3 bulan, 1 tahun, atau semua waktu).
* **Desain Desktop Full-Width Responsif:** Dasbor administrasi, katalog, dan bilah navigasi memanfaatkan layar monitor desktop *widescreen* secara optimal (*fluid full-width layout*) agar tabel data dan metrik tidak sempit.

### 📄 Form Bukti Peminjaman Resmi (Invoice A5)
* **Format Blanko Formal Laboratorium FIT:** Mengikuti standar resmi Administrasi Laboratorium Fakultas Ilmu Terapan dengan kop surat simetris, menampilkan Logo Telkom University di sebelah kiri dan Logo Laboratorium FIT di sebelah kanan.
* **Alamat Definitif Laboratorium FIT:** Kop surat mencantumkan alamat resmi: *Gedung Selaru Lantai 1 Fakultas Ilmu Terapan, Jl. Telekomunikasi No. 1 Terusan Buahbatu, Bandung*.
* **Titimangsa Formal Bahasa Indonesia:** Penulisan tanggal surat resmi otomatis (`Bandung, [DD] [Nama Bulan] [YYYY]`, contoh: *Bandung, 29 Oktober 2026*).
* **Metadata Peminjaman 2 Kolom Sejajar:** Data terstruktur mencakup Nomor Invoice unik, Nama Peminjam, Nomor Identitas (NIM/NIP), Kontak HP/WA, Tanggal Pinjam, Batas Pengembalian (otomatis tersinkronisasi saat jadwal diperpanjang), Keperluan (*Capitalized Case*), dan Status persetujuan.
* **Tabel Barang Solid Klasik:** Daftar inventaris rapi dengan kolom No, Nama Barang & Spesifikasi Teknis, Kode Aset, Jumlah Unit, serta Keterangan Kelengkapan dan Kondisi Pinjam. Seluruh item otomatis tersinkronisasi secara real-time termasuk jika terdapat penambahan barang di hari-H (addendum meja lab) maupun status pengembalian bertahap.
* **Tanda Tangan Dua Pihak & Identitas Petugas Rinci:** Blok pengesahan resmi berdampingan antara Petugas Laboratorium FIT (kiri) dan Peminjam (kanan), lengkap dengan nama terang bergaris bawah dan jabatan/unit spesifik petugas penyerah.
* **Ruang Tanda Tangan & Spasi Proporsional:** Dilengkapi ruang tanda tangan lega (`mb-20 print:mb-16`) yang proporsional untuk goresan tanda tangan pena fisik dan cap stempel resmi basah lab tanpa menabrak teks, serta jeda margin proporsional antar-blok konten.
* **4 Klausul Tata Tertib & Tanggung Jawab Resmi:** Kotak ketentuan terstruktur mencakup 4 klausul operasional: pemeriksaan kelengkapan & fungsi alat pra-pinjam bersama petugas, larangan pemindahtanganan aset tanpa izin, sanksi keterlambatan sesuai tata tertib Unit Laboratorium FIT, dan kewajiban ganti rugi unit baru/spesifikasi setara atas persetujuan Unit Laboratorium FIT jika terjadi kerusakan atau kehilangan.
* **Siap Cetak Kertas A5:** Tampilan dan styling cetak (`@media print`) dioptimalkan khusus untuk ukuran kertas A5 tanpa terpotong atau berantakan saat dicetak atau disimpan ke PDF.
* **Proteksi Akses Dokumen:** Peminjam hanya dapat membuka bukti peminjaman miliknya sendiri, sementara administrator dapat mengakses seluruh arsip invoice.

---

## 🔄 Alur Peminjaman (Workflow)

```mermaid
flowchart TD
    A([User Login via Google]) --> B{Profil Lengkap & Terverifikasi?}
    B -- Belum --> C["Lengkapi Profil & Menunggu Verifikasi Admin"]
    C --> D[Admin Verifikasi Akun]
    D --> E[Akun Aktif]
    B -- Sudah --> E

    E --> F["Eksplorasi Katalog & Pilih Barang ke Keranjang"]
    F --> G["Isi Form Peminjaman: Tanggal, Keperluan, Penanggung Jawab"]
    G --> H[Kirim Pengajuan Peminjaman]
    
    H --> I["Status: Menunggu Persetujuan"]
    I --> J{Tinjauan Admin}
    J -- Tolak --> K(["Peminjaman Ditolak + Catatan"])
    J -- Ubah Jadwal --> AdjPending["Penyesuaian Jadwal / Perpanjang Hari"]
    AdjPending --> I
    J -- Setujui --> L["Status: Disetujui (Menunggu Diambil)"]

    L --> M{"Hari-H: Kedatangan di Meja Lab"}
    M -- Butuh Tambahan Barang Ready --> Add["Penambahan Barang Tambahan (Addendum)"]
    M -- Minta Perpanjangan Hari --> Ext["Ubah Jadwal Pengembalian (Extend Schedule)"]
    Add --> M
    Ext --> M
    M -- Serah Terima Barang Fisik --> N["Status: Dipinjam + Terbit Invoice Digital"]
    L -- Batal Sebelum Diambil --> K
    
    N --> O["Peminjam Mengembalikan Barang ke Lab"]
    O --> P{"Inspeksi Fisik: Seluruh Barang atau Sebagian?"}
    P -- Pengembalian Sebagian (Partial) --> P1["Barang Terpilih Kembali & Tersedia, Sisa Barang Tetap Dipinjam"]
    P1 --> N
    P -- Seluruh Barang Kembali (Full) --> Q(["Status: Dikembalikan / Selesai"])

    N -- Batal / Tidak Jadi Pinjam --> R["Admin Batalkan Peminjaman (Lepas Barang & Reset Status)"]
    R --> S(["Status: Dibatalkan"])
```

---

## 🛠️ Tech Stack & Arsitektur

| Lapisan | Teknologi | Kegunaan |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** (`react`, `react-dom`) | UI Library modern berbasis komponen fungsional dan React Hooks |
| **Language** | **TypeScript 5.x** | *Static typing* ketat untuk keamanan tipe data dan skalabilitas kode |
| **Styling & UI** | **Tailwind CSS v4** | Utility-first CSS framework untuk tampilan responsif dan performa tinggi |
| **Build Tool & Bundler** | **Vite 8** | Development server ultra-cepat dengan Hot Module Replacement (HMR) |
| **Icons & Media** | **React Bootstrap Icons** | Set ikon modern dan konsisten |
| **Database & Auth** | **Firebase Cloud Firestore & Auth** | Database NoSQL real-time, autentikasi Google, dan keamanan tingkat baris |
| **Security Rules** | **Firestore Security Rules** | Kontrol hak akses berbasis role (RBAC) di sisi database |
| **Unit Testing** | **Vitest** | Runner pengujian unit berkecepatan tinggi (11 test cases) untuk kalkulasi tanggal, alokasi jam same-day non-overlap, overlap kalender booking, kuota peran, dan integritas pengembalian sebagian |
| **Optimasi & Resiliensi** | **Rollup Code-Splitting & React Error Boundary** | Pemisahan vendor chunk (<500 kB per bundle, penurunan ukuran awal 84%), deteksi jaringan offline, serta penanganan error runtime ramah pengguna |
| **Progressive Web App** | **Web App Manifest & Theme Color** | PWA-ready dengan dukungan instalasi langsung ke Home Screen smartphone/desktop dan warna bilah peramban terpadu |
| **Audit Keamanan** | **[Cloudflare Security Audit](https://github.com/cloudflare/security-audit-skill)** | Metodologi verifikasi keamanan dependensi, proteksi XSS/CSRF, sanitasi aturan Firestore, dan HTTP headers |
| **Standar UI/UX** | **[UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) & [Superdesign](https://github.com/superdesigndev/superdesign-skill)** | Standar target sentuh jempol 44px, bottom-sheet adaptif, pencegahan CLS (<0.1), dan 100% SVG icons |
| **Aksesibilitas & UI** | **WCAG 2.1 AA & Antislop** | Rasio kontras AA, ring fokus keyboard (`:focus-visible`), toleransi *prefers-reduced-motion*, dan bebas AI slop |
| **Deployment** | **Vercel / Cloud Hosting** | Dukungan SPA routing dengan konfigurasi rewrite (`vercel.json`) |

---

## 📂 Struktur Direktori

```text
PinjamIn/
├── public/                       # Aset publik statis (favicon.svg, logo, manifest.json, robots.txt)
├── src/
│   ├── components/               # Komponen antarmuka pengguna (UI)
│   │   ├── admin/                # Komponen khusus panel administrator
│   │   │   └── AdminDashboard.tsx# Dasbor lengkap laboran (verifikasi, inventaris, serah terima)
│   │   ├── CompleteProfileModal.tsx # Modal pengisian profil awal pengguna baru
│   │   ├── ConfirmModal.tsx      # Modal konfirmasi & prompt Tailwind kustom (pengganti native alert/confirm)
│   │   ├── Icon.tsx              # Komponen wrapper render icon SVG
│   │   ├── InvoiceView.tsx       # Tampilan & cetak invoice digital resmi
│   │   ├── ItemCatalog.tsx       # Katalog interaktif pencarian & keranjang barang
│   │   ├── LoanModal.tsx         # Modal formulir pengajuan peminjaman
│   │   ├── LoginScreen.tsx       # Halaman landing & autentikasi Google
│   │   ├── MyLoans.tsx           # Halaman riwayat peminjaman pengguna
│   │   ├── MyProfile.tsx         # Halaman profil & pengajuan update identitas
│   │   ├── Navbar.tsx            # Navigasi utama responsif (mobile, tablet, desktop)
│   │   ├── PendingVerificationScreen.tsx # Halaman tunggu verifikasi akun
│   │   └── PinjamInIcon.tsx      # Komponen logo vektor resmi PinjamIn
│   ├── context/
│   │   └── AuthContext.tsx       # Global state autentikasi & profil user
│   ├── lib/
│   │   ├── adminConfig.ts        # Helper & validasi status peran admin/superadmin
│   │   ├── dateUtils.ts          # Utilitas format tanggal Indonesia & validasi durasi
│   │   ├── dateUtils.test.ts     # Unit testing vitest untuk kalkulasi tanggal
│   │   └── firebase.ts           # Inisialisasi Firebase App, Auth, dan Firestore
│   ├── types/
│   │   └── index.ts              # Definisi interface TypeScript (Item, Loan, User, dll.)
│   ├── App.tsx                   # Komponen induk aplikasi & penanganan rute
│   ├── index.css                 # Konfigurasi Tailwind CSS v4 & styling global
│   ├── landing.css               # Styling dekoratif & animasi landing page
│   └── main.tsx                  # Entry point aplikasi React
├── .firebaserc                   # Target proyek Firebase CLI
├── firebase.json                 # Pemetaan deployment database Firestore
├── firestore.rules               # Aturan keamanan database Cloud Firestore
├── firebase-applet-config.json   # Konfigurasi kredensial Firebase web client
├── package.json                  # Metadata proyek & daftar dependensi
├── tsconfig.json                 # Konfigurasi kompilator TypeScript
├── vercel.json                   # Konfigurasi rewrite SPA & security headers Vercel
├── vite.config.ts                # Konfigurasi Vite & Tailwind plugin
└── README.md                     # Dokumentasi resmi proyek
```

---

## 🚀 Panduan Instalasi & Pengembangan

### Prasyarat
Pastikan lingkungan pengembangan Anda telah terpasang:
* **Node.js** (versi `20.x` atau lebih baru, direkomendasikan `22+`)
* **npm** atau **bun** / **yarn** / **pnpm**
* Proyek **Firebase** aktif dengan Firestore & Google Authentication diaktifkan.

### Langkah Instalasi

1. **Clone repositori:**
   ```bash
   git clone https://github.com/luthafiyyan/PinjamIn.git
   cd PinjamIn
   ```

2. **Instal seluruh dependensi proyek:**
   ```bash
   npm install
   ```

3. **Konfigurasi Firebase:**
   Pastikan file `firebase-applet-config.json` berada di root proyek dengan struktur kredensial Firebase web Anda:
   ```json
   {
     "projectId": "your-firebase-project-id",
     "appId": "your-firebase-app-id",
     "apiKey": "your-firebase-api-key",
     "authDomain": "your-app.firebaseapp.com",
     "firestoreDatabaseId": "(default)",
     "storageBucket": "your-app.firebasestorage.app",
     "messagingSenderId": "your-sender-id"
   }
   ```

4. **Konfigurasi Variabel Lingkungan (Opsional):**
   Salin `.env.example` ke `.env` jika diperlukan:
   ```bash
   cp .env.example .env
   ```

5. **Jalankan server pengembangan lokal:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan pada `http://localhost:3000`.

---

### Perintah Tersedia

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan Vite development server pada port `3000` |
| `npm run build` | Melakukan kompilasi aset produksi ke folder `dist/` |
| `npm run preview` | Meninjau hasil build produksi secara lokal |
| `npm run lint` | Menjalankan pemeriksaan tipe data TypeScript (`tsc --noEmit`) |
| `npm test` | Menjalankan unit test dengan Vitest (11 test cases) |
| `npm run test:security` | Menjalankan pengujian dinamis Security Rules Firestore & Storage (Emulator) |

---

## 🔐 Aturan Keamanan & Hak Akses (RBAC)

PinjamIn menerapkan keamanan data berlapis menggunakan **Cloud Firestore Security Rules**, **Database-Driven Role Delegation**, dan **Full-Coverage HTTP Security Headers**:

1. **Tingkatan Hak Akses (Role-Based Access Control):**
   * **Superadmin (`role: "superadmin"`):**
     * Memiliki wewenang tertinggi pengelolaan sistem laboratorium.
     * Dapat mengangkat pengguna terdaftar menjadi Admin Lab atau mencabut hak admin secara instan langsung dari tabel pengguna di Dasbor Admin.
     * Identitas Superadmin dikelola secara privat pada basis data Firestore tanpa mengekspos alamat email pribadi ke kode sumber atau repositori publik.
   * **Administrator & Laboran (`role: "admin"`):**
     * Memiliki akses operasional penuh untuk membaca, membuat, menyetujui, dan menyelesaikan seluruh siklus peminjaman, inspeksi kondisi barang, manajemen inventaris, dan verifikasi akun baru.
     * Dibatasi oleh aturan keamanan database sehingga tidak dapat mengubah peran (*role*) pengguna lain.
   * **Peminjam (`role: "peminjam"` • Mahasiswa, Dosen, Tendik):**
     * Hanya dapat membaca dan memperbarui profil miliknya sendiri (nomor HP, unit kerja, angkatan, permohonan koreksi identitas).
     * Hanya dapat membaca katalog barang dan riwayat peminjaman miliknya sendiri.
     * Hanya dapat membuka lembar bukti invoice digital resmi miliknya sendiri.
     * Tidak dapat memodifikasi status peminjaman, nomor sequence counter, atau data inventaris fisik.

2. **Pembersihan Sesi Aman (*Zero-Trace Logout*):**
   * Dirancang khusus untuk keamanan penggunaan di komputer laboratorium bersama (*shared PC*).
   * Saat tombol keluar ditekan, sistem secara otomatis mengeksekusi `signOut(auth)`, mengosongkan seluruh memori tab React, menghapus cache `localStorage` dan `sessionStorage`, serta membersihkan riwayat hash URL agar tidak ada data residu yang tertinggal untuk pengguna berikutnya.

3. **Validasi Transaksi & Privasi Data Pribadi (UU PDP):**
   * **Siklus Status Peminjaman Formal:** Sistem mengelola 6 status siklus hidup peminjaman yang tervalidasi (`menunggu_persetujuan`, `disetujui`, `dipinjam`, `dikembalikan`, `ditolak`, dan `dibatalkan`), di mana pembatalan langsung mengembalikan ketersediaan aset secara atomik.
   * **Integritas Transaksi Server-Side:** Aturan Firestore membatasi kuota barang per pengajuan sesuai peran peminjam (maksimal 2 barang untuk Mahasiswa, 5 barang untuk Dosen/Tendik) langsung di lapisan server, mewajibkan urutan tanggal valid (`tglRencanaKembali >= tglPinjam`), dan memastikan pemetaan identik antara slot booking kalender dengan ID peminjaman (`loanId == bookingId`).
   * **Pencegahan Penyerahan Ganda (*Physical Handover Integrity*):** Transaksi serah terima fisik hari-H secara atomik memvalidasi ketersediaan barang (`status !== 'dipinjam'`) guna mencegah tumpang tindih fisik aset inventaris lab.
   * **Pencegahan Bentrok Reservasi Real-time (*Dynamic Conflict Prevention*):** Pengecekan overlap tanggal berjalan secara otomatis saat pengajuan baru, penambahan barang hari-H, maupun perpanjangan tanggal kembali (*extend schedule*), menjamin tidak ada aset lab yang ter-booking ganda pada rentang waktu yang sama.
   * **Proteksi PII:** Data kontak dan identitas peminjam (*PII - Personally Identifiable Information*) diisolasi ketat di dokumen privat.
   * **Sanitasi Kalender Publik:** Ketersediaan slot kalender untuk pengecekan bentrok jadwal diakses via koleksi tersanitasi (`/bookings`) tanpa memuat data diri peminjam.

4. **HTTP Security Headers Komprehensif (Vercel Edge):**
   * **Content Security Policy (CSP) Lengkap:** Mengatur batasan ketat `default-src 'self'`, `script-src` resmi untuk Firebase & Google OAuth (`'self' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com https://accounts.google.com https://www.gstatic.com`), `connect-src` khusus Firestore/Auth, `img-src` fleksibel aman (`'self' data: blob: https:` untuk foto profil & katalog barang terenkripsi HTTPS), serta `object-src 'none'` guna memitigasi serangan XSS dan eksfiltrasi data ke server asing.
   * **Anti-Clickjacking:** Menggabungkan `X-Frame-Options: SAMEORIGIN` dan `frame-ancestors 'self'` untuk mencegah antarmuka ditumpuk (*UI redress*) oleh situs luar.
   * **Strict-Transport-Security (HSTS):** `max-age=31536000; includeSubDomains; preload` mewajibkan browser untuk selalu menggunakan koneksi HTTPS yang aman dan terenkripsi.
   * **Permissions-Policy:** Menonaktifkan izin akses perangkat keras sensitif (`camera=(), microphone=(), geolocation=()`).
   * **X-Content-Type-Options: nosniff** & **Referrer-Policy: strict-origin-when-cross-origin**.
   * **SEO & Crawler Privacy Hygiene (`robots.txt`):** Mengatur direktif perayapan mesin pencari (*crawler*) untuk mengizinkan pengindeksan katalog publik dan menyembunyikan rute internal privat (`/#admin`, `/#riwayat`, `/#profil`) dari hasil pencarian umum.

5. **Verifikasi Audit Keamanan Cloudflare (*Cloudflare Security Audit Skill* - 17 Nov 2026):**
   * Metodologi audit berstandar industri mengikuti framework resmi [Cloudflare Security Audit](https://github.com/cloudflare/security-audit-skill) dengan 100% kepatuhan skema laporan (`report-schema.json` valid).
   * Laporan detail tersimpan lengkap pada [`SECURITY_AUDIT.md`](./SECURITY_AUDIT.md).
   * **Hasil Re-Audit (Status: Production-Ready & Highly Defended):**
     * **Celah Kuota Peminjaman (RESOLVED):** Evaluasi kuota peran peminjam (`mahasiswa <= 2`, `dosen/tendik <= 5`) ditegakkan langsung di server database via [firestore.rules](file:///c:/Users/Laboran/Documents/Github%20Ku/PinjamIn-main/firestore.rules#L120-L123), mengeliminasi celah manipulasi batas kuota di sisi klien.
     * **Pencegahan Double-Lending Meja Lab (RESOLVED):** Transaksi serah terima fisik barang pada [AdminDashboard.tsx](file:///c:/Users/Laboran/Documents/Github%20Ku/PinjamIn-main/src/components/admin/AdminDashboard.tsx#L439) secara atomik memeriksa kondisi `itemData.status === 'dipinjam'`, mencegah tumpang tindih fisik aset inventaris lab.
     * **Validasi Skema & Whitelist Keys (HARDENED):** Pendaftaran profil baru dan pembaruan data pengguna dipagari dengan whitelist keys (`keys().hasOnly(...)`) dan batasan panjang karakter (`nomorHp <= 20`, `unitAsal <= 100`, `angkatan <= 10`, `keperluan <= 500`) untuk mencegah serangan payload bloat.
     * **Pembatasan Google Cloud Web API Key (HARDENED):** Kunci API web telah terkunci dengan pembatasan *HTTP Referrers* (domain resmi aplikasi) dan *API restrictions* (hanya Cloud Firestore, Identity Toolkit, Token Service, dan Installations), memutus akses ke 9 API Google Maps aktif sebelumnya.
     * **Proteksi Cloud Storage (*Default Deny*):** Penambahan [storage.rules](file:///c:/Users/Laboran/Documents/Github%20Ku/PinjamIn-main/storage.rules) mengunci total bucket Google Cloud Storage dari akses tidak sah.
     * **Firebase App Check Scaffolding:** Penyiapan fondasi App Check berbasis reCAPTCHA v3 di [src/lib/firebase.ts](file:///c:/Users/Laboran/Documents/Github%20Ku/PinjamIn-main/src/lib/firebase.ts) untuk verifikasi keaslian aplikasi klien saat publish penuh.
     * **Pengujian Dinamis di Emulator:** Berkas [tests/security-rules.test.ts](file:///c:/Users/Laboran/Documents/Github%20Ku/PinjamIn-main/tests/security-rules.test.ts) mencakup 6 skenario ancaman (unauthenticated access, anti-IDOR, pencegahan eskalasi hak akses, validasi payload raksasa, isolasi query data pribadi, dan storage lock).

6. **Audit & Triage Kerentanan Agen (*Agentic Bug Hunter Methodology* - 18 Nov 2026):**
   * Menggunakan framework evaluasi ketat *7-Question Gate* (`awarexone/Agentic-Bug-Hunter`) untuk mengeliminasi positif palsu dan memitigasi anomali logika bisnis nyata (*race conditions & state machine flaws*).
   * **Mitigasi Serah Terima Langsung Hari-H (Addendum):** Validasi atomik `status !== 'dipinjam'` diterapkan pada cabang serah terima langsung modal penambahan barang di meja lab ([`AdminDashboard.tsx`](./src/components/admin/AdminDashboard.tsx)), menutup celah *concurrent overwrite*.
   * **Mitigasi Peminjaman Langsung di Tempat (Walk-In):** Validasi ketat `status !== 'dipinjam'` pada opsi pencatatan langsung serah terima ([`LoanModal.tsx`](./src/components/LoanModal.tsx)), menjamin aset yang sedang dipinjam aktif tidak dapat ditimpa oleh peminjaman walk-in baru.

7. **Verifikasi Keamanan Standar Bug Bounty (*Claude-BugHunter Methodology* - 20 Nov 2026):**
   * Audit *source-first* komprehensif mengacu pada standar taksonomi **Bugcrowd VRT v3.x** dan **HackerOne Taxonomy**: **0 Kerentanan Kritis (P1)** dan **0 Kerentanan Tinggi (P2)**.
   * **Integritas State Machine & Mutasi Atomik:** Seluruh transisi status peminjaman (`menunggu_persetujuan` -> `disetujui` -> `dipinjam` -> `dikembalikan`), addendum meja lab, dan pembatalan diproteksi secara atomik via `runTransaction`, mengeliminasi celah *race condition* dan *double-lending*.
   * **Proteksi IDOR & BOLA Mutlak:** Dokumen privat peminjaman, pengguna, dan arsip invoice diisolasi ketat di level Firestore Security Rules dan lapisan komponen UI (`resource.data.userId == request.auth.uid || isAdmin()`).
   * **Pembersihan Residu Sesi & Higienitas UI:** Protokol *Zero-Trace Logout* membersihkan seluruh token Firebase, memori state React, dan penyimpanan lokal (`localStorage` & `sessionStorage`). Kamus ikon tersanitasi penuh dengan fallback aman (*0 broken dots*).

Deploy aturan keamanan Firestore dan Storage ke lingkungan Firebase Anda:
```bash
firebase deploy --only firestore:rules,storage
```

---

## 📋 Kebijakan Default Peminjaman

Aturan peminjaman dapat disesuaikan sewaktu-waktu oleh Admin melalui menu **Pengaturan** di Dasbor Admin:

| Tipe Peminjam | Maks. Durasi Peminjaman | Maks. Jumlah Barang | Wajib Dosen Penanggung Jawab |
| :--- | :---: | :---: | :---: |
| **Mahasiswa** | 3 Hari | 2 Barang | **Ya** (Nama & NIP Dosen) |
| **Dosen** | 7 Hari | 5 Barang | Tidak |
| **Tendik** | 7 Hari | 5 Barang | Tidak |

---

## 📄 Lisensi

Proyek ini dikembangkan untuk kebutuhan internal laboratorium dan didistribusikan di bawah lisensi **MIT License**.

---

<p align="center">
  © 2026 <strong>Pinjamin Laboratorium FIT | HFYN</strong> • Developed by <strong>Luthafiyyan</strong>
</p>
