
import React, { useState, useEffect, useMemo } from 'react';
import { Channel, AppState, Playlist } from './types';
import VideoPlayer from './components/VideoPlayer';
import AddPlaylist from './components/AddPlaylist';
import { fetchAndParsePlaylist } from './services/m3uParser';

const SIMULATED_CHANNELS: Channel[] = [
  {
    id: 'al-jazeera-news',
    number: 501,
    name: 'Al Jazeera News',
    url: 'https://live-hls-web-aje.akamaized.net/hls/live/2036571/aje/index.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/en/f/f2/Al_Jazeera_Eng_Al_Jazeera_Arabic_Logo.svg',
    group: 'News',
    country: 'Arabic',
    resolution: 'HD',
    epg: {
      current: { title: 'حصاد اليوم - حصاد شامل لأهم الأنباء', start: '21:00', end: '22:00', progress: 48 },
      next: { title: 'ما وراء الخبر - تحليل سياسي معمق', start: '22:00', end: '23:00', progress: 0 }
    }
  },
  {
    id: 'al-arabiya',
    number: 502,
    name: 'Al Arabiya',
    url: 'https://ssh101.mshcdn.net/68b8b6a38622/index.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Al_Arabiya_logo.svg',
    group: 'News',
    country: 'Arabic',
    resolution: 'HD',
    epg: {
      current: { title: 'نشرة الرابعة - تغطية حية لأخبار المنطقة', start: '16:00', end: '17:30', progress: 72 },
      next: { title: 'تفاعلكم - رصد لترندات التواصل الاجتماعي', start: '17:30', end: '18:30', progress: 0 }
    }
  },
  {
    id: 'quran-tv',
    number: 503,
    name: 'Saudi Quran TV',
    url: 'https://win.holol.com/live/quran/playlist.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/ar/2/23/Logo_of_Saudi_Quran_TV.png',
    group: 'Religious',
    country: 'Arabic',
    resolution: 'HD',
    epg: {
      current: { title: 'بث مباشر من الحرم المكي الشريف - تلاوات عطرة', start: '00:00', end: '23:59', progress: 15 },
      next: { title: 'تلاوات من صلوات التراويح والقيام', start: '00:00', end: '23:59', progress: 0 }
    }
  },
  {
    id: 'sunnah-tv',
    number: 504,
    name: 'Saudi Sunnah TV',
    url: 'https://win.holol.com/live/sunnah/playlist.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/ar/thumb/9/9e/Logo_of_Saudi_Sunna_TV.png/250px-Logo_of_Saudi_Sunna_TV.png',
    group: 'Religious',
    country: 'Arabic',
    resolution: 'HD',
    epg: {
      current: { title: 'نقل مباشر من المسجد النبوي الشريف - المدينة المنورة', start: '00:00', end: '23:59', progress: 32 },
      next: { title: 'أحاديث نبوية شريفة وسيرة عطرة', start: '00:00', end: '23:59', progress: 0 }
    }
  },
  {
    id: 'nasa-hd',
    number: 101,
    name: 'NASA Live HD',
    url: 'https://ntv1.akamaized.net/hls/live/2014049/NASA-NTV1-HLS/master.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg',
    group: 'Science',
    country: 'USA',
    resolution: '4K',
    epg: {
      current: { title: 'ISS Expedition 70: Science & Research Updates', start: '19:30', end: '20:30', progress: 82 },
      next: { title: 'Artemis Generation: To the Moon and Beyond', start: '20:30', end: '21:30', progress: 0 }
    }
  }
];

const ARABIC_PLAYLIST_URL = 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('nova_satellite_state');
    const defaultState: AppState = {
      playlists: [],
      history: [],
      favorites: [],
      activeChannel: null,
      currentView: 'home',
      searchQuery: '',
      selectedGroup: null,
      volume: 85,
      isMuted: false,
      parentalPin: '0000',
      isLockedMode: false,
    };
    if (saved) {
      try {
        return { ...defaultState, ...JSON.parse(saved), activeChannel: null, currentView: 'home' };
      } catch (e) {
        return defaultState;
      }
    }
    return defaultState;
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-sync requested Arabic playlist
  useEffect(() => {
    const syncArabicFleet = async () => {
      const alreadyExists = state.playlists.some(p => p.url === ARABIC_PLAYLIST_URL);
      if (!alreadyExists) {
        setIsSyncing(true);
        try {
          const channels = await fetchAndParsePlaylist(ARABIC_PLAYLIST_URL);
          if (channels.length > 0) {
            const newPlaylist: Playlist = {
              id: 'arabic-fleet-auto',
              name: 'Arabic Global Satellite',
              url: ARABIC_PLAYLIST_URL,
              channels: channels.map((c, idx) => ({ 
                ...c, 
                country: c.group?.toLowerCase().includes('arabic') || c.group?.toLowerCase().includes('middle east') ? 'Arabic' : (c.country || 'Arabic'),
                number: 1000 + idx
              })),
              lastUpdated: Date.now(),
            };
            setState(prev => ({
              ...prev,
              playlists: [...prev.playlists, newPlaylist]
            }));
          }
        } catch (error) {
          console.error("Auto-sync failed for Arabic fleet:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    syncArabicFleet();
  }, [state.playlists]);

  useEffect(() => {
    localStorage.setItem('nova_satellite_state', JSON.stringify({
      playlists: state.playlists,
      history: state.history,
      favorites: state.favorites,
      volume: state.volume,
    }));
  }, [state]);

  const allChannels = useMemo(() => {
    const fromPlaylists = state.playlists.flatMap(p => p.channels);
    return [...SIMULATED_CHANNELS, ...fromPlaylists].sort((a, b) => a.number - b.number);
  }, [state.playlists]);

  const countries = useMemo(() => {
    return Array.from(new Set(allChannels.map(c => c.country || 'International'))).sort();
  }, [allChannels]);

  const filteredChannels = useMemo(() => {
    let result = allChannels;
    if (state.selectedGroup) {
      result = result.filter(c => (c.country || 'International') === state.selectedGroup);
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        (c.group && c.group.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allChannels, state.selectedGroup, state.searchQuery]);

  const playChannel = (channel: Channel) => {
    setState(prev => ({ ...prev, activeChannel: channel }));
  };

  const handleChannelChange = (delta: number) => {
    if (!state.activeChannel) return;
    const currentIndex = allChannels.findIndex(c => c.id === state.activeChannel?.id);
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) nextIndex = allChannels.length - 1;
    if (nextIndex >= allChannels.length) nextIndex = 0;
    playChannel(allChannels[nextIndex]);
  };

  const handleAddPlaylist = (playlist: Playlist) => {
    setState(prev => ({
      ...prev,
      playlists: [...prev.playlists, playlist],
      currentView: 'home'
    }));
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white font-sans selection:bg-indigo-500 selection:text-white overflow-hidden flex flex-col relative">
      {/* Background Orbs */}
      <div className="absolute top-[-5%] left-[-10%] w-[40%] h-[40%] bg-[#4f46e5] rounded-full blur-[100px] opacity-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#0ea5e9] rounded-full blur-[120px] opacity-10"></div>

      {/* Header */}
      <header className="relative z-10 px-8 py-5 flex items-center justify-between border-b border-white/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-[#4f46e5] to-[#4338ca] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/30">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">Nova<span className="text-zinc-500">Stream</span></h1>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> 
              Satellite Receiver Pro V4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-[#101014]/80 backdrop-blur rounded-full border border-white/5">
             <span className="text-[9px] font-black text-zinc-600 uppercase">Signal Lock</span>
             <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <div key={i} className={`w-1 h-3 rounded-full ${i < 4 ? 'bg-[#4f46e5]' : 'bg-zinc-800'}`}></div>)}
             </div>
          </div>
          <button 
            onClick={() => setState(p => ({ ...p, currentView: 'add-playlist' }))}
            className="w-11 h-11 bg-[#4f46e5] hover:bg-indigo-500 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-900/40 active:scale-95"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row p-8 gap-10 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex flex-col gap-6">
           <div className="flex items-center justify-between mb-2">
             <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Satellite Fleet</h3>
             {isSyncing && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></div>}
           </div>
           
           <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-280px)] pr-2 scrollbar-hide">
              <button 
                onClick={() => setState(p => ({ ...p, selectedGroup: null }))}
                className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 transition-all border ${!state.selectedGroup ? 'bg-[#121218] border-indigo-500/30 text-white' : 'bg-transparent border-white/[0.03] text-zinc-500 hover:bg-white/[0.02]'}`}
              >
                 <div className="w-9 h-9 rounded-lg bg-[#1a1a24] flex items-center justify-center text-[10px] font-black italic border border-white/[0.05]">All</div>
                 <span className="font-bold text-xs">Global Matrix</span>
              </button>
              
              {countries.map(country => {
                let code = country === 'Arabic' ? 'ARA' : country.slice(0, 3).toUpperCase();
                return (
                  <button 
                    key={country}
                    onClick={() => setState(p => ({ ...p, selectedGroup: country }))}
                    className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 transition-all border ${state.selectedGroup === country ? 'bg-[#121218] border-indigo-500/30 text-white' : 'bg-transparent border-white/[0.03] text-zinc-500 hover:bg-white/[0.02]'}`}
                  >
                     <div className="w-9 h-9 rounded-lg bg-[#1a1a24] flex items-center justify-center text-[10px] font-black tracking-tight border border-white/[0.05]">
                        {code}
                     </div>
                     <span className="font-bold text-xs truncate">{country}</span>
                  </button>
                );
              })}
           </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div className="flex items-baseline gap-4">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                {state.selectedGroup || 'Transponder'}
              </h2>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest bg-white/[0.02] px-3 py-1 rounded-full border border-white/[0.05]">
                {filteredChannels.length} Channels
              </span>
            </div>
            
            <div className="relative w-full sm:max-w-[300px]">
               <input 
                 type="text" 
                 placeholder="Find channel..."
                 value={state.searchQuery}
                 onChange={e => setState(p => ({ ...p, searchQuery: e.target.value }))}
                 className="w-full bg-[#101014] border border-white/[0.05] rounded-2xl px-12 py-3.5 text-xs focus:border-indigo-500/50 outline-none transition-all placeholder:text-zinc-700"
               />
               <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {filteredChannels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                 <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 text-zinc-800">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M8 12h8"/></svg>
                 </div>
                 <h3 className="text-xl font-bold text-zinc-700 uppercase italic">No Channels Found</h3>
                 <p className="text-xs text-zinc-800 mt-2 font-bold uppercase tracking-widest">Adjust satellite filters or search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
                {filteredChannels.map((channel) => (
                  <div 
                    key={channel.id}
                    onClick={() => playChannel(channel)}
                    className="group relative bg-[#0e0e11]/60 backdrop-blur border border-white/[0.04] rounded-[2.5rem] p-7 cursor-pointer hover:border-indigo-500/40 transition-all hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
                  >
                    {/* Background Index Number */}
                    <div className="absolute -top-4 -right-4 text-[120px] font-black text-white/[0.015] italic leading-none select-none group-hover:text-indigo-500/[0.03] transition-colors">
                       {channel.number}
                    </div>

                    <div className="relative z-10 flex flex-col gap-5">
                      <div className="flex items-start justify-between">
                        <div className="w-16 h-16 bg-[#16161c] rounded-2xl flex items-center justify-center p-3.5 border border-white/[0.05] shadow-inner overflow-hidden">
                          {channel.logo ? (
                            <img src={channel.logo} className="w-full h-full object-contain grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" alt="" />
                          ) : (
                            <span className="text-2xl font-black text-zinc-700 uppercase italic">{channel.name[0]}</span>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-zinc-900/80 border border-white/[0.05] text-zinc-600 group-hover:text-zinc-400 uppercase tracking-tighter">
                            {channel.resolution || 'HD'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xl font-black tracking-tight group-hover:text-indigo-200 transition-colors truncate" dir="auto">{channel.name}</h3>
                        <p className="text-[11px] text-zinc-600 font-black uppercase tracking-widest flex items-center gap-2">
                           {channel.group} <span className="w-1 h-1 rounded-full bg-zinc-800"></span> {channel.country || 'International'}
                        </p>
                      </div>

                      <div className="pt-5 border-t border-white/[0.03] mt-2">
                         <div className="flex justify-between items-center text-[10px] font-black text-zinc-700 uppercase tracking-widest">
                            <span>Program Info</span>
                            <span className="text-indigo-500 text-[9px] animate-pulse">On Air</span>
                         </div>
                         <p className="text-[13px] font-bold text-zinc-400 truncate mt-1.5" dir="auto">
                           {channel.epg?.current.title || 'Broadcast Signal Active'}
                         </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info Bar */}
      <footer className="relative z-10 px-8 py-3.5 border-t border-white/[0.02] bg-black/40 backdrop-blur-xl flex items-center justify-between text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
         <div className="flex gap-8">
            <span className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> 
              Ku-Band Lock
            </span>
            <span className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> 
              Nilesat-201
            </span>
         </div>
         <div className="hidden lg:flex gap-8">
            <span className="text-zinc-700">SR: 27500</span>
            <span className="text-zinc-700">POL: V</span>
            <span className="text-zinc-700">FEC: 5/6</span>
         </div>
         <div className="flex items-center gap-2">
           <span className="text-zinc-800">SATELLITE SYNC STATUS</span>
           <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-600 w-[85%]"></div>
           </div>
         </div>
      </footer>

      {/* Global Overlays */}
      {state.activeChannel && (
        <VideoPlayer 
          channel={state.activeChannel}
          volume={state.volume}
          isMuted={state.isMuted}
          onVolumeChange={(v) => setState(p => ({ ...p, volume: v }))}
          onMuteToggle={() => setState(p => ({ ...p, isMuted: !p.isMuted }))}
          onChannelChange={handleChannelChange}
          onClose={() => setState(p => ({ ...p, activeChannel: null }))}
        />
      )}

      {state.currentView === 'add-playlist' && (
        <AddPlaylist 
          onAdd={handleAddPlaylist}
          onCancel={() => setState(p => ({ ...p, currentView: 'home' }))}
        />
      )}
    </div>
  );
};

export default App;
