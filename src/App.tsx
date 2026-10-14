import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { CompleteProfileModal } from './components/CompleteProfileModal';
import { PendingVerificationScreen } from './components/PendingVerificationScreen';
import { ItemCatalog } from './components/ItemCatalog';
import { MyLoans } from './components/MyLoans';
import { LoanModal } from './components/LoanModal';
import { InvoiceView } from './components/InvoiceView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Item } from './types';
import { AlertCircle, X } from 'lucide-react';
import { PinjamInIcon } from './components/PinjamInIcon';

function MainApp() {
  const { currentUser, profile, loading, isVerified, isAdmin } = useAuth();
  
  // Navigation states
  const [currentTab, setCurrentTab] = useState<'katalog' | 'riwayat' | 'admin' | 'invoice'>('katalog');
  const [activeInvoiceLoanId, setActiveInvoiceLoanId] = useState<string | null>(null);
  const [unauthorizedMsg, setUnauthorizedMsg] = useState<string | null>(null);

  // Cart state
  const [cart, setCart] = useState<Item[]>([]);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  // Handle URL hash and role-based initial route
  useEffect(() => {
    if (!currentUser) return;

    const checkHashAndSetTab = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'admin') {
        if (!isAdmin) {
          window.location.hash = 'katalog';
          setCurrentTab('katalog');
          setUnauthorizedMsg('Anda tidak memiliki akses ke halaman ini.');
        } else {
          setCurrentTab('admin');
        }
      } else if (hash === 'riwayat') {
        setCurrentTab('riwayat');
      } else if (hash === 'katalog') {
        setCurrentTab('katalog');
      } else {
        // Default routing upon login
        if (isAdmin && currentTab === 'katalog') {
          setCurrentTab('admin');
          window.location.hash = 'admin';
        }
      }
    };

    checkHashAndSetTab();

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'admin' && !isAdmin) {
        window.location.hash = 'katalog';
        setCurrentTab('katalog');
        setUnauthorizedMsg('Anda tidak memiliki akses ke halaman ini.');
      } else if (hash === 'admin' && isAdmin) {
        setCurrentTab('admin');
      } else if (hash === 'riwayat' || hash === 'katalog') {
        setCurrentTab(hash as 'katalog' | 'riwayat');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser, isAdmin]);

  // Protected navigation tab handler
  const handleSelectTab = (tab: 'katalog' | 'riwayat' | 'admin') => {
    if (tab === 'admin') {
      if (!isAdmin) {
        setCurrentTab('katalog');
        window.location.hash = 'katalog';
        setUnauthorizedMsg('Anda tidak memiliki akses ke halaman ini.');
        return;
      }
    }
    setUnauthorizedMsg(null);
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
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
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
        />
        <CompleteProfileModal />
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
        />
        <PendingVerificationScreen />
      </div>
    );
  }

  // 5. Normal Verified User / Admin
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleSelectTab}
        cartCount={cart.length}
        openCart={() => setIsLoanModalOpen(true)}
      />

      {/* Unauthorized Notice Banner */}
      {unauthorizedMsg && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{unauthorizedMsg}</span>
          </div>
          <button
            onClick={() => setUnauthorizedMsg(null)}
            className="p-1 hover:bg-rose-700 rounded-lg text-white/90 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1 pb-16">
        {currentTab === 'katalog' && (
          <ItemCatalog
            cart={cart}
            onToggleCart={handleToggleCart}
            onOpenCart={() => setIsLoanModalOpen(true)}
          />
        )}

        {currentTab === 'riwayat' && (
          <MyLoans
            onViewInvoice={handleViewInvoice}
            onExploreCatalog={() => handleSelectTab('katalog')}
          />
        )}

        {currentTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard onViewInvoice={handleViewInvoice} />
          ) : (
            <div className="max-w-md mx-auto p-8 text-center my-12 bg-white rounded-2xl border border-rose-200">
              <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-2" />
              <p className="font-bold text-slate-900">Akses Ditolak</p>
              <p className="text-xs text-slate-500 mt-1">Anda tidak memiliki akses ke halaman ini.</p>
              <button
                onClick={() => handleSelectTab('katalog')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Kembali ke Katalog
              </button>
            </div>
          )
        )}

        {currentTab === 'invoice' && activeInvoiceLoanId && (
          <InvoiceView
            loanId={activeInvoiceLoanId}
            onBack={() => setCurrentTab('riwayat')}
          />
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
