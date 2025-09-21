// src/components/BetTable.jsx
export default function BetTable({ bets }) {
  if (!bets || bets.length === 0) return <p>No bets yet.</p>;

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
          <th>Result</th>
          <th>Bonus</th>
          <th>Decimal</th>
          <th>Payout</th>
          <th>Net PnL</th>
          <th>Cumulative PnL</th>
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
            <td>{bet.result}</td>
            <td>{bet.bonus}</td>
            <td>{bet.decimal}</td>
            <td>{bet.payout}</td>
            <td>{bet.netPnL}</td>
            <td>{bet.cumulativePnL}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}