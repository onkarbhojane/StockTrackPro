import React from 'react';
import StrategyListItem from './StrategyListItem';

const StrategyList = ({ strategies, onActivate, onDeactivate }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">My Strategies</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {strategies.map((strategy) => (
          <StrategyListItem 
            key={strategy.id} 
            strategy={strategy} 
            onActivate={onActivate} 
            onDeactivate={onDeactivate}
          />
        ))}
      </div>
    </div>
  );
};

export default StrategyList;