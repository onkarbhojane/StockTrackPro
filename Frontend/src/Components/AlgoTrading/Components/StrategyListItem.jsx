import React from 'react';

const StrategyListItem = ({ strategy, onActivate, onDeactivate }) => {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium text-gray-900">
            {strategy.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {strategy.description}
          </p>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {strategy.type}
            </span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Created: {strategy.createdAt}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Win Rate</p>
            <p className="text-lg font-semibold text-gray-900">
              {strategy.performance.winRate}
            </p>
          </div>
          {strategy.isActive ? (
            <button
              onClick={() => onDeactivate(strategy.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => onActivate(strategy.id)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Activate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyListItem;