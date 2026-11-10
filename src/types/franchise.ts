/**
 * WICKET DYNASTY - Franchise TypeScript Definitions
 * 10 Official IPL Franchises
 */

export interface Franchise {
  id: string; // "CSK", "DC", "GT", "KKR", "LSG", "MI", "PBKS", "RR", "RCB", "SRH"
  name: string;
  shortName: string;
  homeCity: string;
  homeStadium: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  championshipsWon: number;
  teamIdentity: string;
  squadStrength: {
    batting: number;
    bowling: number;
    allRound: number;
    overall: number;
  };
  startingPurseCr: number; // ₹100.0 Cr
  captainName: string;
  headCoach: string;
}
