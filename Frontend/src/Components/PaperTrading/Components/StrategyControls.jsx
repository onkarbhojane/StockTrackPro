import React, { useState } from 'react';

const StrategyControls = ({ strategies, onStrategySelect, onExecuteTrade }) => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState(10);
  const [isAutoTrading, setIsAutoTrading] = useState(false);

  const handleManualTrade = (side) => {
    onExecuteTrade({
      symbol: selectedSymbol,
      quantity,
      side
    });
  };

  return (
    <div className="strategy-controls">
      <h3>Trade Controls</h3>
      
      <div className="form-group">
        <label>Symbol:</label>
        <select value={selectedSymbol} onChange={(e) => setSelectedSymbol(e.target.value)}>
          <option value="AAPL">Apple (AAPL)</option>
          <option value="MSFT">Microsoft (MSFT)</option>
          <option value="GOOGL">Google (GOOGL)</option>
        </select>
      </div>

      <div className="form-group">
        <label>Quantity:</label>
        <input 
          type="number" 
          value={quantity} 
          onChange={(e) => setQuantity(parseInt(e.target.value))} 
          min="1"
        />
      </div>

      <div className="trade-buttons">
        <button className="buy-btn" onClick={() => handleManualTrade('buy')}>Buy</button>
        <button className="sell-btn" onClick={() => handleManualTrade('sell')}>Sell</button>
      </div>

      <div className="auto-trading">
        <label>
          <input 
            type="checkbox" 
            checked={isAutoTrading} 
            onChange={() => setIsAutoTrading(!isAutoTrading)} 
          />
          Enable Auto Trading
        </label>
      </div>

      {strategies.length > 0 && (
        <div className="strategy-selection">
          <h4>Active Strategy</h4>
          <select onChange={(e) => onStrategySelect(strategies.find(s => s.id === e.target.value))}>
            <option value="">Select Strategy</option>
            {strategies.map(strategy => (
              <option key={strategy.id} value={strategy.id}>{strategy.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default StrategyControls;