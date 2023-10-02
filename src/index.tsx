import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.scss';
import App from './App';
import { Analytics } from '@vercel/analytics/react';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
  
);
root.render(
  <React.StrictMode>
    <Analytics />
    <App />
  </React.StrictMode>
);
