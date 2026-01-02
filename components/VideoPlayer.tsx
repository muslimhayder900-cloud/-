
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Channel } from '../types';
import SatelliteOSD from './SatelliteOSD';
import RemoteControl from './RemoteControl';

interface VideoPlayerProps {
  channel: Channel;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onMuteToggle: () => void;
  onChannelChange: (delta: number) => void;
  onClose: () => void;
}

declare const Hls: any;

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  channel, volume, isMuted, onVolumeChange, onMuteToggle, onChannelChange, onClose 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOSD, setShowOSD] = useState(false);
  const [showRemote, setShowRemote] = useState(false);
  const [retryKey, setRetryKey] = useState(0); // For forcing re-render/re-mount
  const osdTimer = useRef<number | null>(null);

  const triggerOSD = useCallback(() => {
    setShowOSD(true);
    if (osdTimer.current) window.clearTimeout(osdTimer.current);
    osdTimer.current = window.setTimeout(() => setShowOSD(false), 5000);
  }, []);

  useEffect(() => {
    triggerOSD();
  }, [channel, triggerOSD]);

  useEffect(() => {
    let hls: any;
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsLoading(true);
    video.volume = isMuted ? 0 : volume / 100;

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true, manifestLoadingTimeOut: 10000 });
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.error("Autoplay blocked:", e));
        setIsLoading(false);
      });
      hls.on(Hls.Events.ERROR, (_: any, data: any) => {
        if (data.fatal) {
          setError(data.type === 'NETWORK_ERROR' ? "Satellite Signal Lost" : "Decoding Error");
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url;
      video.addEventListener('loadedmetadata', () => {
        video.play();
        setIsLoading(false);
      });
      video.addEventListener('error', () => {
        setError("Decoding Error");
      });
    }

    return () => { if (hls) hls.destroy(); };
  }, [channel, volume, isMuted, retryKey]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black flex flex-col group overflow-hidden animate-in fade-in duration-500">
      {/* Interaction Layer */}
      {!error && (
        <div 
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={() => {
            if (!showOSD) triggerOSD();
            setShowRemote(!showRemote);
          }}
        ></div>
      )}

      {/* Top Controls Overlay */}
      <div className={`absolute top-0 inset-x-0 p-6 z-20 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 ${showOSD || error ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white backdrop-blur-md border border-white/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex gap-4">
             <div className="px-4 py-2 bg-zinc-900/60 border border-zinc-800 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-zinc-300 tracking-tighter uppercase italic">Live Satellite Feed</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Video */}
      <div className="flex-1 flex items-center justify-center relative bg-zinc-950">
        {isLoading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="animate-pulse"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="m12 12 4 4"/><path d="m12 12-4 4"/><path d="m12 12 4-4"/><path d="m12 12-4-4"/></svg>
              </div>
            </div>
            <p className="mt-6 text-indigo-400 font-bold tracking-widest uppercase text-xs animate-pulse">Syncing Satellite Signal...</p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-30 p-12 text-center animate-in zoom-in-95 duration-300">
             <div className="w-24 h-24 mb-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M4.93 4.93l14.14 14.14"/></svg>
             </div>
             <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Service Unavailable</h3>
             <p className="text-zinc-500 max-w-sm mx-auto text-sm leading-relaxed">{error}. Check antenna connection or server status.</p>
             
             <div className="flex flex-col gap-4 mt-10">
                <button 
                  onClick={() => setRetryKey(k => k + 1)} 
                  className="px-12 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)] active:scale-95"
                >
                  Retry Connection
                </button>
                <button 
                  onClick={onClose} 
                  className="px-12 py-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl font-bold transition-all text-zinc-400"
                >
                  Return Home
                </button>
             </div>
          </div>
        )}

        <video ref={videoRef} className="w-full h-full object-contain shadow-2xl" autoPlay playsInline />
      </div>

      {/* Satellite OSD Component */}
      {!error && (
        <SatelliteOSD 
          channel={channel} 
          visible={showOSD} 
          volume={volume} 
          isMuted={isMuted} 
        />
      )}

      {/* Remote Control Overlay */}
      {showRemote && !error && (
        <RemoteControl 
          onNumberClick={(n) => console.log("Jumping to", n)}
          onVolumeChange={(d) => onVolumeChange(Math.max(0, Math.min(100, volume + d)))}
          onChannelChange={onChannelChange}
          onMute={onMuteToggle}
          onClose={() => setShowRemote(false)}
          onToggleFullscreen={toggleFullscreen}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
