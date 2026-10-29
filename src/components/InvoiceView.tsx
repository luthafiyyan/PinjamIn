import React, { useEffect, useState } from 'react';
import { 
  doc, 
  onSnapshot 
} from 'firebase/firestore';
import { Icon } from './Icon';
import { db } from '../lib/firebase';
import { Loan } from '../types';
import { useAuth } from '../context/AuthContext';

interface InvoiceViewProps {
  loanId: string;
  onBack: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ loanId, onBack }) => {
  const { currentUser, isAdmin } = useAuth();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loanId) return;

    setLoading(true);
    const loanRef = doc(db, 'loans', loanId);

    const unsubscribe = onSnapshot(
      loanRef,
      (snap) => {
        if (!snap.exists()) {
          setErrorMsg('Dokumen peminjaman tidak ditemukan.');
          setLoading(false);
          return;
        }

        const data = snap.data() as Omit<Loan, 'id'>;
        const currentLoan: Loan = {
          id: snap.id,
          ...data,
        };

        // Access control: Peminjam can only open their own invoice. Admin can open all.
        if (!isAdmin && currentLoan.userId !== currentUser?.uid) {
          setErrorMsg('Akses ditolak: Anda hanya diizinkan melihat invoice peminjaman milik Anda sendiri.');
          setLoading(false);
          return;
        }

        setLoan(currentLoan);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching loan for invoice:', err);
        setErrorMsg('Gagal memuat invoice. Periksa koneksi atau izin akses.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [loanId, currentUser, isAdmin]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Memuat berkas invoice...</p>
      </div>
    );
  }

  if (errorMsg || !loan) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 text-sm mb-4">
          <Icon name="ExclamationTriangle" size={24} className="text-rose-600 mx-auto mb-2" />
          <p className="font-semibold">{errorMsg || 'Invoice tidak tersedia'}</p>
        </div>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
        >
          Kembali
        </button>
      </div>
    );
  }

  // Dynamic calculations
  const isOverdue =
    loan.status === 'dipinjam' &&
    new Date(loan.tglRencanaKembali).setHours(23, 59, 59, 999) < Date.now();

  const getIdentitasLabel = (tipe: string) => {
    switch (tipe) {
      case 'mahasiswa':
        return 'NIM';
      case 'dosen':
        return 'NIP / NIDN';
      case 'tendik':
        return 'NIP / NIK';
      default:
        return 'No. Identitas';
    }
  };

  const formatJenisKeperluan = (jk: string) => {
    switch (jk) {
      case 'tugas_kuliah':
        return 'Tugas Kuliah / Praktikum';
      case 'penelitian':
        return 'Penelitian / Tugas Akhir';
      case 'kegiatan_organisasi':
        return 'Kegiatan Organisasi Mahasiswa';
      case 'kegiatan_unit':
        return 'Kegiatan Unit Kerja / Layanan Lab';
      default:
        return 'Keperluan Lainnya';
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'dikembalikan') return 'SUDAH DIKEMBALIKAN';
    if (isOverdue) return 'TERLAMBAT PENGEMBALIAN';
    if (status === 'disetujui') return 'DISETUJUI (SIAP DIAMBIL)';
    if (status === 'menunggu_persetujuan') return 'MENUNGGU PERSETUJUAN';
    return 'SEDANG DIPINJAM (AKTIF)';
  };

  // Min rows for blanko aesthetic
  const minRows = Math.max(4, loan.items.length);
  const emptyRowsCount = Math.max(0, 5 - loan.items.length);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8 print:max-w-[148mm] print:p-0 print:m-0 print:bg-white print-document-wrapper">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex items-center justify-between gap-4 mb-6 no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white border border-slate-200 transition-all cursor-pointer shadow-sm min-h-[44px]"
        >
          <Icon name="ArrowLeft" size={16} />
          <span>Kembali</span>
        </button>

        <button
          onClick={handlePrint}
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all cursor-pointer min-h-[44px]"
        >
          <Icon name="Printer" size={16} />
          <span>Cetak Formulir Resmi (A5)</span>
        </button>
      </div>

      {/* Printable Invoice Container (Model Blanko Formal Lab FIT) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xl p-6 sm:p-10 print-a5-container print:bg-white print:border-none print:shadow-none print:p-0 text-slate-900">
        
        {/* 1. KOP SURAT RESMI (HANYA LOGO LAB FIT DI KIRI & TEKS TERPUSAT SECARA SIMETRIS) */}
        <div className="border-b-[2.5px] border-black pb-3 mb-4 print:pb-2 print:mb-3">
          <div className="flex items-center justify-between gap-3">
            {/* Logo Laboratorium FIT Saja (Kiri) */}
            <div className="w-28 sm:w-32 shrink-0">
              <img
                src="https://web.labfit.id/wp-content/uploads/2025/06/Logo-Lab-FIT-2024_Lengkap-Utama-2048x306.png"
                alt="Logo Laboratorium FIT"
                className="w-full h-auto object-contain print-logo"
                onError={(e) => {
                  // Fallback text if offline
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* Teks Judul & Lembaga Terpusat di Tengah Dokumen */}
            <div className="flex-1 text-center">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-black leading-tight print:text-[10pt]">
                FORM BUKTI PEMINJAMAN ALAT
              </h2>
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-tight text-black leading-tight print:text-[9pt]">
                ADMINISTRASI LABORATORIUM
              </h3>
              <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight text-black leading-tight print:text-[8.5pt]">
                LABORATORIUM FAKULTAS ILMU TERAPAN
              </h4>
              <p className="text-[9px] sm:text-[10px] text-slate-700 mt-1 leading-snug print:text-[7pt] print:mt-0.5">
                Gedung Selaru Fakultas Ilmu Terapan, Jl. Telekomunikasi No. 1 Terusan Buah Batu, Bandung
              </p>
            </div>

            {/* Spacer Penyeimbang Kanan agar Teks Benar-Benar di Tengah Dokumen */}
            <div className="w-28 sm:w-32 shrink-0 invisible pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        {/* 2. DATA IDENTITAS & JADWAL (DUA KOLOM TITIK DUA SEJAJAR SESUAI BLANKO RESMI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs print:grid-cols-2 print:gap-x-4 print:text-[8pt] mb-3 leading-snug">
          {/* Kolom Kiri */}
          <table className="w-full text-left">
            <tbody>
              <tr>
                <td className="w-28 font-bold text-black py-0.5 whitespace-nowrap print:w-24">NO. INVOICE</td>
                <td className="w-3 text-center py-0.5">:</td>
                <td className="font-bold text-black py-0.5 font-mono tracking-wider tabular-nums">{loan.noInvoice}</td>
              </tr>
              <tr>
                <td className="font-bold text-black py-0.5 whitespace-nowrap">NAMA PEMINJAM</td>
                <td className="text-center py-0.5">:</td>
                <td className="font-semibold text-black py-0.5 uppercase">{loan.peminjam.nama}</td>
              </tr>
              <tr>
                <td className="font-bold text-black py-0.5 whitespace-nowrap">{getIdentitasLabel(loan.peminjam.tipePeminjam)}</td>
                <td className="text-center py-0.5">:</td>
                <td className="font-semibold text-black py-0.5 tabular-nums">{loan.peminjam.nomorIdentitas}</td>
              </tr>
              <tr>
                <td className="font-bold text-black py-0.5 whitespace-nowrap">NO. HP / WA</td>
                <td className="text-center py-0.5">:</td>
                <td className="font-semibold text-black py-0.5 tabular-nums">{loan.peminjam.noHp}</td>
              </tr>
            </tbody>
          </table>

          {/* Kolom Kanan */}
          <table className="w-full text-left">
            <tbody>
              <tr>
                <td className="w-28 font-bold text-black py-0.5 whitespace-nowrap print:w-24">TGL PINJAM</td>
                <td className="w-3 text-center py-0.5">:</td>
                <td className="font-semibold text-black py-0.5 tabular-nums">{loan.tglPinjam}</td>
              </tr>
              <tr>
                <td className="font-bold text-black py-0.5 whitespace-nowrap">BATAS KEMBALI</td>
                <td className="text-center py-0.5">:</td>
                <td className="font-bold text-black py-0.5 tabular-nums">
                  {loan.tglRencanaKembali}
                  {loan.tglKembaliAktual && (
                    <span className="text-emerald-700 font-semibold ml-1.5 print:text-black">
                      (Kembali: {loan.tglKembaliAktual})
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-bold text-black py-0.5 whitespace-nowrap">KEPERLUAN</td>
                <td className="text-center py-0.5">:</td>
                <td className="text-black py-0.5 capitalize">
                  {loan.keperluan}
                </td>
              </tr>
              <tr>
                <td className="font-bold text-black py-0.5 whitespace-nowrap">STATUS</td>
                <td className="text-center py-0.5">:</td>
                <td className="font-bold text-black py-0.5 tracking-tight uppercase">
                  {getStatusText(loan.status)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. TABEL DAFTAR BARANG (SOLID BLACK BORDER KLASIK SEPERTI GAMBAR FORMULIR) */}
        <div className="overflow-x-auto mb-3">
          <table className="w-full border-collapse border border-black text-xs print:text-[7.5pt]">
            <thead>
              <tr className="bg-slate-100 font-bold text-black border-b border-black">
                <th className="border border-black py-1 px-2 text-center w-8">NO</th>
                <th className="border border-black py-1 px-2.5 text-left">Nama Barang & Spesifikasi</th>
                <th className="border border-black py-1 px-2 text-center w-28 print:w-24">Kode Aset</th>
                <th className="border border-black py-1 px-2 text-center w-14">Jumlah</th>
                <th className="border border-black py-1 px-2.5 text-left w-36 print:w-32">Keterangan / Kelengkapan</th>
                {loan.status === 'dikembalikan' && (
                  <th className="border border-black py-1 px-2 text-center w-24">Kondisi Kembali</th>
                )}
              </tr>
            </thead>
            <tbody className="text-black">
              {loan.items.map((it, idx) => (
                <tr key={it.itemId || idx} className="border-b border-black align-top">
                  <td className="border border-black py-1 px-1 text-center font-semibold tabular-nums">{idx + 1}</td>
                  <td className="border border-black py-1 px-2.5">
                    <p className="font-semibold text-black">{it.nama}</p>
                    {(it.merek || it.model) && (
                      <p className="text-[11px] text-slate-600 print:text-[7pt]">
                        {[it.merek, it.model].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </td>
                  <td className="border border-black py-1 px-2 font-mono text-center tabular-nums text-[11px] print:text-[7pt]">
                    {it.kodeAset}
                  </td>
                  <td className="border border-black py-1 px-2 text-center">
                    1 Unit
                  </td>
                  <td className="border border-black py-1 px-2.5 text-[11px] print:text-[7pt]">
                    <div>
                      <span className="font-medium">Kondisi Pinjam: </span>
                      <span className="capitalize">{it.kondisiPinjam}</span>
                    </div>
                    {it.kelengkapan && it.kelengkapan.length > 0 && (
                      <div className="text-slate-700 mt-0.5 print:text-black">
                        <span className="font-medium">Kelengkapan: </span>
                        {it.kelengkapan.join(', ')}
                      </div>
                    )}
                  </td>
                  {loan.status === 'dikembalikan' && (
                    <td className="border border-black py-1 px-2 text-center capitalize font-semibold">
                      {it.kondisiKembali || '-'}
                    </td>
                  )}
                </tr>
              ))}

              {/* Baris Kosong Elegan untuk Kesan Blanko Formal (Jika item sedikit) */}
              {Array.from({ length: emptyRowsCount }).map((_, eIdx) => (
                <tr key={`empty-${eIdx}`} className="border-b border-black h-6 print:h-5">
                  <td className="border border-black py-1 text-center text-slate-400 text-[10px] print:text-[6.5pt]">
                    {loan.items.length + eIdx + 1}
                  </td>
                  <td className="border border-black py-1 px-2.5"></td>
                  <td className="border border-black py-1"></td>
                  <td className="border border-black py-1"></td>
                  <td className="border border-black py-1 px-2.5"></td>
                  {loan.status === 'dikembalikan' && (
                    <td className="border border-black py-1"></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. CATATAN KETENTUAN LABORATORIUM */}
        <div className="text-[10px] text-slate-800 leading-tight border border-black p-2 bg-slate-50/60 mb-4 print:text-[7pt] print:p-1.5 print:mb-2 print:bg-transparent">
          <span className="font-bold block mb-0.5">Ketentuan & Tanggung Jawab Peminjam:</span>
          <ol className="list-decimal pl-3 space-y-0.5">
            <li>Peminjam wajib menjaga keutuhan, kebersihan, dan keselamatan seluruh perlengkapan yang dipinjam.</li>
            <li>Keterlambatan pengembalian tanpa konfirmasi dikenakan sanksi tata tertib peminjaman Lab FIT.</li>
            <li>Kerusakan atau kehilangan perlengkapan menjadi tanggung jawab peminjam untuk mengganti unit yang setara.</li>
          </ol>
        </div>

        {/* 5. TANDA TANGAN (UNIT LABORATORIUM FIT DI KIRI & PEMINJAM DI KANAN) */}
        <div className="pt-1 print:pt-0">
          {/* Tanggal Terbit di Kanan Atas Tanda Tangan */}
          <div className="text-right text-xs text-black mb-1 font-medium print:text-[8pt] print:mb-0.5">
            Bandung, {loan.tglPinjam}
          </div>

          <div className="grid grid-cols-2 gap-8 text-xs text-center print:text-[8pt] print:gap-4">
            {/* Pihak 1: Unit Laboratorium FIT (Kiri) */}
            <div>
              <p className="font-bold text-black mb-14 print:mb-10">Unit Laboratorium FIT,</p>
              <p className="font-bold text-black uppercase underline tracking-wide print:text-[8.5pt]">
                {loan.diserahkanOleh || loan.dikembalikanOleh ? `( ${loan.diserahkanOleh || loan.dikembalikanOleh} )` : '( ............................................ )'}
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5 print:text-[7pt]">Laboratorium Fakultas Ilmu Terapan</p>
            </div>

            {/* Pihak 2: Peminjam (Kanan) */}
            <div>
              <p className="font-bold text-black mb-14 print:mb-10">Peminjam,</p>
              <p className="font-bold text-black uppercase underline tracking-wide print:text-[8.5pt]">
                ( {loan.peminjam.nama} )
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5 print:text-[7pt]">
                {getIdentitasLabel(loan.peminjam.tipePeminjam)}: {loan.peminjam.nomorIdentitas}
              </p>
            </div>
          </div>

          {/* Footer Dokumen */}
          <div className="mt-4 pt-1.5 border-t border-slate-300 flex justify-between items-center text-[9px] text-slate-500 print:text-[6.5pt] print:mt-2">
            <span>Dicetak via <strong>PinjamIn</strong> — Sistem Inventaris Lab FIT</span>
            <span>Dok. Terkendali • FIT-LAB-INV</span>
          </div>
        </div>

      </div>

      {/* Tombol Cetak Ponsel yang Menempel di Bawah (Hidden on Desktop & Print) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.08)] no-print">
        <button
          onClick={handlePrint}
          className="w-full min-h-[48px] py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icon name="Printer" size={18} />
          <span>Cetak Formulir Resmi (A5)</span>
        </button>
      </div>
    </div>
  );
};
