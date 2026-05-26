import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// 1. CONFIGURAÇÃO DO MENSAGEIRO (Use sua URL do Firebase aqui)
const firebaseConfig = {
  databaseURL: "SUA_URL_DO_REALTIME_DATABASE_AQUI"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========================================================
// --- LÓGICA DO MONITOR (TV) - O que o público vê ---
// =========================================================
const MonitorTV = () => {
  const [status, setStatus] = useState({ mensagem: "AGUARDANDO SINAL...", cor: "#333", layout: "default" });

  useEffect(() => {
    // Escuta o caminho principal no Firebase
    const statusRef = ref(db, 'statusTV');
    onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setStatus(data);
    });
  }, []);

  return (
    <div style={{ background: status.cor, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '50px', textAlign: 'center' }}>
      <h1>SARAHTVLAN TV</h1>
      <h2>{status.mensagem}</h2>
      <p style={{fontSize: '16px', opacity: 0.5}}>Carapicuiba / SP</p>
    </div>
  );
};

// =========================================================
// --- LÓGICA DO PAINEL (Celular) - A interface "TOP" ---
// =========================================================
const PainelControle = () => {
  // Função para enviar o comando para o Firebase
  const enviarComando = (mensagem, corFundo, acaoType) => {
    set(ref(db, 'statusTV'), {
      mensagem: mensagem,
      cor: corFundo,
      layout: acaoType, // 'ao_vivo' ou 'intervalo'
      timestamp: Date.now()
    });
    console.log(`Comando '${mensagem}' enviado.`);
  };

  return (
    <div style={styles.controleContainer}>
      <header style={styles.header}>
        <span style={styles.cyanTitle}>SARAHTVLAN 🎛️ CONTROLE TÁTIL DE OSASCO</span>
      </header>

      <div style={styles.gridMain}>
        {/* CARTÃO 1 - AO VIVO (Neon Verde) */}
        <section style={{...styles.card, ...styles.cardGreen}}>
          <h2 style={styles.cardHeader}>🟢 Ao Vivo</h2>
          <div style={styles.cardBody}>
            <p>Sinal: Câmera Principal (menu suspenso)</p>
            {/* O CLIQUE AQUI ENVIA O COMANDO DE FATO */}
            <button 
              onClick={() => enviarComando("TRANSMISSÃO AO VIVO", "#39FF14", "ao_vivo")}
              style={styles.actionBtnGreen}>🔴 ENTRAR AO VIVO</button>
          </div>
        </section>

        {/* CARTÃO 2 - INTERVALO/MÚSICA (Neon Laranja) */}
        <section style={{...styles.card, ...styles.cardOrange}}>
          <h2 style={styles.cardHeader}>🎵 Intervalo/Música</h2>
          <div style={styles.cardBody}>
            <button 
              onClick={() => enviarComando("INTERVALO MUSICAL", "orange", "intervalo")}
              style={styles.actionBtnOrange}>🕒 MODO INTERVALO</button>
            <p>Volume: [Slider]</p>
            <p>Playlist: Mixagem Tarde 2026 (menu suspenso)</p>
          </div>
        </section>
      </div>

      <footer style={styles.footer}>
        <p>📡 Conexão Firebase: Ativa | SINAL OPERACIONAL DE OSASCO-XP</p>
      </footer>
    </div>
  );
};

// =========================================================
// --- DEFINIÇÃO DO ROTEADOR ---
// =========================================================
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rota para o Painel de Controle (Celular) */}
        <Route path="/controle" element={<PainelControle />} />
        
        {/* Rota para o Monitor (TV) - Página Inicial */}
        <Route path="/" element={<MonitorTV />} />
      </Routes>
    </Router>
  );
}

// =========================================================
// --- ESTILOS CSS (Gera a aparência TOP da imagem) ---
// =========================================================
const styles = {
  controleContainer: {
    background: '#121212',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
    padding: '20px',
  },
  header: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    borderBottom: '1px solid #333',
    paddingBottom: '10px',
  },
  cyanTitle: { color: '#00FFFF' },
  gridMain: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap', // Garante que se adapte ao celular
  },
  card: {
    flex: 1,
    minWidth: '300px',
    background: '#1a1a1a',
    borderRadius: '12px',
    border: '1px solid #333',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
  },
  cardGreen: { borderColor: '#39FF14', boxShadow: '0 0 20px rgba(57,255,20,0.2)' },
  cardOrange: { borderColor: 'orange', boxShadow: '0 0 20px rgba(255,165,0,0.2)' },
  cardHeader: {
    background: '#222',
    padding: '15px',
    fontSize: '18px',
    margin: 0,
    borderBottom: '1px solid #333',
  },
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  actionBtnGreen: {
    background: '#39FF14',
    color: '#000',
    border: 'none',
    padding: '15px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px',
    boxShadow: '0 0 15px rgba(57,255,20,0.4)',
  },
  actionBtnOrange: {
    background: 'orange',
    color: '#000',
    border: 'none',
    padding: '15px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px',
    boxShadow: '0 0 15px rgba(255,165,0,0.4)',
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#777',
    borderTop: '1px solid #333',
    paddingTop: '10px',
  }
};
