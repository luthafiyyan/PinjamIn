import React, { useState } from 'react';
import { 
  LogOut, 
  ShoppingBag, 
  Clock, 
  LayoutGrid, 
  Shield, 
  Menu, 
  X, 
  UserCheck 
} from 'lucide-react';
import { PinjamInIcon } from './PinjamInIcon';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: 'katalog' | 'riwayat' | 'admin' | 'invoice';
  setCurrentTab: (tab: 'katalog' | 'riwayat' | 'admin') => void;
  cartCount: number;
  openCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  cartCount,
  openCart,
}) => {
  const { profile, currentUser, isAdmin, isVerified, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getTipeBadge = (tipe?: string) => {
    switch (tipe) {
      case 'mahasiswa':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">Mahasiswa</span>;
      case 'dosen':
        return <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">Dosen</span>;
      case 'tendik':
        return <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium">Tendik</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('katalog')}>
            <PinjamInIcon className="w-10 h-10 shadow-md shadow-indigo-200" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Pinjam<span className="text-amber-500 font-extrabold">In</span>
                </span>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/60 uppercase">
                  Lab FIT
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                Pinjam alat, tanpa ribet
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('katalog')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'katalog'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Katalog Alat
            </button>

            {currentUser && isVerified && (
              <button
                onClick={() => setCurrentTab('riwayat')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'riwayat'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                Riwayat Saya
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'admin'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/60'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                Panel Admin
              </button>
            )}
          </nav>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {currentUser && isVerified && (
              <button
                onClick={openCart}
                className="relative flex items-center justify-center p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                title="Keranjang Peminjaman"
                aria-label="Keranjang Peminjaman"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="hidden lg:flex flex-col items-end text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 max-w-[130px] truncate">
                      {profile?.nama || currentUser.displayName || 'Pengguna'}
                    </span>
                    {getTipeBadge(profile?.tipePeminjam)}
                    {isAdmin && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                    {profile?.unitAsal || currentUser.email}
                  </span>
                </div>

                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-9 h-9 rounded-full ring-2 ring-indigo-500/20 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    {(profile?.nama || currentUser.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}

                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Keluar"
                  aria-label="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="py-2 mb-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-800">
              {profile?.nama || currentUser?.displayName}
            </p>
            <p className="text-xs text-slate-500">{currentUser?.email}</p>
          </div>
          <button
            onClick={() => {
              setCurrentTab('katalog');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'katalog' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Katalog Alat
          </button>
          {currentUser && isVerified && (
            <button
              onClick={() => {
                setCurrentTab('riwayat');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                currentTab === 'riwayat' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              Riwayat Peminjaman
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                setCurrentTab('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                currentTab === 'admin' ? 'bg-amber-50 text-amber-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-600" />
              Panel Administrator
            </button>
          )}
        </div>
      )}
    </header>
  );
};
