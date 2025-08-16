const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for demo
const GLOSSARY_TERMS = [
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
  // ... more terms would be added
];

// Routes

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Poker Analysis API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Analyze poker hand
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const {
      heroCards,
      board,
      positions,
      stacksBB,
      pot,
      street,
      actionLog,
      opponentProfile,
      assumptions
    } = req.body;

    // Validate input
    if (!heroCards || heroCards.length !== 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid hero cards'
      });
    }

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock equity calculation
    const equity = 0.35 + Math.random() * 0.4; // Random between 35-75%
    const potOdds = 0.25; // Assume 25% pot odds
    const requiredEquity = potOdds;
    const spr = stacksBB.hero / pot;

    // Generate recommendations based on equity
    const recommendations = [];
    
    if (equity > requiredEquity + 0.1) {
      recommendations.push({
        action: 'BET',
        size: 0.5,
        score: Math.min(0.9, equity + 0.2),
        rationale: [
          `Strong equity: ${(equity * 100).toFixed(1)}%`,
          'Value betting for profit',
          'Build pot with strong hand'
        ]
      });
      
      recommendations.push({
        action: 'CALL',
        score: equity * 0.8,
        rationale: [
          'Positive equity call',
          'Pot control'
        ]
      });
    } else if (equity > requiredEquity) {
      recommendations.push({
        action: 'CALL',
        score: 0.6,
        rationale: [
          'Marginally profitable call',
          `Equity: ${(equity * 100).toFixed(1)}% vs required ${(requiredEquity * 100).toFixed(1)}%`
        ]
      });
      
      recommendations.push({
        action: 'FOLD',
        score: 0.4,
        rationale: [
          'Close decision',
          'Consider board texture'
        ]
      });
    } else {
      recommendations.push({
        action: 'FOLD',
        score: 0.8,
        rationale: [
          'Insufficient equity',
          `Need ${(requiredEquity * 100).toFixed(1)}%, have ${(equity * 100).toFixed(1)}%`,
          'Negative EV call'
        ]
      });
      
      if (assumptions.foldEquity > 0.3) {
        recommendations.push({
          action: 'BET',
          size: 0.75,
          score: 0.5,
          rationale: [
            'Bluff with fold equity',
            `Fold equity: ${(assumptions.foldEquity * 100).toFixed(0)}%`
          ]
        });
      }
    }

    // Sort by score
    recommendations.sort((a, b) => b.score - a.score);

    // Calculate EVs
    const ev = {
      call: equity > requiredEquity ? 0.5 : -0.3,
      fold: 0,
      'bet_0.5': equity * 1.2 - 0.3,
      'bet_0.75': equity * 1.5 - 0.5
    };

    // Generate ranges (simplified)
    const ranges = {
      hero: generateSimpleRange(equity),
      villain: generateSimpleRange(1 - equity)
    };

    // Determine confidence
    let confidence = 'MEDIUM';
    if (equity > 0.7 || equity < 0.3) confidence = 'HIGH';
    if (Math.abs(equity - requiredEquity) < 0.05) confidence = 'LOW';

    // Detect leaks
    const leaks = [];
    if (equity < requiredEquity - 0.1 && recommendations[0]?.action === 'CALL') {
      leaks.push({
        issue: 'Overcalling with insufficient equity',
        fix: 'Fold more marginal hands',
        severity: 'HIGH'
      });
    }

    const result = {
      recommendations,
      metrics: {
        equity,
        potOdds,
        requiredEquity,
        spr,
        ev
      },
      ranges,
      confidence,
      leaks
    };

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get poker glossary
 */
app.get('/api/glossary', (req, res) => {
  res.json({
    success: true,
    data: GLOSSARY_TERMS,
    timestamp: new Date().toISOString()
  });
});

/**
 * Generate hand report
 */
app.post('/api/report', async (req, res) => {
  try {
    const { handState, analysis, title, notes } = req.body;
    
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real app, this would save to database
    const report = {
      id: reportId,
      title: title || 'Poker Hand Analysis',
      handState,
      analysis,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      tags: ['analysis', 'poker'],
      url: `/reports/${reportId}`
    };

    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper functions
function generateSimpleRange(equity) {
  if (equity >= 0.8) return 'AA-22, AKo-A2o, AKs-A2s, KQo-K2o, KQs-K2s, ...';
  if (equity >= 0.6) return 'AA-77, AKo-A9o, AKs-A5s, KQo-KTo, KQs-K9s, ...';
  if (equity >= 0.4) return 'AA-99, AKo-ATo, AKs-A9s, KQo-KJo, KQs-KTs, ...';
  if (equity >= 0.2) return 'AA-JJ, AKo-AQo, AKs-AJs, KQo, KQs-KJs, ...';
  return 'AA-KK, AKs, AKo, ...';
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 Poker Analysis API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧠 Analysis endpoint: http://localhost:${PORT}/api/analyze`);
  console.log(`📚 Glossary endpoint: http://localhost:${PORT}/api/glossary`);
});

module.exports = app;
