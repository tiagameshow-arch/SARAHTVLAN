import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- TELA DE MONITOR (TV) ---
const PainelMonitor = () => (
  <div style={{ background: '#000', color: '#39FF14', height: '100vh', border: '4px solid #39FF14' }}>
    <header style={{ padding: '20px', textAlign: 'center', borderBottom: '2px solid #39FF14' }}>
      SARAHTV PRO - MODO MONITOR
    </header>
    <div style={{ padding: '20px' }}>AGUARDANDO SINAL NA TV...</div>
  </div>
);

// --- TELA DE CONTROLE (CELULAR) ---
const PainelControle = () => (
  <div style={{ background: '#111', color: '#fff', height: '100vh', padding: '20px' }}>
    <h1 style={{ color: '#39FF14' }}>CONTROLE REMOTO</h1>
    <button style={{ padding: '15px', background: '#39FF14', width: '100%' }}>
      ENVIAR VÍDEO
    </button>
  </div>
);

// --- ROTEADOR ---
export default function App() {
  return (
    <BrowserRouter basename="/SARAHTVLAN">
      <Routes>
        <Route path="/" element={<PainelMonitor />} />
        <Route path="/controle" element={<PainelControle />} />
      </Routes>
    </BrowserRouter>
  );
}
