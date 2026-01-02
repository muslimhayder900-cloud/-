
export interface EPGProgram {
  title: string;
  start: string;
  end: string;
  progress: number;
}

export interface Channel {
  id: string;
  number: number;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  country?: string;
  resolution?: '4K' | 'HD' | 'SD';
  isLocked?: boolean;
  // Added tvgId to support external EPG mapping and fix TS error in parser
  tvgId?: string;
  epg?: {
    current: EPGProgram;
    next: EPGProgram;
  };
}

export interface Playlist {
  id: string;
  name: string;
  url: string;
  channels: Channel[];
  lastUpdated: number;
}

export type ViewState = 'home' | 'categories' | 'favorites' | 'history' | 'settings' | 'add-playlist';

export interface AppState {
  playlists: Playlist[];
  history: Channel[];
  favorites: string[];
  activeChannel: Channel | null;
  currentView: ViewState;
  searchQuery: string;
  selectedGroup: string | null;
  volume: number;
  isMuted: boolean;
  parentalPin: string;
  isLockedMode: boolean;
}
