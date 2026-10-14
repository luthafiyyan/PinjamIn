export type UserRole = 'peminjam' | 'admin';

export type TipePeminjam = 'mahasiswa' | 'dosen' | 'tendik';

export type ItemCondition = 'baik' | 'perlu_cek' | 'rusak';

export type ItemStatus = 'tersedia' | 'dipinjam' | 'perawatan' | 'rusak';

export type LoanStatus = 'dipinjam' | 'dikembalikan';

export type JenisKeperluan = 
  | 'tugas_kuliah'
  | 'penelitian'
  | 'kegiatan_organisasi'
  | 'kegiatan_unit'
  | 'lainnya';

export interface UserProfile {
  uid: string;
  nama: string;
  email: string;
  noHp: string;
  tipePeminjam: TipePeminjam;
  nomorIdentitas: string; // NIM / NIP/NIDN / NIP/NIK
  unitAsal: string; // prodi / KK / unit kerja
  angkatan?: string; // hanya untuk mahasiswa
  role: UserRole;
  terverifikasi: boolean;
  createdAt?: string | any;
}

export interface Category {
  id: string;
  nama: string;
  prefix: string;
  urutan?: number;
}

export interface Item {
  id: string;
  kodeAset: string;
  nama: string;
  categoryId: string;
  kategoriNama: string;
  kondisi: 'baik' | 'perlu_cek';
  status: ItemStatus;
  currentLoanId: string | null;
  merek?: string;
  model?: string;
  nomorSeri?: string;
  spesifikasi?: string;
  kelengkapan?: string[];
  fotoUrl?: string;
  tahunPerolehan?: number;
  lokasiSimpan?: string;
  catatanAdmin?: string;
  createdAt?: string | any;
}

export interface LoanItem {
  itemId: string;
  kodeAset: string;
  nama: string;
  kondisiPinjam: 'baik' | 'perlu_cek';
  kondisiKembali?: 'baik' | 'perlu_cek' | 'rusak';
  merek?: string;
  model?: string;
  kelengkapan?: string[];
  kelengkapanKembali?: string[];
}

export interface Loan {
  id: string;
  userId: string;
  peminjam: {
    nama: string;
    email: string;
    noHp: string;
    tipePeminjam: TipePeminjam;
    nomorIdentitas: string;
    unitAsal: string;
    angkatan?: string;
  };
  jenisKeperluan: JenisKeperluan;
  keperluan: string;
  penanggungJawab: {
    nama: string;
    nip: string;
  } | null;
  tglPinjam: string; // Format YYYY-MM-DD
  tglRencanaKembali: string; // Format YYYY-MM-DD
  tglKembaliAktual: string | null;
  status: LoanStatus;
  items: LoanItem[];
  noInvoice: string;
  dikembalikanOleh: string | null;
  catatanPengembalian: string | null;
  createdAt?: any;
}

export interface Invoice {
  id: string;
  loanId: string;
  userId: string;
  noInvoice: string;
  tglTerbit: string;
  catatan?: string;
}

export interface RuleSetting {
  maxDurasiHari: number;
  maxBarang: number;
  wajibPenanggungJawab: boolean;
}

export interface PeminjamanSettings {
  mahasiswa: RuleSetting;
  dosen: RuleSetting;
  tendik: RuleSetting;
}
