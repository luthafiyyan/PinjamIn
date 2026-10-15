import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { PinjamInIcon } from './PinjamInIcon';
import { useAuth } from '../context/AuthContext';

/**
 * Informasi lab. Ganti nilai di bawah dengan data yang sebenarnya.
 * Selama masih berisi tanda [ISI ...], teks tersebut tampil apa adanya di halaman.
 */
const LAB_INFO = {
  lokasi: '[ISI LOKASI LAB: gedung dan ruangan]',
  jamLayanan: '[ISI JAM LAYANAN: hari dan jam]',
  kontakLabel: '[ISI NOMOR WHATSAPP / EMAIL LAB]',
  // Tautan kontak (opsional). Contoh: 'https://wa.me/628123456789' atau 'mailto:lab@kampus.ac.id'
  kontakHref: '',
};

const STEPS = [
  { title: 'Masuk dan lengkapi profil', desc: 'Masuk dengan akun Google, lalu isi data diri sesuai tipe peminjam.' },
  { title: 'Tunggu verifikasi admin', desc: 'Admin lab memeriksa data akun sebelum Anda dapat meminjam.' },
  { title: 'Pilih alat dan isi formulir', desc: 'Pilih alat yang tersedia, lalu isi keperluan dan tanggal pengembalian.' },
  { title: 'Ambil alat dan simpan invoice', desc: 'Invoice terbit otomatis dan dapat dicetak sebagai bukti peminjaman.' },
];

const CATEGORIES = [
  { name: 'Kamera', icon: 'Camera' },
  { name: 'Tripod', icon: 'Triangle' },
  { name: 'Gimbal', icon: 'ArrowsMove' },
  { name: 'Lighting', icon: 'Lightbulb' },
  { name: 'Audio', icon: 'Mic' },
  { name: 'Aksesori Kamera', icon: 'SdCard' },
  { name: 'Komputer & Laptop', icon: 'Laptop' },
  { name: 'Jaringan', icon: 'Router' },
  { name: 'VR/AR', icon: 'HeadsetVr' },
  { name: 'Presentasi', icon: 'Easel' },
  { name: 'Kabel & Konektor', icon: 'UsbPlug' },
];

const BORROWER_TYPES = [
  { name: 'Mahasiswa', icon: 'Mortarboard', desc: 'Untuk tugas kuliah, penelitian, dan kegiatan organisasi.' },
  { name: 'Dosen', icon: 'JournalBookmark', desc: 'Untuk pengajaran, penelitian, dan kegiatan akademik.' },
  { name: 'Tendik', icon: 'Briefcase', desc: 'Untuk kegiatan unit dan keperluan kerja.' },
];

const FAQS = [
  {
    q: 'Mengapa akun harus diverifikasi?',
    a: 'Verifikasi memastikan alat hanya dipinjam oleh mahasiswa, dosen, atau tendik yang terdaftar, sehingga setiap peminjaman dapat dipertanggungjawabkan.',
  },
  {
    q: 'Bagaimana jika alat terlambat dikembalikan?',
    a: 'Keterlambatan akan tercatat di sistem dan ditandai oleh admin. Ketentuan lebih lanjut mengikuti aturan Laboratorium FIT.',
  },
  {
    q: 'Bagaimana jika alat rusak atau hilang?',
    a: 'Segera laporkan kepada admin lab. Penanganannya mengikuti ketentuan Laboratorium FIT.',
  },
  {
    q: 'Apakah saya bisa meminjam lebih dari satu alat?',
    a: 'Bisa. Batas jumlah alat dan lama peminjaman berbeda untuk tiap tipe peminjam dan akan ditampilkan saat Anda mengisi formulir.',
  },
  {
    q: 'Siapa yang dihubungi jika ada kendala?',
    a: 'Hubungi admin lab melalui kontak yang tertera pada bagian Informasi lab di halaman ini.',
  },
];

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

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

  const sectionTitle = 'text-xl sm:text-2xl font-bold text-slate-900';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto h-14 sm:h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PinjamInIcon className="w-9 h-9 shadow-md shadow-indigo-200" />
            <div className="leading-tight">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Pinjam<span className="text-amber-500">In</span>
              </span>
              <span className="text-xs text-indigo-700 font-medium block">Laboratorium FIT</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600" aria-label="Navigasi halaman">
            <button type="button" onClick={() => scrollToSection('cara-meminjam')} className="px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer">
              Cara meminjam
            </button>
            <button type="button" onClick={() => scrollToSection('faq')} className="px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer">
              FAQ
            </button>
            <button type="button" onClick={() => scrollToSection('kontak')} className="px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer">
              Kontak
            </button>
          </nav>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="min-h-[44px] px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60 cursor-pointer transition-colors"
          >
            <Icon name="BoxArrowRight" size={16} className="rotate-180" />
            Masuk
          </button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-10 sm:pb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div>
              <h1 className="text-[28px] sm:text-4xl lg:text-[44px] leading-tight font-bold tracking-tight text-slate-900">
                Pinjam alat lab, <span className="text-indigo-600">tanpa ribet</span>
              </h1>
              <p className="mt-4 text-base text-slate-600 max-w-lg leading-relaxed">
                Peminjaman kamera, tripod, lighting, audio, dan perlengkapan lainnya di Laboratorium FIT kini dicatat
                secara digital.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
                {[
                  'Status ketersediaan alat terlihat langsung',
                  'Invoice peminjaman terbit otomatis',
                  'Untuk mahasiswa, dosen, dan tendik',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <Icon name="CheckCircle" size={18} className="text-emerald-600" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kartu masuk */}
            <div className="w-full max-w-md mx-auto lg:ml-auto bg-white rounded-3xl shadow-xl shadow-indigo-950/5 border border-slate-200/80 p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-amber-500" />
              <h2 className="text-lg font-semibold text-slate-900">Masuk ke PinjamIn</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">Pinjam alat, tanpa ribet</p>

              {errorMsg && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between gap-2 text-left">
                  <div className="flex items-center gap-2">
                    <Icon name="ExclamationTriangle" size={16} className="text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMsg(null)}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline shrink-0 cursor-pointer p-1"
                  >
                    Tutup
                  </button>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full min-h-[48px] flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-3 px-5 rounded-2xl border border-slate-300 shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon name="Google" size={20} className="text-slate-800" />
                )}
                <span className="text-sm">{loading ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}</span>
              </button>

              <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                Gunakan akun Google aktif Anda. Akun baru akan diverifikasi oleh admin lab sebelum dapat meminjam.
              </p>
            </div>
          </div>
        </section>

        {/* Cara meminjam */}
        <section id="cara-meminjam" className="bg-white border-y border-slate-200/70 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <h2 className={sectionTitle}>Cara meminjam</h2>
            <p className="text-sm text-slate-500 mt-1.5">Empat langkah dari masuk sampai invoice.</p>
            <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold inline-flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Alat yang tersedia */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h2 className={sectionTitle}>Alat yang tersedia</h2>
          <p className="text-sm text-slate-500 mt-1.5">Ketersediaan alat dapat dilihat setelah masuk.</p>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {CATEGORIES.map((c) => (
              <li
                key={c.name}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700"
              >
                <Icon name={c.icon} size={18} className="text-indigo-600" />
                {c.name}
              </li>
            ))}
          </ul>
        </section>

        {/* Siapa yang dapat meminjam */}
        <section className="bg-white border-y border-slate-200/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <h2 className={sectionTitle}>Siapa yang dapat meminjam</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {BORROWER_TYPES.map((b) => (
                <div key={b.name} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 inline-flex items-center justify-center">
                    <Icon name={b.icon} size={20} />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-900">{b.name}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Batas durasi dan jumlah barang berbeda untuk tiap tipe peminjam dan dapat dilihat saat mengisi formulir.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-mt-16">
          <h2 className={sectionTitle}>Pertanyaan umum</h2>
          <div className="mt-6 space-y-2.5">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-white border border-slate-200 open:shadow-sm">
                <summary className="flex items-center justify-between gap-3 min-h-[52px] px-5 py-3 cursor-pointer list-none text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Icon name="ChevronDown" size={16} className="text-slate-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Informasi lab */}
        <section id="kontak" className="bg-white border-t border-slate-200/70 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <h2 className={sectionTitle}>Informasi lab</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-5">
                <Icon name="GeoAlt" size={20} className="text-indigo-600" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">Lokasi</h3>
                <p className="mt-1 text-sm text-slate-600">{LAB_INFO.lokasi}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <Icon name="Clock" size={20} className="text-indigo-600" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">Jam layanan</h3>
                <p className="mt-1 text-sm text-slate-600">{LAB_INFO.jamLayanan}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <Icon name="Envelope" size={20} className="text-indigo-600" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">Kontak</h3>
                {LAB_INFO.kontakHref ? (
                  <a
                    href={LAB_INFO.kontakHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-indigo-700 underline underline-offset-2"
                  >
                    {LAB_INFO.kontakLabel}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-slate-600">{LAB_INFO.kontakLabel}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-slate-500 py-8 px-4">
        &copy; {new Date().getFullYear()} Laboratorium Fakultas Ilmu Terapan (FIT)
      </footer>
    </div>
  );
};
