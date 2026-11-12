/**
 * WICKET DYNASTY - Master 320-Player Database Registry
 */
import { Player } from '../../types/player';
import { MASTER_PLAYERS_LIST, MASTER_AUCTION_LOTS, MASTER_PLAYERS_MAP, buildAuthoritativeAuctionSchedule } from './masterDatabase';
import { INDIAN_CAPPED_PLAYERS } from './indianCapped';
import { INDIAN_UNCAPPED_PLAYERS } from './indianUncapped';
import { OVERSEAS_CAPPED_PLAYERS } from './overseasCapped';
import { OVERSEAS_UNCAPPED_PLAYERS } from './overseasUncapped';
import { auditPlayerDatabase } from '../../utils/playerValidator';

export const PLAYERS_DATABASE: Player[] = MASTER_PLAYERS_LIST;

// Perform runtime integrity verification on master database
export const DATABASE_AUDIT = auditPlayerDatabase(PLAYERS_DATABASE);

if (!DATABASE_AUDIT.verificationPassed) {
  console.warn('Wicket Dynasty Player Database Audit Notice:', DATABASE_AUDIT.errors);
}

export {
  MASTER_PLAYERS_LIST,
  MASTER_AUCTION_LOTS,
  MASTER_PLAYERS_MAP,
  buildAuthoritativeAuctionSchedule,
  INDIAN_CAPPED_PLAYERS,
  INDIAN_UNCAPPED_PLAYERS,
  OVERSEAS_CAPPED_PLAYERS,
  OVERSEAS_UNCAPPED_PLAYERS,
};

