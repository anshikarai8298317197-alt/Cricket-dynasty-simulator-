/**
 * WICKET DYNASTY - D3.js Win/Loss Percentage Trend Line Chart
 * Visualizes cumulative season Win % trajectory across the franchise's last 5 completed matches.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TrendingUp } from 'lucide-react';
import { CareerSave } from '../types/career';
import { Fixture } from '../types/tournament';

interface WinLossTrendChartProps {
  career: CareerSave;
}

interface TrendPoint {
  matchIndex: number;
  matchNumber: number;
  label: string;
  opponent: string;
  result: 'W' | 'L' | 'T';
  winPct: number;
  cumulativeWins: number;
  cumulativePlayed: number;
}

export const WinLossTrendChart: React.FC<WinLossTrendChartProps> = ({ career }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<TrendPoint | null>(null);

  const trendData: TrendPoint[] = useMemo(() => {
    const fixtures: Fixture[] = career.tournament?.fixtures || [];
    const userCompleted = fixtures
      .filter(
        f =>
          f.isCompleted &&
          (f.homeFranchiseId === career.franchiseId || f.awayFranchiseId === career.franchiseId)
      )
      .sort((a, b) => a.matchNumber - b.matchNumber);

    let wins = 0;
    let played = 0;

    const allPoints: TrendPoint[] = userCompleted.map((fix, idx) => {
      played += 1;
      let outcome: 'W' | 'L' | 'T' = 'T';
      if (fix.winnerFranchiseId === career.franchiseId) {
        wins += 1;
        outcome = 'W';
      } else if (fix.winnerFranchiseId) {
        outcome = 'L';
      }

      const opponent =
        fix.homeFranchiseId === career.franchiseId ? fix.awayFranchiseId : fix.homeFranchiseId;
      const winPct = Math.round((wins / played) * 100);

      return {
        matchIndex: idx + 1,
        matchNumber: fix.matchNumber,
        label: `vs ${opponent}`,
        opponent,
        result: outcome,
        winPct,
        cumulativeWins: wins,
        cumulativePlayed: played,
      };
    });

    return allPoints.slice(-5);
  }, [career.tournament?.fixtures, career.franchiseId]);

  useEffect(() => {
    if (trendData.length > 0) {
      setSelectedPoint(trendData[trendData.length - 1]);
    } else {
      setSelectedPoint(null);
    }
  }, [trendData]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    if (trendData.length === 0) return;

    const width = 340;
    const height = 160;
    const margin = { top: 16, right: 18, bottom: 28, left: 36 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const defs = svg.append('defs');
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'winPctAreaGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#FBBF24').attr('stop-opacity', 0.35);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#FBBF24').attr('stop-opacity', 0.02);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scalePoint<number>()
      .domain(trendData.map(d => d.matchIndex))
      .range([0, innerW])
      .padding(trendData.length === 1 ? 0.5 : 0.12);

    const yScale = d3.scaleLinear().domain([0, 100]).range([innerH, 0]);

    // Horizontal dashed gridlines
    [0, 25, 50, 75, 100].forEach(tick => {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerW)
        .attr('y1', yScale(tick))
        .attr('y2', yScale(tick))
        .attr('stroke', '#1E293B')
        .attr('stroke-dasharray', tick === 50 ? '4,3' : '2,3')
        .attr('stroke-width', 1);
    });

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues([0, 50, 100])
      .tickFormat(d => `${d}%`)
      .tickSize(0);
    const yAxisG = g.append('g').call(yAxis);
    yAxisG.select('.domain').remove();
    yAxisG
      .selectAll('text')
      .attr('fill', '#94A3B8')
      .attr('font-size', '9px')
      .attr('font-family', 'ui-monospace, monospace');

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat(idx => {
        const pt = trendData.find(d => d.matchIndex === idx);
        return pt ? pt.label : `M${idx}`;
      })
      .tickSize(0);
    const xAxisG = g.append('g').attr('transform', `translate(0,${innerH + 4})`).call(xAxis);
    xAxisG.select('.domain').attr('stroke', '#334155');
    xAxisG
      .selectAll('text')
      .attr('fill', '#CBD5E1')
      .attr('font-size', '9px')
      .attr('font-weight', '700');

    // Area under curve
    if (trendData.length > 1) {
      const areaGen = d3
        .area<TrendPoint>()
        .x(d => xScale(d.matchIndex) ?? 0)
        .y0(innerH)
        .y1(d => yScale(d.winPct))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(trendData)
        .attr('fill', 'url(#winPctAreaGrad)')
        .attr('d', areaGen);

      // Line path with animated stroke draw
      const lineGen = d3
        .line<TrendPoint>()
        .x(d => xScale(d.matchIndex) ?? 0)
        .y(d => yScale(d.winPct))
        .curve(d3.curveMonotoneX);

      const linePath = g
        .append('path')
        .datum(trendData)
        .attr('fill', 'none')
        .attr('stroke', '#FBBF24')
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('d', lineGen);

      const totalLength = linePath.node()?.getTotalLength() || 0;
      if (totalLength > 0) {
        linePath
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(550)
          .ease(d3.easeCubicOut)
          .attr('stroke-dashoffset', 0);
      }
    }

    // Data point nodes
    const nodes = g
      .selectAll('.trend-node')
      .data(trendData)
      .enter()
      .append('g')
      .attr('class', 'trend-node')
      .attr('transform', d => `translate(${xScale(d.matchIndex) ?? 0},${yScale(d.winPct)})`)
      .style('cursor', 'pointer')
      .on('click', (_ev, d) => setSelectedPoint(d))
      .on('mouseenter', (_ev, d) => setSelectedPoint(d));

    nodes
      .append('circle')
      .attr('r', 5)
      .attr('fill', d => (d.result === 'W' ? '#10B981' : d.result === 'L' ? '#EF4444' : '#F59E0B'))
      .attr('stroke', '#080E1A')
      .attr('stroke-width', 2);

    nodes
      .append('text')
      .attr('y', -9)
      .attr('text-anchor', 'middle')
      .attr('fill', '#F8FAFC')
      .attr('font-size', '9px')
      .attr('font-weight', '800')
      .attr('font-family', 'ui-monospace, monospace')
      .text(d => `${d.winPct}%`);
  }, [trendData]);

  const latestWinPct = trendData.length > 0 ? trendData[trendData.length - 1].winPct : 0;

  return (
    <div className="p-4 rounded-2xl bg-[#121E36] border border-[#1E2E50] space-y-2.5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Win/Loss % Form Trend
            </h4>
            <p className="text-[10px] text-slate-400">
              Last {Math.max(1, trendData.length)} match{trendData.length === 1 ? '' : 'es'} of Season {career.currentSeason}
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300">
          {trendData.length > 0 ? `${latestWinPct}% Win` : '0 Matches'}
        </span>
      </div>

      {/* Chart or Empty State */}
      {trendData.length === 0 ? (
        <div className="py-6 px-3 rounded-xl bg-[#091120] border border-slate-800/80 text-center space-y-1">
          <p className="text-xs font-bold text-slate-300">No Completed Matches Yet</p>
          <p className="text-[10px] text-slate-400">
            Complete your opening league fixture to chart your 5-match Win/Loss % trajectory.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-[#091120] border border-slate-800/80 p-2">
            <svg
              ref={svgRef}
              viewBox="0 0 340 160"
              className="w-full h-40 overflow-visible"
              aria-label="Franchise Win/Loss Percentage Trend Chart"
            />
          </div>

          {selectedPoint && (
            <div className="flex items-center justify-between text-[11px] bg-[#091120] border border-slate-800 rounded-xl px-3 py-1.5">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                    selectedPoint.result === 'W'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : selectedPoint.result === 'L'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {selectedPoint.result === 'W' ? 'WON' : selectedPoint.result === 'L' ? 'LOST' : 'TIED'}
                </span>
                <span className="font-bold text-white">
                  Match #{selectedPoint.matchNumber} {selectedPoint.label}
                </span>
              </div>
              <span className="font-mono text-amber-300 font-bold">
                {selectedPoint.winPct}% ({selectedPoint.cumulativeWins}/{selectedPoint.cumulativePlayed})
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
