import { initApp } from './config.js';
import { router } from './router.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
  router();
});