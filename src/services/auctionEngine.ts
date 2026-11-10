/**
 * WICKET DYNASTY - Live Auction Simulation Engine
 * Phase 02 Architecture
 */
import { Player, RatingTier } from '../types/player';
import { FRANCHISES } from '../data/franchises';
import {
  AuctionLot,
  AuctionSetCategory,
  AuctionState,
  AuctionTransaction,
  FranchiseAuctionState,
  LotStatus,
} from '../types/auction';

export class AuctionEngine {
  /**
   * Calculate next valid bid increment based on price brackets
   */
  static getNextBidIncrement(currentBidCr: number): number {
    if (currentBidCr < 1.0) return 0.05;
    if (currentBidCr < 2.0) return 0.10;
    if (currentBidCr < 5.0) return 0.20;
    return 0.25;
  }

  /**
   * Calculate maximum allowable bid ceiling for a cricketer to prevent infinite price inflation
   */
  static getMaxBidLimit(player: Player): number {
    let tierCeiling = 25.0; // Diamond default
    if (player.ratingTier === 'Diamond' || player.overallRating >= 88) {
      tierCeiling = 25.0;
    } else if (player.ratingTier === 'Gold' || player.overallRating >= 80) {
      tierCeiling = 16.0;
    } else if (player.ratingTier === 'Silver' || player.overallRating >= 72) {
      tierCeiling = 8.0;
    } else {
      tierCeiling = 4.0;
    }

    // Multiply base price limit safeguard
    const baseMultiplierCap = Math.max(tierCeiling, Number((player.contract.baseAuctionPriceCr * 8).toFixed(2)));
    return Math.min(25.0, baseMultiplierCap);
  }

  /**
   * Determine exact specialist set category for any cricketer
   */
  static categorizePlayer(player: Player): AuctionSetCategory {
    const role = player.primaryRole;
    const isUncapped = !player.isCapped;

    if (role === 'Wicketkeeper Batter') {
      if (isUncapped) return 'Uncapped Wicketkeepers';
      if (player.overallRating >= 90) return 'Elite Wicketkeepers';
      return 'Batting Wicketkeepers';
    }

    if (role === 'Opening Batter') {
      if (isUncapped) return 'Uncapped Batting Prospects';
      if (player.batting.power >= 90) return 'Aggressive Openers';
      return 'Elite Top-order Batters';
    }

    if (role === 'Top-order Batter') {
      if (isUncapped) return 'Uncapped Batting Prospects';
      return 'Elite Top-order Batters';
    }

    if (role === 'Middle-order Batter') {
      if (isUncapped) return 'Uncapped Batting Prospects';
      return 'Middle-order Batters';
    }

    if (role === 'Finisher') {
      return 'Finishers';
    }

    if (role === 'Batting All-rounder') return 'Batting All-rounders';
    if (role === 'Bowling All-rounder') return 'Bowling All-rounders';
    if (role === 'Pace All-rounder') return 'Pace All-rounders';
    if (role === 'Spin All-rounder') return 'Spin All-rounders';

    if (role === 'Express Fast Bowler') return 'Express Fast Bowlers';
    if (role === 'Fast Bowler') return 'Fast Bowlers';
    if (role === 'Fast-Medium Bowler') return 'Fast-Medium Bowlers';
    if (role === 'Swing Bowler') return 'Swing Specialists';
    if (role === 'Death-over Specialist') return 'Death-over Specialists';

    if (role === 'Leg Spinner') return 'Leg Spinners';
    if (role === 'Off Spinner') return 'Off Spinners';
    if (role === 'Left-arm Orthodox Spinner') return 'Left-arm Orthodox Spinners';
    if (role === 'Wrist Spinner') return 'Wrist Spinners';

    return isUncapped ? 'Uncapped Spin Prospects' : 'Middle-order Batters';
  }

  /**
   * Group and sequence all auction pool players into ordered auction sets
   */
  static generateAuctionLots(availablePlayers: Player[]): AuctionLot[] {
    const setOrder: AuctionSetCategory[] = [
      'Elite Top-order Batters',
      'Express Fast Bowlers',
      'Elite Wicketkeepers',
      'Batting All-rounders',
      'Spin All-rounders',
      'Pace All-rounders',
      'Death-over Specialists',
      'Leg Spinners',
      'Aggressive Openers',
      'Fast Bowlers',
      'Batting Wicketkeepers',
      'Swing Specialists',
      'Off Spinners',
      'Wrist Spinners',
      'Middle-order Batters',
      'Finishers',
      'Fast-Medium Bowlers',
      'Left-arm Orthodox Spinners',
      'Uncapped Batting Prospects',
      'Uncapped Wicketkeepers',
      'Uncapped Spin Prospects',
    ];

    const lots: AuctionLot[] = [];
    let lotNumber = 1;

    // Process set by set
    for (const setCat of setOrder) {
      const setPlayers = availablePlayers.filter(p => this.categorizePlayer(p) === setCat);

      // Sort within set: Diamond first, then Gold, then Silver, then Bronze
      setPlayers.sort((a, b) => b.overallRating - a.overallRating);

      for (const player of setPlayers) {
        lots.push({
          lotNumber: lotNumber++,
          player,
          category: setCat,
          tier: player.ratingTier,
          basePriceCr: player.contract.baseAuctionPriceCr,
          currentBidCr: player.contract.baseAuctionPriceCr,
          currentHighestBidderId: null,
          status: 'PENDING',
          bidHistory: [],
        });
      }
    }

    return lots;
  }

  /**
   * Initialize franchise states for all 10 teams
   */
  static initializeFranchiseStates(
    userFranchiseId: string,
    initialRetentions: Record<string, string[]> = {},
    retentionCosts: Record<string, number> = {}
  ): Record<string, FranchiseAuctionState> {
    const states: Record<string, FranchiseAuctionState> = {};

    for (const franchise of FRANCHISES) {
      const retained = initialRetentions[franchise.id] || [];
      const spentOnRetentions = retentionCosts[franchise.id] || 0;
      const purseRemaining = Math.max(0, franchise.startingPurseCr - spentOnRetentions);

      states[franchise.id] = {
        franchiseId: franchise.id,
        purseRemainingCr: purseRemaining,
        rosterPlayerIds: [...retained],
        retainedPlayerIds: [...retained],
        rtmCardsRemaining: retained.length >= 5 ? 1 : 2,
        totalSpentCr: spentOnRetentions,
        aiPersona: {
          aggression: franchise.id === 'MI' || franchise.id === 'SRH' ? 9 : (franchise.id === 'CSK' ? 6 : 7),
          youthBias: franchise.id === 'RR' || franchise.id === 'GT' ? 9 : 6,
          overseasTarget: 8,
          targetRoles: {
            Batters: 6,
            Keepers: 2,
            AllRounders: 5,
            Pace: 7,
            Spin: 5,
          },
        },
      };
    }

    return states;
  }

  /**
   * AI Franchise Bidding Decision Engine
   * Evaluates if any active AI franchise wants to bid on the current lot
   */
  static evaluateAiBid(
    lot: AuctionLot,
    currentBidCr: number,
    currentLeaderId: string | null,
    franchiseStates: Record<string, FranchiseAuctionState>,
    userFranchiseId: string,
    allPlayersMap: Record<string, Player>,
    withdrawnFranchiseIds: string[] = [],
    maxBidLimit?: number
  ): { franchiseId: string; bidAmountCr: number } | null {
    const limit = maxBidLimit || this.getMaxBidLimit(lot.player);
    const nextInc = this.getNextBidIncrement(currentBidCr);
    const candidateBidCr = Number((currentBidCr + nextInc).toFixed(2));

    // Never exceed the maximum bid limit
    if (candidateBidCr > limit) return null;

    // Candidates: all 9 AI franchises that aren't currently leading and haven't withdrawn
    const aiCandidates = Object.values(franchiseStates).filter(
      f =>
        f.franchiseId !== userFranchiseId &&
        f.franchiseId !== currentLeaderId &&
        !withdrawnFranchiseIds.includes(f.franchiseId)
    );

    let bestBidder: FranchiseAuctionState | null = null;
    let highestDesire = 0;

    for (const f of aiCandidates) {
      // 1. Squad size constraint (max 25)
      if (f.rosterPlayerIds.length >= 25) continue;

      // 2. Overseas constraint (max 8)
      if (lot.player.isOverseas) {
        const currentOverseas = f.rosterPlayerIds.filter(id => allPlayersMap[id]?.isOverseas).length;
        if (currentOverseas >= 8) continue;
      }

      // 3. Minimum purse preservation to reach 18 players
      const neededForMin18 = Math.max(0, 18 - (f.rosterPlayerIds.length + 1));
      const minReserve = neededForMin18 * 0.30;
      if (f.purseRemainingCr - candidateBidCr < minReserve) continue;

      // 4. Role need calculation
      const squadRoles = f.rosterPlayerIds.map(id => allPlayersMap[id]?.primaryRole || '');
      const hasWicketkeeper = squadRoles.some(r => r.includes('Wicketkeeper'));
      const paceCount = squadRoles.filter(r => r.includes('Fast') || r.includes('Pace') || r.includes('Swing')).length;
      const spinCount = squadRoles.filter(r => r.includes('Spin')).length;
      const batterCount = squadRoles.filter(r => r.includes('Batter') || r.includes('Opener')).length;

      let roleNeedMultiplier = 1.0;
      if (lot.player.isWicketkeeper && !hasWicketkeeper) roleNeedMultiplier = 2.4;
      else if (lot.player.primaryRole.includes('Fast') && paceCount < 4) roleNeedMultiplier = 1.5;
      else if (lot.player.primaryRole.includes('Spin') && spinCount < 3) roleNeedMultiplier = 1.4;
      else if (lot.player.primaryRole.includes('Batter') && batterCount < 4) roleNeedMultiplier = 1.3;

      // 5. Ceiling Price for this player
      let maxValuation = lot.basePriceCr * 1.5;
      if (lot.tier === 'Diamond') {
        maxValuation = Math.max(12.0, (lot.player.overallRating - 85) * 2.2);
      } else if (lot.tier === 'Gold') {
        maxValuation = Math.max(5.0, (lot.player.overallRating - 78) * 1.4);
      } else if (lot.tier === 'Silver') {
        maxValuation = Math.max(2.0, (lot.player.overallRating - 70) * 0.8);
      } else {
        maxValuation = Math.max(0.5, lot.basePriceCr * 1.2);
      }

      // Adjust with franchise aggression and role need
      const adjustedCeiling = Math.min(limit, maxValuation * (f.aiPersona.aggression / 7) * roleNeedMultiplier);

      if (candidateBidCr <= adjustedCeiling && candidateBidCr <= f.purseRemainingCr) {
        // Desire score with random jitter to create realistic bidding wars
        const desireScore = (adjustedCeiling - candidateBidCr) * (0.8 + Math.random() * 0.4);
        if (desireScore > highestDesire) {
          highestDesire = desireScore;
          bestBidder = f;
        }
      }
    }

    if (bestBidder && highestDesire > 0.4) {
      return {
        franchiseId: bestBidder.franchiseId,
        bidAmountCr: candidateBidCr,
      };
    }

    return null;
  }

  /**
   * Generates dynamic broadcast-style auction room commentary
   */
  static generateAiCommentary(
    bidderId: string,
    playerName: string,
    bidAmountCr: number,
    previousBidderId?: string | null
  ): string {
    const templates = [
      `${bidderId} wants a piece of this too.`,
      `${bidderId} raises the paddle with determination!`,
      `${bidderId} pushes the bid to ₹${bidAmountCr.toFixed(2)} Cr!`,
      previousBidderId
        ? `${bidderId} counters ${previousBidderId}'s bid without hesitation.`
        : `${bidderId} enters the bidding fray with intent!`,
      `Intense bidding for ${playerName} as ${bidderId} steps in!`,
      `${bidderId} signals another raise from the auction table.`,
      `The hammer is challenged as ${bidderId} ups the ante!`,
    ];

    const idx = Math.floor(Math.random() * templates.length);
    return templates[idx];
  }

  /**
   * Fast-forwards background AI bidding between remaining franchises after user passes
   */
  static resolveBackgroundAuction(
    lot: AuctionLot,
    initialBidCr: number,
    initialLeaderId: string | null,
    franchiseStates: Record<string, FranchiseAuctionState>,
    userFranchiseId: string,
    allPlayersMap: Record<string, Player>,
    withdrawnFranchiseIds: string[]
  ): {
    outcome: 'SOLD' | 'UNSOLD';
    winningFranchiseId: string | null;
    finalPriceCr: number;
    updatedStates: Record<string, FranchiseAuctionState>;
    bidHistory: { bidderId: string; amountCr: number; time: string }[];
    unsoldReason?: string;
  } {
    let currentBid = initialBidCr;
    let currentLeader = initialLeaderId;
    const workingStates = JSON.parse(JSON.stringify(franchiseStates)) as Record<string, FranchiseAuctionState>;
    const history: { bidderId: string; amountCr: number; time: string }[] = [];
    const activeWithdrawn = new Set<string>(withdrawnFranchiseIds);
    activeWithdrawn.add(userFranchiseId);

    const maxLimit = this.getMaxBidLimit(lot.player);
    let consecutivePasses = 0;
    const maxIterations = 40; // safeguard

    for (let i = 0; i < maxIterations; i++) {
      if (currentBid >= maxLimit) break;

      const aiBid = this.evaluateAiBid(
        lot,
        currentBid,
        currentLeader,
        workingStates,
        userFranchiseId,
        allPlayersMap,
        Array.from(activeWithdrawn),
        maxLimit
      );

      if (aiBid) {
        currentBid = aiBid.bidAmountCr;
        currentLeader = aiBid.franchiseId;
        consecutivePasses = 0;
        history.push({
          bidderId: aiBid.franchiseId,
          amountCr: currentBid,
          time: 'AI Auto-bid',
        });
      } else {
        consecutivePasses++;
        if (consecutivePasses >= 2) {
          // No more AI bids
          break;
        }
      }
    }

    if (currentLeader) {
      // Sold! Deduct purse exactly once and add to roster
      const winner = workingStates[currentLeader];
      winner.purseRemainingCr = Number((winner.purseRemainingCr - currentBid).toFixed(2));
      winner.rosterPlayerIds.push(lot.player.id);
      winner.totalSpentCr = Number((winner.totalSpentCr + currentBid).toFixed(2));

      return {
        outcome: 'SOLD',
        winningFranchiseId: currentLeader,
        finalPriceCr: currentBid,
        updatedStates: workingStates,
        bidHistory: history,
      };
    } else {
      return {
        outcome: 'UNSOLD',
        winningFranchiseId: null,
        finalPriceCr: lot.basePriceCr,
        updatedStates: workingStates,
        bidHistory: history,
        unsoldReason: 'No franchise placed an opening bid above base price.',
      };
    }
  }
}
