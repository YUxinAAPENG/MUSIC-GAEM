
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Target } from '../types';
import { Heart, Crosshair, Keyboard } from 'lucide-react';

interface GameScreenProps {
  score: number;
  combo: number;
  lives: number;
  targets: Target[];
  onTargetClick: (id: number, x: number, y: number) => void;
  onMiss?: (id: number) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  score,
  combo,
  lives,
  targets,
  onTargetClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef({ x: 0, y: 0 }); // Use ref for latest value in event listeners
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 }); // State for rendering
  const [clickEffect, setClickEffect] = useState<{x: number, y: number, id: number} | null>(null);
  const [beatScale, setBeatScale] = useState(1);
  const [keyActive, setKeyActive] = useState<{z: boolean, x: boolean}>({ z: false, x: false });

  // Custom cursor logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keyboard Interaction Logic (Z / X)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      
      const isZ = e.code === 'KeyZ';
      const isX = e.code === 'KeyX';

      if (isZ || isX) {
        setKeyActive(prev => ({ ...prev, z: isZ ? true : prev.z, x: isX ? true : prev.x }));
        
        // Trigger visual effect
        setClickEffect({ x: cursorRef.current.x, y: cursorRef.current.y, id: Date.now() });
        setTimeout(() => setClickEffect(null), 150);

        // Manual Hit Testing
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          
          // Find if cursor is over any target
          // We iterate through targets to check collision
          // Since targets are overlapping, we might want to prioritize the oldest one (index 0)
          // But usually we just hit the one under cursor.
          const hitTarget = targets.find(target => {
            const targetPixelX = rect.left + (target.x / 100) * rect.width;
            const targetPixelY = rect.top + (target.y / 100) * rect.height;
            const radius = target.maxSize / 2; // Hitbox is the full size
            
            // Simple circle collision
            const dx = cursorRef.current.x - targetPixelX;
            const dy = cursorRef.current.y - targetPixelY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            return dist <= radius;
          });

          if (hitTarget) {
            onTargetClick(hitTarget.id, cursorRef.current.x, cursorRef.current.y);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
       if (e.code === 'KeyZ') setKeyActive(prev => ({ ...prev, z: false }));
       if (e.code === 'KeyX') setKeyActive(prev => ({ ...prev, x: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [targets, onTargetClick]);

  // Listen for beats from App.tsx
  useEffect(() => {
      const handleBeat = () => {
          setBeatScale(1.02);
          setTimeout(() => setBeatScale(1), 100);
      };
      document.addEventListener('game-beat', handleBeat);
      return () => document.removeEventListener('game-beat', handleBeat);
  }, []);

  const handleContainerClick = (e: React.MouseEvent) => {
    setClickEffect({ x: e.clientX, y: e.clientY, id: Date.now() });
    setTimeout(() => setClickEffect(null), 300);
  };

  return (
    <div 
        ref={containerRef}
        className="relative w-full h-full cursor-none overflow-hidden select-none transition-transform duration-100 ease-out"
        style={{ transform: `scale(${beatScale})` }}
        onClick={handleContainerClick}
    >
        {/* HUD */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-20">
            <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">SCORE</p>
                <h2 className="text-4xl font-display font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                    {score.toLocaleString()}
                </h2>
                <div className="flex items-center space-x-2 mt-2 text-gray-400 text-xs font-mono border border-white/10 bg-black/30 rounded px-2 py-1 inline-block">
                  <Keyboard size={12} />
                  <span>按 Z / X 键点击</span>
                </div>
            </div>

            <div className="flex flex-col items-center">
                 {combo > 5 && (
                     <div className="animate-bounce">
                         <span className="text-yellow-400 font-black italic text-4xl drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
                             {combo}x COMBO!
                         </span>
                     </div>
                 )}
            </div>

            <div className="flex items-center space-x-2">
                {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className={`h-2 w-8 rounded-full transition-all duration-300 ${i < lives ? "bg-cyan-400 shadow-[0_0_10px_#22d3ee]" : "bg-gray-800"}`} 
                    />
                ))}
            </div>
        </div>

        {/* Keyboard Indicators */}
        <div className="absolute bottom-8 right-8 flex space-x-4 pointer-events-none z-20 opacity-50">
             <div className={`w-12 h-12 rounded border-2 flex items-center justify-center font-bold text-xl transition-all ${keyActive.z ? 'bg-cyan-500 border-cyan-400 scale-110 text-white shadow-[0_0_15px_rgba(6,182,212,0.8)]' : 'border-white/20 text-gray-500'}`}>Z</div>
             <div className={`w-12 h-12 rounded border-2 flex items-center justify-center font-bold text-xl transition-all ${keyActive.x ? 'bg-cyan-500 border-cyan-400 scale-110 text-white shadow-[0_0_15px_rgba(6,182,212,0.8)]' : 'border-white/20 text-gray-500'}`}>X</div>
        </div>

        {/* Play Area */}
        {targets.map((target) => {
            const progress = (target.maxSize - target.size) / target.maxSize;
            
            return (
                <div
                    key={target.id}
                    className="absolute rounded-full flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 touch-manipulation"
                    style={{
                        left: `${target.x}%`,
                        top: `${target.y}%`,
                        width: `${target.maxSize}px`,
                        height: `${target.maxSize}px`,
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        onTargetClick(target.id, e.clientX, e.clientY);
                    }}
                >
                    {/* Outer Ring (Timer) */}
                    <div 
                        className="absolute rounded-full border-2 border-white/30"
                        style={{
                            width: `${target.size}px`,
                            height: `${target.size}px`,
                            borderColor: target.color,
                            boxShadow: `0 0 15px ${target.color}`,
                        }}
                    />
                    
                    {/* Core */}
                    <div 
                        className="rounded-full w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/50 flex items-center justify-center transition-transform active:scale-90"
                        style={{ backgroundColor: `${target.color}40` }}
                    >
                        <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_10px_white]" />
                    </div>
                </div>
            );
        })}

        {/* Click Ripple Effect */}
        {clickEffect && (
            <div 
                className="absolute w-12 h-12 border-2 border-cyan-300 rounded-full animate-ping pointer-events-none z-30"
                style={{ left: clickEffect.x - 24, top: clickEffect.y - 24 }}
            />
        )}

        {/* Custom Cursor */}
        <div 
            className="fixed pointer-events-none z-50 mix-blend-screen"
            style={{ 
                left: cursorPos.x, 
                top: cursorPos.y,
                transform: 'translate(-50%, -50%)'
            }}
        >
            <div className="relative">
                <Crosshair className={`text-cyan-400 ${keyActive.z || keyActive.x ? 'scale-75' : 'scale-100'} transition-transform duration-100`} size={32} />
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>
        </div>
        
        <div 
            className="fixed pointer-events-none z-40 w-8 h-8 bg-cyan-500/20 rounded-full blur-md transition-all duration-75 ease-out"
             style={{ 
                left: cursorPos.x, 
                top: cursorPos.y,
                transform: 'translate(-50%, -50%)'
            }}
        />
    </div>
  );
};

export default GameScreen;
