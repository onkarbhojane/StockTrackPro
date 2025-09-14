import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TradingViewWidget from './components/TradingViewWidget';
import StrategyControls from './components/StrategyControls';
import PortfolioSummary from './components/PortfolioSummary';
import TradeHistory from './components/TradeHistory';
import MarketDataFeed from './components/MarketDataFeed';

const PaperTrading = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [balance, setBalance] = useState(100000);
  const [portfolio, setPortfolio] = useState([]);
  const [openPositions, setOpenPositions] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [strategies, setStrategies] = useState([]);
  const [activeStrategy, setActiveStrategy] = useState(null);

  // const isLoggedIn = useSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    const sampleStrategies = [
      {
        id: '1',
        name: 'EMA Crossover',
        description: 'Buys when 9-EMA crosses above 21-EMA, sells when below',
        type: 'trend-following',
        params: { emaShort: 9, emaLong: 21 }
      },
    ];
    setStrategies(sampleStrategies);
  }, []);

  return (
    <div className="p-5 font-sans">
      {/* Tabs */}
      <div className="mb-5 flex gap-3">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('strategies')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Strategies
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Trade History
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 h-[500px] bg-white rounded-lg p-4 shadow">
            <TradingViewWidget symbol="IREDA" />
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <StrategyControls
              strategies={strategies}
              onStrategySelect={setActiveStrategy}
              onExecuteTrade={(trade) => {
                const newPosition = {
                  id: Date.now(),
                  symbol: trade.symbol,
                  quantity: trade.quantity,
                  entryPrice: marketData[trade.symbol]?.price || 0,
                  side: trade.side,
                  timestamp: new Date().toISOString()
                };
                setOpenPositions([...openPositions, newPosition]);
                setBalance(
                  balance - (trade.quantity * (marketData[trade.symbol]?.price || 0))
                );
              }}
            />
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <PortfolioSummary
              balance={balance}
              openPositions={openPositions}
              marketData={marketData}
              onClosePosition={(positionId) => {
                const position = openPositions.find(p => p.id === positionId);
                if (position) {
                  const currentPrice = marketData[position.symbol]?.price || position.entryPrice;
                  const pnl =
                    position.side === 'buy'
                      ? (currentPrice - position.entryPrice) * position.quantity
                      : (position.entryPrice - currentPrice) * position.quantity;

                  setBalance(balance + pnl);
                  setOpenPositions(openPositions.filter(p => p.id !== positionId));
                  setPortfolio([
                    ...portfolio,
                    { ...position, exitPrice: currentPrice, pnl }
                  ]);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Strategies Tab */}
      {activeTab === 'strategies' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Strategies</h2>
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium text-lg">{strategy.name}</h3>
                <p className="text-gray-600 text-sm">{strategy.description}</p>
              </div>
              <button
                onClick={() => setActiveStrategy(strategy)}
                className={`px-3 py-1 rounded ${
                  activeStrategy?.id === strategy.id
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {activeStrategy?.id === strategy.id ? 'Active' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Trade History Tab */}
      {activeTab === 'history' && <TradeHistory trades={portfolio} />}

      {/* Market Data Feed (runs in background) */}
      <MarketDataFeed
        symbols={['IREDA', 'MSFT', 'GOOGL']}
        onDataUpdate={(data) =>
          setMarketData((prev) => ({ ...prev, ...data }))
        }
      />
    </div>
  );
};

export default PaperTrading;
