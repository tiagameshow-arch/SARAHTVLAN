// =========================================================
// --- NOVO PAINEL DE CONTROLE ATIVO (Osasco -> Carapicuiba) ---
// =========================================================
const PainelControle = () => {
  // Estado para saber qual monitor está selecionado (padrão: M1)
  const [monitorId, setMonitorId] = useState('monitor1');

  // Função central para enviar o comando para o Firebase
  const enviarComando = (mensagem, corFundo, acaoType) => {
    if (!monitorId) {
      alert("Por favor, selecione um monitor primeiro!");
      return;
    }

    // Escreve o novo estado no banco de dados para o monitor específico
    set(ref(db, `monitores/${monitorId}`), {
      status: {
        mensagem: mensagem,
        cor: corFundo,
        layout: acaoType, // 'ao_vivo' ou 'intervalo'
        timestamp: Date.now()
      }
    });

    console.log(`Comando '${mensagem}' enviado para o ${monitorId}`);
  };

  return (
    <div style={styles.controleContainer}>
      <header style={styles.header}>
        <span style={styles.cyanTitle}>SARAHTVLAN 🎛️ CONTROLE TÁTIL DE OSASCO</span>
      </header>

      {/* SELEÇÃO DE MONITOR (Essencial para saber qual TV controlar) */}
      <div style={{...styles.card, ...styles.cardCyan, marginBottom: '20px'}}>
        <h2 style={styles.cardHeader}>📺 Monitor Selecionado</h2>
        <div style={styles.cardBody}>
          <select value={monitorId} onChange={(e) => setMonitorId(e.target.value)} style={styles.selectInput}>
            <option value="monitor1">Monitor 1 - Retransmissor principal</option>
            <option value="monitor2">Monitor 2 - Plataforma A</option>
            <option value="monitor3">Monitor 3 - Plataforma B</option>
          </select>
        </div>
      </div>

      <div style={styles.gridMain}>
        {/* CARTÃO 1 - AO VIVO (Agora Ativo) */}
        <section style={{...styles.card, ...styles.cardGreen}}>
          <h2 style={styles.cardHeader}>🟢 Ao Vivo</h2>
          <div style={styles.cardBody}>
            <p>Sinal: Câmera Principal (Terminal)</p>
            {/* O CLIQUE AQUI ENVIA O COMANDO DE FATO */}
            <button 
              onClick={() => enviarComando("TRANSMISSÃO AO VIVO", "#39FF14", "ao_vivo")}
              style={styles.actionBtnGreen}>🔴 ENTRAR AO VIVO</button>
          </div>
        </section>

        {/* CARTÃO 2 - INTERVALO/MÚSICA (Agora Ativo) */}
        <section style={{...styles.card, ...styles.cardOrange}}>
          <h2 style={styles.cardHeader}>🎵 Intervalo/Música</h2>
          <div style={styles.cardBody}>
            <p>Playlist: Mixagem Tarde 2026</p>
            {/* O CLIQUE AQUI ENVIA O COMANDO DE FATO */}
            <button 
              onClick={() => enviarComando("INTERVALO MUSICAL", "orange", "intervalo")}
              style={styles.actionBtnOrange}>🕒 MODO INTERVALO</button>
          </div>
        </section>
      </div>

      <footer style={styles.footer}>
        <p>📡 Conexão Firebase: Ativa | SINAL OPERACIONAL DE OSASCO-XP</p>
      </footer>
    </div>
  );
};
