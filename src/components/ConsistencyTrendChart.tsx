/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { FourWeekTrendData, WeekTrendPoint } from '../types/habit';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Sparkles,
  Calendar,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface ConsistencyTrendChartProps {
  trendData: FourWeekTrendData;
  className?: string;
}

export const ConsistencyTrendChart: React.FC<ConsistencyTrendChartProps> = ({
  trendData,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(640);
  const [activePoint, setActivePoint] = useState<WeekTrendPoint | null>(null);

  // ResizeObserver for 100% fluid responsiveness
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect.width > 0) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { weeks, averageScore, bestScore, deltaFromPreviousWeek, trendDirection, benchmarkTarget } = trendData;

  // D3 Chart Rendering
  useEffect(() => {
    if (!svgRef.current || weeks.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clean redraw

    const height = 280;
    const width = Math.max(300, containerWidth);
    const isMobile = width < 480;

    const margin = {
      top: 35,
      right: isMobile ? 25 : 40,
      bottom: isMobile ? 55 : 50,
      left: isMobile ? 35 : 48,
    };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = d3
      .scalePoint<string>()
      .domain(weeks.map((w) => w.weekKey))
      .range([margin.left, width - margin.right])
      .padding(0.12);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Defs: Gradients and drop shadow filter
    const defs = svg.append('defs');

    // Area Gradient (Neo-Lime glow)
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'trendAreaGradient')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#D8F22A')
      .attr('stop-opacity', 0.45);

    areaGradient
      .append('stop')
      .attr('offset', '80%')
      .attr('stop-color', '#D8F22A')
      .attr('stop-opacity', 0.05);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#D8F22A')
      .attr('stop-opacity', 0);

    // Grid Lines (Horizontal at 0, 25, 50, 75, 100%)
    const yTicks = [0, 25, 50, 75, 100];
    const gridGroup = svg.append('g').attr('class', 'grid-lines');

    yTicks.forEach((tick) => {
      const yPos = yScale(tick);
      gridGroup
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', yPos)
        .attr('y2', yPos)
        .attr('stroke', 'currentColor')
        .attr('class', 'text-zinc-200 dark:text-zinc-800')
        .attr('stroke-dasharray', tick === 0 ? 'none' : '3 3')
        .attr('stroke-width', tick === 0 ? 1.5 : 1);

      // Y-Axis labels
      svg
        .append('text')
        .attr('x', margin.left - 8)
        .attr('y', yPos + 3.5)
        .attr('text-anchor', 'end')
        .attr('class', 'text-[10px] font-mono-numbers font-semibold fill-zinc-400 dark:fill-zinc-500')
        .text(`${tick}%`);
    });

    // Benchmark Target Reference Line (e.g. 85%)
    if (benchmarkTarget && benchmarkTarget > 0 && benchmarkTarget <= 100) {
      const benchmarkY = yScale(benchmarkTarget);
      svg
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', benchmarkY)
        .attr('y2', benchmarkY)
        .attr('stroke', '#FF5C00')
        .attr('stroke-dasharray', '4 4')
        .attr('stroke-width', 1.5);

      svg
        .append('text')
        .attr('x', width - margin.right)
        .attr('y', benchmarkY - 5)
        .attr('text-anchor', 'end')
        .attr('class', 'text-[9px] font-mono-numbers font-bold fill-[#FF5C00]')
        .text(`Ziel: ${benchmarkTarget}%`);
    }

    // Line and Area Generators
    const areaGenerator = d3
      .area<WeekTrendPoint>()
      .x((d) => xScale(d.weekKey)!)
      .y0(height - margin.bottom)
      .y1((d) => yScale(d.percentage))
      .curve(d3.curveMonotoneX);

    const lineGenerator = d3
      .line<WeekTrendPoint>()
      .x((d) => xScale(d.weekKey)!)
      .y((d) => yScale(d.percentage))
      .curve(d3.curveMonotoneX);

    // Draw Gradient Area
    svg
      .append('path')
      .datum(weeks)
      .attr('d', areaGenerator)
      .attr('fill', 'url(#trendAreaGradient)');

    // Draw Hard Drop-Shadow Path (Neo-Brutalist 2px offset)
    svg
      .append('path')
      .datum(weeks)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#141414')
      .attr('stroke-width', 3.5)
      .attr('transform', 'translate(2, 2)')
      .attr('opacity', 0.25);

    // Draw Primary Line Path
    const linePath = svg
      .append('path')
      .datum(weeks)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#141414')
      .attr('class', 'stroke-zinc-950 dark:stroke-[#D8F22A]')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'square')
      .attr('stroke-linejoin', 'miter');

    // Smooth Line Entrance Animation
    const totalLength = (linePath.node() as SVGPathElement)?.getTotalLength() || 0;
    if (totalLength > 0) {
      linePath
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // Draw Data Point Nodes & Value Labels
    weeks.forEach((week) => {
      const cx = xScale(week.weekKey)!;
      const cy = yScale(week.percentage);
      const isCurrent = week.isCurrentWeek;

      const pointGroup = svg
        .append('g')
        .attr('class', 'data-point cursor-pointer')
        .on('mouseenter', () => setActivePoint(week))
        .on('click', () => setActivePoint(week));

      // Connecting guide line to bottom
      pointGroup
        .append('line')
        .attr('x1', cx)
        .attr('x2', cx)
        .attr('y1', cy)
        .attr('y2', height - margin.bottom)
        .attr('stroke', 'currentColor')
        .attr('class', 'text-zinc-300 dark:text-zinc-700')
        .attr('stroke-dasharray', '2 2')
        .attr('stroke-width', 1);

      // Score Value Badge above Point
      pointGroup
        .append('rect')
        .attr('x', cx - 18)
        .attr('y', cy - 25)
        .attr('width', 36)
        .attr('height', 17)
        .attr('class', isCurrent ? 'fill-[#141414] dark:fill-[#D8F22A]' : 'fill-white dark:fill-zinc-800')
        .attr('stroke', '#141414')
        .attr('stroke-width', 1.5)
        .attr('rx', 0);

      pointGroup
        .append('text')
        .attr('x', cx)
        .attr('y', cy - 13)
        .attr('text-anchor', 'middle')
        .attr(
          'class',
          `text-[10px] font-mono-numbers font-black ${
            isCurrent
              ? 'fill-[#D8F22A] dark:fill-zinc-950'
              : 'fill-zinc-900 dark:fill-zinc-100'
          }`
        )
        .text(`${week.percentage}%`);

      // Neo-Brutalist Square/Circle Marker
      pointGroup
        .append('rect')
        .attr('x', cx - 5.5)
        .attr('y', cy - 5.5)
        .attr('width', 11)
        .attr('height', 11)
        .attr('stroke', '#141414')
        .attr('stroke-width', 2)
        .attr('class', isCurrent ? 'fill-[#FF5C00]' : 'fill-[#D8F22A]');

      // Hitbox for easy touch/mouse targets
      pointGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 18)
        .attr('fill', 'transparent');

      // X-Axis Week Labels (Label + Date Range Subtitle)
      const xLabel = isMobile ? week.shortLabel : week.label;
      svg
        .append('text')
        .attr('x', cx)
        .attr('y', height - margin.bottom + 18)
        .attr('text-anchor', 'middle')
        .attr(
          'class',
          `text-xs font-mono-numbers ${
            isCurrent
              ? 'font-black fill-zinc-950 dark:fill-[#D8F22A]'
              : 'font-bold fill-zinc-700 dark:fill-zinc-300'
          }`
        )
        .text(xLabel);

      svg
        .append('text')
        .attr('x', cx)
        .attr('y', height - margin.bottom + 32)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-[9px] font-mono-numbers text-zinc-400 dark:text-zinc-500 fill-zinc-400 dark:fill-zinc-500')
        .text(week.dateRangeLabel);
    });
  }, [weeks, containerWidth, benchmarkTarget]);

  const currentWeek = weeks[weeks.length - 1];

  return (
    <div
      ref={containerRef}
      className={`bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a] p-5 space-y-4 ${className}`}
    >
      {/* Header with Title and Long-Term KPI Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-zinc-900 dark:border-zinc-700">
        <div>
          <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block mb-0.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            D3.js Trend-Visualisierung
          </span>
          <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            4-Wochen Konsistenz-Trend
          </h3>
        </div>

        {/* Long-Term KPI Metrics */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Trend Delta vs Previous Week */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 border text-xs font-mono-numbers font-black shadow-xs ${
              trendDirection === 'up'
                ? 'bg-[#D8F22A] text-zinc-950 border-zinc-900'
                : trendDirection === 'down'
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-400 dark:border-rose-800'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
            }`}
            title="Veränderung der Konsistenz-Quote im Vergleich zur Vorwoche"
          >
            {trendDirection === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5 stroke-[3]" />
            ) : trendDirection === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>
              {deltaFromPreviousWeek > 0 ? `+${deltaFromPreviousWeek}%` : `${deltaFromPreviousWeek}%`}
              <span className="font-semibold text-[10px] ml-1 opacity-80">vs. Vorwoche</span>
            </span>
          </div>

          {/* 4-Week Average Score */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-900/30 dark:border-zinc-700 text-xs font-mono-numbers">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">4-Wochen Ø:</span>
            <span className="font-black text-zinc-900 dark:text-zinc-100">{averageScore}%</span>
          </div>

          {/* Best Score */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-900/30 dark:border-zinc-700 text-xs font-mono-numbers hidden sm:flex">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">Peak:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">{bestScore}%</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Beobachte deine kumulative Entwicklung über die vergangenen vier Wochen. Ein stetiger Aufwärtstrend zeigt, dass deine Micro-Cues zu unbewussten Gewohnheiten reifen.
      </p>

      {/* Responsive D3 SVG Container */}
      <div className="w-full overflow-hidden bg-zinc-50/60 dark:bg-zinc-950/40 border-2 border-zinc-900 dark:border-zinc-800 p-1 sm:p-2 relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${Math.max(300, containerWidth)} 280`}
          className="w-full h-[280px] overflow-visible select-none"
        />

        {/* Selected Data Point Inspector Pill */}
        {activePoint && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-2 border-zinc-950 dark:border-zinc-300 p-2.5 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#27272a] text-xs font-mono-numbers z-10 flex items-center justify-between gap-3 animate-in fade-in duration-100">
            <div>
              <span className="font-bold block text-zinc-100 dark:text-zinc-900">
                {activePoint.label} ({activePoint.dateRangeLabel})
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
                {activePoint.completedCount} von {activePoint.totalPossible} möglichen Aktionen erledigt
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black px-2 py-0.5 bg-[#D8F22A] text-zinc-950 border border-zinc-900">
                {activePoint.percentage}%
              </span>
              <button
                type="button"
                onClick={() => setActivePoint(null)}
                className="text-zinc-400 hover:text-white dark:hover:text-zinc-950 text-xs px-1 cursor-pointer"
                aria-label="Schließen"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Week-by-Week Micro Breakdown Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {weeks.map((w) => {
          const isAboveBenchmark = w.percentage >= (benchmarkTarget || 85);
          return (
            <div
              key={w.weekKey}
              onClick={() => setActivePoint(w)}
              className={`p-2.5 border-2 transition-all cursor-pointer ${
                w.isCurrentWeek
                  ? 'border-zinc-900 dark:border-[#D8F22A] bg-zinc-100 dark:bg-zinc-800 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a]'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-900 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono-numbers font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                <span>{w.shortLabel}</span>
                {isAboveBenchmark && (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                    Ziel
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-mono-numbers font-black text-zinc-900 dark:text-zinc-100">
                  {w.percentage}%
                </span>
                <span className="text-[10px] font-mono-numbers text-zinc-500 dark:text-zinc-400">
                  {w.completedCount} Logs
                </span>
              </div>
              <span className="text-[9px] font-mono-numbers text-zinc-400 dark:text-zinc-500 block truncate mt-0.5">
                {w.dateRangeLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
