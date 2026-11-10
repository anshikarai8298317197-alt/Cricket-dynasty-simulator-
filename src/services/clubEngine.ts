/**
 * WICKET DYNASTY - Club Management & Financial Engine (Phase 06)
 * Stadium Facilities, Youth Academy, Scouting, Sponsor Ledger, Aging & Retirement
 */
import { Franchise } from '../types/franchise';
import { Player } from '../types/player';
import { CareerSave } from '../types/career';
import {
  ClubProfile,
  FinancialTransaction,
  RetiredPlayerRecord,
  Scout,
  ScoutingReport,
  SponsorContract,
  StadiumFacility,
  YouthProspect,
} from '../types/club';

export class ClubEngine {
  /**
   * Generates initial Club Profile for a new career or initialized franchise
   */
  static generateInitialClubProfile(franchise: Franchise, careerId: string): ClubProfile {
    const facilities: StadiumFacility[] = [
      {
        id: 'STAD_SEATING',
        name: 'Grandstand & Fan Seating',
        level: 3,
        description: 'Tiered covered grandstands with premium acoustic roof and digital scoreboards.',
        upgradeCostCr: 6.0,
        maintenancePerSeasonCr: 0.8,
        benefitText: '+10,000 Stadium Capacity & +15% Matchday Ticket Revenue',
      },
      {
        id: 'STAD_PITCH',
        name: 'Curator Centre & Soil Labs',
        level: 3,
        description: 'Laser-levelled clay rolling strips and sub-surface moisture drainage.',
        upgradeCostCr: 4.5,
        maintenancePerSeasonCr: 0.6,
        benefitText: 'Custom home pitch preparation & greentop/spin optimization',
      },
      {
        id: 'STAD_LIGHTS',
        name: 'LED Floodlight Towers',
        level: 4,
        description: 'Broadcast-grade 2000-lux flicker-free LED arrays for night games.',
        upgradeCostCr: 3.5,
        maintenancePerSeasonCr: 0.5,
        benefitText: '+8% Evening Match Broadcast Revenue & Sponsor Visibility',
      },
      {
        id: 'STAD_HOSPITALITY',
        name: 'Corporate Suites & VIP Lounges',
        level: 2,
        description: 'Air-conditioned luxury viewing boxes for franchise owners and sponsors.',
        upgradeCostCr: 5.0,
        maintenancePerSeasonCr: 0.7,
        benefitText: '+₹3.5 Cr Seasonal Corporate Hospitality Revenue',
      },
      {
        id: 'STAD_DRESSING',
        name: 'Elite Player Dressing Rooms',
        level: 3,
        description: 'Ice tubs, tactical whiteboard suites, and recovery massage tables.',
        upgradeCostCr: 4.0,
        maintenancePerSeasonCr: 0.4,
        benefitText: '+5% Morale & Post-Match Fatigue Dissipation',
      },
    ];

    const initialProspects: YouthProspect[] = [
      this.generateYouthProspect(3, 2026, 'Opening Batter', franchise.id),
      this.generateYouthProspect(3, 2026, 'Fast Bowler', franchise.id),
      this.generateYouthProspect(3, 2026, 'Spin All-rounder', franchise.id),
    ];

    const scouts: Scout[] = [
      {
        id: 'SCT_01',
        name: 'Pravin Amre',
        qualityRating: 88,
        specialisation: 'Domestic Talents',
        salaryPerSeasonCr: 1.2,
      },
      {
        id: 'SCT_02',
        name: 'Tom Moody',
        qualityRating: 91,
        specialisation: 'Overseas Gems',
        salaryPerSeasonCr: 1.8,
      },
    ];

    const activeSponsors: SponsorContract[] = [
      {
        id: 'SPON_01',
        sponsorName: 'Apex Energy Drinks',
        category: 'Main Jersey',
        annualPayoutCr: 18.0,
        contractYearsRemaining: 3,
        minReputationRequired: 65,
        bonusCondition: 'Qualify for Playoffs',
        bonusPayoutCr: 3.0,
      },
      {
        id: 'SPON_02',
        sponsorName: 'Titanium Auto',
        category: 'Kit Partner',
        annualPayoutCr: 8.5,
        contractYearsRemaining: 2,
        minReputationRequired: 60,
      },
      {
        id: 'SPON_03',
        sponsorName: 'Nexus Cloud',
        category: 'Digital Partner',
        annualPayoutCr: 5.0,
        contractYearsRemaining: 1,
        minReputationRequired: 55,
      },
    ];

    const initialLedger: FinancialTransaction[] = [
      {
        id: `tx_init_${Date.now()}`,
        careerId,
        seasonNumber: 1,
        type: 'INCOME',
        category: 'PRIZE_MONEY',
        amountCr: franchise.startingPurseCr,
        timestamp: Date.now(),
        dateStr: 'Pre-Season',
        description: 'Initial Franchise Purse & Club Treasury Allocation',
      },
      {
        id: `tx_spon_${Date.now()}`,
        careerId,
        seasonNumber: 1,
        type: 'INCOME',
        category: 'SPONSORSHIP',
        amountCr: 31.5,
        timestamp: Date.now(),
        dateStr: 'Pre-Season',
        description: 'Season 1 Initial Commercial Sponsorship Inflow',
      },
    ];

    return {
      clubLevel: 3,
      reputation: 75,
      fanBaseMillions: 12.5,
      brandValueCr: 420.0,
      stadiumCapacity: 48000,
      stadiumName: franchise.homeStadium,
      stadiumLevel: 3,
      pitchQuality: 'Balanced Surface',
      stadiumFacilities: facilities,
      academyLevel: 3,
      youthProspects: initialProspects,
      scouts,
      scoutingReports: [],
      activeSponsors,
      objectives: [
        {
          id: 'OBJ_01',
          title: 'Playoff Qualification',
          description: 'Finish in the Top 4 of the league stage to secure a playoff berth.',
          targetType: 'REACH_PLAYOFFS',
          targetValue: 4,
          currentValue: 0,
          rewardCr: 5.0,
          isCompleted: false,
        },
        {
          id: 'OBJ_02',
          title: 'Upgrade Stadium Capacity',
          description: 'Expand grandstands to surpass 55,000 capacity.',
          targetType: 'STADIUM_CAPACITY',
          targetValue: 55000,
          currentValue: 48000,
          rewardCr: 3.5,
          isCompleted: false,
        },
        {
          id: 'OBJ_03',
          title: 'Promote Youth Graduate',
          description: 'Promote an academy prospect to the senior playing roster.',
          targetType: 'DEVELOP_YOUTH',
          targetValue: 1,
          currentValue: 0,
          rewardCr: 2.0,
          isCompleted: false,
        },
      ],
      financialLedger: initialLedger,
      retiredArchive: [],
      seasonHistory: [],
    };
  }

  /**
   * Procedural fictional youth player generation (marked FICTIONAL with unique ID)
   */
  static generateYouthProspect(
    academyLevel: number,
    seasonYear: number,
    preferredRole?: string,
    franchiseId?: string
  ): YouthProspect {
    const firstNames = ['Arnav', 'Rohan', 'Kabir', 'Dev', 'Vivaan', 'Reyansh', 'Ishaan', 'Aarav', 'Neil', 'Samar'];
    const lastNames = ['Kulkarni', 'Bose', 'Singhania', 'Nair', 'Chopra', 'Gill', 'Pandey', 'Deshmukh', 'Saxena', 'Mehta'];
    const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
      lastNames[Math.floor(Math.random() * lastNames.length)]
    }`;

    const roles = [
      'Opening Batter',
      'Top-order Batter',
      'Middle-order Batter',
      'Fast Bowler',
      'Express Fast Bowler',
      'Leg Spinner',
      'Off Spinner',
      'Wicketkeeper Batter',
      'Batting All-rounder',
      'Pace All-rounder',
    ];
    const role = preferredRole || roles[Math.floor(Math.random() * roles.length)];
    const age = Math.floor(Math.random() * 3) + 17; // 17 to 19

    // Base attributes scaled by academy level
    const baseSkill = 60 + academyLevel * 3 + Math.floor(Math.random() * 6);
    const potential = Math.min(94, baseSkill + 14 + Math.floor(Math.random() * 12));

    const id = `YOUTH_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const prospect: YouthProspect = {
      id,
      name,
      shortName: name.split(' ')[0],
      age,
      nationality: 'India',
      isOverseas: false,
      isReal: false,
      isCapped: false,
      verificationStatus: 'Fictional Original',
      primaryRole: role as any,
      battingHand: Math.random() > 0.3 ? 'Right Hand' : 'Left Hand',
      bowlingArm: role.includes('Bowler') || role.includes('All-rounder') ? 'Right Arm' : 'None',
      bowlingType: role.includes('Spinner') ? 'Leg Spin' : role.includes('Fast') ? 'Fast' : 'None',
      bowlingSpeedClass: role.includes('Express') ? 'Express (145+ km/h)' : 'Non-Bowler',
      isWicketkeeper: role.includes('Wicketkeeper'),
      currentForm: 75,
      fitness: 95,
      experience: 15,
      isRetired: false,
      careerStats: {
        matches: 0,
        runs: 0,
        highestScore: 0,
        battingAverage: 0,
        strikeRate: 0,
        fifties: 0,
        hundreds: 0,
        fours: 0,
        sixes: 0,
        wickets: 0,
        bestBowling: '0/0',
        bowlingAverage: 0,
        economy: 0,
        catches: 0,
        stumpings: 0,
      },
      ratingTier: 'Silver',
      overallRating: baseSkill,
      potentialRating: potential,
      batting: {
        timing: baseSkill,
        power: baseSkill - 2,
        technique: baseSkill + 2,
        paceHandling: baseSkill,
        spinHandling: baseSkill,
        finishing: baseSkill - 4,
        runningBetweenWickets: 75,
      },
      paceBowling: role.includes('Fast')
        ? {
            speed: baseSkill + 4,
            swing: baseSkill,
            seam: baseSkill + 2,
            control: baseSkill - 4,
            variations: baseSkill - 6,
            deathBowling: baseSkill - 2,
          }
        : undefined,
      spinBowling: role.includes('Spinner')
        ? {
            turn: baseSkill + 4,
            flight: baseSkill,
            control: baseSkill - 2,
            accuracy: baseSkill - 2,
            hasSpecialVariation: Math.random() > 0.5,
          }
        : undefined,
      fielding: {
        catching: 74,
        throwing: 76,
        agility: 78,
      },
      mental: {
        consistency: 68,
        pressureHandling: 66,
        temperament: 72,
        leadership: 60,
      },
      fitnessAttributes: {
        stamina: 82,
        recovery: 85,
        injuryResistance: 80,
      },
      contract: {
        currentFranchiseId: franchiseId || null,
        baseAuctionPriceCr: 0.3,
        salaryExpectationCr: 0.5,
        contractStatus: 'Contracted',
        seasonsPlayed: 0,
      },
      originalFranchiseId: franchiseId || 'CSK',
      academyIntakeYear: seasonYear,
      readinessPercentage: Math.floor(Math.random() * 35) + 50,
      scoutedPotentialBadge: potential >= 90 ? 'Exceptional' : potential >= 84 ? 'High' : 'Solid',
    };

    return prospect;
  }

  /**
   * Promotes an academy prospect to the senior franchise squad
   */
  static promoteYouthProspect(career: CareerSave, youthId: string): CareerSave {
    const profile = career.clubProfile as ClubProfile;
    if (!profile) return career;

    const prospect = profile.youthProspects.find(p => p.id === youthId);
    if (!prospect) return career;

    // Check squad size limit (max 25)
    if (career.squadPlayerIds.length >= (career.rules?.squadSizeMax || 25)) {
      throw new Error(`Squad is full! Maximum limit of ${career.rules?.squadSizeMax || 25} players reached.`);
    }

    const updatedProspects = profile.youthProspects.filter(p => p.id !== youthId);
    const updatedSquad = [...career.squadPlayerIds, prospect.id];
    const updatedOverrides = {
      ...(career.careerPlayerOverrides || {}),
      [prospect.id]: prospect,
    };

    // Objective progress check
    const updatedObjectives = profile.objectives.map(obj => {
      if (obj.targetType === 'DEVELOP_YOUTH' && !obj.isCompleted) {
        return { ...obj, currentValue: obj.currentValue + 1, isCompleted: true };
      }
      return obj;
    });

    const tx: FinancialTransaction = {
      id: `tx_prom_${Date.now()}`,
      careerId: career.id,
      seasonNumber: career.currentSeason,
      type: 'EXPENSE',
      category: 'ACADEMY_EXPENSE',
      amountCr: 0.5,
      timestamp: Date.now(),
      dateStr: 'Youth Intake',
      description: `Contract signing bonus for promoted youth graduate ${prospect.name}`,
    };

    return {
      ...career,
      squadPlayerIds: updatedSquad,
      careerPlayerOverrides: updatedOverrides,
      purseBalanceCr: Math.max(0, Number((career.purseBalanceCr - 0.5).toFixed(2))),
      clubProfile: {
        ...profile,
        youthProspects: updatedProspects,
        objectives: updatedObjectives,
        financialLedger: [tx, ...profile.financialLedger],
      },
      lastPlayedAt: Date.now(),
    };
  }

  /**
   * Upgrades a Stadium Facility and deducts cost
   */
  static upgradeStadiumFacility(career: CareerSave, facilityId: string): CareerSave {
    const profile = career.clubProfile as ClubProfile;
    if (!profile) return career;

    const fac = profile.stadiumFacilities.find(f => f.id === facilityId);
    if (!fac) return career;

    if (fac.level >= 5) {
      throw new Error('Facility is already at Maximum Level 5.');
    }

    if (career.purseBalanceCr < fac.upgradeCostCr) {
      throw new Error(`Insufficient funds! Requires ₹${fac.upgradeCostCr} Cr.`);
    }

    const updatedFacilities = profile.stadiumFacilities.map(f => {
      if (f.id === facilityId) {
        return {
          ...f,
          level: f.level + 1,
          upgradeCostCr: Number((f.upgradeCostCr * 1.35).toFixed(2)),
          maintenancePerSeasonCr: Number((f.maintenancePerSeasonCr * 1.2).toFixed(2)),
        };
      }
      return f;
    });

    let extraCapacity = 0;
    if (facilityId === 'STAD_SEATING') extraCapacity = 10000;

    const tx: FinancialTransaction = {
      id: `tx_stad_${Date.now()}`,
      careerId: career.id,
      seasonNumber: career.currentSeason,
      type: 'EXPENSE',
      category: 'STADIUM_UPGRADE',
      amountCr: fac.upgradeCostCr,
      timestamp: Date.now(),
      dateStr: 'Mid-Season',
      description: `Upgraded ${fac.name} to Level ${fac.level + 1}`,
    };

    const newCapacity = profile.stadiumCapacity + extraCapacity;

    return {
      ...career,
      purseBalanceCr: Number((career.purseBalanceCr - fac.upgradeCostCr).toFixed(2)),
      clubProfile: {
        ...profile,
        stadiumCapacity: newCapacity,
        stadiumFacilities: updatedFacilities,
        financialLedger: [tx, ...profile.financialLedger],
      },
      lastPlayedAt: Date.now(),
    };
  }

  /**
   * Dispatches scout on regional assignment
   */
  static dispatchScout(
    career: CareerSave,
    scoutId: string,
    region: any,
    targetRole: string,
    allPlayers: Player[]
  ): CareerSave {
    const profile = career.clubProfile as ClubProfile;
    if (!profile) return career;

    const costCr = 0.5;
    if (career.purseBalanceCr < costCr) {
      throw new Error(`Insufficient funds for scouting assignment (Requires ₹${costCr} Cr).`);
    }

    const scout = profile.scouts.find(s => s.id === scoutId);
    if (!scout) return career;

    const candidatePool = allPlayers.filter(
      p => !career.squadPlayerIds.includes(p.id) && (targetRole === 'ALL' || p.primaryRole.includes(targetRole))
    );
    const candidate = candidatePool[Math.floor(Math.random() * candidatePool.length)] || allPlayers[0];

    const report: ScoutingReport = {
      id: `rep_${Date.now()}`,
      player: candidate,
      scoutedBy: scout.name,
      accuracyConfidence: Math.floor(Math.random() * 15) + scout.qualityRating - 5,
      keyNotes: `Highly effective in match scenarios. Demonstrates exceptional temperament under pressure. Recommended target for upcoming auction.`,
      recommendedMaxAuctionCr: Number((candidate.contract.salaryExpectationCr * 1.25).toFixed(2)),
      dateGenerated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };

    const tx: FinancialTransaction = {
      id: `tx_sct_${Date.now()}`,
      careerId: career.id,
      seasonNumber: career.currentSeason,
      type: 'EXPENSE',
      category: 'SCOUTING_COST',
      amountCr: costCr,
      timestamp: Date.now(),
      dateStr: 'Scouting',
      description: `Scouting expedition by ${scout.name} in ${region}`,
    };

    return {
      ...career,
      purseBalanceCr: Number((career.purseBalanceCr - costCr).toFixed(2)),
      clubProfile: {
        ...profile,
        scoutingReports: [report, ...profile.scoutingReports].slice(0, 30),
        financialLedger: [tx, ...profile.financialLedger],
      },
      lastPlayedAt: Date.now(),
    };
  }

  /**
   * Process End of Season Financial Accounts (Prize money, sponsors, salaries, maintenance)
   */
  static processSeasonFinances(
    career: CareerSave,
    tournamentFinishRank: number
  ): { updatedCareer: CareerSave; netProfitCr: number } {
    const profile = (career.clubProfile || this.generateInitialClubProfile(career as any, career.id)) as ClubProfile;

    // 1. Prize Money
    let prizeCr = 2.5;
    if (tournamentFinishRank === 1) prizeCr = 20.0;
    else if (tournamentFinishRank === 2) prizeCr = 12.5;
    else if (tournamentFinishRank <= 4) prizeCr = 8.0;

    // 2. Sponsor Payouts
    const sponsorPayoutCr = profile.activeSponsors.reduce((acc, s) => acc + s.annualPayoutCr, 0);

    // 3. Matchday & Gate Receipts
    const ticketRevenueCr = Number(((profile.stadiumCapacity * 14 * 400) / 10000000).toFixed(2)); // ~₹26.8 Cr

    // 4. Player & Staff Salaries
    const staffSalaryCr = profile.scouts.reduce((acc, s) => acc + s.salaryPerSeasonCr, 0) + 12.0; // coaches ~12 Cr
    const squadSalaryCr = 65.0; // Base franchise contract burden

    // 5. Stadium Maintenance
    const maintenanceCr = profile.stadiumFacilities.reduce((acc, f) => acc + f.maintenancePerSeasonCr, 0);

    const totalIncome = prizeCr + sponsorPayoutCr + ticketRevenueCr;
    const totalExpense = staffSalaryCr + squadSalaryCr + maintenanceCr;
    const netProfitCr = Number((totalIncome - totalExpense).toFixed(2));

    const txIncome: FinancialTransaction = {
      id: `tx_end_inc_${Date.now()}`,
      careerId: career.id,
      seasonNumber: career.currentSeason,
      type: 'INCOME',
      category: 'PRIZE_MONEY',
      amountCr: totalIncome,
      timestamp: Date.now(),
      dateStr: `Season ${career.currentSeason} Concluded`,
      description: `Prize money (Rank ${tournamentFinishRank}), sponsors & ticket revenue`,
    };

    const txExpense: FinancialTransaction = {
      id: `tx_end_exp_${Date.now()}`,
      careerId: career.id,
      seasonNumber: career.currentSeason,
      type: 'EXPENSE',
      category: 'PLAYER_SALARIES',
      amountCr: totalExpense,
      timestamp: Date.now(),
      dateStr: `Season ${career.currentSeason} Concluded`,
      description: `Squad salaries, coaching staff payroll & stadium upkeep`,
    };

    const newPurse = Math.max(10.0, Number((career.purseBalanceCr + netProfitCr).toFixed(2)));

    const updatedCareer: CareerSave = {
      ...career,
      purseBalanceCr: newPurse,
      clubProfile: {
        ...profile,
        brandValueCr: Number((profile.brandValueCr + (tournamentFinishRank <= 4 ? 45.0 : 10.0)).toFixed(1)),
        reputation: Math.min(99, profile.reputation + (tournamentFinishRank === 1 ? 8 : tournamentFinishRank <= 4 ? 4 : 1)),
        financialLedger: [txIncome, txExpense, ...profile.financialLedger],
      },
      lastPlayedAt: Date.now(),
    };

    return { updatedCareer, netProfitCr };
  }

  /**
   * Persistent player aging across seasons and retirement evaluation at age 40 (max 42 with 2 extensions)
   */
  static agePlayersAndCheckRetirement(
    career: CareerSave,
    allPlayers: Player[]
  ): {
    updatedCareer: CareerSave;
    retiredPlayers: Player[];
    extendedPlayers: Player[];
  } {
    const profile = (career.clubProfile || this.generateInitialClubProfile(career as any, career.id)) as ClubProfile;
    const overrides = { ...(career.careerPlayerOverrides || {}) };

    const newlyRetired: Player[] = [];
    const extended: Player[] = [];
    const remainingSquadIds: string[] = [];

    career.squadPlayerIds.forEach(id => {
      const base = allPlayers.find(p => p.id === id);
      if (!base) return;

      const current = overrides[id] ? { ...base, ...overrides[id] } : { ...base };

      // Advance age by exactly +1
      current.age += 1;

      // Natural skill aging curve
      if (current.age <= 24) {
        // Youth rapid development
        current.batting.timing = Math.min(99, current.batting.timing + 1);
        current.batting.technique = Math.min(99, current.batting.technique + 1);
        if (current.overallRating < current.potentialRating) {
          current.overallRating += 1;
        }
      } else if (current.age >= 35) {
        // Veteran gradual physical decay
        current.fitnessAttributes.stamina = Math.max(60, current.fitnessAttributes.stamina - 2);
        current.fielding.agility = Math.max(60, current.fielding.agility - 1);
      }

      // Retirement Rule: At age 40
      if (current.age >= 40) {
        // Check if player has rewarded extensions left (max 2 extensions, max age 42)
        const archiveRecord = profile.retiredArchive?.find(r => r.playerId === current.id);
        const extensionsUsed = archiveRecord?.extensionsUsed || 0;

        if (current.age < 42 && extensionsUsed < 2) {
          // Player receives 1-year career extension
          extended.push(current);
          remainingSquadIds.push(current.id);
          overrides[current.id] = current;
        } else {
          // Hard retirement at 40 (or 42 if extended)
          newlyRetired.push(current);

          const retRecord: RetiredPlayerRecord = {
            playerId: current.id,
            name: current.name,
            franchiseId: career.franchiseId,
            role: current.primaryRole,
            retirementAge: current.age,
            retiredSeason: career.currentSeason,
            careerMatches: current.careerStats?.matches || 140,
            careerRuns: current.careerStats?.runs || 4200,
            careerWickets: current.careerStats?.wickets || 85,
            highestScore: current.careerStats?.highestScore || 98,
            bestBowling: current.careerStats?.bestBowling || '4/22',
            trophiesWon: career.statsSummary.trophies || 1,
            orangeCaps: 0,
            purpleCaps: 0,
            extensionsUsed: extensionsUsed + 1,
          };

          profile.retiredArchive = [retRecord, ...(profile.retiredArchive || [])];
        }
      } else {
        remainingSquadIds.push(current.id);
        overrides[current.id] = current;
      }
    });

    const updatedCareer: CareerSave = {
      ...career,
      squadPlayerIds: remainingSquadIds,
      playingXiIds: remainingSquadIds.slice(0, 11),
      careerPlayerOverrides: overrides,
      clubProfile: profile,
      lastPlayedAt: Date.now(),
    };

    return {
      updatedCareer,
      retiredPlayers: newlyRetired,
      extendedPlayers: extended,
    };
  }
}
