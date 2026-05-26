import React, { useState } from 'react';

// Definimos o componente diretamente aqui
function PainelPrincipal() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#39FF14', background: '#000', minHeight: '100vh' }}>
      <h1>SARAHTVLAN OPERACIONAL</h1>
      <button 
        style={{ padding: '20px', fontSize: '24px', cursor: 'pointer' }}
        onClick={() => alert('O sistema está rodando!')}
      >
        ATIVAR MONITORAMENTO
      </button>
    </div>
  );
}

// O App chama o componente acima
export default function App() {
  return <PainelPrincipal />;
}
