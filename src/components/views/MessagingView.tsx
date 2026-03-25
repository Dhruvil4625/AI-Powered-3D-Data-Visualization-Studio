import React from 'react';
import { useAppStore } from '../../store/useAppStore';

export const MessagingView: React.FC = () => {
  const { setToastMessage } = useAppStore();

  return (
    <div className="p-8 h-full flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start overflow-y-auto custom-scrollbar">
      {/* Left Column: Active Team Members (Asymmetric HUD) */}
      <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-6 w-full">
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-lg font-bold tracking-tight text-primary uppercase">Active_Unit</h2>
            <span className="px-2 py-0.5 bg-secondary-container/20 text-secondary text-[10px] font-bold rounded-full">4 ONLINE</span>
          </div>
          <div className="space-y-4">
            {/* Team Member Card */}
            <div className="group relative p-3 rounded-lg hover:bg-surface-container-high transition-all border border-transparent hover:border-primary/20">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img alt="Team Member" className="w-10 h-10 rounded-lg grayscale group-hover:grayscale-0 transition-all border border-outline-variant object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80"/>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-surface"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold font-headline tracking-wide uppercase text-on-surface truncate">Elias.Vance</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">Lead Architect</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setToastMessage('Opened secure direct message channel.')} className="flex-1 py-1.5 bg-surface-container-highest text-[10px] font-bold uppercase tracking-tighter text-primary border border-primary/20 hover:bg-primary/10 transition-colors rounded">Message</button>
                <button onClick={() => setToastMessage('Pinging Elias...')} className="px-2 py-1.5 bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors rounded">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                </button>
              </div>
            </div>
            {/* Team Member Card */}
            <div className="group relative p-3 rounded-lg hover:bg-surface-container-high transition-all border border-transparent hover:border-primary/20">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img alt="Team Member" className="w-10 h-10 rounded-lg grayscale group-hover:grayscale-0 transition-all border border-outline-variant object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=64&h=64&q=80"/>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-surface"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold font-headline tracking-wide uppercase text-on-surface truncate">Sarah.Chen</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">Data Scientist</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setToastMessage('Interactive model shared.')} className="flex-1 py-1.5 bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-tighter rounded">Interact</button>
                <button onClick={() => setToastMessage('Sharing workspace node.')} className="px-2 py-1.5 bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors rounded">
                  <span className="material-symbols-outlined text-sm">share</span>
                </button>
              </div>
            </div>
            {/* Team Member Card */}
            <div className="group relative p-3 rounded-lg hover:bg-surface-container-high transition-all border border-transparent hover:border-primary/20">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img alt="Team Member" className="w-10 h-10 rounded-lg grayscale group-hover:grayscale-0 transition-all border border-outline-variant object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64&q=80"/>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-surface-variant rounded-full border-2 border-surface"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold font-headline tracking-wide uppercase text-on-surface-variant truncate">Marcus.Russo</p>
                  <p className="text-[10px] text-on-surface-variant/50 font-medium italic">Away - 5m</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Context HUD */}
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/10">
          <h3 className="font-headline text-[10px] font-extrabold tracking-[0.2em] text-on-surface-variant uppercase mb-4">Pipeline_Status</h3>
          <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border-l-2 border-secondary mb-3">
            <div className="space-y-1">
              <p className="text-[10px] text-secondary font-bold uppercase">Exporting Simulation</p>
              <p className="text-[8px] text-on-surface-variant">V-Ray 6.2 Render Engine</p>
            </div>
            <span className="text-xs font-headline font-bold text-secondary">84%</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
            <div className="bg-secondary h-full w-[84%]"></div>
          </div>
        </div>

        {/* HUD Floating Overlay Element (Decorative but functional aesthetic) */}
        <div className="p-4 glass-panel border border-primary/20 rounded-lg opacity-50 hidden xl:block mt-auto">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-primary uppercase">Latency</p>
              <p className="text-xs font-headline font-bold">14ms</p>
            </div>
            <div className="w-px h-8 bg-outline-variant/20"></div>
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-secondary uppercase">Bitrate</p>
              <p className="text-xs font-headline font-bold">450Mbps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Active Chat Thread (The Kinetic Observatory Viewport) */}
      <div className="col-span-12 lg:col-span-8 xl:col-span-9 h-[calc(100vh-120px)] flex flex-col w-full">
        <div className="glass-panel flex-1 rounded-xl overflow-hidden flex flex-col border border-outline-variant/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          {/* Thread Header */}
          <div className="px-8 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/50">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">forum</span>
              </div>
              <div>
                <h1 className="font-headline text-lg font-bold tracking-tight text-on-surface uppercase">Studio_Broadcast_v4</h1>
                <p className="text-[10px] text-on-surface-variant tracking-wider">COLLABORATION_STREAM // PROJECT_ALPHA</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full border border-surface bg-surface-container-highest overflow-hidden">
                  <img alt="Avatar" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80"/>
                </div>
                <div className="w-6 h-6 rounded-full border border-surface bg-surface-container-highest flex items-center justify-center text-[8px] font-bold text-primary">+2</div>
              </div>
              <button className="p-2 hover:bg-surface-container-highest transition-colors rounded-lg">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">more_vert</span>
              </button>
            </div>
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar">
            {/* Message: Recipient */}
            <div className="flex items-start gap-4 max-w-[80%]">
              <img alt="Avatar" className="w-8 h-8 rounded border border-outline-variant mt-1 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80"/>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold font-headline text-primary uppercase">Elias.Vance</span>
                  <span className="text-[8px] text-on-surface-variant font-medium">14:22:04</span>
                </div>
                <div className="bg-surface-container p-4 rounded-xl rounded-tl-none border border-outline-variant/10">
                  <p className="text-sm text-on-surface leading-relaxed">The lighting vectors on the central monolith seem to be clipping through the volumetric fog. Can we check the global illumination pass? <span className="text-secondary font-mono">#GI_DEBUG</span></p>
                </div>
              </div>
            </div>

            {/* Message: Attachment/Data Point */}
            <div className="flex items-start gap-4 max-w-[85%] ml-12">
              <div className="bg-surface-container-highest p-4 rounded-xl border border-primary/20 w-full lg:w-96">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">image</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase text-on-surface">Vector_Clipping_Ref.exr</p>
                    <p className="text-[8px] text-on-surface-variant uppercase">42.4 MB // RAW_DATA</p>
                  </div>
                  <button onClick={() => setToastMessage('Downloading Vector_Clipping_Ref.exr...')} className="p-2 bg-primary/10 rounded-lg text-primary hover:bg-primary/20 transition-all">
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                </div>
                <div className="w-full h-24 rounded bg-surface-container-lowest overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-secondary/20 opacity-60 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary/30 text-4xl">broken_image</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message: Sender (Me) */}
            <div className="flex flex-row-reverse items-start gap-4 max-w-[80%] ml-auto text-right">
              <div className="w-8 h-8 rounded border border-primary/50 bg-primary/10 flex items-center justify-center mt-1">
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-end gap-3">
                  <span className="text-[8px] text-on-surface-variant font-medium">14:24:58</span>
                  <span className="text-[10px] font-bold font-headline text-secondary uppercase">Me</span>
                </div>
                <div className="bg-primary/10 p-4 rounded-xl rounded-tr-none border border-primary/30">
                  <p className="text-sm text-on-surface leading-relaxed text-left">On it. I'll adjust the bias on the voxel grid. Rendering the new frame now. Should be ready in 120 cycles.</p>
                </div>
                <div className="flex justify-end gap-1">
                  <span className="material-symbols-outlined text-xs text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-[8px] text-primary uppercase font-bold tracking-tighter">System_Confirmed</span>
                </div>
              </div>
            </div>

            {/* Message: Recipient 2 */}
            <div className="flex items-start gap-4 max-w-[80%]">
              <img alt="Avatar" className="w-8 h-8 rounded border border-outline-variant mt-1 object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=64&h=64&q=80"/>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold font-headline text-primary uppercase">Sarah.Chen</span>
                  <span className="text-[8px] text-on-surface-variant font-medium">14:26:12</span>
                </div>
                <div className="bg-surface-container p-4 rounded-xl rounded-tl-none border border-outline-variant/10">
                  <p className="text-sm text-on-surface leading-relaxed italic text-on-surface-variant">Typing simulation parameters...</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Input Section */}
          <div className="p-6 bg-surface-container-low border-t border-outline-variant/20 mt-auto">
            <div className="flex items-center gap-4 bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-2 px-4 focus-within:border-primary/50 transition-all">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
              <input 
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-headline tracking-wide placeholder:text-on-surface-variant/40 uppercase outline-none" 
                placeholder="TRANSMIT MESSAGE TO BROADCAST..." 
                type="text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setToastMessage('Message broadcasted to Studio Thread');
                    e.currentTarget.value = '';
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <button className="p-2 text-on-surface-variant hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined">mood</span>
                </button>
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <div className="w-px h-6 bg-outline-variant/30 mx-2"></div>
                <button 
                  onClick={() => setToastMessage('Message broadcasted to Studio Thread')} 
                  className="bg-primary-container text-on-primary-container px-5 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                  Send
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>
            <div className="mt-3 flex gap-4 px-2">
              <p className="text-[9px] text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px]">terminal</span>
                CTRL + ENTER TO TRANSMIT
              </p>
              <p className="text-[9px] text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px]">lock</span>
                ENCRYPTED_STREAM_V3
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
