// src/components/BetTable.jsx
import { deleteBet } from "../api";

export default function BetTable({ bets, onDelete }) {
  if (!bets || bets.length === 0) return <p>No bets yet.</p>;

  const handleDelete = async (id) => {
    try {
      await deleteBet(id);
      onDelete(id);
    } catch (err) {
      console.error("❌ Error deleting bet:", err.response?.data || err.message);
    }
  };

  return (
    <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
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
        {bets.map((bet) => (
          <tr key={bet.id}>
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
              <button onClick={() => handleDelete(bet.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}