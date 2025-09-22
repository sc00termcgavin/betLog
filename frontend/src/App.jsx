import { useEffect, useState } from "react";
import { fetchBets } from "./api";
import BetForm from "./components/BetForm";
import BetTable from "./components/BetTable";
import AIDemo from "./components/AIDemo";


export default function App() {
  const [bets, setBets] = useState([]);

  useEffect(() => {
    loadBets();
  }, []);

  const loadBets = async () => {
    const res = await fetchBets();
    setBets(res.data);
  };

  const handleNewBet = (bet) => {
    setBets((prev) => [...prev, bet]);
  };

  const handleDelete = (id) => {
    setBets((prev) => prev.filter((bet) => bet.id !== id));
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>📊 Bet Tracker</h1>
      <BetForm onNewBet={(bet) => setBets((prev) => [...prev, bet])} />
      <BetTable
        bets={bets}
        onDelete={(id) => setBets((prev) => prev.filter((b) => b.id !== id))}
        onUpdate={(updated) =>
          setBets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
        }
      />
      <div style={{ marginTop: "2rem" }}>
        <AIDemo />
      </div>
    </div>
  );
}