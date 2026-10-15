import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { PinjamInIcon } from './PinjamInIcon';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: 'katalog' | 'riwayat' | 'admin' | 'invoice' | 'profil';
  setCurrentTab: (tab: 'katalog' | 'riwayat' | 'admin' | 'profil') => void;
  cartCount: number;
  openCart: () => void;
  subPageHeader?: { title: string; onBack: () => void } | null;
  hideBottomNav?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  cartCount,
  openCart,
  subPageHeader,
  hideBottomNav = false,
  onLogout,
}) => {
  const { profile, currentUser, isAdmin, isVerified, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoutClick = () => {
    setProfileDropdownOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

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

  const displayName = profile?.nama || currentUser?.displayName || 'Pengguna';
  const initial = (displayName.trim()[0] || 'U').toUpperCase();

  return (
    <>
    <header
      className={`md:sticky md:top-0 z-40 no-print transition-all duration-200 ${
        isScrolled
          ? 'border-b border-slate-200/80 bg-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm'
          : 'border-b border-slate-200 bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[56px] md:h-16">
          {/* LEFT: Mobile Sub-page (Back + Title) OR Mobile Logo OR Desktop Logo */}
          <div className="flex items-center gap-2">
            {/* Mobile Sub-page Header (Detail Barang, Form Peminjaman, Invoice) */}
            {subPageHeader ? (
              <div className="flex md:hidden items-center gap-2">
                <button
                  type="button"
                  onClick={subPageHeader.onBack}
                  className="p-2 -ml-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Kembali"
                  title="Kembali"
                >
                  <Icon name="ArrowLeft" size={20} />
                </button>
                <h1 className="text-base font-bold text-slate-900 truncate">
                  {subPageHeader.title}
                </h1>
              </div>
            ) : (
              /* Mobile Main Logo (tagline disembunyikan) */
              <div
                className="flex md:hidden items-center gap-2.5 cursor-pointer"
                onClick={() => setCurrentTab('katalog')}
              >
                <PinjamInIcon className="w-8 h-8 shadow-sm shadow-indigo-200" />
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    Pinjam<span className="text-amber-500 font-extrabold">In</span>
                  </span>
                  <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/60 uppercase">
                    Lab FIT
                  </span>
                </div>
              </div>
            )}

            {/* Desktop Logo & Tagline (Always visible on md: and above) */}
            <div
              className="hidden md:flex items-center gap-3 cursor-pointer"
              onClick={() => setCurrentTab('katalog')}
            >
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
                <p className="text-xs text-slate-500 font-medium">
                  Pinjam alat, tanpa ribet
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('katalog')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'katalog'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon name="Grid" size={20} />
              Katalog Alat
            </button>

            {currentUser && isVerified && (
              <button
                onClick={() => setCurrentTab('riwayat')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'riwayat'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon name="ClockHistory" size={20} />
                Riwayat Saya
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/60'
                }`}
              >
                <Icon name="Speedometer2" size={20} className="text-amber-600" />
                Panel Admin
              </button>
            )}
          </nav>

          {/* Desktop Cart Button & Profile Dropdown (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2.5 sm:gap-3">
            {currentUser && isVerified && (
              <button
                onClick={openCart}
                className="relative items-center justify-center p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex"
                title="Keranjang Peminjaman"
                aria-label="Keranjang Peminjaman"
              >
                <Icon name="Bag" size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {currentUser ? (
              <div className="relative flex items-center gap-2.5 md:pl-2 md:border-l md:border-slate-200">
                {/* Trigger Button Avatar */}
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/20 focus:outline-none transition-all cursor-pointer min-h-[44px] min-w-[44px] justify-center"
                  aria-label="Menu profil pengguna"
                  aria-expanded={profileDropdownOpen}
                  title="Menu profil pengguna"
                >
                  {!photoError && currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={displayName}
                      onError={() => setPhotoError(true)}
                      className="w-9 h-9 rounded-full ring-2 ring-indigo-500/20 object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {initial}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />

                    <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {displayName}
                          </p>
                          {isAdmin ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase">
                              Admin
                            </span>
                          ) : (
                            getTipeBadge(profile?.tipePeminjam)
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      <div className="py-1">
                        {!isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab('profil');
                              setProfileDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors cursor-pointer min-h-[44px] ${
                              currentTab === 'profil'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                            }`}
                          >
                            <Icon name="Person" size={18} />
                            <span>Profil Saya</span>
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab('admin');
                              setProfileDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors cursor-pointer min-h-[44px] ${
                              currentTab === 'admin'
                                ? 'bg-amber-50 text-amber-800'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-amber-700'
                            }`}
                          >
                            <Icon name="Speedometer2" size={18} className="text-amber-600" />
                            <span>Panel Admin</span>
                          </button>
                        )}

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          type="button"
                          onClick={handleLogoutClick}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer min-h-[44px]"
                        >
                          <Icon name="BoxArrowRight" size={18} className="text-rose-600" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Bottom Navigation Bar (Disembunyikan di layar tertentu via hideBottomNav) */}
      {!hideBottomNav && (
        <nav
          aria-label="Navigasi Bawah Ponsel"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]"
        >
          <div className="flex items-center justify-around px-2 h-[56px]">
            {isAdmin ? (
              /* Bottom Nav untuk Admin: Admin, Katalog, Akun */
              <>
                {/* 1. Admin */}
                <button
                  type="button"
                  onClick={() => setCurrentTab('admin')}
                  className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 px-1 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'admin' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon name="Speedometer2" size={22} />
                  <span className="text-[11px] leading-tight mt-0.5">Admin</span>
                </button>

                {/* 2. Katalog */}
                <button
                  type="button"
                  onClick={() => setCurrentTab('katalog')}
                  className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 px-1 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'katalog' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon name="Grid" size={22} />
                  <span className="text-[11px] leading-tight mt-0.5">Katalog</span>
                </button>

                {/* 3. Akun */}
                <button
                  type="button"
                  onClick={() => setCurrentTab('profil')}
                  className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 px-1 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'profil' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon name="Person" size={22} />
                  <span className="text-[11px] leading-tight mt-0.5">Akun</span>
                </button>
              </>
            ) : (
              /* Bottom Nav untuk Peminjam: Katalog, Riwayat, Keranjang (badge), Profil */
              <>
                {/* 1. Katalog */}
                <button
                  type="button"
                  onClick={() => setCurrentTab('katalog')}
                  className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 px-1 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'katalog' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon name="Grid" size={22} />
                  <span className="text-[11px] leading-tight mt-0.5">Katalog</span>
                </button>

                {/* 2. Riwayat */}
                <button
                  type="button"
                  onClick={() => setCurrentTab('riwayat')}
                  className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 px-1 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'riwayat' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon name="ClockHistory" size={22} />
                  <span className="text-[11px] leading-tight mt-0.5">Riwayat</span>
                </button>

                {/* 3. Keranjang (dengan badge) */}
                <button
                  type="button"
                  onClick={openCart}
                  className="flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 px-1 rounded-xl text-slate-500 hover:text-slate-900 font-medium transition-colors cursor-pointer relative"
                >
                  <div className="relative">
                    <Icon name="Bag" size={22} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white font-bold text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] leading-tight mt-0.5">Keranjang</span>
                </button>

                {/* 4. Profil */}
                <button
                  type="button"
                  onClick={() => setCurrentTab('profil')}
                  className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 px-1 rounded-xl transition-colors cursor-pointer ${
                    currentTab === 'profil' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon name="Person" size={22} />
                  <span className="text-[11px] leading-tight mt-0.5">Profil</span>
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </>
  );
};
