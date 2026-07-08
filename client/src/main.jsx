import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3500,
                style: { background: '#1e1b4b', color: '#e0e7ff', border: '1px solid #4c1d95', borderRadius: '10px', fontSize: '14px' },
                success: { iconTheme: { primary: '#a78bfa', secondary: '#1e1b4b' } },
                error: { iconTheme: { primary: '#f87171', secondary: '#1e1b4b' } }
            }}
        />
    </React.StrictMode>
);
