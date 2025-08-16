'use client';

import React, { useState } from 'react';
import { GlossaryTerm } from '@/types/poker';

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Check',
    vietnamese: 'Kiểm bài',
    english: 'Pass the action without betting',
    example: 'Không cược, chuyển lượt cho người tiếp theo',
    category: 'ACTION'
  },
  {
    term: 'Fold',
    vietnamese: 'Bỏ bài',
    english: 'Give up your hand and forfeit the pot',
    example: 'Bỏ bài khi không đủ mạnh để tiếp tục',
    category: 'ACTION'
  },
  {
    term: 'Bet',
    vietnamese: 'Cược',
    english: 'Put money into the pot',
    example: 'Đặt cược để build pot hoặc bluff',
    category: 'ACTION'
  },
  {
    term: 'Call',
    vietnamese: 'Theo',
    english: 'Match the current bet',
    example: 'Theo cược của đối thủ để xem bài tiếp theo',
    category: 'ACTION'
  },
  {
    term: 'Raise',
    vietnamese: 'Tố',
    english: 'Increase the current bet',
    example: 'Tăng cược để pressure đối thủ',
    category: 'ACTION'
  },
  {
    term: 'All-in',
    vietnamese: 'Tất tay',
    english: 'Bet all remaining chips',
    example: 'Đẩy tất cả chip vào pot',
    category: 'ACTION'
  },
  {
    term: 'Equity',
    vietnamese: 'Tỷ lệ thắng',
    english: 'Percentage chance to win the hand',
    example: 'AA vs KK preflop có ~80% equity',
    category: 'MATH'
  },
  {
    term: 'Pot Odds',
    vietnamese: 'Tỷ lệ pot',
    english: 'Ratio of call size to pot size',
    example: 'Call 10 vào pot 30 = 25% pot odds',
    category: 'MATH'
  },
  {
    term: 'Expected Value (EV)',
    vietnamese: 'Giá trị kỳ vọng',
    english: 'Average profit/loss of a decision',
    example: '+EV = profitable, -EV = losing money',
    category: 'MATH'
  },
  {
    term: 'SPR',
    vietnamese: 'Tỷ lệ Stack-Pot',
    english: 'Stack-to-Pot Ratio',
    example: 'Stack 100BB, pot 20BB = SPR 5',
    category: 'CONCEPT'
  },
  {
    term: 'C-bet',
    vietnamese: 'Continuation bet',
    english: 'Bet after being preflop aggressor',
    example: 'Raise preflop, rồi bet tiếp flop',
    category: 'STRATEGY'
  },
  {
    term: '3-bet',
    vietnamese: 'Tố lần 3',
    english: 'Third aggressive action preflop',
    example: 'Open > Call > 3-bet',
    category: 'STRATEGY'
  },
  {
    term: '4-bet',
    vietnamese: 'Tố lần 4',
    english: 'Fourth aggressive action preflop',
    example: 'Open > 3-bet > 4-bet',
    category: 'STRATEGY'
  },
  {
    term: 'Range',
    vietnamese: 'Dải bài',
    english: 'Set of possible hands a player can have',
    example: 'Button opening range: 22+, A2s+, A5o+...',
    category: 'CONCEPT'
  },
  {
    term: 'Blockers',
    vietnamese: 'Bài chặn',
    english: 'Cards that reduce opponent strong hands',
    example: 'Có As chặn AA, AK trong range đối thủ',
    category: 'CONCEPT'
  },
  {
    term: 'Board Texture',
    vietnamese: 'Cấu trúc board',
    english: 'How coordinated the community cards are',
    example: 'A72 rainbow = dry, 9T8 two-tone = wet',
    category: 'CONCEPT'
  },
  {
    term: 'Dry Board',
    vietnamese: 'Board khô',
    english: 'Uncoordinated board with few draws',
    example: 'A-7-2 rainbow',
    category: 'CONCEPT'
  },
  {
    term: 'Wet Board',
    vietnamese: 'Board ướt',
    english: 'Coordinated board with many draws',
    example: '9-T-8 with flush draws',
    category: 'CONCEPT'
  },
  {
    term: 'Nuts',
    vietnamese: 'Bài tốt nhất',
    english: 'Best possible hand on current board',
    example: 'Broadway straight trên board T-J-Q-K-A',
    category: 'CONCEPT'
  },
  {
    term: 'Draw',
    vietnamese: 'Bài dở',
    english: 'Hand that needs improvement to win',
    example: 'Flush draw, straight draw, gutshot...',
    category: 'CONCEPT'
  },
  {
    term: 'Value Bet',
    vietnamese: 'Cược giá trị',
    english: 'Bet with strong hand for profit',
    example: 'Bet top pair để extract value',
    category: 'STRATEGY'
  },
  {
    term: 'Bluff',
    vietnamese: 'Lừa',
    english: 'Bet with weak hand to win pot',
    example: 'Bet air để fold đối thủ',
    category: 'STRATEGY'
  },
  {
    term: 'Semi-bluff',
    vietnamese: 'Nửa lừa',
    english: 'Bet with draw that can improve',
    example: 'Bet flush draw có thể win ngay hoặc hit draw',
    category: 'STRATEGY'
  }
];

const CATEGORIES = [
  { key: 'ACTION', name: 'Hành động', color: 'bg-blue-100 text-blue-800' },
  { key: 'MATH', name: 'Toán học', color: 'bg-green-100 text-green-800' },
  { key: 'CONCEPT', name: 'Khái niệm', color: 'bg-purple-100 text-purple-800' },
  { key: 'STRATEGY', name: 'Chiến thuật', color: 'bg-orange-100 text-orange-800' }
];

export default function PokerGlossary() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = GLOSSARY_TERMS.filter(term => {
    const matchesCategory = selectedCategory === 'ALL' || term.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.vietnamese.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.english.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6">
      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Tìm kiếm thuật ngữ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'ALL' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.key 
                  ? category.color
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Terms List */}
      <div className="space-y-4">
        {filteredTerms.map((term, index) => {
          const category = CATEGORIES.find(c => c.key === term.category);
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800">
                  {term.term}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${category?.color}`}>
                  {category?.name}
                </span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-gray-700">Tiếng Việt:</span>
                  <span className="ml-2 text-gray-800">{term.vietnamese}</span>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">English:</span>
                  <span className="ml-2 text-gray-600 italic">{term.english}</span>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">Ví dụ:</span>
                  <span className="ml-2 text-gray-700">{term.example}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>Không tìm thấy thuật ngữ nào</p>
        </div>
      )}

      {/* Quick Reference */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="font-bold text-gray-800 mb-3">💡 Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Position Order (Early → Late)</h4>
            <p className="text-gray-600">UTG → MP → CO → BTN → SB → BB</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Hand Strength</h4>
            <p className="text-gray-600">High Card → Pair → Two Pair → Trips → Straight → Flush → Full House → Quads → Straight Flush</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Bet Sizing</h4>
            <p className="text-gray-600">1/3 pot (33%) → 1/2 pot (50%) → 2/3 pot (66%) → 3/4 pot (75%) → Pot (100%)</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Basic Math</h4>
            <p className="text-gray-600">Pot Odds = Call / (Pot + Call)<br/>SPR = Stack / Pot</p>
          </div>
        </div>
      </div>
    </div>
  );
}
