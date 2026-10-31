import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { seedDemo } from './lib/seed';
import './styles/global.css';

seedDemo();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
