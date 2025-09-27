import { useMemo, useState } from "react";
import { deleteBet, updateBet } from "../api";
import ArbSummaryCard from "./ArbSummaryCard";

const sportsbookPalette = {
  Fanduel: "border-sportsbook-fanduel/50 bg-sportsbook-fanduel/15 text-sportsbook-fanduel",
  DraftKings: "border-sportsbook-draftkings/50 bg-sportsbook-draftkings/15 text-sportsbook-draftkings",
  Bet365: "border-sportsbook-bet365/50 bg-sportsbook-bet365/15 text-sportsbook-bet365",
  "HardRock Bet": "border-sportsbook-hardrock/50 bg-sportsbook-hardrock/15 text-sportsbook-hardrock",
  ESPNBet: "border-sportsbook-espnbet/50 bg-sportsbook-espnbet/15 text-sportsbook-espnbet",
  Fanatics: "border-sportsbook-fanatics/50 bg-sportsbook-fanatics/15 text-sportsbook-fanatics",
};

const resultTint = {
  win: "bg-emerald-500/15",
  loss: "bg-rose-500/15",
  push: "bg-amber-500/15",
  open: "bg-slate-800/60",
};

const fieldClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

const pillBase =
  "inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-wide";

export default function BetTable({ bets, onDelete, onUpdate }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const marketCounts = useMemo(
    () =>
      bets.reduce((acc, bet) => {
        if (bet.market) {
          acc[bet.market] = (acc[bet.market] || 0) + 1;
        }
        return acc;
      }, {}),
    [bets],
  );

  const sportsbookCounts = useMemo(
    () =>
      bets.reduce((acc, bet) => {
        if (bet.sportsbook) {
          acc[bet.sportsbook] = (acc[bet.sportsbook] || 0) + 1;
        }
        return acc;
      }, {}),
    [bets],
  );

  const totalStake = useMemo(
    () =>
      bets.reduce(
        (sum, bet) => sum + (bet.bonus > 0 ? 0 : parseFloat(bet.stake || 0)),
        0,
      ),
    [bets],
  );

  const totalPnL = useMemo(
    () => bets.reduce((sum, bet) => sum + parseFloat(bet.netPnL || 0), 0),
    [bets],
  );

  const winCount = useMemo(
    () => bets.filter((bet) => (bet.result || "").toLowerCase() === "win").length,
    [bets],
  );

  const finishedCount = useMemo(
    () =>
      bets.filter((bet) =>
        ["win", "loss", "push"].includes((bet.result || "").toLowerCase()),
      ).length,
    [bets],
  );

  const winPct = finishedCount > 0 ? ((winCount / finishedCount) * 100).toFixed(2) : "0.00";
  const roi = totalStake > 0 ? ((totalPnL / totalStake) * 100).toFixed(2) : "0.00";

  const metrics = [
    { label: "Total PnL", value: `$${totalPnL.toFixed(2)}` },
    { label: "Total Stake", value: `$${totalStake.toFixed(2)}` },
    { label: "Win %", value: `${winPct}%` },
    { label: "ROI", value: `${roi}%` },
  ];

  const groupedArbs = useMemo(
    () =>
      bets.reduce((acc, bet) => {
        if (bet.is_arbitrage && bet.arb_group_id) {
          acc[bet.arb_group_id] = acc[bet.arb_group_id] || [];
          acc[bet.arb_group_id].push(bet);
        }
        return acc;
      }, {}),
    [bets],
  );

  const sortedBets = useMemo(() => {
    return [...bets].sort((a, b) => {
      const aDate = a?.date ? new Date(a.date).getTime() : 0;
      const bDate = b?.date ? new Date(b.date).getTime() : 0;

      if (!Number.isNaN(bDate - aDate) && bDate !== aDate) {
        return bDate - aDate;
      }

      const aId = typeof a?.id === "number" ? a.id : 0;
      const bId = typeof b?.id === "number" ? b.id : 0;
      return bId - aId;
    });
  }, [bets]);

  const sortedGroupEntries = useMemo(() => {
    const parseGroupId = (id) => {
      const numeric = Number(id);
      return Number.isNaN(numeric) ? 0 : numeric;
    };

    return Object.entries(groupedArbs).sort(([idA], [idB]) => parseGroupId(idB) - parseGroupId(idA));
  }, [groupedArbs]);

  const handleEditClick = (bet) => {
    setEditId(bet.id);
    setEditForm({ ...bet });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...editForm,
        odds: parseFloat(editForm.odds),
        stake: parseFloat(editForm.stake),
        bonus: editForm.bonus > 0 ? parseFloat(editForm.stake) : 0.0,
        is_arbitrage: Boolean(editForm.is_arbitrage),
        arb_group_id: editForm.arb_group_id ? parseInt(editForm.arb_group_id, 10) : null,
        guaranteed_profit: editForm.guaranteed_profit
          ? parseFloat(editForm.guaranteed_profit)
          : null,
      };
      const res = await updateBet(editId, payload);
      onUpdate(res.data);
      setEditId(null);
    } catch (err) {
      console.error("❌ Error updating bet:", err.response?.data || err.message);
    }
  };

  const handleCancel = () => setEditId(null);

  const handleDelete = async (id) => {
    try {
      await deleteBet(id);
      onDelete(id);
    } catch (err) {
      console.error("❌ Error deleting bet:", err.response?.data || err.message);
    }
  };

  if (!bets || bets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
        <p className="text-sm sm:text-base">No bets yet — add your first wager to see analytics.</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-card"
          >
            <p className="text-xs uppercase tracking-widest text-slate-500">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-100">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-card lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Sportsbooks</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(sportsbookCounts).length > 0 ? (
              Object.entries(sportsbookCounts).map(([name, count]) => {
                const paletteClass = sportsbookPalette[name] || "border-slate-700 bg-slate-800/70 text-slate-200";
                return (
                  <span key={name} className={`${pillBase} ${paletteClass}`}>
                    {name}
                    <span className="rounded-full bg-black/20 px-2 py-0.5 text-[0.7rem] font-semibold text-white/80">
                      {count}
                    </span>
                  </span>
                );
              })
            ) : (
              <span className="rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                No sportsbook data
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Markets</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(marketCounts).length > 0 ? (
              Object.entries(marketCounts).map(([name, count]) => (
                <span
                  key={name}
                  className={`${pillBase} border-indigo-500/40 bg-indigo-500/10 text-indigo-200`}
                >
                  {name}
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[0.7rem] font-semibold text-indigo-100">
                    {count}
                  </span>
                </span>
              ))
            ) : (
              <span className="rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                No market data
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-card">
        <table className="min-w-full">
          <thead className="bg-slate-900/70 text-left text-[0.7rem] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Sportsbook</th>
              <th className="px-4 py-3">League</th>
              <th className="px-4 py-3">Market</th>
              <th className="px-4 py-3">Pick</th>
              <th className="px-4 py-3">Odds</th>
              <th className="px-4 py-3">Stake</th>
              <th className="px-4 py-3">Bonus</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Payout</th>
              <th className="px-4 py-3">Net PnL</th>
              <th className="px-4 py-3">Cumulative</th>
              <th className="px-4 py-3">Arb</th>
              <th className="px-4 py-3">Group</th>
              <th className="px-4 py-3">Guaranteed</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {sortedBets.map((bet) => {
              const normalizedResult = (bet.result || "").toLowerCase();
              const rowClass = resultTint[normalizedResult] || "bg-slate-900/40";

              return (
                <tr
                  key={bet.id}
                  className={`${rowClass} transition hover:bg-slate-800/80`}
                >
                  {editId === bet.id ? (
                    <>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-300">{bet.id}</td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={editForm.date}
                          className={fieldClass}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.sportsbook}
                          className={fieldClass}
                          onChange={(e) =>
                            setEditForm({ ...editForm, sportsbook: e.target.value })
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.league}
                          className={fieldClass}
                          onChange={(e) => setEditForm({ ...editForm, league: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.market}
                          className={fieldClass}
                          onChange={(e) => setEditForm({ ...editForm, market: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.pick}
                          className={fieldClass}
                          onChange={(e) => setEditForm({ ...editForm, pick: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editForm.odds}
                          className={fieldClass}
                          onChange={(e) => setEditForm({ ...editForm, odds: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editForm.stake}
                          className={fieldClass}
                          onChange={(e) => setEditForm({ ...editForm, stake: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                          <input
                            type="checkbox"
                            checked={editForm.bonus > 0}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900/70 text-indigo-400 focus:ring-indigo-400"
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                bonus: e.target.checked ? parseFloat(editForm.stake) : 0.0,
                              })
                            }
                          />
                          Bonus
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editForm.result}
                          className={fieldClass}
                          onChange={(e) => setEditForm({ ...editForm, result: e.target.value })}
                        >
                          <option value="win">Win</option>
                          <option value="loss">Loss</option>
                          <option value="push">Push</option>
                          <option value="open">Open</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-300">{bet.payout}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-300">{bet.netPnL}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-300">{bet.cumulativePnL}</td>
                      <td className="px-4 py-3">
                        <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                          <input
                            type="checkbox"
                            checked={Boolean(editForm.is_arbitrage)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900/70 text-indigo-400 focus:ring-indigo-400"
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                is_arbitrage: e.target.checked,
                              })
                            }
                          />
                          Arb
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editForm.arb_group_id || ""}
                          className={fieldClass}
                          onChange={(e) =>
                            setEditForm({ ...editForm, arb_group_id: e.target.value })
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.guaranteed_profit || ""}
                          className={fieldClass}
                          onChange={(e) =>
                            setEditForm({ ...editForm, guaranteed_profit: e.target.value })
                          }
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSave}
                            className="rounded-lg border border-indigo-500/60 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-500/30"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-700/60"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-300">{bet.id}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-300">{bet.date}</td>
                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-100">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                            sportsbookPalette[bet.sportsbook] || "border-slate-700 bg-slate-800/70 text-slate-200"
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {bet.sportsbook || "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-300">{bet.league}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-300">{bet.market}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-300">{bet.pick}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-300">{bet.odds}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-300">{bet.stake}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-300">
                        {bet.bonus > 0 ? (
                          <span className="rounded-full border border-sky-500/40 bg-sky-500/15 px-2 py-0.5 text-[0.7rem] font-semibold text-sky-100">
                            Bonus
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 capitalize text-slate-200">
                        {bet.result}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-emerald-200">{bet.payout}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-200">{bet.netPnL}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-200">{bet.cumulativePnL}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-200">
                        {bet.is_arbitrage ? (
                          <span className="rounded-full border border-purple-500/40 bg-purple-500/15 px-2 py-0.5 text-[0.7rem] font-semibold text-purple-100">
                            Yes
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-200">
                        {bet.arb_group_id || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-200">
                        {bet.guaranteed_profit ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditClick(bet)}
                            className="rounded-lg border border-indigo-500/60 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-500/30"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(bet.id)}
                            className="rounded-lg border border-rose-500/50 bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/25"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedGroupEntries.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-slate-100">Arbitrage Groups</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {sortedGroupEntries.map(([gid, groupBets]) => (
              <ArbSummaryCard key={gid} groupId={gid} bets={groupBets} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
