import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// 1. CONFIGURAÇÃO (Cole os dados do seu painel Firebase aqui)
const firebaseConfig = {
  databaseURL: "SUA_URL_DO_REALTIME_DATABASE_AQUI"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- TELA DO MONITOR (TV) ---
const MonitorTV = () => {
  const [status, setStatus] = useState({ mensagem: "AGUARDANDO SINAL...", cor: "#333" });

  useEffect(() => {
    const statusRef = ref(db, 'statusTV');
    onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setStatus(data);
    });
  }, []);

  return (
    <div style={{ background: status.cor, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '50px' }}>
      {status.mensagem}
    </div>
  );
};

// --- PAINEL DE CONTROLE (Admin) ---
const PainelControle = () => {
  const enviarComando = (msg, cor) => {
    set(ref(db, 'statusTV'), { mensagem: msg, cor: cor });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Painel de Controle</h1>
      <button onClick={() => enviarComando("AO VIVO", "green")} style={{ padding: '20px', marginRight: '10px' }}>AO VIVO</button>
      <button onClick={() => enviarComando("INTERVALO", "orange")} style={{ padding: '20px' }}>INTERVALO</button>
      <button onClick={() => enviarComando("FORA DO AR", "red")} style={{ padding: '20px', marginLeft: '10px' }}>DESLIGAR</button>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MonitorTV />} />
        <Route path="/controle" element={<PainelControle />} />
      </Routes>
    </Router>
  );
}
