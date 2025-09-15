import React from "react";
import { useNavigate } from "react-router-dom";

const Documentation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Navigation */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1
              className="text-2xl font-bold text-emerald-600 cursor-pointer"
              onClick={() => navigate("/")}
            >
              StockTrack Pro
            </h1>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-emerald-600 mb-4">
            Documentation
          </h1>
          <p className="text-gray-600 text-xl">
            Comprehensive guides and resources for StockTrack Pro
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Getting Started Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-emerald-600 mb-8 text-center">
            Getting Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Account Setup",
                icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
                steps: [
                  "Create your account",
                  "Verify your email",
                  "Complete your profile",
                ],
              },
              {
                title: "Dashboard Overview",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                steps: [
                  "Navigate the interface",
                  "Customize your layout",
                  "Access key features",
                ],
              },
              {
                title: "First Steps",
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                steps: [
                  "Add your first stock",
                  "Set up alerts",
                  "Analyze your portfolio",
                ],
              },
            ].map((section, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-emerald-600 mb-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={section.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  {section.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* API Documentation */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-emerald-600 mb-8 text-center">
            API Documentation
          </h2>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-emerald-600 mb-2">
                  Authentication
                </h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>
                    {`POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}`}
                  </code>
                </pre>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-emerald-600 mb-2">
                  Fetch Stock Data
                </h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>
                    {`GET /api/v1/stocks/{symbol}
Authorization: Bearer {token}

Response:
{
  "symbol": "AAPL",
  "price": 145.09,
  "change": "+1.23",
  "percentChange": "+0.85%"
}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-emerald-600 mb-8 text-center">
            Video Tutorials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Getting Started"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
              <h3 className="text-xl font-semibold mt-4 mb-2">
                Introduction to StockTrack Pro
              </h3>
              <p className="text-gray-600">
                Learn the basics of using our platform in just 10 minutes.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Advanced Features"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
              <h3 className="text-xl font-semibold mt-4 mb-2">
                Advanced Features Walkthrough
              </h3>
              <p className="text-gray-600">
                Explore advanced tools and analytics features.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
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

export default Documentation;