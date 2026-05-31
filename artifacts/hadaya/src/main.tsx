import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Use VITE_API_URL if set explicitly; otherwise fall back to relative URLs
// so the Vite dev proxy (/api → localhost:8080) handles routing automatically.
const apiUrl: string | null = import.meta.env.VITE_API_URL ?? null;
setBaseUrl(apiUrl);

createRoot(document.getElementById("root")!).render(<App />);
