/* pages/LoginPage.js — halaman login/register vanilla JS */
export default function LoginPage() {
  const form = document.createElement('form');
  form.className = 'auth-card';
  form.innerHTML = `
    <h2>Login / Register</h2>
    <div id="auth-error" style="color: var(--error); margin-bottom: 16px; display: none;"></div>
    <input type="email" id="auth-email" placeholder="Email" required />
    <input type="password" id="auth-password" placeholder="Password" required />
    <button type="submit" class="btn">Masuk</button>
    <p style="margin-top: 16px; font-size: 13px; color: var(--muted);">
      Belum punya akun? <a href="#" onclick="mode='register'">Daftar</a> |
      Sudah punya akun? <a href="#" onclick="mode='login'">Masuk</a>
    </p>
    <button class="btn btn-secondary w-full" style="margin-top: 8px;" onclick="loginGoogle()">Masuk dengan Google</button>
  `;

  const errorDiv = form.querySelector('#auth-error');
  let mode = 'login';

  const setMode = (m) => { mode = m; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = form.querySelector('#auth-email').value;
    const password = form.querySelector('#auth-password').value;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sedang proses...';
    errorDiv.style.display = 'none';

    try {
      if (mode === 'login') {
        await window.supabase.auth.signInWithPassword({ email, password });
      } else {
        await window.supabase.auth.signUp({ email, password });
      }
      window.location.href = '/dashboard';
    } catch (err) {
      errorDiv.style.display = 'block';
      errorDiv.textContent = err.message || 'Gagal login/register';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Masuk';
    }
  };

  form.onsubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const loginGoogle = async () => {
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Sedang proses...';
    try {
      await window.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/auth/callback' }
      });
    } catch (err) {
      alert(err.message || 'Gagal login Google');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Masuk dengan Google';
    }
  };

  form.querySelector('button[type="submit"]').onclick = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  form.querySelector('a[onclick]').onclick = (e) => {
    e.preventDefault();
    setMode(e.target.getAttribute('onclick').includes('register') ? 'register' : 'login');
  };

  return form;
}