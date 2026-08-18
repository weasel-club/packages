import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { applyColorScheme } from "./theme";
import "./styles.css";

applyColorScheme();
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", applyColorScheme);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
