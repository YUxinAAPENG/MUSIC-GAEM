
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, LeaderboardEntry, Target, Particle, Song } from './types';
import { SONGS } from './songs';
import { generatePerformanceReview } from './services/geminiService';
import BackgroundVisualizer from './components/BackgroundVisualizer';
import MenuScreen from './components/MenuScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';

const MAX_LIVES = 5;

function App() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  const [gameState, setGameState] = useState<GameState>({
    status: 'menu',
    stats: { score: 0, combo: 0, maxCombo: 0, hits: 0, misses: 0, accuracy: 100, clicks: 0 },
    targets: [],
    lives: MAX_LIVES,
    currentSongId: SONGS[0].id
  });

  const [visualizerIntensity, setVisualizerIntensity] = useState(1);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Game Loop Refs
  const lastTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const targetsRef = useRef<Target[]>([]);
  const animationFrameRef = useRef<number>(0);
  const statsRef = useRef(gameState.stats);
  const livesRef = useRef(MAX_LIVES);
  
  // Audio & Rhythm Refs
  const rhythmIntervalRef = useRef<number | null>(null);
  const melodyIndexRef = useRef<number>(0);
  const nextNoteTimeRef = useRef<number>(0);
  const beatCountRef = useRef<number>(0);

  // Load Leaderboard
  useEffect(() => {
    const saved = localStorage.getItem('neoClickLeaderboard');
    if (saved) setLeaderboard(JSON.parse(saved));
  }, []);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playKick = (time: number) => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    
    gain.gain.setValueAtTime(0.5, time); // Background beat volume
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.5);
  };

  const playSnare = (time: number) => {
    const ctx = getAudioContext();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < output.length; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    
    const noiseEnvelope = ctx.createGain();
    noiseEnvelope.gain.setValueAtTime(0.3, time);
    noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseEnvelope);
    noiseEnvelope.connect(ctx.destination);
    noise.start(time);
  };

  const playMelodyNote = (frequency: number) => {
    const ctx = getAudioContext();
    if(ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Melody sound: Sawtooth for a retro/synth feel
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Envelope
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    // Filter for "Pluck" sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  };

  const startRhythmEngine = (bpm: number) => {
    const ctx = getAudioContext();
    const beatTime = 60 / bpm;
    let nextNoteTime = ctx.currentTime + 0.1;
    let beat = 0;

    // A simple lookahead scheduler
    const schedule = () => {
        while (nextNoteTime < ctx.currentTime + 0.1) {
            // Play Kick on 1 and 3, Snare/Hat on 2 and 4 (Basic Beat)
            if (beat % 2 === 0) {
                playKick(nextNoteTime);
                setVisualizerIntensity(1.5); // Pulse on Kick
                
                // Add a custom event to GameScreen for UI pulse if needed via state or ref
                document.dispatchEvent(new CustomEvent('game-beat', { detail: { beat } }));
            } else {
               playSnare(nextNoteTime);
               setVisualizerIntensity(1.2);
            }
            
            nextNoteTime += beatTime;
            beat++;
            beatCountRef.current = beat;
        }
        rhythmIntervalRef.current = window.setTimeout(schedule, 25);
    };
    schedule();
  };

  const stopRhythmEngine = () => {
    if (rhythmIntervalRef.current) {
        clearTimeout(rhythmIntervalRef.current);
    }
  };

  const endGame = async () => {
    cancelAnimationFrame(animationFrameRef.current);
    stopRhythmEngine();
    
    setGameState(prev => ({ 
        ...prev, 
        status: 'analyzing',
        stats: statsRef.current,
        lives: 0 
    }));

    const comment = await generatePerformanceReview(statsRef.current);
    
    setGameState(prev => ({
        ...prev,
        status: 'gameover',
        aiComment: comment
    }));
  };

  const spawnTarget = (timestamp: number, currentSong: Song) => {
    const id = timestamp;
    const x = 15 + Math.random() * 70; // Keep slightly more central
    const y = 20 + Math.random() * 60;
    
    targetsRef.current.push({
        id,
        x,
        y,
        size: 130,
        maxSize: 130,
        createdAt: timestamp,
        lifeDuration: (60 / currentSong.bpm) * 2000, // 2 beats to click
        color: currentSong.baseColor
    });
  };

  const gameLoop = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    
    const currentSong = SONGS.find(s => s.id === gameState.currentSongId) || SONGS[0];
    const beatDuration = 60000 / currentSong.bpm; // ms per beat

    // Sync spawning to Beat
    // Spawn a target every beat (or half beat depending on difficulty)
    let spawnRate = beatDuration;
    if (currentSong.difficulty === 'HARD') spawnRate = beatDuration / 2;
    
    if (timestamp - lastSpawnTimeRef.current > spawnRate) {
        spawnTarget(timestamp, currentSong);
        lastSpawnTimeRef.current = timestamp;
    }

    // Update Targets
    const currentTime = timestamp;
    const activeTargets: Target[] = [];
    let missDetected = false;

    targetsRef.current.forEach(target => {
        const age = currentTime - target.createdAt;
        const progress = age / target.lifeDuration;
        
        if (progress >= 1) {
            // MISS
            statsRef.current.combo = 0;
            statsRef.current.misses += 1;
            statsRef.current.accuracy = (statsRef.current.hits / (statsRef.current.hits + statsRef.current.misses || 1)) * 100;
            livesRef.current -= 1;
            missDetected = true;
            // When missing, the melody naturally pauses because no click happened
        } else {
            target.size = target.maxSize * (1 - progress);
            activeTargets.push(target);
        }
    });

    targetsRef.current = activeTargets;

    if (missDetected) {
        if (livesRef.current <= 0) {
            endGame();
            return;
        }
    }

    setGameState(prev => ({
        ...prev,
        targets: [...targetsRef.current],
        lives: livesRef.current,
        stats: { ...statsRef.current }
    }));

    lastTimeRef.current = timestamp;
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    targetsRef.current = [];
    statsRef.current = { score: 0, combo: 0, maxCombo: 0, hits: 0, misses: 0, accuracy: 100, clicks: 0 };
    livesRef.current = MAX_LIVES;
    lastTimeRef.current = 0;
    lastSpawnTimeRef.current = 0;
    melodyIndexRef.current = 0;

    const currentSong = SONGS.find(s => s.id === gameState.currentSongId) || SONGS[0];

    setGameState(prev => ({
        ...prev,
        status: 'playing',
        stats: statsRef.current,
        targets: [],
        lives: MAX_LIVES
    }));

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    startRhythmEngine(currentSong.bpm);
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const handleTargetClick = (id: number, x: number, y: number) => {
    const index = targetsRef.current.findIndex(t => t.id === id);
    if (index !== -1) {
        // Remove target
        targetsRef.current.splice(index, 1);
        
        // Stats
        statsRef.current.score += 100 + (statsRef.current.combo * 10);
        statsRef.current.hits += 1;
        statsRef.current.combo += 1;
        statsRef.current.maxCombo = Math.max(statsRef.current.maxCombo, statsRef.current.combo);
        statsRef.current.clicks += 1;
        statsRef.current.accuracy = (statsRef.current.hits / (statsRef.current.hits + statsRef.current.misses)) * 100;

        // PLAY MELODY
        // Get current note
        const currentSong = SONGS.find(s => s.id === gameState.currentSongId) || SONGS[0];
        const noteFreq = currentSong.notes[melodyIndexRef.current % currentSong.notes.length];
        playMelodyNote(noteFreq);
        
        // Advance melody
        melodyIndexRef.current++;

        // Visuals
        setVisualizerIntensity(2.5);
    }
  };

  const handleSaveScore = (name: string) => {
    const newEntry: LeaderboardEntry = {
        name,
        score: gameState.stats.score,
        accuracy: gameState.stats.accuracy,
        date: new Date().toISOString()
    };
    const newBoard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    setLeaderboard(newBoard);
    localStorage.setItem('neoClickLeaderboard', JSON.stringify(newBoard));
  };

  const isHighEnough = leaderboard.length < 10 || gameState.stats.score > (leaderboard[leaderboard.length - 1]?.score || 0);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 text-white select-none">
      
      <BackgroundVisualizer intensity={visualizerIntensity} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-0" />

      {gameState.status === 'menu' ? (
        <MenuScreen 
          onStart={startGame} 
          leaderboard={leaderboard}
          songs={SONGS}
          currentSongId={gameState.currentSongId}
          onSelectSong={(id) => setGameState(prev => ({...prev, currentSongId: id}))}
        />
      ) : gameState.status === 'playing' ? (
        <GameScreen
          score={gameState.stats.score}
          combo={gameState.stats.combo}
          lives={gameState.lives}
          targets={gameState.targets}
          onTargetClick={handleTargetClick}
        />
      ) : (
        <ResultScreen
          stats={gameState.stats}
          aiComment={gameState.aiComment || "加载中..."}
          isAnalyzing={gameState.status === 'analyzing'}
          onRestart={startGame}
          onMenu={() => {
              stopRhythmEngine(); // Ensure sound stops
              setGameState(prev => ({ ...prev, status: 'menu' }));
          }}
          onSaveScore={handleSaveScore}
          isHighEnough={isHighEnough && gameState.stats.score > 0}
        />
      )}
    </div>
  );
}

export default App;
