import React,{ useState } from 'react'
// import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Frontpage from './Components/FrontPage/FrontPage'
import LineChart from './Components/Chart/LineChart'
import Profile from './Components/Profile/Profile'
import Dashboard from './Components/Dashboard/Dashboard'
import { Line } from 'react-chartjs-2'
import AllStocks from './Components/AllStocks.jsx'
import Calculator from './Components/Calculators/Calculator.jsx'
import TradingView from './Components/Chart/TradingView.jsx'
import OTP from './Components/Chart/OTP.jsx'
import StockTransaction from './Components/Chart/StockTransaction.jsx'
import Main from './Components/Knowledge Center/Main.jsx'
import StockNews from './Demo.jsx'
import  MarketNewsPage   from './Components/MarketNews/MarketNews.jsx'
import SocialShare from './Components/Common/Share.jsx'
import AlgoTrading from './Components/AlgoTrading/AlgoTrade.jsx'
import PaperTrading from './Components/PaperTrading/PaperTrading.jsx'
import TradingChartPro from './Components/AlgoTrading/Charts/TradingChartPro.jsx'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path='/' element={<Frontpage/>}/>
        <Route index path='/news' element={<MarketNewsPage/>}/>
        <Route index path='/AlgoTrade' element={<AlgoTrading/>}/>
        <Route path='/stock/:symbol' element={<LineChart/>}/>
        <Route path='/user/profile' element={<Profile/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/allStocks' element={<AllStocks/>}/>
        <Route path='/calculators' element={<Calculator/>}/>
        <Route path='/trading' element={<TradingView/>}/>
        <Route path='/dd' element={<StockNews/>}/>
        <Route path='/buy/verification' element={<OTP/>}/>
        <Route path ='/stock/verification/done' element={<StockTransaction/>}/>
        <Route path='/knowledge_center' element={<Main/>}/>
        <Route path='/AlgoTrade/candlestick' element={<TradingChartPro/>}/>
        <Route path='/paper' element={<PaperTrading/>}/>
        {/* <Route path='*' element={<h1>Page is in the Development state</h1>}/> */}
        <Route path='/demo' element={<SocialShare url={'https://www.example.com'} title={'Example Title'}/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
