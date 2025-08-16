import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  UIState, 
  HandState, 
  AnalysisResult, 
  UIMode, 
  Card, 
  Position, 
  Street,
  OpponentProfile
} from '@/types/poker';

interface PokerStore extends UIState {
  // Actions
  setMode: (mode: UIMode) => void;
  toggleDarkMode: () => void;
  setCurrentHand: (hand: HandState | null) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setAnalyzing: (analyzing: boolean) => void;
  toggleTooltips: () => void;
  
  // Hand building actions
  setHeroCards: (cards: [Card, Card]) => void;
  setBoardCard: (index: number, card: Card | null) => void;
  setPosition: (actor: 'hero' | 'villain', position: Position) => void;
  setStack: (actor: 'hero' | 'villain', stack: number) => void;
  setPot: (pot: number) => void;
  setStreet: (street: Street) => void;
  setOpponentProfile: (profile: OpponentProfile) => void;
  setFoldEquity: (equity: number) => void;
  
  // Hand management
  clearHand: () => void;
  newHand: () => void;
  
  // Additional state
  opponentProfile: OpponentProfile;
  foldEquity: number;
  sizingOptions: number[];
}

const initialHandState: HandState = {
  heroCards: [
    { rank: 'A', suit: 'spades' },
    { rank: 'K', suit: 'hearts' }
  ],
  board: [null, null, null, null, null],
  players: [
    { position: 'CO', stack: 100, isHero: true },
    { position: 'BB', stack: 100 }
  ],
  pot: 3,
  currentBet: 0,
  street: 'PREFLOP',
  actionLog: [],
  smallBlind: 0.5,
  bigBlind: 1
};

export const usePokerStore = create<PokerStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    mode: 'BEGINNER',
    darkMode: false,
    currentHand: initialHandState,
    analysisResult: null,
    isAnalyzing: false,
    showTooltips: true,
    opponentProfile: 'REG',
    foldEquity: 0.35,
    sizingOptions: [0.33, 0.5, 0.75, 1.0],

    // UI Actions
    setMode: (mode) => set({ mode }),
    
    toggleDarkMode: () => set((state) => ({ 
      darkMode: !state.darkMode 
    })),
    
    setCurrentHand: (hand) => set({ currentHand: hand }),
    
    setAnalysisResult: (result) => set({ analysisResult: result }),
    
    setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
    
    toggleTooltips: () => set((state) => ({ 
      showTooltips: !state.showTooltips 
    })),

    // Hand building actions
    setHeroCards: (cards) => set((state) => ({
      currentHand: state.currentHand ? {
        ...state.currentHand,
        heroCards: cards
      } : null
    })),

    setBoardCard: (index, card) => set((state) => {
      if (!state.currentHand) return state;
      
      const newBoard = [...state.currentHand.board];
      newBoard[index] = card;
      
      // Auto-advance street when board cards are set
      let newStreet = state.currentHand.street;
      const filledCards = newBoard.filter(c => c !== null).length;
      
      if (filledCards === 3 && newStreet === 'PREFLOP') newStreet = 'FLOP';
      else if (filledCards === 4 && newStreet === 'FLOP') newStreet = 'TURN';
      else if (filledCards === 5 && newStreet === 'TURN') newStreet = 'RIVER';
      
      return {
        currentHand: {
          ...state.currentHand,
          board: newBoard,
          street: newStreet
        }
      };
    }),

    setPosition: (actor, position) => set((state) => {
      if (!state.currentHand) return state;
      
      const newPlayers = state.currentHand.players.map(player => {
        if ((actor === 'hero' && player.isHero) || (actor === 'villain' && !player.isHero)) {
          return { ...player, position };
        }
        return player;
      });
      
      return {
        currentHand: {
          ...state.currentHand,
          players: newPlayers
        }
      };
    }),

    setStack: (actor, stack) => set((state) => {
      if (!state.currentHand) return state;
      
      const newPlayers = state.currentHand.players.map(player => {
        if ((actor === 'hero' && player.isHero) || (actor === 'villain' && !player.isHero)) {
          return { ...player, stack };
        }
        return player;
      });
      
      return {
        currentHand: {
          ...state.currentHand,
          players: newPlayers
        }
      };
    }),

    setPot: (pot) => set((state) => ({
      currentHand: state.currentHand ? {
        ...state.currentHand,
        pot
      } : null
    })),

    setStreet: (street) => set((state) => ({
      currentHand: state.currentHand ? {
        ...state.currentHand,
        street
      } : null
    })),

    setOpponentProfile: (profile) => set({ opponentProfile: profile }),
    
    setFoldEquity: (equity) => set({ foldEquity: equity }),

    // Hand management
    clearHand: () => set({
      currentHand: null,
      analysisResult: null
    }),

    newHand: () => set({
      currentHand: { ...initialHandState },
      analysisResult: null
    })
  }))
);

// Selectors for computed values
export const useCurrentAnalysisInput = () => {
  return usePokerStore((state) => {
    if (!state.currentHand) return null;
    
    const hero = state.currentHand.players.find(p => p.isHero);
    const villain = state.currentHand.players.find(p => !p.isHero);
    
    if (!hero || !villain) return null;
    
    return {
      heroCards: state.currentHand.heroCards,
      board: state.currentHand.board,
      positions: {
        hero: hero.position,
        villain: villain.position
      },
      stacksBB: {
        hero: hero.stack,
        villain: villain.stack
      },
      pot: state.currentHand.pot,
      street: state.currentHand.street,
      actionLog: state.currentHand.actionLog,
      opponentProfile: state.opponentProfile,
      assumptions: {
        foldEquity: state.foldEquity,
        sizingOptions: state.sizingOptions
      }
    };
  });
};

// Persist settings to localStorage
if (typeof window !== 'undefined') {
  usePokerStore.subscribe(
    (state) => ({
      mode: state.mode,
      darkMode: state.darkMode,
      showTooltips: state.showTooltips,
      opponentProfile: state.opponentProfile,
      foldEquity: state.foldEquity
    }),
    (settings) => {
      localStorage.setItem('poker-app-settings', JSON.stringify(settings));
    }
  );

  // Load settings from localStorage
  const savedSettings = localStorage.getItem('poker-app-settings');
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      usePokerStore.setState(settings);
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
  }
}
