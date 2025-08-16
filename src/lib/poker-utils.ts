import { Card, Suit, Rank } from '@/types/poker';

/**
 * Convert card to string representation
 */
export function cardToString(card: Card): string {
  return `${card.rank}${card.suit[0].toLowerCase()}`;
}

/**
 * Parse card from string (e.g., "As", "Kh", "7c", "2d")
 */
export function stringToCard(str: string): Card | null {
  if (str.length !== 2) return null;
  
  const rank = str[0].toUpperCase() as Rank;
  const suitChar = str[1].toLowerCase();
  
  const suitMap: Record<string, Suit> = {
    'h': 'hearts',
    'd': 'diamonds',
    'c': 'clubs',
    's': 'spades'
  };
  
  const suit = suitMap[suitChar];
  if (!suit) return null;
  
  const validRanks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  if (!validRanks.includes(rank)) return null;
  
  return { rank, suit };
}

/**
 * Get numeric value of a rank for comparison
 */
export function getRankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return values[rank];
}

/**
 * Get all possible cards in a deck
 */
export function getFullDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

/**
 * Remove known cards from deck
 */
export function getAvailableCards(knownCards: Card[]): Card[] {
  const fullDeck = getFullDeck();
  const knownCardStrings = knownCards.map(cardToString);
  
  return fullDeck.filter(card => 
    !knownCardStrings.includes(cardToString(card))
  );
}

/**
 * Shuffle array in place using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deal random cards from available deck
 */
export function dealRandomCards(count: number, excludeCards: Card[] = []): Card[] {
  const availableCards = getAvailableCards(excludeCards);
  const shuffled = shuffleArray(availableCards);
  return shuffled.slice(0, count);
}

/**
 * Check if two cards are the same
 */
export function cardsEqual(card1: Card, card2: Card): boolean {
  return card1.rank === card2.rank && card1.suit === card2.suit;
}

/**
 * Format card for display with suit symbols
 */
export function formatCardDisplay(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    'hearts': '♥',
    'diamonds': '♦',
    'clubs': '♣',
    'spades': '♠'
  };
  
  return `${card.rank}${suitSymbols[card.suit]}`;
}

/**
 * Get CSS classes for card suit coloring
 */
export function getCardClasses(card: Card): string {
  const baseClasses = 'card';
  const suitClass = card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-black';
  return `${baseClasses} ${suitClass}`;
}

/**
 * Check if board is paired
 */
export function isBoardPaired(board: Card[]): boolean {
  const ranks = board.map(card => card.rank);
  const rankCounts = ranks.reduce((acc, rank) => {
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {} as Record<Rank, number>);
  
  return Object.values(rankCounts).some(count => count >= 2);
}

/**
 * Check if board is monotone (all same suit)
 */
export function isBoardMonotone(board: Card[]): boolean {
  if (board.length < 3) return false;
  const firstSuit = board[0].suit;
  return board.every(card => card.suit === firstSuit);
}

/**
 * Check if board is rainbow (all different suits)
 */
export function isBoardRainbow(board: Card[]): boolean {
  if (board.length < 3) return false;
  const suits = new Set(board.map(card => card.suit));
  return suits.size === board.length;
}

/**
 * Check if board is connected (straight possibilities)
 */
export function isBoardConnected(board: Card[]): boolean {
  if (board.length < 3) return false;
  
  const ranks = board.map(card => getRankValue(card.rank)).sort((a, b) => a - b);
  
  // Check for gaps of 1 or 2
  for (let i = 1; i < ranks.length; i++) {
    const gap = ranks[i] - ranks[i - 1];
    if (gap <= 2) return true;
  }
  
  // Check for wheel possibility (A-2-3-4-5)
  const hasAce = board.some(card => card.rank === 'A');
  const hasLowCards = board.some(card => getRankValue(card.rank) <= 5);
  
  return hasAce && hasLowCards;
}

/**
 * Count high cards (T, J, Q, K, A) on board
 */
export function countHighCards(board: Card[]): number {
  return board.filter(card => getRankValue(card.rank) >= 10).length;
}

/**
 * Generate a range string for display (simplified)
 */
export function generateRangeString(percentage: number): string {
  // This is a simplified range representation
  // In a real implementation, you'd have actual range charts
  if (percentage >= 80) return 'AA-22, AKo-A2o, AKs-A2s, KQo-K2o, KQs-K2s, ...';
  if (percentage >= 60) return 'AA-77, AKo-A9o, AKs-A5s, KQo-KTo, KQs-K9s, ...';
  if (percentage >= 40) return 'AA-99, AKo-ATo, AKs-A9s, KQo-KJo, KQs-KTs, ...';
  if (percentage >= 20) return 'AA-JJ, AKo-AQo, AKs-AJs, KQo, KQs-KJs, ...';
  if (percentage >= 10) return 'AA-QQ, AKo-AKo, AKs-AQs, KQs, ...';
  return 'AA-KK, AKs, ...';
}

/**
 * Calculate pot odds
 */
export function calculatePotOdds(callSize: number, potSize: number): number {
  return callSize / (potSize + callSize);
}

/**
 * Calculate required equity for a call
 */
export function calculateRequiredEquity(callSize: number, potSize: number): number {
  return calculatePotOdds(callSize, potSize);
}

/**
 * Calculate Stack-to-Pot Ratio
 */
export function calculateSPR(stackSize: number, potSize: number): number {
  return stackSize / potSize;
}

/**
 * Calculate expected value for a call
 */
export function calculateCallEV(equity: number, potSize: number, callSize: number): number {
  return equity * (potSize + callSize) - callSize;
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format number as big blinds
 */
export function formatBigBlinds(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}BB`;
}

/**
 * Generate pseudo-random seed for consistent results
 */
export function generateSeed(): number {
  return Math.floor(Math.random() * 1000000);
}
