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
    temperature: "20°C - Céu Limpo",
    newsTicker: "GIRO SP: Novas linhas de ônibus integradas e asfalto reforçado na Avenida Zumbi dos Palmares melhoram a mobilidade no Parque Palmares.",
    busLines: [
      { id: "1", line: "035", time: "CARREGANDO..." },
      { id: "2", line: "034", time: "CARREGANDO..." },
      { id: "3", line: "466X1", time: "CARREGANDO..." }
    ],
    monitors: [
      {
        id: "terminal-principal",
        name: "Monitor Principal - LANHOUSE24H",
        location: "Terminal Central - LANHOUSE24H",
        customBusLines: "035/034/466X1",
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

// Real Timetables from Uploaded Images
const BUS_SCHEDULES: Record<string, { weekday: string[]; saturday: string[]; sunday: string[] }> = {
  "035": {
    weekday: ["04:25", "04:45", "05:10", "05:30", "05:45", "06:10", "06:35", "07:00", "07:45", "08:30", "09:10", "09:55", "10:45", "11:30", "12:25", "13:10", "13:40", "14:15", "14:50", "15:20", "15:55", "16:30", "17:05", "17:50", "18:35", "19:20", "20:05", "20:55", "21:35", "22:25", "23:15"],
    saturday: ["04:35", "05:05", "05:40", "06:15", "06:55", "07:30", "08:15", "08:50", "09:20", "09:45", "10:20", "11:20", "12:20", "13:05", "13:55", "14:25", "15:00", "15:35", "16:00", "16:35", "17:10", "17:45", "18:35", "19:35", "21:10", "22:30"],
    sunday: ["05:00", "06:10", "07:25", "08:40", "10:05", "12:20", "13:50", "15:15", "16:40", "18:00", "19:20", "21:35", "22:50"]
  },
  "034": {
    weekday: ["05:05", "05:15", "05:35", "05:45", "06:00", "19:45", "20:15", "20:25", "20:35", "20:45", "20:55", "21:15", "22:40"],
    saturday: ["05:00", "05:10", "08:00", "15:25"],
    sunday: ["05:00", "07:00", "21:35"]
  },
  "466X1": {
    weekday: ["05:33", "06:15", "07:15", "07:55", "09:00", "09:50", "10:45", "11:30", "12:50", "13:55", "14:35", "15:20", "16:05", "18:05", "19:20", "20:30", "22:00"],
    saturday: [],
    sunday: []
  }
};

const weatherPresets = [
  "20°C - Céu Limpo",
  "18°C - Nublado",
  "22°C - Ensolarado",
  "16°C - Garoando",
  "15°C - Chuva Leve",
  "17°C - Parcialmente Nublado"
];

const newsPresets = [
  "GIRO SP: Nova frota de ônibus com ar condicionado começa a circular nesta semana na Região Metropolitana.",
  "DISTRITO OSASCO: Novas rotas de asfalto e sinalização melhoram o tráfego de pedestres e veículos.",
  "CORINTHIANS: Alvinegro treina forte visando o clássico deste final de semana no campeonato paulista.",
  "SÃO PAULO FC: Tricolor finaliza preparação com volta de titulares lesionados para o jogo da Libertadores.",
  "PALMEIRAS: Verdão intensifica trabalhos táticos em busca de manter a liderança isolada.",
  "SANTOS: Peixe foca na Vila Belmiro para o próximo duelo do torneio nacional."
];

// Helper to convert time to America/Sao_Paulo timezone safely and robustly without relying on local system tz parsing
function getOsascoTime() {
  const now = new Date();
  // Brazil America/Sao_Paulo is permanently UTC-3
  const osascoTimeInMs = now.getTime() - (3 * 3600000);
  const localDate = new Date(osascoTimeInMs);
  const hour = localDate.getUTCHours();
  const minute = localDate.getUTCMinutes();
  const dayOfWeek = localDate.getUTCDay(); // 0 = Sunday, 1-5 = Weekday, 6 = Saturday
  return { hour, minute, dayOfWeek };
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function getNextBusArrival(lineKey: string, offsetMinutes: number): string {
  const scheduleDef = BUS_SCHEDULES[lineKey];
  if (!scheduleDef) return "SEM INFO";
  
  const { hour, minute, dayOfWeek } = getOsascoTime();
  const osascoMinutesNow = hour * 60 + minute;
  
  const getScheduleForDay = (day: number) => {
    if (day === 0) return scheduleDef.sunday;
    if (day === 6) return scheduleDef.saturday;
    return scheduleDef.weekday;
  };
  
  const todaySchedule = getScheduleForDay(dayOfWeek);
  
  // Find all upcoming arrivals at Rua Zumbi dos Palmares for today
  const todayArrivals = todaySchedule
    .map(timeStr => {
      const depMins = parseTimeToMinutes(timeStr);
      const arrMins = depMins + offsetMinutes;
      return { timeStr, depMins, arrMins, dayOffset: 0 };
    })
    .filter(item => item.arrMins >= osascoMinutesNow)
    .sort((a, b) => a.arrMins - b.arrMins);
    
  let target = todayArrivals[0];
  
  if (!target) {
    // Wrap around to tomorrow's schedule
    const tomorrowDayOfWeek = (dayOfWeek + 1) % 7;
    const tomorrowSchedule = getScheduleForDay(tomorrowDayOfWeek);
    if (tomorrowSchedule.length > 0) {
      const firstDepMins = parseTimeToMinutes(tomorrowSchedule[0]);
      const firstArrMins = firstDepMins + offsetMinutes;
      target = {
        timeStr: tomorrowSchedule[0],
        depMins: firstDepMins,
        arrMins: 1440 + firstArrMins,
        dayOffset: 1440
      };
    }
  }
  
  if (!target) {
    return "SEM MAIS VIAGENS";
  }
  
  const diff = target.arrMins - osascoMinutesNow;
  
  // Determine if it operates today/tomorrow
  const activeSchedule = todaySchedule.length > 0 ? todaySchedule : getScheduleForDay((dayOfWeek + 1) % 7);
  if (activeSchedule.length === 0) {
    return "NÃO OPERA HOJE";
  }
  
  if (diff <= 1) {
    return "PARTIU";
  }
  
  // If wait is very high (greater than 60 minutes), show the exact hour of arrival to keep it clean
  if (diff > 60) {
    const arrivalMinutesInDay = (target.depMins + offsetMinutes) % 1440;
    const arrH = Math.floor(arrivalMinutesInDay / 60);
    const arrM = arrivalMinutesInDay % 60;
    const arrHStr = arrH.toString().padStart(2, "0");
    const arrMStr = arrM.toString().padStart(2, "0");
    
    // For very long off-peak times (like line 034 midday gaps), display the scheduled target cleanly
    if (diff > 90) {
      return `ÀS ${arrHStr}:${arrMStr} (Próx)`;
    }
    return `${diff} MIN (${arrHStr}:${arrMStr})`;
  }
  
  return `${diff} MIN`;
}

function getLineTimer(lineNumber: string): string {
  const cleanLine = lineNumber.trim().toUpperCase();
  if (cleanLine === "035" || cleanLine === "35") {
    return getNextBusArrival("035", 50); // Line 035 takes about 50 minutes to Zumbi dos Palmares
  }
  if (cleanLine === "034" || cleanLine === "34") {
    return getNextBusArrival("034", 25); // Line 034 takes about 25 minutes to Zumbi dos Palmares
  }
  if (cleanLine === "466X1" || cleanLine === "466EX1" || cleanLine === "466") {
    return getNextBusArrival("466X1", 10); // Line 466X1 takes about 10 minutes to Zumbi dos Palmares
  }
  
  // Dynamic calculation for other lines
  const hash = cleanLine.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const { minute } = getOsascoTime();
  const calc = ((minute + hash) % 25) + 3;
  return `${calc} MIN`;
}

// Background scheduler for AUTOMATORY (News, Weather, Time, and Bus times)
function computeNextBusTimes() {
  tvState.busLines = tvState.busLines.map(bus => {
    return { ...bus, time: getLineTimer(bus.line) };
  });
}

function updateBusTimes() {
  computeNextBusTimes();
  tvState.updatedAt = new Date().toISOString();
  broadcastState();
}

function mapWeatherCode(code: number): string {
  if (code === 0) return "Céu Limpo";
  if (code >= 1 && code <= 3) return "Nublado";
  if (code === 45 || code === 48) return "Névoa / Nevoeiro";
  if (code >= 51 && code <= 55) return "Chuviscando";
  if (code >= 61 && code <= 65) return "Chuva Moderada";
  if (code >= 80 && code <= 82) return "Pancadas de Chuva";
  if (code >= 95) return "Tempestade";
  return "Parcialmente Nublado";
}

async function fetchOsascoWeather(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=-23.5329&longitude=-46.7917&current=temperature_2m,weather_code&timezone=America/Sao_Paulo",
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (response.ok) {
      const data: any = await response.json();
      if (data && data.current) {
        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        return `${temp}°C - ${mapWeatherCode(code)}`;
      }
    }
  } catch (err: any) {
    console.warn("[Weather Scheduler] Falha ao consultar Open-Meteo:", err.message || err);
  }
  return weatherPresets[Math.floor(Math.random() * weatherPresets.length)];
}

async function fetchLiveNews(): Promise<string[]> {
  const feeds = [
    "https://g1.globo.com/rss/g1/sao-paulo/",
    "https://g1.globo.com/rss/g1/esportes/"
  ];
  const items: string[] = [];
  for (const url of feeds) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const text = await response.text();
        const titles = [...text.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)].map(match => match[1].trim());
        const fallbackTitles = titles.length > 0 ? titles : [...text.matchAll(/<title>(.*?)<\/title>/g)].map(match => match[1].trim());
        
        const filtered = fallbackTitles
          .filter(t => t && t !== "g1 > São Paulo" && t !== "g1 > Esportes" && !t.includes("G1") && !t.includes("g1"))
          .map(t => t.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim());
        items.push(...filtered.slice(0, 6));
      }
    } catch (err: any) {
      console.warn(`[News Scheduler] Falha ao carregar RSS de ${url}:`, err.message || err);
    }
  }
  return items;
}

// Background buffer memory for current news list
let rotatingNewsList: string[] = [...newsPresets];

async function updateWeatherAndNews() {
  try {
    const weather = await fetchOsascoWeather();
    tvState.temperature = weather;

    const liveTitles = await fetchLiveNews();
    if (liveTitles && liveTitles.length > 0) {
      rotatingNewsList = liveTitles;
    }

    if (rotatingNewsList.length > 0) {
      const randNews = rotatingNewsList[Math.floor(Math.random() * rotatingNewsList.length)];
      tvState.newsTicker = randNews.toUpperCase();
    }
    
    tvState.updatedAt = new Date().toISOString();
    broadcastState();
  } catch (err) {}
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
      // Create pre-configured monitor or dynamic monitor instantly on-the-fly (CRIO SOZINHO!)
      const presetsPool = ["ysz5S6PUM-U", "S_dfq9rFWAE", "5gK9m6W-i8E", "_eH8u94IkyY"];
      const shuffled = [...presetsPool].sort(() => 0.5 - Math.random());
      const initialPlaylist = shuffled.slice(0, 2);

      const resolvedName = id === "terminal-principal" 
        ? "Monitor Principal - LANHOUSE24H" 
        : (name || `Monitor ${id.toUpperCase()}`);

      const resolvedLocation = id === "terminal-principal"
        ? "Terminal Central - LANHOUSE24H"
        : "Avenida Zumbi dos Palmares";

      const newMonitor = {
        id,
        name: resolvedName,
        location: resolvedLocation,
        customBusLines: "035/034/466X1",
        playlist: initialPlaylist,
        currentVideoIndex: 0,
        isPlaying: true,
        mute: true,
        orientation: orientation || "landscape",
        ip: clientIp,
        isOnline: true
      };

      tvState.monitors.push(newMonitor);
      changed = true;
      console.log(`[Presence] Novo monitor registrado dinamicamente por ping (${clientIp}): ${id} (Nome: ${resolvedName})`);
    } else {
      // Sync parameters safely - DO NOT override orientation or playlist of the server using client-side pings!
      // Server-side / remote control is the source of truth for orientation and playlist!
      const monitor = tvState.monitors[existingIndex];
      
      // Update IP and online status if it changed
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
  // Update bus schedules dynamically every 15 seconds to reflect the correct real clock timer countdown
  const busInterval = setInterval(updateBusTimes, 15000);
  // Periodically fluctuate weather and rotate news items every 90 seconds
  const weatherNewsInterval = setInterval(updateWeatherAndNews, 90000);

  // Instantly pull news and calculate correct timetables on boot
  setTimeout(() => {
    updateWeatherAndNews().catch(() => {});
    updateBusTimes();
  }, 1000);

  // Connection manager: Safe tracking of monitor online status and automatic 5-minute timeout deletion (apaga sozinho)
  const presenceInterval = setInterval(() => {
    const now = Date.now();
    const cutoffOnline = now - 15000; // 15 seconds online state cutoff
    const cutoffDelete = now - 300000; // 5 minutes inactivity cutoff (desaparece para manutenção!)
    let changed = false;

    const remainingMonitors: any[] = [];

    tvState.monitors.forEach(m => {
      const lastActive = monitorActivity[m.id];
      
      // If we don't have activity recorded yet, assume it was just added in this session and keep it
      if (lastActive !== undefined && lastActive < cutoffDelete) {
        changed = true;
        console.log(`[Presence] Monitor ${m.id} (${m.name}) sem sinal há mais de 5 minutos, apagando de forma automática para manutenção.`);
        return; // Filter out/delete this monitor automatically
      }

      // Check online status
      // We also track terminal-principal online state based on pings for strict alignment, but allow safe defaults if just opened
      const isActuallyOnline = lastActive ? lastActive >= cutoffOnline : true;

      if (m.isOnline !== isActuallyOnline) {
        changed = true;
        remainingMonitors.push({ ...m, isOnline: isActuallyOnline });
      } else {
        remainingMonitors.push(m);
      }
    });

    if (changed) {
      tvState.monitors = remainingMonitors;
      tvState.updatedAt = new Date().toISOString();
      saveStateToDisk(tvState);
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
