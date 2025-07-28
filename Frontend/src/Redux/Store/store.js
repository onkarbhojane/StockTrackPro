import {configureStore} from '@reduxjs/toolkit'

import AuthReducers from '../Features/AuthSlice.js'
import StockReducer from '../Features/StocksCart.js'

export const store=configureStore({
    reducer:{
        Auth:AuthReducers,
        StockCart:StockReducer
    }
})