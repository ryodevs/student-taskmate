/* router.js — simple SPA routing untuk vanilla JS dengan error handling */
export const router = async () => {
  const root = document.getElementById('root');
  if (!root) return;

  // Show loading state
  root.innerHTML = '<div class="card"><p>Memuat TaskMate...</p></div>';

  // Inisialisasi Supabase jika belum
  if (!window.supabase) {
    try {
      await (await import('./config.js')).initApp();
    } catch (e) {
      root.innerHTML = `<div class="card"><p>Error menginisialisasi Supabase: ${e.message}</p>
        <button onclick="window.location.reload()">Coba Lagi</button></div>`;
      return;
    }
  }

  // Periksa auth status
  let session;
  try {
    const { data: { session: s} } = await window.supabase.auth.getSession();
    session = s;
  } catch (e) {
    session = null;
  }
  const userRole = session?.user?.email?.includes('pengurus') ? 'admin' : 'member';

  // Redirect jika belum login ke halaman login
  if (!session) {
    root.innerHTML = '';
    const loginPage = (await import('./pages/LoginPage.js')).default;
    root.appendChild(loginPage());
    return;
  }

  // Routing berdasarkan pathname
  const pathname = window.location.pathname.replace(/^\/|\/$/g, '') || 'dashboard';
  
  const pages = {
    login:      import('./pages/LoginPage.js').then(m => m.default),
    dashboard:  import('./pages/DashboardPage.js').then(m => m.default),
    classroom:  import('./pages/ClassroomPage.js').then(m => m.default),
    tools:      import('./pages/ToolsPage.js').then(m => m.default),
    join:       import('./pages/JoinPage.js').then(m => m.default),
  };

  const PageComponent = pages[pathname] || pages.login;
  
  try {
    const page = await PageComponent;
    
    root.innerHTML = '';
    
    // Render header navigasi
    const header = document.createElement('header');
    header.innerHTML = `
      <nav>
        <a href="/">TaskMate</a>
        ${userRole === 'admin' ? `
          <a href="/dashboard">Dashboard</a>
          <a href="/classroom">Buat Kelas</a>
          <a href="/tools">Tools</a>
        ` : ''}
        <a href="#" onclick="window.supabase.auth.signOut()">Logout</a>
      </nav>
    `;
    root.appendChild(header);

    // Render main content
    const main = document.createElement('main');
    main.className = 'container';
    root.appendChild(main);

    // Panggil halaman dengan userRole
    page(main, userRole);
  } catch (e) {
    root.innerHTML = `<div class="card"><p>Error memuat halaman: ${e.message}</p>
        <button onclick="window.location.reload()">Coba Lagi</button></div>`;
  }
};