import React, { useState } from 'react';
import { Camera, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
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
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Camera className="w-5 h-5" />
          </div>
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
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Sistem Peminjaman Mandiri
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Pinjam<span className="text-amber-500">In</span>
        </h1>
        <p className="text-base sm:text-lg font-medium text-indigo-900/80 mb-3">
          "Pinjam alat, tanpa ribet"
        </p>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
          Peminjaman kamera, tripod, lighting, audio, dan inventaris Lab FIT kini mudah, cepat, dan terdata secara digital.
        </p>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
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
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span className="text-sm">
            {loading ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}
          </span>
        </button>

        <p className="text-[11px] text-slate-400 mt-4">
          Gunakan email institusi atau akun Google aktif Anda untuk masuk.
        </p>

        {/* Feature Highlights */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 gap-2.5 text-left text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Katalog alat realtime & status ketersediaan</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verifikasi akun resmi (Mahasiswa, Dosen, Tendik)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
