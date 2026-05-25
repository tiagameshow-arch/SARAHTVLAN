import React, { useEffect, useState } from 'react';

// --- TELA DE MONITOR (TV) ---
const PainelMonitor = () => (
  <div style={{ background: '#000', color: '#39FF14', height: '100vh', display: 'flex', flexDirection: 'column', border: '4px solid #39FF14' }}>
    <header style={{ padding: '20px', textAlign: 'center', borderBottom: '2px solid #39FF14' }}>
      SARAHTV PRO - ESTAÇÃO DE MONITORAMENTO
    </header>
    <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>AGUARDANDO SINAL NA TV...</p>
    </div>
  </div>
);

// --- TELA DE CONTROLE (CELULAR) ---
const PainelControle = () => (
  <div style={{ background: '#111', color: '#fff', height: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
    <h1 style={{ color: '#39FF14' }}>CONTROLE REMOTO</h1>
    <button style={{ padding: '15px', background: '#39FF14', border: 'none', width: '100%', fontSize: '18px' }}>
      ENVIAR VÍDEO
    </button>
  </div>
);

// --- LÓGICA PRINCIPAL ---
export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  // Monitora mudanças de rota
  useEffect(() => {
    const onLocationChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  // Decisão de qual tela mostrar
  if (path === '/controle' || path.includes('/controle')) {
    return <PainelControle />;
  }

  return <PainelMonitor />;
}
