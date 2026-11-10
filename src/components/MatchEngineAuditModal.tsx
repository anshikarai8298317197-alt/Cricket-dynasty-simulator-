/**
 * WICKET DYNASTY - Match Engine QA & Rules Audit Modal (Phase 04)
 */
import React, { useState } from 'react';
import { MatchEngineTestRunner, TestScenarioResult } from '../services/matchEngineTestRunner';
import { X, PlayCircle, CheckCircle2, XCircle, ShieldCheck, RefreshCw } from 'lucide-react';

interface MatchEngineAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MatchEngineAuditModal: React.FC<MatchEngineAuditModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestScenarioResult[] | null>(null);

  if (!isOpen) return null;

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = MatchEngineTestRunner.runAllScenarios();
      setTestResults(results);
      setIsRunning(false);
    }, 200);
  };

  const allPassed = testResults && testResults.every(t => t.passed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0F172A] border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#141E33]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Cricket Match Engine QA
              </h2>
              <p className="text-[10px] text-slate-400">Deterministic Scenario & Rules Test Suite</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-xs block">Automated Test Harness</span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Executes high-scoring, low-scoring, bowler limits, seeded PRNG determinism & NRR formulas.
              </p>
            </div>
            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase flex items-center space-x-1.5 shadow"
            >
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              <span>{isRunning ? 'Running...' : 'Run All Tests'}</span>
            </button>
          </div>

          {testResults && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold px-1">
                <span className="text-slate-300">Test Execution Results</span>
                <span className={allPassed ? 'text-emerald-400' : 'text-red-400'}>
                  {testResults.filter(t => t.passed).length} / {testResults.length} Passed
                </span>
              </div>

              {testResults.map(test => (
                <div
                  key={test.id}
                  className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {test.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span className="font-bold text-white">{test.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{test.durationMs}ms</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-6">{test.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#141E33] flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
