import React from 'react';

const ActiveStrategyCard = ({ strategy, performanceData, onDeactivate }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Active Strategy: {strategy.name}
          </h2>
          <button
            onClick={() => onDeactivate(strategy.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Stop Strategy
          </button>
        </div>
      </div>
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Strategy Details</h3>
          <p className="mt-1 text-sm text-gray-900">{strategy.description}</p>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              {strategy.type}
            </span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Created: {strategy.createdAt}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Performance Metrics</h3>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Trades</p>
              <p className="text-lg font-semibold text-gray-900">
                {strategy.performance.totalTrades}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Win Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {strategy.performance.winRate}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Profit Factor</p>
              <p className="text-lg font-semibold text-gray-900">
                {strategy.performance.profitFactor}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Max Drawdown</p>
              <p className="text-lg font-semibold text-gray-900">
                {strategy.performance.maxDrawdown}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">Recent Performance</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trades
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceData.slice(-5).map((day, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {day.date}
                  </td>
                  <td
                    className={`px-4 py-2 whitespace-nowrap text-sm ${
                      parseFloat(day.pnl) >= 0
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {day.pnl}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {day.trades}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActiveStrategyCard;