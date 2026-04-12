import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { downloadCSV } from '../../utils/downloadCSV';

/* ─── helpers ─────────────────────────────────────────────────── */
const fmt = (n: number) => {
  if (!isFinite(n)) return '—';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  if (Math.abs(n) >= 1)   return n.toFixed(2);
  return n.toFixed(4);
};

const mean   = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
const stddev = (arr: number[], m: number) =>
  arr.length > 1 ? Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1)) : 0;
const skewness = (arr: number[], m: number, sd: number) =>
  sd === 0 || arr.length < 3 ? 0 :
  arr.reduce((s, v) => s + ((v - m) / sd) ** 3, 0) / arr.length;
const kurtosis = (arr: number[], m: number, sd: number) =>
  sd === 0 || arr.length < 4 ? 0 :
  arr.reduce((s, v) => s + ((v - m) / sd) ** 4, 0) / arr.length - 3;

const numericValues = (data: Record<string, unknown>[], col: string) =>
  data.map(r => Number(r[col])).filter(n => isFinite(n));

const buildHistogram = (values: number[], bins = 10) => {
  if (!values.length) return { counts: [], edges: [] };
  const mn = Math.min(...values);
  const mx = Math.max(...values);
  const range = mx - mn || 1;
  const counts = new Array(bins).fill(0);
  const edges: number[] = [];
  for (let i = 0; i <= bins; i++) edges.push(mn + (i * range) / bins);
  values.forEach(v => {
    const b = Math.min(Math.floor(((v - mn) / range) * bins), bins - 1);
    counts[b]++;
  });
  return { counts, edges };
};

const buildHeatmap = (data: Record<string, unknown>[], xCol: string, yCol: string, size = 10) => {
  const grid = Array.from({ length: size }, () => new Array(size).fill(0));
  if (!data.length) return grid;
  const xs = numericValues(data, xCol);
  const ys = numericValues(data, yCol);
  if (!xs.length || !ys.length) return grid;
  const xMin = Math.min(...xs); const xMax = Math.max(...xs); const xR = xMax - xMin || 1;
  const yMin = Math.min(...ys); const yMax = Math.max(...ys); const yR = yMax - yMin || 1;
  for (let i = 0; i < data.length; i++) {
    const x = Number(data[i][xCol]); const y = Number(data[i][yCol]);
    if (!isFinite(x) || !isFinite(y)) continue;
    const xb = Math.min(Math.floor(((x - xMin) / xR) * size), size - 1);
    const yb = Math.min(Math.floor(((y - yMin) / yR) * size), size - 1);
    grid[size - 1 - yb][xb]++;
  }
  return grid;
};

/* ─── component ───────────────────────────────────────────────── */
export const DataDistributionAnalysisView: React.FC = () => {
  const navigate = useNavigate();
  const { data, initialData, columns, cleaningStats } = useAppStore();

  // ── column state
  const numericCols = useMemo(() => {
    const src = data ?? initialData;
    if (!src || !src.length) return [];
    return columns.filter(c => isFinite(Number(src[0][c])));
  }, [data, columns, initialData]);

  const [histCol,   setHistCol]   = useState<string | null>(null);
  const [heatXCol,  setHeatXCol]  = useState<string | null>(null);
  const [heatYCol,  setHeatYCol]  = useState<string | null>(null);

  // Resolved columns with fallback
  const activeHistCol  = histCol  ?? numericCols[0] ?? null;
  const activeHeatXCol = heatXCol ?? numericCols[0] ?? null;
  const activeHeatYCol = heatYCol ?? numericCols[1] ?? null;

  // Active dataset (after cleaning if available, else raw)
  const activeData = data ?? initialData;

  // ── per-column stats derived from active (post-clean) data
  const colStats = useMemo(() => {
    if (!activeData || !activeHistCol) return null;
    const vals = numericValues(activeData, activeHistCol);
    if (!vals.length) return null;
    const m  = mean(vals);
    const sd = stddev(vals, m);
    const sk = skewness(vals, m, sd);
    const ku = kurtosis(vals, m, sd);
    const variance = cleaningStats?.variance?.[activeHistCol] ?? sd * sd;
    return {
      count: vals.length,
      min: Math.min(...vals),
      max: Math.max(...vals),
      mean: m,
      stddev: sd,
      variance,
      skewness: sk,
      kurtosis: ku,
    };
  }, [activeData, activeHistCol, cleaningStats]);

  // ── histogram (current / post-clean)
  const hist = useMemo(() => {
    if (!activeData || !activeHistCol) return { counts: [], edges: [] };
    return buildHistogram(numericValues(activeData, activeHistCol), 10);
  }, [activeData, activeHistCol]);

  // ── histogram (baseline / pre-clean) for comparison overlay
  const histBase = useMemo(() => {
    if (!initialData || !activeHistCol) return { counts: [], edges: [] };
    return buildHistogram(numericValues(initialData, activeHistCol), 10);
  }, [initialData, activeHistCol]);

  const histMax = Math.max(...hist.counts, ...histBase.counts, 1);

  // ── heatmap
  const heatmap = useMemo(() => {
    if (!activeData || !activeHeatXCol || !activeHeatYCol) return Array.from({ length: 10 }, () => new Array(10).fill(0));
    return buildHeatmap(activeData, activeHeatXCol, activeHeatYCol, 10);
  }, [activeData, activeHeatXCol, activeHeatYCol]);
  const heatMax = Math.max(...heatmap.flat(), 1);

  // ── global distribution summary from variance map
  const varianceEntries = cleaningStats?.variance
    ? Object.entries(cleaningStats.variance as Record<string, number>).sort((a, b) => b[1] - a[1])
    : [];

  // ── empty state
  if (!activeData) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background text-on-surface gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}>
          <span className="material-symbols-outlined text-neon-cyan text-3xl">bar_chart_4_bars</span>
        </div>
        <h2 className="font-headline text-2xl font-bold">No Dataset Loaded</h2>
        <p className="text-on-surface-variant text-sm">Upload a CSV file in Data Studio first.</p>
        <button onClick={() => navigate('/datastudio')} className="btn-primary mt-2">Go to Data Studio</button>
      </div>
    );
  }

  // ── Column selector pill
  const ColPill = ({ cols, active, onChange, label }: { cols: string[], active: string | null, onChange: (c: string) => void, label: string }) => (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40">{label}:</span>
      {cols.map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className="px-2 py-0.5 rounded text-[10px] font-bold transition-all uppercase tracking-wide"
          style={c === active
            ? { background: 'rgba(0,229,255,0.15)', border: '1px solid rgba(0,229,255,0.35)', color: '#00e5ff' }
            : { background: 'rgba(195,245,255,0.04)', border: '1px solid rgba(195,245,255,0.08)', color: 'rgba(186,201,204,0.5)' }}
        >
          {c}
        </button>
      ))}
    </div>
  );

  const hasCleanedData = !!data && !!initialData && data !== initialData;

  return (
    <div className="h-full w-full bg-background text-on-surface font-body overflow-y-auto relative">
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 -z-10 w-[60vw] h-[40vh] rounded-full blur-[160px]" style={{ background: 'rgba(0,229,255,0.04)' }} />
      <div className="fixed bottom-0 left-0 -z-10 w-[40vw] h-[30vh] rounded-full blur-[140px]" style={{ background: 'rgba(168,85,247,0.04)' }} />

      <main className="max-w-[1600px] mx-auto px-8 py-8 space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tighter gradient-text-cyan-purple mb-1">Distribution Map</h1>
            <p className="text-on-surface-variant text-sm">
              {activeData.length.toLocaleString()} rows · {numericCols.length} numeric columns
              {hasCleanedData && <span className="ml-2 badge badge-teal">Post-Clean</span>}
            </p>
          </div>

          {/* Summary stats pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Mean', value: colStats ? fmt(colStats.mean)      : '—', color: '#00e5ff'   },
              { label: 'Std Dev', value: colStats ? fmt(colStats.stddev)  : '—', color: '#d1bcff'   },
              { label: 'Skewness', value: colStats ? fmt(colStats.skewness): '—', color: '#f59e0b'  },
              { label: 'Kurtosis', value: colStats ? fmt(colStats.kurtosis): '—', color: '#2dd4bf'  },
              { label: 'Variance', value: colStats ? fmt(colStats.variance): '—', color: '#ffe6f2'  },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-panel px-4 py-3 rounded-xl flex flex-col items-center min-w-[80px]">
                <span className="font-headline text-xl font-bold" style={{ color }}>{value}</span>
                <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/50 mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main bento grid ── */}
        <div className="grid grid-cols-12 gap-6">

          {/* ── Frequency Histogram (8 cols) ── */}
          <div className="col-span-12 lg:col-span-8 rounded-2xl p-6 space-y-5" style={{ background: 'rgba(16,20,26,0.8)', border: '1px solid rgba(195,245,255,0.07)' }}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Frequency Spectrum</h3>
                <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest">Value distribution histogram</p>
              </div>
              {numericCols.length > 0 && (
                <ColPill cols={numericCols} active={activeHistCol} onChange={setHistCol} label="Column" />
              )}
            </div>

            {/* Chart area */}
            {hist.counts.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-on-surface-variant/30 text-sm border border-dashed rounded-xl" style={{ borderColor: 'rgba(195,245,255,0.07)' }}>
                No numeric data for this column
              </div>
            ) : (
              <>
                <div className="h-52 flex items-end gap-1.5 px-2">
                  {hist.counts.map((val, idx) => {
                    const basePct = (histBase.counts[idx] ?? 0) / histMax * 100;
                    const currPct = val / histMax * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col-reverse gap-0.5 relative group/bar">
                        {/* Baseline overlay (pre-clean) */}
                        {hasCleanedData && basePct > 0 && (
                          <div className="w-full absolute bottom-0 rounded-t-sm transition-all duration-500 opacity-30"
                            style={{ height: `${basePct}%`, background: 'rgba(245,158,11,0.5)', outline: '1px solid rgba(245,158,11,0.4)' }}
                          />
                        )}
                        {/* Current bar */}
                        <div className="w-full rounded-t-sm transition-all duration-700 relative"
                          style={{
                            height: `${currPct}%`,
                            background: 'linear-gradient(to top, rgba(0,229,255,0.3), rgba(0,229,255,0.7))',
                            boxShadow: currPct > 0 ? '0 0 8px rgba(0,229,255,0.3)' : 'none',
                          }}
                        >
                          {/* Tooltip */}
                          <div className="hidden group-hover/bar:flex absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-md text-[10px] font-bold z-20 pointer-events-none"
                            style={{ background: 'rgba(22,26,34,0.95)', border: '1px solid rgba(0,229,255,0.2)' }}>
                            {val} pts
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-axis */}
                <div className="flex justify-between text-[9px] font-mono text-on-surface-variant/40 px-2">
                  {hist.edges.slice(0, -1).map((e, i) => <span key={i}>{fmt(e)}</span>)}
                </div>

                {/* Legend */}
                {hasCleanedData && (
                  <div className="flex items-center gap-4 text-[10px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-2 rounded-sm inline-block" style={{ background: 'rgba(0,229,255,0.5)' }} />
                      <span className="text-on-surface-variant/60">After cleaning</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-2 rounded-sm inline-block opacity-40" style={{ background: 'rgba(245,158,11,0.5)' }} />
                      <span className="text-on-surface-variant/40">Before cleaning</span>
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Variance Leaderboard (4 cols) ── */}
          <div className="col-span-12 lg:col-span-4 rounded-2xl p-6 space-y-4" style={{ background: 'rgba(16,20,26,0.8)', border: '1px solid rgba(195,245,255,0.07)' }}>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Variance Leaders</h3>
              <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest">Columns with highest variance</p>
            </div>

            {varianceEntries.length === 0 ? (
              <p className="text-sm text-on-surface-variant/40">Run Smart Clean to compute variance data.</p>
            ) : (
              <div className="space-y-3">
                {varianceEntries.slice(0, 8).map(([col, val], i) => {
                  const pct = Math.min((val / (varianceEntries[0][1] || 1)) * 100, 100);
                  const colors = ['#00e5ff', '#d1bcff', '#2dd4bf', '#f59e0b', '#ffe6f2', '#4ade80', '#f87171', '#60a5fa'];
                  const c = colors[i % colors.length];
                  return (
                    <div key={col}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <button
                          onClick={() => setHistCol(col)}
                          className="font-mono truncate max-w-[120px] hover:underline text-left transition-colors"
                          style={{ color: activeHistCol === col ? c : 'rgba(223,226,235,0.7)' }}
                        >
                          {col}
                        </button>
                        <span className="font-mono ml-2 shrink-0" style={{ color: c }}>{fmt(val)}</span>
                      </div>
                      <div className="progress-track">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: c, boxShadow: `0 0 6px ${c}66` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Column summary */}
            <div className="pt-4 border-t" style={{ borderColor: 'rgba(195,245,255,0.06)' }}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Rows',    value: activeData.length.toLocaleString() },
                  { label: 'Columns', value: columns.length },
                  { label: 'Numeric', value: numericCols.length },
                  { label: 'Missing', value: cleaningStats?.missing_values
                      ? Object.values(cleaningStats.missing_values as Record<string, number>).reduce((a, b) => a + b, 0)
                      : '—'
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg px-3 py-2" style={{ background: 'rgba(195,245,255,0.03)' }}>
                    <span className="block text-[9px] text-on-surface-variant/40 uppercase tracking-wider">{label}</span>
                    <span className="block font-headline font-bold text-sm text-on-surface">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Density Heatmap (5 cols) ── */}
          <div className="col-span-12 lg:col-span-5 rounded-2xl p-6 space-y-4" style={{ background: 'rgba(16,20,26,0.8)', border: '1px solid rgba(195,245,255,0.07)' }}>
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Density Field</h3>
                <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest">Point concentration heatmap</p>
              </div>
              <div className="space-y-2">
                <ColPill cols={numericCols} active={activeHeatXCol} onChange={setHeatXCol} label="X Axis" />
                <ColPill cols={numericCols.filter(c => c !== activeHeatXCol)} active={activeHeatYCol} onChange={setHeatYCol} label="Y Axis" />
              </div>
            </div>

            {numericCols.length < 2 ? (
              <div className="h-52 flex items-center justify-center text-on-surface-variant/30 text-sm border border-dashed rounded-xl" style={{ borderColor: 'rgba(195,245,255,0.07)' }}>
                Need at least 2 numeric columns
              </div>
            ) : (
              <>
                {/* Y-axis label */}
                <div className="flex gap-2">
                  <span className="text-[9px] text-on-surface-variant/30 writing-mode-vertical uppercase tracking-widest self-center rotate-180" style={{ writingMode: 'vertical-lr' }}>
                    {activeHeatYCol}
                  </span>
                  <div className="grid grid-cols-10 grid-rows-10 gap-[2px] flex-1" style={{ height: '200px' }}>
                    {heatmap.flat().map((val, idx) => {
                      const intensity = val / heatMax;
                      const bg = intensity > 0.8 ? 'rgba(0,229,255,0.9)'
                               : intensity > 0.6 ? 'rgba(0,229,255,0.65)'
                               : intensity > 0.4 ? 'rgba(0,229,255,0.4)'
                               : intensity > 0.2 ? 'rgba(0,229,255,0.2)'
                               : intensity > 0   ? 'rgba(0,229,255,0.07)'
                               : 'rgba(195,245,255,0.03)';
                      return (
                        <div key={idx} className="rounded-[2px] transition-colors duration-500 relative group/cell" style={{ background: bg }}>
                          {val > 0 && (
                            <div className="hidden group-hover/cell:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-md text-[9px] font-bold z-20 whitespace-nowrap pointer-events-none"
                              style={{ background: 'rgba(22,26,34,0.95)', border: '1px solid rgba(0,229,255,0.2)' }}>
                              {val} pts
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-[9px] font-mono text-on-surface-variant/30 text-center">{activeHeatXCol}</div>

                {/* Intensity legend */}
                <div className="flex items-center gap-2 text-[9px] text-on-surface-variant/40">
                  <span>Low</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, rgba(0,229,255,0.07), rgba(0,229,255,0.9))' }} />
                  <span>High</span>
                </div>
              </>
            )}
          </div>

          {/* ── Gaussian / Normal Distribution (7 cols) ── */}
          <div className="col-span-12 lg:col-span-7 rounded-2xl p-6 space-y-4" style={{ background: 'rgba(16,20,26,0.8)', border: '1px solid rgba(195,245,255,0.07)' }}>
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Gaussian Readout</h3>
                <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest">
                  σ deviation analysis · {activeHistCol ?? '—'}
                </p>
              </div>
              <div className="flex gap-3 text-xs text-on-surface-variant/60 font-mono">
                {colStats && (
                  <>
                    <span>μ = <strong className="text-neon-cyan">{fmt(colStats.mean)}</strong></span>
                    <span>σ = <strong className="text-purple-300">{fmt(colStats.stddev)}</strong></span>
                  </>
                )}
              </div>
            </div>

            {!colStats ? (
              <div className="h-52 flex items-center justify-center text-on-surface-variant/30 text-sm border border-dashed rounded-xl" style={{ borderColor: 'rgba(195,245,255,0.07)' }}>
                Select a column to analyse
              </div>
            ) : (
              <>
                {/* Generate real KDE-like curve from histogram */}
                <div className="h-48 relative">
                  {/* 1σ shaded region */}
                  <div className="absolute top-0 bottom-0" style={{
                    left: `${Math.max(0, ((colStats.mean - colStats.stddev - colStats.min) / (colStats.max - colStats.min || 1)) * 100)}%`,
                    right: `${100 - Math.min(100, ((colStats.mean + colStats.stddev - colStats.min) / (colStats.max - colStats.min || 1)) * 100)}%`,
                    background: 'rgba(0,229,255,0.04)',
                    borderLeft: '1px dashed rgba(0,229,255,0.2)',
                    borderRight: '1px dashed rgba(0,229,255,0.2)',
                  }} />
                  {/* Mean line */}
                  <div className="absolute top-0 bottom-4 w-px" style={{
                    left: `${Math.min(100, Math.max(0, ((colStats.mean - colStats.min) / (colStats.max - colStats.min || 1)) * 100))}%`,
                    background: 'rgba(0,229,255,0.5)',
                  }}>
                    <span className="absolute top-0 left-1 text-[8px] font-bold text-neon-cyan/70 uppercase">μ</span>
                  </div>

                  {/* Histogram bars as KDE approximation */}
                  <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${hist.counts.length * 10} 100`} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="kde-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.7"/>
                        <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.05"/>
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="url(#kde-grad)" stroke="#00e5ff" strokeWidth="0.8" strokeLinejoin="round"
                      points={[
                        `0,100`,
                        ...hist.counts.map((v, i) =>
                          `${(i + 0.5) * 10},${100 - (v / histMax) * 92}`
                        ),
                        `${hist.counts.length * 10},100`
                      ].join(' ')}
                    />
                  </svg>

                  {/* σ labels */}
                  <div className="absolute bottom-0 w-full flex justify-between px-2 text-[8px] font-mono text-on-surface-variant/30">
                    <span>−3σ</span><span>−2σ</span><span>−σ</span>
                    <span className="text-neon-cyan/50">μ</span>
                    <span>+σ</span><span>+2σ</span><span>+3σ</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Min',      v: fmt(colStats.min),       c: '#bac9cc' },
                    { label: 'Max',      v: fmt(colStats.max),       c: '#bac9cc' },
                    { label: 'Skewness', v: fmt(colStats.skewness),  c: Math.abs(colStats.skewness) > 1 ? '#f59e0b' : '#2dd4bf' },
                    { label: 'Kurtosis', v: fmt(colStats.kurtosis),  c: Math.abs(colStats.kurtosis) > 3 ? '#f59e0b' : '#2dd4bf' },
                  ].map(({ label, v, c }) => (
                    <div key={label} className="rounded-lg px-3 py-2 text-center" style={{ background: 'rgba(195,245,255,0.03)', border: '1px solid rgba(195,245,255,0.05)' }}>
                      <span className="block text-[9px] uppercase tracking-wider text-on-surface-variant/40 mb-0.5">{label}</span>
                      <span className="font-mono text-xs font-bold" style={{ color: c }}>{v}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>

        {/* ── Variance Warnings Table ── */}
        {cleaningStats?.warnings && cleaningStats.warnings.length > 0 && (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,180,171,0.04)', border: '1px solid rgba(255,180,171,0.12)' }}>
            <h3 className="font-headline font-bold text-base text-error flex items-center gap-2">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              Distribution Warnings ({cleaningStats.warnings.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {cleaningStats.warnings.map((w: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-on-surface-variant py-2 px-3 rounded-lg" style={{ background: 'rgba(255,180,171,0.05)' }}>
                  <span className="material-symbols-outlined text-error shrink-0 text-sm mt-0.5">error_outline</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t" style={{ borderColor: 'rgba(195,245,255,0.06)' }}>
          <div className="flex gap-6 text-xs">
            <span className="text-on-surface-variant/40">
              Samples: <strong className="text-on-surface">{activeData.length.toLocaleString()}</strong>
            </span>
            <span className="text-on-surface-variant/40">
              Features: <strong className="text-on-surface">{numericCols.length} numeric</strong>
            </span>
            {hasCleanedData && (
              <span className="text-neon-teal text-[10px] flex items-center gap-1">
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Showing post-cleaning data
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/datastudio')} className="btn-ghost text-[11px] py-2">
              ← Back to Data Studio
            </button>
            <button
              onClick={() => activeData && downloadCSV(activeData, columns, 'distribution_dataset')}
              disabled={!activeData}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${
                activeData
                  ? 'border border-neon-teal/40 text-neon-teal hover:bg-neon-teal/10'
                  : 'border border-outline-variant/20 text-on-surface-variant/30 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
              Export CSV
            </button>
            <button onClick={() => navigate('/quality-report')} className="btn-primary text-[11px] py-2">
              Quality Report →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
