/**
 * WICKET DYNASTY - Club Headquarters & Multi-Season Management (SCR_21 / SCR_22)
 * Stadium Upgrades, Youth Academy, Scouting, Financial Ledger, Sponsors, Hall of Fame & Next Season Transition
 */
import React, { useState } from 'react';
import { CareerSave } from '../types/career';
import { Player } from '../types/player';
import { TournamentState } from '../types/tournament';
import { ClubEngine } from '../services/clubEngine';
import { MultiSeasonEngine } from '../services/multiSeasonEngine';
import { InjuryEngine } from '../services/injuryEngine';
import { FRANCHISES } from '../data/franchises';
import { ClubProfile } from '../types/club';
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

  // Squad & Injury tracking
  const squadIds = career.squadPlayerIds || [];
  const squadPlayers = squadIds
    .map(id => allPlayers.find(p => p.id === id))
    .filter(Boolean) as Player[];

  const workloads = career.playerWorkloads || {};
  const injuredPlayers = squadPlayers.filter(p => workloads[p.id]?.isInjured);
  const atRiskPlayers = squadPlayers.filter(p => {
    const w = workloads[p.id];
    return !w?.isInjured && ((w?.stamina || p.fitness || 80) < 60 || (w?.fatigue || 0) > 60);
  });

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

  // 4. Advance to Next Season
  const handleConfirmNextSeason = () => {
    const { updatedCareer, retiredPlayers, seasonSummary } = MultiSeasonEngine.advanceToNextSeason(
      career,
      tournament,
      allPlayers
    );
    onUpdateCareer(updatedCareer);
    setShowNextSeasonModal(false);
    notify(
      `Season ${seasonSummary.seasonNumber} finalized! Welcome to Season ${updatedCareer.currentSeason}. (${retiredPlayers.length} retired).`
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
                  <div
                    className="w-9 h-9 rounded-xl border flex items-center justify-center font-black text-xs shadow-md"
                    style={{
                      backgroundColor: franchise.primaryColor + '30',
                      borderColor: franchise.primaryColor,
                    }}
                  >
                    {franchise.shortName}
                  </div>
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
                        Age {prospect.age} • {prospect.primaryRole}
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
                        className="p-2.5 rounded-xl bg-[#0F1A30] border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{player.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Stamina: <strong className="text-amber-400">{stamina}%</strong> • Fatigue: {fatigue}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCryotherapy(player.id)}
                          className="py-1 px-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] hover:bg-cyan-900/60 transition-colors"
                        >
                          Cryo Recovery
                        </button>
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
              <p className="text-[10px] text-slate-400">Archived legends and retired cricketers</p>
            </div>

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
                {profile.retiredArchive.map(ret => (
                  <div
                    key={ret.playerId}
                    className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{ret.name}</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        Retired at Age {ret.retirementAge}
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
                  </div>
                ))}
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
