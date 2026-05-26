import React, { useEffect, useState } from 'react';

export default function App() {
  const [debug, setDebug] = useState("Iniciando...");

  useEffect(() => {
    try {
      console.log("App montado com sucesso!");
      setDebug("App montado - Carregando componentes...");
      // Se tiver alguma lógica de carregamento aqui, ela pode estar falhando
    } catch (error) {
      setDebug("Erro ao carregar: " + error);
      console.error(error);
    }
  }, []);

  return (
    <div style={{ color: '#39FF14', padding: '20px', fontFamily: 'monospace' }}>
      <h1>Retransmissor e TV de Sinalização</h1>
      <p>Status: {debug}</p>
      
      {/* TESTE DE RENDERIZAÇÃO: Se você ver isso abaixo, o React está funcionando */}
      <div style={{ border: '1px solid #39FF14', padding: '10px', marginTop: '20px' }}>
        <h2>Painel de Teste</h2>
        <button onClick={() => alert('Funcionou!')}>Clique aqui para testar</button>
      </div>
    </div>
  );
}
