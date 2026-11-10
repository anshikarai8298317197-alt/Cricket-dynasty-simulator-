/**
 * WICKET DYNASTY - 40 Overseas Uncapped Players
 * 20 Verified Real Overseas Uncapped Stars + 20 Fictional Global Prodigies
 */
import { Player } from '../../types/player';
import { createPlayer } from './builder';

// 20 Verified Real Overseas Uncapped Players (REAL_0281 - REAL_0300)
const REAL_OVERSEAS_UNCAPPED: Player[] = [
  { id: 'REAL_0281', name: 'Jake Fraser-McGurk', shortName: 'J. Fraser-McGurk', age: 22, nat: 'AUS', fran: 'DC', role: 'Opening Batter' as const, bat: 89, bowl: 40, ovr: 88, pot: 96 },
  { id: 'REAL_0282', name: 'Dewald Brevis', shortName: 'D. Brevis', age: 21, nat: 'SA', fran: 'CSK', role: 'Top-order Batter' as const, bat: 85, bowl: 65, ovr: 84, pot: 95 },
  { id: 'REAL_0283', name: 'Kwena Maphaka', shortName: 'K. Maphaka', age: 18, nat: 'SA', fran: 'RR', role: 'Express Fast Bowler' as const, bat: 30, bowl: 86, ovr: 84, pot: 97 },
  { id: 'REAL_0284', name: 'Allah Ghazanfar', shortName: 'A. Ghazanfar', age: 18, nat: 'AFG', fran: 'MI', role: 'Off Spinner' as const, bat: 45, bowl: 86, ovr: 85, pot: 96 },
  { id: 'REAL_0285', name: 'Nandre Burger', shortName: 'N. Burger', age: 29, nat: 'SA', fran: 'RR', role: 'Express Fast Bowler' as const, bat: 35, bowl: 87, ovr: 86, pot: 89 },
  { id: 'REAL_0286', name: 'Matthew Breetzke', shortName: 'M. Breetzke', age: 26, nat: 'SA', fran: 'LSG', role: 'Top-order Batter' as const, bat: 83, bowl: 30, ovr: 82, pot: 89 },
  { id: 'REAL_0287', name: 'Lance Morris', shortName: 'L. Morris', age: 26, nat: 'AUS', fran: 'GT', role: 'Express Fast Bowler' as const, bat: 35, bowl: 85, ovr: 84, pot: 90 },
  { id: 'REAL_0288', name: 'Corbin Bosch', shortName: 'C. Bosch', age: 30, nat: 'SA', fran: 'RR', role: 'Pace All-rounder' as const, bat: 78, bowl: 82, ovr: 81, pot: 84 },
  { id: 'REAL_0289', name: 'Bevon Jacobs', shortName: 'B. Jacobs', age: 23, nat: 'NZ', fran: 'MI', role: 'Finisher' as const, bat: 81, bowl: 35, ovr: 80, pot: 89 },
  { id: 'REAL_0290', name: 'Aaron Hardie', shortName: 'A. Hardie', age: 26, nat: 'AUS', fran: 'PBKS', role: 'Pace All-rounder' as const, bat: 82, bowl: 82, ovr: 82, pot: 89 },
  { id: 'REAL_0291', name: 'Donovan Ferreira', shortName: 'D. Ferreira', age: 26, nat: 'SA', fran: 'DC', role: 'Finisher' as const, bat: 82, bowl: 65, ovr: 81, pot: 88 },
  { id: 'REAL_0292', name: 'Brydon Carse', shortName: 'B. Carse', age: 29, nat: 'ENG', fran: 'SRH', role: 'Fast Bowler' as const, bat: 65, bowl: 84, ovr: 83, pot: 86 },
  { id: 'REAL_0293', name: 'Waqar Salamkheil', shortName: 'W. Salamkheil', age: 23, nat: 'AFG', fran: 'CSK', role: 'Wrist Spinner' as const, bat: 35, bowl: 84, ovr: 83, pot: 91 },
  { id: 'REAL_0294', name: 'Ottneil Baartman', shortName: 'O. Baartman', age: 31, nat: 'SA', fran: 'DC', role: 'Death-over Specialist' as const, bat: 35, bowl: 85, ovr: 84, pot: 85 },
  { id: 'REAL_0295', name: 'Jacob Bethell', shortName: 'J. Bethell', age: 21, nat: 'ENG', fran: 'RCB', role: 'Spin All-rounder' as const, bat: 84, bowl: 80, ovr: 83, pot: 94 },
  { id: 'REAL_0296', name: 'Dan Mousley', shortName: 'D. Mousley', age: 23, nat: 'ENG', fran: 'MI', role: 'Batting All-rounder' as const, bat: 82, bowl: 78, ovr: 81, pot: 90 },
  { id: 'REAL_0297', name: 'Treveen Mathew', shortName: 'T. Mathew', age: 20, nat: 'SL', fran: 'KKR', role: 'Off Spinner' as const, bat: 35, bowl: 82, ovr: 80, pot: 91 },
  { id: 'REAL_0298', name: 'Duan Jansen', shortName: 'D. Jansen', age: 24, nat: 'SA', fran: 'MI', role: 'Fast-Medium Bowler' as const, bat: 60, bowl: 83, ovr: 81, pot: 88 },
  { id: 'REAL_0299', name: 'Cooper Connolly', shortName: 'C. Connolly', age: 21, nat: 'AUS', fran: 'PBKS', role: 'Batting All-rounder' as const, bat: 82, bowl: 76, ovr: 81, pot: 92 },
  { id: 'REAL_0300', name: 'Nathan McSweeney', shortName: 'N. McSweeney', age: 25, nat: 'AUS', fran: 'SRH', role: 'Top-order Batter' as const, bat: 83, bowl: 70, ovr: 82, pot: 89 },
].map(p => createPlayer({
  id: p.id, name: p.name, shortName: p.shortName, age: p.age, nationality: p.nat,
  isOverseas: true, isReal: true, isCapped: false, originalFranchiseId: p.fran,
  primaryRole: p.role, battingHand: 'Right Hand',
  bowlingType: p.role.includes('Spin') || p.role.includes('Chinaman') ? 'Off Spin' : (p.role.includes('Fast') || p.role.includes('Medium') ? 'Fast' : 'None'),
  bowlingArm: 'Right Arm',
  bowlingSpeedClass: p.role.includes('Express') ? 'Express (145+ km/h)' : (p.role.includes('Fast') ? 'Fast (138-144 km/h)' : (p.role.includes('Spin') ? 'Slow / Spin (80-105 km/h)' : 'Non-Bowler')),
  isWicketkeeper: p.role.includes('Wicketkeeper'),
  overallRating: p.ovr, potentialRating: p.pot,
  baseAuctionPriceCr: 0.50, salaryExpectationCr: 1.5,
  battingSkill: p.bat, powerSkill: p.bat, bowlingSkill: p.bowl, fieldingSkill: 84, experience: 35,
  stats: { matches: 15, runs: p.bat > 75 ? 380 : 40, highestScore: p.bat > 75 ? 84 : 18, battingAverage: 30.0, strikeRate: 155.0, wickets: p.bowl > 75 ? 16 : 0, bestBowling: '3/15', economy: 8.4 }
}));

// 20 Original Fictional Overseas Prodigies (FICTIONAL_0026 - FICTIONAL_0045)
const FICTIONAL_OVERSEAS_UNCAPPED: Player[] = [
  { id: 'FICTIONAL_0026', name: 'Lucas Sterling', shortName: 'L. Sterling', age: 20, nat: 'ENG', role: 'Opening Batter' as const, bat: 82, bowl: 30, ovr: 81, pot: 93 },
  { id: 'FICTIONAL_0027', name: 'Callum Vance', shortName: 'C. Vance', age: 19, nat: 'AUS', role: 'Express Fast Bowler' as const, bat: 35, bowl: 84, ovr: 82, pot: 95 },
  { id: 'FICTIONAL_0028', name: 'Jandre van Dyk', shortName: 'J. van Dyk', age: 21, nat: 'SA', role: 'Pace All-rounder' as const, bat: 80, bowl: 81, ovr: 81, pot: 91 },
  { id: 'FICTIONAL_0029', name: 'Kaelen Thorne', shortName: 'K. Thorne', age: 22, nat: 'NZ', role: 'Middle-order Batter' as const, bat: 81, bowl: 40, ovr: 80, pot: 89 },
  { id: 'FICTIONAL_0030', name: 'Malik Al-Hassan', shortName: 'M. Al-Hassan', age: 19, nat: 'AFG', role: 'Leg Spinner' as const, bat: 40, bowl: 83, ovr: 81, pot: 94 },
  { id: 'FICTIONAL_0031', name: 'Darnell St. Clair', shortName: 'D. St. Clair', age: 21, nat: 'WI', role: 'Finisher' as const, bat: 83, bowl: 35, ovr: 82, pot: 92 },
  { id: 'FICTIONAL_0032', name: 'Flynn O’Connor', shortName: 'F. O’Connor', age: 20, nat: 'AUS', role: 'Wicketkeeper Batter' as const, bat: 80, bowl: 30, ovr: 79, pot: 91 },
  { id: 'FICTIONAL_0033', name: 'Rupert Finch', shortName: 'R. Finch', age: 22, nat: 'ENG', role: 'Swing Bowler' as const, bat: 40, bowl: 82, ovr: 80, pot: 89 },
  { id: 'FICTIONAL_0034', name: 'Eben Bester', shortName: 'E. Bester', age: 20, nat: 'SA', role: 'Fast Bowler' as const, bat: 35, bowl: 82, ovr: 80, pot: 92 },
  { id: 'FICTIONAL_0035', name: 'Tariq Shinwari', shortName: 'T. Shinwari', age: 18, nat: 'AFG', role: 'Wrist Spinner' as const, bat: 35, bowl: 82, ovr: 80, pot: 95 },
  { id: 'FICTIONAL_0036', name: 'Kasun Bandara', shortName: 'K. Bandara', age: 21, nat: 'SL', role: 'Spin All-rounder' as const, bat: 78, bowl: 81, ovr: 80, pot: 90 },
  { id: 'FICTIONAL_0037', name: 'Brody MacIntyre', shortName: 'B. MacIntyre', age: 22, nat: 'AUS', role: 'Death-over Specialist' as const, bat: 35, bowl: 82, ovr: 80, pot: 90 },
  { id: 'FICTIONAL_0038', name: 'Oliver Hayes', shortName: 'O. Hayes', age: 20, nat: 'ENG', role: 'Top-order Batter' as const, bat: 81, bowl: 30, ovr: 80, pot: 92 },
  { id: 'FICTIONAL_0039', name: 'Keanu Braithwaite', shortName: 'K. Braithwaite', age: 23, nat: 'WI', role: 'Fast-Medium Bowler' as const, bat: 45, bowl: 81, ovr: 79, pot: 88 },
  { id: 'FICTIONAL_0040', name: 'Nico Pretorius', shortName: 'N. Pretorius', age: 21, nat: 'SA', role: 'Wicketkeeper Batter' as const, bat: 79, bowl: 30, ovr: 78, pot: 90 },
  { id: 'FICTIONAL_0041', name: 'Asher Drummond', shortName: 'A. Drummond', age: 20, nat: 'NZ', role: 'Left-arm Orthodox Spinner' as const, bat: 55, bowl: 81, ovr: 79, pot: 91 },
  { id: 'FICTIONAL_0042', name: 'Zachary Cole', shortName: 'Z. Cole', age: 22, nat: 'AUS', role: 'Opening Batter' as const, bat: 81, bowl: 30, ovr: 80, pot: 90 },
  { id: 'FICTIONAL_0043', name: 'Gareth Beaumont', shortName: 'G. Beaumont', age: 23, nat: 'ENG', role: 'Pace All-rounder' as const, bat: 79, bowl: 80, ovr: 80, pot: 88 },
  { id: 'FICTIONAL_0044', name: 'Hanno Visser', shortName: 'H. Visser', age: 19, nat: 'SA', role: 'Express Fast Bowler' as const, bat: 35, bowl: 83, ovr: 81, pot: 94 },
  { id: 'FICTIONAL_0045', name: 'Dillon Rochester', shortName: 'D. Rochester', age: 22, nat: 'WI', role: 'Finisher' as const, bat: 82, bowl: 35, ovr: 81, pot: 91 },
].map(p => createPlayer({
  id: p.id, name: p.name, shortName: p.shortName, age: p.age, nationality: p.nat,
  isOverseas: true, isReal: false, isCapped: false, originalFranchiseId: null,
  primaryRole: p.role, battingHand: 'Right Hand',
  bowlingType: p.role.includes('Spin') || p.role.includes('Orthodox') ? 'Off Spin' : (p.role.includes('Fast') || p.role.includes('Medium') ? 'Fast' : 'None'),
  bowlingArm: 'Right Arm',
  bowlingSpeedClass: p.role.includes('Express') ? 'Express (145+ km/h)' : (p.role.includes('Fast') ? 'Fast (138-144 km/h)' : (p.role.includes('Spin') ? 'Slow / Spin (80-105 km/h)' : 'Non-Bowler')),
  isWicketkeeper: p.role.includes('Wicketkeeper'),
  overallRating: p.ovr, potentialRating: p.pot,
  baseAuctionPriceCr: 0.50, salaryExpectationCr: 0.50,
  battingSkill: p.bat, powerSkill: p.bat, bowlingSkill: p.bowl, fieldingSkill: 82, experience: 20,
  stats: { matches: 8, runs: p.bat > 75 ? 180 : 20, highestScore: p.bat > 75 ? 54 : 12, battingAverage: 25.0, strikeRate: 140.0, wickets: p.bowl > 75 ? 9 : 0, bestBowling: '3/20', economy: 8.3 }
}));

export const OVERSEAS_UNCAPPED_PLAYERS: Player[] = [
  ...REAL_OVERSEAS_UNCAPPED,
  ...FICTIONAL_OVERSEAS_UNCAPPED
];
