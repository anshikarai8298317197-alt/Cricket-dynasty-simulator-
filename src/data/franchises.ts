/**
 * WICKET DYNASTY - Official 10 IPL Franchises Catalog
 */
import { Franchise } from '../types/franchise';

export const FRANCHISES: Franchise[] = [
  {
    id: 'CSK',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    homeCity: 'Chennai',
    homeStadium: 'M. A. Chidambaram Stadium (Chepauk)',
    primaryColor: '#FBBF24', // Yellow
    secondaryColor: '#1E3A8A', // Blue
    textColor: '#1E293B',
    championshipsWon: 5,
    teamIdentity: 'Tactical spin mastery, tactical calmness, and legendary championship pedigree.',
    squadStrength: {
      batting: 89,
      bowling: 88,
      allRound: 92,
      overall: 90,
    },
    startingPurseCr: 100.0,
    captainName: 'Ruturaj Gaikwad',
    headCoach: 'Stephen Fleming',
  },
  {
    id: 'DC',
    name: 'Delhi Capitals',
    shortName: 'DC',
    homeCity: 'Delhi',
    homeStadium: 'Arun Jaitley Stadium',
    primaryColor: '#2563EB', // Blue
    secondaryColor: '#DC2626', // Red
    textColor: '#FFFFFF',
    championshipsWon: 0,
    teamIdentity: 'Dynamic youth energy, explosive pace attacks, and aggressive batting intent.',
    squadStrength: {
      batting: 86,
      bowling: 87,
      allRound: 85,
      overall: 86,
    },
    startingPurseCr: 100.0,
    captainName: 'Axar Patel',
    headCoach: 'Hemang Badani',
  },
  {
    id: 'GT',
    name: 'Gujarat Titans',
    shortName: 'GT',
    homeCity: 'Ahmedabad',
    homeStadium: 'Narendra Modi Stadium',
    primaryColor: '#1E293B', // Dark Navy
    secondaryColor: '#D97706', // Gold
    textColor: '#FFFFFF',
    championshipsWon: 1,
    teamIdentity: 'Clutch match finishing, disciplined bowling attacks, and elite team balance.',
    squadStrength: {
      batting: 88,
      bowling: 89,
      allRound: 88,
      overall: 88,
    },
    startingPurseCr: 100.0,
    captainName: 'Shubman Gill',
    headCoach: 'Ashish Nehra',
  },
  {
    id: 'KKR',
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    homeCity: 'Kolkata',
    homeStadium: 'Eden Gardens',
    primaryColor: '#581C87', // Purple
    secondaryColor: '#EAB308', // Gold
    textColor: '#FFFFFF',
    championshipsWon: 3,
    teamIdentity: 'Mystery spin wizardry, maximum boundary hitting, and aggressive powerplay batting.',
    squadStrength: {
      batting: 91,
      bowling: 90,
      allRound: 93,
      overall: 91,
    },
    startingPurseCr: 100.0,
    captainName: 'Venkatesh Iyer',
    headCoach: 'Chandrakant Pandit',
  },
  {
    id: 'LSG',
    name: 'Lucknow Super Giants',
    shortName: 'LSG',
    homeCity: 'Lucknow',
    homeStadium: 'BRSABV Ekana Stadium',
    primaryColor: '#0284C7', // Cyan Blue
    secondaryColor: '#EA580C', // Orange
    textColor: '#FFFFFF',
    championshipsWon: 0,
    teamIdentity: 'Disciplined pitch reading, express pace, and destructive middle-order power.',
    squadStrength: {
      batting: 87,
      bowling: 88,
      allRound: 86,
      overall: 87,
    },
    startingPurseCr: 100.0,
    captainName: 'Rishabh Pant',
    headCoach: 'Justin Langer',
  },
  {
    id: 'MI',
    name: 'Mumbai Indians',
    shortName: 'MI',
    homeCity: 'Mumbai',
    homeStadium: 'Wankhede Stadium',
    primaryColor: '#004BA0', // Royal Blue
    secondaryColor: '#F59E0B', // Gold
    textColor: '#FFFFFF',
    championshipsWon: 5,
    teamIdentity: 'Iconic powerhouse squad, relentless boundary-hitters, and premier death bowling.',
    squadStrength: {
      batting: 93,
      bowling: 91,
      allRound: 91,
      overall: 92,
    },
    startingPurseCr: 100.0,
    captainName: 'Hardik Pandya',
    headCoach: 'Mahela Jayawardene',
  },
  {
    id: 'PBKS',
    name: 'Punjab Kings',
    shortName: 'PBKS',
    homeCity: 'Mohali / Mullanpur',
    homeStadium: 'PCA Maharaja Yadavindra Singh Stadium',
    primaryColor: '#DC2626', // Crimson Red
    secondaryColor: '#D97706', // Gold
    textColor: '#FFFFFF',
    championshipsWon: 0,
    teamIdentity: 'Fearless aggressive strokeplay, lethal pace bowling, and relentless match determination.',
    squadStrength: {
      batting: 88,
      bowling: 87,
      allRound: 86,
      overall: 87,
    },
    startingPurseCr: 100.0,
    captainName: 'Shreyas Iyer',
    headCoach: 'Ricky Ponting',
  },
  {
    id: 'RR',
    name: 'Rajasthan Royals',
    shortName: 'RR',
    homeCity: 'Jaipur',
    homeStadium: 'Sawai Mansingh Stadium',
    primaryColor: '#EC4899', // Pink
    secondaryColor: '#1D4ED8', // Royal Blue
    textColor: '#FFFFFF',
    championshipsWon: 1,
    teamIdentity: 'Innovative tactical acumen, elite top-order batsmanship, and pinpoint spin craft.',
    squadStrength: {
      batting: 90,
      bowling: 89,
      allRound: 87,
      overall: 89,
    },
    startingPurseCr: 100.0,
    captainName: 'Sanju Samson',
    headCoach: 'Rahul Dravid',
  },
  {
    id: 'RCB',
    name: 'Royal Challengers Bengaluru',
    shortName: 'RCB',
    homeCity: 'Bengaluru',
    homeStadium: 'M. Chinnaswamy Stadium',
    primaryColor: '#991B1B', // Red
    secondaryColor: '#1E293B', // Dark Navy
    textColor: '#FFFFFF',
    championshipsWon: 0,
    teamIdentity: 'Electrifying batting firepower, passionate fanbase, and high-octane run chases.',
    squadStrength: {
      batting: 92,
      bowling: 88,
      allRound: 88,
      overall: 90,
    },
    startingPurseCr: 100.0,
    captainName: 'Virat Kohli',
    headCoach: 'Andy Flower',
  },
  {
    id: 'SRH',
    name: 'Sunrisers Hyderabad',
    shortName: 'SRH',
    homeCity: 'Hyderabad',
    homeStadium: 'Rajiv Gandhi International Cricket Stadium',
    primaryColor: '#EA580C', // Orange
    secondaryColor: '#18181B', // Black
    textColor: '#FFFFFF',
    championshipsWon: 1,
    teamIdentity: 'Record-shattering powerplay aggression, world-class pace depth, and ruthless batting tempos.',
    squadStrength: {
      batting: 94,
      bowling: 90,
      allRound: 89,
      overall: 91,
    },
    startingPurseCr: 100.0,
    captainName: 'Pat Cummins',
    headCoach: 'Daniel Vettori',
  },
];
