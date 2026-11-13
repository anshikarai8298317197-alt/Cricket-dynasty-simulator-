/**
 * WICKET DYNASTY - Home / Dashboard Screen (SCR_01 / SCR_02)
 * Master Reference Design Replica: 3D Game Art, 3D Skeuomorphic Buttons, Stadium Backdrop
 */
import React, { useState, useEffect } from 'react';
import {
  Play,
  Plus,
  FolderOpen,
  Settings,
  ShieldCheck,
  Trophy,
  Calendar,
  Newspaper,
  Award,
  Database,
  Users,
  ChevronRight,
  Crown,
  Sparkles,
  RefreshCw,
  Globe,
  Radio,
} from 'lucide-react';
import { CareerSave } from '../types/career';
import { FRANCHISES } from '../data/franchises';

interface CricketNewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  timeAgo: string;
}

interface MainDashboardProps {
  activeCareer: CareerSave | null;
  hasActiveAuction?: boolean;
  hasActiveMatch?: boolean;
  onResumeAuction?: () => void;
  onResumeMatch?: () => void;
  onContinueCareer: () => void;
  onNewCareer: () => void;
  onLoadCareer: () => void;
  onOpenPlayerDB: (franchiseFilter?: string | null) => void;
  onOpenAudit: () => void;
  onOpenSettings: () => void;
  onBrowseFranchises: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  activeCareer,
  hasActiveAuction = false,
  hasActiveMatch = false,
  onResumeAuction,
  onResumeMatch,
  onContinueCareer,
  onNewCareer,
  onLoadCareer,
  onOpenPlayerDB,
  onOpenAudit,
  onOpenSettings,
  onBrowseFranchises,
}) => {
  const [activeBottomTab, setActiveBottomTab] = useState<'HOME' | 'ACHIEVEMENTS' | 'EVENTS' | 'NEWS'>('HOME');
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  // Search Grounded Cricket News State
  const [newsArticles, setNewsArticles] = useState<CricketNewsArticle[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [activeHeadlineIndex, setActiveHeadlineIndex] = useState(0);
  const [isGrounded, setIsGrounded] = useState(false);

  const fetchCricketNews = async () => {
    setIsNewsLoading(true);
    try {
      const res = await fetch('/api/news/cricket-headlines');
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          setNewsArticles(data.articles);
          setIsGrounded(Boolean(data.grounded));
        }
      }
    } catch (err) {
      console.warn('Failed to load cricket news:', err);
    } finally {
      setIsNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchCricketNews();
  }, []);

  // Auto-cycle top headline preview every 5 seconds
  useEffect(() => {
    if (newsArticles.length <= 1) return;
    const timer = setInterval(() => {
      setActiveHeadlineIndex(prev => (prev + 1) % newsArticles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [newsArticles.length]);

  const currentHeadline = newsArticles[activeHeadlineIndex] || newsArticles[0];

  const activeFranchise = activeCareer
    ? FRANCHISES.find(f => f.id === activeCareer.franchiseId) || FRANCHISES[0]
    : null;

  return (
    <div className="flex-1 flex flex-col relative select-none overflow-hidden bg-[#070D18]">
      {/* Background Stadium Splash Art (Screen 1 Master Reference Replica) */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0"
        style={{
          backgroundImage: `url('/src/assets/images/home_manager_stadium_1794244159984.jpg')`,
        }}
      >
        {/* Cinematic gradient vignette over background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080E1A]/85 via-[#080E1A]/40 to-[#060B14]/95" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-4 pb-2">
        {/* Top 3D Game Logo Lockup (Reference: HOME / DASHBOARD) */}
        <div className="pt-6 flex flex-col items-center text-center animate-in fade-in duration-300">
          {/* Golden Crown Icon */}
          <div className="relative mb-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-300/30 via-amber-500/10 to-transparent border border-amber-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Crown className="w-8 h-8 text-amber-300 fill-amber-400/40 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]" />
            </div>
            <Sparkles className="w-4 h-4 text-amber-200 absolute -top-1 -right-1 animate-pulse" />
          </div>

          {/* 3D Metallic Gold Title */}
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-metallic-gold font-serif leading-none mt-1">
            WICKET DYNASTY
          </h1>

          {/* Golden Ribbon Banner */}
          <div className="mt-1.5 px-4 py-0.5 rounded-full bg-gradient-to-r from-transparent via-[#1E293B] to-transparent border-y border-amber-500/40 flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300 drop-shadow">
              CRICKET MANAGER
            </span>
          </div>

          <p className="text-[10px] text-slate-300/80 font-medium tracking-wide mt-1">
            100% Manager-Only · Android APK
          </p>
        </div>

        {/* Middle Spacer to show stadium artwork & manager */}
        <div className="flex-1 min-h-[140px]" />

        {/* Primary Action Button Stack (Reference: 3D Beveled Buttons) */}
        <div className="space-y-2.5 max-w-sm mx-auto w-full mb-3">
          {/* Active Match / Auction Resume Pills (Crash Recovery) */}
          {activeCareer && (hasActiveMatch || hasActiveAuction) && (
            <div className="grid grid-cols-1 gap-2">
              {hasActiveMatch && onResumeMatch && (
                <button
                  onClick={onResumeMatch}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-400/60 flex items-center justify-between text-white shadow-lg active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 animate-pulse text-emerald-200" />
                    <span className="text-xs font-black uppercase tracking-wider">Resume Saved Live Match</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {hasActiveAuction && onResumeAuction && (
                <button
                  onClick={onResumeAuction}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600/90 hover:bg-amber-500 border border-amber-400/60 flex items-center justify-between text-slate-950 shadow-lg active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider">Resume Saved Auction</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* 1. Continue Career (Prominent 3D Gold Capsule) */}
          {activeCareer ? (
            <button
              onClick={onContinueCareer}
              className="w-full py-3.5 px-5 rounded-2xl btn-game-gold flex items-center justify-between group active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-slate-950/25 border border-slate-950/40 flex items-center justify-center shadow-inner">
                  <Play className="w-4 h-4 fill-slate-950 text-slate-950 translate-x-0.5" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-black uppercase tracking-wider block text-slate-950">
                    Continue Career
                  </span>
                  <span className="text-[11px] font-bold text-slate-900 block opacity-90">
                    {activeFranchise?.shortName || 'Franchise'} · Season {activeCareer.currentSeason} ({activeCareer.currentGameYear || 2026})
                    {activeCareer.worldSeason?.currentDateIso ? ` · ${activeCareer.worldSeason.currentDateIso}` : ''}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={onNewCareer}
              className="w-full py-4 px-5 rounded-2xl btn-game-gold flex items-center justify-center space-x-2 text-sm uppercase tracking-wider font-black active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3] text-slate-950" />
              <span>Start New Career</span>
            </button>
          )}

          {/* 2. New Career Button (3D Dark Beveled) */}
          {activeCareer && (
            <button
              onClick={onNewCareer}
              className="w-full py-3 px-4 rounded-xl btn-game-dark flex items-center space-x-3 text-left active:scale-[0.99] cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-100 flex-1">
                New Career
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* 3. Save Games Button (3D Dark Beveled) */}
          <button
            onClick={onLoadCareer}
            className="w-full py-3 px-4 rounded-xl btn-game-dark flex items-center space-x-3 text-left active:scale-[0.99] cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <FolderOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-100 flex-1">
              Save Games (5 Slots)
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* 4. Settings Button (3D Dark Beveled) */}
          <button
            onClick={onOpenSettings}
            className="w-full py-3 px-4 rounded-xl btn-game-dark flex items-center space-x-3 text-left active:scale-[0.99] cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-700/40 border border-slate-500/30 flex items-center justify-center text-slate-300">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-100 flex-1">
              Settings & Audio
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Quick Roster & 320 Player DB Links */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              onClick={() => onOpenPlayerDB()}
              className="py-2 px-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>320 Players DB</span>
            </button>
            <button
              onClick={onBrowseFranchises}
              className="py-2 px-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>10 Franchises</span>
            </button>
          </div>
        </div>

        {/* Real-World Grounded Cricket News Wire Section */}
        <div className="max-w-sm mx-auto w-full mb-2">
          <div
            onClick={() => setShowNewsModal(true)}
            className="p-2.5 rounded-2xl bg-[#091122]/95 border border-amber-500/30 hover:border-amber-400/60 shadow-lg cursor-pointer transition-all group backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 font-mono">
                  LIVE CRICKET WIRE
                </span>
                {isGrounded && (
                  <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Search Grounded
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 text-[9px] text-slate-400 group-hover:text-amber-300 transition-colors">
                <span>All Headlines</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {isNewsLoading && newsArticles.length === 0 ? (
              <div className="flex items-center space-x-2 py-1 text-slate-400 text-[11px]">
                <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Pulling latest real-world cricket headlines...</span>
              </div>
            ) : currentHeadline ? (
              <div className="text-left animate-in fade-in duration-300">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase">
                    {currentHeadline.category}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {currentHeadline.source} · {currentHeadline.timeAgo}
                  </span>
                </div>
                <h4 className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-amber-200 transition-colors">
                  {currentHeadline.title}
                </h4>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom Game Navigation Tabs (Master Reference: Achievements / Events / News) */}
        <div className="bg-[#091122]/95 border-t border-slate-800/90 rounded-2xl px-2 py-1.5 flex items-center justify-around shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setShowAchievementsModal(true)}
            className="flex flex-col items-center py-1 px-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-amber-400 transition-colors"
          >
            <Trophy className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Achievements</span>
          </button>

          <button
            onClick={() => setShowEventsModal(true)}
            className="flex flex-col items-center py-1 px-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-amber-400 transition-colors"
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Events</span>
          </button>

          <button
            onClick={() => setShowNewsModal(true)}
            className="flex flex-col items-center py-1 px-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-amber-400 transition-colors"
          >
            <Newspaper className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">News</span>
          </button>
        </div>
      </div>

      {/* Achievements Modal */}
      {showAchievementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm card-game-3d rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" />
                <span>Dynasty Achievements</span>
              </h3>
              <button
                onClick={() => setShowAchievementsModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center gap-2.5">
                <span className="text-xl">🏆</span>
                <div>
                  <h4 className="font-bold text-white">First Blood</h4>
                  <p className="text-[10px] text-slate-400">Win your first T20 League fixture</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                <span className="text-xl">🔨</span>
                <div>
                  <h4 className="font-bold text-white">Auction Mastermind</h4>
                  <p className="text-[10px] text-slate-400">Build a 25-man squad within ₹100 Cr purse</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                <span className="text-xl">👑</span>
                <div>
                  <h4 className="font-bold text-white">Dynasty King</h4>
                  <p className="text-[10px] text-slate-400">Win 3 consecutive T20 League titles</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAchievementsModal(false)}
              className="w-full py-2 rounded-xl btn-game-gold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Events Modal */}
      {showEventsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm card-game-3d rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Live Season Calendar</span>
              </h3>
              <button onClick={() => setShowEventsModal(false)} className="text-xs text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40">
                <span className="text-[10px] font-bold text-amber-400 uppercase">Season 2026 Phase</span>
                <h4 className="font-bold text-white mt-0.5">T20 Franchise Double Round-Robin</h4>
                <p className="text-[10px] text-slate-300 mt-1">94 Fixtures · 10 Franchises · Home & Away</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Upcoming Event</span>
                <h4 className="font-bold text-white mt-0.5">Mega Auction & Retention Deadline</h4>
                <p className="text-[10px] text-slate-400 mt-1">Player trade window & retentions open</p>
              </div>
            </div>
            <button onClick={() => setShowEventsModal(false)} className="w-full py-2 rounded-xl btn-game-gold text-xs">
              Close
            </button>
          </div>
        </div>
      )}

      {/* News Modal - Real-World Search Grounded */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm card-game-3d rounded-2xl p-4 space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 leading-tight">
                    Cricket News Wire
                  </h3>
                  <div className="flex items-center space-x-1.5 text-[9px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>Real-world search grounded</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={fetchCricketNews}
                  disabled={isNewsLoading}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors disabled:opacity-50"
                  title="Refresh Headlines"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isNewsLoading ? 'animate-spin text-amber-400' : ''}`} />
                </button>
                <button
                  onClick={() => setShowNewsModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {isNewsLoading && newsArticles.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <p>Searching latest cricket headlines...</p>
                </div>
              ) : newsArticles.length > 0 ? (
                newsArticles.map((article) => (
                  <div
                    key={article.id}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-1.5 text-left"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        {article.category || 'CRICKET WIRE'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {article.timeAgo || 'Recent'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">
                      {article.title}
                    </h4>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                      {article.summary}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-300">{article.source}</span>
                      <span className="flex items-center space-x-1 text-slate-500">
                        <Globe className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No cricket headlines available right now. Tap refresh to fetch.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 shrink-0 flex items-center justify-between">
              <span className="text-[9px] text-slate-500 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Search Grounding</span>
              </span>
              <button
                onClick={() => setShowNewsModal(false)}
                className="py-1.5 px-5 rounded-xl btn-game-gold text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
