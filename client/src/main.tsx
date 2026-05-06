import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { PusherProvider } from './context/PusherContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PusherProvider>
        <App />
      </PusherProvider>
    </BrowserRouter>
  </React.StrictMode>
);
