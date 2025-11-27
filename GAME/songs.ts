
import { Song } from "./types";

// Helper for note frequencies
const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50
};

export const SONGS: Song[] = [
  {
    id: 'ode_to_joy',
    title: 'Digital Ode',
    artist: 'Beethoven (Remix)',
    bpm: 90, // Reduced from 120
    difficulty: 'EASY',
    baseColor: '#22d3ee', // Cyan
    notes: [
      NOTE.E4, NOTE.E4, NOTE.F4, NOTE.G4, NOTE.G4, NOTE.F4, NOTE.E4, NOTE.D4,
      NOTE.C4, NOTE.C4, NOTE.D4, NOTE.E4, NOTE.E4, NOTE.D4, NOTE.D4,
      NOTE.E4, NOTE.E4, NOTE.F4, NOTE.G4, NOTE.G4, NOTE.F4, NOTE.E4, NOTE.D4,
      NOTE.C4, NOTE.C4, NOTE.D4, NOTE.E4, NOTE.D4, NOTE.C4, NOTE.C4,
      NOTE.D4, NOTE.D4, NOTE.E4, NOTE.C4, NOTE.D4, NOTE.E4, NOTE.F4, NOTE.E4, NOTE.C4,
      NOTE.D4, NOTE.E4, NOTE.F4, NOTE.E4, NOTE.D4, NOTE.C4, NOTE.D4, NOTE.G3,
    ]
  },
  {
    id: 'jasmine',
    title: 'Cyber Jasmine',
    artist: 'Traditional',
    bpm: 110, // Reduced from 140
    difficulty: 'NORMAL',
    baseColor: '#ec4899', // Pink
    notes: [
      NOTE.E4, NOTE.E4, NOTE.G4, NOTE.A4, NOTE.C5, NOTE.C5, NOTE.A4, NOTE.G4,
      NOTE.G4, NOTE.A4, NOTE.C5, NOTE.G4, NOTE.A4, NOTE.G4, NOTE.E4, NOTE.D4,
      NOTE.E4, NOTE.G4, NOTE.E4, NOTE.D4, NOTE.C4, NOTE.A3, NOTE.D4, NOTE.E4,
      NOTE.C4, NOTE.D4, NOTE.E4, NOTE.G4, NOTE.A4, NOTE.C5, NOTE.A4, NOTE.G4,
    ]
  },
  {
    id: 'neon_pulse',
    title: 'Neon Pulse',
    artist: 'System',
    bpm: 135, // Reduced from 160
    difficulty: 'HARD',
    baseColor: '#a855f7', // Purple
    notes: [
      NOTE.A3, NOTE.C4, NOTE.E4, NOTE.A4, NOTE.E4, NOTE.C4, NOTE.A3, NOTE.C4,
      NOTE.G3, NOTE.B3, NOTE.D4, NOTE.G4, NOTE.D4, NOTE.B3, NOTE.G3, NOTE.B3,
      NOTE.F3, NOTE.A3, NOTE.C4, NOTE.F4, NOTE.C4, NOTE.A3, NOTE.F3, NOTE.A3,
      NOTE.E3, NOTE.G3, NOTE.B3, NOTE.E4, NOTE.B3, NOTE.G3, NOTE.E3, NOTE.G3,
      NOTE.A3, NOTE.A4, NOTE.G4, NOTE.E4, NOTE.D4, NOTE.C4, NOTE.D4, NOTE.E4,
    ]
  }
];
