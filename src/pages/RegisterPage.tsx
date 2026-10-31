import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<Role>('anggota');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setBusy(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pendaftaran gagal.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card card">
        <h1>Buat Akun</h1>
        <p className="muted">Daftar sebagai pengurus atau anggota.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama lengkap</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu" />
          </div>
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
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div className="form-group">
            <label>Konfirmasi password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ulangi password"
            />
          </div>
          <div className="form-group">
            <label>Daftar sebagai</label>
          </div>
          <div className="role-picker">
            <label className={`role-option ${role === 'pengurus' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                checked={role === 'pengurus'}
                onChange={() => setRole('pengurus')}
              />
              <strong>👑 Pengurus</strong>
              <span className="muted small">Buat ruang kelas &amp; tambah tugas</span>
            </label>
            <label className={`role-option ${role === 'anggota' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                checked={role === 'anggota'}
                onChange={() => setRole('anggota')}
              />
              <strong>🎓 Anggota</strong>
              <span className="muted small">Gabung kelas &amp; ceklis tugas</span>
            </label>
          </div>
          <button className="btn btn-block" disabled={busy}>
            {busy ? 'Memproses…' : 'Daftar'}
          </button>
        </form>
        <p className="muted small">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
