import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// FOUC prevention: apply stored theme before React mounts
(() => {
  const stored = localStorage.getItem("matango-theme");
  if (stored === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
