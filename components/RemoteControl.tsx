
import React from 'react';

interface RemoteControlProps {
  onNumberClick: (num: number) => void;
  onVolumeChange: (delta: number) => void;
  onChannelChange: (delta: number) => void;
  onMute: () => void;
  onClose: () => void;
  onToggleFullscreen: () => void;
}

const RemoteControl: React.FC<RemoteControlProps> = ({ 
  onNumberClick, onVolumeChange, onChannelChange, onMute, onClose, onToggleFullscreen 
}) => {
  return (
    <div className="fixed right-6 bottom-24 z-[100] w-64 p-6 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800 rounded-[3rem] shadow-2xl animate-in slide-in-from-right-10 duration-500">
      <div className="flex flex-col items-center gap-6">
        {/* Power / Close */}
        <div className="w-full flex justify-between">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500/40 transition-all active:scale-90">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" x2="12" y1="2" y2="12"/></button>
          <button onClick={onToggleFullscreen} className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 transition-all active:scale-90">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
          </button>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {[1,2,3,4,5,6,7,8,9, '*', 0, '#'].map((n) => (
            <button 
              key={n}
              onClick={() => typeof n === 'number' && onNumberClick(n)}
              className="h-12 bg-zinc-800/50 hover:bg-zinc-700 rounded-xl text-lg font-bold transition-all active:scale-95 border border-zinc-700/50"
            >
              {n}
            </button>
          ))}
        </div>

        {/* Rockers */}
        <div className="flex gap-8 w-full justify-center">
          {/* Volume */}
          <div className="flex flex-col items-center gap-2 bg-zinc-800/80 p-2 rounded-2xl border border-zinc-700">
            <button onClick={() => onVolumeChange(5)} className="p-3 text-zinc-300 hover:text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg></button>
            <span className="text-[10px] font-black text-zinc-500">VOL</span>
            <button onClick={() => onVolumeChange(-5)} className="p-3 text-zinc-300 hover:text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/></svg></button>
          </div>
          
          <button onClick={onMute} className="w-12 h-12 self-center bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all active:scale-90">
             <span className="text-[10px] font-black text-white">MUTE</span>
          </button>

          {/* Channel */}
          <div className="flex flex-col items-center gap-2 bg-zinc-800/80 p-2 rounded-2xl border border-zinc-700">
            <button onClick={() => onChannelChange(1)} className="p-3 text-zinc-300 hover:text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg></button>
            <span className="text-[10px] font-black text-zinc-500">CH</span>
            <button onClick={() => onChannelChange(-1)} className="p-3 text-zinc-300 hover:text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg></button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 w-full">
           <button className="flex-1 py-3 bg-zinc-800 rounded-xl text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-700">Guide</button>
           <button className="flex-1 py-3 bg-zinc-800 rounded-xl text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-700">Menu</button>
        </div>
      </div>
    </div>
  );
};

export default RemoteControl;
