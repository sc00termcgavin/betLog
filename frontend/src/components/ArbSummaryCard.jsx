// // src/components/ArbSummaryCard.jsx
// import React from "react";

// function calcProfit(stake, odds) {
//   if (!stake || !odds) return 0;
//   const s = parseFloat(stake);
//   const o = parseFloat(odds);
//   if (o > 0) {
//     return (s * o) / 100; // e.g. +425
//   } else {
//     return (s * 100) / Math.abs(o); // e.g. -300
//   }
// }

// export default function ArbSummaryCard({ groupId, bets }) {
//   if (!bets || bets.length === 0) return null;

//   const totalStake = bets.reduce((sum, b) => sum + parseFloat(b.stake || 0), 0);

//   // Calculate payouts + profits
//   const enriched = bets.map((b) => {
//     const profit = calcProfit(b.stake, b.odds);
//     const payout = parseFloat(b.stake) + profit;
//     return { ...b, profit, payout };
//   });

//   // For each outcome, calculate net profit = winner.profit - sum(other stakes)
//   const scenarioProfits = enriched.map((winner, i) => {
//     const otherStakes = enriched
//       .filter((_, j) => j !== i)
//       .reduce((sum, b) => sum + parseFloat(b.stake || 0), 0);
//     return winner.profit - otherStakes;
//   });

//   const guaranteedProfit = Math.min(...scenarioProfits);
//   const profitPct = totalStake > 0 ? (guaranteedProfit / totalStake) * 100 : 0;

//   const cardStyle = {
//     border: "1px solid #ccc",
//     borderRadius: "8px",
//     padding: "1rem",
//     marginTop: "1rem",
//     background: "#fafafa",
//     color: "#222", 
//   };

//   const betRowStyle = {
//     display: "flex",
//     justifyContent: "space-between",
//     padding: "0.5rem 0",
//     borderBottom: "1px solid #eee",
//   };

//   return (
//     <div style={cardStyle}>
//       <h4>Arbitrage Group {groupId}</h4>
//       {enriched.map((b) => (
//         <div key={b.id} style={betRowStyle}>
//           <div>
//             <strong>{b.sportsbook}</strong> – {b.pick} ({b.odds})
//           </div>
//           <div>Stake: ${parseFloat(b.stake).toFixed(2)}</div>
//           <div>Payout: ${b.payout.toFixed(2)}</div>
//         </div>
//       ))}

//       <div style={{ marginTop: "1rem", fontWeight: "bold" }}>
//         <div>Total Stake: ${totalStake.toFixed(2)}</div>
//         <div style={{ color: guaranteedProfit >= 0 ? "green" : "red" }}>
//           Guaranteed Profit: ${guaranteedProfit.toFixed(2)} ({profitPct.toFixed(2)}%)
//         </div>
//       </div>
//     </div>
//   );
// }

// src/components/ArbSummaryCard.jsx
import React from "react";

function calcProfit(stake, odds) {
  if (!stake || !odds) return 0;
  const s = parseFloat(stake);
  const o = parseFloat(odds);
  if (o > 0) {
    return (s * o) / 100; // positive odds
  } else {
    return (s * 100) / Math.abs(o); // negative odds
  }
}

export default function ArbSummaryCard({ groupId, bets }) {
  if (!bets || bets.length === 0) return null;

  const totalStake = bets.reduce((sum, b) => sum + parseFloat(b.stake || 0), 0);

  // Attach profit + payout based on actual result
  const enriched = bets.map((b) => {
    const profit = calcProfit(b.stake, b.odds);
    let payout = 0;

    if (b.result === "win") {
      payout = parseFloat(b.stake) + profit;
    } else if (b.result === "push") {
      payout = parseFloat(b.stake);
    } else if (b.result === "open") {
      payout = 0; // or stake, depending how you want to show pending bets
    } else {
      payout = 0; // loss
    }

    return { ...b, profit, payout };
  });

  const guaranteedProfit = enriched.reduce(
    (sum, b) => sum + (b.payout - parseFloat(b.stake || 0)),
    0
  );

  const profitPct = totalStake > 0 ? (guaranteedProfit / totalStake) * 100 : 0;

  const cardStyle = {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "1rem",
    marginTop: "1rem",
    background: "#fafafa",
    color: "#000",
  };

  const betRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0",
    borderBottom: "1px solid #eee",
  };

  return (
    <div style={cardStyle}>
      <h4>Arbitrage Group {groupId}</h4>
      {enriched.map((b) => (
        <div key={b.id} style={betRowStyle}>
          <div>
            <strong>{b.sportsbook}</strong> – {b.pick} ({b.odds})
          </div>
          <div>Stake: ${parseFloat(b.stake).toFixed(2)}</div>
          <div>Payout: ${b.payout.toFixed(2)}</div>
          {/* <div>Result: {b.result}</div> */}
        </div>
      ))}

      <div style={{ marginTop: "1rem", fontWeight: "bold" }}>
        <div>Total Stake: ${totalStake.toFixed(2)}</div>
        <div style={{ color: guaranteedProfit >= 0 ? "green" : "red" }}>
          Net Profit: ${guaranteedProfit.toFixed(2)} ({profitPct.toFixed(2)}%)
        </div>
      </div>
    </div>
  );
}