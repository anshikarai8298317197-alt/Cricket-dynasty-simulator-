/**
 * WICKET DYNASTY - Tournament Standings, Fixtures & Leaderboards Hub (SCR_15 / SCR_16)
 * Points Table, Net Run Rate, Calendar Navigation, Complete Multi-Category Leaderboards
 */
import React, { useState } from 'react';
import { TournamentState, Fixture, PlayerTournamentStats } from '../types/tournament';
import { CareerSave } from '../types/career';
import { Player } from '../types/player';
import { getGlobalTeamById } from '../data/globalLeagues';
import { TournamentEngine } from '../services/tournamentEngine';
import { FranchiseLogo } from './FranchiseLogo';
import { PlayoffBracketView } from './PlayoffBracketView';
import {
  Trophy,
  Calendar,
  Award,
  ArrowLeft,
  PlayCircle,
  FastForward,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Flame,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';

interface TournamentHubScreenProps {
  career: CareerSave;
  tournament: TournamentState;
  allPlayers: Player[];
  onUpdateTournament: (updated: TournamentState) => void;
  onPlayLiveMatch: (fixture: Fixture) => void;
  onOpenChampionsLeague?: () => void;
  onOpenQAModal: () => void;
  onBack: () => void;
}

type TabType = 'TABLE' | 'BRACKET' | 'FIXTURES' | 'LEADERBOARDS';
type LeaderboardCategory = 'BATTING' | 'BOWLING' | 'FIELDING' | 'AWARDS';

export const TournamentHubScreen: React.FC<TournamentHubScreenProps> = ({
  career,
  tournament,
  allPlayers,
  onUpdateTournament,
  onPlayLiveMatch,
  onOpenChampionsLeague,
  onOpenQAModal,
  onBack,
}) => {
  const iplLeagueDone = tournament.fixtures
    .filter(f => f.playoffStage === 'NONE')
    .every(f => f.isCompleted);
  const [activeTab, setActiveTab] = useState<TabType>(iplLeagueDone ? 'BRACKET' : 'TABLE');
  const [selectedRound, setSelectedRound] = useState<number>(iplLeagueDone ? 15 : (tournament.currentRound || 1));
  const [filterMyTeamOnly, setFilterMyTeamOnly] = useState(false);

  // Leaderboard sub-tabs
  const [leaderboardCategory, setLeaderboardCategory] = useState<LeaderboardCategory>('BATTING');
  const [battingMetric, setBattingMetric] = useState<
    'orangeCap' | 'highestAverage' | 'highestStrikeRate' | 'mostSixes' | 'mostFours' | 'mostBoundaries' | 'mostFifties' | 'mostHundreds' | 'highestScore' | 'mostNotOuts'
  >('orangeCap');
  const [bowlingMetric, setBowlingMetric] = useState<
    'purpleCap' | 'bestEconomy' | 'bestBowlingAverage' | 'bestBowlingStrikeRate' | 'mostDotBalls' | 'mostMaidens' | 'bestFigures' | 'mostThreeWicketHauls' | 'mostFourWicketHauls' | 'mostFiveWicketHauls'
  >('purpleCap');
  const [fieldingMetric, setFieldingMetric] = useState<
    'mostCatches' | 'mostRunOuts' | 'mostStumpings' | 'mostDismissals'
  >('mostCatches');
  const [awardsMetric, setAwardsMetric] = useState<
    'mvpRace' | 'playerOfTheMatchRace' | 'bestAllRounder' | 'emergingPlayer' | 'mostConsistent'
  >('mvpRace');

  const leaderboards = TournamentEngine.getLeaderboards(tournament);

  // Fast simulate an AI or Next Match
  const handleSimulateFixture = (fixture: Fixture) => {
    if (fixture.isCompleted) return;

    if (fixture.homeFranchiseId === career.franchiseId || fixture.awayFranchiseId === career.franchiseId) {
      onPlayLiveMatch(fixture);
    } else {
      const result = TournamentEngine.simulateAiFixture(fixture, allPlayers, tournament, career.allFranchiseSquads);
      const updated = TournamentEngine.recordMatchResult(tournament, result);
      onUpdateTournament(updated);
    }
  };

  // Fast forward simulate entire current round
  const handleSimulateCurrentRound = () => {
    let currentTourn = tournament;
    const pendingInRound = currentTourn.fixtures.filter(
      f => f.roundNumber === selectedRound && !f.isCompleted
    );

    pendingInRound.forEach(f => {
      const result = TournamentEngine.simulateAiFixture(f, allPlayers, currentTourn, career.allFranchiseSquads);
      currentTourn = TournamentEngine.recordMatchResult(currentTourn, result);
    });

    onUpdateTournament(currentTourn);
  };

  const handleSimulateRemainingPlayoffs = () => {
    let currentTourn = tournament;
    for (let guard = 0; guard < 10; guard++) {
      const nextPlayoff = currentTourn.fixtures.find(
        f =>
          f.playoffStage !== 'NONE' &&
          !f.isCompleted &&
          !f.homeFranchiseId.startsWith('TBD') &&
          !f.awayFranchiseId.startsWith('TBD')
      );
      if (!nextPlayoff) break;
      const result = TournamentEngine.simulateAiFixture(
        nextPlayoff,
        allPlayers,
        currentTourn,
        career.allFranchiseSquads
      );
      currentTourn = TournamentEngine.recordMatchResult(currentTourn, result);
    }
    onUpdateTournament(currentTourn);
  };

  const filteredFixtures = tournament.fixtures.filter(f => {
    if (selectedRound === 15) {
      if (f.playoffStage === 'NONE') return false;
    } else {
      if (f.roundNumber !== selectedRound) return false;
    }

    if (filterMyTeamOnly) {
      return f.homeFranchiseId === career.franchiseId || f.awayFranchiseId === career.franchiseId;
    }
    return true;
  });

  // Render leaderboard list based on active metric
  const getActiveLeaderboardList = (): { list: PlayerTournamentStats[]; valueLabel: (p: PlayerTournamentStats) => string; subLabel: (p: PlayerTournamentStats) => string } => {
    if (leaderboardCategory === 'BATTING') {
      switch (battingMetric) {
        case 'orangeCap':
          return { list: leaderboards.orangeCap, valueLabel: p => `${p.runs} runs`, subLabel: p => `SR ${p.strikeRate} • ${p.innings} inn` };
        case 'highestAverage':
          return { list: leaderboards.highestAverage, valueLabel: p => `Avg ${p.battingAverage}`, subLabel: p => `${p.runs} runs (${p.ballsFaced} balls)` };
        case 'highestStrikeRate':
          return { list: leaderboards.highestStrikeRate, valueLabel: p => `SR ${p.strikeRate}`, subLabel: p => `${p.runs} runs (${p.ballsFaced} balls)` };
        case 'mostSixes':
          return { list: leaderboards.mostSixes, valueLabel: p => `${p.sixes} sixes`, subLabel: p => `${p.runs} runs` };
        case 'mostFours':
          return { list: leaderboards.mostFours, valueLabel: p => `${p.fours} fours`, subLabel: p => `${p.runs} runs` };
        case 'mostBoundaries':
          return { list: leaderboards.mostBoundaries, valueLabel: p => `${p.boundaries} bnd`, subLabel: p => `${p.fours} 4s + ${p.sixes} 6s` };
        case 'mostFifties':
          return { list: leaderboards.mostFifties, valueLabel: p => `${p.fifties} 50s`, subLabel: p => `HS ${p.highestScore}` };
        case 'mostHundreds':
          return { list: leaderboards.mostHundreds, valueLabel: p => `${p.hundreds} 100s`, subLabel: p => `HS ${p.highestScore}` };
        case 'highestScore':
          return { list: leaderboards.highestScore, valueLabel: p => `HS ${p.highestScore}`, subLabel: p => `${p.runs} total runs` };
        case 'mostNotOuts':
          return { list: leaderboards.mostNotOuts, valueLabel: p => `${p.notOuts} NO`, subLabel: p => `${p.innings} innings` };
      }
    } else if (leaderboardCategory === 'BOWLING') {
      switch (bowlingMetric) {
        case 'purpleCap':
          return { list: leaderboards.purpleCap, valueLabel: p => `${p.wickets} wkts`, subLabel: p => `Econ ${p.economy} • ${p.oversBowled} ov` };
        case 'bestEconomy':
          return { list: leaderboards.bestEconomy, valueLabel: p => `Econ ${p.economy}`, subLabel: p => `${p.wickets} wkts (${p.oversBowled} ov)` };
        case 'bestBowlingAverage':
          return { list: leaderboards.bestBowlingAverage, valueLabel: p => `Avg ${p.bowlingAverage}`, subLabel: p => `${p.wickets} wkts • ${p.runsConceded} runs` };
        case 'bestBowlingStrikeRate':
          return { list: leaderboards.bestBowlingStrikeRate, valueLabel: p => `SR ${p.bowlingStrikeRate}`, subLabel: p => `${p.wickets} wkts (${p.legalBallsBowled} balls)` };
        case 'mostDotBalls':
          return { list: leaderboards.mostDotBalls, valueLabel: p => `${p.dotBalls} dots`, subLabel: p => `${p.oversBowled} overs` };
        case 'mostMaidens':
          return { list: leaderboards.mostMaidens, valueLabel: p => `${p.maidens} maidens`, subLabel: p => `Econ ${p.economy}` };
        case 'bestFigures':
          return { list: leaderboards.bestFigures, valueLabel: p => p.bestBowlingText, subLabel: p => `${p.wickets} total wkts` };
        case 'mostThreeWicketHauls':
          return { list: leaderboards.mostThreeWicketHauls, valueLabel: p => `${p.threeWicketHauls} 3-fers`, subLabel: p => `${p.wickets} wkts` };
        case 'mostFourWicketHauls':
          return { list: leaderboards.mostFourWicketHauls, valueLabel: p => `${p.fourWicketHauls} 4-fers`, subLabel: p => `${p.wickets} wkts` };
        case 'mostFiveWicketHauls':
          return { list: leaderboards.mostFiveWicketHauls, valueLabel: p => `${p.fiveWicketHauls} 5-fers`, subLabel: p => `Best ${p.bestBowlingText}` };
      }
    } else if (leaderboardCategory === 'FIELDING') {
      switch (fieldingMetric) {
        case 'mostCatches':
          return { list: leaderboards.mostCatches, valueLabel: p => `${p.catches} catches`, subLabel: p => `${p.matches} matches` };
        case 'mostRunOuts':
          return { list: leaderboards.mostRunOuts, valueLabel: p => `${p.runOuts} run outs`, subLabel: p => `${p.matches} matches` };
        case 'mostStumpings':
          return { list: leaderboards.mostStumpings, valueLabel: p => `${p.stumpings} stumpings`, subLabel: p => `WK Specialist` };
        case 'mostDismissals':
          return { list: leaderboards.mostDismissals, valueLabel: p => `${p.totalDismissals} dismissals`, subLabel: p => `${p.catches}c + ${p.stumpings}st + ${p.runOuts}ro` };
      }
    } else {
      switch (awardsMetric) {
        case 'mvpRace':
          return { list: leaderboards.mvpRace, valueLabel: p => `${Math.round(p.mvpPoints)} pts`, subLabel: p => `${p.runs}r • ${p.wickets}w` };
        case 'playerOfTheMatchRace':
          return { list: leaderboards.playerOfTheMatchRace, valueLabel: p => `${p.playerOfTheMatchAwards} POTM`, subLabel: p => `${p.matches} matches` };
        case 'bestAllRounder':
          return { list: leaderboards.bestAllRounder, valueLabel: p => `${p.runs}r / ${p.wickets}w`, subLabel: p => `Double Threat` };
        case 'emergingPlayer':
          return { list: leaderboards.emergingPlayer, valueLabel: p => `${Math.round(p.mvpPoints)} pts`, subLabel: p => `Emerging Star` };
        case 'mostConsistent':
          return { list: leaderboards.mostConsistent, valueLabel: p => `Avg ${p.battingAverage}`, subLabel: p => `${p.runs} runs` };
      }
    }
  };

  const currentLeaderboardData = getActiveLeaderboardList();

  return (
    <div className="min-h-screen bg-[#080E1A] text-white flex flex-col font-sans select-none pb-20">
      {/* Top Header */}
      <div className="bg-[#0C1527] border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-black uppercase text-white tracking-wider">
              {tournament.name || 'T20 Franchise League'}
            </h1>
            <p className="text-[11px] text-amber-400 font-medium">
              Season {career.currentSeason} • 14-Match Double Group League
            </p>
          </div>
        </div>

        <button
          onClick={onOpenQAModal}
          className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 hover:bg-amber-500/20"
        >
          Engine QA
        </button>
      </div>

      {/* Primary Sub-Tabs (TABLE / BRACKET / FIXTURES / LEADERBOARDS) */}
      <div className="bg-[#0F1A30] border-b border-slate-800 px-3 py-2 flex items-center space-x-1.5">
        {(['TABLE', 'BRACKET', 'FIXTURES', 'LEADERBOARDS'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-900/50 text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'TABLE'
              ? 'Table'
              : tab === 'BRACKET'
              ? 'Playoffs'
              : tab === 'FIXTURES'
              ? 'Fixtures'
              : 'Leaders'}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-md mx-auto w-full space-y-4">
        {/* Phase Action Banner: Seeded Playoffs or IPL Complete -> GCL T20 */}
        {tournament.playoffs?.championFranchiseId ? (
          <div className="p-4 rounded-2xl card-3d-gold space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                  IPL {tournament.seasonYear || career.currentGameYear || 2026} Complete
                </span>
                <h3 className="text-sm font-black text-white">
                  {getGlobalTeamById(tournament.playoffs.championFranchiseId).name} Won the Trophy!
                </h3>
              </div>
              <Trophy className="w-7 h-7 text-amber-300 shrink-0" />
            </div>
            <div className="flex gap-2">
              {onOpenChampionsLeague && (
                <button
                  onClick={onOpenChampionsLeague}
                  className="flex-1 py-2.5 px-3 rounded-xl btn-game-gold text-[11px] uppercase tracking-wider cursor-pointer"
                >
                  Enter Champions League T20
                </button>
              )}
              <button
                onClick={onBack}
                className="py-2.5 px-3 rounded-xl btn-game-dark text-[11px] font-bold text-slate-200 cursor-pointer"
              >
                Home Hub
              </button>
            </div>
          </div>
        ) : iplLeagueDone ? (
          <div className="p-3.5 rounded-2xl card-3d-elevated border-amber-500/40 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 block">
                70/70 League Matches Done
              </span>
              <p className="text-xs font-bold text-white">
                Qualifier 1, Eliminator &amp; Final are ready!
              </p>
            </div>
            {activeTab !== 'BRACKET' && (
              <button
                onClick={() => setActiveTab('BRACKET')}
                className="px-3 py-2 rounded-xl btn-game-gold text-[11px] uppercase shrink-0 cursor-pointer"
              >
                View Playoffs
              </button>
            )}
          </div>
        ) : null}
        {/* ===================== TAB 1: POINTS TABLE ===================== */}
        {activeTab === 'TABLE' && (
          <div className="space-y-3">
            {/* Standings Header Info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  T20 League - Points Table
                </h3>
                <p className="text-[10px] text-slate-400">10 Teams • 14 Matches Each • Top 4 to Playoffs</p>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Official NRR Active
              </span>
            </div>

            {/* Standings Table Card */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
              {/* Table Header */}
              <div className="bg-slate-900/90 px-3 py-2.5 border-b border-slate-800 flex items-center justify-between font-black text-slate-400 text-[10px] uppercase">
                <span className="w-5">#</span>
                <span className="flex-1 pl-2">Team</span>
                <div className="flex space-x-3 font-mono">
                  <span className="w-5 text-center">P</span>
                  <span className="w-5 text-center">W</span>
                  <span className="w-5 text-center">L</span>
                  <span className="w-6 text-center font-black text-amber-400">Pts</span>
                  <span className="w-14 text-right">NRR</span>
                </div>
              </div>

              {/* Table Rows with Official Franchise Logos */}
              <div className="divide-y divide-slate-800/60">
                {tournament.pointsTable.map((entry, idx) => {
                  const franchise = getGlobalTeamById(entry.franchiseId);
                  const isUserTeam = entry.franchiseId === career.franchiseId;
                  const isPlayoffSpot = idx < 4;

                  return (
                    <div
                      key={entry.franchiseId}
                      className={`px-3 py-2.5 flex items-center justify-between transition-colors ${
                        isUserTeam
                          ? 'bg-amber-500/10 font-bold border-l-4 border-amber-500'
                          : idx % 2 === 0
                          ? 'bg-transparent'
                          : 'bg-slate-900/30'
                      }`}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span
                          className={`w-5 text-center font-mono font-bold text-xs ${
                            isPlayoffSpot ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <FranchiseLogo franchiseId={franchise.id} size={22} />
                        <span className={`text-xs truncate ${isUserTeam ? 'text-amber-300 font-black' : 'text-slate-200'}`}>
                          {franchise.shortName} {isUserTeam && '(You)'}
                        </span>
                      </div>

                      <div className="flex space-x-3 font-mono shrink-0 text-slate-300 text-xs">
                        <span className="w-5 text-center text-slate-400">{entry.played}</span>
                        <span className="w-5 text-center text-emerald-400 font-bold">{entry.won}</span>
                        <span className="w-5 text-center text-red-400">{entry.lost}</span>
                        <span className="w-6 text-center font-black text-amber-400">{entry.points}</span>
                        <span
                          className={`w-14 text-right font-mono font-bold ${
                            entry.netRunRate >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {entry.netRunRate > 0 ? `+${entry.netRunRate.toFixed(3)}` : entry.netRunRate.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Top 4 qualify for Playoffs
              </span>
              <span>All-out overs credited as full 20.0</span>
            </div>
          </div>
        )}

        {/* ===================== TAB: PLAYOFF BRACKET ===================== */}
        {activeTab === 'BRACKET' && (
          <PlayoffBracketView
            mode="PAGE_PLAYOFFS"
            fixtures={tournament.fixtures.filter(f => f.playoffStage !== 'NONE')}
            userFranchiseId={career.franchiseId}
            championFranchiseId={tournament.playoffs?.championFranchiseId}
            onPlayLive={onPlayLiveMatch}
            onSimulateFixture={handleSimulateFixture}
            onSimulateRemainingPlayoffs={handleSimulateRemainingPlayoffs}
          />
        )}

        {/* ===================== TAB 2: FIXTURES & CALENDAR ===================== */}
        {activeTab === 'FIXTURES' && (
          <div className="space-y-3">
            {/* Round Navigation Bar (1 to 14 league + 15 playoffs) */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {Array.from({ length: 14 }, (_, i) => i + 1).map(round => (
                <button
                  key={round}
                  onClick={() => setSelectedRound(round)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedRound === round
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Round {round}
                </button>
              ))}
              <button
                onClick={() => setSelectedRound(15)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedRound === 15
                    ? 'bg-purple-600 text-white font-black shadow'
                    : 'bg-slate-900 border border-purple-500/30 text-purple-300'
                }`}
              >
                🏆 Playoffs
              </button>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterMyTeamOnly}
                  onChange={e => setFilterMyTeamOnly(e.target.checked)}
                  className="rounded text-amber-500 bg-slate-900 border-slate-700"
                />
                <span>My Matches Only</span>
              </label>

              {selectedRound <= 14 && (
                <button
                  onClick={handleSimulateCurrentRound}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold py-1 px-3 rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Sim Round {selectedRound}</span>
                </button>
              )}
            </div>

            {/* Fixture Match Cards */}
            <div className="space-y-2.5">
              {filteredFixtures.map(fixture => {
                const home = getGlobalTeamById(fixture.homeFranchiseId);
                const away = getGlobalTeamById(fixture.awayFranchiseId);
                const isUserMatch =
                  fixture.homeFranchiseId === career.franchiseId || fixture.awayFranchiseId === career.franchiseId;

                return (
                  <div
                    key={fixture.fixtureId}
                    className={`bg-[#0F1A30] border rounded-2xl p-3.5 space-y-2.5 transition-all shadow-md ${
                      isUserMatch ? 'border-amber-500/50 bg-[#121E36]' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-amber-400 uppercase">
                        {fixture.playoffStage !== 'NONE'
                          ? fixture.playoffStage.replace('_', ' ')
                          : `Match ${fixture.matchNumber} • Round ${fixture.roundNumber}`}
                      </span>
                      <span>{fixture.dateStr}</span>
                    </div>

                    {/* Team Matchup Banner with Vector Logos */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1">
                        <FranchiseLogo franchiseId={fixture.homeFranchiseId} size={26} />
                        <div>
                          <span className="font-black text-sm text-white block truncate">{home?.shortName || fixture.homeFranchiseId}</span>
                          {fixture.homeScore && (
                            <span className="text-xs font-mono font-bold text-slate-300">
                              {fixture.homeScore.runs}/{fixture.homeScore.wickets} ({fixture.homeScore.oversDisplay})
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-black text-amber-400 font-mono px-2">VS</span>

                      <div className="flex items-center space-x-2 flex-1 justify-end text-right">
                        <div>
                          <span className="font-black text-sm text-white block truncate">{away?.shortName || fixture.awayFranchiseId}</span>
                          {fixture.awayScore && (
                            <span className="text-xs font-mono font-bold text-slate-300">
                              {fixture.awayScore.runs}/{fixture.awayScore.wickets} ({fixture.awayScore.oversDisplay})
                            </span>
                          )}
                        </div>
                        <FranchiseLogo franchiseId={fixture.awayFranchiseId} size={26} />
                      </div>
                    </div>

                    {/* Venue / Result Detail */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 truncate max-w-[200px]">
                        {fixture.isCompleted ? fixture.resultDescription : fixture.venue}
                      </span>

                      {!fixture.isCompleted ? (
                        <button
                          onClick={() => handleSimulateFixture(fixture)}
                          className={`px-3 py-1 rounded-xl text-xs font-black flex items-center space-x-1 ${
                            isUserMatch
                              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>{isUserMatch ? 'Play Live' : 'Simulate'}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: COMPLETE PLAYER LEADERBOARDS ===================== */}
        {activeTab === 'LEADERBOARDS' && (
          <div className="space-y-3">
            {/* Category Sub-Tabs (Batting, Bowling, Fielding, Awards) */}
            <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-[11px]">
              {(['BATTING', 'BOWLING', 'FIELDING', 'AWARDS'] as LeaderboardCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setLeaderboardCategory(cat)}
                  className={`py-1.5 rounded-xl font-bold transition-all ${
                    leaderboardCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Metric Pills Selector */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              {leaderboardCategory === 'BATTING' && (
                <>
                  {[
                    { id: 'orangeCap', label: 'Orange Cap' },
                    { id: 'highestAverage', label: 'Best Avg' },
                    { id: 'highestStrikeRate', label: 'Best SR' },
                    { id: 'mostSixes', label: 'Most 6s' },
                    { id: 'mostFours', label: 'Most 4s' },
                    { id: 'mostBoundaries', label: 'Boundaries' },
                    { id: 'mostFifties', label: '50s' },
                    { id: 'mostHundreds', label: '100s' },
                    { id: 'highestScore', label: 'High Score' },
                    { id: 'mostNotOuts', label: 'Not Outs' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setBattingMetric(m.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap border ${
                        battingMetric === m.id
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </>
              )}

              {leaderboardCategory === 'BOWLING' && (
                <>
                  {[
                    { id: 'purpleCap', label: 'Purple Cap' },
                    { id: 'bestEconomy', label: 'Best Econ' },
                    { id: 'bestBowlingAverage', label: 'Best Avg' },
                    { id: 'bestBowlingStrikeRate', label: 'Best SR' },
                    { id: 'mostDotBalls', label: 'Dot Balls' },
                    { id: 'mostMaidens', label: 'Maidens' },
                    { id: 'bestFigures', label: 'Best Figures' },
                    { id: 'mostThreeWicketHauls', label: '3-fers' },
                    { id: 'mostFourWicketHauls', label: '4-fers' },
                    { id: 'mostFiveWicketHauls', label: '5-fers' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setBowlingMetric(m.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap border ${
                        bowlingMetric === m.id
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </>
              )}

              {leaderboardCategory === 'FIELDING' && (
                <>
                  {[
                    { id: 'mostCatches', label: 'Most Catches' },
                    { id: 'mostRunOuts', label: 'Most Run Outs' },
                    { id: 'mostStumpings', label: 'Stumpings' },
                    { id: 'mostDismissals', label: 'Total Dismissals' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setFieldingMetric(m.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap border ${
                        fieldingMetric === m.id
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </>
              )}

              {leaderboardCategory === 'AWARDS' && (
                <>
                  {[
                    { id: 'mvpRace', label: 'MVP Race' },
                    { id: 'playerOfTheMatchRace', label: 'Player of Match' },
                    { id: 'bestAllRounder', label: 'Best All-Rounder' },
                    { id: 'emergingPlayer', label: 'Emerging Player' },
                    { id: 'mostConsistent', label: 'Most Consistent' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setAwardsMetric(m.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap border ${
                        awardsMetric === m.id
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Leaderboard Player List */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl p-3 space-y-2 shadow-xl">
              {currentLeaderboardData.list.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs italic">
                  No match data recorded for this category yet. Simulate or play matches to build leaderboard rankings!
                </div>
              ) : (
                currentLeaderboardData.list.slice(0, 10).map((p, idx) => (
                  <div
                    key={p.playerId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span
                        className={`w-5 font-mono font-black text-center ${
                          idx === 0
                            ? 'text-amber-400 text-sm'
                            : idx === 1
                            ? 'text-slate-300'
                            : idx === 2
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <FranchiseLogo franchiseId={p.franchiseId} size={22} />
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{p.playerName}</span>
                        <span className="text-[10px] text-slate-400">{currentLeaderboardData.subLabel(p)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-amber-400 font-mono text-sm block">
                        {currentLeaderboardData.valueLabel(p)}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{p.franchiseId}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
