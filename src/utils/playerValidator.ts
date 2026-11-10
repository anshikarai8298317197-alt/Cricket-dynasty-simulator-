/**
 * WICKET DYNASTY - Player Database Validator & Audit Engine
 * Automatic validation checks for all 320 cricketers
 */
import { Player } from '../types/player';
import { DatabaseAuditReport } from '../types/career';

export function auditPlayerDatabase(players: Player[]): DatabaseAuditReport {
  const errors: string[] = [];
  const idSet = new Set<string>();
  const franchiseDistribution: Record<string, number> = {};
  
  let indianCapped = 0;
  let indianUncapped = 0;
  let overseasCapped = 0;
  let overseasUncapped = 0;
  let realCount = 0;
  let fictionalCount = 0;
  let unassignedCount = 0;

  for (const player of players) {
    // 1. Unique ID check
    if (idSet.has(player.id)) {
      errors.push(`Duplicate Player ID detected: ${player.id} (${player.name})`);
    }
    idSet.add(player.id);

    // 2. Real / Fictional check
    if (player.isReal) {
      realCount++;
      if (!player.id.startsWith('REAL_')) {
        errors.push(`Real player ID format mismatch: ${player.id}`);
      }
    } else {
      fictionalCount++;
      if (!player.id.startsWith('FICTIONAL_')) {
        errors.push(`Fictional player ID format mismatch: ${player.id}`);
      }
    }

    // 3. Category classification
    if (!player.isOverseas && player.isCapped) indianCapped++;
    else if (!player.isOverseas && !player.isCapped) indianUncapped++;
    else if (player.isOverseas && player.isCapped) overseasCapped++;
    else if (player.isOverseas && !player.isCapped) overseasUncapped++;

    // 4. Franchise assignment
    if (player.originalFranchiseId) {
      franchiseDistribution[player.originalFranchiseId] = (franchiseDistribution[player.originalFranchiseId] || 0) + 1;
    } else {
      unassignedCount++;
    }

    // 5. Rating validation
    if (player.overallRating < 50 || player.overallRating > 99) {
      errors.push(`Invalid overall rating for ${player.name}: ${player.overallRating}`);
    }
    if (player.potentialRating < player.overallRating && player.age <= 28) {
      errors.push(`Potential cannot be lower than overall for young player ${player.name}`);
    }

    // 6. Age validation
    if (player.age < 17 || player.age > 45) {
      errors.push(`Unrealistic age for ${player.name}: ${player.age}`);
    }

    // 7. Role-specific attribute validation
    if (player.primaryRole.includes('Bowler') || player.primaryRole.includes('All-rounder')) {
      if (player.bowlingType.includes('Fast') || player.bowlingType.includes('Medium')) {
        if (!player.paceBowling) {
          errors.push(`Pace bowler missing paceBowling attributes: ${player.name}`);
        }
      } else if (player.bowlingType.includes('Spin') || player.bowlingType.includes('Orthodox')) {
        if (!player.spinBowling) {
          errors.push(`Spinner missing spinBowling attributes: ${player.name}`);
        }
      }
    }

    if (player.isWicketkeeper && (!player.fielding.wicketkeeping || player.fielding.wicketkeeping < 50)) {
      errors.push(`Wicketkeeper missing valid wicketkeeping rating: ${player.name}`);
    }
  }

  // Distribution validation
  if (players.length !== 320) {
    errors.push(`Expected exactly 320 players, got ${players.length}`);
  }
  if (indianCapped !== 100) {
    errors.push(`Expected 100 Indian Capped players, got ${indianCapped}`);
  }
  if (indianUncapped !== 100) {
    errors.push(`Expected 100 Indian Uncapped players, got ${indianUncapped}`);
  }
  if (overseasCapped !== 80) {
    errors.push(`Expected 80 Overseas Capped players, got ${overseasCapped}`);
  }
  if (overseasUncapped !== 40) {
    errors.push(`Expected 40 Overseas Uncapped players, got ${overseasUncapped}`);
  }

  return {
    totalPlayers: players.length,
    indianCapped,
    indianUncapped,
    overseasCapped,
    overseasUncapped,
    realCount,
    fictionalCount,
    uniqueIdsValid: idSet.size === players.length,
    ratingsValid: errors.filter(e => e.includes('rating')).length === 0,
    roleAttributesValid: errors.filter(e => e.includes('attributes')).length === 0,
    franchiseDistribution,
    unassignedCount,
    verificationPassed: errors.length === 0,
    errors,
  };
}
