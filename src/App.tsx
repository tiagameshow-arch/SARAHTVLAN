import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// --- COMPONENTE: A TELA DA TV (O que o público vê) ---
const TelaTV = () => {
  const [mensagem, setMensagem] = useState("AGUARDANDO SINAL...");
  const [corFundo, setCorFundo] = useState("#000");

  // Aqui no futuro conectaremos o Firebase para mudar o estado sozinho
  return (
    <div style={{ 
      background: corFundo, 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      color: '#39FF14',
      transition: 'all 0.5s ease'
    }}>
      <h2 style={{ fontSize: '20px', opacity: 0.5 }}>RETRANSMISSOR ATIVO</h2>
      <h1 style={{ fontSize: '60px', textAlign: 'center' }}>{mensagem}</h1>
    </div>
  );
};

// --- COMPONENTE: O PAINEL DE CONTROLE (O que você usa) ---
const PainelControle = () => {
  return (
    <div style={{ padding: '30px', background: '#1a1a1a', minHeight: '100vh', color: 'white' }}>
      <h1>🎛️ CONTROLE DE TRANSMISSÃO</h1>
      <hr />
      
      <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
        <h3>Comandos de Tela:</h3>
        <button style={btnStyle} onClick={() => alert('Enviando: TRANSMISSÃO AO VIVO')}>🔴 ENTRAR AO VIVO</button>
        <button style={btnStyle} onClick={() => alert('Enviando: PLAYLIST MUSICAL')}>🎵 ATIVAR PLAYLIST</button>
        <button style={{...btnStyle, background: 'red'}} onClick={() => alert('Enviando: FORA DO AR')}>⚠️ DESLIGAR SINAL</button>
      </div>

      <div style={{ marginTop: '40px', padding: '10px', background: '#333' }}>
        <p>Link da TV: <code>sarahtvlan.vercel.app/</code></p>
      </div>
    </div>
  );
};

// Estilo simples para os botões do controle
const btnStyle = {
  padding: '15px',
  fontSize: '18px',
  background: '#39FF14',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

// --- COMPONENTE PRINCIPAL (Roteador) ---
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TelaTV />} />
        <Route path="/controle" element={<PainelControle />} />
      </Routes>
    </Router>
  );
}
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// Substitua com as credenciais que o Firebase te der
const firebaseConfig = {
  databaseURL: "https://sarahtvlan-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- DENTRO DA TELA DA TV (Onde lê o dado) ---
useEffect(() => {
  const statusRef = ref(db, 'statusTV');
  onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    setMensagem(data.mensagem);
  });
}, []);

// --- DENTRO DO PAINEL DE CONTROLE (Onde escreve o dado) ---
const enviarComando = (novaMensagem) => {
  set(ref(db, 'statusTV'), { mensagem: novaMensagem });
};
