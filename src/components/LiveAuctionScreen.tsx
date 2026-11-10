/**
 * WICKET DYNASTY - Live Auction Room Screen (SCR_08)
 * Redesigned strictly following REFERENCE IMAGE 2:
 * - Top Header: Lot number, category pill dropdown, speed toggle, options menu
 * - Player Profile: Badges (Tier, TV icon, Previous Franchise, Flag), circular avatar with initials & jersey badge
 * - Attributes: 4 horizontal bars with green progress lines & 'TAP FOR ALL STATS' expandable drawer
 * - Bidding Strip: Base price container & previous/current bid chips
 * - 10 Franchise Cards Grid: 2 rows of 5 cards with logos, remaining purses, user highlight, and active bidder status
 * - Current Bid & AI Commentary: Dynamic live broadcast-style commentary ticker
 * - Action Buttons: Primary gold BID button & secondary SKIP / PASS button
 * - Pass & Background AI: Immediate user withdrawal, instant AI battle resolution, and Result Popup with CONTINUE button
 * - Bottom Bar: Purse, Squad count, Overseas slots, RTM stars, and Squad drawer button
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Gavel,
  Clock,
  ArrowLeft,
  Shield,
  Award,
  Users,
  AlertCircle,
  Play,
  Pause,
  FastForward,
  CheckCircle,
  Flame,
  ChevronDown,
  MoreVertical,
  Radio,
  Tv,
  ChevronRight,
  Sparkles,
  Info,
  X,
  Volume2,
} from 'lucide-react';
import { CareerSave } from '../types/career';
import { FRANCHISES } from '../data/franchises';
import { PLAYERS_DATABASE } from '../data/players';
import { AuctionEngine } from '../services/auctionEngine';
import { SquadValidationEngine } from '../services/squadValidationEngine';
import { DbPersistence } from '../services/dbPersistence';
import {
  AuctionLot,
  AuctionState,
  AuctionTransaction,
  FranchiseAuctionState,
} from '../types/auction';
import { Player } from '../types/player';
import { FranchiseLogo } from './FranchiseLogo';

interface LiveAuctionScreenProps {
  career: CareerSave;
  onAuctionComplete: (
    finalSquadIds: string[],
    finalPurseCr: number,
    allFranchiseSquads: Record<string, string[]>,
    allFranchisePurses: Record<string, number>,
    transactions: AuctionTransaction[]
  ) => void;
  onExitAuction: () => void;
}

// Helper: Nationality flag and acronym
const getCountryBadge = (nationality: string, isOverseas: boolean) => {
  if (!isOverseas || nationality.includes('India')) return { flag: '🇮🇳', code: 'IND' };
  if (nationality.includes('South Africa')) return { flag: '🇿🇦', code: 'SA' };
  if (nationality.includes('Australia')) return { flag: '🇦🇺', code: 'AUS' };
  if (nationality.includes('England')) return { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' };
  if (nationality.includes('New Zealand')) return { flag: '🇳🇿', code: 'NZ' };
  if (nationality.includes('West Indies')) return { flag: '🌴', code: 'WI' };
  if (nationality.includes('Afghanistan')) return { flag: '🇦🇫', code: 'AFG' };
  if (nationality.includes('Sri Lanka')) return { flag: '🇱🇰', code: 'SL' };
  if (nationality.includes('Bangladesh')) return { flag: '🇧🇩', code: 'BAN' };
  return { flag: '🌐', code: 'INT' };
};

// Helper: Player initials for avatar
const getPlayerInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const LiveAuctionScreen: React.FC<LiveAuctionScreenProps> = ({
  career,
  onAuctionComplete,
  onExitAuction,
}) => {
  const userFranchise = FRANCHISES.find(f => f.id === career.franchiseId) || FRANCHISES[0];
  const allPlayersMap = useRef<Record<string, Player>>(
    PLAYERS_DATABASE.reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
  ).current;

  // Initialize Auction Lots
  const [lots] = useState<AuctionLot[]>(() => {
    const availablePlayers = PLAYERS_DATABASE.filter(p => !career.squadPlayerIds.includes(p.id));
    return AuctionEngine.generateAuctionLots(availablePlayers);
  });

  const [currentLotIndex, setCurrentLotIndex] = useState(0);
  const [currentBidCr, setCurrentBidCr] = useState<number>(0);
  const [highestBidderId, setHighestBidderId] = useState<string | null>(null);
  const [previousBidderId, setPreviousBidderId] = useState<string | null>(null);
  const [previousBidCr, setPreviousBidCr] = useState<number | null>(null);
  const [bidHistory, setBidHistory] = useState<{ bidderId: string; amountCr: number; time: string; isRtm?: boolean }[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(6);
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState<'1x' | '2x' | '4x'>('1x');
  const [aiCommentary, setAiCommentary] = useState<string>('Bidding open for this lot.');

  // Modals & Drawers
  const [isStatsDrawerOpen, setIsStatsDrawerOpen] = useState(false);
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Result Popup state (Shown immediately when lot is SOLD or UNSOLD)
  const [resultPopup, setResultPopup] = useState<{
    isOpen: boolean;
    outcome: 'SOLD' | 'UNSOLD';
    winningFranchiseId: string | null;
    finalPriceCr: number;
    unsoldReason?: string;
  }>({
    isOpen: false,
    outcome: 'SOLD',
    winningFranchiseId: null,
    finalPriceCr: 0,
  });

  // Withdrawn franchises for the active lot
  const [withdrawnFranchiseIds, setWithdrawnFranchiseIds] = useState<string[]>([]);

  // Franchise states across all 10 franchises
  const [franchiseStates, setFranchiseStates] = useState<Record<string, FranchiseAuctionState>>(() => {
    return AuctionEngine.initializeFranchiseStates(
      career.franchiseId,
      { [career.franchiseId]: career.squadPlayerIds },
      { [career.franchiseId]: userFranchise.startingPurseCr - career.purseBalanceCr }
    );
  });

  const [transactions, setTransactions] = useState<AuctionTransaction[]>([]);
  const [isAuctionSummaryOpen, setIsAuctionSummaryOpen] = useState(false);

  const activeLot = lots[currentLotIndex];
  const userState = franchiseStates[userFranchise.id];

  // Maximum bid ceiling for active lot
  const activeMaxBidLimit = activeLot ? AuctionEngine.getMaxBidLimit(activeLot.player) : 25.0;

  // Initialize lot when currentLotIndex changes
  useEffect(() => {
    if (!activeLot) return;

    setCurrentBidCr(activeLot.basePriceCr);
    setHighestBidderId(null);
    setPreviousBidderId(null);
    setPreviousBidCr(null);
    setBidHistory([]);
    setWithdrawnFranchiseIds([]);
    setTimerSeconds(6);
    setResultPopup({ isOpen: false, outcome: 'SOLD', winningFranchiseId: null, finalPriceCr: 0 });
    setAiCommentary(`Bidding open for ${activeLot.player.name}. Base price ₹${activeLot.basePriceCr.toFixed(2)} Cr.`);
  }, [currentLotIndex]);

  // Main Auction Timer & AI Bidder Loop
  useEffect(() => {
    if (!activeLot || isPaused || resultPopup.isOpen) return;

    const tickInterval = simSpeed === '1x' ? 1000 : (simSpeed === '2x' ? 500 : 250);

    const interval = setInterval(() => {
      // Check ceiling reached
      if (currentBidCr >= activeMaxBidLimit) {
        handleFinalizeLot(highestBidderId, currentBidCr);
        return;
      }

      // Check all franchises withdrawn
      if (withdrawnFranchiseIds.length >= 10) {
        handleFinalizeLot(highestBidderId, currentBidCr);
        return;
      }

      if (timerSeconds > 1) {
        // AI bidding evaluation
        const aiBid = AuctionEngine.evaluateAiBid(
          activeLot,
          currentBidCr,
          highestBidderId,
          franchiseStates,
          userFranchise.id,
          allPlayersMap,
          withdrawnFranchiseIds,
          activeMaxBidLimit
        );

        if (aiBid && Math.random() > 0.25) {
          const nextBid = aiBid.bidAmountCr;
          setPreviousBidderId(highestBidderId);
          setPreviousBidCr(currentBidCr);
          setCurrentBidCr(nextBid);
          setHighestBidderId(aiBid.franchiseId);
          setTimerSeconds(6);

          // Update commentary
          const commentary = AuctionEngine.generateAiCommentary(
            aiBid.franchiseId,
            activeLot.player.shortName,
            nextBid,
            highestBidderId
          );
          setAiCommentary(commentary);

          setBidHistory(prev => [
            { bidderId: aiBid.franchiseId, amountCr: nextBid, time: 'Just now' },
            ...prev.slice(0, 7),
          ]);
          return;
        }

        setTimerSeconds(prev => prev - 1);
      } else {
        // Timer hits 0: Hammer strikes!
        handleFinalizeLot(highestBidderId, currentBidCr);
      }
    }, tickInterval);

    return () => clearInterval(interval);
  }, [
    activeLot,
    currentBidCr,
    highestBidderId,
    timerSeconds,
    isPaused,
    simSpeed,
    franchiseStates,
    resultPopup.isOpen,
    withdrawnFranchiseIds,
    activeMaxBidLimit,
  ]);

  // Finalize current lot and open Result Popup
  const handleFinalizeLot = (winningFranchise: string | null, winningAmount: number) => {
    if (!activeLot) return;

    if (winningFranchise) {
      // Deduct purse and update roster
      setFranchiseStates(prev => {
        const curWinner = prev[winningFranchise];
        return {
          ...prev,
          [winningFranchise]: {
            ...curWinner,
            purseRemainingCr: Number((curWinner.purseRemainingCr - winningAmount).toFixed(2)),
            rosterPlayerIds: [...curWinner.rosterPlayerIds, activeLot.player.id],
            totalSpentCr: Number((curWinner.totalSpentCr + winningAmount).toFixed(2)),
          },
        };
      });

      const tx: AuctionTransaction = {
        id: `tx_${Date.now()}_${activeLot.player.id}`,
        playerId: activeLot.player.id,
        playerName: activeLot.player.name,
        playerRole: activeLot.player.primaryRole,
        isOverseas: activeLot.player.isOverseas,
        franchiseId: winningFranchise,
        amountCr: winningAmount,
        timestamp: Date.now(),
        type: 'AUCTION_BID',
      };
      setTransactions(prev => [tx, ...prev]);

      setResultPopup({
        isOpen: true,
        outcome: 'SOLD',
        winningFranchiseId: winningFranchise,
        finalPriceCr: winningAmount,
      });
    } else {
      setResultPopup({
        isOpen: true,
        outcome: 'UNSOLD',
        winningFranchiseId: null,
        finalPriceCr: activeLot.basePriceCr,
        unsoldReason: 'No franchise placed an opening bid above base price.',
      });
    }
  };

  // User Bids: Enforces no self-bidding, purse limit, squad size, overseas count
  const handleUserBid = () => {
    if (!activeLot || resultPopup.isOpen) return;

    // RULE 1: Cannot bid against own bid
    if (highestBidderId === userFranchise.id) return;

    // RULE 2: Cannot bid if user has passed this lot
    if (withdrawnFranchiseIds.includes(userFranchise.id)) return;

    const inc = AuctionEngine.getNextBidIncrement(currentBidCr);
    const nextBid = Number((currentBidCr + (highestBidderId ? inc : 0)).toFixed(2));

    // RULE 3: Enforce max bid ceiling
    if (nextBid > activeMaxBidLimit) return;

    // RULE 4: Purse and Squad limits
    if (nextBid > userState.purseRemainingCr) return;
    if (userState.rosterPlayerIds.length >= 25) return;
    if (activeLot.player.isOverseas) {
      const currentOverseas = userState.rosterPlayerIds.filter(id => allPlayersMap[id]?.isOverseas).length;
      if (currentOverseas >= 8) return;
    }

    setPreviousBidderId(highestBidderId);
    setPreviousBidCr(currentBidCr);
    setCurrentBidCr(nextBid);
    setHighestBidderId(userFranchise.id);
    setTimerSeconds(6);

    setAiCommentary(`${userFranchise.name} enters the bidding at ₹${nextBid.toFixed(2)} Cr!`);
    setBidHistory(prev => [
      { bidderId: userFranchise.id, amountCr: nextBid, time: 'Just now' },
      ...prev.slice(0, 7),
    ]);
  };

  // User Presses PASS / SKIP:
  // Immediately withdraws user franchise, disables further bidding, completes remaining AI auction in background,
  // and displays the Result Popup immediately!
  const handleUserPass = () => {
    if (!activeLot || resultPopup.isOpen) return;

    // 1. Immediately withdraw user franchise
    const updatedWithdrawn = [...withdrawnFranchiseIds, userFranchise.id];
    setWithdrawnFranchiseIds(updatedWithdrawn);

    // 2. Fast background AI resolution between eligible AI franchises
    const result = AuctionEngine.resolveBackgroundAuction(
      activeLot,
      currentBidCr,
      highestBidderId,
      franchiseStates,
      userFranchise.id,
      allPlayersMap,
      updatedWithdrawn
    );

    // 3. Update franchise states
    setFranchiseStates(result.updatedStates);

    if (result.outcome === 'SOLD' && result.winningFranchiseId) {
      const tx: AuctionTransaction = {
        id: `tx_${Date.now()}_${activeLot.player.id}`,
        playerId: activeLot.player.id,
        playerName: activeLot.player.name,
        playerRole: activeLot.player.primaryRole,
        isOverseas: activeLot.player.isOverseas,
        franchiseId: result.winningFranchiseId,
        amountCr: result.finalPriceCr,
        timestamp: Date.now(),
        type: 'AUCTION_BID',
      };
      setTransactions(prev => [tx, ...prev]);
    }

    // 4. Immediately display final result popup
    setResultPopup({
      isOpen: true,
      outcome: result.outcome,
      winningFranchiseId: result.winningFranchiseId,
      finalPriceCr: result.finalPriceCr,
      unsoldReason: result.unsoldReason,
    });
  };

  // Continue to Next Lot from Result Popup
  const handleContinueNextLot = () => {
    setResultPopup({ isOpen: false, outcome: 'SOLD', winningFranchiseId: null, finalPriceCr: 0 });
    if (currentLotIndex + 1 < lots.length) {
      setCurrentLotIndex(prev => prev + 1);
    } else {
      setIsAuctionSummaryOpen(true);
    }
  };

  // Empty Squad Validation Modal
  const [emptySquadErrorModal, setEmptySquadErrorModal] = useState<string[] | null>(null);

  // Complete entire auction and return squads
  const handleFinalizeAllAuction = () => {
    // Empty Squad Protection
    const validation = SquadValidationEngine.canCompleteAuction(
      userState.rosterPlayerIds,
      userState.purseRemainingCr
    );
    if (!validation.canComplete) {
      setEmptySquadErrorModal(validation.errors);
      return;
    }

    const allSquads: Record<string, string[]> = {};
    const allPurses: Record<string, number> = {};
    Object.values(franchiseStates).forEach(f => {
      allSquads[f.franchiseId] = f.rosterPlayerIds;
      allPurses[f.franchiseId] = f.purseRemainingCr;
    });

    DbPersistence.clearLiveAuction();
    onAuctionComplete(
      userState.rosterPlayerIds,
      userState.purseRemainingCr,
      allSquads,
      allPurses,
      transactions
    );
  };

  // Speed Toggle
  const toggleSpeed = () => {
    if (simSpeed === '1x') setSimSpeed('2x');
    else if (simSpeed === '2x') setSimSpeed('4x');
    else setSimSpeed('1x');
  };

  if (!activeLot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#070D18] text-white p-6">
        <h2 className="text-xl font-black text-amber-400 mb-2">Auction Pool Completed</h2>
        <p className="text-slate-400 text-xs mb-6 text-center">
          All lots have been presented. Review squads and proceed to the tournament.
        </p>
        <button
          onClick={handleFinalizeAllAuction}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase"
        >
          View Squad & Finish Auction
        </button>
      </div>
    );
  }

  const p = activeLot.player;
  const isBowler = p.primaryRole.includes('Bowler') || p.primaryRole.includes('Specialist');
  const isAllRounder = p.primaryRole.includes('All-rounder');
  const isBatter = !isBowler && !isAllRounder;

  const country = getCountryBadge(p.nationality, p.isOverseas);
  const initials = getPlayerInitials(p.name);
  const jerseyNumber = ((activeLot.lotNumber * 7) % 89 + 10);
  const tierDisplayName = p.ratingTier === 'Diamond' ? 'PLATINUM' : p.ratingTier.toUpperCase();
  const prevFranchise = p.originalFranchiseId || 'GT';

  // Next bid calculation
  const nextIncrement = AuctionEngine.getNextBidIncrement(currentBidCr);
  const nextUserBid = Number((currentBidCr + (highestBidderId ? nextIncrement : 0)).toFixed(2));
  const isUserHighest = highestBidderId === userFranchise.id;
  const isUserWithdrawn = withdrawnFranchiseIds.includes(userFranchise.id);
  const canUserBid =
    !isUserHighest &&
    !isUserWithdrawn &&
    nextUserBid <= activeMaxBidLimit &&
    userState.purseRemainingCr >= nextUserBid &&
    userState.rosterPlayerIds.length < 25;

  const userOverseasCount = userState.rosterPlayerIds.filter(id => allPlayersMap[id]?.isOverseas).length;

  // 10 Franchises in 2 rows of 5 cards
  const row1Franchises = ['MI', 'CSK', 'RCB', 'KKR', 'DC'].map(id => FRANCHISES.find(f => f.id === id)!);
  const row2Franchises = ['PBKS', 'RR', 'SRH', 'LSG', 'GT'].map(id => FRANCHISES.find(f => f.id === id)!);

  return (
    <div className="flex flex-col min-h-screen bg-[#070D19] text-white select-none font-sans max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {/* ================= TOP HEADER (Image 2 style) ================= */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-[#0A1224]/90 border-b border-slate-800/80 backdrop-blur-md z-20">
        <div className="flex items-center space-x-2">
          <button
            onClick={onExitAuction}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              LOT {activeLot.lotNumber} / {lots.length}
            </span>
          </div>
        </div>

        {/* Center Pill: PLATINUM ⌄ */}
        <div className="px-2.5 py-1 rounded-md bg-[#131E35] border border-amber-500/40 flex items-center space-x-1">
          <span className="text-[10px] font-black tracking-wider text-amber-400">
            {tierDisplayName}
          </span>
          <ChevronDown className="w-3 h-3 text-amber-400" />
        </div>

        {/* Right Controls: Speed & Menu */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={toggleSpeed}
            className="px-2 py-1 rounded-md bg-[#131E35] border border-slate-700/80 text-[10px] font-bold text-slate-300 flex items-center space-x-1 hover:border-amber-500/50"
          >
            <FastForward className="w-3 h-3 text-amber-400" />
            <span>{simSpeed}</span>
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-md bg-slate-900 text-slate-300 hover:bg-slate-800"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Options Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-12 right-3 z-50 bg-[#0F1A30] border border-amber-500/50 rounded-xl p-2 w-48 shadow-2xl space-y-1 text-xs">
          <button
            onClick={() => {
              setIsPaused(!isPaused);
              setIsMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 font-bold flex items-center justify-between"
          >
            <span>{isPaused ? 'Resume Auction' : 'Pause Timer'}</span>
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
          </button>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              setIsSquadModalOpen(true);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 font-bold flex items-center justify-between"
          >
            <span>View All Franchise Squads</span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
          </button>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleFinalizeAllAuction();
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 font-bold flex items-center justify-between"
          >
            <span>End Auction Early</span>
            <AlertCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Auction Scrollable Arena */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-3 pb-24">
        {/* ================= PLAYER PROFILE HEADER (Image 2 style) ================= */}
        <div className="flex flex-col items-center">
          {/* Badges Row */}
          <div className="flex items-center space-x-1.5 mb-3">
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-amber-400 border border-amber-500/70 bg-amber-500/10">
              {tierDisplayName}
            </span>
            <div className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-400">
              <Tv className="w-3 h-3 text-amber-400" />
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-blue-300 bg-blue-950/60 border border-blue-800/60">
              FROM {prevFranchise}
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-slate-200 bg-slate-900/90 border border-slate-700/60 flex items-center space-x-1">
              <span>{country.flag}</span>
              <span>{country.code}</span>
            </span>
          </div>

          {/* Large Circular Avatar with initials & overlapping jersey badge */}
          <div className="relative mb-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 via-rose-700 to-amber-600 flex items-center justify-center border-2 border-red-500/50 shadow-xl shadow-red-950/40">
              <span className="text-2xl font-black text-white tracking-wider">
                {initials}
              </span>
            </div>
            {/* Overlapping Jersey Badge */}
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#0D1525] border-2 border-amber-500 text-[10px] font-black text-amber-400 shadow">
              #{jerseyNumber}
            </div>
          </div>

          {/* Big Bold Player Name */}
          <h2 className="text-base font-black text-white tracking-wider uppercase text-center mt-1">
            {p.name}
          </h2>

          {/* Subtitle: Role · age · Bowling Arm / Batting Hand */}
          <p className="text-[11px] font-medium text-slate-400 text-center mt-0.5">
            {p.primaryRole} · age {p.age} ·{' '}
            {isBowler
              ? p.bowlingArm?.includes('Left') ? 'LAF' : 'RAF'
              : p.battingHand === 'Left Hand' ? 'LHB' : 'RHB'}
          </p>

          {/* 4 Attribute Bars Row (with green progress lines like Image 2) */}
          <div className="w-full grid grid-cols-4 gap-2 mt-3 px-1">
            {isBowler ? (
              <>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span className="text-slate-400">BOWL</span>
                    <span className="text-emerald-400 font-mono">{p.overallRating}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.overallRating}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span className="text-slate-400">PACE</span>
                    <span className="text-emerald-400 font-mono">{p.paceBowling?.speed || 88}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.paceBowling?.speed || 88}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span className="text-slate-400">CTRL</span>
                    <span className="text-emerald-400 font-mono">{p.paceBowling?.control || p.spinBowling?.control || 86}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.paceBowling?.control || p.spinBowling?.control || 86}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span className="text-slate-400">DTH</span>
                    <span className="text-emerald-400 font-mono">{p.primaryRole.includes('Death') ? 92 : 86}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.primaryRole.includes('Death') ? 92 : 86}%` }} />
                  </div>
                </div>
              </>
            ) : isAllRounder ? (
              <>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span className="text-slate-400">BAT</span>
                    <span className="text-emerald-400 font-mono">{p.batting.timing}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.batting.timing}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span className="text-slate-400">BOWL</span>
                    <span className="text-emerald-400 font-mono">{p.overallRating - 4}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.overallRating - 4}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span className="text-slate-400">FLD</span>
                    <span className="text-emerald-400 font-mono">{p.fielding.catching}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.fielding.catching}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span className="text-slate-400">POT</span>
                    <span className="text-emerald-400 font-mono">{p.potentialRating}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.potentialRating}%` }} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span className="text-slate-400">BAT</span>
                    <span className="text-emerald-400 font-mono">{p.overallRating}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.overallRating}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span className="text-slate-400">TIM</span>
                    <span className="text-emerald-400 font-mono">{p.batting.timing}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.batting.timing}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span className="text-slate-400">PWR</span>
                    <span className="text-emerald-400 font-mono">{p.batting.power}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.batting.power}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span className="text-slate-400">TECH</span>
                    <span className="text-emerald-400 font-mono">{p.batting.technique}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.batting.technique}%` }} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* TAP FOR ALL STATS ≚ (Expandable toggle) */}
          <button
            onClick={() => setIsStatsDrawerOpen(true)}
            className="mt-2 text-[10px] font-bold text-slate-400 hover:text-amber-400 flex items-center space-x-1 tracking-wider uppercase transition-colors"
          >
            <span>TAP FOR ALL STATS</span>
            <span>≚</span>
          </button>
        </div>

        {/* ================= BIDDING INFORMATION STRIP ================= */}
        <div className="bg-[#0D1629] border border-slate-800/90 rounded-2xl p-2.5 flex items-center justify-between">
          {/* Left: BASE Price */}
          <div className="border-r border-slate-800/80 pr-4">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              BASE
            </span>
            <span className="text-xs font-black text-white font-mono">
              {activeLot.basePriceCr.toFixed(2)} cr
            </span>
          </div>

          {/* Right: Previous & Active Bids Chips */}
          <div className="flex items-center space-x-2 pl-2">
            {previousBidderId && previousBidCr && (
              <div className="px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700/80 text-[10px] font-bold text-slate-300 flex items-center space-x-1">
                <span>{previousBidderId}</span>
                <span className="font-mono text-slate-400">{previousBidCr.toFixed(2)} cr</span>
              </div>
            )}

            {highestBidderId ? (
              <div className="px-3 py-1 rounded-xl bg-red-600/90 border border-red-500 text-[11px] font-black text-white flex items-center space-x-1 shadow-lg shadow-red-950/50 animate-pulse">
                <span>{highestBidderId}</span>
                <span className="font-mono">{currentBidCr.toFixed(2)} cr</span>
              </div>
            ) : (
              <div className="text-[10px] font-bold text-slate-500 italic">
                Awaiting opening paddle...
              </div>
            )}
          </div>
        </div>

        {/* ================= 10 FRANCHISE CARDS GRID (Image 2 style) ================= */}
        {/* Row 1: MI, CSK, RCB, KKR, DC */}
        {/* Row 2: PBKS, RR, SRH, LSG, GT */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-5 gap-1.5">
            {row1Franchises.map(f => {
              const state = franchiseStates[f.id];
              const isUser = f.id === userFranchise.id;
              const isHighest = f.id === highestBidderId;
              const isPrevious = f.id === previousBidderId;

              return (
                <div
                  key={f.id}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                    isHighest
                      ? 'bg-red-600/90 border-2 border-red-400 text-white shadow-md'
                      : isUser
                      ? 'bg-[#101B33] border-2 border-amber-400 text-slate-200'
                      : isPrevious
                      ? 'bg-slate-900 border border-amber-500/40 text-amber-300'
                      : 'bg-[#0E172B] border border-slate-800/80 text-slate-400'
                  }`}
                >
                  <FranchiseLogo franchiseId={f.id} size="sm" className="mb-1" />
                  <span
                    className={`text-[10px] font-black font-mono leading-none ${
                      isHighest ? 'text-white' : isPrevious ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    {isHighest
                      ? `${currentBidCr.toFixed(2)} cr`
                      : isPrevious && previousBidCr
                      ? `${previousBidCr.toFixed(2)} cr`
                      : `${Math.round(state?.purseRemainingCr || 0)} cr`}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {row2Franchises.map(f => {
              const state = franchiseStates[f.id];
              const isUser = f.id === userFranchise.id;
              const isHighest = f.id === highestBidderId;
              const isPrevious = f.id === previousBidderId;

              return (
                <div
                  key={f.id}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                    isHighest
                      ? 'bg-red-600/90 border-2 border-red-400 text-white shadow-md'
                      : isUser
                      ? 'bg-[#101B33] border-2 border-amber-400 text-slate-200'
                      : isPrevious
                      ? 'bg-slate-900 border border-amber-500/40 text-amber-300'
                      : 'bg-[#0E172B] border border-slate-800/80 text-slate-400'
                  }`}
                >
                  <FranchiseLogo franchiseId={f.id} size="sm" className="mb-1" />
                  <span
                    className={`text-[10px] font-black font-mono leading-none ${
                      isHighest ? 'text-white' : isPrevious ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    {isHighest
                      ? `${currentBidCr.toFixed(2)} cr`
                      : isPrevious && previousBidCr
                      ? `${previousBidCr.toFixed(2)} cr`
                      : `${Math.round(state?.purseRemainingCr || 0)} cr`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= CURRENT BID & AI COMMENTARY (Image 2 style) ================= */}
        <div className="flex items-center justify-between pt-1">
          {/* Left: CURRENT BID [ PBKS ] / 1.60 cr */}
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                CURRENT BID
              </span>
              {highestBidderId && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black text-white bg-red-600">
                  {highestBidderId}
                </span>
              )}
            </div>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              {currentBidCr.toFixed(2)} cr
            </div>
          </div>

          {/* Right: AI Commentary ticker with speaker */}
          <div className="max-w-[190px] text-right">
            <p className="text-[11px] italic font-medium text-cyan-300 leading-snug flex items-center justify-end">
              <span className="mr-1">📢</span>
              <span>"{aiCommentary}"</span>
            </p>
          </div>
        </div>

        {/* ================= ACTION BUTTONS (Image 2 style) ================= */}
        <div className="flex items-center space-x-2 pt-1">
          {/* Big Yellow / Gold BID Button */}
          <button
            onClick={handleUserBid}
            disabled={!canUserBid}
            className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-xl ${
              isUserHighest
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-950/40'
                : canUserBid
                ? 'bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 shadow-amber-950/50'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>
              {isUserHighest
                ? 'AUCTION LEADER'
                : isUserWithdrawn
                ? 'WITHDRAWN (PASSED)'
                : `BID ${nextUserBid.toFixed(2)} cr`}
            </span>
          </button>

          {/* Secondary SKIP / PASS Button */}
          <button
            onClick={handleUserPass}
            disabled={isUserWithdrawn}
            className="py-3.5 px-5 rounded-2xl bg-[#111B30] hover:bg-[#162340] active:scale-98 border border-slate-700/80 text-xs font-black uppercase text-slate-300 flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <span>⏩</span>
            <span>SKIP</span>
          </button>
        </div>
      </div>

      {/* ================= BOTTOM MANAGER STATUS BAR (Image 2 style) ================= */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#070D19]/95 border-t border-slate-800/90 px-4 py-2.5 flex items-center justify-between backdrop-blur-md z-30">
        <div className="flex items-center space-x-3.5 text-xs font-bold">
          <div>
            <span className="text-[9px] text-slate-400 block uppercase leading-none">PURSE</span>
            <span className="text-amber-400 font-black font-mono">
              {Math.round(userState?.purseRemainingCr || 0)} cr
            </span>
          </div>

          <div>
            <span className="text-[9px] text-slate-400 block uppercase leading-none">SQUAD</span>
            <span className="text-yellow-400 font-black font-mono">
              {userState?.rosterPlayerIds.length || 0} / 25
            </span>
          </div>

          <div>
            <span className="text-[9px] text-slate-400 block uppercase leading-none">O/SEAS</span>
            <span className="text-cyan-400 font-black font-mono">
              {userOverseasCount} / 8
            </span>
          </div>

          <div>
            <span className="text-[9px] text-slate-400 block uppercase leading-none">RTM</span>
            <span className="text-amber-400 font-black">
              {'★'.repeat(userState?.rtmCardsRemaining || 0) || '-'}
            </span>
          </div>
        </div>

        {/* Right SQUAD Button */}
        <button
          onClick={() => setIsSquadModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#14213B] border border-slate-700/80 hover:border-amber-500/50 text-[11px] font-black uppercase text-white flex items-center space-x-1.5 shadow"
        >
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>SQUAD</span>
        </button>
      </div>

      {/* ================= RESULT POPUP MODAL (Module 2 Requirement) ================= */}
      {resultPopup.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0C1527] border-2 border-amber-500/80 rounded-3xl p-5 space-y-4 shadow-2xl text-center relative overflow-hidden">
            {/* Ambient Glow */}
            <div
              className={`absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
                resultPopup.outcome === 'SOLD' ? 'bg-amber-500/20' : 'bg-red-500/15'
              }`}
            />

            <div className="relative">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${
                  resultPopup.outcome === 'SOLD'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                    : 'bg-red-500/20 border border-red-500/60 text-red-400'
                }`}
              >
                {resultPopup.outcome === 'SOLD' ? '🔨 LOT SOLD' : 'UNSOLD'}
              </span>

              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                {activeLot.player.name}
              </h3>
              <p className="text-xs text-slate-400">
                {activeLot.player.primaryRole} · {tierDisplayName}
              </p>
            </div>

            {resultPopup.outcome === 'SOLD' && resultPopup.winningFranchiseId ? (
              <div className="p-3.5 rounded-2xl bg-[#111D36] border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <FranchiseLogo franchiseId={resultPopup.winningFranchiseId} size="md" />
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Acquiring Franchise
                    </span>
                    <span className="text-sm font-black text-white">
                      {FRANCHISES.find(f => f.id === resultPopup.winningFranchiseId)?.name || resultPopup.winningFranchiseId}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Winning Price:</span>
                  <span className="font-black text-amber-400 font-mono text-sm">
                    ₹{resultPopup.finalPriceCr.toFixed(2)} Cr
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Remaining Purse:</span>
                  <span className="font-bold text-slate-200 font-mono">
                    ₹{franchiseStates[resultPopup.winningFranchiseId]?.purseRemainingCr.toFixed(2) || 0} Cr
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-red-400">Player Passed Unsold</p>
                <p className="text-[11px] text-slate-400">
                  {resultPopup.unsoldReason || 'No eligible franchise met the reserve base price.'}
                </p>
              </div>
            )}

            <button
              onClick={handleContinueNextLot}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-98"
            >
              CONTINUE TO NEXT LOT ➔
            </button>
          </div>
        </div>
      )}

      {/* ================= EXPANDABLE DETAILED STATS DRAWER ================= */}
      {isStatsDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end justify-center p-3 animate-fadeIn">
          <div className="w-full max-w-md bg-[#0D1629] border-2 border-amber-500/50 rounded-3xl p-5 space-y-4 max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black text-white uppercase">{p.name} - Detailed Analytics</span>
              </div>
              <button
                onClick={() => setIsStatsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 text-xs pr-1 divide-y divide-slate-800">
              {/* Batting Attributes */}
              <div className="space-y-1 pt-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Batting Attributes
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Timing</span>
                    <span className="font-bold text-white font-mono">{p.batting.timing}</span>
                  </div>
                  <div className="flex justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Power</span>
                    <span className="font-bold text-white font-mono">{p.batting.power}</span>
                  </div>
                  <div className="flex justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Technique</span>
                    <span className="font-bold text-white font-mono">{p.batting.technique}</span>
                  </div>
                  <div className="flex justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Running / Gap</span>
                    <span className="font-bold text-white font-mono">{p.batting.runningBetweenWickets}</span>
                  </div>
                </div>
              </div>

              {/* Bowling / Fielding Attributes */}
              <div className="space-y-1 pt-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                  Bowling & Fielding
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Pace / Turn</span>
                    <span className="font-bold text-white font-mono">
                      {p.paceBowling?.speed || p.spinBowling?.turn || 75}
                    </span>
                  </div>
                  <div className="flex justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Accuracy / Control</span>
                    <span className="font-bold text-white font-mono">
                      {p.paceBowling?.control || p.spinBowling?.control || 80}
                    </span>
                  </div>
                  <div className="flex justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Catching</span>
                    <span className="font-bold text-white font-mono">{p.fielding.catching}</span>
                  </div>
                  <div className="flex justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Throwing</span>
                    <span className="font-bold text-white font-mono">{p.fielding.throwing}</span>
                  </div>
                </div>
              </div>

              {/* Mental & Fitness */}
              <div className="space-y-1 pt-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  Mental & Conditioning
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Consistency</span>
                    <span className="font-bold text-white font-mono">{p.mental.consistency}</span>
                  </div>
                  <div className="flex justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Pressure Handling</span>
                    <span className="font-bold text-white font-mono">{p.mental.pressureHandling}</span>
                  </div>
                  <div className="flex justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Stamina</span>
                    <span className="font-bold text-white font-mono">{p.fitnessAttributes.stamina}</span>
                  </div>
                  <div className="flex justify-between bg-slate-900/60 p-2 rounded-lg">
                    <span className="text-slate-400">Potential</span>
                    <span className="font-bold text-white font-mono">{p.potentialRating}</span>
                  </div>
                </div>
              </div>

              {/* T20 Career Stats */}
              <div className="space-y-1 pt-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-yellow-400">
                  T20 Career Records
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="text-slate-400 block">Matches</span>
                    <span className="font-black text-white text-xs">{p.careerStats.matches}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="text-slate-400 block">Runs</span>
                    <span className="font-black text-amber-400 text-xs">{p.careerStats.runs}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="text-slate-400 block">Strike Rate</span>
                    <span className="font-black text-emerald-400 text-xs">{p.careerStats.strikeRate.toFixed(1)}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="text-slate-400 block">Wickets</span>
                    <span className="font-black text-blue-400 text-xs">{p.careerStats.wickets}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="text-slate-400 block">Economy</span>
                    <span className="font-black text-cyan-400 text-xs">{p.careerStats.economy.toFixed(1)}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="text-slate-400 block">Best Bowl</span>
                    <span className="font-black text-slate-200 text-xs">{p.careerStats.bestBowling}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsStatsDrawerOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= SQUAD ROSTER MODAL ================= */}
      {isSquadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0C1527] border-2 border-amber-500/60 rounded-3xl p-5 space-y-3 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <FranchiseLogo franchiseId={userFranchise.id} size="sm" />
                <span className="text-sm font-black text-white">{userFranchise.name} Squad</span>
              </div>
              <button
                onClick={() => setIsSquadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Purse Remaining:</span>
              <span className="font-black text-amber-400 font-mono">
                ₹{userState?.purseRemainingCr.toFixed(2)} Cr
              </span>
            </div>

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {userState.rosterPlayerIds.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No players acquired yet in this auction.
                </div>
              ) : (
                userState.rosterPlayerIds.map((id, index) => {
                  const plyr = allPlayersMap[id];
                  if (!plyr) return null;
                  return (
                    <div
                      key={id}
                      className="p-2 rounded-xl bg-[#111C33] border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-4 text-center font-mono text-[10px] text-slate-500">{index + 1}</span>
                        <div>
                          <span className="font-bold text-white block">{plyr.name}</span>
                          <span className="text-[10px] text-slate-400">{plyr.primaryRole}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-amber-400 text-xs font-mono">
                          {plyr.overallRating}
                        </span>
                        {plyr.isOverseas && (
                          <span className="block text-[9px] text-cyan-400 font-bold">OS</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setIsSquadModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs"
            >
              Back to Auction
            </button>
          </div>
        </div>
      )}

      {/* ================= EMPTY SQUAD PROTECTION MODAL ================= */}
      {emptySquadErrorModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0E172A] border-2 border-red-500 rounded-3xl p-5 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                {userState.rosterPlayerIds.length === 0 ? 'YOUR SQUAD IS EMPTY' : 'SQUAD REQUIREMENTS NOT MET'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {userState.rosterPlayerIds.length === 0
                  ? 'Complete the Mega Auction and register eligible players before starting the season.'
                  : 'You must fulfill all tournament squad requirements before completing the auction.'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-1.5 text-xs text-red-300 max-h-36 overflow-y-auto">
              {emptySquadErrorModal.map((err, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold shrink-0">•</span>
                  <span>{err}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setEmptySquadErrorModal(null)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-98"
            >
              RETURN TO AUCTION
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
