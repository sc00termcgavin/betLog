// src/api.js
import axios from "axios";

const API = axios.create({ baseURL: "http://127.0.0.1:8000" });

export const fetchBets = () => API.get("/bets/");   // ✅ add slash
export const addBet = (bet) => API.post("/bets/", bet); // ✅ add slash

export const deleteBet = (id) => API.delete(`/bets/${id}`);