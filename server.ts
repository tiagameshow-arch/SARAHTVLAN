import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// For ES modules path resolution
const __dirname = path.resolve();

interface BusLine {
  id: string;
  line: string;
  time: string;
}

interface MonitorState {
  id: string;
  name: string;
  playlist: string[];
  currentVideoIndex: number;
  isPlaying: boolean;
  mute: boolean;
  orientation?: "landscape" | "portrait";
  ip?: string;
  isOnline?: boolean;
  forceRefreshTime?: string;
  location?: string;
  customBusLines?: string;
}

interface TVState {
  temperature: string;
  newsTicker: string;
  busLines: BusLine[];
  monitors: MonitorState[];
  updatedAt: string;
  deletedMonitorIds?: string[];
  soundEffect?: string | null;
  soundEffectTime?: string | null;
  stadiumAmbient?: boolean;
  announcementSpeech?: string | null;
  announcementSpeechTime?: string | null;
}

const STATE_FILE_PATH = path.join(__dirname, "tv-state.json");

// Helper to save the global state to tv-state.json
function saveStateToDisk(state: TVState) {
  try {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2), "utf8");
  } catch (err) {
    console.error("Erro salvando tv-state.json:", err);
  }
}

// Helper to load or initialize state
function loadStateFromDisk(): TVState {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const data = fs.readFileSync(STATE_FILE_PATH, "utf8");
      const parsed = JSON.parse(data) as TVState;
      if (parsed && Array.isArray(parsed.monitors) && parsed.monitors.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Erro carregando tv-state.json, usando padrão:", err);
  }

  // Pure clean default state with only 1 main terminal monitor to avoid cluttering and unwanted default screens
  return {
    temperature: "17°C - Nublado",
    newsTicker: "NOTÍCIAS DE OSASCO: Novas melhorias de asfalto e sinalização chegam à Avenida Zumbi dos Palmares, no Parque Palmares! Linhas de ônibus integradas conectam o bairro ao centro de Osasco e estações de trem.",
    busLines: [
      { id: "1", line: "035", time: "7 MIN" },
      { id: "2", line: "034", time: "15 MIN" },
      { id: "3", line: "466", time: "30 MIN" }
    ],
    monitors: [
      {
        id: "terminal-principal",
        name: "Monitor Principal - Terminal",
        location: "Terminal Central",
        customBusLines: "035/034/466",
        playlist: ["ysz5S6PUM-U", "S_dfq9rFWAE", "5gK9m6W-i8E"],
        currentVideoIndex: 0,
        isPlaying: true,
        mute: true,
        orientation: "landscape"
      }
    ],
    updatedAt: new Date().toISOString()
  };
}

// Load persisted state from disk, fallback to standard defaults if empty
let tvState: TVState = loadStateFromDisk();

// Monitor presence / dynamic connection tracking (id -> last active timestamp)
let monitorActivity: Record<string, number> = {
  "terminal-principal": Date.now()
};

// Subscriber connections for real-time updates (Server-Sent Events)
let sseClients: any[] = [];

function broadcastState() {
  // Automatically write the latest state to server disk to persist any changes/additions/deletions!
  saveStateToDisk(tvState);
  const data = JSON.stringify(tvState);
  sseClients.forEach((client) => {
    client.write(`data: ${data}\n\n`);
  });
}

// Background scheduler for AUTOMATORY (News, Weather, Time, and Bus times)
function updateBusTimes() {
  let changed = false;
  tvState.busLines = tvState.busLines.map(bus => {
    const match = bus.time.match(/^(\d+)/);
    if (match) {
      const currentMins = parseInt(match[1], 10);
      if (currentMins > 1) {
        changed = true;
        return { ...bus, time: `${currentMins - 1} MIN` };
      } else if (currentMins === 1) {
        changed = true;
        return { ...bus, time: "PARTIU" };
      }
    } else if (bus.time === "PARTIU") {
      changed = true;
      // Roll a new random time (e.g. between 8 and 30 mins)
      const nextMins = Math.floor(Math.random() * 22) + 8;
      return { ...bus, time: `${nextMins} MIN` };
    }
    return bus;
  });
  
  if (changed) {
    tvState.updatedAt = new Date().toISOString();
    broadcastState();
  }
}

const weatherPresets = [
  "17°C - Chuva Leve",
  "18°C - Nublado",
  "19°C - Garoando",
  "21°C - Céu Limpo",
  "22°C - Ensolarado",
  "16°C - Névoa",
  "15°C - Nublado",
  "14°C - Chuviscando"
];

const newsPresets = [
  "NOTÍCIAS DE OSASCO: Novas rotas de ônibus e asfalto reforçado na Avenida Zumbi dos Palmares melhoram a mobilidade no Parque Palmares.",
  "ESPORTES EM OSASCO: Time de vôlei feminino Osasco São Cristóvão Saúde treina forte para a disputa dos playoffs com ingressos esgotados no Liberatti.",
  "FUTEBOL OSASCO: Clubes do futebol amador do Parque Palmares definem a tabela para o torneio regional deste final de semana.",
  "ESPORTES E SAÚDE: Ciclovia da Avenida Bussocaba em Osasco recebe evento esportivo de ciclismo infantil e corrida neste domingo.",
  "MELHORIAS URBANAS: Prefeitura de Osasco confirma novas câmeras de monitoramento e iluminação LED na região do Parque Palmares.",
  "ESPORTES - PALMEIRAS: Alviverde treina forte visando o clássico contra o São Paulo FC no final de semana pelo Brasileirão.",
  "ESPORTES - SÃO PAULO FC: Tricolor paulista anuncia retorno de lesionados para o treino tático focado na Libertadores.",
  "ESPORTES - CORINTHIANS: Alvinegro finaliza preparação com portões fechados e deve ter novidades no time titular para o próximo jogo.",
  "ESPORTES - SANTOS: Peixe foca na Vila Belmiro buscando manter 100% de aproveitamento em casa no campeonato nacional.",
  "FUTEBOL INTERNACIONAL: Seleção Brasileira se mobiliza na preparação para os jogos das Eliminatórias com força total.",
  "FÓRMULA 1: Grid se prepara para o GP de São Paulo em Interlagos com expectativa de arquibancadas lotadas e pista sob forte calor.",
  "BASQUETE - NBB: Osasco Basquete intensifica treinos físicos visando subir na tabela de classificação geral do torneio."
];

function updateWeatherAndNews() {
  const randomWeatherIdx = Math.floor(Math.random() * weatherPresets.length);
  tvState.temperature = weatherPresets[randomWeatherIdx];
  
  const randomNewsIdx = Math.floor(Math.random() * newsPresets.length);
  tvState.newsTicker = newsPresets[randomNewsIdx];
  
  tvState.updatedAt = new Date().toISOString();
  broadcastState();
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Support JSON request parser
  app.use(express.json());

  // Track explicitly deleted monitors to prevent background pings from resurrecting them automatically
  // Initialize from persisted state if present, otherwise fallback
  if (!tvState.deletedMonitorIds) {
    tvState.deletedMonitorIds = [];
  }

  // API Route - Get current state
  app.get("/api/state", (req, res) => {
    res.json(tvState);
  });

  // API Route - Update state
  app.post("/api/state", (req, res) => {
    const { temperature, newsTicker, busLines, monitors } = req.body;
    
    if (monitors !== undefined && Array.isArray(monitors)) {
      if (!tvState.deletedMonitorIds) {
        tvState.deletedMonitorIds = [];
      }
      // Find monitors that were in the original tvState but are not in the new array
      const oldIds = tvState.monitors.map(m => m.id);
      const newIds = monitors.map(m => m.id);
      oldIds.forEach(id => {
        if (!newIds.includes(id)) {
          if (!tvState.deletedMonitorIds!.includes(id)) {
            tvState.deletedMonitorIds!.push(id);
          }
          console.log(`[Presence] Monitor adicionado à lista persistente de exclusão: ${id}`);
        }
      });
      // When a monitor is added/present, ensure it's removed from deleted list
      newIds.forEach(id => {
        tvState.deletedMonitorIds = tvState.deletedMonitorIds!.filter(x => x !== id);
      });
    }

    if (temperature !== undefined) tvState.temperature = temperature;
    if (newsTicker !== undefined) tvState.newsTicker = newsTicker;
    if (busLines !== undefined && Array.isArray(busLines)) tvState.busLines = busLines;
    if (monitors !== undefined && Array.isArray(monitors)) tvState.monitors = monitors;
    if (req.body.soundEffect !== undefined) tvState.soundEffect = req.body.soundEffect;
    if (req.body.soundEffectTime !== undefined) tvState.soundEffectTime = req.body.soundEffectTime;
    if (req.body.stadiumAmbient !== undefined) tvState.stadiumAmbient = req.body.stadiumAmbient;
    if (req.body.announcementSpeech !== undefined) tvState.announcementSpeech = req.body.announcementSpeech;
    if (req.body.announcementSpeechTime !== undefined) tvState.announcementSpeechTime = req.body.announcementSpeechTime;
    
    tvState.updatedAt = new Date().toISOString();
    
    // Broadcast changes to all open streams and save state
    saveStateToDisk(tvState);
    broadcastState();
    
    res.json({ success: true, state: tvState });
  });

  // API Route - Monitor dynamic ping registration
  app.post("/api/monitor/ping", (req, res) => {
    const { id, name, orientation } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing monitor id" });
    }

    // Ignore ping if this monitor was explicitly deleted inside the dashboard
    if (tvState.deletedMonitorIds && tvState.deletedMonitorIds.includes(id)) {
      return res.json({ success: false, error: "Monitor was explicitly deleted", state: tvState });
    }

    let clientIp = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
    if (clientIp.startsWith("::ffff:")) {
      clientIp = clientIp.substring(7);
    }

    const now = Date.now();
    monitorActivity[id] = now;

    // Check if monitor is already listed in tvState.monitors
    const existingIndex = tvState.monitors.findIndex(m => m.id === id);
    let changed = false;

    if (existingIndex === -1) {
      // ONLY auto-register default pre-configured IDs or other physical monitors if not custom.
      // To prevent zombie resurrect chains, do NOT auto-register arbitrary "monitor-" IDs on ping. 
      // They must be explicitly created via "+ Cadastrar Novo Monitor" inside the phone remote controller!
      if (id.startsWith("monitor-")) {
        return res.json({ success: false, error: "Monitor does not exist and cannot be auto-registered on ping", state: tvState });
      }

      // Create pre-configured monitor (e.g. terminal-principal)
      const presetsPool = ["ysz5S6PUM-U", "S_dfq9rFWAE", "5gK9m6W-i8E", "_eH8u94IkyY"];
      const shuffled = [...presetsPool].sort(() => 0.5 - Math.random());
      const initialPlaylist = shuffled.slice(0, 2);

      const newMonitor = {
        id,
        name: name || `Monitor ${id.toUpperCase()}`,
        location: id === "terminal-principal" ? "Terminal Central" : "Avenida Zumbi dos Palmares",
        customBusLines: id === "terminal-principal" ? "035/034/466" : "035/034/461X1",
        playlist: initialPlaylist,
        currentVideoIndex: 0,
        isPlaying: true,
        mute: true,
        orientation: orientation || "landscape",
        ip: clientIp
      };

      tvState.monitors.push(newMonitor);
      changed = true;
      console.log(`[Presence] Novo monitor registrado dinamicamente por ping (${clientIp}): ${id}`);
    } else {
      // Sync parameters safely - DO NOT override orientation or playlist of the server using client-side pings!
      // Server-side / remote control is the source of truth for orientation and playlist!
      const monitor = tvState.monitors[existingIndex];
      if (monitor.ip !== clientIp) {
        monitor.ip = clientIp;
        changed = true;
      }
      if (monitor.isOnline !== true) {
        monitor.isOnline = true;
        changed = true;
      }
    }

    if (changed) {
      tvState.updatedAt = new Date().toISOString();
      saveStateToDisk(tvState);
      broadcastState();
    }

    res.json({ success: true, state: tvState });
  });

  // API Route - Server-Sent Events for real-time TV streaming
  app.get("/api/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    
    // Send immediate initial state
    res.write(`data: ${JSON.stringify(tvState)}\n\n`);
    
    // Track client connection
    sseClients.push(res);
    
    // Setup ping interval to keep connection active
    const keepAlive = setInterval(() => {
      res.write(": keep-alive\n\n");
    }, 15000);
    
    req.on("close", () => {
      clearInterval(keepAlive);
      sseClients = sseClients.filter((client) => client !== res);
    });
  });

  // Start automation intervals inside Express server
  // Update bus schedules counting down every 60 seconds
  const busInterval = setInterval(updateBusTimes, 60000);
  // Periodically fluctuate weather and rotate news items every 180 seconds
  const weatherNewsInterval = setInterval(updateWeatherAndNews, 180000);

  // Connection manager: Safe tracking of monitor online status without deleting screens or wiping playlists!
  const presenceInterval = setInterval(() => {
    const cutoff = Date.now() - 15000; // 15 seconds cutoff
    let changed = false;

    tvState.monitors = tvState.monitors.map(m => {
      // The terminal principal is always online for simulation standby, others depend on heartbeat ping
      if (m.id === "terminal-principal") {
        if (m.isOnline !== true) {
          changed = true;
          return { ...m, isOnline: true };
        }
        return m;
      }

      const lastActive = monitorActivity[m.id];
      const isActuallyOnline = lastActive ? lastActive >= cutoff : false;

      if (m.isOnline !== isActuallyOnline) {
        changed = true;
        return { ...m, isOnline: isActuallyOnline };
      }
      return m;
    });

    if (changed) {
      tvState.updatedAt = new Date().toISOString();
      broadcastState();
    }
  }, 4000);

  // Serve static files / setup dev environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] TV Signage running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
