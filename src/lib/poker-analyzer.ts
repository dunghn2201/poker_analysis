import { 
  AnalysisInput, 
  AnalysisResult, 
  ActionRecommendation, 
  HandMetrics, 
  LeakDetection,
  ConfidenceLevel,
  BoardTexture,
  OpponentProfile,
  Street,
  ActionType
} from '@/types/poker';
import { calculateEquity, quickEquityCalculation } from './equity-calculator';
import { 
  calculatePotOdds, 
  calculateRequiredEquity, 
  calculateSPR,
  calculateCallEV,
  isBoardPaired,
  isBoardMonotone,
  isBoardConnected,
  countHighCards,
  generateRangeString
} from './poker-utils';

/**
 * Main poker analysis engine
 */
export class PokerAnalyzer {
  /**
   * Analyze a poker hand and provide recommendations
   */
  static async analyzeHand(input: AnalysisInput): Promise<AnalysisResult> {
    // Calculate basic metrics
    const metrics = await this.calculateMetrics(input);
    
    // Generate action recommendations
    const recommendations = this.generateRecommendations(input, metrics);
    
    // Analyze board texture and ranges
    const ranges = this.analyzeRanges(input);
    
    // Determine confidence level
    const confidence = this.determineConfidence(input, metrics);
    
    // Detect common leaks
    const leaks = this.detectLeaks(input, metrics, recommendations);
    
    return {
      recommendations,
      metrics,
      ranges,
      confidence,
      leaks
    };
  }

  /**
   * Calculate hand metrics (equity, pot odds, EV, etc.)
   */
  private static async calculateMetrics(input: AnalysisInput): Promise<HandMetrics> {
    const { heroCards, board, pot, stacksBB } = input;
    
    // Calculate equity against opponent range
    const equity = quickEquityCalculation(heroCards, board.filter(c => c !== null) as any[], 1);
    
    // Calculate pot odds for a call (assuming current bet)
    const currentBet = this.estimateCurrentBet(input);
    const potOdds = calculatePotOdds(currentBet, pot);
    const requiredEquity = calculateRequiredEquity(currentBet, pot);
    
    // Calculate SPR
    const spr = calculateSPR(stacksBB.hero, pot);
    
    // Calculate EV for different actions
    const ev = this.calculateActionEVs(input, equity);
    
    return {
      equity,
      potOdds,
      requiredEquity,
      spr,
      ev
    };
  }

  /**
   * Generate action recommendations with scores
   */
  private static generateRecommendations(
    input: AnalysisInput, 
    metrics: HandMetrics
  ): ActionRecommendation[] {
    const recommendations: ActionRecommendation[] = [];
    const { street, assumptions } = input;
    
    // Fold recommendation
    const foldRec = this.evaluateFold(input, metrics);
    if (foldRec) recommendations.push(foldRec);
    
    // Check/Call recommendation
    const checkCallRec = this.evaluateCheckCall(input, metrics);
    if (checkCallRec) recommendations.push(checkCallRec);
    
    // Bet/Raise recommendations
    for (const size of assumptions.sizingOptions) {
      const betRec = this.evaluateBet(input, metrics, size);
      if (betRec) recommendations.push(betRec);
    }
    
    // Sort by score (highest first)
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Evaluate fold action
   */
  private static evaluateFold(input: AnalysisInput, metrics: HandMetrics): ActionRecommendation | null {
    const { equity, requiredEquity } = metrics;
    
    let score = 0;
    const rationale: string[] = [];
    
    if (equity < requiredEquity - 0.1) {
      score = 0.8;
      rationale.push('Equity significantly below required');
      rationale.push(`Need ${(requiredEquity * 100).toFixed(1)}%, have ${(equity * 100).toFixed(1)}%`);
    } else if (equity < requiredEquity) {
      score = 0.4;
      rationale.push('Equity slightly below required');
    } else {
      score = 0.1;
      rationale.push('Positive equity call');
    }
    
    return {
      action: 'FOLD',
      score,
      rationale
    };
  }

  /**
   * Evaluate check/call action
   */
  private static evaluateCheckCall(input: AnalysisInput, metrics: HandMetrics): ActionRecommendation | null {
    const { equity, requiredEquity, ev } = metrics;
    const { street } = input;
    
    let score = 0;
    const rationale: string[] = [];
    
    if (equity >= requiredEquity) {
      score = Math.min(0.8, equity / requiredEquity * 0.4);
      rationale.push('Positive equity call');
      rationale.push(`EV: ${ev.call?.toFixed(2) || 0}BB`);
    }
    
    if (street !== 'RIVER') {
      score += 0.1;
      rationale.push('Pot control with draws');
    }
    
    const action = this.getCurrentAction(input) === 'CHECK' ? 'CHECK' : 'CALL';
    
    return {
      action: action as ActionType,
      score,
      rationale
    };
  }

  /**
   * Evaluate bet/raise action
   */
  private static evaluateBet(
    input: AnalysisInput, 
    metrics: HandMetrics, 
    size: number
  ): ActionRecommendation | null {
    const { equity, spr } = metrics;
    const { assumptions, board } = input;
    
    let score = 0;
    const rationale: string[] = [];
    
    // Value betting
    if (equity > 0.6) {
      score += 0.5;
      rationale.push('Strong hand for value');
    }
    
    // Bluffing with fold equity
    if (equity < 0.4 && assumptions.foldEquity > 0.3) {
      score += assumptions.foldEquity * 0.6;
      rationale.push(`Fold equity: ${(assumptions.foldEquity * 100).toFixed(0)}%`);
    }
    
    // Board texture considerations
    const texture = this.analyzeBoardTexture(board.filter(c => c !== null) as any[]);
    if (texture.dryness === 'DRY' && equity > 0.5) {
      score += 0.2;
      rationale.push('Dry board favors betting');
    }
    
    // Sizing considerations
    if (size >= 0.5 && size <= 0.75) {
      score += 0.1;
      rationale.push('Good sizing');
    }
    
    const action = this.getCurrentAction(input) === 'BET' ? 'BET' : 'RAISE';
    
    return {
      action: action as ActionType,
      size,
      score: Math.min(1, score),
      rationale
    };
  }

  /**
   * Analyze board texture
   */
  private static analyzeBoardTexture(board: any[]): BoardTexture {
    if (board.length < 3) {
      return {
        dryness: 'DRY',
        paired: false,
        monotone: false,
        rainbow: false,
        connected: false,
        highCards: 0,
        drawHeavy: false
      };
    }

    const paired = isBoardPaired(board);
    const monotone = isBoardMonotone(board);
    const rainbow = board.length >= 3 && new Set(board.map(c => c.suit)).size === 3;
    const connected = isBoardConnected(board);
    const highCards = countHighCards(board);
    
    let dryness: 'DRY' | 'WET' | 'VERY_WET' = 'DRY';
    let drawHeavy = false;
    
    if (connected || (monotone && board.length >= 3)) {
      dryness = 'WET';
      drawHeavy = true;
    }
    
    if (connected && (monotone || board.length >= 4)) {
      dryness = 'VERY_WET';
      drawHeavy = true;
    }
    
    return {
      dryness,
      paired,
      monotone,
      rainbow,
      connected,
      highCards,
      drawHeavy
    };
  }

  /**
   * Analyze ranges for hero and villain
   */
  private static analyzeRanges(input: AnalysisInput) {
    // Simplified range analysis
    const heroEquity = quickEquityCalculation(input.heroCards, input.board.filter(c => c !== null) as any[], 1);
    const villainEquity = 1 - heroEquity;
    
    return {
      hero: generateRangeString(heroEquity),
      villain: generateRangeString(villainEquity)
    };
  }

  /**
   * Determine confidence level
   */
  private static determineConfidence(input: AnalysisInput, metrics: HandMetrics): ConfidenceLevel {
    const { equity, spr } = metrics;
    const { street, opponentProfile } = input;
    
    let confidenceScore = 0;
    
    // Equity confidence
    if (equity > 0.7 || equity < 0.3) confidenceScore += 0.4;
    else if (equity > 0.6 || equity < 0.4) confidenceScore += 0.2;
    
    // Street confidence (more confident on later streets)
    if (street === 'RIVER') confidenceScore += 0.3;
    else if (street === 'TURN') confidenceScore += 0.2;
    else if (street === 'FLOP') confidenceScore += 0.1;
    
    // Stack depth confidence
    if (spr < 3 || spr > 15) confidenceScore += 0.2;
    
    // Opponent profile confidence
    if (opponentProfile === 'REG' || opponentProfile === 'NIT') confidenceScore += 0.1;
    
    if (confidenceScore >= 0.7) return 'HIGH';
    if (confidenceScore >= 0.4) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Detect common poker leaks
   */
  private static detectLeaks(
    input: AnalysisInput, 
    metrics: HandMetrics, 
    recommendations: ActionRecommendation[]
  ): LeakDetection[] {
    const leaks: LeakDetection[] = [];
    const { equity, requiredEquity, spr } = metrics;
    const { street, positions } = input;
    
    // Overcalling leak
    if (equity < requiredEquity - 0.05 && recommendations[0]?.action === 'CALL') {
      leaks.push({
        issue: 'Overcalling with insufficient equity',
        fix: 'Fold hands that don\'t meet required equity',
        severity: 'HIGH'
      });
    }
    
    // Under-betting with strong hands
    if (equity > 0.7 && recommendations[0]?.size && recommendations[0].size < 0.5) {
      leaks.push({
        issue: 'Under-betting strong hands',
        fix: 'Use larger bet sizes for value',
        severity: 'MEDIUM'
      });
    }
    
    // Playing out of position too loose
    if (positions.hero === 'SB' || positions.hero === 'BB') {
      if (equity < 0.45 && recommendations[0]?.action !== 'FOLD') {
        leaks.push({
          issue: 'Playing too loose out of position',
          fix: 'Tighten range when out of position',
          severity: 'MEDIUM'
        });
      }
    }
    
    // SPR mismatch
    if (spr < 3 && recommendations[0]?.action === 'CALL' && equity < 0.6) {
      leaks.push({
        issue: 'Calling with short stack and weak hand',
        fix: 'Play more aggressively or fold with short stacks',
        severity: 'HIGH'
      });
    }
    
    return leaks;
  }

  /**
   * Calculate EV for different actions
   */
  private static calculateActionEVs(input: AnalysisInput, equity: number): Record<string, number> {
    const { pot, stacksBB, assumptions } = input;
    const currentBet = this.estimateCurrentBet(input);
    
    const ev: Record<string, number> = {};
    
    // Call EV
    ev.call = calculateCallEV(equity, pot, currentBet);
    
    // Fold EV
    ev.fold = 0;
    
    // Bet EVs for different sizes
    for (const size of assumptions.sizingOptions) {
      const betSize = pot * size;
      const foldEquity = assumptions.foldEquity;
      
      // Simplified bet EV: fold_equity * current_pot + (1 - fold_equity) * (equity * new_pot - bet_size)
      const newPot = pot + betSize * 2;
      ev[`bet_${size}`] = foldEquity * pot + (1 - foldEquity) * (equity * newPot - betSize);
    }
    
    return ev;
  }

  /**
   * Estimate current bet size (simplified)
   */
  private static estimateCurrentBet(input: AnalysisInput): number {
    // In a real implementation, this would come from the action log
    return input.pot * 0.5; // Assume half-pot bet
  }

  /**
   * Determine current action context
   */
  private static getCurrentAction(input: AnalysisInput): string {
    // Simplified - in real implementation, analyze action log
    if (input.actionLog.length === 0) return 'BET';
    const lastAction = input.actionLog[input.actionLog.length - 1];
    if (lastAction.action === 'BET' || lastAction.action === 'RAISE') return 'CALL';
    return 'BET';
  }
}

/**
 * Quick analysis for real-time feedback
 */
export function quickAnalysis(input: AnalysisInput): Partial<AnalysisResult> {
  const equity = quickEquityCalculation(input.heroCards, input.board.filter(c => c !== null) as any[], 1);
  const currentBet = input.pot * 0.5;
  const potOdds = calculatePotOdds(currentBet, input.pot);
  
  const recommendation = equity >= potOdds ? 'CALL' : 'FOLD';
  
  return {
    recommendations: [{
      action: recommendation as ActionType,
      score: equity >= potOdds ? 0.7 : 0.3,
      rationale: [
        `Equity: ${(equity * 100).toFixed(1)}%`,
        `Required: ${(potOdds * 100).toFixed(1)}%`,
        equity >= potOdds ? 'Profitable call' : 'Fold recommended'
      ]
    }],
    metrics: {
      equity,
      potOdds,
      requiredEquity: potOdds,
      spr: calculateSPR(input.stacksBB.hero, input.pot),
      ev: { call: equity >= potOdds ? 0.5 : -0.5 }
    }
  };
}
