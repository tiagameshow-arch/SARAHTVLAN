export interface BusLine {
  id: string;
  line: string;
  time: string;
}

export interface MonitorState {
  id: string;
  name: string;
  playlist: string[];
  currentVideoIndex: number;
  isPlaying: boolean;
  mute: boolean;
  orientation?: "landscape" | "portrait";
  ip?: string;
  forceRefreshTime?: string;
  location?: string;
  customBusLines?: string;
  isOnline?: boolean;
}

export interface TVState {
  temperature: string;
  newsTicker: string;
  busLines: BusLine[];
  monitors: MonitorState[];
  updatedAt: string;
  soundEffect?: string | null;
  soundEffectTime?: string | null;
  stadiumAmbient?: boolean;
  announcementSpeech?: string | null;
  announcementSpeechTime?: string | null;
}

