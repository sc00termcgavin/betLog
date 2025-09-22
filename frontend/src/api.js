// src/api.js
import axios from "axios";

const API = axios.create({ baseURL: "http://127.0.0.1:8000" });

// --- Bets API ---
export const fetchBets = () => API.get("/bets/");   // ✅ keep trailing slash
export const addBet = (bet) => API.post("/bets/", bet);
export const deleteBet = (id) => API.delete(`/bets/${id}`);
export const updateBet = (id, bet) => API.put(`/bets/${id}`, bet);

// --- AI API ---
export const askAI = (prompt) => API.post("/ai", { prompt });