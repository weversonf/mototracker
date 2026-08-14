import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.warn("Não foi possível habilitar o modo offline do MotoTracker.", error);
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
