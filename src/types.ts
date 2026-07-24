export type CoreMode = 'TEMPORAL' | 'NEURAL' | 'AESTHETIC' | 'ASTRAL';

export interface CustomizerConfig {
  material: 'titanium' | 'obsidian' | 'stellar' | 'polymer';
  laserColor: string; // hex
  laserName: string;
  frequency: number; // GHz, e.g. 1.0 to 12.0
  syncRate: number; // %, e.g. 0 to 100
  dilationFactor: number; // e.g. 1.0 to 8.0
  rotationSpeed: number; // scale multiplier
  particleCount: number; // density
}

export interface SpecDetail {
  id: string;
  title: string;
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  extendedText: string;
}

export type ActiveOverlay = 'none' | 'chronos' | 'neural' | 'aesthetic' | 'astral' | 'checkout' | 'about' | 'feedback';
