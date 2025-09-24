import React, { useState } from 'react';
import { Plus, DollarSign, TrendingUp, Calendar } from 'lucide-react';

const ArbitrageTracker = () => {
  const [arbGroups, setArbGroups] = useState([
    {
      id: 1234,
      event: "Lakers vs Celtics",
      date: "2024-01-15",
      status: "completed",
      bets: [
        {
          id: 1,
          sportsbook: "Bovada",
          pick: "Lakers +110",
          odds: 110,
          stake: 454.55,
          toWin: 500.00,
          result: "Win"
        },
        {
          id: 2,
          sportsbook: "DraftKings",
          pick: "Celtics -105",
          odds: -105,
          stake: 500.00,
          toWin: 476.19,
          result: "Loss"
        }
      ]
    },
    {
      id: 1235,
      event: "Chiefs vs Bills O/U 47.5",
      date: "2024-01-16",
      status: "pending",
      bets: [
        {
          id: 3,
          sportsbook: "FanDuel",
          pick: "Over 47.5 -110",
          odds: -110,
          stake: 523.81,
          toWin: 476.19,
          result: "Pending"
        },
        {
          id: 4,
          sportsbook: "BetMGM",
          pick: "Under 47.5 +105",
          odds: 105,
          stake: 476.19,
          toWin: 500.00,
          result: "Pending"
        }
      ]
    }
  ]);

  const [newArb, setNewArb] = useState({
    event: '',
    bet1: { sportsbook: '', pick: '', odds: '', stake: '' },
    bet2: { sportsbook: '', pick: '', odds: '', stake: '' }
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const calculateToWin = (stake, odds) => {
    if (!stake || !odds) return 0;
    const stakeNum = parseFloat(stake);
    const oddsNum = parseFloat(odds);
    
    if (oddsNum > 0) {
      return (stakeNum * oddsNum) / 100;
    } else {
      return (stakeNum * 100) / Math.abs(oddsNum);
    }
  };

  const calculateArbMetrics = (bets) => {
    const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0);
    const maxPayout = Math.max(...bets.map(bet => bet.stake + bet.toWin));
    const guaranteedProfit = maxPayout - totalStaked;
    const roi = (guaranteedProfit / totalStaked) * 100;
    
    return { totalStaked, guaranteedProfit, roi };
  };

  const handleAddArbitrage = () => {
    const bet1ToWin = calculateToWin(newArb.bet1.stake, newArb.bet1.odds);
    const bet2ToWin = calculateToWin(newArb.bet2.stake, newArb.bet2.odds);
    
    const newArbGroup = {
      id: Date.now(),
      event: newArb.event,
      date: new Date().toISOString().split('T')[0],
      status: "pending",
      bets: [
        {
          id: Date.now(),
          sportsbook: newArb.bet1.sportsbook,
          pick: newArb.bet1.pick,
          odds: parseFloat(newArb.bet1.odds),
          stake: parseFloat(newArb.bet1.stake),
          toWin: bet1ToWin,
          result: "Pending"
        },
        {
          id: Date.now() + 1,
          sportsbook: newArb.bet2.sportsbook,
          pick: newArb.bet2.pick,
          odds: parseFloat(newArb.bet2.odds),
          stake: parseFloat(newArb.bet2.stake),
          toWin: bet2ToWin,
          result: "Pending"
        }
      ]
    };

    setArbGroups([newArbGroup, ...arbGroups]);
    setNewArb({
      event: '',
      bet1: { sportsbook: '', pick: '', odds: '', stake: '' },
      bet2: { sportsbook: '', pick: '', odds: '', stake: '' }
    });
    setShowAddForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'Win': return 'text-green-600 font-semibold';
      case 'Loss': return 'text-red-600 font-semibold';
      case 'Push': return 'text-gray-600 font-semibold';
      default: return 'text-yellow-600 font-semibold';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Arbitrage Bet Tracker</h1>
        <p className="text-gray-600">Track and analyze your sports betting arbitrage opportunities</p>
      </div>

      {/* Add New Arbitrage Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add New Arbitrage
        </button>
      </div>

      {/* Add New Arbitrage Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">New Arbitrage Opportunity</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
            <input
              type="text"
              placeholder="e.g., Lakers vs Celtics"
              value={newArb.event}
              onChange={(e) => setNewArb({...newArb, event: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Bet 1 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-3">Bet 1</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Sportsbook (e.g., Bovada)"
                  value={newArb.bet1.sportsbook}
                  onChange={(e) => setNewArb({...newArb, bet1: {...newArb.bet1, sportsbook: e.target.value}})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Pick (e.g., Lakers +110)"
                  value={newArb.bet1.pick}
                  onChange={(e) => setNewArb({...newArb, bet1: {...newArb.bet1, pick: e.target.value}})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Odds (e.g., 110 or -110)"
                  value={newArb.bet1.odds}
                  onChange={(e) => setNewArb({...newArb, bet1: {...newArb.bet1, odds: e.target.value}})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Stake ($)"
                  value={newArb.bet1.stake}
                  onChange={(e) => setNewArb({...newArb, bet1: {...newArb.bet1, stake: e.target.value}})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-sm text-gray-600">
                  To Win: ${calculateToWin(newArb.bet1.stake, newArb.bet1.odds).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Bet 2 */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-3">Bet 2</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Sportsbook (e.g., DraftKings)"
                  value={newArb.bet2.sportsbook}
                  onChange={(e) => setNewArb({...newArb, bet2: {...newArb.bet2, sportsbook: e.target.value}})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Pick (e.g., Celtics -105)"
                  value={newArb.bet2.pick}
                  onChange={(e) => setNewArb({...newArb, bet2: {...newArb.bet2, pick: e.target.value}})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Odds (e.g., 105 or -105)"
                  value={newArb.bet2.odds}
                  onChange={(e) => setNewArb({...newArb, bet2: {...newArb.bet2, odds: e.target.value}})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Stake ($)"
                  value={newArb.bet2.stake}
                  onChange={(e) => setNewArb({...newArb, bet2: {...newArb.bet2, stake: e.target.value}})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-sm text-gray-600">
                  To Win: ${calculateToWin(newArb.bet2.stake, newArb.bet2.odds).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddArbitrage}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Arbitrage
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Arbitrage Groups Display */}
      <div className="space-y-6">
        {arbGroups.map((group) => {
          const metrics = calculateArbMetrics(group.bets);
          
          return (
            <div key={group.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Group Header */}
              <div className="bg-gray-800 text-white p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">Arb Group #{group.id} - {group.event}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        {group.date}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(group.status)}`}>
                        {group.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-300">Guaranteed Profit</div>
                    <div className="text-2xl font-bold text-green-400">
                      ${metrics.guaranteedProfit.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-300">
                      {metrics.roi.toFixed(2)}% ROI
                    </div>
                  </div>
                </div>
              </div>

              {/* Bets */}
              <div className="p-4">
                {group.bets.map((bet, index) => (
                  <div key={bet.id} className={`flex justify-between items-center py-3 ${index > 0 ? 'border-t border-gray-200' : ''}`}>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Bet {index + 1}: {bet.sportsbook}
                      </div>
                      <div className="text-gray-600">{bet.pick}</div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <div className="text-sm text-gray-500">Stake</div>
                        <div className="font-semibold">${bet.stake.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">To Win</div>
                        <div className="font-semibold">${bet.toWin.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Result</div>
                        <div className={getResultColor(bet.result)}>{bet.result}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Totals */}
                <div className="border-t border-gray-300 pt-3 mt-3 bg-gray-50 -mx-4 px-4">
                  <div className="flex justify-between items-center font-semibold text-gray-900">
                    <span>Total: ${metrics.totalStaked.toFixed(2)} staked</span>
                    <span className="text-green-600">${metrics.guaranteedProfit.toFixed(2)} profit</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {arbGroups.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No arbitrage bets tracked yet. Add your first arbitrage opportunity above!</p>
        </div>
      )}
    </div>
  );
};

export default ArbitrageTracker;