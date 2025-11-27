
import React from 'react';
import { MousePointer2, Play, Trophy, Activity, Zap, Music2, ChevronRight, ChevronLeft } from 'lucide-react';
import { LeaderboardEntry, Song } from '../types';

interface MenuScreenProps {
  onStart: () => void;
  leaderboard: LeaderboardEntry[];
  songs: Song[];
  currentSongId: string;
  onSelectSong: (id: string) => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ 
  onStart, 
  leaderboard, 
  songs, 
  currentSongId, 
  onSelectSong 
}) => {
  const currentSongIndex = songs.findIndex(s => s.id === currentSongId);
  const currentSong = songs[currentSongIndex];

  const nextSong = () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    onSelectSong(songs[nextIndex].id);
  };

  const prevSong = () => {
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    onSelectSong(songs[prevIndex].id);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center p-6 overflow-y-auto">
      <div className="mb-6 animate-float mt-10 md:mt-0">
        <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)] mb-4 mx-auto">
          <Music2 size={40} className="text-white" />
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 neon-text">
          NEO<br />RHYTHM
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        {/* Main Action Panel */}
        <div className="glass-panel p-6 rounded-2xl flex-1 shadow-2xl border-t border-white/20 flex flex-col relative overflow-hidden">
          
          {/* Song Selector */}
          <div className="mb-8 relative z-10">
            <h3 className="text-gray-400 text-xs tracking-widest uppercase mb-4">选择你的乐章</h3>
            <div className="flex items-center justify-between bg-black/30 rounded-xl p-2 border border-white/10">
              <button onClick={prevSong} className="p-3 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronLeft className="text-gray-300" />
              </button>
              
              <div className="flex-1 px-4">
                <div className="text-xs font-bold px-2 py-0.5 rounded bg-white/10 inline-block mb-1 text-cyan-300">
                  {currentSong.difficulty}
                </div>
                <h2 className="text-2xl font-bold text-white font-display mb-1">{currentSong.title}</h2>
                <p className="text-sm text-gray-400">{currentSong.artist} • {currentSong.bpm} BPM</p>
              </div>

              <button onClick={nextSong} className="p-3 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronRight className="text-gray-300" />
              </button>
            </div>
          </div>

          <p className="text-gray-300 mb-6 leading-relaxed text-sm">
            点击出现的<span className="text-cyan-400 font-bold">光圈</span>来演奏旋律。<br/>
            跟随背景鼓点的<span className="text-purple-400 font-bold">律动</span>。
          </p>

          <button
            onClick={onStart}
            className="w-full group relative overflow-hidden rounded-xl bg-white p-5 transition-all duration-300 hover:scale-105 active:scale-95 mt-auto"
            style={{ boxShadow: `0 0 20px ${currentSong.baseColor}60` }}
          >
            <div 
              className="absolute inset-0 transition-transform duration-300 group-hover:scale-110 opacity-90"
              style={{ background: `linear-gradient(to right, ${currentSong.baseColor}, #3b82f6)` }}
            ></div>
            <div className="relative flex items-center justify-center space-x-3">
              <Play className="text-white fill-current" />
              <span className="text-2xl font-bold text-white tracking-wider">开始演奏</span>
            </div>
          </button>
        </div>

        {/* Leaderboard Panel */}
        <div className="glass-panel p-6 rounded-2xl w-full md:w-80 shadow-2xl border-t border-white/20 flex flex-col h-full max-h-[400px]">
          <div className="flex items-center space-x-2 mb-4 border-b border-white/10 pb-2">
            <Trophy className="text-yellow-400" size={20} />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">全球精英</h3>
          </div>
          
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {leaderboard.length === 0 ? (
              <div className="text-gray-500 text-center py-8">暂无记录<br/>虚位以待</div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={index} className="flex flex-col bg-white/5 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className={`
                          w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold
                          ${index === 0 ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'}
                        `}>
                          {index + 1}
                        </div>
                        <span className="font-bold text-sm text-white truncate max-w-[80px]" title={entry.name}>
                          {entry.name}
                        </span>
                      </div>
                      <span className="text-cyan-400 font-display font-bold">{entry.score.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;
