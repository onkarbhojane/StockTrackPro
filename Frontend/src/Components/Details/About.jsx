import React from "react";
import { useNavigate } from "react-router-dom";
import profile from "../../assets/CEO.png";
import mission from '../../assets/mission.jpg';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 text-black">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1
              className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate("/")}
            >
              StockTrack Pro
            </h1>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-r from-emerald-50/70 to-blue-50/70">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-4">
            About StockTrack Pro
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Empowering investors with intelligent tools and insights
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Mission Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-emerald-600 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                At StockTrack Pro, we're dedicated to democratizing access to
                professional-grade stock market tools. Our mission is to empower
                investors of all levels with the insights and analytics they need
                to make informed decisions.
              </p>
              <button
                className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                onClick={() => navigate("/Dashboard")}
              >
                Explore Features
              </button>
            </div>
            <div className="bg-white p-2 rounded-xl shadow-lg overflow-hidden h-full">
              <img
                src={mission}
                alt="Our Mission"
                className="w-full h-full object-cover rounded-lg"
                style={{ minHeight: '300px' }}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-emerald-600 mb-8 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-emerald-100">
              <div className="text-emerald-600 mb-4 bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Real-time Market Data
              </h3>
              <p className="text-gray-600">
                Access up-to-the-minute stock prices and market trends.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-emerald-100">
              <div className="text-emerald-600 mb-4 bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Advanced Analytics
              </h3>
              <p className="text-gray-600">
                Comprehensive tools for portfolio analysis and risk assessment.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-emerald-100">
              <div className="text-emerald-600 mb-4 bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Customizable Alerts
              </h3>
              <p className="text-gray-600">
                Personalized notifications for important market movements.
              </p>import Dashboard from './../Dashboard/Dashboard';

            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-emerald-600 mb-8 text-center">
            Meet Our Team
          </h2>
          <div className="flex justify-center">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md border border-emerald-100">
              <div className="relative inline-block mb-4">
                <img
                  src={profile}
                  alt="Onkar Bhojane"
                  className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-emerald-100 shadow-md"
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  CEO & Founder
                </div>
              </div>
              <h4 className="text-2xl font-semibold text-gray-800 mt-6">Onkar Bhojane</h4>
              <p className="text-emerald-600 font-medium">CEO & Founder</p>
              <p className="text-gray-600 mt-4">
                Leading the vision to democratize investment tools for everyone.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600 mb-2">
            &copy; 2023 StockTrack Pro. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Disclaimer: StockTrack Pro does not provide investment advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;