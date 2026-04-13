import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Brain, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { downloadCSV } from '../../utils/downloadCSV';

export const DataQualityReportView: React.FC = () => {
  const navigate = useNavigate();
  const { data, columns, cleaningStats, initialCleaningStats, datasetId, token, currentMl, setCurrentMl } = useAppStore();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);

  const numericCols = useMemo(() => {
    if (!data || !data.length) return [];
    return columns.filter(c => isFinite(Number(data[0][c])));
  }, [data, columns]);

  const scatterPoints = useMemo(() => {
    if (!data || numericCols.length < 2) return null;
    const xCol = numericCols[0];
    const yCol = numericCols[1];
    
    const xs = data.map(d => Number(d[xCol])).filter(n => isFinite(n));
    const ys = data.map(d => Number(d[yCol])).filter(n => isFinite(n));
    if (!xs.length || !ys.length) return null;
    
    const minX = Math.min(...xs); const maxX = Math.max(...xs);
    const minY = Math.min(...ys); const maxY = Math.max(...ys);
    
    // Sample max 300 pts for performance
    const step = Math.max(1, Math.floor(data.length / 300));
    const pts = [];
    for (let i = 0; i < data.length; i += step) {
        const xVal = Number(data[i][xCol]);
        const yVal = Number(data[i][yCol]);
        if (!isFinite(xVal) || !isFinite(yVal)) continue;
        
        // Basic outlier calculation (e.g. falls in the outer 10% bounds)
        const isOutlier = Math.abs(xVal - ((maxX + minX)/2)) > ((maxX-minX)/2 * 0.9) || 
                          Math.abs(yVal - ((maxY + minY)/2)) > ((maxY-minY)/2 * 0.9);

        // Calculate clamped percentages
        const xPct = Math.max(2, Math.min(98, ((xVal - minX) / (maxX - minX || 1)) * 100));
        const yPct = Math.max(2, Math.min(98, ((yVal - minY) / (maxY - minY || 1)) * 100));

        pts.push({ x: xPct, y: yPct, isOutlier });
    }
    return pts;
  }, [data, numericCols]);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (taskId && isEvaluating) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/ml-tasks/${taskId}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await res.json();
          if (result.status === 'completed') {
            setCurrentMl({
              status: 'completed',
              train_score: result.result.train_score,
              test_score: result.result.test_score,
              fit_status: result.result.model_type,
              target_col: result.result.target,
              confusion_matrix: result.result.confusion_matrix
            });
            setIsEvaluating(false);
            setTaskId(null);
            clearInterval(interval);
          } else if (result.status === 'failed') {
            setCurrentMl({ status: 'failed', reason: result.error });
            setIsEvaluating(false);
            setTaskId(null);
            clearInterval(interval);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [taskId, isEvaluating, token, setCurrentMl]);

  const handleEvaluateML = async () => {
    if (!datasetId) return;
    setIsEvaluating(true);
    setCurrentMl(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s for manual report eval

      const res = await fetch('http://localhost:8000/api/evaluate-ml/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ dataset_id: useAppStore.getState().datasetId, task_type: 'random_forest' }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const result = await res.json();
      if (res.ok) {
        if (result.message && result.message.includes('completed successfully')) {
             // We modified the backend to execute synchronously and return 'completed successfully'
             setTaskId(result.task_id); // The use effect will poll immediately and resolve
        } else {
             setTaskId(result.task_id);
        }
      } else {
        setIsEvaluating(false);
        setCurrentMl({ status: 'failed', reason: result.error });
      }
    } catch (e: any) {
      setIsEvaluating(false);
      if (e.name === 'AbortError') {
        setCurrentMl({ status: 'failed', reason: 'Evaluation timed out. Try a smaller dataset.' });
      } else {
        setCurrentMl({ status: 'failed', reason: 'Connection failed (is the backend running on port 8000?)' });
      }
    }
  };

  // ... existing derived metrics
  const totalPoints = data ? data.length * columns.length : 0;
  const totalRows = data ? data.length : 0;
  const totalMissing = cleaningStats?.missing_values 
    ? Object.values(cleaningStats.missing_values as Record<string, number>).reduce((a, b) => a + b, 0) 
    : 0;
  
  const duplicates = cleaningStats?.duplicates || 0;
  const highVarianceEntries = cleaningStats?.variance 
    ? Object.entries(cleaningStats.variance as Record<string, number>).filter(([_, v]) => v > 1000) 
    : [];

  const totalMissingBefore = initialCleaningStats?.missing_values
    ? Object.values(initialCleaningStats.missing_values as Record<string, number>).reduce((a, b) => a + b, 0)
    : null;
  const duplicatesBefore = initialCleaningStats?.duplicates ?? null;
  const varianceIssuesBefore = initialCleaningStats?.variance
    ? Object.values(initialCleaningStats.variance as Record<string, number>).filter((v: number) => v > 1000).length
    : null;
  const varianceIssuesAfter = cleaningStats?.variance
    ? Object.values(cleaningStats.variance as Record<string, number>).filter((v: number) => v > 1000).length
    : null;
  const missingDelta = totalMissingBefore != null ? (totalMissing - totalMissingBefore) : null;
  const duplicatesDelta = duplicatesBefore != null ? (duplicates - duplicatesBefore) : null;
  const varianceDelta = varianceIssuesAfter != null && varianceIssuesBefore != null ? (varianceIssuesAfter - varianceIssuesBefore) : null;

  let healthScore = 100;
  if (totalPoints > 0) {
    const missingPenalty = (totalMissing / totalPoints) * 100;
    const duplicatePenalty = (duplicates / totalRows) * 10;
    healthScore = Math.max(0, 100 - missingPenalty - duplicatePenalty - (highVarianceEntries.length * 2));
  }
  const score = Math.round(healthScore);
  
  const nullImputationPct = totalPoints > 0 ? Math.min(100, Math.round((totalMissing / totalPoints) * 100)) : 0;
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const MlStatusBlock = () => {
    if (!currentMl) {
      return <p className="text-[0.65rem] text-slate-500 italic">No ML reliability analysis performed for this session.</p>;
    }
    if (currentMl.status === 'completed' || currentMl.status === 'success') {
      return (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[0.65rem] text-slate-400">ACCURACY SCORE</span>
            <span className="text-neon-cyan font-headline font-bold">
              {currentMl.train_score != null
                ? (currentMl.train_score > 1 ? currentMl.train_score.toFixed(1) : (currentMl.train_score * 100).toFixed(1))
                : '—'}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-neon-cyan"
              style={{ width: `${currentMl.train_score != null ? (currentMl.train_score > 1 ? currentMl.train_score : currentMl.train_score * 100) : 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[0.65rem] text-slate-400">MODEL TYPE</span>
            <span className="text-neon-purple font-headline font-bold">{currentMl.fit_status}</span>
          </div>
          <div className="flex items-center gap-2 text-[0.65rem] text-neon-teal">
            <CheckCircle2 className="w-3 h-3" />
            <span>MODEL VALIDATED: {currentMl.fit_status} &rarr; Predicting: {currentMl.target_col}</span>
          </div>
          
          {currentMl.confusion_matrix && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <span className="text-[0.65rem] text-slate-400 block mb-2">CONFUSION MATRIX (3x3 SAMPLE)</span>
              <div className="grid grid-cols-3 gap-1">
                {currentMl.confusion_matrix.map((row, i) => 
                  row.map((cell, j) => {
                    const isDiag = i === j;
                    const maxVal = Math.max(...currentMl.confusion_matrix!.flat());
                    const intensity = Math.max(0.1, cell / (maxVal || 1));
                    return (
                      <div key={`${i}-${j}`} 
                        className={`flex items-center justify-center text-[0.65rem] font-mono py-1 rounded ${isDiag ? 'text-neon-cyan font-bold' : 'text-slate-400'}`}
                        style={{ background: isDiag ? `rgba(0, 229, 255, ${intensity * 0.3})` : `rgba(255, 255, 255, ${intensity * 0.05})` }}
                      >
                        {cell}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    if (currentMl.status === 'failed') {
      return (
        <div className="text-error text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {currentMl.reason}
        </div>
      );
    }
    return (
      <div className="text-slate-400 text-xs flex items-center gap-2 animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin" />
        Training random forest baseline...
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-background text-on-surface font-body relative overflow-y-auto">
      {/* Main Content Area */}
      <main className="min-h-full w-full relative z-10">
<div className="max-w-[1600px] mx-auto p-8">
{/* Summary Header */}
<section className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
<div>
<h1 className="font-headline text-5xl font-bold tracking-tighter text-on-surface mb-2 uppercase">Data Quality Report</h1>
<p className="text-on-surface-variant font-label text-sm tracking-widest uppercase opacity-70">Observatory Session ID: KINETIC-774-ALPHA</p>
</div>
<div className="glass-panel p-6 rounded-xl flex items-center gap-8 ring-1 ring-primary/20">
<div className="text-right">
<span className="block text-xs font-label uppercase tracking-[0.2em] text-on-surface-variant mb-1">Data Health Score</span>
<div className="flex items-baseline gap-2">
<span className="font-headline text-6xl font-extrabold text-primary health-glow leading-none">{score}<span className="text-3xl">%</span></span>
<span className="material-symbols-outlined text-primary text-3xl" data-icon="verified">verified</span>
</div>
        {initialCleaningStats && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20">
              <div className="text-[0.6rem] uppercase tracking-widest text-on-surface-variant mb-1">Missing Values</div>
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  <div className="opacity-70">Before</div>
                  <div className="font-headline">{totalMissingBefore}</div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                <div className="text-right text-xs">
                  <div className="opacity-70">After</div>
                  <div className={`font-headline ${missingDelta != null && missingDelta < 0 ? 'text-primary' : missingDelta != null && missingDelta > 0 ? 'text-error' : ''}`}>{totalMissing}</div>
                </div>
              </div>
              {missingDelta != null && (
                <div className={`mt-2 text-[0.6rem] font-bold ${missingDelta < 0 ? 'text-primary' : missingDelta > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                  {missingDelta < 0 ? 'Reduced ' : missingDelta > 0 ? 'Increased ' : 'No change '} {Math.abs(missingDelta)}
                </div>
              )}
            </div>
            <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20">
              <div className="text-[0.6rem] uppercase tracking-widest text-on-surface-variant mb-1">Duplicate Rows</div>
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  <div className="opacity-70">Before</div>
                  <div className="font-headline">{duplicatesBefore ?? '—'}</div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                <div className="text-right text-xs">
                  <div className="opacity-70">After</div>
                  <div className={`font-headline ${duplicatesDelta != null && duplicatesDelta < 0 ? 'text-primary' : duplicatesDelta != null && duplicatesDelta > 0 ? 'text-error' : ''}`}>{duplicates}</div>
                </div>
              </div>
              {duplicatesDelta != null && (
                <div className={`mt-2 text-[0.6rem] font-bold ${duplicatesDelta < 0 ? 'text-primary' : duplicatesDelta > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                  {duplicatesDelta < 0 ? 'Reduced ' : duplicatesDelta > 0 ? 'Increased ' : 'No change '} {Math.abs(duplicatesDelta)}
                </div>
              )}
            </div>
            <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20">
              <div className="text-[0.6rem] uppercase tracking-widest text-on-surface-variant mb-1">High-Variance Fields</div>
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  <div className="opacity-70">Before</div>
                  <div className="font-headline">{varianceIssuesBefore ?? '—'}</div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                <div className="text-right text-xs">
                  <div className="opacity-70">After</div>
                  <div className={`font-headline ${varianceDelta != null && varianceDelta < 0 ? 'text-primary' : varianceDelta != null && varianceDelta > 0 ? 'text-error' : ''}`}>{varianceIssuesAfter ?? '—'}</div>
                </div>
              </div>
              {varianceDelta != null && (
                <div className={`mt-2 text-[0.6rem] font-bold ${varianceDelta < 0 ? 'text-primary' : varianceDelta > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                  {varianceDelta < 0 ? 'Reduced ' : varianceDelta > 0 ? 'Increased ' : 'No change '} {Math.abs(varianceDelta)}
                </div>
              )}
            </div>
          </div>
        )}
</div>
<div className="h-16 w-[1px] bg-outline-variant/30"></div>
<div className="flex flex-col gap-1">
<span className="text-[0.65rem] font-bold uppercase text-secondary tracking-widest">Status: {score > 90 ? 'Optimal' : score > 70 ? 'Degraded' : 'Critical'}</span>
<div className="w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${score}%` }}></div>
</div>
<span className="text-[0.6rem] text-on-surface-variant/60">High-fidelity recovery active</span>
</div>
</div>
</section>
{/* Grid Layout */}
<div className="grid grid-cols-12 gap-6">
{/* Cleaning Statistics (Bento Card Large) */}
<div className="col-span-12 lg:col-span-8 glass-panel p-8 rounded-xl flex flex-col">
<div className="flex justify-between items-center mb-8">
<div>
<h2 className="font-headline text-xl font-bold tracking-tight text-primary">Cleaning Statistics</h2>
<p className="text-sm text-on-surface-variant">Automated correction distribution &amp; volume</p>
</div>
<div className="flex gap-4">
<div className="text-center">
<span className="block text-[0.6rem] uppercase tracking-widest text-on-surface-variant mb-1">Points Processed</span>
<span className="font-headline text-2xl font-bold">{formatNumber(totalPoints)}</span>
</div>
<div className="text-center">
<span className="block text-[0.6rem] uppercase tracking-widest text-on-surface-variant mb-1">Rows Cleaned</span>
<span className="font-headline text-2xl font-bold text-secondary">{formatNumber(totalMissing)}</span>
</div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-1">
{/* Progress Bars */}
<div className="space-y-6">
<div>
<div className="flex justify-between text-xs mb-2">
<span className="font-label tracking-widest opacity-80 uppercase">Null Imputation</span>
<span className="font-headline text-primary">{nullImputationPct}%</span>
</div>
<div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
<div className="h-full bg-primary shadow-[0_0_10px_rgba(195,245,255,0.4)]" style={{ width: `${nullImputationPct}%` }}></div>
</div>
</div>
<div>
<div className="flex justify-between text-xs mb-2">
<span className="font-label tracking-widest opacity-80 uppercase">Type Casting</span>
<span className="font-headline text-secondary">14%</span>
</div>
<div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
<div className="h-full w-[14%] bg-secondary shadow-[0_0_10px_rgba(209,188,255,0.4)]"></div>
</div>
</div>
<div>
<div className="flex justify-between text-xs mb-2">
<span className="font-label tracking-widest opacity-80 uppercase">Schema Alignment</span>
<span className="font-headline text-tertiary">11%</span>
</div>
<div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
<div className="h-full w-[11%] bg-tertiary shadow-[0_0_10px_rgba(255,230,242,0.4)]"></div>
</div>
</div>
<div>
<div className="flex justify-between text-xs mb-2">
<span className="font-label tracking-widest opacity-80 uppercase">Unit Normalization</span>
<span className="font-headline text-white">7%</span>
</div>
<div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
<div className="h-full w-[7%] bg-white/20"></div>
</div>
</div>
</div>
{/* Donut Mockup */}
<div className="relative flex items-center justify-center">
<div className="w-48 h-48 rounded-full border-[12px] border-primary/10 flex items-center justify-center relative">
<div className="absolute inset-0 rounded-full border-t-[12px] border-primary rotate-45"></div>
<div className="absolute inset-0 rounded-full border-r-[12px] border-secondary rotate-[130deg]"></div>
<div className="text-center">
<span className="block font-headline text-3xl font-bold">{cleaningStats?.suggestions?.length || 0}</span>
<span className="text-[0.6rem] uppercase tracking-tighter opacity-50">Tasks Ran</span>
</div>
</div>
</div>
</div>
</div>
{/* Variance Warning Feed (Tall Side Card) */}
<div className="col-span-12 lg:col-span-4 glass-panel rounded-xl flex flex-col h-full overflow-hidden">
<div className="p-6 border-b border-white/5 flex items-center justify-between">
<div>
<h2 className="font-headline font-bold text-on-surface">Variance Feed</h2>
<p className="text-[0.7rem] uppercase tracking-widest text-on-surface-variant">Live Impact Assessment</p>
</div>
<span className="px-2 py-1 bg-error/10 text-error text-[0.6rem] font-bold rounded ring-1 ring-error/30">{highVarianceEntries.length} CRITICAL</span>
</div>
<div className="flex-1 overflow-y-auto p-2 space-y-2">
<div className="p-4 bg-slate-900 rounded-lg border border-neon-purple/30 mb-4">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Brain className="w-5 h-5 text-neon-purple" />
      <span className="font-headline font-bold text-sm uppercase">ML Reliability Engine</span>
    </div>
    <button 
      onClick={handleEvaluateML}
      disabled={isEvaluating}
      className="px-4 py-2 bg-neon-purple/20 hover:bg-neon-purple text-white text-[0.6rem] font-bold rounded transition-all flex items-center gap-2"
    >
      {isEvaluating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
      {isEvaluating ? 'TRAINING...' : 'EVALUATE RELIABILITY'}
    </button>
  </div>
  
  <MlStatusBlock />
</div>

{highVarianceEntries.length === 0 ? (
  <div className="p-4 text-center text-on-surface-variant text-xs">No critical variance detected.</div>
) : (
  highVarianceEntries.slice(0, 10).map(([col, val], idx) => (
    <div key={idx} className="p-4 bg-surface-container-highest/30 rounded-lg border-l-4 border-error hover:bg-surface-container-highest/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[0.65rem] font-headline font-bold text-error uppercase tracking-tighter">{col} Shift</span>
        <span className="text-[0.6rem] opacity-40">LIVE</span>
      </div>
      <p className="text-xs text-on-surface mb-2">Variance of {Math.round(val)} exceeds standard threshold.</p>
      <div className="flex items-center gap-3">
        <span className="text-[0.6rem] text-error font-bold uppercase">Impact: High</span>
        <div className="h-1 w-8 bg-surface-container-lowest rounded-full"><div className="h-full w-full bg-error"></div></div>
      </div>
    </div>
  ))
)}
</div>
</div>
{/* Outlier Detection Panel (Large Wide Card) */}
<div className="col-span-12 glass-panel p-8 rounded-xl">
<div className="flex flex-col md:flex-row gap-8">
{/* Scatter Plot Visualization (Dynamic) */}
<div className="w-full md:w-1/3 aspect-square bg-surface-container-lowest rounded-lg border border-primary/5 relative p-4 overflow-hidden">
<div className="absolute inset-0 flex items-center justify-center opacity-10">
<div className="w-full h-[1px] bg-primary relative"><span className="absolute right-2 -top-4 text-[0.45rem] font-bold tracking-widest">{numericCols[0] ?? 'X'}</span></div>
<div className="h-full w-[1px] bg-primary relative"><span className="absolute top-2 left-2 text-[0.45rem] font-bold tracking-widest">{numericCols[1] ?? 'Y'}</span></div>
</div>
{/* Data Points */}
{scatterPoints ? (
  scatterPoints.map((pt, i) => (
    <div key={i} 
         className={`absolute rounded-full transition-all duration-1000 ${pt.isOutlier ? 'w-2.5 h-2.5 bg-error health-glow border border-error z-10' : 'w-1 h-1 bg-primary/60 opacity-60 hover:w-2 hover:h-2 hover:bg-white hover:opacity-100 z-0 cursor-pointer'}`}
         style={{ left: `${pt.x}%`, bottom: `${pt.y}%`, transform: 'translate(-50%, 50%)' }}
    />
  ))
) : (
  <div className="text-on-surface-variant/30 text-[0.6rem] absolute inset-0 flex items-center justify-center text-center px-4">
    No continuous numeric columns available for projection.
  </div>
)}
<div className="absolute bottom-4 left-4 text-[0.5rem] font-bold text-primary/80 tracking-[0.3em] uppercase">Distribution Map V2</div>
</div>
{/* Outlier List */}
<div className="flex-1">
<div className="flex justify-between items-center mb-6">
<div>
<h2 className="font-headline text-xl font-bold tracking-tight text-primary">Outlier Detection</h2>
<p className="text-sm text-on-surface-variant">Anomalous data points requiring inspection</p>
</div>
<button className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
<span className="material-symbols-outlined text-sm" data-icon="filter_list">filter_list</span>
                                    FILTER VIEW
                                </button>
</div>
<table className="w-full text-left">
<thead className="border-b border-white/5">
<tr className="text-[0.6rem] font-label uppercase tracking-widest text-on-surface-variant/50">
<th className="py-3 px-4">Entity ID</th>
<th className="py-3 px-4">Anomalous Value</th>
<th className="py-3 px-4">Deviation</th>
<th className="py-3 px-4">Severity</th>
<th className="py-3 px-4 text-right">Action</th>
</tr>
</thead>
<tbody className="text-xs">
{highVarianceEntries.length === 0 ? (
  <tr><td colSpan={5} className="py-4 px-4 text-center text-on-surface-variant">No outliers detected in current dataset.</td></tr>
) : (
  highVarianceEntries.slice(0, 5).map(([col, val], idx) => (
    <tr key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
      <td className="py-4 px-4 font-headline text-on-surface">{col}</td>
      <td className="py-4 px-4 font-headline">{formatNumber(val)} <span className="text-[0.6rem] opacity-30">σ²</span></td>
      <td className="py-4 px-4 text-error font-bold">HIGH</td>
      <td className="py-4 px-4">
        <span className="px-2 py-0.5 bg-error/20 text-error rounded text-[0.6rem] font-bold border border-error/30">CRITICAL</span>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex justify-end gap-2">
          <button className="p-1.5 hover:bg-primary/10 text-primary transition-colors rounded"><span className="material-symbols-outlined text-base" data-icon="visibility">visibility</span></button>
        </div>
      </td>
    </tr>
  ))
)}
</tbody>
</table>
</div>
</div>
</div>
</div>
{/* Action Bar (Footer) */}
<section className="mt-10 mb-20 flex flex-col md:flex-row justify-end items-center gap-4">
<button
  onClick={() => data && downloadCSV(data, columns, 'cleaned_dataset')}
  disabled={!data}
  className={`flex items-center gap-2 px-6 py-3 font-label text-xs tracking-widest uppercase transition-all rounded-lg ${
    data
      ? 'border border-neon-teal/40 text-neon-teal hover:bg-neon-teal/10'
      : 'border border-outline-variant/30 text-on-surface-variant/30 cursor-not-allowed'
  }`}
>
  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
  Export Clean Data
</button>
<button onClick={() => navigate('/datastudio')} className="flex items-center gap-2 px-6 py-3 border border-primary/30 text-primary font-label text-xs tracking-widest uppercase hover:bg-primary/5 transition-all rounded-lg">
<span className="material-symbols-outlined text-sm" data-icon="refresh">refresh</span>
                    Re-run Cleanup
                </button>
<button onClick={() => navigate('/editor3d')} className="flex items-center gap-3 px-8 py-3 bg-primary-container text-on-primary-container font-headline font-bold text-sm tracking-tighter uppercase hover:brightness-110 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all rounded-lg group">
                    Approve &amp; Proceed to 3D Editor
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</button>
</section>
</div>
</main>
{/* Visual Backdrop (Gradient Glows) */}
<div className="fixed top-0 right-0 -z-10 w-[50vw] h-[512px] bg-primary/5 blur-[120px] rounded-full"></div>
<div className="fixed bottom-0 left-0 -z-10 w-[40vw] h-[409px] bg-secondary/5 blur-[120px] rounded-full"></div>

    </div>
  );
};
