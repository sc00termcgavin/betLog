import { useEffect, useState } from "react";
import { fetchBets } from "./api";
import BetForm from "./components/BetForm";
import BetTable from "./components/BetTable";

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

  return (
    <div style={{ padding: "1rem" }}>
      <h1>📊 Bet Tracker</h1>
      <BetForm onNewBet={handleNewBet} />
      <BetTable bets={bets} />
    </div>
  );
}


// import { useEffect, useState } from "react";
// import { fetchBets } from "./api";
// import BetForm from "./components/BetForm";
// import BetTable from "./components/BetTable";

// export default function App() {
//   const [bets, setBets] = useState([]);

//   useEffect(() => {
//     fetchBets().then((res) => setBets(res.data));
//   }, []);

//   return (
//     <div style={{ padding: "1rem" }}>
//       <h1>📊 Bet Tracker</h1>
//       <BetForm onNewBet={(bet) => setBets((prev) => [...prev, bet])} />
//       <BetTable bets={bets} />
//     </div>
//   );
// }