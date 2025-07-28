import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stockList: [],
  Transactions: [],
  Transaction: {},
};

const StockSlice = createSlice({
  name: "stockCart",
  initialState,
  reducers: {
    AddStock: (state, action) => {
      const existingStock = state.stockList.find(
        (stock) => stock.symbol === action.payload.symbol
      );

      if (existingStock) {
        // Update existing stock
        existingStock.quantity += action.payload.quantity;
        existingStock.totalInvested +=
          action.payload.price * action.payload.quantity;
      } else {
        // Add new stock
        state.stockList.push({
          symbol: action.payload.symbol,
          quantity: action.payload.quantity,
          avgPrice: action.payload.price,
          totalInvested: action.payload.price * action.payload.quantity,
          lastUpdated: new Date().toISOString()
        });
      }

      // Add transaction
      state.Transactions.push({
        type: "BUY",
        symbol: action.payload.symbol,
        quantity: action.payload.quantity,
        price: action.payload.price,
        date: new Date().toISOString(),
      });
    },
    RemoveStock: (state, action) => {
      const index = state.stockList.findIndex(
        (stock) => stock.symbol === action.payload.symbol
      );

      if (index !== -1) {
        // Add transaction before removing
        state.Transactions.push({
          type: "SELL",
          symbol: action.payload.symbol,
          quantity: state.stockList[index].quantity,
          price: action.payload.currentPrice,
          date: new Date().toISOString(),
        });

        state.stockList.splice(index, 1);
      }
    },
    UpdateStockPrice: (state, action) => {
      const stock = state.stockList.find(
        (s) => s.symbol === action.payload.symbol
      );
      if (stock) {
        stock.currentPrice = action.payload.price;
        stock.lastUpdated = new Date().toISOString();
      }
    },

    InitTransaction: (state, action) => {
      state.Transaction = action.payload;
    },
    // In your Redux slice
    clearTransaction: (state) => {
      state.Transaction = null;
    },
    ResetTransaction: (state) => {
      state.Transaction = null;
    },
  },
});

export const { AddStock, RemoveStock, UpdateStockPrice, InitTransaction, ResetTransaction } =
  StockSlice.actions;
export default StockSlice.reducer;
