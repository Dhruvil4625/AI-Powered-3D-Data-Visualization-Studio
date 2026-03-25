import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Uploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setData, isProcessingData, setIsProcessingData, data, addChatMessage, setChartConfig } = useAppStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file) return;
    setIsProcessingData(true);
    
    // For simplicity, we assume CSV for this MVP step.
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const columns = results.meta.fields || [];
          const rows = results.data;
          
          setData(rows, columns);
          
          // Basic auto-detect visualizer configuration
          if (columns.length >= 3) {
             setChartConfig({ type: 'scatter', xAxis: columns[0], yAxis: columns[1], zAxis: columns[2]});
          }
          
          addChatMessage({
            role: 'assistant',
            content: `I've successfully loaded "${file.name}" with ${rows.length} rows and ${columns.length} columns. I've automatically set up a basic 3D scatter plot. How would you like to explore this further?`
          });
        },
        error: (error) => {
          console.error("Parse error:", error);
          setIsProcessingData(false);
        }
      });
    } else {
      // Basic fallback for non-csv parsing if needed
      setIsProcessingData(false);
      alert('Please upload a valid CSV file.');
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
    <div className="flex flex-col h-full">
      <h2 className="text-neon-cyan font-semibold text-lg mb-6 tracking-wide drop-shadow-[0_0_8px_rgba(0,245,255,0.8)] flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5 text-neon-cyan" /> Data Upload
      </h2>

      {!data ? (
        <div 
          className={`flex-1 border-2 border-dashed transition-all rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group relative overflow-hidden
            ${isDragging ? 'border-neon-teal bg-neon-teal/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-slate-700 hover:border-neon-cyan hover:bg-slate-800/30'}`}
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
            <div className="animate-pulse flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-neon-cyan animate-spin mb-4" />
              <p className="text-sm text-neon-teal font-medium tracking-wide shadow-sm">Parsing Dataset...</p>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-neon-teal' : 'text-slate-500 group-hover:text-neon-cyan'}`} />
              <p className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors font-medium relative z-10">
                Drag & Drop CSV/JSON<br/><span className="text-xs text-slate-500 mt-2 block">or Click to Browse</span>
              </p>
            </>
          )}
        </div>
      ) : (
         <div className="flex-1 bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <h3 className="font-medium text-slate-200">Dataset Loaded</h3>
            </div>
            <div className="space-y-2 mb-6">
               <div className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-center text-sm border border-slate-700/30 shadow-inner">
                 <span className="text-slate-400">Rows:</span>
                 <span className="text-neon-teal font-mono">{data.length}</span>
               </div>
               <div className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-center text-sm border border-slate-700/30 shadow-inner">
                 <span className="text-slate-400">Columns:</span>
                 <span className="text-neon-teal font-mono">{Object.keys(data[0] || {}).length}</span>
               </div>
            </div>
            
            <button 
               onClick={() => useAppStore.getState().clearData()}
               className="mt-auto w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-lg text-sm text-slate-300 font-medium transition-all shadow-[0_4px_10px_rgba(0,0,0,0.5)] active:translate-y-[1px]"
            >
              Upload New Dataset
            </button>
         </div>
      )}
    </div>
  );
};
