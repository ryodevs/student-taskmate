import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { seedDemo } from './lib/seed';
import { getInitialTheme } from './lib/theme';
import './styles/global.css';

document.documentElement.dataset.theme = getInitialTheme();

seedDemo();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
