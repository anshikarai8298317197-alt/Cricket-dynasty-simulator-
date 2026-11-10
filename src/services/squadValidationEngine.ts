/**
 * WICKET DYNASTY - Central Squad Validation Engine
 * Enforces tournament rules, minimum squad sizes, playing XI eligibility,
 * and empty squad protection across career progression and match starts.
 */
import { CareerSave } from '../types/career';
import { Player } from '../types/player';
import { PLAYERS_DATABASE } from '../data/players';
import { Fixture } from '../types/tournament';

export interface SquadValidationResult {
  isValidForSeason: boolean;
  isValidForMatch: boolean;
  isEmptySquad: boolean;
  errors: string[];
  warnings: string[];
  squadCount: number;
  playingXiCount: number;
  overseasInXiCount: number;
  hasWicketKeeper: boolean;
  hasCaptain: boolean;
  injuredInXi: string[];
}

export class SquadValidationEngine {
  private static playerMap: Record<string, Player> = PLAYERS_DATABASE.reduce(
    (acc, p) => ({ ...acc, [p.id]: p }),
    {}
  );

  /**
   * Validates squad registration before season activation
   */
  static validateSquadForSeason(career: CareerSave): SquadValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const squadIds = career.squadPlayerIds || [];
    const isEmptySquad = squadIds.length === 0;

    if (isEmptySquad) {
      errors.push('YOUR SQUAD IS EMPTY. Complete the Mega Auction and register eligible players before starting the season.');
      return {
        isValidForSeason: false,
        isValidForMatch: false,
        isEmptySquad: true,
        errors,
        warnings,
        squadCount: 0,
        playingXiCount: 0,
        overseasInXiCount: 0,
        hasWicketKeeper: false,
        hasCaptain: false,
        injuredInXi: [],
      };
    }

    const minSquad = career.rules?.squadSizeMin || 15;
    if (squadIds.length < minSquad) {
      errors.push(`Minimum squad size not satisfied. Required: ${minSquad}, Registered: ${squadIds.length}.`);
    }

    // Check overseas limits in squad (max 8)
    const overseasCount = squadIds.filter(id => this.playerMap[id]?.isOverseas).length;
    if (overseasCount > 8) {
      errors.push(`Maximum overseas limit in squad exceeded. Max allowed: 8, Current: ${overseasCount}.`);
    }

    // Check designated wicketkeeper
    const hasWkInSquad = squadIds.some(id => this.playerMap[id]?.isWicketkeeper);
    if (!hasWkInSquad) {
      errors.push('Squad must contain at least one designated wicketkeeper.');
    }

    // Check bowling options
    const bowlersCount = squadIds.filter(id => {
      const p = this.playerMap[id];
      return p && (p.primaryRole.includes('Bowler') || p.primaryRole.includes('All-rounder'));
    }).length;

    if (bowlersCount < 5) {
      errors.push(`Squad must contain at least 5 bowling options. Current: ${bowlersCount}.`);
    }

    return {
      isValidForSeason: errors.length === 0,
      isValidForMatch: false, // Match requires playing XI check
      isEmptySquad: false,
      errors,
      warnings,
      squadCount: squadIds.length,
      playingXiCount: career.playingXiIds?.length || 0,
      overseasInXiCount: (career.playingXiIds || []).filter(id => this.playerMap[id]?.isOverseas).length,
      hasWicketKeeper: hasWkInSquad,
      hasCaptain: !!career.captainId,
      injuredInXi: [],
    };
  }

  /**
   * Validates Playing XI before starting any live match
   */
  static validateSquadForMatch(career: CareerSave, fixture?: Fixture): SquadValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const injuredInXi: string[] = [];

    const squadIds = career.squadPlayerIds || [];
    if (squadIds.length === 0) {
      errors.push('YOUR SQUAD IS EMPTY. You cannot start a match without registered players.');
      return {
        isValidForSeason: false,
        isValidForMatch: false,
        isEmptySquad: true,
        errors,
        warnings,
        squadCount: 0,
        playingXiCount: 0,
        overseasInXiCount: 0,
        hasWicketKeeper: false,
        hasCaptain: false,
        injuredInXi: [],
      };
    }

    const xiIds = career.playingXiIds || [];

    // 1. Exactly 11 players
    if (xiIds.length !== 11) {
      errors.push(`Playing XI must contain exactly 11 players. Currently selected: ${xiIds.length}.`);
    }

    // 2. No duplicates
    const uniqueIds = new Set(xiIds);
    if (uniqueIds.size !== xiIds.length) {
      errors.push('Playing XI contains duplicate player selections.');
    }

    // 3. All 11 players must belong to the registered squad
    const invalidPlayers = xiIds.filter(id => !squadIds.includes(id));
    if (invalidPlayers.length > 0) {
      errors.push('One or more selected players in your Playing XI do not belong to your registered franchise squad.');
    }

    // 4. Overseas restriction: Maximum 4 in Playing XI
    const overseasInXi = xiIds.filter(id => this.playerMap[id]?.isOverseas).length;
    if (overseasInXi > 4) {
      errors.push(`Maximum 4 overseas players allowed in Playing XI. Currently selected: ${overseasInXi}.`);
    }

    // 5. Must have at least one designated wicketkeeper in XI
    const hasWicketkeeperInXi = xiIds.some(
      id => this.playerMap[id]?.isWicketkeeper || id === career.wicketKeeperId
    );
    if (!hasWicketkeeperInXi) {
      errors.push('Playing XI must contain at least one designated wicketkeeper.');
    }

    // 6. Must have at least 5 bowling options in XI
    const bowlingOptionsInXi = xiIds.filter(id => {
      const p = this.playerMap[id];
      return p && (p.primaryRole.includes('Bowler') || p.primaryRole.includes('All-rounder'));
    }).length;
    if (bowlingOptionsInXi < 5) {
      errors.push(`Playing XI must have at least 5 bowling options. Currently selected: ${bowlingOptionsInXi}.`);
    }

    // 7. Check for injured players in XI
    xiIds.forEach(id => {
      const workload = career.playerWorkloads?.[id];
      if (workload?.isInjured) {
        const p = this.playerMap[id];
        const name = p ? p.name : id;
        injuredInXi.push(name);
        errors.push(`Injured player ${name} cannot be included in the Playing XI.`);
      }
    });

    return {
      isValidForSeason: true,
      isValidForMatch: errors.length === 0,
      isEmptySquad: false,
      errors,
      warnings,
      squadCount: squadIds.length,
      playingXiCount: xiIds.length,
      overseasInXiCount: overseasInXi,
      hasWicketKeeper: hasWicketkeeperInXi,
      hasCaptain: !!career.captainId && xiIds.includes(career.captainId),
      injuredInXi,
    };
  }

  /**
   * Auction Completion Guard: Blocks completing the auction if user has not purchased enough players
   */
  static canCompleteAuction(
    userRosterPlayerIds: string[],
    userPurseRemainingCr: number
  ): { canComplete: boolean; errors: string[] } {
    const errors: string[] = [];

    if (userRosterPlayerIds.length === 0) {
      errors.push('YOUR SQUAD IS EMPTY. You have not purchased any players in the auction.');
      return { canComplete: false, errors };
    }

    if (userRosterPlayerIds.length < 15) {
      errors.push(`Minimum squad size of 15 players is required. Currently acquired: ${userRosterPlayerIds.length}.`);
    }

    const wkCount = userRosterPlayerIds.filter(id => this.playerMap[id]?.isWicketkeeper).length;
    if (wkCount === 0) {
      errors.push('Squad must contain at least one wicketkeeper.');
    }

    const bowlersCount = userRosterPlayerIds.filter(id => {
      const p = this.playerMap[id];
      return p && (p.primaryRole.includes('Bowler') || p.primaryRole.includes('All-rounder'));
    }).length;

    if (bowlersCount < 5) {
      errors.push('Squad must contain at least 5 bowling options.');
    }

    return {
      canComplete: errors.length === 0,
      errors,
    };
  }
}
