import React from 'react';

const StrategyForm = ({ strategy, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Strategy Name
        </label>
        <input
          type="text"
          value={strategy.name}
          onChange={(e) => onChange({ ...strategy, name: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={strategy.description}
          onChange={(e) => onChange({ ...strategy, description: e.target.value })}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Strategy Type
        </label>
        <select
          value={strategy.type}
          onChange={(e) => onChange({ ...strategy, type: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="mean-reversion">Mean Reversion</option>
          <option value="momentum">Momentum</option>
          <option value="trend-following">Trend Following</option>
          <option value="arbitrage">Arbitrage</option>
          <option value="market-making">Market Making</option>
        </select>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700">
          Strategy Parameters
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lookback Period (days)
            </label>
            <input
              type="number"
              value={strategy.parameters.lookbackPeriod}
              onChange={(e) =>
                onChange({
                  ...strategy,
                  parameters: {
                    ...strategy.parameters,
                    lookbackPeriod: parseInt(e.target.value)
                  }
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Threshold (standard deviations)
            </label>
            <input
              type="number"
              step="0.1"
              value={strategy.parameters.threshold}
              onChange={(e) =>
                onChange({
                  ...strategy,
                  parameters: {
                    ...strategy.parameters,
                    threshold: parseFloat(e.target.value)
                  }
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Position Size (% of capital)
            </label>
            <input
              type="number"
              value={strategy.parameters.positionSize}
              onChange={(e) =>
                onChange({
                  ...strategy,
                  parameters: {
                    ...strategy.parameters,
                    positionSize: parseInt(e.target.value)
                  }
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyForm;