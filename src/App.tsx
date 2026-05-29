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
  Minimize,
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
  FileVideo,
  QrCode
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
          playsinline: 1,
          origin: window.location.origin,
          enablejsapi: 1,
        },
        events: {
          onReady: (event: any) => {
            if (active && event.target) {
              try {
                if (mute) {
                  event.target.mute();
                } else {
                  event.target.unMute();
                }
                event.target.playVideo();
              } catch (e) {
                console.warn("Retrying playVideo:", e);
              }

              // Robust browser autoplay block fallback:
              setTimeout(() => {
                if (!active || !event.target) return;
                try {
                  const state = event.target.getPlayerState();
                  if (state !== 1 && state !== 3) {
                    if (mute) {
                      event.target.mute();
                    } else {
                      event.target.unMute();
                    }
                    event.target.playVideo();
                  }
                } catch (err) {}
              }, 600);
            }
          },
          onStateChange: (event: any) => {
            if (active && event.data === 0) {
              onEnded();
              // Prevent stopping if there is only 1 video on the playlist (delay and check if component stayed active with same video)
              setTimeout(() => {
                if (active && playerRef.current) {
                  try {
                    const state = playerRef.current.getPlayerState();
                    if (state === 0 || state === -1) {
                      playerRef.current.playVideo();
                    }
                  } catch (err) {}
                }
              }, 400);
            }
          },
          onError: (event: any) => {
            console.error("YouTube Player Error:", event.data);
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
      intervalId = setInterval(() => {
        if (tryInit()) {
          clearInterval(intervalId);
        }
      }, 150);

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
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [videoId]);

  // Handle dynamic unmuting/muting on the fly when prop changes
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.mute === "function") {
      try {
        if (mute) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
        }
      } catch (err) {
        console.warn("Error changing volume dynamically on YT Player:", err);
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


// ============================================================================
// REAL-TIME AUDIO SYNTHESIS & SPEECH BROADCAST ENGINE
// ============================================================================

function playSynthesizedSound(type: string) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "gol") {
      // Roaring wind / cheering crowd sound!
      const bufferSize = ctx.sampleRate * 2.5; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 1.0;
      
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
      filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 1.0);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 2.5);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.65, ctx.currentTime + 0.2);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(620, ctx.currentTime + 0.25);
      osc.frequency.linearRampToValueAtTime(340, ctx.currentTime + 1.2);
      
      oscGain.gain.setValueAtTime(0.01, ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.15);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start();
      osc.start();
      
      noise.stop(ctx.currentTime + 2.5);
      osc.stop(ctx.currentTime + 2.5);

    } else if (type === "apito") {
      // Referee whistle sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = 1500;
      osc2.frequency.value = 1535;

      osc1.type = "sine";
      osc2.type = "sine";

      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      mod.frequency.value = 35; 
      modGain.gain.value = 250; 

      mod.connect(modGain);
      modGain.connect(osc1.frequency);
      modGain.connect(osc2.frequency);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0.30, ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      mod.start();
      osc1.start();
      osc2.start();

      mod.stop(ctx.currentTime + 0.65);
      osc1.stop(ctx.currentTime + 0.65);
      osc2.stop(ctx.currentTime + 0.65);

    } else if (type === "torcida") {
      // Cheering crowd wave
      const bufferSize = ctx.sampleRate * 3.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(460, ctx.currentTime + 1.0);
      filter.frequency.exponentialRampToValueAtTime(270, ctx.currentTime + 3.5);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 0.8);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 2.0);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 3.5);

    } else if (type === "sino") {
      // Crisp professional chime for terminal announcements (ding-don!)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.value = 523.25; // C5
      osc2.type = "sine";
      osc2.frequency.value = 659.25; // E5

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0.20, ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(ctx.currentTime + 2.0);
      osc2.stop(ctx.currentTime + 2.0);

    } else if (type === "alerta") {
      // Alert chime (beep-boop!)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.25); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.50); // G5

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.20, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + 0.50);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.1);
    }
  } catch (err) {
    console.warn("Failed playing synthesized audio:", err);
  }
}

function speakAnnouncement(text: string) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith("pt") || v.lang.includes("BR") || v.lang.includes("br"));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Failed speech synthesis:", err);
  }
}

interface AudioEffectsEmitterProps {
  tvState: TVState;
}

function AudioEffectsEmitter({ tvState }: AudioEffectsEmitterProps) {
  const lastSoundTimeRef = useRef<string | null | undefined>(tvState.soundEffectTime);
  const lastSpeechTimeRef = useRef<string | null | undefined>(tvState.announcementSpeechTime);

  useEffect(() => {
    if (tvState.soundEffectTime && tvState.soundEffectTime !== lastSoundTimeRef.current) {
      lastSoundTimeRef.current = tvState.soundEffectTime;
      if (tvState.soundEffect) {
        playSynthesizedSound(tvState.soundEffect);
      }
    }
  }, [tvState.soundEffectTime, tvState.soundEffect]);

  useEffect(() => {
    if (tvState.announcementSpeechTime && tvState.announcementSpeechTime !== lastSpeechTimeRef.current) {
      lastSpeechTimeRef.current = tvState.announcementSpeechTime;
      if (tvState.announcementSpeech) {
        speakAnnouncement(tvState.announcementSpeech);
      }
    }
  }, [tvState.announcementSpeechTime, tvState.announcementSpeech]);

  return null;
}


export default function App() {
  // Playground state for user-selected tab
  // "control": Only the Remote control smartphone (Tab 1)
  // "monitor": The TV Monitor and Passenger cellphone (Tab 2) where residents see announcements & ad commercials
  const [activeTab, setActiveTab] = useState<"control" | "monitor">("control");

  // Phone remote control tab state
  const [phoneControlTab, setPhoneControlTab] = useState<"telas" | "playlist" | "audio" | "ajustes">("telas");
  // Custom video input inside the mobile phone remote control
  const [newPhoneVideoInput, setNewPhoneVideoInput] = useState<string>("");

  // Slide state inside the phone remote controller: rotates between "weather" and "transit" (bus stop schedules)
  const [phoneRotateSlide, setPhoneRotateSlide] = useState<"weather" | "transit">("weather");

  // Slide state inside the passenger cellphone: rotates between weather, individual buses, and live news portals
  const [passengerScreenSlide, setPassengerScreenSlide] = useState<string>("weather");

  // URL mode selector (supports full-screen preview modes: TV standalone or passenger phone standalone)
  const [urlMode, setUrlMode] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const m = params.get("mode");
      if (m) return m;
      if (hash === "#control" || hash === "#remote") return "control";
      if (hash === "#monitor" || hash === "#tv") return "tv";
      if (hash === "#passenger") return "passenger";
    }
    return null;
  });
  const [urlMonitorId, setUrlMonitorId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("monitor");
    }
    return null;
  });
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [showCursor, setShowCursor] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err: any) => {
        console.warn("Rejeitado pedido de tela cheia:", err);
      });
    } else {
      document.exitFullscreen().catch((err: any) => {
        console.warn("Rejeitada saída de tela cheia:", err);
      });
    }
  };

  useEffect(() => {
    if (urlMode !== "tv") return;

    let timeoutId: any = null;
    const handleMouseMove = () => {
      setShowCursor(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowCursor(false);
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    handleMouseMove();

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [urlMode]);

  // Auto-generate a stable dynamic monitor ID per device/PC if none is provided in the URL query parameters
  const [sessionMonitorId, setSessionMonitorId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlMon = params.get("monitor");
      
      // 1. If an explicit monitor parameter is provided in the URL, we honor it.
      // This is crucial so that you can open a specific monitor link on another computer!
      if (urlMon) {
        return urlMon;
      }

      // 2. For dynamic TV monitors opened without parameters, we use a locker in localStorage
      // so it stays perfectly unique and persistent for that specific physical computer/machine,
      // even if we restart the browser! This prevents multiple computers on the same IP from clashing.
      const stored = localStorage.getItem("tv_instance_monitor_unique_id");
      if (stored) return stored;

      const newId = "tv-" + Math.floor(100 + Math.random() * 900);
      localStorage.setItem("tv_instance_monitor_unique_id", newId);
      return newId;
    }
    return "terminal-principal";
  });

  // URL parameters updater for standalone TV viewer modes
  useEffect(() => {
    if (urlMode === "tv" && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("monitor") !== sessionMonitorId) {
        params.set("monitor", sessionMonitorId);
        window.history.replaceState(null, "", "?" + params.toString());
        setUrlMonitorId(sessionMonitorId);
      }
    }
  }, [urlMode, sessionMonitorId]);

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
    const handleUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const m = params.get("mode");
      if (m) {
        setUrlMode(m);
      } else if (hash === "#control" || hash === "#remote") {
        setUrlMode("control");
      } else if (hash === "#monitor" || hash === "#tv") {
        setUrlMode("tv");
      } else if (hash === "#passenger") {
        setUrlMode("passenger");
      } else {
        setUrlMode(null);
      }
      setUrlMonitorId(params.get("monitor"));
    };

    handleUrlState();
    window.addEventListener("hashchange", handleUrlState);
    return () => window.removeEventListener("hashchange", handleUrlState);
  }, []);

  // Synchronized state with the mock node/express server with LocalStorage backup
  const [tvState, setTvState] = useState<TVState>(() => {
    try {
      const data = localStorage.getItem("tv_signage_fallback_state");
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && Array.isArray(parsed.monitors) && parsed.monitors.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return {
      temperature: "17°C - Nublado",
      newsTicker: "NOTÍCIAS DE OSASCO: Novas linhas de ônibus integradas no Parque Palmares atendem de forma direta a Avenida Zumbi dos Palmares e a região de Osasco!",
      busLines: [
        { id: "1", line: "035", time: "7 MIN" },
        { id: "2", line: "034", time: "15 MIN" },
        { id: "3", line: "466X1", time: "30 MIN" }
      ],
      monitors: [
        {
          id: "terminal-principal",
          name: "Monitor Principal - Terminal",
          location: "Terminal Central",
          customBusLines: "035/034/466X1",
          playlist: ["ysz5S6PUM-U", "S_dfq9rFWAE", "5gK9m6W-i8E"],
          currentVideoIndex: 0,
          isPlaying: true,
          mute: true
        }
      ],
      updatedAt: new Date().toISOString()
    };
  });

  const lastProcessedRefreshRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (urlMode !== "tv") return;
    const targetMonitorId = urlMonitorId || (tvState.monitors && tvState.monitors[0] ? tvState.monitors[0].id : "terminal-principal");
    const currentMonitor = tvState.monitors.find(m => m.id === targetMonitorId) || tvState.monitors[0];
    
    if (currentMonitor && currentMonitor.forceRefreshTime) {
      if (lastProcessedRefreshRef.current === undefined) {
        // First look initialization on load
        lastProcessedRefreshRef.current = currentMonitor.forceRefreshTime;
      } else if (lastProcessedRefreshRef.current !== currentMonitor.forceRefreshTime) {
        console.log(`[Reload] Remotely requesting F5 reload for monitor ID: ${currentMonitor.id}`);
        lastProcessedRefreshRef.current = currentMonitor.forceRefreshTime;
        setTimeout(() => {
          window.location.reload();
        }, 150);
      }
    }
  }, [tvState.monitors, urlMode, urlMonitorId]);

  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Active monitor selected for visual preview in Aba 2
  const [activePreviewMonitorId, setActivePreviewMonitorId] = useState<string>("grid");

  // Dynamic heartbeat registration logic
  useEffect(() => {
    let intervalId: any = null;

    const sendPing = async (targetId: string, name?: string) => {
      try {
        await fetch("/api/monitor/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: targetId,
            name: name || `Monitor Comercial [${targetId.toUpperCase()}]`,
            orientation: "landscape"
          })
        });
      } catch (err) {
        // quiet fail on background pings
      }
    };

    if (urlMode === "tv") {
      // Active standalone physical screen
      const monitorName = `Monitor TV [${sessionMonitorId.toUpperCase()}]`;
      sendPing(sessionMonitorId, monitorName);
      intervalId = setInterval(() => {
        sendPing(sessionMonitorId, monitorName);
      }, 3000);
    } else if (activeTab === "monitor" && activePreviewMonitorId !== "grid") {
      // Keep selected preview element on tab active while viewing
      const currentObj = tvState.monitors.find(m => m.id === activePreviewMonitorId);
      if (currentObj) {
        sendPing(currentObj.id, currentObj.name);
        intervalId = setInterval(() => {
          sendPing(currentObj.id, currentObj.name);
        }, 3000);
      }
    } else {
      // Keep core terminal monitor always catalogued so preview state has a safe standby option
      sendPing("terminal-principal", "Monitor Principal - LANHOUSE24H");
      intervalId = setInterval(() => {
        sendPing("terminal-principal", "Monitor Principal - LANHOUSE24H");
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [urlMode, sessionMonitorId, activeTab, activePreviewMonitorId, tvState.monitors]);

  // Selected monitor to manage/view in the remote and simulation tabs
  const [selectedMonitorId, setSelectedMonitorId] = useState<string>("terminal-principal");

  // Local draft states inside the remote control panel
  const [temperatureInput, setTemperatureInput] = useState(tvState.temperature ?? "");
  const [newsInput, setNewsInput] = useState(tvState.newsTicker ?? "");
  const [busLinesDraft, setBusLinesDraft] = useState<BusLine[]>(tvState.busLines ?? []);
  
  // Custom video input (add video to active monitor's playlist)
  const [newVideoInput, setNewVideoInput] = useState("");
  const [newMonitorNameInput, setNewMonitorNameInput] = useState("");
  
  // Custom audio integration for MATCH DAY / SONOPLASTIA
  const [localSpeechText, setLocalSpeechText] = useState("Atenção passageiros do Parque Palmares! Ônibus linha 035 se aproxima do terminal.");
  const [audioOverlayDismissed, setAudioOverlayDismissed] = useState(false);
  
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
  const [locationValue, setLocationValue] = useState("");
  const [customBusLinesValue, setCustomBusLinesValue] = useState("");

  useEffect(() => {
    const selectedMon = tvState.monitors.find(m => m.id === selectedMonitorId);
    if (selectedMon) {
      setRenameValue(selectedMon.name);
      setLocationValue(selectedMon.location || "");
      setCustomBusLinesValue(selectedMon.customBusLines || "");
    }
  }, [selectedMonitorId]);

  // Keep a mutable ref of the state so the SSE/EventSource useEffect doesn't have to keep reconnecting on state changes
  const tvStateRef = useRef<TVState>(tvState);
  const lastMutationRef = useRef<number>(0);
  useEffect(() => {
    tvStateRef.current = tvState;
  }, [tvState]);

  // Cópia local de salvamento para persistência
  const saveLocalFallback = (state: TVState) => {
    try {
      localStorage.setItem("tv_signage_fallback_state", JSON.stringify(state));
    } catch (e) {}
  };

  // Automatically fetch synchronized state on boot and set up EventStream (SSE)
  useEffect(() => {
    fetchState();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/stream");
      
      eventSource.onmessage = (event) => {
        try {
          if (Date.now() - lastMutationRef.current < 2500) {
            // Safe lock to prevent server SSE race updates from rolling back quick user interactions
            return;
          }
          const liveData = JSON.parse(event.data) as TVState;
          setTvState(liveData);
          saveLocalFallback(liveData);
          setIsOfflineMode(false);
          
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
        // Fallback to local offline mode if Server SSE fails
        setIsOfflineMode(true);
      };
    } catch (e) {
      console.warn("SSE não suportado neste ambiente (Modo offline estático padrão):", e);
      setIsOfflineMode(true);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Client-Side Simulation for Offline Mode (Vercel, GitHub, Firebase static hosting)
  useEffect(() => {
    if (!isOfflineMode) return;

    // Simulate Bus Schedules Countdown (every 12 seconds in standalone mode for dynamic feed)
    const busInterval = setInterval(() => {
      setTvState(prev => {
        const nextLines = prev.busLines.map(bus => {
          const match = bus.time.match(/^(\d+)/);
          if (match) {
            const currentMins = parseInt(match[1], 10);
            if (currentMins > 1) {
              return { ...bus, time: `${currentMins - 1} MIN` };
            } else if (currentMins === 1) {
              return { ...bus, time: "PARTIU" };
            }
          } else if (bus.time === "PARTIU") {
            const nextMins = Math.floor(Math.random() * 22) + 8;
            return { ...bus, time: `${nextMins} MIN` };
          }
          return bus;
        });
        const updated = { ...prev, busLines: nextLines, updatedAt: new Date().toISOString() };
        saveLocalFallback(updated);
        return updated;
      });
    }, 12000);

    // Simulate Weather & News fluctuations periodically
    const weatherNewsInterval = setInterval(() => {
      const weatherPresets = [
        "17°C - Chuva Leve", "18°C - Nublado", "19°C - Garoando", "21°C - Céu Limpo",
        "22°C - Ensolarado", "16°C - Névoa", "15°C - Nublado", "14°C - Chuviscando"
      ];
      const newsPresets = [
        "SINAL LOCAL: Aplicativo rodando em modo Estático Offline de Alta Performance (Resistente ao Vercel/GitHub/Firebase!).",
        "NOTÍCIAS DE OSASCO: Novas rotas de ônibus e asfalto reforçado na Avenida Zumbi dos Palmares melhoram a mobilidade no Parque Palmares.",
        "ESPORTES EM OSASCO: Time de vôlei feminino Osasco São Cristóvão Saúde treina forte para a disputa dos playoffs com ingressos esgotados no Liberatti.",
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
      
      setTvState(prev => {
        const randomWeather = weatherPresets[Math.floor(Math.random() * weatherPresets.length)];
        const randomNews = newsPresets[Math.floor(Math.random() * newsPresets.length)];
        const updated = {
          ...prev,
          temperature: randomWeather,
          newsTicker: randomNews,
          updatedAt: new Date().toISOString()
        };
        saveLocalFallback(updated);
        return updated;
      });
    }, 40000);

    return () => {
      clearInterval(busInterval);
      clearInterval(weatherNewsInterval);
    };
  }, [isOfflineMode]);

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

  // Phone remote local info rotation machine
  useEffect(() => {
    const interval = setInterval(() => {
      setPhoneRotateSlide(prev => prev === "weather" ? "transit" : "weather");
    }, 4500); // alternating every 4.5 seconds
    return () => clearInterval(interval);
  }, []);

  const getLineTime = (lineNumber: string) => {
    // Find matching line inside live state
    const found = tvState.busLines.find(b => b.line.trim().toUpperCase() === lineNumber.trim().toUpperCase());
    if (found) return found.time;
    // Otherwise fallback to simulated local hash minute based on the current minute
    const hash = lineNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const minute = ((new Date().getMinutes() + hash) % 25) + 3;
    return `${minute} MIN`;
  };

  // API Call: Fetch standard state from Express
  const fetchState = async () => {
    try {
      const resp = await fetch("/api/state");
      if (resp.ok) {
        const data = await resp.json();
        setTvState(data);
        saveLocalFallback(data);
        setTemperatureInput(data.temperature ?? "");
        setNewsInput(data.newsTicker ?? "");
        setBusLinesDraft(data.busLines ?? []);
        setIsOfflineMode(false);
      } else {
        throw new Error("HTTP Status erro: " + resp.status);
      }
    } catch (e) {
      console.warn("Servidor offline, utilizando cache local do navegador:", e);
      setIsOfflineMode(true);
      // Try to load any previously stored state
      try {
        const data = localStorage.getItem("tv_signage_fallback_state");
        if (data) {
          const parsed = JSON.parse(data);
          setTvState(parsed);
          setTemperatureInput(parsed.temperature ?? "");
          setNewsInput(parsed.newsTicker ?? "");
          setBusLinesDraft(parsed.busLines ?? []);
        }
      } catch (err) {}
    }
  };

  // Sync monitors array to the Express backend (called instantly on playlist events)
  const syncMonitorsToServer = async (latestMonitors: MonitorState[]) => {
    const nextState = {
      ...tvStateRef.current,
      monitors: latestMonitors,
      updatedAt: new Date().toISOString()
    };
    
    // Optimistic update for beautiful instantaneous tactile response
    lastMutationRef.current = Date.now();
    setTvState(nextState);
    tvStateRef.current = nextState; // Synchronous ref update to prevent race conditions during rapid clicks!
    saveLocalFallback(nextState);

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
        tvStateRef.current = data.state; // Update with the latest resolved server state!
        saveLocalFallback(data.state);
        setIsOfflineMode(false);
      } else {
        setIsOfflineMode(true);
      }
    } catch (e) {
      console.warn("Sem conexão com o servidor de transmissão, estado mantido offline.", e);
      setIsOfflineMode(true);
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

    const localNextState = {
      ...tvState,
      ...payload,
      updatedAt: new Date().toISOString()
    };

    // Optimistically update locally so it performs beautifully immediately
    lastMutationRef.current = Date.now();
    setTvState(localNextState);
    saveLocalFallback(localNextState);

    try {
      const response = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        setTvState(data.state);
        saveLocalFallback(data.state);
        setIsOfflineMode(false);
      } else {
        setIsOfflineMode(true);
      }
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2000);
    } catch (e) {
      console.warn("Sem servidor live. Transmitido localmente via memória e cache:", e);
      setIsOfflineMode(true);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Instant actions for selected monitor
  const handleAddVideo = (monitorId: string, videoUrlOrId: string) => {
    if (!videoUrlOrId.trim()) return;
    const vidId = getCleanedId(videoUrlOrId);
    
    const updated = tvStateRef.current.monitors.map(m => {
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
    const updated = tvStateRef.current.monitors.map(m => {
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
    const updated = tvStateRef.current.monitors.map(m => {
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
    const updated = tvStateRef.current.monitors.map(m => {
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
    const updated = tvStateRef.current.monitors.map(m => {
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
    const updated = tvStateRef.current.monitors.map(m => {
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
    const updated = tvStateRef.current.monitors.map(m => {
      if (m.id === monitorId) {
        return { ...m, isPlaying: !m.isPlaying };
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  const handleToggleMute = (monitorId: string) => {
    const updated = tvStateRef.current.monitors.map(m => {
      if (m.id === monitorId) {
        return { ...m, mute: !m.mute };
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  const handleToggleOrientation = (monitorId: string) => {
    const updated = tvStateRef.current.monitors.map(m => {
      if (m.id === monitorId) {
        return { ...m, orientation: m.orientation === "portrait" ? "landscape" : "portrait" };
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  const handleRemoteForceRefresh = (monitorId: string) => {
    const updated = tvStateRef.current.monitors.map(m => {
      if (m.id === monitorId) {
        return { ...m, forceRefreshTime: new Date().toISOString() };
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
    const updatedMonitors = [...tvStateRef.current.monitors, newMonitor];
    setNewMonitorNameInput("");
    setSelectedMonitorId(newId);
    syncMonitorsToServer(updatedMonitors);
  };

  const handleDeleteMonitor = (monitorId: string) => {
    if (tvStateRef.current.monitors.length <= 1) {
      alert("Você precisa manter pelo menos um monitor ativo no terminal!");
      return;
    }
    const updatedMonitors = tvStateRef.current.monitors.filter(m => m.id !== monitorId);
    if (selectedMonitorId === monitorId) {
      setSelectedMonitorId(updatedMonitors[0].id);
    }
    syncMonitorsToServer(updatedMonitors);
  };

  const handleUpdateMonitorDetails = (monitorId: string, newName: string, newLocation: string, newBusLines: string) => {
    if (!newName.trim()) return;
    const updated = tvStateRef.current.monitors.map(m => {
      if (m.id === monitorId) {
        return {
          ...m,
          name: newName.trim(),
          location: newLocation.trim(),
          customBusLines: newBusLines.trim()
        };
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  const handleRenameMonitor = (monitorId: string, newName: string) => {
    if (!newName.trim()) return;
    const updated = tvStateRef.current.monitors.map(m => {
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

  const triggerSoundEffect = async (effect: string) => {
    const timeStr = new Date().toISOString();
    const nextState = {
      ...tvStateRef.current,
      soundEffect: effect,
      soundEffectTime: timeStr,
      updatedAt: timeStr
    };
    setTvState(nextState);
    saveLocalFallback(nextState);
    try {
      const response = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextState)
      });
      if (response.ok) {
        const data = await response.json();
        setTvState(data.state);
        saveLocalFallback(data.state);
      }
    } catch (e) {
      console.warn("Erro ao enviar efeito de som para o servidor:", e);
    }
  };

  const triggerTTSAnnouncement = async () => {
    if (!localSpeechText.trim()) return;
    const timeStr = new Date().toISOString();
    const nextState = {
      ...tvStateRef.current,
      announcementSpeech: localSpeechText.trim(),
      announcementSpeechTime: timeStr,
      updatedAt: timeStr
    };
    setTvState(nextState);
    saveLocalFallback(nextState);
    try {
      const response = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextState)
      });
      if (response.ok) {
        const data = await response.json();
        setTvState(data.state);
        saveLocalFallback(data.state);
      }
    } catch (e) {
      console.warn("Erro ao enviar locução para o servidor:", e);
    }
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

  // Standalone modes switcher
  if (urlMode === "tv") {
    const targetMonitorId = urlMonitorId || "terminal-principal";
    
    // Solid local fallback monitor object matching default primary monitor
    const fallbackMonitor = {
      id: "terminal-principal",
      name: "Monitor Principal - LANHOUSE24H",
      location: "Terminal Central - LANHOUSE24H",
      customBusLines: "035/034/466X1",
      playlist: ["ysz5S6PUM-U", "S_dfq9rFWAE", "5gK9m6W-i8E"],
      currentVideoIndex: 0,
      isPlaying: true,
      mute: true,
      orientation: "landscape"
    } as any;

    let monitorObj = tvState.monitors.find(m => m.id === targetMonitorId);
    if (!monitorObj && !urlMonitorId) {
      monitorObj = tvState.monitors[0];
    }
    
    // Automatically use the fallback monitor configuration if no monitor is available
    // to shield the physical screen from blank state, errors or loading screen timeouts!
    if (!monitorObj) {
      if (targetMonitorId === "terminal-principal") {
        monitorObj = fallbackMonitor;
      } else {
        monitorObj = {
          id: targetMonitorId,
          name: `Monitor ${targetMonitorId.toUpperCase()}`,
          location: "Avenida Zumbi dos Palmares",
          customBusLines: "035/034/466X1",
          playlist: ["ysz5S6PUM-U"],
          currentVideoIndex: 0,
          isPlaying: true,
          mute: true,
          orientation: "landscape"
        } as any;
      }
    }

    const currentVidId = monitorObj.playlist[monitorObj.currentVideoIndex] || "ysz5S6PUM-U";

    return (
      <div 
        className={`w-screen h-screen overflow-hidden font-sans flex flex-col justify-between select-none relative bg-cover bg-center ${showCursor ? "cursor-default" : "cursor-none"}`}
        style={{ backgroundImage: `url(${BACKGROUND_PRESETS[bgStyle].url})` }}
      >
        <AudioEffectsEmitter tvState={tvState} />
        
        {/* Floating click to activate sound banner if not dismissed yet */}
        {!audioOverlayDismissed && (
          <button
            onClick={() => {
              setAudioOverlayDismissed(true);
              playSynthesizedSound("sino");
            }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-yellow-405 hover:bg-yellow-350 active:scale-95 text-stone-950 font-sans font-black text-[10px] md:text-xs py-2.5 px-5 rounded-2xl shadow-2xl flex items-center gap-2 cursor-pointer transition-all animate-bounce uppercase tracking-wider border border-yellow-500"
          >
            <Volume2 className="w-4 h-4 animate-pulse" />
            Clique aqui para ativar áudio e locução ao vivo!
          </button>
        )}

        {/* Shadow Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/55 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-50 z-0" />

        {/* ROW 1: ELEGANT SOLID TOP BAR / CABEÇALHO DA TV */}
        <div className="h-20 bg-black/95 backdrop-blur-md border-b border-white/10 px-4 md:px-6 flex items-center justify-between z-20 shrink-0 shadow-lg select-none">
          {/* Leftside: GIANT ELECTRONIC DIGITAL CLOCK */}
          <div className="flex items-center gap-4 animate-fade-in">
            <span className="text-emerald-400 font-mono text-3xl sm:text-5xl md:text-6xl font-black tracking-widest tabular-nums drop-shadow-[0_0_15px_rgba(52,211,153,0.65)] leading-none">
              {timeState}
            </span>
            <div className="hidden sm:flex flex-col items-start justify-center">
              <span className="text-[8px] text-stone-300 font-extrabold uppercase tracking-widest leading-none">Horário de Brasília</span>
              <span className="text-[6px] text-emerald-500/80 font-mono font-bold tracking-widest mt-1">RETRANSMISSOR RUA</span>
            </div>
          </div>

          {/* Rightside: Monitor details */}
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white text-xs md:text-sm font-mono tracking-widest font-black uppercase">SINAL ATIVO: {monitorObj.name}</span>
            {monitorObj.ip && (
              <span className="text-[10px] font-mono font-bold bg-white/10 text-stone-200 border border-white/15 px-2 py-0.5 rounded-lg ml-2 shrink-0">
                IP: {monitorObj.ip}
              </span>
            )}
          </div>
        </div>

        {/* ROW 2: SPLIT SCREEN (SMARTPHONE + TV STREAM) */}
        <div className="flex-grow w-full relative flex items-center justify-center p-4 md:p-8 z-10 overflow-hidden">
          <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 xl:gap-16">
            
            {/* Left Layer: Smartphone carrying Weather, Schedules, bus stops (hidden if portrait to maximize vertical screen coverage!) */}
            {monitorObj.orientation !== "portrait" && (
              <div className="w-full max-w-[260px] sm:max-w-[280px] shrink-0 transition-all duration-300">
                <div className="w-full">
                  {renderPassengerPhone(monitorObj)}
                </div>
              </div>
            )}

            {/* Right Layer: Physical TV Frame with Stream */}
            <div className={`flex flex-col items-center w-full transition-all duration-300 ${
              monitorObj.orientation === "portrait"
                ? "max-h-full max-w-[450px]"
                : "flex-grow max-w-[960px]"
            }`}>
              <div className={`relative bg-[#050505] border-[10px] border-stone-850 rounded-[1.8rem] p-1 shadow-2xl overflow-hidden w-full flex flex-col justify-between items-stretch transition-all duration-300 ${
                monitorObj.orientation === "portrait"
                  ? "aspect-[9/16]"
                  : "aspect-video"
              }`}>
                
                {/* Simulated Screen Header */}
                <div className="relative w-full h-8 bg-black/75 backdrop-blur-sm border-b border-white/10 px-3 flex items-center justify-between z-10 select-none pointer-events-none shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white text-[8px] sm:text-[9.5px] font-mono tracking-wider font-extrabold uppercase truncate max-w-[200px]">
                      {monitorObj.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[6px] text-stone-400 uppercase font-bold tracking-widest leading-none">RETRANSMISSOR DIGITAL</span>
                  </div>
                </div>

                {/* Simulated Screen Video Body */}
                <div className="flex-grow w-full h-full relative pointer-events-none z-0 bg-black overflow-hidden flex items-center justify-center">
                  {currentVidId ? (
                    currentVidId.startsWith("vdoninja-") ? (
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

        {/* FULLSCREEN CONTROLS - Overlayed in Bottom-Right (Fades out when cursor stagnates) */}
        <div className={`absolute bottom-28 right-8 z-30 flex items-center gap-3 transition-opacity duration-300 ${showCursor ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <button
            onClick={toggleFullscreen}
            className="p-3.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 hover:border-white/20 rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
          >
            {isFullscreen ? <Minimize className="w-5 h-5 text-emerald-400" /> : <Maximize className="w-5 h-5 text-emerald-400" />}
            <span>{isFullscreen ? "Sair Tela Cheia" : "Tela Cheia"}</span>
          </button>
        </div>

        {/* ROW 3: Removed bottom news ticker as per user request to maximize screen focus and clean the console layout */}

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

  if (urlMode === "remote" || urlMode === "control") {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-[420px]">
          {renderRemotePhone(true)}
        </div>
      </div>
    );
  }

  const activeMonitor = tvState.monitors.find(m => m.id === selectedMonitorId) || tvState.monitors[0];

  return (
    <div id="app-root" className="min-h-screen bg-stone-950 text-stone-100 font-sans flex flex-col justify-between selection:bg-yellow-405 selection:text-stone-900">
      <AudioEffectsEmitter tvState={tvState} />
      
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
              className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12 w-full py-4"
            >
              {/* Left Column: Center Stage Controller Frame */}
              <div className="w-full max-w-[340px] relative">
                <div className="flex justify-between items-center px-1 mb-3">
                  <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> CONTROLE TÁTIL DE OSASCO
                  </span>
                  {isOfflineMode ? (
                    <span className="text-[9px] font-mono bg-[#321e0a] border border-amber-800/40 text-amber-400 rounded px-1.5 py-0.5 font-bold animate-pulse" title="Modo Offline Ativo. Sincronizado localmente no seu navegador.">
                      MODO LOCAL
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono bg-emerald-950 border border-emerald-800/40 text-emerald-400 rounded px-1.5 py-0.5 font-bold animate-pulse" title="Sincronizado em tempo real com o servidor central de transmissão de sinal">
                      SINAL ONLINE
                    </span>
                  )}
                </div>
                
                {renderRemotePhone()}
              </div>

              {/* Right Column: Mobile pairing instructions & stand-alone checkout controller */}
              <div id="mobile-control-pairing-card" className="bg-[#0c140f] border border-[#10b981]/15 rounded-3xl p-6 w-full max-w-[340px] shadow-2xl flex flex-col gap-5 text-left select-none relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <h3 className="text-white font-display text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    Controle no Celular
                  </h3>
                  <p className="text-stone-400 text-[11px] leading-relaxed mt-1.5">
                    Copie o link abaixo ou clique para abrir a tela de controle cheia e exclusiva no seu celular ou em outra aba!
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/?mode=control`);
                      setCopyFeedback(true);
                      setTimeout(() => setCopyFeedback(false), 2000);
                    }}
                    className="w-full py-2.5 bg-emerald-950/80 hover:bg-emerald-900/95 border border-emerald-500/25 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer"
                  >
                    {copyFeedback ? (
                      <span className="flex items-center gap-1">✓ Copiado com Sucesso!</span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copiar Link do Controle</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`${window.location.origin}/?mode=control`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border border-emerald-400/30 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition duration-150 text-center active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                    Abrir Isolado em Nova Aba ↗
                  </a>
                </div>

                <div className="border-t border-emerald-500/10 pt-3.5 flex flex-col gap-1 font-mono text-[9px] text-stone-400 text-center">
                  <span>SARAHTVLAN REMOTE CONTROL HUB</span>
                  <span className="text-[8px] text-[#10b981] animate-pulse">Sincronização em tempo real online</span>
                </div>
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
                      {renderPassengerPhone(tvState.monitors.find(m => m.id === selectedMonitorId) || tvState.monitors[0])}
                    </div>
                  </div>

                  {/* Widescreen TV Monitor offset */}
                  {(() => {
                    const activeMonitorObj = tvState.monitors.find(m => m.id === selectedMonitorId) || tvState.monitors[0];
                    if (!activeMonitorObj) return null;
                    const activeVideoId = activeMonitorObj.playlist[activeMonitorObj.currentVideoIndex] || "ysz5S6PUM-U";
                    return (
                      <div 
                        className="transition-transform duration-100 ease-out z-10 flex flex-col items-center w-full"
                        style={{ 
                          transform: `translate(${tvX}px, ${tvY}px) scale(${tvScale})`,
                          filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.95))"
                        }}
                      >
                        {/* High fidelity horizontal setup showing flanked vertical LED column strips from Screenshot 1 */}
                        <div className="flex items-center justify-center gap-3 w-full max-w-full">
                          
                          {/* Left Vertical LED Strip Column */}
                          <div className="hidden lg:flex w-7 bg-black/90 border border-[#e8a317] h-[340px] xl:h-[390px] rounded-sm items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(232,163,23,0.3)] select-none">
                            <div className="absolute inset-0 bg-[#0b0c03]/90" />
                            <div className="absolute flex flex-col gap-6 font-mono text-[8.5px] font-black text-yellow-400 uppercase tracking-widest whitespace-nowrap animate-pulse" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                              <span>{">>>> ÚLTIMAS NOTÍCIAS >> SARAHTV ONLINE >> TRANSMISSÃO AO VIVO >>>>"}</span>
                            </div>
                          </div>

                          {/* Widescreen Simulated Physical TV Frame with dynamic controls */}
                          <div className={`relative bg-[#050505] border-[11px] border-stone-850 rounded-[1.8rem] p-1 shadow-2xl overflow-hidden flex flex-col justify-between items-stretch transition-all duration-300 ${
                            activeMonitorObj.orientation === "portrait"
                              ? "aspect-[9/16] w-[220px] sm:w-[320px] md:w-[360px] lg:w-[410px] xl:w-[460px]"
                              : "aspect-video w-[340px] sm:w-[560px] md:w-[690px] lg:w-[780px] xl:w-[910px]"
                          }`}>
                            
                            {/* Inner Translucent Header on Simulated TV Screen */}
                            <div className="relative w-full h-11 bg-black/85 backdrop-blur-md border-b border-white/5 px-4 flex items-center justify-between z-10 select-none pointer-events-none shrink-0">
                              {/* Left Side: Glowing Sinal Ativo, brand and station caption */}
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col items-start leading-none gap-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                    <span className="text-emerald-400 text-[8.5px] font-mono font-black tracking-widest">
                                      ((o)) SINAL ATIVO
                                    </span>
                                  </div>
                                  <span className="text-white text-[10px] sm:text-[11px] font-display font-black tracking-tight uppercase">
                                    SARAHTV PRO
                                  </span>
                                  <span className="text-stone-400 text-[6.5px] font-mono tracking-widest uppercase hidden sm:inline">
                                    ESTAÇÃO DE MONITORAMENTO
                                  </span>
                                </div>
                              </div>

                              {/* Center: Selected TV ID Label badge */}
                              <div className="bg-emerald-950/60 border border-emerald-500/20 rounded px-2 py-0.5 max-w-[120px] truncate hidden md:block">
                                <span className="text-emerald-400 font-mono text-[7px] font-black uppercase tracking-widest">
                                  CH_01 // {activeMonitorObj.name}
                                </span>
                              </div>

                              {/* Right Side: Magnificent glass-morphic neon green clock box matching Screenshot 1 */}
                              <div className="flex items-center gap-2">
                                <div className="bg-[#02180c]/90 border-2 border-emerald-500/80 rounded-xl px-3 py-1.2 shadow-[0_0_12px_rgba(16,185,129,0.35)] flex flex-col items-center justify-center font-mono select-none">
                                  <span className="text-emerald-400 text-xs sm:text-sm tracking-wider font-extrabold leading-none">
                                    {timeState || "15:18:47"}
                                  </span>
                                  <span className="text-[6px] text-emerald-500 font-black tracking-wider leading-none mt-0.5">
                                    BRAZIL {timeState || "15:18:47"}
                                  </span>
                                </div>
                              </div>
                            </div>

                          {/* Video area inside simulated screen, positioned between header and ticker */}
                          <div className="flex-grow w-full h-full relative pointer-events-none z-0 bg-black overflow-hidden flex items-center justify-center">
                            {activeVideoId ? (
                              false ? (
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
                                  <div className="absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center text-center p-4 text-stone-400 font-mono select-auto pointer-events-auto z-30">
                                    <FileVideo className="w-8 h-8 text-yellow-500 mb-2 animate-pulse" />
                                    <p className="text-[11px] font-bold uppercase text-white tracking-wider">VÍDEO LOCAL REQUERIDO</p>
                                    <p className="text-[9px] text-stone-300 max-w-xs mt-1 leading-normal">
                                      Este monitor está programado para exibir um vídeo local do PC. Selecione o arquivo de vídeo correspondente (.MP4) neste dispositivo para iniciar a simulação:
                                    </p>
                                    
                                    <div className="mt-3 relative">
                                      <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const url = URL.createObjectURL(file);
                                            setLocalVideos(prev => ({
                                              ...prev,
                                              [activeVideoId]: { name: file.name, url }
                                            }));
                                          }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                      />
                                      <button className="px-4 py-2 bg-gradient-to-r from-yellow-500/90 to-amber-600/90 hover:from-yellow-400 hover:to-amber-500 border border-yellow-300/30 text-stone-950 font-black text-[9px] rounded-xl flex items-center gap-1.5 uppercase transition-all duration-150 cursor-pointer shadow-md">
                                        Selecionar Arquivo .MP4
                                      </button>
                                    </div>
                                    
                                    <p className="text-[7.5px] text-stone-550 mt-2">ID do Slot: {activeVideoId}</p>
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
                          </div> {/* Closes .flex-grow video area */}

                        </div> {/* Closes Widescreen Simulated Physical TV Frame */}

                        {/* Right Vertical LED Strip Column from Screenshot 1 */}
                        <div className="hidden lg:flex w-7 bg-black/90 border border-[#e8a317] h-[340px] xl:h-[390px] rounded-sm items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(232,163,23,0.3)] select-none">
                          <div className="absolute inset-0 bg-[#0b0c03]/90" />
                          <div className="absolute flex flex-col gap-6 font-mono text-[8.5px] font-black text-yellow-400 uppercase tracking-widest whitespace-nowrap animate-pulse" style={{ writingMode: 'vertical-rl' }}>
                            <span>{">>>> PREVISÃO DE CHUVA >> IMAGES, 25 >> TRANSMISSÃO AO VIVO >>>>"}</span>
                          </div>
                        </div>

                      </div> {/* Closes flanked setup row container */}

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

              {/* LOWER TICKER NEWS OVERLAY FOR MAX EMBEDDED INTEGRATION - CO-BRANDED WITH SARAHGAMES */}
              <div className="bg-[#090209] border border-[#ee1d82]/40 p-3 rounded-2xl flex items-center overflow-hidden h-20 shadow-2xl relative z-20">
                <div className="h-full px-4 bg-[#ee1d82] flex items-center justify-center shrink-0 rounded-lg shadow-md">
                  <img 
                    src="/sarah_games.png" 
                    className="h-11 w-11 object-contain rounded-full shadow-[0_0_8px_rgba(238,29,130,0.7)] border border-white animate-pulse" 
                    alt="SarahGames Logo"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="overflow-hidden relative w-full h-full flex items-center text-white/95">
                  <div className="absolute whitespace-nowrap animate-marquee flex items-center text-lg sm:text-xl font-black uppercase tracking-wider select-none pl-6">
                    <span className="text-[#ee1d82] mr-3 text-lg sm:text-xl">🎮</span>
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
  function renderRemotePhone(isStandalone = false) {
    const activeMonitor = tvState.monitors.find(m => m.id === selectedMonitorId) || tvState.monitors[0];
    
    return (
      <div className={`w-full bg-[#080f0c] text-emerald-100 p-4 select-none font-sans transition-all ${
        isStandalone 
          ? "rounded-3xl border-2 border-[#16271e] shadow-2xl relative w-full mx-auto" 
          : "rounded-[2.8rem] border-[9px] border-[#16271e] shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative max-w-[325px] mx-auto"
      }`}>
        {/* Remote Head IR Glass window representation */}
        {!isStandalone && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-12 h-3 bg-[#0d1612] rounded-t-lg border-t border-emerald-500/20" />
        )}

        {/* Master branding and sub-signals box */}
        <div className="flex flex-col gap-1 mb-3.5 bg-[#031109]/90 border border-emerald-500/20 rounded-xl p-2.5 shadow-md">
          <div className="flex items-center gap-1.5 justify-center text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[15px] h-[15px] text-emerald-400 animate-spin [animation-duration:8s]">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[9px] font-mono font-black tracking-widest text-emerald-300">
              SARAHTVLAN TACTILE REMOTE
            </span>
          </div>
          <div className="h-[1px] bg-emerald-500/10 my-1" />
          <div className="flex justify-between items-center text-[7.5px] font-mono text-stone-400">
            <span className="text-[7.5px] font-extrabold text-[#10b981] animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-ping" />
              SINAL OPERACIONAL
            </span>
            <span className="tracking-tighter bg-emerald-950 border border-emerald-500/20 text-emerald-400 font-extrabold px-1 rounded-sm">
              ID: {selectedMonitorId || "K1083T8YYPX0B"}
            </span>
          </div>
        </div>

        {/* Translucent LCD Screen block as shown in mockup */}
        <div className="bg-[#021c10]/90 border border-[#10b981]/30 rounded-xl p-3 text-left mb-3.5 relative overflow-hidden shadow-lg select-none">
          <div className="absolute right-[-15px] top-[-15px] w-12 h-12 bg-emerald-400/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[8px] font-mono font-bold text-emerald-500/70 uppercase block tracking-widest leading-none">
            GERENCIAMENTO INDIVIDUAL
          </span>
          <div className="flex justify-between items-start mt-1">
            <div className="text-xs sm:text-sm font-sans font-black text-white truncate uppercase tracking-tight shadow-sm font-display leading-tight flex flex-col gap-1">
              <span>{activeMonitor ? activeMonitor.name : "NENHUM DETECTADO"}</span>
              {activeMonitor && (() => {
                const isOnline = activeMonitor.id === "terminal-principal" || activeMonitor.isOnline;
                return (
                  <span className={`text-[6.5px] font-mono font-bold uppercase tracking-widest px-1 py-0.5 rounded w-max ${
                    isOnline ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/15 animate-pulse' : 'bg-stone-900 border border-stone-850/40 text-stone-500'
                  }`}>
                    {isOnline ? "● CONECTADO ONLINE" : "○ OFFLINE (RECONECTE)"}
                  </span>
                );
              })()}
            </div>
            {activeMonitor?.ip && (
              <span className="text-[7.5px] font-mono font-bold bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/15 shrink-0 ml-1.5">
                IP: {activeMonitor.ip}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center text-[8px] font-mono text-stone-300 mt-2.5 border-t border-emerald-500/10 pt-1.5">
            <span className="bg-[#0b1b11] border border-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400 font-black">
              {activeMonitor?.playlist.length || 0} FILMES / VÍDEOS
            </span>
            <span className="text-yellow-405 font-black uppercase tracking-widest flex items-center gap-0.5">
              ⚡ TRANSMISSÃO MUDA
            </span>
          </div>
        </div>

        {/* Rotating Live local Info Panel (Alternando entre Tempo e Ônibus Local!) */}
        <div className="bg-black/85 border border-[#10b981]/15 rounded-xl p-2.5 mb-3.5 text-left relative overflow-hidden shadow-inner font-sans">
          <div className="absolute right-2 top-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-yellow-405 rounded-full animate-ping" />
            <span className="text-[5.5px] font-mono text-stone-500 uppercase tracking-widest">LIVE ROTATOR</span>
          </div>

          {phoneRotateSlide === "weather" ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[7.5px] font-mono font-bold text-amber-400 uppercase tracking-widest leading-none block">
                  CÉU & CLIMA (OSASCO)
                </span>
                <span className="text-xs font-sans font-black text-white mt-1.5 block uppercase tracking-tight">
                  {tvState.temperature}
                </span>
              </div>
              <div className="flex items-center gap-1.5 select-none shrink-0 bg-[#021c10]/40 border border-[#10b981]/15 px-2 py-1 rounded-lg">
                <span className="text-lg">☀️</span>
                <span className="text-[7.5px] font-mono text-emerald-400 font-extrabold uppercase">HUM. 85%</span>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-[7.5px] font-mono font-bold text-emerald-400 uppercase tracking-widest leading-none block">
                PARTIDAS NA LOCALIDADE DA TELA
              </span>
              <p className="text-[8px] text-stone-400 mt-1 leading-tight uppercase font-extrabold tracking-tight truncate max-w-[270px]">
                Ponto: <span className="text-white">{activeMonitor?.location || "Avenida Zumbi dos Palmares"}</span>
              </p>

              <div className="flex flex-wrap gap-1 mt-2">
                {(activeMonitor?.customBusLines || "035/034/466X1").split('/').map((line, i) => {
                  const cleanLine = line.trim();
                  if (!cleanLine) return null;
                  const time = getLineTime(cleanLine);
                  return (
                    <div key={i} className="bg-stone-950 border border-emerald-500/15 rounded-md px-1.5 py-1 flex items-center gap-1 shrink-0">
                      <span className="bg-yellow-405 text-stone-950 font-mono text-[7.5px] px-1 py-0.2 rounded font-black leading-none">
                        {cleanLine}
                      </span>
                      <span className="text-[7.5px] font-mono font-bold text-stone-300">
                        {time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick manual Toggle Button & bar pagination */}
          <div className="flex justify-between items-center mt-2 border-t border-emerald-500/10 pt-1.5 text-[6.5px] font-mono text-stone-500">
            <button
              type="button"
              onClick={() => setPhoneRotateSlide(prev => prev === "weather" ? "transit" : "weather")}
              className="hover:text-amber-400 transition flex items-center gap-0.5 select-none cursor-pointer font-bold leading-none"
            >
              🔄 ALTERAR WIDGET
            </button>
            <div className="flex gap-1">
              <span className={phoneRotateSlide === "weather" ? "text-yellow-400" : "text-stone-700"}>●</span>
              <span className={phoneRotateSlide === "transit" ? "text-emerald-400" : "text-stone-700"}>●</span>
            </div>
          </div>
        </div>

        {/* Sleek Tab Bar inside the cell phone screen area with active glow status borders */}
        <div className="grid grid-cols-3 gap-0.5 mb-3.5 bg-black/85 p-1 rounded-xl border border-[#10b981]/15">
          <button
            type="button"
            onClick={() => setPhoneControlTab("telas")}
            className={`py-2 text-[7.5px] sm:text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all duration-150 flex flex-col items-center justify-center gap-0.5 ${phoneControlTab === "telas" ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]' : 'bg-transparent border-transparent text-stone-400 hover:text-stone-200'}`}
          >
            <Tv className="w-3.5 h-3.5" />
            Telas
          </button>
          <button
            type="button"
            onClick={() => setPhoneControlTab("playlist")}
            className={`py-2 text-[7.5px] sm:text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all duration-150 flex flex-col items-center justify-center gap-0.5 ${phoneControlTab === "playlist" ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]' : 'bg-transparent border-transparent text-stone-400 hover:text-stone-200'}`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            Play
          </button>
          <button
            type="button"
            onClick={() => setPhoneControlTab("ajustes")}
            className={`py-2 text-[7.5px] sm:text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all duration-150 flex flex-col items-center justify-center gap-0.5 ${phoneControlTab === "ajustes" ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]' : 'bg-transparent border-transparent text-stone-400 hover:text-stone-200'}`}
          >
            <Settings className="w-3.5 h-3.5" />
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
                const isOnline = m.id === "terminal-principal" || m.isOnline;
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
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${
                        isSelected 
                          ? (isOnline ? 'bg-stone-950 animate-pulse' : 'bg-stone-950 opacity-40') 
                          : (isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-600')
                      }`} />
                      <div className="flex flex-col truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black truncate max-w-[155px] uppercase font-mono leading-tight">{m.name}</span>
                          {!isOnline && (
                            <span className={`text-[6px] px-1 py-[1.5px] rounded tracking-wide leading-none font-bold ${
                              isSelected ? 'bg-stone-950/20 text-stone-950/80 border border-stone-950/20' : 'bg-stone-900/40 text-stone-500 border border-stone-850/40'
                            }`}>
                              OFFLINE
                            </span>
                          )}
                        </div>
                        {m.ip && (
                          <span className={`text-[7.5px] font-mono leading-none mt-0.5 font-bold ${isSelected ? 'text-stone-800' : 'text-stone-500'}`}>
                            IP: {m.ip}
                          </span>
                        )}
                      </div>
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

            {/* Active Monitor Connection & Direct Linking Helper */}
            <div className="border-t border-stone-900/40 pt-2.5 mt-2 flex flex-col gap-1.5 bg-black/45 p-2 rounded-xl border border-stone-900/40">
              <span className="text-[7.5px] font-mono font-bold text-amber-400 uppercase tracking-widest text-center flex items-center justify-center gap-1">
                <ExternalLink className="w-2.5 h-2.5" />
                VINCULAR NO OUTRO PC OU TV
              </span>
              <p className="text-[7px] text-stone-400 leading-tight text-center">
                Selecione o monitor acima, copie o link e abra-o no navegador da sua TV física ou outro PC de transmissão:
              </p>

              <div className="flex gap-1 mt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const l = `${window.location.origin}/?mode=tv&monitor=${selectedMonitorId}`;
                    navigator.clipboard.writeText(l);
                    alert(`Link para o monitor "${activeMonitor?.name}" copiado com sucesso! Abra este link no outro PC.`);
                  }}
                  className="flex-grow py-1 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 font-bold rounded-lg text-[8px] flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  <Copy className="w-2.5 h-2.5 text-stone-400" />
                  Copiar Link
                </button>
                <a
                  href={`${window.location.origin}/?mode=tv&monitor=${selectedMonitorId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-lg text-[8px] flex items-center justify-center gap-1 transition active:scale-95 text-center"
                >
                  Abrir ↗
                </a>
              </div>
              <div className="text-[6.5px] font-mono text-stone-500 leading-tight text-center mt-0.5">
                * Para telas independentes mesmo com o mesmo IP da Wi-Fi familiar/comercial!
              </div>
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

            {/* Dicas de Funcionamento de Vídeo / Ajuda */}
            <div className="bg-[#181105] border border-amber-500/20 rounded-xl p-2.5 text-[8.5px] leading-snug text-amber-200 flex flex-col gap-1.5 text-left">
              <div className="font-sans font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 text-[9px]">
                <span>🚨 AJUDA COM SEUS VÍDEOS:</span>
              </div>
              <p className="font-sans font-medium text-stone-300">
                1. <b>YouTube Privado NÃO RODA:</b> Vídeos privados exigem senha/login e são bloqueados para exibição em sites externos pelo YouTube. <b className="text-amber-400">Solução:</b> Altere o vídeo na sua conta do YouTube para <b>"Não listado" (Unlisted)</b>. Assim ele continua seguro/oculto, mas roda perfeitamente em sua sinalização!
              </p>
              <p className="font-sans font-medium text-stone-300">
                2. <b>VDO.Ninja:</b> Precisa de acesso à câmera/microfone. Se abrir dentro do editor do site, o navegador pode bloquear por segurança. <b className="text-emerald-400">Solução:</b> Copie o link de visualização da TV e <b>"Abra em Nova Aba"</b> ou em outra tela para liberar a câmera sem restrições!
              </p>
            </div>

            {/* Tracklist layout for active monitor */}
            <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto mt-1 scrollbar-thin pr-1">
              {activeMonitor?.playlist.map((vidId, idx) => {
                const isPlayingNow = idx === activeMonitor.currentVideoIndex;
                const isLocal = vidId.startsWith("local-");
                const isVdo = vidId.startsWith("vdoninja-");
                
                // Determine thumbnail content
                let thumbSrc = "";
                if (!isLocal && !isVdo) {
                  thumbSrc = `https://img.youtube.com/vi/${vidId}/mqdefault.jpg`;
                }

                return (
                  <div
                    key={`${vidId}-${idx}`}
                    className={`p-1 flex justify-between items-center bg-[#020a06] rounded-xl border transition-all duration-150 ${isPlayingNow ? "border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.25)] bg-[#04140b]" : "border-[#10b981]/10"}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectActiveVideo(activeMonitor.id, idx)}
                      className="flex items-center gap-2 flex-grow text-left truncate mr-1"
                    >
                      {/* Thumbnail wrapper matching Screenshot 2 */}
                      <div className="w-[38px] h-[26px] rounded bg-stone-950 border border-[#10b981]/20 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {thumbSrc ? (
                          <img 
                            src={thumbSrc} 
                            referrerPolicy="no-referrer"
                            alt="thumb" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="text-[9px] text-[#10b981] font-mono font-bold">
                            {isLocal ? "📁" : "📡"}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 bg-[#000]/80 text-[6px] text-[#10b981] font-mono leading-none px-0.5 rounded-l border-t border-l border-[#10b981]/20">
                          {idx + 1}
                        </span>
                      </div>

                      <div className="flex flex-col truncate leading-tight">
                        <span className="text-stone-100 text-[9px] font-mono font-bold truncate max-w-[105px]">
                          {isLocal ? (
                            <span className="text-yellow-405">
                              {localVideos[vidId]?.name || "Vídeo PC"}
                            </span>
                          ) : isVdo ? (
                            <span className="text-cyan-405">VDO: {vidId.replace("vdoninja-", "")}</span>
                          ) : (
                            <span className="text-stone-300">YT: {vidId}</span>
                          )}
                        </span>
                        {isPlayingNow && (
                          <span className="text-[6.5px] font-mono text-[#10b981]/85 tracking-widest uppercase font-extrabold flex items-center gap-0.5">
                            <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                            EM EXIBIÇÃO
                          </span>
                        )}
                      </div>
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

        {/* TAB 4: AJUSTES DA TELA ATIVA */}
        {phoneControlTab === "ajustes" && (
          <div className="mb-3.5 bg-stone-950/40 p-2 rounded-2xl border border-stone-900/60 flex flex-col gap-2.5 font-sans">
            <span className="text-[7px] font-mono font-bold text-stone-500 uppercase block tracking-widest text-center">
              OPÇÕES DO MONITOR ATIVO
            </span>

            {/* In-Phone Options Form (Name, Location, Bus Lines) */}
            <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-850/60 flex flex-col gap-2">
              <div>
                <label className="text-[7.5px] text-stone-405 font-extrabold uppercase tracking-wide block">
                  Identificação do Monitor
                </label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="Nome do monitor..."
                  className="w-full mt-1 bg-[#020d08] border border-[#212121] text-[10px] font-bold px-2 py-1.5 rounded-xl text-white focus:outline-none focus:border-yellow-450 font-sans"
                />
              </div>

              <div>
                <label className="text-[7.5px] text-stone-405 font-extrabold uppercase tracking-wide block">
                  📍 Ponto / Rua / Localização Física
                </label>
                <input
                  type="text"
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  placeholder="Ex: Av. Zumbi dos Palmares..."
                  className="w-full mt-1 bg-[#020d08] border border-stone-850 text-[10px] font-bold px-2 py-1.5 rounded-xl text-white focus:outline-none focus:border-yellow-450 font-sans"
                />
              </div>

              <div>
                <label className="text-[7.5px] text-stone-405 font-extrabold uppercase tracking-wide block mb-1.5">
                  🚌 Acesso às Linhas (Ativar/Desativar)
                </label>
                <div className="grid grid-cols-3 gap-1.5 mb-1">
                  {["035", "034", "466X1"].map((lineNum) => {
                    const linesArray = customBusLinesValue
                      .split("/")
                      .map(l => l.trim().toUpperCase())
                      .filter(Boolean);
                    const isEnabled = linesArray.includes(lineNum);

                    const handleToggle = () => {
                      let nextLines: string[];
                      if (isEnabled) {
                        nextLines = linesArray.filter(l => l !== lineNum);
                      } else {
                        nextLines = [...linesArray, lineNum];
                      }
                      const orderedLines = ["035", "034", "466X1"].filter(l => nextLines.includes(l));
                      const newValue = orderedLines.join("/");
                      setCustomBusLinesValue(newValue);
                    };

                    return (
                      <button
                        key={lineNum}
                        type="button"
                        onClick={handleToggle}
                        className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase transition-all duration-150 border text-center ${
                          isEnabled
                            ? "bg-emerald-950/80 text-emerald-450 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                            : "bg-stone-900/50 text-stone-550 border-stone-850/60"
                        }`}
                      >
                        <span className="block text-[11px] font-mono leading-none mb-1">{lineNum}</span>
                        <span className={`text-[6px] font-bold px-1 py-0.2 rounded-sm ${
                          isEnabled ? "bg-emerald-500/10 text-emerald-400" : "bg-stone-950 text-stone-500"
                        }`}>
                          {isEnabled ? "HABILITADO" : "DESATIVADO"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (activeMonitor) {
                    handleUpdateMonitorDetails(activeMonitor.id, renameValue, locationValue, customBusLinesValue);
                    alert("Ajustes do monitor atualizados com sucesso!");
                  }
                }}
                className="w-full mt-1 bg-yellow-405 hover:bg-yellow-350 active:scale-95 text-stone-950 font-black text-[9.5px] py-1.5 rounded-xl uppercase tracking-wider transition-all shadow-md font-sans text-center"
              >
                Salvar Ajustes do Monitor
              </button>
            </div>

            {/* MONITOR MUTE TOGGLE CARD DIRECTLY IN SETTINGS FOR MAXIMUM SIMPLICITY */}
            <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-850/60 flex flex-col gap-1.5 text-left">
              <div className="flex justify-between items-center bg-[#02180e] px-2 py-1 rounded-lg border border-emerald-500/10">
                <span className="text-[8px] text-stone-450 font-extrabold uppercase tracking-wide">
                  ÁUDIO DA TV
                </span>
                <span className={`text-[6px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  activeMonitor?.mute ? 'bg-stone-900 text-stone-500' : 'bg-emerald-950 text-emerald-400 animate-pulse'
                }`}>
                  {activeMonitor?.mute ? "MUDO" : "ALTO-FALANTE ATIVO"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (activeMonitor) {
                    handleToggleMute(activeMonitor.id);
                  }
                }}
                className={`w-full py-2.5 rounded-xl border text-[9px] font-black flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 shadow-md ${
                  activeMonitor?.mute
                    ? "bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-300"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border-emerald-400 text-white shadow-[0_3px_10px_rgba(16,185,129,0.25)]"
                }`}
              >
                {activeMonitor?.mute ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                    ATIVAR SOM DA TV (UNMUTE)
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" />
                    DESATIVAR SOM DA TV (MUTAR)
                  </>
                )}
              </button>
            </div>

            {/* Simulation Controls (Rotation Layout) */}
            <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-850/60 flex flex-col gap-1.5">
              <span className="text-[8px] text-stone-450 font-extrabold uppercase tracking-wide block">
                Giro, Layout e Reset da Tela
              </span>
              <button
                type="button"
                onClick={() => {
                  if (activeMonitor) handleToggleOrientation(activeMonitor.id);
                }}
                className={`py-2.5 px-3 w-full rounded-xl border text-[9px] font-black flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 shadow-md font-sans ${
                  activeMonitor?.orientation === "portrait"
                    ? "bg-amber-950/90 border-[#e8a317] text-[#e8a317] shadow-[0_2px_8px_rgba(232,163,23,0.15)]"
                    : "bg-stone-900 border-stone-850 text-stone-200 hover:bg-stone-850"
                }`}
              >
                <Smartphone className={`w-3.5 h-3.5 ${activeMonitor?.orientation === "portrait" ? "text-amber-400 rotate-90" : "text-stone-400"} transition-transform duration-300`} />
                <span className="tracking-wide uppercase font-sans leading-none">GIRAR ORIENTAÇÃO DA TELA (RET/PAIS)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeMonitor) {
                    handleRemoteForceRefresh(activeMonitor.id);
                  }
                }}
                className="py-2.5 px-3 w-full bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-xl text-[9px] font-black flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 shadow-md font-sans cursor-pointer mt-1"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span className="tracking-wide uppercase font-sans leading-none">RECARREGAR TELA REMOTAMENTE (F5)</span>
              </button>
            </div>
          </div>
        )}

        {/* Brand Label with Firebase/Cloud Run status ribbon */}
        <div className="mt-3 text-center border-t border-emerald-500/10 pt-2.5">
          <p className="text-[6.5px] font-mono text-emerald-500/75 uppercase tracking-wide leading-relaxed animate-pulse">
            ((o)) SARAHTVLAN REMOTE TERMINAL HUB
          </p>
          <p className="text-[5.5px] font-mono text-stone-500 uppercase tracking-widest leading-relaxed mt-0.5">
            FIREBASE CLOUD REALTIME CONNECTION ACTIVE // CLOUD RUN ENG
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: THE DYNAMIC PASSENGER CELLPHONE
  // ==========================================
  function renderPassengerPhone(monitorArg?: any) {
    const monitorObj = monitorArg || tvState.monitors.find(m => m.id === (urlMonitorId || selectedMonitorId)) || tvState.monitors[0];
    return (
      <PassengerPhone 
        tvState={tvState} 
        timeState={timeState} 
        getWeatherIcon={getWeatherIcon} 
        activeMonitor={monitorObj}
        slide={passengerScreenSlide}
        setSlide={setPassengerScreenSlide}
      />
    );
  }
} // Closes export default function App()
interface PassengerPhoneProps {
  tvState: any;
  timeState: string;
  getWeatherIcon: (temp: string) => ReactNode;
  activeMonitor?: any;
  slide?: string;
  setSlide?: (slide: string) => void;
}

const SLIDES_SEQUENCE = [
  "weather",
  "news-bairro",
  "news-geral",
  "news-esportes",
  "news-fofocas",
  "news-gospel"
];

interface NewsArticle {
  title: string;
  subtitle: string;
  source: string;
  image: string;
  time: string;
  badge: string;
  badgeColor: string;
}

const ALL_NEWS_DATABASE: Record<string, NewsArticle[]> = {
  bairro: [
    {
      title: "AVENIDA ZUMBI DOS PALMARES RECEBE NOVO RECAPEAMENTO COMPLETO E LUZ INTEGRAL LED",
      subtitle: "Asfalto novo, sinalização reforçada e iluminação branca em LED trazem extrema segurança aos moradores do Parque Palmares.",
      source: "Gazeta de Osasco • Bairro",
      image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?w=450&auto=format&fit=crop&q=80",
      time: "Há 4 min",
      badge: "INFRAESTRUTURA",
      badgeColor: "bg-amber-100/90 text-amber-900 border border-amber-205"
    },
    {
      title: "FEIRA CULTURAL DE DOMINGO NA ZUMBI DOS PALMARES REÚNE PÚBLICO RECORDE COM PASTÉIS E ARTESANATO",
      subtitle: "Novos feirantes, música instrumental beneficente e doces artesanais mobilizam centenas de famílias no final de semana.",
      source: "Bairro em Foco • Palmares",
      image: "https://images.unsplash.com/photo-1488459711615-466d6a2f4da8?w=450&auto=format&fit=crop&q=80",
      time: "Há 42 min",
      badge: "COMÉRCIO LOCAL",
      badgeColor: "bg-emerald-100/90 text-emerald-950 border border-emerald-200"
    },
    {
      title: "NOVA CRECHE INTEGRADA DO JARDIM PALMARES AMPLIA VAGAS PARA 250 BEBÊS DE MÃES TRABALHADORAS",
      subtitle: "Inauguração com auditório, refeitório assistido e parquinho em verniz ecológico gera elogios gerais dos moradores.",
      source: "Portal Osasco Leste • Educação",
      image: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=450&auto=format&fit=crop&q=80",
      time: "Há 2 horas",
      badge: "EDUCAÇÃO",
      badgeColor: "bg-blue-100/90 text-blue-900 border border-blue-200"
    },
    {
      title: "MUTIRÃO SOLIDÁRIO NO PARQUE PALMARES DISTRIBUI CESTAS BÁSICAS E ATENDIMENTO ODONTOLÓGICO",
      subtitle: "Igrejas unidas organizam ação cívica de alta ajuda na quadra pública, com dentistas voluntários grátis.",
      source: "Jornal do Palmares • Solidário",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=450&auto=format&fit=crop&q=80",
      time: "Há 5 horas",
      badge: "AÇÃO SOCIAL",
      badgeColor: "bg-purple-100/90 text-purple-900 border border-purple-200"
    }
  ],
  geral: [
    {
      title: "G1: FRENTE FRIA AVANÇA EM SP COM ALERTA DE CHUVA SEVERA E VENTOS DE ATÉ 60KM/H",
      subtitle: "Defesa Civil paulista emite comunicado de atenção para queda histórica de temperatura de até 12 graus.",
      source: "g1 Osasco",
      image: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=450&auto=format&fit=crop&q=80",
      time: "Há 2 min",
      badge: "ALERTA TEMPO",
      badgeColor: "bg-red-100 text-red-900 border border-red-200"
    },
    {
      title: "CNN: TARIFA INTEGRADA DE ÔNIBUS DO SISTEMA EMTU SOFRE ATUALIZAÇÃO BENÉFICA PARA TRABALHADOR",
      subtitle: "Novas regras de integração de bilhetes metropolitanos ampliam limite de tempo e reduzem tarifas conexas.",
      source: "CNN Brasil",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=450&auto=format&fit=crop&q=80",
      time: "Há 20 min",
      badge: "UTILIDADE PÚBLICA",
      badgeColor: "bg-indigo-100 text-indigo-900 border border-indigo-200"
    },
    {
      title: "ANVISA HOMOLOGA NOVO TESTE RÁPIDO DISPONÍVEL EM FARMÁCIAS QUE DETECTA 4 INFLUENZAS EM 10 MIN",
      subtitle: "Revolução diagnóstica de tecnologia nacional agiliza o isolamento de gripes fortes e minimiza filas hospitalares.",
      source: "g1 Saúde",
      image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=450&auto=format&fit=crop&q=80",
      time: "Há 1 hora",
      badge: "SAÚDE PÚBLICA",
      badgeColor: "bg-teal-100 text-teal-900 border border-teal-200"
    }
  ],
  esportes: [
    {
      title: "GE: ABEL FERREIRA RETORNA COM TITULARES PESADOS E GARANTE TIME COM SEDE DE ATAQUE NO ALLIANZ",
      subtitle: "Allianz Parque atinge marca de 38 mil ingressos comprados de forma antecipada. Promessa de caldeirão verde.",
      source: "ge São Paulo",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=450&auto=format&fit=crop&q=80",
      time: "Há 12 min",
      badge: "BRASILEIRÃO 2026",
      badgeColor: "bg-emerald-100 text-emerald-900 border border-emerald-300"
    },
    {
      title: "SANTOS ESTUDA ESTREIA DE DUAS NOVAS JOIAS SUL-AMERICANAS JOGANDO NA VILA BELMIRO",
      subtitle: "Regularização no BID acontece no início da noite e Carille sinaliza que ambos começam no banco para ganhar ritmo.",
      source: "Gazeta Esportiva",
      image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=450&auto=format&fit=crop&q=80",
      time: "Há 28 min",
      badge: "SANTOS FC",
      badgeColor: "bg-slate-100 text-slate-900 border border-slate-300"
    },
    {
      title: "SÃO PAULO PRORROGA CONTRATO COM SUCESSO DE ATACANTE APÓS ASSÉDIO DO FUTEBOL ITALIANO",
      subtitle: "Tricolor estende o vínculo de forma estratégica com multa gorda e bonificações indexadas a metas de gols.",
      source: "ge Tricolor",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=450&auto=format&fit=crop&q=80",
      time: "Há 2 horas",
      badge: "TRICOLOR",
      badgeColor: "bg-rose-100 text-rose-900 border border-rose-200"
    }
  ],
  fofocas: [
    {
      title: "CHOQUEI: CANTOR SERTANEJO MAIS TOCADO DO ANO É VISTO COM NOVA MODELO EM RESTAURANTE DE SP",
      subtitle: "Assessoria nega assessoria afetiva, mas fãs fervorosos apontam que as malas dele já estão na casa da famosa.",
      source: "Portal Choquei",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=450&auto=format&fit=crop&q=80",
      time: "Há 3 min",
      badge: "FOFOCA EXCLUSIVA",
      badgeColor: "bg-yellow-100 text-yellow-950 border border-yellow-250"
    },
    {
      title: "LÉO DIAS: APRESENTADORA DE SUCESSO PREPARA CHÁ DE REVELAÇÃO EXTREMAMENTE SECRETO",
      subtitle: "Fontes exclusivas adiantam que apenas 15 parentes íntimos viajarão para fazenda paradisíaca no interior de SP.",
      source: "Léo Dias • Exclusivo",
      image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=450&auto=format&fit=crop&q=80",
      time: "Há 18 min",
      badge: "CELEBRIDADES",
      badgeColor: "bg-fuchsia-100 text-fuchsia-950 border border-fuchsia-250"
    },
    {
      title: "INFLUENCER COM 45 MILHÕES DE SEGUIDORES CHOCA REDES AO POSTAR CLOSET GIGANTE E APREENSÃO DE JOIAS",
      subtitle: "Tour mostra itens de grifes que somam mais de R$ 3 milhões. Internautas debatem sobre ostentação saudável.",
      source: "Fofoquei Oficial",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=450&auto=format&fit=crop&q=80",
      time: "Há 1 hora",
      badge: "MUNDO POP",
      badgeColor: "bg-pink-100 text-pink-900 border border-pink-200"
    }
  ],
  gospel: [
    {
      title: "CANTORA GOSPEL ATINGE RECORDE DE 110 MILHÕES DE STREAMINGS E LANÇA SINGLE ACÚSTICO",
      subtitle: "A nova música em voz e piano promete se tornar o hino oficial das orações noturnas mais íntimas de 2026.",
      source: "Pleno News Gospel",
      image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=450&auto=format&fit=crop&q=80",
      time: "Há 15 min",
      badge: "LOUVOR & ADORAÇÃO",
      badgeColor: "bg-cyan-50 text-cyan-900 border border-cyan-205"
    },
    {
      title: "CONGRESSO DE FRATERNIDADE UNE MILHARES DE PESSOAS EM ESTÁDIO NO INTERIOR DE SP",
      subtitle: "Líderes de mais de trinta igrejas consagram orações coletivas pela paz nas comunidades metropolitanas paulistas.",
      source: "Gospel Prime",
      image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=450&auto=format&fit=crop&q=80",
      time: "Há 4 horas",
      badge: "VIGÍLIA GERAL",
      badgeColor: "bg-sky-50 text-sky-950 border border-sky-102"
    },
    {
      title: "SALA DE MULTIMÍDIA GOSPEL NO PALMARES OFERECE CURSOS GRÁTIS DE TI E EDIÇÃO DE VÍDEO",
      subtitle: "Iniciativa voluntária de jovens cristãos já matriculou mais de 80 crianças do bairro neste mês.",
      source: "União Divina • Social",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=450&auto=format&fit=crop&q=80",
      time: "Há 6 horas",
      badge: "PROJETO CRISTÃO",
      badgeColor: "bg-emerald-50 text-emerald-950 border border-emerald-100"
    }
  ]
};

function PassengerPhone({ 
  tvState, 
  timeState, 
  getWeatherIcon, 
  activeMonitor,
  slide: propSlide,
  setSlide: propSetSlide
}: PassengerPhoneProps) {
  const [localSlide, setLocalSlide] = useState<string>("weather");
  const [isAutoplay, setIsAutoplay] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  // Custom states for interactive items
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Record<string, boolean>>({});
  
  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // News active offsets to cycle articles whenever returning to a slide!
  const [newsOffsets, setNewsOffsets] = useState<Record<string, number>>({
    bairro: 0,
    geral: 0,
    esportes: 0,
    fofocas: 0,
    gospel: 0
  });

  const slide = propSlide !== undefined ? propSlide : localSlide;
  const setSlide = propSetSlide !== undefined ? propSetSlide : setLocalSlide;

  const handleSetSlide = (newSlide: string) => {
    setSlide(newSlide);
    setProgress(0);
  };

  // Rotate category articles on slide change to guarantee always fresh content when returning to a slide!
  useEffect(() => {
    const categoryKey = slide.replace("news-", "");
    if (newsOffsets[categoryKey] !== undefined) {
      setNewsOffsets(prev => {
        const arry = ALL_NEWS_DATABASE[categoryKey] || [];
        const nextVal = (prev[categoryKey] + 1) % (arry.length || 1);
        return {
          ...prev,
          [categoryKey]: nextVal
        };
      });
    }
  }, [slide]);

  // Rotates category articles based on state offsets to ensure varied display
  const getRotatedCategoryArticles = (cat: string): NewsArticle[] => {
    const list = ALL_NEWS_DATABASE[cat] || [];
    if (list.length === 0) return [];
    const offset = newsOffsets[cat] || 0;
    return [...list.slice(offset), ...list.slice(0, offset)];
  };

  // Get current active articles to render based on selection filter
  const getActiveFeedArticles = (): NewsArticle[] => {
    if (slide === "weather") {
      const bArticles = getRotatedCategoryArticles("bairro");
      const gArticles = getRotatedCategoryArticles("geral");
      const eArticles = getRotatedCategoryArticles("esportes");
      const fArticles = getRotatedCategoryArticles("fofocas");
      const goArticles = getRotatedCategoryArticles("gospel");
      
      const merged: NewsArticle[] = [];
      const maxLength = Math.max(bArticles.length, gArticles.length, eArticles.length, fArticles.length, goArticles.length);
      for (let i = 0; i < maxLength; i++) {
        if (bArticles[i]) merged.push(bArticles[i]);
        if (gArticles[i]) merged.push(gArticles[i]);
        if (eArticles[i]) merged.push(eArticles[i]);
        if (fArticles[i]) merged.push(fArticles[i]);
        if (goArticles[i]) merged.push(goArticles[i]);
      }
      return merged;
    }

    const catKey = slide.replace("news-", "");
    return getRotatedCategoryArticles(catKey);
  };

  // Autoplay sequence logic
  useEffect(() => {
    if (!isAutoplay) {
      setProgress(0);
      return;
    }

    const stepMs = 100;
    const durationMs = 8000; // 8 seconds per slide
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          const currentIndex = SLIDES_SEQUENCE.indexOf(slide);
          const nextIndex = (currentIndex + 1) % SLIDES_SEQUENCE.length;
          setSlide(SLIDES_SEQUENCE[nextIndex]);
          return 0;
        }
        return prev + (stepMs / durationMs) * 100;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isAutoplay, slide, setSlide]);

  const currTemp = parseInt(tvState.temperature) || 17;
  const sensation = currTemp - 1;
  const clockShort = timeState ? timeState.substring(0, 5) : "11:05";

  // Filter feed by search query
  const rawArticles = getActiveFeedArticles();
  const filteredArticles = rawArticles.filter(art => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return art.title.toLowerCase().includes(term) || 
           art.subtitle.toLowerCase().includes(term) || 
           art.source.toLowerCase().includes(term);
  });

  return (
    <div className="w-full bg-[#1e222b] text-[#f1f3f4] rounded-[2.8rem] border-[8px] border-[#2d323f] p-3 shadow-[0_25px_50px_rgba(0,0,0,0.85)] relative select-none font-sans">
      {/* Notch screen */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-[#2d323f] rounded-b-xl z-20 flex justify-center items-center">
        <div className="w-8 h-0.5 bg-stone-950 rounded-full mt-1" />
      </div>

      {/* Screen Wrapper with Google Discover theme */}
      <div 
        className="relative rounded-[2rem] min-h-[500px] flex flex-col justify-between overflow-hidden transition-all duration-300 bg-[#f1f3f4]"
      >

        {/* Dynamic header of the phone */}
        <div className="pt-4 px-4 z-10 flex justify-between items-center text-[9px] font-mono font-bold text-stone-700 mb-2 select-none">
          <span className="tracking-widest border px-1.5 py-0.5 rounded text-[8.5px] bg-stone-205 border-stone-300">
            {clockShort}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Wifi Inline Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 inline-block text-stone-600">
              <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[7.5px] tracking-tighter border font-extrabold rounded px-1 scale-90 bg-stone-205 border-stone-300">
              4G_PLUS
            </span>
            {/* Battery Indicator with 98% */}
            <div className="h-3 w-[22px] border rounded-xs flex items-center p-0.5 relative gap-[1.5px] border-stone-400">
              <div className="h-full w-[98%] rounded-3xs bg-emerald-600" />
              <div className="absolute right-[0.5px] top-[4px] w-[1px] h-[3px] bg-stone-400" />
              <span className="absolute inset-0 text-[6px] font-sans flex items-center justify-center font-extrabold scale-[0.8] text-white font-black">98</span>
            </div>
          </div>
        </div>

        {/* GOOGLE CHROME SEARCH BAR */}
        <div className="px-3 py-1 bg-[#f1f3f4] z-10 shrink-0 select-none">
          <div className="bg-white rounded-full px-3.5 py-2 flex items-center gap-2 shadow-3xs border border-stone-200 transition-all hover:shadow-xs">
            {/* Beautiful G Icon banner */}
            <div className="w-5 h-5 flex items-center justify-center mr-0.5 select-none font-black font-sans shrink-0 bg-stone-100 rounded-full text-xs">
              <span className="text-blue-500">G</span>
              <span className="text-red-500 text-[10px] scale-90">o</span>
              <span className="text-yellow-500 text-[10px] scale-90 font-bold">o</span>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar notícias de Osasco..." 
              className="w-full bg-transparent border-none text-stone-800 text-[11px] font-bold outline-none focus:ring-0 placeholder-stone-400 font-sans"
            />
            <span className="text-[11px] text-stone-400 shrink-0">🔍</span>
          </div>
        </div>

        {/* PILLS CATEGORIES TABS */}
        <div className="z-10 px-2 pb-1 shrink-0 bg-[#f1f3f4] select-none">
          <div className="flex overflow-x-auto whitespace-nowrap gap-1 py-1.5 px-0.5 scrollbar-none scroll-smooth">
            {SLIDES_SEQUENCE.map((s) => {
              let label = "";
              let icon = "";
              let accentColor = "";
              if (s === "weather") { label = "Início/Clima"; icon = "✨"; accentColor = "text-amber-500"; }
              else if (s === "news-bairro") { label = "Bairro"; icon = "🏡"; accentColor = "text-emerald-500"; }
              else if (s === "news-geral") { label = "Portais"; icon = "📰"; accentColor = "text-indigo-500"; }
              else if (s === "news-esportes") { label = "Esportes"; icon = "⚽"; accentColor = "text-emerald-600"; }
              else if (s === "news-fofocas") { label = "Fofocas"; icon = "🔥"; accentColor = "text-red-500"; }
              else if (s === "news-gospel") { label = "Gospel"; icon = "🙌"; accentColor = "text-amber-600"; }

              const isActive = slide === s;
              return (
                <button
                  key={s}
                  onClick={() => handleSetSlide(s)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight flex items-center gap-1 shrink-0 select-none transition-all duration-150 active:scale-95 border ${
                    isActive
                      ? "bg-slate-900 border-slate-950 text-white shadow-md font-bold scale-[1.03]"
                      : "bg-white border-stone-205 text-stone-600 hover:bg-stone-55"
                  }`}
                >
                  <span className={`${accentColor} text-[10px]`}>{icon}</span>
                  <span className="font-sans font-extrabold leading-none">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* COMPONENT BODY */}
        <div className="flex-grow z-10 overflow-y-auto max-h-[360px] h-[355px] scrollbar-none relative bg-[#f1f3f4] p-3 pt-1 flex flex-col gap-3">
          <AnimatePresence mode="wait" initial={false}>
            {slide === "weather" && (
              <motion.div
                key="weather-block"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-gradient-to-br from-[#0a2342] to-[#123c69] border border-blue-900 rounded-2xl p-3.5 text-white shadow-md flex flex-col gap-2 relative overflow-hidden shrink-0 select-none text-left"
              >
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-center leading-none">
                  <div>
                    <span className="text-[7.5px] font-mono font-bold text-amber-400 uppercase tracking-widest leading-none block">Clima Atual • Osasco</span>
                    <span className="text-3xl font-display font-black tracking-tighter mt-1 block">{currTemp}°C</span>
                  </div>
                  <div className="text-3xl animate-bounce">🌦️</div>
                </div>

                <div className="flex justify-between items-center text-[8.5px] font-mono text-stone-200 border-t border-white/10 pt-2 mt-1">
                  <span>Sensação: {sensation}°C</span>
                  <span className="text-emerald-400 font-bold">Nuvens e Chuva</span>
                  <span>Umid.: 85%</span>
                </div>
              </motion.div>
            )}

            {(slide === "bus-035" || slide === "bus-034" || slide === "bus-466x1") && (
              <motion.div
                key={slide}
                initial={{ x: 120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -120, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col text-left flex-grow -mx-3 -mt-2 bg-[#f4f6f9] overflow-hidden"
              >
                {/* BLUE HEADER BAR - EXACT MATCH TO USER COMPONENT PHOTO */}
                <div className="bg-[#002d62] text-white py-2 px-3 flex items-center justify-between font-sans select-none shrink-0 border-b border-blue-900 shadow-sm">
                  <span className="text-white text-[11px] font-extrabold uppercase tracking-wider">
                    Ponto de Parada
                  </span>
                  <div className="bg-emerald-400 w-1.5 h-1.5 rounded-full animate-pulse mr-1" title="Sinal Conectado" />
                </div>

                {/* SUB HEADER BAR - NAME AND HEART FAVORITE */}
                <div className="bg-white border-b border-stone-200 px-3 py-1.5 flex items-center justify-between font-sans select-none shrink-0 shadow-xs">
                  <div className="text-left leading-none">
                    <span className="text-[10.5px] font-black text-stone-900 tracking-tight uppercase">
                      {slide === "bus-035" && "LINHA 035 - CIRCULAR"}
                      {slide === "bus-034" && "LINHA 034 - COLETIVO"}
                      {slide === "bus-466x1" && "LINHA 466X1 - EXPRESSO"}
                    </span>
                    <span className="text-[7px] text-stone-400 block mt-0.5 font-bold uppercase tracking-wider font-mono">
                      {activeMonitor?.location || "Terminal Central - LANHOUSE24H"}
                    </span>
                  </div>
                  
                  {/* Red favorite heart */}
                  <button type="button" className="text-rose-500 scale-100 hover:scale-110 active:scale-90 transition">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>

                {/* BUS SINK LIST WITH MODERN ROW DESIGN */}
                <div className="flex-grow p-3 flex flex-col gap-2 overflow-y-auto bg-[#f4f6f9] min-h-[300px] uppercase font-mono">
                  {(() => {
                    const rows: any[] = [];
                    const lineTime35 = getLineTime("035");
                    const lineTime34 = getLineTime("034");
                    const lineTime466 = getLineTime("466X1");

                    const formatTime = (timeStr: string, fallbackMinutes: number) => {
                      if (!timeStr) return `${fallbackMinutes} MIN`;
                      const trimmed = timeStr.trim();
                      if (
                        trimmed.includes("MIN") || 
                        trimmed.includes("AS") || 
                        trimmed.includes("ÀS") || 
                        trimmed === "PARTIU" || 
                        trimmed.includes("OPERA") || 
                        trimmed.includes("PRÓX") || 
                        trimmed.includes("PROX") ||
                        trimmed.includes("VIAGENS")
                      ) {
                        return trimmed;
                      }
                      if (/^\d+$/.test(trimmed)) {
                        return `${trimmed} MIN`;
                      }
                      return trimmed;
                    };

                    if (slide === "bus-035") {
                      rows.push({
                        line: "035",
                        name: "Circular Centro",
                        type: "CIRCULAR",
                        subtitle: "Circular • via Jd. Palmares",
                        time: formatTime(lineTime35, 12)
                      });
                    } else if (slide === "bus-034") {
                      const baseTimeStr = formatTime(lineTime34, 15);
                      let secondaryTimeStr = baseTimeStr;
                      
                      const match = lineTime34.match(/^(\d+)/);
                      if (match) {
                        const mins = parseInt(match[1], 10);
                        secondaryTimeStr = `${mins + 5} MIN`;
                      }

                      rows.push({
                        line: "034",
                        name: "Terminal (Subida)",
                        type: "SOBE",
                        subtitle: "SOBE • via Centro h.",
                        time: baseTimeStr
                      });
                      rows.push({
                        line: "034",
                        name: "Centro (Descida)",
                        type: "DESCE",
                        subtitle: "DESCE • via Jd. Palmares",
                        time: secondaryTimeStr
                      });
                    } else if (slide === "bus-466x1") {
                      const baseTimeStr = formatTime(lineTime466, 8);
                      let secondaryTimeStr = baseTimeStr;
                      
                      const match = lineTime466.match(/^(\d+)/);
                      if (match) {
                        const mins = parseInt(match[1], 10);
                        secondaryTimeStr = `${mins + 7} MIN`;
                      }

                      rows.push({
                        line: "466X1",
                        name: "Terminal (Subida)",
                        type: "SOBE",
                        subtitle: "SOBE • via Rodovia Exp",
                        time: baseTimeStr
                      });
                      rows.push({
                        line: "466X1",
                        name: "Centro (Descida)",
                        type: "DESCE",
                        subtitle: "DESCE • via Rodovia Exp",
                        time: secondaryTimeStr
                      });
                    }

                    return rows.map((row, idx) => (
                      <div
                        key={idx}
                        className="bg-white text-stone-900 border border-stone-200/90 rounded-2xl p-3 flex justify-between items-center transition relative shadow-[0_2px_5px_rgba(0,0,0,0.03)] select-none animate-fade-in"
                      >
                        <div className="flex items-center gap-3">
                          {/* Yellow badge like screenshot */}
                          <div className="bg-[#fbc02d] text-stone-950 font-sans font-black text-[12px] px-2.5 py-1.5 rounded-xl min-w-[50px] text-center shadow-xs select-none">
                            {row.line}
                          </div>
                          
                          {/* Text labels */}
                          <div className="text-left font-sans leading-none">
                            <h4 className="font-extrabold text-[11px] text-stone-900 tracking-tight leading-none uppercase">
                              {row.name}
                            </h4>
                            <span className="text-[8px] font-bold text-stone-400 mt-1 block leading-none tracking-tight">
                              {row.subtitle}
                            </span>
                          </div>
                        </div>

                        {/* Count timer with green pulse indicator */}
                        <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-xl">
                          <span className="text-[10px] font-black font-mono text-stone-950 leading-none">
                            {row.time}
                          </span>
                          <span className="text-emerald-500 text-[8px] leading-none animate-pulse">▼</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </motion.div>
            )}

            {slide === "news-g1" && (
              <motion.div
                key="news-g1"
                initial={{ x: 120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -120, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col text-left flex-grow -mx-3 -mt-2 bg-[#f4f6f9] overflow-hidden"
              >
                {/* G1 HEADER BAR */}
                <div className="bg-[#cc0000] text-white py-2 px-3 flex items-center justify-between font-sans select-none shrink-0 border-b border-red-950 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-white text-[#cc0000] px-1.5 py-0.2 rounded font-black italic text-[11px] tracking-tighter select-none">g1</span>
                    <span className="text-[9px] font-extrabold tracking-widest text-red-100 uppercase">OSASCO & REGIÃO</span>
                  </div>
                  <span className="text-[8px] font-bold bg-red-800 text-white px-1.5 py-0.2 rounded-full animate-pulse">AO VIVO</span>
                </div>

                {/* G1 ARTICLE CONTENT */}
                <div className="p-3 overflow-y-auto flex-grow bg-white font-sans max-h-[350px]">
                  <img 
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=450&auto=format&fit=crop&q=80" 
                    alt="Carreta de Milho PRF"
                    className="w-full h-28 object-cover rounded-xl mb-2 shadow-sm border border-stone-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="bg-red-50 text-[#cc0000] border border-red-105 rounded-md px-1.5 py-0.5 text-[7px] font-black tracking-widest uppercase inline-block mb-1">
                    APREENSÃO RECORD
                  </div>
                  <h1 className="text-stone-950 font-black text-[12px] leading-tight mb-1 tracking-tight uppercase hover:text-[#cc0000] transition">
                    PRF APREENDE EM MS CARGA DE MILHO QUE ESCONDIA TONELADAS DE DROGA EM CAMINHÃO PARA SP
                  </h1>
                  <p className="text-[9px] text-stone-500 leading-normal font-medium">
                    Autoridades paulistas confirmam rastreamento estratégico de veículo em rodovia. Motorista foi detido em flagrante.
                  </p>
                  <p className="text-[7.5px] text-stone-400 font-bold mt-1.5 font-mono uppercase">
                    🕒 Há 2 min • Por G1 Osasco
                  </p>
                </div>
              </motion.div>
            )}

            {slide === "news-ge" && (
              <motion.div
                key="news-ge"
                initial={{ x: 120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -120, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col text-left flex-grow -mx-3 -mt-2 bg-[#f4f6f9] overflow-hidden"
              >
                {/* GE HEADER BAR */}
                <div className="bg-[#00c853] text-[#002d62] py-2 px-3 flex items-center justify-between font-sans select-none shrink-0 border-b border-green-800 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#002d62] text-[#00c853] px-1.5 py-0.2 rounded font-black italic text-[11px] tracking-tighter select-none">ge</span>
                    <span className="text-[9px] font-extrabold tracking-widest text-[#002d62] uppercase">FUTEBOL PAULISTA</span>
                  </div>
                  <span className="text-[7.5px] font-black bg-[#002d62] text-white px-2 py-0.2 rounded-full">EXCLUSIVO</span>
                </div>

                {/* GE ARTICLE CONTENT */}
                <div className="p-3 overflow-y-auto flex-grow bg-white font-sans max-h-[350px]">
                  <img 
                    src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=450&auto=format&fit=crop&q=80" 
                    alt="Futebol Arena"
                    className="w-full h-28 object-cover rounded-xl mb-2 shadow-sm border border-stone-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-md px-1.5 py-0.5 text-[7px] font-black tracking-widest uppercase inline-block mb-1">
                    BRASILEIRÃO 2026
                  </div>
                  <h1 className="text-stone-950 font-black text-[12px] leading-tight mb-1 tracking-tight uppercase hover:text-emerald-700 transition">
                    ABEL FERREIRA RETORNA COM TITULARES ABSOLUTOS E PROMETE MAIOR PRESSÃO NO ALLIANZ LOTADO
                  </h1>
                  <p className="text-[9px] text-stone-500 leading-normal font-medium">
                    Com mais de 35 mil ingressos vendidos, Allianz Parque promete ser um caldeirão na busca de três pontos capitais na rodada.
                  </p>
                  <p className="text-[7.5px] text-stone-400 font-bold mt-1.5 font-mono uppercase">
                    🕒 Há 15 min • Por GE São Paulo
                  </p>
                </div>
              </motion.div>
            )}

            {slide === "news-cnn" && (
              <motion.div
                key="news-cnn"
                initial={{ x: 120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -120, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col text-left flex-grow -mx-3 -mt-2 bg-[#f4f6f9] overflow-hidden"
              >
                {/* CNN HEADER BAR */}
                <div className="bg-[#cc0000] text-white py-2 px-3 flex items-center justify-between font-sans select-none shrink-0 border-b border-stone-800 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-white text-black px-1.5 py-0.2 font-extrabold text-[10px] tracking-tighter select-none">CNN</span>
                    <span className="text-[9px] font-black tracking-widest text-white uppercase italic">BRASIL</span>
                  </div>
                  <span className="text-[8px] font-extrabold bg-stone-900 border border-red-500 px-1.5 py-0.2 text-red-500 rounded">BREAKING</span>
                </div>

                {/* CNN ARTICLE CONTENT */}
                <div className="p-3 overflow-y-auto flex-grow bg-white font-sans max-h-[350px]">
                  <img 
                    src="https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=450&auto=format&fit=crop&q=80" 
                    alt="Chuva Grande Sao Paulo"
                    className="w-full h-28 object-cover rounded-xl mb-2 shadow-sm border border-stone-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="bg-red-50 text-red-700 border border-red-100 rounded-md px-1.5 py-0.5 text-[7px] font-black tracking-widest uppercase inline-block mb-1">
                    CATASTROFE AMBIENTAL
                  </div>
                  <h1 className="text-stone-950 font-black text-[12px] leading-tight mb-1 tracking-tight uppercase hover:text-red-650 transition">
                    FRENTE FRIA AVANÇA COM VENTANIA E TEMPERATURA SOFRE QUEDA HISTÓRICA DE ATÉ 12 GRAUS EM SP
                  </h1>
                  <p className="text-[9px] text-stone-500 leading-normal font-medium">
                    Defesa Civil emite estado de atenção para pancadas de chuva severas acompanhadas de descargas elétricas no cinturão metropolitano.
                  </p>
                  <p className="text-[7.5px] text-stone-400 font-bold mt-1.5 font-mono uppercase">
                    🕒 Atualizado Agora • CNN Meteorologia
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DYNAMIC SWIPE NAVIGATION PININDICATOR */}
        <div className="mt-2 py-1.5 bg-black/60 rounded-xl flex flex-col items-center gap-1 border border-white/5 relative overflow-hidden shadow-inner shrink-0">
          {/* Tiny progress banner representing automatic progress */}
          {isAutoplay && (
            <div 
              className="absolute bottom-0 left-0 h-[2px] bg-emerald-400/80 transition-all duration-[100ms] ease-linear" 
              style={{ width: `${progress}%` }}
            />
          )}
          
          <div className="flex justify-center items-center gap-2">
            {SLIDES_SEQUENCE.map((s) => (
              <button 
                key={s}
                onClick={() => handleSetSlide(s)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${slide === s ? "bg-yellow-405 scale-125 shadow-[0_0_6px_rgba(234,179,8,0.5)]" : "bg-white/40 hover:bg-white/70"}`}
                title={s}
              />
            ))}
            
            {/* Play/Pause icon to toggle autoplay */}
            <button 
              onClick={() => setIsAutoplay(!isAutoplay)}
              className="text-[8px] text-stone-400 hover:text-white transition ml-1 px-1 py-0.2 rounded bg-white/5 border border-white/10 active:scale-95 scale-[0.8] flex items-center justify-center"
              title={isAutoplay ? "Pausar" : "Iniciar"}
            >
              {isAutoplay ? "⏸️" : "▶️"}
            </button>
          </div>

          <div className="flex items-center gap-1 scale-[0.85]">
            <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-slate-300 leading-none">
              {slide === "weather" && "Tempo Ativo"}
              {slide === "bus-035" && "Ônibus Circular 035"}
              {slide === "bus-034" && "Terminal/Centro 034"}
              {slide === "bus-466x1" && "Terminal/Centro 466X1"}
              {slide === "news-g1" && "Notícias • g1 Osasco"}
              {slide === "news-ge" && "Esportes • ge Paulista"}
              {slide === "news-cnn" && "Ao Vivo • CNN Brasil"}
            </span>
            <span className={`text-[6px] px-1 py-0.1 rounded font-mono font-bold uppercase tracking-wider ${isAutoplay ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' : 'bg-stone-800 text-stone-400'}`}>
              {isAutoplay ? "Auto-Play" : "Manual"}
            </span>
          </div>
        </div>

      </div>

      {/* METRO STANDARD TOUCH KEYS AT VERY BOTTOM */}
      <div className="h-7 bg-stone-950/95 border-t border-white/5 flex items-center justify-around z-10 select-none rounded-b-[2.4rem] overflow-hidden">
        {/* Back key */}
        <button 
          onClick={() => {
            const currentIndex = SLIDES_SEQUENCE.indexOf(slide);
            const prevIndex = (currentIndex - 1 + SLIDES_SEQUENCE.length) % SLIDES_SEQUENCE.length;
            handleSetSlide(SLIDES_SEQUENCE[prevIndex]);
          }} 
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
          onClick={() => {
            const currentIndex = SLIDES_SEQUENCE.indexOf(slide);
            const nextIndex = (currentIndex + 1) % SLIDES_SEQUENCE.length;
            handleSetSlide(SLIDES_SEQUENCE[nextIndex]);
          }} 
          className="flex gap-[2.5px] hover:opacity-80 transition active:scale-95"
        >
          <div className="w-[1.8px] h-3.5 bg-stone-500 rounded-sm" />
          <div className="w-[1.8px] h-3.5 bg-stone-500 rounded-sm" />
          <div className="w-[1.8px] h-3.5 bg-stone-500 rounded-sm" />
        </button>
      </div>

    </div>
  );
}
