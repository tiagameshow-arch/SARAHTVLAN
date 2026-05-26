import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// 1. CONFIGURAÇÃO (Substitua pela URL do seu Firebase)
const firebaseConfig = {
  databaseURL: "https://sarahtvlan-default-rtdb.firebaseio.com/"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- TELA DO MONITOR (TV - O que o público vê) ---
// (Caminho: sarahtvlan.vercel.app/)
const MonitorTV = () => {
  const [status, setStatus] = useState({ mensagem: "AGUARDANDO SINAL...", cor: "#333", layout: "default" });

  useEffect(() => {
    const statusRef = ref(db, 'statusTV');
    onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setStatus(data);
    });
  }, []);

  return (
    <div style={{ background: status.cor, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '40px', fontFamily: 'monospace', textAlign: 'center' }}>
      <h1>SARAHTVLAN TV</h1>
      <h2>{status.mensagem}</h2>
      <p style={{fontSize: '16px', opacity: 0.5}}>Carapicuiba / SP</p>
    </div>
  );
};

// --- PAINEL DE CONTROLE (Admin - A aparência "TOP") ---
// (Caminho: sarahtvlan.vercel.app/controle)
const PainelControle = () => {
  const enviarComando = (msg, cor) => {
    set(ref(db, 'statusTV'), { mensagem: msg, cor: cor, timestamp: Date.now() });
  };

  return (
    <div style={styles.controleContainer}>
      <header style={styles.header}>
        <span style={styles.cyanTitle}>SARAHTVLAN</span> 
        <span style={styles.headerText}> 🎛️ Painel de Controle - Carapicuiba</span>
      </header>

      <div style={styles.gridMain}>
        {/* COLUNA ESQUERDA - MENU */}
        <aside style={styles.aside}>
          <button style={{...styles.asideBtn, ...styles.asideBtnActive}}>📺 TV Retransmissor</button>
          <button style={styles.asideBtn}>🎵 Playlist Musical</button>
          <button style={styles.asideBtn}>⚙️ Configurações</button>
        </aside>

        {/* COLUNA CENTRAL - CARTÕES DE COMANDO */}
        <main style={styles.mainContent}>
          {/* CARTÃO 1 - AO VIVO (Neon Verde) */}
          <section style={{...styles.card, ...styles.cardGreen}}>
            <h2 style={styles.cardHeader}>🟢 Ao Vivo</h2>
            <div style={styles.cardBody}>
              <p>Status: <span style={{color: '#39FF14'}}>Online</span></p>
              <button 
                onClick={() => enviarComando("TRANSMISSÃO AO VIVO", "#39FF14")}
                style={styles.actionBtnGreen}>🔴 ENTRAR AO VIVO</button>
              <p>Sinal: Câmera Principal (dropdown)</p>
            </div>
          </section>

          {/* CARTÃO 2 - INTERVALO/MÚSICA (Neon Laranja) */}
          <section style={{...styles.card, ...styles.cardOrange}}>
            <h2 style={styles.cardHeader}>🎵 Intervalo/Música</h2>
            <div style={styles.cardBody}>
              <button 
                onClick={() => enviarComando("INTERVALO MUSICAL", "orange")}
                style={styles.actionBtnOrange}>🕒 MODO INTERVALO</button>
              <p>Vol: [Slider]</p>
              <p>Playlist: Mixagem Tarde 2026 (dropdown)</p>
            </div>
          </section>
        </main>
      </div>

      <footer style={styles.footer}>
        <p>Conexão Firebase: <span style={{color: '#39FF14'}}>Ativa</span> | Vercel Deployment: sarahtvlan.vercel.app</p>
      </footer>
    </div>
  );
};

// --- DEFINIÇÃO DO ROTEADOR ---
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

// --- ESTILOS CSS (Gera a aparência TOP da imagem) ---
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
  headerText: { color: '#bbb', fontSize: '18px' },
  gridMain: {
    display: 'flex',
    gap: '20px',
  },
  aside: {
    width: '250px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  asideBtn: {
    background: 'none',
    border: '1px solid #444',
    color: '#aaa',
    padding: '15px',
    textAlign: 'left',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: '0.3s',
  },
  asideBtnActive: {
    borderColor: '#00FFFF',
    color: '#00FFFF',
    boxShadow: '0 0 10px rgba(0,255,255,0.3)',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
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
import { getDatabase, ref, onValue } from "firebase/database";
import ReactPlayer from 'react-player/youtube'; // Instale: npm install react-player

// ... dentro do componente da TV ...

useEffect(() => {
  const db = getDatabase();
  // Escuta o caminho específico deste monitor no Firebase
  const monitorRef = ref(db, `monitores/monitor1`);
  onValue(monitorRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.urlVideo) {
      // Quando o link do vídeo mudar, o player carrega o novo vídeo
      setUrlAtual(data.urlVideo);
    }
  });
}, []);

return (
  <div style={{ height: '100vh', width: '100vw' }}>
    <ReactPlayer
      url={urlAtual}
      playing // Reproduz automaticamente
      loop // Repete o vídeo
      controls={false} // Esconde os controles do YouTube
      width='100%'
      height='100%'
    />
  </div>
);
