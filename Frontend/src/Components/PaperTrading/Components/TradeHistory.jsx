import React from 'react';

const TradeHistory = ({ trades }) => {
  return (
    <div className="trade-history">
      <h2>Trade History</h2>
      {trades.length === 0 ? (
        <p>No trades yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Side</th>
              <th>Qty</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>P&L</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => (
              <tr key={trade.id}>
                <td>{new Date(trade.timestamp).toLocaleString()}</td>
                <td>{trade.symbol}</td>
                <td>{trade.side}</td>
                <td>{trade.quantity}</td>
                <td>${trade.entryPrice.toFixed(2)}</td>
                <td>${trade.exitPrice?.toFixed(2) || '-'}</td>
                <td className={trade.pnl >= 0 ? 'profit' : 'loss'}>
                  ${trade.pnl?.toFixed(2) || '0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TradeHistory;