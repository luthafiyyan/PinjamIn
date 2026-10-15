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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8 print:max-w-[148mm] print:p-0 print:m-0">
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
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all cursor-pointer min-h-[44px]"
        >
          <Icon name="Printer" size={16} />
          <span>Cetak / Simpan PDF (A5)</span>
        </button>
      </div>

      {/* Printable Invoice Container (Sized for A5 on print, centered on A4) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-8 sm:p-12 print-a5-container">
        
        {/* 1. KOP SURAT */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 print-kop">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl font-bold tracking-tight text-slate-950 print-brand">
                  Pinjam<span className="text-amber-500">In</span>
                </span>
                <span className="text-slate-400 font-light text-xl print:text-[9pt] print:mx-1">|</span>
                <span className="text-xs font-semibold text-slate-700 print:text-[8pt]">
                  Laboratorium FIT
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 italic mt-1 print-tagline">
                "Pinjam alat, tanpa ribet"
              </p>
              <p className="text-xs text-slate-400 mt-1 print:text-[7pt] print:mt-0.5">
                Fakultas Ilmu Terapan • Gedung Selaru Lt. 1 • WA: 0851-7208-8181
              </p>
            </div>

            <div className="shrink-0 flex items-center justify-end">
              <img
                src="https://web.labfit.id/wp-content/uploads/2025/06/Logo-Lab-FIT-2024_Lengkap-Utama-2048x306.png"
                alt="Logo Laboratorium FIT"
                className="h-16 w-auto max-w-[180px] object-contain rounded-lg bg-white print-logo"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 print-document-meta">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 print:text-[7pt]">
                Bukti Peminjaman Alat
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 print:text-[12pt] print:mt-0">
                Invoice Peminjaman
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:text-right print:grid-cols-2 print:text-right print-document-meta-grid">
              <div className="rounded-xl bg-white border border-slate-200 px-3 py-2 print-document-meta-card">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 print:text-[6.5pt]">
                  Nomor Peminjaman
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-indigo-700 tabular-nums print:text-[8.5pt] print:text-slate-900 print:mt-0">
                  {loan.noInvoice}
                </p>
              </div>

              <div className="rounded-xl bg-white border border-slate-200 px-3 py-2 print-document-meta-card">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 print:text-[6.5pt]">
                  Tanggal
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800 tabular-nums print:text-[8.5pt] print:text-slate-900 print:mt-0">
                  {loan.tglPinjam}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Callout (Screen & Print) */}
        <div className="mb-6 flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 print-status print:border-slate-300 print:rounded-lg print:text-[7.5pt]">
          <div className="flex items-center gap-2 print:gap-1.5">
            <span className="text-xs font-semibold text-slate-600 print:text-[7.5pt]">Status:</span>
            {loan.status === 'dikembalikan' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 print:text-[7.5pt] print:px-1.5 print:py-0.5">
                <Icon name="CheckCircle" size={14} className="text-emerald-600 print:grayscale" />
                Sudah Dikembalikan
              </span>
            ) : isOverdue ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse print:text-[7.5pt] print:px-1.5 print:py-0.5">
                <Icon name="ExclamationTriangle" size={14} className="text-rose-600 print:grayscale" />
                Terlambat Pengembalian
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 print:text-[7.5pt] print:px-1.5 print:py-0.5">
                <Icon name="HourglassSplit" size={14} className="text-amber-600 print:grayscale" />
                Sedang Dipinjam (Aktif)
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 print:text-[7.5pt]">
            Batas Kembali: <span className="font-semibold text-slate-900 tabular-nums">{loan.tglRencanaKembali}</span>
          </div>
        </div>

        {/* 2 & 3 & 4. DATA PEMINJAM & JADWAL (DUA KOLOM HEMAT RUANG A5) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs print-info-grid">
          {/* Kolom 1: Data Peminjam */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 print-info-card">
            <div className="font-semibold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center justify-between print:text-[8pt] print:pb-0.5">
              <span>Data Peminjam</span>
              <span className="uppercase text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 print:text-[7pt] print:px-1 print:py-0">
                {loan.peminjam.tipePeminjam}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1 print:pt-0.5 print:gap-0.5">
              <span className="text-slate-500">Nama:</span>
              <span className="col-span-2 font-semibold text-slate-900">{loan.peminjam.nama}</span>

              <span className="text-slate-500">{getIdentitasLabel(loan.peminjam.tipePeminjam)}:</span>
              <span className="col-span-2 font-semibold text-slate-800 tabular-nums">{loan.peminjam.nomorIdentitas}</span>

              <span className="text-slate-500">Unit / Prodi:</span>
              <span className="col-span-2 font-semibold text-slate-800">
                {loan.peminjam.unitAsal}
                {loan.peminjam.angkatan ? ` (${loan.peminjam.angkatan})` : ''}
              </span>

              <span className="text-slate-500">No. HP / WA:</span>
              <span className="col-span-2 font-semibold text-slate-800 tabular-nums">{loan.peminjam.noHp}</span>

              <span className="text-slate-500">Email:</span>
              <span className="col-span-2 font-semibold text-slate-800 truncate">{loan.peminjam.email}</span>
            </div>

            {/* Dosen Penanggung Jawab jika Mahasiswa */}
            {loan.penanggungJawab && (
              <div className="mt-2 pt-1.5 border-t border-slate-200/80 print:mt-1 print:pt-1">
                <span className="text-xs font-semibold text-indigo-900 block print:text-[7pt]">
                  Dosen Penanggung Jawab:
                </span>
                <p className="font-semibold text-slate-800 print:text-[7.5pt]">{loan.penanggungJawab.nama}</p>
                <p className="text-slate-500 text-xs print:text-[6.5pt]">NIP: <span className="tabular-nums">{loan.penanggungJawab.nip}</span></p>
              </div>
            )}
          </div>

          {/* Kolom 2: Keperluan & Jadwal */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between print-info-card">
            <div>
              <div className="font-semibold text-slate-900 text-sm border-b border-slate-200 pb-1.5 print:text-[8pt] print:pb-0.5">
                Keperluan & Jadwal Peminjaman
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1 print:pt-0.5 print:gap-0.5">
                <span className="text-slate-500">Jenis:</span>
                <span className="col-span-2 font-semibold text-slate-800">{formatJenisKeperluan(loan.jenisKeperluan)}</span>

                <span className="text-slate-500">Keperluan:</span>
                <span className="col-span-2 text-slate-700 italic">"{loan.keperluan}"</span>

                <span className="text-slate-500">Tgl Pinjam:</span>
                <span className="col-span-2 font-semibold text-slate-800 tabular-nums">{loan.tglPinjam}</span>

                <span className="text-slate-500">Batas Kembali:</span>
                <span className="col-span-2 font-semibold text-indigo-800 tabular-nums print:text-slate-900">{loan.tglRencanaKembali}</span>

                {loan.tglKembaliAktual && (
                  <>
                    <span className="text-slate-500">Tgl Aktual:</span>
                    <span className="col-span-2 font-semibold text-emerald-700 tabular-nums">{loan.tglKembaliAktual}</span>
                  </>
                )}
              </div>
            </div>

            {loan.catatanPengembalian && (
              <div className="mt-2 pt-1.5 border-t border-slate-200 text-xs bg-emerald-50/70 p-2 rounded-xl text-emerald-950 print:p-1 print:text-[7pt] print:mt-1">
                <span className="font-semibold">Catatan Pengembalian (Admin):</span>
                <p>{loan.catatanPengembalian}</p>
              </div>
            )}
          </div>
        </div>

        {/* 5. TABEL BARANG */}
        <div className="mb-8 print-items-section">
          <h4 className="text-xs font-semibold text-slate-800 mb-2 print:text-[7.5pt] print:mb-1">
            Daftar Peralatan Laboratorium ({loan.items.length} Barang)
          </h4>

          {/* Tampilan Layar Ponsel: Daftar Kartu Bertumpuk (Hidden on Print & Desktop) */}
          <div className="md:hidden print:hidden space-y-3 mb-4">
            {loan.items.map((it, idx) => (
              <div
                key={it.itemId || idx}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 tabular-nums inline-block">
                      {it.kodeAset}
                    </span>
                    <h5 className="font-semibold text-slate-900 mt-1 text-sm">{it.nama}</h5>
                    {(it.merek || it.model) && (
                      <p className="text-xs text-indigo-700 font-medium mt-0.5">
                        {[it.merek, it.model].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium tabular-nums shrink-0">#{idx + 1}</span>
                </div>

                {/* Kelengkapan */}
                {it.kelengkapan && it.kelengkapan.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">Kelengkapan:</span>
                    <div className="flex flex-wrap gap-1">
                      {it.kelengkapan.map((acc, aIdx) => {
                        const isReturned = it.kelengkapanKembali ? it.kelengkapanKembali.includes(acc) : true;
                        return (
                          <span
                            key={aIdx}
                            className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded border ${
                              loan.status === 'dikembalikan'
                                ? isReturned
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200 line-through'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {loan.status === 'dikembalikan' && !isReturned ? (
                              <Icon name="XCircle" size={12} className="mr-1 inline text-rose-600" />
                            ) : (
                              <Icon name="CheckCircle" size={12} className="mr-1 inline text-emerald-600" />
                            )}
                            {acc}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Kondisi Pinjam & Kembali */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Kondisi Pinjam</span>
                    <span className="font-semibold text-slate-800 capitalize">{it.kondisiPinjam}</span>
                  </div>
                  {loan.status === 'dikembalikan' && (
                    <div className="text-right">
                      <span className="text-slate-500 text-[11px] block">Kondisi Kembali</span>
                      <span className="font-semibold text-slate-800 capitalize">{it.kondisiKembali || '-'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Print: Tabel Asli (Hidden on mobile screen, ALWAYS visible on print) */}
          <div className="hidden md:block print:block border border-slate-200 rounded-xl overflow-hidden print:border-none print:rounded-none">
            <table className="w-full text-left text-xs print-table">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center print:w-7 print:text-center print:py-1">No</th>
                  <th className="py-2.5 px-3 w-28 print:w-20 print:py-1">Kode Aset</th>
                  <th className="py-2.5 px-3 print:py-1">Nama Barang</th>
                  <th className="py-2.5 px-3 print:py-1">Kelengkapan Paket</th>
                  <th className="py-2.5 px-3 w-28 print:w-20 print:py-1">Kondisi Pinjam</th>
                  {loan.status === 'dikembalikan' && (
                    <th className="py-2.5 px-3 w-28 print:w-20 print:py-1">Kondisi Kembali</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loan.items.map((it, idx) => (
                  <tr key={it.itemId || idx} className="hover:bg-slate-50/50 align-top">
                    <td className="py-2.5 px-3 text-center text-slate-500 tabular-nums print:text-center print:py-1">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 tabular-nums print:py-1 print:text-[7.5pt]">{it.kodeAset}</td>
                    <td className="py-2.5 px-3 print:py-1">
                      <p className="font-semibold text-slate-900 print:text-[8pt]">{it.nama}</p>
                      {(it.merek || it.model) && (
                        <p className="text-xs text-indigo-700 font-medium print:text-[7pt] print:text-slate-600">
                          {[it.merek, it.model].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 px-3 print:py-1">
                      {/* On-screen visual badge list */}
                      <div className="print:hidden flex flex-wrap gap-1">
                        {it.kelengkapan && it.kelengkapan.length > 0 ? (
                          it.kelengkapan.map((acc, aIdx) => {
                            const isReturned = it.kelengkapanKembali ? it.kelengkapanKembali.includes(acc) : true;
                            return (
                              <span
                                key={aIdx}
                                className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded border ${
                                  loan.status === 'dikembalikan'
                                    ? isReturned
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-rose-50 text-rose-800 border-rose-200 line-through'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {loan.status === 'dikembalikan' && !isReturned ? (
                                  <Icon name="XCircle" size={12} className="mr-1 inline text-rose-600" />
                                ) : (
                                  <Icon name="CheckCircle" size={12} className="mr-1 inline text-emerald-600" />
                                )}
                                {acc}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Unit standar</span>
                        )}
                      </div>

                      {/* Print mode: single line comma-separated text to save vertical space */}
                      <div className="hidden print:block text-[7.5pt] text-slate-800 leading-snug">
                        {it.kelengkapan && it.kelengkapan.length > 0
                          ? it.kelengkapan.join(', ')
                          : 'Unit standar'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 print:py-1">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold print:text-[7.5pt] print:p-0 print:border-none ${
                        it.kondisiPinjam === 'baik'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {it.kondisiPinjam === 'baik' ? 'Baik' : 'Perlu Cek'}
                      </span>
                    </td>
                    {loan.status === 'dikembalikan' && (
                      <td className="py-2.5 px-3 print:py-1">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold print:text-[7.5pt] print:p-0 ${
                          it.kondisiKembali === 'baik'
                            ? 'bg-emerald-50 text-emerald-700'
                            : it.kondisiKembali === 'perlu_cek'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {it.kondisiKembali === 'baik'
                            ? 'Baik'
                            : it.kondisiKembali === 'perlu_cek'
                            ? 'Perlu Cek'
                            : it.kondisiKembali === 'rusak'
                            ? 'Rusak'
                            : '-'}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. KETENTUAN SINGKAT (2 SAMPAI 3 BARIS, FONT 7.5PT) */}
        <div className="mb-10 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1 print-rules print-avoid-break">
          <p className="font-semibold text-slate-800 print:text-[7.5pt]">Ketentuan & Tanggung Jawab Peminjam:</p>
          <p className="print:text-[7.5pt] leading-relaxed">
            1. Peminjam wajib menjaga keutuhan, kebersihan, dan keselamatan seluruh perlengkapan yang dipinjam.<br />
            2. Keterlambatan pengembalian tanpa konfirmasi dikenakan sanksi tata tertib Lab FIT.<br />
            3. Kerusakan atau kehilangan perlengkapan menjadi tanggung jawab peminjam untuk mengganti unit yang setara.
          </p>
        </div>

        {/* 7. KOLOM TANDA TANGAN PEMINJAM DAN ADMIN (RUANG 15MM) */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs pt-4 border-t border-slate-200 print-signatures print-avoid-break">
          <div>
            <p className="text-slate-500 mb-1 print:text-[8pt]">Peminjam,</p>
            <div className="h-16 print-sig-space" />
            <p className="font-semibold text-slate-900 underline underline-offset-4 print:text-[8.5pt]">
              {loan.peminjam.nama}
            </p>
            <p className="text-slate-500 text-xs mt-0.5 print:text-[7pt]">
              {getIdentitasLabel(loan.peminjam.tipePeminjam)}: <span className="tabular-nums">{loan.peminjam.nomorIdentitas}</span>
            </p>
          </div>

          <div>
            <p className="text-slate-500 mb-1 print:text-[8pt]">
              Petugas / Laboran Lab FIT,
            </p>
            <div className="h-16 print-sig-space" />
            <p className="font-semibold text-slate-900 underline underline-offset-4 print:text-[8.5pt]">
              {loan.dikembalikanOleh || '( Laboran Lab FIT )'}
            </p>
            <p className="text-slate-500 text-xs mt-0.5 print:text-[7pt]">
              Unit Pengelola Laboratorium
            </p>
          </div>
        </div>

        {/* Print Document Footer */}
        <div className="hidden print:flex justify-between items-center text-[7pt] text-slate-400 pt-1.5 mt-2 border-t border-slate-200 print-footer">
          <span>PinjamIn • Sistem Peminjaman Alat Laboratorium FIT</span>
          <span>Dokumen Resmi — Hal. 1</span>
        </div>
      </div>

      {/* Tombol Cetak / Simpan PDF yang menempel di bawah pada ponsel (Hidden on Print & Desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.08)] no-print">
        <button
          onClick={handlePrint}
          className="w-full min-h-[48px] py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icon name="Printer" size={18} />
          <span>Cetak / Simpan PDF (A5)</span>
        </button>
      </div>
    </div>
  );
};
