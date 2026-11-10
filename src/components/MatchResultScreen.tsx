/**
 * WICKET DYNASTY - Match Result & Comprehensive Scorecard Screen (SCR_19)
 * Victory Presentation, Player of the Match, Detailed Scorecards, Fall of Wickets
 */
import React, { useState } from 'react';
import { MatchResultDetails } from '../types/match';
import { FRANCHISES } from '../data/franchises';
import { Trophy, Award, ArrowLeft, ChevronRight, BarChart2, FileText, CheckCircle2 } from 'lucide-react';

interface MatchResultScreenProps {
  matchResult: MatchResultDetails;
  onContinue: () => void;
}

export const MatchResultScreen: React.FC<MatchResultScreenProps> = ({
  matchResult,
  onContinue,
}) => {
  const [activeTab, setActiveTab] = useState<'SCORECARD' | 'POTM' | 'OVERS'>('SCORECARD');
  const [activeInningsTab, setActiveInningsTab] = useState<1 | 2>(1);

  const homeFranchise = FRANCHISES.find(f => f.id === matchResult.homeFranchiseId) || FRANCHISES[0];
  const awayFranchise = FRANCHISES.find(f => f.id === matchResult.awayFranchiseId) || FRANCHISES[1];

  const innings1 = matchResult.innings1;
  const innings2 = matchResult.innings2;

  const currentInnings = activeInningsTab === 1 ? innings1 : innings2;
  const currentBattingFranchise =
    FRANCHISES.find(f => f.id === currentInnings.battingFranchiseId) || homeFranchise;

  return (
    <div className="min-h-screen bg-[#080E1A] text-white flex flex-col font-sans select-none pb-20">
      {/* Top Header */}
      <div className="bg-[#0C1527] border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={onContinue}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-black uppercase text-white tracking-wider">Match Result</h1>
            <p className="text-[11px] text-amber-400 font-medium">{matchResult.fixtureId}</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
          FINAL RESULT
        </span>
      </div>

      <div className="p-4 max-w-md mx-auto w-full space-y-4">
        {/* Matchup Crests & Scores (Reference Design Replica) */}
        <div className="bg-gradient-to-r from-[#172545] via-[#0E1A33] to-[#172545] border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between text-center shadow-xl">
          {/* Home Team */}
          <div className="flex flex-col items-center flex-1">
            <div
              className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-black text-sm shadow-lg mb-1.5"
              style={{
                backgroundColor: homeFranchise.primaryColor + '30',
                borderColor: homeFranchise.primaryColor,
              }}
            >
              {homeFranchise.shortName}
            </div>
            <span className="font-black text-white text-xs">{homeFranchise.shortName}</span>
            <span className="text-sm font-mono font-bold text-slate-200 mt-0.5">
              {matchResult.homeFranchiseId === innings1.battingFranchiseId
                ? `${innings1.totalRuns}/${innings1.totalWickets}`
                : `${innings2.totalRuns}/${innings2.totalWickets}`}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({matchResult.homeFranchiseId === innings1.battingFranchiseId ? innings1.oversDisplay : innings2.oversDisplay} ov)
            </span>
          </div>

          <span className="text-xs font-black text-amber-400 font-mono px-2">VS</span>

          {/* Away Team */}
          <div className="flex flex-col items-center flex-1">
            <div
              className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-black text-sm shadow-lg mb-1.5"
              style={{
                backgroundColor: awayFranchise.primaryColor + '30',
                borderColor: awayFranchise.primaryColor,
              }}
            >
              {awayFranchise.shortName}
            </div>
            <span className="font-black text-white text-xs">{awayFranchise.shortName}</span>
            <span className="text-sm font-mono font-bold text-slate-200 mt-0.5">
              {matchResult.awayFranchiseId === innings1.battingFranchiseId
                ? `${innings1.totalRuns}/${innings1.totalWickets}`
                : `${innings2.totalRuns}/${innings2.totalWickets}`}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({matchResult.awayFranchiseId === innings1.battingFranchiseId ? innings1.oversDisplay : innings2.oversDisplay} ov)
            </span>
          </div>
        </div>

        {/* Victory Announcement Banner */}
        <div className="bg-emerald-500/20 border-2 border-emerald-500/40 rounded-2xl py-3 px-4 text-center shadow-lg">
          <span className="text-sm font-black text-emerald-300 uppercase tracking-wide">
            {matchResult.marginDescription}
          </span>
        </div>

        {/* Player of the Match Card */}
        <div className="bg-[#101D36] border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                Player of the Match
              </span>
              <h3 className="text-sm font-black text-white">{matchResult.playerOfTheMatch.playerName}</h3>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                {matchResult.playerOfTheMatch.performanceSummary}
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-amber-400 font-mono bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
            {matchResult.playerOfTheMatch.impactScore} pts
          </span>
        </div>

        {/* Sub-Tabs: Scorecard / Overs */}
        <div className="flex space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('SCORECARD')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'SCORECARD' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
            }`}
          >
            Scorecard
          </button>
          <button
            onClick={() => setActiveTab('OVERS')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'OVERS' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
            }`}
          >
            Over Breakdown
          </button>
        </div>

        {/* SCORECARD TAB */}
        {activeTab === 'SCORECARD' && (
          <div className="space-y-3">
            {/* Innings 1 vs Innings 2 Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveInningsTab(1)}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold border transition-all ${
                  activeInningsTab === 1
                    ? 'bg-slate-800 border-amber-500 text-white'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                1st Innings ({innings1.totalRuns}/{innings1.totalWickets})
              </button>
              <button
                onClick={() => setActiveInningsTab(2)}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold border transition-all ${
                  activeInningsTab === 2
                    ? 'bg-slate-800 border-amber-500 text-white'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                2nd Innings ({innings2.totalRuns}/{innings2.totalWickets})
              </button>
            </div>

            {/* Batting Table */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-900/80 px-3 py-2 border-b border-slate-800 flex justify-between font-bold text-slate-400 text-[10px] uppercase">
                <span>Batter ({currentBattingFranchise.shortName})</span>
                <div className="flex space-x-3 font-mono">
                  <span className="w-6 text-right">R</span>
                  <span className="w-6 text-right">B</span>
                  <span className="w-5 text-right">4s</span>
                  <span className="w-5 text-right">6s</span>
                  <span className="w-10 text-right">SR</span>
                </div>
              </div>
              <div className="divide-y divide-slate-800/60">
                {currentInnings.batters
                  .filter(b => b.balls > 0 || b.isOut)
                  .map(b => (
                    <div key={b.playerId} className="px-3 py-2 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-white block truncate">{b.playerName}</span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {b.isOut ? b.dismissalSummary : 'not out'}
                        </span>
                      </div>
                      <div className="flex space-x-3 font-mono shrink-0 text-slate-200">
                        <span className="w-6 text-right font-black text-amber-400">{b.runs}</span>
                        <span className="w-6 text-right text-slate-400">{b.balls}</span>
                        <span className="w-5 text-right">{b.fours}</span>
                        <span className="w-5 text-right">{b.sixes}</span>
                        <span className="w-10 text-right text-slate-400">{b.strikeRate}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bowling Table */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-900/80 px-3 py-2 border-b border-slate-800 flex justify-between font-bold text-slate-400 text-[10px] uppercase">
                <span>Bowler</span>
                <div className="flex space-x-3 font-mono">
                  <span className="w-6 text-right">O</span>
                  <span className="w-6 text-right">M</span>
                  <span className="w-6 text-right">R</span>
                  <span className="w-6 text-right font-black text-red-400">W</span>
                  <span className="w-10 text-right">Econ</span>
                </div>
              </div>
              <div className="divide-y divide-slate-800/60">
                {currentInnings.bowlers.map(bw => (
                  <div key={bw.playerId} className="px-3 py-2 flex items-center justify-between">
                    <span className="font-bold text-white truncate pr-2">{bw.playerName}</span>
                    <div className="flex space-x-3 font-mono shrink-0 text-slate-200">
                      <span className="w-6 text-right">{bw.oversDisplay}</span>
                      <span className="w-6 text-right text-slate-400">{bw.maidens}</span>
                      <span className="w-6 text-right">{bw.runsConceded}</span>
                      <span className="w-6 text-right font-black text-red-400">{bw.wickets}</span>
                      <span className="w-10 text-right text-slate-400">{bw.economy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OVER BREAKDOWN TAB */}
        {activeTab === 'OVERS' && (
          <div className="space-y-2">
            {currentInnings.overSummaries.map(over => (
              <div
                key={over.overNumber}
                className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white">Over {over.overNumber}</span>
                  <p className="text-[10px] text-slate-400">{over.bowlerName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {over.balls.map((b, i) => (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px] ${
                          b.isWicket
                            ? 'bg-red-600 text-white font-bold'
                            : b.totalRuns >= 4
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {b.isWicket ? 'W' : b.totalRuns}
                      </span>
                    ))}
                  </div>
                  <span className="font-mono font-bold text-amber-400 pl-2">
                    {over.teamScoreAtEnd}/{over.teamWicketsAtEnd}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0C1527]/95 backdrop-blur-md border-t border-slate-800 p-3 flex justify-center">
        <button
          onClick={onContinue}
          className="w-full max-w-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center space-x-2 shadow-xl"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Continue to Tournament Hub</span>
        </button>
      </div>
    </div>
  );
};
