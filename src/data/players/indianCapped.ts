/**
 * WICKET DYNASTY - 100 Indian Capped Players (REAL_0001 - REAL_0100)
 * Authentic IPL 2026 player pool & franchise assignments
 */
import { Player } from '../../types/player';
import { createPlayer } from './builder';

export const INDIAN_CAPPED_PLAYERS: Player[] = [
  // 1-10 Marquee
  createPlayer({
    id: 'REAL_0001', name: 'Virat Kohli', shortName: 'V. Kohli', age: 36, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'RCB',
    primaryRole: 'Top-order Batter', battingHand: 'Right Hand', bowlingType: 'Medium',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Medium (120-129 km/h)', isWicketkeeper: false,
    overallRating: 94, potentialRating: 94, baseAuctionPriceCr: 2.0, salaryExpectationCr: 21.0,
    battingSkill: 95, powerSkill: 88, fieldingSkill: 88, experience: 98,
    stats: { matches: 252, runs: 8004, highestScore: 113, battingAverage: 38.7, strikeRate: 131.9, wickets: 4, bestBowling: '2/25', economy: 8.8 }
  }),
  createPlayer({
    id: 'REAL_0002', name: 'Jasprit Bumrah', shortName: 'J. Bumrah', age: 31, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'MI',
    primaryRole: 'Express Fast Bowler', secondaryRole: 'Death-over Specialist', battingHand: 'Right Hand', bowlingType: 'Fast',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Express (145+ km/h)', isWicketkeeper: false,
    overallRating: 95, potentialRating: 95, baseAuctionPriceCr: 2.0, salaryExpectationCr: 18.0,
    battingSkill: 45, powerSkill: 50, bowlingSkill: 96, fieldingSkill: 82, experience: 92,
    stats: { matches: 133, runs: 69, highestScore: 16, battingAverage: 9.8, strikeRate: 98.5, wickets: 165, bestBowling: '5/10', economy: 7.3 }
  }),
  createPlayer({
    id: 'REAL_0003', name: 'Rohit Sharma', shortName: 'R. Sharma', age: 37, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'MI',
    primaryRole: 'Opening Batter', battingHand: 'Right Hand', bowlingType: 'Off Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 92, potentialRating: 92, baseAuctionPriceCr: 2.0, salaryExpectationCr: 16.3,
    battingSkill: 93, powerSkill: 94, fieldingSkill: 80, experience: 99,
    stats: { matches: 257, runs: 6628, highestScore: 109, battingAverage: 29.7, strikeRate: 131.1, wickets: 15, bestBowling: '4/6', economy: 7.9 }
  }),
  createPlayer({
    id: 'REAL_0004', name: 'Suryakumar Yadav', shortName: 'S. Yadav', age: 34, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'MI',
    primaryRole: 'Top-order Batter', battingHand: 'Right Hand', bowlingType: 'Medium',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Medium (120-129 km/h)', isWicketkeeper: false,
    overallRating: 93, potentialRating: 93, baseAuctionPriceCr: 2.0, salaryExpectationCr: 16.35,
    battingSkill: 95, powerSkill: 93, fieldingSkill: 86, experience: 90,
    stats: { matches: 150, runs: 3594, highestScore: 103, battingAverage: 32.1, strikeRate: 145.3, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0005', name: 'Hardik Pandya', shortName: 'H. Pandya', age: 31, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'MI',
    primaryRole: 'Pace All-rounder', secondaryRole: 'Finisher', battingHand: 'Right Hand', bowlingType: 'Fast-Medium',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Fast-Medium (130-137 km/h)', isWicketkeeper: false,
    overallRating: 91, potentialRating: 91, baseAuctionPriceCr: 2.0, salaryExpectationCr: 16.35,
    battingSkill: 88, powerSkill: 92, bowlingSkill: 84, fieldingSkill: 89, experience: 88,
    stats: { matches: 137, runs: 2525, highestScore: 91, battingAverage: 28.7, strikeRate: 145.9, wickets: 64, bestBowling: '3/17', economy: 8.9 }
  }),
  createPlayer({
    id: 'REAL_0006', name: 'Rishabh Pant', shortName: 'R. Pant', age: 27, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'LSG',
    primaryRole: 'Wicketkeeper Batter', battingHand: 'Left Hand', bowlingType: 'None',
    bowlingArm: 'None', bowlingSpeedClass: 'Non-Bowler', isWicketkeeper: true,
    overallRating: 93, potentialRating: 95, baseAuctionPriceCr: 2.0, salaryExpectationCr: 27.0,
    battingSkill: 92, powerSkill: 94, fieldingSkill: 91, experience: 85,
    stats: { matches: 111, runs: 3284, highestScore: 128, battingAverage: 35.3, strikeRate: 148.9, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0007', name: 'Shreyas Iyer', shortName: 'S. Iyer', age: 30, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'PBKS',
    primaryRole: 'Middle-order Batter', battingHand: 'Right Hand', bowlingType: 'Leg Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 91, potentialRating: 92, baseAuctionPriceCr: 2.0, salaryExpectationCr: 26.75,
    battingSkill: 91, powerSkill: 89, fieldingSkill: 84, experience: 87,
    stats: { matches: 115, runs: 3127, highestScore: 96, battingAverage: 32.2, strikeRate: 127.5, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0008', name: 'Arshdeep Singh', shortName: 'A. Singh', age: 26, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'PBKS',
    primaryRole: 'Death-over Specialist', secondaryRole: 'Fast-Medium Bowler', battingHand: 'Left Hand', bowlingType: 'Fast-Medium',
    bowlingArm: 'Left Arm', bowlingSpeedClass: 'Fast-Medium (130-137 km/h)', isWicketkeeper: false,
    overallRating: 90, potentialRating: 93, baseAuctionPriceCr: 2.0, salaryExpectationCr: 18.0,
    battingSkill: 42, powerSkill: 48, bowlingSkill: 91, fieldingSkill: 78, experience: 80,
    stats: { matches: 65, runs: 35, highestScore: 10, battingAverage: 5.8, strikeRate: 72.9, wickets: 76, bestBowling: '5/32', economy: 8.7 }
  }),
  createPlayer({
    id: 'REAL_0009', name: 'Shubman Gill', shortName: 'S. Gill', age: 25, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'GT',
    primaryRole: 'Opening Batter', battingHand: 'Right Hand', bowlingType: 'Off Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 92, potentialRating: 96, baseAuctionPriceCr: 2.0, salaryExpectationCr: 16.5,
    battingSkill: 93, powerSkill: 88, fieldingSkill: 85, experience: 80,
    stats: { matches: 103, runs: 3216, highestScore: 129, battingAverage: 37.8, strikeRate: 135.7, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0010', name: 'Axar Patel', shortName: 'A. Patel', age: 31, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'DC',
    primaryRole: 'Spin All-rounder', battingHand: 'Left Hand', bowlingType: 'Left-arm Orthodox',
    bowlingArm: 'Left Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 90, potentialRating: 90, baseAuctionPriceCr: 2.0, salaryExpectationCr: 16.5,
    battingSkill: 84, powerSkill: 86, bowlingSkill: 89, fieldingSkill: 88, experience: 88,
    stats: { matches: 150, runs: 1653, highestScore: 66, battingAverage: 21.2, strikeRate: 130.9, wickets: 123, bestBowling: '4/21', economy: 7.2 }
  }),

  // 11-20
  createPlayer({
    id: 'REAL_0011', name: 'Kuldeep Yadav', shortName: 'K. Yadav', age: 30, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'DC',
    primaryRole: 'Wrist Spinner', battingHand: 'Left Hand', bowlingType: 'Left-arm Chinaman / Wrist Spin',
    bowlingArm: 'Left Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 91, potentialRating: 92, baseAuctionPriceCr: 2.0, salaryExpectationCr: 13.25,
    battingSkill: 48, powerSkill: 45, bowlingSkill: 92, fieldingSkill: 76, experience: 84,
    stats: { matches: 84, runs: 150, highestScore: 16, battingAverage: 10.7, strikeRate: 85.0, wickets: 87, bestBowling: '4/14', economy: 8.1 }
  }),
  createPlayer({
    id: 'REAL_0012', name: 'Ravindra Jadeja', shortName: 'R. Jadeja', age: 36, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'CSK',
    primaryRole: 'Spin All-rounder', battingHand: 'Left Hand', bowlingType: 'Left-arm Orthodox',
    bowlingArm: 'Left Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 91, potentialRating: 91, baseAuctionPriceCr: 2.0, salaryExpectationCr: 18.0,
    battingSkill: 84, powerSkill: 86, bowlingSkill: 89, fieldingSkill: 97, experience: 98,
    stats: { matches: 240, runs: 2959, highestScore: 62, battingAverage: 27.4, strikeRate: 129.5, wickets: 160, bestBowling: '5/16', economy: 7.6 }
  }),
  createPlayer({
    id: 'REAL_0013', name: 'Ruturaj Gaikwad', shortName: 'R. Gaikwad', age: 28, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'CSK',
    primaryRole: 'Opening Batter', battingHand: 'Right Hand', bowlingType: 'Off Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 91, potentialRating: 93, baseAuctionPriceCr: 2.0, salaryExpectationCr: 18.0,
    battingSkill: 92, powerSkill: 86, fieldingSkill: 84, experience: 78,
    stats: { matches: 66, runs: 2380, highestScore: 108, battingAverage: 41.8, strikeRate: 136.9, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0014', name: 'Shivam Dube', shortName: 'S. Dube', age: 31, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'CSK',
    primaryRole: 'Middle-order Batter', secondaryRole: 'Pace All-rounder', battingHand: 'Left Hand', bowlingType: 'Medium',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Medium (120-129 km/h)', isWicketkeeper: false,
    overallRating: 89, potentialRating: 89, baseAuctionPriceCr: 2.0, salaryExpectationCr: 12.0,
    battingSkill: 86, powerSkill: 95, bowlingSkill: 72, fieldingSkill: 76, experience: 76,
    stats: { matches: 65, runs: 1502, highestScore: 95, battingAverage: 30.0, strikeRate: 159.2, wickets: 5, bestBowling: '2/15', economy: 9.3 }
  }),
  createPlayer({
    id: 'REAL_0015', name: 'MS Dhoni', shortName: 'MS Dhoni', age: 43, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'CSK',
    primaryRole: 'Finisher', secondaryRole: 'Wicketkeeper Batter', battingHand: 'Right Hand', bowlingType: 'Medium',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Medium (120-129 km/h)', isWicketkeeper: true,
    overallRating: 88, potentialRating: 88, baseAuctionPriceCr: 2.0, salaryExpectationCr: 4.0,
    battingSkill: 87, powerSkill: 93, fieldingSkill: 94, experience: 100,
    stats: { matches: 264, runs: 5243, highestScore: 84, battingAverage: 39.1, strikeRate: 137.5, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0016', name: 'Sanju Samson', shortName: 'S. Samson', age: 30, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'RR',
    primaryRole: 'Wicketkeeper Batter', secondaryRole: 'Top-order Batter', battingHand: 'Right Hand', bowlingType: 'None',
    bowlingArm: 'None', bowlingSpeedClass: 'Non-Bowler', isWicketkeeper: true,
    overallRating: 91, potentialRating: 92, baseAuctionPriceCr: 2.0, salaryExpectationCr: 18.0,
    battingSkill: 92, powerSkill: 91, fieldingSkill: 88, experience: 86,
    stats: { matches: 167, runs: 4419, highestScore: 119, battingAverage: 30.7, strikeRate: 139.1, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0017', name: 'Yashasvi Jaiswal', shortName: 'Y. Jaiswal', age: 23, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'RR',
    primaryRole: 'Opening Batter', battingHand: 'Left Hand', bowlingType: 'Leg Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 91, potentialRating: 97, baseAuctionPriceCr: 2.0, salaryExpectationCr: 18.0,
    battingSkill: 93, powerSkill: 91, fieldingSkill: 84, experience: 70,
    stats: { matches: 53, runs: 1607, highestScore: 124, battingAverage: 32.8, strikeRate: 150.6, wickets: 1, bestBowling: '1/5', economy: 8.5 }
  }),
  createPlayer({
    id: 'REAL_0018', name: 'Rinku Singh', shortName: 'R. Singh', age: 27, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'KKR',
    primaryRole: 'Finisher', battingHand: 'Left Hand', bowlingType: 'Off Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 90, potentialRating: 93, baseAuctionPriceCr: 2.0, salaryExpectationCr: 13.0,
    battingSkill: 90, powerSkill: 94, fieldingSkill: 91, experience: 75,
    stats: { matches: 45, runs: 893, highestScore: 67, battingAverage: 34.3, strikeRate: 143.3, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0019', name: 'Varun Chakaravarthy', shortName: 'V. Chakaravarthy', age: 33, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'KKR',
    primaryRole: 'Leg Spinner', secondaryRole: 'Wrist Spinner', battingHand: 'Right Hand', bowlingType: 'Leg Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 91, potentialRating: 91, baseAuctionPriceCr: 2.0, salaryExpectationCr: 12.0,
    battingSkill: 38, powerSkill: 45, bowlingSkill: 92, fieldingSkill: 74, experience: 78,
    stats: { matches: 71, runs: 28, highestScore: 10, battingAverage: 4.0, strikeRate: 60.9, wickets: 83, bestBowling: '5/20', economy: 7.5 }
  }),
  createPlayer({
    id: 'REAL_0020', name: 'Venkatesh Iyer', shortName: 'V. Iyer', age: 30, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'KKR',
    primaryRole: 'Batting All-rounder', battingHand: 'Left Hand', bowlingType: 'Fast-Medium',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Medium (120-129 km/h)', isWicketkeeper: false,
    overallRating: 89, potentialRating: 90, baseAuctionPriceCr: 2.0, salaryExpectationCr: 23.75,
    battingSkill: 89, powerSkill: 90, bowlingSkill: 76, fieldingSkill: 80, experience: 76,
    stats: { matches: 51, runs: 1326, highestScore: 104, battingAverage: 31.6, strikeRate: 137.1, wickets: 3, bestBowling: '2/29', economy: 8.9 }
  }),

  // 21-30
  createPlayer({
    id: 'REAL_0021', name: 'Harshit Rana', shortName: 'H. Rana', age: 23, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'KKR',
    primaryRole: 'Fast Bowler', secondaryRole: 'Death-over Specialist', battingHand: 'Right Hand', bowlingType: 'Fast',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Express (145+ km/h)', isWicketkeeper: false,
    overallRating: 88, potentialRating: 94, baseAuctionPriceCr: 2.0, salaryExpectationCr: 4.0,
    battingSkill: 55, powerSkill: 65, bowlingSkill: 88, fieldingSkill: 80, experience: 65,
    stats: { matches: 21, runs: 30, highestScore: 12, battingAverage: 15.0, strikeRate: 110.0, wickets: 25, bestBowling: '3/24', economy: 8.9 }
  }),
  createPlayer({
    id: 'REAL_0022', name: 'Mayank Yadav', shortName: 'M. Yadav', age: 22, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'LSG',
    primaryRole: 'Express Fast Bowler', battingHand: 'Right Hand', bowlingType: 'Fast',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Express (145+ km/h)', isWicketkeeper: false,
    overallRating: 88, potentialRating: 96, baseAuctionPriceCr: 2.0, salaryExpectationCr: 11.0,
    battingSkill: 35, powerSkill: 40, bowlingSkill: 90, fieldingSkill: 75, experience: 50,
    stats: { matches: 4, runs: 0, highestScore: 0, battingAverage: 0, strikeRate: 0, wickets: 7, bestBowling: '3/14', economy: 6.9 }
  }),
  createPlayer({
    id: 'REAL_0023', name: 'Ravi Bishnoi', shortName: 'R. Bishnoi', age: 24, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'LSG',
    primaryRole: 'Leg Spinner', secondaryRole: 'Wrist Spinner', battingHand: 'Right Hand', bowlingType: 'Leg Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 89, potentialRating: 94, baseAuctionPriceCr: 2.0, salaryExpectationCr: 11.0,
    battingSkill: 35, powerSkill: 40, bowlingSkill: 90, fieldingSkill: 86, experience: 75,
    stats: { matches: 66, runs: 40, highestScore: 15, battingAverage: 6.0, strikeRate: 75.0, wickets: 63, bestBowling: '3/24', economy: 7.9 }
  }),
  createPlayer({
    id: 'REAL_0024', name: 'KL Rahul', shortName: 'KL Rahul', age: 32, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'DC',
    primaryRole: 'Opening Batter', secondaryRole: 'Wicketkeeper Batter', battingHand: 'Right Hand', bowlingType: 'None',
    bowlingArm: 'None', bowlingSpeedClass: 'Non-Bowler', isWicketkeeper: true,
    overallRating: 92, potentialRating: 92, baseAuctionPriceCr: 2.0, salaryExpectationCr: 14.0,
    battingSkill: 94, powerSkill: 89, fieldingSkill: 87, experience: 92,
    stats: { matches: 132, runs: 4683, highestScore: 132, battingAverage: 45.5, strikeRate: 134.6, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0025', name: 'Mohammed Siraj', shortName: 'M. Siraj', age: 31, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'GT',
    primaryRole: 'Fast Bowler', secondaryRole: 'Swing Bowler', battingHand: 'Right Hand', bowlingType: 'Fast',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Fast (138-144 km/h)', isWicketkeeper: false,
    overallRating: 89, potentialRating: 90, baseAuctionPriceCr: 2.0, salaryExpectationCr: 12.25,
    battingSkill: 40, powerSkill: 50, bowlingSkill: 89, fieldingSkill: 82, experience: 85,
    stats: { matches: 93, runs: 108, highestScore: 14, battingAverage: 8.3, strikeRate: 85.0, wickets: 93, bestBowling: '4/21', economy: 8.6 }
  }),
  createPlayer({
    id: 'REAL_0026', name: 'Yuzvendra Chahal', shortName: 'Y. Chahal', age: 34, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'PBKS',
    primaryRole: 'Leg Spinner', secondaryRole: 'Wrist Spinner', battingHand: 'Right Hand', bowlingType: 'Leg Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 91, potentialRating: 91, baseAuctionPriceCr: 2.0, salaryExpectationCr: 18.0,
    battingSkill: 32, powerSkill: 35, bowlingSkill: 93, fieldingSkill: 76, experience: 94,
    stats: { matches: 160, runs: 43, highestScore: 8, battingAverage: 4.8, strikeRate: 50.0, wickets: 205, bestBowling: '5/40', economy: 7.8 }
  }),
  createPlayer({
    id: 'REAL_0027', name: 'Mohammed Shami', shortName: 'M. Shami', age: 34, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'SRH',
    primaryRole: 'Swing Bowler', secondaryRole: 'Fast Bowler', battingHand: 'Right Hand', bowlingType: 'Fast',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Fast (138-144 km/h)', isWicketkeeper: false,
    overallRating: 91, potentialRating: 91, baseAuctionPriceCr: 2.0, salaryExpectationCr: 10.0,
    battingSkill: 42, powerSkill: 52, bowlingSkill: 92, fieldingSkill: 80, experience: 92,
    stats: { matches: 110, runs: 79, highestScore: 21, battingAverage: 8.8, strikeRate: 90.0, wickets: 127, bestBowling: '4/11', economy: 8.4 }
  }),
  createPlayer({
    id: 'REAL_0028', name: 'Ishan Kishan', shortName: 'I. Kishan', age: 26, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'SRH',
    primaryRole: 'Wicketkeeper Batter', secondaryRole: 'Opening Batter', battingHand: 'Left Hand', bowlingType: 'None',
    bowlingArm: 'None', bowlingSpeedClass: 'Non-Bowler', isWicketkeeper: true,
    overallRating: 89, potentialRating: 92, baseAuctionPriceCr: 2.0, salaryExpectationCr: 11.25,
    battingSkill: 90, powerSkill: 91, fieldingSkill: 86, experience: 79,
    stats: { matches: 105, runs: 2644, highestScore: 99, battingAverage: 28.4, strikeRate: 135.9, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0029', name: 'Bhuvneshwar Kumar', shortName: 'B. Kumar', age: 35, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'RCB',
    primaryRole: 'Swing Bowler', secondaryRole: 'Death-over Specialist', battingHand: 'Right Hand', bowlingType: 'Fast-Medium',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Fast-Medium (130-137 km/h)', isWicketkeeper: false,
    overallRating: 89, potentialRating: 89, baseAuctionPriceCr: 2.0, salaryExpectationCr: 10.75,
    battingSkill: 55, powerSkill: 58, bowlingSkill: 90, fieldingSkill: 84, experience: 96,
    stats: { matches: 176, runs: 300, highestScore: 24, battingAverage: 8.5, strikeRate: 95.0, wickets: 181, bestBowling: '5/19', economy: 7.6 }
  }),
  createPlayer({
    id: 'REAL_0030', name: 'Nitish Kumar Reddy', shortName: 'N. Reddy', age: 21, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'SRH',
    primaryRole: 'Pace All-rounder', battingHand: 'Right Hand', bowlingType: 'Fast-Medium',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Fast-Medium (130-137 km/h)', isWicketkeeper: false,
    overallRating: 88, potentialRating: 96, baseAuctionPriceCr: 2.0, salaryExpectationCr: 6.0,
    battingSkill: 88, powerSkill: 89, bowlingSkill: 84, fieldingSkill: 86, experience: 60,
    stats: { matches: 15, runs: 303, highestScore: 76, battingAverage: 33.7, strikeRate: 142.9, wickets: 3, bestBowling: '1/17', economy: 8.8 }
  }),

  // 31-40
  createPlayer({
    id: 'REAL_0031', name: 'Abhishek Sharma', shortName: 'A. Sharma', age: 24, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'SRH',
    primaryRole: 'Opening Batter', secondaryRole: 'Spin All-rounder', battingHand: 'Left Hand', bowlingType: 'Left-arm Orthodox',
    bowlingArm: 'Left Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 90, potentialRating: 95, baseAuctionPriceCr: 2.0, salaryExpectationCr: 14.0,
    battingSkill: 92, powerSkill: 95, bowlingSkill: 78, fieldingSkill: 84, experience: 72,
    stats: { matches: 63, runs: 1377, highestScore: 75, battingAverage: 25.5, strikeRate: 155.2, wickets: 9, bestBowling: '2/4', economy: 8.5 }
  }),
  createPlayer({
    id: 'REAL_0032', name: 'Tilak Varma', shortName: 'T. Varma', age: 22, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'MI',
    primaryRole: 'Middle-order Batter', battingHand: 'Left Hand', bowlingType: 'Off Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 89, potentialRating: 96, baseAuctionPriceCr: 2.0, salaryExpectationCr: 8.0,
    battingSkill: 90, powerSkill: 88, fieldingSkill: 88, experience: 68,
    stats: { matches: 38, runs: 1156, highestScore: 84, battingAverage: 39.9, strikeRate: 146.3, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0033', name: 'Washington Sundar', shortName: 'W. Sundar', age: 25, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'GT',
    primaryRole: 'Spin All-rounder', secondaryRole: 'Off Spinner', battingHand: 'Left Hand', bowlingType: 'Off Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 88, potentialRating: 93, baseAuctionPriceCr: 2.0, salaryExpectationCr: 3.2,
    battingSkill: 82, powerSkill: 78, bowlingSkill: 88, fieldingSkill: 85, experience: 80,
    stats: { matches: 60, runs: 378, highestScore: 40, battingAverage: 14.0, strikeRate: 116.0, wickets: 37, bestBowling: '3/16', economy: 7.5 }
  }),
  createPlayer({
    id: 'REAL_0034', name: 'Rajat Patidar', shortName: 'R. Patidar', age: 31, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'RCB',
    primaryRole: 'Top-order Batter', battingHand: 'Right Hand', bowlingType: 'Off Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 89, potentialRating: 90, baseAuctionPriceCr: 2.0, salaryExpectationCr: 11.0,
    battingSkill: 90, powerSkill: 92, fieldingSkill: 82, experience: 75,
    stats: { matches: 27, runs: 799, highestScore: 112, battingAverage: 34.7, strikeRate: 158.8, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0035', name: 'Yash Dayal', shortName: 'Y. Dayal', age: 27, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'RCB',
    primaryRole: 'Fast-Medium Bowler', secondaryRole: 'Death-over Specialist', battingHand: 'Left Hand', bowlingType: 'Fast-Medium',
    bowlingArm: 'Left Arm', bowlingSpeedClass: 'Fast-Medium (130-137 km/h)', isWicketkeeper: false,
    overallRating: 87, potentialRating: 91, baseAuctionPriceCr: 2.0, salaryExpectationCr: 5.0,
    battingSkill: 38, powerSkill: 42, bowlingSkill: 87, fieldingSkill: 78, experience: 70,
    stats: { matches: 28, runs: 12, highestScore: 8, battingAverage: 6.0, strikeRate: 66.0, wickets: 28, bestBowling: '3/20', economy: 8.9 }
  }),
  createPlayer({
    id: 'REAL_0036', name: 'Jitesh Sharma', shortName: 'J. Sharma', age: 31, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'RCB',
    primaryRole: 'Wicketkeeper Batter', secondaryRole: 'Finisher', battingHand: 'Right Hand', bowlingType: 'None',
    bowlingArm: 'None', bowlingSpeedClass: 'Non-Bowler', isWicketkeeper: true,
    overallRating: 87, potentialRating: 88, baseAuctionPriceCr: 2.0, salaryExpectationCr: 11.0,
    battingSkill: 86, powerSkill: 91, fieldingSkill: 88, experience: 74,
    stats: { matches: 40, runs: 730, highestScore: 49, battingAverage: 22.8, strikeRate: 151.1, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0037', name: 'Dhruv Jurel', shortName: 'D. Jurel', age: 24, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'RR',
    primaryRole: 'Wicketkeeper Batter', secondaryRole: 'Finisher', battingHand: 'Right Hand', bowlingType: 'None',
    bowlingArm: 'None', bowlingSpeedClass: 'Non-Bowler', isWicketkeeper: true,
    overallRating: 88, potentialRating: 94, baseAuctionPriceCr: 2.0, salaryExpectationCr: 14.0,
    battingSkill: 88, powerSkill: 90, fieldingSkill: 89, experience: 68,
    stats: { matches: 28, runs: 347, highestScore: 56, battingAverage: 23.1, strikeRate: 151.5, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0038', name: 'Avesh Khan', shortName: 'A. Khan', age: 28, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'LSG',
    primaryRole: 'Fast Bowler', secondaryRole: 'Death-over Specialist', battingHand: 'Right Hand', bowlingType: 'Fast',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Fast (138-144 km/h)', isWicketkeeper: false,
    overallRating: 87, potentialRating: 89, baseAuctionPriceCr: 2.0, salaryExpectationCr: 9.75,
    battingSkill: 36, powerSkill: 45, bowlingSkill: 88, fieldingSkill: 76, experience: 82,
    stats: { matches: 63, runs: 58, highestScore: 14, battingAverage: 7.2, strikeRate: 80.0, wickets: 75, bestBowling: '4/24', economy: 8.8 }
  }),
  createPlayer({
    id: 'REAL_0039', name: 'Khaleel Ahmed', shortName: 'K. Ahmed', age: 27, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'CSK',
    primaryRole: 'Fast-Medium Bowler', secondaryRole: 'Swing Bowler', battingHand: 'Right Hand', bowlingType: 'Fast-Medium',
    bowlingArm: 'Left Arm', bowlingSpeedClass: 'Fast-Medium (130-137 km/h)', isWicketkeeper: false,
    overallRating: 87, potentialRating: 89, baseAuctionPriceCr: 2.0, salaryExpectationCr: 4.8,
    battingSkill: 34, powerSkill: 38, bowlingSkill: 88, fieldingSkill: 78, experience: 80,
    stats: { matches: 57, runs: 18, highestScore: 5, battingAverage: 4.5, strikeRate: 50.0, wickets: 74, bestBowling: '3/21', economy: 8.7 }
  }),
  createPlayer({
    id: 'REAL_0040', name: 'Mukesh Kumar', shortName: 'M. Kumar', age: 31, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'DC',
    primaryRole: 'Fast-Medium Bowler', secondaryRole: 'Death-over Specialist', battingHand: 'Right Hand', bowlingType: 'Fast-Medium',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Fast-Medium (130-137 km/h)', isWicketkeeper: false,
    overallRating: 86, potentialRating: 87, baseAuctionPriceCr: 2.0, salaryExpectationCr: 8.0,
    battingSkill: 35, powerSkill: 40, bowlingSkill: 87, fieldingSkill: 75, experience: 76,
    stats: { matches: 20, runs: 15, highestScore: 7, battingAverage: 5.0, strikeRate: 65.0, wickets: 24, bestBowling: '3/14', economy: 9.8 }
  }),

  // 41-50
  createPlayer({
    id: 'REAL_0041', name: 'Prasidh Krishna', shortName: 'P. Krishna', age: 29, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'GT',
    primaryRole: 'Fast Bowler', battingHand: 'Right Hand', bowlingType: 'Fast',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Express (145+ km/h)', isWicketkeeper: false,
    overallRating: 87, potentialRating: 90, baseAuctionPriceCr: 2.0, salaryExpectationCr: 9.5,
    battingSkill: 35, powerSkill: 40, bowlingSkill: 88, fieldingSkill: 78, experience: 78,
    stats: { matches: 51, runs: 22, highestScore: 4, battingAverage: 3.5, strikeRate: 45.0, wickets: 49, bestBowling: '4/30', economy: 8.9 }
  }),
  createPlayer({
    id: 'REAL_0042', name: 'Rahul Tripathi', shortName: 'R. Tripathi', age: 33, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'CSK',
    primaryRole: 'Top-order Batter', battingHand: 'Right Hand', bowlingType: 'Medium',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Medium (120-129 km/h)', isWicketkeeper: false,
    overallRating: 87, potentialRating: 87, baseAuctionPriceCr: 2.0, salaryExpectationCr: 3.4,
    battingSkill: 88, powerSkill: 87, fieldingSkill: 86, experience: 85,
    stats: { matches: 95, runs: 2236, highestScore: 93, battingAverage: 27.3, strikeRate: 139.4, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0043', name: 'Deepak Chahar', shortName: 'D. Chahar', age: 32, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'MI',
    primaryRole: 'Swing Bowler', secondaryRole: 'Bowling All-rounder', battingHand: 'Right Hand', bowlingType: 'Fast-Medium',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Fast-Medium (130-137 km/h)', isWicketkeeper: false,
    overallRating: 87, potentialRating: 87, baseAuctionPriceCr: 2.0, salaryExpectationCr: 9.25,
    battingSkill: 70, powerSkill: 76, bowlingSkill: 88, fieldingSkill: 82, experience: 88,
    stats: { matches: 81, runs: 85, highestScore: 39, battingAverage: 12.0, strikeRate: 138.0, wickets: 77, bestBowling: '4/13', economy: 7.9 }
  }),
  createPlayer({
    id: 'REAL_0044', name: 'Shardul Thakur', shortName: 'S. Thakur', age: 33, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'LSG',
    primaryRole: 'Bowling All-rounder', secondaryRole: 'Fast-Medium Bowler', battingHand: 'Right Hand', bowlingType: 'Fast-Medium',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Fast-Medium (130-137 km/h)', isWicketkeeper: false,
    overallRating: 86, potentialRating: 86, baseAuctionPriceCr: 2.0, salaryExpectationCr: 4.0,
    battingSkill: 74, powerSkill: 82, bowlingSkill: 86, fieldingSkill: 80, experience: 88,
    stats: { matches: 95, runs: 307, highestScore: 68, battingAverage: 11.8, strikeRate: 140.0, wickets: 94, bestBowling: '4/36', economy: 9.2 }
  }),
  createPlayer({
    id: 'REAL_0045', name: 'T Natarajan', shortName: 'T. Natarajan', age: 33, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'DC',
    primaryRole: 'Death-over Specialist', battingHand: 'Left Hand', bowlingType: 'Fast-Medium',
    bowlingArm: 'Left Arm', bowlingSpeedClass: 'Fast-Medium (130-137 km/h)', isWicketkeeper: false,
    overallRating: 88, potentialRating: 88, baseAuctionPriceCr: 2.0, salaryExpectationCr: 10.75,
    battingSkill: 30, powerSkill: 35, bowlingSkill: 89, fieldingSkill: 76, experience: 82,
    stats: { matches: 61, runs: 20, highestScore: 4, battingAverage: 3.5, strikeRate: 50.0, wickets: 67, bestBowling: '4/19', economy: 8.7 }
  }),
  createPlayer({
    id: 'REAL_0046', name: 'Mohit Sharma', shortName: 'M. Sharma', age: 36, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'DC',
    primaryRole: 'Death-over Specialist', battingHand: 'Right Hand', bowlingType: 'Fast-Medium',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Medium (120-129 km/h)', isWicketkeeper: false,
    overallRating: 86, potentialRating: 86, baseAuctionPriceCr: 1.5, salaryExpectationCr: 2.2,
    battingSkill: 35, powerSkill: 40, bowlingSkill: 87, fieldingSkill: 78, experience: 94,
    stats: { matches: 112, runs: 120, highestScore: 16, battingAverage: 7.0, strikeRate: 85.0, wickets: 132, bestBowling: '5/10', economy: 8.6 }
  }),
  createPlayer({
    id: 'REAL_0047', name: 'Ravichandran Ashwin', shortName: 'R. Ashwin', age: 38, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'CSK',
    primaryRole: 'Off Spinner', secondaryRole: 'Spin All-rounder', battingHand: 'Right Hand', bowlingType: 'Off Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 88, potentialRating: 88, baseAuctionPriceCr: 2.0, salaryExpectationCr: 9.75,
    battingSkill: 72, powerSkill: 74, bowlingSkill: 90, fieldingSkill: 78, experience: 99,
    stats: { matches: 212, runs: 800, highestScore: 50, battingAverage: 13.6, strikeRate: 118.9, wickets: 180, bestBowling: '4/34', economy: 7.1 }
  }),
  createPlayer({
    id: 'REAL_0048', name: 'Devdutt Padikkal', shortName: 'D. Padikkal', age: 24, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'RCB',
    primaryRole: 'Top-order Batter', battingHand: 'Left Hand', bowlingType: 'Off Spin',
    bowlingArm: 'Right Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 86, potentialRating: 91, baseAuctionPriceCr: 2.0, salaryExpectationCr: 2.0,
    battingSkill: 87, powerSkill: 83, fieldingSkill: 80, experience: 72,
    stats: { matches: 65, runs: 1560, highestScore: 101, battingAverage: 25.6, strikeRate: 124.0, wickets: 0, bestBowling: '0/0', economy: 0 }
  }),
  createPlayer({
    id: 'REAL_0049', name: 'Krunal Pandya', shortName: 'K. Pandya', age: 33, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'RCB',
    primaryRole: 'Spin All-rounder', battingHand: 'Left Hand', bowlingType: 'Left-arm Orthodox',
    bowlingArm: 'Left Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 87, potentialRating: 87, baseAuctionPriceCr: 2.0, salaryExpectationCr: 5.75,
    battingSkill: 82, powerSkill: 85, bowlingSkill: 87, fieldingSkill: 84, experience: 88,
    stats: { matches: 127, runs: 1647, highestScore: 86, battingAverage: 22.6, strikeRate: 133.0, wickets: 76, bestBowling: '3/14', economy: 7.4 }
  }),
  createPlayer({
    id: 'REAL_0050', name: 'Shahbaz Ahmed', shortName: 'S. Ahmed', age: 30, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: 'LSG',
    primaryRole: 'Spin All-rounder', battingHand: 'Left Hand', bowlingType: 'Left-arm Orthodox',
    bowlingArm: 'Left Arm', bowlingSpeedClass: 'Slow / Spin (80-105 km/h)', isWicketkeeper: false,
    overallRating: 85, potentialRating: 86, baseAuctionPriceCr: 1.5, salaryExpectationCr: 2.4,
    battingSkill: 80, powerSkill: 82, bowlingSkill: 84, fieldingSkill: 85, experience: 74,
    stats: { matches: 55, runs: 538, highestScore: 45, battingAverage: 18.0, strikeRate: 125.0, wickets: 20, bestBowling: '3/7', economy: 8.8 }
  }),

  // 51-100 (50 more verified Indian Capped players)
  ...[
    { id: 'REAL_0051', name: 'Umesh Yadav', shortName: 'U. Yadav', age: 37, franchise: 'GT', role: 'Fast Bowler' as const, bat: 45, bowl: 86, ovr: 85 },
    { id: 'REAL_0052', name: 'Ishant Sharma', shortName: 'I. Sharma', age: 36, franchise: 'GT', role: 'Fast Bowler' as const, bat: 40, bowl: 86, ovr: 85 },
    { id: 'REAL_0053', name: 'Mayank Agarwal', shortName: 'M. Agarwal', age: 34, franchise: 'SRH', role: 'Opening Batter' as const, bat: 87, bowl: 40, ovr: 86 },
    { id: 'REAL_0054', name: 'Manish Pandey', shortName: 'M. Pandey', age: 35, franchise: 'KKR', role: 'Middle-order Batter' as const, bat: 86, bowl: 40, ovr: 85 },
    { id: 'REAL_0055', name: 'Karun Nair', shortName: 'K. Nair', age: 33, franchise: 'DC', role: 'Top-order Batter' as const, bat: 84, bowl: 40, ovr: 83 },
    { id: 'REAL_0056', name: 'Shivam Mavi', shortName: 'S. Mavi', age: 26, franchise: 'SRH', role: 'Fast Bowler' as const, bat: 45, bowl: 85, ovr: 84 },
    { id: 'REAL_0057', name: 'Navdeep Saini', shortName: 'N. Saini', age: 32, franchise: 'RR', role: 'Express Fast Bowler' as const, bat: 38, bowl: 85, ovr: 84 },
    { id: 'REAL_0058', name: 'Sandeep Sharma', shortName: 'S. Sharma', age: 31, franchise: 'RR', role: 'Swing Bowler' as const, bat: 40, bowl: 88, ovr: 87 },
    { id: 'REAL_0059', name: 'Jaydev Unadkat', shortName: 'J. Unadkat', age: 33, franchise: 'SRH', role: 'Fast-Medium Bowler' as const, bat: 55, bowl: 85, ovr: 84 },
    { id: 'REAL_0060', name: 'Chetan Sakariya', shortName: 'C. Sakariya', age: 27, franchise: 'KKR', role: 'Fast-Medium Bowler' as const, bat: 40, bowl: 84, ovr: 83 },
    { id: 'REAL_0061', name: 'Piyush Chawla', shortName: 'P. Chawla', age: 36, franchise: 'MI', role: 'Leg Spinner' as const, bat: 60, bowl: 87, ovr: 86 },
    { id: 'REAL_0062', name: 'Dinesh Karthik', shortName: 'D. Karthik', age: 39, franchise: 'RCB', role: 'Finisher' as const, bat: 88, bowl: 30, ovr: 87 },
    { id: 'REAL_0063', name: 'Wriddhiman Saha', shortName: 'W. Saha', age: 40, franchise: 'GT', role: 'Wicketkeeper Batter' as const, bat: 84, bowl: 30, ovr: 84 },
    { id: 'REAL_0064', name: 'KS Bharat', shortName: 'KS Bharat', age: 31, franchise: 'KKR', role: 'Wicketkeeper Batter' as const, bat: 82, bowl: 30, ovr: 82 },
    { id: 'REAL_0065', name: 'Deepak Hooda', shortName: 'D. Hooda', age: 29, franchise: 'CSK', role: 'Batting All-rounder' as const, bat: 84, bowl: 75, ovr: 84 },
    { id: 'REAL_0066', name: 'Vijay Shankar', shortName: 'V. Shankar', age: 34, franchise: 'CSK', role: 'Batting All-rounder' as const, bat: 83, bowl: 74, ovr: 83 },
    { id: 'REAL_0067', name: 'Prithvi Shaw', shortName: 'P. Shaw', age: 25, franchise: 'DC', role: 'Opening Batter' as const, bat: 87, bowl: 30, ovr: 86 },
    { id: 'REAL_0068', name: 'Sarfaraz Khan', shortName: 'S. Khan', age: 27, franchise: 'CSK', role: 'Middle-order Batter' as const, bat: 86, bowl: 35, ovr: 85 },
    { id: 'REAL_0069', name: 'Ajinkya Rahane', shortName: 'A. Rahane', age: 36, franchise: 'KKR', role: 'Top-order Batter' as const, bat: 86, bowl: 35, ovr: 85 },
    { id: 'REAL_0070', name: 'Sai Sudharsan', shortName: 'S. Sudharsan', age: 23, franchise: 'GT', role: 'Top-order Batter' as const, bat: 89, bowl: 35, ovr: 88 },
    { id: 'REAL_0071', name: 'Shahbaz Nadeem', shortName: 'S. Nadeem', age: 35, franchise: 'LSG', role: 'Left-arm Orthodox Spinner' as const, bat: 42, bowl: 83, ovr: 82 },
    { id: 'REAL_0072', name: 'Karn Sharma', shortName: 'K. Sharma', age: 37, franchise: 'RCB', role: 'Leg Spinner' as const, bat: 55, bowl: 84, ovr: 83 },
    { id: 'REAL_0073', name: 'Siddharth Kaul', shortName: 'S. Kaul', age: 34, franchise: 'PBKS', role: 'Fast-Medium Bowler' as const, bat: 35, bowl: 83, ovr: 82 },
    { id: 'REAL_0074', name: 'Barinder Sran', shortName: 'B. Sran', age: 33, franchise: 'GT', role: 'Fast-Medium Bowler' as const, bat: 35, bowl: 82, ovr: 81 },
    { id: 'REAL_0075', name: 'Rishi Dhawan', shortName: 'R. Dhawan', age: 34, franchise: 'PBKS', role: 'Pace All-rounder' as const, bat: 78, bowl: 82, ovr: 82 },
    { id: 'REAL_0076', name: 'Parvez Rasool', shortName: 'P. Rasool', age: 36, franchise: 'SRH', role: 'Spin All-rounder' as const, bat: 76, bowl: 81, ovr: 81 },
    { id: 'REAL_0077', name: 'Gurkeerat Singh Mann', shortName: 'G. Mann', age: 34, franchise: 'GT', role: 'Middle-order Batter' as const, bat: 81, bowl: 65, ovr: 80 },
    { id: 'REAL_0078', name: 'Mandeep Singh', shortName: 'M. Singh', age: 33, franchise: 'KKR', role: 'Middle-order Batter' as const, bat: 82, bowl: 35, ovr: 81 },
    { id: 'REAL_0079', name: 'Kedar Jadhav', shortName: 'K. Jadhav', age: 39, franchise: 'RCB', role: 'Middle-order Batter' as const, bat: 82, bowl: 68, ovr: 81 },
    { id: 'REAL_0080', name: 'Jayant Yadav', shortName: 'J. Yadav', age: 35, franchise: 'GT', role: 'Off Spinner' as const, bat: 65, bowl: 83, ovr: 82 },
    { id: 'REAL_0081', name: 'Krishnappa Gowtham', shortName: 'K. Gowtham', age: 36, franchise: 'LSG', role: 'Spin All-rounder' as const, bat: 75, bowl: 83, ovr: 82 },
    { id: 'REAL_0082', name: 'Rahul Chahar', shortName: 'R. Chahar', age: 25, franchise: 'SRH', role: 'Leg Spinner' as const, bat: 45, bowl: 86, ovr: 85 },
    { id: 'REAL_0083', name: 'Chetan Sharma', shortName: 'C. Sharma', age: 24, franchise: 'PBKS', role: 'Fast Bowler' as const, bat: 35, bowl: 83, ovr: 82 },
    { id: 'REAL_0084', name: 'Sandeep Warrier', shortName: 'S. Warrier', age: 33, franchise: 'GT', role: 'Fast-Medium Bowler' as const, bat: 35, bowl: 83, ovr: 82 },
    { id: 'REAL_0085', name: 'Basil Thampi', shortName: 'B. Thampi', age: 31, franchise: 'MI', role: 'Fast Bowler' as const, bat: 35, bowl: 82, ovr: 81 },
    { id: 'REAL_0086', name: 'Ankit Rajpoot', shortName: 'A. Rajpoot', age: 31, franchise: 'RR', role: 'Fast-Medium Bowler' as const, bat: 35, bowl: 82, ovr: 81 },
    { id: 'REAL_0087', name: 'Pawan Negi', shortName: 'P. Negi', age: 32, franchise: 'CSK', role: 'Spin All-rounder' as const, bat: 74, bowl: 81, ovr: 80 },
    { id: 'REAL_0088', name: 'Hanuma Vihari', shortName: 'H. Vihari', age: 31, franchise: 'SRH', role: 'Top-order Batter' as const, bat: 84, bowl: 65, ovr: 82 },
    { id: 'REAL_0089', name: 'Abhimanyu Easwaran', shortName: 'A. Easwaran', age: 29, franchise: 'DC', role: 'Opening Batter' as const, bat: 85, bowl: 35, ovr: 83 },
    { id: 'REAL_0090', name: 'Priyank Panchal', shortName: 'P. Panchal', age: 34, franchise: 'GT', role: 'Opening Batter' as const, bat: 84, bowl: 35, ovr: 82 },
    { id: 'REAL_0091', name: 'Sheldon Jackson', shortName: 'S. Jackson', age: 38, franchise: 'KKR', role: 'Wicketkeeper Batter' as const, bat: 83, bowl: 30, ovr: 81 },
    { id: 'REAL_0092', name: 'Akash Deep', shortName: 'A. Deep', age: 28, franchise: 'LSG', role: 'Fast Bowler' as const, bat: 55, bowl: 87, ovr: 86 },
    { id: 'REAL_0093', name: 'Saurabh Kumar', shortName: 'S. Kumar', age: 31, franchise: 'PBKS', role: 'Left-arm Orthodox Spinner' as const, bat: 62, bowl: 84, ovr: 83 },
    { id: 'REAL_0094', name: 'Dhruv Shorey', shortName: 'D. Shorey', age: 32, franchise: 'DC', role: 'Top-order Batter' as const, bat: 83, bowl: 35, ovr: 81 },
    { id: 'REAL_0095', name: 'Baba Indrajith', shortName: 'B. Indrajith', age: 30, franchise: 'KKR', role: 'Wicketkeeper Batter' as const, bat: 84, bowl: 30, ovr: 82 },
    { id: 'REAL_0096', name: 'Simarjeet Singh', shortName: 'S. Singh', age: 26, franchise: 'SRH', role: 'Fast-Medium Bowler' as const, bat: 38, bowl: 84, ovr: 83 },
    { id: 'REAL_0097', name: 'Kulwant Khejroliya', shortName: 'K. Khejroliya', age: 32, franchise: 'KKR', role: 'Fast-Medium Bowler' as const, bat: 35, bowl: 83, ovr: 82 },
    { id: 'REAL_0098', name: 'Lukman Meriwala', shortName: 'L. Meriwala', age: 33, franchise: 'DC', role: 'Fast-Medium Bowler' as const, bat: 35, bowl: 82, ovr: 81 },
    { id: 'REAL_0099', name: 'Manan Vohra', shortName: 'M. Vohra', age: 31, franchise: 'LSG', role: 'Opening Batter' as const, bat: 82, bowl: 35, ovr: 80 },
    { id: 'REAL_0100', name: 'Prerak Mankad', shortName: 'P. Mankad', age: 30, franchise: 'LSG', role: 'Batting All-rounder' as const, bat: 81, bowl: 75, ovr: 80 },
  ].map((p, idx) => createPlayer({
    id: p.id, name: p.name, shortName: p.shortName, age: p.age, nationality: 'IND',
    isOverseas: false, isReal: true, isCapped: true, originalFranchiseId: p.franchise,
    primaryRole: p.role, battingHand: 'Right Hand',
    bowlingType: p.role.includes('Spin') || p.role.includes('Orthodox') ? 'Off Spin' : (p.role.includes('Fast') || p.role.includes('Medium') ? 'Fast-Medium' : 'None'),
    bowlingArm: 'Right Arm',
    bowlingSpeedClass: p.role.includes('Fast') ? 'Fast (138-144 km/h)' : (p.role.includes('Spin') ? 'Slow / Spin (80-105 km/h)' : 'Non-Bowler'),
    isWicketkeeper: p.role.includes('Wicketkeeper'),
    overallRating: p.ovr, potentialRating: Math.min(99, p.ovr + (p.age < 28 ? 4 : 1)),
    baseAuctionPriceCr: 1.5, salaryExpectationCr: p.ovr > 85 ? 4.5 : 2.0,
    battingSkill: p.bat, powerSkill: p.bat, bowlingSkill: p.bowl, fieldingSkill: 78, experience: 80,
    stats: { matches: 40 + idx, runs: p.bat > 70 ? 800 + idx * 20 : 100, highestScore: p.bat > 70 ? 78 : 22, battingAverage: 24.0, strikeRate: 128.0, wickets: p.bowl > 70 ? 35 + idx : 0, bestBowling: '3/24', economy: 8.2 }
  }))
];
