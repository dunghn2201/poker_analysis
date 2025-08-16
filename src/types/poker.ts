// Card types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

// Position types
export type Position = 'UTG' | 'UTG+1' | 'MP' | 'MP+1' | 'CO' | 'BTN' | 'SB' | 'BB';

// Street types
export type Street = 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER';

// Action types
export type ActionType = 'FOLD' | 'CHECK' | 'CALL' | 'BET' | 'RAISE' | 'ALL_IN';

export interface Action {
  street: Street;
  actor: Position | 'HERO' | 'VILLAIN';
  action: ActionType;
  size?: number; // in BB or actual amount
  timestamp?: Date;
}

// Player types
export interface Player {
  position: Position;
  stack: number; // in BB
  isHero?: boolean;
}

// Hand state
export interface HandState {
  heroCards: [Card, Card];
  board: (Card | null)[]; // 5 cards, null for unknown
  players: Player[];
  pot: number; // in BB
  currentBet: number; // in BB
  street: Street;
  actionLog: Action[];
  smallBlind: number;
  bigBlind: number;
}

// Opponent profile types
export type OpponentProfile = 'NIT' | 'REG' | 'LOOSE' | 'WHALE';

// Analysis types
export interface AnalysisInput {
  heroCards: [Card, Card];
  board: (Card | null)[];
  positions: {
    hero: Position;
    villain: Position;
  };
  stacksBB: {
    hero: number;
    villain: number;
  };
  pot: number;
  street: Street;
  actionLog: Action[];
  opponentProfile: OpponentProfile;
  assumptions: {
    foldEquity: number;
    sizingOptions: number[];
  };
}

export interface ActionRecommendation {
  action: ActionType;
  size?: number;
  score: number;
  rationale: string[];
}

export interface HandMetrics {
  equity: number;
  potOdds: number;
  requiredEquity: number;
  spr: number; // Stack-to-Pot Ratio
  ev: Record<string, number>; // Expected Value for different actions
}

export interface RangeData {
  hero: string;
  villain: string;
}

export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface LeakDetection {
  issue: string;
  fix: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AnalysisResult {
  recommendations: ActionRecommendation[];
  metrics: HandMetrics;
  ranges: RangeData;
  confidence: ConfidenceLevel;
  leaks: LeakDetection[];
}

// UI State types
export type UIMode = 'BEGINNER' | 'PRO';

export interface UIState {
  mode: UIMode;
  darkMode: boolean;
  currentHand: HandState | null;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  showTooltips: boolean;
}

// Glossary types
export interface GlossaryTerm {
  term: string;
  vietnamese: string;
  english: string;
  example: string;
  category: 'ACTION' | 'CONCEPT' | 'STRATEGY' | 'MATH';
}

// Monte Carlo simulation types
export interface SimulationConfig {
  iterations: number;
  speed: 'FAST' | 'ACCURATE';
  useWebWorker: boolean;
}

export interface SimulationResult {
  equity: number;
  wins: number;
  ties: number;
  losses: number;
  iterations: number;
  timeMs: number;
}

// Board texture analysis
export interface BoardTexture {
  dryness: 'DRY' | 'WET' | 'VERY_WET';
  paired: boolean;
  monotone: boolean;
  rainbow: boolean;
  connected: boolean;
  highCards: number;
  drawHeavy: boolean;
}

// Range construction
export interface RangeConstruction {
  valueHands: string[];
  bluffHands: string[];
  bluffCatchers: string[];
  folds: string[];
}

// Hand report types
export interface HandReport {
  id: string;
  title: string;
  handState: HandState;
  analysis: AnalysisResult;
  notes: string;
  createdAt: Date;
  tags: string[];
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
