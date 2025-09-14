import React from 'react';

const BacktestPanel = ({ onRunBacktest, results, onCreateStrategy }) => {
  return (
    <>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">Backtest Strategy</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Initial Capital
            </label>
            <input
              type="number"
              defaultValue="10000"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button
            onClick={onRunBacktest}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Run Backtest
          </button>
        </div>
      </div>
      {results && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Backtest Results</h3>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm text-gray-500">Period</p>
              <p className="text-sm font-medium text-gray-900">
                {results.startDate} to {results.endDate}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Trades</p>
              <p className="text-sm font-medium text-gray-900">
                {results.totalTrades}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Win Rate</p>
              <p className="text-sm font-medium text-gray-900">
                {results.winRate}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Profit Factor</p>
              <p className="text-sm font-medium text-gray-900">
                {results.profitFactor}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Max Drawdown</p>
              <p className="text-sm font-medium text-gray-900">
                {results.maxDrawdown}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sharpe Ratio</p>
              <p className="text-sm font-medium text-gray-900">
                {results.sharpeRatio}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cumulative Return</p>
              <p className="text-sm font-medium text-gray-900">
                {results.cumulativeReturn}
              </p>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={onCreateStrategy}
        className="w-full mt-6 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
      >
        Save Strategy
      </button>
    </>
  );
};

export default BacktestPanel;