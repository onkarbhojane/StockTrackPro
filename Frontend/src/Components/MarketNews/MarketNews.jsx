import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { ModalContainer } from "../FrontPage/Main";
import {
  FacebookShareButton,
  WhatsappShareButton,
  TwitterShareButton,
  FacebookIcon,
  WhatsappIcon,
  TwitterIcon,
} from "react-share";
import SocialShare from "../Common/Share";
const MarketNewsPage = () => {
  // State management
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [languageFilter, setLanguageFilter] = useState("en");
  const [translating, setTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);

  const navigate = useNavigate();
  const filtersRef = useRef(null);
  const toolsRef = useRef(null);

  const handleSaveForLater = (item) => {
    if (!state.isLogged) {
      setShowAuthModal(true);
    } else {
      navigate("/dashboard");
    }
  };
  // Updated translation function
  const translateWithGroq = async (text, targetLanguage) => {
    if (!text || targetLanguage === "en") return text;

    try {
      const response = await axios.post(
        "http://localhost:3000/api/news/translate",
        {
          text,
          targetLanguage,
        }
      );

      // Handle different response formats
      if (typeof response.data === "string") {
        return response.data;
      } else if (response.data.translation) {
        if (typeof response.data.translation === "string") {
          return response.data.translation;
        } else if (response.data.translation.text) {
          return response.data.translation.text;
        } else if (response.data.translation.content) {
          // Clean up the content if it has extra quotes
          let content = response.data.translation.content;
          if (content.startsWith('"') && content.endsWith('"')) {
            content = content.substring(1, content.length - 1);
          }
          return content;
        }
      }
      return text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  const translateNews = async (targetLanguage) => {
    if (translating || targetLanguage === "English") return;

    setTranslating(true);
    setTranslationProgress(0);

    try {
      const translatedNews = [];
      const totalItems = news.length;

      for (let i = 0; i < totalItems; i++) {
        const item = news[i];
        const translatedItem = { ...item };

        // Translate title if it exists
        if (item.title) {
          translatedItem.title = await translateWithGroq(
            item.title,
            targetLanguage
          );
        }

        // Translate description if it exists
        if (item.description) {
          translatedItem.description = await translateWithGroq(
            item.description,
            targetLanguage
          );
        }

        // Translate snippet if it exists (and different from description)
        if (item.snippet && item.snippet !== item.description) {
          translatedItem.snippet = await translateWithGroq(
            item.snippet,
            targetLanguage
          );
        }

        translatedNews.push(translatedItem);
        setTranslationProgress(Math.floor(((i + 1) / totalItems) * 100));

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setNews(translatedNews);
      setLanguageFilter(targetLanguage);
    } catch (error) {
      console.error("Bulk translation failed:", error);
      setError("Translation failed. Please try again.");
    } finally {
      setTranslating(false);
    }
  };

  // Helper function to get language name from code
  const getLanguageName = (code) => {
    const languages = {
      en: "English",
      hi: "Hindi",
      mr: "Marathi",
      ta: "Tamil",
      ur: "Urdu",
      ja: "Japanese",
    };
    return languages[code] || "English";
  };

  const industries = [
    "Technology",
    "Industrials",
    "Consumer Cyclical",
    "Healthcare",
    "Communication Services",
    "Financial Services",
    "Consumer Defensive",
    "Basic Materials",
    "Real Estate",
    "Energy",
    "Utilities",
    "Financial",
    "Services",
    "Consumer Goods",
    "Industrial Goods",
  ];

  const sentiments = [
    { value: "positive", label: "Positive" },
    { value: "negative", label: "Negative" },
    { value: "neutral", label: "Neutral" },
  ];

  const languages = [
    { value: "English", label: "English" },
    { value: "Hindi", label: "Hindi" },
    { value: "Marathi", label: "Marathi" },
  ];

  // Filter helpers
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedIndustry("");
    setSelectedSentiment("");
    setLanguageFilter("en");
  };
  const state = useSelector((state) => state.Auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGetStarted = () => {
    if (!state.isLogged) {
      setShowAuthModal(true);
    } else {
      navigate("/dashboard");
    }
  };
  const activeFilterCount = [
    selectedIndustry,
    selectedSentiment,
    searchTerm,
    languageFilter !== "en",
  ].filter(Boolean).length;

  // Fetch news data
  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = [];

      if (selectedIndustry)
        queryParams.push(`industries=${encodeURIComponent(selectedIndustry)}`);
      if (selectedSentiment)
        queryParams.push(`sentiment=${encodeURIComponent(selectedSentiment)}`);
      if (searchTerm)
        queryParams.push(`search=${encodeURIComponent(searchTerm)}`);

      const queryString = queryParams.join("&");
      const response = await axios.get(
        `http://localhost:3000/api/news/all?${queryString}`
      );
      setNews(response.data);
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Failed to load news. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchNews();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [selectedIndustry, selectedSentiment, searchTerm]);

  useEffect(() => {
    const scheduledTimes = [
      "08:10",
      "09:10",
      "12:10",
      "15:10",
      "17:10",
      "00:10",
    ];
    const calledTimes = new Set();

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

      if (
        scheduledTimes.includes(currentTime) &&
        !calledTimes.has(currentTime)
      ) {
        fetchNews();
        calledTimes.add(currentTime);
      }

      if (currentTime === "00:00") {
        calledTimes.clear();
      }
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <ModalContainer
      showAuthModal={showAuthModal}
      setShowAuthModal={setShowAuthModal}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <nav className="bg-white shadow-lg fixed w-full z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-8 flex-1">
              <h1
                className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent cursor-pointer"
                onClick={() => navigate("/")}
              >
                StockTrack Pro
              </h1>

              <div className="relative flex-1 max-w-xl">
                <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 space-x-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    className="flex-1 bg-transparent outline-none placeholder-gray-500 text-gray-700"
                    type="text"
                    placeholder="Search news..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setSearchTerm("")}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                      activeFilterCount > 0
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:shadow-lg"
                        : "bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    {activeFilterCount > 0 && (
                      <span className="text-xs font-medium">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Tools Dropdown */}
            <div className="relative ml-4" ref={toolsRef}>
              <button
                className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors shadow-sm hover:shadow-md"
                onClick={() => setIsToolsOpen(!isToolsOpen)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <span>Tools</span>
              </button>

              {isToolsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50">
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => navigate("/news")}
                  >
                    Market News
                  </button>
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => navigate("/calculators")}
                  >
                    Calculators
                  </button>
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => navigate("/trading-analysis")}
                  >
                    Trading Analysis
                  </button>
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => navigate("/paper-trading")}
                  >
                    Paper Trading
                  </button>
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => navigate("/portfolio-builder")}
                  >
                    Portfolio Builder
                  </button>
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => navigate("/knowledge_center")}
                  >
                    Learning Courses
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <div
              ref={filtersRef}
              className="bg-white border-t border-gray-200 px-4 py-3 shadow-inner"
            >
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className="w-full p-2 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-all"
                    >
                      <option value="">All Industries</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sentiment
                    </label>
                    <select
                      value={selectedSentiment}
                      onChange={(e) => setSelectedSentiment(e.target.value)}
                      className="w-full p-2 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-all"
                    >
                      <option value="">All Sentiments</option>
                      {sentiments.map((sentiment) => (
                        <option key={sentiment.value} value={sentiment.value}>
                          {sentiment.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className="w-full p-2 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-all"
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => translateNews(languageFilter)}
                      disabled={translating}
                      className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        translating || languageFilter === "en"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
                      }`}
                    >
                      {translating
                        ? `Translating... ${translationProgress}%`
                        : "Translate News"}
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {activeFilterCount > 0
                      ? `${activeFilterCount} active filter(s)`
                      : "No filters applied"}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Main content */}
        <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Latest Market News
              {languageFilter !== "en" && (
                <span className="ml-2 text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {getLanguageName(languageFilter)}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500">
              {news.length} {news.length === 1 ? "result" : "results"} found
            </p>
          </div>

          {/* Translation Progress Bar */}
          {translating && (
            <div className="mb-6 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${translationProgress}%` }}
              ></div>
            </div>
          )}

          {/* News Results */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-3 text-gray-600">Loading market news...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
                <svg
                  className="mx-auto h-12 w-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-3 text-lg font-medium text-gray-900">
                  Error loading news
                </h3>
                <p className="mt-2 text-gray-500">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all"
                >
                  Retry
                </button>
              </div>
            ) : news.length > 0 ? (
              news.map((item) => (
                <div
                  key={item.uuid || item.id}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {item.image_url && (
                      <div className="w-full md:w-1/3 flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                            {item.title}
                          </h2>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.entities && item.entities[0]?.symbol && (
                              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                {item.entities[0].symbol}
                              </span>
                            )}
                            {item.industry && (
                              <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                {item.industry}
                              </span>
                            )}
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                              {new Date(
                                item.published_at || item.date
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            {item.source && (
                              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                {item.source}
                              </span>
                            )}
                            {item.sentiment_score > 0 && (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                                Positive
                              </span>
                            )}
                            {item.sentiment_score < 0 && (
                              <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                Negative
                              </span>
                            )}
                            {item.sentiment_score === 0 && (
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                Neutral
                              </span>
                            )}
                            {item.relevance_score && (
                              <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                Relevance: {item.relevance_score.toFixed(2)}
                              </span>
                            )}
                            {languageFilter !== "en" && (
                              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                                Translated
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-4 leading-relaxed">
                        {item.description || item.snippet}
                      </p>
                      <div className="mt-6 flex justify-between items-center">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors"
                        >
                          Read full story
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </a>

                        <div className="flex items-center space-x-4">
                          <SocialShare url={item.url} title={item.title} />
                          <button
                            onClick={handleSaveForLater}
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                            title="Save for later"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg max-w-md mx-auto">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-3 text-lg font-medium text-gray-900">
                  No news found
                </h3>
                <p className="mt-2 text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
                <div className="mt-6">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">StockTrack Pro</h3>
                <p className="text-gray-400 text-sm">
                  Your comprehensive market analysis and trading companion.
                </p>
              </div>
              <div>
                <h4 className="text-md font-medium mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Tutorials
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      API
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Help Center
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-md font-medium mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-md font-medium mb-4">Connect</h4>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-4.919-.149-3.227-1.664-4.771-4.919-4.919-1.266-.057-1.645-.069-4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  Subscribe to our newsletter for updates
                </p>
                <div className="mt-2 flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="px-3 py-2 bg-gray-700 text-white rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full text-sm"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-md text-sm font-medium transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-gray-400 text-center">
              <p>
                © {new Date().getFullYear()} StockTrack Pro. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ModalContainer>
  );
};

export default MarketNewsPage;
