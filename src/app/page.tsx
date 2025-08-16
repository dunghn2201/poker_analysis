'use client';

import { useEffect } from 'react';
import PokerAnalyzer from '@/components/PokerAnalyzer';

export default function Home() {
  useEffect(() => {
    // Set up dark mode class on document
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <main className="min-h-screen">
      <PokerAnalyzer />
    </main>
  );
}
