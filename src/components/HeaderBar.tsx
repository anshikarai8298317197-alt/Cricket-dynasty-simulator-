import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Database, Settings } from 'lucide-react';
import { Franchise } from '../types/franchise';
import { FranchiseLogo } from './FranchiseLogo';
import { DbPersistence, SaveStatus } from '../services/dbPersistence';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  activeFranchise?: Franchise | null;
  onOpenAudit?: () => void;
  onOpenSettings?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  activeFranchise,
  onOpenAudit,
  onOpenSettings,
}) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('IDLE');

  useEffect(() => {
    return DbPersistence.subscribe(status => setSaveStatus(status));
  }, []);
  return (
    <header className="sticky top-0 z-40 bg-[#080E1A]/95 backdrop-blur border-b border-[#1E2D4A] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-lg bg-[#121E36] border border-[#1E2D4A] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#F59E0B] active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-wide">{title}</h1>
            {activeFranchise && (
              <div className="flex items-center gap-1.5">
                <FranchiseLogo franchiseId={activeFranchise.id} size={20} />
                <span
                  className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${activeFranchise.primaryColor}22`,
                    borderColor: activeFranchise.primaryColor,
                    color: activeFranchise.primaryColor,
                  }}
                >
                  {activeFranchise.shortName}
                </span>
              </div>
            )}
          </div>
          {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {saveStatus !== 'IDLE' && (
          <span
            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border transition-all ${
              saveStatus === 'SAVED'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                : saveStatus === 'SAVING'
                ? 'bg-amber-950/80 border-amber-500/40 text-amber-300 animate-pulse'
                : 'bg-red-950/80 border-red-500/40 text-red-400'
            }`}
          >
            {saveStatus === 'SAVED' ? '● Saved' : saveStatus === 'SAVING' ? '⟳ Saving...' : 'Save Failed'}
          </span>
        )}
        {onOpenAudit && (
          <button
            onClick={onOpenAudit}
            title="Database Audit"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#121E36] border border-[#1E2D4A] text-emerald-400 hover:border-emerald-500 text-xs font-semibold active:scale-95 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-mono">320 DB</span>
          </button>
        )}

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="w-9 h-9 rounded-lg bg-[#121E36] border border-[#1E2D4A] flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 active:scale-95 transition-all"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
