/**
 * WICKET DYNASTY - Load Career & Slot Manager (SCR_04)
 * 5 independent save slots, export/import, delete with confirmation
 */
import React, { useState } from 'react';
import { X, Play, Trash2, Download, Upload, Plus, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CareerSave } from '../types/career';
import { StorageService } from '../services/storage';
import { FRANCHISES } from '../data/franchises';

interface LoadCareerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCareer: (career: CareerSave) => void;
  onNewCareerInSlot?: (slotIndex: number) => void;
}

export const LoadCareerModal: React.FC<LoadCareerModalProps> = ({
  isOpen,
  onClose,
  onSelectCareer,
  onNewCareerInSlot,
}) => {
  const [slots, setSlots] = useState<(CareerSave | null)[]>(StorageService.getAllSlots());
  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);
  const [importNotice, setImportNotice] = useState<string>('');

  if (!isOpen) return null;

  const refreshSlots = () => {
    setSlots(StorageService.getAllSlots());
  };

  const handleDelete = (slotIndex: number) => {
    StorageService.deleteSlot(slotIndex);
    setSlotToDelete(null);
    refreshSlots();
  };

  const handleExport = (slotIndex: number) => {
    const json = StorageService.exportCareerJson(slotIndex);
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WicketDynasty_Slot${slotIndex}_Save.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>, targetSlot: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = StorageService.importCareerJson(content, targetSlot);
      if (success) {
        setImportNotice(`Slot ${targetSlot} successfully restored!`);
        refreshSlots();
      } else {
        setImportNotice('Failed to import: Invalid save format.');
      }
      setTimeout(() => setImportNotice(''), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0C1425] border border-[#1E2D4A] rounded-2xl shadow-2xl max-h-[90vh] flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2D4A]">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Career Save Slots
            </h2>
            <p className="text-[11px] text-slate-400">Manage up to 5 offline career dynasties</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#121E36] flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {importNotice && (
          <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold">
            {importNotice}
          </div>
        )}

        {/* Slot List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
          {slots.map((save, idx) => {
            const slotNum = idx + 1;
            const franchise = save ? FRANCHISES.find(f => f.id === save.franchiseId) : null;

            if (!save) {
              return (
                <div
                  key={slotNum}
                  className="p-4 rounded-xl bg-[#121E36]/40 border border-dashed border-[#1E2D4A] flex items-center justify-between gap-3 text-slate-400"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500">SLOT {slotNum}</span>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Empty Save Slot</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-2.5 py-1.5 rounded-lg bg-[#121E36] hover:bg-[#1A2846] border border-[#1E2D4A] text-slate-300 text-[11px] font-bold cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Import</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={e => handleImport(e, slotNum)}
                        className="hidden"
                      />
                    </label>

                    {onNewCareerInSlot && (
                      <button
                        onClick={() => {
                          onClose();
                          onNewCareerInSlot(slotNum);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[11px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Start</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={slotNum}
                className="p-3.5 rounded-xl bg-[#121E36] border border-[#1E2D4A] hover:border-[#F59E0B]/50 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {franchise && (
                      <div
                        className="w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-white text-xs shrink-0"
                        style={{
                          backgroundColor: `${franchise.primaryColor}25`,
                          borderColor: franchise.primaryColor,
                        }}
                      >
                        {franchise.shortName}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#080E1A] text-slate-400">
                          SLOT {slotNum}
                        </span>
                        <h4 className="font-bold text-sm text-white">{save.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {franchise ? franchise.name : 'Unknown Club'} · Season {save.currentSeason}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(save.lastPlayedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] bg-[#0C1425] p-2 rounded-lg border border-[#1E2D4A]/50">
                  <span className="text-slate-400">
                    Mode: <strong className="text-white">{save.squadMode}</strong>
                  </span>
                  <span className="text-slate-400">
                    Purse: <strong className="text-emerald-400 font-mono">₹{save.purseBalanceCr.toFixed(1)} Cr</strong>
                  </span>
                  <span className="text-slate-400">
                    Difficulty: <strong className="text-amber-400">{save.difficulty}</strong>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleExport(slotNum)}
                      title="Download JSON save file"
                      className="p-1.5 rounded-lg bg-[#0C1425] text-slate-400 hover:text-white border border-[#1E2D4A]"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSlotToDelete(slotNum)}
                      title="Delete save file"
                      className="p-1.5 rounded-lg bg-[#0C1425] text-red-400 hover:bg-red-500/20 border border-[#1E2D4A]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onSelectCareer(save);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 font-bold text-slate-950 text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
                  >
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>Load</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation Modal */}
        {slotToDelete !== null && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85">
            <div className="bg-[#0C1425] border border-red-500/40 rounded-xl p-4 max-w-xs w-full text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
              <h4 className="font-bold text-white text-sm">Delete Slot {slotToDelete}?</h4>
              <p className="text-xs text-slate-300">
                This action is permanent and cannot be undone. All career dynasty records in this slot will be erased.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSlotToDelete(null)}
                  className="flex-1 py-2 rounded-lg bg-[#121E36] text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(slotToDelete)}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
