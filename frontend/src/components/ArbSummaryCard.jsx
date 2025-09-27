function calcProfit(stake, odds) {
  if (!stake || !odds) return 0;
  const s = parseFloat(stake);
  const o = parseFloat(odds);
  if (o > 0) {
    return (s * o) / 100;
  }
  return (s * 100) / Math.abs(o);
}

export default function ArbSummaryCard({ groupId, bets }) {
  if (!bets || bets.length === 0) return null;

  const totalStake = bets.reduce((sum, b) => sum + parseFloat(b.stake || 0), 0);

  const enriched = bets.map((b) => {
    const profit = calcProfit(b.stake, b.odds);
    let payout = 0;

    if (b.result === "win") {
      payout = parseFloat(b.stake) + profit;
    } else if (b.result === "push") {
      payout = parseFloat(b.stake);
    } else if (b.result === "open") {
      payout = 0;
    } else {
      payout = 0;
    }

    return { ...b, profit, payout };
  });

  const netProfit = enriched.reduce(
    (sum, b) => sum + (b.payout - parseFloat(b.stake || 0)),
    0,
  );

  const profitPct = totalStake > 0 ? (netProfit / totalStake) * 100 : 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-100">Arbitrage Group {groupId}</h4>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100">
          {bets.length} legs
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {enriched.map((b) => (
          <div
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-100">
                {b.sportsbook} · {b.pick}
              </span>
              <span className="text-xs uppercase tracking-wide text-slate-500">Odds {b.odds}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-200">
              <span>
                Stake <span className="font-semibold text-slate-100">${parseFloat(b.stake).toFixed(2)}</span>
              </span>
              <span>
                Payout <span className="font-semibold text-emerald-200">${b.payout.toFixed(2)}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-4 text-sm">
        <div className="text-slate-300">
          Total Stake
          <span className="ml-2 font-semibold text-slate-100">${totalStake.toFixed(2)}</span>
        </div>
        <div className="text-slate-300">
          Net Profit
          <span
            className={`ml-2 font-semibold ${netProfit >= 0 ? "text-emerald-300" : "text-rose-300"}`}
          >
            ${netProfit.toFixed(2)} ({profitPct.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
