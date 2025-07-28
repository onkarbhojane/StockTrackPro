import React,{useState} from 'react';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {
  Chart as ChartJS,
  LinearScale,
  TimeScale,
  CategoryScale,
  BarController,
  BarElement,
} from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import ChartjsPluginZoom from 'chartjs-plugin-zoom';

// Register required components
ChartJS.register(
  LinearScale,
  TimeScale,
  CategoryScale,
  BarController,
  BarElement,
  CandlestickController,
  CandlestickElement,
  ChartjsPluginZoom
);
const CandleStickModal = ({ onClose }) => {
  // Sample data - replace with real API data
  const generateSampleData = () => {
    const data = [];
    let date = new Date(2023, 0, 1);
    for (let i = 0; i < 30; i++) {
      const open = 100 + Math.random() * 20;
      const close = open + (Math.random() - 0.5) * 10;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      
      data.push({
        x: new Date(date),
        o: open.toFixed(2),
        h: high.toFixed(2),
        l: low.toFixed(2),
        c: close.toFixed(2),
      });
      
      date.setDate(date.getDate() + 1);
    }
    return data;
  };

  const data = {
    datasets: [
      {
        label: 'Price',
        data: generateSampleData(),
        color: {
          up: '#4CAF50',
          down: '#FF5252',
          unchanged: '#999999',
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM d',
          },
        },
      },
      y: {
        position: 'right',
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'xy',
        },
        pan: {
          enabled: true,
          mode: 'xy',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const data = context.raw;
            return [
              `Open: $${data.o}`,
              `High: $${data.h}`,
              `Low: $${data.l}`,
              `Close: $${data.c}`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl h-3/4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Trading Analysis</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 relative">
          <Chart type="candlestick" data={data} options={options} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Usage example in parent component:
const TradingView = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-4">
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Open Trading Analysis
      </button>
      
      {showModal && <CandleStickModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default TradingView;