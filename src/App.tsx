import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { CompleteProfileModal } from './components/CompleteProfileModal';
import { PendingVerificationScreen } from './components/PendingVerificationScreen';
import { ItemCatalog } from './components/ItemCatalog';
import { MyLoans } from './components/MyLoans';
import { LoanModal } from './components/LoanModal';
import { Item } from './types';
import { Icon } from './components/Icon';
import { PinjamInIcon } from './components/PinjamInIcon';
import { MyProfile } from './components/MyProfile';

// Dimuat hanya saat dibutuhkan agar halaman awal (landing page) terbuka lebih cepat
const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const InvoiceView = lazy(() =>
  import('./components/InvoiceView').then((m) => ({ default: m.InvoiceView }))
);

const LazyFallback = () => (
  <div className="flex items-center justify-center py-20" role="status" aria-label="Memuat">
    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

function MainApp() {
  const { currentUser, profile, loading, isVerified, isAdmin, logout } = useAuth();
  
  // Navigation states
  const [currentTab, setCurrentTab] = useState<'katalog' | 'riwayat' | 'admin' | 'invoice' | 'profil'>('katalog');
  const [activeInvoiceLoanId, setActiveInvoiceLoanId] = useState<string | null>(null);
  const [unauthorizedMsg, setUnauthorizedMsg] = useState<string | null>(null);

  // Cart & detail states
  const [cart, setCart] = useState<Item[]>([]);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [activeDetailItem, setActiveDetailItem] = useState<Item | null>(null);

  // Menyimpan UID user yang sudah selesai ditentukan rute awalnya setelah login
  const resolvedUserUidRef = React.useRef<string | null>(null);

  // Handle URL hash and role-based initial route
  useEffect(() => {
    // 2. Selama status login masih dimuat (loading), jangan jalankan pengecekan admin
    // dan jangan tampilkan pesan penolakan apapun.
    if (loading) {
      return;
    }

    // Jika belum login, reset state referensi dan bersihkan hash jika ada sisa #admin
    if (!currentUser) {
      resolvedUserUidRef.current = null;
      if (window.location.hash.toLowerCase() === '#admin') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      setUnauthorizedMsg(null);
      return;
    }

    // 1. Halaman tujuan setelah login ditentukan SETELAH status login dan email selesai dimuat:
    // Cek apakah ini pertama kalinya rute ditentukan setelah user ini selesai login
    if (resolvedUserUidRef.current !== currentUser.uid) {
      resolvedUserUidRef.current = currentUser.uid;
      setUnauthorizedMsg(null);

      if (isAdmin) {
        // Admin diarahkan ke dashboard admin
        setCurrentTab('admin');
        window.location.hash = 'admin';
      } else {
        // Semua user lain langsung diarahkan ke katalog
        setCurrentTab('katalog');
        window.location.hash = 'katalog';
      }
      return;
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'admin') {
        if (!isAdmin) {
          window.location.hash = 'katalog';
          setCurrentTab('katalog');
          setUnauthorizedMsg('Anda tidak memiliki akses ke halaman ini.');
        } else {
          setUnauthorizedMsg(null);
          setCurrentTab('admin');
        }
      } else if (hash === 'profil') {
        setUnauthorizedMsg(null);
        setCurrentTab('profil');
      } else if (hash === 'riwayat') {
        setUnauthorizedMsg(null);
        setCurrentTab('riwayat');
      } else if (hash === 'katalog') {
        setUnauthorizedMsg(null);
        setCurrentTab('katalog');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser, isAdmin, loading]);

  // Protected navigation tab handler
  const handleSelectTab = (tab: 'katalog' | 'riwayat' | 'admin' | 'profil') => {
    setUnauthorizedMsg(null);
    if (tab === 'admin') {
      if (!isAdmin) {
        setCurrentTab('katalog');
        window.location.hash = 'katalog';
        return;
      }
    }
    setCurrentTab(tab);
    window.location.hash = tab;
  };

  // Cart handlers
  const handleToggleCart = (item: Item) => {
    if (cart.some((c) => c.id === item.id)) {
      setCart((prev) => prev.filter((c) => c.id !== item.id));
    } else {
      setCart((prev) => [...prev, item]);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleLogout = async () => {
    handleClearCart();
    await logout();
    window.location.hash = '';
  };

  const handleLoanSuccess = (loanId: string) => {
    setActiveInvoiceLoanId(loanId);
    setCurrentTab('invoice');
  };

  const handleViewInvoice = (loanId: string) => {
    setActiveInvoiceLoanId(loanId);
    setCurrentTab('invoice');
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <PinjamInIcon className="w-16 h-16 shadow-xl shadow-indigo-200 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-900">
          Pinjam<span className="text-amber-500">In</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Pinjam alat, tanpa ribet • Laboratorium FIT
        </p>
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mt-6" />
      </div>
    );
  }

  // 2. Not Logged In
  if (!currentUser) {
    return <LoginScreen />;
  }

  // 3. First time login: Profile not created yet (hanya wajib bagi peminjam non-admin)
  if (!profile && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar
          currentTab="katalog"
          setCurrentTab={() => {}}
          cartCount={0}
          openCart={() => {}}
          hideBottomNav={true}
          onLogout={handleLogout}
        />
        <CompleteProfileModal onLogout={handleLogout} />
      </div>
    );
  }

  // 4. Logged in but not verified (hanya berlaku bagi peminjam non-admin)
  if (!isVerified && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar
          currentTab="katalog"
          setCurrentTab={() => {}}
          cartCount={0}
          openCart={() => {}}
          hideBottomNav={true}
          onLogout={handleLogout}
        />
        <PendingVerificationScreen onLogout={handleLogout} />
      </div>
    );
  }

  // Sub-page header detection for mobile sticky header
  let subPageHeader: { title: string; onBack: () => void } | null = null;
  if (currentTab === 'invoice') {
    subPageHeader = {
      title: 'Bukti Peminjaman',
      onBack: () => {
        if (isAdmin) {
          handleSelectTab('admin');
        } else {
          handleSelectTab('riwayat');
        }
      },
    };
  } else if (isLoanModalOpen) {
    subPageHeader = {
      title: 'Form Peminjaman',
      onBack: () => setIsLoanModalOpen(false),
    };
  } else if (activeDetailItem) {
    subPageHeader = {
      title: 'Detail Alat',
      onBack: () => setActiveDetailItem(null),
    };
  }

  // 5. Normal Verified User / Admin
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleSelectTab}
        cartCount={cart.length}
        openCart={() => setIsLoanModalOpen(true)}
        subPageHeader={subPageHeader}
        onLogout={handleLogout}
      />

      {/* Unauthorized Notice Banner */}
      {unauthorizedMsg && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Icon name="ExclamationTriangle" size={16} className="text-white shrink-0" />
            <span>{unauthorizedMsg}</span>
          </div>
          <button
            onClick={() => setUnauthorizedMsg(null)}
            aria-label="Tutup pemberitahuan"
            title="Tutup pemberitahuan"
            className="p-1 hover:bg-rose-700 rounded-lg text-white/90 hover:text-white cursor-pointer"
          >
            <Icon name="XLg" size={16} />
          </button>
        </div>
      )}

      <main className="flex-1 pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-16">
        {currentTab === 'katalog' && (
          <ItemCatalog
            cart={cart}
            onToggleCart={handleToggleCart}
            onOpenCart={() => setIsLoanModalOpen(true)}
            detailItem={activeDetailItem}
            onSelectDetailItem={setActiveDetailItem}
          />
        )}

        {currentTab === 'riwayat' && (
          <MyLoans
            onViewInvoice={handleViewInvoice}
            onExploreCatalog={() => handleSelectTab('katalog')}
          />
        )}

        {currentTab === 'profil' && (
          <MyProfile
            onBackToCatalog={() => handleSelectTab('katalog')}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'admin' && (
          isAdmin ? (
            <Suspense fallback={<LazyFallback />}>
              <AdminDashboard onViewInvoice={handleViewInvoice} />
            </Suspense>
          ) : (
            <div className="max-w-md mx-auto p-8 text-center my-12 bg-white rounded-2xl border border-rose-200">
              <Icon name="ExclamationTriangle" size={24} className="text-rose-600 mx-auto mb-2" />
              <p className="font-bold text-slate-900">Akses Ditolak</p>
              <p className="text-xs text-slate-500 mt-1">Anda tidak memiliki akses ke halaman ini.</p>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={() => handleSelectTab('katalog')}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Kembali ke Katalog
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Icon name="BoxArrowRight" size={14} />
                  <span>Keluar / Ganti Akun</span>
                </button>
              </div>
            </div>
          )
        )}

        {currentTab === 'invoice' && activeInvoiceLoanId && (
          <Suspense fallback={<LazyFallback />}>
            <InvoiceView
              loanId={activeInvoiceLoanId}
              onBack={() => {
                if (isAdmin) {
                  handleSelectTab('admin');
                } else {
                  handleSelectTab('riwayat');
                }
              }}
            />
          </Suspense>
        )}
      </main>

      {/* Cart & Loan Form Modal */}
      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        cart={cart}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onSuccess={handleLoanSuccess}
      />

      {/* Screen Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">
              Pinjam<span className="text-amber-500">In</span>
            </span>
            <span>—</span>
            <span>Pinjam alat, tanpa ribet</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Laboratorium Fakultas Ilmu Terapan. Sistem Informasi Peminjaman Aset.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
