import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update } from "firebase/database";
import ReactPlayer from "react-player/youtube";

// =========================================================
// 1. CONFIGURAÇÃO FIREBASE (Substitua pela sua URL real)
// =========================================================
const firebaseConfig = {
  databaseURL: "https://sarahtvlan-default-rtdb.firebaseio.com/" // Cole sua URL aqui
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========================================================
// 2. COMPONENTE MONITOR TV (CARAPICUIBA)
// =========================================================
// Este código roda nas TVs e escuta os comandos de Osasco
const MonitorTV = () => {
  const { idMonitor } = useParams(); // Pega o ID da URL (ex: M10Café)
  const [videoUrl, setVideoUrl] = useState("");
  const [config, setConfig] = useState({ volume: 65, mutar: false, rotacao: 0 });

  useEffect(() => {
    // 2.1 Escuta o Vídeo Atual do Monitor
    const videoRef = ref(db, `monitores/${idMonitor}/urlVideo`);
    onValue(videoRef, (snapshot) => {
      const url = snapshot.val();
      if (url) setVideoUrl(url);
    });

    // 2.2 Escuta as Configurações de Hardware (Volume, Giro)
    const configRef = ref(db, `monitores/${idMonitor}/config`);
    onValue(configRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setConfig(data);
    });
  }, [idMonitor]);

  return (
    <div style={{...styles.tvContainer, transform: `rotate(${config.rotacao}deg)`}}>
      <ReactPlayer
        url={videoUrl}
        playing={true}
        volume={config.mutar ? 0 : config.volume / 100}
        width="100%"
        height="100%"
        controls={false} // Interface limpa, sem controles do YT
        style={styles.videoStyle}
      />
      {/* Overlay discreto de identificação (Neon Cyan) */}
      <div style={styles.tvOverlay}>
        SARAHTVLAN | {idMonitor} | {config.rotacao}° | VOL: {config.mutar ? 'MUTADO' : config.volume + '%'}
      </div>
    </div>
  );
};

// =========================================================
// 3. COMPONENTE PAINEL DE CONTROLE (OSASCO)
// =========================================================
// Esta é a interface que você já está vendo (simplificada para o exemplo)
const PainelControle = () => {
  const [volume, setVolume] = useState(65);
  const [mutar, setMutar] = useState(false);
  const [rotacao, setRotacao] = useState(0);
  const monitorId = "M10Café"; // Fixado para este monitor

  // Função para enviar os comandos de volume/hardware
  const enviarHardware = (novosDados) => {
    update(ref(db, `monitores/${monitorId}/config`), novosDados);
  };

  const handleMutar = () => {
    const novoMutar = !mutar;
    setMutar(novoMutar);
    enviarHardware({ mutar: novoMutar });
  };

  const handleRotacao = () => {
    const novaRotacao = (rotacao + 90) % 360;
    setRotacao(novaRotacao);
    enviarHardware({ rotacao: novaRotacao });
  };

  return (
    <div style={styles.adminContainer}>
      <header style={styles.adminHeader}>
        <div style={styles.brand}>SARAHTVLAN</div>
        <div style={styles.remoteStatus}>📡 SINAL ONLINE - Osasco Remote Hub</div>
      </header>
      
      <main style={styles.adminMain}>
        <section style={styles.panelSection}>
          <h2 style={styles.sectionTitle}>M10 Café - Sala de Espera</h2>
          <div style={styles.card}>
            <div style={styles.inputGroup}>
              <label>Nome do Monitor:</label>
              <input type="text" value="M10 Café - Sala de Espera" style={styles.inputText} />
              <button style={styles.btnSave}>SALVAR</button>
            </div>
            
            <div style={styles.hardwareControls}>
              <h3>Ajustes Rápidos de Hardware</h3>
              <div style={styles.sliderGroup}>
                <label>Volume: [{volume}%]</label>
                <input 
                  type="range" min="0" max="100" value={volume} 
                  onChange={(e) => {
                    const vol = parseInt(e.target.value);
                    setVolume(vol);
                    enviarHardware({ volume: vol });
                  }} 
                  style={styles.slider} 
                />
              </div>
              <div style={styles.btnGroup}>
                <button onClick={handleMutar} style={mutar ? styles.btnActionMutado : styles.btnAction}>
                  {mutar ? '🔈 ATIVAR SOM' : '🔇 MUTAR'}
                </button>
                <button onClick={handleRotacao} style={styles.btnAction}>🔄 VIRAR TELA ({rotacao}°)</button>
              </div>
            </div>
          </div>
        </section>

        {/* Área de Visualização para Teste (Neon Cyan) */}
        <section style={styles.panelSection}>
          <h2 style={styles.sectionTitle}>Visualização Remota (TV)</h2>
          <div style={styles.previewCard}>
            <MonitorTV /> {/* Incorpora a TV na mesma tela para teste */}
          </div>
        </section>
      </main>
    </div>
  );
};

// =========================================================
// 4. ESTILOS (A ESTÉTICA NEON TOP)
// =========================================================
const styles = {
  // Estilos da TV (neon cyan)
  tvContainer: { background: '#000', height: '100%', width: '100%', overflow: 'hidden', position: 'relative', border: '2px solid #00FFFF', boxShadow: '0 0 15px rgba(0,255,255,0.5)' },
  videoStyle: { position: 'absolute', top: 0, left: 0 },
  tvOverlay: { position: 'absolute', bottom: 10, left: 10, color: '#00FFFF', background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' },
  
  // Estilos do Painel (dark)
  adminContainer: { background: '#111', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' },
  adminHeader: { display: 'flex', justifyContent: 'space-between', padding: '15px 30px', background: '#000', borderBottom: '1px solid #333' },
  brand: { fontSize: '20px', fontWeight: 'bold', color: '#fff' },
  remoteStatus: { color: '#39FF14', fontSize: '12px' },
  
  adminMain: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', padding: '30px' },
  panelSection: { display: 'flex', flexDirection: 'column', gap: '15px' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', borderLeft: '3px solid #00FFFF', paddingLeft: '10px' },
  
  card: { background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333' },
  previewCard: { background: '#000', padding: '0', borderRadius: '12px', overflow: 'hidden', height: '100%' },
  
  inputGroup: { display: 'flex', gap: '10px', marginBottom: '20px' },
  inputText: { flex: 1, padding: '10px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px' },
  btnSave: { background: '#FFC107', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  
  hardwareControls: { display: 'flex', flexDirection: 'column', gap: '15px' },
  sliderGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  slider: { width: '100%', accentColor: '#39FF14' },
  
  btnGroup: { display: 'flex', gap: '10px' },
  btnAction: { flex: 1, padding: '12px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '8px', cursor: 'pointer' },
  btnActionMutado: { flex: 1, padding: '12px', background: '#FFC107', border: 'none', color: '#000', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};

// =========================================================
// 5. ROTEADOR
// =========================================================
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/controle" element={<PainelControle />} />
        <Route path="/:idMonitor" element={<MonitorTV />} />
        <Route path="/" element={<div style={{color: '#fff', padding: '20px'}}>SARAHTVLAN HUB. ACESSE /controle.</div>} />
      </Routes>
    </Router>
  );
}
