import React, { useState } from 'react';

// 1. O seu painel de controle (código original)
const PainelPrincipal = () => {
  return (
    <div style={{ color: '#39FF14', padding: '20px', fontFamily: 'monospace', textAlign: 'center' }}>
      <h1>SARAHTVLAN - PAINEL OPERACIONAL</h1>
      <div style={{ marginTop: '50px' }}>
        <button 
          style={{ padding: '20px 40px', fontSize: '20px', background: '#39FF14', border: 'none', cursor: 'pointer' }}
          onClick={() => alert('Sistema de Controle Ativo!')}
        >
          INICIAR MONITORAMENTO
        </button>
      </div>
    </div>
  );
};

// 2. O componente App que encapsula tudo
export default function App() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <PainelPrincipal />
    </div>
  );
}
