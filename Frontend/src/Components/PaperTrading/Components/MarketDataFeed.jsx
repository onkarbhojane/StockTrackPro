import React, { useEffect } from 'react';

const MarketDataFeed = ({ symbols, onDataUpdate }) => {
  useEffect(() => {
    // Simulate real-time market data updates
    const interval = setInterval(() => {
      const updatedData = {};
      symbols.forEach(symbol => {
        updatedData[symbol] = {
          price: Math.random() * 100 + 100, // Random price between 100-200
          timestamp: new Date().toISOString()
        };
      });
      onDataUpdate(updatedData);
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [symbols, onDataUpdate]);

  return null; // This is a background service component
};

export default MarketDataFeed;