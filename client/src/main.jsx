import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { VoicePresenceProvider } from "./context/VoicePresenceContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <VoicePresenceProvider>
      <App />
    </VoicePresenceProvider>
  </BrowserRouter>
);
