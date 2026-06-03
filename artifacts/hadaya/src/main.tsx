import { createRoot } from "react-dom/client";
import { setBaseUrl, setApiKey } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Use VITE_API_URL if set explicitly; otherwise fall back to relative URLs
// so the Vite dev proxy (/api → localhost:8080) handles routing automatically.
const apiUrl: string | null = import.meta.env.VITE_API_URL ?? null;
setBaseUrl(apiUrl);

// Attach API key header to every outgoing request when provided.
// Set VITE_API_KEY in your environment to enable.
setApiKey(import.meta.env.VITE_API_KEY ?? null);

createRoot(document.getElementById("root")!).render(<App />);
