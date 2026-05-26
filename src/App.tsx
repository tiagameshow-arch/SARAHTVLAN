import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update } from "firebase/database";
import ReactPlayer from 'react-player/youtube';

// =========================================================
// 1. CONFIGURAÇÃO FIREBASE (CONEXÃO OSASCO-CARAPICUIBA)
// =========================================================
const firebaseConfig = {
  databaseURL: "https://sarahtvlan-default-rtdb.firebaseio.com/" // SUA URL AQUI
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========================================================
// 2. COMPONENTE MONITOR TV (CARAPICUIBA)
// =========================================================
const MonitorTV = () => {
  const { idMonitor } = useParams();
  const [data, setData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const monitorRef = ref(db, `monitores/${idMonitor}`);
    onValue(monitorRef, (snapshot) => {
      setData(snapshot.val());
    });
  }, [idMonitor]);

  // Função para pular para o próximo vídeo da playlist
  const handleNextVideo = () => {
    if (data?.playlist && data.playlist.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % data.playlist.length);
    }
  };

  if (!data) return <div style={styles.loading}>SINAL OPERACIONAL: AGUARDANDO COMANDO...</div>;

  return (
    <div style={{
      ...styles.tvContainer,
      transform: `rotate(${data.ajustes?.rotacao || 0}deg)`,
      transition: '0.5s'
    }}>
      {data.playlist && data.playlist.length > 0 ? (
        <ReactPlayer
          url={data.playlist[currentIndex]}
          playing={true}
          loop={data.playlist.length === 1}
          muted={data.ajustes?.mutar || false}
          onEnded={handleNextVideo}
          width="100%"
          height="100%"
          controls={false}
        />
      ) : (
        <div style={styles.noVideo}>SARAHTVLAN: NENHUM VÍDEO NA PLAYLIST</div>
      )}
      
      {/* Overlay de Identificação */}
      <div style={styles.tvOverlay}>
        <span>{data.nome || idMonitor}</span>
        <span style={{color: '#39FF14'}}>● LIVE</span>
      </div>
    </div>
  );
};

// =========================================================
// 3. COMPONENTE PAINEL DE CONTROLE (CELULAR - OSASCO)
// =========================================================
const PainelControle = () => {
  const [abaAtiva, setAbaAtiva] = useState('telas');
  const [monitorSel, setMonitorSel] = useState('monitor1');
  const [monitorInfo, setMonitorInfo] = useState<any>(null);
  const [novoLink, setNovoLink] = useState('');

  useEffect(() => {
    const refMon = ref(db, `monitores/${monitorSel}`);
    onValue(refMon, (snapshot) => setMonitorInfo(snapshot.val()));
  }, [monitorSel]);

  // FUNÇÕES DE COMANDO
  const addVideo = () => {
    if (!novoLink) return;
    const playlistAtual = monitorInfo?.playlist || [];
    set(ref(db, `monitores/${monitorSel}/playlist`), [...playlistAtual, novoLink]);
    setNovoLink('');
  };

  const removeVideo = (index: number) => {
    const novaPlaylist = [...monitorInfo.playlist];
    novaPlaylist.splice(index, 1);
    set(ref(db, `monitores/${monitorSel}/playlist`), novaPlaylist);
  };

  const toggleConfig = (campo: string) => {
    const valorAtual = monitorInfo?.ajustes?.[campo] || false;
    update(ref(db, `monitores/${monitorSel}/ajustes`), { [campo]: !valorAtual });
  };

  const mudarRotacao = () => {
    const atual = monitorInfo?.ajustes?.rotacao || 0;
    const nova = atual === 0 ? 90 : 0;
    update(ref(db, `monitores/${monitorSel}/ajustes`), { rotacao: nova });
  };

  return (
    <div style={styles.adminContainer}>
      <header style={styles.adminHeader}>
        <div style={styles.statusLine}>
          <span style={{color: '#39FF14'}}>● SINAL OPERACIONAL</span>
          <span style={{opacity: 0.5}}>REMOTO: OSASCO-XP</span>
        </div>
        <div style={styles.monitorBadge}>
          {monitorInfo?.nome || monitorSel} <br/>
          <small>{monitorInfo?.playlist?.length || 0} ITEMS NA PLAYLIST</small>
        </div>
      </header>

      {/* NAVEGAÇÃO POR ABAS */}
      <nav style={styles.tabNav}>
        <button onClick={() => setAbaAtiva('telas')} style={abaAtiva === 'telas' ? styles.tabBtnActive : styles.tabBtn}>
          <i className="fa-solid fa-desktop"></i> TELAS
        </button>
        <button onClick={() => setAbaAtiva('playlist')} style={abaAtiva === 'playlist' ? styles.tabBtnActive : styles.tabBtn}>
          <i className="fa-solid fa-list"></i> PLAYLIST
        </button>
        <button onClick={() => setAbaAtiva('ajustes')} style={abaAtiva === 'ajustes' ? styles.tabBtnActive : styles.tabBtn}>
          <i className="fa-solid fa-sliders"></i> AJUSTES
        </button>
      </nav>

      <main style={styles.adminMain}>
        
        {/* ABA 1: SELEÇÃO DE TELAS */}
        {abaAtiva === 'telas' && (
          <div style={styles.section}>
            <h3>MONITORES CONECTADOS</h3>
            {['monitor1', 'monitor2', 'monitor3'].map(m => (
              <div key={m} onClick={() => setMonitorSel(m)} style={monitorSel === m ? styles.monitorCardActive : styles.monitorCard}>
                <span>{m === 'monitor1' ? 'MONITOR PRINCIPAL' : m.toUpperCase()}</span>
                <i className="fa-solid fa-circle" style={{fontSize: '10px', color: '#39FF14'}}></i>
              </div>
            ))}
          </div>
        )}

        {/* ABA 2: PLAYLIST */}
        {abaAtiva === 'playlist' && (
          <div style={styles.section}>
            <div style={styles.addArea}>
              <input 
                placeholder="ID ou Link do YouTube..." 
                value={novoLink} 
                onChange={(e) => setNovoLink(e.target.value)} 
                style={styles.input}
              />
              <button onClick={addVideo} style={styles.btnAdd}>+</button>
            </div>
            
            <div style={styles.list}>
              {monitorInfo?.playlist?.map((vid: string, i: number) => (
                <div key={i} style={styles.listItem}>
                  <span style={{fontSize: '12px', overflow: 'hidden'}}>{vid}</span>
                  <button onClick={() => removeVideo(i)} style={styles.btnDel}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 3: AJUSTES */}
        {abaAtiva === 'ajustes' && (
          <div style={styles.section}>
            <h3>OPÇÕES DO HARDWARE</h3>
            <div style={styles.gridBtns}>
              <button onClick={() => toggleConfig('mutar')} style={monitorInfo?.ajustes?.mutar ? styles.btnActionActive : styles.btnAction}>
                {monitorInfo?.ajustes?.mutar ? '🔈 ATIVAR SOM' : '🔇 MUTAR'}
              </button>
              <button onClick={mudarRotacao} style={styles.btnAction}>
                🔄 VIRAR TELA ({monitorInfo?.ajustes?.rotacao || 0}°)
              </button>
            </div>
            <div style={{marginTop: '20px'}}>
              <label>RENOMEAR MONITOR:</label>
              <input 
                placeholder="Ex: Plataforma A" 
                onBlur={(e) => update(ref(db, `monitores/${monitorSel}`), { nome: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>
        )}

      </main>

      <footer style={styles.adminFooter}>
        Rua Zumbi dos Palmares, 25 - Osasco Hub
      </footer>
    </div>
  );
};

// =========================================================
// 4. ESTILOS (A ESTÉTICA NEON TOP)
// =========================================================
const styles: any = {
  loading: { background: '#000', color: '#00FFFF', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace' },
  tvContainer: { background: '#000', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' },
  tvOverlay: { position: 'absolute', top: 20, left: 20, color: '#fff', fontSize: '18px', display: 'flex', gap: '15px', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px' },
  noVideo: { color: '#444', display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', fontSize: '30px' },
  
  adminContainer: { background: '#121212', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '15px' },
  adminHeader: { borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '15px' },
  statusLine: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '10px' },
  monitorBadge: { background: '#1a1a1a', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #00FFFF' },
  
  tabNav: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tabBtn: { flex: 1, padding: '12px', background: '#222', border: '1px solid #333', color: '#888', borderRadius: '8px', cursor: 'pointer' },
  tabBtnActive: { flex: 1, padding: '12px', background: '#00FFFF15', border: '1px solid #00FFFF', color: '#00FFFF', borderRadius: '8px', fontWeight: 'bold' },
  
  adminMain: { background: '#1a1a1a', borderRadius: '15px', padding: '20px', minHeight: '300px' },
  section: { display: 'flex', flexDirection: 'column', gap: '15px' },
  
  monitorCard: { padding: '15px', background: '#222', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #333' },
  monitorCardActive: { padding: '15px', background: '#00FFFF10', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #00FFFF' },
  
  addArea: { display: 'flex', gap: '10px' },
  input: { flex: 1, background: '#000', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '8px' },
  btnAdd: { background: '#39FF14', color: '#000', border: 'none', padding: '0 20px', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold' },
  
  list: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' },
  listItem: { background: '#222', padding: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between' },
  btnDel: { background: 'none', border: 'none', cursor: 'pointer' },
  
  gridBtns: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  btnAction: { padding: '15px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '8px' },
  btnActionActive: { padding: '15px', background: '#39FF14', border: 'none', color: '#000', borderRadius: '8px', fontWeight: 'bold' },
  
  adminFooter: { textAlign: 'center', marginTop: '30px', fontSize: '10px', opacity: 0.5 }
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
        <Route path="/" element={<div style={{padding: '40px', color: '#fff'}}>SARAHTVLAN HUB. ACESSE /controle NO CELULAR.</div>} />
      </Routes>
    </Router>
  );
}
