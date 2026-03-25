import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const CollaborateView: React.FC = () => {
  const navigate = useNavigate();
  const [chatMessage, setChatMessage] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const { setToastMessage } = useAppStore();

  const handleSendComment = () => {
    if (!chatMessage.trim()) return;
    setToastMessage(`Node Annotation saved: "${chatMessage}"`);
    setChatMessage('');
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setToastMessage(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  return (
    <div className="h-full p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar bg-background">
      {/* Header Section */}
      <header className="flex flex-col gap-2">
        <span className="text-primary font-label text-[10px] uppercase tracking-[0.3em]">Project Workspace</span>
        <div className="flex justify-between items-end">
          <h1 className="font-headline text-4xl font-bold text-on-surface tracking-tight">Collaboration & Export</h1>
          <div className="flex gap-4">
            <div className="flex -space-x-3">
              <img alt="Team member" className="w-10 h-10 rounded-full border-2 border-background grayscale hover:grayscale-0 transition-all object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80" />
              <img alt="Team member" className="w-10 h-10 rounded-full border-2 border-background grayscale hover:grayscale-0 transition-all object-cover" src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=64&h=64&q=80" />
              <img alt="Team member" className="w-10 h-10 rounded-full border-2 border-background grayscale hover:grayscale-0 transition-all object-cover" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=64&h=64&q=80" />
              <div className="w-10 h-10 rounded-full border-2 border-background bg-surface-container-high flex items-center justify-center text-xs font-bold text-primary">+2</div>
            </div>
            <button onClick={() => setToastMessage('Link copied to clipboard!')} className="bg-surface-container-highest border border-outline-variant/30 px-6 py-2 flex items-center gap-2 hover:bg-surface-bright transition-all rounded">
              <span className="material-symbols-outlined text-sm">person_add</span>
              <span className="font-label text-xs uppercase tracking-widest text-on-surface">Share Project</span>
            </button>
          </div>
        </div>
      </header>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Team & Access Management (Left Column) */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline text-lg font-medium text-on-surface tracking-tight">Team Members</h2>
              <span className="text-[10px] font-label text-secondary bg-secondary/10 px-2 py-1 rounded">5 ACTIVE</span>
            </div>
            <div className="space-y-4 flex-1">
              {/* Member Row */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/40 hover:bg-surface-container-high transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img alt="Sarah Chen" className="w-10 h-10 rounded-full grayscale group-hover:grayscale-0 transition-all object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-background rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">Sarah Chen</p>
                    <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest">Lead Architect</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-label text-primary/80 uppercase tracking-tighter">Owner</span>
                  <button onClick={() => navigate('/messaging')} className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] uppercase font-bold hover:bg-primary/20 transition-colors">Message</button>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer">more_vert</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/40 hover:bg-surface-container-high transition-colors group">
                <div className="flex items-center gap-3">
                  <img alt="Marcus Voe" className="w-10 h-10 rounded-full grayscale group-hover:grayscale-0 transition-all object-cover" src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=64&h=64&q=80" />
                  <div>
                    <p className="text-sm font-medium text-on-surface">Marcus Voe</p>
                    <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest">3D Specialist</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select className="bg-transparent border-none text-[10px] font-label text-on-surface-variant uppercase tracking-tighter focus:ring-0 cursor-pointer outline-none">
                    <option className="bg-surface-container">Editor</option>
                    <option className="bg-surface-container">Viewer</option>
                  </select>
                  <button onClick={() => navigate('/messaging')} className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] uppercase font-bold hover:bg-primary/20 transition-colors">Message</button>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer">more_vert</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/40 hover:bg-surface-container-high transition-colors group">
                <div className="flex items-center gap-3">
                  <img alt="Elena Rodriguez" className="w-10 h-10 rounded-full grayscale group-hover:grayscale-0 transition-all object-cover" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=64&h=64&q=80" />
                  <div>
                    <p className="text-sm font-medium text-on-surface">Elena Rodriguez</p>
                    <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest">Data Analyst</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select className="bg-transparent border-none text-[10px] font-label text-on-surface-variant uppercase tracking-tighter focus:ring-0 cursor-pointer outline-none" defaultValue="Viewer">
                    <option className="bg-surface-container">Editor</option>
                    <option className="bg-surface-container">Viewer</option>
                  </select>
                  <button onClick={() => navigate('/messaging')} className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] uppercase font-bold hover:bg-primary/20 transition-colors">Message</button>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer">more_vert</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-outline-variant/10">
              <h3 className="font-headline text-xs font-bold text-on-surface uppercase tracking-widest mb-4">Quick Invites</h3>
              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded px-4 py-2 text-xs focus:border-primary/50 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50" 
                  placeholder="email@agency.com" 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                />
                <button onClick={handleInvite} className="bg-primary-container text-on-primary-container p-2 rounded hover:brightness-110 transition-all">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Comments & Annotations (Middle Column) */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 flex-1 flex flex-col overflow-hidden max-h-[800px]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="font-headline text-lg font-medium text-on-surface tracking-tight">Node Discussions</h2>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                <span className="font-label uppercase tracking-tighter">Newest First</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
              {/* Comment Thread 1 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img alt="Alex" className="w-8 h-8 rounded-full object-cover grayscale" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-primary">Alex Hunt</span>
                      <span className="text-[10px] text-on-surface-variant font-label tracking-widest">14:02 PM</span>
                    </div>
                    <div className="bg-surface-container rounded-lg p-3 text-sm text-on-surface border-l-2 border-primary/30">
                      <div className="flex items-center gap-2 mb-2 text-[10px] font-label text-secondary bg-secondary-container/20 w-fit px-2 py-0.5 rounded uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        GEOMETRY_NODE_04
                      </div>
                      The vertex displacement on this node seems too aggressive for the dataset. Can we scale back the noise frequency?
                    </div>
                  </div>
                </div>
                {/* Reply */}
                <div className="ml-11 flex items-start gap-3 border-l border-outline-variant/30 pl-4">
                  <img alt="Marcus" className="w-6 h-6 rounded-full object-cover grayscale" src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=64&h=64&q=80" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-on-surface">Marcus Voe</span>
                      <span className="text-[10px] text-on-surface-variant font-label tracking-widest">14:15 PM</span>
                    </div>
                    <div className="text-xs text-on-surface-variant italic">
                      Adjusted noise multiplier to 0.45. Let me know if that works for the visualization density.
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment Thread 2 */}
              <div className="flex items-start gap-3 opacity-80 hover:opacity-100 transition-opacity">
                <img alt="Sarah" className="w-8 h-8 rounded-full object-cover grayscale" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-primary">Sarah Chen</span>
                    <span className="text-[10px] text-on-surface-variant font-label tracking-widest">Yesterday</span>
                  </div>
                  <div className="bg-surface-container rounded-lg p-3 text-sm text-on-surface border-l-2 border-tertiary/30">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-label text-tertiary bg-tertiary-container/10 w-fit px-2 py-0.5 rounded uppercase tracking-widest">
                      <span className="material-symbols-outlined text-[12px]">palette</span>
                      GLOBAL_ENVIRONMENT
                    </div>
                    Love the bloom effect here, but check the contrast ratio for the secondary labels in dark environments.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 shrink-0">
              <div className="relative">
                <textarea 
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 text-sm focus:border-primary/50 text-on-surface outline-none transition-all resize-none h-20 pr-24 custom-scrollbar placeholder:text-on-surface-variant/50" 
                  placeholder="Write a comment..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                ></textarea>
                <div className="absolute right-3 bottom-4 flex gap-3">
                  <span onClick={() => setToastMessage('Attachment explorer opened.')} className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors text-xl">attach_file</span>
                  <span onClick={handleSendComment} className={`material-symbols-outlined cursor-pointer transition-colors text-xl ${chatMessage.trim() ? 'text-primary' : 'text-on-surface-variant'}`}>send</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Export Options (Right Column) */}
        <section className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 h-full flex flex-col">
            <h2 className="font-headline text-lg font-medium text-on-surface tracking-tight mb-6">Export Options</h2>
            <div className="flex-1 space-y-3">
              {/* Export Type: PNG */}
              <div onClick={() => setToastMessage('Initiating High-Res WebGL Frame Capture...')} className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/10 hover:border-primary/40 transition-all group cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-widest">High-Res Render</span>
                  <span className="text-[10px] font-label text-primary bg-primary-container/10 px-2 rounded">PNG / JPG</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-4">4K resolution with alpha transparency support.</p>
                <button className="w-full py-2 bg-surface-bright rounded text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all text-on-surface">Generate Image</button>
              </div>

              {/* Export Type: Vector */}
              <div onClick={() => setToastMessage('Extracting ThreeJS paths to SVG...')} className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/10 hover:border-secondary/40 transition-all group cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-widest">Vector Paths</span>
                  <span className="text-[10px] font-label text-secondary bg-secondary-container/20 px-2 rounded">SVG / PDF</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-4">Infinite scalability for print and presentation.</p>
                <button className="w-full py-2 bg-surface-bright rounded text-[10px] font-bold uppercase tracking-widest hover:bg-secondary hover:text-on-secondary transition-all text-on-surface">Export Vector</button>
              </div>

              {/* Export Type: 3D Model */}
              <div onClick={() => setToastMessage('Processing active scene to GLTF blob...')} className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/10 hover:border-tertiary/40 transition-all group cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-widest">3D Asset</span>
                  <span className="text-[10px] font-label text-tertiary bg-tertiary-container/10 px-2 rounded">GLTF / OBJ</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-4">Compressed binary format for web engines.</p>
                <button className="w-full py-2 bg-surface-bright rounded text-[10px] font-bold uppercase tracking-widest hover:bg-tertiary hover:text-on-tertiary transition-all text-on-surface">Package 3D</button>
              </div>

              {/* Export Type: Embed */}
              <div onClick={() => setToastMessage('<iframe> node copied to clipboard!')} className="p-4 rounded-lg bg-primary-container/10 border border-primary-container/30 hover:bg-primary-container/20 transition-all group cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-primary-container uppercase tracking-widest">Web Embed</span>
                  <span className="text-[10px] font-label text-primary bg-primary/20 px-2 rounded">iFrame</span>
                </div>
                <p className="text-[10px] text-primary/60 mb-4">Interactive viewer for browsers and apps.</p>
                <button className="w-full py-2 bg-primary-container text-on-primary-container rounded text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">code</span>
                  Copy Embed Script
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-sm text-primary">cloud_done</span>
                  <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-tighter">Auto-Sync Enabled</span>
                </div>
                <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-primary shadow-[0_0_8px_#c3f5ff]"></div>
                </div>
                <p className="text-[9px] text-on-surface-variant mt-2 text-right">8.2 GB of 10 GB Used</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Asymmetric Bottom Detail Section */}
      <section className="grid grid-cols-12 gap-6 pb-24">
        <div className="col-span-12 lg:col-span-8 glass-panel p-6 rounded-xl border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-all"></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-32 h-32 flex-shrink-0 bg-surface-container-high rounded border border-outline-variant/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700 bg-gradient-to-br from-primary/20 to-secondary-container/20 mix-blend-screen"></div>
              <span className="material-symbols-outlined text-primary text-4xl opacity-50">visibility</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="font-headline text-lg font-medium text-on-surface mb-2">Live Node Performance</h4>
              <p className="text-sm text-on-surface-variant max-w-xl mb-4 leading-relaxed">
                Node 'GEOMETRY_DISPLACER' is currently under heavy load. Collaboration may experience slight latency in viewport updates. Optimization recommended before final export.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">FPS</span>
                  <span className="font-headline text-2xl text-primary font-bold">58.2</span>
                </div>
                <div className="flex flex-col border-l border-outline-variant/30 pl-6">
                  <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">VRAM</span>
                  <span className="font-headline text-2xl text-secondary font-bold">4.2 GB</span>
                </div>
                <div className="flex flex-col border-l border-outline-variant/30 pl-6">
                  <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Active Nodes</span>
                  <span className="font-headline text-2xl text-tertiary font-bold">1,248</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 glass-panel p-6 rounded-xl border border-outline-variant/10 flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-secondary">auto_awesome</span>
          </div>
          <h4 className="font-headline text-md font-medium text-on-surface mb-2">Generate AI Summaries</h4>
          <p className="text-xs text-on-surface-variant mb-4 max-w-xs">Use KinOS Intelligence to summarize all recent team discussions into a project status report.</p>
          <button onClick={() => setToastMessage('Extracting discussion logs for Gemini AI summary...')} className="px-6 py-2 border border-secondary/30 text-secondary text-[10px] font-bold uppercase tracking-widest hover:bg-secondary/10 transition-all rounded">
            Initialize AI
          </button>
        </div>
      </section>

      {/* Floating Action Button for Collaboration Tools (HUD Style) */}
      <div className="absolute right-8 bottom-8 z-50 flex flex-col items-end gap-3 pr-2 pb-2">
        <div className="group relative flex items-center">
          <span className="mr-4 px-3 py-1 bg-surface-bright text-[10px] font-label text-on-surface rounded opacity-0 group-hover:opacity-100 transition-opacity border border-outline-variant/20 tracking-widest">NEW COMMENT</span>
          <button className="w-12 h-12 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-on-surface hover:border-primary hover:text-primary transition-all shadow-xl">
            <span className="material-symbols-outlined">add_comment</span>
          </button>
        </div>
        <button className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-105 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-3xl font-bold pl-1 pt-1" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
        </button>
      </div>
    </div>
  );
};
