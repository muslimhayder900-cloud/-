
import React from 'react';
import { Channel } from '../types';

interface SatelliteOSDProps {
  channel: Channel;
  visible: boolean;
  volume: number;
  isMuted: boolean;
}

const SatelliteOSD: React.FC<SatelliteOSDProps> = ({ channel, visible, volume, isMuted }) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 p-8 animate-in fade-in slide-in-from-bottom-10 duration-500 z-50 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl shadow-black">
        {/* Top Accent Line */}
        <div className="h-1 bg-gradient-to-r from-indigo-600 via-sky-400 to-indigo-600"></div>
        
        <div className="p-5 flex items-start gap-6">
          {/* Channel Number Box */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 min-w-[100px] flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white">{channel.number.toString().padStart(3, '0')}</span>
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Channel</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white truncate">{channel.name}</h2>
              <div className="flex gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${channel.resolution === '4K' ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                  {channel.resolution || 'HD'}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-500/10 border border-indigo-500/50 text-indigo-400">
                  DTS 5.1
                </span>
              </div>
            </div>

            {/* EPG Info */}
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-100 font-medium truncate flex-1">
                  <span className="text-indigo-400 mr-2 uppercase text-[10px] font-bold">Now:</span> 
                  {channel.epg?.current.title || 'Live Broadcast Content'}
                </span>
                <span className="text-zinc-500 text-xs ml-4">{channel.epg?.current.start} - {channel.epg?.current.end}</span>
              </div>
              
              <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000" 
                  style={{ width: `${channel.epg?.current.progress || 45}%` }}
                ></div>
              </div>

              <div className="flex items-center text-xs text-zinc-500">
                <span className="uppercase font-bold text-[9px] mr-2 text-zinc-600">Next:</span>
                <span className="truncate">{channel.epg?.next.title || 'Upcoming Satellite Feed'}</span>
              </div>
            </div>
          </div>

          {/* Signal & Tech Specs */}
          <div className="w-48 space-y-3 pl-6 border-l border-zinc-800/50">
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                <span>Signal Strength</span>
                <span className="text-zinc-300">92%</span>
              </div>
              <div className="h-1 w-full bg-zinc-900 rounded-full">
                <div className="h-full bg-emerald-500 w-[92%]"></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                <span>Signal Quality</span>
                <span className="text-zinc-300">88%</span>
              </div>
              <div className="h-1 w-full bg-zinc-900 rounded-full">
                <div className="h-full bg-sky-500 w-[88%]"></div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              {isMuted ? (
                <span className="text-red-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></span>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-zinc-500 uppercase text-[8px] font-black">VOL</span>
                  <span className="text-xs font-bold text-zinc-300">{volume}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteOSD;
