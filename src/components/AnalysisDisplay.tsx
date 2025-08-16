'use client';

import React from 'react';
import { AnalysisResult, UIMode } from '@/types/poker';
import { formatPercentage, formatBigBlinds } from '@/lib/poker-utils';

interface AnalysisDisplayProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  mode: UIMode;
  onAnalyze: () => void;
}

export default function AnalysisDisplay({ result, isAnalyzing, mode, onAnalyze }: AnalysisDisplayProps) {
  if (!result && !isAnalyzing) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Sẵn sàng phân tích
          </h3>
          <p className="text-sm text-gray-600">
            Nhập thông tin bài và nhấn phân tích để bắt đầu
          </p>
        </div>
        <button
          onClick={onAnalyze}
          className="action-button primary w-full"
        >
          🚀 Phân tích bài (Analyze Hand)
        </button>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Đang phân tích...
          </h3>
          <p className="text-sm text-gray-600">
            Tính toán equity và đưa ra gợi ý
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Kết quả phân tích</h2>
          <div className={`px-2 py-1 rounded text-xs font-semibold ${
            result!.confidence === 'HIGH' ? 'bg-green-500' :
            result!.confidence === 'MEDIUM' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}>
            {result!.confidence === 'HIGH' ? 'Tin cậy cao' :
             result!.confidence === 'MEDIUM' ? 'Tin cậy vừa' :
             'Tin cậy thấp'}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Recommendation */}
        {result!.recommendations.length > 0 && (
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🎯 Gợi ý chính
            </h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-bold text-blue-800">
                  {result!.recommendations[0].action}
                  {result!.recommendations[0].size && 
                    ` ${formatPercentage(result!.recommendations[0].size, 0)} pot`
                  }
                </span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatPercentage(result!.recommendations[0].score)}
                </span>
              </div>
              <div className="space-y-1">
                {result!.recommendations[0].rationale.map((reason, index) => (
                  <div key={index} className="text-sm text-blue-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            📊 Chỉ số quan trọng
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Equity</div>
              <div className="text-xl font-bold text-gray-800">
                {formatPercentage(result!.metrics.equity)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Pot Odds</div>
              <div className="text-xl font-bold text-gray-800">
                {formatPercentage(result!.metrics.potOdds)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Required Equity</div>
              <div className="text-xl font-bold text-gray-800">
                {formatPercentage(result!.metrics.requiredEquity)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">SPR</div>
              <div className="text-xl font-bold text-gray-800">
                {result!.metrics.spr.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* All Recommendations (Pro Mode) */}
        {mode === 'PRO' && result!.recommendations.length > 1 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              🎲 Tất cả lựa chọn
            </h3>
            <div className="space-y-2">
              {result!.recommendations.map((rec, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  index === 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      {rec.action}
                      {rec.size && ` ${formatPercentage(rec.size, 0)} pot`}
                    </span>
                    <span className={`font-bold ${
                      index === 0 ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {formatPercentage(rec.score)}
                    </span>
                  </div>
                  {mode === 'PRO' && (
                    <div className="text-xs text-gray-600 mt-1">
                      {rec.rationale.join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expected Values (Pro Mode) */}
        {mode === 'PRO' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              💰 Expected Value
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(result!.metrics.ev).map(([action, ev]) => (
                <div key={action} className="flex justify-between py-1 border-b border-gray-200">
                  <span className="capitalize">{action.replace('_', ' ')}</span>
                  <span className={`font-semibold ${ev >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ev >= 0 ? '+' : ''}{formatBigBlinds(ev)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaks Detection */}
        {result!.leaks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              ⚠️ Cảnh báo & Gợi ý
            </h3>
            <div className="space-y-2">
              {result!.leaks.map((leak, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  leak.severity === 'HIGH' ? 'border-red-500 bg-red-50' :
                  leak.severity === 'MEDIUM' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="font-semibold text-sm">{leak.issue}</div>
                  <div className="text-sm mt-1 text-gray-700">{leak.fix}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ranges (Pro Mode) */}
        {mode === 'PRO' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              🎯 Range Analysis
            </h3>
            <div className="text-sm space-y-2">
              <div>
                <span className="font-semibold">Hero range:</span>
                <span className="ml-2 text-gray-700">{result!.ranges.hero}</span>
              </div>
              <div>
                <span className="font-semibold">Villain range:</span>
                <span className="ml-2 text-gray-700">{result!.ranges.villain}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t">
          <button
            onClick={onAnalyze}
            className="action-button secondary w-full"
          >
            🔄 Phân tích lại (Re-analyze)
          </button>
        </div>
      </div>
    </div>
  );
}
