import React, { useState, useEffect } from "react";
import Navbar from "../FrontPage/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { AddStock } from "../../Redux/Features/StocksCart";
import { login, logout } from "../../Redux/Features/AuthSlice";
import axios from "axios";
import { FaChartLine, FaMoneyBillWave, FaPercentage, FaCalendarAlt, FaCalculator } from "react-icons/fa";

const Calculator = () => {
  const [activeCalculator, setActiveCalculator] = useState("SIP");
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const state = useSelector((state) => state);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cookieToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
    
        if (cookieToken) {
          const response = await axios.get(
            'https://ai-script-writter-website.onrender.com/api/user/profiledata', 
            {
              headers: {
                Authorization: `Bearer ${cookieToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          const userData = {
            Name: response.data.data.Name || '',
            EmailID: response.data.data.EmailID || '',
            PhoneNo: response.data.data.PhoneNo || '0',
            Stocks: response.data.data.Stocks || [],
            TotalAmount: response.data.data.TotalAmount || 0,
            WalletAmount: response.data.data.WalletAmount || 0,
            isVerified: response.data.data.isVerified || false,
            netProfit: response.data.data.netProfit || 0,
            annualReturn: response.data.data.annualReturn || 0
          };
          
          response.data.data.Stocks.forEach((stock) => {
            dispatch(AddStock({
              symbol: stock.symbol,
              quantity: stock.quantity,
              avgPrice: stock.avgPrice,
              totalInvested: stock.totalInvested,
              lastUpdated: new Date().toISOString(),
              currentPrice: stock.avgPrice
            }));
          });
          
          dispatch(login({
            user: userData,
            token: cookieToken
          }));
        }
      } catch (error) {
        console.error('Authentication error:', error);
        dispatch(logout());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar display="sticky" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar display="sticky" />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Financial Calculators</h1>
            <p className="text-gray-600">Plan your finances with our comprehensive calculator tools</p>
            
            <div className="flex gap-3 overflow-x-auto py-4 scrollbar-hide">
              {[
                { id: "SIP", label: "SIP Calculator", icon: <FaChartLine className="mr-2" /> },
                { id: "FD", label: "Fixed Deposit", icon: <FaMoneyBillWave className="mr-2" /> },
                { id: "LumpSum", label: "Lump Sum", icon: <FaMoneyBillWave className="mr-2" /> },
                { id: "GST", label: "GST Calculator", icon: <FaPercentage className="mr-2" /> },
                { id: "EMI", label: "EMI Calculator", icon: <FaCalculator className="mr-2" /> }
              ].map((calc) => (
                <button
                  key={calc.id}
                  onClick={() => setActiveCalculator(calc.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${
                    activeCalculator === calc.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {calc.icon}
                  {calc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {activeCalculator === "SIP" && <SIPCalculator />}
            {activeCalculator === "FD" && <FDCalculator />}
            {activeCalculator === "LumpSum" && <LumpSumCalculator />}
            {activeCalculator === "GST" && <GSTCalculator />}
            {activeCalculator === "EMI" && <EMICalculator />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced FD Calculator with more features
const FDCalculator = () => {
  const [principal, setPrincipal] = useState(100000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [tenure, setTenure] = useState(5);
  const [compounding, setCompounding] = useState("Monthly");
  const [taxRate, setTaxRate] = useState(10);
  const [showTax, setShowTax] = useState(false);

  const calculateFD = () => {
    const rate = interestRate / 100;
    let n = 1;
    if (compounding === "Monthly") n = 12;
    if (compounding === "Quarterly") n = 4;
    if (compounding === "Half-Yearly") n = 2;

    const amount = principal * Math.pow(1 + rate / n, n * tenure);
    const interest = amount - principal;
    const tax = showTax ? interest * (taxRate / 100) : 0;
    
    return {
      maturityValue: amount,
      interestEarned: interest,
      taxAmount: tax,
      netAmount: amount - tax
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Fixed Deposit Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Deposit Amount (₹)</label>
            <div className="relative">
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                className="w-full text-black pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute left-3 top-3.5 text-gray-500">₹</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Interest Rate (% p.a.)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={interestRate}
                onChange={(e) => setInterestRate(Math.min(20, Math.max(0, Number(e.target.value))))}
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-3.5 text-gray-500">%</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Tenure (years)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="30"
                value={tenure}
                onChange={(e) => setTenure(Math.min(30, Math.max(1, Number(e.target.value))))}
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-3.5 text-gray-500">Years</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Compounding Frequency</label>
            <select
              value={compounding}
              onChange={(e) => setCompounding(e.target.value)}
              className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {["Monthly", "Quarterly", "Half-Yearly", "Yearly"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="includeTax"
              checked={showTax}
              onChange={() => setShowTax(!showTax)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeTax" className="text-sm text-gray-700">
              Include Tax Deduction (TDS)
            </label>
          </div>

          {showTax && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Math.min(30, Math.max(0, Number(e.target.value))))}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-3.5 text-gray-500">%</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">FD Projection</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-700">Maturity Value</p>
                <p className="text-xs text-gray-500">Total amount at maturity</p>
              </div>
              <p className="font-medium text-blue-700">
                {formatCurrency(calculateFD().maturityValue)}
              </p>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-700">Interest Earned</p>
                <p className="text-xs text-gray-500">Before tax deduction</p>
              </div>
              <p className="font-medium text-green-600">
                +{formatCurrency(calculateFD().interestEarned)}
              </p>
            </div>

            {showTax && (
              <>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div>
                    <p className="text-gray-700">Tax Deducted</p>
                    <p className="text-xs text-gray-500">TDS @ {taxRate}%</p>
                  </div>
                  <p className="font-medium text-red-600">
                    -{formatCurrency(calculateFD().taxAmount)}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-700 font-medium">Net Amount</p>
                    <p className="text-xs text-gray-500">After tax deduction</p>
                  </div>
                  <p className="font-bold text-blue-800">
                    {formatCurrency(calculateFD().netAmount)}
                  </p>
                </div>
              </>
            )}

            <div className="pt-4 text-sm text-gray-600">
              <p>FD Interest Calculation Formula:</p>
              <p className="font-mono text-xs mt-1 bg-gray-100 p-2 rounded">
                A = P × (1 + r/n)<sup>(n×t)</sup>
              </p>
              <p className="mt-2">Where:</p>
              <ul className="text-xs space-y-1 mt-1">
                <li>A = Maturity amount</li>
                <li>P = Principal amount</li>
                <li>r = Annual interest rate (decimal)</li>
                <li>n = Compounding frequency per year</li>
                <li>t = Time in years</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced LumpSum Calculator
const LumpSumCalculator = () => {
  const [investment, setInvestment] = useState(100000);
  const [returnRate, setReturnRate] = useState(12);
  const [years, setYears] = useState(10);
  const [inflationRate, setInflationRate] = useState(6);
  const [showInflation, setShowInflation] = useState(false);

  const calculateLumpSum = () => {
    const futureValue = investment * Math.pow(1 + returnRate / 100, years);
    const realValue = showInflation 
      ? futureValue / Math.pow(1 + inflationRate / 100, years)
      : futureValue;
    
    return {
      futureValue,
      realValue,
      returns: futureValue - investment,
      cagr: (Math.pow(futureValue / investment, 1 / years) - 1) * 100
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return value.toFixed(2) + "%";
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lump Sum Investment Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Investment Amount (₹)</label>
            <div className="relative">
              <input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(Math.max(0, Number(e.target.value)))}
                className="w-full text-black pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute left-3 top-3.5 text-gray-500">₹</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Expected Return Rate (% p.a.)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={returnRate}
                onChange={(e) => setReturnRate(Math.max(0, Number(e.target.value)))}
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-3.5 text-gray-500">%</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Investment Period (years)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="50"
                value={years}
                onChange={(e) => setYears(Math.min(50, Math.max(1, Number(e.target.value))))}
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-3.5 text-gray-500">Years</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="includeInflation"
              checked={showInflation}
              onChange={() => setShowInflation(!showInflation)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeInflation" className="text-sm text-gray-700">
              Adjust for Inflation
            </label>
          </div>

          {showInflation && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Inflation Rate (% p.a.)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Math.max(0, Number(e.target.value)))}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-3.5 text-gray-500">%</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Investment Projection</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-700">Future Value</p>
                <p className="text-xs text-gray-500">Nominal value</p>
              </div>
              <p className="font-medium text-blue-700">
                {formatCurrency(calculateLumpSum().futureValue)}
              </p>
            </div>

            {showInflation && (
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <p className="text-gray-700">Real Value</p>
                  <p className="text-xs text-gray-500">Today's purchasing power</p>
                </div>
                <p className="font-medium text-purple-700">
                  {formatCurrency(calculateLumpSum().realValue)}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-700">Estimated Returns</p>
                <p className="text-xs text-gray-500">Wealth gained</p>
              </div>
              <p className="font-medium text-green-600">
                +{formatCurrency(calculateLumpSum().returns)}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-700">CAGR</p>
                <p className="text-xs text-gray-500">Annualized return</p>
              </div>
              <p className="font-medium text-blue-700">
                {formatPercentage(calculateLumpSum().cagr)}
              </p>
            </div>

            <div className="pt-4 text-sm text-gray-600">
              <p>Lump Sum Calculation Formula:</p>
              <p className="font-mono text-xs mt-1 bg-gray-100 p-2 rounded">
                FV = PV × (1 + r)<sup>n</sup>
              </p>
              <p className="mt-2">Where:</p>
              <ul className="text-xs space-y-1 mt-1">
                <li>FV = Future Value</li>
                <li>PV = Present Value</li>
                <li>r = Rate of return per period</li>
                <li>n = Number of periods</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced SIP Calculator
const SIPCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);
  const [stepUpPercentage, setStepUpPercentage] = useState(10);
  const [isStepUp, setIsStepUp] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);
  const [showInflation, setShowInflation] = useState(false);

  const calculateSIP = () => {
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;
    const futureValue =
      monthlyInvestment *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);

    return futureValue;
  };

  const calculateStepUpSIP = () => {
    let currentInvestment = monthlyInvestment;
    let totalValue = 0;
    const monthlyRate = annualReturn / 100 / 12;

    for (let year = 1; year <= years; year++) {
      const monthsRemaining = (years - year + 1) * 12;
      const yearFV =
        currentInvestment *
        ((Math.pow(1 + monthlyRate, monthsRemaining) - 1) / monthlyRate) *
        (1 + monthlyRate);
      totalValue += yearFV;
      currentInvestment *= 1 + stepUpPercentage / 100;
    }

    return totalValue;
  };

  const calculateTotalInvested = () => {
    if (isStepUp) {
      return (monthlyInvestment *
        12 *
        (Math.pow(1 + stepUpPercentage / 100, years) - 1)) /
        (stepUpPercentage / 100);
    }
    return monthlyInvestment * years * 12;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatEMI = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalInvested = calculateTotalInvested();
  const futureValue = isStepUp ? calculateStepUpSIP() : calculateSIP();
  const realValue = showInflation 
    ? futureValue / Math.pow(1 + inflationRate / 100, years)
    : futureValue;
  const returns = futureValue - totalInvested;
  const cagr = (Math.pow(futureValue / totalInvested, 1 / years) - 1) * 100;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">SIP Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsStepUp(false)}
              className={`p-3 rounded-lg font-medium transition-all ${
                !isStepUp
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Regular SIP
            </button>
            <button
              onClick={() => setIsStepUp(true)}
              className={`p-3 rounded-lg font-medium transition-all ${
                isStepUp
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Step-Up SIP
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Monthly Investment (₹)</label>
            <div className="relative">
              <input
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Math.max(0, Number(e.target.value)))}
                className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute left-3 top-3.5 text-gray-500">₹</span>
            </div>
          </div>

          {isStepUp && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Annual Step-Up (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={stepUpPercentage}
                  onChange={(e) => setStepUpPercentage(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-3.5 text-gray-500">%</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Expected Return (% p.a.)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-3.5 text-gray-500">%</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Investment Period (years)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="50"
                value={years}
                onChange={(e) => setYears(Math.min(50, Math.max(1, Number(e.target.value))))}
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-3.5 text-gray-500">Years</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="includeInflationSIP"
              checked={showInflation}
              onChange={() => setShowInflation(!showInflation)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeInflationSIP" className="text-sm text-gray-700">
              Adjust for Inflation
            </label>
          </div>

          {showInflation && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Inflation Rate (% p.a.)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Math.max(0, Number(e.target.value)))}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-3.5 text-gray-500">%</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {isStepUp ? "Step-Up SIP Projection" : "Regular SIP Projection"}
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-700">Invested Amount</p>
                <p className="text-xs text-gray-500">Total principal</p>
              </div>
              <p className="font-medium text-blue-700">
                {formatCurrency(totalInvested)}
              </p>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-700">Future Value</p>
                <p className="text-xs text-gray-500">Nominal value</p>
              </div>
              <p className="font-medium text-green-600">
                {formatCurrency(futureValue)}
              </p>
            </div>

            {showInflation && (
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <p className="text-gray-700">Real Value</p>
                  <p className="text-xs text-gray-500">Today's purchasing power</p>
                </div>
                <p className="font-medium text-purple-700">
                  {formatCurrency(realValue)}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-700">Estimated Returns</p>
                <p className="text-xs text-gray-500">Wealth gained</p>
              </div>
              <p className="font-medium text-green-600">
                +{formatCurrency(returns)}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-700">CAGR</p>
                <p className="text-xs text-gray-500">Annualized return</p>
              </div>
              <p className="font-medium text-blue-700">
                {cagr.toFixed(2)}%
              </p>
            </div>

            {isStepUp && (
              <div className="mt-4 text-sm text-blue-800 bg-blue-100 p-3 rounded-lg">
                <p className="font-medium">Step-Up Calculation:</p>
                <p className="mt-1">Your monthly investment increases by {stepUpPercentage}% every year</p>
                <p className="mt-1 text-xs">
                  Final monthly investment: {formatCurrency(monthlyInvestment * Math.pow(1 + stepUpPercentage/100, years-1))}
                </p>
              </div>
            )}

            <div className="pt-4 text-sm text-gray-600">
              <p>SIP Calculation Formula:</p>
              <p className="font-mono text-xs mt-1 bg-gray-100 p-2 rounded">
                FV = P × [ (1 + r)<sup>n</sup> - 1 ] × (1 + r) / r
              </p>
              <p className="mt-2">Where:</p>
              <ul className="text-xs space-y-1 mt-1">
                <li>FV = Future Value</li>
                <li>P = Periodic investment amount</li>
                <li>r = Rate of return per period</li>
                <li>n = Total number of payments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GSTCalculator = () => {
  const [amount, setAmount] = useState(1000);
  const [gstRate, setGstRate] = useState(18);
  const [isAddMode, setIsAddMode] = useState(true);
  const [gstType, setGstType] = useState("Regular");
  const [gstSlab, setGstSlab] = useState("18%");

  const gstSlabs = [
    { label: "0% (Exempt)", value: 0 },
    { label: "5%", value: 5 },
    { label: "12%", value: 12 },
    { label: "18%", value: 18 },
    { label: "28%", value: 28 },
  ];

  const calculateGST = () => {
    if (isAddMode) {
      const gstAmount = amount * (gstRate / 100);
      return {
        original: amount,
        gst: gstAmount,
        total: amount + gstAmount,
        cgst: gstType === "Regular" ? gstAmount / 2 : 0,
        sgst: gstType === "Regular" ? gstAmount / 2 : 0,
        igst: gstType === "Inter-State" ? gstAmount : 0
      };
    }
    const original = amount / (1 + gstRate / 100);
    const gstAmount = amount - original;
    return {
      original: original,
      gst: gstAmount,
      total: amount,
      cgst: gstType === "Regular" ? gstAmount / 2 : 0,
      sgst: gstType === "Regular" ? gstAmount / 2 : 0,
      igst: gstType === "Inter-State" ? gstAmount : 0
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleGstSlabChange = (e) => {
    const selectedSlab = gstSlabs.find(slab => slab.label === e.target.value);
    if (selectedSlab) {
      setGstRate(selectedSlab.value);
      setGstSlab(selectedSlab.label);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">GST Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsAddMode(true)}
              className={`p-3 rounded-lg font-medium transition-all ${
                isAddMode
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Add GST
            </button>
            <button
              onClick={() => setIsAddMode(false)}
              className={`p-3 rounded-lg font-medium transition-all ${
                !isAddMode
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Remove GST
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              {isAddMode ? "Original Amount (₹)" : "Total Amount (₹)"}
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full text-black pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute left-3 top-3.5 text-gray-500">₹</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              GST Rate
            </label>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={gstSlab}
                onChange={handleGstSlabChange}
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {gstSlabs.map((slab) => (
                  <option key={slab.label} value={slab.label}>
                    {slab.label}
                  </option>
                ))}
              </select>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="28"
                  value={gstRate}
                  onChange={(e) => {
                    setGstRate(Math.min(28, Math.max(0, Number(e.target.value))));
                    setGstSlab("Custom");
                  }}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-3.5 text-gray-500">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              GST Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setGstType("Regular")}
                className={`p-3 rounded-lg font-medium transition-all ${
                  gstType === "Regular"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Regular (CGST + SGST)
              </button>
              <button
                onClick={() => setGstType("Inter-State")}
                className={`p-3 rounded-lg font-medium transition-all ${
                  gstType === "Inter-State"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Inter-State (IGST)
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            GST Calculation
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-700">
                  {isAddMode ? "Original Amount" : "Net Amount"}
                </p>
                <p className="text-xs text-gray-500">
                  {isAddMode ? "Before GST" : "After GST removal"}
                </p>
              </div>
              <p className="font-medium text-blue-700">
                {formatCurrency(calculateGST().original)}
              </p>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-700">GST Amount</p>
                <p className="text-xs text-gray-500">
                  @ {gstRate}% {gstType === "Regular" ? "(CGST + SGST)" : "(IGST)"}
                </p>
              </div>
              <p className="font-medium text-green-600">
                +{formatCurrency(calculateGST().gst)}
              </p>
            </div>

            {gstType === "Regular" && (
              <>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div>
                    <p className="text-gray-700">CGST</p>
                    <p className="text-xs text-gray-500">Central GST</p>
                  </div>
                  <p className="font-medium text-purple-600">
                    +{formatCurrency(calculateGST().cgst)}
                  </p>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div>
                    <p className="text-gray-700">SGST</p>
                    <p className="text-xs text-gray-500">State GST</p>
                  </div>
                  <p className="font-medium text-purple-600">
                    +{formatCurrency(calculateGST().sgst)}
                  </p>
                </div>
              </>
            )}

            {gstType === "Inter-State" && (
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <p className="text-gray-700">IGST</p>
                  <p className="text-xs text-gray-500">Integrated GST</p>
                </div>
                <p className="font-medium text-purple-600">
                  +{formatCurrency(calculateGST().igst)}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="text-gray-700 font-semibold">
                  {isAddMode ? "Total Amount" : "Original Amount"}
                </p>
                <p className="text-xs text-gray-500">
                  {isAddMode ? "Including GST" : "Before GST was added"}
                </p>
              </div>
              <p className="text-xl font-bold text-blue-700">
                {formatCurrency(calculateGST().total)}
              </p>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>GST Calculation Formula:</p>
              <p className="font-mono text-xs mt-1 bg-gray-100 p-2 rounded">
                {isAddMode 
                  ? "GST Amount = Original Amount × (GST Rate / 100)\nTotal Amount = Original Amount + GST Amount"
                  : "Original Amount = Total Amount / (1 + GST Rate / 100)\nGST Amount = Total Amount - Original Amount"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced EMI Calculator
const EMICalculator = () => {
  const [principal, setPrincipal] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [months, setMonths] = useState(0);
  const [processingFee, setProcessingFee] = useState(1);
  const [includeFee, setIncludeFee] = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);

  const calculateEMI = () => {
    const totalMonths = years * 12 + months;
    const monthlyRate = interestRate / 12 / 100;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return isNaN(emi) ? 0 : emi;
  };

  const calculateTotalPayment = () => {
    const totalMonths = years * 12 + months;
    return calculateEMI() * totalMonths;
  };

  const calculateProcessingFeeAmount = () => {
    return principal * (processingFee / 100);
  };

  const generateAmortizationSchedule = () => {
    const schedule = [];
    let balance = principal;
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = years * 12 + months;
    const emi = calculateEMI();

    for (let i = 1; i <= totalMonths; i++) {
      const interest = balance * monthlyRate;
      const principalPayment = emi - interest;
      balance -= principalPayment;

      schedule.push({
        month: i,
        principal: principalPayment,
        interest: interest,
        balance: balance > 0 ? balance : 0
      });
    }

    return schedule;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatEMI = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (monthsToAdd) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsToAdd);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">EMI Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Loan Amount (₹)
            </label>
            <div className="relative">
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                className="w-full text-black pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute left-3 top-3.5 text-gray-500">₹</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Interest Rate (% p.a.)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={interestRate}
                onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-3.5 text-gray-500">%</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Loan Tenure
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={years}
                  onChange={(e) => setYears(Math.min(30, Math.max(0, Number(e.target.value))))}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-3.5 text-gray-500">Years</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={months}
                  onChange={(e) => setMonths(Math.min(11, Math.max(0, Number(e.target.value))))}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-3.5 text-gray-500">Months</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includeProcessingFee"
                checked={includeFee}
                onChange={() => setIncludeFee(!includeFee)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeProcessingFee" className="text-sm text-gray-700">
                Include Processing Fee
              </label>
            </div>

            {includeFee && (
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={processingFee}
                  onChange={(e) => setProcessingFee(Math.min(5, Math.max(0, Number(e.target.value))))}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-3.5 text-gray-500">%</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="showAmortization"
              checked={showAmortization}
              onChange={() => setShowAmortization(!showAmortization)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showAmortization" className="text-sm text-gray-700">
              Show Amortization Schedule
            </label>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Loan Summary
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-700">Monthly EMI</p>
                <p className="text-xs text-gray-500">Starting {formatDate(1)}</p>
              </div>
              <p className="font-medium text-blue-700">
                {formatEMI(calculateEMI())}
              </p>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-700">Principal Amount</p>
                <p className="text-xs text-gray-500">Loan amount</p>
              </div>
              <p className="font-medium text-blue-700">
                {formatCurrency(principal)}
              </p>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-700">Total Interest</p>
                <p className="text-xs text-gray-500">Over loan tenure</p>
              </div>
              <p className="font-medium text-red-600">
                {formatCurrency(calculateTotalPayment() - principal)}
              </p>
            </div>

            {includeFee && (
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <p className="text-gray-700">Processing Fee</p>
                  <p className="text-xs text-gray-500">One-time charge</p>
                </div>
                <p className="font-medium text-red-600">
                  {formatCurrency(calculateProcessingFeeAmount())}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="text-gray-700 font-semibold">Total Payment</p>
                <p className="text-xs text-gray-500">
                  {years} years {months} months
                </p>
              </div>
              <p className="text-xl font-bold text-blue-700">
                {formatCurrency(
                  calculateTotalPayment() + 
                  (includeFee ? calculateProcessingFeeAmount() : 0)
                )}
              </p>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-600 mb-2">
                Loan will be paid by {formatDate(years * 12 + months)}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, (years * 12 + months) / 30)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAmortization && (
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
          <h3 className="text-lg font-semibold p-4 border-b bg-gray-50 text-gray-800">
            Amortization Schedule
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {generateAmortizationSchedule()
                  .filter((_, index) => index % 12 === 0 || index === generateAmortizationSchedule().length - 1)
                  .map((row) => (
                    <tr key={row.month}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.month} ({formatDate(row.month)})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(row.principal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(row.interest)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right text-sm text-gray-500">
            Showing yearly payments. Total EMIs: {years * 12 + months}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;