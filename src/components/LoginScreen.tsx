import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { PinjamInIcon } from './PinjamInIcon';
import { useAuth } from '../context/AuthContext';
import '../landing.css';

/**
 * Informasi lab. Ubah nilai di bawah jika ada perubahan lokasi, jam layanan, atau kontak.
 */
const LAB_INFO = {
  lokasi: 'Gedung Selaru Lantai 1, Fakultas Ilmu Terapan, Telkom University',
  jamLayanan: [
    'Senin–Kamis: 08.00 – 16.30 WIB',
    "Jum'at: 08.00 – 17.00 WIB",
  ],
  kontakLabel: 'WhatsApp 0851-7208-8181',
  // Tautan kontak (opsional). Format WhatsApp: 'https://wa.me/' + nomor berawalan 62 tanpa angka 0 di depan.
  kontakHref: 'https://wa.me/6285172088181',
};

const STEPS = [
  { title: 'Masuk dan lengkapi profil', desc: 'Masuk dengan akun Google, lalu isi data diri sesuai tipe peminjam.' },
  { title: 'Tunggu verifikasi admin', desc: 'Admin lab memeriksa data akun sebelum Anda dapat meminjam.' },
  { title: 'Pilih alat dan isi formulir', desc: 'Pilih alat yang tersedia, lalu isi keperluan dan tanggal pengembalian.' },
  { title: 'Ambil alat dan simpan invoice', desc: 'Invoice terbit otomatis dan dapat dicetak sebagai bukti peminjaman.' },
];

const CATEGORIES = [
  { name: 'Kamera', icon: 'Camera', tone: 't1' },
  { name: 'Tripod', icon: 'Triangle', tone: 't2' },
  { name: 'Gimbal', icon: 'ArrowsMove', tone: 't3' },
  { name: 'Lighting', icon: 'Lightbulb', tone: 't4' },
  { name: 'Audio', icon: 'Mic', tone: 't1' },
  { name: 'Aksesori Kamera', icon: 'SdCard', tone: 't2' },
  { name: 'Komputer & Laptop', icon: 'Laptop', tone: 't3' },
  { name: 'Jaringan', icon: 'Router', tone: 't4' },
  { name: 'VR/AR', icon: 'HeadsetVr', tone: 't1' },
  { name: 'Presentasi', icon: 'Easel', tone: 't2' },
  { name: 'Kabel & Konektor', icon: 'UsbPlug', tone: 't3' },
  { name: 'Lainnya', icon: 'ThreeDots', tone: 't4' },
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

  // Tombol masuk yang menempel di ponsel: tampil setelah tombol hero lewat, sembunyi saat penutup terlihat
  const heroCtaRef = useRef<HTMLButtonElement>(null);
  const closeCtaRef = useRef<HTMLButtonElement>(null);
  const [heroPassed, setHeroPassed] = useState(false);
  const [closeVisible, setCloseVisible] = useState(false);

  useEffect(() => {
    // Bersihkan hash URL saat berada di layar login agar sisa hash rute admin tidak tertinggal
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const heroEl = heroCtaRef.current;
    const closeEl = closeCtaRef.current;
    const heroObs = new IntersectionObserver(([e]) => {
      setHeroPassed(!e.isIntersecting && e.boundingClientRect.top < 0);
    });
    const closeObs = new IntersectionObserver(([e]) => setCloseVisible(e.isIntersecting));
    if (heroEl) heroObs.observe(heroEl);
    if (closeEl) closeObs.observe(closeEl);
    return () => {
      heroObs.disconnect();
      closeObs.disconnect();
    };
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

  const loginContent = (
    <>
      {loading ? (
        <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon name="Google" size={20} />
      )}
      {loading ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}
    </>
  );

  return (
    <div className="lp">
      {/* HERO */}
      <div className="lp-hero">
        <div className="wrap">
          <header className="lp-header">
            <div className="brand">
              <PinjamInIcon className="logo" />
              <div>
                <b>
                  Pinjam<i>In</i>
                </b>
                <small>Laboratorium FIT</small>
              </div>
            </div>
            <nav className="lp-nav" aria-label="Navigasi halaman">
              <button type="button" onClick={() => scrollToSection('cara-meminjam')}>Cara meminjam</button>
              <button type="button" onClick={() => scrollToSection('faq')}>FAQ</button>
              <button type="button" onClick={() => scrollToSection('kontak')}>Kontak</button>
            </nav>
            <button type="button" className="btn-top" onClick={handleLogin} disabled={loading}>
              <Icon name="BoxArrowRight" size={16} className="rotate-180" />
              Masuk
            </button>
          </header>

          <div className="hero-grid">
            <div>
              <h1>
                Pinjam alat lab, <em>tanpa ribet</em>
              </h1>
              <p className="lead">
                Peminjaman kamera, tripod, lighting, audio, dan perlengkapan lainnya di Laboratorium FIT kini dicatat
                secara digital.
              </p>

              {errorMsg && (
                <div
                  role="alert"
                  className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between gap-2 text-left"
                >
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

              <button ref={heroCtaRef} type="button" className="lp-cta" onClick={handleLogin} disabled={loading}>
                {loginContent}
              </button>
              <p className="hint">Akun baru diverifikasi oleh admin lab sebelum dapat meminjam.</p>
              <div className="pills">
                <span><Icon name="CheckCircle" size={13} />Status alat terlihat langsung</span>
                <span><Icon name="CheckCircle" size={13} />Invoice otomatis</span>
                <span><Icon name="CheckCircle" size={13} />Mahasiswa, dosen, tendik</span>
              </div>
            </div>

            {/* Mockup ponsel (dekoratif) */}
            <div className="phone-wrap" aria-hidden="true">
              <div className="phone">
                <div className="screen">
                  <div className="s-top"><b>Katalog Alat</b><span className="av" /></div>
                  <div className="s-search"><Icon name="Search" size={12} />Cari alat atau kode aset</div>
                  <div className="chips">
                    <span className="on">Semua</span><span>Kamera</span><span>Tripod</span><span>Gimbal</span>
                  </div>
                  <div className="cards">
                    {[
                      { icon: 'Camera', code: 'CAM-001', ok: false, brand: 'Sony • A6400', name: 'Sony Alpha A6400' },
                      { icon: 'ArrowsMove', code: 'GBL-001', ok: true, brand: 'DJI • Ronin RS3', name: 'DJI Ronin RS3 Gimbal' },
                      { icon: 'Mic', code: 'MIC-001', ok: true, brand: 'Saramonic • Blink 500', name: 'Saramonic Blink 500 B2' },
                      { icon: 'Triangle', code: 'TRP-001', ok: true, brand: 'Manfrotto', name: 'Tripod Manfrotto' },
                    ].map((c) => (
                      <div className="card" key={c.code}>
                        <div className="ph">
                          <Icon name={c.icon} size={30} />
                          <span className="code">{c.code}</span>
                          <span className={`badge ${c.ok ? 'b-ok' : 'b-no'}`}>
                            <Icon name={c.ok ? 'CheckCircle' : 'HourglassSplit'} size={8} />
                            {c.ok ? 'Tersedia' : 'Dipinjam'}
                          </span>
                        </div>
                        <div className="t"><small>{c.brand}</small><b>{c.name}</b></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main>
        {/* Cara meminjam + pratinjau invoice */}
        <section id="cara-meminjam" className="lp-sec" style={{ scrollMarginTop: 8 }}>
          <div className="wrap">
            <div className="steps-grid">
              <div>
                <div className="eyebrow">Cara meminjam</div>
                <h2>Empat langkah, dari masuk sampai invoice</h2>
                <ol className="timeline" style={{ listStyle: 'none' }}>
                  {STEPS.map((s, i) => (
                    <li className="step" key={s.title}>
                      <div className="num">{i + 1}</div>
                      <div>
                        <h3>{s.title}</h3>
                        <p>{s.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="inv" aria-hidden="true">
                <div className="inv-h">
                  <div>
                    <b>Pinjam<i>In</i></b>
                    <small>Pinjam alat, tanpa ribet · Laboratorium FIT</small>
                  </div>
                  <div className="no"><strong>PIN-20261015-001</strong>15 Okt 2026</div>
                </div>
                <div className="inv-r">
                  <div>Peminjam<b>Nama Peminjam</b>Mahasiswa</div>
                  <div>Batas kembali<b>18 Okt 2026</b>Keperluan: Tugas kuliah</div>
                </div>
                <table>
                  <thead>
                    <tr><th>Kode</th><th>Alat</th><th>Kondisi</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>CAM-001</td><td>Sony Alpha A6400</td><td>Baik</td></tr>
                    <tr><td>TRP-001</td><td>Tripod Manfrotto</td><td>Baik</td></tr>
                  </tbody>
                </table>
                <div className="sig"><div>Peminjam</div><div>Admin</div></div>
                <span className="stamp">INVOICE TERBIT</span>
              </div>
            </div>
          </div>
        </section>

        {/* Kategori */}
        <section className="lp-sec cats">
          <div className="wrap">
            <div className="eyebrow">Alat yang tersedia</div>
            <h2>Dari kamera sampai kabel</h2>
            <ul className="tiles" style={{ listStyle: 'none' }}>
              {CATEGORIES.map((c) => (
                <li key={c.name} className={`tile ${c.tone}`}>
                  <Icon name={c.icon} size={26} />
                  {c.name}
                </li>
              ))}
            </ul>
            <p className="note">Ketersediaan alat dapat dilihat setelah masuk.</p>
          </div>
        </section>

        {/* Siapa yang dapat meminjam */}
        <section className="lp-sec">
          <div className="wrap">
            <div className="eyebrow">Untuk siapa</div>
            <h2>Siapa yang dapat meminjam</h2>
            <div className="who">
              {BORROWER_TYPES.map((b) => (
                <div className="w" key={b.name}>
                  <div className="ic"><Icon name={b.icon} size={20} /></div>
                  <div>
                    <b>{b.name}</b>
                    <p>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="note">Batas durasi dan jumlah barang berbeda untuk tiap tipe peminjam.</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="lp-sec" style={{ paddingTop: 0, scrollMarginTop: 8 }}>
          <div className="wrap faq-wrap">
            <div className="eyebrow">FAQ</div>
            <h2>Pertanyaan umum</h2>
            <div className="faq">
              {FAQS.map((f, i) => (
                <details className="q" key={f.q} open={i === 0}>
                  <summary>
                    {f.q}
                    <Icon name="ChevronDown" size={14} />
                  </summary>
                  <p className="a">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Informasi lab */}
        <section id="kontak" className="lp-sec cats" style={{ paddingTop: 44, scrollMarginTop: 0 }}>
          <div className="wrap">
            <div className="eyebrow">Informasi lab</div>
            <h2>Temui kami</h2>
            <div className="info">
              <div className="i">
                <div className="ic"><Icon name="GeoAlt" size={19} /></div>
                <div><b>Lokasi</b><p>{LAB_INFO.lokasi}</p></div>
              </div>
              <div className="i">
                <div className="ic"><Icon name="Clock" size={19} /></div>
                <div>
                  <b>Jam layanan</b>
                  <p>
                    {LAB_INFO.jamLayanan.map((baris, idx) => (
                      <React.Fragment key={baris}>
                        {idx > 0 && <br />}
                        {baris}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>
              <div className="i">
                <div className="ic"><Icon name="Telephone" size={19} /></div>
                <div>
                  <b>Kontak</b>
                  {LAB_INFO.kontakHref ? (
                    <a href={LAB_INFO.kontakHref} target="_blank" rel="noopener noreferrer">
                      {LAB_INFO.kontakLabel}
                    </a>
                  ) : (
                    <p>{LAB_INFO.kontakLabel}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Penutup */}
      <div className="lp-close">
        <div className="wrap">
          <h2>Siap meminjam alat?</h2>
          <p>Masuk dengan akun Google dan mulai dalam hitungan menit.</p>
          <button ref={closeCtaRef} type="button" className="lp-cta" onClick={handleLogin} disabled={loading}>
            {loginContent}
          </button>
        </div>
      </div>
      <footer className="lp-foot">&copy; {new Date().getFullYear()} Laboratorium Fakultas Ilmu Terapan (FIT)</footer>

      {/* Tombol masuk menempel (ponsel) */}
      <div className={`lp-bar${heroPassed && !closeVisible ? ' show' : ''}`} aria-hidden={!(heroPassed && !closeVisible)}>
        <button type="button" className="lp-cta" onClick={handleLogin} disabled={loading} tabIndex={heroPassed && !closeVisible ? 0 : -1}>
          {loginContent}
        </button>
      </div>
    </div>
  );
};
