import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { AddStock, ResetTransaction } from "../../Redux/Features/StocksCart";

const StockTransaction = () => {
  const navigate = useNavigate();
  const transaction = useSelector((state) => state.StockCart.Transaction);
  const dispatch = useDispatch();
  const [count, setCount] = useState(10);

  // Format currency values
  const formatCurrency = (value) => {
    if (typeof value !== "number") return "N/A";
    return `$${value.toFixed(2)}`;
  };

  // Get token from cookies
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  // Navigation blocking effect
  useEffect(() => {
    window.history.pushState(null, "", "/");
    const preventBack = () => window.history.pushState(null, "", "/");
    window.addEventListener("popstate", preventBack);
    return () => window.removeEventListener("popstate", preventBack);
  }, []);

  // Transaction handling effect
  useEffect(() => {
    const handleTransaction = async () => {
      if (!transaction?.Symbol) return;

      try {
        await axios.post(
          "https://stocktrackpro-2.onrender.com/stock/Transaction",
          { transaction },
          {
            headers: {
              Authorization: `Bearer ${cookieToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        dispatch(
          AddStock({
            Symbol: transaction.Symbol,
            Quantity: transaction.Quantity,
            price: transaction.avgPrice,
          })
        );
      } catch (error) {
        console.error("Transaction error:", error);
      }
    };

    handleTransaction();
  }, [transaction, cookieToken, dispatch]);

  // Auto-redirect timer effect
  useEffect(() => {
    const autoRedirectTimer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 10000);

    const countdownInterval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(autoRedirectTimer);
      clearInterval(countdownInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <CheckCircleIcon className="h-20 w-20 text-green-500 animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Transaction Completed Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Your stock transaction has been verified and processed
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>
          {transaction ? (
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">
                      {transaction.Symbol || "N/A"}
                    </span>
                    <span
                      className={`ml-2 text-sm px-2 py-1 rounded ${
                        transaction.type === "BUY"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.type || "UNKNOWN"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 font-medium">
                      {formatCurrency(transaction.estimatedCost)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.Quantity || 0} shares @{" "}
                      {formatCurrency(transaction.avgPrice)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(transaction.date || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">No transaction details found</div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/", { replace: true })}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Back to Dashboard
          </button>
          <p className="mt-4 text-gray-500">
            Redirecting to dashboard in {count} seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockTransaction;