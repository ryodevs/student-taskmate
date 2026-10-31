/* pages/DashboardPage.js — halaman dashboard utama */
export default function DashboardPage() {
  const main = document.createElement('main');
  
  // Check if user is logged in
  if (!window.supabase || !window.supabase.auth || !window.supabase.auth.getSession) {
    window.location.href = '/login';
    return main;
  }

  const { data: { session} } = await window.supabase.auth.getSession();
  if (!session) {
    window.location.href = '/login';
    return main;
  }

  main.innerHTML = `
    <section class="section">
      <h1>Dashboard</h1>
      <p>Selamat datang di TaskMate</p>
      <div class="grid gap-4">
        <div class="card stat-card">
          <h3>3</h3>
          <p>Kelas Aktif</p>
        </div>
        <div class="card stat-card">
          <h3>12</h3>
          <p>Tugas Aktif</p>
        </div>
        <div class="card stat-card">
          <h3>85%</h3>
          <p>Progress</p>
        </div>
      </div>
    </section>
    <section class="section">
      <h2>Kelas Terbaru</h2>
      <div class="grid gap-4">
        <div class="card">
          <h3>Kelas Fisika</h3>
          <p>Kode: KELAS1</p>
          <button class="btn btn-secondary btn-sm">Masuk</button>
        </div>
        <div class="card">
          <h3>Kelas Matematika</h3>
          <p>Kode: KELAS2</p>
          <button class="btn btn-secondary btn-sm">Masuk</button>
        </div>
      </div>
    </section>
  `;
  
  return main;
}