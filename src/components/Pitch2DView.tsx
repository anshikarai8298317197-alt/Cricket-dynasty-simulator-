/**
 * WICKET DYNASTY - 2D Cricket Ground & Ball Trajectory Animation Presentation (Part 7 + Part 13)
 * Smooth rAF parabolic arc for SIX (0 bounces + rising scale + shadow separation),
 * Multi-bounce ground roll past boundary rope for FOUR (1-2 visible turf bounce ripples + trail),
 * Intelligent named fielder interception + catch glow for CAUGHT dismissals,
 * Honoring Battery Saver low-motion mode when enabled in Settings.
 */
import React, { useEffect, useRef, useState } from 'react';
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

const SETTINGS_LS_KEY = 'wicket_dynasty_settings_v1';

function readBatterySaverFlag(): boolean {
  try {
    const raw = localStorage.getItem(SETTINGS_LS_KEY);
    if (!raw) return false;
    return Boolean(JSON.parse(raw)?.batterySaver);
  } catch {
    return false;
  }
}

export const Pitch2DView: React.FC<Pitch2DViewProps> = ({
  currentBall,
  fieldingPreset = 'Balanced Standard T20',
  bowlerName,
  strikerName,
  battingFranchiseColor = '#F59E0B',
  bowlingFranchiseColor = '#3B82F6',
}) => {
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 70 });
  const [shadowPos, setShadowPos] = useState<{ x: number; y: number }>({ x: 50, y: 70 });
  const [ballScale, setBallScale] = useState(1);
  const [ballVisible, setBallVisible] = useState(false);
  const [trailPoints, setTrailPoints] = useState<{ x: number; y: number }[]>([]);
  const [visibleBounces, setVisibleBounces] = useState<{ x: number; y: number }[]>([]);
  const [eventBadge, setEventBadge] = useState<string | null>(null);
  const [catchTag, setCatchTag] = useState<string | null>(null);

  const [activeFielderIdx, setActiveFielderIdx] = useState<number | null>(null);
  const [activeFielderPos, setActiveFielderPos] = useState<{ x: number; y: number } | null>(null);
  const [catchFlash, setCatchFlash] = useState(false);

  const rafRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (!currentBall) {
      setBallVisible(false);
      setTrailPoints([]);
      setVisibleBounces([]);
      setEventBadge(null);
      setCatchTag(null);
      setCatchFlash(false);
      return;
    }

    const batterySaver = readBatterySaverFlag();
    const isSix = currentBall.totalRuns === 6;
    const isFour = currentBall.totalRuns === 4;
    const isCaught = currentBall.isWicket && currentBall.dismissal?.kind === 'CAUGHT';

    const targetX =
      currentBall.trajectory?.targetX ??
      (isSix ? 82 : isFour ? 90 : isCaught ? currentBall.fieldingAction?.interceptX ?? 74 : 50);
    const targetY =
      currentBall.trajectory?.targetY ??
      (isSix ? 10 : isFour ? 42 : isCaught ? currentBall.fieldingAction?.interceptY ?? 32 : 70);

    const plannedBounces = isFour
      ? currentBall.trajectory?.bouncePoints?.length
        ? currentBall.trajectory.bouncePoints
        : [{ x: 50 + (targetX - 50) * 0.45, y: 68 + (targetY - 68) * 0.45 }]
      : [];

    const apexHeight = currentBall.trajectory?.apexHeight || (isSix ? 28 : isCaught ? 18 : 0);

    // Closest fielder to intercept point
    let closestIdx = 0;
    let minDist = Infinity;
    fielders.forEach((f, idx) => {
      const dist = Math.hypot(f.x - targetX, f.y - targetY);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    const fielderStart = fielders[closestIdx] || { x: 65, y: 45, label: 'Fielder' };
    const interceptX = isCaught
      ? currentBall.fieldingAction?.interceptX ?? targetX
      : Math.max(10, Math.min(90, targetX > 50 ? targetX - 3 : targetX + 3));
    const interceptY = isCaught
      ? currentBall.fieldingAction?.interceptY ?? targetY
      : Math.max(10, Math.min(90, targetY > 50 ? targetY - 3 : targetY + 3));

    const showBannerNow = () => {
      if (isSix) {
        setEventBadge('MAXIMUM 6!');
      } else if (isFour) {
        setEventBadge('FOUR!');
      } else if (currentBall.isWicket) {
        setEventBadge('WICKET!');
        if (isCaught && currentBall.dismissal?.assistPlayerName) {
          setCatchTag(`CAUGHT BY ${currentBall.dismissal.assistPlayerName.toUpperCase()}`);
          setCatchFlash(true);
        }
      } else if (currentBall.totalRuns > 0) {
        setEventBadge(`${currentBall.totalRuns} RUN${currentBall.totalRuns > 1 ? 'S' : ''}`);
      } else {
        setEventBadge('DOT BALL');
      }
    };

    setBallVisible(true);
    setBallScale(1);
    setTrailPoints([]);
    setVisibleBounces([]);
    setEventBadge(null);
    setCatchTag(null);
    setCatchFlash(false);
    setActiveFielderIdx(closestIdx);
    setActiveFielderPos({ x: fielderStart.x, y: fielderStart.y });

    // Lightweight 3-step mode when Battery Saver is enabled
    if (batterySaver) {
      setBallPos({ x: 50, y: 38 });
      setShadowPos({ x: 50, y: 38 });
      const t1 = setTimeout(() => {
        setBallPos({ x: 50, y: 68 });
        setShadowPos({ x: 50, y: 68 });
      }, 150);
      const t2 = setTimeout(() => {
        setBallPos({ x: targetX, y: targetY });
        setShadowPos({ x: targetX, y: targetY });
        setBallScale(isSix ? 1.85 : 1);
        setTrailPoints([{ x: 50, y: 68 }, { x: targetX, y: targetY }]);
        if (isFour) setVisibleBounces(plannedBounces);
        setActiveFielderPos({ x: interceptX, y: interceptY });
        showBannerNow();
      }, 320);
      const t3 = setTimeout(() => {
        setActiveFielderIdx(null);
        setActiveFielderPos(null);
        setCatchFlash(false);
      }, 1100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    // Smooth rAF trajectory physics timeline (960ms total)
    const startTs = performance.now();
    const deliveryDur = 280; // bowler -> batter crease
    const shotDur = isSix ? 560 : isFour ? 500 : isCaught ? 540 : 420;
    let bannerFired = false;

    const animate = (now: number) => {
      const elapsed = now - startTs;

      if (elapsed <= deliveryDur) {
        const p = Math.min(1, elapsed / deliveryDur);
        const by = 36 + (68 - 36) * p;
        setBallPos({ x: 50, y: by });
        setShadowPos({ x: 50, y: by });
        setBallScale(1);
        setTrailPoints([
          { x: 50, y: 36 },
          { x: 50, y: by },
        ]);
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const shotElapsed = elapsed - deliveryDur;
      const t = Math.min(1, shotElapsed / shotDur);
      // Ease out slightly on ground roll, smooth arc on aerial
      const eased = isSix || isCaught ? t : 1 - Math.pow(1 - t, 1.4);

      const groundX = 50 + (targetX - 50) * eased;
      const groundY = 68 + (targetY - 68) * eased;

      if (isSix) {
        // Pure parabolic arc with ZERO ground bounce + shadow separation + up to 2.1x visual scale
        const arcFactor = Math.sin(t * Math.PI);
        const liftY = arcFactor * (apexHeight * 0.42);
        setBallPos({ x: groundX, y: groundY - liftY });
        setShadowPos({ x: groundX, y: groundY + 1.5 });
        setBallScale(1 + arcFactor * 1.1);
        setVisibleBounces([]);
      } else if (isCaught) {
        // Lofted ball descending directly into moving catcher's hands
        const arcFactor = Math.sin(t * Math.PI);
        const liftY = arcFactor * (apexHeight * 0.35);
        setBallPos({ x: groundX, y: groundY - liftY });
        setShadowPos({ x: groundX, y: groundY + 1.0 });
        setBallScale(1 + arcFactor * 0.65);

        // Fielder sprints continuously from start -> intercept point
        const runEase = Math.min(1, t * 1.05);
        setActiveFielderPos({
          x: fielderStart.x + (interceptX - fielderStart.x) * runEase,
          y: fielderStart.y + (interceptY - fielderStart.y) * runEase,
        });
      } else if (isFour) {
        // Ground shot with 1-2 crisp turf bounce ripples along path
        const subBounce = Math.abs(Math.sin(t * Math.PI * (plannedBounces.length + 0.5))) * 1.8 * (1 - t);
        setBallPos({ x: groundX, y: groundY - subBounce });
        setShadowPos({ x: groundX, y: groundY });
        setBallScale(1 + subBounce * 0.08);
        const reachedBounces = plannedBounces.filter((_, idx) => t >= (idx + 1) / (plannedBounces.length + 1));
        setVisibleBounces(reachedBounces);
        // Fielder chases along perimeter
        const chaseEase = Math.min(1, t * 0.9);
        setActiveFielderPos({
          x: fielderStart.x + (interceptX - fielderStart.x) * chaseEase,
          y: fielderStart.y + (interceptY - fielderStart.y) * chaseEase,
        });
      } else {
        setBallPos({ x: groundX, y: groundY });
        setShadowPos({ x: groundX, y: groundY });
        setBallScale(1);
        if (currentBall.totalRuns > 0) {
          setActiveFielderPos({
            x: fielderStart.x + (interceptX - fielderStart.x) * eased,
            y: fielderStart.y + (interceptY - fielderStart.y) * eased,
          });
        }
      }

      setTrailPoints(prev => {
        const nextPt = { x: groundX, y: isSix ? groundY - Math.sin(t * Math.PI) * (apexHeight * 0.42) : groundY };
        const base = prev.length > 16 ? prev.slice(prev.length - 16) : prev;
        return [...base, nextPt];
      });

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        if (!bannerFired) {
          bannerFired = true;
          showBannerNow();
        }
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    const resetTimer = setTimeout(() => {
      setActiveFielderIdx(null);
      setActiveFielderPos(null);
      setEventBadge(null);
      setCatchTag(null);
      setCatchFlash(false);
    }, deliveryDur + shotDur + 520);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      clearTimeout(resetTimer);
    };
  }, [currentBall]);

  const trailPolyline = trailPoints.map(pt => `${pt.x},${pt.y}`).join(' ');
  const isSixBall = currentBall?.totalRuns === 6;
  const isFourBall = currentBall?.totalRuns === 4;

  return (
    <div className="relative w-full aspect-[4/5] max-h-[420px] bg-[#061208] rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex items-center justify-center select-none">
      {/* Stadium Crowd Stands Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#051108]/60 to-[#030905] pointer-events-none" />

      {/* Stadium Outfield Grass Patterns */}
      <div className="absolute inset-2 rounded-full cricket-lawn-pattern border-4 border-white/30 shadow-[inset_0_4px_20px_rgba(0,0,0,0.6)]" />

      {/* 30-Yard Inner Fielding Restriction Circle */}
      <div className="absolute w-[68%] h-[68%] rounded-full border-2 border-dashed border-white/40 pointer-events-none" />

      {/* Boundary Rope Marker */}
      <div className="absolute inset-4 rounded-full border-2 border-amber-300/40 pointer-events-none" />

      {/* 2D Central Cricket Pitch Strip */}
      <div className="absolute w-[18%] h-[46%] bg-gradient-to-b from-[#C4A47C] via-[#B8966C] to-[#C4A47C] rounded-sm border border-amber-900/40 shadow-lg flex flex-col justify-between items-center py-1">
        <div className="w-[85%] flex flex-col items-center">
          <div className="w-full h-[1.5px] bg-white/90 mb-0.5" />
          <div className="w-4 h-1.5 flex justify-between">
            <div className="w-1 h-1.5 bg-amber-200 rounded-sm" />
            <div className="w-1 h-1.5 bg-amber-200 rounded-sm" />
            <div className="w-1 h-1.5 bg-amber-200 rounded-sm" />
          </div>
        </div>
        <div className="w-3/4 h-8 bg-amber-950/15 rounded-full blur-[1px]" />
        <div className="w-[85%] flex flex-col items-center">
          <div className="w-4 h-1.5 flex justify-between mb-0.5">
            <div className="w-1 h-1.5 bg-amber-200 rounded-sm" />
            <div className="w-1 h-1.5 bg-amber-200 rounded-sm" />
            <div className="w-1 h-1.5 bg-amber-200 rounded-sm" />
          </div>
          <div className="w-full h-[1.5px] bg-white/90" />
        </div>
      </div>

      {/* Ball Trajectory Glowing Trail SVG Overlay */}
      {ballVisible && trailPoints.length > 1 && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-15">
          <polyline
            fill="none"
            stroke={isSixBall ? '#c084fc' : isFourBall ? '#fbbf24' : '#ffffff'}
            strokeWidth={isSixBall ? '1.3' : '0.9'}
            strokeOpacity="0.65"
            strokeDasharray={isSixBall ? '2 1.2' : 'none'}
            strokeLinecap="round"
            points={trailPolyline}
          />
          {visibleBounces.map((bp, idx) => (
            <g key={idx}>
              <circle cx={bp.x} cy={bp.y} r="2.2" fill="none" stroke="#fbbf24" strokeWidth="0.7" opacity="0.85" />
              <circle cx={bp.x} cy={bp.y} r="0.8" fill="#fef08a" />
            </g>
          ))}
        </svg>
      )}

      {/* Bowler Avatar */}
      <div className="absolute top-[23%] left-[47%] flex flex-col items-center pointer-events-none z-10">
        <div
          className="w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden bg-slate-900"
          style={{ borderColor: bowlingFranchiseColor }}
        >
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <circle cx="20" cy="20" r="19" fill={bowlingFranchiseColor} />
            <circle cx="20" cy="15" r="7" fill="#fde047" />
            <path d="M12 36 C12 26 28 26 28 36 Z" fill="#1e293b" />
            <circle cx="27" cy="18" r="2.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.5" />
          </svg>
        </div>
        <span className="text-[8px] font-black text-white/95 bg-black/75 px-1 py-0.2 rounded mt-0.5 shadow font-mono">
          {bowlerName.split(' ')[0]}
        </span>
      </div>

      {/* Non-Striker Avatar */}
      <div className="absolute top-[28%] left-[54%] flex flex-col items-center pointer-events-none z-10">
        <div
          className="w-4 h-4 rounded-full border border-white shadow-md flex items-center justify-center overflow-hidden bg-slate-900"
          style={{ borderColor: battingFranchiseColor }}
        >
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <circle cx="20" cy="20" r="19" fill={battingFranchiseColor} />
            <circle cx="20" cy="15" r="7" fill="#fbbf24" />
            <path d="M13 36 C13 27 27 27 27 36 Z" fill="#0f172a" />
          </svg>
        </div>
        <span className="text-[7px] font-bold text-slate-300 bg-black/60 px-0.5 rounded scale-90">NS</span>
      </div>

      {/* Striker Avatar */}
      <div className="absolute top-[66%] left-[47.5%] flex flex-col items-center pointer-events-none z-10">
        <div className="w-5 h-5 rounded-full border-2 border-amber-400 shadow-xl flex items-center justify-center overflow-hidden bg-slate-950">
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <circle cx="20" cy="20" r="19" fill={battingFranchiseColor} />
            <circle cx="20" cy="14" r="7.5" fill="#0284c7" />
            <rect x="15" y="15" width="10" height="4" rx="1.5" fill="#e2e8f0" opacity="0.9" />
            <path d="M12 36 C12 25 28 25 28 36 Z" fill="#0f172a" />
            <line x1="28" y1="18" x2="35" y2="34" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-[8px] font-black text-amber-300 bg-black/80 px-1 py-0.2 rounded mt-0.5 shadow font-mono">
          {strikerName.split(' ')[0]}*
        </span>
      </div>

      {/* Wicketkeeper */}
      <div className="absolute top-[75%] left-[48%] flex flex-col items-center pointer-events-none z-10">
        <div
          className="w-4 h-4 rounded-full border border-white shadow-md flex items-center justify-center overflow-hidden bg-slate-900"
          style={{ borderColor: bowlingFranchiseColor }}
        >
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <circle cx="20" cy="20" r="19" fill={bowlingFranchiseColor} />
            <circle cx="20" cy="15" r="7" fill="#38bdf8" />
            <path d="M13 36 C13 27 27 27 27 36 Z" fill="#1e293b" />
            <rect x="14" y="24" width="4" height="4" rx="1" fill="#22c55e" />
            <rect x="22" y="24" width="4" height="4" rx="1" fill="#22c55e" />
          </svg>
        </div>
        <span className="text-[7px] font-bold text-slate-300 bg-black/60 px-0.5 rounded scale-90">WK</span>
      </div>

      {/* 9 Fielders with Continuous Sprinting Interception */}
      {fielders.map((f, i) => {
        const isInterceptionActive = activeFielderIdx === i && activeFielderPos;
        const posX = isInterceptionActive ? activeFielderPos.x : f.x;
        const posY = isInterceptionActive ? activeFielderPos.y : f.y;

        return (
          <div
            key={i}
            className="absolute flex flex-col items-center pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ top: `${posY}%`, left: `${posX}%` }}
          >
            <div
              className={`w-3 h-3 rounded-full border shadow-sm ${
                isInterceptionActive && catchFlash
                  ? 'border-amber-300 ring-4 ring-amber-400/70 scale-125'
                  : isInterceptionActive
                  ? 'border-amber-400 ring-2 ring-amber-400/50'
                  : 'border-white/80'
              }`}
              style={{ backgroundColor: bowlingFranchiseColor }}
            />
            <span className="text-[7px] font-medium text-white/90 bg-black/60 px-0.5 rounded scale-90 mt-0.5 whitespace-nowrap">
              {f.label}
            </span>
          </div>
        );
      })}

      {/* Ground Ball Shadow (visually separated on high lofted SIX/CATCH trajectories) */}
      {ballVisible && (isSixBall || ballScale > 1.15) && (
        <div
          className="absolute w-2.5 h-1.5 rounded-full bg-black/65 blur-[1px] pointer-events-none z-15 -translate-x-1/2 -translate-y-1/2"
          style={{
            top: `${shadowPos.y}%`,
            left: `${shadowPos.x}%`,
            transform: `translate(-50%, -50%) scale(${Math.max(0.55, 1.15 - (ballScale - 1) * 0.4)})`,
          }}
        />
      )}

      {/* White Cricket Ball */}
      {ballVisible && (
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-white border border-slate-950 shadow-[0_0_10px_rgba(255,255,255,1)] pointer-events-none z-20 -translate-x-1/2 -translate-y-1/2"
          style={{
            top: `${ballPos.y}%`,
            left: `${ballPos.x}%`,
            transform: `translate(-50%, -50%) scale(${ballScale.toFixed(2)})`,
          }}
        />
      )}

      {/* Catch Attribution Pill */}
      {catchTag && (
        <div className="absolute top-3 right-3 z-30 bg-red-600/95 border border-white/60 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-wider">
          {catchTag}
        </div>
      )}

      {/* Synchronized Event Stinger Banner */}
      {eventBadge && (
        <div className="absolute z-30 pointer-events-none animate-in zoom-in-75 fade-in duration-150">
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
