import React, { useState } from 'react';
import StrategyForm from './StrategyForm';
import BacktestPanel from './BacktestPanel';

const BuilderTab = () => {
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    description: '',
    type: 'mean-reversion',
    parameters: {
      lookbackPeriod: 14,
      threshold: 2.0,
      positionSize: 10
    }
  });
  
  const [backtestResults, setBacktestResults] = useState(null);

  const handleCreateStrategy = () => {
    alert(`Strategy "${newStrategy.name}" created successfully!`);
    setNewStrategy({
      name: '',
      description: '',
      type: 'mean-reversion',
      parameters: {
        lookbackPeriod: 14,
        threshold: 2.0,
        positionSize: 10
      }
    });
    setBacktestResults(null);
  };

  const runBacktest = () => {
    setBacktestResults({
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      totalTrades: 127,
      winRate: '64.5%',
      profitFactor: 1.72,
      maxDrawdown: '-14.3%',
      sharpeRatio: 1.45,
      cumulativeReturn: '28.7%',
      equityCurve: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2023, i, 1).toLocaleString('default', { month: 'short' }),
        value: (10000 + Math.random() * 20000).toFixed(2)
      }))
    });
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Strategy Builder</h2>
      </div>
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <StrategyForm 
            strategy={newStrategy} 
            onChange={setNewStrategy} 
          />
        </div>
        <div className="md:col-span-1">
          <BacktestPanel 
            onRunBacktest={runBacktest} 
            results={backtestResults} 
            onCreateStrategy={handleCreateStrategy}
          />
        </div>
      </div>
    </div>
  );
};

export default BuilderTab;