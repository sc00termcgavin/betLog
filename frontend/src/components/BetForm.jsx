// // src/components/BetForm.jsx
// import { useState } from "react";
// import { addBet } from "../api";

// export default function BetForm({ onNewBet }) {
//   const [form, setForm] = useState({
//     date: "",
//     sportsbook: "",
//     league: "",
//     market: "",
//     pick: "",
//     odds: "",
//     stake: "",
//     result: "",
//     bonus: false, // ✅ default false
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//         const payload = {
//         ...form,
//         odds: parseFloat(form.odds),
//         stake: parseFloat(form.stake),
//         };
//         const res = await addBet(payload);
//         onNewBet(res.data);
//         setForm({
//         date: "",
//         sportsbook: "",
//         league: "",
//         market: "",
//         pick: "",
//         odds: "",
//         stake: "",
//         result: "",
//         });
//     } catch (err) {
//         console.error("❌ Error adding bet:", err.response?.data || err.message);
//     }
//     };

//   return (
//     <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
//       {Object.keys(form).map((field) => (
//         <input
//           key={field}
//           type={field === "date" ? "date" : "text"}
//           name={field}
//           placeholder={field}
//           value={form[field]}
//           onChange={handleChange}
//           required
//           style={{ marginRight: "0.5rem" }}
//         />
//       ))}
//       <button type="submit">Add Bet</button>
//     </form>
//   );
// }
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
    bonus: false, // ✅ default false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        odds: parseFloat(form.odds),
        stake: parseFloat(form.stake),
        bonus: form.bonus ? parseFloat(form.stake) : 0.0, // ✅ send stake as bonus amount if checked
      };
      const res = await addBet(payload);
      onNewBet(res.data);
      // Reset form
      setForm({
        date: "",
        sportsbook: "",
        league: "",
        market: "",
        pick: "",
        odds: "",
        stake: "",
        result: "",
        bonus: false,
      });
    } catch (err) {
      console.error("❌ Error adding bet:", err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        required
      />
        <select
          name="sportsbook"
          value={form.sportsbook}
          onChange={handleChange}
          required
          style={{ marginRight: "0.5rem" }}
        >
          <option value="">Select Sportsbook</option>
          <option value="Fanduel">Fanduel</option>
          <option value="DraftKings">DraftKings</option>
          <option value="Bet365">Bet365</option>
          <option value="HardRock Bet">HardRock Bet</option>
          <option value="ESPNBet">ESPNBet</option>
          <option value="Fanatics">Fanatics</option>
        </select>
      <select
        name="league"
        value={form.league}
        onChange={handleChange}
        required
        style={{ marginRight: "0.5rem" }}
      >
        <option value="">Select League</option>
        <option value="MLB">MLB</option>
        <option value="NFL">NFL</option>
      </select>
      <input
        type="text"
        name="market"
        placeholder="Market"
        value={form.market}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="pick"
        placeholder="Pick"
        value={form.pick}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="odds"
        placeholder="Odds"
        value={form.odds}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="stake"
        placeholder="Stake"
        value={form.stake}
        onChange={handleChange}
        required
      />
      <select
        name="result"
        value={form.result}
        onChange={handleChange}
        required
      >
        <option value="">Result</option>
        <option value="win">Win</option>
        <option value="loss">Loss</option>
        <option value="push">Push</option>
        <option value="open">Open</option>
      </select>
      {/* ✅ Bonus bet checkbox */}
      <label style={{ marginLeft: "1rem" }}>
        <input
          type="checkbox"
          name="bonus"
          checked={form.bonus}
          onChange={handleChange}
        />
        Bonus Bet
      </label>
      <button type="submit" style={{ marginLeft: "1rem" }}>
        Add Bet
      </button>
    </form>
  );
}