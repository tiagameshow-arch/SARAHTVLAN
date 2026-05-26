import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// 1. COMPONENTE DA TV (O que o monitor exibe)
const MonitorTV = () => {
  return (
    <div style={{ background: '#000', height: '100vh', color: '#39FF14', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '40px' }}>
      📺 TELA DA TV (Monitor)
    </div>
  );
};

// 2. COMPONENTE DO CONTROLE (O seu painel)
const PainelControle = () => {
  return (
    <div style={{ padding: '30px', background: '#333', minHeight: '100vh', color: '#fff' }}>
      <h1>🎛️ PAINEL DE CONTROLE</h1>
      <p>Use os botões abaixo para mudar a TV.</p>
      {/* SEUS BOTÕES DO FIREBASE VÃO AQUI */}
    </div>
  );
};

// 3. O ROTEADOR QUE SEPARA OS CAMINHOS
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Este é o caminho da TV (Página Inicial) */}
        <Route path="/" element={<MonitorTV />} />
        
        {/* Este é o caminho do CONTROLE (Admin) */}
        <Route path="/controle" element={<PainelControle />} />
      </Routes>
    </Router>
  );
}
