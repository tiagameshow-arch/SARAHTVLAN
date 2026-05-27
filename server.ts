import express from "express";
import path from "path";
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
}

interface TVState {
  temperature: string;
  newsTicker: string;
  busLines: BusLine[];
  monitors: MonitorState[];
  updatedAt: string;
}

// In-memory global state
let tvState: TVState = {
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
      playlist: ["ysz5S6PUM-U", "S_dfq9rFWAE", "5gK9m6W-i8E"],
      currentVideoIndex: 0,
      isPlaying: true,
      mute: true,
      orientation: "landscape"
    },
    {
      id: "plataforma-a",
      name: "Plataforma A - Saídas Centro",
      playlist: ["_eH8u94IkyY", "ysz5S6PUM-U"],
      currentVideoIndex: 0,
      isPlaying: true,
      mute: true,
      orientation: "landscape"
    },
    {
      id: "plataforma-b",
      name: "Plataforma B - Linhas de Bairro",
      playlist: ["5gK9m6W-i8E", "S_dfq9rFWAE"],
      currentVideoIndex: 0,
      isPlaying: true,
      mute: true,
      orientation: "landscape"
    }
  ],
  updatedAt: new Date().toISOString()
};

// Monitor presence / dynamic connection tracking (id -> last active timestamp)
let monitorActivity: Record<string, number> = {
  "terminal-principal": Date.now(),
  "plataforma-a": Date.now(),
  "plataforma-b": Date.now()
};

// Subscriber connections for real-time updates (Server-Sent Events)
let sseClients: any[] = [];

function broadcastState() {
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
  "MELHORIAS URBANAS: Prefeitura de Osasco confirma novas câmeras de monitoramento e iluminação LED na região do Parque Palmares."
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

  // API Route - Get current state
  app.get("/api/state", (req, res) => {
    res.json(tvState);
  });

  // API Route - Update state
  app.post("/api/state", (req, res) => {
    const { temperature, newsTicker, busLines, monitors } = req.body;
    
    if (temperature !== undefined) tvState.temperature = temperature;
    if (newsTicker !== undefined) tvState.newsTicker = newsTicker;
    if (busLines !== undefined && Array.isArray(busLines)) tvState.busLines = busLines;
    if (monitors !== undefined && Array.isArray(monitors)) tvState.monitors = monitors;
    
    tvState.updatedAt = new Date().toISOString();
    
    // Broadcast changes to all open streams
    broadcastState();
    
    res.json({ success: true, state: tvState });
  });

  // API Route - Monitor dynamic ping registration
  app.post("/api/monitor/ping", (req, res) => {
    const { id, name, orientation } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing monitor id" });
    }

    const now = Date.now();
    monitorActivity[id] = now;

    // Check if monitor is already listed in tvState.monitors
    const existingIndex = tvState.monitors.findIndex(m => m.id === id);
    let changed = false;

    if (existingIndex === -1) {
      // Create it dynamically with a unique playlist "ter sua propria playlist! assim os videos serão diferentes!"
      const presetsPool = ["ysz5S6PUM-U", "S_dfq9rFWAE", "5gK9m6W-i8E", "_eH8u94IkyY"];
      // Randomly select 2 to 3 videos for this monitor
      const shuffled = [...presetsPool].sort(() => 0.5 - Math.random());
      const initialPlaylist = shuffled.slice(0, 2 + Math.floor(Math.random() * 2));

      const newMonitor = {
        id,
        name: name || `Monitor ${id.toUpperCase()}`,
        playlist: initialPlaylist,
        currentVideoIndex: 0,
        isPlaying: true,
        mute: true,
        orientation: orientation || "landscape"
      };

      tvState.monitors.push(newMonitor);
      changed = true;
      console.log(`[Presence] Novo monitor registrado dinamicamente por ping: ${id}`);
    } else {
      // Sync parameters if passed
      const monitor = tvState.monitors[existingIndex];
      // Keep orientation in sync if provided
      if (orientation && monitor.orientation !== orientation) {
        monitor.orientation = orientation;
        changed = true;
      }
    }

    if (changed) {
      tvState.updatedAt = new Date().toISOString();
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

  // Connection manager: Remove monitors that haven't pinged in over 10 seconds
  const presenceInterval = setInterval(() => {
    const cutoff = Date.now() - 10000;
    let changed = false;

    tvState.monitors = tvState.monitors.filter(m => {
      const lastActive = monitorActivity[m.id];
      // Keep static monitors if we want them, or let them disappear as requested.
      // To ensure a flawless demo where users have monitors, let's check:
      // If a monitor has been registered in our monitorActivity tracking, we check its timestamp.
      // If it exists but is older than cutoff, remove it!
      if (lastActive && lastActive < cutoff) {
        delete monitorActivity[m.id];
        changed = true;
        console.log(`[Presence] Monitor desconectado por falta de ping: ${m.id}`);
        return false;
      }
      return true;
    });

    if (changed) {
      tvState.updatedAt = new Date().toISOString();
      broadcastState();
    }
  }, 3000);

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
