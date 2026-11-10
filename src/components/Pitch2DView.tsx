/**
 * WICKET DYNASTY - 2D Cricket Ground & Player Animation Presentation (Phase 05)
 * Oval Ground, 30-Yard Circle, Stumps, Creases, Dynamic Fielders, White Ball & Intelligent Fielder AI
 */
import React, { useEffect, useState } from 'react';
import { BallEvent } from '../types/match';
import { FieldingPresetType } from '../types/tactics';

interface Pitch2DViewProps {
  currentBall: BallEvent | null;
  fieldingPreset?: FieldingPresetType;
  isSimulating: boolean;
  bowlerName: string;
  strikerName: string;
  battingFranchiseColor?: string;
  bowlingFranchiseColor?: string;
}

export const Pitch2DView: React.FC<Pitch2DViewProps> = ({
  currentBall,
  fieldingPreset = 'Balanced Standard T20',
  isSimulating,
  bowlerName,
  strikerName,
  battingFranchiseColor = '#F59E0B',
  bowlingFranchiseColor = '#3B82F6',
}) => {
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 70 });
  const [ballVisible, setBallVisible] = useState(false);
  const [eventBadge, setEventBadge] = useState<string | null>(null);

  // Active moving fielder index and position for intelligent fielder response
  const [activeFielderIdx, setActiveFielderIdx] = useState<number | null>(null);
  const [activeFielderPos, setActiveFielderPos] = useState<{ x: number; y: number } | null>(null);

  // Base Fielder coordinates based on manager's fielding preset
  const getFielderPositions = (): { x: number; y: number; label: string }[] => {
    if (fieldingPreset === 'Attacking Slips & Ring') {
      return [
        { x: 44, y: 76, label: 'Slip 1' },
        { x: 40, y: 78, label: 'Slip 2' },
        { x: 34, y: 78, label: 'Gully' },
        { x: 28, y: 62, label: 'Point' },
        { x: 36, y: 46, label: 'Cover' },
        { x: 46, y: 36, label: 'Mid-off' },
        { x: 56, y: 36, label: 'Mid-on' },
        { x: 68, y: 52, label: 'Mid-wicket' },
        { x: 78, y: 78, label: 'Third Man' },
      ];
    } else if (fieldingPreset === 'Defensive Boundary Patrol') {
      return [
        { x: 16, y: 44, label: 'Deep Cover' },
        { x: 24, y: 84, label: 'Third Man' },
        { x: 36, y: 14, label: 'Long-off' },
        { x: 64, y: 14, label: 'Long-on' },
        { x: 84, y: 44, label: 'Deep Mid-wkt' },
        { x: 80, y: 84, label: 'Fine Leg' },
        { x: 40, y: 56, label: 'Cover' },
        { x: 60, y: 56, label: 'Mid-wicket' },
        { x: 36, y: 66, label: 'Point' },
      ];
    } else if (fieldingPreset === 'Death-over Pocket Prevent') {
      return [
        { x: 14, y: 64, label: 'Deep Point' },
        { x: 32, y: 12, label: 'Long-off' },
        { x: 68, y: 12, label: 'Long-on' },
        { x: 86, y: 64, label: 'Deep Sq Leg' },
        { x: 80, y: 86, label: 'Fine Leg' },
        { x: 40, y: 50, label: 'Cover' },
        { x: 60, y: 50, label: 'Mid-on' },
        { x: 38, y: 70, label: 'Bkwd Point' },
        { x: 64, y: 70, label: 'Mid-wicket' },
      ];
    }

    // Default: 'Balanced Standard T20'
    return [
      { x: 43, y: 76, label: 'Slip' },
      { x: 32, y: 64, label: 'Point' },
      { x: 36, y: 46, label: 'Cover' },
      { x: 46, y: 36, label: 'Mid-off' },
      { x: 56, y: 36, label: 'Mid-on' },
      { x: 66, y: 50, label: 'Mid-wicket' },
      { x: 20, y: 36, label: 'Deep Cover' },
      { x: 80, y: 36, label: 'Deep Mid-wkt' },
      { x: 76, y: 82, label: 'Fine Leg' },
    ];
  };

  const fielders = getFielderPositions();

  // Trigger Ball Trajectory and Intelligent Fielder AI Response
  useEffect(() => {
    if (!currentBall) return;

    setBallVisible(true);
    setActiveFielderIdx(null);
    setActiveFielderPos(null);

    // Stage 1: Bowler release at (50, 36)
    setBallPos({ x: 50, y: 36 });

    // Stage 2: Ball pitches on length (50, 56)
    const timer1 = setTimeout(() => {
      setBallPos({ x: 50, y: 56 });
    }, 120);

    // Stage 3: Ball arrives at striker crease (50, 70)
    const timer2 = setTimeout(() => {
      setBallPos({ x: 50, y: 70 });
    }, 240);

    // Stage 4: Shot played -> Ball travels along trajectory towards target!
    const timer3 = setTimeout(() => {
      const targetX = currentBall.trajectory?.targetX ?? (currentBall.totalRuns === 6 ? 82 : currentBall.totalRuns === 4 ? 88 : 50);
      const targetY = currentBall.trajectory?.targetY ?? (currentBall.totalRuns === 6 ? 12 : currentBall.totalRuns === 4 ? 44 : 72);

      setBallPos({ x: targetX, y: targetY });

      // Intelligent Fielder Interception:
      // Find the fielder closest to the ball's target coordinates
      let closestIdx = 0;
      let minDistance = 9999;
      fielders.forEach((f, idx) => {
        const dist = Math.hypot(f.x - targetX, f.y - targetY);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      // Animate nearest fielder running towards the ball trajectory!
      setActiveFielderIdx(closestIdx);
      const interceptX = targetX > 50 ? targetX - 4 : targetX + 4;
      const interceptY = targetY > 50 ? targetY - 4 : targetY + 4;
      setActiveFielderPos({ x: Math.max(12, Math.min(88, interceptX)), y: Math.max(12, Math.min(88, interceptY)) });

      // Display Event Banner
      if (currentBall.totalRuns === 6) {
        setEventBadge('MAXIMUM 6!');
      } else if (currentBall.totalRuns === 4) {
        setEventBadge('FOUR!');
      } else if (currentBall.isWicket) {
        setEventBadge('WICKET!');
      } else if (currentBall.totalRuns > 0) {
        setEventBadge(`${currentBall.totalRuns} RUN${currentBall.totalRuns > 1 ? 'S' : ''}`);
      } else {
        setEventBadge('DOT BALL');
      }
    }, 380);

    // Reset fielder positions after play completes
    const timer4 = setTimeout(() => {
      setActiveFielderIdx(null);
      setActiveFielderPos(null);
      setEventBadge(null);
    }, 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [currentBall]);

  return (
    <div className="relative w-full aspect-[4/5] max-h-[420px] bg-[#061208] rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex items-center justify-center select-none">
      {/* Stadium Crowd Stands Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#051108]/60 to-[#030905] pointer-events-none" />

      {/* Stadium Outfield Grass Patterns (Lush green striped turf) */}
      <div className="absolute inset-2 rounded-full cricket-lawn-pattern border-4 border-white/30 shadow-[inset_0_4px_20px_rgba(0,0,0,0.6)]" />

      {/* 30-Yard Inner Fielding Restriction Circle */}
      <div className="absolute w-[68%] h-[68%] rounded-full border-2 border-dashed border-white/40 pointer-events-none" />

      {/* Boundary Rope Marker */}
      <div className="absolute inset-4 rounded-full border-2 border-amber-300/40 pointer-events-none" />

      {/* 2D Central Cricket Pitch Strip */}
      <div className="absolute w-[18%] h-[46%] bg-gradient-to-b from-[#C4A47C] via-[#B8966C] to-[#C4A47C] rounded-sm border border-amber-900/40 shadow-lg flex flex-col justify-between items-center py-1">
        {/* Bowling Crease (Top end) */}
        <div className="w-[85%] flex flex-col items-center">
          <div className="w-full h-[1.5px] bg-white/90 mb-0.5" />
          <div className="w-4 h-1.5 flex justify-between">
            <div className="w-1 h-1.5 bg-amber-200 rounded-sm" />
            <div className="w-1 h-1.5 bg-amber-200 rounded-sm" />
            <div className="w-1 h-1.5 bg-amber-200 rounded-sm" />
          </div>
        </div>

        {/* Pitch Turf Wear Details */}
        <div className="w-3/4 h-8 bg-amber-950/15 rounded-full blur-[1px]" />

        {/* Batting Crease (Bottom end) */}
        <div className="w-[85%] flex flex-col items-center">
          <div className="w-4 h-1.5 flex justify-between mb-0.5">
            <div className="w-1 h-1.5 bg-amber-200 rounded-sm" />
            <div className="w-1 h-1.5 bg-amber-200 rounded-sm" />
            <div className="w-1 h-1.5 bg-amber-200 rounded-sm" />
          </div>
          <div className="w-full h-[1.5px] bg-white/90" />
        </div>
      </div>

      {/* Bowler Avatar (Bowling Team Colors) */}
      <div className="absolute top-[24%] left-[47%] flex flex-col items-center pointer-events-none z-10 transition-transform duration-300">
        <div
          className="w-4 h-4 rounded-full border border-white shadow-md flex items-center justify-center text-[7px] font-black text-white"
          style={{ backgroundColor: bowlingFranchiseColor }}
        >
          B
        </div>
        <span className="text-[8px] font-bold text-white/90 bg-black/60 px-1 rounded mt-0.5">
          {bowlerName.split(' ')[0]}
        </span>
      </div>

      {/* Non-Striker Avatar (Batting Team Colors) */}
      <div className="absolute top-[28%] left-[54%] flex flex-col items-center pointer-events-none z-10">
        <div
          className="w-3.5 h-3.5 rounded-full border border-white shadow flex items-center justify-center text-[6px] font-black text-white"
          style={{ backgroundColor: battingFranchiseColor }}
        >
          NS
        </div>
      </div>

      {/* Striker Avatar (Batting Team Colors) */}
      <div className="absolute top-[67%] left-[47.5%] flex flex-col items-center pointer-events-none z-10 transition-transform duration-200">
        <div
          className="w-4 h-4 rounded-full border border-slate-950 shadow-md flex items-center justify-center text-[7px] font-black text-slate-950"
          style={{ backgroundColor: battingFranchiseColor }}
        >
          🏏
        </div>
        <span className="text-[8px] font-bold text-amber-300 bg-black/70 px-1 rounded mt-0.5">
          {strikerName.split(' ')[0]}*
        </span>
      </div>

      {/* Wicketkeeper (Bowling Team Colors) */}
      <div className="absolute top-[75%] left-[48%] flex flex-col items-center pointer-events-none z-10">
        <div
          className="w-3.5 h-3.5 rounded-full border border-white shadow flex items-center justify-center text-[6px] font-black text-white"
          style={{ backgroundColor: bowlingFranchiseColor }}
        >
          WK
        </div>
      </div>

      {/* 9 Fielders with Intelligent Running Movement toward Trajectory */}
      {fielders.map((f, i) => {
        const isInterceptionActive = activeFielderIdx === i && activeFielderPos;
        const posX = isInterceptionActive ? activeFielderPos.x : f.x;
        const posY = isInterceptionActive ? activeFielderPos.y : f.y;

        return (
          <div
            key={i}
            className={`absolute flex flex-col items-center pointer-events-none z-10 ${
              isInterceptionActive ? 'transition-all duration-300 ease-out scale-110' : 'transition-all duration-700 ease-out'
            }`}
            style={{ top: `${posY}%`, left: `${posX}%` }}
          >
            <div
              className={`w-3 h-3 rounded-full border shadow-sm ${
                isInterceptionActive ? 'border-amber-400 ring-2 ring-amber-400/50 animate-pulse' : 'border-white/80'
              }`}
              style={{ backgroundColor: bowlingFranchiseColor }}
            />
            <span className="text-[7px] font-medium text-white/90 bg-black/50 px-0.5 rounded scale-90 mt-0.5">
              {f.label}
            </span>
          </div>
        );
      })}

      {/* WHITE Cricket Ball with Luminous Glow & Sharp Visibility */}
      {ballVisible && (
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-white border border-slate-950 shadow-[0_0_8px_rgba(255,255,255,1)] pointer-events-none z-20 transition-all duration-200 ease-out"
          style={{
            top: `${ballPos.y}%`,
            left: `${ballPos.x}%`,
            transform: `scale(${currentBall?.totalRuns === 6 ? 1.8 : 1.0})`,
          }}
        />
      )}

      {/* Big Event Stinger Banner (FOUR, SIX, WICKET, DOT) */}
      {eventBadge && (
        <div className="absolute z-30 pointer-events-none animate-in zoom-in-75 fade-in duration-200">
          <div
            className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl border-2 ${
              eventBadge.includes('WICKET')
                ? 'bg-red-600 border-white text-white animate-bounce'
                : eventBadge.includes('6')
                ? 'bg-purple-600 border-amber-300 text-white scale-110'
                : eventBadge.includes('4')
                ? 'bg-amber-500 border-slate-950 text-slate-950'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            {eventBadge}
          </div>
        </div>
      )}

      {/* Field Strategy Watermark */}
      <div className="absolute bottom-2 left-3 text-[9px] font-bold text-white/40 tracking-wider uppercase pointer-events-none">
        Preset: {fieldingPreset}
      </div>
    </div>
  );
};
