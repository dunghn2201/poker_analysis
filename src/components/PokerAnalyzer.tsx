'use client';

import React, { useState, useCallback } from 'react';
import { Card, Position, Street, OpponentProfile, UIMode, AnalysisInput } from '@/types/poker';
import { PokerAnalyzer as AnalysisEngine } from '@/lib/poker-analyzer';
import HandInput from './HandInput';
import AnalysisDisplay from './AnalysisDisplay';
import PokerGlossary from './PokerGlossary';

export default function PokerAnalyzer() {
  // State management (normally would use Zustand, but simplifying for demo)
  const [mode, setMode] = useState<UIMode>('BEGINNER');
  const [heroCards, setHeroCards] = useState<[Card, Card]>([
    { rank: 'A', suit: 'spades' },
    { rank: 'K', suit: 'hearts' }
  ]);
  const [board, setBoard] = useState<(Card | null)[]>([null, null, null, null, null]);
  const [positions, setPositions] = useState({ hero: 'CO' as Position, villain: 'BB' as Position });
  const [stacks, setStacks] = useState({ hero: 100, villain: 100 });
  const [pot, setPot] = useState(3);
  const [street, setStreet] = useState<Street>('PREFLOP');
  const [opponentProfile, setOpponentProfile] = useState<OpponentProfile>('REG');
  const [foldEquity, setFoldEquity] = useState(0.35);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const input: AnalysisInput = {
        heroCards,
        board,
        positions,
        stacksBB: stacks,
        pot,
        street,
        actionLog: [], // Simplified for demo
        opponentProfile,
        assumptions: {
          foldEquity,
          sizingOptions: [0.33, 0.5, 0.75, 1.0]
        }
      };

      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await AnalysisEngine.analyzeHand(input);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      // In real app, show error message
    } finally {
      setIsAnalyzing(false);
    }
  }, [heroCards, board, positions, stacks, pot, street, opponentProfile, foldEquity]);

  const handleBoardChange = useCallback((index: number, card: Card | null) => {
    const newBoard = [...board];
    newBoard[index] = card;
    setBoard(newBoard);
  }, [board]);

  const handlePositionChange = useCallback((actor: 'hero' | 'villain', position: Position) => {
    setPositions(prev => ({ ...prev, [actor]: position }));
  }, []);

  const handleStackChange = useCallback((actor: 'hero' | 'villain', stack: number) => {
    setStacks(prev => ({ ...prev, [actor]: stack }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                🎯 Poker Analysis Pro
              </h1>
              <span className="ml-3 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                Beta
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Mode Toggle */}
              <div className="flex bg-white/20 rounded-lg p-1">
                <button
                  onClick={() => setMode('BEGINNER')}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    mode === 'BEGINNER' 
                      ? 'bg-white text-gray-800' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  Beginner
                </button>
                <button
                  onClick={() => setMode('PRO')}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    mode === 'PRO' 
                      ? 'bg-white text-gray-800' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  Pro
                </button>
              </div>

              {/* Glossary Button */}
              <button
                onClick={() => setShowGlossary(!showGlossary)}
                className="px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all text-sm"
              >
                📚 Từ điển
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Hand Input */}
          <div className="space-y-6">
            <HandInput
              heroCards={heroCards}
              board={board}
              positions={positions}
              stacks={stacks}
              pot={pot}
              street={street}
              opponentProfile={opponentProfile}
              foldEquity={foldEquity}
              onHeroCardsChange={setHeroCards}
              onBoardChange={handleBoardChange}
              onPositionChange={handlePositionChange}
              onStackChange={handleStackChange}
              onPotChange={setPot}
              onStreetChange={setStreet}
              onOpponentProfileChange={setOpponentProfile}
              onFoldEquityChange={setFoldEquity}
            />

            {/* Quick Stats */}
            {mode === 'PRO' && (
              <div className="bg-white/90 rounded-lg shadow-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Effective Stack:</span>
                    <span className="ml-2 font-semibold">
                      {Math.min(stacks.hero, stacks.villain)}BB
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">SPR:</span>
                    <span className="ml-2 font-semibold">
                      {(Math.min(stacks.hero, stacks.villain) / pot).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Analysis */}
          <div className="space-y-6">
            <AnalysisDisplay
              result={analysisResult}
              isAnalyzing={isAnalyzing}
              mode={mode}
              onAnalyze={handleAnalyze}
            />

            {/* Beginner Tips */}
            {mode === 'BEGINNER' && (
              <div className="bg-white/90 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  💡 Mẹo cho người mới
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>
                      <strong>Equity:</strong> Tỷ lệ % thắng bài của bạn. Càng cao càng tốt!
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>
                      <strong>Pot Odds:</strong> Tỷ lệ tiền bạn phải bỏ ra so với pot. 
                      Equity phải lớn hơn Pot Odds để call có lãi.
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>
                      <strong>Position:</strong> Vị trí càng muộn càng có lợi thế 
                      (Button {'>'}= Cutoff {'>'}= Middle {'>'}= Early).
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>
                      <strong>SPR:</strong> Stack-to-Pot ratio. SPR thấp (&lt;5) 
                      nên chơi aggressive hơn với SPR thấp (&lt;5).
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Glossary Overlay */}
        {showGlossary && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  📚 Từ điển Poker (Poker Glossary)
                </h2>
                <button
                  onClick={() => setShowGlossary(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
                <PokerGlossary />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-sm border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-white/80 text-sm">
            <p className="mb-2">
              🎯 Poker Analysis Pro - Công cụ phân tích poker thông minh
            </p>
            <p className="text-xs">
              ⚠️ Chỉ sử dụng cho mục đích giáo dục. Không bảo đảm thắng bài.
            </p>
            <p className="text-xs mt-1">
              Built with ❤️ using Next.js, TypeScript & Monte Carlo simulation
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
