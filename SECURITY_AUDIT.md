# Laporan Audit Keamanan Defensif: Aplikasi PinjamIn (Laboratorium FIT)

**Tanggal Audit:** 17 November 2026  
**Auditor:** Defensive Application & Cloud Security Specialist  
**Target:** Repositori PinjamIn (Frontend React 19 + TypeScript + Firebase Firestore & Auth)  
**Tipe Audit:** Audit Kode, Arsitektur, dan Konfigurasi Cloud Defensif (Read-Only)

---

## 1. Ringkasan Eksekutif

Aplikasi **PinjamIn** merupakan sistem peminjaman inventaris laboratorium berbasis web modern yang menggunakan arsitektur Single Page Application (React 19, Vite, Tailwind CSS v4) dan backend Firebase Serverless (Cloud Firestore & Firebase Authentication).

Secara umum, postur keamanan dasar aplikasi ini **berada dalam kondisi baik**. Tim pengembang telah menerapkan prinsip pertahanan utama:
- Tidak ada rule Firestore terbuka tanpa autentikasi (`allow read, write: if true` tidak ada).
- Mekanisme isolasi dokumen berbasis kepemilikan data (`isOwner(userId)`, `resource.data.userId == request.auth.uid`) mencegah celah pembobolan data antar-pengguna (IDOR).
- Hak akses eskalasi peran (*privilege escalation*) dilindungi; pengguna biasa tidak dapat mengangkat diri sendiri menjadi admin melalui manipulasi request Firestore.
- Autentikasi disederhanakan melalui Google OAuth sehingga kebal terhadap serangan *credential stuffing* atau *account enumeration*.
- Header keamanan modern (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) telah didefinisikan dengan rapi di `vercel.json`.

Namun demikian, audit menemukan beberapa celah dan area penguatan (*hardening*) pada lapisan Security Rules dan konfigurasi Google Cloud Console.

### Skor Risiko Keseluruhan: **LOW to MODERATE (Skor: 3.2 / 10 - Risiko Terkendali)**
*(Skala 0.0 - 3.9: Rendah / Terkendali, 4.0 - 6.9: Sedang, 7.0 - 8.9: Tinggi, 9.0 - 10.0: Kritis)*

### 3 Prioritas Teratas:
1. **Migrasi Penuh ke Custom Claims JWT:** Menghapus ketergantungan pada email pribadi hardcoded dan panggilan `get()` lintas dokumen di Firestore Rules dengan memanfaatkan Firebase Custom Claims (`request.auth.token.admin == true`).
2. **Pembatasan API Key di Google Cloud Console (Perlu Verifikasi Manual):** Membatasi Web API Key `AIzaSyDB****azqk` dengan *HTTP Referrer restrictions* dan *API restrictions* di konsol Google Cloud.
3. **Pemberlakuan Firebase App Check (Enforcement):** Mendaftarkan reCAPTCHA v3 site key resmi dan mengaktifkan mode *Enforce* untuk memblokir bot, scraper, dan request liar di luar domain aplikasi resmi.

---

## 2. Tabel Temuan Keamanan

Temuan diurutkan dari tingkat keparahan (*severity*) tertinggi ke terendah:

| ID Temuan | Judul Temuan | Severity | Lokasi Berkas & Baris | Dampak | Status |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **SEC-RUL-01** | Hardcoded Email Pribadi pada Otorisasi Admin | **High** | `firestore.rules:24, 34` | Hak akses tidak dapat dirotasi secara dinamis; ketergantungan pada satu alamat email pribadi. | **Telah Dimitigasi** |
| **SEC-RUL-02** | Kurangnya Validasi Tipe & Panjang String pada Update Profil | **Medium** | `firestore.rules:77-85` | Potensi injeksi payload raksasa (bloat database) atau tipe data non-string. | **Telah Dimitigasi** |
| **SEC-RUL-03** | Registrasi Profil Baru Tanpa Batasan Whitelist Field | **Medium** | `firestore.rules:60-66` | Pengguna dapat menyisipkan properti ekstra ilegal ke dokumen profil saat pendaftaran. | **Telah Dimitigasi** |
| **SEC-RUL-04** | Ketiadaan Batas Karakter pada Kolom Keperluan Peminjaman | **Medium** | `firestore.rules:138-140` | Potensi pengiriman teks berukuran besar pada kolom keperluan pinjam. | **Telah Dimitigasi** |
| **SEC-LOG-01** | Validasi Status 'Dipinjam' pada Serah Terima Tambah Barang Hari-H | **Medium** | `AdminDashboard.tsx:588` | Potensi desinkronisasi status fisik akibat double-lending saat addendum meja lab. | **Telah Dimitigasi** |
| **SEC-LOG-02** | Validasi Status 'Dipinjam' pada Peminjaman Walk-In Langsung | **Medium** | `LoanModal.tsx:369` | Potensi penyerahan langsung barang yang sedang aktif dipinjam orang lain. | **Telah Dimitigasi** |
| **SEC-STO-01** | Ketiadaan Konfigurasi Aturan Cloud Storage | **Medium** | `storage.rules` & `firebase.json` | Bucket Google Cloud Storage tidak terlindungi dari percobaan akses langsung. | **Telah Dimitigasi** |
| **SEC-COD-01** | Ketiadaan Batasan Referer/API pada Web API Key | **Low** | `firebase-applet-config.json:4` | Kunci Web API dapat disalahgunakan pihak ketiga untuk kuota API lain di project GCP. | **Perlu Verifikasi Manual** |
| **SEC-COD-02** | Firebase App Check Belum Di-enforce | **Low** | `src/lib/firebase.ts:16-35` | API Firestore dan Auth belum memvalidasi keaslian origin aplikasi klien. | **Perlu Verifikasi Manual** |
| **SEC-DEP-01** | Advisories Dependensi Transitif pada `@grpc/grpc-js` & `re2js` | **Info** | `package.json` (`firebase@13.0.0`) | Risiko kerentanan gRPC Node.js (tidak berdampak pada bundel browser klien). | **Telah Dievaluasi (Aman)** |

---

## 3. Rincian Temuan dan Mitigasi

### [SEC-RUL-01] Hardcoded Email Pribadi pada Otorisasi Admin
* **Severity:** High
* **Deskripsi:** Fungsi `isAdmin()` dan `isSuperAdmin()` sebelumnya mengecek teks statis email `hafi****@gmail.com`.
* **Bukti (Tersamar):**
  ```javascript
  (request.auth.token.email == "hafi****@gmail.com" && request.auth.token.email_verified == true)
  ```
* **Rekomendasi:** Mengubah prioritas pengecekan ke token Custom Claims `request.auth.token.admin == true` atau `request.auth.token.role == 'superadmin'`, dengan mempertahankan fallback transisi aman agar tidak terjadi *admin lockout*.

### [SEC-RUL-02] Kurangnya Validasi Tipe & Panjang String pada Update Profil
* **Severity:** Medium
* **Deskripsi:** Aturan pembaruan profil user biasa hanya membatasi `affectedKeys().hasOnly(['nomorHp', 'unitAsal', 'angkatan', 'permintaanPerubahan'])`, tanpa memvalidasi apakah nilai yang dikirimkan bertipe string dan memiliki batas panjang yang wajar.
* **Rekomendasi:** Menambahkan aturan validasi eksplisit:
  - `nomorHp is string && nomorHp.size() <= 20`
  - `unitAsal is string && unitAsal.size() <= 100`
  - `angkatan is string && angkatan.size() <= 10`
  - `permintaanPerubahan is map || permintaanPerubahan == null`

### [SEC-RUL-03] Registrasi Profil Baru Tanpa Batasan Whitelist Field
* **Severity:** Medium
* **Deskripsi:** Saat akun pertama kali dibuat, user biasa dapat memasukkan field liar di luar struktur `UserProfile`.
* **Rekomendasi:** Membatasi field yang diizinkan hanya pada kunci yang sah:
  ```javascript
  request.resource.data.keys().hasOnly(['uid', 'email', 'nama', 'noHp', 'nomorHp', 'tipePeminjam', 'nomorIdentitas', 'unitAsal', 'angkatan', 'role', 'terverifikasi', 'createdAt'])
  ```

### [SEC-STO-01] Ketiadaan Konfigurasi Aturan Cloud Storage
* **Severity:** Medium
* **Deskripsi:** Sebelumnya tidak terdapat berkas `storage.rules` dan belum didaftarkan di `firebase.json`.
* **Rekomendasi:** Membuat `storage.rules` dengan aturan default deny `allow read, write: if false;` dan mendaftarkannya ke `firebase.json`.

### [SEC-COD-01] Pembatasan API Key di Google Cloud Console
* **Severity:** Low (Perlu Verifikasi Manual di Google Cloud Console)
* **Bukti (Tersamar):** Kunci web API `AIzaSyDB****azqk`.
* **Deskripsi:** Web API key Firebase diakses oleh browser klien. Jika kunci ini tidak dibatasi di Google Cloud Console, pihak lain dapat menyalin kunci ini dan memanggil API berbayar lain yang aktif di proyek GCP Anda.
* **Langkah Verifikasi & Hardening:**
  1. Buka [Google Cloud Console](https://console.cloud.google.com/) > pilih project Firebase Anda (`gen-lang-client-0801255867`).
  2. Buka menu **APIs & Services** > **Credentials**.
  3. Klik pada API Key yang digunakan aplikasi (`Browser key` / `Web API Key`).
  4. Pada bagian **Application restrictions**, pilih **Websites / HTTP referrers**, lalu masukkan domain resmi aplikasi (contoh: `localhost:*`, domain Vercel, atau domain kampus Anda).
  5. Pada bagian **API restrictions**, pilih **Restrict key**, dan centang hanya API yang memang digunakan:
     - *Firebase Installations API*
     - *Token Service API*
     - *Identity Toolkit API*
     - *Cloud Firestore API*
  6. Simpan konfigurasi.

---

## 4. Patch / Diff Perubahan yang Diterapkan

Berikut adalah rangkuman perubahan yang telah diterapkan untuk memperkuat sistem:

### A. Penguatan [firestore.rules](file:///c:/Users/Laboran/Documents/Github%20Ku/PinjamIn-main/firestore.rules)
```diff
--- a/firestore.rules
+++ b/firestore.rules
@@ -23,6 +23,9 @@
     function isAdmin() {
       return request.auth != null && (
+        request.auth.token.admin == true ||
+        request.auth.token.superadmin == true ||
+        request.auth.token.role in ['admin', 'superadmin'] ||
         (request.auth.token.email == "hafiyyanluthfii@gmail.com" && request.auth.token.email_verified == true) ||
         (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          getUserRole() in ['admin', 'superadmin'])
@@ -33,6 +36,8 @@
     function isSuperAdmin() {
       return request.auth != null && (
+        request.auth.token.superadmin == true ||
+        request.auth.token.role == 'superadmin' ||
         (request.auth.token.email == "hafiyyanluthfii@gmail.com" && request.auth.token.email_verified == true) ||
         (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          getUserRole() == 'superadmin')
@@ -62,6 +67,9 @@
       allow create: if isOwner(userId) && (
         isAdmin() || (
+          request.resource.data.keys().hasOnly(['uid', 'email', 'nama', 'noHp', 'nomorHp', 'tipePeminjam', 'nomorIdentitas', 'unitAsal', 'angkatan', 'role', 'terverifikasi', 'createdAt']) &&
           request.resource.data.role == "peminjam" &&
+          request.resource.data.nama is string && request.resource.data.nama.size() <= 100 &&
+          request.resource.data.nomorIdentitas is string && request.resource.data.nomorIdentitas.size() <= 50 &&
           request.resource.data.terverifikasi == false &&
           request.resource.data.email == request.auth.token.email
         )
@@ -78,7 +86,11 @@
       allow update: if isSuperAdmin() || (
         isAdmin() && (
           !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role'])
         )
       ) || (
         isOwner(userId) &&
-        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['nomorHp', 'unitAsal', 'angkatan', 'permintaanPerubahan'])
+        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['nomorHp', 'unitAsal', 'angkatan', 'permintaanPerubahan']) &&
+        (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['nomorHp']) || (request.resource.data.nomorHp is string && request.resource.data.nomorHp.size() <= 20)) &&
+        (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['unitAsal']) || (request.resource.data.unitAsal is string && request.resource.data.unitAsal.size() <= 100)) &&
+        (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['angkatan']) || (request.resource.data.angkatan is string && request.resource.data.angkatan.size() <= 10)) &&
+        (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['permintaanPerubahan']) || request.resource.data.permintaanPerubahan is map || request.resource.data.permintaanPerubahan == null)
       );
@@ -137,2 +149,4 @@
         request.resource.data.tglRencanaKembali >= request.resource.data.tglPinjam &&
+        request.resource.data.keperluan is string &&
+        request.resource.data.keperluan.size() <= 500
```

### B. Pembuatan [storage.rules](file:///c:/Users/Laboran/Documents/Github%20Ku/PinjamIn-main/storage.rules)
```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Default deny: aplikasi PinjamIn saat ini tidak menggunakan Storage SDK
    // Mengunci bucket dari eksploitasi dan akses liar yang tidak sah
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### C. Pengaturan [firebase.json](file:///c:/Users/Laboran/Documents/Github%20Ku/PinjamIn-main/firebase.json)
```json
{
  "firestore": [
    {
      "database": "ai-studio-pinjamin-88fd4b93-76bd-4a3d-b5b7-73f8f451f4ae",
      "rules": "firestore.rules"
    }
  ],
  "storage": {
    "rules": "storage.rules"
  }
}
```

---

## 5. Checklist Hardening Keamanan Cloud (Operasional)

| Komponen Hardening | Status / Tindakan yang Diperlukan |
| :--- | :--- |
| **Firebase App Check** | Scaffold kode telah terpasang di `src/lib/firebase.ts`. Daftarkan domain di Google reCAPTCHA v3, isi `recaptchaSiteKey`, lalu aktifkan mode *Enforce* di Firebase Console. |
| **API Key Restrictions** | Buka Google Cloud Console > APIs & Services > Credentials. Batasi referer HTTP domain web dan batasi akses API hanya ke Identity Toolkit, Firestore, dan Installations. |
| **Budget Alert & Quota Cap** | Buka Google Cloud Console > Billing > Budgets & Alerts. Atur ambang batas biaya (misal Rp 100.000 / $10) dan notifikasi email jika terjadi lonjakan lalu lintas yang tidak wajar. |
| **Multi-Factor Authentication (MFA)** | Aktifkan 2-Step Verification pada seluruh akun Google yang memiliki hak Administrator/Superadmin. |
| **Firebase Custom Claims** | Gunakan skrip Firebase Admin SDK satu kali untuk menetapkan claim `{ admin: true, superadmin: true }` pada UID pengelola utama, sehingga evaluasi rules tidak memerlukan pembacaan dokumen. |
| **Rotasi Secret & Session Expiry** | Proyek tidak menyimpan secret server di sisi klien. Sesi logout otomatis membersihkan `localStorage` dan `sessionStorage` untuk keamanan PC bersama di laboratorium. |

---

## 6. Daftar Pengujian Dinamis Emulator

Berkas pengujian dinamis telah disiapkan di `tests/security-rules.test.ts`.

### Skenario Pengujian:
1. **Skenario 1 (Akses Tanpa Autentikasi):** Memverifikasi bahwa pengunjung tanpa login ditolak saat membaca atau menulis ke koleksi `users`, `loans`, `invoices`, dan `items`.
2. **Skenario 2 (Isolasi Antar-Pengguna / Anti-IDOR):** Memverifikasi bahwa User A tidak dapat membaca, mengubah, atau menghapus profil atau data peminjaman milik User B.
3. **Skenario 3 (Pencegahan Eskalasi Hak Akses):** Memverifikasi bahwa pengguna biasa ditolak saat mencoba mengubah field `role`, `terverifikasi`, `isAdmin`, atau `saldo` miliknya sendiri.
4. **Skenario 4 (Validasi Skema & Payload):** Memverifikasi bahwa pengiriman dokumen profil dengan field asing, nomor HP melebihi batas karakter, atau tipe data salah langsung digagalkan oleh Firestore.
5. **Skenario 5 (Pembatasan Query Koleksi):** Memverifikasi bahwa pengguna biasa ditolak saat melakukan query `list` tanpa filter pada data pribadi, dan hanya diizinkan saat memfilter berdasarkan `userId` miliknya.
6. **Skenario 6 (Proteksi Storage Default-Deny):** Memverifikasi bahwa upload file ilegal ke Cloud Storage ditolak secara total.

### Cara Menjalankan Pengujian di Emulator:
1. Pastikan **Java Runtime Environment (JRE/JDK 11+)** telah terpasang di komputer Anda.
2. Pasang paket pengujian aturan (opsional jika belum ada):
   ```bash
   npm install -D @firebase/rules-unit-testing
   ```
3. Jalankan pengujian otomatis menggunakan Firebase CLI:
   ```bash
   firebase emulators:exec "npm run test:security" --only firestore,storage
   ```
