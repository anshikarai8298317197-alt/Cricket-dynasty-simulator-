/**
 * WICKET DYNASTY - Interactive Playoff & Global Champions League Knockout Bracket
 * Renders 4-Match Page Playoffs (Q1, Eliminator, Q2, Final) and 8-Team GCL Knockouts (QF -> SF -> Final).
 */
import React from 'react';
import { PlayCircle, FastForward, Trophy, CheckCircle2 } from 'lucide-react';
import { Fixture, PlayoffStage } from '../types/tournament';
import { getGlobalTeamById } from '../data/globalLeagues';
import { FranchiseLogo } from './FranchiseLogo';

interface PlayoffBracketViewProps {
  mode: 'PAGE_PLAYOFFS' | 'GCL_KNOCKOUT';
  fixtures: Fixture[];
  userFranchiseId: string;
  championFranchiseId?: string;
  onPlayLive?: (fixture: Fixture) => void;
  onSimulateFixture?: (fixture: Fixture) => void;
  onSimulateRemainingPlayoffs?: () => void;
}

const STAGE_TITLES: Record<PlayoffStage, string> = {
  NONE: 'Match',
  GROUP_STAGE: 'Group Stage',
  QUALIFIER_1: 'Qualifier 1 (1 vs 2)',
  ELIMINATOR: 'Eliminator (3 vs 4)',
  QUALIFIER_2: 'Qualifier 2 (L Q1 vs W Elim)',
  QUARTER_FINAL: 'Quarter-Final',
  SEMI_FINAL: 'Semi-Final',
  FINAL: 'Grand Final',
};

export const PlayoffBracketView: React.FC<PlayoffBracketViewProps> = ({
  mode,
  fixtures,
  userFranchiseId,
  championFranchiseId,
  onPlayLive,
  onSimulateFixture,
  onSimulateRemainingPlayoffs,
}) => {
  const renderMatchCard = (fixture: Fixture | undefined, fallbackLabel: string) => {
    if (!fixture) {
      return (
        <div className="p-3 rounded-2xl bg-[#091120] border border-slate-800/80 text-xs text-slate-500">
          {fallbackLabel} — Awaiting Schedule
        </div>
      );
    }

    const homeTbd = fixture.homeFranchiseId.startsWith('TBD');
    const awayTbd = fixture.awayFranchiseId.startsWith('TBD');
    const isReady = !homeTbd && !awayTbd;
    const isUserMatch =
      fixture.homeFranchiseId === userFranchiseId ||
      fixture.awayFranchiseId === userFranchiseId;
    const homeTeam = getGlobalTeamById(fixture.homeFranchiseId);
    const awayTeam = getGlobalTeamById(fixture.awayFranchiseId);
    const isFinal = fixture.playoffStage === 'FINAL';

    return (
      <div
        key={fixture.fixtureId}
        className={`rounded-2xl p-3.5 space-y-2.5 transition-all ${
          isFinal
            ? 'card-3d-gold'
            : isUserMatch
            ? 'card-3d-elevated border-amber-400/50'
            : 'card-3d-elevated'
        }`}
      >
        <div className="flex items-center justify-between text-[10px]">
          <span className={`font-black uppercase tracking-wider ${isFinal ? 'text-amber-300' : 'text-amber-400'}`}>
            {STAGE_TITLES[fixture.playoffStage] || fallbackLabel}
          </span>
          <span className="text-slate-400 font-mono tabular-nums">{fixture.dateStr}</span>
        </div>

        {/* Team 1 */}
        <div
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border ${
            fixture.winnerFranchiseId === fixture.homeFranchiseId
              ? 'bg-emerald-500/10 border-emerald-500/40'
              : 'bg-[#091120] border-slate-800/80'
          }`}
        >
          <div className="flex items-center space-x-2 min-w-0">
            <FranchiseLogo franchiseId={fixture.homeFranchiseId} size={22} />
            <span className="text-xs font-bold text-white truncate">
              {homeTbd ? fixture.homeFranchiseId.replace('TBD_', 'Seed ') : homeTeam.name}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-200 shrink-0 tabular-nums">
            {fixture.homeScore
              ? `${fixture.homeScore.runs}/${fixture.homeScore.wickets} (${fixture.homeScore.oversDisplay})`
              : '-'}
          </span>
        </div>

        {/* Team 2 */}
        <div
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border ${
            fixture.winnerFranchiseId === fixture.awayFranchiseId
              ? 'bg-emerald-500/10 border-emerald-500/40'
              : 'bg-[#091120] border-slate-800/80'
          }`}
        >
          <div className="flex items-center space-x-2 min-w-0">
            <FranchiseLogo franchiseId={fixture.awayFranchiseId} size={22} />
            <span className="text-xs font-bold text-white truncate">
              {awayTbd ? fixture.awayFranchiseId.replace('TBD_', 'Seed ') : awayTeam.name}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-200 shrink-0 tabular-nums">
            {fixture.awayScore
              ? `${fixture.awayScore.runs}/${fixture.awayScore.wickets} (${fixture.awayScore.oversDisplay})`
              : '-'}
          </span>
        </div>

        {/* Status / Actions */}
        <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px]">
          <span className="text-slate-400 truncate">
            {fixture.isCompleted
              ? fixture.resultDescription
              : isReady
              ? fixture.venue
              : 'Awaiting previous stage result'}
          </span>

          {fixture.isCompleted ? (
            <span className="shrink-0 inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Done</span>
            </span>
          ) : isReady ? (
            <div className="flex items-center space-x-1.5 shrink-0">
              {isUserMatch && onPlayLive && (
                <button
                  onClick={() => onPlayLive(fixture)}
                  className="px-3 py-1.5 min-h-[34px] rounded-xl btn-game-gold text-[11px] flex items-center space-x-1 cursor-pointer"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Play Live</span>
                </button>
              )}
              {onSimulateFixture && (
                <button
                  onClick={() => onSimulateFixture(fixture)}
                  className="px-2.5 py-1.5 min-h-[34px] rounded-xl btn-game-dark font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                >
                  <FastForward className="w-3 h-3 text-amber-400" />
                  <span>Sim</span>
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const hasPendingPlayoffMatches = fixtures.some(
    f => f.playoffStage !== 'NONE' && f.playoffStage !== 'GROUP_STAGE' && !f.isCompleted
  );

  const championTeam = championFranchiseId ? getGlobalTeamById(championFranchiseId) : null;

  return (
    <div className="space-y-3">
      {/* Champion Banner */}
      {championTeam && (
        <div className="p-4 rounded-2xl card-3d-gold flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FranchiseLogo franchiseId={championTeam.id} size={40} />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                Tournament Champion
              </span>
              <h4 className="text-sm font-black text-white">{championTeam.name}</h4>
            </div>
          </div>
          <Trophy className="w-7 h-7 text-amber-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)] shrink-0" />
        </div>
      )}

      {/* Sim Remaining Playoffs CTA */}
      {hasPendingPlayoffMatches && onSimulateRemainingPlayoffs && (
        <div className="flex justify-end">
          <button
            onClick={onSimulateRemainingPlayoffs}
            className="min-h-[40px] px-4 py-2 rounded-xl btn-game-dark text-amber-300 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Knockout Bracket</span>
          </button>
        </div>
      )}

      {mode === 'PAGE_PLAYOFFS' ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Round 1 · Top 4 Qualifiers
            </h4>
            {renderMatchCard(fixtures.find(f => f.playoffStage === 'QUALIFIER_1'), 'Qualifier 1')}
            {renderMatchCard(fixtures.find(f => f.playoffStage === 'ELIMINATOR'), 'Eliminator')}
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Round 2 · Second Chance
            </h4>
            {renderMatchCard(fixtures.find(f => f.playoffStage === 'QUALIFIER_2'), 'Qualifier 2')}
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-400">
              Championship Decider
            </h4>
            {renderMatchCard(fixtures.find(f => f.playoffStage === 'FINAL'), 'Grand Final')}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Quarter-Finals (Top 2 from Groups A–D)
            </h4>
            {fixtures
              .filter(f => f.playoffStage === 'QUARTER_FINAL')
              .map((qf, idx) => renderMatchCard(qf, `Quarter-Final ${idx + 1}`))}
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Semi-Finals
            </h4>
            {fixtures
              .filter(f => f.playoffStage === 'SEMI_FINAL')
              .map((sf, idx) => renderMatchCard(sf, `Semi-Final ${idx + 1}`))}
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-400">
              Global Champions League Grand Final
            </h4>
            {renderMatchCard(fixtures.find(f => f.playoffStage === 'FINAL'), 'Grand Final')}
          </div>
        </div>
      )}
    </div>
  );
};
