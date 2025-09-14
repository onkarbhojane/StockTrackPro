import React, { useState } from 'react';
import TradeHistoryTable from './TradeHistoryTable';

const HistoryTab = () => {
  const [livePerformance] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pnl: (Math.random() * 2000 - 800).toFixed(2),
      trades: Math.floor(Math.random() * 5) + 1
    }))
  );

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Trading History</h2>
          <div className="flex space-x-4">
            <select className="border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
              <option>All Strategies</option>
              <option>Mean Reversion</option>
              <option>Momentum Breakout</option>
              <option>EMA Crossover</option>
            </select>
            <select className="border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
          </div>
        </div>
      </div>
      <TradeHistoryTable data={livePerformance} />
    </div>
  );
};

export default HistoryTab;