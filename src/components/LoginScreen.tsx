import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { PinjamInIcon } from './PinjamInIcon';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Bersihkan hash URL saat berada di layar login agar sisa hash rute admin tidak tertinggal
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal masuk dengan akun Google. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Bar with Minimal Brand */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <PinjamInIcon className="w-10 h-10 shadow-md shadow-indigo-200" />
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Pinjam<span className="text-amber-500 font-extrabold">In</span>
            </span>
            <span className="text-xs text-indigo-700 font-medium block">Laboratorium FIT</span>
          </div>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline-block bg-white/70 px-3 py-1.5 rounded-full border border-slate-200/60 font-medium">
          Fakultas Ilmu Terapan
        </span>
      </div>

      {/* Main Hero Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-white rounded-3xl shadow-xl shadow-indigo-950/5 border border-slate-200/80 p-8 sm:p-10 text-center relative overflow-hidden">
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-amber-500" />
        
        {/* Brand Tagline Header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6">
          <Icon name="Stars" size={16} className="text-amber-500" />
          Sistem Peminjaman Mandiri
        </div>

        <h1 className="text-[22px] sm:text-[28px] font-bold tracking-normal text-slate-900 mb-2">
          Pinjam<span className="text-amber-500">In</span>
        </h1>
        <p className="text-sm sm:text-base font-medium text-slate-700 mb-3">
          "Pinjam alat, tanpa ribet"
        </p>
        <p className="text-sm font-normal text-slate-500 max-w-sm mx-auto mb-8 leading-normal">
          Peminjaman kamera, tripod, lighting, audio, dan inventaris Lab FIT kini mudah, cepat, dan terdata secara digital.
        </p>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 text-left">
            <Icon name="ExclamationTriangle" size={16} className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-3.5 px-5 rounded-2xl border border-slate-300 shadow-sm hover:shadow transition-all group disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icon name="Google" size={20} className="text-slate-800" />
          )}
          <span className="text-sm">
            {loading ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}
          </span>
        </button>

        <p className="text-xs text-slate-500 mt-4 font-normal">
          Gunakan email institusi atau akun Google aktif Anda untuk masuk.
        </p>

        {/* Feature Highlights */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 gap-2.5 text-left text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={16} className="text-emerald-600 shrink-0" />
            <span>Katalog alat realtime & status ketersediaan</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={16} className="text-emerald-600 shrink-0" />
            <span>Verifikasi akun resmi (Mahasiswa, Dosen, Tendik)</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={16} className="text-emerald-600 shrink-0" />
            <span>Invoice digital & bukti peminjaman cetak PDF</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 max-w-sm mx-auto">
        &copy; {new Date().getFullYear()} Laboratorium Fakultas Ilmu Terapan (FIT). Dilindungi Hak Cipta.
      </footer>
    </div>
  );
};
