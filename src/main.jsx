import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#11161d',
          color: '#e5e7eb',
          border: '1px solid #1f2937',
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: '10px',
          padding: '10px 14px',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#11161d' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#11161d' } },
      }}
    />
  </AuthProvider>
);
