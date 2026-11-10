/**
 * WICKET DYNASTY - Authoritative Deterministic Cricket Match Engine (Phase 04)
 * Deterministic PRNG, Batter AI vs Bowler AI, Field Physics, T20 Rules, Super Over
 */
import { Player } from '../types/player';
import {
  BallEvent,
  BatterInningsRecord,
  BowlerInningsRecord,
  FallOfWicket,
  InningsScorecard,
  MatchResultDetails,
  OverSummary,
} from '../types/match';
import { BattingTacticsConfig, BowlingTacticsConfig, FieldingTacticsConfig } from '../types/tactics';

// Seeded PRNG for 100% deterministic, reproducible match simulations
export class SeededPRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0;
  }

  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  chance(percentage: number): boolean {
    return this.next() * 100 < percentage;
  }
}

export interface MatchSimulationConfig {
  matchId: string;
  fixtureId: string;
  homeFranchiseId: string;
  awayFranchiseId: string;
  homePlayingXi: Player[];
  awayPlayingXi: Player[];
  homeTactics?: {
    batting?: BattingTacticsConfig;
    bowling?: BowlingTacticsConfig;
    fielding?: FieldingTacticsConfig;
  };
  awayTactics?: {
    batting?: BattingTacticsConfig;
    bowling?: BowlingTacticsConfig;
    fielding?: FieldingTacticsConfig;
  };
  conditions?: {
    pitchCondition?: string; // 'Batting Friendly' | 'Bowling Greentop' | 'Spin Dustbowl' | 'Balanced Surface'
    weatherCondition?: string;
    venue?: string;
  };
  seed?: number;
}

export class CricketMatchEngine {
  /**
   * Run complete authoritative match simulation
   */
  static simulateMatch(config: MatchSimulationConfig): MatchResultDetails {
    const seed = config.seed !== undefined ? config.seed : Math.floor(Math.random() * 1000000);
    const rng = new SeededPRNG(seed);

    // 1. Toss
    const tossWinnerId = rng.chance(50) ? config.homeFranchiseId : config.awayFranchiseId;
    const pitch = config.conditions?.pitchCondition || 'Balanced Surface';
    
    // Toss choice AI: Greentop bowls first, Batting friendly bats first
    let tossDecision: 'Bat First' | 'Bowl First' = 'Bat First';
    if (pitch === 'Bowling Greentop' || pitch === 'Humid & Dew') {
      tossDecision = 'Bowl First';
    } else {
      tossDecision = rng.chance(60) ? 'Bat First' : 'Bowl First';
    }

    const teamBattingFirstId =
      tossDecision === 'Bat First'
        ? tossWinnerId
        : tossWinnerId === config.homeFranchiseId
        ? config.awayFranchiseId
        : config.homeFranchiseId;

    const teamBowlingFirstId =
      teamBattingFirstId === config.homeFranchiseId ? config.awayFranchiseId : config.homeFranchiseId;

    const battingFirstXi =
      teamBattingFirstId === config.homeFranchiseId ? config.homePlayingXi : config.awayPlayingXi;
    const bowlingFirstXi =
      teamBowlingFirstId === config.homeFranchiseId ? config.homePlayingXi : config.awayPlayingXi;

    const battingFirstTactics =
      teamBattingFirstId === config.homeFranchiseId ? config.homeTactics : config.awayTactics;
    const bowlingFirstTactics =
      teamBowlingFirstId === config.homeFranchiseId ? config.homeTactics : config.awayTactics;

    // 2. Simulate Innings 1 (20 overs max)
    const innings1 = this.simulateInnings({
      inningsNumber: 1,
      battingFranchiseId: teamBattingFirstId,
      bowlingFranchiseId: teamBowlingFirstId,
      battingXi: battingFirstXi,
      bowlingXi: bowlingFirstXi,
      battingTactics: battingFirstTactics?.batting,
      bowlingTactics: bowlingFirstTactics?.bowling,
      fieldingTactics: bowlingFirstTactics?.fielding,
      pitchCondition: pitch,
      rng,
    });

    // Target for Innings 2 is Runs + 1
    const target = innings1.totalRuns + 1;

    // 3. Simulate Innings 2 (chasing target)
    const innings2 = this.simulateInnings({
      inningsNumber: 2,
      battingFranchiseId: teamBowlingFirstId,
      bowlingFranchiseId: teamBattingFirstId,
      battingXi: bowlingFirstXi,
      bowlingXi: battingFirstXi,
      battingTactics: bowlingFirstTactics?.batting,
      bowlingTactics: battingFirstTactics?.bowling,
      fieldingTactics: battingFirstTactics?.fielding,
      pitchCondition: pitch,
      target,
      rng,
    });

    // 4. Determine Match Result & Tie Breaker (Super Over)
    let winnerFranchiseId = '';
    let loserFranchiseId = '';
    let isTie = false;
    let isSuperOver = false;
    let marginDescription = '';
    let superOver1: InningsScorecard | undefined = undefined;
    let superOver2: InningsScorecard | undefined = undefined;

    if (innings2.totalRuns >= target) {
      // Chasing team won
      winnerFranchiseId = teamBowlingFirstId;
      loserFranchiseId = teamBattingFirstId;
      const wicketsRemaining = 10 - innings2.totalWickets;
      const ballsRemaining = 120 - innings2.legalBallsFaced;
      marginDescription = `${winnerFranchiseId} won by ${wicketsRemaining} wicket${
        wicketsRemaining > 1 ? 's' : ''
      } (${ballsRemaining} balls left)`;
    } else if (innings2.totalRuns < innings1.totalRuns) {
      // Defending team won
      winnerFranchiseId = teamBattingFirstId;
      loserFranchiseId = teamBowlingFirstId;
      const runMargin = innings1.totalRuns - innings2.totalRuns;
      marginDescription = `${winnerFranchiseId} won by ${runMargin} run${runMargin > 1 ? 's' : ''}`;
    } else {
      // TIE! Scores are level (e.g. 172 vs 172) -> Simulate Super Over
      isTie = true;
      isSuperOver = true;

      // Super Over 1 (Team 2 bats first in Super Over as per ICC/IPL playing conditions)
      superOver1 = this.simulateSuperOver({
        battingFranchiseId: teamBowlingFirstId,
        bowlingFranchiseId: teamBattingFirstId,
        battingXi: bowlingFirstXi,
        bowlingXi: battingFirstXi,
        pitchCondition: pitch,
        rng,
      });

      // Super Over 2
      superOver2 = this.simulateSuperOver({
        battingFranchiseId: teamBattingFirstId,
        bowlingFranchiseId: teamBowlingFirstId,
        battingXi: battingFirstXi,
        bowlingXi: bowlingFirstXi,
        pitchCondition: pitch,
        target: superOver1.totalRuns + 1,
        rng,
      });

      if (superOver2.totalRuns > superOver1.totalRuns) {
        winnerFranchiseId = teamBattingFirstId;
        loserFranchiseId = teamBowlingFirstId;
        marginDescription = `${winnerFranchiseId} won via Super Over`;
      } else {
        winnerFranchiseId = teamBowlingFirstId;
        loserFranchiseId = teamBattingFirstId;
        const margin = Math.max(1, superOver1.totalRuns - superOver2.totalRuns);
        marginDescription = `${winnerFranchiseId} won via Super Over by ${margin} run${margin > 1 ? 's' : ''}`;
      }
    }

    // 5. Evaluate Player of the Match
    const potm = this.calculatePlayerOfTheMatch(
      innings1,
      innings2,
      [...config.homePlayingXi, ...config.awayPlayingXi],
      winnerFranchiseId
    );

    return {
      matchId: config.matchId,
      fixtureId: config.fixtureId,
      homeFranchiseId: config.homeFranchiseId,
      awayFranchiseId: config.awayFranchiseId,
      winnerFranchiseId,
      loserFranchiseId,
      isTie,
      isSuperOver,
      marginDescription,
      playerOfTheMatch: potm,
      innings1,
      innings2,
      superOverInnings1: superOver1,
      superOverInnings2: superOver2,
      conditions: {
        pitchCondition: pitch,
        weatherCondition: config.conditions?.weatherCondition || 'Clear 28°C',
        venue: config.conditions?.venue || 'Chidambaram Stadium',
        tossWinnerId,
        tossDecision,
      },
      randomSeed: seed,
      completedAt: Date.now(),
    };
  }

  /**
   * Simulate a 20-over Innings
   */
  private static simulateInnings(params: {
    inningsNumber: 1 | 2;
    battingFranchiseId: string;
    bowlingFranchiseId: string;
    battingXi: Player[];
    bowlingXi: Player[];
    battingTactics?: BattingTacticsConfig;
    bowlingTactics?: BowlingTacticsConfig;
    fieldingTactics?: FieldingTacticsConfig;
    pitchCondition: string;
    target?: number;
    rng: SeededPRNG;
  }): InningsScorecard {
    const {
      inningsNumber,
      battingFranchiseId,
      bowlingFranchiseId,
      battingXi,
      bowlingXi,
      pitchCondition,
      target,
      rng,
    } = params;

    // Ordered batters based on tactics or default XI order
    const orderedBatterIds =
      params.battingTactics?.battingOrderIds && params.battingTactics.battingOrderIds.length === 11
        ? params.battingTactics.battingOrderIds
        : battingXi.map(p => p.id);

    const orderedBatters = orderedBatterIds
      .map(id => battingXi.find(p => p.id === id))
      .filter((p): p is Player => p !== undefined);

    // Initialize Batters scorecard records
    const batters: BatterInningsRecord[] = orderedBatters.map((p, idx) => ({
      playerId: p.id,
      playerName: p.name,
      battingPosition: idx + 1,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
    }));

    // Identify bowling pool
    const bowlingPool = bowlingXi.filter(
      p =>
        p.primaryRole.includes('Bowler') ||
        p.primaryRole.includes('All-rounder') ||
        (p.secondaryRole && (p.secondaryRole.includes('Bowler') || p.secondaryRole.includes('All-rounder')))
    );
    const eligibleBowlers = bowlingPool.length >= 5 ? bowlingPool : bowlingXi.slice(4, 11);

    // Initialize Bowlers scorecard records
    const bowlersMap: Record<string, BowlerInningsRecord> = {};
    bowlingXi.forEach(p => {
      bowlersMap[p.id] = {
        playerId: p.id,
        playerName: p.name,
        bowlingRole: p.primaryRole,
        overs: 0,
        ballsRemainder: 0,
        oversDisplay: '0.0',
        legalBallsBowled: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        economy: 0,
        dots: 0,
        wides: 0,
        noBalls: 0,
      };
    });

    const fallOfWickets: FallOfWicket[] = [];
    const overSummaries: OverSummary[] = [];
    const allBalls: BallEvent[] = [];
    const extras = { total: 0, wides: 0, noBalls: 0, byes: 0, legByes: 0 };

    let totalRuns = 0;
    let totalWickets = 0;
    let legalBallsFaced = 0;

    let strikerIdx = 0; // Index in orderedBatters
    let nonStrikerIdx = 1;
    let nextBatterIdx = 2;

    let previousBowlerId: string | null = null;

    // Maximum 20 overs = 20 loops
    for (let overNum = 0; overNum < 20; overNum++) {
      if (totalWickets >= 10) break;
      if (target && totalRuns >= target) break;

      // Select bowler for this over (Respecting max 4 overs per bowler rule!)
      const currentBowler = this.selectBowlerForOver({
        overNum,
        bowlers: eligibleBowlers,
        bowlersMap,
        previousBowlerId,
        tactics: params.bowlingTactics,
        rng,
      });

      previousBowlerId = currentBowler.id;
      const bowlerRecord = bowlersMap[currentBowler.id];

      const overBalls: BallEvent[] = [];
      let runsInOver = 0;
      let wicketsInOver = 0;
      let legalBallsInOver = 0;

      // Over continues until exactly 6 LEGAL deliveries are completed
      while (legalBallsInOver < 6) {
        if (totalWickets >= 10 || (target && totalRuns >= target)) break;

        const striker = orderedBatters[strikerIdx];
        const nonStriker = orderedBatters[nonStrikerIdx];
        const strikerRecord = batters[strikerIdx];

        // 1. Roll Extras (Wide, No-ball)
        const isWide = rng.chance(2.5);
        const isNoBall = !isWide && rng.chance(0.8);

        if (isWide) {
          extras.wides += 1;
          extras.total += 1;
          totalRuns += 1;
          runsInOver += 1;
          bowlerRecord.runsConceded += 1;
          bowlerRecord.wides += 1;

          const oversDisplay = `${overNum}.${legalBallsInOver}`;
          const ballEvent: BallEvent = {
            overNumber: overNum,
            ballInOver: legalBallsInOver + 1,
            ballDisplay: `${oversDisplay} (wd)`,
            isLegalBall: false,
            bowlerId: currentBowler.id,
            bowlerName: currentBowler.name,
            bowlerStyle: currentBowler.primaryRole.includes('Fast') ? 'RFM' : currentBowler.primaryRole.includes('Spin') ? 'SLA' : 'RMF',
            bowlerStamina: Math.max(70, 98 - bowlerRecord.overs * 7),
            bowlerOversDisplay: `${Math.floor(bowlerRecord.legalBallsBowled / 6)}.${bowlerRecord.legalBallsBowled % 6}`,
            bowlerMaidens: bowlerRecord.maidens,
            bowlerRunsConceded: bowlerRecord.runsConceded,
            bowlerWickets: bowlerRecord.wickets,
            bowlerEconomy: Number((bowlerRecord.runsConceded / Math.max(0.166, bowlerRecord.legalBallsBowled / 6)).toFixed(1)),
            strikerId: striker.id,
            strikerName: striker.name,
            strikerNumber: strikerIdx + 1,
            strikerHand: striker.battingHand,
            strikerRuns: strikerRecord.runs,
            strikerBalls: strikerRecord.balls,
            strikerFours: strikerRecord.fours,
            strikerSixes: strikerRecord.sixes,
            nonStrikerId: nonStriker.id,
            nonStrikerName: nonStriker.name,
            nonStrikerNumber: nonStrikerIdx + 1,
            nonStrikerHand: nonStriker.battingHand,
            nonStrikerRuns: batters[nonStrikerIdx]?.runs || 0,
            nonStrikerBalls: batters[nonStrikerIdx]?.balls || 0,
            nonStrikerFours: batters[nonStrikerIdx]?.fours || 0,
            nonStrikerSixes: batters[nonStrikerIdx]?.sixes || 0,
            runsBat: 0,
            extrasType: 'WIDE',
            extrasRuns: 1,
            totalRuns: 1,
            isWicket: false,
            commentary: `${currentBowler.name} pushes it too wide outside off stump. Umpire signals Wide.`,
            teamRuns: totalRuns,
            teamWickets: totalWickets,
            trajectory: {
              shotType: 'Wide Delivery',
              angleDeg: -30,
              distancePct: 15,
              isLofted: false,
              targetX: 58,
              targetY: 72,
            },
            fieldingAction: {
              fielderName: 'Wicketkeeper',
              positionLabel: 'Keeper',
              startX: 50,
              startY: 80,
              interceptX: 56,
              interceptY: 78,
              outcome: 'GROUND_PICKUP',
            },
          };
          overBalls.push(ballEvent);
          allBalls.push(ballEvent);
          continue;
        }

        if (isNoBall) {
          extras.noBalls += 1;
          extras.total += 1;
          totalRuns += 1;
          runsInOver += 1;
          bowlerRecord.runsConceded += 1;
          bowlerRecord.noBalls += 1;

          const oversDisplay = `${overNum}.${legalBallsInOver}`;
          const ballEvent: BallEvent = {
            overNumber: overNum,
            ballInOver: legalBallsInOver + 1,
            ballDisplay: `${oversDisplay} (nb)`,
            isLegalBall: false,
            bowlerId: currentBowler.id,
            bowlerName: currentBowler.name,
            bowlerStyle: currentBowler.primaryRole.includes('Fast') ? 'RFM' : currentBowler.primaryRole.includes('Spin') ? 'SLA' : 'RMF',
            bowlerStamina: Math.max(70, 98 - bowlerRecord.overs * 7),
            bowlerOversDisplay: `${Math.floor(bowlerRecord.legalBallsBowled / 6)}.${bowlerRecord.legalBallsBowled % 6}`,
            bowlerMaidens: bowlerRecord.maidens,
            bowlerRunsConceded: bowlerRecord.runsConceded,
            bowlerWickets: bowlerRecord.wickets,
            bowlerEconomy: Number((bowlerRecord.runsConceded / Math.max(0.166, bowlerRecord.legalBallsBowled / 6)).toFixed(1)),
            strikerId: striker.id,
            strikerName: striker.name,
            strikerNumber: strikerIdx + 1,
            strikerHand: striker.battingHand,
            strikerRuns: strikerRecord.runs,
            strikerBalls: strikerRecord.balls,
            strikerFours: strikerRecord.fours,
            strikerSixes: strikerRecord.sixes,
            nonStrikerId: nonStriker.id,
            nonStrikerName: nonStriker.name,
            nonStrikerNumber: nonStrikerIdx + 1,
            nonStrikerHand: nonStriker.battingHand,
            nonStrikerRuns: batters[nonStrikerIdx]?.runs || 0,
            nonStrikerBalls: batters[nonStrikerIdx]?.balls || 0,
            nonStrikerFours: batters[nonStrikerIdx]?.fours || 0,
            nonStrikerSixes: batters[nonStrikerIdx]?.sixes || 0,
            runsBat: 0,
            extrasType: 'NO_BALL',
            extrasRuns: 1,
            totalRuns: 1,
            isWicket: false,
            commentary: `Overstepped! Front-foot No Ball from ${currentBowler.name}. Free Hit upcoming!`,
            teamRuns: totalRuns,
            teamWickets: totalWickets,
            trajectory: {
              shotType: 'No Ball',
              angleDeg: 0,
              distancePct: 10,
              isLofted: false,
              targetX: 50,
              targetY: 70,
            },
            fieldingAction: {
              fielderName: 'Wicketkeeper',
              positionLabel: 'Keeper',
              startX: 50,
              startY: 80,
              interceptX: 50,
              interceptY: 78,
              outcome: 'GROUND_PICKUP',
            },
          };
          overBalls.push(ballEvent);
          allBalls.push(ballEvent);
          continue;
        }

        // Legal delivery
        legalBallsInOver += 1;
        legalBallsFaced += 1;
        strikerRecord.balls += 1;
        bowlerRecord.legalBallsBowled += 1;

        // 2. Compute Outcome (Wicket, Boundary, Single, Dot)
        const outcome = this.computeDeliveryOutcome({
          overNum,
          striker,
          bowler: currentBowler,
          battingTactics: params.battingTactics,
          fieldingTactics: params.fieldingTactics,
          pitchCondition,
          currentRrr: target ? ((target - totalRuns) / (121 - legalBallsFaced)) * 6 : 8.0,
          rng,
        });

        if (outcome.isWicket) {
          totalWickets += 1;
          wicketsInOver += 1;
          bowlerRecord.wickets += 1;
          strikerRecord.isOut = true;
          strikerRecord.dismissalSummary = outcome.dismissalDesc;
          strikerRecord.bowlerName = currentBowler.name;

          const oversDisplay = `${overNum}.${legalBallsInOver}`;
          fallOfWickets.push({
            wicketNumber: totalWickets,
            score: totalRuns,
            oversDisplay,
            playerDismissedName: striker.name,
          });

          const ballEvent: BallEvent = {
            overNumber: overNum,
            ballInOver: legalBallsInOver,
            ballDisplay: oversDisplay,
            isLegalBall: true,
            bowlerId: currentBowler.id,
            bowlerName: currentBowler.name,
            bowlerStyle: currentBowler.primaryRole.includes('Fast') ? 'RFM' : currentBowler.primaryRole.includes('Spin') ? 'SLA' : 'RMF',
            bowlerStamina: Math.max(70, 98 - bowlerRecord.overs * 7),
            bowlerOversDisplay: `${Math.floor(bowlerRecord.legalBallsBowled / 6)}.${bowlerRecord.legalBallsBowled % 6}`,
            bowlerMaidens: bowlerRecord.maidens,
            bowlerRunsConceded: bowlerRecord.runsConceded,
            bowlerWickets: bowlerRecord.wickets,
            bowlerEconomy: Number((bowlerRecord.runsConceded / Math.max(0.166, bowlerRecord.legalBallsBowled / 6)).toFixed(1)),
            strikerId: striker.id,
            strikerName: striker.name,
            strikerNumber: strikerIdx + 1,
            strikerHand: striker.battingHand,
            strikerRuns: strikerRecord.runs,
            strikerBalls: strikerRecord.balls,
            strikerFours: strikerRecord.fours,
            strikerSixes: strikerRecord.sixes,
            nonStrikerId: nonStriker.id,
            nonStrikerName: nonStriker.name,
            nonStrikerNumber: nonStrikerIdx + 1,
            nonStrikerHand: nonStriker.battingHand,
            nonStrikerRuns: batters[nonStrikerIdx]?.runs || 0,
            nonStrikerBalls: batters[nonStrikerIdx]?.balls || 0,
            nonStrikerFours: batters[nonStrikerIdx]?.fours || 0,
            nonStrikerSixes: batters[nonStrikerIdx]?.sixes || 0,
            runsBat: 0,
            extrasRuns: 0,
            totalRuns: 0,
            isWicket: true,
            dismissal: {
              kind: outcome.dismissalKind || 'CAUGHT',
              dismissedPlayerId: striker.id,
              dismissedPlayerName: striker.name,
              assistPlayerName: outcome.assistPlayerName,
              description: outcome.dismissalDesc || 'Out',
            },
            commentary: outcome.commentary,
            teamRuns: totalRuns,
            teamWickets: totalWickets,
            trajectory: {
              shotType: outcome.dismissalKind === 'BOWLED' ? 'Clean Bowled' : 'Edged / Lofted Wicket',
              angleDeg: outcome.dismissalKind === 'BOWLED' ? 0 : 35,
              distancePct: outcome.dismissalKind === 'BOWLED' ? 5 : 60,
              isLofted: outcome.dismissalKind !== 'BOWLED',
              targetX: outcome.dismissalKind === 'BOWLED' ? 50 : 42,
              targetY: outcome.dismissalKind === 'BOWLED' ? 72 : 46,
            },
            fieldingAction: {
              fielderName: outcome.assistPlayerName || 'Fielder',
              positionLabel: outcome.dismissalKind === 'BOWLED' ? 'Stumps' : 'Slip/Cover',
              startX: outcome.dismissalKind === 'BOWLED' ? 50 : 36,
              startY: outcome.dismissalKind === 'BOWLED' ? 72 : 48,
              interceptX: outcome.dismissalKind === 'BOWLED' ? 50 : 42,
              interceptY: outcome.dismissalKind === 'BOWLED' ? 72 : 46,
              outcome: 'CATCH',
            },
          };
          overBalls.push(ballEvent);
          allBalls.push(ballEvent);

          // Bring next batter to the crease
          if (totalWickets < 10 && nextBatterIdx < orderedBatters.length) {
            strikerIdx = nextBatterIdx;
            nextBatterIdx++;
          }
        } else {
          // Runs scored off bat
          const runs = outcome.runs;
          totalRuns += runs;
          runsInOver += runs;
          strikerRecord.runs += runs;
          bowlerRecord.runsConceded += runs;

          if (runs === 0) bowlerRecord.dots += 1;
          if (runs === 4) strikerRecord.fours += 1;
          if (runs === 6) strikerRecord.sixes += 1;

          const oversDisplay = `${overNum}.${legalBallsInOver}`;

          // Calculate trajectory coordinates based on runs
          let targetX = 50;
          let targetY = 74;
          let distancePct = 10;
          let isLofted = false;
          let actionType: 'CATCH' | 'GROUND_PICKUP' | 'BOUNDARY_FOUR' | 'BOUNDARY_SIX' | 'DIVING_SAVE' = 'GROUND_PICKUP';
          let posLabel = 'Pitch';
          let fielderStartX = 50;
          let fielderStartY = 60;

          if (runs === 6) {
            targetX = striker.battingHand.includes('Left') ? 18 : 82;
            targetY = 12;
            distancePct = 100;
            isLofted = true;
            actionType = 'BOUNDARY_SIX';
            posLabel = 'Deep Boundary';
            fielderStartX = targetX > 50 ? 76 : 24;
            fielderStartY = 20;
          } else if (runs === 4) {
            targetX = Math.random() > 0.5 ? 88 : 12;
            targetY = 44;
            distancePct = 90;
            actionType = 'BOUNDARY_FOUR';
            posLabel = 'Deep Boundary';
            fielderStartX = targetX > 50 ? 74 : 26;
            fielderStartY = 40;
          } else if (runs === 2 || runs === 3) {
            targetX = Math.random() > 0.5 ? 72 : 28;
            targetY = 40;
            distancePct = 55;
            actionType = 'DIVING_SAVE';
            posLabel = 'Deep Mid-wicket';
            fielderStartX = targetX > 50 ? 66 : 34;
            fielderStartY = 48;
          } else if (runs === 1) {
            targetX = 42 + Math.floor(Math.random() * 16);
            targetY = 48;
            distancePct = 40;
            actionType = 'GROUND_PICKUP';
            posLabel = 'Cover/Mid-on';
            fielderStartX = targetX > 50 ? 56 : 44;
            fielderStartY = 44;
          } else {
            targetX = 50;
            targetY = 66;
            distancePct = 12;
            actionType = 'GROUND_PICKUP';
            posLabel = 'Pitch';
            fielderStartX = 50;
            fielderStartY = 58;
          }

          const ballEvent: BallEvent = {
            overNumber: overNum,
            ballInOver: legalBallsInOver,
            ballDisplay: oversDisplay,
            isLegalBall: true,
            bowlerId: currentBowler.id,
            bowlerName: currentBowler.name,
            bowlerStyle: currentBowler.primaryRole.includes('Fast') ? 'RFM' : currentBowler.primaryRole.includes('Spin') ? 'SLA' : 'RMF',
            bowlerStamina: Math.max(70, 98 - bowlerRecord.overs * 7),
            bowlerOversDisplay: `${Math.floor(bowlerRecord.legalBallsBowled / 6)}.${bowlerRecord.legalBallsBowled % 6}`,
            bowlerMaidens: bowlerRecord.maidens,
            bowlerRunsConceded: bowlerRecord.runsConceded,
            bowlerWickets: bowlerRecord.wickets,
            bowlerEconomy: Number((bowlerRecord.runsConceded / Math.max(0.166, bowlerRecord.legalBallsBowled / 6)).toFixed(1)),
            strikerId: striker.id,
            strikerName: striker.name,
            strikerNumber: strikerIdx + 1,
            strikerHand: striker.battingHand,
            strikerRuns: strikerRecord.runs,
            strikerBalls: strikerRecord.balls,
            strikerFours: strikerRecord.fours,
            strikerSixes: strikerRecord.sixes,
            nonStrikerId: nonStriker.id,
            nonStrikerName: nonStriker.name,
            nonStrikerNumber: nonStrikerIdx + 1,
            nonStrikerHand: nonStriker.battingHand,
            nonStrikerRuns: batters[nonStrikerIdx]?.runs || 0,
            nonStrikerBalls: batters[nonStrikerIdx]?.balls || 0,
            nonStrikerFours: batters[nonStrikerIdx]?.fours || 0,
            nonStrikerSixes: batters[nonStrikerIdx]?.sixes || 0,
            runsBat: runs,
            extrasRuns: 0,
            totalRuns: runs,
            isWicket: false,
            commentary: outcome.commentary,
            teamRuns: totalRuns,
            teamWickets: totalWickets,
            trajectory: {
              shotType: runs === 6 ? 'Maximum Six' : runs === 4 ? 'Boundary Four' : runs > 0 ? 'Placed in the Gap' : 'Dot Ball',
              angleDeg: 0,
              distancePct,
              isLofted,
              targetX,
              targetY,
            },
            fieldingAction: {
              fielderName: 'Fielder',
              positionLabel: posLabel,
              startX: fielderStartX,
              startY: fielderStartY,
              interceptX: targetX,
              interceptY: targetY,
              outcome: actionType,
            },
          };
          overBalls.push(ballEvent);
          allBalls.push(ballEvent);

          // Strike rotation on odd runs (1 or 3 runs)
          if (runs === 1 || runs === 3) {
            const temp = strikerIdx;
            strikerIdx = nonStrikerIdx;
            nonStrikerIdx = temp;
          }
        }
      }

      // Over Completed -> Update bowler overs & maiden checks
      bowlerRecord.overs = Math.floor(bowlerRecord.legalBallsBowled / 6);
      bowlerRecord.ballsRemainder = bowlerRecord.legalBallsBowled % 6;
      bowlerRecord.oversDisplay = `${bowlerRecord.overs}.${bowlerRecord.ballsRemainder}`;
      if (runsInOver === 0 && legalBallsInOver === 6) {
        bowlerRecord.maidens += 1;
      }
      bowlerRecord.economy = Number(
        (bowlerRecord.runsConceded / (bowlerRecord.legalBallsBowled / 6 || 1)).toFixed(2)
      );

      overSummaries.push({
        overNumber: overNum + 1,
        bowlerName: currentBowler.name,
        runsInOver,
        wicketsInOver,
        balls: overBalls,
        teamScoreAtEnd: totalRuns,
        teamWicketsAtEnd: totalWickets,
      });

      // End of over: switch strike for new over
      const tempEnd = strikerIdx;
      strikerIdx = nonStrikerIdx;
      nonStrikerIdx = tempEnd;
    }

    // Compute Batters Strike Rates
    batters.forEach(b => {
      b.strikeRate = b.balls > 0 ? Number(((b.runs / b.balls) * 100).toFixed(1)) : 0;
    });

    const fullCompletedOvers = Math.floor(legalBallsFaced / 6);
    const remBalls = legalBallsFaced % 6;
    const oversDisplay = `${fullCompletedOvers}.${remBalls}`;

    return {
      inningsNumber,
      battingFranchiseId,
      bowlingFranchiseId,
      totalRuns,
      totalWickets,
      legalBallsFaced,
      oversDisplay,
      isCompleted: true,
      isAllOut: totalWickets >= 10,
      target,
      batters,
      bowlers: Object.values(bowlersMap).filter(b => b.legalBallsBowled > 0),
      fallOfWickets,
      overSummaries,
      allBalls,
      extras,
    };
  }

  /**
   * Intelligently selects legal bowler for the next over respecting 4-over maximum limit
   */
  private static selectBowlerForOver(params: {
    overNum: number;
    bowlers: Player[];
    bowlersMap: Record<string, BowlerInningsRecord>;
    previousBowlerId: string | null;
    tactics?: BowlingTacticsConfig;
    rng: SeededPRNG;
  }): Player {
    const { overNum, bowlers, bowlersMap, previousBowlerId, tactics, rng } = params;

    // Filter bowlers who haven't reached their 4-over (24 balls) legal limit and aren't previous bowler
    const eligible = bowlers.filter(b => {
      const record = bowlersMap[b.id];
      const isUnderLimit = !record || record.legalBallsBowled < 24;
      const isNotConsecutive = b.id !== previousBowlerId;
      return isUnderLimit && isNotConsecutive;
    });

    if (eligible.length === 0) {
      // Fallback: anyone not previous bowler
      const fallback = bowlers.filter(b => b.id !== previousBowlerId);
      return fallback[0] || bowlers[0];
    }

    // Tactical prioritization:
    // Overs 0 & 1: Opening bowlers
    if (overNum <= 1 && tactics?.openingBowlerIds) {
      const preferred = eligible.find(b => tactics.openingBowlerIds.includes(b.id));
      if (preferred) return preferred;
    }

    // Overs 17 to 19: Death specialists
    if (overNum >= 17 && tactics?.deathOversSpecialistIds) {
      const death = eligible.find(b => tactics.deathOversSpecialistIds.includes(b.id));
      if (death) return death;
    }

    // Default: Pick best bowler with overs remaining
    return eligible[Math.floor(rng.next() * eligible.length)];
  }

  /**
   * Probability-based physics outcome calculator
   */
  private static computeDeliveryOutcome(params: {
    overNum: number;
    striker: Player;
    bowler: Player;
    battingTactics?: BattingTacticsConfig;
    fieldingTactics?: FieldingTacticsConfig;
    pitchCondition: string;
    currentRrr: number;
    rng: SeededPRNG;
  }): {
    isWicket: boolean;
    runs: number;
    dismissalKind?: 'BOWLED' | 'CAUGHT' | 'LBW' | 'RUN_OUT' | 'STUMPED';
    assistPlayerName?: string;
    dismissalDesc?: string;
    commentary: string;
  } {
    const { overNum, striker, bowler, battingTactics, pitchCondition, currentRrr, rng } = params;

    const isPace = !!bowler.paceBowling;
    const isSpin = !!bowler.spinBowling;

    // Skills
    const batSkill = (striker.batting.timing + striker.batting.technique) / 2;
    const batPower = striker.batting.power;
    const bowlSkill = isPace
      ? (bowler.paceBowling!.speed + bowler.paceBowling!.control) / 2
      : isSpin
      ? (bowler.spinBowling!.turn + bowler.spinBowling!.control) / 2
      : 70;

    // Pitch modifier
    let pitchBatMod = 1.0;
    let pitchBowlMod = 1.0;
    if (pitchCondition === 'Batting Friendly') pitchBatMod = 1.15;
    else if (pitchCondition === 'Bowling Greentop') pitchBowlMod = 1.2;
    else if (pitchCondition === 'Spin Dustbowl') pitchBowlMod = isSpin ? 1.25 : 0.95;

    // Aggression factor
    let aggression = 1.0;
    if (battingTactics?.macroAggression === 'Very Aggressive') aggression = 1.35;
    else if (battingTactics?.macroAggression === 'Aggressive') aggression = 1.18;
    else if (battingTactics?.macroAggression === 'Defensive') aggression = 0.8;
    else if (battingTactics?.macroAggression === 'Very Defensive') aggression = 0.65;

    // Death overs (overs 16-19) aggression ramp
    if (overNum >= 16 || currentRrr > 11.0) aggression *= 1.25;

    // 1. WICKET ROLL
    // Base dismissal probability: 4.5% to 12%
    let wicketChance = (5.0 + (bowlSkill * pitchBowlMod - batSkill * pitchBatMod) * 0.1) * aggression;
    wicketChance = Math.max(2.0, Math.min(18.0, wicketChance));

    if (rng.chance(wicketChance)) {
      // Wicket occurred! Determine dismissal kind
      const roll = rng.next();
      if (roll < 0.55) {
        return {
          isWicket: true,
          runs: 0,
          dismissalKind: 'CAUGHT',
          assistPlayerName: 'Deep Mid-wicket',
          dismissalDesc: `c Deep Mid-wicket b ${bowler.name}`,
          commentary: `OUT! ${striker.name} goes for the lofted shot, miscues high in the air, and is caught cleanly!`,
        };
      } else if (roll < 0.75) {
        return {
          isWicket: true,
          runs: 0,
          dismissalKind: 'BOWLED',
          dismissalDesc: `b ${bowler.name}`,
          commentary: `BOWLED HIM! Absolute peach from ${bowler.name}! Beats the inside edge and crashes into off-stump!`,
        };
      } else if (roll < 0.90) {
        return {
          isWicket: true,
          runs: 0,
          dismissalKind: 'LBW',
          dismissalDesc: `lbw b ${bowler.name}`,
          commentary: `UP GOES THE FINGER! Trapped right in front of middle stump! ${striker.name} departs LBW.`,
        };
      } else {
        return {
          isWicket: true,
          runs: 0,
          dismissalKind: isSpin ? 'STUMPED' : 'RUN_OUT',
          assistPlayerName: 'Wicketkeeper',
          dismissalDesc: isSpin ? `st Wicketkeeper b ${bowler.name}` : `run out (Fielder)`,
          commentary: isSpin
            ? `STUMPED! ${striker.name} danced down the track, missed the spinning ball, and the keeper whipped the bails off in a flash!`
            : `RUN OUT! Desperate single called, direct hit at the bowler's end catches the batter short of the crease!`,
        };
      }
    }

    // 2. RUN SCORING (Six, Four, Two, Single, Dot)
    // Six Chance (Driven by batter power, aggression, death overs)
    const sixChance = Math.min(22, (batPower * 0.12 + (overNum >= 16 ? 6 : 0)) * aggression);
    if (rng.chance(sixChance)) {
      return {
        isWicket: false,
        runs: 6,
        commentary: `SIX! That is colossal! ${striker.name} launches it high and handsome into the top tier!`,
      };
    }

    // Four Chance (Driven by timing, gap placement)
    const fourChance = Math.min(28, (striker.batting.timing * 0.16 + (overNum <= 5 ? 5 : 0)) * aggression);
    if (rng.chance(fourChance)) {
      return {
        isWicket: false,
        runs: 4,
        commentary: `FOUR! Pure placement! Pierces the inner ring with exquisite timing and races away to the fence!`,
      };
    }

    // 2 Runs (Running hard)
    if (rng.chance(14)) {
      return {
        isWicket: false,
        runs: 2,
        commentary: `Worked away into the deep cover pocket. Good calling between the wickets, they come back for two.`,
      };
    }

    // 1 Run (Strike rotation)
    if (rng.chance(42)) {
      return {
        isWicket: false,
        runs: 1,
        commentary: `Pushed softly into the gap at mid-on for a brisk single to rotate strike.`,
      };
    }

    // Dot Ball (Pressure delivery)
    return {
      isWicket: false,
      runs: 0,
      commentary: `Dot ball. Excellent length from ${bowler.name}, solid defensive block back down the track.`,
    };
  }

  /**
   * Super Over Simulation (1 over per side)
   */
  private static simulateSuperOver(params: {
    battingFranchiseId: string;
    bowlingFranchiseId: string;
    battingXi: Player[];
    bowlingXi: Player[];
    pitchCondition: string;
    target?: number;
    rng: SeededPRNG;
  }): InningsScorecard {
    const { battingFranchiseId, bowlingFranchiseId, battingXi, bowlingXi, pitchCondition, target, rng } = params;

    const batters: BatterInningsRecord[] = battingXi.slice(0, 3).map((p, idx) => ({
      playerId: p.id,
      playerName: p.name,
      battingPosition: idx + 1,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
    }));

    const bowler = bowlingXi.find(p => p.paceBowling?.deathBowling && p.paceBowling.deathBowling >= 88) || bowlingXi[0];
    const bowlerRecord: BowlerInningsRecord = {
      playerId: bowler.id,
      playerName: bowler.name,
      bowlingRole: bowler.primaryRole,
      overs: 1,
      ballsRemainder: 0,
      oversDisplay: '1.0',
      legalBallsBowled: 6,
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      economy: 0,
      dots: 0,
      wides: 0,
      noBalls: 0,
    };

    let totalRuns = 0;
    let totalWickets = 0;
    let strikerIdx = 0;
    const allBalls: BallEvent[] = [];

    for (let b = 1; b <= 6; b++) {
      if (totalWickets >= 2 || (target && totalRuns >= target)) break;

      const striker = battingXi[strikerIdx];
      const outcome = this.computeDeliveryOutcome({
        overNum: 19,
        striker,
        bowler,
        pitchCondition,
        currentRrr: 15.0,
        rng,
      });

      if (outcome.isWicket) {
        totalWickets += 1;
        bowlerRecord.wickets += 1;
        batters[strikerIdx].isOut = true;
        strikerIdx = Math.min(2, strikerIdx + 1);
      } else {
        totalRuns += outcome.runs;
        batters[strikerIdx].runs += outcome.runs;
        batters[strikerIdx].balls += 1;
        bowlerRecord.runsConceded += outcome.runs;
      }

      allBalls.push({
        overNumber: 0,
        ballInOver: b,
        ballDisplay: `0.${b}`,
        isLegalBall: true,
        bowlerId: bowler.id,
        bowlerName: bowler.name,
        bowlerStyle: bowler.primaryRole.includes('Fast') ? 'RFM' : 'SLA',
        bowlerOversDisplay: `0.${b}`,
        bowlerRunsConceded: bowlerRecord.runsConceded,
        bowlerWickets: bowlerRecord.wickets,
        bowlerEconomy: totalRuns * 6,
        strikerId: striker.id,
        strikerName: striker.name,
        strikerNumber: strikerIdx + 1,
        strikerHand: striker.battingHand,
        strikerRuns: batters[strikerIdx].runs,
        strikerBalls: batters[strikerIdx].balls,
        nonStrikerId: battingXi[1].id,
        nonStrikerName: battingXi[1].name,
        nonStrikerNumber: 2,
        nonStrikerHand: battingXi[1].battingHand,
        nonStrikerRuns: batters[1]?.runs || 0,
        nonStrikerBalls: batters[1]?.balls || 0,
        runsBat: outcome.runs,
        extrasRuns: 0,
        totalRuns: outcome.runs,
        isWicket: outcome.isWicket,
        commentary: `Super Over: ${outcome.commentary}`,
        teamRuns: totalRuns,
        teamWickets: totalWickets,
      });
    }

    bowlerRecord.economy = totalRuns * 6;

    return {
      inningsNumber: 1,
      battingFranchiseId,
      bowlingFranchiseId,
      totalRuns,
      totalWickets,
      legalBallsFaced: allBalls.length,
      oversDisplay: `1.0`,
      isCompleted: true,
      isAllOut: totalWickets >= 2,
      target,
      batters,
      bowlers: [bowlerRecord],
      fallOfWickets: [],
      overSummaries: [],
      allBalls,
      extras: { total: 0, wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    };
  }

  /**
   * Evaluates Player of the Match using comprehensive impact score
   */
  public static calculatePlayerOfTheMatch(
    innings1: InningsScorecard,
    innings2: InningsScorecard,
    allPlayers: Player[],
    winnerFranchiseId: string
  ): {
    playerId: string;
    playerName: string;
    franchiseId: string;
    performanceSummary: string;
    impactScore: number;
  } {
    const scores: Record<string, { runs: number; balls: number; wickets: number; runsConc: number; overs: number; teamId: string }> = {};

    [...innings1.batters, ...innings2.batters].forEach(b => {
      if (!scores[b.playerId]) {
        scores[b.playerId] = { runs: 0, balls: 0, wickets: 0, runsConc: 0, overs: 0, teamId: '' };
      }
      scores[b.playerId].runs += b.runs;
      scores[b.playerId].balls += b.balls;
    });

    [...innings1.bowlers, ...innings2.bowlers].forEach(bw => {
      if (!scores[bw.playerId]) {
        scores[bw.playerId] = { runs: 0, balls: 0, wickets: 0, runsConc: 0, overs: 0, teamId: '' };
      }
      scores[bw.playerId].wickets += bw.wickets;
      scores[bw.playerId].runsConc += bw.runsConceded;
      scores[bw.playerId].overs += bw.overs;
    });

    let bestPlayerId = allPlayers[0]?.id || '';
    let bestScore = -1;
    let bestSummary = '';

    Object.entries(scores).forEach(([playerId, stat]) => {
      const player = allPlayers.find(p => p.id === playerId);
      if (!player) return;

      let impact = stat.runs * 1.0;
      if (stat.runs >= 50) impact += 15;
      if (stat.runs >= 100) impact += 30;

      impact += stat.wickets * 25;
      if (stat.wickets >= 3) impact += 20;

      // Economy bonus
      if (stat.overs >= 3 && stat.runsConc / stat.overs < 6.5) impact += 12;

      // Winner bonus
      if (player.contract.currentFranchiseId === winnerFranchiseId || player.originalFranchiseId === winnerFranchiseId) {
        impact *= 1.2;
      }

      if (impact > bestScore) {
        bestScore = impact;
        bestPlayerId = playerId;

        const parts: string[] = [];
        if (stat.runs > 0) parts.push(`${stat.runs} (${stat.balls})`);
        if (stat.wickets > 0) parts.push(`${stat.wickets}/${stat.runsConc}`);
        bestSummary = parts.join(' & ') || `${stat.runs} runs`;
      }
    });

    const winningPlayer = allPlayers.find(p => p.id === bestPlayerId) || allPlayers[0];

    return {
      playerId: winningPlayer.id,
      playerName: winningPlayer.name,
      franchiseId: winningPlayer.contract.currentFranchiseId || winningPlayer.originalFranchiseId || 'CSK',
      performanceSummary: bestSummary,
      impactScore: Math.round(bestScore),
    };
  }
}

export type MatchSessionStatus =
  | 'SCHEDULED'
  | 'LIVE_INNINGS_1'
  | 'INNINGS_BREAK'
  | 'LIVE_INNINGS_2'
  | 'COMPLETED';

export interface LiveTacticsInput {
  battingAggression?: 'Defensive' | 'Balanced' | 'Aggressive' | 'Very Aggressive';
  strikerApproach?: 'Defend' | 'Build' | 'Attack' | 'Slog' | 'Assistant Choice';
  bowlingDirective?: 'Yorker / Full' | 'Hard Good Length' | 'Bouncer / Short' | 'Slow / Cutters';
  ringPressure?: 'Packed Ring' | 'Boundary Patrol' | 'Balanced';
}

export interface LiveInningsState {
  inningsNumber: 1 | 2;
  battingFranchiseId: string;
  bowlingFranchiseId: string;
  totalRuns: number;
  totalWickets: number;
  legalBallsFaced: number;
  oversDisplay: string;
  target?: number;
  batters: BatterInningsRecord[];
  activeStrikerIdx: number;
  activeNonStrikerIdx: number;
  nextBatterIdx: number;
  bowlersMap: Record<string, BowlerInningsRecord>;
  currentBowler: Player;
  previousBowlerId: string | null;
  fallOfWickets: FallOfWicket[];
  allBalls: BallEvent[];
  overSummaries: OverSummary[];
  currentOverBalls: BallEvent[];
  currentOverNumber: number;
  legalBallsInCurrentOver: number;
  runsInCurrentOver: number;
  wicketsInCurrentOver: number;
  extras: { total: number; wides: number; noBalls: number; byes: number; legByes: number };
}

/**
 * Authoritative Delivery-by-Delivery Live Match Simulation Session
 * Eliminates pre-decided outcomes; calculates each ball dynamically based on
 * skills, stamina, form, difficulty, conditions, matchups and tactics.
 */
export class LiveMatchSession {
  public matchId: string;
  public fixtureId: string;
  public homeFranchiseId: string;
  public awayFranchiseId: string;
  public homePlayingXi: Player[];
  public awayPlayingXi: Player[];
  public userFranchiseId: string;
  public difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  public pitchCondition: string;
  public venue: string;

  public status: MatchSessionStatus = 'SCHEDULED';
  public currentInningsNumber: 1 | 2 = 1;

  public tossWinnerId: string;
  public tossDecision: 'Bat First' | 'Bowl First';
  public teamBattingFirstId: string;
  public teamBowlingFirstId: string;

  public battingFirstXi: Player[];
  public bowlingFirstXi: Player[];

  public innings1: LiveInningsState;
  public innings2: LiveInningsState | null = null;
  public target: number | null = null;

  public winnerFranchiseId: string | null = null;
  public loserFranchiseId: string | null = null;
  public marginDescription: string | null = null;
  public completedResultDetails: MatchResultDetails | null = null;

  // Individual player form & fatigue/stamina registries
  public playerForm: Record<string, number> = {};
  public playerStamina: Record<string, number> = {};
  public playerFatigue: Record<string, number> = {};

  private rng: SeededPRNG;

  constructor(config: MatchSimulationConfig & { difficulty?: 'EASY' | 'MEDIUM' | 'HARD'; userFranchiseId?: string }) {
    this.matchId = config.matchId;
    this.fixtureId = config.fixtureId;
    this.homeFranchiseId = config.homeFranchiseId;
    this.awayFranchiseId = config.awayFranchiseId;
    this.homePlayingXi = config.homePlayingXi;
    this.awayPlayingXi = config.awayPlayingXi;
    this.userFranchiseId = config.userFranchiseId || config.homeFranchiseId;
    this.difficulty = config.difficulty || 'MEDIUM';
    this.pitchCondition = config.conditions?.pitchCondition || 'Balanced Surface';
    this.venue = config.conditions?.venue || 'Chinnaswamy Stadium, Bengaluru';

    const seed = config.seed !== undefined ? config.seed : Math.floor(Math.random() * 1000000);
    this.rng = new SeededPRNG(seed);

    // Initialize player form, stamina, fatigue
    const allMatchPlayers = [...this.homePlayingXi, ...this.awayPlayingXi];
    allMatchPlayers.forEach(p => {
      this.playerForm[p.id] = p.currentForm || 80;
      this.playerStamina[p.id] = 100;
      this.playerFatigue[p.id] = 0;
    });

    // Toss calculation
    this.tossWinnerId = this.rng.chance(50) ? this.homeFranchiseId : this.awayFranchiseId;
    if (this.pitchCondition === 'Bowling Greentop' || this.pitchCondition === 'Humid & Dew') {
      this.tossDecision = 'Bowl First';
    } else {
      this.tossDecision = this.rng.chance(60) ? 'Bat First' : 'Bowl First';
    }

    this.teamBattingFirstId =
      this.tossDecision === 'Bat First'
        ? this.tossWinnerId
        : this.tossWinnerId === this.homeFranchiseId
        ? this.awayFranchiseId
        : this.homeFranchiseId;

    this.teamBowlingFirstId =
      this.teamBattingFirstId === this.homeFranchiseId ? this.awayFranchiseId : this.homeFranchiseId;

    this.battingFirstXi =
      this.teamBattingFirstId === this.homeFranchiseId ? this.homePlayingXi : this.awayPlayingXi;
    this.bowlingFirstXi =
      this.teamBowlingFirstId === this.homeFranchiseId ? this.homePlayingXi : this.awayPlayingXi;

    // Initialize Live Innings 1
    this.innings1 = this.createInitialInningsState(
      1,
      this.teamBattingFirstId,
      this.teamBowlingFirstId,
      this.battingFirstXi,
      this.bowlingFirstXi
    );
  }

  private createInitialInningsState(
    inningsNumber: 1 | 2,
    battingFranchiseId: string,
    bowlingFranchiseId: string,
    battingXi: Player[],
    bowlingXi: Player[],
    target?: number
  ): LiveInningsState {
    const batters: BatterInningsRecord[] = battingXi.map((p, idx) => ({
      playerId: p.id,
      playerName: p.name,
      battingPosition: idx + 1,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
    }));

    const bowlersMap: Record<string, BowlerInningsRecord> = {};
    bowlingXi.forEach(p => {
      bowlersMap[p.id] = {
        playerId: p.id,
        playerName: p.name,
        bowlingRole: p.primaryRole,
        overs: 0,
        ballsRemainder: 0,
        oversDisplay: '0.0',
        legalBallsBowled: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        economy: 0,
        dots: 0,
        wides: 0,
        noBalls: 0,
      };
    });

    // Opening bowler
    const bowlingPool = bowlingXi.filter(
      p => p.primaryRole.includes('Bowler') || p.primaryRole.includes('All-rounder')
    );
    const eligible = bowlingPool.length > 0 ? bowlingPool : bowlingXi.slice(4);
    const openingBowler = eligible[0] || bowlingXi[4];

    return {
      inningsNumber,
      battingFranchiseId,
      bowlingFranchiseId,
      totalRuns: 0,
      totalWickets: 0,
      legalBallsFaced: 0,
      oversDisplay: '0.0',
      target,
      batters,
      activeStrikerIdx: 0,
      activeNonStrikerIdx: 1,
      nextBatterIdx: 2,
      bowlersMap,
      currentBowler: openingBowler,
      previousBowlerId: null,
      fallOfWickets: [],
      allBalls: [],
      overSummaries: [],
      currentOverBalls: [],
      currentOverNumber: 0,
      legalBallsInCurrentOver: 0,
      runsInCurrentOver: 0,
      wicketsInCurrentOver: 0,
      extras: { total: 0, wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    };
  }

  /**
   * Simulates exactly one live delivery based on active state and tactics
   */
  public simulateNextDelivery(tactics?: LiveTacticsInput): BallEvent | null {
    if (this.status === 'COMPLETED') return null;

    if (this.status === 'SCHEDULED') {
      this.status = 'LIVE_INNINGS_1';
      this.currentInningsNumber = 1;
    }

    if (this.status === 'INNINGS_BREAK') {
      // Transition to Innings 2
      this.status = 'LIVE_INNINGS_2';
      this.currentInningsNumber = 2;
      this.target = this.innings1.totalRuns + 1;
      this.innings2 = this.createInitialInningsState(
        2,
        this.teamBowlingFirstId,
        this.teamBattingFirstId,
        this.bowlingFirstXi,
        this.battingFirstXi,
        this.target
      );
    }

    const currentInnings = this.currentInningsNumber === 1 ? this.innings1 : this.innings2!;
    const battingXi = this.currentInningsNumber === 1 ? this.battingFirstXi : this.bowlingFirstXi;
    const bowlingXi = this.currentInningsNumber === 1 ? this.bowlingFirstXi : this.battingFirstXi;

    // Check if over needs new bowler
    if (currentInnings.legalBallsInCurrentOver === 0 && currentInnings.currentOverBalls.length === 0) {
      currentInnings.currentBowler = this.pickNextBowler(currentInnings, bowlingXi);
    }

    const striker = battingXi[currentInnings.activeStrikerIdx] || battingXi[0];
    const nonStriker = battingXi[currentInnings.activeNonStrikerIdx] || battingXi[1];
    const bowler = currentInnings.currentBowler;
    const bowlerRecord = currentInnings.bowlersMap[bowler.id];
    const strikerRecord = currentInnings.batters[currentInnings.activeStrikerIdx];

    const isUserBatting = currentInnings.battingFranchiseId === this.userFranchiseId;
    const isUserBowling = currentInnings.bowlingFranchiseId === this.userFranchiseId;

    // 1. Evaluate Extras (Wide / No-ball)
    const wideRoll = this.rng.next();
    if (wideRoll < 0.035) {
      // Wide delivery
      currentInnings.totalRuns += 1;
      currentInnings.extras.wides += 1;
      currentInnings.extras.total += 1;
      currentInnings.runsInCurrentOver += 1;
      bowlerRecord.runsConceded += 1;
      bowlerRecord.wides += 1;

      const ballEvent: BallEvent = {
        overNumber: currentInnings.currentOverNumber,
        ballInOver: currentInnings.legalBallsInCurrentOver + 1,
        ballDisplay: `${currentInnings.currentOverNumber}.${currentInnings.legalBallsInCurrentOver} (wd)`,
        isLegalBall: false,
        bowlerId: bowler.id,
        bowlerName: bowler.name,
        bowlerStyle: bowler.primaryRole.includes('Fast') ? 'RFM' : 'SLA',
        bowlerStamina: Math.round(this.playerStamina[bowler.id] || 90),
        bowlerOversDisplay: `${Math.floor(bowlerRecord.legalBallsBowled / 6)}.${bowlerRecord.legalBallsBowled % 6}`,
        bowlerMaidens: bowlerRecord.maidens,
        bowlerRunsConceded: bowlerRecord.runsConceded,
        bowlerWickets: bowlerRecord.wickets,
        bowlerEconomy: Number((bowlerRecord.runsConceded / Math.max(0.166, bowlerRecord.legalBallsBowled / 6)).toFixed(1)),
        strikerId: striker.id,
        strikerName: striker.name,
        strikerNumber: currentInnings.activeStrikerIdx + 1,
        strikerHand: striker.battingHand,
        strikerRuns: strikerRecord.runs,
        strikerBalls: strikerRecord.balls,
        strikerFours: strikerRecord.fours,
        strikerSixes: strikerRecord.sixes,
        nonStrikerId: nonStriker.id,
        nonStrikerName: nonStriker.name,
        nonStrikerNumber: currentInnings.activeNonStrikerIdx + 1,
        nonStrikerHand: nonStriker.battingHand,
        nonStrikerRuns: currentInnings.batters[currentInnings.activeNonStrikerIdx]?.runs || 0,
        nonStrikerBalls: currentInnings.batters[currentInnings.activeNonStrikerIdx]?.balls || 0,
        runsBat: 0,
        extrasType: 'WIDE',
        extrasRuns: 1,
        totalRuns: 1,
        isWicket: false,
        commentary: `${bowler.name} pushes it too wide outside off stump. Umpire signals Wide.`,
        teamRuns: currentInnings.totalRuns,
        teamWickets: currentInnings.totalWickets,
        trajectory: {
          shotType: 'Wide Delivery',
          angleDeg: -30,
          distancePct: 15,
          isLofted: false,
          targetX: 58,
          targetY: 72,
        },
        fieldingAction: {
          fielderName: 'Wicketkeeper',
          positionLabel: 'Keeper',
          startX: 50,
          startY: 80,
          interceptX: 56,
          interceptY: 78,
          outcome: 'GROUND_PICKUP',
        },
      };

      currentInnings.currentOverBalls.push(ballEvent);
      currentInnings.allBalls.push(ballEvent);
      this.checkInningsCompletion(currentInnings);
      return ballEvent;
    }

    // 2. Legal Delivery Execution
    currentInnings.legalBallsInCurrentOver += 1;
    currentInnings.legalBallsFaced += 1;
    bowlerRecord.legalBallsBowled += 1;
    strikerRecord.balls += 1;

    // Deplete bowler stamina
    this.playerStamina[bowler.id] = Math.max(45, (this.playerStamina[bowler.id] || 100) - 1.2);

    // Calculate Outcome based on skills, form, stamina, difficulty, matchups and tactics
    const outcome = this.computeDeliveryPhysics({
      overNum: currentInnings.currentOverNumber,
      striker,
      bowler,
      isUserBatting,
      isUserBowling,
      tactics,
    });

    let runs = outcome.runs;
    const isWicket = outcome.isWicket;

    if (isWicket) {
      runs = 0;
      currentInnings.totalWickets += 1;
      currentInnings.wicketsInCurrentOver += 1;
      bowlerRecord.wickets += 1;
      strikerRecord.isOut = true;
      strikerRecord.dismissalSummary = outcome.dismissalDesc || 'c Fielder b Bowler';

      currentInnings.fallOfWickets.push({
        wicketNumber: currentInnings.totalWickets,
        score: currentInnings.totalRuns,
        oversDisplay: `${currentInnings.currentOverNumber}.${currentInnings.legalBallsInCurrentOver}`,
        playerDismissedName: striker.name,
      });
    } else {
      currentInnings.totalRuns += runs;
      currentInnings.runsInCurrentOver += runs;
      strikerRecord.runs += runs;
      bowlerRecord.runsConceded += runs;

      if (runs === 0) bowlerRecord.dots += 1;
      if (runs === 4) strikerRecord.fours += 1;
      if (runs === 6) strikerRecord.sixes += 1;

      // Deplete batter stamina with runs scored
      this.playerStamina[striker.id] = Math.max(50, (this.playerStamina[striker.id] || 100) - runs * 0.4);
    }

    strikerRecord.strikeRate = strikerRecord.balls > 0
      ? Number(((strikerRecord.runs / strikerRecord.balls) * 100).toFixed(1))
      : 0;

    const oversDisplay = `${currentInnings.currentOverNumber}.${currentInnings.legalBallsInCurrentOver}`;
    currentInnings.oversDisplay = oversDisplay;

    // Trajectory coordinates
    let targetX = 50;
    let targetY = 70;
    let distancePct = 20;
    let isLofted = false;
    let actionType: 'CATCH' | 'GROUND_PICKUP' | 'BOUNDARY_FOUR' | 'BOUNDARY_SIX' | 'DIVING_SAVE' = 'GROUND_PICKUP';

    if (runs === 6) {
      targetX = striker.battingHand.includes('Left') ? 20 : 80;
      targetY = 12;
      distancePct = 100;
      isLofted = true;
      actionType = 'BOUNDARY_SIX';
    } else if (runs === 4) {
      targetX = this.rng.chance(50) ? 86 : 14;
      targetY = 42;
      distancePct = 90;
      actionType = 'BOUNDARY_FOUR';
    } else if (runs > 0) {
      targetX = 40 + Math.floor(this.rng.next() * 20);
      targetY = 48;
      distancePct = 45;
      actionType = 'GROUND_PICKUP';
    }

    const ballEvent: BallEvent = {
      overNumber: currentInnings.currentOverNumber,
      ballInOver: currentInnings.legalBallsInCurrentOver,
      ballDisplay: oversDisplay,
      isLegalBall: true,
      bowlerId: bowler.id,
      bowlerName: bowler.name,
      bowlerStyle: bowler.primaryRole.includes('Fast') ? 'RFM' : 'SLA',
      bowlerStamina: Math.round(this.playerStamina[bowler.id] || 85),
      bowlerOversDisplay: `${Math.floor(bowlerRecord.legalBallsBowled / 6)}.${bowlerRecord.legalBallsBowled % 6}`,
      bowlerMaidens: bowlerRecord.maidens,
      bowlerRunsConceded: bowlerRecord.runsConceded,
      bowlerWickets: bowlerRecord.wickets,
      bowlerEconomy: Number((bowlerRecord.runsConceded / Math.max(0.166, bowlerRecord.legalBallsBowled / 6)).toFixed(1)),
      strikerId: striker.id,
      strikerName: striker.name,
      strikerNumber: currentInnings.activeStrikerIdx + 1,
      strikerHand: striker.battingHand,
      strikerRuns: strikerRecord.runs,
      strikerBalls: strikerRecord.balls,
      strikerFours: strikerRecord.fours,
      strikerSixes: strikerRecord.sixes,
      nonStrikerId: nonStriker.id,
      nonStrikerName: nonStriker.name,
      nonStrikerNumber: currentInnings.activeNonStrikerIdx + 1,
      nonStrikerHand: nonStriker.battingHand,
      nonStrikerRuns: currentInnings.batters[currentInnings.activeNonStrikerIdx]?.runs || 0,
      nonStrikerBalls: currentInnings.batters[currentInnings.activeNonStrikerIdx]?.balls || 0,
      runsBat: runs,
      extrasRuns: 0,
      totalRuns: runs,
      isWicket,
      dismissal: isWicket
        ? {
            kind: outcome.dismissalKind || 'CAUGHT',
            dismissedPlayerId: striker.id,
            dismissedPlayerName: striker.name,
            description: outcome.dismissalDesc || 'Out',
          }
        : undefined,
      commentary: outcome.commentary,
      teamRuns: currentInnings.totalRuns,
      teamWickets: currentInnings.totalWickets,
      trajectory: {
        shotType: runs === 6 ? 'Maximum Six' : runs === 4 ? 'Boundary Four' : runs > 0 ? 'Single' : 'Dot',
        angleDeg: runs === 6 ? 45 : 10,
        distancePct,
        isLofted,
        targetX,
        targetY,
      },
      fieldingAction: {
        fielderName: 'Cover / Long-on',
        positionLabel: 'Deep Field',
        startX: targetX > 50 ? 65 : 35,
        startY: 50,
        interceptX: targetX,
        interceptY: targetY,
        outcome: actionType,
      },
    };

    currentInnings.currentOverBalls.push(ballEvent);
    currentInnings.allBalls.push(ballEvent);

    // If wicket, bring next batter to crease
    if (isWicket && currentInnings.totalWickets < 10) {
      if (currentInnings.nextBatterIdx < battingXi.length) {
        currentInnings.activeStrikerIdx = currentInnings.nextBatterIdx;
        currentInnings.nextBatterIdx += 1;
      }
    } else if (runs % 2 !== 0) {
      // Odd runs: rotate strike
      const temp = currentInnings.activeStrikerIdx;
      currentInnings.activeStrikerIdx = currentInnings.activeNonStrikerIdx;
      currentInnings.activeNonStrikerIdx = temp;
    }

    // End of Over check
    if (currentInnings.legalBallsInCurrentOver === 6) {
      bowlerRecord.overs = Math.floor(bowlerRecord.legalBallsBowled / 6);
      bowlerRecord.ballsRemainder = bowlerRecord.legalBallsBowled % 6;
      bowlerRecord.oversDisplay = `${bowlerRecord.overs}.${bowlerRecord.ballsRemainder}`;
      if (currentInnings.runsInCurrentOver === 0) bowlerRecord.maidens += 1;
      bowlerRecord.economy = Number((bowlerRecord.runsConceded / (bowlerRecord.overs || 1)).toFixed(2));

      currentInnings.overSummaries.push({
        overNumber: currentInnings.currentOverNumber + 1,
        bowlerName: bowler.name,
        runsInOver: currentInnings.runsInCurrentOver,
        wicketsInOver: currentInnings.wicketsInCurrentOver,
        balls: [...currentInnings.currentOverBalls],
        teamScoreAtEnd: currentInnings.totalRuns,
        teamWicketsAtEnd: currentInnings.totalWickets,
      });

      // Switch strike for new over
      const tempEnd = currentInnings.activeStrikerIdx;
      currentInnings.activeStrikerIdx = currentInnings.activeNonStrikerIdx;
      currentInnings.activeNonStrikerIdx = tempEnd;

      currentInnings.previousBowlerId = bowler.id;
      currentInnings.currentOverNumber += 1;
      currentInnings.legalBallsInCurrentOver = 0;
      currentInnings.runsInCurrentOver = 0;
      currentInnings.wicketsInCurrentOver = 0;
      currentInnings.currentOverBalls = [];
    }

    this.checkInningsCompletion(currentInnings);
    return ballEvent;
  }

  private pickNextBowler(innings: LiveInningsState, bowlingXi: Player[]): Player {
    const eligible = bowlingXi.filter(b => {
      const rec = innings.bowlersMap[b.id];
      const under4Overs = !rec || rec.legalBallsBowled < 24;
      const notConsecutive = b.id !== innings.previousBowlerId;
      return under4Overs && notConsecutive;
    });

    if (eligible.length === 0) {
      return bowlingXi.find(b => b.id !== innings.previousBowlerId) || bowlingXi[0];
    }

    // Prioritize high stamina and death bowlers in overs 16+
    if (innings.currentOverNumber >= 16) {
      const death = eligible.find(b => b.primaryRole.includes('Death') || b.primaryRole.includes('Fast'));
      if (death) return death;
    }

    return eligible[Math.floor(this.rng.next() * eligible.length)];
  }

  private computeDeliveryPhysics(params: {
    overNum: number;
    striker: Player;
    bowler: Player;
    isUserBatting: boolean;
    isUserBowling: boolean;
    tactics?: LiveTacticsInput;
  }): {
    isWicket: boolean;
    runs: number;
    dismissalKind?: 'BOWLED' | 'CAUGHT' | 'LBW' | 'RUN_OUT' | 'STUMPED';
    dismissalDesc?: string;
    commentary: string;
  } {
    const { overNum, striker, bowler, isUserBatting, isUserBowling, tactics } = params;

    const isSpin = !!bowler.spinBowling;
    const isPace = !!bowler.paceBowling;

    // Skills
    const batTiming = striker.batting.timing;
    const batPower = striker.batting.power;
    const bowlSkill = isPace
      ? (bowler.paceBowling?.speed || 80) * 0.5 + (bowler.paceBowling?.control || 80) * 0.5
      : (bowler.spinBowling?.turn || 80) * 0.5 + (bowler.spinBowling?.control || 80) * 0.5;

    // Form modifier
    const strikerFormMod = ((this.playerForm[striker.id] || 80) - 75) * 0.2;
    const bowlerFormMod = ((this.playerForm[bowler.id] || 80) - 75) * 0.2;

    // Stamina penalty
    const bowlerStaminaPct = (this.playerStamina[bowler.id] || 100) / 100;
    const effectiveBowlSkill = bowlSkill * (0.8 + bowlerStaminaPct * 0.2) + bowlerFormMod;

    // Difficulty modifier
    let diffBatMod = 1.0;
    let diffWicketMod = 1.0;
    if (this.difficulty === 'EASY') {
      if (isUserBatting) {
        diffBatMod = 1.15;
        diffWicketMod = 0.75;
      } else if (isUserBowling) {
        diffWicketMod = 1.25;
      }
    } else if (this.difficulty === 'HARD') {
      if (isUserBatting) {
        diffBatMod = 0.92;
        diffWicketMod = 1.2;
      } else if (isUserBowling) {
        diffBatMod = 1.1;
      }
    }

    // Tactics modifier
    let aggro = 1.0;
    if (tactics?.battingAggression === 'Very Aggressive' || tactics?.strikerApproach === 'Slog') aggro = 1.4;
    else if (tactics?.battingAggression === 'Aggressive' || tactics?.strikerApproach === 'Attack') aggro = 1.2;
    else if (tactics?.battingAggression === 'Defensive' || tactics?.strikerApproach === 'Defend') aggro = 0.7;

    // Death overs boost
    if (overNum >= 16) aggro *= 1.25;

    // Wicket probability
    let wicketProb = (5.5 + (effectiveBowlSkill - (batTiming + strikerFormMod)) * 0.08) * aggro * diffWicketMod;
    wicketProb = Math.max(2.0, Math.min(18.0, wicketProb));

    if (this.rng.chance(wicketProb)) {
      const roll = this.rng.next();
      if (roll < 0.55) {
        return {
          isWicket: true,
          runs: 0,
          dismissalKind: 'CAUGHT',
          dismissalDesc: `c Deep Field b ${bowler.name}`,
          commentary: `OUT! ${striker.name} miscues high in the air and is caught comfortably!`,
        };
      } else if (roll < 0.78) {
        return {
          isWicket: true,
          runs: 0,
          dismissalKind: 'BOWLED',
          dismissalDesc: `b ${bowler.name}`,
          commentary: `BOWLED! Beaten by the movement, off-stump goes flying! ${bowler.name} strikes!`,
        };
      } else if (roll < 0.90) {
        return {
          isWicket: true,
          runs: 0,
          dismissalKind: 'LBW',
          dismissalDesc: `lbw b ${bowler.name}`,
          commentary: `LBW! Plumb in front of middle stump! ${striker.name} has to walk back!`,
        };
      } else {
        return {
          isWicket: true,
          runs: 0,
          dismissalKind: isSpin ? 'STUMPED' : 'RUN_OUT',
          dismissalDesc: isSpin ? `st Keeper b ${bowler.name}` : `run out`,
          commentary: isSpin
            ? `STUMPED! Stepped out, beaten in flight, lightning bails removed!`
            : `RUN OUT! Brilliant direct throw at the bowler's end!`,
        };
      }
    }

    // Runs
    const sixProb = Math.min(22, (batPower * 0.12 + (overNum >= 16 ? 6 : 0)) * aggro * diffBatMod);
    if (this.rng.chance(sixProb)) {
      return {
        isWicket: false,
        runs: 6,
        commentary: `SIX! Clears the rope with authority! Massive hit from ${striker.name}!`,
      };
    }

    const fourProb = Math.min(32, (batTiming * 0.16 + 5) * aggro * diffBatMod);
    if (this.rng.chance(fourProb)) {
      return {
        isWicket: false,
        runs: 4,
        commentary: `FOUR! Pierces the infield beautifully and races away to the boundary fence!`,
      };
    }

    const singleProb = 48;
    if (this.rng.chance(singleProb)) {
      const runs = this.rng.chance(25) ? 2 : 1;
      return {
        isWicket: false,
        runs,
        commentary: `${runs === 2 ? 'Quick couple' : 'Pushed into the gap for a brisk single'} by ${striker.name}.`,
      };
    }

    return {
      isWicket: false,
      runs: 0,
      commentary: `Dot ball. Good tight line outside off from ${bowler.name}.`,
    };
  }

  private checkInningsCompletion(currentInnings: LiveInningsState) {
    if (this.currentInningsNumber === 1) {
      if (currentInnings.totalWickets >= 10 || currentInnings.currentOverNumber >= 20) {
        this.status = 'INNINGS_BREAK';
        this.target = currentInnings.totalRuns + 1;
      }
    } else {
      // Innings 2 completion
      const targetMet = this.target && currentInnings.totalRuns >= this.target;
      const allOut = currentInnings.totalWickets >= 10;
      const oversDone = currentInnings.currentOverNumber >= 20;

      if (targetMet || allOut || oversDone) {
        this.status = 'COMPLETED';
        this.finalizeMatchResult();
      }
    }
  }

  private finalizeMatchResult() {
    const inn1 = this.innings1;
    const inn2 = this.innings2!;

    let winnerId = '';
    let loserId = '';
    let margin = '';

    if (inn2.totalRuns >= (this.target || 0)) {
      winnerId = inn2.battingFranchiseId;
      loserId = inn1.battingFranchiseId;
      const wLeft = 10 - inn2.totalWickets;
      const bLeft = 120 - inn2.legalBallsFaced;
      margin = `${winnerId} won by ${wLeft} wicket${wLeft > 1 ? 's' : ''} (${bLeft} balls remaining)`;
    } else {
      winnerId = inn1.battingFranchiseId;
      loserId = inn2.battingFranchiseId;
      const runDiff = inn1.totalRuns - inn2.totalRuns;
      margin = `${winnerId} won by ${runDiff} run${runDiff > 1 ? 's' : ''}`;
    }

    this.winnerFranchiseId = winnerId;
    this.loserFranchiseId = loserId;
    this.marginDescription = margin;

    const potm = CricketMatchEngine.calculatePlayerOfTheMatch(
      this.toInningsScorecard(inn1),
      this.toInningsScorecard(inn2),
      [...this.homePlayingXi, ...this.awayPlayingXi],
      winnerId
    );

    this.completedResultDetails = {
      matchId: this.matchId,
      fixtureId: this.fixtureId,
      homeFranchiseId: this.homeFranchiseId,
      awayFranchiseId: this.awayFranchiseId,
      winnerFranchiseId: winnerId,
      loserFranchiseId: loserId,
      isTie: false,
      isSuperOver: false,
      marginDescription: margin,
      innings1: this.toInningsScorecard(inn1),
      innings2: this.toInningsScorecard(inn2),
      playerOfTheMatch: potm,
      conditions: {
        pitchCondition: this.pitchCondition,
        weatherCondition: 'Clear 28°C',
        venue: this.venue,
        tossWinnerId: this.tossWinnerId,
        tossDecision: this.tossDecision,
      },
      randomSeed: 12345,
      completedAt: Date.now(),
    };
  }

  public fastForwardToEnd(): MatchResultDetails {
    while (this.status !== 'COMPLETED') {
      this.simulateNextDelivery();
    }
    return this.completedResultDetails!;
  }

  public toInningsScorecard(inn: LiveInningsState): InningsScorecard {
    return {
      inningsNumber: inn.inningsNumber,
      battingFranchiseId: inn.battingFranchiseId,
      bowlingFranchiseId: inn.bowlingFranchiseId,
      totalRuns: inn.totalRuns,
      totalWickets: inn.totalWickets,
      legalBallsFaced: inn.legalBallsFaced,
      oversDisplay: inn.oversDisplay,
      isCompleted: inn.totalWickets >= 10 || inn.currentOverNumber >= 20 || (inn.target ? inn.totalRuns >= inn.target : false),
      isAllOut: inn.totalWickets >= 10,
      target: inn.target,
      batters: inn.batters,
      bowlers: Object.values(inn.bowlersMap).filter(b => b.legalBallsBowled > 0),
      fallOfWickets: inn.fallOfWickets,
      overSummaries: inn.overSummaries,
      allBalls: inn.allBalls,
      extras: inn.extras,
    };
  }

  /**
   * Returns live view of scorecard revealing ONLY what has been completed so far
   */
  public getLiveScorecardState() {
    return {
      status: this.status,
      currentInnings: this.currentInningsNumber,
      innings1: this.toInningsScorecard(this.innings1),
      innings2: this.innings2 ? this.toInningsScorecard(this.innings2) : null,
      target: this.target,
      completedResult: this.completedResultDetails,
    };
  }
}

