import { useState } from "react";
import { addBet } from "../api";

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

const labelClass = "text-xs font-semibold uppercase tracking-widest text-slate-500";

const toggleLabelClass =
  "inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-indigo-400";

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
    bonus: false,
    is_arbitrage: false,
    arb_group_id: "",
    guaranteed_profit: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        odds: parseFloat(form.odds),
        stake: parseFloat(form.stake),
        bonus: form.bonus ? parseFloat(form.stake) : 0.0,
        is_arbitrage: !!form.is_arbitrage,
        arb_group_id: form.arb_group_id ? parseInt(form.arb_group_id, 10) : null,
        guaranteed_profit: form.guaranteed_profit
          ? parseFloat(form.guaranteed_profit)
          : null,
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
        bonus: false,
        is_arbitrage: false,
        arb_group_id: "",
        guaranteed_profit: "",
      });
    } catch (err) {
      console.error("❌ Error adding bet:", err.response?.data || err.message);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-card">
      <header className="mb-6 flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-100">Add New Bet</h2>
        <p className="text-sm text-slate-400">
          Capture the wager details and track performance instantly across the dashboard.
        </p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="bet-date">
              Date
            </label>
            <input
              id="bet-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="bet-sportsbook">
              Sportsbook
            </label>
            <select
              id="bet-sportsbook"
              value={form.sportsbook}
              onChange={(e) => setForm({ ...form, sportsbook: e.target.value })}
              className={inputClass}
              required
            >
              <option value="">Select Sportsbook</option>
              <option value="Fanduel">Fanduel</option>
              <option value="DraftKings">DraftKings</option>
              <option value="Bet365">Bet365</option>
              <option value="HardRock Bet">HardRock Bet</option>
              <option value="ESPNBet">ESPNBet</option>
              <option value="Fanatics">Fanatics</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="bet-league">
              League
            </label>
            <select
              id="bet-league"
              value={form.league}
              onChange={(e) => setForm({ ...form, league: e.target.value })}
              className={inputClass}
              required
            >
              <option value="">Select League</option>
              <option value="MLB">MLB</option>
              <option value="NFL">NFL</option>
              <option value="NCAA">NCAA</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="bet-market">
              Market
            </label>
            <select
              id="bet-market"
              value={form.market}
              onChange={(e) => setForm({ ...form, market: e.target.value })}
              className={inputClass}
              required
            >
              <option value="">Select Market</option>
              <option value="Moneyline">Moneyline</option>
              <option value="Spread">Spread</option>
              <option value="Total O/U">Total O/U</option>
              <option value="Props">Props</option>
              <option value="Parlay">Parlay</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="bet-pick">
              Pick
            </label>
            <input
              id="bet-pick"
              type="text"
              placeholder="e.g. Yankees ML"
              value={form.pick}
              onChange={(e) => setForm({ ...form, pick: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="bet-odds">
              Odds
            </label>
            <input
              id="bet-odds"
              type="number"
              placeholder="-110"
              value={form.odds}
              onChange={(e) => setForm({ ...form, odds: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="bet-stake">
              Stake
            </label>
            <input
              id="bet-stake"
              type="number"
              placeholder="50"
              value={form.stake}
              onChange={(e) => setForm({ ...form, stake: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="bet-result">
              Result
            </label>
            <select
              id="bet-result"
              value={form.result}
              onChange={(e) => setForm({ ...form, result: e.target.value })}
              className={inputClass}
              required
            >
              <option value="">Result</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="push">Push</option>
              <option value="open">Open</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className={toggleLabelClass} htmlFor="bet-bonus">
            <input
              id="bet-bonus"
              type="checkbox"
              checked={form.bonus}
              onChange={(e) => setForm({ ...form, bonus: e.target.checked })}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900/70 text-indigo-400 focus:ring-indigo-400"
            />
            Bonus Bet
          </label>

          <label className={toggleLabelClass} htmlFor="bet-arbitrage">
            <input
              id="bet-arbitrage"
              type="checkbox"
              checked={form.is_arbitrage}
              onChange={(e) => setForm({ ...form, is_arbitrage: e.target.checked })}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900/70 text-indigo-400 focus:ring-indigo-400"
            />
            Arbitrage Bet
          </label>

          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="bet-arb-group">
              Group ID
            </label>
            <input
              id="bet-arb-group"
              type="number"
              placeholder="e.g. 12"
              value={form.arb_group_id}
              onChange={(e) => setForm({ ...form, arb_group_id: e.target.value })}
              className={`${inputClass} max-w-[140px]`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="bet-guaranteed">
              Guaranteed Profit
            </label>
            <input
              id="bet-guaranteed"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.guaranteed_profit}
              onChange={(e) =>
                setForm({ ...form, guaranteed_profit: e.target.value })
              }
              className={`${inputClass} max-w-[160px]`}
            />
          </div>

          <button
            type="submit"
            className="ml-auto rounded-lg border border-indigo-500/60 bg-indigo-500/20 px-5 py-2 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/30"
          >
            Add Bet
          </button>
        </div>
      </form>
    </section>
  );
}
