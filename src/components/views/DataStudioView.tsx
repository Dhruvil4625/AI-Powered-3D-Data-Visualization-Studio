import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadCSV } from '../../utils/downloadCSV';
import { type CleaningStats, type DataRow, useAppStore } from '../../store/useAppStore';

const DISTRIBUTION_BIN_COUNT = 8;

const formatCompactNumber = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

const isNumericValue = (value: unknown) => {
  if (typeof value === 'number') return !Number.isNaN(value);
  if (typeof value === 'string') return value.trim() !== '' && !Number.isNaN(Number(value));
  return false;
};

const getNumericColumns = (rows: DataRow[] | null, sourceColumns: string[]) => {
  if (!rows || rows.length === 0) return [];
  return sourceColumns.filter((column) => rows.some((row) => isNumericValue(row[column])));
};

const getNumericColumnValues = (rows: DataRow[] | null, column: string) => {
  if (!rows || !column) return [];
  return rows
    .map((row) => Number(row[column]))
    .filter((value) => !Number.isNaN(value));
};

const countMissingFromRows = (rows: DataRow[] | null, sourceColumns: string[]) => {
  if (!rows || rows.length === 0) return 0;
  return rows.reduce((total, row) => {
    const rowMissing = sourceColumns.reduce((count, column) => {
      const value = row[column];
      return value === null || value === undefined || value === '' ? count + 1 : count;
    }, 0);
    return total + rowMissing;
  }, 0);
};

const countMissingFromStats = (stats: CleaningStats | null) => {
  if (!stats?.missing_values) return 0;
  return Object.values(stats.missing_values as Record<string, number>).reduce((sum, value) => sum + value, 0);
};

const countVarianceAlerts = (stats: CleaningStats | null) => {
  if (!stats?.variance) return 0;
  return Object.values(stats.variance as Record<string, number>).filter((value) => Number(value) > 1000).length;
};

const buildHistogram = (values: number[], min: number, max: number) => {
  const bins = new Array(DISTRIBUTION_BIN_COUNT).fill(0);
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : safeMin + 1;
  const range = safeMax - safeMin || 1;

  values.forEach((value) => {
    const binIndex = Math.min(
      Math.floor(((value - safeMin) / range) * DISTRIBUTION_BIN_COUNT),
      DISTRIBUTION_BIN_COUNT - 1
    );
    if (binIndex >= 0) {
      bins[binIndex] += 1;
    }
  });

  const labels = bins.map((_, index) => {
    const start = safeMin + (index * range) / DISTRIBUTION_BIN_COUNT;
    return formatCompactNumber(Number(start.toFixed(2)));
  });

  return {
    bins,
    labels,
    max: Math.max(...bins, 1)
  };
};

export const DataStudioView: React.FC = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    data,
    initialData,
    columns,
    initialColumns,
    cleaningStats,
    initialCleaningStats,
    isProcessingData,
    setIsProcessingData,
    setData,
    setChartConfig,
    addChatMessage,
    setToastMessage,
    baselineMl,
    currentMl,
    setBaselineMl,
    setCurrentMl
  } = useAppStore();
  
  // Real dynamic stats derivation
  const totalMissing = cleaningStats ? Object.values(cleaningStats.missing_values as Record<string, number>).reduce((a, b) => a + b, 0) : 0;
  const hasMissing = totalMissing > 0;
  
  const hasHighVariance = cleaningStats ? Object.values(cleaningStats.variance as Record<string, number>).some(v => v > 1000) : false;

  const distributionComparison = useMemo(() => {
    const beforeRows = initialData ?? data;
    const beforeCols = initialColumns.length > 0 ? initialColumns : columns;
    const afterRows = data;
    const afterCols = columns;

    if (!beforeRows || beforeRows.length === 0 || !afterRows || afterRows.length === 0) {
      return null;
    }

    const sharedColumns = afterCols.filter((column) => beforeCols.includes(column));
    const beforeNumeric = getNumericColumns(beforeRows, sharedColumns.length > 0 ? sharedColumns : beforeCols);
    const afterNumeric = getNumericColumns(afterRows, sharedColumns.length > 0 ? sharedColumns : afterCols);
    const selectedColumn =
      afterNumeric.find((column) => beforeNumeric.includes(column)) ??
      afterNumeric[0] ??
      beforeNumeric[0] ??
      null;

    if (!selectedColumn) {
      return null;
    }

    const beforeValues = getNumericColumnValues(beforeRows, selectedColumn);
    const afterValues = getNumericColumnValues(afterRows, selectedColumn);
    const combinedValues = [...beforeValues, ...afterValues];

    if (combinedValues.length === 0) {
      return null;
    }

    const min = Math.min(...combinedValues);
    const max = Math.max(...combinedValues);
    const beforeHistogram = buildHistogram(beforeValues, min, max);
    const afterHistogram = buildHistogram(afterValues, min, max);
    const beforeMissing = initialCleaningStats ? countMissingFromStats(initialCleaningStats) : countMissingFromRows(beforeRows, beforeCols);
    const afterMissing = cleaningStats ? countMissingFromStats(cleaningStats) : countMissingFromRows(afterRows, afterCols);
    const beforeVarianceAlerts = initialCleaningStats ? countVarianceAlerts(initialCleaningStats) : 0;
    const afterVarianceAlerts = cleaningStats ? countVarianceAlerts(cleaningStats) : 0;

    return {
      selectedColumn,
      labels: beforeHistogram.labels,
      beforeBins: beforeHistogram.bins,
      afterBins: afterHistogram.bins,
      maxBinCount: Math.max(beforeHistogram.max, afterHistogram.max, 1),
      beforeRows: beforeRows.length,
      afterRows: afterRows.length,
      beforeMissing,
      afterMissing,
      beforeVarianceAlerts,
      afterVarianceAlerts
    };
  }, [cleaningStats, columns, data, initialCleaningStats, initialColumns, initialData]);

  const [localDismissals, setLocalDismissals] = useState({
    missingValues: false,
    normalization: false,
    schemaMapping: false,
    pca: false,
    kmeans: false
  });
  
  // Compute visible suggestions based on real conditions minus local dismissals
  // Showing suggestions whenever data is loaded so the user can see/test the UI features.
  const showMissingSuggestions = data && !localDismissals.missingValues;
  const showNormalizationSuggestions = data && !localDismissals.normalization;
  const showSchemaMapping = data && !localDismissals.schemaMapping;

  const [activePreset, setActivePreset] = useState('Kinetic Wireframe');
  const [isConnectingCloud, setIsConnectingCloud] = useState(false);
  const [connectProgress, setConnectProgress] = useState(0);

  // Calculate dynamic cleaning progress
  let cleaningProgressPct = 0;
  if (data) {
    let totalIssues = 0;
    let resolvedIssues = 0;
    
    if (totalMissing > 0) {
       totalIssues++;
       if (localDismissals.missingValues) resolvedIssues++;
    }
    
    if (hasHighVariance) {
       totalIssues++;
       if (localDismissals.normalization) resolvedIssues++;
    }
    
    if (totalIssues === 0) {
       cleaningProgressPct = 100;
    } else {
       // Base 40% for just uploading data, then scale up based on resolutions
       cleaningProgressPct = 40 + Math.round((resolvedIssues / totalIssues) * 60);
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const evaluateMl = async (_dataset: DataRow[], isBaseline: boolean) => {
    try {
      const currentDatasetId = useAppStore.getState().datasetId;
      if (!currentDatasetId) return;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout for ML eval

      const currentToken = useAppStore.getState().token;
      const response = await fetch('http://localhost:8000/api/evaluate-ml/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
         },
        body: JSON.stringify({ dataset_id: currentDatasetId }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const result = await response.json();
      
      if (response.ok) {
        // Normalize the result: backend returns status='completed', frontend expects 'success'
        // Also convert decimal scores (0.87) to percentages (87.0)
        const normalized = {
          ...result,
          status: (result.status === 'completed' || result.status === 'success') ? 'success' : result.status,
          train_score: result.train_score != null ? parseFloat((result.train_score * 100).toFixed(1)) : result.train_score,
          test_score: result.test_score != null ? parseFloat((result.test_score * 100).toFixed(1)) : result.test_score,
          metric: result.fit_status === 'Classification' ? 'Accuracy' : 'R²',
        };
        if (isBaseline) {
          setBaselineMl(normalized);
          setCurrentMl(normalized);
        } else {
          setCurrentMl(normalized);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn("ML Evaluation timed out - backend is still processing in background.");
      } else {
        console.error("ML Evaluation error:", error);
      }
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;
    setIsProcessingData(true);
    
    if (file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('http://localhost:8000/api/upload/', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (response.ok) {
          // Setting the data state from Django JSON
          setData(result.data, Object.keys(result.data[0] || {}), result.dataset_id, result.cleaning_stats);
          
          if (result.numeric_columns && result.numeric_columns.length >= 3) {
            setChartConfig({ type: 'scatter', xAxis: result.numeric_columns[0], yAxis: result.numeric_columns[1], zAxis: result.numeric_columns[2] });
          }
          
          addChatMessage({
            role: 'assistant',
            content: `I've successfully loaded "${file.name}" through the Django Smart Clean engine. Proceeded with ${result.rows_processed} topological rows. Visuals have mapped successfully. Ready for observation query.`
          });
          
          // Trigger baseline ML evaluation
          evaluateMl(result.data, true);
        } else {
          alert(`Kinetic API Error: ${result.error}`);
        }
      } catch (error) {
        console.error("API error:", error);
        setToastMessage('Failed to connect to the observation core. Ensure the backend server is active on port 8000.');
        alert('Failed to connect to the observation core. Ensure the backend server (Django) is active on http://localhost:8000.');
      } finally {
        setIsProcessingData(false);
      }
    } else {
      setIsProcessingData(false);
      alert('Invalid packet detected. Upload CSV or JSON.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleApplyFix = async (action: string) => {
    if (!data) return;
    setIsProcessingData(true);
    try {
      const currentToken = useAppStore.getState().token;
      const response = await fetch('http://localhost:8000/api/apply-fix/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
        },
        body: JSON.stringify({ dataset_id: useAppStore.getState().datasetId, action })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Use undefined for datasetId to keep the existing one in the store
        setData(result.data, Object.keys(result.data[0] || {}), undefined, result.cleaning_stats);
        
        let colorAxis = undefined;
        if (Object.keys(result.data[0] || {}).includes('cluster')) {
           colorAxis = 'cluster';
        }
        
        if (result.numeric_columns && result.numeric_columns.length >= 3) {
          setChartConfig({ type: 'scatter', xAxis: result.numeric_columns[0], yAxis: result.numeric_columns[1], zAxis: result.numeric_columns[2], colorAxis });
        } else if (result.numeric_columns && result.numeric_columns.length > 0) {
          setChartConfig({ type: 'scatter', xAxis: result.numeric_columns[0], yAxis: result.numeric_columns[0], zAxis: result.numeric_columns[0], colorAxis });
        }
        
        let fixMessage = 'an optimization';
        if (action === 'interpolate_nulls') fixMessage = 'null interpolation';
        else if (action === 'normalize_variance') fixMessage = 'variance normalization';
        else if (action === 'remove_outliers') fixMessage = 'outlier removal';
        else if (action === 'drop_nulls') fixMessage = 'null dropping';
        else if (action === 'impute_median') fixMessage = 'median imputation';
        else if (action === 'extract_pca') fixMessage = 'PCA feature extraction';
        else if (action === 'cluster_kmeans') fixMessage = 'K-Means clustering';
        
        addChatMessage({
          role: 'assistant',
          content: `I've successfully applied ${fixMessage}. Data topology is now clean and mapped for observation.`
        });
        
        if (action === 'interpolate_nulls') {
          setLocalDismissals(s => ({...s, missingValues: true}));
        } else if (action === 'normalize_variance') {
          setLocalDismissals(s => ({...s, normalization: true}));
        } else if (action === 'extract_pca') {
          setLocalDismissals(s => ({...s, pca: true}));
        } else if (action === 'cluster_kmeans') {
          setLocalDismissals(s => ({...s, kmeans: true}));
        }
        
        // Re-evaluate ML
        evaluateMl(result.data, false);
      } else {
        alert(`Kinetic API Error: ${result.error}`);
      }
    } catch (error) {
      console.error("API error:", error);
      setToastMessage('Failed to connect to the observation core. Ensure the backend server is active on port 8000.');
      alert('Failed to connect to the observation core. Ensure the backend server is active on port 8000.');
    } finally {
      setIsProcessingData(false);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Center Viewport */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-gradient-to-br from-surface to-surface-container-lowest pb-32">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="font-headline text-4xl font-bold text-primary mb-2">Ingestion Node</h1>
            <p className="text-on-surface-variant text-sm max-w-xl">Upload your raw data streams for 3D mapping and topological analysis. Supported: .CSV, .JSON, .SQL, .PARQUET.</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <span className="block text-[10px] uppercase tracking-widest text-secondary font-bold">Active Stream</span>
              <span className="text-2xl font-headline font-medium">{data ? (data.length * 0.0001).toFixed(2) : "0.00"} GB</span>
            </div>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6 pb-20">
          {/* Upload Zone */}
          <div className="col-span-12 glass-panel p-1 rounded-xl group relative">
            <div 
              className={`border-2 border-dashed ${isDragging ? 'border-primary bg-primary/5' : 'border-outline-variant/30 group-hover:border-primary/40'} transition-colors rounded-lg flex flex-col items-center justify-center py-16 px-4 bg-surface-container-low/50 cursor-pointer`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleChange} 
                className="hidden" 
                accept=".csv, application/json"
              />
              
              {isProcessingData ? (
                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">sync</span>
                  <h3 className="font-headline text-xl mb-2 text-on-surface">Processing Neural Input</h3>
                  <p className="text-sm text-on-surface-variant text-center">Parsing data topology and extracting schemas...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined text-3xl text-primary-container">cloud_upload</span>
                  </div>
                  <h3 className="font-headline text-xl mb-2 text-on-surface">Drag & Drop Data Source</h3>
                  <p className="text-sm text-on-surface-variant mb-6 text-center">Your files are encrypted during transit and processed in isolated memory blocks.</p>
                  <div className="flex gap-4" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-surface-bright text-primary text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-surface-container-highest transition-all border border-primary/20">Browse Local</button>
                    <button onClick={async () => {
                      if (isConnectingCloud) return;
                      setIsConnectingCloud(true);
                      setConnectProgress(0);
                      const timer = setInterval(() => setConnectProgress(p => Math.min(p + 8, 92)), 500);
                      try {
                        const res = await fetch('http://localhost:8000/api/cloud-sql/connect', { method: 'POST' });
                        clearInterval(timer);
                        setConnectProgress(100);
                        if (res.ok) {
                          setToastMessage('Cloud SQL connected');
                        } else {
                          setToastMessage('Cloud SQL connection failed');
                        }
                      } catch {
                        clearInterval(timer);
                        setToastMessage('Cloud SQL connection error');
                        setConnectProgress(0);
                      } finally {
                        setTimeout(() => { setIsConnectingCloud(false); }, 1200);
                      }
                    }} className="px-6 py-2 bg-surface-container-highest text-secondary text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-surface-bright transition-all border border-secondary/20">Connect Cloud SQL</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Table Header */}
          <div className="col-span-12 flex justify-between items-center mt-4 px-2">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-sm">visibility</span>
              <h2 className="font-headline text-lg tracking-tight">Real-time Data Preview</h2>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-surface-container-highest text-[10px] rounded text-primary border border-primary/20">Rows: {data ? data.length : 0}</span>
              <span className="px-2 py-1 bg-surface-container-highest text-[10px] rounded text-secondary border border-secondary/20">Columns: {columns.length}</span>
            </div>
          </div>

          {/* Table Viewport */}
          <div className="col-span-12 glass-panel rounded-xl overflow-hidden min-h-[300px] flex flex-col">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 max-h-[500px]">
              {data && columns.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-surface-container-high/90 backdrop-blur-md border-b border-outline-variant/20">
                      {columns.map((col, idx) => (
                        <th key={idx} className="p-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                          <div className="flex items-center gap-2">{col}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-sm font-mono">
                    {data.slice(0, 50).map((row: DataRow, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-outline-variant/10 hover:bg-primary/5 transition-colors">
                        {columns.map((col, colIdx) => (
                          <td key={colIdx} className="p-4 text-on-surface/80 max-w-[200px] truncate">{String(row[col])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-on-surface-variant opacity-50">
                  <span className="material-symbols-outlined text-5xl mb-4">table_chart</span>
                  <p>Awaiting dataset to render preview matrix.</p>
                </div>
              )}
            </div>
          </div>

          {/* ML Performance Simulator Card */}
          <div className="col-span-12 rounded-2xl overflow-hidden" style={{ background: 'rgba(16,20,26,0.8)', border: '1px solid rgba(195,245,255,0.07)' }}>
            {/* Card Header */}
            <div className="px-8 pt-7 pb-5 flex items-center justify-between border-b" style={{ borderColor: 'rgba(195,245,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <span className="material-symbols-outlined text-purple-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>model_training</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-on-surface font-headline">ML Performance Simulator</h4>
                  <p className="text-[10px] text-on-surface-variant/50 mt-0.5">
                    Predicting: <span className="font-mono text-purple-400">{currentMl?.target_col || '—'}</span>
                  </p>
                </div>
              </div>
              {currentMl?.status === 'success' && (
                <span className={`badge ${
                  currentMl.fit_status === 'Classification' ? 'badge-cyan' :
                  currentMl.fit_status === 'Regression' ? 'badge-purple' : 'badge-teal'
                }`}>
                  <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {currentMl.fit_status}
                </span>
              )}
            </div>

            {/* Card Body */}
            <div className="p-8">
              {!data ? (
                <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant/30 border border-dashed rounded-xl" style={{ borderColor: 'rgba(195,245,255,0.07)' }}>
                  <span className="material-symbols-outlined text-4xl mb-3">query_stats</span>
                  <p className="text-sm">Upload data to simulate ML performance</p>
                </div>
              ) : currentMl?.status === 'failed' ? (
                <div className="flex items-start gap-4 p-5 rounded-xl" style={{ background: 'rgba(255,180,171,0.05)', border: '1px solid rgba(255,180,171,0.15)' }}>
                  <span className="material-symbols-outlined text-error text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  <div>
                    <h5 className="text-error font-bold text-sm mb-1">Compilation Failed</h5>
                    <p className="text-xs text-on-surface-variant">{currentMl.reason}</p>
                  </div>
                </div>
              ) : currentMl?.status === 'success' && baselineMl?.status === 'success' ? (
                <div className="grid grid-cols-2 gap-6">
                  {/* Baseline */}
                  <div className="rounded-xl p-6 space-y-5" style={{ background: 'rgba(195,245,255,0.02)', border: '1px solid rgba(195,245,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-amber">Baseline</span>
                      <span className="text-[10px] text-on-surface-variant/40">Before Cleaning</span>
                    </div>
                    <div className="space-y-4">
                      {[{label: `Train ${baselineMl.metric}`, score: baselineMl.train_score}, {label: `Test ${baselineMl.metric}`, score: baselineMl.test_score}].map(({label, score}) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-on-surface-variant/60 uppercase tracking-wider text-[10px] font-medium">{label}</span>
                            <span className="font-mono text-on-surface-variant">{score}%</span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill-cyan opacity-30" style={{ width: `${score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current */}
                  <div className="rounded-xl p-6 space-y-5 relative overflow-hidden" style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.18)' }}>
                    <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl" style={{ background: 'rgba(168,85,247,0.08)' }} />
                    <div className="flex items-center gap-2 mb-1 relative">
                      <span className="badge badge-purple">Current</span>
                      <span className="text-[10px] text-on-surface-variant/40">After Cleaning</span>
                    </div>
                    <div className="space-y-4 relative">
                      {[{label: `Train ${currentMl.metric}`, score: currentMl.train_score, base: baselineMl.train_score}, {label: `Test ${currentMl.metric}`, score: currentMl.test_score, base: baselineMl.test_score}].map(({label, score, base}) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-on-surface/70 uppercase tracking-wider text-[10px] font-medium">{label}</span>
                            <div className="flex items-center gap-2">
                              {score !== base && (
                                <span className={`text-[10px] font-bold ${score! > base! ? 'text-neon-teal' : 'text-error'}`}>
                                  {score! > base! ? '+' : ''}{((score ?? 0) - (base ?? 0)).toFixed(1)}%
                                </span>
                              )}
                              <span className="font-mono font-bold text-purple-300">{score}%</span>
                            </div>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill-purple" style={{ width: `${score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    {currentMl.reason && (
                      <p className="text-[11px] text-on-surface-variant/60 leading-relaxed pt-2 border-t relative" style={{ borderColor: 'rgba(195,245,255,0.06)' }}>
                        <span className="text-on-surface/70 font-semibold">AI: </span>{currentMl.reason}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-purple-400/30 border-t-purple-400 animate-spin" />
                  <p className="text-xs text-on-surface-variant/50">Training model baseline…</p>
                </div>
              )}
            </div>
          </div>

          {/* Topological Summary Card */}
          <div className="col-span-6 glass-panel rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs uppercase tracking-widest text-primary font-bold">Data Distribution</h4>
              <span className="material-symbols-outlined text-primary text-sm">analytics</span>
            </div>
            
            {distributionComparison ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-on-surface">{distributionComparison.selectedColumn}</p>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Imported CSV vs current cleaned dataset</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest">
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <span className="h-2 w-2 rounded-full bg-on-surface-variant/50"></span>
                      Before
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                      After
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-8 gap-2 items-end h-36">
                  {distributionComparison.afterBins.map((afterValue, index) => {
                    const beforeValue = distributionComparison.beforeBins[index] ?? 0;
                    const afterHeight = `${Math.max((afterValue / distributionComparison.maxBinCount) * 100, afterValue > 0 ? 8 : 0)}%`;
                    const beforeHeight = `${Math.max((beforeValue / distributionComparison.maxBinCount) * 100, beforeValue > 0 ? 8 : 0)}%`;

                    return (
                      <div key={`${distributionComparison.selectedColumn}-${index}`} className="flex h-full flex-col justify-end gap-1">
                        <div className="flex h-full items-end gap-1">
                          <div className="w-1/2 rounded-t bg-on-surface-variant/30" style={{ height: beforeHeight }} title={`Before: ${beforeValue}`}></div>
                          <div className="w-1/2 rounded-t bg-primary shadow-[0_0_10px_rgba(0,229,255,0.2)]" style={{ height: afterHeight }} title={`After: ${afterValue}`}></div>
                        </div>
                        <span className="text-[9px] text-center text-on-surface-variant truncate">{distributionComparison.labels[index]}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-outline-variant/20 bg-surface-container-highest/40 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">Rows</div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xs text-on-surface-variant">{formatCompactNumber(distributionComparison.beforeRows)}</span>
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_forward</span>
                      <span className="font-headline text-primary">{formatCompactNumber(distributionComparison.afterRows)}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-outline-variant/20 bg-surface-container-highest/40 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">Missing Cells</div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xs text-on-surface-variant">{formatCompactNumber(distributionComparison.beforeMissing)}</span>
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_forward</span>
                      <span className={`font-headline ${distributionComparison.afterMissing <= distributionComparison.beforeMissing ? 'text-primary' : 'text-error'}`}>
                        {formatCompactNumber(distributionComparison.afterMissing)}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-outline-variant/20 bg-surface-container-highest/40 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">Variance Alerts</div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xs text-on-surface-variant">{distributionComparison.beforeVarianceAlerts}</span>
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_forward</span>
                      <span className={`font-headline ${distributionComparison.afterVarianceAlerts <= distributionComparison.beforeVarianceAlerts ? 'text-primary' : 'text-error'}`}>
                        {distributionComparison.afterVarianceAlerts}
                      </span>
                    </div>
                  </div>
                </div>

                {(cleaningStats?.warnings?.length ?? 0) > 0 ? (
                  <div className="max-h-32 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
                    {(cleaningStats?.warnings ?? []).slice(0, 4).map((warning: string, index: number) => (
                      <p key={index} className="flex items-start gap-1 text-[10px] leading-relaxed text-error">
                        <span className="material-symbols-outlined mt-0.5 shrink-0 text-[12px]">warning</span>
                        <span className="break-words">{warning}</span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="flex items-start gap-1 text-[10px] leading-relaxed text-primary">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Distribution is linked to the uploaded CSV and refreshed after each cleaning step.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant opacity-50">Upload a dataset to generate topology report.</p>
            )}
          </div>

          {/* Action Card */}
          <div className="col-span-6 glass-panel rounded-xl p-6 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-secondary font-bold mb-4">Pipeline Status</h4>
              <div className="flex items-center gap-4 mb-2">
                <div className={`w-3 h-3 rounded-full ${data ? 'bg-primary-container shadow-[0_0_8px_#00e5ff] animate-pulse' : 'bg-outline-variant'}`}></div>
                <span className="text-sm">{data ? 'Ready for 3D Conversion' : 'Awaiting Input Stream'}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => data && downloadCSV(data, columns, 'cleaned_dataset')}
                disabled={!data}
                className={`w-full py-3 font-bold uppercase tracking-widest text-sm rounded-lg flex items-center justify-center gap-2 transition-all ${
                  data
                    ? 'border border-neon-teal/40 text-neon-teal hover:bg-neon-teal/10 hover:scale-[1.01]'
                    : 'border border-outline-variant/20 text-on-surface-variant/30 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
                Download Dataset
              </button>
              <button 
                onClick={() => data && navigate('/editor3d')}
                className={`w-full py-4 font-bold uppercase tracking-widest text-sm rounded-lg transition-transform ${data ? 'bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-fixed shadow-xl hover:scale-[1.02]' : 'bg-surface-bright text-on-surface-variant cursor-not-allowed border border-outline-variant/20'}`}>
                Initialize Pre-render
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Smart Clean Sidebar */}
      <aside className="w-80 flex flex-col shrink-0" style={{ background: 'rgba(10,14,20,0.92)', borderLeft: '1px solid rgba(195,245,255,0.06)' }}>
        {/* Header */}
        <div className="p-5 border-b" style={{ borderColor: 'rgba(195,245,255,0.06)', background: 'rgba(22,26,34,0.6)' }}>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}>
              <span className="material-symbols-outlined text-neon-cyan text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <h2 className="font-headline font-bold text-base text-on-surface">Smart Clean</h2>
            <div className="ml-auto pulse-dot" />
          </div>
          <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-[0.16em] font-bold">AI Insight Engine · Active</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 custom-scrollbar">
          {isConnectingCloud && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(209,188,255,0.04)', border: '1px solid rgba(209,188,255,0.15)' }}>
              <div className="flex items-center justify-between">
                <span className="badge badge-purple">Cloud SQL</span>
                <span className="text-[10px] text-on-surface-variant/50 font-mono">{connectProgress}%</span>
              </div>
              <p className="text-sm font-medium text-on-surface">Connecting…</p>
              <div className="progress-track">
                <div className="progress-fill-purple" style={{ width: `${connectProgress}%` }} />
              </div>
            </div>
          )}

          {/* Suggestion 1 – Missing Values */}
          {showMissingSuggestions && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(209,188,255,0.04)', border: '1px solid rgba(195,245,255,0.07)' }}>
              <div className="flex justify-between items-start">
                <span className="badge badge-amber">Missing Values</span>
                <span className="text-[10px] text-on-surface-variant/40 font-mono">{totalMissing > 0 ? totalMissing : '—'} nulls</span>
              </div>
              <h4 className="text-sm font-semibold text-on-surface">Interpolate Null Data</h4>
              <p className="text-[11px] text-on-surface-variant/60 leading-relaxed">Linear interpolation based on surrounding data packets.</p>
              <div className="flex gap-2 pt-1">
                <button onClick={() => handleApplyFix('interpolate_nulls')} className="btn-primary flex-1 py-2 text-[10px]">Apply Fix</button>
                <button onClick={() => setLocalDismissals(s => ({...s, missingValues: true}))} className="btn-ghost px-3 py-2 text-[10px]">Ignore</button>
              </div>
            </div>
          )}

          {/* Suggestion 2 – Normalization */}
          {showNormalizationSuggestions && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,229,255,0.03)', border: '1px solid rgba(195,245,255,0.07)' }}>
              <div className="flex justify-between items-start">
                <span className="badge badge-cyan">Normalization</span>
                <span className="text-[10px] text-on-surface-variant/40">Global</span>
              </div>
              <h4 className="text-sm font-semibold text-on-surface">Z-Score Signal Scaling</h4>
              <p className="text-[11px] text-on-surface-variant/60 leading-relaxed">High variance outliers detected. Z-score scaling for clean 3D rendering.</p>
              <div className="flex gap-2 pt-1">
                <button onClick={() => handleApplyFix('normalize_variance')} className="btn-primary flex-1 py-2 text-[10px]">Optimize</button>
                <button onClick={() => setLocalDismissals(s => ({...s, normalization: true}))} className="btn-ghost px-3 py-2 text-[10px]">Ignore</button>
              </div>
            </div>
          )}

          {/* Suggestion 3 – PCA */}
          {data && columns.length >= 3 && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.15)' }}>
              <div className="flex justify-between items-start">
                <span className="badge badge-purple">Feature Extraction</span>
                <span className="text-[10px] text-on-surface-variant/40">PCA</span>
              </div>
              <h4 className="text-sm font-semibold text-on-surface">Principal Component Analysis</h4>
              <p className="text-[11px] text-on-surface-variant/60 leading-relaxed">Reduce to 3 principal components for optimal 3D spatial mapping.</p>
              <button onClick={() => handleApplyFix('extract_pca')} className="btn-primary w-full py-2 text-[10px]">Extract PCA</button>
            </div>
          )}

          {/* Suggestion 4 – K-Means */}
          {data && columns.length >= 3 && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.15)' }}>
              <div className="flex justify-between items-start">
                <span className="badge badge-teal">Clustering</span>
                <span className="text-[10px] text-on-surface-variant/40">K-Means · 5 clusters</span>
              </div>
              <h4 className="text-sm font-semibold text-on-surface">AI Data Clustering</h4>
              <p className="text-[11px] text-on-surface-variant/60 leading-relaxed">Group points into clusters to identify underlying data patterns.</p>
              <button onClick={() => handleApplyFix('cluster_kmeans')} className="w-full py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all" style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.25)', color: '#2dd4bf' }}>Cluster Data</button>
            </div>
          )}

          {/* Suggestion 5 – Schema Mapping */}
          {showSchemaMapping && (!hasMissing && !hasHighVariance && cleaningStats) && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,230,242,0.03)', border: '1px solid rgba(255,230,242,0.1)' }}>
              <div className="flex justify-between items-start">
                <span className="badge" style={{ background: 'rgba(255,230,242,0.1)', border: '1px solid rgba(255,230,242,0.2)', color: '#ffe6f2' }}>Schema Mapping</span>
                <span className="text-[10px] text-on-surface-variant/40">Spatial</span>
              </div>
              <h4 className="text-sm font-semibold text-on-surface">Auto-map Geo Coordinates</h4>
              <p className="text-[11px] text-on-surface-variant/60 leading-relaxed">WGS84 coordinates detected. Auto-linking to Geo-Spatial 3D projection layer.</p>
              <button onClick={() => setLocalDismissals(s => ({...s, schemaMapping: true}))} className="btn-primary w-full py-2 text-[10px]">Confirm Mapping</button>
            </div>
          )}

          {/* Ingestion Presets */}
          <div className="pt-4 border-t" style={{ borderColor: 'rgba(195,245,255,0.06)' }}>
            <p className="section-label px-0 mt-0">Ingestion Presets</p>
            <div className="space-y-1">
              {['Kinetic Wireframe', 'Volumetric Cloud', 'Heat Signature'].map((preset) => (
                <div key={preset} onClick={() => setActivePreset(preset)}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all group ${
                    activePreset === preset ? 'bg-neon-cyan/8' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <span className={`text-[11px] font-medium ${activePreset === preset ? 'text-neon-cyan' : 'text-on-surface-variant/60 group-hover:text-on-surface-variant'}`}>{preset}</span>
                  <span className={`material-symbols-outlined text-sm ${activePreset === preset ? 'text-neon-cyan' : 'text-on-surface-variant/30'}`}
                    style={{ fontVariationSettings: activePreset === preset ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {activePreset === preset ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Progress + Download */}
        <div className="p-4 border-t space-y-3" style={{ borderColor: 'rgba(195,245,255,0.06)', background: 'rgba(10,14,20,0.6)' }}>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 mb-2.5">
            <span>Cleaning Progress</span>
            <span className={`font-mono ${cleaningProgressPct === 100 ? 'text-neon-teal' : 'text-on-surface-variant/60'}`}>{cleaningProgressPct}%</span>
          </div>
          <div className="progress-track">
            <div
              className={`${cleaningProgressPct === 100 ? 'progress-fill-cyan' : 'progress-fill-purple'}`}
              style={{ width: `${cleaningProgressPct}%` }}
            />
          </div>
          {cleaningProgressPct === 100 && (
            <p className="text-[9px] text-neon-teal flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Dataset is clean and ready
            </p>
          )}
          {/* Download button */}
          <button
            onClick={() => data && downloadCSV(data, columns, 'cleaned_dataset')}
            disabled={!data}
            className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
              data
                ? 'glow-cyan text-on-surface hover:scale-[1.02]'
                : 'opacity-30 cursor-not-allowed'
            }`}
            style={data ? { background: 'linear-gradient(135deg, rgba(0,229,255,0.18), rgba(45,212,191,0.12))', border: '1px solid rgba(0,229,255,0.3)' } : { background: 'rgba(195,245,255,0.04)', border: '1px solid rgba(195,245,255,0.08)' }}
          >
            <span className="material-symbols-outlined text-base text-neon-cyan" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
            <span className="text-neon-cyan">Export CSV</span>
          </button>
        </div>
      </aside>
      {/* FAB */}
      {data && (
        <button onClick={() => navigate('/editor3d')} className="fixed bottom-8 right-[350px] z-50 flex items-center gap-3 px-6 py-4 font-bold rounded-full shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:scale-105 transition-all glow-cyan"
          style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.9), rgba(0,218,243,0.8))', color: '#001f24' }}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          <span>Run Pipeline</span>
        </button>
      )}
    </div>
  );
};
