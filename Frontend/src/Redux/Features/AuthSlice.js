import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {
        Name: '',
        EmailID: '',
        PhoneNo: '0',
        Stocks: [],
        TotalAmount: 0,
        WalletAmount: 0,
        isVerified: false,
        netProfit: 0,
        annualReturn: 0
    },
    token: '',
    isLogged: false
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.user = {
                Name: action.payload.user.Name,
                EmailID: action.payload.user.EmailID,
                PhoneNo: action.payload.user.PhoneNo,
                Stocks: action.payload.user.Stocks || [],
                TotalAmount: action.payload.user.TotalAmount,
                WalletAmount: action.payload.user.WalletAmount,
                isVerified: action.payload.user.isVerified,
                netProfit: action.payload.user.netProfit || 0,
                annualReturn: action.payload.user.annualReturn || 0
            };
            state.token = action.payload.token;
            state.isLogged = true;
        },
        logout: (state) => {
            state.user = {
                Name: '',
                EmailID: '',
                PhoneNo: '0',
                Stocks: [],
                TotalAmount: 0,
                WalletAmount: 0,
                isVerified: false,
                netProfit: 0,
                annualReturn: 0
            };
            state.token = '';
            state.isLogged = false;
        }
    }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;