import React, { useEffect, useState } from 'react';
import { 
  doc, 
  getDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Camera, 
  ShieldCheck, 
  Calendar 
} from 'lucide-react';
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
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex items-center justify-between gap-4 mb-6 no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-8 sm:p-12 print-card">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black tracking-tight text-slate-950">
                Pinjam<span className="text-amber-500">In</span>
              </span>
              <span className="text-slate-400 font-light text-xl">|</span>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                Laboratorium FIT
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 italic">
              "Pinjam alat, tanpa ribet"
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Fakultas Ilmu Terapan • Gedung Selaru Lt. 1 • WA: 0851-7208-8181
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Bukti Peminjaman Alat
            </span>
            <span className="font-mono text-base font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200 inline-block mt-1">
              {loan.noInvoice}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Tanggal Terbit: <span className="font-semibold text-slate-800">{loan.tglPinjam}</span>
            </p>
          </div>
        </div>

        {/* Status Callout (Screen & Print) */}
        <div className="mb-6 flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Status Peminjaman:</span>
            {loan.status === 'dikembalikan' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Sudah Dikembalikan
              </span>
            ) : isOverdue ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Terlambat Pengembalian
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Sedang Dipinjam (Aktif)
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            Batas Kembali: <span className="font-bold text-slate-900">{loan.tglRencanaKembali}</span>
          </div>
        </div>

        {/* Peminjam Data & Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs">
          {/* Box 1: Data Peminjam */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>Data Peminjam</span>
              <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                {loan.peminjam.tipePeminjam}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1">
              <span className="text-slate-500">Nama:</span>
              <span className="col-span-2 font-semibold text-slate-800">{loan.peminjam.nama}</span>

              <span className="text-slate-500">{getIdentitasLabel(loan.peminjam.tipePeminjam)}:</span>
              <span className="col-span-2 font-semibold text-slate-800">{loan.peminjam.nomorIdentitas}</span>

              <span className="text-slate-500">Unit / Prodi:</span>
              <span className="col-span-2 font-semibold text-slate-800">{loan.peminjam.unitAsal}</span>

              {loan.peminjam.angkatan && (
                <>
                  <span className="text-slate-500">Angkatan:</span>
                  <span className="col-span-2 font-semibold text-slate-800">{loan.peminjam.angkatan}</span>
                </>
              )}

              <span className="text-slate-500">No. HP / WA:</span>
              <span className="col-span-2 font-semibold text-slate-800">{loan.peminjam.noHp}</span>

              <span className="text-slate-500">Email:</span>
              <span className="col-span-2 font-semibold text-slate-800 truncate">{loan.peminjam.email}</span>
            </div>

            {/* Penanggung Jawab untuk Mahasiswa */}
            {loan.penanggungJawab && (
              <div className="mt-3 pt-2 border-t border-slate-200/80">
                <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block mb-1">
                  Dosen Penanggung Jawab:
                </span>
                <p className="font-semibold text-slate-800">{loan.penanggungJawab.nama}</p>
                <p className="text-slate-500 text-[11px]">NIP: {loan.penanggungJawab.nip}</p>
              </div>
            )}
          </div>

          {/* Box 2: Detail Keperluan & Jadwal */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5">
                Keperluan & Jadwal
              </div>
              <div className="grid grid-cols-3 gap-1 pt-2">
                <span className="text-slate-500">Jenis:</span>
                <span className="col-span-2 font-semibold text-slate-800">{formatJenisKeperluan(loan.jenisKeperluan)}</span>

                <span className="text-slate-500">Deskripsi:</span>
                <span className="col-span-2 text-slate-700 italic">"{loan.keperluan}"</span>

                <span className="text-slate-500">Tgl Pinjam:</span>
                <span className="col-span-2 font-semibold text-slate-800">{loan.tglPinjam}</span>

                <span className="text-slate-500">Batas Kembali:</span>
                <span className="col-span-2 font-bold text-indigo-700">{loan.tglRencanaKembali}</span>

                {loan.tglKembaliAktual && (
                  <>
                    <span className="text-slate-500">Tgl Aktual Kembali:</span>
                    <span className="col-span-2 font-bold text-emerald-700">{loan.tglKembaliAktual}</span>
                  </>
                )}
              </div>
            </div>

            {loan.catatanPengembalian && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] bg-emerald-50/70 p-2 rounded-xl text-emerald-950">
                <span className="font-bold">Catatan Pengembalian (Admin):</span>
                <p>{loan.catatanPengembalian}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabel Barang Dipinjam */}
        <div className="mb-8">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Daftar Peralatan Laboratorium
          </h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 w-28">Kode Aset</th>
                  <th className="py-2.5 px-3">Nama Alat</th>
                  <th className="py-2.5 px-3">Kelengkapan Paket</th>
                  <th className="py-2.5 px-3 w-32">Kondisi Pinjam</th>
                  {loan.status === 'dikembalikan' && (
                    <th className="py-2.5 px-3 w-32">Kondisi Kembali</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loan.items.map((it, idx) => (
                  <tr key={it.itemId || idx} className="hover:bg-slate-50/50 align-top">
                    <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{it.kodeAset}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-900">{it.nama}</p>
                      {(it.merek || it.model) && (
                        <p className="text-[10px] text-indigo-700 font-medium">
                          {[it.merek, it.model].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {it.kelengkapan && it.kelengkapan.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {it.kelengkapan.map((acc, aIdx) => {
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
                                {loan.status === 'dikembalikan' && !isReturned ? '✗ ' : '✓ '}
                                {acc}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Unit standar</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        it.kondisiPinjam === 'baik'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {it.kondisiPinjam === 'baik' ? 'Baik' : 'Perlu Cek'}
                      </span>
                    </td>
                    {loan.status === 'dikembalikan' && (
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
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

        {/* Ketentuan Singkat Peminjaman */}
        <div className="mb-10 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">Ketentuan & Tanggung Jawab Peminjam:</p>
          <ol className="list-decimal pl-4 space-y-0.5">
            <li>Peminjam wajib menjaga keutuhan, kebersihan, dan keselamatan seluruh perlengkapan yang dipinjam.</li>
            <li>Keterlambatan pengembalian tanpa konfirmasi dikenakan sanksi/denda administratif sesuai tata tertib Lab FIT.</li>
            <li>Kerusakan atau kehilangan peralatan menjadi tanggung jawab peminjam untuk mengganti sesuai unit yang sama atau yang setara.</li>
          </ol>
        </div>

        {/* Kolom Tanda Tangan */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs pt-4 border-t border-slate-200">
          <div>
            <p className="text-slate-500 mb-16">Peminjam,</p>
            <p className="font-bold text-slate-900 underline underline-offset-4">
              {loan.peminjam.nama}
            </p>
            <p className="text-slate-500 text-[10px] mt-0.5">
              {getIdentitasLabel(loan.peminjam.tipePeminjam)}: {loan.peminjam.nomorIdentitas}
            </p>
          </div>

          <div>
            <p className="text-slate-500 mb-16">
              Petugas / Laboran Lab FIT,
            </p>
            <p className="font-bold text-slate-900 underline underline-offset-4">
              {loan.dikembalikanOleh || '( Laboran Lab FIT )'}
            </p>
            <p className="text-slate-500 text-[10px] mt-0.5">
              Unit Pengelola Laboratorium
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
