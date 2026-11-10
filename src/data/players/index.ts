/**
 * WICKET DYNASTY - Master 320-Player Database Registry
 */
import { Player } from '../../types/player';
import { INDIAN_CAPPED_PLAYERS } from './indianCapped';
import { INDIAN_UNCAPPED_PLAYERS } from './indianUncapped';
import { OVERSEAS_CAPPED_PLAYERS } from './overseasCapped';
import { OVERSEAS_UNCAPPED_PLAYERS } from './overseasUncapped';
import { auditPlayerDatabase } from '../../utils/playerValidator';

export const PLAYERS_DATABASE: Player[] = [
  ...INDIAN_CAPPED_PLAYERS,
  ...INDIAN_UNCAPPED_PLAYERS,
  ...OVERSEAS_CAPPED_PLAYERS,
  ...OVERSEAS_UNCAPPED_PLAYERS,
];

// Perform runtime integrity verification
export const DATABASE_AUDIT = auditPlayerDatabase(PLAYERS_DATABASE);

if (!DATABASE_AUDIT.verificationPassed) {
  console.warn('Wicket Dynasty Player Database Audit Notice:', DATABASE_AUDIT.errors);
}

export {
  INDIAN_CAPPED_PLAYERS,
  INDIAN_UNCAPPED_PLAYERS,
  OVERSEAS_CAPPED_PLAYERS,
  OVERSEAS_UNCAPPED_PLAYERS,
};
