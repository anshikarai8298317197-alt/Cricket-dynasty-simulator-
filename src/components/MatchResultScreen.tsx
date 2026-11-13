/**
 * WICKET DYNASTY - Match Result & Comprehensive Scorecard Screen (SCR_19)
 * Victory Presentation, Player of the Match, Detailed Scorecards, Fall of Wickets
 */
import React, { useState } from 'react';
import { MatchResultDetails } from '../types/match';
import { getGlobalTeamById } from '../data/globalLeagues';
import { FranchiseLogo } from './FranchiseLogo';
import { Award, ArrowLeft, CheckCircle2, Video } from 'lucide-react';
import { LevelPlayService } from '../services/levelPlayService';

interface MatchResultScreenProps {
  matchResult: MatchResultDetails;
  onContinue: () => void;
  onClaimBroadcastBonus?: (amountCr: number, rewardToken: string) => void;
  bonusClaimed?: boolean;
}

export const MatchResultScreen: React.FC<MatchResultScreenProps> = ({
  matchResult,
  onContinue,
  onClaimBroadcastBonus,
  bonusClaimed = false,
}) => {
  const [activeTab, setActiveTab] = useState<'SCORECARD' | 'POTM' | 'OVERS'>('SCORECARD');
  const [activeInningsTab, setActiveInningsTab] = useState<1 | 2>(1);
  const [adBusy, setAdBusy] = useState(false);
  const [adNote, setAdNote] = useState<string | null>(null);

  const handleContinueWithBreakAd = async () => {
    await LevelPlayService.tryShowInterstitial('MATCH_RESULT_SCREEN', { protectedFlow: null });
    onContinue();
  };

  const handleWatchBonusAd = async () => {
    if (adBusy || bonusClaimed || !onClaimBroadcastBonus) return;
    setAdBusy(true);
    setAdNote(null);
    const res = await LevelPlayService.showRewardedAd('MATCH_RESULT_BONUS');
    setAdBusy(false);
    if (res.completed && res.rewardToken) {
      onClaimBroadcastBonus(1.0, res.rewardToken);
      setAdNote('Verified! +₹1.0 Cr Broadcast Bonus credited to your franchise purse.');
    } else {
      setAdNote(res.reason || 'Ad not completed — broadcast bonus not granted.');
    }
  };

  const homeFranchise = getGlobalTeamById(matchResult.homeFranchiseId);
  const awayFranchise = getGlobalTeamById(matchResult.awayFranchiseId);

  const innings1 = matchResult.innings1;
  const innings2 = matchResult.innings2;

  const currentInnings = activeInningsTab === 1 ? innings1 : innings2;
  const currentBattingFranchise = getGlobalTeamById(currentInnings.battingFranchiseId);

  return (
    <div className="min-h-screen bg-[#080E1A] text-white flex flex-col font-sans select-none pb-20">
      {/* Top Header */}
      <div className="bg-[#0C1527] border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleContinueWithBreakAd}
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
        {/* Matchup Crests & Scores */}
        <div className="animate-result-enter-1 card-3d-elevated rounded-2xl p-4 flex items-center justify-between text-center">
          {/* Home Team */}
          <div className="flex flex-col items-center flex-1">
            <FranchiseLogo franchiseId={homeFranchise.id} size={48} className="mb-1.5" />
            <span className="font-black text-white text-xs">{homeFranchise.shortName}</span>
            <span className="text-sm font-mono font-bold text-slate-200 mt-0.5 tabular-nums">
              {matchResult.homeFranchiseId === innings1.battingFranchiseId
                ? `${innings1.totalRuns}/${innings1.totalWickets}`
                : `${innings2.totalRuns}/${innings2.totalWickets}`}
            </span>
            <span className="text-[10px] text-slate-400 font-mono tabular-nums">
              ({matchResult.homeFranchiseId === innings1.battingFranchiseId ? innings1.oversDisplay : innings2.oversDisplay} ov)
            </span>
          </div>

          <span className="pill-3d text-xs font-black text-amber-400 font-mono bg-[#0C1527] px-2.5 py-1 rounded-xl border border-amber-500/30">
            VS
          </span>

          {/* Away Team */}
          <div className="flex flex-col items-center flex-1">
            <FranchiseLogo franchiseId={awayFranchise.id} size={48} className="mb-1.5" />
            <span className="font-black text-white text-xs">{awayFranchise.shortName}</span>
            <span className="text-sm font-mono font-bold text-slate-200 mt-0.5 tabular-nums">
              {matchResult.awayFranchiseId === innings1.battingFranchiseId
                ? `${innings1.totalRuns}/${innings1.totalWickets}`
                : `${innings2.totalRuns}/${innings2.totalWickets}`}
            </span>
            <span className="text-[10px] text-slate-400 font-mono tabular-nums">
              ({matchResult.awayFranchiseId === innings1.battingFranchiseId ? innings1.oversDisplay : innings2.oversDisplay} ov)
            </span>
          </div>
        </div>

        {/* Victory Announcement Banner */}
        <div className="animate-result-enter-2 bg-gradient-to-b from-emerald-500/25 to-emerald-900/25 border-t border-x border-emerald-400/50 border-b-4 border-b-emerald-800 rounded-2xl py-3.5 px-4 text-center shadow-[0_12px_28px_rgba(16,185,129,0.2)]">
          <span className="text-sm font-black text-emerald-300 uppercase tracking-wide block">
            {matchResult.marginDescription}
          </span>
        </div>

        {/* Player of the Match Card */}
        <div className="animate-result-enter-3 card-3d-gold rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
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
          <span className="text-xs font-black text-amber-400 font-mono bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 tabular-nums shrink-0">
            {matchResult.playerOfTheMatch.impactScore} pts
          </span>
        </div>

        {/* Optional Broadcast Bonus Rewarded Ad */}
        {onClaimBroadcastBonus && (
          <div className="animate-result-enter-3 p-3 rounded-2xl bg-[#101B33] border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-black text-white block">
                Post-Match Broadcast Sponsor Bonus
              </span>
              <span className="text-[10px] text-amber-300">
                {bonusClaimed
                  ? '+₹1.0 Cr Broadcast Bonus already claimed for this match'
                  : 'Optional: Watch Ad for +₹1.0 Cr Treasury Payout'}
              </span>
              {adNote && (
                <p className="text-[10px] text-slate-300 mt-1">{adNote}</p>
              )}
            </div>
            <button
              onClick={handleWatchBonusAd}
              disabled={adBusy || bonusClaimed}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-45 text-slate-950 font-black text-[10px] uppercase flex items-center space-x-1 shrink-0"
            >
              <Video className="w-3.5 h-3.5" />
              <span>{bonusClaimed ? 'Claimed' : adBusy ? 'Loading...' : 'Watch Ad (+₹1 Cr)'}</span>
            </button>
          </div>
        )}

        {/* Sub-Tabs: Scorecard / Overs */}
        <div className="animate-result-enter-4 flex space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
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
          <div className="animate-result-enter-4 space-y-3">
            {/* Innings 1 vs Innings 2 Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveInningsTab(1)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  activeInningsTab === 1
                    ? 'bg-slate-800 border-amber-500 text-white'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                1st Innings ({innings1.totalRuns}/{innings1.totalWickets})
              </button>
              <button
                onClick={() => setActiveInningsTab(2)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  activeInningsTab === 2
                    ? 'bg-slate-800 border-amber-500 text-white'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                2nd Innings ({innings2.totalRuns}/{innings2.totalWickets})
              </button>
            </div>

            {/* Batting Table */}
            <div className="card-3d-elevated rounded-xl overflow-hidden text-xs">
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
                      <div className="flex space-x-3 font-mono shrink-0 text-slate-200 tabular-nums">
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
            <div className="card-3d-elevated rounded-xl overflow-hidden text-xs">
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
                    <div className="flex space-x-3 font-mono shrink-0 text-slate-200 tabular-nums">
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
          <div className="animate-result-enter-4 space-y-2">
            {currentInnings.overSummaries.map(over => (
              <div
                key={over.overNumber}
                className="card-3d-elevated rounded-xl p-3 flex items-center justify-between text-xs"
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
                  <span className="font-mono font-bold text-amber-400 pl-2 tabular-nums">
                    {over.teamScoreAtEnd}/{over.teamWicketsAtEnd}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="animate-result-enter-5 fixed bottom-0 left-0 right-0 bg-[#0C1527]/95 backdrop-blur-md border-t border-slate-800 p-3 flex justify-center">
        <button
          onClick={handleContinueWithBreakAd}
          className="w-full max-w-md btn-game-gold py-3 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center space-x-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>Continue to Tournament Hub</span>
        </button>
      </div>
    </div>
  );
};
