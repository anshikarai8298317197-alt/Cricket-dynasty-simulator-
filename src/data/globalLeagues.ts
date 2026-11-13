/**
 * WICKET DYNASTY - Global Domestic Leagues & Worldwide Franchise Team Database
 * 8 Domestic Franchise T20 Competitions + 54 Unique Global Franchises
 */
import { FRANCHISES } from './franchises';
import {
  DomesticLeagueId,
  GCLQualificationSlotConfig,
  GlobalTeam,
  LeagueDefinition,
} from '../types/globalSeason';
import { Player, PlayerRole } from '../types/player';
import { CareerSave } from '../types/career';

export const DOMESTIC_LEAGUES: LeagueDefinition[] = [
  {
    id: 'SA20',
    name: 'SA20',
    shortName: 'SA20',
    country: 'South Africa',
    countryCode: 'ZA',
    trophyName: 'SA20 Champion Trophy',
    teamCount: 6,
    startMonth: 1,
    startDay: 8,
    endMonth: 2,
    endDay: 8,
    defaultGclSlots: 2,
    formatLabel: '6 Teams · Double Round-Robin + Playoffs',
    accentColor: '#10B981',
  },
  {
    id: 'BBL',
    name: 'Big Bash League',
    shortName: 'BBL',
    country: 'Australia',
    countryCode: 'AU',
    trophyName: 'BBL Champion Trophy',
    teamCount: 8,
    startMonth: 1,
    startDay: 2,
    endMonth: 2,
    endDay: 14,
    defaultGclSlots: 2,
    formatLabel: '8 Teams · League Stage + Playoffs',
    accentColor: '#0EA5E9',
  },
  {
    id: 'PSL',
    name: 'Pakistan Super League',
    shortName: 'PSL',
    country: 'Pakistan',
    countryCode: 'PK',
    trophyName: 'PSL Champion Trophy',
    teamCount: 6,
    startMonth: 2,
    startDay: 16,
    endMonth: 3,
    endDay: 20,
    defaultGclSlots: 2,
    formatLabel: '6 Teams · Double Round-Robin + Playoffs',
    accentColor: '#22C55E',
  },
  {
    id: 'IPL',
    name: 'Indian Premier League',
    shortName: 'IPL',
    country: 'India',
    countryCode: 'IN',
    trophyName: 'IPL Champion Trophy',
    teamCount: 10,
    startMonth: 3,
    startDay: 28,
    endMonth: 5,
    endDay: 31,
    defaultGclSlots: 3,
    formatLabel: '10 Teams · 70 League + 4 Playoffs',
    accentColor: '#F59E0B',
  },
  {
    id: 'BPL',
    name: 'Bangladesh Premier League',
    shortName: 'BPL',
    country: 'Bangladesh',
    countryCode: 'BD',
    trophyName: 'BPL Champion Trophy',
    teamCount: 6,
    startMonth: 6,
    startDay: 5,
    endMonth: 7,
    endDay: 10,
    defaultGclSlots: 1,
    formatLabel: '6 Teams · Double Round-Robin + Playoffs',
    accentColor: '#14B8A6',
  },
  {
    id: 'ILT20',
    name: 'International League T20',
    shortName: 'ILT20',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    trophyName: 'ILT20 Champion Trophy',
    teamCount: 6,
    startMonth: 7,
    startDay: 14,
    endMonth: 8,
    endDay: 14,
    defaultGclSlots: 2,
    formatLabel: '6 Teams · Double Round-Robin + Playoffs',
    accentColor: '#A855F7',
  },
  {
    id: 'THE_HUNDRED',
    name: 'The Hundred',
    shortName: '100',
    country: 'England',
    countryCode: 'GB',
    trophyName: 'The Hundred Champion Trophy',
    teamCount: 8,
    startMonth: 7,
    startDay: 22,
    endMonth: 8,
    endDay: 25,
    defaultGclSlots: 2,
    formatLabel: '8 Teams · League Stage + Playoffs',
    accentColor: '#EC4899',
  },
  {
    id: 'CPL',
    name: 'Caribbean Premier League',
    shortName: 'CPL',
    country: 'West Indies',
    countryCode: 'WI',
    trophyName: 'CPL Champion Trophy',
    teamCount: 6,
    startMonth: 8,
    startDay: 28,
    endMonth: 9,
    endDay: 26,
    defaultGclSlots: 2,
    formatLabel: '6 Teams · Double Round-Robin + Playoffs',
    accentColor: '#F97316',
  },
];

export const DEFAULT_GCL_SLOTS: GCLQualificationSlotConfig = {
  IPL: 3,
  BBL: 2,
  PSL: 2,
  SA20: 2,
  CPL: 2,
  BPL: 1,
  ILT20: 2,
  THE_HUNDRED: 2,
};

function intlTeam(params: {
  id: string;
  name: string;
  shortName: string;
  leagueId: DomesticLeagueId;
  country: string;
  countryCode: string;
  homeCity: string;
  homeStadium: string;
  primaryColor: string;
  secondaryColor: string;
  textColor?: string;
  championshipsWon: number;
  previousTrophies: string[];
  rating: number;
  batting: number;
  bowling: number;
  allRound: number;
  captainName: string;
  headCoach: string;
  identity: string;
}): GlobalTeam {
  return {
    id: params.id,
    name: params.name,
    shortName: params.shortName,
    leagueId: params.leagueId,
    country: params.country,
    countryCode: params.countryCode,
    homeCity: params.homeCity,
    homeStadium: params.homeStadium,
    primaryColor: params.primaryColor,
    secondaryColor: params.secondaryColor,
    textColor: params.textColor || '#FFFFFF',
    championshipsWon: params.championshipsWon,
    teamIdentity: params.identity,
    squadStrength: {
      batting: params.batting,
      bowling: params.bowling,
      allRound: params.allRound,
      overall: params.rating,
    },
    rating: params.rating,
    startingPurseCr: 100,
    captainName: params.captainName,
    headCoach: params.headCoach,
    previousTrophies: params.previousTrophies,
    tournamentHistory: {
      appearances: Math.max(2, params.championshipsWon + 3),
      titles: params.championshipsWon,
      bestFinish: params.championshipsWon > 0 ? 'Champions' : 'Playoffs',
    },
  };
}

const IPL_GLOBAL_TEAMS: GlobalTeam[] = FRANCHISES.map(f => ({
  ...f,
  leagueId: 'IPL',
  country: 'India',
  countryCode: 'IN',
  rating: f.squadStrength.overall,
  previousTrophies:
    f.championshipsWon > 0
      ? [`${f.championshipsWon}x IPL Champions`]
      : ['IPL Contender'],
  tournamentHistory: {
    appearances: 18,
    titles: f.championshipsWon,
    bestFinish: f.championshipsWon > 0 ? `Champions (${f.championshipsWon}x)` : 'Finalists',
  },
}));

const BBL_TEAMS: GlobalTeam[] = [
  intlTeam({
    id: 'SCO', name: 'Perth Scorchers', shortName: 'SCO', leagueId: 'BBL',
    country: 'Australia', countryCode: 'AU', homeCity: 'Perth', homeStadium: 'Optus Stadium, Perth',
    primaryColor: '#EA580C', secondaryColor: '#18181B', championshipsWon: 5,
    previousTrophies: ['5x BBL Champions'], rating: 88, batting: 87, bowling: 90, allRound: 87,
    captainName: 'Ashton Turner', headCoach: 'Adam Voges', identity: 'Express home pace and ruthless championship consistency.',
  }),
  intlTeam({
    id: 'SIX', name: 'Sydney Sixers', shortName: 'SIX', leagueId: 'BBL',
    country: 'Australia', countryCode: 'AU', homeCity: 'Sydney', homeStadium: 'Sydney Cricket Ground (SCG)',
    primaryColor: '#DB2777', secondaryColor: '#0F172A', championshipsWon: 3,
    previousTrophies: ['3x BBL Champions'], rating: 87, batting: 88, bowling: 86, allRound: 87,
    captainName: 'Moises Henriques', headCoach: 'Greg Shipperd', identity: 'Tactical bowling depth and SCG middle-overs craft.',
  }),
  intlTeam({
    id: 'HEA', name: 'Brisbane Heat', shortName: 'HEA', leagueId: 'BBL',
    country: 'Australia', countryCode: 'AU', homeCity: 'Brisbane', homeStadium: 'The Gabba, Brisbane',
    primaryColor: '#0284C7', secondaryColor: '#0F172A', championshipsWon: 2,
    previousTrophies: ['2x BBL Champions'], rating: 85, batting: 86, bowling: 85, allRound: 84,
    captainName: 'Usman Khawaja', headCoach: 'Johan Botha', identity: 'Explosive powerplay hitting and Gabba bounce bowling.',
  }),
  intlTeam({
    id: 'HUR', name: 'Hobart Hurricanes', shortName: 'HUR', leagueId: 'BBL',
    country: 'Australia', countryCode: 'AU', homeCity: 'Hobart', homeStadium: 'Blundstone Arena, Hobart',
    primaryColor: '#6D28D9', secondaryColor: '#1E293B', championshipsWon: 1,
    previousTrophies: ['1x BBL Champions'], rating: 84, batting: 86, bowling: 83, allRound: 83,
    captainName: 'Nathan Ellis', headCoach: 'Jeff Vaughan', identity: 'Fearless middle-order power and clever death variations.',
  }),
  intlTeam({
    id: 'STA', name: 'Melbourne Stars', shortName: 'STA', leagueId: 'BBL',
    country: 'Australia', countryCode: 'AU', homeCity: 'Melbourne', homeStadium: 'Melbourne Cricket Ground (MCG)',
    primaryColor: '#16A34A', secondaryColor: '#052E16', championshipsWon: 0,
    previousTrophies: ['3x BBL Finalists'], rating: 84, batting: 86, bowling: 83, allRound: 85,
    captainName: 'Marcus Stoinis', headCoach: 'Peter Moores', identity: 'All-round powerhouse built for expansive MCG boundaries.',
  }),
  intlTeam({
    id: 'STR', name: 'Adelaide Strikers', shortName: 'STR', leagueId: 'BBL',
    country: 'Australia', countryCode: 'AU', homeCity: 'Adelaide', homeStadium: 'Adelaide Oval',
    primaryColor: '#0369A1', secondaryColor: '#E0F2FE', championshipsWon: 1,
    previousTrophies: ['1x BBL Champions'], rating: 83, batting: 84, bowling: 84, allRound: 82,
    captainName: 'Matthew Short', headCoach: 'Tim Paine', identity: 'Aggressive top-order scoring and wrist-spin control.',
  }),
  intlTeam({
    id: 'THU', name: 'Sydney Thunder', shortName: 'THU', leagueId: 'BBL',
    country: 'Australia', countryCode: 'AU', homeCity: 'Western Sydney', homeStadium: 'ENGIE Stadium, Sydney',
    primaryColor: '#65A30D', secondaryColor: '#09090B', championshipsWon: 1,
    previousTrophies: ['1x BBL Champions'], rating: 83, batting: 84, bowling: 82, allRound: 83,
    captainName: 'David Warner', headCoach: 'Trevor Bayliss', identity: 'Dynamic powerplay strokeplay and fiery left-arm pace.',
  }),
  intlTeam({
    id: 'REN', name: 'Melbourne Renegades', shortName: 'REN', leagueId: 'BBL',
    country: 'Australia', countryCode: 'AU', homeCity: 'Melbourne', homeStadium: 'Marvel Stadium, Melbourne',
    primaryColor: '#DC2626', secondaryColor: '#18181B', championshipsWon: 1,
    previousTrophies: ['1x BBL Champions'], rating: 82, batting: 82, bowling: 83, allRound: 81,
    captainName: 'Will Sutherland', headCoach: 'Cameron White', identity: 'Gritty chase specialists with versatile spin options.',
  }),
];

const PSL_TEAMS: GlobalTeam[] = [
  intlTeam({
    id: 'LAQ', name: 'Lahore Qalandars', shortName: 'LAQ', leagueId: 'PSL',
    country: 'Pakistan', countryCode: 'PK', homeCity: 'Lahore', homeStadium: 'Gaddafi Stadium, Lahore',
    primaryColor: '#15803D', secondaryColor: '#FACC15', championshipsWon: 2,
    previousTrophies: ['2x PSL Champions'], rating: 87, batting: 85, bowling: 90, allRound: 86,
    captainName: 'Shaheen Afridi', headCoach: 'Aqib Javed', identity: 'Express new-ball pace and match-winning leg-spin.',
  }),
  intlTeam({
    id: 'ISU', name: 'Islamabad United', shortName: 'ISU', leagueId: 'PSL',
    country: 'Pakistan', countryCode: 'PK', homeCity: 'Islamabad', homeStadium: 'Rawalpindi Cricket Stadium',
    primaryColor: '#B91C1C', secondaryColor: '#F59E0B', championshipsWon: 3,
    previousTrophies: ['3x PSL Champions'], rating: 88, batting: 89, bowling: 86, allRound: 89,
    captainName: 'Shadab Khan', headCoach: 'Mike Hesson', identity: 'High-tempo analytics-driven T20 aggression.',
  }),
  intlTeam({
    id: 'MUS', name: 'Multan Sultans', shortName: 'MUS', leagueId: 'PSL',
    country: 'Pakistan', countryCode: 'PK', homeCity: 'Multan', homeStadium: 'Multan Cricket Stadium',
    primaryColor: '#047857', secondaryColor: '#0EA5E9', championshipsWon: 1,
    previousTrophies: ['1x PSL Champions'], rating: 87, batting: 88, bowling: 87, allRound: 86,
    captainName: 'Mohammad Rizwan', headCoach: 'Abdul Rehman', identity: 'Relentless consistency and disciplined defending.',
  }),
  intlTeam({
    id: 'PEZ', name: 'Peshawar Zalmi', shortName: 'PEZ', leagueId: 'PSL',
    country: 'Pakistan', countryCode: 'PK', homeCity: 'Peshawar', homeStadium: 'Arbab Niaz Stadium',
    primaryColor: '#CA8A04', secondaryColor: '#111827', championshipsWon: 1,
    previousTrophies: ['1x PSL Champions'], rating: 85, batting: 88, bowling: 83, allRound: 84,
    captainName: 'Babar Azam', headCoach: 'Daren Sammy', identity: 'Classical anchor runs paired with fearless boundary hitters.',
  }),
  intlTeam({
    id: 'QUG', name: 'Quetta Gladiators', shortName: 'QUG', leagueId: 'PSL',
    country: 'Pakistan', countryCode: 'PK', homeCity: 'Quetta', homeStadium: 'Bugti Stadium',
    primaryColor: '#7E22CE', secondaryColor: '#FBBF24', championshipsWon: 1,
    previousTrophies: ['1x PSL Champions'], rating: 83, batting: 84, bowling: 83, allRound: 83,
    captainName: 'Rilee Rossouw', headCoach: 'Shane Watson', identity: 'Explosive overseas top order and mystery spin.',
  }),
  intlTeam({
    id: 'KAK', name: 'Karachi Kings', shortName: 'KAK', leagueId: 'PSL',
    country: 'Pakistan', countryCode: 'PK', homeCity: 'Karachi', homeStadium: 'National Bank Stadium, Karachi',
    primaryColor: '#1D4ED8', secondaryColor: '#EF4444', championshipsWon: 1,
    previousTrophies: ['1x PSL Champions'], rating: 83, batting: 84, bowling: 83, allRound: 82,
    captainName: 'Shan Masood', headCoach: 'Phil Simmons', identity: 'Balanced seam attack and experienced batting core.',
  }),
];

const SA20_TEAMS: GlobalTeam[] = [
  intlTeam({
    id: 'SEC', name: 'Sunrisers Eastern Cape', shortName: 'SEC', leagueId: 'SA20',
    country: 'South Africa', countryCode: 'ZA', homeCity: 'Gqeberha', homeStadium: "St George's Park, Gqeberha",
    primaryColor: '#EA580C', secondaryColor: '#0F172A', championshipsWon: 2,
    previousTrophies: ['2x SA20 Champions'], rating: 88, batting: 87, bowling: 89, allRound: 88,
    captainName: 'Aiden Markram', headCoach: 'Adrian Birrell', identity: 'Relentless title-winning bowling unit and calm chases.',
  }),
  intlTeam({
    id: 'MICT', name: 'MI Cape Town', shortName: 'MICT', leagueId: 'SA20',
    country: 'South Africa', countryCode: 'ZA', homeCity: 'Cape Town', homeStadium: 'Newlands, Cape Town',
    primaryColor: '#0369A1', secondaryColor: '#F59E0B', championshipsWon: 1,
    previousTrophies: ['1x SA20 Champions'], rating: 88, batting: 89, bowling: 88, allRound: 87,
    captainName: 'Rashid Khan', headCoach: 'Robin Peterson', identity: 'Star-studded Newlands batting power and spin mastery.',
  }),
  intlTeam({
    id: 'PRL', name: 'Paarl Royals', shortName: 'PRL', leagueId: 'SA20',
    country: 'South Africa', countryCode: 'ZA', homeCity: 'Paarl', homeStadium: 'Boland Park, Paarl',
    primaryColor: '#BE185D', secondaryColor: '#1E3A8A', championshipsWon: 0,
    previousTrophies: ['SA20 Playoff Contenders'], rating: 85, batting: 85, bowling: 86, allRound: 84,
    captainName: 'David Miller', headCoach: 'Trevor Penney', identity: 'Smart spin strangles on slow Boland Park surfaces.',
  }),
  intlTeam({
    id: 'JSK', name: 'Joburg Super Kings', shortName: 'JSK', leagueId: 'SA20',
    country: 'South Africa', countryCode: 'ZA', homeCity: 'Johannesburg', homeStadium: 'Wanderers Stadium',
    primaryColor: '#EAB308', secondaryColor: '#1E3A8A', championshipsWon: 0,
    previousTrophies: ['SA20 Semi-Finalists'], rating: 85, batting: 86, bowling: 84, allRound: 85,
    captainName: 'Faf du Plessis', headCoach: 'Stephen Fleming', identity: 'High-scoring Wanderers dominance and tactical composure.',
  }),
  intlTeam({
    id: 'PRC', name: 'Pretoria Capitals', shortName: 'PRC', leagueId: 'SA20',
    country: 'South Africa', countryCode: 'ZA', homeCity: 'Centurion', homeStadium: 'SuperSport Park, Centurion',
    primaryColor: '#1D4ED8', secondaryColor: '#DC2626', championshipsWon: 0,
    previousTrophies: ['SA20 Finalists'], rating: 84, batting: 85, bowling: 84, allRound: 83,
    captainName: 'Kyle Verreynne', headCoach: 'Jonathan Trott', identity: 'Highveld pace fire and aggressive top-order starts.',
  }),
  intlTeam({
    id: 'DSG', name: "Durban's Super Giants", shortName: 'DSG', leagueId: 'SA20',
    country: 'South Africa', countryCode: 'ZA', homeCity: 'Durban', homeStadium: 'Kingsmead, Durban',
    primaryColor: '#0284C7', secondaryColor: '#F97316', championshipsWon: 0,
    previousTrophies: ['SA20 Finalists'], rating: 85, batting: 87, bowling: 84, allRound: 84,
    captainName: 'Keshav Maharaj', headCoach: 'Lance Klusener', identity: 'Powerhouse middle order and Kingsmead left-arm spin.',
  }),
];

const CPL_TEAMS: GlobalTeam[] = [
  intlTeam({
    id: 'TKR', name: 'Trinbago Knight Riders', shortName: 'TKR', leagueId: 'CPL',
    country: 'West Indies', countryCode: 'WI', homeCity: 'Port of Spain', homeStadium: "Queen's Park Oval, Trinidad",
    primaryColor: '#991B1B', secondaryColor: '#FBBF24', championshipsWon: 4,
    previousTrophies: ['4x CPL Champions'], rating: 87, batting: 88, bowling: 86, allRound: 88,
    captainName: 'Kieron Pollard', headCoach: 'Phil Simmons', identity: 'All-round Caribbean pedigree and clutch finishing.',
  }),
  intlTeam({
    id: 'GAW', name: 'Guyana Amazon Warriors', shortName: 'GAW', leagueId: 'CPL',
    country: 'West Indies', countryCode: 'WI', homeCity: 'Georgetown', homeStadium: 'Providence Stadium, Guyana',
    primaryColor: '#16A34A', secondaryColor: '#FACC15', championshipsWon: 1,
    previousTrophies: ['1x CPL Champions'], rating: 86, batting: 85, bowling: 88, allRound: 86,
    captainName: 'Imran Tahir', headCoach: 'Lance Klusener', identity: 'Fortress Providence spin web and depth batting.',
  }),
  intlTeam({
    id: 'SLK', name: 'Saint Lucia Kings', shortName: 'SLK', leagueId: 'CPL',
    country: 'West Indies', countryCode: 'WI', homeCity: 'Gros Islet', homeStadium: 'Daren Sammy Cricket Ground',
    primaryColor: '#0284C7', secondaryColor: '#FBBF24', championshipsWon: 1,
    previousTrophies: ['1x CPL Champions'], rating: 85, batting: 86, bowling: 85, allRound: 84,
    captainName: 'Faf du Plessis', headCoach: 'Daren Sammy', identity: 'High-energy seam attack and explosive opening pairs.',
  }),
  intlTeam({
    id: 'BAR', name: 'Barbados Royals', shortName: 'BAR', leagueId: 'CPL',
    country: 'West Indies', countryCode: 'WI', homeCity: 'Bridgetown', homeStadium: 'Kensington Oval, Barbados',
    primaryColor: '#DB2777', secondaryColor: '#1E40AF', championshipsWon: 2,
    previousTrophies: ['2x CPL Champions'], rating: 84, batting: 85, bowling: 84, allRound: 83,
    captainName: 'Rovman Powell', headCoach: 'Trevor Penney', identity: 'Big six-hitting middle order and pace bowling.',
  }),
  intlTeam({
    id: 'SKP', name: 'St Kitts & Nevis Patriots', shortName: 'SKP', leagueId: 'CPL',
    country: 'West Indies', countryCode: 'WI', homeCity: 'Basseterre', homeStadium: 'Warner Park',
    primaryColor: '#DC2626', secondaryColor: '#16A34A', championshipsWon: 1,
    previousTrophies: ['1x CPL Champions'], rating: 82, batting: 84, bowling: 80, allRound: 82,
    captainName: 'Evin Lewis', headCoach: 'Malolan Rangarajan', identity: 'Short-boundary Warner Park six-hitting blitz.',
  }),
  intlTeam({
    id: 'ABF', name: 'Antigua & Barbuda Falcons', shortName: 'ABF', leagueId: 'CPL',
    country: 'West Indies', countryCode: 'WI', homeCity: "St John's", homeStadium: 'Sir Vivian Richards Stadium',
    primaryColor: '#0E7490', secondaryColor: '#F59E0B', championshipsWon: 0,
    previousTrophies: ['CPL Challenger'], rating: 81, batting: 82, bowling: 81, allRound: 81,
    captainName: 'Chris Green', headCoach: 'Shivnarine Chanderpaul', identity: 'Fearless young Caribbean power hitters.',
  }),
];

const BPL_TEAMS: GlobalTeam[] = [
  intlTeam({
    id: 'FBR', name: 'Fortune Barishal', shortName: 'FBR', leagueId: 'BPL',
    country: 'Bangladesh', countryCode: 'BD', homeCity: 'Barishal', homeStadium: 'Shere Bangla National Stadium',
    primaryColor: '#991B1B', secondaryColor: '#FBBF24', championshipsWon: 2,
    previousTrophies: ['2x BPL Champions'], rating: 85, batting: 86, bowling: 84, allRound: 85,
    captainName: 'Tamim Iqbal', headCoach: 'Mizanur Rahman', identity: 'Experienced top order and championship winning mentality.',
  }),
  intlTeam({
    id: 'CMV', name: 'Comilla Victorians', shortName: 'CMV', leagueId: 'BPL',
    country: 'Bangladesh', countryCode: 'BD', homeCity: 'Comilla', homeStadium: 'Zahur Ahmed Chowdhury Stadium',
    primaryColor: '#DC2626', secondaryColor: '#047857', championshipsWon: 4,
    previousTrophies: ['4x BPL Champions'], rating: 86, batting: 86, bowling: 86, allRound: 85,
    captainName: 'Litton Das', headCoach: 'Mohammad Salahuddin', identity: 'Most decorated BPL franchise with elite overseas signings.',
  }),
  intlTeam({
    id: 'RGR', name: 'Rangpur Riders', shortName: 'RGR', leagueId: 'BPL',
    country: 'Bangladesh', countryCode: 'BD', homeCity: 'Rangpur', homeStadium: 'Shere Bangla National Stadium',
    primaryColor: '#2563EB', secondaryColor: '#FACC15', championshipsWon: 1,
    previousTrophies: ['1x BPL Champions'], rating: 84, batting: 84, bowling: 85, allRound: 84,
    captainName: 'Nurul Hasan', headCoach: 'Mickey Arthur', identity: 'Disciplined pace-spin combo and dynamic all-rounders.',
  }),
  intlTeam({
    id: 'SYL', name: 'Sylhet Strikers', shortName: 'SYL', leagueId: 'BPL',
    country: 'Bangladesh', countryCode: 'BD', homeCity: 'Sylhet', homeStadium: 'Sylhet International Cricket Stadium',
    primaryColor: '#059669', secondaryColor: '#1E293B', championshipsWon: 0,
    previousTrophies: ['BPL Finalists'], rating: 81, batting: 81, bowling: 82, allRound: 81,
    captainName: 'Zakir Hasan', headCoach: 'Rajin Saleh', identity: 'Skillful left-arm finger spin and compact chases.',
  }),
  intlTeam({
    id: 'CHC', name: 'Chittagong Kings', shortName: 'CHC', leagueId: 'BPL',
    country: 'Bangladesh', countryCode: 'BD', homeCity: 'Chattogram', homeStadium: 'Zahur Ahmed Chowdhury Stadium',
    primaryColor: '#0369A1', secondaryColor: '#F59E0B', championshipsWon: 0,
    previousTrophies: ['BPL Finalists'], rating: 82, batting: 83, bowling: 81, allRound: 82,
    captainName: 'Mohammad Mithun', headCoach: 'Shaun Tait', identity: 'Express pace paired with aggressive opening strokeplay.',
  }),
  intlTeam({
    id: 'DHC', name: 'Dhaka Capitals', shortName: 'DHC', leagueId: 'BPL',
    country: 'Bangladesh', countryCode: 'BD', homeCity: 'Dhaka', homeStadium: 'Shere Bangla National Stadium',
    primaryColor: '#1E40AF', secondaryColor: '#EF4444', championshipsWon: 3,
    previousTrophies: ['3x BPL Legacy Titles'], rating: 82, batting: 83, bowling: 82, allRound: 81,
    captainName: 'Mustafizur Rahman', headCoach: 'Khaled Mahmud', identity: 'Cutter specialist bowling at Mirpur.',
  }),
];

const ILT20_TEAMS: GlobalTeam[] = [
  intlTeam({
    id: 'MIE', name: 'MI Emirates', shortName: 'MIE', leagueId: 'ILT20',
    country: 'United Arab Emirates', countryCode: 'AE', homeCity: 'Abu Dhabi', homeStadium: 'Sheikh Zayed Cricket Stadium',
    primaryColor: '#0284C7', secondaryColor: '#F59E0B', championshipsWon: 1,
    previousTrophies: ['1x ILT20 Champions'], rating: 87, batting: 88, bowling: 87, allRound: 87,
    captainName: 'Nicholas Pooran', headCoach: 'Robin Singh', identity: 'Left-arm swing and fearless power-hitting core.',
  }),
  intlTeam({
    id: 'DBC', name: 'Dubai Capitals', shortName: 'DBC', leagueId: 'ILT20',
    country: 'United Arab Emirates', countryCode: 'AE', homeCity: 'Dubai', homeStadium: 'Dubai International Stadium',
    primaryColor: '#1D4ED8', secondaryColor: '#DC2626', championshipsWon: 1,
    previousTrophies: ['1x ILT20 Champions'], rating: 86, batting: 87, bowling: 85, allRound: 86,
    captainName: 'Sikandar Raza', headCoach: 'Hemang Badani', identity: 'Clutch middle-order versatility and dew-time chases.',
  }),
  intlTeam({
    id: 'DV', name: 'Desert Vipers', shortName: 'DV', leagueId: 'ILT20',
    country: 'United Arab Emirates', countryCode: 'AE', homeCity: 'Dubai', homeStadium: 'Dubai International Stadium',
    primaryColor: '#B91C1C', secondaryColor: '#18181B', championshipsWon: 0,
    previousTrophies: ['2x ILT20 Finalists'], rating: 86, batting: 85, bowling: 88, allRound: 85,
    captainName: 'Lockie Ferguson', headCoach: 'James Foster', identity: 'Lethal express bowling attack and wrist-spin traps.',
  }),
  intlTeam({
    id: 'GG', name: 'Gulf Giants', shortName: 'GG', leagueId: 'ILT20',
    country: 'United Arab Emirates', countryCode: 'AE', homeCity: 'Dubai', homeStadium: 'Dubai International Stadium',
    primaryColor: '#D97706', secondaryColor: '#0F172A', championshipsWon: 1,
    previousTrophies: ['1x ILT20 Champions'], rating: 85, batting: 85, bowling: 85, allRound: 84,
    captainName: 'James Vince', headCoach: 'Andy Flower', identity: 'Structured tactical chases and crisp opening stands.',
  }),
  intlTeam({
    id: 'ADKR', name: 'Abu Dhabi Knight Riders', shortName: 'ADKR', leagueId: 'ILT20',
    country: 'United Arab Emirates', countryCode: 'AE', homeCity: 'Abu Dhabi', homeStadium: 'Sheikh Zayed Cricket Stadium',
    primaryColor: '#6B21A8', secondaryColor: '#FACC15', championshipsWon: 0,
    previousTrophies: ['ILT20 Playoffs'], rating: 84, batting: 84, bowling: 84, allRound: 85,
    captainName: 'Sunil Narine', headCoach: 'Dwayne Bravo', identity: 'West Indian flair with elite mystery spin control.',
  }),
  intlTeam({
    id: 'SHW', name: 'Sharjah Warriorz', shortName: 'SHW', leagueId: 'ILT20',
    country: 'United Arab Emirates', countryCode: 'AE', homeCity: 'Sharjah', homeStadium: 'Sharjah Cricket Stadium',
    primaryColor: '#1E3A8A', secondaryColor: '#F59E0B', championshipsWon: 0,
    previousTrophies: ['ILT20 Playoffs'], rating: 83, batting: 84, bowling: 83, allRound: 82,
    captainName: 'Tim Southee', headCoach: 'JP Duminy', identity: 'High-scoring Sharjah firework specialists.',
  }),
];

const HUNDRED_TEAMS: GlobalTeam[] = [
  intlTeam({
    id: 'OVI', name: 'Oval Invincibles', shortName: 'OVI', leagueId: 'THE_HUNDRED',
    country: 'England', countryCode: 'GB', homeCity: 'London', homeStadium: 'The Kia Oval, London',
    primaryColor: '#0F766E', secondaryColor: '#EC4899', championshipsWon: 2,
    previousTrophies: ['2x The Hundred Champions'], rating: 88, batting: 87, bowling: 89, allRound: 88,
    captainName: 'Sam Billings', headCoach: 'Tom Moody', identity: 'Unrelenting spin-pace squeeze at The Oval.',
  }),
  intlTeam({
    id: 'SOB', name: 'Southern Brave', shortName: 'SOB', leagueId: 'THE_HUNDRED',
    country: 'England', countryCode: 'GB', homeCity: 'Southampton', homeStadium: 'Utilita Bowl, Southampton',
    primaryColor: '#16A34A', secondaryColor: '#18181B', championshipsWon: 1,
    previousTrophies: ['1x The Hundred Champions'], rating: 86, batting: 86, bowling: 87, allRound: 85,
    captainName: 'James Vince', headCoach: 'Adi Birrell', identity: 'Raw pace spearheads and balanced batting unit.',
  }),
  intlTeam({
    id: 'TRR', name: 'Trent Rockets', shortName: 'TRR', leagueId: 'THE_HUNDRED',
    country: 'England', countryCode: 'GB', homeCity: 'Nottingham', homeStadium: 'Trent Bridge, Nottingham',
    primaryColor: '#CA8A04', secondaryColor: '#312E81', championshipsWon: 1,
    previousTrophies: ['1x The Hundred Champions'], rating: 86, batting: 87, bowling: 85, allRound: 86,
    captainName: 'Lewis Gregory', headCoach: 'Andy Flower', identity: 'Six-hitting depth and Trent Bridge boundary assault.',
  }),
  intlTeam({
    id: 'BIP', name: 'Birmingham Phoenix', shortName: 'BIP', leagueId: 'THE_HUNDRED',
    country: 'England', countryCode: 'GB', homeCity: 'Birmingham', homeStadium: 'Edgbaston, Birmingham',
    primaryColor: '#EA580C', secondaryColor: '#FDE047', championshipsWon: 0,
    previousTrophies: ['The Hundred Finalists'], rating: 85, batting: 86, bowling: 84, allRound: 85,
    captainName: 'Moeen Ali', headCoach: 'Daniel Vettori', identity: 'All-action batting firepower and Edgbaston crowd lift.',
  }),
  intlTeam({
    id: 'MAO', name: 'Manchester Originals', shortName: 'MAO', leagueId: 'THE_HUNDRED',
    country: 'England', countryCode: 'GB', homeCity: 'Manchester', homeStadium: 'Emirates Old Trafford',
    primaryColor: '#1E293B', secondaryColor: '#E11D48', championshipsWon: 0,
    previousTrophies: ['2x The Hundred Finalists'], rating: 84, batting: 86, bowling: 83, allRound: 83,
    captainName: 'Jos Buttler', headCoach: 'Simon Katich', identity: 'World-class opening firepower and swing bowling.',
  }),
  intlTeam({
    id: 'NOS', name: 'Northern Superchargers', shortName: 'NOS', leagueId: 'THE_HUNDRED',
    country: 'England', countryCode: 'GB', homeCity: 'Leeds', homeStadium: 'Headingley, Leeds',
    primaryColor: '#6D28D9', secondaryColor: '#F59E0B', championshipsWon: 0,
    previousTrophies: ['Playoff Contender'], rating: 84, batting: 85, bowling: 84, allRound: 83,
    captainName: 'Harry Brook', headCoach: 'Andrew Flintoff', identity: 'Fearless aggressive strokeplay at Headingley.',
  }),
  intlTeam({
    id: 'LOS', name: 'London Spirit', shortName: 'LOS', leagueId: 'THE_HUNDRED',
    country: 'England', countryCode: 'GB', homeCity: 'London', homeStadium: "Lord's Cricket Ground",
    primaryColor: '#1D4ED8', secondaryColor: '#EAB308', championshipsWon: 0,
    previousTrophies: ['Playoff Contender'], rating: 83, batting: 83, bowling: 84, allRound: 83,
    captainName: 'Dan Lawrence', headCoach: 'Trevor Bayliss', identity: "Tactical discipline and Lord's slope seam movement.",
  }),
  intlTeam({
    id: 'WEF', name: 'Welsh Fire', shortName: 'WEF', leagueId: 'THE_HUNDRED',
    country: 'England', countryCode: 'GB', homeCity: 'Cardiff', homeStadium: 'Sophia Gardens, Cardiff',
    primaryColor: '#DC2626', secondaryColor: '#0F172A', championshipsWon: 0,
    previousTrophies: ['The Hundred Challenger'], rating: 82, batting: 83, bowling: 82, allRound: 82,
    captainName: 'Tom Abell', headCoach: 'Mike Hussey', identity: 'Fast-starting powerplay unit and attacking spinners.',
  }),
];

export const GLOBAL_TEAMS: GlobalTeam[] = [
  ...IPL_GLOBAL_TEAMS,
  ...BBL_TEAMS,
  ...PSL_TEAMS,
  ...SA20_TEAMS,
  ...CPL_TEAMS,
  ...BPL_TEAMS,
  ...ILT20_TEAMS,
  ...HUNDRED_TEAMS,
];

export function getGlobalTeamById(teamId: string): GlobalTeam {
  const norm = (teamId || '').toUpperCase().trim();
  const found = GLOBAL_TEAMS.find(t => t.id === norm || t.shortName === norm);
  if (found) return found;
  return {
    ...IPL_GLOBAL_TEAMS[0],
    id: norm || 'TBD',
    shortName: norm || 'TBD',
    name: norm || 'TBD',
  };
}

export function getTeamsByLeague(leagueId: DomesticLeagueId): GlobalTeam[] {
  return GLOBAL_TEAMS.filter(t => t.leagueId === leagueId);
}

export function getLeagueDefinition(leagueId: DomesticLeagueId): LeagueDefinition {
  return DOMESTIC_LEAGUES.find(l => l.id === leagueId) || DOMESTIC_LEAGUES[3];
}

// Deterministic hash for building authentic global squad rosters without mutating the 320-player master DB
function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const REGION_PLAYER_NAMES: Record<string, { first: string[]; last: string[] }> = {
  AU: {
    first: ['Mitchell', 'Josh', 'Travis', 'Adam', 'Cameron', 'Spencer', 'Aaron', 'Sean', 'Cooper', 'Nathan', 'Jake', 'Riley', 'Ben', 'Matthew'],
    last: ['Marsh', 'Inglis', 'Hardie', 'Zampa', 'Green', 'Johnson', 'Abbott', 'Connolly', 'Ellis', 'Fraser', 'Meredith', 'Short', 'Bancroft', 'Bartlett'],
  },
  PK: {
    first: ['Fakhar', 'Saim', 'Haris', 'Naseem', 'Abrar', 'Usama', 'Salman', 'Iftikhar', 'Imad', 'Zaman', 'Abbas', 'Azam', 'Saud', 'Khushdil'],
    last: ['Zaman', 'Ayub', 'Rauf', 'Shah', 'Ahmed', 'Mir', 'Agha', 'Wasim', 'Khan', 'Afridi', 'Shakeel', 'Nawaz', 'Qadir', 'Hasnain'],
  },
  ZA: {
    first: ['Aiden', 'Tristan', 'Marco', 'Kagiso', 'Anrich', 'Ryan', 'Heinrich', 'Tabraiz', 'Lungi', 'Gerald', 'Kwena', 'Reeza', 'Rassie', 'Donovan'],
    last: ['Markram', 'Stubbs', 'Jansen', 'Rabada', 'Nortje', 'Rickelton', 'Klaasen', 'Shamsi', 'Ngidi', 'Coetzee', 'Maphaka', 'Hendricks', 'Ferreira', 'Burger'],
  },
  WI: {
    first: ['Nicholas', 'Andre', 'Shimron', 'Shai', 'Rovman', 'Alzarri', 'Akeal', 'Gudakesh', 'Romario', 'Brandon', 'Johnson', 'Obed', 'Shamar', 'Matthew'],
    last: ['Pooran', 'Russell', 'Hetmyer', 'Hope', 'Powell', 'Joseph', 'Hosein', 'Motie', 'Shepherd', 'King', 'Charles', 'McCoy', 'Forde', 'Chase'],
  },
  BD: {
    first: ['Najmul', 'Towhid', 'Tanzid', 'Shakib', 'Taskin', 'Shoriful', 'Mehidy', 'Mahedi', 'Rishad', 'Jaker', 'Mahmudullah', 'Shamim', 'Afif', 'Hasan'],
    last: ['Shanto', 'Hridoy', 'Tamim', 'Hasan', 'Ahmed', 'Islam', 'Miraz', 'Hossain', 'Ali', 'Riyad', 'Patwari', 'Mahmud', 'Nasum', 'Sarkar'],
  },
  AE: {
    first: ['Muhammad', 'Vriitya', 'Aayan', 'Junaid', 'Alishan', 'Basil', 'Zahoor', 'Rohan', 'Karthik', 'Aryansh', 'Sanchit', 'Rahul', 'Zohaib', 'Akif'],
    last: ['Waseem', 'Aravind', 'Khan', 'Siddique', 'Sharafu', 'Hameed', 'Mustafa', 'Meiyappan', 'Sharma', 'Chopra', 'Bhatia', 'Raja', 'Zubair', 'Ali'],
  },
  GB: {
    first: ['Phil', 'Will', 'Sam', 'Liam', 'Jofra', 'Adil', 'Reece', 'Ben', 'Jordan', 'Gus', 'Jamie', 'Brydon', 'Luke', 'Tom'],
    last: ['Salt', 'Jacks', 'Curran', 'Livingstone', 'Archer', 'Rashid', 'Topley', 'Duckett', 'Cox', 'Atkinson', 'Overton', 'Carse', 'Wood', 'Banton'],
  },
};

const generatedSquadCache = new Map<string, Player[]>();

export function getGlobalTeamSquad(
  teamId: string,
  allPlayers: Player[],
  career?: CareerSave | null
): Player[] {
  const normId = (teamId || '').toUpperCase().trim();

  // 1. User's own franchise always uses their active career Playing XI & overrides
  if (career && career.franchiseId === normId) {
    const xiIds = (career.playingXiIds && career.playingXiIds.length === 11)
      ? career.playingXiIds
      : (career.squadPlayerIds || []).slice(0, 11);

    const resolved = xiIds
      .map(id => {
        const base = allPlayers.find(p => p.id === id);
        if (!base) return null;
        return career.careerPlayerOverrides?.[id]
          ? { ...base, ...career.careerPlayerOverrides[id] }
          : base;
      })
      .filter(Boolean) as Player[];

    if (resolved.length >= 11) return resolved.slice(0, 11);
  }

  // 2. IPL franchises use career.allFranchiseSquads or master database
  const iplIds = new Set(FRANCHISES.map(f => f.id));
  if (iplIds.has(normId)) {
    const rosterIds = career?.allFranchiseSquads?.[normId];
    if (rosterIds && rosterIds.length >= 11) {
      const mapped = rosterIds
        .slice(0, 11)
        .map(id => allPlayers.find(p => p.id === id))
        .filter(Boolean) as Player[];
      if (mapped.length >= 11) return mapped;
    }
    const dbTeam = allPlayers.filter(p => p.originalFranchiseId === normId);
    if (dbTeam.length >= 11) return dbTeam.slice(0, 11);
  }

  // 3. International Global Franchise Squads (cached & deterministic)
  if (generatedSquadCache.has(normId)) {
    return generatedSquadCache.get(normId)!;
  }

  const team = getGlobalTeamById(normId);
  const pool = REGION_PLAYER_NAMES[team.countryCode] || REGION_PLAYER_NAMES.AU;
  const seed = hashStr(normId);

  const roles: PlayerRole[] = [
    'Opening Batter',
    'Top-order Batter',
    'Wicketkeeper Batter',
    'Middle-order Batter',
    'Finisher',
    'Batting All-rounder',
    'Pace All-rounder',
    'Fast Bowler',
    'Fast-Medium Bowler',
    'Leg Spinner',
    'Off Spinner',
  ];

  const squad: Player[] = roles.map((role, idx) => {
    const first = idx === 0
      ? team.captainName.split(' ')[0]
      : pool.first[(seed + idx * 3) % pool.first.length];
    const last = idx === 0
      ? team.captainName.split(' ').slice(1).join(' ') || pool.last[0]
      : pool.last[(seed + idx * 5 + 2) % pool.last.length];
    const playerName = idx === 0 ? team.captainName : `${first} ${last}`;
    const shortName = `${first[0]}. ${last}`;
    const baseOvr = Math.max(70, Math.min(92, team.rating - 3 + ((seed + idx * 7) % 7)));

    const isBatter =
      role === 'Opening Batter' ||
      role === 'Top-order Batter' ||
      role === 'Middle-order Batter' ||
      role === 'Finisher';
    const isWk = role === 'Wicketkeeper Batter';
    const isAr = role === 'Batting All-rounder' || role === 'Pace All-rounder';
    const isSpinner = role === 'Leg Spinner' || role === 'Off Spinner';
    const isPace = role === 'Fast Bowler' || role === 'Fast-Medium Bowler' || role === 'Pace All-rounder';
    const isBowler = isSpinner || role === 'Fast Bowler' || role === 'Fast-Medium Bowler';

    const ratingTier = baseOvr >= 90 ? 'Platinum' : baseOvr >= 85 ? 'Diamond' : baseOvr >= 80 ? 'Gold' : 'Silver';
    const bowlingType =
      role === 'Leg Spinner'
        ? 'Leg Spin'
        : role === 'Off Spinner'
        ? 'Off Spin'
        : isPace
        ? 'Fast'
        : isAr
        ? 'Fast-Medium'
        : 'None';

    return {
      id: `GCL_${normId}_${idx + 1}`,
      name: playerName,
      shortName,
      age: 24 + ((seed + idx) % 10),
      country: team.country,
      nationality: team.country,
      isOverseas: team.countryCode !== 'IN',
      isReal: true,
      isCapped: true,
      isFictional: false,
      originalFranchiseId: normId,
      rosterStatus: 'Active',
      verificationStatus: 'Verified Domestic / Global',
      primaryRole: role,
      battingHand: idx % 3 === 0 ? 'Left Hand' : 'Right Hand',
      bowlingType,
      bowlingArm: bowlingType === 'None' ? 'None' : idx % 4 === 0 ? 'Left Arm' : 'Right Arm',
      bowlingSpeedClass: isPace
        ? 'Fast (138-144 km/h)'
        : isSpinner
        ? 'Slow / Spin (80-105 km/h)'
        : isAr
        ? 'Fast-Medium (130-137 km/h)'
        : 'Non-Bowler',
      isWicketkeeper: isWk,
      overallRating: baseOvr,
      potentialRating: Math.min(95, baseOvr + 3),
      ratingTier,
      currentForm: 78 + ((seed + idx) % 15),
      fitness: 90,
      experience: 75 + ((seed + idx) % 20),
      batting: {
        timing: isBatter || isWk ? baseOvr + 1 : isAr ? baseOvr - 3 : 42,
        power: isBatter || isAr ? baseOvr : 40,
        technique: isBatter || isWk ? baseOvr : isAr ? baseOvr - 4 : 42,
        paceHandling: isBatter || isWk ? baseOvr : isAr ? baseOvr - 5 : 40,
        spinHandling: isBatter || isWk ? baseOvr - 1 : isAr ? baseOvr - 5 : 38,
        finishing: role === 'Finisher' || isAr ? baseOvr + 2 : isBatter ? baseOvr - 2 : 35,
        runningBetweenWickets: 78,
      },
      ...(isPace || isAr
        ? {
            paceBowling: {
              speed: role === 'Fast Bowler' ? baseOvr + 1 : baseOvr - 3,
              swing: baseOvr - 2,
              seam: baseOvr - 2,
              control: isBowler ? baseOvr : baseOvr - 5,
              variations: baseOvr - 3,
              deathBowling: isBowler ? baseOvr - 1 : baseOvr - 6,
            },
          }
        : {}),
      ...(isSpinner
        ? {
            spinBowling: {
              turn: baseOvr,
              flight: baseOvr - 1,
              control: baseOvr + 1,
              accuracy: baseOvr,
              hasSpecialVariation: true,
              variationType: role === 'Leg Spinner' ? 'Googly' : 'Carrom Ball',
            },
          }
        : {}),
      fielding: {
        catching: isWk ? 88 : 76,
        throwing: 76,
        agility: 78,
        wicketkeeping: isWk ? 88 : 20,
      },
      mental: {
        consistency: 80,
        pressureHandling: 78,
        temperament: 80,
        leadership: idx === 0 ? 88 : 65,
      },
      fitnessAttributes: {
        stamina: 88,
        recovery: 84,
        injuryResistance: 82,
      },
      attributes: {
        batting: isBatter || isWk ? baseOvr + 2 : isAr ? baseOvr - 4 : 35,
        power: isBatter || isAr ? baseOvr : 40,
        timing: isBatter || isWk ? baseOvr + 1 : 45,
        technique: isBatter || isWk ? baseOvr : 45,
        runningBetweenWickets: 78,
        bowling: isBowler ? baseOvr + 2 : isAr ? baseOvr - 4 : 25,
        paceOrSpin: isBowler || isAr ? baseOvr : 20,
        accuracy: isBowler ? baseOvr + 1 : isAr ? baseOvr - 5 : 25,
        economy: isBowler ? baseOvr : isAr ? baseOvr - 6 : 30,
        wicketTaking: isBowler ? baseOvr + 2 : isAr ? baseOvr - 4 : 20,
        fielding: 76,
        catching: isWk ? 88 : 76,
        wicketkeeping: isWk ? 87 : 20,
        reflexes: isWk ? 86 : 75,
        fitness: 88,
        stamina: 88,
        temperament: 80,
        consistency: 80,
        leadership: idx === 0 ? 88 : 65,
      },
      careerStats: {
        matches: null,
        runs: null,
        strikeRate: null,
        wickets: null,
        economy: null,
      },
      contract: {
        currentFranchiseId: normId,
        baseAuctionPriceCr: 2,
        salaryExpectationCr: 4,
        contractStatus: 'Contracted',
        seasonsPlayed: 3,
      },
      isRetired: false,
    };
  });

  generatedSquadCache.set(normId, squad);
  return squad;
}
