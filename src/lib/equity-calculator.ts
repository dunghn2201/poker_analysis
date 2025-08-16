import { Card, SimulationConfig, SimulationResult } from '@/types/poker';
import { 
  getAvailableCards, 
  dealRandomCards, 
  getRankValue,
  cardsEqual
} from './poker-utils';

/**
 * Hand ranking constants
 */
enum HandRank {
  HIGH_CARD = 0,
  PAIR = 1,
  TWO_PAIR = 2,
  THREE_OF_A_KIND = 3,
  STRAIGHT = 4,
  FLUSH = 5,
  FULL_HOUSE = 6,
  FOUR_OF_A_KIND = 7,
  STRAIGHT_FLUSH = 8,
  ROYAL_FLUSH = 9
}

/**
 * Hand evaluation result
 */
interface HandValue {
  rank: HandRank;
  tiebreakers: number[];
}

/**
 * Evaluate a 5-card poker hand
 */
function evaluateHand(cards: Card[]): HandValue {
  if (cards.length !== 5) {
    throw new Error('Hand must contain exactly 5 cards');
  }

  const ranks = cards.map(card => getRankValue(card.rank)).sort((a, b) => b - a);
  const suits = cards.map(card => card.suit);
  
  // Count rank frequencies
  const rankCounts: Record<number, number> = {};
  ranks.forEach(rank => {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });
  
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = suits.every(suit => suit === suits[0]);
  const isStraight = checkStraight(ranks);
  
  // Royal Flush (A-K-Q-J-T suited)
  if (isFlush && isStraight && ranks[0] === 14) {
    return { rank: HandRank.ROYAL_FLUSH, tiebreakers: [] };
  }
  
  // Straight Flush
  if (isFlush && isStraight) {
    return { rank: HandRank.STRAIGHT_FLUSH, tiebreakers: [ranks[0]] };
  }
  
  // Four of a Kind
  if (counts[0] === 4) {
    const quad = Object.keys(rankCounts).find(rank => rankCounts[parseInt(rank)] === 4);
    const kicker = Object.keys(rankCounts).find(rank => rankCounts[parseInt(rank)] === 1);
    return { 
      rank: HandRank.FOUR_OF_A_KIND, 
      tiebreakers: [parseInt(quad!), parseInt(kicker!)] 
    };
  }
  
  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    const trips = Object.keys(rankCounts).find(rank => rankCounts[parseInt(rank)] === 3);
    const pair = Object.keys(rankCounts).find(rank => rankCounts[parseInt(rank)] === 2);
    return { 
      rank: HandRank.FULL_HOUSE, 
      tiebreakers: [parseInt(trips!), parseInt(pair!)] 
    };
  }
  
  // Flush
  if (isFlush) {
    return { rank: HandRank.FLUSH, tiebreakers: ranks };
  }
  
  // Straight
  if (isStraight) {
    return { rank: HandRank.STRAIGHT, tiebreakers: [ranks[0]] };
  }
  
  // Three of a Kind
  if (counts[0] === 3) {
    const trips = Object.keys(rankCounts).find(rank => rankCounts[parseInt(rank)] === 3);
    const kickers = Object.keys(rankCounts)
      .filter(rank => rankCounts[parseInt(rank)] === 1)
      .map(rank => parseInt(rank))
      .sort((a, b) => b - a);
    return { 
      rank: HandRank.THREE_OF_A_KIND, 
      tiebreakers: [parseInt(trips!), ...kickers] 
    };
  }
  
  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Object.keys(rankCounts)
      .filter(rank => rankCounts[parseInt(rank)] === 2)
      .map(rank => parseInt(rank))
      .sort((a, b) => b - a);
    const kicker = Object.keys(rankCounts).find(rank => rankCounts[parseInt(rank)] === 1);
    return { 
      rank: HandRank.TWO_PAIR, 
      tiebreakers: [...pairs, parseInt(kicker!)] 
    };
  }
  
  // Pair
  if (counts[0] === 2) {
    const pair = Object.keys(rankCounts).find(rank => rankCounts[parseInt(rank)] === 2);
    const kickers = Object.keys(rankCounts)
      .filter(rank => rankCounts[parseInt(rank)] === 1)
      .map(rank => parseInt(rank))
      .sort((a, b) => b - a);
    return { 
      rank: HandRank.PAIR, 
      tiebreakers: [parseInt(pair!), ...kickers] 
    };
  }
  
  // High Card
  return { rank: HandRank.HIGH_CARD, tiebreakers: ranks };
}

/**
 * Check if ranks form a straight
 */
function checkStraight(ranks: number[]): boolean {
  const uniqueRanks = [...new Set(ranks)].sort((a, b) => b - a);
  
  if (uniqueRanks.length !== 5) return false;
  
  // Normal straight
  for (let i = 1; i < uniqueRanks.length; i++) {
    if (uniqueRanks[i - 1] - uniqueRanks[i] !== 1) {
      break;
    }
    if (i === 4) return true;
  }
  
  // Wheel straight (A-2-3-4-5)
  if (uniqueRanks[0] === 14 && uniqueRanks[1] === 5 && 
      uniqueRanks[2] === 4 && uniqueRanks[3] === 3 && uniqueRanks[4] === 2) {
    return true;
  }
  
  return false;
}

/**
 * Compare two poker hands
 * Returns: 1 if hand1 wins, -1 if hand2 wins, 0 if tie
 */
function compareHands(hand1: HandValue, hand2: HandValue): number {
  if (hand1.rank > hand2.rank) return 1;
  if (hand1.rank < hand2.rank) return -1;
  
  // Same rank, compare tiebreakers
  for (let i = 0; i < Math.max(hand1.tiebreakers.length, hand2.tiebreakers.length); i++) {
    const tie1 = hand1.tiebreakers[i] || 0;
    const tie2 = hand2.tiebreakers[i] || 0;
    
    if (tie1 > tie2) return 1;
    if (tie1 < tie2) return -1;
  }
  
  return 0;
}

/**
 * Get best 5-card hand from 7 cards
 */
function getBestHand(cards: Card[]): HandValue {
  if (cards.length < 5) {
    throw new Error('Need at least 5 cards to evaluate hand');
  }
  
  if (cards.length === 5) {
    return evaluateHand(cards);
  }
  
  // Generate all 5-card combinations
  const combinations = getCombinations(cards, 5);
  let bestHand = evaluateHand(combinations[0]);
  
  for (let i = 1; i < combinations.length; i++) {
    const currentHand = evaluateHand(combinations[i]);
    if (compareHands(currentHand, bestHand) > 0) {
      bestHand = currentHand;
    }
  }
  
  return bestHand;
}

/**
 * Generate all k-combinations from array
 */
function getCombinations<T>(array: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (array.length === 0) return [];
  
  const [first, ...rest] = array;
  const withFirst = getCombinations(rest, k - 1).map(combo => [first, ...combo]);
  const withoutFirst = getCombinations(rest, k);
  
  return [...withFirst, ...withoutFirst];
}

/**
 * Run Monte Carlo simulation to calculate equity
 */
export function calculateEquity(
  heroCards: [Card, Card],
  board: Card[],
  opponentRanges: [Card, Card][],
  config: SimulationConfig = { iterations: 50000, speed: 'FAST', useWebWorker: false }
): SimulationResult {
  const startTime = Date.now();
  let wins = 0;
  let ties = 0;
  let losses = 0;
  
  const knownCards = [...heroCards, ...board];
  const availableCards = getAvailableCards(knownCards);
  
  for (let i = 0; i < config.iterations; i++) {
    // Complete the board if needed
    const remainingBoardCards = 5 - board.length;
    const completedBoard = remainingBoardCards > 0 
      ? [...board, ...dealRandomCards(remainingBoardCards, knownCards)]
      : board;
    
    // Get hero's best hand
    const heroHand = getBestHand([...heroCards, ...completedBoard]);
    
    // Simulate against random opponent hands
    const opponentCards = opponentRanges.length > 0 
      ? opponentRanges[Math.floor(Math.random() * opponentRanges.length)]
      : dealRandomCards(2, [...knownCards, ...completedBoard]) as [Card, Card];
    
    const opponentHand = getBestHand([...opponentCards, ...completedBoard]);
    
    const result = compareHands(heroHand, opponentHand);
    if (result > 0) wins++;
    else if (result < 0) losses++;
    else ties++;
  }
  
  const timeMs = Date.now() - startTime;
  const equity = (wins + ties / 2) / config.iterations;
  
  return {
    equity,
    wins,
    ties,
    losses,
    iterations: config.iterations,
    timeMs
  };
}

/**
 * Calculate equity against a range of hands
 */
export function calculateEquityVsRange(
  heroCards: [Card, Card],
  board: Card[],
  villainRange: string, // Simplified range string
  config: SimulationConfig = { iterations: 50000, speed: 'FAST', useWebWorker: false }
): SimulationResult {
  // For now, we'll simulate against random hands
  // In a full implementation, you'd parse the range string and generate appropriate hands
  return calculateEquity(heroCards, board, [], config);
}

/**
 * Quick equity calculation with fewer iterations
 */
export function quickEquityCalculation(
  heroCards: [Card, Card],
  board: Card[],
  opponentCount: number = 1
): number {
  const result = calculateEquity(heroCards, board, [], { 
    iterations: 10000, 
    speed: 'FAST', 
    useWebWorker: false 
  });
  
  return result.equity;
}

/**
 * Web Worker wrapper for heavy calculations
 */
export function calculateEquityAsync(
  heroCards: [Card, Card],
  board: Card[],
  opponentRanges: [Card, Card][],
  config: SimulationConfig
): Promise<SimulationResult> {
  return new Promise((resolve) => {
    if (typeof Worker !== 'undefined' && config.useWebWorker) {
      // In a real implementation, you'd create a Web Worker
      // For now, we'll just run it synchronously
      setTimeout(() => {
        const result = calculateEquity(heroCards, board, opponentRanges, config);
        resolve(result);
      }, 0);
    } else {
      const result = calculateEquity(heroCards, board, opponentRanges, config);
      resolve(result);
    }
  });
}
