import React, { useState, useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

interface LandscapePassengerPhoneProps {
  tvState: any;
  timeState: string;
  getWeatherIcon: (temp: string) => ReactNode;
  activeMonitor?: any;
  slide?: string;
  setSlide?: (slide: string) => void;
  getLineTime: (lineNumber: string) => string;
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
      badgeColor: "bg-amber-100/90 text-amber-900 border border-amber-200"
    },
    {
      title: "FEIRA CULTURAL DE DOMINGO NA ZUMBI DOS PALMARES REÚNE PÚBLICO RECORDE COM PASTÉIS E ARTESANATO",
      subtitle: "Novos feirantes, música instrumental beneficente e doces artesanais mobilizam centenas de famílias no final de semana.",
      source: "Bairro em Foco • Palmares",
      image: "https://images.unsplash.com/photo-1488459711615-466d6a2f4da8?w=450&auto=format&fit=crop&q=80",
      time: "Há 42 min",
      badge: "COMÉRCIO LOCAL",
      badgeColor: "bg-emerald-100/90 text-emerald-950 border border-emerald-200"
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
      badgeColor: "bg-red-105 text-red-900 border border-red-200"
    },
    {
      title: "CNN: TARIFA INTEGRADA DE ÔNIBUS DO SISTEMA EMTU SOFRE ATUALIZAÇÃO BENÉFICA PARA TRABALHADOR",
      subtitle: "Novas regras de integração de bilhetes metropolitanos ampliam limite de tempo e reduzem tarifas conexas.",
      source: "CNN Brasil",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=450&auto=format&fit=crop&q=80",
      time: "Há 20 min",
      badge: "UTILIDADE PÚBLICA",
      badgeColor: "bg-indigo-100 text-indigo-900 border border-indigo-200"
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
      badgeColor: "bg-yellow-100 text-yellow-950 border border-yellow-200"
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
      badgeColor: "bg-cyan-50 text-cyan-900 border border-cyan-200"
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

export default function LandscapePassengerPhone({
  tvState,
  timeState,
  getWeatherIcon,
  activeMonitor,
  slide: propSlide,
  setSlide: propSetSlide,
  getLineTime
}: LandscapePassengerPhoneProps) {
  const [localSlide, setLocalSlide] = useState<string>("weather");
  const [isAutoplay, setIsAutoplay] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const slide = propSlide !== undefined ? propSlide : localSlide;
  const setSlide = propSetSlide !== undefined ? propSetSlide : setLocalSlide;

  const currTemp = activeMonitor && tvState ? (parseInt(tvState.temperature) || 17) : 17;
  const sensation = currTemp - 1;
  const clockShort = timeState ? timeState.substring(0, 5) : "15:35";

  // Re-memoized unified Reels feed
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

    // Weather Post
    list.push({
      id: "clima-osasco-post-land",
      type: "weather",
      title: "PREVISÃO DO CLIMA EM OSASCO",
      subtitle: `Temperatura atual de ${currTemp}°C na localidade. Tempo instável, prepare seu casaco e agasalho dadas as correntes de vento litorâneo na região.`,
      source: "clima_tempo_osasco",
      time: "Agora",
      badge: "CLIMA ATUAL",
      badgeColor: "bg-amber-500/25 border-amber-500/35 text-amber-200",
      category: "weather"
    });

    // Populate news
    Object.entries(ALL_NEWS_DATABASE).forEach(([key, articles]) => {
      articles.forEach((art, i) => {
        list.push({
          id: `land-${key}-${i}-${art.title}`,
          type: "news",
          title: art.title,
          subtitle: art.subtitle,
          source: art.source,
          image: art.image,
          time: art.time,
          badge: art.badge,
          badgeColor: art.badgeColor,
          category: `news-${key}`
        });
      });
    });

    return list;
  }, [currTemp]);

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

  useEffect(() => {
    if (scrollContainerRef.current && !slide.startsWith("bus-")) {
      const containerHeight = scrollContainerRef.current.clientHeight || 145;
      scrollContainerRef.current.scrollTo({
        top: activeIndex * containerHeight,
        behavior: "smooth"
      });
    }
    setProgress(0);
  }, [activeIndex, slide]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (slide.startsWith("bus-")) return;
    const scrollTop = e.currentTarget.scrollTop;
    const containerHeight = e.currentTarget.clientHeight || 145;
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

  useEffect(() => {
    if (!isAutoplay) {
      setProgress(0);
      return;
    }

    const stepMs = 100;
    const durationMs = 8000;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (slide.startsWith("bus-")) {
            const currentIndex = SLIDES_SEQUENCE.indexOf(slide);
            const nextIndex = (currentIndex + 1) % SLIDES_SEQUENCE.length;
            setSlide(SLIDES_SEQUENCE[nextIndex]);
          } else {
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
    <div className="w-full max-w-[500px] bg-[#1e222b] text-[#f1f3f4] rounded-[2rem] border-[6px] border-[#2d323f] p-2 shadow-[0_20px_45px_rgba(0,0,0,0.85)] relative select-none font-sans mx-auto">
      {/* Landscape Notch screen */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3.5 h-[62px] bg-[#2d323f] rounded-r-lg z-20 flex flex-col justify-center items-center">
        <div className="w-[1.5px] h-4 bg-stone-950 rounded-full ml-0.5" />
      </div>

      {/* Screen Wrapper with Google Discover theme */}
      <div 
        className="relative rounded-[1.4rem] min-h-[240px] max-h-[240px] h-[240px] flex flex-col justify-between overflow-hidden transition-all duration-300 bg-[#f1f3f4] pb-1"
      >
        {/* Dynamic header of the phone */}
        <div className="pt-2 px-3 pb-1 z-10 flex justify-between items-center text-[8px] font-mono font-bold text-stone-700 bg-[#f1f3f4] shrink-0 select-none">
          <span className="tracking-widest border px-1 py-0.5 rounded text-[7.5px] bg-stone-200 border-stone-300 leading-none">
            {clockShort}
          </span>
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-stone-600">
              <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[7px] tracking-tighter border font-extrabold rounded px-0.5 bg-stone-200 border-stone-300 scale-90">
              4G_PLUS
            </span>
            <div className="h-2.5 w-[18px] border rounded-xs flex items-center p-0.5 relative gap-[1px] border-stone-400">
              <div className="h-full w-[98%] bg-emerald-600 rounded-2xs" />
              <span className="absolute inset-0 text-[5px] font-sans flex items-center justify-center font-black text-white scale-85 leading-none">98</span>
            </div>
          </div>
        </div>

        {/* PILLS CATEGORIES TABS */}
        <div className="z-10 px-1.5 pb-1 pt-1 shrink-0 bg-[#f1f3f4] select-none">
          <div className="flex overflow-x-auto whitespace-nowrap gap-1 py-1 px-0.5 scrollbar-none scroll-smooth">
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
                  type="button"
                  onClick={() => handleSetSlide(s)}
                  className={`px-2 py-1 rounded-full text-[7.5px] font-black uppercase tracking-tight flex items-center gap-0.5 shrink-0 select-none transition-all duration-150 active:scale-95 border ${
                    isActive
                      ? "bg-slate-900 border-slate-950 text-white shadow-sm font-bold"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <span className={`${accentColor} text-[8.5px]`}>{icon}</span>
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
              ? "overflow-y-auto max-h-[145px] h-[145px] bg-[#f4f6f9] p-2.5 pt-1 flex flex-col gap-2"
              : "overflow-y-scroll snap-y snap-mandatory max-h-[145px] h-[145px] bg-black p-0 flex flex-col gap-0"
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
                {reelsFeed.map((item) => {
                  if (item.type === "weather") {
                    return (
                      <div 
                        key={item.id}
                        className="w-full h-[145px] min-h-[145px] snap-start relative flex flex-row items-center justify-between p-3 text-white overflow-hidden bg-gradient-to-br from-[#0c2445] via-[#10305c] to-[#1a447c] shrink-0 gap-3"
                      >
                        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                        
                        {/* Weather brief */}
                        <div className="w-[30%] flex flex-col items-center justify-center border-r border-white/10 pr-2 h-full py-1 shrink-0">
                          <span className="text-xl">🌦️</span>
                          <span className="text-2xl font-sans font-black tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] mt-0.5 leading-none">
                            {currTemp}°C
                          </span>
                          <span className="text-[6px] uppercase font-mono font-black text-amber-300 tracking-wider mt-1 text-center block leading-none">
                            Sensação {sensation}°C
                          </span>
                        </div>

                        <div className="w-[70%] flex flex-col justify-between h-full py-0.5 text-left">
                          <div className="flex items-center justify-between shrink-0 h-4">
                            <span className="text-[7.5px] font-black tracking-tight text-white uppercase font-sans">CLIMA METROPOLITANO</span>
                            <span className="bg-amber-400 text-stone-950 text-[5.5px] font-mono font-black py-0.5 px-1.5 rounded-full uppercase leading-none scale-90">AO VIVO</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-1 bg-black/35 border border-white/5 p-1 rounded-lg text-center text-[5.5px] font-mono shrink-0 select-none">
                            <div className="flex flex-col">
                              <span className="text-stone-400 leading-none">UMIDADE</span>
                              <span className="text-white font-extrabold text-[7.5px] mt-0.5">85%</span>
                            </div>
                            <div className="flex flex-col border-x border-white/5">
                              <span className="text-stone-400 leading-none">VENTO</span>
                              <span className="text-white font-extrabold text-[7.5px] mt-0.5">14 km/h</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-stone-400 leading-none">PRESSÃO</span>
                              <span className="text-white font-extrabold text-[7.5px] mt-0.5">1014 hPa</span>
                            </div>
                          </div>

                          <div className="text-[7.5px] text-stone-200 leading-normal font-sans line-clamp-2 mt-0.5 bg-black/15 p-1.5 rounded-md border border-white/5 select-all">
                            <span className="font-extrabold text-amber-300">@clima_tempo_osasco</span> Tempo instável em Osasco. Pedestres preparando agasalhos! 🧥🌧️
                          </div>
                        </div>
                      </div>
                    );
                  }

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
                      className="w-full h-[145px] min-h-[145px] snap-start relative flex flex-row p-0 text-white overflow-hidden bg-black shrink-0 border-b border-stone-850"
                    >
                      <div className="w-[32%] h-full relative shrink-0 bg-stone-900 border-r border-stone-850/30">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-stone-900" />
                        )}
                        <div className="absolute top-1.5 left-1.5 z-10 scale-85 origin-top-left">
                          <span className={`text-[5px] font-mono font-black uppercase py-0.5 px-1.5 rounded-full border shadow ${item.badgeColor || 'bg-stone-800 text-stone-100 border-none'}`}>
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      <div className="w-[68%] h-full p-2 flex flex-col justify-between text-left relative z-10 bg-[#070708]">
                        <div className="flex items-center justify-between shrink-0 mb-0.5 select-none text-[6.5px]">
                          <div className="flex items-center gap-1">
                            <div className="w-3.5 h-3.5 rounded-full bg-white p-[0.5px] flex items-center justify-center shrink-0 overflow-hidden">
                              <img
                                src={profile.avatar}
                                alt={item.source}
                                className="w-full h-full rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="text-[7px] font-black text-stone-200 leading-none truncate max-w-[85px]">{profile.username}</span>
                            {profile.verified && (
                              <span className="text-[6px] text-blue-400 font-bold bg-blue-500/10 px-0.5 rounded-xs leading-none">✓</span>
                            )}
                          </div>
                          <span className="text-[5.5px] text-[#e8a317] uppercase font-mono font-extrabold">{item.time}</span>
                        </div>

                        <h3 className="text-[9px] font-sans font-black uppercase tracking-tight leading-tight text-white line-clamp-2 select-all h-8 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                          {item.title}
                        </h3>

                        <p className="text-[7.5px] text-stone-300 leading-snug line-clamp-2 mt-0.5 h-[34px] overflow-hidden select-all bg-black/10 p-1 rounded">
                          {item.subtitle}
                        </p>

                        <div className="flex items-center justify-between border-t border-stone-850 pt-1 shrink-0 text-[5px] select-none font-mono">
                          <span className="text-blue-400 font-semibold truncate max-w-[124px]">
                            #osasco #noticiashorizontal #{profile.username}
                          </span>
                          <span className="text-stone-500 font-bold uppercase">ROLANDO</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            {(slide === "bus-035" || slide === "bus-034" || slide === "bus-466x1") && (
              <motion.div
                key={slide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col text-left flex-grow -mx-2.5 -mt-2 bg-[#f4f6f9] overflow-hidden"
              >
                {/* COMPACT BLUE HEADER BAR */}
                <div className="bg-[#002d62] text-white py-1 px-2.5 flex items-center justify-between font-sans select-none shrink-0 border-b border-blue-900 shadow-sm leading-none h-[22px]">
                  <span className="text-white text-[8px] font-extrabold uppercase tracking-wider">
                    🚌 QUADRO DE HORÁRIOS (DEITADO)
                  </span>
                  <div className="bg-emerald-400 w-1.5 h-1.5 rounded-full animate-pulse shrink-0" />
                </div>

                <div className="bg-white border-b border-stone-200 px-2.5 py-1 flex items-center justify-between font-sans select-none shrink-0 h-[22px] leading-none">
                  <span className="text-[8px] font-black text-stone-900 tracking-tight uppercase truncate max-w-[170px]">
                    {slide === "bus-035" && "LINHA 035 - CIRCULAR"}
                    {slide === "bus-034" && "LINHA 034 - COLETIVO"}
                    {slide === "bus-466x1" && "LINHA 466X1 - EXPRESSO"}
                  </span>
                  <span className="text-[6px] text-stone-400 font-bold uppercase font-mono truncate max-w-[120px]">
                    {activeMonitor?.location || "Terminal Central"}
                  </span>
                </div>

                <div className="p-2 flex flex-col gap-1.5 overflow-y-auto bg-[#f4f6f9] h-[101px] max-h-[101px]">
                  <div className="grid grid-cols-2 gap-1.5 uppercase font-mono">
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
                          subtitle: "via Jd. Palmares",
                          time: formatTime(lineTime35, 12)
                        });
                      } else if (slide === "bus-034") {
                        const baseTimeStr = formatTime(lineTime34, 15);
                        let secondaryTimeStr = baseTimeStr;
                        const match = lineTime34.match(/^(\d+)/);
                        if (match) {
                          secondaryTimeStr = `${parseInt(match[1]) + 5} MIN`;
                        }
                        rows.push({
                          line: "034",
                          name: "Terminal (S)",
                          subtitle: "via Centro h.",
                          time: baseTimeStr
                        });
                        rows.push({
                          line: "034",
                          name: "Centro (D)",
                          subtitle: "via Jd. Palmares",
                          time: secondaryTimeStr
                        });
                      } else if (slide === "bus-466x1") {
                        const baseTimeStr = formatTime(lineTime466, 8);
                        let secondaryTimeStr = baseTimeStr;
                        const match = lineTime466.match(/^(\d+)/);
                        if (match) {
                          secondaryTimeStr = `${parseInt(match[1]) + 7} MIN`;
                        }
                        rows.push({
                          line: "466X1",
                          name: "Terminal (S)",
                          subtitle: "via Rodovia",
                          time: baseTimeStr
                        });
                        rows.push({
                          line: "466X1",
                          name: "Centro (D)",
                          subtitle: "via Rodovia",
                          time: secondaryTimeStr
                        });
                      }

                      return rows.map((row, idx) => (
                        <div
                          key={idx}
                          className="bg-white text-stone-900 border border-stone-200/95 rounded-lg p-1.5 flex justify-between items-center relative shadow-xs text-[8px] h-[36px]"
                        >
                          <div className="flex items-center gap-1 truncate">
                            <div className="bg-[#fbc02d] text-stone-950 font-sans font-black text-[7px] px-1 py-0.5 rounded text-center shrink-0 min-w-[28px]">
                              {row.line}
                            </div>
                            <div className="text-left font-sans leading-none truncate max-w-[65px]">
                              <h4 className="font-extrabold text-[7.5px] text-stone-900 tracking-tight leading-none uppercase truncate">{row.name}</h4>
                              <span className="text-[5.5px] font-bold text-stone-400 mt-0.5 block leading-none truncate">{row.subtitle}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 bg-stone-50 border border-stone-200 px-1 py-0.5 rounded-md shrink-0">
                            <span className="text-[7.5px] font-extrabold text-stone-950 leading-none">{row.time}</span>
                            <span className="text-emerald-500 text-[6px] leading-none animate-pulse">▼</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Navigation Controls Overlay */}
        {(slide === "weather" || slide.startsWith("news-")) && (
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-20 pointer-events-auto select-none">
            <button
              type="button"
              onClick={() => setActiveIndex(curr => Math.max(0, curr - 1))}
              disabled={activeIndex === 0}
              className={`w-5 h-5 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 flex items-center justify-center text-[7px] font-black text-white cursor-pointer ${activeIndex === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex(curr => (curr + 1) % reelsFeed.length)}
              className="w-5 h-5 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 flex items-center justify-center text-[7px] font-black text-white cursor-pointer"
            >
              ▼
            </button>
          </div>
        )}
      </div>

      {/* Swipe Nav circles indicators represent play/pause */}
      <div className="h-6 bg-stone-950/95 border-t border-white/5 flex items-center justify-around z-10 select-none rounded-b-[1.7rem] overflow-hidden text-[7.5px]">
        <span className="text-stone-400 font-bold uppercase tracking-wider font-mono scale-90">Auto-Rotation Status:</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsAutoplay(!isAutoplay)}
            className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/25 rounded hover:bg-emerald-500/20 active:scale-95 text-[7px] font-black"
          >
            {isAutoplay ? "PAUSAR" : "INICIAR"}
          </button>
          <span className="text-stone-400 font-mono tracking-widest text-[7px]">{progress.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
