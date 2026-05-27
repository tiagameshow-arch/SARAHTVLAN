import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, push, remove } from "firebase/database";

// =========================================================
// 1. CONFIGURAÇÃO FIREBASE (Substitua pela sua URL real)
// =========================================================
const firebaseConfig = {
  databaseURL: "https://sarahtvlan-default-rtdb.firebaseio.com/" // Cole sua URL aqui
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========================================================
// 2. INTERFACE PAINEL DE CONTROLE (O CÉREBRO)
// =========================================================
const PainelControle = () => {
  const [monitores, setMonitores] = useState<any[]>([]);
  const [monitorSelecionado, setMonitorSelecionado] = useState<string>("M10Café");
  const [novaUrl, setNovaUrl] = useState("");
  const [statusFirebase, setStatusFirebase] = useState("Conectando...");

  useEffect(() => {
    // Escuta todos os monitores para popular a lista
    const monitoresRef = ref(db, "monitores");
    onValue(monitoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setMonitores(lista);
        setStatusFirebase("Ativa");
      } else {
        setMonitores([]);
        setStatusFirebase("Sem Dados");
      }
    });

    // Escuta o status geral da rede (opcional)
    const statusRef = ref(db, "statusGeral");
    onValue(statusRef, (snapshot) => {
        // Lógica de status operacional
    });

  }, []);

  // Lógica para enviar o comando de hardware ( volume/giro)
  const enviarHardware = (novosDados: any) => {
    update(ref(db, `monitores/${monitorSelecionado}/config`), novosDados);
  };

  const monitorAtual = monitores.find(m => m.id === monitorSelecionado);
  const volumeAtual = monitorAtual?.config?.volume || 65;
  const mutadoAtual = monitorAtual?.config?.mutar || false;
  const rotacaoAtual = monitorAtual?.config?.rotacao || 0;

  return (
    <div style={styles.adminContainer}>
      <header style={styles.adminHeader}>
        <div style={styles.brand}>SARAHTVLAN TACTILE REMOTE</div>
        <div style={styles.statusBar}>
          {monitorAtual?.id} - Gerenciamento Individual - 
          <span style={{color: '#39FF14'}}> SINAL OPERACIONAL</span>
        </div>
      </header>

      <div style={styles.tabContainer}>
        <button style={styles.tabItem}>TELAS</button>
        <button style={styles.tabItemAtivo}>PLAYLIST</button>
        <button style={styles.tabItem}>AJUSTES</button>
      </div>
      
      <main style={styles.adminMain}>
        <section style={styles.panelSection}>
          <div style={styles.cardHeader}>Playlist Individual: {monitorAtual?.id}</div>
          <div style={styles.playlistInputGroup}>
            <input 
                type="text" value={novaUrl} 
                onChange={(e) => setNovaUrl(e.target.value)} 
                placeholder="Adicionar URL do YouTube..." style={styles.playlistInput} />
            <button style={styles.btnAdd}>+</button>
          </div>
          
          <div style={styles.playlistList}>
             {/* Renderize a playlist aqui */}
          </div>
        </section>

        <section style={styles.panelSection}>
          <div style={styles.cardHeader}>Ajustes de Hardware - Sincronia Remota ATIVA</div>
          <div style={styles.hardwareControls}>
            <div style={styles.sliderGroup}>
              <label>Volume: [{volumeAtual}%]</label>
              <input 
                  type="range" min="0" max="100" value={volumeAtual} 
                  onChange={(e) => {
                    enviarHardware({ volume: parseInt(e.target.value) });
                  }} 
                  style={styles.slider} 
              />
            </div>
            <div style={styles.btnGroup}>
                <button 
                    onClick={() => enviarHardware({ mutar: !mutadoAtual })} 
                    style={mutadoAtual ? styles.btnMutarAtivo : styles.btnHardware}>
                  {mutadoAtual ? '🔈 ATIVAR SOM' : '🔇 MUTAR'}
                </button>
                <button 
                    onClick={() => enviarHardware({ rotacao: (rotacaoAtual + 90) % 360 })} 
                    style={styles.btnHardware}>
                  🔄 VIRAR TELA ({rotacaoAtual}°)
                </button>
            </div>
          </div>
        </section>
      </main>
      
      <footer style={styles.adminFooter}>
        <div style={styles.footerInfo}>Conexão Firebase: <span style={{color: statusFirebase === "Ativa" ? "#39FF14" : "#FF0000"}}>{statusFirebase}</span> | Vercel Deployment: sarahtvlan.vercel.app</div>
        <div style={styles.footerTime}>Rua Zumbi dos Palmares, 25 - Osasco | 13:08 📡</div>
      </footer>
    </div>
  );
};

// =========================================================
// 3. ESTILOS (A ESTÉTICA NEON TOP)
// =========================================================
const styles = {
  // Estilos da interface dark tátil
  adminContainer: { background: '#111', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' },
  adminHeader: { display: 'flex', flexDirection: 'column', padding: '15px 20px', background: '#000', borderBottom: '1px solid #333' },
  brand: { fontSize: '18px', fontWeight: 'bold', color: '#fff' },
  statusBar: { fontSize: '14px', marginTop: '5px' },
  
  tabContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: '#000', borderBottom: '1px solid #333' },
  tabItem: { padding: '15px', background: '#000', color: '#888', border: 'none', cursor: 'pointer' },
  tabItemAtivo: { padding: '15px', background: '#000', color: '#39FF14', borderBottom: '3px solid #333', fontWeight: 'bold', cursor: 'pointer' },
  
  adminMain: { display: 'grid', gridTemplateColumns: '1fr', gap: '20px', padding: '20px' },
  panelSection: { background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333' },
  cardHeader: { padding: '15px', borderBottom: '1px solid #333', fontWeight: 'bold' },
  
  playlistInputGroup: { display: 'flex', gap: '10px', padding: '15px' },
  playlistInput: { flex: 1, padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' },
  btnAdd: { padding: '12px 20px', background: '#39FF14', border: 'none', color: '#000', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' },
  playlistList: { padding: '15px' },

  hardwareControls: { padding: '15px' },
  sliderGroup: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' },
  slider: { width: '100%', accentColor: '#39FF14' },
  
  btnGroup: { display: 'flex', gap: '10px' },
  btnHardware: { flex: 1, padding: '15px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '10px', fontSize: '12px', cursor: 'pointer' },
  btnMutarAtivo: { flex: 1, padding: '15px', background: '#FFC107', border: 'none', color: '#000', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  
  adminFooter: { position: 'fixed', bottom: 0, width: '100%', background: '#000', padding: '10px 20px', fontSize: '10px', display: 'flex', justifyContent: 'space-between', color: '#666', borderTop: '1px solid #333' },
  footerInfo: { display: 'flex', gap: '10px' },
  footerTime: { textAlign: 'right' }
};

export default PainelControle;
