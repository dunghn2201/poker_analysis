'use client';

import React from 'react';
import { Card, Position, Street, OpponentProfile } from '@/types/poker';
import CardSelector from './CardSelector';

interface HandInputProps {
  heroCards: [Card, Card];
  board: (Card | null)[];
  positions: { hero: Position; villain: Position };
  stacks: { hero: number; villain: number };
  pot: number;
  street: Street;
  opponentProfile: OpponentProfile;
  foldEquity: number;
  onHeroCardsChange: (cards: [Card, Card]) => void;
  onBoardChange: (index: number, card: Card | null) => void;
  onPositionChange: (actor: 'hero' | 'villain', position: Position) => void;
  onStackChange: (actor: 'hero' | 'villain', stack: number) => void;
  onPotChange: (pot: number) => void;
  onStreetChange: (street: Street) => void;
  onOpponentProfileChange: (profile: OpponentProfile) => void;
  onFoldEquityChange: (equity: number) => void;
}

const POSITIONS: Position[] = ['UTG', 'UTG+1', 'MP', 'MP+1', 'CO', 'BTN', 'SB', 'BB'];
const STREETS: Street[] = ['PREFLOP', 'FLOP', 'TURN', 'RIVER'];
const OPPONENT_PROFILES: { value: OpponentProfile; label: string; description: string }[] = [
  { value: 'NIT', label: 'Nit', description: 'Chơi chặt, ít bluff' },
  { value: 'REG', label: 'Regular', description: 'Chơi cân bằng, có kỹ năng' },
  { value: 'LOOSE', label: 'Loose', description: 'Chơi nhiều tay, thích call' },
  { value: 'WHALE', label: 'Whale', description: 'Chơi rất loose, ít kỹ năng' },
];

export default function HandInput({
  heroCards,
  board,
  positions,
  stacks,
  pot,
  street,
  opponentProfile,
  foldEquity,
  onHeroCardsChange,
  onBoardChange,
  onPositionChange,
  onStackChange,
  onPotChange,
  onStreetChange,
  onOpponentProfileChange,
  onFoldEquityChange,
}: HandInputProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="text-center border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">Nhập thông tin bài</h2>
        <p className="text-sm text-gray-600 mt-1">Input hand information</p>
      </div>

      {/* Hero Cards */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bài của bạn (Hero Cards)
        </label>
        <div className="flex gap-3">
          <CardSelector
            value={heroCards[0]}
            onChange={(card) => card && onHeroCardsChange([card, heroCards[1]])}
            className="hero-card"
          />
          <CardSelector
            value={heroCards[1]}
            onChange={(card) => card && onHeroCardsChange([heroCards[0], card])}
            className="hero-card"
          />
        </div>
      </div>

      {/* Board Cards */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bài chung (Board)
        </label>
        <div className="flex gap-2">
          {board.map((card, index) => (
            <CardSelector
              key={index}
              value={card}
              onChange={(card) => onBoardChange(index, card)}
              placeholder={index < 3 ? 'Flop' : index === 3 ? 'Turn' : 'River'}
              disabled={
                (index >= 3 && board.slice(0, 3).some(c => c === null)) ||
                (index === 4 && board[3] === null)
              }
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Flop (3 bài đầu) → Turn → River
        </p>
      </div>

      {/* Positions */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vị trí Hero
          </label>
          <select
            value={positions.hero}
            onChange={(e) => onPositionChange('hero', e.target.value as Position)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {POSITIONS.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vị trí Villain
          </label>
          <select
            value={positions.villain}
            onChange={(e) => onPositionChange('villain', e.target.value as Position)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {POSITIONS.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stacks and Pot */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stack Hero (BB)
          </label>
          <input
            type="number"
            value={stacks.hero}
            onChange={(e) => onStackChange('hero', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stack Villain (BB)
          </label>
          <input
            type="number"
            value={stacks.villain}
            onChange={(e) => onStackChange('villain', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pot (BB)
          </label>
          <input
            type="number"
            value={pot}
            onChange={(e) => onPotChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.5"
          />
        </div>
      </div>

      {/* Street */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Street hiện tại
        </label>
        <div className="flex gap-2">
          {STREETS.map(s => (
            <button
              key={s}
              onClick={() => onStreetChange(s)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                street === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="border-t pt-4 space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Cài đặt nâng cao</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại đối thủ
          </label>
          <select
            value={opponentProfile}
            onChange={(e) => onOpponentProfileChange(e.target.value as OpponentProfile)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {OPPONENT_PROFILES.map(profile => (
              <option key={profile.value} value={profile.value}>
                {profile.label} - {profile.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fold Equity: {(foldEquity * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={foldEquity}
            onChange={(e) => onFoldEquityChange(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
