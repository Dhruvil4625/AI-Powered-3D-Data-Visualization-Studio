import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const DataStudioView: React.FC = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, columns, isProcessingData, setIsProcessingData, setData, setChartConfig, addChatMessage, setToastMessage } = useAppStore();
  
  const [suggestions, setSuggestions] = useState({
    missingValues: true,
    normalization: true,
    schemaMapping: true
  });
  const [activePreset, setActivePreset] = useState('Kinetic Wireframe');
  const [isConnectingCloud, setIsConnectingCloud] = useState(false);
  const [connectProgress, setConnectProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
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
          setData(result.data, Object.keys(result.data[0] || {}));
          
          if (result.numeric_columns && result.numeric_columns.length >= 3) {
            setChartConfig({ type: 'scatter', xAxis: result.numeric_columns[0], yAxis: result.numeric_columns[1], zAxis: result.numeric_columns[2] });
          }
          
          addChatMessage({
            role: 'assistant',
            content: `I've successfully loaded "${file.name}" through the Django Smart Clean engine. Proceeded with ${result.rows_processed} topological rows. Visuals have mapped successfully. Ready for observation query.`
          });
        } else {
          alert(`Kinetic API Error: ${result.error}`);
        }
      } catch (error) {
        console.error("API error:", error);
        alert('Failed to connect to the observation core. Ensure the offline Django server is active.');
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
                    {data.slice(0, 50).map((row: any, rowIdx) => (
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

          {/* Topological Summary Card */}
          <div className="col-span-6 glass-panel rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs uppercase tracking-widest text-primary font-bold">Data Distribution</h4>
              <span className="material-symbols-outlined text-primary text-sm">analytics</span>
            </div>
            <div className="flex items-end gap-1 h-24 mb-4">
              <div className="flex-1 bg-primary/20 rounded-t h-1/2"></div>
              <div className="flex-1 bg-primary/40 rounded-t h-3/4"></div>
              <div className="flex-1 bg-primary/60 rounded-t h-full"></div>
              <div className="flex-1 bg-primary/80 rounded-t h-2/3"></div>
              <div className="flex-1 bg-primary-container rounded-t h-5/6"></div>
              <div className="flex-1 bg-primary/30 rounded-t h-1/4"></div>
              <div className="flex-1 bg-primary/50 rounded-t h-2/5"></div>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Detected high variance in <span className="text-secondary">{columns.length > 0 ? (columns[1] || columns[0]) : 'Signal_Str'}</span>. Topological distortion may occur without normalization.
            </p>
          </div>

          {/* Action Card */}
          <div className="col-span-6 glass-panel rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-secondary font-bold mb-4">Pipeline Status</h4>
              <div className="flex items-center gap-4 mb-2">
                <div className={`w-3 h-3 rounded-full ${data ? 'bg-primary-container shadow-[0_0_8px_#00e5ff] animate-pulse' : 'bg-outline-variant'}`}></div>
                <span className="text-sm">{data ? 'Ready for 3D Conversion' : 'Awaiting Input Stream'}</span>
              </div>
            </div>
            <button 
              onClick={() => data && navigate('/editor3d')}
              className={`w-full py-4 font-bold uppercase tracking-widest text-sm rounded-lg transition-transform ${data ? 'bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-fixed shadow-xl hover:scale-[1.02]' : 'bg-surface-bright text-on-surface-variant cursor-not-allowed border border-outline-variant/20'}`}>
              Initialize Pre-render
            </button>
          </div>
        </div>
      </div>

      {/* AI Smart Clean Sidebar */}
      <aside className="w-80 bg-surface-container-low border-l border-outline-variant/20 flex flex-col shrink-0">
        <div className="p-6 border-b border-outline-variant/20 bg-surface-container-high/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <h2 className="font-headline font-bold text-lg">Smart Clean</h2>
          </div>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">AI Insight Engine Active</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {isConnectingCloud && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-secondary-container/20 text-secondary text-[9px] font-bold rounded uppercase">Cloud SQL</span>
                <span className="text-[10px] text-on-surface-variant">{connectProgress}%</span>
              </div>
              <h4 className="text-sm font-medium text-on-surface">Connecting to Cloud SQL</h4>
              <div className="h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-secondary" style={{ width: `${connectProgress}%` }}></div>
              </div>
            </div>
          )}
          {/* Suggestion 1 */}
          {suggestions.missingValues && (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 bg-secondary-container/20 text-secondary text-[9px] font-bold rounded uppercase">Missing Values</span>
                <span className="text-[10px] text-on-surface-variant">Row #5, #12, #88</span>
              </div>
              <h4 className="text-sm font-medium text-on-surface">Interpolate Null Timestamps</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">3 missing values detected in `Timestamp`. Suggesting linear interpolation based on surrounding packets.</p>
              <div className="flex gap-2">
                <button onClick={() => setSuggestions(s => ({...s, missingValues: false}))} className="flex-1 py-1.5 bg-surface-bright rounded text-[10px] font-bold hover:bg-primary/20 transition-colors">Apply Fix</button>
                <button onClick={() => setSuggestions(s => ({...s, missingValues: false}))} className="px-3 py-1.5 bg-surface-container-highest rounded text-[10px] font-bold hover:text-error transition-colors">Ignore</button>
              </div>
            </div>
          )}
          
          {/* Suggestion 2 */}
          {suggestions.normalization && (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 bg-primary-container/20 text-primary-container text-[9px] font-bold rounded uppercase">Normalization</span>
                <span className="text-[10px] text-on-surface-variant">Global</span>
              </div>
              <h4 className="text-sm font-medium text-on-surface">Z-Score Signal Scaling</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">`Signal_Str` has outliers (std dev &gt; 3). Scaling recommended for clean 3D volume rendering.</p>
              <div className="flex gap-2">
                <button onClick={() => setSuggestions(s => ({...s, normalization: false}))} className="flex-1 py-1.5 bg-surface-bright rounded text-[10px] font-bold hover:bg-primary/20 transition-colors">Optimize</button>
                <button onClick={() => setSuggestions(s => ({...s, normalization: false}))} className="px-3 py-1.5 bg-surface-container-highest rounded text-[10px] font-bold hover:text-error transition-colors">Ignore</button>
              </div>
            </div>
          )}
          
          {/* Suggestion 3 */}
          {suggestions.schemaMapping && (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 bg-tertiary-container/20 text-tertiary text-[9px] font-bold rounded uppercase">Schema Mapping</span>
                <span className="text-[10px] text-on-surface-variant">Spatial</span>
              </div>
              <h4 className="text-sm font-medium text-on-surface">Auto-map Geo_Coord</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">Detected WGS84 coordinates. Auto-linking to Geo-Spatial 3D projection layer.</p>
              <div className="flex gap-2">
                <button onClick={() => setSuggestions(s => ({...s, schemaMapping: false}))} className="flex-1 py-1.5 bg-surface-bright rounded text-[10px] font-bold hover:bg-primary/20 transition-colors">Confirm Mapping</button>
              </div>
            </div>
          )}
          
          {/* Visualization Settings */}
          <div className="pt-8 border-t border-outline-variant/20">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-4">Ingestion Presets</h3>
            <div className="space-y-2">
              {['Kinetic Wireframe', 'Volumetric Cloud', 'Heat Signature'].map((preset) => (
                <div key={preset} onClick={() => setActivePreset(preset)} className="flex items-center justify-between p-2 rounded hover:bg-surface-container-high transition-colors cursor-pointer group">
                  <span className="text-xs">{preset}</span>
                  <span className={`material-symbols-outlined text-xs ${activePreset === preset ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'}`}>
                    {activePreset === preset ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-surface-container-highest">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            <span>Cleaning Progress</span>
            <span>88%</span>
          </div>
          <div className="h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
            <div className="h-full bg-primary-container" style={{ width: '88%' }}></div>
          </div>
        </div>
      </aside>

      {/* FAB */}
      {data && (
        <button onClick={() => navigate('/editor3d')} className="fixed bottom-8 right-[350px] z-50 flex items-center gap-3 px-6 py-4 bg-primary-container text-on-primary-fixed font-bold rounded-full shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:scale-105 transition-all">
          <span className="material-symbols-outlined">play_arrow</span>
          <span>Run Pipeline</span>
        </button>
      )}
    </div>
  );
};
