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

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            📊 Bet Tracker
          </h1>
          <p className="text-sm text-slate-400 sm:text-base">
            Monitor your wagers, spot arbitrage plays, and keep tabs on bankroll
            performance.
          </p>
        </header>
        <BetForm onNewBet={(bet) => setBets((prev) => [...prev, bet])} />
        <BetTable
          bets={bets}
          onDelete={(id) => setBets((prev) => prev.filter((b) => b.id !== id))}
          onUpdate={(updated) =>
            setBets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
          }
        />
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-card">
          <AIDemo />
        </section>
      </div>
    </div>
  );
}
