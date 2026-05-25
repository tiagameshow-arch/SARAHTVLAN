import { useState, useEffect, useRef, FormEvent, ReactNode, Dispatch, SetStateAction } from "react";
import { 
  Tv, 
  Smartphone, 
  Trash2, 
  Plus, 
  Shuffle, 
  Send, 
  CloudSun, 
  CloudRain, 
  Sun, 
  Thermometer, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink,
  Bus,
  Clock,
  Info,
  Maximize,
  HelpCircle,
  Megaphone,
  Settings,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronUp,
  ChevronDown,
  ListMusic,
  PlusCircle,
  Laptop,
  FileVideo
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BusLine, TVState, MonitorState } from "./types";
// @ts-ignore
import weatherWallpaper from "./assets/images/weather_wallpaper_1779472843262.png";

interface YouTubePlayerProps {
  videoId: string;
  mute: boolean;
  onEnded: () => void;
  className?: string;
  title?: string;
}

function YouTubePlayer({ videoId, mute, onEnded, className, title }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    let active = true;

    // Load YouTube IFrame Player API if not already loaded
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!active || !containerRef.current) return;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error("Erro destruindo player:", e);
        }
        playerRef.current = null;
      }

      const placeholder = document.createElement("div");
      placeholder.style.width = "100%";
      placeholder.style.height = "100%";
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(placeholder);

      playerRef.current = new (window as any).YT.Player(placeholder, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: mute ? 1 : 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          showinfo: 0,
          fs: 0,
          disablekb: 1,
        },
        events: {
          onReady: (event: any) => {
            if (active && event.target) {
              event.target.playVideo();
              if (mute) {
                event.target.mute();
              } else {
                event.target.unMute();
              }
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED is 0
            if (active && event.data === 0) {
              onEnded();
            }
          },
          onError: (event: any) => {
            console.error("YouTube Player Error:", event.data);
            // On error (such as restricted embedding), advance to next in 2.5s
            setTimeout(() => {
              if (active) onEnded();
            }, 2500);
          }
        }
      });
    };

    const tryInit = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        initPlayer();
        return true;
      }
      return false;
    };

    let intervalId: any = null;

    if (!tryInit()) {
      // Poll every 150ms just in case script loads but callback is not executed/missed
      intervalId = setInterval(() => {
        if (tryInit()) {
          clearInterval(intervalId);
        }
      }, 150);

      // Register or supplement onYouTubeIframeAPIReady
      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevCallback) {
          try { prevCallback(); } catch (e) {}
        }
        tryInit();
      };
    }

    return () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.unMute === "function") {
      try {
        if (mute) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
        }
      } catch (e) {
        // ignore
      }
    }
  }, [mute]);

  return <div ref={containerRef} className={className} title={title} />;
}

// Suggested preset YouTube IDs for digital signage previewing
const YOUTUBE_PRESETS = [
  { id: "ysz5S6PUM-U", label: "Drones (Cidades e Natureza)" },
  { id: "S_dfq9rFWAE", label: "Metrópoles à Noite" },
  { id: "5gK9m6W-i8E", label: "Lojas e Promoções" },
  { id: "_eH8u94IkyY", label: "Avenida Paulista / Trânsito" }
];

const BACKGROUND_PRESETS = {
  "concrete-wood": {
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
    label: "Madeira e Concreto (Ambientação Oficina/Lobby)"
  },
  "modern-lounge": {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    label: "Lounge Executivo Escandinavo"
  },
  "minimalist": {
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80",
    label: "Minimalista Clássico com Sombras"
  },
  "studio": {
    url: "https://images.unsplash.com/photo-1517502443077-44c457f5c71a?auto=format&fit=crop&w=1600&q=80",
    label: "Estúdio de Criação Tecnológico"
  }
};


export default function App() {
  // Playground state for user-selected tab
  // "control": Only the Remote control smartphone (Tab 1)
  // "monitor": The TV Monitor and Passenger cellphone (Tab 2) where residents see announcements & ad commercials
  const [activeTab, setActiveTab] = useState<"control" | "monitor">("control");

  // Phone remote control tab state
  const [phoneControlTab, setPhoneControlTab] = useState<"telas" | "playlist" | "ajustes">("telas");
  // Custom video input inside the mobile phone remote control
  const [newPhoneVideoInput, setNewPhoneVideoInput] = useState<string>("");

  // Slide state inside the passenger cellphone: "weather" (immersion wallpaper) or "transit" (bus stops)
  const [passengerScreenSlide, setPassengerScreenSlide] = useState<"weather" | "transit">("weather");

  // URL mode selector (supports full-screen preview modes: TV standalone or passenger phone standalone)
  const [urlMode, setUrlMode] = useState<string | null>(null);
  const [urlMonitorId, setUrlMonitorId] = useState<string | null>(null);

  // Custom positioning, scaling and room background controls for ABA 2
  const [tvX, setTvX] = useState<number>(30);
  const [tvY, setTvY] = useState<number>(0);
  const [tvScale, setTvScale] = useState<number>(1.02);
  const [phoneX, setPhoneX] = useState<number>(-20);
  const [phoneY, setPhoneY] = useState<number>(40);
  const [phoneScale, setPhoneScale] = useState<number>(0.92);
  const [bgStyle, setBgStyle] = useState<"concrete-wood" | "modern-lounge" | "minimalist" | "studio">("concrete-wood");
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUrlMode(params.get("mode"));
    setUrlMonitorId(params.get("monitor"));
  }, []);

  // Synchronized state with the mock node/express server
  const [tvState, setTvState] = useState<TVState>({
    temperature: "17°C - Nublado",
    newsTicker: "NOTÍCIAS DE OSASCO: Novas linhas de ônibus integradas no Parque Palmares atendem de forma direta a Avenida Zumbi dos Palmares e a região de Osasco!",
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
        mute: false
      },
      {
        id: "plataforma-a",
        name: "Plataforma A - Saídas Centro",
        playlist: ["_eH8u94IkyY", "ysz5S6PUM-U"],
        currentVideoIndex: 0,
        isPlaying: true,
        mute: false
      },
      {
        id: "plataforma-b",
        name: "Plataforma B - Linhas de Bairro",
        playlist: ["5gK9m6W-i8E", "S_dfq9rFWAE"],
        currentVideoIndex: 0,
        isPlaying: true,
        mute: false
      }
    ],
    updatedAt: new Date().toISOString()
  });

  // Selected monitor to manage/view in the remote and simulation tabs
  const [selectedMonitorId, setSelectedMonitorId] = useState<string>("terminal-principal");

  // Local draft states inside the remote control panel
  const [temperatureInput, setTemperatureInput] = useState(tvState.temperature ?? "");
  const [newsInput, setNewsInput] = useState(tvState.newsTicker ?? "");
  const [busLinesDraft, setBusLinesDraft] = useState<BusLine[]>(tvState.busLines ?? []);
  
  // Custom video input (add video to active monitor's playlist)
  const [newVideoInput, setNewVideoInput] = useState("");
  const [newMonitorNameInput, setNewMonitorNameInput] = useState("");
  
  // Custom bus schedules controller
  const [newLineName, setNewLineName] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [timeDropdown, setTimeDropdown] = useState("MIN");

  // UX support values
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [tvMuted, setTvMuted] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [timeState, setTimeState] = useState<string>("");
  const [localVideos, setLocalVideos] = useState<{[id: string]: { url: string, name: string }}>(() => ({}));
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    const selectedMon = tvState.monitors.find(m => m.id === selectedMonitorId);
    if (selectedMon) {
      setRenameValue(selectedMon.name);
    }
  }, [selectedMonitorId, tvState.monitors]);

  // Keep a mutable ref of the state so the SSE/EventSource useEffect doesn't have to keep reconnecting on state changes
  const tvStateRef = useRef<TVState>(tvState);
  useEffect(() => {
    tvStateRef.current = tvState;
  }, [tvState]);

  // Automatically fetch synchronized state on boot and set up EventStream (SSE)
  useEffect(() => {
    fetchState();

    const eventSource = new EventSource("/api/stream");
    
    eventSource.onmessage = (event) => {
      try {
        const liveData = JSON.parse(event.data) as TVState;
        setTvState(liveData);
        
        // Soft align input values if they currently match previous central state
        setTemperatureInput((prev) => (prev === tvStateRef.current.temperature ? (liveData.temperature ?? "") : prev));
        setNewsInput((prev) => (prev === tvStateRef.current.newsTicker ? (liveData.newsTicker ?? "") : prev));
        setBusLinesDraft((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(tvStateRef.current.busLines)) {
            return liveData.busLines ?? [];
          }
          return prev;
        });

        // Keep selected monitor aligned if it was deleted on another client
        if (liveData.monitors && liveData.monitors.length > 0) {
          setSelectedMonitorId((current) => {
            if (liveData.monitors.some(m => m.id === current)) return current;
            return liveData.monitors[0].id;
          });
        }
      } catch (e) {
        console.error("Erro no processamento SSE:", e);
      }
    };

    eventSource.onerror = () => {
      console.warn("Reconectando canal de transmissão em background...");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // System clock machine
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeState(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // API Call: Fetch standard state from Express
  const fetchState = async () => {
    try {
      const resp = await fetch("/api/state");
      if (resp.ok) {
        const data = await resp.json();
        setTvState(data);
        setTemperatureInput(data.temperature ?? "");
        setNewsInput(data.newsTicker ?? "");
        setBusLinesDraft(data.busLines ?? []);
      }
    } catch (e) {
      console.error("Erro de sincronização REST:", e);
    }
  };

  // Sync monitors array to the Express backend (called instantly on playlist events)
  const syncMonitorsToServer = async (latestMonitors: MonitorState[]) => {
    try {
      const response = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...tvStateRef.current,
          monitors: latestMonitors
        })
      });
      if (response.ok) {
        const data = await response.json();
        setTvState(data.state);
      }
    } catch (e) {
      console.error("Erro ao sincronizar monitores:", e);
    }
  };

  // Extract ID safe check
  function getCleanedId(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return "";
    
    // If it's a local video code, preserve as-is
    if (trimmed.startsWith("local-")) {
      return trimmed;
    }

    if (trimmed.startsWith("vdoninja-")) {
      return trimmed;
    }

    // Support VDO.Ninja links
    if (trimmed.includes("vdo.ninja")) {
      try {
        const urlObj = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
        const viewParam = urlObj.searchParams.get("view") || urlObj.searchParams.get("push") || urlObj.searchParams.get("room") || urlObj.searchParams.get("scene");
        if (viewParam) {
          return `vdoninja-${viewParam}`;
        }
        // If there is a pathname segment and no clear parameter, try parsing it
        const pathSegments = urlObj.pathname.split("/").filter(Boolean);
        if (pathSegments.length > 0 && pathSegments[0] !== "alpha" && pathSegments[0] !== "beta") {
          return `vdoninja-${pathSegments[pathSegments.length - 1]}`;
        }
      } catch (e) {
        // Fallback split extraction
        const match = trimmed.match(/[?&](?:view|push|room|scene)=([^&#\?]+)/);
        if (match && match[1]) {
          return `vdoninja-${match[1]}`;
        }
      }
      return `vdoninja-${trimmed}`;
    }

    try {
      // Handle live streams
      if (trimmed.includes("/live/")) {
        const parts = trimmed.split("/live/");
        if (parts[1]) {
          const id = parts[1].split(/[?#&]/)[0];
          if (id.length === 11) return id;
        }
      }

      // Handle shorts
      if (trimmed.includes("/shorts/")) {
        const parts = trimmed.split("/shorts/");
        if (parts[1]) {
          const id = parts[1].split(/[?#&]/)[0];
          if (id.length === 11) return id;
        }
      }

      // Handle embed
      if (trimmed.includes("/embed/")) {
        const parts = trimmed.split("/embed/");
        if (parts[1]) {
          const id = parts[1].split(/[?#&]/)[0];
          if (id.length === 11) return id;
        }
      }

      // Handle youtu.be/ID
      if (trimmed.includes("youtu.be/")) {
        const parts = trimmed.split("youtu.be/");
        if (parts[1]) {
          const id = parts[1].split(/[?#&]/)[0];
          if (id.length === 11) return id;
        }
      }
      
      // Handle watch?v=ID or other params
      if (trimmed.includes("v=")) {
        const reg = /[?&]v=([^&#\?]+)/;
        const match = trimmed.match(reg);
        if (match && match[1] && match[1].length === 11) {
          return match[1];
        }
      }

      // Universal regex search for 11-char YouTube ID (including live and shorts variants)
      const regObj = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const matchObj = trimmed.match(regObj);
      if (matchObj && matchObj[1]) {
        return matchObj[1];
      }
    } catch (e) {
      console.error("Erro ao analisar URL do YouTube:", e);
    }

    // Direct 11-character code test
    const cleanIdReg = /^[a-zA-Z0-9_-]{11}$/;
    if (cleanIdReg.test(trimmed)) {
      return trimmed;
    }

    return trimmed;
  }

  // Push metadata updates to API (temperature, newsTicker, bus lines)
  const submitToTV = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);

    const payload = {
      temperature: temperatureInput,
      newsTicker: newsInput,
      busLines: busLinesDraft,
      monitors: tvState.monitors // maintain current monitors
    };

    try {
      const response = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        setTvState(data.state);
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 2000);
      }
    } catch (e) {
      console.error("Erro ao transmitir metadados:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Instant actions for selected monitor
  const handleAddVideo = (monitorId: string, videoUrlOrId: string) => {
    if (!videoUrlOrId.trim()) return;
    const vidId = getCleanedId(videoUrlOrId);
    
    const updated = tvState.monitors.map(m => {
      if (m.id === monitorId) {
        const nextPlaylist = [...m.playlist, vidId];
        return {
          ...m,
          playlist: nextPlaylist,
          currentVideoIndex: nextPlaylist.length - 1 // Start playing the new video instantly
        };
      }
      return m;
    });
    setNewVideoInput("");
    setNewPhoneVideoInput("");
    syncMonitorsToServer(updated);
  };

  const handleDeleteVideo = (monitorId: string, videoIndex: number) => {
    const updated = tvState.monitors.map(m => {
      if (m.id === monitorId) {
        const nextPlaylist = m.playlist.filter((_, idx) => idx !== videoIndex);
        let nextIdx = m.currentVideoIndex;
        if (nextIdx >= nextPlaylist.length) {
          nextIdx = Math.max(0, nextPlaylist.length - 1);
        }
        return {
          ...m,
          playlist: nextPlaylist,
          currentVideoIndex: nextIdx
        };
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  const handleMoveVideo = (monitorId: string, index: number, direction: "up" | "down") => {
    const updated = tvState.monitors.map(m => {
      if (m.id === monitorId) {
        const nextPlaylist = [...m.playlist];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < nextPlaylist.length) {
          const temp = nextPlaylist[index];
          nextPlaylist[index] = nextPlaylist[targetIndex];
          nextPlaylist[targetIndex] = temp;
          
          let nextActiveIdx = m.currentVideoIndex;
          if (m.currentVideoIndex === index) {
            nextActiveIdx = targetIndex;
          } else if (m.currentVideoIndex === targetIndex) {
            nextActiveIdx = index;
          }
          
          return {
            ...m,
            playlist: nextPlaylist,
            currentVideoIndex: nextActiveIdx
          };
        }
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  const handleNextVideo = (monitorId: string) => {
    const updated = tvState.monitors.map(m => {
      if (m.id === monitorId && m.playlist.length > 0) {
        return {
          ...m,
          currentVideoIndex: (m.currentVideoIndex + 1) % m.playlist.length
        };
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  const handlePrevVideo = (monitorId: string) => {
    const updated = tvState.monitors.map(m => {
      if (m.id === monitorId && m.playlist.length > 0) {
        return {
          ...m,
          currentVideoIndex: (m.currentVideoIndex - 1 + m.playlist.length) % m.playlist.length
        };
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  const handleSelectActiveVideo = (monitorId: string, index: number) => {
    const updated = tvState.monitors.map(m => {
      if (m.id === monitorId) {
        return {
          ...m,
          currentVideoIndex: index
        };
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  const handleTogglePlay = (monitorId: string) => {
    const updated = tvState.monitors.map(m => {
      if (m.id === monitorId) {
        return { ...m, isPlaying: !m.isPlaying };
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  const handleToggleMute = (monitorId: string) => {
    const updated = tvState.monitors.map(m => {
      if (m.id === monitorId) {
        return { ...m, mute: !m.mute };
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  const handleCreateMonitor = (e: FormEvent) => {
    e.preventDefault();
    if (!newMonitorNameInput.trim()) return;
    const newId = `monitor-${Date.now()}`;
    const newMonitor: MonitorState = {
      id: newId,
      name: newMonitorNameInput.trim(),
      playlist: ["ysz5S6PUM-U"], // start with city drone
      currentVideoIndex: 0,
      isPlaying: true,
      mute: false
    };
    const updatedMonitors = [...tvState.monitors, newMonitor];
    setNewMonitorNameInput("");
    setSelectedMonitorId(newId);
    syncMonitorsToServer(updatedMonitors);
  };

  const handleDeleteMonitor = (monitorId: string) => {
    if (tvState.monitors.length <= 1) {
      alert("Você precisa manter pelo menos um monitor ativo no terminal!");
      return;
    }
    const updatedMonitors = tvState.monitors.filter(m => m.id !== monitorId);
    if (selectedMonitorId === monitorId) {
      setSelectedMonitorId(updatedMonitors[0].id);
    }
    syncMonitorsToServer(updatedMonitors);
  };

  const handleRenameMonitor = (monitorId: string, newName: string) => {
    if (!newName.trim()) return;
    const updated = tvState.monitors.map(m => {
      if (m.id === monitorId) {
        return {
          ...m,
          name: newName.trim()
        };
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  const handleRedefineOrder = () => {
    const sorted = [...busLinesDraft].sort((a, b) => {
      const numA = parseInt(a.time) || 999;
      const numB = parseInt(b.time) || 999;
      return numA - numB;
    });
    setBusLinesDraft(sorted);
  };

  const handleDeleteBus = (id: string) => {
    setBusLinesDraft(busLinesDraft.filter(b => b.id !== id));
  };

  const handleAddBus = (e: FormEvent) => {
    e.preventDefault();
    if (!newLineName.trim()) return;

    const mins = customMinutes.trim() ? customMinutes.trim() : "5";
    const finalTime = `${mins} ${timeDropdown}`;

    const newBus: BusLine = {
      id: Date.now().toString(),
      line: newLineName.trim().toUpperCase(),
      time: finalTime
    };

    setBusLinesDraft([...busLinesDraft, newBus]);
    setNewLineName("");
    setCustomMinutes("");
  };

  const applyPresetVideo = (id: string) => {
    // Add preset video to selected monitor's playlist
    handleAddVideo(selectedMonitorId, id);
  };

  const handleCopyLink = (path: string, key: string) => {
    const full = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(full);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const getWeatherIcon = (temp: string) => {
    const lower = temp.toLowerCase();
    if (lower.includes("chuva") || lower.includes("chuv") || lower.includes("tempestade")) {
      return <CloudRain className="w-8 h-8 text-cyan-400" />;
    }
    if (lower.includes("nuv") || lower.includes("nub") || lower.includes("nublado")) {
      return <CloudSun className="w-8 h-8 text-slate-350" />;
    }
    return <Sun className="w-8 h-8 text-amber-400" />;
  };

  const isDraftDirty = (
    temperatureInput !== tvState.temperature ||
    newsInput !== tvState.newsTicker ||
    JSON.stringify(busLinesDraft) !== JSON.stringify(tvState.busLines)
  );

  // Active monitor selected for visual preview in Aba 2
  const [activePreviewMonitorId, setActivePreviewMonitorId] = useState<string>("grid");

  // Standalone modes switcher
  if (urlMode === "tv") {
    const targetMonitorId = urlMonitorId || "terminal-principal";
    const monitorObj = tvState.monitors.find(m => m.id === targetMonitorId) || tvState.monitors[0];
    
    if (!monitorObj) {
      return (
        <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-400 p-4 font-mono select-none">
          <Tv className="w-12 h-12 text-emerald-500 animate-spin mb-3" />
          <p>Conectando ao retransmissor central de sinal físico...</p>
        </div>
      );
    }

    const currentVidId = monitorObj.playlist[monitorObj.currentVideoIndex] || "ysz5S6PUM-U";

    return (
      <div 
        className="w-screen h-screen overflow-hidden font-sans flex flex-col justify-between select-none relative bg-cover bg-center"
        style={{ backgroundImage: `url(${BACKGROUND_PRESETS[bgStyle].url})` }}
      >
        {/* Shadow Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/55 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-50 z-0" />

        {/* ROW 1: ELEGANT SOLID TOP BAR / CABEÇALHO DA TV */}
        <div className="h-14 bg-black/85 backdrop-blur-md border-b border-white/10 px-4 md:px-6 flex items-center justify-between z-20 shrink-0 shadow-lg select-none">
          {/* Leftside: Monitor details */}
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white text-xs md:text-sm font-mono tracking-widest font-black uppercase">SINAL ATIVO: {monitorObj.name}</span>
          </div>

          {/* Interactive Sound Control Mode Switcher */}
          <button 
            onClick={() => handleToggleMute(monitorObj.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-[9px] font-bold uppercase transition active:scale-95 cursor-pointer select-none bg-black/60 ${
              monitorObj.mute 
                ? "border-rose-500/40 text-rose-400 hover:bg-rose-950/20" 
                : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/20"
            }`}
          >
            {monitorObj.mute ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Sem Som (Ativar Áudio)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Com Som (Ativado)</span>
              </>
            )}
          </button>
          
          {/* Rightside: Elegant Electronic Digital Clock */}
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-mono text-base md:text-2xl font-black tracking-widest tabular-nums drop-shadow-[0_0_8px_rgba(52,211,153,0.45)] leading-none">{timeState}</span>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[7px] text-stone-450 font-extrabold uppercase tracking-widest leading-none">Horário de Brasília</span>
              <span className="text-[6px] text-emerald-500/80 font-mono font-bold tracking-widest mt-1">RETRANSMISSOR RUA</span>
            </div>
          </div>
        </div>

        {/* ROW 2: SPLIT SCREEN (SMARTPHONE + TV STREAM) */}
        <div className="flex-grow w-full relative flex items-center justify-center p-4 md:p-8 z-10 overflow-hidden">
          <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 xl:gap-16">
            
            {/* Left Layer: Smartphone carrying Weather, Schedules, bus stops */}
            <div className="w-full max-w-[260px] sm:max-w-[280px] shrink-0 transition-all duration-300">
              <div className="w-full">
                {renderPassengerPhone()}
              </div>
            </div>

            {/* Right Layer: Physical TV Frame with Stream */}
            <div className="flex-grow flex flex-col items-center w-full max-w-[960px]">
              <div className="relative bg-[#050505] border-[10px] border-stone-850 rounded-[1.8rem] p-1 shadow-2xl aspect-video overflow-hidden w-full flex flex-col justify-between items-stretch">
                
                {/* Simulated Screen Header */}
                <div className="relative w-full h-8 bg-black/75 backdrop-blur-sm border-b border-white/10 px-3 flex items-center justify-between z-10 select-none pointer-events-none shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white text-[8px] sm:text-[9.5px] font-mono tracking-wider font-extrabold uppercase truncate max-w-[200px]">
                      {monitorObj.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-mono text-[9px] sm:text-[11px] font-black tracking-wider leading-none">{timeState}</span>
                    <span className="text-[5px] sm:text-[6px] text-stone-400 uppercase font-bold tracking-widest leading-none">RUA</span>
                  </div>
                </div>

                {/* Simulated Screen Video Body */}
                <div className="flex-grow w-full h-full relative pointer-events-none z-0 bg-black overflow-hidden flex items-center justify-center">
                  {currentVidId ? (
                    currentVidId.startsWith("local-") ? (
                      localVideos[currentVidId] ? (
                        <video
                          src={localVideos[currentVidId]?.url}
                          autoPlay
                          muted={monitorObj.mute}
                          onEnded={() => handleNextVideo(monitorObj.id)}
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center text-center p-4 text-stone-400 font-mono select-auto pointer-events-auto">
                          <FileVideo className="w-8 h-8 text-yellow-500 mb-2 animate-bounce" />
                          <p className="text-[10px] font-bold uppercase text-white">VÍDEO DO SEU PC</p>
                          <p className="text-[8px] text-stone-550 max-w-xs mt-1">Carregue o arquivo de vídeo no painel para reproduzir standalone.</p>
                        </div>
                      )
                    ) : currentVidId.startsWith("vdoninja-") ? (
                      <iframe
                        src={`https://vdo.ninja/?view=${currentVidId.replace("vdoninja-", "")}&autoplay=1&bgopacity=0&transparent=1${monitorObj.mute ? "&mute=1" : ""}`}
                        allow="autoplay; camera; microphone; fullscreen; picture-in-picture"
                        className="absolute inset-0 w-full h-full border-none pointer-events-auto"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <YouTubePlayer
                        videoId={currentVidId}
                        mute={monitorObj.mute}
                        onEnded={() => handleNextVideo(monitorObj.id)}
                        className="absolute inset-0 w-full h-full pointer-events-none border-none scale-[1.01]"
                        title="Sinal Retransmissor de Merchandising"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 bg-stone-950 flex items-center justify-center">
                      <p className="text-white/40 text-xs font-mono">Sem vídeos inseridos...</p>
                    </div>
                  )}

                  {/* Playback Sound Override Overlay */}
                  {monitorObj.mute && (
                    <button 
                      onClick={() => handleToggleMute(monitorObj.id)}
                      className="absolute bottom-3 right-3 z-20 bg-rose-650 hover:bg-rose-500 hover:scale-105 active:scale-95 text-white border border-rose-455 px-3 py-1 text-[8.5px] rounded-xl flex items-center gap-1.5 shadow-xl transition-all cursor-pointer pointer-events-auto shadow-rose-950/50"
                    >
                      <VolumeX className="w-3 h-3 text-white animate-bounce" />
                      <span className="font-sans font-extrabold uppercase tracking-normal">Ativar Som</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Physical Support Base Decor */}
              <div className="flex flex-col items-center pointer-events-none select-none z-0 mt-1">
                <div className="w-8 h-4 bg-stone-850 border-x border-stone-800 opacity-80" />
                <div className="w-24 h-1.5 bg-stone-800 rounded-t-2xl opacity-80" />
              </div>
            </div>

          </div>
        </div>

        {/* ROW 3: SCROLLING TICKER NEWS FOOTER AT THE VERY BOTTOM */}
        <div className="h-20 bg-[#001f17] border-t-4 border-yellow-400 flex items-center z-20 shrink-0 shadow-lg select-none relative">
          <div className="h-full px-8 bg-yellow-400 text-stone-900 font-display font-black text-xs sm:text-sm uppercase flex items-center gap-2.5 shrink-0 shadow-lg">
            <Megaphone className="w-5 h-5 text-stone-950 shrink-0" />
            <span>NOTÍCIAS DO TERMINAL</span>
          </div>
          <div className="overflow-hidden relative w-full h-full flex items-center text-white">
            <div className="absolute whitespace-nowrap animate-marquee flex items-center text-base sm:text-lg md:text-xl font-black uppercase tracking-wider pl-6">
              <span className="text-yellow-400 mr-4 text-sm sm:text-base">📢</span>
              <span>{tvState.newsTicker}</span>
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (urlMode === "passenger") {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[340px]">
          {renderPassengerPhone()}
        </div>
      </div>
    );
  }

  const activeMonitor = tvState.monitors.find(m => m.id === selectedMonitorId) || tvState.monitors[0];

  return (
    <div id="app-root" className="min-h-screen bg-stone-950 text-stone-100 font-sans flex flex-col justify-between selection:bg-yellow-405 selection:text-stone-900">
      
      {/* Dynamic Header */}
      <header className="bg-stone-900 border-b border-stone-800 py-3.5 px-6 shadow-md shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950/85 border border-emerald-500/25 rounded-xl shadow-inner animate-pulse">
              <Tv className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-white font-display text-base lg:text-lg font-bold tracking-tight">Retransmissor & TV de Sinalização</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const params = new URLSearchParams();
                params.set("mode", "tv");
                params.set("monitor", selectedMonitorId);
                window.open(`${window.location.origin}?${params.toString()}`, "_blank");
              }}
              className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-black rounded-lg text-xs transition flex items-center gap-1.5 shadow-lg shadow-yellow-500/10 animate-fade-in"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              TV Selecionada Independente ↗
            </button>
          </div>
        </div>
      </header>

      {/* Main Testing Navigation Tabs */}
      <div className="bg-stone-900/80 border-b border-stone-800/80 py-2.5 px-6 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          
          <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("control")}
              className={`flex-1 sm:flex-initial px-6 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-2.5 ${
                activeTab === "control"
                  ? "bg-[#165139] text-emerald-100 shadow-md border border-[#1d4d3a]/60"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              ABA 1: CONTROLE CELULAR
            </button>
            
            <button
              onClick={() => setActiveTab("monitor")}
              className={`flex-1 sm:flex-initial px-6 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-2.5 ${
                activeTab === "monitor"
                  ? "bg-[#1e293b] text-cyan-200 shadow-md border border-[#334155]/60"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Tv className="w-4 h-4" />
              ABA 2: MONITOR (TV E CELULAR)
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-stone-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Auto-Scheduler: <span className="text-emerald-400 font-bold">Rodando</span>
            </div>
            <div className="h-4 w-px bg-stone-800" />
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-stone-400">
              Sincronização: <span className="text-emerald-400 font-bold">SSE Ativa</span>
            </div>
          </div>

        </div>
      </div>

      {/* MAIN CONTAINER ACTIVE SWITCHBOARD */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-4 lg:p-6 flex flex-col justify-start">
        
        <AnimatePresence mode="wait">
          
               {/* TAB 1 CONTENT: NEW COMBINED MULTI-MONITOR REMOTE CONTROL */}
          {activeTab === "control" && (
            <motion.div
              key="control-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center justify-center py-4 w-full"
            >
              {/* Center Stage Controller Frame */}
              <div className="w-full max-w-[340px] relative">
                <div className="flex justify-between items-center px-1 mb-2">
                  <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> CONTROLE TÁTIL DE OSASCO
                  </span>
                  <span className="text-[9px] font-mono bg-emerald-950 border border-emerald-800/40 text-emerald-400 rounded px-1.5 py-0.5 font-bold animate-pulse">
                    SINAL ONLINE
                  </span>
                </div>
                
                {renderRemotePhone()}
              </div>
            </motion.div>
          )}

          {/* TAB 2 CONTENT: CLEAN IMMERSIVE SINGLE SCREEN SIMULATOR */}
          {activeTab === "monitor" && (
            <motion.div
              key="monitor-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4 py-2"
            >
              {/* IMMERSIVE 3D SIMULATED ENVIRONMENT CONTAINER */}
              <div 
                className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-stone-800 bg-cover bg-center min-h-[640px] flex items-center justify-center p-4 sm:p-8 transition-all duration-700 select-none pb-12 pt-16"
                style={{ backgroundImage: `url(${BACKGROUND_PRESETS[bgStyle].url})` }}
              >
                {/* Vignette Shadow overlays for incredible realism and screen glow blend */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/35 pointer-events-none z-0" />
                <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-40 z-0" />
                
                {/* Simulated ambient wall bounce glow mapping based on active color */}
                <div className="absolute bottom-24 left-1/3 w-[50%] h-48 bg-emerald-500/10 filter blur-[90px] rounded-full pointer-events-none mix-blend-screen" />

                {/* THE SIMULATION WORKSPACE SANDBOX */}
                <div className="relative w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 z-10 py-6">
                  
                  {/* Left Layer: Cellphone with adjust offsets */}
                  <div 
                    className="transition-transform duration-100 ease-out z-20 flex justify-center w-full md:w-auto"
                    style={{ 
                      transform: `translate(${phoneX}px, ${phoneY}px) scale(${phoneScale})`,
                      filter: "drop-shadow(0 25px 40px rgba(0,0,0,0.9))"
                    }}
                  >
                    <div className="w-full max-w-[275px] shrink-0">
                      {renderPassengerPhone()}
                    </div>
                  </div>

                  {/* Widescreen TV Monitor offset */}
                  {(() => {
                    const activeMonitorObj = tvState.monitors.find(m => m.id === selectedMonitorId) || tvState.monitors[0];
                    if (!activeMonitorObj) return null;
                    const activeVideoId = activeMonitorObj.playlist[activeMonitorObj.currentVideoIndex] || "ysz5S6PUM-U";
                    return (
                      <div 
                        className="transition-transform duration-100 ease-out z-10 flex flex-col items-center"
                        style={{ 
                          transform: `translate(${tvX}px, ${tvY}px) scale(${tvScale})`,
                          filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.95))"
                        }}
                      >
                        {/* Simulated Sleek Physical TV Frame With YouTube Stream embedded */}
                        <div className="relative bg-[#050505] border-[10px] border-stone-850 rounded-[1.8rem] p-1 shadow-inner aspect-video overflow-hidden w-[340px] sm:w-[560px] md:w-[690px] lg:w-[800px] xl:w-[940px] flex flex-col justify-between items-stretch">
                          
                          {/* Inner Translucent Header on Simulated TV Screen */}
                          <div className="relative w-full h-8 sm:h-9 bg-black/75 backdrop-blur-sm border-b border-white/10 px-3 flex items-center justify-between z-10 select-none pointer-events-none shrink-0">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-white text-[7.5px] sm:text-[9.5px] font-mono tracking-wider font-extrabold uppercase truncate max-w-[130px] sm:max-w-xs">
                                {activeMonitorObj.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-400 font-mono text-[9px] sm:text-[11px] font-black tracking-wider leading-none">{timeState}</span>
                              <span className="text-[5px] sm:text-[6px] text-stone-400 uppercase font-bold tracking-widest leading-none hidden sm:inline">DF</span>
                            </div>
                          </div>

                          {/* Video area inside simulated screen, positioned between header and ticker */}
                          <div className="flex-grow w-full h-full relative pointer-events-none z-0 bg-black overflow-hidden flex items-center justify-center">
                            {activeVideoId ? (
                              activeVideoId.startsWith("local-") ? (
                                localVideos[activeVideoId] ? (
                                  <video
                                    src={localVideos[activeVideoId]?.url}
                                    autoPlay
                                    muted={activeMonitorObj.mute}
                                    onEnded={() => handleNextVideo(activeMonitorObj.id)}
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center text-center p-4 text-stone-400 font-mono select-auto pointer-events-auto">
                                    <FileVideo className="w-8 h-8 text-yellow-500 mb-2 animate-bounce" />
                                    <p className="text-[10px] font-bold uppercase text-white">VÍDEO DO SEU PC</p>
                                    <p className="text-[8px] text-stone-550 max-w-xs mt-1">Carregue o arquivo abaixo ou no painel esquerdo para reproduzir na simulação.</p>
                                  </div>
                                )
                              ) : activeVideoId.startsWith("vdoninja-") ? (
                                <iframe
                                  src={`https://vdo.ninja/?view=${activeVideoId.replace("vdoninja-", "")}&autoplay=1&bgopacity=0&transparent=1${activeMonitorObj.mute ? "&mute=1" : ""}`}
                                  allow="autoplay; camera; microphone; fullscreen; picture-in-picture"
                                  className="absolute inset-0 w-full h-full border-none pointer-events-auto"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <YouTubePlayer
                                  videoId={activeVideoId}
                                  mute={activeMonitorObj.mute}
                                  onEnded={() => handleNextVideo(activeMonitorObj.id)}
                                  className="absolute inset-0 w-full h-full pointer-events-none border-none scale-[1.01]"
                                  title="Sinal Retransmissor de Merchandising"
                                />
                              )
                            ) : (
                              <div className="absolute inset-0 bg-stone-950 flex items-center justify-center">
                                <p className="text-white/40 text-xs font-mono">Sem vídeos inseridos...</p>
                              </div>
                            )}

                            {/* Floating Sound Toggle Button for simulated preview TV - placed float absolute inside the video content container */}
                            {activeMonitorObj.mute && (
                              <button 
                                onClick={() => handleToggleMute(activeMonitorObj.id)}
                                className="absolute bottom-3 right-3 z-20 bg-[#e11d48] hover:bg-rose-500 hover:scale-105 active:scale-95 text-white border border-rose-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl transition-all cursor-pointer pointer-events-auto shadow-rose-950/50"
                              >
                                <VolumeX className="w-3.5 h-3.5 text-white animate-bounce" />
                                <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest">Ativar Som</span>
                              </button>
                            )}
                          </div>

                        </div>

                        {/* Physical Support Support Base Pillar */}
                        <div className="flex flex-col items-center pointer-events-none select-none z-0">
                          <div className="w-10 h-7 bg-stone-850 border-x border-stone-800 shadow-lg" />
                          <div className="w-32 h-2.5 bg-stone-800 rounded-t-2xl shadow" />
                          <div className="w-48 h-1 bg-stone-950 rounded-full opacity-60 filter blur-sm -mt-0.5" />
                        </div>

                      </div>
                    );
                  })()}

                </div>

                {/* Desk Glossy Surface reflection lines representation */}
                <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-5" />
              </div>

              {/* LOWER TICKER NEWS OVERLAY FOR MAX EMBEDDED INTEGRATION */}
              <div className="bg-[#001f17] border border-yellow-405/45 p-3.5 rounded-2xl flex items-center overflow-hidden h-20 shadow-2xl relative z-20">
                <div className="px-5 py-2 bg-yellow-400 text-stone-900 font-display font-black text-sm uppercase h-full flex items-center gap-2.5 shrink-0 rounded-lg shadow-md">
                  <Megaphone className="w-5 h-5 text-stone-950 shrink-0" />
                  <span>SINAL DE NOTÍCIAS DO TERMINAL</span>
                </div>
                <div className="overflow-hidden relative w-full h-full flex items-center text-white/95">
                  <div className="absolute whitespace-nowrap animate-marquee flex items-center text-lg sm:text-xl md:text-2xl font-black uppercase tracking-wider select-none pl-6">
                    <span className="text-yellow-405 mr-3 text-xl sm:text-2xl">📢</span>
                    {tvState.newsTicker}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Constant Footer Banner */}
      <footer className="bg-stone-950 border-t border-stone-900/80 py-4 px-6 text-center text-stone-500 text-xs shrink-0 select-none">
        <p>© 2026 TV Signage Pro - Painel de Controle de Transmissão Multimonitor de Osasco & Esportes.</p>
      </footer>

    </div>
  );

  // ==========================================
  // VIEW: DIGITAL PHONE REMOTE CONTROLLER
  // ==========================================
  function renderRemotePhone() {
    const activeMonitor = tvState.monitors.find(m => m.id === selectedMonitorId) || tvState.monitors[0];
    
    return (
      <div className="w-full bg-[#1c221d] text-emerald-100 rounded-[2.8rem] border-[8px] border-stone-800 p-3.5 shadow-[0_25px_50px_rgba(0,0,0,0.85)] relative max-w-[310px] mx-auto select-none font-sans">
        {/* Remote Head IR Glass window representation */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-3 bg-stone-900 rounded-t-lg border-t border-stone-700" />

        {/* Glossy bezel header & Status Indicator LED */}
        <div className="flex justify-between items-center mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-stone-950 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="text-[7.5px] font-mono font-bold tracking-widest text-stone-400 uppercase select-none">
              SINAL OPERACIONAL
            </span>
          </div>
          <span className="text-[7px] font-mono font-black text-stone-550 uppercase tracking-widest">
            REMOTO OSASCO-XP
          </span>
        </div>

        {/* Small LCD Screen mockup */}
        <div className="bg-[#020d08] border border-[#123122] rounded-xl p-2.5 text-left mb-3 shadow-inner">
          <span className="text-[7px] font-mono font-bold text-stone-550 uppercase block tracking-wider">Monitor Selecionado</span>
          <div className="text-[10.5px] font-mono text-emerald-300 truncate font-black mt-0.5 uppercase tracking-wide">
            {activeMonitor ? activeMonitor.name : "NENHUM DETECTADO"}
          </div>
          <div className="flex justify-between items-center text-[7.5px] font-mono text-stone-400 mt-1">
            <span>PLAYLIST: {activeMonitor?.playlist.length || 0} ITEMS</span>
            <span className="text-yellow-450 font-extrabold">{activeMonitor?.mute ? "🔇 MUTADO" : "🔊 ÁUDIO ATIVO"}</span>
          </div>
        </div>

        {/* Sleek Tab Bar inside the cell phone screen area */}
        <div className="grid grid-cols-3 gap-1 mb-3 bg-stone-950/80 p-1 rounded-xl border border-stone-850/60">
          <button
            type="button"
            onClick={() => setPhoneControlTab("telas")}
            className={`py-1.5 text-[8.5px] font-black uppercase tracking-wider rounded-lg border transition-all duration-150 flex flex-col items-center justify-center gap-0.5 ${phoneControlTab === "telas" ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.3)] font-black' : 'bg-stone-900/60 border-transparent text-stone-400 hover:text-stone-200'}`}
          >
            <Tv className="w-3 h-3" />
            Telas
          </button>
          <button
            type="button"
            onClick={() => setPhoneControlTab("playlist")}
            className={`py-1.5 text-[8.5px] font-black uppercase tracking-wider rounded-lg border transition-all duration-150 flex flex-col items-center justify-center gap-0.5 ${phoneControlTab === "playlist" ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.3)] font-black' : 'bg-stone-900/60 border-transparent text-stone-400 hover:text-stone-200'}`}
          >
            <ListMusic className="w-3 h-3" />
            Playlist
          </button>
          <button
            type="button"
            onClick={() => setPhoneControlTab("ajustes")}
            className={`py-1.5 text-[8.5px] font-black uppercase tracking-wider rounded-lg border transition-all duration-150 flex flex-col items-center justify-center gap-0.5 ${phoneControlTab === "ajustes" ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.3)] font-black' : 'bg-stone-900/60 border-transparent text-stone-400 hover:text-stone-200'}`}
          >
            <Settings className="w-3 h-3" />
            Ajustes
          </button>
        </div>

        {/* TAB 1: MONITORES LIST & REGISTRY */}
        {phoneControlTab === "telas" && (
          <div className="mb-3.5 bg-stone-950/40 p-2 rounded-2xl border border-stone-900/60 flex flex-col gap-2 font-sans">
            <span className="text-[7px] font-mono font-bold text-stone-500 uppercase block tracking-widest text-center">
              MONITORES CONECTADOS ({tvState.monitors.length})
            </span>

            {/* Scrollable list of connected monitors */}
            <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin mt-1">
              {tvState.monitors.map((m, idx) => {
                const isSelected = selectedMonitorId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMonitorId(m.id);
                      setRenameValue(m.name);
                    }}
                    className={`w-full p-2 rounded-xl text-left border cursor-pointer transition-all duration-150 flex items-center justify-between active:scale-98 ${isSelected ? 'bg-yellow-400 border-yellow-500 text-stone-950 shadow-[0_3px_8px_rgba(250,204,21,0.25)]' : 'bg-stone-950 border-stone-850 text-stone-300 hover:bg-stone-900/50'}`}
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-stone-950 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                      <span className="text-[10px] font-black truncate max-w-[155px] uppercase font-mono">{m.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {tvState.monitors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMonitor(m.id)}
                          className={`p-1 transition active:scale-95 ${isSelected ? 'text-stone-900 hover:text-red-700' : 'text-stone-600 hover:text-rose-400'}`}
                          title="Excluir Monitor"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      <span className={`text-[7px] font-mono px-1 py-0.2 rounded shrink-0 ${isSelected ? 'bg-stone-950 text-yellow-400 font-extrabold' : 'bg-stone-900 text-stone-400'}`}>
                        CH {idx + 1}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* In-Phone Monitor addition Form */}
            <div className="border-t border-stone-900/40 pt-1.5 mt-1">
              <span className="text-[7.5px] font-mono font-bold text-stone-550 uppercase tracking-widest text-center block mb-1">
                + CADASTRAR NOVO MONITOR
              </span>
              <form onSubmit={handleCreateMonitor} className="flex gap-1">
                <input
                  type="text"
                  required
                  placeholder="Nome do monitor (ex: Pl. B Sul)..."
                  value={newMonitorNameInput}
                  onChange={(e) => setNewMonitorNameInput(e.target.value)}
                  className="flex-grow bg-stone-950 border border-stone-850 rounded-xl px-2.5 py-1.5 text-[9.5px] text-emerald-100 placeholder:text-stone-600 focus:outline-none focus:border-emerald-500 font-sans font-bold"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl text-[10px] font-black transition duration-150 active:scale-90 flex items-center justify-center shrink-0"
                  title="Novo monitor"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: INDIVIDUAL PLAYLIST SECTION */}
        {phoneControlTab === "playlist" && (
          <div className="mb-3.5 bg-stone-950/40 p-2 rounded-2xl border border-stone-900/60 flex flex-col gap-2 font-sans">
            <span className="text-[7px] font-mono font-bold text-stone-500 uppercase block tracking-widest text-center">
              PLAYLIST INDIVIDUAL: {activeMonitor?.name}
            </span>

            {/* Quick Presets directly inside the smartphone screen list */}
            <div className="grid grid-cols-2 gap-1 bg-stone-950/40 p-1.5 rounded-xl border border-stone-850/40">
              <button
                type="button"
                onClick={() => handleAddVideo(activeMonitor.id, "ysz5S6PUM-U")}
                className="py-1 px-1.5 rounded-md bg-stone-900 hover:bg-stone-850 text-[7px] font-mono text-stone-300 hover:text-emerald-400 text-left truncate flex items-center gap-1"
              >
                + 🏙️ Drone Cidades
              </button>
              <button
                type="button"
                onClick={() => handleAddVideo(activeMonitor.id, "5gK9m6W-i8E")}
                className="py-1 px-1.5 rounded-md bg-stone-900 hover:bg-stone-850 text-[7px] font-mono text-stone-300 hover:text-emerald-400 text-left truncate flex items-center gap-1"
              >
                + 🍃 Drone Interior
              </button>
            </div>

            {/* Add YT Input inside phone */}
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Link YT, VDO.Ninja ou ID..."
                value={newPhoneVideoInput}
                onChange={(e) => setNewPhoneVideoInput(e.target.value)}
                className="flex-grow bg-stone-950 border border-stone-850 rounded-xl px-2.5 py-1.5 text-[9.5px] text-emerald-100 placeholder:text-stone-650 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (newPhoneVideoInput.trim()) {
                    const cleaned = getCleanedId(newPhoneVideoInput);
                    if (cleaned) {
                      handleAddVideo(activeMonitor.id, cleaned);
                      setNewPhoneVideoInput("");
                    }
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl text-[10px] font-black transition duration-150 active:scale-90 flex items-center justify-center shrink-0"
                title="Inserir vídeo"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Local MP4 Upload built directly inside the Playlist View */}
            <div className="bg-stone-950/80 p-2 rounded-xl border border-dashed border-stone-850 flex flex-col items-center justify-center relative cursor-pointer hover:bg-stone-900/40 transition">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const id = `local-${Date.now()}`;
                    const url = URL.createObjectURL(file);
                    setLocalVideos(prev => ({
                      ...prev,
                      [id]: { name: file.name, url }
                    }));
                    handleAddVideo(activeMonitor.id, id);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center gap-1.5 text-stone-400">
                <Laptop className="w-3 h-3 text-emerald-400" />
                <span className="text-[8px] font-bold uppercase font-mono">Enviar .MP4 do Celular/PC</span>
              </div>
            </div>

            {/* Tracklist layout for active monitor */}
            <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto mt-1 scrollbar-thin pr-1">
              {activeMonitor?.playlist.map((vidId, idx) => {
                const isPlayingNow = idx === activeMonitor.currentVideoIndex;
                return (
                  <div
                    key={`${vidId}-${idx}`}
                    className={`p-1.5 flex justify-between items-center bg-stone-950 rounded-xl border ${isPlayingNow ? "border-emerald-500" : "border-stone-850"}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectActiveVideo(activeMonitor.id, idx)}
                      className="flex items-center gap-1.5 flex-grow text-left truncate mr-1"
                    >
                      <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded shrink-0 ${isPlayingNow ? "bg-emerald-500 text-stone-950" : "bg-stone-900 text-stone-400"}`}>
                        {idx + 1}
                      </span>
                      <span className="text-stone-200 text-[9px] font-mono truncate max-w-[105px]">
                        {vidId.startsWith("local-") ? (
                          <span className="text-yellow-405 font-bold">
                            📁 {localVideos[vidId]?.name || "Vídeo PC"}
                          </span>
                        ) : (
                          <span className="text-stone-405">YT: {vidId}</span>
                        )}
                      </span>
                    </button>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveVideo(activeMonitor.id, idx, "up")}
                        className="p-1 text-stone-400 hover:text-white disabled:opacity-20 transition"
                        title="Mover acima"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === activeMonitor.playlist.length - 1}
                        onClick={() => handleMoveVideo(activeMonitor.id, idx, "down")}
                        className="p-1 text-stone-400 hover:text-white disabled:opacity-20 transition"
                        title="Mover abaixo"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(activeMonitor.id, idx)}
                        className="p-1 text-stone-600 hover:text-rose-450 transition"
                        title="Remover"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {(!activeMonitor || activeMonitor.playlist.length === 0) && (
                <div className="text-center py-5 text-stone-500 text-[8.5px] bg-[#020d08] rounded-xl border border-dashed border-stone-900">
                  Playlist vazia. Adicione vídeos acima!
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: AJUSTES DA TELA ATIVA */}
        {phoneControlTab === "ajustes" && (
          <div className="mb-3.5 bg-stone-950/40 p-2 rounded-2xl border border-stone-900/60 flex flex-col gap-2.5 font-sans">
            <span className="text-[7px] font-mono font-bold text-stone-500 uppercase block tracking-widest text-center">
              OPÇÕES DO MONITOR ATIVO
            </span>

            {/* In-Phone Rename Form (para saber qual monitor é qual!) */}
            <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-850/60 flex flex-col gap-1">
              <label className="text-[8px] text-stone-450 font-extrabold uppercase tracking-wide">
                Renomear Monitor Atual
              </label>
              <div className="flex gap-1.5 mt-0.5">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="Nome do monitor..."
                  className="flex-grow bg-[#020d08] border border-stone-850 text-[10px] font-bold px-2 px-1.5 rounded-xl text-white focus:outline-none focus:border-yellow-450 font-sans"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (activeMonitor) {
                      handleRenameMonitor(activeMonitor.id, renameValue);
                    }
                  }}
                  className="bg-yellow-400 hover:bg-yellow-350 active:scale-95 text-stone-950 font-black text-[9px] px-2.5 py-1 rounded-xl uppercase tracking-wider transition-all shadow-md shrink-0 font-sans"
                >
                  Salvar
                </button>
              </div>
            </div>

            {/* Simulation Controls (Volume adjustment and Rotation) */}
            <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-850/60 flex flex-col gap-1.5">
              <span className="text-[8px] text-stone-450 font-extrabold uppercase tracking-wide block">
                Controles de Teste Fisico
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (activeMonitor) handleToggleMute(activeMonitor.id);
                  }}
                  className={`py-2 px-1 rounded-xl border text-[9px] font-black flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-95 ${activeMonitor?.mute ? 'bg-rose-950/90 border-rose-800 text-rose-300 shadow-[0_2px_8px_rgba(225,29,72,0.15)]' : 'bg-stone-900 border-stone-850 text-emerald-450 hover:bg-stone-850'}`}
                >
                  {activeMonitor?.mute ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="tracking-wide uppercase font-sans leading-none">{activeMonitor?.mute ? "MUTADO" : "MUTAR"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPassengerScreenSlide(prev => prev === "weather" ? "transit" : "weather");
                  }}
                  className="py-2 px-1 bg-stone-900 hover:bg-stone-850 border border-stone-850 text-stone-200 rounded-xl text-[9px] font-black flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-95 shadow-md font-sans"
                >
                  <Smartphone className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                  <span className="tracking-wide uppercase font-sans leading-none">VIRAR TELA</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Brand Label */}
        <div className="mt-3 text-center">
          <p className="text-[7px] font-mono text-stone-500 uppercase tracking-widest leading-none">
            🎛️ CONTROLE REMOTO TÁTIL
          </p>
        </div>
      </div>
    );
  }

// ==========================================
// VIEW: STANDALONE DYNAMIC PASSENGER CELLPHONE
// ==========================================
interface PassengerPhoneProps {
  tvState: any;
  timeState: string;
  getWeatherIcon: (temp: string) => ReactNode;
  slide: "weather" | "transit";
  setSlide: Dispatch<SetStateAction<"weather" | "transit">>;
}

function PassengerPhone({ 
  tvState, 
  timeState, 
  getWeatherIcon, 
  slide, 
  setSlide
}: PassengerPhoneProps) {
  const [isAutoplay, setIsAutoplay] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!isAutoplay) {
      setProgress(0);
      return;
    }

    const stepMs = 100;
    const durationMs = 8000; // 8 seconds per screen
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setSlide((current) => (current === "weather" ? "transit" : "weather"));
          return 0;
        }
        return prev + (stepMs / durationMs) * 100;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isAutoplay]);

  const handleSetSlide = (newSlide: "weather" | "transit") => {
    setSlide(newSlide);
    setProgress(0);
  };

  // Extracts current temperature integer
  const currTemp = parseInt(tvState.temperature) || 17;
  const maxTemp = currTemp + 1;
  const minTemp = currTemp - 4;
  const sensation = currTemp - 1;

  // Extra clock strings for top of screen (hh:mm format)
  const clockShort = timeState ? timeState.substring(0, 5) : "11:05";

  return (
    <div className="w-full bg-[#0a0f1d] text-slate-100 rounded-[2.8rem] border-[8px] border-[#1e293b] p-3 shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative select-none">
      {/* Notch screen */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-[#1e293b] rounded-b-xl z-20 flex justify-center items-[flex-start]">
        <div className="w-8 h-0.5 bg-stone-950 rounded-full mt-1" />
      </div>

      {/* Screen Wrapper with animated transition and background image */}
      <div 
        className="relative rounded-[2rem] min-h-[500px] flex flex-col justify-between overflow-hidden transition-all duration-700 bg-cover bg-center"
        style={{ 
          backgroundImage: slide === "weather" ? `url(${weatherWallpaper})` : 'none',
          backgroundColor: slide === "transit" ? '#090d16' : '#141a29'
        }}
      >
        {/* Sky-Blue / Forest overlay for Weather view */}
        {slide === "weather" && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b]/5 via-teal-900/10 to-[#0e1726]/60 pointer-events-none z-0" />
        )}

        {/* Dynamic header of the phone */}
        <div className="pt-4 px-4 z-10 flex justify-between items-center text-[10px] font-mono font-bold text-white mb-2 drop-shadow-md">
          <span className="tracking-wide">{clockShort}</span>
          <div className="flex items-center gap-1.5">
            {/* Wifi Inline Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-white inline-block">
              <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[8px] tracking-tighter bg-white/20 text-white rounded px-1 scale-90">5G</span>
            {/* Battery Indicator with 88% */}
            <div className="h-3 w-[20px] border border-white/60 rounded-xs flex items-center p-0.5 relative gap-[1px]">
              <div className="bg-emerald-400 h-full w-[88%] rounded-3xs" />
              <div className="absolute right-[-2px] top-[3.5px] w-[1px] h-[3px] bg-white/70" />
              <span className="absolute inset-0 text-[6.5px] font-sans flex items-center justify-center font-extrabold text-white scale-[0.8]">88</span>
            </div>
          </div>
        </div>

        {/* COMPONENT BODY */}
        <div className="flex-grow flex flex-col justify-between p-3 z-10 overflow-y-auto max-h-[395px] scrollbar-none">
          {slide === "weather" && (
            /* SLIDE 1: PREMIUM IMMERSIVE WEATHER WALLPAPER MATCHING SCREENSHOT EXACTLY */
            <div className="flex flex-col gap-3.5 text-left h-full flex-grow">
              
              {/* Location Pin Header */}
              <div className="text-white drop-shadow pl-0.5 pt-0.5">
                <p className="text-[12px] font-sans font-light opacity-95 tracking-wide flex items-center gap-1">
                  {/* Inline Map Pin SVG */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-white/90 fill-white/10">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Bandeiras
                </p>
                <h1 className="text-6xl font-sans font-light tracking-tighter mt-1">{currTemp}°</h1>
                <p className="text-sm font-sans font-medium opacity-90 pl-0.5 mt-0.5">
                  {tvState.temperature.includes("Chuv") || tvState.temperature.includes("chuv") ? "Chuva Leve" : "Nublado"}
                </p>
                <div className="flex gap-2.5 text-[9px] font-semibold tracking-wide opacity-85 mt-2 pl-0.5 font-mono">
                  <span>↑ {maxTemp}° / ↓ {minTemp}°</span>
                  <span>Sensação térmica de {sensation}°</span>
                </div>
              </div>

              {/* Weather description note matching layout */}
              <p className="text-[10px] text-white font-sans font-medium leading-relaxed drop-shadow bg-black/15 backdrop-blur-3xs p-2.5 rounded-xl border border-white/5 mt-1">
                Garoa de manhã. Máximas de {currTemp}° a {currTemp + 2}°C e mínimas de {currTemp - 5}° a {currTemp - 3}°C.
              </p>

              {/* HOURLY GRAPH */}
              <div className="bg-[#1c3c44]/35 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 shadow-md">
                <div className="grid grid-cols-6 text-center text-[7.5px] font-mono font-bold text-slate-200">
                  <span>11:00</span>
                  <span>12:00</span>
                  <span>13:00</span>
                  <span>14:00</span>
                  <span>15:00</span>
                  <span>16:00</span>
                </div>

                {/* Cloud & Forecast Icons */}
                <div className="grid grid-cols-6 justify-items-center my-1.5">
                  {getWeatherIcon(tvState.temperature)}
                  {getWeatherIcon(tvState.temperature)}
                  {getWeatherIcon(tvState.temperature)}
                  {getWeatherIcon(tvState.temperature)}
                  {getWeatherIcon(tvState.temperature)}
                  <div className="text-slate-200">{getWeatherIcon("16°C")}</div>
                </div>

                {/* Drawn graph path line representing the temperature curves */}
                <div className="relative h-6 flex flex-col justify-center my-1">
                  <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                    <path 
                      d="M 12 11 Q 48 11, 84 11 T 160 11 T 205 15" 
                      fill="none" 
                      stroke="#eab308" 
                      strokeWidth="1.5" 
                    />
                    <circle cx="12" cy="11" r="2" fill="#fff" stroke="#eab308" strokeWidth="1" />
                    <circle cx="52" cy="11" r="2" fill="#fff" stroke="#eab308" strokeWidth="1" />
                    <circle cx="92" cy="11" r="2" fill="#fff" stroke="#eab308" strokeWidth="1" />
                    <circle cx="132" cy="11" r="2" fill="#fff" stroke="#eab308" strokeWidth="1" />
                    <circle cx="172" cy="11" r="2" fill="#fff" stroke="#eab308" strokeWidth="1" />
                    <circle cx="212" cy="15" r="2" fill="#fff" stroke="#eab308" strokeWidth="1" />
                  </svg>
                  {/* Inline Temps */}
                  <div className="grid grid-cols-6 text-center text-[8px] font-mono text-white font-heavy z-10 pt-1.5 font-bold">
                    <span>{currTemp}°</span>
                    <span>{currTemp}°</span>
                    <span>{currTemp}°</span>
                    <span>{currTemp}°</span>
                    <span>{currTemp}°</span>
                    <span>{currTemp - 1}°</span>
                  </div>
                </div>

                {/* Humidity Row */}
                <div className="grid grid-cols-6 text-center text-[7.5px] font-mono text-cyan-200 font-bold mt-1 shadow-sm">
                  <span>💧 8%</span>
                  <span>💧 7%</span>
                  <span>💧 8%</span>
                  <span>💧 6%</span>
                  <span>💧 3%</span>
                  <span>💧 3%</span>
                </div>

                {/* Arrow Forecast link */}
                <div className="flex justify-end items-center mt-2.5 pl-1">
                  <span className="text-[8px] font-bold text-yellow-300 hover:underline uppercase tracking-widest flex items-center gap-0.5">
                    Previsão para 48 horas 
                    {/* Inline Chevron Right */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2 h-2 text-yellow-300 ml-0.5">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Bottom Weather Card */}
              <div className="bg-[#0c1c24]/40 backdrop-blur-md border border-white/5 rounded-xl p-2.5 flex items-start gap-2">
                <div className="text-blue-300 text-xs shrink-0 pt-0.5">⭐</div>
                <div className="flex-grow">
                  <p className="text-[8px] font-mono text-slate-350 font-bold uppercase tracking-widest leading-none mb-1">ALERTAS COLETIVOS</p>
                  <p className="text-[9.5px] text-white leading-normal font-sans font-medium">Dia ensolarado pela frente. Possibilidade de Segunda-feira de que o próximo dia seja ensolarado.</p>
                </div>
                {/* Custom pagination dots inside weather widget */}
                <div className="flex gap-[3px] text-[7px] font-bold mt-1 text-slate-500 scale-[0.85] shrink-0 align-middle">
                  <span className="text-yellow-400">●</span>
                  <span>◌</span>
                  <span>◌</span>
                  <span>◌</span>
                </div>
              </div>

            </div>
          )}

          {slide === "transit" && (
            /* SLIDE 2: INTEGRATED TRANSIT BOARD & FARES LINEUP */
            <div className="flex flex-col gap-3.5 text-left pt-1 flex-grow">
              
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-white text-xs font-display font-medium tracking-wide">CIRCULAÇÃO DE DUPLO FLUXO</h3>
                <p className="text-[9px] text-slate-400 mt-0.5">Próximas partidas para terminais de Carapicuíba</p>
                <div className="w-12 h-0.5 bg-yellow-400 mt-1.5" />
              </div>

              {/* NEXT BUSES QUEUE */}
              <div className="flex flex-col gap-2">
                <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-0.5 mb-0.5 flex items-center gap-1">
                  <Bus className="w-3 h-3 text-yellow-400 shrink-0" /> PAINEL SINALIZADOR
                </span>

                {tvState.busLines.length > 0 ? (
                  tvState.busLines.map((bus: any) => (
                    <div
                      key={bus.id}
                      className="bg-slate-900/90 border border-slate-800 px-3 py-2.5 rounded-xl flex justify-between items-center shadow-sm hover:border-slate-800 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="bg-yellow-400 text-stone-950 font-mono text-[10px] px-2 py-0.5 rounded-md font-black leading-none">
                          {bus.line}
                        </span>
                        <span className="text-[10px] text-white font-extrabold tracking-wide uppercase">CIRCULAR</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-[#10b981]/30 px-2 py-0.5 rounded-lg text-[10px] font-black font-mono">
                        <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{bus.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 bg-slate-900/30 rounded-xl border border-dashed border-slate-800 text-[10px] text-slate-550 select-none">
                    Nenhum ônibus programado para agora.
                  </div>
                )}
              </div>

              {/* NEWS AND ALERTS */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/60 p-3 rounded-xl flex gap-2.5 items-start shadow-sm mt-1">
                <span className="text-sm shrink-0">📢</span>
                <div className="flex-grow">
                  <p className="text-[8.5px] font-mono text-slate-400 uppercase tracking-widest leading-none mb-1.5 font-bold">Informativo no Ônibus (Notícias)</p>
                  <p className="text-xs text-slate-200 leading-normal line-clamp-3 font-sans font-semibold">{tvState.newsTicker}</p>
                </div>
              </div>

            </div>
          )}

          {/* DYNAMIC SWIPE NAVIGATION PININDICATOR */}
          <div className="mt-3.5 py-2 bg-black/55 rounded-xl flex flex-col items-center gap-1.5 border border-white/5 relative overflow-hidden shadow-inner">
            {/* Tiny progress banner at the bottomrepresenting automatic progress */}
            {isAutoplay && (
              <div 
                className="absolute bottom-0 left-0 h-[2px] bg-emerald-400/80 transition-all duration-[100ms] ease-linear" 
                style={{ width: `${progress}%` }}
              />
            )}
            
            <div className="flex justify-center items-center gap-3.5">
              <button 
                onClick={() => handleSetSlide("weather")}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${slide === "weather" ? "bg-yellow-400 scale-125 shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "bg-white/40 hover:bg-white/70"}`}
                title="Clima"
              />
              
              {/* Play/Pause icon indicator to play/pause interval timer */}
              <button 
                onClick={() => setIsAutoplay(!isAutoplay)}
                className="text-[8px] text-stone-400 hover:text-white transition px-1.5 py-0.5 rounded bg-white/5 border border-white/10 active:scale-95 flex items-center justify-center scale-90"
                title={isAutoplay ? "Pausar Alternância Automática" : "Iniciar Alternância Automática"}
              >
                {isAutoplay ? "⏸️" : "▶️"}
              </button>

              <button 
                onClick={() => handleSetSlide("transit")}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${slide === "transit" ? "bg-yellow-400 scale-125 shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "bg-white/40 hover:bg-white/70"}`}
                title="Transporte"
              />
            </div>
            <div className="flex items-center gap-1.5 scale-90">
              <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-slate-300 leading-none">
                {slide === "weather" ? "Visual Clima" : "Horários de Ônibus"}
              </span>
              <span className={`text-[6px] px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider ${isAutoplay ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'bg-stone-800 text-stone-400'}`}>
                {isAutoplay ? "Auto-Play" : "Manual"}
              </span>
            </div>
          </div>

        </div>

        {/* METRO STANDARD TOUCH KEYS AT VERY BOTTOM */}
        <div className="h-7 bg-stone-950/95 border-t border-white/5 flex items-center justify-around z-10 select-none">
          {/* Back key */}
          <button 
            onClick={() => handleSetSlide(slide === "transit" ? "weather" : "transit")} 
            className="text-stone-500 hover:text-stone-300 active:scale-95 transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-stone-500 rotate-180">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* Home circle key */}
          <button 
            onClick={() => handleSetSlide("weather")} 
            className="w-3.5 h-3.5 border border-stone-500 hover:border-stone-300 rounded-full flex items-center justify-center transition active:scale-90"
          >
            <div className="w-1.5 h-1.5 bg-stone-600 rounded-full" />
          </button>
          {/* Recents key ||| */}
          <button 
            onClick={() => handleSetSlide(slide === "weather" ? "transit" : "weather")} 
            className="flex gap-[2.5px] hover:opacity-80 transition active:scale-95"
          >
            <div className="w-[1.8px] h-3.5 bg-stone-500 rounded-sm" />
            <div className="w-[1.8px] h-3.5 bg-stone-500 rounded-sm" />
            <div className="w-[1.8px] h-3.5 bg-stone-500 rounded-sm" />
          </button>
        </div>

      </div>
    </div>
  );
}

  // ==========================================
  // VIEW: THE DYNAMIC PASSENGER CELLPHONE
  // ==========================================
  function renderPassengerPhone() {
    return (
      <PassengerPhone 
        tvState={tvState} 
        timeState={timeState} 
        getWeatherIcon={getWeatherIcon} 
        slide={passengerScreenSlide}
        setSlide={setPassengerScreenSlide}
      />
    );
  }
}
