import React, { useState, useEffect, useRef, FormEvent, ReactNode, Dispatch, SetStateAction } from "react";
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
  Volume1,
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
import LandscapePassengerPhone from "./components/LandscapePassengerPhone";
import { BusLine, TVState, MonitorState } from "./types";
// @ts-ignore
import weatherWallpaper from "./assets/images/weather_wallpaper_1779472843262.png";

interface YouTubePlayerProps {
  videoId: string;
  mute: boolean;
  volume?: number;
  onEnded: () => void;
  className?: string;
  title?: string;
}

function YouTubePlayer({ videoId, mute, volume, onEnded, className, title }: YouTubePlayerProps) {
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
                const volSetting = typeof volume === "number" ? volume : 80;
                event.target.setVolume(volSetting);
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
                    const volSettingFallback = typeof volume === "number" ? volume : 80;
                    event.target.setVolume(volSettingFallback);
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

  // Handle dynamic unmuting/muting and volume adjustments on the fly when props change
  useEffect(() => {
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.mute === "function") {
          if (mute) {
            playerRef.current.mute();
          } else {
            playerRef.current.unMute();
          }
        }
        if (typeof playerRef.current.setVolume === "function" && typeof volume === "number") {
          playerRef.current.setVolume(volume);
        }
      } catch (err) {
        console.warn("Error changing volume/mute dynamically on YT Player:", err);
      }
    }
  }, [mute, volume]);

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

  // Slide state inside the passenger cellphone: rotates between weather, individual buses, and live news portals
  const [passengerScreenSlide, setPassengerScreenSlide] = useState<string>("weather");

  // Ref container for silent audio element used to capture physical volume changes on mobile devices
  const localVolumeAudioRef = useRef<HTMLAudioElement | null>(null);

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

  // Visual Simulator Layout States (Standard or smartphone vertical hybrid)
  const [simulatorLayout, setSimulatorLayout] = useState<"standard" | "vertical-hybrid">("standard");
  const [phonePosition, setPhonePosition] = useState<"top" | "bottom">("top");

  // Local draft states inside the remote control panel
  const [temperatureInput, setTemperatureInput] = useState(tvState.temperature ?? "");
  const [newsInput, setNewsInput] = useState(tvState.newsTicker ?? "");
  const [busLinesDraft, setBusLinesDraft] = useState<BusLine[]>(tvState.busLines ?? []);
  
  // Custom video input (add video to active monitor's playlist)
  const [newVideoInput, setNewVideoInput] = useState("");
  const [newMonitorNameInput, setNewMonitorNameInput] = useState("");
  
  // Dynamic Volume overlay HUD states and handlers
  const [volumeHUD, setVolumeHUD] = useState<{ visible: boolean; value: number; monitorName?: string }>({ 
    visible: false, 
    value: 80, 
    monitorName: "" 
  });
  const volumeHUDTimerRef = useRef<any>(null);

  const triggerVolumeHUD = (value: number, monitorName?: string) => {
    if (volumeHUDTimerRef.current) {
      clearTimeout(volumeHUDTimerRef.current);
    }
    setVolumeHUD({ visible: true, value, monitorName });
    volumeHUDTimerRef.current = setTimeout(() => {
      setVolumeHUD(prev => ({ ...prev, visible: false }));
    }, 2000);
  };

  const handleUpdateVolume = (monitorId: string, newVolume: number) => {
    const clampedVol = Math.round(Math.max(0, Math.min(100, newVolume)));
    const updated = tvStateRef.current.monitors.map(m => {
      if (m.id === monitorId) {
        triggerVolumeHUD(clampedVol, m.name);
        return { 
          ...m, 
          volume: clampedVol,
          mute: clampedVol === 0 ? true : false 
        };
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  // Keyboard and physical hardware volume adjustments effect (Supports keys & native mobile volume buttons)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in a form input or textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") {
        return;
      }

      let targetId: string | null = null;
      if (urlMode === "tv") {
        targetId = urlMonitorId || (tvStateRef.current.monitors[0]?.id || "terminal-principal");
      } else if (activeTab === "monitor" && activePreviewMonitorId !== "grid") {
        targetId = activePreviewMonitorId;
      } else {
        targetId = selectedMonitorId || (tvStateRef.current.monitors[0]?.id || "terminal-principal");
      }

      if (!targetId) return;

      const currentMonitor = tvStateRef.current.monitors.find(m => m.id === targetId);
      if (!currentMonitor) return;

      // Default to 80 if volume is not defined and is not muted
      const currentVol = typeof currentMonitor.volume === "number" ? currentMonitor.volume : (currentMonitor.mute ? 0 : 80);

      // Volume Up keys (including physical Android volume keycode 24)
      if (e.key === "AudioVolumeUp" || e.key === "VolumeUp" || e.key === "ArrowUp" || e.keyCode === 24 || e.which === 24) {
        e.preventDefault();
        handleUpdateVolume(targetId, currentVol + 5);
      }
      // Volume Down keys (including physical Android volume keycode 25)
      else if (e.key === "AudioVolumeDown" || e.key === "VolumeDown" || e.key === "ArrowDown" || e.keyCode === 25 || e.which === 25) {
        e.preventDefault();
        handleUpdateVolume(targetId, currentVol - 5);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Dynamic physical smartphone button syncing via silent audio channel volume capture
    if (typeof window !== "undefined") {
      if (!localVolumeAudioRef.current) {
        const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAD");
        audio.loop = true;
        audio.volume = 0.8;

        audio.addEventListener("volumechange", () => {
          let tId = null;
          if (urlMode === "tv") {
            tId = urlMonitorId || (tvStateRef.current.monitors[0]?.id || "terminal-principal");
          } else if (activeTab === "monitor" && activePreviewMonitorId !== "grid") {
            tId = activePreviewMonitorId;
          } else {
            tId = selectedMonitorId || (tvStateRef.current.monitors[0]?.id || "terminal-principal");
          }
          if (!tId) return;

          const currentMonitor = tvStateRef.current.monitors.find(m => m.id === tId);
          if (!currentMonitor) return;

          const newVolumePercent = Math.round(audio.volume * 100);
          const currentVol = typeof currentMonitor.volume === "number" ? currentMonitor.volume : (currentMonitor.mute ? 0 : 80);

          if (Math.abs(newVolumePercent - currentVol) >= 1) {
            handleUpdateVolume(tId, newVolumePercent);
          }
        });

        // Initialize audio's float volume value to match active states
        let tId = null;
        if (urlMode === "tv") {
          tId = urlMonitorId || (tvStateRef.current.monitors[0]?.id || "terminal-principal");
        } else if (activeTab === "monitor" && activePreviewMonitorId !== "grid") {
          tId = activePreviewMonitorId;
        } else {
          tId = selectedMonitorId || (tvStateRef.current.monitors[0]?.id || "terminal-principal");
        }
        if (tId) {
          const currentMonitor = tvStateRef.current.monitors.find(m => m.id === tId);
          if (currentMonitor) {
            const vol = typeof currentMonitor.volume === "number" ? currentMonitor.volume : (currentMonitor.mute ? 0 : 80);
            audio.volume = vol / 100;
          }
        }

        localVolumeAudioRef.current = audio;
      }
    }

    // Attempt playback of sound on first user touch/tap to gain media key focus on phones
    const tryPlayingMedia = () => {
      try {
        window.focus();
      } catch (err) {}
      if (localVolumeAudioRef.current) {
        localVolumeAudioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener("click", tryPlayingMedia, { passive: true });
    window.addEventListener("touchstart", tryPlayingMedia, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", tryPlayingMedia);
      window.removeEventListener("touchstart", tryPlayingMedia);
    };
  }, [urlMode, urlMonitorId, activeTab, activePreviewMonitorId, selectedMonitorId]);

  // Keep silence audio volume property in sync when volume is updated externally (e.g. from sliders or buttons)
  useEffect(() => {
    let tId = null;
    if (urlMode === "tv") {
      tId = urlMonitorId || (tvStateRef.current.monitors[0]?.id || "terminal-principal");
    } else if (activeTab === "monitor" && activePreviewMonitorId !== "grid") {
      tId = activePreviewMonitorId;
    } else {
      tId = selectedMonitorId || (tvStateRef.current.monitors[0]?.id || "terminal-principal");
    }
    if (!tId) return;

    const currentMonitor = tvState.monitors.find(m => m.id === tId);
    if (currentMonitor && localVolumeAudioRef.current) {
      const vol = typeof currentMonitor.volume === "number" ? currentMonitor.volume : (currentMonitor.mute ? 0 : 80);
      const volFloat = vol / 100;
      if (Math.abs(localVolumeAudioRef.current.volume - volFloat) >= 0.01) {
        localVolumeAudioRef.current.volume = volFloat;
      }
    }
  }, [tvState.monitors, selectedMonitorId, activeTab, activePreviewMonitorId, urlMode, urlMonitorId]);
  
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
  }, [selectedMonitorId, tvState.monitors]);

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
        const nextMute = !m.mute;
        const nextVolume = nextMute ? 0 : (typeof m.volume === "number" && m.volume > 0 ? m.volume : 80);
        triggerVolumeHUD(nextVolume, m.name);
        return { ...m, mute: nextMute, volume: nextVolume };
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
      mute: true, // Auto mute to bypass browser restrictions on initial boot
      volume: 80,
      orientation: "landscape",
      layoutMode: "standard",
      phonePosition: "top",
      location: "Avenida Zumbi dos Palmares",
      customBusLines: "035/034/466X1",
      isOnline: true
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

  const handleUpdateLayoutMode = (monitorId: string, layoutMode: "standard" | "vertical-hybrid") => {
    const updated = tvStateRef.current.monitors.map(m => {
      if (m.id === monitorId) {
        return { ...m, layoutMode };
      }
      return m;
    });
    syncMonitorsToServer(updated);
  };

  const handleUpdatePhonePosition = (monitorId: string, phonePosition: "top" | "bottom") => {
    const updated = tvStateRef.current.monitors.map(m => {
      if (m.id === monitorId) {
        return { ...m, phonePosition };
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

        {/* VOLUME HUD OVERLAY */}
        <AnimatePresence>
          {volumeHUD.visible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute top-24 right-6 z-50 bg-black/90 text-white border border-stone-800 rounded-3xl p-3 px-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-3.5 select-none pointer-events-none animate-fade-in"
            >
              <div className="flex items-center justify-center bg-blue-600/20 border border-blue-500/30 p-2 rounded-full h-9 w-9 text-blue-400">
                {volumeHUD.value === 0 ? (
                  <VolumeX className="w-5 h-5 text-gray-500" />
                ) : volumeHUD.value < 40 ? (
                  <Volume1 className="w-5 h-5 text-blue-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-blue-400 animate-pulse" />
                )}
              </div>
              <div className="text-left">
                <p className="text-[7.5px] font-mono uppercase font-black tracking-widest text-[#e8a317] leading-none mb-1">
                  Volume do Sistema
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-stone-800 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-150" 
                      style={{ width: `${volumeHUD.value}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-black text-white tabular-nums w-8">
                    {volumeHUD.value}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Standalone TV Screen background visual styling */}
        

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
        <div className="flex-grow w-full relative flex items-center justify-center p-4 md:p-6 z-10 overflow-hidden">
          {monitorObj.orientation === "portrait" ? (
            /* DUAL STACKED PORTRAIT LAYOUT: CELLPHONE LAYING DOWN (LANDSCAPE) + VIDEO SCREEN PORTRAIT */
            <div className="w-full max-w-[420px] h-full flex flex-col justify-center items-center gap-3 md:gap-4">
              {(() => {
                const phonePos = monitorObj.phonePosition || "top";
                
                const renderPhoneElement = () => (
                  <div className="w-full transition-all duration-300 transform scale-95 origin-center">
                    {/* Rotated Cellphone (Landscape mode) */}
                    <div className="w-full shadow-2xl relative">
                      {renderPassengerPhone(monitorObj, true)}
                    </div>
                  </div>
                );

                const renderVideoElement = () => (
                  <div className="w-full flex-grow flex flex-col items-center justify-center max-h-[62%] transition-all duration-300 font-sans">
                    <div className="relative bg-[#050505] border-[10px] border-stone-850 rounded-[1.8rem] p-1 shadow-2xl overflow-hidden w-full aspect-[9/16] flex flex-col justify-between items-stretch">
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
                              volume={monitorObj.volume}
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
                    
                    {/* Stand decorative footer */}
                    <div className="flex flex-col items-center pointer-events-none select-none z-0 mt-0.5">
                      <div className="w-6 h-2 bg-stone-850 border-x border-stone-800 opacity-80" />
                      <div className="w-16 h-1 bg-stone-800 rounded-t-2xl opacity-80" />
                    </div>
                  </div>
                );

                if (phonePos === "bottom") {
                  return (
                    <>
                      {renderVideoElement()}
                      {renderPhoneElement()}
                    </>
                  );
                } else {
                  return (
                    <>
                      {renderPhoneElement()}
                      {renderVideoElement()}
                    </>
                  );
                }
              })()}
            </div>
          ) : (
            /* STANDARD HORIZONTAL/LANDSCAPE TV VIEW */
            <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 xl:gap-16">
              <div className="w-full max-w-[260px] sm:max-w-[280px] shrink-0 transition-all duration-300">
                <div className="w-full">
                  {renderPassengerPhone(monitorObj)}
                </div>
              </div>

              {/* Right Layer: Physical TV Frame with Stream */}
              <div className="flex flex-col items-center w-full transition-all duration-300 flex-grow max-w-[960px]">
                <div className="relative bg-[#050505] border-[10px] border-stone-850 rounded-[1.8rem] p-1 shadow-2xl overflow-hidden w-full aspect-video flex flex-col justify-between items-stretch transition-all duration-300">
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
                          volume={monitorObj.volume}
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
          )}
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
              {/* LAYOUT SELECTOR CONTROL BAR FOR HIGH QUALITY USER INTENT */}
              {(() => {
                const activeMonitorObj = tvState.monitors.find(m => m.id === selectedMonitorId) || tvState.monitors[0];
                const activeLayout = activeMonitorObj?.layoutMode || "standard";
                const activePhonePos = activeMonitorObj?.phonePosition || "top";
                
                return (
                  <>
                    <div className="bg-stone-950/80 border border-stone-850/80 p-4 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl select-none">
                      <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <span className="text-stone-100 font-sans text-xs font-black uppercase tracking-wider flex items-center gap-2 leading-none">
                          📐 MODO DE VISUALIZAÇÃO DO SIMULADOR (AUTO-ROTAÇÃO DE TELA)
                        </span>
                        <span className="text-stone-400 text-[10px] font-sans font-medium mt-1 leading-normal max-w-lg">
                          Escolha "Híbrido Vertical" para simular a TV na rua (celular deitado transmitindo as notícias na horizontal, e a TV em pé passando comerciais).
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2.5 justify-center">
                        <div className="flex bg-stone-900 border border-stone-800 p-1 rounded-xl shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateLayoutMode(activeMonitorObj.id, "standard")}
                            className={`px-4 py-2 rounded-lg text-[9.5px] font-extrabold tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-1.5 ${
                              activeLayout === "standard"
                                ? "bg-[#1e293b] text-cyan-200 border border-[#334155]/60 shadow-[0_2px_6px_rgba(0,0,0,0.3)] scale-[1.02]"
                                : "text-stone-400 hover:text-stone-200"
                            }`}
                          >
                            <Tv className="w-3.5 h-3.5" />
                            LADO A LADO
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateLayoutMode(activeMonitorObj.id, "vertical-hybrid")}
                            className={`px-4 py-2 rounded-lg text-[9.5px] font-extrabold tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-1.5 ${
                              activeLayout === "vertical-hybrid"
                                ? "bg-[#10b981] text-white border border-[#10b981]/60 shadow-[0_2px_6px_rgba(16,185,129,0.3)] scale-[1.02]"
                                : "text-stone-400 hover:text-stone-200"
                            }`}
                          >
                            <Smartphone className="w-3.5 h-3.5 animate-pulse" />
                            HÍBRIDO VERTICAL
                          </button>
                        </div>

                        {activeLayout === "vertical-hybrid" && (
                          <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 p-1 rounded-xl shrink-0">
                            <span className="text-stone-400 text-[8.5px] font-mono font-black uppercase px-2">Celular:</span>
                            <button
                              type="button"
                              onClick={() => handleUpdatePhonePosition(activeMonitorObj.id, "top")}
                              className={`px-3 py-1.5 rounded-lg text-[8.5px] font-black uppercase transition-all duration-150 ${
                                activePhonePos === "top"
                                  ? "bg-[#1e293b] text-cyan-250 shadow"
                                  : "text-stone-400 hover:text-white"
                              }`}
                            >
                              ▲ NO TOPO
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdatePhonePosition(activeMonitorObj.id, "bottom")}
                              className={`px-3 py-1.5 rounded-lg text-[8.5px] font-black uppercase transition-all duration-150 ${
                                activePhonePos === "bottom"
                                  ? "bg-[#1e293b] text-cyan-255 shadow"
                                  : "text-stone-400 hover:text-white"
                              }`}
                            >
                              ▼ NA BASE
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* IMMERSIVE 3D SIMULATED ENVIRONMENT CONTAINER */}
                    <div 
                      className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-stone-800 bg-cover bg-center min-h-[640px] flex items-center justify-center p-4 sm:p-8 transition-all duration-700 select-none pb-12 pt-16"
                      style={{ backgroundImage: `url(${BACKGROUND_PRESETS[bgStyle].url})` }}
                    >
                      {/* Vignette Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/35 pointer-events-none z-0" />
                      <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-40 z-0" />
                      <div className="absolute bottom-24 left-1/3 w-[50%] h-48 bg-emerald-500/10 filter blur-[90px] rounded-full pointer-events-none mix-blend-screen" />

                      {/* THE SIMULATION WORKSPACE SANDBOX */}
                      <div className={`relative w-full max-w-6xl z-10 py-6 flex ${
                        activeLayout === "vertical-hybrid"
                          ? "flex-col items-center justify-start gap-12"
                          : "flex-col md:flex-row items-center justify-center gap-6 md:gap-12"
                      }`}>
                        
                        {/* Left Layer: Cellphone with adjust offsets */}
                        <div 
                          className={`transition-all duration-300 ease-out z-20 flex justify-center w-full md:w-auto ${
                            activeLayout === "vertical-hybrid"
                              ? activePhonePos === "top" ? "order-1" : "order-3"
                              : "order-1"
                          }`}
                          style={{ 
                            transform: `translate(${phoneX}px, ${phoneY}px) scale(${phoneScale})`,
                            filter: "drop-shadow(0 25px 40px rgba(0,0,0,0.9))"
                          }}
                        >
                          <div className={`relative flex items-center justify-center transition-all ${
                            activeLayout === "vertical-hybrid"
                              ? "w-full max-w-[500px] shrink-0"
                              : "w-full max-w-[275px] shrink-0"
                          }`}>
                            <div className="w-full">
                              {renderPassengerPhone(activeMonitorObj, activeLayout === "vertical-hybrid")}
                            </div>
                          </div>
                        </div>

                        {/* Widescreen TV Monitor offset */}
                        {(() => {
                          const activeVideoId = activeMonitorObj.playlist[activeMonitorObj.currentVideoIndex] || "ysz5S6PUM-U";
                          return (
                            <div 
                              className={`transition-all duration-300 ease-out z-10 flex flex-col items-center w-full ${
                                activeLayout === "vertical-hybrid"
                                  ? activePhonePos === "bottom" ? "order-1" : "order-2"
                                  : "order-2"
                              }`}
                              style={{ 
                                transform: `translate(${tvX}px, ${tvY}px) scale(${tvScale})`,
                                filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.95))"
                              }}
                            >
                              {/* High fidelity setup */}
                              <div className="flex items-center justify-center gap-3 w-full max-w-full">
                                
                                <div className="hidden lg:flex w-7 bg-black/90 border border-[#e8a317] h-[340px] xl:h-[390px] rounded-sm items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(232,163,23,0.3)] select-none animate-pulse">
                                  <div className="absolute inset-0 bg-[#0b0c03]/90" />
                                  <div className="absolute flex flex-col gap-6 font-mono text-[8.5px] font-black text-yellow-400 uppercase tracking-widest whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                    <span>{">>>> ÚLTIMAS NOTÍCIAS >> SARAHTV ONLINE >> TRANSMISSÃO AO VIVO >>>>"}</span>
                                  </div>
                                </div>

                                <div className={`relative bg-[#050505] border-[11px] border-stone-850 rounded-[1.8rem] p-1 shadow-2xl overflow-hidden flex flex-col justify-between items-stretch transition-all duration-300 ${
                                  activeLayout === "vertical-hybrid" || activeMonitorObj.orientation === "portrait"
                                    ? "aspect-[9/16] w-[210px] sm:w-[280px] md:w-[320px] lg:w-[360px]"
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
                            {/* Inner volume indicator HUD overlay inside dashboard TV screen */}
                            <AnimatePresence>
                              {volumeHUD.visible && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className="absolute top-4 right-4 z-40 bg-black/85 border border-stone-850 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-2xl backdrop-blur-sm pointer-events-none"
                                >
                                  {volumeHUD.value === 0 ? (
                                    <VolumeX className="w-3.5 h-3.5 text-stone-550 shrink-0" />
                                  ) : volumeHUD.value < 40 ? (
                                    <Volume1 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  ) : (
                                    <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                                  )}
                                  <div className="w-16 h-1.5 bg-stone-900 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                      className="bg-emerald-500 h-full transition-all duration-150" 
                                      style={{ width: `${volumeHUD.value}%` }}
                                    />
                                  </div>
                                  <span className="text-[9.5px] font-mono font-black text-emerald-400">
                                    {volumeHUD.value}%
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {activeVideoId ? (
                              false ? (
                                localVideos[activeVideoId] ? (
                                  <video
                                    src={localVideos[activeVideoId]?.url}
                                    autoPlay
                                    muted={activeMonitorObj.mute}
                                    ref={(el) => {
                                      if (el) {
                                        el.volume = (typeof activeMonitorObj.volume === "number" ? activeMonitorObj.volume : 80) / 100;
                                      }
                                    }}
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
                                  volume={activeMonitorObj.volume}
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

          </>
        );
      })()}
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

            {/* In-Phone Options Form (Name Only, Location and Bus Lines Removed) */}
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

            {/* MONITOR MUTE & VOLUME TOGGLE CARD DIRECTLY IN SETTINGS */}
            <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-850/60 flex flex-col gap-2.5 text-left animate-fade-in">
              <div className="flex justify-between items-center bg-[#02180e] px-2 py-1 rounded-lg border border-emerald-500/10">
                <span className="text-[8px] text-stone-450 font-extrabold uppercase tracking-wide">
                  ÁUDIO DA TV
                </span>
                <span className={`text-[6px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  activeMonitor?.mute ? 'bg-stone-900 text-stone-500' : 'bg-emerald-950 text-emerald-400 animate-pulse'
                }`}>
                  {activeMonitor?.mute ? "MUDO" : `ALTO-FALANTE ATIVO (${typeof activeMonitor?.volume === "number" ? activeMonitor.volume : 80}%)`}
                </span>
              </div>

              {/* Advanced tactile volume slider wrapper */}
              <div className="flex items-center gap-2 bg-stone-900/60 p-2 rounded-xl border border-stone-850">
                <button
                  type="button"
                  onClick={() => {
                    if (activeMonitor) {
                      const currentVol = typeof activeMonitor.volume === "number" ? activeMonitor.volume : 80;
                      handleUpdateVolume(activeMonitor.id, currentVol - 10);
                    }
                  }}
                  className="p-1 px-1.5 rounded bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white font-black text-xs active:scale-90 transition-all cursor-pointer select-none leading-none border border-stone-700/30"
                  title="Abaixar Volume 10%"
                >
                  -
                </button>

                <div className="flex-grow flex items-center gap-2 min-w-0">
                  {activeMonitor?.mute ? (
                    <VolumeX className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  ) : (typeof activeMonitor?.volume === "number" ? activeMonitor.volume : 80) < 40 ? (
                    <Volume1 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                  )}
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={activeMonitor?.mute ? 0 : (typeof activeMonitor?.volume === "number" ? activeMonitor.volume : 80)}
                    onChange={(e) => {
                      if (activeMonitor) {
                        handleUpdateVolume(activeMonitor.id, parseInt(e.target.value));
                      }
                    }}
                    className="flex-grow accent-emerald-500 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer outline-none min-w-0"
                  />
                  <span className="text-[9.5px] font-mono font-black text-stone-200 tabular-nums w-8 text-right shrink-0">
                    {activeMonitor?.mute ? "0%" : `${typeof activeMonitor?.volume === "number" ? activeMonitor.volume : 80}%`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (activeMonitor) {
                      const currentVol = typeof activeMonitor.volume === "number" ? activeMonitor.volume : 80;
                      handleUpdateVolume(activeMonitor.id, currentVol + 10);
                    }
                  }}
                  className="p-1 px-1.5 rounded bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white font-black text-xs active:scale-90 transition-all cursor-pointer select-none leading-none border border-stone-700/30"
                  title="Aumentar Volume 10%"
                >
                  +
                </button>
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
            <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-850/60 flex flex-col gap-2">
              <span className="text-[8px] text-stone-450 font-extrabold uppercase tracking-wide block">
                Giro, Layout e Reset da Tela
              </span>
              
              <button
                type="button"
                onClick={() => {
                  if (activeMonitor) handleToggleOrientation(activeMonitor.id);
                }}
                className={`py-2 px-3 w-full rounded-lg border text-[9px] font-black flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 shadow-md font-sans ${
                  activeMonitor?.orientation === "portrait"
                    ? "bg-amber-950/90 border-[#e8a317] text-[#e8a317] shadow-[0_2px_8px_rgba(232,163,23,0.15)]"
                    : "bg-stone-900 border-stone-850 text-stone-200 hover:bg-stone-850"
                }`}
              >
                <Smartphone className={`w-3.5 h-3.5 ${activeMonitor?.orientation === "portrait" ? "text-amber-400 rotate-90" : "text-stone-400"} transition-transform duration-300`} />
                <span className="tracking-wide uppercase font-sans leading-none">SENTIDO DA TELA (RET/PAIS)</span>
              </button>

              {/* Layout Mode selector */}
              <div className="flex bg-stone-900 border border-stone-850 p-1 rounded-lg w-full">
                <button
                  type="button"
                  onClick={() => {
                    if (activeMonitor) handleUpdateLayoutMode(activeMonitor.id, "standard");
                  }}
                  className={`flex-1 py-1.5 rounded-md text-[8px] font-extrabold tracking-wider uppercase transition-all duration-150 ${
                    (activeMonitor?.layoutMode || "standard") === "standard"
                      ? "bg-[#1e293b] text-cyan-200 border border-[#334155]/60 shadow"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  PADRÃO
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeMonitor) handleUpdateLayoutMode(activeMonitor.id, "vertical-hybrid");
                  }}
                  className={`flex-1 py-1.5 rounded-md text-[8px] font-extrabold tracking-wider uppercase transition-all duration-150 ${
                    activeMonitor?.layoutMode === "vertical-hybrid"
                      ? "bg-[#10b981] text-white border border-[#10b981]/60 shadow"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  HÍBRIDO VERT.
                </button>
              </div>

              {activeMonitor?.layoutMode === "vertical-hybrid" && (
                <div className="flex bg-stone-950 p-1 rounded-lg border border-stone-900 w-full justify-between items-center px-1.5">
                  <span className="text-stone-400 text-[7px] font-black uppercase">CELULAR:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeMonitor) handleUpdatePhonePosition(activeMonitor.id, "top");
                      }}
                      className={`px-2 py-1 rounded-md text-[7.5px] font-black uppercase transition-all ${
                        (activeMonitor?.phonePosition || "top") === "top"
                          ? "bg-[#1e293b] text-cyan-200"
                          : "text-stone-400 hover:text-white"
                      }`}
                    >
                      TOP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeMonitor) handleUpdatePhonePosition(activeMonitor.id, "bottom");
                      }}
                      className={`px-2 py-1 rounded-md text-[7.5px] font-black uppercase transition-all ${
                        activeMonitor?.phonePosition === "bottom"
                          ? "bg-[#1e293b] text-cyan-200"
                          : "text-stone-400 hover:text-white"
                      }`}
                    >
                      BASE
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (activeMonitor) {
                    handleRemoteForceRefresh(activeMonitor.id);
                  }
                }}
                className="py-2 px-3 w-full bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-lg text-[9px] font-black flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 shadow-md font-sans cursor-pointer"
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
  function renderPassengerPhone(monitorArg?: any, isLandscape?: boolean) {
    const monitorObj = monitorArg || tvState.monitors.find(m => m.id === (urlMonitorId || selectedMonitorId)) || tvState.monitors[0];
    return (
      <PassengerPhone 
        tvState={tvState} 
        timeState={timeState} 
        getWeatherIcon={getWeatherIcon} 
        activeMonitor={monitorObj}
        slide={passengerScreenSlide}
        setSlide={setPassengerScreenSlide}
        getLineTime={getLineTime}
        isLandscape={isLandscape}
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
  getLineTime: (lineNumber: string) => string;
  isLandscape?: boolean;
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
  setSlide: propSetSlide,
  getLineTime,
  isLandscape = false
}: PassengerPhoneProps) {
  if (isLandscape) {
    return (
      <LandscapePassengerPhone
        tvState={tvState}
        timeState={timeState}
        getWeatherIcon={getWeatherIcon}
        activeMonitor={activeMonitor}
        slide={propSlide}
        setSlide={propSetSlide}
        getLineTime={getLineTime}
      />
    );
  }

  const [localSlide, setLocalSlide] = useState<string>("weather");
  const [isAutoplay, setIsAutoplay] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Custom states for interactive items
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Record<string, boolean>>({});
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Pre-filled comments state for interactive articles
  const [commentsState, setCommentsState] = useState<Record<string, Array<{ id: string; username: string; text: string; time: string }>>>({
    "clima-osasco-post": [
      { id: "1", username: "pedro_oz", text: "Finalmente um clima fresquinho em SP!", time: "Há 1 min" },
      { id: "2", username: "ana_clara", text: "Moro no Km 18 e o vento tá bem forte aqui!", time: "Há 5 min" },
      { id: "3", username: "junior_palmares", text: "Tempo perfeito pra comer um pastel na feira amanhã 🥟", time: "Há 10 min" }
    ],
    "AVENIDA ZUMBI DOS PALMARES RECEBE NOVO RECAPEAMENTO COMPLETO E LUZ INTEGRAL LED": [
      { id: "1", username: "morador_feliz", text: "Até que enfim! Os buracos ali tavam parecendo crateras da lua.", time: "Há 3 min" },
      { id: "2", username: "marcelo_moraes", text: "O asfalto ficou lisinho, excelente trabalho da prefeitura local.", time: "Há 12 min" },
      { id: "3", username: "leticia_silva", text: "O LED branco à noite dá outra sensação de segurança. Parabéns!", time: "Há 1 hora" }
    ],
    "FEIRA CULTURAL DE DOMINGO NA ZUMBI DOS PALMARES REÚNE PÚBLICO RECORDE COM PASTÉIS E ARTESANATO": [
      { id: "1", username: "pastel_fanatic", text: "O pastel da barraca da Zefa tá concorridíssimo, vale cada minuto de fila!", time: "Há 25 min" },
      { id: "2", username: "renato_santos", text: "Música de qualidade e ambiente super familiar. Parabéns aos envolvidos!", time: "Há 1 hora" }
    ],
    "NOVA CRECHE INTEGRADA DO JARDIM PALMARES AMPLIA VAGAS PARA 250 BEBÊS DE MÃES TRABALHADORAS": [
      { id: "1", username: "mae_bairro", text: "Que benção de Deus! Agora posso trabalhar tranquila sabendo que meu filho tá seguro.", time: "Há 42 min" },
      { id: "2", username: "cristina_melo", text: "A estrutura ficou de primeiro mundo! Parabéns pela iniciativa.", time: "Há 3 horas" }
    ],
    "G1: FRENTE FRIA AVANÇA EM SP COM ALERTA DE CHUVA SEVERA E VENTOS DE ATÉ 60KM/H": [
      { id: "1", username: "casaco_pronto", text: "Tirei o edredom do armário hoje mesmo kkkk haja frio!", time: "Há 1 min" },
      { id: "2", username: "thiago_sp", text: "Marginal Pinheiros vai virar um rio se chover forte assim, cuidado pessoal.", time: "Há 12 min" }
    ],
    "GE: ABEL FERREIRA RETORNA COM TITULARES PESADOS E GARANTE TIME COM SEDE DE ATAQUE NO ALLIANZ": [
      { id: "1", username: "verdao_desde_berço", text: "Abel é gênio! Allianz vai tremer hoje com os titulares!", time: "Há 8 min" },
      { id: "2", username: "jorginho_alviverde", text: "Vamo ganhar do São Bernardo por 3 a 0 fácil kkkk rumo ao título!", time: "Há 15 min" }
    ],
    "CHOQUEI: CANTOR SERTANEJO MAIS TOCADO DO ANO É VISTO COM NOVA MODELO EM RESTAURANTE DE SP": [
      { id: "1", username: "fofoqueira_mor", text: "GENTE! Passada de verdade kkkk a assessoria sempre nega no começo!", time: "Há 1 min" },
      { id: "2", username: "juliana_souza", text: "Eu já desconfiava desde que eles postaram o mesmo storie no mesmo lugar semana passada! 👀", time: "Há 4 min" }
    ],
    "CANTORA GOSPEL ATINGE RECORDE DE 110 MILHÕES DE STREAMINGS E LANÇA SINGLE ACÚSTICO": [
      { id: "1", username: "irmao_marcos", text: "Louvor abençoado! Essa melodia toca lá no fundo da alma 🙏", time: "Há 5 min" },
      { id: "2", username: "gloria_paz", text: "Merecido demais! Ela canta com verdade no coração.", time: "Há 20 min" }
    ]
  });

  const [activeCommentsPost, setActiveCommentsPost] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  const getSourceProfile = (slideKey: string, articleSource?: string) => {
    const key = articleSource || slideKey;
    if (key.includes("bairro") || key.includes("Bairro") || key.includes("Palmares") || key.includes("Leste") || key.includes("Voz")) {
      return {
        username: "bairro_palmares",
        displayName: "Voz de Palmares • Bairro",
        avatar: "https://images.unsplash.com/photo-1510227272981-87123e259b17?w=100&auto=format&fit=crop&q=80",
        verified: true,
        followers: "12.4K",
        bio: "Notícias comunitárias e serviços públicos no Jardim Palmares e região"
      };
    }
    if (key.includes("esportes") || key.includes("Esportes") || key.includes("ge") || key.includes("Tricolor") || key.includes("FUTEBOL")) {
      return {
        username: "osasco_esportes",
        displayName: "GE Osasco Esportes",
        avatar: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&auto=format&fit=crop&q=80",
        verified: true,
        followers: "44.9K",
        bio: "Cobertura esportiva de Osasco, futebol paulista, várzea e basquete local"
      };
    }
    if (key.includes("fofocas") || key.includes("Choquei") || key.includes("Léo Dias") || key.includes("Fofoquei")) {
      return {
        username: "osasco_fuxico",
        displayName: "Fuxico Osasco Oficial",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        verified: false,
        followers: "89.1K",
        bio: "Os bastidores das subcelebridades, polêmicas locais e babados da grande SP"
      };
    }
    if (key.includes("gospel") || key.includes("Gospel") || key.includes("Pleno") || key.includes("União")) {
      return {
        username: "conexao_gospel_osasco",
        displayName: "Conexão Gospel Osasco",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
        verified: true,
        followers: "18.2K",
        bio: "Eventos, congressos, louvores e ações solidárias das igrejas em Osasco"
      };
    }
    // Default / Geral
    return {
      username: "portal_osasco_news",
      displayName: "Osasco Geral News",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80",
      verified: true,
      followers: "105K",
      bio: "O portal de notícias líder da região de Osasco e região metropolitana de SP"
    };
  };

  const stories = [
    { key: "news-bairro", profile: getSourceProfile("news-bairro"), label: "Bairro", icon: "🏡" },
    { key: "news-geral", profile: getSourceProfile("news-geral"), label: "Portais", icon: "📰" },
    { key: "news-esportes", profile: getSourceProfile("news-esportes"), label: "Esportes", icon: "⚽" },
    { key: "news-fofocas", profile: getSourceProfile("news-fofocas"), label: "Fofocas", icon: "🔥" },
    { key: "news-gospel", profile: getSourceProfile("news-gospel"), label: "Gospel", icon: "🙌" }
  ];

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

  const currTemp = parseInt(tvState.temperature) || 17;
  const sensation = currTemp - 1;
  const clockShort = timeState ? timeState.substring(0, 5) : "11:05";

  // Re-memoized unified Instagram Reels vertical stream
  const reelsFeed = React.useMemo(() => {
    const list: Array<{
      id: string;
      type: "weather" | "news";
      title: string;
      subtitle: string;
      source: string;
      image?: string;
      time: string;
      badge: string;
      badgeColor: string;
      category: string;
    }> = [];

    // 1. Clima (Weather Post) - Always top of feed
    list.push({
      id: "clima-osasco-post",
      type: "weather",
      title: "PREVISÃO DO CLIMA EM OSASCO",
      subtitle: `Temperatura atual de ${currTemp}°C na localidade. Tempo instável, prepare seu casaco e agasalho dadas as correntes de vento litorâneo na região.`,
      source: "clima_tempo_osasco",
      time: "Agora",
      badge: "CLIMA ATUAL",
      badgeColor: "bg-amber-500/25 border-amber-500/35 text-amber-200",
      category: "weather"
    });

    // 2. Cycle and alternate categories to create an attractive social media stream of content
    const catsAndDetails = [
      { key: "bairro", tag: "JORNAL DO BAIRRO" },
      { key: "geral", tag: "CNN / RECORD NEWS" },
      { key: "esportes", tag: "GLOBO ESPORTE" },
      { key: "gospel", tag: "GOSPEL" },
      { key: "fofocas", tag: "FUXICO" }
    ];

    const maxLen = 3;
    for (let i = 0; i < maxLen; i++) {
      catsAndDetails.forEach(({ key, tag }) => {
        const art = ALL_NEWS_DATABASE[key]?.[i];
        if (art) {
          list.push({
            id: `${key}-${i}-${art.title}`,
            type: "news",
            title: art.title,
            subtitle: art.subtitle,
            source: art.source,
            image: art.image,
            time: art.time,
            badge: art.badge || tag,
            badgeColor: art.badgeColor || "bg-stone-850 text-white/90 border-stone-800",
            category: `news-${key}`
          });
        }
      });
    }

    // Filter dynamic feed based on search queries
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return list.filter(item => {
        if (item.type === "weather") {
          return "clima tempo osasco previsão temperatura metros graus".includes(q);
        }
        return item.title.toLowerCase().includes(q) || 
               item.subtitle.toLowerCase().includes(q) || 
               item.source.toLowerCase().includes(q);
      });
    }

    return list;
  }, [searchQuery, currTemp, tvState.temperature]);

  // Jump to specific slide when tab/category changed
  const handleSetSlide = (newSlide: string) => {
    setSlide(newSlide);
    setProgress(0);
    if (!newSlide.startsWith("bus-")) {
      if (newSlide === "weather") {
        setActiveIndex(0);
      } else {
        const foundIdx = reelsFeed.findIndex(item => item.category === newSlide);
        if (foundIdx !== -1) {
          setActiveIndex(foundIdx);
        }
      }
    }
  };

  // Scroll Sync to ensure the viewport matches the active index (handles slides autoplay & tab clicks smoothly)
  React.useEffect(() => {
    if (scrollContainerRef.current && !slide.startsWith("bus-")) {
      const containerHeight = scrollContainerRef.current.clientHeight || 355;
      scrollContainerRef.current.scrollTo({
        top: activeIndex * containerHeight,
        behavior: "smooth"
      });
    }
    setProgress(0);
  }, [activeIndex, slide]);

  // Manual drag / scroll gesture handler to keep header pills synchronized when swiping up/down
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (slide.startsWith("bus-")) return;
    const scrollTop = e.currentTarget.scrollTop;
    const containerHeight = e.currentTarget.clientHeight || 355;
    if (containerHeight > 0) {
      const computedIndex = Math.round(scrollTop / containerHeight);
      if (computedIndex !== activeIndex && computedIndex >= 0 && computedIndex < reelsFeed.length) {
        setActiveIndex(computedIndex);
        const targetItem = reelsFeed[computedIndex];
        if (targetItem && targetItem.category && targetItem.category !== slide) {
          setSlide(targetItem.category);
        }
      }
    }
  };

  // Autoplay sequence logic - integrated vertical snaps + bus rotators
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
          if (slide.startsWith("bus-")) {
            // Bus timetables auto-rotation
            const currentIndex = SLIDES_SEQUENCE.indexOf(slide);
            const nextIndex = (currentIndex + 1) % SLIDES_SEQUENCE.length;
            setSlide(SLIDES_SEQUENCE[nextIndex]);
          } else {
            // Instagram full-screen Reels auto-rotation (slides up one-by-one)
            setActiveIndex((curr) => {
              const nextVal = (curr + 1) % reelsFeed.length;
              const targetItem = reelsFeed[nextVal];
              if (targetItem && targetItem.category) {
                setSlide(targetItem.category);
              }
              return nextVal;
            });
          }
          return 0;
        }
        return prev + (stepMs / durationMs) * 100;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isAutoplay, slide, reelsFeed, setSlide]);

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

        {/* PILLS CATEGORIES TABS */}
        <div className="z-10 px-2 pb-1.5 pt-1.5 shrink-0 bg-[#f1f3f4] select-none">
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
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
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
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex-grow z-10 scrollbar-none relative transition-all duration-300 ${
            slide.startsWith("bus-")
              ? "overflow-y-auto max-h-[360px] h-[355px] bg-[#f4f6f9] p-3 pt-1 flex flex-col gap-3"
              : "overflow-y-scroll snap-y snap-mandatory max-h-[360px] h-[355px] bg-black p-0 flex flex-col gap-0"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {(slide === "weather" || slide.startsWith("news-")) && (
              <motion.div
                key="instagram-reels-feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col"
              >

                {reelsFeed.map((item, idx) => {
                  if (item.type === "weather") {
                    // WEATHER ITEM RENDER
                    return (
                      <div 
                        key={item.id}
                        className="w-full h-[355px] min-h-[355px] snap-start relative flex flex-col justify-between p-4 text-white overflow-hidden bg-gradient-to-br from-[#0c2445] via-[#10305c] to-[#1a447c] shrink-0"
                      >
                        {/* Cloud/Atmosphere decorations */}
                        <div className="absolute top-[-30px] right-[-30px] w-44 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-[-10px] left-[-30px] w-36 h-36 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
                        
                        {/* Top Bar inside slide: Profile and status */}
                        <div className="flex items-center justify-between z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-xs shadow-xs text-center">
                              🌦️
                            </div>
                            <div className="leading-none text-left font-sans">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-black text-white tracking-tight">clima_tempo_osasco</span>
                                <span className="text-[8px] text-blue-400 font-bold bg-blue-500/10 px-0.5 rounded-xs leading-none">✓</span>
                              </div>
                              <span className="text-[7px] text-stone-300 font-semibold uppercase font-mono tracking-wider">Avenida Zumbi dos Palmares</span>
                            </div>
                          </div>
                          <span className="bg-amber-400 text-stone-950 text-[6.5px] font-mono font-black py-0.5 px-2 rounded-full tracking-wider shadow-xs uppercase">
                            Clima ao Vivo
                          </span>
                        </div>

                        {/* Center visual: Temperature display and weather status */}
                        <div className="flex flex-col items-center justify-center text-center z-10 py-2">
                          <div className="relative inline-block select-none scale-102">
                            <div className="text-4xl sm:text-5xl drop-shadow-[0_4px_10px_rgba(250,204,21,0.25)] animate-bounce [animation-duration:3s]">
                              🌦️
                            </div>
                          </div>
                          <span className="text-5xl sm:text-6xl font-display font-black tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] mt-1 select-all font-sans">
                            {currTemp}°C
                          </span>
                          <span className="text-[10px] uppercase font-mono font-black text-amber-300 tracking-widest mt-1 block select-none">
                            Sensação {sensation}°C • Instável
                          </span>
                        </div>

                        {/* Bottom section: Details box and Description caption */}
                        <div className="space-y-2 z-10">
                          {/* 3 columns grid metadata */}
                          <div className="grid grid-cols-3 gap-1.5 bg-black/35 border border-white/10 p-1.5 rounded-xl text-center backdrop-blur-xs text-[7.5px] font-mono select-none">
                            <div className="flex flex-col">
                              <span className="text-stone-400 leading-none">UMIDADE</span>
                              <span className="text-white font-extrabold font-sans text-[9px] mt-0.5">85%</span>
                            </div>
                            <div className="flex flex-col border-x border-white/10">
                              <span className="text-stone-400 leading-none">VENTO</span>
                              <span className="text-white font-extrabold font-sans text-[9px] mt-0.5">14 km/h</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-stone-400 leading-none">PRESSÃO</span>
                              <span className="text-white font-extrabold font-sans text-[9px] mt-0.5">1014 hPa</span>
                            </div>
                          </div>

                          {/* Description text styled like Instagram bio description */}
                          <div className="text-[9px] text-white leading-relaxed font-sans text-left bg-black/20 p-2 rounded-xl backdrop-blur-xs border border-white/5">
                            <span className="font-black mr-1 text-amber-300">@clima_tempo_osasco</span>
                            Previsão do tempo detalhada com alta umidade e queda gradual de sensação térmica à noite em Osasco. Pedestres na rua, preparem os agasalhos! 🧥🌧️ #ClimaOsasco #PrevisaoTempo #OsascoNews
                          </div>
                        </div>

                        {/* Floating Interaction and guidance Panel on the right margin */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 text-center items-center z-20">
                          <div className="mt-2 text-white/30 text-[9px] animate-bounce flex flex-col items-center">
                            <span>▲</span>
                            <span className="text-[5px] font-black uppercase font-mono tracking-tighter leading-none">Subir</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // NEWS ARTICLE ITEM RENDER
                  let profile = { username: "jornal_bairro", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", verified: true };
                  if (item.category === "news-geral") {
                    profile = { username: "g1_portal_osasco", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", verified: true };
                  } else if (item.category === "news-esportes") {
                    profile = { username: "globo_esporte_sp", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150", verified: true };
                  } else if (item.category === "news-gospel") {
                    profile = { username: "plenum_gospel_br", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150", verified: false };
                  } else if (item.category === "news-fofocas") {
                    profile = { username: "fuxico_original_oficial", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", verified: true };
                  }

                  return (
                    <div 
                      key={item.id}
                      className="w-full h-[355px] min-h-[355px] snap-start relative flex flex-col justify-between p-4 text-white overflow-hidden bg-black shrink-0"
                    >
                      {/* Background Image of news article */}
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-[0.78]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-stone-900 z-0" />
                      )}

                      {/* Shadow Overlay for extreme text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/98 via-black/45 to-black/60 pointer-events-none z-0" />

                      {/* Top Row: source name & badge */}
                      <div className="flex items-center justify-between z-10 select-none">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] p-[1.5px] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                            <div className="bg-white w-full h-full rounded-full p-[1px] flex items-center justify-center overflow-hidden">
                              <img
                                src={profile.avatar}
                                alt={item.source}
                                className="w-full h-full rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                          <div className="text-left leading-none font-sans">
                            <div className="flex items-center gap-0.5">
                              <span className="text-[9.5px] font-black text-white leading-none">{profile.username}</span>
                              {profile.verified && (
                                <span className="text-[8px] text-blue-400 font-bold bg-blue-500/10 px-0.5 rounded-xs leading-none">✓</span>
                              )}
                            </div>
                            <span className="text-[6.5px] text-stone-300 font-bold font-mono uppercase tracking-tight block mt-0.5">
                              {item.source}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1.5 items-center">
                          <span className={`text-[6.5px] font-mono font-black italic tracking-wider py-0.5 px-2 rounded-full border shadow-xs ${item.badgeColor || 'bg-stone-800 text-stone-100'}`}>
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      {/* Center content: Empty space */}
                      <div className="flex-grow z-10" />

                      {/* Bottom content: Big Display Typography Title + Subtitle */}
                      <div className="space-y-1.5 z-10 text-left">
                        {/* Category banner as accent color */}
                        <span className="text-[6.5px] border border-white/20 bg-white/10 text-white font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-wider select-none leading-none inline-block">
                          🕒 {item.time}
                        </span>

                        {/* Title - Optimized for street readability */}
                        <h3 className="text-[12.5px] sm:text-[13.5px] font-display font-black uppercase tracking-tight leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.88)] text-white select-all font-sans">
                          {item.title}
                        </h3>

                        {/* Subtitle / Caption description of the article */}
                        <p className="text-[8.5px] text-stone-200/90 leading-relaxed font-sans font-medium line-clamp-3 select-all bg-black/15 p-2 rounded-xl backdrop-blur-xs border border-white/5">
                          {item.subtitle}
                        </p>

                        {/* Beautiful tags list */}
                        <span className="text-blue-400 font-mono text-[7px] font-black block tracking-tight select-none">
                          #osasco #noticiastemporeal #{profile.username} #bairro
                        </span>
                      </div>

                      <div className="absolute right-4 bottom-4 flex flex-col items-center z-20 select-none">
                        <div className="bg-black/40 border border-white/10 px-2 py-1 rounded-md backdrop-blur-xs text-[7px] font-mono text-white/70">
                          <span>▲ DESLIZAR</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Navigation Controls Overlay */}
          {(slide === "weather" || slide.startsWith("news-")) && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-20 pointer-events-auto select-none">
              <button
                onClick={() => setActiveIndex(curr => Math.max(0, curr - 1))}
                disabled={activeIndex === 0}
                className={`w-7 h-7 rounded-full bg-black/55 hover:bg-black/85 border border-white/15 flex items-center justify-center text-[10px] font-extrabold text-white transition active:scale-90 focus:outline-none cursor-pointer ${activeIndex === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
                title="Anterior"
              >
                ▲
              </button>
              <button
                onClick={() => setActiveIndex(curr => (curr + 1) % reelsFeed.length)}
                className="w-7 h-7 rounded-full bg-black/55 hover:bg-black/85 border border-white/15 flex items-center justify-center text-[10px] font-extrabold text-white transition active:scale-90 focus:outline-none cursor-pointer"
                title="Próximo"
              >
                ▼
              </button>
            </div>
          )}

          {/* TOAST SYSTEM */}
          <AnimatePresence>
            {copiedToast && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-sans text-[8.5px] font-black px-4 py-2 rounded-full shadow-2xl z-40 flex items-center gap-1.5 select-none"
              >
                <span>📬</span> {copiedToast}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
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
          </AnimatePresence>

          {/* INTERACTIVE INSTAGRAM COMMENTS SYSTEM SLIDE-UP SHEET */}
          <AnimatePresence>
            {activeCommentsPost && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="absolute inset-x-0 bottom-0 bg-white border-t border-stone-200 rounded-t-3xl shadow-2xl z-30 flex flex-col max-h-[350px] min-h-[300px]"
              >
                {/* Header */}
                <div className="px-4 py-3 flex justify-between items-center bg-[#f8f9fa] rounded-t-3xl border-b border-stone-100 select-none shrink-0 border-box">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-sans font-black text-stone-900 uppercase">Comentários</span>
                    <span className="text-[7.5px] text-stone-400 font-bold block max-w-[200px] truncate leading-none mt-0.5">
                      {activeCommentsPost === "clima-osasco-post" ? "Previsão do Tempo • Osasco" : activeCommentsPost}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveCommentsPost(null);
                      setNewCommentText("");
                    }}
                    className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-extrabold text-stone-600 hover:bg-stone-200 transition focus:outline-none"
                  >
                    ✕
                  </button>
                </div>

                {/* ListView */}
                <div className="flex-grow overflow-y-auto p-3.5 flex flex-col gap-3 scrollbar-none bg-[#fafafa]">
                  {(() => {
                    const commentsArr = commentsState[activeCommentsPost] || [
                      { id: "fallback-1", username: "leitor_atento", text: "Excelente matéria, importante acompanhar essas atualizações de trânsito em Osasco.", time: "Há 10 min" },
                      { id: "fallback-2", username: "morador_km18", text: "Estou gostando de ver essas notícias em tempo real, ajuda bastante quem pega ônibus do Palmares.", time: "Há 20 min" }
                    ];

                    return commentsArr.map((comm) => (
                      <div key={comm.id} className="flex gap-2.5 items-start text-left shrink-0 animate-fade-in pointer-events-auto">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-stone-200 to-stone-300 flex items-center justify-center text-[8.5px] font-black text-stone-700 shrink-0 select-none">
                          {comm.username.substring(0, 2).toUpperCase()}
                        </div>
                        
                        <div className="flex-grow font-sans leading-none">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8.5px] font-black text-stone-900">{comm.username}</span>
                            <span className="text-[6.5px] text-stone-400 font-semibold">{comm.time}</span>
                          </div>
                          <p className="text-[8.2px] text-stone-600 leading-normal mt-1 font-normal select-all">
                            {comm.text}
                          </p>
                        </div>

                        <button className="text-stone-300 hover:text-red-500 scale-90 active:scale-75 transition focus:outline-none shrink-0">
                          ♥
                        </button>
                      </div>
                    ));
                  })()}
                </div>

                {/* Form comment bar */}
                <div className="border-t border-stone-200 px-3 py-2 flex items-center gap-2 bg-white shrink-0 select-none border-box">
                  <input 
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="flex-grow bg-stone-50 border border-stone-200 rounded-full py-1.5 px-3.5 text-[9.5px] outline-none font-medium placeholder-stone-400 focus:border-stone-350 text-stone-900"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newCommentText.trim()) {
                        const commentsKey = activeCommentsPost;
                        const userCommText = newCommentText.trim();
                        const currentComments = commentsState[commentsKey] || [
                          { id: "fallback-1", username: "leitor_atento", text: "Excelente matéria, importante acompanhar essas atualizações de trânsito em Osasco.", time: "Há 10 min" },
                          { id: "fallback-2", username: "morador_km18", text: "Estou gostando de ver essas notícias em tempo real, ajuda bastante quem pega ônibus do Palmares.", time: "Há 20 min" }
                        ];

                        const added = {
                          id: String(Date.now()),
                          username: "tiagameshow",
                          text: userCommText,
                          time: "Agora"
                        };

                        setCommentsState(prev => ({
                          ...prev,
                          [commentsKey]: [...currentComments, added]
                        }));
                        setNewCommentText("");
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (!newCommentText.trim()) return;
                      const commentsKey = activeCommentsPost;
                      const userCommText = newCommentText.trim();
                      const currentComments = commentsState[commentsKey] || [
                        { id: "fallback-1", username: "leitor_atento", text: "Excelente matéria, importante acompanhar essas atualizações de trânsito em Osasco.", time: "Há 10 min" },
                        { id: "fallback-2", username: "morador_km18", text: "Estou gostando de ver essas notícias em tempo real, ajuda bastante quem pega ônibus do Palmares.", time: "Há 20 min" }
                      ];

                      const added = {
                        id: String(Date.now()),
                        username: "tiagameshow",
                        text: userCommText,
                        time: "Agora"
                      };

                      setCommentsState(prev => ({
                        ...prev,
                        [commentsKey]: [...currentComments, added]
                      }));
                      setNewCommentText("");
                    }}
                    className="text-blue-500 font-extrabold text-[9.5px] px-2 py-1.5 hover:text-blue-700 active:scale-95 transition focus:outline-none"
                  >
                    Publicar
                  </button>
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
