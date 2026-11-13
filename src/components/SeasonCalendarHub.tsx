/**
 * WICKET DYNASTY - Complete Year-Round Season Calendar, Multi-League, GCL, Trophy Room & Match History Hub
 */
import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  FastForward,
  Globe,
  History,
  PlayCircle,
  Sliders,
  Trophy,
  Users,
  BarChart3,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { CareerSave } from '../types/career';
import {
  CompetitionId,
  DomesticLeagueId,
  GCLQualificationSlotConfig,
} from '../types/globalSeason';
import { Player } from '../types/player';
import { Fixture } from '../types/tournament';
import {
  DOMESTIC_LEAGUES,
  GLOBAL_TEAMS,
  getGlobalTeamById,
  getGlobalTeamSquad,
  getLeagueDefinition,
} from '../data/globalLeagues';
import {
  GlobalSeasonEngine,
  formatShortDateFromIso,
} from '../services/globalSeasonEngine';
import { TournamentEngine } from '../services/tournamentEngine';
import { FranchiseLogo } from './FranchiseLogo';
import { PlayoffBracketView } from './PlayoffBracketView';
import { TrophyArtwork3D } from './TrophyArtwork3D';
import { PlayerAvatar } from './PlayerAvatar';

export type SeasonHubSection =
  | 'CALENDAR'
  | 'LEAGUES'
  | 'GCL'
  | 'TROPHIES'
  | 'HISTORY'
  | 'TEAMS';

interface SeasonCalendarHubProps {
  career: CareerSave;
  allPlayers: Player[];
  initialSection?: SeasonHubSection;
  initialLeagueId?: DomesticLeagueId;
  onUpdateCareer: (
    updated: CareerSave,
    newTrophies?: import('../types/globalSeason').CareerTrophy[]
  ) => void;
  onPlayLiveMatch: (fixture: Fixture, competitionId: CompetitionId) => void;
  onBack: () => void;
}

export const SeasonCalendarHub: React.FC<SeasonCalendarHubProps> = ({
  career: rawCareer,
  allPlayers,
  initialSection = 'CALENDAR',
  initialLeagueId = 'IPL',
  onUpdateCareer,
  onPlayLiveMatch,
  onBack,
}) => {
  const career = useMemo(
    () => GlobalSeasonEngine.ensureCareerWorldSeason(rawCareer, allPlayers),
    [rawCareer, allPlayers]
  );
  const ws = career.worldSeason!;

  const [section, setSection] = useState<SeasonHubSection>(initialSection);
  const [selectedLeagueId, setSelectedLeagueId] =
    useState<DomesticLeagueId>(initialLeagueId);
  const [leagueSubTab, setLeagueSubTab] = useState<
    'STANDINGS' | 'BRACKET' | 'FIXTURES' | 'STATS'
  >('STANDINGS');
  const [gclSubTab, setGclSubTab] = useState<
    'GROUPS' | 'BRACKET' | 'QUALIFIERS' | 'STATS'
  >('GROUPS');
  const [showSlotEditor, setShowSlotEditor] = useState(false);
  const [slotDraft, setSlotDraft] = useState<GCLQualificationSlotConfig>(
    ws.gclSlotConfig
  );
  const [teamLeagueFilter, setTeamLeagueFilter] = useState<
    DomesticLeagueId | 'ALL'
  >('ALL');
  const [inspectTeamId, setInspectTeamId] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'USER' | 'ALL'>('USER');
  const [simNotice, setSimNotice] = useState<string | null>(null);

  const protectedFixtureId = GlobalSeasonEngine.getActiveProtectedFixtureId();

  const applySimResult = (
    res: {
      updatedCareer: CareerSave;
      simulatedCount: number;
      newlyAwardedTrophies?: import('../types/globalSeason').CareerTrophy[];
    },
    label: string
  ) => {
    onUpdateCareer(res.updatedCareer, res.newlyAwardedTrophies);
    setSimNotice(
      res.simulatedCount > 0
        ? `${label}: ${res.simulatedCount} ${
            res.simulatedCount === 1 ? 'match' : 'matches'
          } completed`
        : `${label}: Date updated`
    );
  };

  const handleSimMatch = () => {
    const res = GlobalSeasonEngine.simulateOneMatch(career, allPlayers, false);
    applySimResult(res, 'Match Simulated');
  };

  const handleSimDays = (days: number, label: string) => {
    const res = GlobalSeasonEngine.simulateDays(career, days, allPlayers);
    applySimResult(res, label);
  };

  const handleSimLeague = (leagueId: DomesticLeagueId, stageOnly: boolean) => {
    const res = GlobalSeasonEngine.simulateRemainingLeague(
      career,
      leagueId,
      allPlayers,
      stageOnly
    );
    const def = getLeagueDefinition(leagueId);
    applySimResult(
      res,
      stageOnly ? `${def.shortName} League Stage` : `${def.shortName} Completed`
    );
  };

  const handleSimFullSeason = () => {
    const res = GlobalSeasonEngine.simulateEntireSeason(career, allPlayers);
    applySimResult(res, 'Full Year Season Simulated');
  };

  const handleGenerateGcl = () => {
    const { worldSeason } = GlobalSeasonEngine.generateChampionsLeague(
      ws,
      allPlayers,
      career,
      slotDraft
    );
    const nextDate =
      worldSeason.currentDateIso < `${worldSeason.currentGameYear}-10-02`
        ? `${worldSeason.currentGameYear}-10-02`
        : worldSeason.currentDateIso;
    onUpdateCareer({
      ...career,
      seasonPhase: 'Champions League',
      worldSeason: {
        ...worldSeason,
        currentDateIso: nextDate,
      },
      currentCareerDate: new Date(`${nextDate}T12:00:00`).getTime(),
    });
    setShowSlotEditor(false);
    setSimNotice('Global Champions League T20 Draw Generated');
  };

  const handleStartNextYear = () => {
    const { updatedCareer } = GlobalSeasonEngine.advanceToNextCalendarYear(
      career,
      allPlayers
    );
    onUpdateCareer(updatedCareer);
    setSimNotice(
      `Advanced to Season ${updatedCareer.currentSeason} (${updatedCareer.currentGameYear})`
    );
    setSection('CALENDAR');
  };

  const handlePlayOrSimFixture = (
    fixture: Fixture,
    compId: CompetitionId
  ) => {
    const isUser =
      fixture.homeFranchiseId === career.franchiseId ||
      fixture.awayFranchiseId === career.franchiseId;
    if (isUser) {
      onPlayLiveMatch(fixture, compId);
      return;
    }
    const res = GlobalSeasonEngine.simulateSpecificFixture(
      career,
      compId,
      fixture.fixtureId,
      allPlayers
    );
    onUpdateCareer(res.updatedCareer, res.newlyAwardedTrophies);
  };

  const upcomingFixtures = useMemo(
    () => GlobalSeasonEngine.getUpcomingScheduledFixtures(ws),
    [ws]
  );

  const selectedLeague = ws.domesticLeagues[selectedLeagueId];
  const selectedLeagueDef = getLeagueDefinition(selectedLeagueId);
  const selectedLeagueLeaders = useMemo(
    () => TournamentEngine.getLeaderboards(selectedLeague),
    [selectedLeague]
  );

  const gcl = ws.championsLeague;
  const gclLeaders = useMemo(() => {
    if (!gcl) return { runs: [], wickets: [] };
    const stats = Object.values(gcl.playerStats || {});
    return {
      runs: [...stats].sort((a, b) => b.runs - a.runs).slice(0, 8),
      wickets: [...stats]
        .sort((a, b) =>
          b.wickets !== a.wickets ? b.wickets - a.wickets : a.economy - b.economy
        )
        .slice(0, 8),
    };
  }, [gcl]);

  const gclFinished = gcl?.status === 'COMPLETED';
  const permanentTrophies = career.trophiesCollected || [];
  const matchHistory = career.matchHistory || [];

  const filteredTeams = useMemo(() => {
    if (teamLeagueFilter === 'ALL') return GLOBAL_TEAMS;
    return GLOBAL_TEAMS.filter(t => t.leagueId === teamLeagueFilter);
  }, [teamLeagueFilter]);

  const inspectTeamObj = inspectTeamId ? getGlobalTeamById(inspectTeamId) : null;
  const inspectTeamSquad = useMemo(() => {
    if (!inspectTeamObj) return [];
    return getGlobalTeamSquad(inspectTeamObj.id, allPlayers, career);
  }, [inspectTeamObj, allPlayers, career]);

  return (
    <div className="min-h-screen bg-[#080E1A] text-white flex flex-col font-sans select-none pb-8">
      {/* Header */}
      <header className="bg-[#0C1527] border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onBack}
            aria-label="Back to Career Hub"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-black uppercase tracking-wider text-white truncate">
              World Cricket Season {ws.currentGameYear}
            </h1>
            <p className="text-[11px] text-amber-400 font-semibold tabular-nums truncate">
              {formatShortDateFromIso(ws.currentDateIso)} · Season{' '}
              {career.currentSeason}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[11px] font-mono font-black text-emerald-400 tabular-nums block">
            {permanentTrophies.length} Trophies
          </span>
          <span className="text-[10px] text-slate-400 font-mono tabular-nums">
            {upcomingFixtures.length} Scheduled
          </span>
        </div>
      </header>

      {/* Primary Section Bar */}
      <nav className="bg-[#0B1324] border-b border-slate-800 px-3 py-2 flex items-center space-x-1.5 overflow-x-auto scrollbar-none sticky top-[64px] z-20">
        {(
          [
            { id: 'CALENDAR', label: 'Calendar', icon: Calendar },
            { id: 'LEAGUES', label: 'Leagues (8)', icon: BarChart3 },
            { id: 'GCL', label: 'Champions League', icon: Globe },
            { id: 'TROPHIES', label: 'Trophy Room', icon: Trophy },
            { id: 'HISTORY', label: 'History', icon: History },
            { id: 'TEAMS', label: 'Global Teams', icon: Users },
          ] as { id: SeasonHubSection; label: string; icon: React.ComponentType<{ className?: string }> }[]
        ).map(tab => {
          const Icon = tab.icon;
          const active = section === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
                active
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'bg-[#121E36] text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Feedback Banner */}
      {simNotice && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{simNotice}</span>
          <button
            onClick={() => setSimNotice(null)}
            className="text-[11px] font-black text-emerald-200 px-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="p-4 max-w-md mx-auto w-full space-y-4">
        {/* ==================== 1. CALENDAR & SIMULATION ENGINE ==================== */}
        {section === 'CALENDAR' && (
          <div className="space-y-4">
            {/* Protected Active Live Match Banner */}
            {protectedFixtureId && (
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-xs text-amber-200">
                Active match in progress ({protectedFixtureId}) is locked and will
                never be auto-simulated by calendar fast-forward.
              </div>
            )}

            {/* Calendar Simulation Controls */}
            <div className="p-4 rounded-2xl card-3d-elevated space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-white">
                    Season Simulation Controls
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Current Date: {ws.currentDateIso}
                  </p>
                </div>
                <FastForward className="w-4 h-4 text-amber-400" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSimMatch}
                  className="min-h-[44px] px-3 py-2 rounded-xl tile-3d text-xs font-bold text-white"
                >
                  Simulate 1 Match
                </button>
                <button
                  onClick={() => handleSimDays(1, 'Simulated 1 Day')}
                  className="min-h-[44px] px-3 py-2 rounded-xl tile-3d text-xs font-bold text-white"
                >
                  Simulate 1 Day
                </button>
                <button
                  onClick={() => handleSimDays(7, 'Simulated 1 Week')}
                  className="min-h-[44px] px-3 py-2 rounded-xl tile-3d text-xs font-bold text-white"
                >
                  Simulate 1 Week
                </button>
                <button
                  onClick={() => handleSimDays(30, 'Simulated 1 Month')}
                  className="min-h-[44px] px-3 py-2 rounded-xl tile-3d text-xs font-bold text-white"
                >
                  Simulate 1 Month
                </button>
                <button
                  onClick={() => handleSimLeague('IPL', true)}
                  className="min-h-[44px] px-3 py-2 rounded-xl tile-3d border-amber-500/40 text-xs font-bold text-amber-300"
                >
                  Sim Remaining League
                </button>
                <button
                  onClick={handleSimFullSeason}
                  className="min-h-[44px] px-3 py-2 rounded-xl btn-game-gold text-slate-950 text-xs font-black uppercase"
                >
                  Sim Entire Season
                </button>
              </div>

              {gclFinished && (
                <button
                  onClick={handleStartNextYear}
                  className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg"
                >
                  Advance to Season {career.currentSeason + 1} (
                  {ws.currentGameYear + 1})
                </button>
              )}
            </div>

            {/* Year-Round Competition Roadmap */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                {ws.currentGameYear} Global Cricket Calendar
              </h3>
              <div className="space-y-2">
                {DOMESTIC_LEAGUES.map(def => {
                  const trn = ws.domesticLeagues[def.id];
                  const doneCount = trn.fixtures.filter(f => f.isCompleted).length;
                  const champ = trn.playoffs?.championFranchiseId
                    ? getGlobalTeamById(trn.playoffs.championFranchiseId)
                    : null;

                  return (
                    <button
                      key={def.id}
                      onClick={() => {
                        setSelectedLeagueId(def.id);
                        setSection('LEAGUES');
                      }}
                      className="w-full p-3 rounded-2xl tile-3d hover:border-amber-500/40 flex items-center justify-between text-left"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: def.accentColor }}
                          />
                          <h4 className="text-xs font-black text-white truncate">
                            {def.name} ({def.countryCode})
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono tabular-nums">
                          {trn.startDateIso} to {trn.endDateIso} · {doneCount}/
                          {trn.fixtures.length} Matches
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {champ ? (
                          <div className="flex items-center space-x-1.5">
                            <FranchiseLogo franchiseId={champ.id} size={22} />
                            <span className="text-[11px] font-black text-emerald-400">
                              {champ.shortName} Won
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-400">
                            {doneCount > 0 ? 'In Progress' : 'Scheduled'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Global Champions League Card */}
                <button
                  onClick={() => setSection('GCL')}
                  className="w-full p-3.5 rounded-2xl card-3d-gold flex items-center justify-between text-left"
                >
                  <div>
                    <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      Global Champions League T20
                    </h4>
                    <p className="text-[10px] text-slate-300 mt-0.5 font-mono tabular-nums">
                      {ws.currentGameYear}-10-02 to {ws.currentGameYear}-10-28 ·
                      16 International Qualifiers
                    </p>
                  </div>
                  <span className="text-[11px] font-black text-white shrink-0">
                    {gcl
                      ? gcl.championFranchiseId
                        ? `${getGlobalTeamById(gcl.championFranchiseId).shortName} Champion`
                        : gcl.status.replace('_', ' ')
                      : 'Oct Window'}
                  </span>
                </button>
              </div>
            </div>

            {/* Upcoming Fixtures */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Upcoming Scheduled Fixtures ({upcomingFixtures.length})
              </h3>
              {upcomingFixtures.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#101C33] border border-slate-800 text-xs text-slate-400 text-center">
                  All fixtures for {ws.currentGameYear} are complete.
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingFixtures.slice(0, 8).map(item => {
                    const f = item.fixture;
                    const home = getGlobalTeamById(f.homeFranchiseId);
                    const away = getGlobalTeamById(f.awayFranchiseId);
                    const isUser =
                      f.homeFranchiseId === career.franchiseId ||
                      f.awayFranchiseId === career.franchiseId;

                    return (
                      <div
                        key={`${item.competitionId}_${f.fixtureId}`}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                          isUser
                            ? 'bg-[#14223D] border-amber-500/50'
                            : 'bg-[#0C1527] border-slate-800'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-amber-400 block truncate">
                            {item.competitionName} · {f.dateStr}
                          </span>
                          <div className="flex items-center space-x-2 mt-1">
                            <FranchiseLogo franchiseId={home.id} size={20} />
                            <span className="text-xs font-black text-white">
                              {home.shortName} vs {away.shortName}
                            </span>
                            <FranchiseLogo franchiseId={away.id} size={20} />
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handlePlayOrSimFixture(f, item.competitionId)
                          }
                          className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-black shrink-0 ${
                            isUser
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {isUser ? 'Play Live' : 'Sim'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 2. DOMESTIC LEAGUES (8) ==================== */}
        {section === 'LEAGUES' && (
          <div className="space-y-3">
            {/* 8-League Horizontal Switcher */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {DOMESTIC_LEAGUES.map(def => {
                const active = selectedLeagueId === def.id;
                return (
                  <button
                    key={def.id}
                    onClick={() => setSelectedLeagueId(def.id)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-[#101C33] border border-slate-800 text-slate-300'
                    }`}
                  >
                    {def.shortName}
                  </button>
                );
              })}
            </div>

            {/* League Header */}
            <div className="p-3.5 rounded-2xl bg-[#101C33] border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-sm font-black text-white truncate">
                  {selectedLeagueDef.name}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {selectedLeagueDef.country} · {selectedLeagueDef.formatLabel}
                </p>
              </div>
              {!selectedLeague.playoffs?.championFranchiseId && (
                <button
                  onClick={() => handleSimLeague(selectedLeagueId, false)}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0"
                >
                  Sim {selectedLeagueDef.shortName}
                </button>
              )}
            </div>

            {/* Sub-Tabs */}
            <div className="grid grid-cols-4 gap-1 bg-[#0C1527] p-1 rounded-xl border border-slate-800">
              {(
                [
                  { id: 'STANDINGS', label: 'Table' },
                  { id: 'BRACKET', label: 'Playoffs' },
                  { id: 'FIXTURES', label: 'Fixtures' },
                  { id: 'STATS', label: 'Stats' },
                ] as const
              ).map(t => (
                <button
                  key={t.id}
                  onClick={() => setLeagueSubTab(t.id)}
                  className={`min-h-[36px] rounded-lg text-xs font-bold transition-all ${
                    leagueSubTab === t.id
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* League Standings */}
            {leagueSubTab === 'STANDINGS' && (
              <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl overflow-hidden text-xs">
                <div className="bg-slate-900/90 px-3 py-2.5 border-b border-slate-800 flex items-center justify-between font-black text-slate-400 text-[10px] uppercase">
                  <span className="w-5">#</span>
                  <span className="flex-1 pl-1">Team</span>
                  <div className="flex space-x-2.5 font-mono tabular-nums">
                    <span className="w-5 text-center">P</span>
                    <span className="w-5 text-center">W</span>
                    <span className="w-5 text-center">L</span>
                    <span className="w-6 text-center text-amber-400">Pts</span>
                    <span className="w-12 text-right">NRR</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {selectedLeague.pointsTable.map((row, idx) => {
                    const tm = getGlobalTeamById(row.franchiseId);
                    const isUser = row.franchiseId === career.franchiseId;
                    const top4 = idx < 4;
                    return (
                      <button
                        key={row.franchiseId}
                        onClick={() => setInspectTeamId(row.franchiseId)}
                        className={`w-full px-3 py-2.5 flex items-center justify-between text-left ${
                          isUser ? 'bg-amber-500/10 border-l-4 border-amber-400' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span
                            className={`w-5 text-center font-mono font-bold tabular-nums ${
                              top4 ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <FranchiseLogo franchiseId={tm.id} size={22} />
                          <span className="text-xs font-bold text-white truncate">
                            {tm.shortName}
                          </span>
                        </div>
                        <div className="flex space-x-2.5 font-mono text-xs tabular-nums shrink-0">
                          <span className="w-5 text-center text-slate-400">
                            {row.played}
                          </span>
                          <span className="w-5 text-center text-emerald-400 font-bold">
                            {row.won}
                          </span>
                          <span className="w-5 text-center text-red-400">
                            {row.lost}
                          </span>
                          <span className="w-6 text-center font-black text-amber-400">
                            {row.points}
                          </span>
                          <span
                            className={`w-12 text-right font-bold ${
                              row.netRunRate >= 0
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }`}
                          >
                            {row.netRunRate >= 0
                              ? `+${row.netRunRate.toFixed(2)}`
                              : row.netRunRate.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* League Playoff Bracket */}
            {leagueSubTab === 'BRACKET' && (
              <PlayoffBracketView
                mode="PAGE_PLAYOFFS"
                fixtures={selectedLeague.fixtures.filter(
                  f => f.playoffStage !== 'NONE'
                )}
                userFranchiseId={career.franchiseId}
                championFranchiseId={selectedLeague.playoffs?.championFranchiseId}
                onPlayLive={f => onPlayLiveMatch(f, selectedLeagueId)}
                onSimulateFixture={f => handlePlayOrSimFixture(f, selectedLeagueId)}
                onSimulateRemainingPlayoffs={() =>
                  handleSimLeague(selectedLeagueId, false)
                }
              />
            )}

            {/* League Fixtures */}
            {leagueSubTab === 'FIXTURES' && (
              <div className="space-y-2">
                {selectedLeague.fixtures.map(f => {
                  const home = getGlobalTeamById(f.homeFranchiseId);
                  const away = getGlobalTeamById(f.awayFranchiseId);
                  const isUser =
                    f.homeFranchiseId === career.franchiseId ||
                    f.awayFranchiseId === career.franchiseId;
                  const ready =
                    !f.homeFranchiseId.startsWith('TBD') &&
                    !f.awayFranchiseId.startsWith('TBD');

                  return (
                    <div
                      key={f.fixtureId}
                      className="p-3 rounded-2xl bg-[#0F1A30] border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-amber-400 uppercase">
                          {f.playoffStage !== 'NONE'
                            ? f.playoffStage.replace('_', ' ')
                            : `Match ${f.matchNumber}`}
                        </span>
                        <span>{f.dateStr}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center space-x-2">
                          <FranchiseLogo franchiseId={f.homeFranchiseId} size={22} />
                          <span>{home.shortName}</span>
                          {f.homeScore && (
                            <span className="font-mono text-amber-300 tabular-nums">
                              {f.homeScore.runs}/{f.homeScore.wickets}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500">vs</span>
                        <div className="flex items-center space-x-2">
                          {f.awayScore && (
                            <span className="font-mono text-amber-300 tabular-nums">
                              {f.awayScore.runs}/{f.awayScore.wickets}
                            </span>
                          )}
                          <span>{away.shortName}</span>
                          <FranchiseLogo franchiseId={f.awayFranchiseId} size={22} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span className="truncate pr-2">
                          {f.isCompleted ? f.resultDescription : f.venue}
                        </span>
                        {!f.isCompleted && ready && (
                          <button
                            onClick={() => handlePlayOrSimFixture(f, selectedLeagueId)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black shrink-0 ${
                              isUser
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 text-slate-200'
                            }`}
                          >
                            {isUser ? 'Play Live' : 'Sim'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* League Season Stats */}
            {leagueSubTab === 'STATS' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#101C33] border border-slate-800 space-y-2">
                  <h4 className="text-xs font-black uppercase text-amber-400">
                    Top Run-Scorers (Orange Cap)
                  </h4>
                  {selectedLeagueLeaders.orangeCap.length === 0 ? (
                    <p className="text-xs text-slate-400">No matches recorded yet.</p>
                  ) : (
                    selectedLeagueLeaders.orangeCap.slice(0, 5).map((p, i) => (
                      <div
                        key={p.playerId}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0"
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="font-mono text-slate-400 w-4">{i + 1}</span>
                          <FranchiseLogo franchiseId={p.franchiseId} size={18} />
                          <span className="font-bold text-white truncate">{p.playerName}</span>
                        </div>
                        <span className="font-mono font-black text-amber-400 tabular-nums shrink-0">
                          {p.runs} runs (SR {p.strikeRate})
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-[#101C33] border border-slate-800 space-y-2">
                  <h4 className="text-xs font-black uppercase text-purple-300">
                    Top Wicket-Takers (Purple Cap)
                  </h4>
                  {selectedLeagueLeaders.purpleCap.length === 0 ? (
                    <p className="text-xs text-slate-400">No matches recorded yet.</p>
                  ) : (
                    selectedLeagueLeaders.purpleCap.slice(0, 5).map((p, i) => (
                      <div
                        key={p.playerId}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0"
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="font-mono text-slate-400 w-4">{i + 1}</span>
                          <FranchiseLogo franchiseId={p.franchiseId} size={18} />
                          <span className="font-bold text-white truncate">{p.playerName}</span>
                        </div>
                        <span className="font-mono font-black text-emerald-400 tabular-nums shrink-0">
                          {p.wickets} wkts ({p.economy} econ)
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 3. GLOBAL CHAMPIONS LEAGUE T20 ==================== */}
        {section === 'GCL' && (
          <div className="space-y-3">
            {/* GCL Hero Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#162749] via-[#0F1B35] to-[#091120] border border-amber-500/50 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                    World Franchise Championship · {ws.currentGameYear}
                  </span>
                  <h2 className="text-base font-black text-white">
                    Global Champions League T20
                  </h2>
                  <p className="text-[11px] text-slate-300">
                    16 Champions &amp; Qualifiers · Groups A–D → QF → SF → Grand Final
                  </p>
                </div>
                <button
                  onClick={() => setShowSlotEditor(v => !v)}
                  aria-label="Configure GCL Qualification Slots"
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#091120] border border-slate-700 text-xs font-bold text-amber-300 flex items-center space-x-1 shrink-0"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Slots</span>
                </button>
              </div>

              {/* Configurable Qualification Slots Panel */}
              {showSlotEditor && (
                <div className="p-3 rounded-xl bg-[#091120] border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      League Qualification Slots
                    </span>
                    <span className="font-mono text-amber-400">
                      Total:{' '}
                      {Object.values(slotDraft).reduce((a, b) => a + b, 0)} / 16
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {DOMESTIC_LEAGUES.map(def => (
                      <div
                        key={def.id}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#121E36] border border-slate-800 text-xs"
                      >
                        <span className="font-bold text-slate-200">
                          {def.shortName}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              setSlotDraft(prev => ({
                                ...prev,
                                [def.id]: Math.max(1, (prev[def.id] || 1) - 1),
                              }))
                            }
                            className="w-6 h-6 rounded bg-slate-800 text-white font-bold"
                          >
                            -
                          </button>
                          <span className="font-mono font-black text-amber-300 w-3 text-center">
                            {slotDraft[def.id]}
                          </span>
                          <button
                            onClick={() =>
                              setSlotDraft(prev => ({
                                ...prev,
                                [def.id]: Math.min(4, (prev[def.id] || 1) + 1),
                              }))
                            }
                            className="w-6 h-6 rounded bg-slate-800 text-white font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleGenerateGcl}
                    className="w-full min-h-[40px] py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase"
                  >
                    {gcl ? 'Regenerate GCL Draw with Slots' : 'Generate GCL Now'}
                  </button>
                </div>
              )}

              {!gcl ? (
                <div className="space-y-2.5 pt-1">
                  <p className="text-xs text-slate-300">
                    GCL kicks off automatically on Oct 02 once domestic leagues finish, or launch it now to auto-seed domestic winners.
                  </p>
                  <button
                    onClick={handleGenerateGcl}
                    className="w-full min-h-[44px] py-2.5 rounded-xl btn-game-gold text-xs font-black uppercase"
                  >
                    Qualify Domestic Winners &amp; Start GCL
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-emerald-400">
                    Stage: {gcl.status.replace('_', ' ')}
                  </span>
                  {gcl.status !== 'COMPLETED' && (
                    <button
                      onClick={handleSimFullSeason}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
                    >
                      Simulate Remaining GCL
                    </button>
                  )}
                </div>
              )}
            </div>

            {gcl && (
              <>
                <div className="grid grid-cols-4 gap-1 bg-[#0C1527] p-1 rounded-xl border border-slate-800">
                  {(
                    [
                      { id: 'GROUPS', label: 'Groups' },
                      { id: 'BRACKET', label: 'Knockouts' },
                      { id: 'QUALIFIERS', label: 'Teams' },
                      { id: 'STATS', label: 'Leaders' },
                    ] as const
                  ).map(t => (
                    <button
                      key={t.id}
                      onClick={() => setGclSubTab(t.id)}
                      className={`min-h-[36px] rounded-lg text-xs font-bold ${
                        gclSubTab === t.id
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* GCL Groups & Group Fixtures */}
                {gclSubTab === 'GROUPS' && (
                  <div className="space-y-3">
                    {gcl.groups.map(group => (
                      <div
                        key={group.groupName}
                        className="bg-[#0F1A30] border border-slate-800 rounded-2xl overflow-hidden text-xs"
                      >
                        <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                          <span className="font-black text-amber-400 uppercase">
                            {group.groupName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Top 2 advance to Quarter-Finals
                          </span>
                        </div>
                        <div className="divide-y divide-slate-800/60">
                          {group.standings.map((row, idx) => {
                            const tm = getGlobalTeamById(row.franchiseId);
                            const isUser = row.franchiseId === career.franchiseId;
                            return (
                              <div
                                key={row.franchiseId}
                                className={`px-3 py-2 flex items-center justify-between ${
                                  isUser ? 'bg-amber-500/10 border-l-4 border-amber-400' : ''
                                }`}
                              >
                                <div className="flex items-center space-x-2 min-w-0">
                                  <span
                                    className={`w-4 font-mono font-bold ${
                                      idx < 2 ? 'text-emerald-400' : 'text-slate-500'
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <FranchiseLogo franchiseId={tm.id} size={20} />
                                  <span className="font-bold text-white truncate">
                                    {tm.name}
                                  </span>
                                </div>
                                <div className="flex space-x-2.5 font-mono tabular-nums shrink-0">
                                  <span className="w-4 text-center text-slate-400">
                                    {row.played}
                                  </span>
                                  <span className="w-4 text-center text-emerald-400 font-bold">
                                    {row.won}
                                  </span>
                                  <span className="w-5 text-center text-amber-400 font-black">
                                    {row.points}
                                  </span>
                                  <span className="w-11 text-right text-slate-300">
                                    {row.netRunRate >= 0
                                      ? `+${row.netRunRate.toFixed(2)}`
                                      : row.netRunRate.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Pending Group Stage Fixtures */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-slate-400">
                        Group Stage Matches
                      </h4>
                      {gcl.fixtures
                        .filter(f => f.playoffStage === 'GROUP_STAGE')
                        .map(f => {
                          const home = getGlobalTeamById(f.homeFranchiseId);
                          const away = getGlobalTeamById(f.awayFranchiseId);
                          const isUser =
                            f.homeFranchiseId === career.franchiseId ||
                            f.awayFranchiseId === career.franchiseId;
                          return (
                            <div
                              key={f.fixtureId}
                              className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                                isUser
                                  ? 'bg-[#14223D] border-amber-500/50'
                                  : 'bg-[#0C1527] border-slate-800'
                              }`}
                            >
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-amber-400 block">
                                  {f.groupName} · {f.dateStr}
                                </span>
                                <span className="text-xs font-black text-white block truncate">
                                  {home.shortName} vs {away.shortName}
                                </span>
                                {f.isCompleted && (
                                  <span className="text-[10px] text-emerald-400 block truncate">
                                    {f.resultDescription}
                                  </span>
                                )}
                              </div>
                              {!f.isCompleted ? (
                                <button
                                  onClick={() =>
                                    handlePlayOrSimFixture(f, 'GCL_T20')
                                  }
                                  className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 flex items-center space-x-1 ${
                                    isUser
                                      ? 'bg-amber-500 text-slate-950'
                                      : 'bg-slate-800 text-slate-200'
                                  }`}
                                >
                                  <PlayCircle className="w-3.5 h-3.5" />
                                  <span>{isUser ? 'Play Live' : 'Sim'}</span>
                                </button>
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* GCL Knockouts (QF -> SF -> Grand Final) */}
                {gclSubTab === 'BRACKET' && (
                  <PlayoffBracketView
                    mode="GCL_KNOCKOUT"
                    fixtures={gcl.fixtures.filter(
                      f => f.playoffStage !== 'GROUP_STAGE'
                    )}
                    userFranchiseId={career.franchiseId}
                    championFranchiseId={gcl.championFranchiseId}
                    onPlayLive={f => onPlayLiveMatch(f, 'GCL_T20')}
                    onSimulateFixture={f => handlePlayOrSimFixture(f, 'GCL_T20')}
                    onSimulateRemainingPlayoffs={handleSimFullSeason}
                  />
                )}

                {/* GCL Qualified Participants */}
                {gclSubTab === 'QUALIFIERS' && (
                  <div className="space-y-2">
                    {gcl.qualifiedParticipants.map(p => {
                      const tm = getGlobalTeamById(p.teamId);
                      const isUser = p.teamId === career.franchiseId;
                      return (
                        <button
                          key={p.teamId}
                          onClick={() => setInspectTeamId(p.teamId)}
                          className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left ${
                            isUser
                              ? 'bg-amber-500/10 border-amber-500/50'
                              : 'bg-[#0F1A30] border-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <span className="text-xs font-mono font-black text-amber-400 w-5">
                              #{p.seedRank}
                            </span>
                            <FranchiseLogo franchiseId={tm.id} size={28} />
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-white truncate">
                                {tm.name}
                              </h4>
                              <p className="text-[10px] text-slate-400">
                                {p.qualificationReason} · {tm.country}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-300 shrink-0">
                            OVR {tm.rating}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* GCL Stats Leaders */}
                {gclSubTab === 'STATS' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#101C33] border border-slate-800 space-y-2">
                      <h4 className="text-xs font-black uppercase text-amber-400">
                        GCL Golden Bat Leaders
                      </h4>
                      {gclLeaders.runs.length === 0 ? (
                        <p className="text-xs text-slate-400">No GCL matches played yet.</p>
                      ) : (
                        gclLeaders.runs.map((p, idx) => (
                          <div
                            key={p.playerId}
                            className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0"
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="font-mono text-slate-400 w-4">{idx + 1}</span>
                              <FranchiseLogo franchiseId={p.franchiseId} size={18} />
                              <span className="font-bold text-white truncate">{p.playerName}</span>
                            </div>
                            <span className="font-mono font-black text-amber-400 tabular-nums shrink-0">
                              {p.runs} runs
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#101C33] border border-slate-800 space-y-2">
                      <h4 className="text-xs font-black uppercase text-cyan-300">
                        GCL Golden Ball Leaders
                      </h4>
                      {gclLeaders.wickets.length === 0 ? (
                        <p className="text-xs text-slate-400">No GCL matches played yet.</p>
                      ) : (
                        gclLeaders.wickets.map((p, idx) => (
                          <div
                            key={p.playerId}
                            className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0"
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="font-mono text-slate-400 w-4">{idx + 1}</span>
                              <FranchiseLogo franchiseId={p.franchiseId} size={18} />
                              <span className="font-bold text-white truncate">{p.playerName}</span>
                            </div>
                            <span className="font-mono font-black text-emerald-400 tabular-nums shrink-0">
                              {p.wickets} wkts
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ==================== 4. PERMANENT TROPHY ROOM ==================== */}
        {section === 'TROPHIES' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#172545] to-[#0C1425] border border-amber-500/40 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-amber-300">
                  Permanent Career Trophy Room
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Trophies persist across every season and calendar year
                </p>
              </div>
              <span className="text-xl font-black font-mono text-white tabular-nums">
                {permanentTrophies.length}
              </span>
            </div>

            {permanentTrophies.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#101C33] border border-slate-800 flex flex-col items-center text-center space-y-2">
                <TrophyArtwork3D variant="IPL_CUP" size={88} locked />
                <h3 className="text-sm font-black text-slate-200">
                  No Silverware Lifted Yet
                </h3>
                <p className="text-xs text-slate-400">
                  Win a Domestic League Final or the Global Champions League T20 Grand Final to unlock permanent 3D silverware here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {permanentTrophies.map(trophy => (
                  <div
                    key={trophy.id}
                    className="p-3 rounded-2xl bg-[#101C33] border border-amber-500/45 flex flex-col items-center text-center space-y-1.5 shadow-lg"
                  >
                    <TrophyArtwork3D
                      variant={
                        trophy.competitionId === 'GCL_T20'
                          ? 'GCL_CUP'
                          : trophy.competitionId === 'IPL'
                          ? 'IPL_CUP'
                          : 'DOMESTIC_CUP'
                      }
                      size={82}
                      yearLabel={trophy.seasonYear}
                    />
                    <h4 className="text-xs font-black text-amber-300 leading-tight">
                      {trophy.trophyName}
                    </h4>
                    <p className="text-[10px] text-slate-300 font-semibold">
                      {trophy.winningTeamName}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">
                      Season {trophy.seasonNumber} · {trophy.seasonYear}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Locked Career Milestones Preview */}
            <div className="p-3.5 rounded-2xl bg-[#0C1527] border border-slate-800 space-y-2">
              <h3 className="text-xs font-black uppercase text-slate-300">
                Prestige Trophy Goals
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  {
                    label: 'IPL Title',
                    unlocked: permanentTrophies.some(t => t.competitionId === 'IPL'),
                  },
                  {
                    label: 'World GCL Crown',
                    unlocked: permanentTrophies.some(
                      t => t.competitionId === 'GCL_T20'
                    ),
                  },
                ].map(goal => (
                  <div
                    key={goal.label}
                    className="p-2.5 rounded-xl bg-[#091120] border border-slate-800 flex items-center justify-between"
                  >
                    <span className="font-bold text-slate-200">{goal.label}</span>
                    {goal.unlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 5. MATCH HISTORY ==================== */}
        {section === 'HISTORY' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Match History Archive ({matchHistory.length})
              </h2>
              <div className="flex space-x-1 bg-[#101C33] p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setHistoryFilter('USER')}
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    historyFilter === 'USER'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-400'
                  }`}
                >
                  My Team
                </button>
                <button
                  onClick={() => setHistoryFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    historyFilter === 'ALL'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-400'
                  }`}
                >
                  All Major
                </button>
              </div>
            </div>

            {matchHistory.filter(h => historyFilter === 'ALL' || h.isUserMatch)
              .length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#101C33] border border-slate-800 text-center text-xs text-slate-400">
                Play or simulate matches to build your permanent franchise match history archive.
              </div>
            ) : (
              <div className="space-y-2">
                {matchHistory
                  .filter(h => historyFilter === 'ALL' || h.isUserMatch)
                  .slice(0, 60)
                  .map(entry => {
                    const home = getGlobalTeamById(entry.homeTeamId);
                    const away = getGlobalTeamById(entry.awayTeamId);
                    const userWon =
                      entry.isUserMatch &&
                      entry.winnerTeamId === career.franchiseId;

                    return (
                      <div
                        key={entry.id}
                        className="p-3 rounded-2xl bg-[#0F1A30] border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-amber-400">
                            {entry.competitionName} · {entry.stageLabel}
                          </span>
                          <span className="text-slate-400">
                            S{entry.seasonNumber} ({entry.seasonYear}) · {entry.dateStr}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <FranchiseLogo franchiseId={home.id} size={20} />
                            <span className="font-black text-white">
                              {home.shortName}
                            </span>
                            <span className="font-mono text-slate-300 tabular-nums">
                              {entry.homeScoreText}
                            </span>
                          </div>
                          <span className="text-slate-500 text-[10px]">vs</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-slate-300 tabular-nums">
                              {entry.awayScoreText}
                            </span>
                            <span className="font-black text-white">
                              {away.shortName}
                            </span>
                            <FranchiseLogo franchiseId={away.id} size={20} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                          <span
                            className={`font-semibold truncate ${
                              userWon ? 'text-emerald-400' : 'text-slate-300'
                            }`}
                          >
                            {entry.resultDescription}
                          </span>
                          <span className="text-[10px] text-amber-300 shrink-0 ml-2">
                            POTM: {entry.playerOfTheMatchName}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ==================== 6. GLOBAL TEAM DATABASE ==================== */}
        {section === 'TEAMS' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setTeamLeagueFilter('ALL')}
                className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap ${
                  teamLeagueFilter === 'ALL'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-[#101C33] border border-slate-800 text-slate-300'
                }`}
              >
                All ({GLOBAL_TEAMS.length})
              </button>
              {DOMESTIC_LEAGUES.map(def => (
                <button
                  key={def.id}
                  onClick={() => setTeamLeagueFilter(def.id)}
                  className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap ${
                    teamLeagueFilter === def.id
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-[#101C33] border border-slate-800 text-slate-300'
                  }`}
                >
                  {def.shortName}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredTeams.map(team => (
                <button
                  key={team.id}
                  onClick={() => setInspectTeamId(team.id)}
                  className="w-full p-3 rounded-2xl bg-[#101C33] border border-slate-800 hover:border-amber-500/40 flex items-center justify-between text-left"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <FranchiseLogo franchiseId={team.id} size={34} />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white truncate">
                        {team.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {getLeagueDefinition(team.leagueId).shortName} ·{' '}
                        {team.country} · {team.homeStadium}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs font-mono font-black text-amber-400 block tabular-nums">
                      OVR {team.rating}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {team.tournamentHistory.titles} Titles
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Team Squad & History Modal */}
      {inspectTeamObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121E36] border border-slate-700 rounded-2xl max-w-sm w-full p-4 space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5 shrink-0">
              <div className="flex items-center space-x-2.5 min-w-0">
                <FranchiseLogo franchiseId={inspectTeamObj.id} size={38} />
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-white truncate">
                    {inspectTeamObj.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {inspectTeamObj.country} · {inspectTeamObj.homeStadium}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectTeamId(null)}
                className="w-8 h-8 rounded-lg bg-[#0C1527] text-slate-300 font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-[#091120] border border-slate-800 text-xs space-y-1 shrink-0">
              <div className="flex justify-between">
                <span className="text-slate-400">League</span>
                <span className="font-bold text-amber-300">
                  {getLeagueDefinition(inspectTeamObj.leagueId).name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">History</span>
                <span className="font-bold text-white">
                  {inspectTeamObj.previousTrophies[0] ||
                    inspectTeamObj.tournamentHistory.bestFinish}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Captain</span>
                <span className="font-bold text-emerald-300">
                  {inspectTeamObj.captainName}
                </span>
              </div>
            </div>

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block">
                Squad XI ({inspectTeamSquad.length})
              </span>
              {inspectTeamSquad.map(p => (
                <div
                  key={p.id}
                  className="p-2 rounded-xl bg-[#091120] border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <PlayerAvatar
                      player={p}
                      size={28}
                      jerseyColor={inspectTeamObj.primaryColor}
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {p.primaryRole}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-black text-amber-400 shrink-0 tabular-nums">
                    {p.overallRating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
