// --- SARAHTVLAN: Objeto de Estilos Neon ---
// Certifique-se de que este bloco substitui o objeto 'styles' antigo no final do arquivo App.tsx

const styles = {
  // Configurações Gerais da Página
  controleContainer: {
    background: '#121212', // Fundo Ultra Escuro
    minHeight: '100vh',
    color: '#fff', // Texto Branco
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '20px',
  },

  // Cabeçalho e Título
  header: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    borderBottom: '1px solid #333',
    paddingBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cyanTitle: {
    color: '#00FFFF', // Título em Cyan Neon
  },

  // Grid e Cartões
  gridMain: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#1a1a1a', // Fundo do Cartão (Levemente mais claro)
    borderRadius: '12px',
    border: '1px solid #333',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
  },

  // Variantes de Cor Neon para os Cartões
  // -- PASSO 4 ADICIONADO: cardCyan --
  cardCyan: {
    borderColor: '#00FFFF', // Borda Cyan
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)', // Brilho Cyan
  },
  cardGreen: {
    borderColor: '#39FF14', // Borda Verde Neon
    boxShadow: '0 0 20px rgba(57, 255, 20, 0.2)', // Brilho Verde
  },
  cardOrange: {
    borderColor: 'orange', // Borda Laranja
    boxShadow: '0 0 20px rgba(255, 165, 0, 0.2)', // Brilho Laranja
  },

  // Corpo do Cartão
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

  // Elementos de Entrada
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  // -- PASSO 4 ADICIONADO: selectInput --
  selectInput: {
    width: '100%',
    padding: '15px',
    background: '#222', // Fundo Escuro para Input
    color: '#fff', // Texto Branco
    border: '1px solid #333',
    borderRadius: '8px',
    fontSize: '16px',
    appearance: 'none', // Remove estilo padrão do sistema
  },
  textInput: {
    width: '100%',
    padding: '12px',
    background: '#000', // Fundo Preto para Input de Texto
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
  },

  // Botões de Ação
  actionBtnGreen: {
    background: '#39FF14', // Verde Neon
    color: '#000', // Texto Preto
    border: 'none',
    padding: '15px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px',
    boxShadow: '0 0 15px rgba(57, 255, 20, 0.4)',
    transition: 'background 0.3s',
  },
  actionBtnOrange: {
    background: 'orange', // Laranja
    color: '#000', // Texto Preto
    border: 'none',
    padding: '15px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px',
    boxShadow: '0 0 15px rgba(255, 165, 0, 0.4)',
    transition: 'background 0.3s',
  },

  // Rodapé Técnico
  footer: {
    marginTop: '30px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#777', // Texto Cinza Escuro
    borderTop: '1px solid #333',
    paddingTop: '10px',
  }
};
