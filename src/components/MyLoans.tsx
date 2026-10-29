import React, { useEffect, useMemo, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { Icon } from './Icon';
import { db } from '../lib/firebase';
import { Loan } from '../types';
import { useAuth } from '../context/AuthContext';

interface MyLoansProps {
  onViewInvoice: (loanId: string) => void;
  onExploreCatalog: () => void;
}

type TabType = 'all' | 'active' | 'completed' | 'rejected';

export const MyLoans: React.FC<MyLoansProps> = ({ onViewInvoice, onExploreCatalog }) => {
  const { currentUser } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    // Realtime query for current user's loans
    const qLoans = query(
      collection(db, 'loans'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      qLoans,
      (snapshot) => {
        const list: Loan[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...(doc.data() as Omit<Loan, 'id'>) });
        });
        // Semua riwayat peminjaman tetap tampil dari yang terbaru dulu.
        list.sort((a, b) => {
          const dateA = new Date(a.tglPinjam || 0).getTime();
          const dateB = new Date(b.tglPinjam || 0).getTime();
          return dateB - dateA;
        });
        setLoans(list);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching my loans:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const checkIsOverdue = (loan: Loan) => {
    if (loan.status !== 'dipinjam') return false;
    const deadline = new Date(loan.tglRencanaKembali).setHours(23, 59, 59, 999);
    return deadline < Date.now();
  };

  // Metric counts
  const counts = useMemo(() => {
    const total = loans.length;
    let active = 0;
    let completed = 0;
    let rejected = 0;
    let overdue = 0;

    loans.forEach((loan) => {
      if (loan.status === 'dipinjam' || loan.status === 'disetujui' || loan.status === 'menunggu_persetujuan') {
        active += 1;
      } else if (loan.status === 'dikembalikan') {
        completed += 1;
      } else if (loan.status === 'ditolak') {
        rejected += 1;
      }

      if (checkIsOverdue(loan)) {
        overdue += 1;
      }
    });

    return { total, active, completed, rejected, overdue };
  }, [loans]);

  // Filtered loans based on tab and search
  const filteredLoans = useMemo(() => {
    const queryLower = searchQuery.trim().toLowerCase();

    return loans.filter((loan) => {
      // 1. Tab filter
      if (activeTab === 'active') {
        const isActive =
          loan.status === 'dipinjam' ||
          loan.status === 'disetujui' ||
          loan.status === 'menunggu_persetujuan';
        if (!isActive) return false;
      } else if (activeTab === 'completed') {
        if (loan.status !== 'dikembalikan') return false;
      } else if (activeTab === 'rejected') {
        if (loan.status !== 'ditolak') return false;
      }

      // 2. Search query filter
      if (queryLower) {
        const matchInvoice = loan.noInvoice?.toLowerCase().includes(queryLower);
        const matchKeperluan = loan.keperluan?.toLowerCase().includes(queryLower);
        const matchItems = loan.items?.some(
          (it) =>
            it.nama?.toLowerCase().includes(queryLower) ||
            it.kodeAset?.toLowerCase().includes(queryLower) ||
            it.merek?.toLowerCase().includes(queryLower)
        );

        if (!matchInvoice && !matchKeperluan && !matchItems) {
          return false;
        }
      }

      return true;
    });
  }, [loans, activeTab, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage) || 1;
  const displayedLoans = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLoans.slice(start, start + itemsPerPage);
  }, [filteredLoans, currentPage, itemsPerPage]);

  const getStatusBadge = (loan: Loan) => {
    if (loan.status === 'menunggu_persetujuan') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
          <Icon name="HourglassSplit" size={13} className="text-sky-600" />
          Menunggu Persetujuan
        </span>
      );
    }

    if (loan.status === 'disetujui') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
          <Icon name="CheckCircle" size={13} className="text-indigo-600" />
          Disetujui (Ambil di Lab)
        </span>
      );
    }

    if (loan.status === 'ditolak') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <Icon name="XCircle" size={13} className="text-rose-600" />
          Ditolak
        </span>
      );
    }

    if (loan.status === 'dikembalikan') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Icon name="CheckCircle" size={13} className="text-emerald-600" />
          Selesai (Dikembalikan)
        </span>
      );
    }

    if (checkIsOverdue(loan)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 animate-pulse">
          <Icon name="ExclamationTriangle" size={13} className="text-rose-600" />
          Terlambat
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <Icon name="HourglassSplit" size={13} className="text-amber-600" />
        Sedang Dipinjam
      </span>
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveTab('all');
    setCurrentPage(1);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Riwayat Peminjaman Saya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Pantau status barang yang sedang Anda bawa dan riwayat peminjaman laboratorium FIT.
          </p>
        </div>

        <button
          onClick={onExploreCatalog}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Icon name="PlusLg" size={16} className="text-amber-300" />
          <span>Pinjam Alat Baru</span>
        </button>
      </div>

      {/* 2. Quick Stat Metric Cards (Tampilkan jika ada data) */}
      {!loading && loans.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Sedang Aktif */}
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Aktif</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Icon name="HourglassSplit" size={14} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                {counts.active}
              </span>
              {counts.overdue > 0 && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  {counts.overdue} terlambat
                </span>
              )}
            </div>
          </button>

          {/* Card 2: Selesai */}
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Selesai</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Icon name="CheckCircle" size={14} />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                {counts.completed}
              </span>
            </div>
          </button>

          {/* Card 3: Ditolak */}
          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20'
                : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ditolak</span>
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <Icon name="XCircle" size={14} />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                {counts.rejected}
              </span>
            </div>
          </button>

          {/* Card 4: Total Semua */}
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-500/20'
                : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Icon name="Receipt" size={14} />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                {counts.total}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      {!loading && loans.length > 0 && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Filter Tabs (Horizontal scroll on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Semua <span className="ml-1 opacity-80 tabular-nums">({counts.total})</span>
            </button>

            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Aktif / Berjalan <span className="ml-1 opacity-80 tabular-nums">({counts.active})</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Selesai <span className="ml-1 opacity-80 tabular-nums">({counts.completed})</span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'rejected'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Ditolak <span className="ml-1 opacity-80 tabular-nums">({counts.rejected})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] md:max-w-xs w-full">
            <Icon
              name="Search"
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari invoice, nama alat, kode aset..."
              className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Hapus kata kunci"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <Icon name="XLg" size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Content Area */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-1/6" />
              </div>
              <div className="h-5 bg-slate-100 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : loans.length === 0 ? (
        /* Empty State: Belum pernah ada riwayat sama sekali */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Grid" size={32} />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            Belum ada riwayat peminjaman
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-xs mx-auto font-normal">
            Anda belum pernah meminjam peralatan laboratorium FIT. Buka katalog untuk memilih kamera, tripod, atau perlengkapan lainnya.
          </p>
          <button
            onClick={onExploreCatalog}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-colors cursor-pointer"
          >
            Buka Katalog Peralatan
          </button>
        </div>
      ) : filteredLoans.length === 0 ? (
        /* Empty State: Hasil Filter / Search Tidak Ditemukan */
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="Search" size={20} />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">
            Peminjaman tidak ditemukan
          </h4>
          <p className="text-xs text-slate-500 mb-4 font-normal leading-relaxed">
            Tidak ada peminjaman yang cocok dengan kata kunci <span className="font-semibold text-slate-700">"{searchQuery}"</span> atau filter yang dipilih.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Reset Filter & Pencarian
          </button>
        </div>
      ) : (
        /* 5. List Kartu Peminjaman (Struktur Kompak & Rapi) */
        <div className="space-y-3.5">
          {displayedLoans.map((loan) => {
            const isLate = checkIsOverdue(loan);

            return (
              <div
                key={loan.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 shadow-sm hover:shadow-md ${
                  isLate
                    ? 'border-rose-300 ring-2 ring-rose-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Kartu: No Invoice, Status, & Tanggal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 tabular-nums">
                      {loan.noInvoice}
                    </span>
                    {getStatusBadge(loan)}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-normal">
                    <span>
                      Pinjam: <strong className="font-semibold text-slate-700 tabular-nums">{loan.tglPinjam}</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>
                      Batas Kembali:{' '}
                      <strong className={`font-semibold tabular-nums ${isLate ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        {loan.tglRencanaKembali}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Konten Utama Kartu: Keperluan & Daftar Alat */}
                <div className="pt-3 pb-2">
                  <p className="text-xs text-slate-700 font-normal">
                    <span className="text-slate-400 font-medium">Keperluan:</span>{' '}
                    <span className="font-semibold text-slate-900">{loan.keperluan}</span>
                  </p>

                  {/* Alasan Penolakan Jika Ada */}
                  {loan.status === 'ditolak' && loan.alasanPenolakan && (
                    <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                      <Icon name="ExclamationTriangle" size={14} className="text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Catatan Penolakan:</span> {loan.alasanPenolakan}
                      </div>
                    </div>
                  )}

                  {/* Info Pengembalian Aktual Jika Selesai */}
                  {loan.status === 'dikembalikan' && loan.tglKembaliAktual && (
                    <p className="mt-1 text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                      <Icon name="CheckCircle" size={12} className="text-emerald-600" />
                      <span>Dikembalikan ke Lab pada: <strong className="tabular-nums">{loan.tglKembaliAktual}</strong></span>
                    </p>
                  )}

                  {/* Daftar Peralatan yang Dipinjam */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 mr-1">
                      Peralatan ({loan.items.length}):
                    </span>
                    {loan.items.map((it, idx) => (
                      <div
                        key={it.itemId || idx}
                        className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200/90 px-2 py-0.5 rounded-lg text-slate-800"
                      >
                        <span className="font-mono text-[10px] font-bold text-indigo-700 tabular-nums">
                          {it.kodeAset}
                        </span>
                        <span className="font-medium text-slate-900">{it.nama}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Kartu: Informasi Tindak Lanjut & Tombol Lihat Invoice */}
                <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 truncate">
                    {loan.status === 'menunggu_persetujuan' ? (
                      <span className="text-sky-700 font-medium flex items-center gap-1">
                        <Icon name="HourglassSplit" size={12} /> Sedang ditinjau oleh staf Laboratorium FIT
                      </span>
                    ) : loan.status === 'disetujui' ? (
                      <span className="text-indigo-700 font-medium flex items-center gap-1">
                        <Icon name="CheckCircle" size={12} /> Silakan datang ke Gedung Selaru Lt. 1 untuk serah terima
                      </span>
                    ) : loan.status === 'dipinjam' ? (
                      <span className={isLate ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {isLate ? '⚠️ Melewati batas waktu kembali. Segera hubungi Lab FIT!' : 'Alat sedang dalam tanggung jawab peminjam.'}
                      </span>
                    ) : loan.status === 'ditolak' ? (
                      <span className="text-slate-400">Peminjaman tidak disetujui</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Peminjaman telah selesai dikembalikan</span>
                    )}
                  </div>

                  {loan.status === 'disetujui' || loan.status === 'dipinjam' || loan.status === 'dikembalikan' ? (
                    <button
                      onClick={() => onViewInvoice(loan.id)}
                      className="min-h-[38px] inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-indigo-600 text-white transition-colors cursor-pointer shrink-0 shadow-sm"
                    >
                      <Icon name="Receipt" size={14} />
                      <span>Lihat Invoice</span>
                      <Icon name="ArrowRight" size={12} />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}

          {/* 6. Pagination Bar (Muncul jika ada lebih dari 1 halaman) */}
          {totalPages > 1 && (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-normal">
                Menampilkan <strong className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</strong> –{' '}
                <strong className="text-slate-800">
                  {Math.min(currentPage * itemsPerPage, filteredLoans.length)}
                </strong>{' '}
                dari <strong className="text-slate-800">{filteredLoans.length}</strong> peminjaman
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Sebelumnya
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
