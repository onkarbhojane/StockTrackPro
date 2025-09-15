import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {
        _id: '',
        Name: '',
        EmailID: '',
        PhoneNo: '0',
        Password: '',
        Stocks: [],
        TotalAmount: 0,
        WalletAmount: 0,
        isVerified: false,
        netProfit: 0,
        annualReturn: 0,
        PremiumPurchase: {
            expiryDate: null,
            isPremium: false,
            purchaseDate: null
        },
        Books: [],
        Courses: [],
        SavedNews: [],
        Transactions: [],
        Watchlist: []
    },
    token: '',
    isLogged: false
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            const userData = action.payload.user;

            state.user = {
                _id: userData._id || '',
                Name: userData.Name || '',
                EmailID: userData.EmailID || '',
                PhoneNo: userData.PhoneNo || '0',
                Password: userData.Password || '',
                Stocks: userData.Stocks || [],
                TotalAmount: userData.TotalAmount || 0,
                WalletAmount: userData.WalletAmount || 0,
                isVerified: userData.isVerified || false,
                netProfit: userData.netProfit || 0,
                annualReturn: userData.annualReturn || 0,
                PremiumPurchase: userData.PremiumPurchase || {
                    expiryDate: null,
                    isPremium: false,
                    purchaseDate: null
                },
                Books: userData.Books || [],
                Courses: userData.Courses || [],
                SavedNews: userData.SavedNews || [],
                Transactions: userData.Transactions || [],
                Watchlist: userData.Watchlist || []
            };

            state.token = action.payload.token;
            state.isLogged = true;
        },
        logout: (state) => {
            state.user = {
                _id: '',
                Name: '',
                EmailID: '',
                PhoneNo: '0',
                Password: '',
                Stocks: [],
                TotalAmount: 0,
                WalletAmount: 0,
                isVerified: false,
                netProfit: 0,
                annualReturn: 0,
                PremiumPurchase: {
                    expiryDate: null,
                    isPremium: false,
                    purchaseDate: null
                },
                Books: [],
                Courses: [],
                SavedNews: [],
                Transactions: [],
                Watchlist: []
            };
            state.token = '';
            state.isLogged = false;
        }
    }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
