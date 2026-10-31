import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { Role } from '../types';

export default function LoginPage() {
  const { user, login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [googleOpen, setGoogleOpen] = useState(false);
  const [gName, setGName] = useState('');
  const [gEmail, setGEmail] = useState('');
  const [gRole, setGRole] = useState<Role>('anggota');

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      await googleLogin(gName, gEmail, gRole);
      setGoogleOpen(false);
      navigate('/');
    } catch {
      setError('Gagal masuk dengan Google.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card card">
        <h1>TaskMate</h1>
        <p className="muted">Pengelola tugas mahasiswa. Masuk untuk melanjutkan.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@kampus.ac.id"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button className="btn btn-block" disabled={busy}>
            {busy ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
        <button className="btn btn-google btn-block" onClick={() => setGoogleOpen(true)}>
          Masuk dengan Google
        </button>
        <p className="muted small">
          Belum punya akun? <Link to="/register">Daftar</Link>
        </p>
        <p className="muted small">
          Demo — pengurus@demo.id / demo123 · anggota@demo.id / demo123
        </p>
      </div>

      {googleOpen && (
        <Modal title="Masuk dengan Google (demo)" onClose={() => setGoogleOpen(false)}>
          <p className="muted small">
            Simulasi OAuth Google — di produksi hubungkan Firebase/Supabase Auth
            (lihat README.md).
          </p>
          <form onSubmit={handleGoogle}>
            <div className="form-group">
              <label>Nama</label>
              <input
                required
                value={gName}
                onChange={(e) => setGName(e.target.value)}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="form-group">
              <label>Email Google</label>
              <input
                type="email"
                required
                value={gEmail}
                onChange={(e) => setGEmail(e.target.value)}
                placeholder="nama@gmail.com"
              />
            </div>
            <div className="form-group">
              <label>Peran (khusus akun baru)</label>
              <select
                value={gRole}
                onChange={(e) => {
                  // SAFETY: select only contains valid Role values.
                  setGRole(e.target.value as Role);
                }}
              >
                <option value="anggota">Anggota</option>
                <option value="pengurus">Pengurus</option>
              </select>
            </div>
            <button className="btn btn-block" disabled={busy}>
              {busy ? 'Memproses…' : 'Lanjutkan'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
