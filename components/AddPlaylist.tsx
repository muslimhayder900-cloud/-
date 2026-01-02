
import React, { useState } from 'react';
import { fetchAndParsePlaylist } from '../services/m3uParser';
import { Playlist } from '../types';

interface AddPlaylistProps {
  onAdd: (playlist: Playlist) => void;
  onCancel: () => void;
}

const AddPlaylist: React.FC<AddPlaylistProps> = ({ onAdd, onCancel }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !name) return;

    setLoading(true);
    setError(null);

    try {
      const channels = await fetchAndParsePlaylist(url);
      if (channels.length === 0) throw new Error('No channels found in playlist');
      
      const newPlaylist: Playlist = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        url,
        channels,
        lastUpdated: Date.now(),
      };
      
      onAdd(newPlaylist);
    } catch (err) {
      setError('Failed to fetch or parse playlist. Ensure the URL is valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/10">
        <div className="h-1.5 bg-gradient-to-r from-indigo-600 to-sky-400"></div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Manual Tuning</h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Add Custom Transponder Link</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Fleet Name</label>
              <input
                type="text"
                required
                placeholder="e.g. My Arabic Pack"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">M3U / M3U8 URL</label>
              <input
                type="url"
                required
                placeholder="https://example.com/playlist.m3u"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-700"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] font-bold text-red-400 text-center animate-shake">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-2xl font-black uppercase italic tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Synchronize Fleet'
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-black uppercase italic tracking-widest transition-all text-zinc-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlaylist;
