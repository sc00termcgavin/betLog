// src/components/BetForm.jsx
import { useState } from "react";
import { addBet } from "../api";

export default function BetForm({ onNewBet }) {
  const [form, setForm] = useState({
    date: "",
    sportsbook: "",
    league: "",
    market: "",
    pick: "",
    odds: "",
    stake: "",
    result: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
        ...form,
        odds: parseFloat(form.odds),
        stake: parseFloat(form.stake),
        };
        const res = await addBet(payload);
        onNewBet(res.data);
        setForm({
        date: "",
        sportsbook: "",
        league: "",
        market: "",
        pick: "",
        odds: "",
        stake: "",
        result: "",
        });
    } catch (err) {
        console.error("❌ Error adding bet:", err.response?.data || err.message);
    }
    };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      {Object.keys(form).map((field) => (
        <input
          key={field}
          type={field === "date" ? "date" : "text"}
          name={field}
          placeholder={field}
          value={form[field]}
          onChange={handleChange}
          required
          style={{ marginRight: "0.5rem" }}
        />
      ))}
      <button type="submit">Add Bet</button>
    </form>
  );
}