import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const ProjectSettingsView: React.FC = () => {
  const { setToastMessage } = useAppStore();
  const [publicVisibility, setPublicVisibility] = useState(true);
  const [dataAnonymization, setDataAnonymization] = useState(false);
  const [highHeatMode, setHighHeatMode] = useState(true);
  return (
    <div className="flex-1 overflow-y-auto bg-background p-8 h-full custom-scrollbar">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="font-headline text-4xl font-bold text-on-surface tracking-tight mb-2 uppercase">Project Settings</h1>
          <p className="text-on-surface-variant font-body text-sm max-w-2xl leading-relaxed">
            Configuration parameters for the current observation cycle. Adjust data streams, visibility protocols, and authentication vectors.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Core Configuration */}
            <section className="glass-panel p-8 rounded-xl">
              <h3 className="font-headline text-lg font-medium text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Core Configuration
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-1.5">
                  <label className="uppercase text-[10px] tracking-widest text-on-surface-variant font-bold">Project Identity</label>
                  <input className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded p-3 text-on-surface font-body outline-none focus:border-primary/50 transition-colors" type="text" defaultValue="Project Alpha" />
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <label className="uppercase text-[10px] tracking-widest text-on-surface-variant font-bold">Observation Abstract</label>
                  <textarea className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded p-3 text-on-surface font-body outline-none focus:border-primary/50 transition-colors resize-none custom-scrollbar" rows={4} defaultValue="High-fidelity 3D rendering of gravitational anomalies within the Sector-7 nebula. Data points extracted via secondary pulsar relays." />
                </div>
              </div>
            </section>

            {/* Authentication Vectors */}
            <section className="glass-panel p-8 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline text-lg font-medium text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">key</span>
                  Authentication Vectors
                </h3>
                <button className="text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-tertiary transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Provision New Key
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded border-l-2 border-primary">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded">
                      <span className="material-symbols-outlined text-primary">database</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">Main Stream API</p>
                      <code className="text-[10px] text-on-surface-variant tracking-widest">K-OBS-8842-XXXX-XXXX</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-on-surface-variant hover:text-primary transition-all rounded hover:bg-primary/10">
                      <span className="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                    <button className="p-2 text-on-surface-variant hover:text-error transition-all rounded hover:bg-error/10">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded border-l-2 border-secondary/40">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary/10 rounded">
                      <span className="material-symbols-outlined text-secondary">share</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">Collaboration Tunnel</p>
                      <code className="text-[10px] text-on-surface-variant tracking-widest">K-OBS-1120-XXXX-XXXX</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-on-surface-variant hover:text-primary transition-all rounded hover:bg-primary/10">
                      <span className="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                    <button className="p-2 text-on-surface-variant hover:text-error transition-all rounded hover:bg-error/10">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* Privacy Protocols */}
            <section className="glass-panel p-8 rounded-xl h-fit">
              <h3 className="font-headline text-lg font-medium text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">lock</span>
                Privacy Protocols
              </h3>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-on-surface">Public Visibility</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Allow indexed search and guest viewing.</p>
                  </div>
                  <button onClick={() => { setPublicVisibility(v => !v); setToastMessage(`Public Visibility ${!publicVisibility ? 'Enabled' : 'Disabled'}`); }} className={`w-10 h-5 rounded-full relative transition-colors border border-outline-variant/30 cursor-pointer ${publicVisibility ? 'bg-surface-bright' : 'bg-surface-container-lowest'}`}>
                    <span className={`absolute ${publicVisibility ? 'right-1' : 'left-1'} top-1 w-3 h-3 bg-primary rounded-full shadow-[0_0_8px_#c3f5ff]`}></span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-on-surface">Data Anonymization</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Strip PII from exported data packets.</p>
                  </div>
                  <button onClick={() => { setDataAnonymization(v => !v); setToastMessage(`Data Anonymization ${!dataAnonymization ? 'Enabled' : 'Disabled'}`); }} className={`w-10 h-5 rounded-full relative transition-colors border border-outline-variant/30 cursor-pointer ${dataAnonymization ? 'bg-surface-bright' : 'bg-surface-container-lowest'}`}>
                    <span className={`absolute ${dataAnonymization ? 'right-1' : 'left-1'} top-1 w-3 h-3 ${dataAnonymization ? 'bg-primary' : 'bg-outline'} rounded-full`}></span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-on-surface">High-Heat Mode</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Enable intensive 3D sampling rates.</p>
                  </div>
                  <button onClick={() => { setHighHeatMode(v => !v); setToastMessage(`High-Heat Mode ${!highHeatMode ? 'Enabled' : 'Disabled'}`); }} className={`w-10 h-5 rounded-full relative transition-colors border border-outline-variant/30 cursor-pointer ${highHeatMode ? 'bg-surface-bright' : 'bg-surface-container-lowest'}`}>
                    <span className={`absolute ${highHeatMode ? 'right-1' : 'left-1'} top-1 w-3 h-3 ${highHeatMode ? 'bg-tertiary' : 'bg-outline'} rounded-full`}></span>
                  </button>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section className="glass-panel p-8 rounded-xl h-fit">
              <h3 className="font-headline text-lg font-medium text-error mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Termination
              </h3>
              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                Once a project is purged, all telemetry data and 3D models will be permanently scrubbed from the observatory core.
              </p>
              <button className="w-full py-2.5 border border-error/30 text-error hover:bg-error/10 font-headline text-[10px] font-bold uppercase tracking-widest transition-all rounded">
                Decommission Project
              </button>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-12 flex items-center justify-between border-t border-outline-variant/10">
          <p className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] font-bold">Kinetic Observatory System v4.1.2 // Secure Session</p>
          <div className="flex gap-4 items-center">
            <button className="text-[10px] font-bold uppercase tracking-widest text-on-surface/60 hover:text-on-surface transition-colors py-2 px-4">Discard</button>
            <button className="px-6 py-2.5 bg-primary-container text-on-primary-container font-headline text-[10px] font-bold uppercase tracking-widest rounded shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:scale-105 active:scale-95 transition-all">Commit Changes</button>
          </div>
        </footer>
      </div>
    </div>
  );
};
