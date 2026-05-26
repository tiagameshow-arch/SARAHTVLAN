import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import ReactPlayer from 'react-player/youtube'; // Instale: npm install react-player

// 1. CONFIGURAÇÃO DO MENSAGEIRO (Firebase)
const firebaseConfig = {
  databaseURL: "https://sarahtvlan-default-rtdb.firebaseio.com/" // Cole sua URL aqui
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========================================================
// --- LÓGICA DO MONITOR (TV) - O que o público vê ---
// =========================================================
const MonitorTV = () => {
  const { idMonitor } = useParams(); // Pega o ID do monitor da URL (ex: monitor1)
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    // Escuta o caminho específico deste monitor no Firebase
    const monitorRef = ref(db, `monitores/${idMonitor}`);
    onValue(monitorRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.urlVideo) {
        // Quando o link do vídeo muda, o player carrega o novo vídeo
        setVideoUrl(data.urlVideo);
      }
    });
  }, [idMonitor]);

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#000' }}>
      {videoUrl ? (
        <ReactPlayer
          url={videoUrl}
          playing={true} // Reproduz automaticamente
          loop={true} // Repete o vídeo ( loop )
          controls={false} // Esconde os controles
          width='100%'
          height='100%'
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <div style={{color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
          📺 MONITOR {idMonitor?.toUpperCase()} AGUARDANDO VÍDEO...
        </div>
      )}
    </div>
  );
};

// =========================================================
// --- LÓGICA DO PAINEL (Celular) - O que você usa ---
// =========================================================
const PainelControle = () => {
  const [monitorId, setMonitorId] = useState('monitor1'); // ID do monitor padrão
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const enviarVideoParaMonitor = () => {
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      alert('Por favor, insira um link válido do YouTube.');
      return;
    }
    // Escreve o link do vídeo no caminho específico do monitor no Firebase
    set(ref(db, `monitores/${monitorId}`), {
      urlVideo: youtubeUrl,
      timestamp: Date.now()
    });
    alert(`Vídeo enviado para o ${monitorId}!`);
    setYoutubeUrl(''); // Limpa o campo
  };

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1>📲 CENTRAL DE COMANDO SARAHTVLAN</h1>
      <p>Gerencie seus monitores da palma da sua mão.</p>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h3>🚀 ENVIAR VÍDEO</h3>
        <label>Selecione o Monitor:</label>
        <select value={monitorId} onChange={(e) => setMonitorId(e.target.value)} style={inputStyle}>
          <option value="monitor1">Monitor 1 - Retransmissor</option>
          <option value="monitor2">Monitor 2 - Recepção</option>
          <option value="monitor3">Monitor 3 - Auditório</option>
        </select>

        <label style={{marginTop: '10px', display: 'block'}}>Link do YouTube:</label>
        <input 
          type="text" 
          value={youtubeUrl} 
          onChange={(e) => setYoutubeUrl(e.target.value)} 
          placeholder="Cole o link do YouTube aqui..." 
          style={inputStyle}
        />

        <button onClick={enviarVideoParaMonitor} style={btnStyle}>ENVIAR VÍDEO AGORA</button>
      </div>
    </div>
  );
};

// Estilos simples para o painel de controle
const inputStyle = { width: '100%', padding: '12px', marginTop: '5px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '15px', background: '#39FF14', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };

// =========================================================
// --- DEFINIÇÃO DO ROTEADOR ---
// =========================================================
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rota para o Painel de Controle (Celular) */}
        <Route path="/controle" element={<PainelControle />} />
        
        {/* Rota para os Monitores (TV) - Aceita IDs como /monitor1, /monitor2, etc. */}
        <Route path="/:idMonitor" element={<MonitorTV />} />
        
        {/* Rota padrão (se acessar a raiz) */}
        <Route path="/" element={<div style={{padding: '20px'}}>📺 SARAHTVLAN OPERACIONAL. Use /controle para gerenciar.</div>} />
      </Routes>
    </Router>
  );
}
