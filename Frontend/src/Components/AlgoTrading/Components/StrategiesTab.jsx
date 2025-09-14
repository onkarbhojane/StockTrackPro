import React, { useState, useEffect } from 'react';
import ActiveStrategyCard from './ActiveStrategyCard';
import StrategyList from './StrategyList';

const StrategiesTab = () => {
  const [strategies, setStrategies] = useState([
    {
      id: '1',
      name: 'Mean Reversion',
      description: 'Trades based on price deviations from historical mean',
      type: 'mean-reversion',
      isActive: true,
      createdAt: '2023-05-15',
      performance: {
        totalTrades: 42,
        winRate: '68%',
        profitFactor: 1.8,
        maxDrawdown: '-12.5%'
      }
    },
    {
      id: '2',
      name: 'Momentum Breakout',
      description: 'Captures strong trending moves after consolidation',
      type: 'momentum',
      isActive: false,
      createdAt: '2023-06-22',
      performance: {
        totalTrades: 28,
        winRate: '57%',
        profitFactor: 1.4,
        maxDrawdown: '-18.2%'
      }
    },
    {
      id: '3',
      name: 'EMA Crossover',
      description: 'Uses exponential moving average crossovers for signals',
      type: 'trend-following',
      isActive: false,
      createdAt: '2023-07-10',
      performance: {
        totalTrades: 35,
        winRate: '62%',
        profitFactor: 1.6,
        maxDrawdown: '-15.8%'
      }
    }
  ]);

  const [activeStrategy, setActiveStrategy] = useState(strategies.find(s => s.isActive));
  const [livePerformance, setLivePerformance] = useState([]);

  useEffect(() => {
    const performanceData = [];
    for (let i = 0; i < 30; i++) {
      performanceData.push({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pnl: (Math.random() * 2000 - 800).toFixed(2),
        trades: Math.floor(Math.random() * 5) + 1
      });
    }
    setLivePerformance(performanceData);
  }, []);

  const handleStrategyActivation = (strategyId) => {
    const updatedStrategies = strategies.map(strategy => ({
      ...strategy,
      isActive: strategy.id === strategyId
    }));
    setStrategies(updatedStrategies);
    setActiveStrategy(updatedStrategies.find(s => s.id === strategyId));
  };

  const handleStrategyDeactivation = (strategyId) => {
    const updatedStrategies = strategies.map(strategy => ({
      ...strategy,
      isActive: false
    }));
    setStrategies(updatedStrategies);
    setActiveStrategy(null);
  };

  return (
    <div className="space-y-6">
      {activeStrategy && (
        <ActiveStrategyCard 
          strategy={activeStrategy} 
          performanceData={livePerformance} 
          onDeactivate={handleStrategyDeactivation}
        />
      )}
      <StrategyList 
        strategies={strategies} 
        onActivate={handleStrategyActivation} 
        onDeactivate={handleStrategyDeactivation}
      />
    </div>
  );
};

export default StrategiesTab;