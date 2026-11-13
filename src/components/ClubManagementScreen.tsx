/**
 * WICKET DYNASTY - Club Headquarters & Multi-Season Management (SCR_21 / SCR_22)
 * Stadium Upgrades, Youth Academy, Scouting, Financial Ledger, Sponsors, Hall of Fame & Next Season Transition
 */
import React, { useState } from 'react';
import { CareerSave } from '../types/career';
import { Player } from '../types/player';
import { TournamentState } from '../types/tournament';
import { ClubEngine } from '../services/clubEngine';
import { GlobalSeasonEngine } from '../services/globalSeasonEngine';
import { InjuryEngine } from '../services/injuryEngine';
import { LevelPlayService } from '../services/levelPlayService';
import { DbPersistence } from '../services/dbPersistence';
import { FRANCHISES } from '../data/franchises';
import { ClubProfile } from '../types/club';
import { FranchiseLogo } from './FranchiseLogo';
import { TrophyShelf } from './TrophyShelf';
import {
  Building2,
  Trophy,
  Users,
  Wallet,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  HeartPulse,
  Eye,
  Briefcase,
  Layers,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Video,
} from 'lucide-react';

interface ClubManagementScreenProps {
  career: CareerSave;
  allPlayers: Player[];
  tournament: TournamentState;
  onUpdateCareer: (updated: CareerSave) => void;
  onBack: () => void;
}

type ClubSubTab =
  | 'OVERVIEW'
  | 'STADIUM'
  | 'ACADEMY'
  | 'SCOUTING'
  | 'MEDICAL'
  | 'FINANCES'
  | 'SPONSORS'
  | 'RECORDS';

export const ClubManagementScreen: React.FC<ClubManagementScreenProps> = ({
  career,
  allPlayers,
  tournament,
  onUpdateCareer,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<ClubSubTab>('OVERVIEW');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNextSeasonModal, setShowNextSeasonModal] = useState(false);
  const [adBusy, setAdBusy] = useState(false);

  const franchise = FRANCHISES.find(f => f.id === career.franchiseId) || FRANCHISES[0];

  // Initialize or fetch ClubProfile
  const profile: ClubProfile =
    career.clubProfile || ClubEngine.generateInitialClubProfile(franchise, career.id);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Promote Youth Prospect
  const handlePromoteYouth = (youthId: string) => {
    try {
      const updated = ClubEngine.promoteYouthProspect(career, youthId);
      onUpdateCareer(updated);
      notify('Youth prospect promoted to senior squad successfully!');
    } catch (e: any) {
      notify(e.message);
    }
  };

  // 2. Upgrade Stadium Facility
  const handleUpgradeFacility = (facilityId: string) => {
    try {
      const updated = ClubEngine.upgradeStadiumFacility(career, facilityId);
      onUpdateCareer(updated);
      notify('Facility upgrade completed!');
    } catch (e: any) {
      notify(e.message);
    }
  };

  // 3. Dispatch Scout
  const handleDispatchScout = (scoutId: string) => {
    try {
      const updated = ClubEngine.dispatchScout(career, scoutId, 'Domestic Talents', 'ALL', allPlayers);
      onUpdateCareer(updated);
      notify('Scouting assignment completed! New player dossier logged.');
    } catch (e: any) {
      notify(e.message);
    }
  };

  // Squad & Injury tracking (reflecting career aging/extension overrides)
  const squadIds = career.squadPlayerIds || [];
  const squadPlayers = squadIds
    .map(id => {
      const base = allPlayers.find(p => p.id === id);
      if (!base) return null;
      const ovr = career.careerPlayerOverrides?.[id];
      return ovr ? { ...base, ...ovr } : base;
    })
    .filter(Boolean) as Player[];

  const workloads = career.playerWorkloads || {};
  const injuredPlayers = squadPlayers.filter(p => workloads[p.id]?.isInjured);
  const atRiskPlayers = squadPlayers.filter(p => {
    const w = workloads[p.id];
    return !w?.isInjured && ((w?.stamina || p.fitness || 80) < 60 || (w?.fatigue || 0) > 60);
  });
  const veteranCandidates = squadPlayers.filter(p => (p.age ?? 0) >= 39 && (p.age ?? 0) < 42);

  // 5. Physio Rehab Treatment
  const handlePhysioTreatment = (playerId: string) => {
    try {
      const updated = InjuryEngine.applyPhysioSession(career, playerId);
      onUpdateCareer(updated);
      notify('Intensive Physio session completed! Recovery time accelerated by 2 days.');
    } catch (e: any) {
      notify(e.message);
    }
  };

  // 6. Cryotherapy Recovery Session
  const handleCryotherapy = (playerId: string) => {
    try {
      const updated = InjuryEngine.applyCryotherapy(career, playerId);
      onUpdateCareer(updated);
      notify('Cryotherapy Chamber session completed! +20 Stamina restored.');
    } catch (e: any) {
      notify(e.message);
    }
  };

  // Rewarded Ad Club Handlers
  const handleAdFacilitySponsor = async () => {
    if (adBusy) return;
    setAdBusy(true);
    const res = await LevelPlayService.showRewardedAd('FACILITY_UPGRADE_BOOST');
    setAdBusy(false);
    if (!res.completed || !res.rewardToken) {
      notify(res.reason || 'Ad not completed — facility grant not issued.');
      return;
    }
    try {
      const updated = ClubEngine.grantAdFacilitySponsor(career, res.rewardToken);
      onUpdateCareer(updated);
      notify('Verified! +₹2.5 Cr Infrastructure Sponsor Grant added to purse.');
    } catch (e: any) {
      notify(e.message);
    }
  };

  const handleAdYouthWonderkid = async () => {
    if (adBusy) return;
    setAdBusy(true);
    const res = await LevelPlayService.showRewardedAd('YOUTH_ACADEMY_BOOST');
    setAdBusy(false);
    if (!res.completed || !res.rewardToken) {
      notify(res.reason || 'Ad not completed — academy scout boost not granted.');
      return;
    }
    try {
      const { updatedCareer, prospect } = ClubEngine.grantAdYouthProspect(career, res.rewardToken);
      onUpdateCareer(updatedCareer);
      notify(`Wonderkid ${prospect.name} (Pot ${prospect.potentialRating}) discovered!`);
    } catch (e: any) {
      notify(e.message);
    }
  };

  const handleAdFreeScouting = async () => {
    if (adBusy) return;
    setAdBusy(true);
    const res = await LevelPlayService.showRewardedAd('SCOUTING_BONUS');
    setAdBusy(false);
    if (!res.completed || !res.rewardToken) {
      notify(res.reason || 'Ad not completed — VIP dossier not unlocked.');
      return;
    }
    try {
      const { updatedCareer, report } = ClubEngine.grantAdScoutingDossier(career, allPlayers, res.rewardToken);
      onUpdateCareer(updatedCareer);
      notify(`Free VIP Dossier unlocked: ${report.player.name} (OVR ${report.player.overallRating})`);
    } catch (e: any) {
      notify(e.message);
    }
  };

  const handleAdMedicalFastRehab = async (playerId: string, playerName: string) => {
    if (adBusy) return;
    const w = workloads[playerId];
    if (!w?.isInjured) return;
    setAdBusy(true);
    const res = await LevelPlayService.showRewardedAd('INJURY_RECOVERY_SPEEDUP');
    setAdBusy(false);
    if (!res.completed || !res.rewardToken) {
      notify(res.reason || 'Ad not completed — rehab speedup not granted.');
      return;
    }
    const dedupeKey = `club_med_rehab_${career.id}_${playerId}_${res.rewardToken}`;
    if (DbPersistence.hasProcessedEvent(dedupeKey)) return;
    DbPersistence.markEventProcessed(dedupeKey);

    const daysLeft = Math.max(0, (w.daysInjuredRemaining ?? w.injuryDetails?.recoveryDaysRemaining ?? 4) - 4);
    const nextWk = {
      ...w,
      isInjured: daysLeft > 0,
      daysInjuredRemaining: daysLeft,
      injuryDetails: daysLeft > 0 && w.injuryDetails ? { ...w.injuryDetails, recoveryDaysRemaining: daysLeft } : undefined,
      injuryType: daysLeft > 0 ? w.injuryType : undefined,
      injurySeverity: daysLeft > 0 ? w.injurySeverity : undefined,
      fitness: daysLeft === 0 ? Math.min(100, Math.max(84, (w.fitness || 75) + 15)) : w.fitness,
    };

    onUpdateCareer({
      ...career,
      playerWorkloads: { ...workloads, [playerId]: nextWk },
      lastPlayedAt: Date.now(),
    });
    notify(daysLeft === 0 ? `${playerName} cleared 100% match fit!` : `${playerName} injury reduced (-4 days)!`);
  };

  const handleAdMedicalCryo = async (playerId: string, playerName: string) => {
    if (adBusy) return;
    const w = workloads[playerId] || { playerId, fatigue: 20, fitness: 80, stamina: 70, injuryRiskScore: 5, isInjured: false };
    setAdBusy(true);
    const res = await LevelPlayService.showRewardedAd('PLAYER_FATIGUE_RECOVERY');
    setAdBusy(false);
    if (!res.completed || !res.rewardToken) {
      notify(res.reason || 'Ad not completed — free cryo recovery not granted.');
      return;
    }
    const dedupeKey = `club_med_cryo_${career.id}_${playerId}_${res.rewardToken}`;
    if (DbPersistence.hasProcessedEvent(dedupeKey)) return;
    DbPersistence.markEventProcessed(dedupeKey);

    const nextWk = {
      ...w,
      fatigue: Math.max(0, (w.fatigue || 0) - 30),
      stamina: Math.min(100, (w.stamina ?? 75) + 25),
      fitness: Math.min(100, (w.fitness ?? 80) + 10),
    };

    onUpdateCareer({
      ...career,
      playerWorkloads: { ...workloads, [playerId]: nextWk },
      lastPlayedAt: Date.now(),
    });
    notify(`Free Cryo Recovery completed for ${playerName}!`);
  };

  const handleAdExtendVeteran = async (playerId: string) => {
    if (adBusy) return;
    setAdBusy(true);
    const res = await LevelPlayService.showRewardedAd('RETIREMENT_EXTENSION');
    setAdBusy(false);
    if (!res.completed || !res.rewardToken) {
      notify(res.reason || 'Ad not completed — career extension not granted.');
      return;
    }
    try {
      const { updatedCareer, extensionsUsed, playerName } = ClubEngine.extendVeteranCareerViaAd(
        career,
        playerId,
        allPlayers,
        res.rewardToken
      );
      onUpdateCareer(updatedCareer);
      notify(`${playerName} career extended (+1 yr, ${extensionsUsed}/2 used, max age 42).`);
    } catch (e: any) {
      notify(e.message);
    }
  };

  // 4. Advance to Next Season (natural break interstitial)
  const handleConfirmNextSeason = async () => {
    await LevelPlayService.tryShowInterstitial('SEASON_END_SUMMARY', { protectedFlow: null });
    const { updatedCareer, retiredPlayers } = GlobalSeasonEngine.advanceToNextCalendarYear(
      career,
      allPlayers
    );
    onUpdateCareer(updatedCareer);
    setShowNextSeasonModal(false);
    notify(
      `Welcome to Season ${updatedCareer.currentSeason} (${updatedCareer.currentGameYear})! Opening Match Day ready. (${retiredPlayers.length} retired).`
    );
  };

  return (
    <div className="min-h-screen bg-[#080E1A] text-white flex flex-col font-sans select-none pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-full shadow-2xl text-xs flex items-center space-x-2 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[#0C1527] border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-black uppercase text-white tracking-wider flex items-center space-x-1.5">
              <span>Club Headquarters & Dynasty</span>
            </h1>
            <p className="text-[11px] text-amber-400 font-medium">
              {franchise.name} • Season {career.currentSeason} of 30
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Club Purse</span>
          <span className="text-xs font-mono font-black text-amber-400">
            ₹{career.purseBalanceCr.toFixed(2)} Cr
          </span>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="bg-[#0F1A30] border-b border-slate-800 px-3 py-2 flex items-center space-x-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'OVERVIEW', label: 'Club HQ' },
          { id: 'STADIUM', label: 'Stadium' },
          { id: 'ACADEMY', label: 'Youth Academy' },
          { id: 'MEDICAL', label: `Medical Center ${injuredPlayers.length > 0 ? `(${injuredPlayers.length})` : ''}` },
          { id: 'SCOUTING', label: 'Scouting' },
          { id: 'FINANCES', label: 'Financial Ledger' },
          { id: 'SPONSORS', label: 'Sponsorships' },
          { id: 'RECORDS', label: 'Hall of Fame' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ClubSubTab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-900/50 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-md mx-auto w-full space-y-4">
        {/* ======================= TAB 1: OVERVIEW (Master Reference Screen 12 Replica) ======================= */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            {/* Mode Switcher (Club HQ vs National HQ) */}
            <div className="flex bg-[#0A1224] p-1 rounded-xl border border-slate-800">
              <button
                className="flex-1 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md transition-all"
              >
                Club HQ
              </button>
              <button
                onClick={() => notify('National HQ unlocked upon winning the T20 Dynasty Trophy!')}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all"
              >
                National HQ
              </button>
            </div>

            {/* 3D Isometric Campus Interactive Map (Reference Screen 12) */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700/80 shadow-[0_8px_30px_rgba(0,0,0,0.8)] bg-[#0A1224]">
              {/* Isometric Campus 3D Illustration */}
              <img
                src="/src/assets/images/facilities_campus_isometric_1794244160238.jpg"
                alt="Cricket Club HQ Isometric 3D Campus"
                className="w-full h-80 object-cover object-center select-none"
                referrerPolicy="no-referrer"
              />

              {/* Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#091122]/90 via-transparent to-black/20 pointer-events-none" />

              {/* Floating 3D Interactive Facility Badges (Positioned over isometric structures) */}
              {/* 1. Center: Stadium */}
              <button
                onClick={() => setActiveTab('STADIUM')}
                className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#091224]/95 border-2 border-amber-400 text-white rounded-xl px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 transition-transform flex flex-col items-center cursor-pointer group"
              >
                <span className="text-[10px] font-bold text-slate-300">Stadium</span>
                <span className="text-xs font-black text-amber-300">
                  Lv. {profile.stadiumFacilities[0]?.level || 4}
                </span>
              </button>

              {/* 2. Left: Academy */}
              <button
                onClick={() => setActiveTab('ACADEMY')}
                className="absolute top-[48%] left-3 bg-[#091224]/95 border-2 border-slate-600 hover:border-amber-400 text-white rounded-xl px-2.5 py-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 transition-transform flex flex-col items-center cursor-pointer"
              >
                <span className="text-[9px] font-bold text-slate-300">Academy</span>
                <span className="text-xs font-black text-amber-300">Lv. {profile.academyLevel}</span>
              </button>

              {/* 3. Right: Training Nets */}
              <button
                onClick={() => setActiveTab('STADIUM')}
                className="absolute top-[48%] right-3 bg-[#091224]/95 border-2 border-slate-600 hover:border-amber-400 text-white rounded-xl px-2.5 py-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 transition-transform flex flex-col items-center cursor-pointer"
              >
                <span className="text-[9px] font-bold text-slate-300">Training</span>
                <span className="text-xs font-black text-emerald-400">
                  Lv. {profile.stadiumFacilities[1]?.level || 4}
                </span>
              </button>

              {/* 4. Bottom-Left: Medical Lab */}
              <button
                onClick={() => setActiveTab('MEDICAL')}
                className="absolute bottom-4 left-6 bg-[#091224]/95 border-2 border-slate-600 hover:border-amber-400 text-white rounded-xl px-2.5 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 transition-transform flex flex-col items-center cursor-pointer"
              >
                <span className="text-[9px] font-bold text-slate-300">Medical</span>
                <span className="text-xs font-black text-cyan-300">Lv. 3</span>
              </button>

              {/* 5. Bottom-Right: Analytics / Club HQ */}
              <button
                onClick={() => setActiveTab('FINANCES')}
                className="absolute bottom-4 right-6 bg-[#091224]/95 border-2 border-slate-600 hover:border-amber-400 text-white rounded-xl px-2.5 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 transition-transform flex flex-col items-center cursor-pointer"
              >
                <span className="text-[9px] font-bold text-slate-300">Analytics</span>
                <span className="text-xs font-black text-purple-300">Lv. 4</span>
              </button>
            </div>

            {/* Big 3D Golden Button: Upgrade Facility (Exact Reference Screen 12 Replica) */}
            <button
              onClick={() => setActiveTab('STADIUM')}
              className="w-full py-4 px-4 rounded-2xl btn-game-gold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer shadow-2xl"
            >
              <Building2 className="w-5 h-5 text-slate-950" />
              <span>Upgrade Facility</span>
            </button>

            {/* Club KPI Summary */}
            <div className="card-game-3d rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <FranchiseLogo franchiseId={franchise.id} size={36} className="rounded-xl shadow-md" />
                  <div>
                    <h3 className="text-xs font-black text-white">{franchise.name}</h3>
                    <p className="text-[10px] text-amber-400">Club Level {profile.clubLevel} • Reputation {profile.reputation}/100</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  ₹{career.purseBalanceCr.toFixed(1)} Cr Purse
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-[10px]">
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 block">Brand Value</span>
                  <span className="font-bold text-emerald-400 font-mono">₹{profile.brandValueCr} Cr</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 block">Fan Base</span>
                  <span className="font-bold text-amber-400 font-mono">{profile.fanBaseMillions}M</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 block">Capacity</span>
                  <span className="font-bold text-slate-200 font-mono">{profile.stadiumCapacity.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Animated Trophy Shelf with CSS Metallic Hover Effect */}
            <TrophyShelf career={career} tournament={tournament} profile={profile} />

            {/* Multi-Season Transition Action Card */}
            <div className="card-game-3d rounded-2xl p-4 border border-amber-500/40 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Next Season Transition</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Advance calendar to Season {career.currentSeason + 1}</p>
              </div>
              <button
                onClick={() => setShowNextSeasonModal(true)}
                className="py-2 px-3 rounded-xl btn-game-gold text-xs uppercase cursor-pointer"
              >
                Advance
              </button>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: STADIUM ======================= */}
        {activeTab === 'STADIUM' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase text-white">Stadium Infrastructure</h3>
                <p className="text-[10px] text-slate-400">{profile.stadiumName}</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Capacity: {profile.stadiumCapacity.toLocaleString()}
              </span>
            </div>

            {/* Optional Infrastructure Sponsor Grant (FACILITY_UPGRADE_BOOST) */}
            <div className="p-3 rounded-xl bg-[#101B33] border border-amber-500/30 flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-black text-white block">Stadium Sponsor Grant (Optional)</span>
                <span className="text-[10px] text-slate-400">Watch Ad for +₹2.5 Cr towards facility upgrades</span>
              </div>
              <button
                onClick={handleAdFacilitySponsor}
                disabled={adBusy}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-[10px] uppercase flex items-center space-x-1 shrink-0"
              >
                <Video className="w-3 h-3" />
                <span>+₹2.5 Cr Ad</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {profile.stadiumFacilities.map(fac => {
                const canAfford = career.purseBalanceCr >= fac.upgradeCostCr;
                const isMax = fac.level >= 5;

                return (
                  <div
                    key={fac.id}
                    className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{fac.name}</span>
                      <span className="text-xs font-black text-amber-400 font-mono">
                        Level {fac.level}/5
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300">{fac.description}</p>
                    <div className="text-[10px] text-emerald-400 font-medium bg-emerald-950/20 p-1.5 rounded">
                      {fac.benefitText}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-400 font-mono">
                        {isMax ? 'MAX LEVEL' : `Upgrade: ₹${fac.upgradeCostCr} Cr`}
                      </span>
                      {!isMax && (
                        <button
                          onClick={() => handleUpgradeFacility(fac.id)}
                          disabled={!canAfford}
                          className={`px-3 py-1 rounded-xl font-bold text-xs ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Upgrade
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 3: ACADEMY ======================= */}
        {activeTab === 'ACADEMY' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase text-white">Youth Development Academy</h3>
                <p className="text-[10px] text-slate-400">Original fictional prospects with verified IDs</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                Academy Level {profile.academyLevel}/5
              </span>
            </div>

            {/* Optional Youth Wonderkid Boost (YOUTH_ACADEMY_BOOST) */}
            <div className="p-3 rounded-xl bg-[#101B33] border border-purple-500/35 flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-black text-white block">Scout Wonderkid Intake (Optional)</span>
                <span className="text-[10px] text-slate-400">Watch Ad to unlock an Exceptional Potential prospect</span>
              </div>
              <button
                onClick={handleAdYouthWonderkid}
                disabled={adBusy}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-[10px] uppercase flex items-center space-x-1 shrink-0"
              >
                <Video className="w-3 h-3" />
                <span>Scout Ad</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {profile.youthProspects.map(prospect => (
                <div
                  key={prospect.id}
                  className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-xs block">{prospect.name}</span>
                      <span className="text-[10px] text-slate-400">
                        Age {prospect.age ?? 'N/A'} • {prospect.primaryRole}
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {prospect.scoutedPotentialBadge} Potential
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-900/60 p-2 rounded-lg font-mono">
                    <div>
                      <span className="text-slate-400 block">Current OVR</span>
                      <span className="font-bold text-amber-400">{prospect.overallRating}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Max Potential</span>
                      <span className="font-bold text-emerald-400">{prospect.potentialRating}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Readiness</span>
                      <span className="font-bold text-slate-200">{prospect.readinessPercentage}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePromoteYouth(prospect.id)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 rounded-xl text-xs uppercase"
                  >
                    Promote to Senior Squad (₹0.5 Cr Bonus)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB: MEDICAL CENTER & REHABILITATION ======================= */}
        {activeTab === 'MEDICAL' && (
          <div className="space-y-4">
            {/* Header & Facility Overview */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0F1E36] to-[#0A1224] border border-cyan-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <HeartPulse className="w-5 h-5 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Medical & Rehabilitation Complex
                    </h3>
                    <p className="text-[11px] text-cyan-300 font-medium">
                      Sports Science, Physiotherapy & Cryo-Lab
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  Level {profile.stadiumFacilities.find(f => f.id === 'fac_medical')?.level || 3}/5
                </span>
              </div>

              {/* High-level Squad Health KPIs */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-400 block uppercase">Match Fit</span>
                  <span className="text-xs font-black text-emerald-400">
                    {squadPlayers.length > 0
                      ? Math.round(((squadPlayers.length - injuredPlayers.length) / squadPlayers.length) * 100)
                      : 100}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Injured Out</span>
                  <span className="text-xs font-black text-red-400">{injuredPlayers.length}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Fatigued</span>
                  <span className="text-xs font-black text-amber-400">{atRiskPlayers.length}</span>
                </div>
              </div>
            </div>

            {/* Currently Injured Players (Infirmary) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>Infirmary ({injuredPlayers.length} Injured)</span>
                </h4>
                <span className="text-[10px] text-slate-400">Daily recovery active</span>
              </div>

              {injuredPlayers.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#0F1A30] border border-slate-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h5 className="text-xs font-bold text-white">All Players Fit & Available</h5>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Zero squad members are currently in the infirmary. Training and match workloads are within safe thresholds.
                  </p>
                </div>
              ) : (
                injuredPlayers.map(player => {
                  const wk = workloads[player.id];
                  const daysLeft = wk?.daysInjuredRemaining || 3;
                  const severity = wk?.injurySeverity || 'MODERATE';
                  const injuryName = wk?.injuryType || 'Hamstring Strain';

                  return (
                    <div
                      key={player.id}
                      className="p-3.5 rounded-2xl bg-[#121E36] border-2 border-red-500/50 shadow-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-white">{player.name}</span>
                            <span className="text-[10px] font-bold text-slate-400">{player.primaryRole}</span>
                          </div>
                          <p className="text-xs font-bold text-red-400 mt-0.5">{injuryName}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/40">
                          {severity}
                        </span>
                      </div>

                      {/* Recovery Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-300">
                          <span>Rehabilitation Progress</span>
                          <span className="text-amber-400 font-bold">{daysLeft} days remaining</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-amber-400 rounded-full"
                            style={{ width: `${Math.max(10, Math.min(95, 100 - daysLeft * 12))}%` }}
                          />
                        </div>
                      </div>

                      {/* Medical Actions */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                        <button
                          onClick={() => handlePhysioTreatment(player.id)}
                          className="py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1 active:scale-95 shadow transition-all"
                        >
                          <Sparkles className="w-3 h-3 text-slate-950" />
                          <span>Physio Rehab (-2d · ₹0.15 Cr)</span>
                        </button>

                        <button
                          onClick={() => handleCryotherapy(player.id)}
                          className="py-2 px-2.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600 border border-cyan-500 text-cyan-200 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1 active:scale-95 transition-all"
                        >
                          <HeartPulse className="w-3 h-3 text-cyan-300" />
                          <span>Cryo Chamber (₹0.10 Cr)</span>
                        </button>

                        <button
                          onClick={() => handleAdMedicalFastRehab(player.id, player.name)}
                          disabled={adBusy}
                          className="col-span-2 py-2 px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Watch Ad: Fast-Track Rehab (-4 Days Free)</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Fatigue & Injury Risk Watchlist */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Fatigue & Injury Risk Watchlist ({atRiskPlayers.length})</span>
              </h4>

              {atRiskPlayers.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No players are currently at high risk of injury.</p>
              ) : (
                <div className="space-y-2">
                  {atRiskPlayers.slice(0, 5).map(player => {
                    const wk = workloads[player.id];
                    const stamina = wk?.stamina ?? player.fitness;
                    const fatigue = wk?.fatigue ?? 20;

                    return (
                      <div
                        key={player.id}
                        className="p-2.5 rounded-xl bg-[#0F1A30] border border-slate-800 flex items-center justify-between text-xs gap-2"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">{player.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Stamina: <strong className="text-amber-400">{stamina}%</strong> • Fatigue: {fatigue}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            onClick={() => handleAdMedicalCryo(player.id, player.name)}
                            disabled={adBusy}
                            className="py-1 px-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-[10px] flex items-center space-x-1"
                          >
                            <Video className="w-3 h-3" />
                            <span>Ad Free</span>
                          </button>
                          <button
                            onClick={() => handleCryotherapy(player.id)}
                            className="py-1 px-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] hover:bg-cyan-900/60 transition-colors"
                          >
                            Cryo (₹0.1)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================= TAB 4: SCOUTING ======================= */}
        {activeTab === 'SCOUTING' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase text-white">Global Talent Scouts</h3>
                <p className="text-[10px] text-slate-400">Dispatch scouts to uncover hidden talents</p>
              </div>
              <span className="text-xs font-mono text-slate-400">{profile.scouts.length} Active Scouts</span>
            </div>

            {/* Optional Free VIP Scouting Dossier (SCOUTING_BONUS) */}
            <div className="p-3 rounded-xl bg-[#101B33] border border-amber-500/30 flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-black text-white block">Free VIP Scouting Dossier (Optional)</span>
                <span className="text-[10px] text-slate-400">Watch Ad for a high-rated target report (₹0 Cr)</span>
              </div>
              <button
                onClick={handleAdFreeScouting}
                disabled={adBusy}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-[10px] uppercase flex items-center space-x-1 shrink-0"
              >
                <Video className="w-3 h-3" />
                <span>Free VIP Ad</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {profile.scouts.map(scout => (
                <div
                  key={scout.id}
                  className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-xs">{scout.name}</span>
                      <p className="text-[10px] text-amber-400">{scout.specialisation}</p>
                    </div>
                    <span className="text-xs font-mono text-slate-300">Rating: {scout.qualityRating}</span>
                  </div>

                  <button
                    onClick={() => handleDispatchScout(scout.id)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded-xl text-xs border border-slate-700"
                  >
                    Dispatch Expedition (-₹0.5 Cr)
                  </button>
                </div>
              ))}
            </div>

            {/* Dossier Log */}
            {profile.scoutingReports.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Recent Scouted Dossiers</h4>
                {profile.scoutingReports.slice(0, 3).map(rep => (
                  <div
                    key={rep.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-1"
                  >
                    <div className="flex justify-between font-bold text-white">
                      <span>{rep.player.name} ({rep.player.primaryRole})</span>
                      <span className="text-amber-400 font-mono">OVR {rep.player.overallRating}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{rep.keyNotes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB 5: FINANCES ======================= */}
        {activeTab === 'FINANCES' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase text-white">Central Financial Ledger</h3>
                <p className="text-[10px] text-slate-400">Authoritative audit ledger of all club cashflows</p>
              </div>
              <span className="text-xs font-black text-amber-400 font-mono">
                ₹{career.purseBalanceCr.toFixed(2)} Cr
              </span>
            </div>

            <div className="space-y-2">
              {profile.financialLedger.map(tx => (
                <div
                  key={tx.id}
                  className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{tx.description}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{tx.dateStr}</span>
                  </div>
                  <span
                    className={`font-black font-mono text-sm ${
                      tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amountCr.toFixed(2)} Cr
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB 6: SPONSORS ======================= */}
        {activeTab === 'SPONSORS' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase text-white">Commercial Partnerships</h3>
                <p className="text-[10px] text-slate-400">Guaranteed seasonal commercial payouts</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                +₹{profile.activeSponsors.reduce((acc, s) => acc + s.annualPayoutCr, 0)} Cr / Season
              </span>
            </div>

            <div className="space-y-2.5">
              {profile.activeSponsors.map(s => (
                <div
                  key={s.id}
                  className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white text-xs block">{s.sponsorName}</span>
                    <span className="text-[10px] text-amber-400 font-medium">{s.category}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {s.contractYearsRemaining} Year(s) Remaining
                    </p>
                  </div>
                  <span className="font-black text-emerald-400 font-mono text-sm">
                    +₹{s.annualPayoutCr} Cr/yr
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB 7: RECORDS / HALL OF FAME ======================= */}
        {activeTab === 'RECORDS' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase text-white">Franchise Hall of Fame</h3>
              <p className="text-[10px] text-slate-400">
                Veterans retire at Age 40 (Max Age 42 with up to 2 optional extensions)
              </p>
            </div>

            {/* Senior Veterans Nearing Retirement (Age 39-41) */}
            {veteranCandidates.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase text-amber-400">
                  Veterans Nearing Retirement Window
                </h4>
                {veteranCandidates.map(vet => {
                  const used = career.retiredExtensionCounts?.[vet.id] || 0;
                  const maxed = used >= 2 || (vet.age ?? 40) >= 42;
                  return (
                    <div
                      key={vet.id}
                      className="bg-[#101B33] border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-white text-xs block">{vet.name}</span>
                        <span className="text-[10px] text-slate-400">
                          Age {vet.age} • Extensions Used: {used}/2
                        </span>
                      </div>
                      <button
                        onClick={() => handleAdExtendVeteran(vet.id)}
                        disabled={adBusy || maxed}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-45 text-slate-950 font-black text-[10px] uppercase flex items-center space-x-1 shrink-0"
                      >
                        <Video className="w-3 h-3" />
                        <span>{maxed ? 'Max Extensions (2/2)' : 'Extend +1 Yr (Ad)'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {profile.retiredArchive.length === 0 ? (
              <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                <Trophy className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-bold text-slate-300">No Retired Players Yet</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Players reaching age 40 become eligible for retirement and enter the Hall of Fame.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {profile.retiredArchive.map(ret => {
                  const extUsed = Math.max(
                    ret.extensionsUsed || 0,
                    career.retiredExtensionCounts?.[ret.playerId] || 0
                  );
                  const canExtendRetiree = ret.retirementAge < 42 && extUsed < 2;

                  return (
                    <div
                      key={ret.playerId}
                      className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{ret.name}</span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          Retired at Age {ret.retirementAge} ({extUsed}/2 ext)
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800 text-[10px] font-mono text-slate-300 text-center">
                        <div>
                          <span className="text-slate-400 block">Matches</span>
                          <span className="font-bold">{ret.careerMatches}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Runs</span>
                          <span className="font-bold text-amber-400">{ret.careerRuns}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Wickets</span>
                          <span className="font-bold text-emerald-400">{ret.careerWickets}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Trophies</span>
                          <span className="font-bold text-purple-400">{ret.trophiesWon}</span>
                        </div>
                      </div>
                      {canExtendRetiree && (
                        <button
                          onClick={() => handleAdExtendVeteran(ret.playerId)}
                          disabled={adBusy}
                          className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-black text-[10px] uppercase flex items-center justify-center space-x-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Watch Ad: Extend Career +1 Yr (Recall up to Age 42)</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Season Transition Confirmation Modal */}
      {showNextSeasonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F1A30] border border-amber-500/40 rounded-3xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="text-center space-x-2">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Start Season {career.currentSeason + 1}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                This will finalize Season {career.currentSeason}, distribute prize & sponsorship money, age all squad players +1 year, and generate the new 94-match tournament calendar.
              </p>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Current Season:</span>
                <span className="font-mono text-white">Season {career.currentSeason}</span>
              </div>
              <div className="flex justify-between">
                <span>Next Season:</span>
                <span className="font-mono text-amber-400 font-bold">Season {career.currentSeason + 1}</span>
              </div>
              <div className="flex justify-between">
                <span>Matches to Generate:</span>
                <span className="font-mono text-slate-200">90 League + 4 Playoffs</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowNextSeasonModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNextSeason}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black uppercase shadow-lg"
              >
                Confirm & Transition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
