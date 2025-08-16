'use client';

import React, { useState, useCallback } from 'react';
import { Card, ActionType } from '@/types/poker';
import { formatCardDisplay, stringToCard } from '@/lib/poker-utils';

interface CardSelectorProps {
  value?: Card | null;
  onChange: (card: Card | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = [
  { symbol: '♠', name: 'spades', color: 'text-gray-800' },
  { symbol: '♥', name: 'hearts', color: 'text-red-500' },
  { symbol: '♦', name: 'diamonds', color: 'text-red-500' },
  { symbol: '♣', name: 'clubs', color: 'text-gray-800' },
];

export default function CardSelector({ value, onChange, disabled, className = '', placeholder = '??' }: CardSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCardSelect = useCallback((rank: string, suit: string) => {
    const card = stringToCard(rank + suit[0]);
    onChange(card);
    setIsOpen(false);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setIsOpen(false);
  }, [onChange]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          card board-card cursor-pointer hover:shadow-lg transition-all
          ${value ? getCardClasses(value) : 'bg-gray-100 text-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {value ? formatCardDisplay(value) : placeholder}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 z-50 mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 min-w-max">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {SUITS.map((suit) => (
              <div key={suit.name} className="text-center">
                <div className={`text-2xl ${suit.color} mb-2`}>{suit.symbol}</div>
                <div className="grid grid-cols-1 gap-1">
                  {RANKS.map((rank) => (
                    <button
                      key={`${rank}${suit.name}`}
                      onClick={() => handleCardSelect(rank, suit.name)}
                      className={`
                        w-8 h-8 text-sm font-bold rounded border hover:bg-gray-100
                        ${suit.color}
                      `}
                    >
                      {rank}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-2">
            <button
              onClick={handleClear}
              className="w-full px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getCardClasses(card: Card): string {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  return `bg-white ${isRed ? 'text-red-500' : 'text-gray-800'}`;
}
