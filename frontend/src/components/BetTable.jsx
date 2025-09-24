// // src/components/BetTable.jsx
// import { useState } from "react";
// import { deleteBet, updateBet } from "../api";

// export default function BetTable({ bets, onDelete, onUpdate }) {
//   // --------------------------------
//   // --- Bets per market ---
//   // --------------------------------
//   const marketCounts = bets.reduce((acc, bet) => {
//     if (bet.market) {
//       acc[bet.market] = (acc[bet.market] || 0) + 1;
//     }
//     return acc;
//   }, {});
//   // --------------------------------
//   // --- Market counts display ---
//   // --------------------------------
//   const marketStyle = {
//     display: "flex",
//     gap: "1.5rem",
//     marginBottom: "0.5rem",
//     fontWeight: "normal",
//     fontSize: "1rem",
//     flexWrap: "wrap",
//   };
//   const marketItems = Object.entries(marketCounts).map(([name, count]) => (
//     <span key={name}>
//       {name}: <span style={{ color: "#ff9800" }}>{count}</span>
//     </span>
//   ));
//   // --- Bets per sportsbook ---
//   const sportsbookCounts = bets.reduce((acc, bet) => {
//     if (bet.sportsbook) {
//       acc[bet.sportsbook] = (acc[bet.sportsbook] || 0) + 1;
//     }
//     return acc;
//   }, {});
//   // --------------------------------
//   // --- KPI calculations ---
//   // --------------------------------
//   // Exclude bonus bets from total stake
//   const totalStake = bets.reduce((sum, bet) => sum + (bet.bonus > 0 ? 0 : parseFloat(bet.stake || 0)), 0);
//   const totalPnL = bets.reduce((sum, bet) => sum + parseFloat(bet.netPnL || 0), 0);
//   const winCount = bets.filter((bet) => bet.result === "win").length;
//   const finishedCount = bets.filter((bet) => bet.result === "win" || bet.result === "loss" || bet.result === "push").length;
//   const winPct = finishedCount > 0 ? ((winCount / finishedCount) * 100).toFixed(2) : "0.00";
//   const roi = totalStake > 0 ? ((totalPnL / totalStake) * 100).toFixed(2) : "0.00";

//   // --- Edit state ---
//   const [editId, setEditId] = useState(null);
//   const [editForm, setEditForm] = useState({});

//   const handleEditClick = (bet) => {
//     setEditId(bet.id);
//     setEditForm({ ...bet });
//   };

//   // const handleChange = (e) => {
//   //   const { name, value, type, checked } = e.target;

//   //   let newValue = value;
//   //   if (type === "checkbox") {
//   //     if (name === "bonus") {
//   //       newValue = checked ? parseFloat(editForm.stake) : 0.0;
//   //     } else {
//   //       newValue = checked; // for is_arbitrage and other checkboxes
//   //     }
//   //   } else if (name === "odds" || name === "stake") {
//   //     newValue = parseFloat(value);
//   //   } else if (name === "arb_group_id") {
//   //     newValue = value ? parseInt(value, 10) : null;
//   //   } else if (name === "guaranteed_profit") {
//   //     newValue = value ? parseFloat(value) : null;
//   //   }

//   //   setEditForm({
//   //     ...editForm,
//   //     [name]: newValue,
//   //   });
//   // };

//   // const handleChange = (e) => {
//   //   const { name, value, type, checked } = e.target;
//   //   if (type === "checkbox") {
//   //     setEditForm({
//   //       ...editForm,
//   //       bonus: checked ? parseFloat(editForm.stake) : 0.0,
//   //     });
//   //   } else {
//   //     setEditForm({ ...editForm, [name]: value });
//   //   }
//   // };

//   const handleSave = async () => {
//     try {
//       const payload = {
//         ...editForm,
//         // ✅ cast numeric fields to floats
//         odds: parseFloat(editForm.odds),
//         stake: parseFloat(editForm.stake),
//         // ✅ bonus: if checked, send stake as bonus, else 0
//         bonus: editForm.bonus > 0 ? parseFloat(editForm.stake) : 0.0,
//         // ensure true/false
//         is_arbitrage: Boolean(editForm.is_arbitrage),  // ✅ stays a bool
//         // ensure integer
//         arb_group_id: editForm.arb_group_id
//           ? parseInt(editForm.arb_group_id, 10)
//           : null,  // ✅ convert to int or null
//         // ensure float
//         guaranteed_profit: editForm.guaranteed_profit
//           ? parseFloat(editForm.guaranteed_profit)
//           : null,  // ✅ convert to float or null
//       };
//       const res = await updateBet(editId, payload);
//       onUpdate(res.data);
//       setEditId(null);
//     } catch (err) {
//       console.error("❌ Error updating bet:", err.response?.data || err.message);
//     }
//   };

//   const handleCancel = () => setEditId(null);

//   const handleDelete = async (id) => {
//     try {
//       await deleteBet(id);
//       onDelete(id);
//     } catch (err) {
//       console.error("❌ Error deleting bet:", err.response?.data || err.message);
//     }
//   };

//   if (!bets || bets.length === 0) return <p>No bets yet.</p>;

//   // --- KPI display ---
//   const kpiStyle = {
//     display: "flex",
//     gap: "2rem",
//     marginBottom: "1rem",
//     fontWeight: "bold",
//     fontSize: "1.1rem",
//     flexWrap: "wrap",
//   };

//   const kpiItem = (label, value, unit = "") => (
//     <span>
//       {label}: <span style={{ color: "#007bff" }}>{value}{unit}</span>
//     </span>
//   );

//   // --- Sportsbook counts display ---
//   const sportsbookStyle = {
//     display: "flex",
//     gap: "1.5rem",
//     marginBottom: "0.5rem",
//     fontWeight: "normal",
//     fontSize: "1rem",
//     flexWrap: "wrap",
//   };
//   const sportsbookItems = Object.entries(sportsbookCounts).map(([name, count]) => (
//     <span key={name}>
//       {name}: <span style={{ color: "#28a745" }}>{count}</span>
//     </span>
//   ));

//   return (
//     <>
//       <div style={kpiStyle}>
//         {kpiItem("Total PnL", totalPnL.toFixed(2), "")}
//         {kpiItem("Total Stake", totalStake.toFixed(2), "")}
//         {kpiItem("Win %", winPct, "%")}
//         {kpiItem("ROI", roi, "%")}
//       </div>
//       <div style={sportsbookStyle}>
//         {sportsbookItems.length > 0 ? sportsbookItems : <span>No bets per sportsbook yet.</span>}
//       </div>
//       <div style={marketStyle}>
//         {marketItems.length > 0 ? marketItems : <span>No bets per market yet.</span>}
//       </div>
//       <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Date</th>
//             <th>Sportsbook</th>
//             <th>League</th>
//             <th>Market</th>
//             <th>Pick</th>
//             <th>Odds</th>
//             <th>Stake</th>
//             <th>Bonus</th>
//             <th>Result</th>
//             <th>Payout</th>
//             <th>Net PnL</th>
//             <th>Cumulative PnL</th>
//             <th>Arbitrage</th>             
//             <th>Group ID</th>           
//             <th>Guaranteed Profit</th>  
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {bets.map((bet) => {
//             const rowStyle = {
//               backgroundColor:
//                 bet.result === "open"
//                   ? "#f0f0f0" // gray
//                   : bet.result === "win"
//                   ? "#d4fcd4" // green
//                   : bet.result === "loss"
//                   ? "#fcd4d4" // red
//                   : "#ffffff", // default
//               color:
//                 bet.result === "open"
//                   ? "#333333" // dark gray
//                   : bet.result === "win"
//                   ? "#0f5132" // dark green
//                   : bet.result === "loss"
//                   ? "#842029" // dark red
//                   : "#000000", // black
//               fontWeight: bet.result === "open" ? "bold" : "normal", // make opens bold
//             };

//             return (
//               <tr key={bet.id} style={rowStyle}>
//                 {editId === bet.id ? (
//                   <>
//                     <td>{bet.id}</td>
//                     <td>
//                       <input
//                         type="date"
//                         name="date"
//                         value={editForm.date}
//                         // onChange={handleChange}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, date: e.target.value })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         type="text"
//                         name="sportsbook"
//                         value={editForm.sportsbook}
//                         // onChange={handleChange}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, sportsbook: e.target.value })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         type="text"
//                         name="league"
//                         value={editForm.league}
//                         //onChange={handleChange}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, league: e.target.value })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         type="text"
//                         name="market"
//                         value={editForm.market}
//                         //onChange={handleChange}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, market: e.target.value })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         type="text"
//                         name="pick"
//                         value={editForm.pick}
//                         //nChange={handleChange}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, pick: e.target.value })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         type="number"
//                         name="odds"
//                         value={editForm.odds}
//                         //onChange={handleChange}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, odds: e.target.value })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         type="number"
//                         name="stake"
//                         value={editForm.stake}
//                         //onChange={handleChange}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, stake: e.target.value })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         type="checkbox"
//                         name="bonus"
//                         checked={editForm.bonus > 0}
//                         //onChange={handleChange}
//                         onChange={(e) =>
//                           setEditForm({
//                             ...editForm,
//                             bonus: e.target.checked
//                               ? parseFloat(editForm.stake)
//                               : 0.0,
//                           })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <select
//                         name="result"
//                         value={editForm.result}
//                         //onChange={handleChange}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, result: e.target.value })
//                         }
//                       >
//                         <option value="win">Win</option>
//                         <option value="loss">Loss</option>
//                         <option value="push">Push</option>
//                         <option value="open">Open</option>
//                       </select>
//                     </td>
//                     <td>{bet.payout}</td>
//                     <td>{bet.netPnL}</td>
//                     <td>{bet.cumulativePnL}</td>
//                     <td>
//                       <input 
//                         type="checkbox"
//                         name="is_arbitrage"
//                         checked={editForm.is_arbitrage}
//                         //onChange={handleChange}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, is_arbitrage: e.target.checked })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input 
//                         type="number"
//                         name="arb_group_id"
//                         value={editForm.arb_group_id || ""}
//                         //onChange={handleChange}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, arb_group_id: e.target.value })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input 
//                         type="number"
//                         step="0.01"
//                         name="guaranteed_profit"
//                         value={editForm.guaranteed_profit || ""}
//                         // onChange={handleChange}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, guaranteed_profit: e.target.value })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <button onClick={handleSave}>Save</button>
//                       <button onClick={handleCancel}>Cancel</button>
//                     </td>
//                   </>
//                 ) : (
//                   <>
//                     <td>{bet.id}</td>
//                     <td>{bet.date}</td>
//                     <td>{bet.sportsbook}</td>
//                     <td>{bet.league}</td>
//                     <td>{bet.market}</td>
//                     <td>{bet.pick}</td>
//                     <td>{bet.odds}</td>
//                     <td>{bet.stake}</td>
//                     <td>{bet.bonus > 0 ? "✅" : ""}</td>
//                     <td>{bet.result}</td>
//                     <td>{bet.payout}</td>
//                     <td>{bet.netPnL}</td>
//                     <td>{bet.cumulativePnL}</td>
//                     <td>{bet.is_arbitrage ? "✅" : ""}</td>
//                     <td>{bet.arb_group_id || "-"}</td>
//                     <td>{bet.guaranteed_profit ?? "-"}</td>
//                     <td>
//                       <button onClick={() => handleEditClick(bet)}>Edit</button>
//                       <button onClick={() => handleDelete(bet.id)}>Delete</button>
//                     </td>
//                   </>
//                 )}
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </>
//   );
// }

// src/components/BetTable.jsx
import { useState } from "react";
import { deleteBet, updateBet } from "../api";
import ArbSummaryCard from "./ArbSummaryCard";

export default function BetTable({ bets, onDelete, onUpdate }) {
  // --------------------------------
  // --- Bets per market ---
  // --------------------------------
  const marketCounts = bets.reduce((acc, bet) => {
    if (bet.market) {
      acc[bet.market] = (acc[bet.market] || 0) + 1;
    }
    return acc;
  }, {});

  const marketStyle = {
    display: "flex",
    gap: "1.5rem",
    marginBottom: "0.5rem",
    fontWeight: "normal",
    fontSize: "1rem",
    flexWrap: "wrap",
  };

  const marketItems = Object.entries(marketCounts).map(([name, count]) => (
    <span key={name}>
      {name}: <span style={{ color: "#ff9800" }}>{count}</span>
    </span>
  ));

  const sportsbookCounts = bets.reduce((acc, bet) => {
    if (bet.sportsbook) {
      acc[bet.sportsbook] = (acc[bet.sportsbook] || 0) + 1;
    }
    return acc;
  }, {});

  // --- KPI calculations ---
  const totalStake = bets.reduce(
    (sum, bet) => sum + (bet.bonus > 0 ? 0 : parseFloat(bet.stake || 0)),
    0
  );
  const totalPnL = bets.reduce(
    (sum, bet) => sum + parseFloat(bet.netPnL || 0),
    0
  );
  const winCount = bets.filter((bet) => bet.result === "win").length;
  const finishedCount = bets.filter(
    (bet) =>
      bet.result === "win" || bet.result === "loss" || bet.result === "push"
  ).length;
  const winPct =
    finishedCount > 0 ? ((winCount / finishedCount) * 100).toFixed(2) : "0.00";
  const roi =
    totalStake > 0 ? ((totalPnL / totalStake) * 100).toFixed(2) : "0.00";

  // --- Edit state ---
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

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
        arb_group_id: editForm.arb_group_id
          ? parseInt(editForm.arb_group_id, 10)
          : null,
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

  if (!bets || bets.length === 0) return <p>No bets yet.</p>;

  const kpiStyle = {
    display: "flex",
    gap: "2rem",
    marginBottom: "1rem",
    fontWeight: "bold",
    fontSize: "1.1rem",
    flexWrap: "wrap",
  };

  const kpiItem = (label, value, unit = "") => (
    <span>
      {label}: <span style={{ color: "#007bff" }}>{value}{unit}</span>
    </span>
  );

  const sportsbookStyle = {
    display: "flex",
    gap: "1.5rem",
    marginBottom: "0.5rem",
    fontWeight: "normal",
    fontSize: "1rem",
    flexWrap: "wrap",
  };

  const sportsbookItems = Object.entries(sportsbookCounts).map(
    ([name, count]) => (
      <span key={name}>
        {name}: <span style={{ color: "#28a745" }}>{count}</span>
      </span>
    )
  );

  // --- Group arbitrage bets ---
  const groupedArbs = bets.reduce((acc, bet) => {
    if (bet.is_arbitrage && bet.arb_group_id) {
      acc[bet.arb_group_id] = acc[bet.arb_group_id] || [];
      acc[bet.arb_group_id].push(bet);
    }
    return acc;
  }, {});

  return (
    <>
      <div style={kpiStyle}>
        {kpiItem("Total PnL", totalPnL.toFixed(2), "")}
        {kpiItem("Total Stake", totalStake.toFixed(2), "")}
        {kpiItem("Win %", winPct, "%")}
        {kpiItem("ROI", roi, "%")}
      </div>
      <div style={sportsbookStyle}>
        {sportsbookItems.length > 0 ? sportsbookItems : <span>No bets per sportsbook yet.</span>}
      </div>
      <div style={marketStyle}>
        {marketItems.length > 0 ? marketItems : <span>No bets per market yet.</span>}
      </div>
      <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Sportsbook</th>
            <th>League</th>
            <th>Market</th>
            <th>Pick</th>
            <th>Odds</th>
            <th>Stake</th>
            <th>Bonus</th>
            <th>Result</th>
            <th>Payout</th>
            <th>Net PnL</th>
            <th>Cumulative PnL</th>
            <th>Arbitrage</th>
            <th>Group ID</th>
            <th>Guaranteed Profit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bets.map((bet) => {
            const rowStyle = {
              backgroundColor:
                bet.result === "open"
                  ? "#f0f0f0"
                  : bet.result === "win"
                  ? "#d4fcd4"
                  : bet.result === "loss"
                  ? "#fcd4d4"
                  : "#ffffff",
              color: "#000000"
            };

            return (
              <tr key={bet.id} style={rowStyle}>
                {editId === bet.id ? (
                  <>
                    <td>{bet.id}</td>
                    <td>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) =>
                          setEditForm({ ...editForm, date: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editForm.sportsbook}
                        onChange={(e) =>
                          setEditForm({ ...editForm, sportsbook: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editForm.league}
                        onChange={(e) =>
                          setEditForm({ ...editForm, league: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editForm.market}
                        onChange={(e) =>
                          setEditForm({ ...editForm, market: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editForm.pick}
                        onChange={(e) =>
                          setEditForm({ ...editForm, pick: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editForm.odds}
                        onChange={(e) =>
                          setEditForm({ ...editForm, odds: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editForm.stake}
                        onChange={(e) =>
                          setEditForm({ ...editForm, stake: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={editForm.bonus > 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            bonus: e.target.checked
                              ? parseFloat(editForm.stake)
                              : 0.0,
                          })
                        }
                      />
                    </td>
                    <td>
                      <select
                        value={editForm.result}
                        onChange={(e) =>
                          setEditForm({ ...editForm, result: e.target.value })
                        }
                      >
                        <option value="win">Win</option>
                        <option value="loss">Loss</option>
                        <option value="push">Push</option>
                        <option value="open">Open</option>
                      </select>
                    </td>
                    <td>{bet.payout}</td>
                    <td>{bet.netPnL}</td>
                    <td>{bet.cumulativePnL}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={editForm.is_arbitrage}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            is_arbitrage: e.target.checked,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editForm.arb_group_id || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            arb_group_id: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.guaranteed_profit || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            guaranteed_profit: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <button onClick={handleSave}>Save</button>
                      <button onClick={handleCancel}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{bet.id}</td>
                    <td>{bet.date}</td>
                    <td>{bet.sportsbook}</td>
                    <td>{bet.league}</td>
                    <td>{bet.market}</td>
                    <td>{bet.pick}</td>
                    <td>{bet.odds}</td>
                    <td>{bet.stake}</td>
                    <td>{bet.bonus > 0 ? "✅" : ""}</td>
                    <td>{bet.result}</td>
                    <td>{bet.payout}</td>
                    <td>{bet.netPnL}</td>
                    <td>{bet.cumulativePnL}</td>
                    <td>{bet.is_arbitrage ? "✅" : ""}</td>
                    <td>{bet.arb_group_id || "-"}</td>
                    <td>{bet.guaranteed_profit ?? "-"}</td>
                    <td>
                      <button onClick={() => handleEditClick(bet)}>Edit</button>
                      <button onClick={() => handleDelete(bet.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Arbitrage summary cards */}
      <h3 style={{ marginTop: "2rem" }}>Arbitrage Groups</h3>
      {Object.entries(groupedArbs).map(([gid, groupBets]) => (
        <ArbSummaryCard key={gid} groupId={gid} bets={groupBets} />
      ))}
    </>
  );
}