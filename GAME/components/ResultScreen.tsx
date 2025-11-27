
import React, { useState } from 'react';
import { RefreshCw, Trophy, Home, Save, Music, Activity, Target } from 'lucide-react';
import { GameStats } from '../types';

interface ResultScreenProps {
  stats: GameStats;
  aiComment: string;
  isAnalyzing: boolean;
  onRestart: () => void;
  onMenu: () => void;
  onSaveScore: (name: string) => void;
  isHighEnough: boolean;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ 
  stats, 
  aiComment, 
  isAnalyzing, 
  onRestart, 
  onMenu, 
  onSaveScore, 
  isHighEnough 
}) => {
  const [playerName, setPlayerName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (playerName.trim()) {
      onSaveScore(playerName.trim());
      setIsSaved(true);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="glass-panel p-8 rounded-3xl max-w-2xl w-full shadow-[0_0_50px_rgba(6,182,212,0.3)] border border-white/20 animate-float">
        
        <h2 className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
            演奏结束
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full mb-8"></div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">最终得分</p>
                <p className="text-2xl font-bold text-white font-display">{stats.score.toLocaleString()}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">最大连击</p>
                <p className="text-2xl font-bold text-yellow-400 font-display">x{stats.maxCombo}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">准确率</p>
                <p className={`text-2xl font-bold font-display ${stats.accuracy > 80 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.accuracy.toFixed(1)}%
                </p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">命中/点击</p>
                <p className="text-xl font-bold text-blue-400 font-display">{stats.hits} / {stats.clicks}</p>
            </div>
        </div>

        {/* AI Commentary */}
        <div className="mb-8 p-6 bg-gradient-to-br from-purple-900/40 to-black/40 rounded-xl border border-purple-500/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="flex items-center space-x-2 mb-3">
                <Music className="text-pink-400" size={20} />
                <h3 className="text-sm font-bold text-pink-300 uppercase tracking-widest">制作人评价</h3>
            </div>
            {isAnalyzing ? (
                <div className="flex items-center justify-center space-x-3 py-4">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                </div>
            ) : (
                <p className="text-lg text-white font-medium leading-relaxed italic">
                    "{aiComment}"
                </p>
            )}
        </div>

        {/* Save Score */}
        {isHighEnough && !isSaved && (
          <div className="mb-8 flex flex-col md:flex-row gap-2 animate-pulse-beat">
              <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={12}
                placeholder="在此刻下你的大名..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 font-bold text-center md:text-left"
              />
              <button 
                onClick={handleSave}
                disabled={!playerName.trim()}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>保存记录</span>
              </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
            <button
            onClick={onRestart}
            className="flex-1 py-4 rounded-xl bg-white text-black font-black text-lg uppercase tracking-wider hover:bg-gray-200 transition-transform hover:-translate-y-1 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center space-x-2"
            >
            <RefreshCw size={20} />
            <span>再次挑战</span>
            </button>
            
            <button
            onClick={onMenu}
            className="flex-1 py-4 rounded-xl bg-black/40 text-white font-bold text-lg uppercase tracking-wider border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
            >
            <Home size={20} />
            <span>返回主菜单</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
