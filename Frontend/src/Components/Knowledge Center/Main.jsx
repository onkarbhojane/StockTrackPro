import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaYoutube,
  FaBook,
  FaPodcast,
  FaHome,
  FaGraduationCap,
} from "react-icons/fa";

const Main = () => {
  const navigate = useNavigate();
  const categories = [
    "SIP",
    "Mutual Fund",
    "Personal Finance",
    "Stock Market",
    "Best Broker",
    "Fundamental Analysis",
    "Technical Analysis",
    "History",
    "How to Choose Best Stocks",
    "Insurances",
  ];

  const [activeCategory, setActiveCategory] = useState("SIP");
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const encodedCategory = encodeURIComponent(activeCategory);
        const response = await axios.get(
          `https://stocktrackpro-ozwl.onrender.com/service/knowledge_center?search=${encodedCategory}`
        );
        setContent(response.data.videos || []);
        setError(null);
      } catch (err) {
        setError("Failed to load content. Please try again later.");
        console.error("Error fetching knowledge content:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [activeCategory]);

  const handleWatchVideo = (videoUrl) => {
    window.open(videoUrl, "_blank", "noopener,noreferrer");
  };

  // Updated nav items with larger icon size
  const navItems = [
    { name: "Home", icon: <FaHome className="text-xl" />, path: "/" },
    {
      name: "Courses",
      icon: <FaGraduationCap className="text-xl" />,
      path: "/courses",
    },
    {
      name: "Podcast",
      icon: <FaPodcast className="text-xl" />,
      path: "/podcast",
    },
    { name: "Books", icon: <FaBook className="text-xl" />, path: "/books" },
    { name: "Blog", icon: <FaBook className="text-xl" />, path: "/blog" },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Main Navigation Bar with larger icons */}
      <nav className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {" "}
            {/* Increased height */}
            {/* Brand Logo/Name */}
            <div className="flex items-center">
              <span
                className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent cursor-pointer"
                onClick={() => navigate("/")}
              >
                StockTrack Pro
              </span>
            </div>
            {/* Navigation Links with larger icons and spacing */}
            <div className="hidden md:flex items-center space-x-10">
              {" "}
              {/* Increased spacing */}
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center text-gray-600 hover:text-emerald-600 transition-colors font-medium text-sm group"
                >
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    {" "}
                    {/* Larger icons */}
                    {item.icon}
                  </div>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
            {/* CTA Button */}
            <button
              className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-full hover:from-emerald-700 hover:to-blue-700 transition-colors text-sm font-medium flex items-center"
              onClick={() => navigate("/community")}
            >
              <span className="mr-2">👋</span> {/* Added emoji icon */}
              Join Community
            </button>
          </div>
        </div>
      </nav>

      {/* Category Navigation */}
      <header className="sticky top-16 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    activeCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  #{category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading content...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {content.length > 0 ? (
              content.map((item) => (
                <article
                  key={item.videoId}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    <div className="md:w-1/3 lg:w-1/4 relative">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-auto object-cover rounded-lg aspect-video"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaYoutube className="text-red-600 text-4xl opacity-90" />
                      </div>
                    </div>
                    <div className="md:w-2/3 lg:w-3/4 space-y-4">
                      <h2 className="text-xl font-bold text-gray-800">
                        {item.title}
                      </h2>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600 line-clamp-3">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {item.duration || "Duration not available"}
                        </span>
                        <button
                          onClick={() => handleWatchVideo(item.videoUrl)}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full flex items-center transition-colors"
                        >
                          <FaYoutube className="mr-2" />
                          Watch Video
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No videos found for this category
                </h3>
                <p className="text-gray-500 mb-4">
                  Try selecting a different category or check back later
                </p>
                <button
                  onClick={() => setActiveCategory("Stock Market")}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Browse Stock Market Videos
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="bg-gray-900 text-white py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-semibold mb-4">StockTrack Pro</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your comprehensive market analysis and trading companion.
              </p>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                {["Documentation", "Tutorials", "API", "Help Center"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                {["About", "Careers", "Privacy Policy", "Terms of Service"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Newsletter & Social */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4 mb-4">
                {/* Replace hrefs with real links */}
                {["twitter", "instagram", "linkedin"].map((platform) => (
                  <a
                    href="#"
                    key={platform}
                    className="text-gray-400 hover:text-white"
                  >
                    <i className={`fab fa-${platform} text-xl`}></i>
                  </a>
                ))}
              </div>
              <p className="text-sm text-gray-400 mb-2">
                Subscribe to our newsletter
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-3 py-2 w-full text-sm rounded-l bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r text-sm font-medium transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <hr className="border-gray-700 mt-10" />
          <p className="text-center text-sm text-gray-500 mt-6">
            © {new Date().getFullYear()} StockTrack Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Main;
