import React,{ StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import {store} from './Redux/Store/store.js' // Ensure the correct path
import Main from "./Components/FrontPage/Main.jsx"; // Ensure Main.jsx exists
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <Provider store={store}>
      <App />
    </Provider>
);
