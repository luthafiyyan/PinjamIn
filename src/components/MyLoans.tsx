import React, { useEffect, useState } from 'react';
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

export const MyLoans: React.FC<MyLoansProps> = ({ onViewInvoice, onExploreCatalog }) => {
  const { currentUser } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Sort descending by tglPinjam or createdAt
        list.sort((a, b) => {
          const dateA = new Date(a.tglPinjam).getTime();
          const dateB = new Date(b.tglPinjam).getTime();
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

  const checkIsOverdue = (loan: Loan) => {
    if (loan.status !== 'dipinjam') return false;
    const deadline = new Date(loan.tglRencanaKembali).setHours(23, 59, 59, 999);
    return deadline < Date.now();
  };

  const getStatusBadge = (loan: Loan) => {
    if (loan.status === 'dikembalikan') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <Icon name="CheckCircle" size={16} className="text-emerald-600" />
          Dikembalikan
        </span>
      );
    }

    if (checkIsOverdue(loan)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
          <Icon name="ExclamationTriangle" size={16} className="text-rose-600" />
          Terlambat
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
        <Icon name="HourglassSplit" size={16} className="text-amber-600" />
        Dipinjam
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-bold tracking-normal text-slate-900">
            Riwayat Peminjaman Saya
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Daftar peralatan Laboratorium FIT yang sedang atau pernah Anda pinjam.
          </p>
        </div>

        <button
          onClick={onExploreCatalog}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Icon name="PlusLg" size={16} className="text-amber-400" />
          <span>Pinjam Alat Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-5 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Grid" size={32} />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            Belum ada riwayat peminjaman
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto font-normal">
            Anda belum pernah meminjam peralatan laboratorium FIT. Buka katalog untuk memilih kamera, tripod, atau perlengkapan lainnya.
          </p>
          <button
            onClick={onExploreCatalog}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-colors cursor-pointer"
          >
            Buka Katalog Peralatan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const isLate = checkIsOverdue(loan);

            return (
              <div
                key={loan.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 sm:p-6 shadow-sm hover:shadow-md ${
                  isLate
                    ? 'border-rose-300 ring-2 ring-rose-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200 tabular-nums">
                        {loan.noInvoice}
                      </span>
                      {getStatusBadge(loan)}
                    </div>
                    <p className="text-sm text-slate-600 font-normal">
                      Tujuan: <span className="font-semibold text-slate-800">{loan.keperluan}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block text-xs font-normal">Tgl Pinjam</span>
                      <span className="font-semibold text-slate-700 tabular-nums">{loan.tglPinjam}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs font-normal">Batas Kembali</span>
                      <span className={`font-semibold tabular-nums ${isLate ? 'text-rose-600' : 'text-slate-700'}`}>
                        {loan.tglRencanaKembali}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items borrowed */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 block">
                      Barang ({loan.items.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {loan.items.map((it, idx) => (
                        <div
                          key={it.itemId || idx}
                          className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-slate-700"
                        >
                          <span className="font-mono text-xs font-medium text-slate-600 tabular-nums">
                            {it.kodeAset}
                          </span>
                          <span className="font-medium text-slate-800">{it.nama}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onViewInvoice(loan.id)}
                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-indigo-600 text-white transition-colors cursor-pointer shrink-0 shadow-sm"
                  >
                    <Icon name="Receipt" size={16} />
                    <span>Lihat Invoice</span>
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
