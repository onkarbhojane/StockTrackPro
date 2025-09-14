import React, { useState, useEffect, useRef } from 'react';

const TradingChartPro = () => {
  const [activeTimeframe, setActiveTimeframe] = useState('30m');
  const [activeTool, setActiveTool] = useState('crosshair');
  const [price, setPrice] = useState(41250.75);
  const [priceDirection, setPriceDirection] = useState('up');
  const [drawings, setDrawings] = useState([]);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [emaLines, setEmaLines] = useState([
    { period: 9, color: '#2962ff', visible: true },
    { period: 21, color: '#ff6d00', visible: true },
    { period: 50, color: '#00c853', visible: true }
  ]);
  const [showEmaSettings, setShowEmaSettings] = useState(false);
  const [editingEmaIndex, setEditingEmaIndex] = useState(null);
  const chartContainerRef = useRef(null);

  // Generate random candlestick data
  const generateCandleData = () => {
    const data = [];
    let currentPrice = 40000;
    const currentTime = Date.now();
    
    for (let i = 0; i < 50; i++) {
      const time = currentTime - (50 - i) * 60000; // 1 minute intervals
      const change = (Math.random() - 0.5) * 200;
      const open = currentPrice;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 100;
      const low = Math.min(open, close) - Math.random() * 100;
      
      data.push({
        time: time / 1000,
        open,
        high,
        low,
        close
      });
      
      currentPrice = close;
    }
    
    return data;
  };

  const [candleData, setCandleData] = useState(generateCandleData());

  // Calculate EMA data for a given period
  const calculateEMA = (period) => {
    if (candleData.length < period) return [];
    
    const k = 2 / (period + 1);
    const emaData = [];
    
    // Calculate SMA for first value
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += candleData[i].close;
    }
    emaData.push(sum / period);
    
    // Calculate EMA for subsequent values
    for (let i = period; i < candleData.length; i++) {
      const ema = candleData[i].close * k + emaData[i - period] * (1 - k);
      emaData.push(ema);
    }
    
    return emaData;
  };

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCandleData(prevData => {
        const newData = [...prevData];
        const lastCandle = {...newData[newData.length - 1]};
        const change = (Math.random() - 0.5) * 200;
        
        lastCandle.time = Date.now() / 1000;
        lastCandle.open = lastCandle.close;
        lastCandle.close = lastCandle.open + change;
        lastCandle.high = Math.max(lastCandle.open, lastCandle.close) + Math.random() * 100;
        lastCandle.low = Math.min(lastCandle.open, lastCandle.close) - Math.random() * 100;
        
        newData.push(lastCandle);
        newData.shift(); // Remove the first element to maintain fixed number of candles
        
        setPrice(lastCandle.close);
        setPriceDirection(lastCandle.close >= lastCandle.open ? 'up' : 'down');
        
        return newData;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle mouse events for drawing tools
  const handleMouseDown = (e) => {
    if (activeTool === 'crosshair') return;
    
    const rect = chartContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentDrawing({
      type: activeTool,
      points: [x, y],
      color: '#FF9800',
      width: 2
    });
  };

  const handleMouseMove = (e) => {
    if (!currentDrawing) return;
    
    const rect = chartContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentDrawing(prev => ({
      ...prev,
      points: [...prev.points.slice(0, 2), x, y]
    }));
  };

  const handleMouseUp = () => {
    if (!currentDrawing) return;
    
    setDrawings(prev => [...prev, currentDrawing]);
    setCurrentDrawing(null);
  };

  // Add a new EMA line
  const addEmaLine = () => {
    setEmaLines(prev => [
      ...prev,
      { period: 20, color: getRandomColor(), visible: true }
    ]);
  };

  // Remove an EMA line
  const removeEmaLine = (index) => {
    setEmaLines(prev => prev.filter((_, i) => i !== index));
  };

  // Update EMA line settings
  const updateEmaLine = (index, field, value) => {
    setEmaLines(prev => 
      prev.map((ema, i) => 
        i === index ? { ...ema, [field]: value } : ema
      )
    );
  };

  // Generate a random color
  const getRandomColor = () => {
    const colors = [
      '#2962ff', '#ff6d00', '#00c853', '#aa00ff', '#ffd600', 
      '#00b8d4', '#ff1744', '#3d5afe', '#f50057', '#651fff'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Render individual candles
  const renderCandles = () => {
    if (!candleData.length) return null;
    
    const containerWidth = chartContainerRef.current ? chartContainerRef.current.offsetWidth : 800;
    const containerHeight = 400;
    const candleWidth = 10;
    const spacing = 2;
    const totalWidth = candleData.length * (candleWidth + spacing);
    const scaleX = containerWidth / totalWidth;
    
    // Find min and max values for scaling
    const lowValues = candleData.map(candle => candle.low);
    const highValues = candleData.map(candle => candle.high);
    const minVal = Math.min(...lowValues);
    const maxVal = Math.max(...highValues);
    const range = maxVal - minVal;
    const scaleY = containerHeight / range;
    
    return candleData.map((candle, index) => {
      const x = index * (candleWidth + spacing) * scaleX;
      const isGreen = candle.close >= candle.open;
      const bodyHeight = Math.abs(candle.close - candle.open) * scaleY;
      const bodyTop = containerHeight - (Math.max(candle.open, candle.close) - minVal) * scaleY;
      const wickTop = containerHeight - (candle.high - minVal) * scaleY;
      const wickBottom = containerHeight - (candle.low - minVal) * scaleY;
      
      return (
        <g key={index}>
          {/* Wick */}
          <line
            x1={x + candleWidth * scaleX / 2}
            y1={wickTop}
            x2={x + candleWidth * scaleX / 2}
            y2={wickBottom}
            stroke={isGreen ? '#26a69a' : '#ef5350'}
            strokeWidth="1"
          />
          
          {/* Body */}
          <rect
            x={x}
            y={bodyTop}
            width={candleWidth * scaleX}
            height={Math.max(bodyHeight, 1)}
            fill={isGreen ? '#26a69a' : '#ef5350'}
          />
        </g>
      );
    });
  };

  // Render EMA lines
  const renderEmaLines = () => {
    return emaLines.map((ema, emaIndex) => {
      if (!ema.visible) return null;
      
      const emaData = calculateEMA(ema.period);
      if (emaData.length === 0) return null;
      
      const containerWidth = chartContainerRef.current ? chartContainerRef.current.offsetWidth : 800;
      const containerHeight = 400;
      const candleWidth = 10;
      const spacing = 2;
      const totalWidth = candleData.length * (candleWidth + spacing);
      const scaleX = containerWidth / totalWidth;
      
      // Find min and max values for scaling
      const lowValues = candleData.map(candle => candle.low);
      const highValues = candleData.map(candle => candle.high);
      const minVal = Math.min(...lowValues);
      const maxVal = Math.max(...highValues);
      const range = maxVal - minVal;
      const scaleY = containerHeight / range;
      
      const points = emaData.map((value, index) => {
        const x = index * (candleWidth + spacing) * scaleX + (candleWidth * scaleX / 2);
        const y = containerHeight - (value - minVal) * scaleY;
        return `${x},${y}`;
      }).join(' ');
      
      return (
        <polyline
          key={emaIndex}
          points={points}
          fill="none"
          stroke={ema.color}
          strokeWidth="2"
          onDoubleClick={() => {
            setEditingEmaIndex(emaIndex);
            setShowEmaSettings(true);
          }}
        />
      );
    });
  };

  // Render drawing tools
  const renderDrawings = () => {
    return [...drawings, currentDrawing].filter(Boolean).map((drawing, index) => {
      const [x1, y1, x2, y2] = drawing.points;
      
      switch (drawing.type) {
        case 'line':
          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2 || x1}
              y2={y2 || y1}
              stroke={drawing.color}
              strokeWidth={drawing.width}
            />
          );
        case 'horizontal':
          return (
            <line
              key={index}
              x1={0}
              y1={y1}
              x2={chartContainerRef.current?.offsetWidth || 800}
              y2={y1}
              stroke={drawing.color}
              strokeWidth={drawing.width}
              strokeDasharray="5,5"
            />
          );
        case 'vertical':
          return (
            <line
              key={index}
              x1={x1}
              y1={0}
              x2={x1}
              y2={400}
              stroke={drawing.color}
              strokeWidth={drawing.width}
              strokeDasharray="5,5"
            />
          );
        case 'ray':
          const slope = (y2 - y1) / (x2 - x1);
          const extendedX = chartContainerRef.current?.offsetWidth || 800;
          const extendedY = y1 + slope * (extendedX - x1);
          
          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={extendedX}
              y2={extendedY}
              stroke={drawing.color}
              strokeWidth={drawing.width}
            />
          );
        default:
          return null;
      }
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>TradingChart Pro</div>
        <div style={styles.symbolInfo}>
          <span>BTC/USD</span>
          <span style={{...styles.price, ...styles[priceDirection]}}>${price.toFixed(2)}</span>
          <span style={{...styles.change, ...styles[priceDirection]}}>
            {priceDirection === 'up' ? '+2.35%' : '-2.35%'}
          </span>
        </div>
        <div style={styles.controls}>
          {['1D', '1W', '1M', '3M', '1Y'].map(timeframe => (
            <button
              key={timeframe}
              style={timeframe === '1W' ? {...styles.btn, ...styles.btnActive} : styles.btn}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>
      
      <div style={styles.mainContent}>
        <div style={styles.chartContainer}>
          <div style={styles.chartHeader}>
            <div style={styles.timeframes}>
              {['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'].map(timeframe => (
                <div
                  key={timeframe}
                  style={activeTimeframe === timeframe ? {...styles.timeframeBtn, ...styles.timeframeBtnActive} : styles.timeframeBtn}
                  onClick={() => setActiveTimeframe(timeframe)}
                >
                  {timeframe}
                </div>
              ))}
            </div>
            <div style={styles.ohlc}>
              <div style={styles.ohlcItem}>
                <div style={styles.ohlcLabel}>O</div>
                <div style={{...styles.ohlcValue, color: '#9ca2b3'}}>41,120.50</div>
              </div>
              <div style={styles.ohlcItem}>
                <div style={styles.ohlcLabel}>H</div>
                <div style={{...styles.ohlcValue, color: '#26a69a'}}>41,350.20</div>
              </div>
              <div style={styles.ohlcItem}>
                <div style={styles.ohlcLabel}>L</div>
                <div style={{...styles.ohlcValue, color: '#ef5350'}}>41,080.30</div>
              </div>
              <div style={styles.ohlcItem}>
                <div style={styles.ohlcLabel}>C</div>
                <div style={{...styles.ohlcValue, color: '#26a69a'}}>41,250.75</div>
              </div>
            </div>
          </div>
          
          <div 
            style={styles.chart} 
            ref={chartContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <svg width="100%" height="400">
              <rect width="100%" height="100%" fill="#1e222d" />
              {renderCandles()}
              {renderEmaLines()}
              {renderDrawings()}
            </svg>
          </div>
          
          <div style={styles.chartOverlay}>
            <div style={styles.drawingTools}>
              {[
                { icon: '╋', title: 'Crosshair', id: 'crosshair' },
                { icon: '∕', title: 'Line Tool', id: 'line' },
                { icon: '═', title: 'Horizontal Line', id: 'horizontal' },
                { icon: '║', title: 'Vertical Line', id: 'vertical' },
                { icon: '→', title: 'Ray', id: 'ray' },
              ].map(tool => (
                <div
                  key={tool.id}
                  style={activeTool === tool.id ? {...styles.drawingBtn, ...styles.drawingBtnActive} : styles.drawingBtn}
                  title={tool.title}
                  onClick={() => setActiveTool(tool.id)}
                >
                  {tool.icon}
                </div>
              ))}
            </div>
            <button 
              style={styles.overlayBtn}
              onClick={() => setDrawings([])}
            >
              Clear All
            </button>
            <button 
              style={styles.overlayBtn}
              onClick={() => setShowEmaSettings(true)}
            >
              EMA Settings
            </button>
          </div>
          
          <div style={styles.candleInfo}>
            <div>BTC/USD • 1W</div>
            <div>O: 41,120.50</div>
            <div>H: 41,350.20</div>
            <div>L: 41,080.30</div>
            <div>C: 41,250.75</div>
          </div>
        </div>
        
        <div style={styles.toolsPanel}>
          <div style={styles.panelSection}>
            <div style={styles.panelTitle}>Drawing Tools</div>
            {[
              { icon: '╋', name: 'Crosshair', id: 'crosshair' },
              { icon: '∕', name: 'Line', id: 'line' },
              { icon: '═', name: 'Horizontal Line', id: 'horizontal' },
              { icon: '║', name: 'Vertical Line', id: 'vertical' },
              { icon: '→', name: 'Ray', id: 'ray' },
            ].map(tool => (
              <div
                key={tool.id}
                style={activeTool === tool.id ? {...styles.toolBtn, ...styles.toolBtnActive} : styles.toolBtn}
                onClick={() => setActiveTool(tool.id)}
              >
                <div style={styles.toolIcon}>{tool.icon}</div>
                <span>{tool.name}</span>
              </div>
            ))}
          </div>
          
          <div style={styles.panelSection}>
            <div style={styles.panelTitle}>Indicators</div>
            <div style={styles.indicatorsList}>
              {[
                'Moving Average',
                'Exponential Moving Average',
                'Bollinger Bands',
                'Relative Strength Index (RSI)',
                'MACD',
                'Stochastic Oscillator',
                'Volume'
              ].map(indicator => (
                <div key={indicator} style={styles.indicatorItem}>
                  {indicator}
                </div>
              ))}
            </div>
          </div>
          
          <div style={styles.panelSection}>
            <div style={styles.panelTitle}>Candlestick Patterns</div>
            <div style={styles.indicatorsList}>
              {[
                'Doji',
                'Hammer',
                'Engulfing',
                'Evening Star',
                'Morning Star',
                'Three White Soldiers'
              ].map(pattern => (
                <div key={pattern} style={styles.indicatorItem}>
                  {pattern}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div style={styles.footer}>
        <div>Chart powered by TradingChart Pro</div>
        <div>OVERNIGHT: BTC $40,250 - $42,100</div>
        <div>VOL: 28.5K BTC</div>
      </div>

      {/* EMA Settings Modal */}
      {showEmaSettings && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>EMA Settings</h3>
              <button 
                style={styles.closeButton}
                onClick={() => {
                  setShowEmaSettings(false);
                  setEditingEmaIndex(null);
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.modalContent}>
              {emaLines.map((ema, index) => (
                <div key={index} style={styles.emaSetting}>
                  <div style={styles.emaHeader}>
                    <span>EMA {ema.period}</span>
                    <div>
                      <button 
                        style={styles.smallButton}
                        onClick={() => setEditingEmaIndex(editingEmaIndex === index ? null : index)}
                      >
                        Edit
                      </button>
                      <button 
                        style={{...styles.smallButton, ...styles.dangerButton}}
                        onClick={() => removeEmaLine(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  {editingEmaIndex === index && (
                    <div style={styles.emaForm}>
                      <div style={styles.formGroup}>
                        <label>Period:</label>
                        <input
                          type="number"
                          value={ema.period}
                          onChange={(e) => updateEmaLine(index, 'period', parseInt(e.target.value))}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label>Color:</label>
                        <input
                          type="color"
                          value={ema.color}
                          onChange={(e) => updateEmaLine(index, 'color', e.target.value)}
                          style={styles.colorInput}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label>
                          <input
                            type="checkbox"
                            checked={ema.visible}
                            onChange={(e) => updateEmaLine(index, 'visible', e.target.checked)}
                          />
                          Visible
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <button 
                style={styles.addButton}
                onClick={addEmaLine}
              >
                + Add EMA Line
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '10px',
    backgroundColor: '#131722',
    color: '#d1d4dc',
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#1e222d',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#2962ff',
  },
  symbolInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  price: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  change: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '14px',
  },
  up: {
    color: '#26a69a',
  },
  down: {
    color: '#ef5350',
  },
  controls: {
    display: 'flex',
    gap: '8px',
  },
  btn: {
    backgroundColor: '#2a2e39',
    color: '#d1d4dc',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  btnActive: {
    backgroundColor: '#2962ff',
    color: 'white',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    gap: '15px',
    overflow: 'hidden',
  },
  chartContainer: {
    flex: 1,
    backgroundColor: '#1e222d',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  chartHeader: {
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #2a2e39',
  },
  timeframes: {
    display: 'flex',
    gap: '8px',
  },
  timeframeBtn: {
    padding: '6px 10px',
    backgroundColor: '#2a2e39',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  timeframeBtnActive: {
    backgroundColor: '#2962ff',
    color: 'white',
  },
  ohlc: {
    display: 'flex',
    gap: '15px',
  },
  ohlcItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  ohlcValue: {
    fontWeight: 'bold',
  },
  ohlcLabel: {
    fontSize: '11px',
    color: '#9ca2b3',
  },
  chart: {
    flex: 1,
    padding: '15px',
    cursor: 'crosshair',
  },
  toolsPanel: {
    width: '250px',
    backgroundColor: '#1e222d',
    borderRadius: '8px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflowY: 'auto',
  },
  panelSection: {
    paddingBottom: '15px',
    borderBottom: '1px solid #2a2e39',
  },
  panelTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#bbbfc8',
  },
  toolBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    backgroundColor: '#2a2e39',
    borderRadius: '4px',
    marginBottom: '8px',
    cursor: 'pointer',
  },
  toolBtnActive: {
    backgroundColor: '#2962ff',
  },
  toolIcon: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  indicatorItem: {
    padding: '8px 10px',
    backgroundColor: '#2a2e39',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    backgroundColor: '#1e222d',
    borderRadius: '8px',
    marginTop: '15px',
    fontSize: '14px',
  },
  chartOverlay: {
    position: 'absolute',
    top: '70px',
    left: '15px',
    zIndex: 10,
    display: 'flex',
    gap: '10px',
  },
  overlayBtn: {
    backgroundColor: 'rgba(30, 34, 45, 0.8)',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  drawingTools: {
    display: 'flex',
    gap: '5px',
    backgroundColor: 'rgba(30, 34, 45, 0.8)',
    padding: '5px',
    borderRadius: '4px',
  },
  drawingBtn: {
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2e39',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  drawingBtnActive: {
    backgroundColor: '#2962ff',
  },
  candleInfo: {
    position: 'absolute',
    right: '15px',
    top: '70px',
    backgroundColor: 'rgba(30, 34, 45, 0.8)',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '12px',
    zIndex: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    backgroundColor: '#2a2e39',
    borderRadius: '8px',
    padding: '20px',
    width: '400px',
    maxWidth: '90%',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#d1d4dc',
    fontSize: '24px',
    cursor: 'pointer',
  },
  modalContent: {
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  emaSetting: {
    backgroundColor: '#1e222d',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '10px',
  },
  emaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: '#2962ff',
    color: 'white',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginLeft: '5px',
  },
  dangerButton: {
    backgroundColor: '#ef5350',
  },
  emaForm: {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #2a2e39',
  },
  formGroup: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  input: {
    backgroundColor: '#2a2e39',
    border: '1px solid #3d4457',
    borderRadius: '4px',
    color: '#d1d4dc',
    padding: '4px 8px',
    marginLeft: '10px',
    width: '60px',
  },
  colorInput: {
    marginLeft: '10px',
    width: '30px',
    height: '30px',
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
  },
  addButton: {
    backgroundColor: '#26a69a',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '10px',
  },
};

export default TradingChartPro;