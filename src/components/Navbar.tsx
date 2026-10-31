import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applyTheme, type Theme } from '../lib/theme';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [theme, setTheme] = useState<Theme>(() => {
    // SAFETY: theme is initialized in main.tsx to 'light' or 'dark'.
    return (document.documentElement.dataset.theme as Theme) || 'dark';
  });

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <Link to="/" className="brand" onClick={closeMenu}>
        TaskMate
      </Link>
      <button
        type="button"
        className="btn btn-ghost btn-sm nav-toggle"
        aria-expanded={menuOpen}
        aria-controls="primary-nav"
        aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
        onClick={() => setMenuOpen((v) => !v)}
      >
        {menuOpen ? 'Tutup' : 'Menu'}
      </button>
      <div id="primary-nav" className={`nav-menu${menuOpen ? ' open' : ''}`}>
        <nav className="nav-links" aria-label="Navigasi utama">
          <Link to="/" onClick={closeMenu}>
            Dashboard
          </Link>
          <Link to="/tools" onClick={closeMenu}>
            Tools
          </Link>
        </nav>
        <div className="nav-user">
          <span className="badge">
            {user?.role === 'pengurus' ? 'Pengurus' : 'Anggota'}
          </span>
          <span className="muted">{user?.name}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm theme-toggle"
            onClick={toggleTheme}
            aria-label={`Ganti ke tema ${theme === 'dark' ? 'terang' : 'gelap'}`}
          >
            {theme === 'dark' ? 'Terang' : 'Gelap'}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              logout();
              closeMenu();
              navigate('/login');
            }}
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
