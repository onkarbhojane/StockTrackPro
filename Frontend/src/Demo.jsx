import React, { useEffect, useState } from "react";
import axios from "axios";

const StockNews = () => {
  const [news, setNews] = useState([]); // Initialize with an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://stocktrackpro-2.onrender.com/service/stockprice?symbol=IREDA"
        );
        console.log(response.data);
        // You might want to update the state with stockPrice here
        setNews((prevNews) => [...prevNews, { stockPrice: response.data.stockPrice }]);
      } catch (Error) {
        console.log("error in getting price of stock");
        setError("Error fetching data");
      }
    };
    fetchData();

    // Using a loop to make repeated calls with delay
    const fetchMultipleData = () => {
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
        }, i * 2000); // Delay increases by 2 seconds for each call
      }
    };

    fetchMultipleData();

    // Cleanup: reset loading state after all fetches complete
    setLoading(false);

  }, []); // Run only once when the component mounts

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Stock News</h1>
      <div>
        {news.map((item, index) => (
          <div key={index} className="news-item">
            <h3>{`Stock Price: ${item.stockPrice}`}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockNews;
