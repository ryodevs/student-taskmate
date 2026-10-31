import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">✅ TaskMate</Link>
      <nav className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/tools">Tools</Link>
      </nav>
      <div className="nav-user">
        <span className="badge">
          {user?.role === 'pengurus' ? '👑 Pengurus' : '🎓 Anggota'}
        </span>
        <span className="muted">{user?.name}</span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
