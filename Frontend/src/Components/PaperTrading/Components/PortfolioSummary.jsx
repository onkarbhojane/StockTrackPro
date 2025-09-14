import React from 'react';

const PortfolioSummary = ({ balance, openPositions, marketData, onClosePosition }) => {
  const calculatePortfolioValue = () => {
    return openPositions.reduce((total, position) => {
      const currentPrice = marketData[position.symbol]?.price || position.entryPrice;
      return total + (currentPrice * position.quantity);
    }, 0);
  };

  return (
    <div className="portfolio-summary">
      <h3>Portfolio</h3>
      <div className="balance">
        <h4>Available Balance</h4>
        <p>${balance.toFixed(2)}</p>
      </div>
      
      <div className="portfolio-value">
        <h4>Portfolio Value</h4>
        <p>${calculatePortfolioValue().toFixed(2)}</p>
      </div>

      <div className="open-positions">
        <h4>Open Positions</h4>
        {openPositions.length === 0 ? (
          <p>No open positions</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Entry</th>
                <th>Current</th>
                <th>P&L</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {openPositions.map(position => {
                const currentPrice = marketData[position.symbol]?.price || position.entryPrice;
                const pnl = position.side === 'buy' 
                  ? (currentPrice - position.entryPrice) * position.quantity
                  : (position.entryPrice - currentPrice) * position.quantity;
                
                return (
                  <tr key={position.id}>
                    <td>{position.symbol}</td>
                    <td>{position.quantity}</td>
                    <td>${position.entryPrice.toFixed(2)}</td>
                    <td>${currentPrice.toFixed(2)}</td>
                    <td className={pnl >= 0 ? 'profit' : 'loss'}>
                      ${pnl.toFixed(2)}
                    </td>
                    <td>
                      <button onClick={() => onClosePosition(position.id)}>
                        Close
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PortfolioSummary;