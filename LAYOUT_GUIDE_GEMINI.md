# 🖥️ Guia de Layout, Skin e Integração VDO.Ninja (Painel Retransmissor)

Este guia prático descreve a arquitetura do front-end do monitor de rua em tela cheia para que você possa transportá-lo ou ensiná-lo perfeitamente ao **Gemini** (ou qualquer IA).

---

## 🎨 Esqueleto Visual do Layout (Aba 2 & Standalone TV)

O layout consiste em uma disposição responsiva e estilizada que simula um **monitor de rua físico real** posicionado ao lado de um **celular de usuário/passageiro** (com dados em tempo real, horários de ônibus e clima).

### 1. Grid Principal de Exibição
- **Lado Esquerdo**: Smartphone de passageiro (`max-w-[280px]`) que rotaciona informações meteorológicas realistas e as linhas/horários de ônibus locais de Osasco.
- **Lado Direito**: Moldura física de uma TV real (`max-w-[960px]`) que exibe canais de vídeo sem barras de notícias internas para manter a imagem limpa e focada.

### 2. Moldura Física da TV (The Screen Frame)
A TV possui as seguintes classes principais em Tailwind CSS:
```tsx
<div className="relative bg-[#050505] border-[10px] border-stone-850 rounded-[1.8rem] p-1 shadow-2xl aspect-video overflow-hidden w-full flex flex-col justify-between items-stretch">
```
- **border-[10px] border-stone-850**: Bordas chanfradas e realistas simulando plástico/metal industrial de um totem de rua.
- **aspect-video**: Mantém a proporção exata de transmissão 16:9.
- **overflow-hidden**: Garante que os containers internos fiquem completamente alinhados com a moldura arredondada.

---

## 🎬 Reprodutor de Mídias e Extensões

Nossos monitores detectam automaticamente três tipos principais de IDs/URLs no painel de controle ou no smartphone de controle do usuário:

### 1. Vídeos do YouTube (Playlist Dinâmica)
Utiliza uma inicialização sob-demanda da API oficial do IFrame do YouTube (`onYouTubeIframeAPIReady`).
- Permite controle remoto de áudio (MUTE independente de sinal).
- Detecta o final do vídeo (`onEnded`) para rotacionar perfeitamente a fila de comerciais.

### 2. Transmissões em Tempo Real via VDO.Ninja (Sinal do PC para as Telas)
Ideal para retransmitir a tela do seu computador direto para os anúncios e totens de rua:
- **ID de Sinal gerado**: `vdoninja-[VIEW_KEY]`
- **Endereço do IFrame integrado**:
```tsx
<iframe
  src={`https://vdo.ninja/?view=${vdoNinjaKey}&autoplay=1&bgopacity=0&transparent=1${muteState ? "&mute=1" : ""}`}
  allow="autoplay; camera; microphone; fullscreen; picture-in-picture"
  className="absolute inset-0 w-full h-full border-none pointer-events-auto"
  referrerPolicy="no-referrer"
/>
```

### 3. Vídeos Locais MP4
Selecione qualquer arquivo local em seu computador e replique instantaneamente no simulador do monitor sem precisar enviar nada para o servidor remoto, preservando sua banda e velocidade.

---

## 📻 Estrutura do CSS do Marquee de Notícias (`src/index.css`)

Para obter o efeito perfeito de texto rolando da direita para a esquerda continuamente com ótima legibilidade:

```css
@keyframes marquee {
  0% { transform: translate3d(100%, 0, 0); }
  100% { transform: translate3d(-100%, 0, 0); }
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}
```

---

## 🚀 Como levar este Projeto para o Gemini:
1. Copie o arquivo `src/App.tsx` para carregar toda a inteligência e lógica de estado sincronizado.
2. Copie o arquivo `src/skin-layout.css` para ter todas as variáveis css e configurações em mãos.
3. Use o comando `npm run build && npm run start` para implantar em produção.
