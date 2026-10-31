import { initApp } from './config.js';
import { router } from './router.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initApp();
    router();
  } catch (e) {
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `<div class="card"><p>Error aplikasi: ${e.message}</p>
        <button onclick="window.location.reload()">Coba Lagi</button></div>`;
    }
  }
});