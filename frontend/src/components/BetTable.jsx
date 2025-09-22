// // src/components/BetTable.jsx
// import { useState } from "react";
// import { deleteBet, updateBet } from "../api";

// export default function BetTable({ bets, onDelete, onUpdate }) {
//   const [editId, setEditId] = useState(null);
//   const [editForm, setEditForm] = useState({});

//   const handleEditClick = (bet) => {
//     setEditId(bet.id);
//     setEditForm({ ...bet });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setEditForm({ ...editForm, [name]: value });
//   };

//   const handleSave = async () => {
//     try {
//       const payload = {
//         ...editForm,
//         odds: parseFloat(editForm.odds),
//         stake: parseFloat(editForm.stake),
//         bonus: editForm.bonus > 0 ? parseFloat(editForm.stake) : 0.0,
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

//   return (
//     <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
//       <thead>
//         <tr>
//           <th>ID</th>
//           <th>Date</th>
//           <th>Sportsbook</th>
//           <th>League</th>
//           <th>Market</th>
//           <th>Pick</th>
//           <th>Odds</th>
//           <th>Stake</th>
//           <th>Bonus</th>
//           <th>Result</th>
//           <th>Payout</th>
//           <th>Net PnL</th>
//           <th>Cumulative PnL</th>
//           <th>Actions</th>
//         </tr>
//       </thead>
//       <tbody>
//         {bets.map((bet) => (
//           <tr key={bet.id}>
//             {editId === bet.id ? (
//               <>
//                 <td>{bet.id}</td>
//                 <td>
//                   <input
//                     type="date"
//                     name="date"
//                     value={editForm.date}
//                     onChange={handleChange}
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="text"
//                     name="sportsbook"
//                     value={editForm.sportsbook}
//                     onChange={handleChange}
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="text"
//                     name="league"
//                     value={editForm.league}
//                     onChange={handleChange}
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="text"
//                     name="market"
//                     value={editForm.market}
//                     onChange={handleChange}
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="text"
//                     name="pick"
//                     value={editForm.pick}
//                     onChange={handleChange}
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="number"
//                     name="odds"
//                     value={editForm.odds}
//                     onChange={handleChange}
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="number"
//                     name="stake"
//                     value={editForm.stake}
//                     onChange={handleChange}
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="checkbox"
//                     name="bonus"
//                     checked={editForm.bonus > 0}
//                     onChange={(e) =>
//                       setEditForm({
//                         ...editForm,
//                         bonus: e.target.checked ? parseFloat(editForm.stake) : 0.0,
//                       })
//                     }
//                   />
//                 </td>
//                 <td>
//                   <select
//                     name="result"
//                     value={editForm.result}
//                     onChange={handleChange}
//                   >
//                     <option value="win">Win</option>
//                     <option value="loss">Loss</option>
//                     <option value="push">Push</option>
//                     <option value="open">Open</option>
//                   </select>
//                 </td>
//                 <td>{bet.payout}</td>
//                 <td>{bet.netPnL}</td>
//                 <td>{bet.cumulativePnL}</td>
//                 <td>
//                   <button onClick={handleSave}>Save</button>
//                   <button onClick={handleCancel}>Cancel</button>
//                 </td>
//               </>
//             ) : (
//               <>
//                 <td>{bet.id}</td>
//                 <td>{bet.date}</td>
//                 <td>{bet.sportsbook}</td>
//                 <td>{bet.league}</td>
//                 <td>{bet.market}</td>
//                 <td>{bet.pick}</td>
//                 <td>{bet.odds}</td>
//                 <td>{bet.stake}</td>
//                 <td>{bet.bonus > 0 ? "✅" : ""}</td>
//                 <td>{bet.result}</td>
//                 <td>{bet.payout}</td>
//                 <td>{bet.netPnL}</td>
//                 <td>{bet.cumulativePnL}</td>
//                 <td>
//                   <button onClick={() => handleEditClick(bet)}>Edit</button>
//                   <button onClick={() => handleDelete(bet.id)}>Delete</button>
//                 </td>
//               </>
//             )}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }
import { useState } from "react";
import { deleteBet, updateBet } from "../api";

export default function BetTable({ bets, onDelete, onUpdate }) {
  // --- KPI calculations ---
  // Exclude bonus bets from total stake
  const totalStake = bets.reduce((sum, bet) => sum + (bet.bonus > 0 ? 0 : parseFloat(bet.stake || 0)), 0);
  const totalPnL = bets.reduce((sum, bet) => sum + parseFloat(bet.netPnL || 0), 0);
  const winCount = bets.filter((bet) => bet.result === "win").length;
  const finishedCount = bets.filter((bet) => bet.result === "win" || bet.result === "loss" || bet.result === "push").length;
  const winPct = finishedCount > 0 ? ((winCount / finishedCount) * 100).toFixed(2) : "0.00";
  const roi = totalStake > 0 ? ((totalPnL / totalStake) * 100).toFixed(2) : "0.00";
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEditClick = (bet) => {
    setEditId(bet.id);
    setEditForm({ ...bet });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setEditForm({
        ...editForm,
        bonus: checked ? parseFloat(editForm.stake) : 0.0,
      });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...editForm,
        odds: parseFloat(editForm.odds),
        stake: parseFloat(editForm.stake),
        bonus: editForm.bonus > 0 ? parseFloat(editForm.stake) : 0.0,
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

  // --- KPI display ---
  const kpiStyle = {
    display: "flex",
    gap: "2rem",
    marginBottom: "1rem",
    fontWeight: "bold",
    fontSize: "1.1rem",
  };

  const kpiItem = (label, value, unit = "") => (
    <span>
      {label}: <span style={{ color: "#007bff" }}>{value}{unit}</span>
    </span>
  );

  return (
    <>
      <div style={kpiStyle}>
        {kpiItem("Total PnL", totalPnL.toFixed(2), "")}
        {kpiItem("Total Stake", totalStake.toFixed(2), "")}
        {kpiItem("Win %", winPct, "%")}
        {kpiItem("ROI", roi, "%")}
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bets.map((bet) => {
            const rowStyle = {
              backgroundColor:
                bet.result === "open"
                  ? "#f0f0f0" // gray
                  : bet.result === "win"
                  ? "#d4fcd4" // green
                  : bet.result === "loss"
                  ? "#fcd4d4" // red
                  : "#ffffff", // default
              color:
                bet.result === "open"
                  ? "#333333" // dark gray
                  : bet.result === "win"
                  ? "#0f5132" // dark green
                  : bet.result === "loss"
                  ? "#842029" // dark red
                  : "#000000", // black
              fontWeight: bet.result === "open" ? "bold" : "normal", // make opens bold
            };

            return (
              <tr key={bet.id} style={rowStyle}>
                {editId === bet.id ? (
                  <>
                    <td>{bet.id}</td>
                    <td>
                      <input
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="sportsbook"
                        value={editForm.sportsbook}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="league"
                        value={editForm.league}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="market"
                        value={editForm.market}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="pick"
                        value={editForm.pick}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="odds"
                        value={editForm.odds}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="stake"
                        value={editForm.stake}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        name="bonus"
                        checked={editForm.bonus > 0}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <select
                        name="result"
                        value={editForm.result}
                        onChange={handleChange}
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
    </>
  );
}