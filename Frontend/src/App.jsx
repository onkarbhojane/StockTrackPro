import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Common Imports
import Frontpage from './Components/FrontPage/FrontPage';
import LineChart from './Components/Chart/LineChart';
import Profile from './Components/Profile/Profile';
import Dashboard from './Components/Dashboard/Dashboard';
import AllStocks from './Components/AllStocks.jsx';
// import TradingView from './Components/Chart/TradingView.jsx';
import OTP from './Components/Chart/OTP.jsx';
import StockTransaction from './Components/Chart/StockTransaction.jsx';
import Main from './Components/Knowledge Center/Main.jsx';
import StockNews from './Demo.jsx';

// From first App.js
// import SIPCalculator from './Components/Stock/SIP.jsx';
import About from './Components/Details/About.jsx';
import Courses from './Components/Tools/Courses.jsx';
import Books from './Components/Tools/Books.jsx';
import PDFViewer from './Components/Tools/PDFViewer.jsx';
// import CandleStick from './Components/Chart/CandleStick.jsx';
import HelpCenter from './Components/Details/HelpCenter.jsx';
import Documentation from './Components/Details/Documentation.jsx';
// import PortfolioBuilder from './Components/Portfolio Builder/PortfolioBuilder.jsx';
// import PaperTrading from './Components/Paper Trading/PaperTrading.jsx';
// import TradingAnalysis from './Components/Trading Analysis/TradingAnalysis.jsx';
// import Portfolio from './Portfolio.jsx';

// From second App.js
import Calculator from './Components/Calculators/Calculator.jsx';
import MarketNewsPage from './Components/MarketNews/MarketNews.jsx';
import SocialShare from './Components/Common/Share.jsx';
import AlgoTrading from './Components/AlgoTrading/AlgoTrade.jsx';
// import PaperTradingPro from './Components/PaperTrading/PaperTrading.jsx'; // alias to avoid duplicate
import TradingChartPro from './Components/AlgoTrading/Charts/TradingChartPro.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route index path='/' element={<Frontpage />} />

        {/* Stocks */}
        <Route path='/stock/:symbol' element={<LineChart />} />
        {/* <Route path='/candlestick/:symbol' element={<CandleStick />} /> */}
        <Route path='/allStocks' element={<AllStocks />} />

        {/* User */}
        <Route path='/user/profile' element={<Profile />} />
        <Route path='/dashboard' element={<Dashboard />} />

        {/* Tools */}
        {/* <Route path='/sip' element={<SIPCalculator />} /> */}
        <Route path='/calculators' element={<Calculator />} />
        <Route path='/courses' element={<Courses />} />
        <Route path='/books' element={<Books />} />
        <Route path='/read' element={<PDFViewer />} />

        {/* Trading */}
        {/* <Route path='/trading' element={<TradingView />} /> */}
        <Route path='/buy/verification' element={<OTP />} />
        <Route path='/sell/verification' element={<OTP />} />
        <Route path='/stock/verification/done' element={<StockTransaction />} />
        {/* <Route path='/portfolio-builder' element={<PortfolioBuilder />} /> */}
        {/* <Route path='/paper-trading' element={<PaperTrading />} /> */}
        {/* <Route path='/paper' element={<PaperTradingPro />} /> */}
        {/* <Route path='/trading-analysis' element={<TradingAnalysis />} /> */}
        <Route path='/AlgoTrade' element={<AlgoTrading />} />
        {/* <Route path='/AlgoTrade/candlestick' element={<TradingChartPro />} /> */}

        {/* Knowledge & Info */}
        <Route path='/knowledge_center' element={<Main />} />
        <Route path='/news' element={<MarketNewsPage />} />
        <Route path='/dd' element={<StockNews />} />

        {/* Misc */}
        <Route path='/about' element={<About />} />
        <Route path='/help-center' element={<HelpCenter />} />
        <Route path='/documentation' element={<Documentation />} />
        {/* <Route path='/port' element={<Portfolio />} /> */}
        <Route
          path='/demo'
          element={<SocialShare url={'https://www.example.com'} title={'Example Title'} />}
        />

        {/* Catch-all */}
        <Route path='*' element={<h1>Page is in the Development state</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
