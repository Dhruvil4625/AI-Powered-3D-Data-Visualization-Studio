import React, { useState, useRef, useEffect } from 'react';
import { Scene } from '../Scene';
import { useAppStore } from '../../store/useAppStore';

export const Editor3DView: React.FC = () => {
  const { chatHistory, addChatMessage, isAiThinking, setIsAiThinking, setChartConfig, visualConfig, setVisualConfig, data, setToastMessage } = useAppStore();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(10800);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setCurrentTime(t => Math.min(t + 1, duration)), 1000);
    return () => clearInterval(id);
  }, [isPlaying, duration]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleExport = () => {
    if (!data) return setToastMessage("No topography mapped yet. Run an analysis first.");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kinetic_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isAiThinking]);

  const handleSendMessage = (e?: React.FormEvent, overrideMsg?: string) => {
    e?.preventDefault();
    const msg = overrideMsg || inputMessage;
    if (!msg.trim() || isAiThinking) return;

    addChatMessage({ role: 'user', content: msg });
    if (!overrideMsg) setInputMessage('');
    setIsAiThinking(true);

    // Mock AI Response Loop
    setTimeout(() => {
      const lowerInput = msg.toLowerCase();
      let responseContent = "I've updated the visualization based on your request. Let me know if you need to adjust anything else.";
      
      if (lowerInput.includes('bar')) {
        setChartConfig({ type: 'bar' });
        responseContent = "I've switched the visualization to a 3D bar chart layout.";
      } else if (lowerInput.includes('scatter')) {
        setChartConfig({ type: 'scatter' });
        responseContent = "I've reverted to the volumetric scatter plot.";
      } else if (lowerInput.includes('heatmap')) {
        setChartConfig({ type: 'scatter' });
        setVisualConfig({ primaryColor: '#ff3300', secondaryColor: '#ffaa00', nodeOpacity: 0.9 });
        responseContent = "I've applied a heatmap gradient to the projection nodes. Dense clusters are now highly visible.";
      } else if (lowerInput.includes('density') || lowerInput.includes('animate')) {
        setChartConfig({ type: 'scatter' });
        setVisualConfig({ cameraMode: 'topDown', pointScale: 1.5 });
        responseContent = "Animating flow density from a top-down perspective to reveal topological pathing.";
      } else if (lowerInput.includes('outlier')) {
        setChartConfig({ type: 'scatter' });
        responseContent = "Topology scanned. The nodes glowing red indicate statistical outliers isolated by the Django Python engine.";
      } else if (lowerInput.includes('clear') || lowerInput.includes('none')) {
        setChartConfig({ type: 'none' });
        responseContent = "I've cleared the complex charts from the scene. Only the base environment remains.";
      }

      setIsAiThinking(false);
      addChatMessage({ role: 'assistant', content: responseContent });
    }, 1500);
  };

  return (
    <div className="flex-1 relative bg-surface-container-lowest overflow-hidden h-full flex">
      <div className="flex-1 relative">
        {/* 3D Viewport Simulation */}
        <div className="absolute inset-0 z-0 bg-background">
          <Scene showGrid={showGrid} showAxes={showAxes} autoRotate={autoRotate} />
          {/* Overlay Gradient for Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#10141a_100%)] opacity-40 pointer-events-none"></div>
        </div>

        {/* HUD Elements */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 pointer-events-none">
          <div className="glass-panel px-4 py-2 rounded-lg border border-primary/10">
            <span className="text-[10px] uppercase tracking-widest text-primary/60 block mb-1">Active View</span>
            <h2 className="font-headline text-lg font-bold text-on-surface">Neural Topology Cluster B-4</h2>
          </div>
          <div className="flex gap-2">
            <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/5">
              <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#00e5ff]"></span>
              <span className="text-[10px] font-bold tracking-widest uppercase">Live Stream</span>
            </div>
            <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/5">
              <span className="text-[10px] text-on-surface/60 font-medium">Nodes: 142,059</span>
            </div>
          </div>
        </div>

        {/* Viewport Controls (Bottom Left) */}
        <div className="absolute bottom-32 left-6 z-10 flex gap-1">
          <button onClick={() => { setAutoRotate(v => !v); setToastMessage(`Auto-rotate ${!autoRotate ? 'Enabled' : 'Disabled'}`); }} className="w-10 h-10 glass-panel border border-primary/5 rounded flex items-center justify-center hover:bg-primary/20 transition-all pointer-events-auto">
            <span className="material-symbols-outlined text-primary text-[20px]">videocam</span>
          </button>
          <button onClick={() => { setShowGrid(v => !v); setToastMessage(`Grid ${!showGrid ? 'Shown' : 'Hidden'}`); }} className="w-10 h-10 glass-panel border border-primary/5 rounded flex items-center justify-center hover:bg-primary/20 transition-all pointer-events-auto">
            <span className="material-symbols-outlined text-primary text-[20px]">grid_on</span>
          </button>
          <button onClick={() => { setShowAxes(v => !v); setToastMessage(`Axes ${!showAxes ? 'Shown' : 'Hidden'}`); }} className="w-10 h-10 glass-panel border border-primary/5 rounded flex items-center justify-center hover:bg-primary/20 transition-all pointer-events-auto">
            <span className="material-symbols-outlined text-primary text-[20px]">layers</span>
          </button>
        </div>

        {/* Bottom Timeline */}
        <section className="absolute bottom-0 left-0 right-0 h-24 glass-panel border-t border-[#353940]/40 px-8 py-4 z-20 pointer-events-auto flex flex-col justify-center bg-[#10141a]/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentTime(t => Math.max(t - 60, 0))} className="text-primary hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">skip_previous</span>
              </button>
              <button onClick={() => setIsPlaying(p => !p)} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
              </button>
              <button onClick={() => setCurrentTime(t => Math.min(t + 60, duration))} className="text-primary hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">skip_next</span>
              </button>
              <span className="font-mono text-xs text-primary/60 ml-4">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[10px] uppercase tracking-widest text-on-surface/40">Loop: Enabled</span>
              <span className="text-[10px] uppercase tracking-widest text-on-surface/40">Speed: 1.0x</span>
            </div>
          </div>
          <div className="relative w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-secondary-container" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
            <div className="absolute left-[42%] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] cursor-pointer hover:scale-125 transition-transform"></div>
            {/* Markers */}
            <div className="absolute left-[20%] top-0 h-full w-px bg-white/20"></div>
            <div className="absolute left-[60%] top-0 h-full w-px bg-white/20"></div>
            <div className="absolute left-[85%] top-0 h-full w-px bg-white/20"></div>
          </div>
        </section>
      </div>

      {/* Right Sidebar: Editor Controls & Chat */}
      <aside className="w-80 h-full bg-surface-container-low border-l border-[#353940]/20 flex flex-col z-30 shrink-0">
        
        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 min-h-[250px] border-b border-[#353940]/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-[18px]">forum</span>
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Kinetic Assistant</h4>
          </div>
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-lg text-[11px] leading-relaxed max-w-[90%] break-words ${
                 msg.role === 'user'
                 ? 'bg-surface-bright border border-outline-variant/30 text-on-surface rounded-tr-sm'
                 : 'bg-primary/5 border border-primary/20 text-on-surface rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isAiThinking && (
            <div className="flex flex-col items-start">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm max-w-[90%] rounded-tl-sm flex gap-2 w-16">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{animationDelay: '0.4s'}}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-b border-[#353940]/20 bg-[#10141a]/50">
          <form onSubmit={handleSendMessage} className="relative">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Suggest rendering tweaks..."
              className="w-full bg-[#353940] border border-[#353940] focus:border-primary/50 rounded flex-1 py-3 pl-3 pr-10 text-xs text-[#dfe2eb] placeholder-[#dfe2eb]/40 focus:outline-none transition-colors"
              disabled={isAiThinking}
            />
            <button 
              type="submit" 
              disabled={isAiThinking || !inputMessage.trim()}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 text-primary rounded flex items-center justify-center hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
        </div>

        {/* Style Controls Section */}
        <div className="p-6 overflow-y-auto no-scrollbar max-h-[40vh]">
          {/* AI Suggestions Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Quick Actions</h4>
            </div>
            <div className="space-y-3">
              <button 
                className="w-full p-4 rounded-lg bg-secondary-container/10 border border-secondary/20 hover:bg-secondary-container/20 transition-all text-left group"
                onClick={() => handleSendMessage(undefined, "Switch to 3D Heatmap")}
              >
                <p className="text-[11px] text-secondary font-bold mb-1">Switch to 3D Heatmap</p>
                <p className="text-[10px] text-on-surface/60 leading-relaxed">Detecting dense node clusters. A heatmap may reveal hidden architectural patterns.</p>
                <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold text-secondary">Apply Suggestion →</span>
                </div>
              </button>
              <button 
                className="w-full p-4 rounded-lg glass-panel border border-primary/10 hover:border-primary/30 transition-all text-left group"
                onClick={() => handleSendMessage(undefined, "Animate Flow Density")}
              >
                <p className="text-[11px] text-primary font-bold mb-1">Animate Flow Density</p>
                <p className="text-[10px] text-on-surface/60 leading-relaxed">Visualizing the pathing between nodes using kinetic light trails.</p>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-6">Visual Style</h4>
            {/* Color Control */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center relative">
                <label className="text-[11px] text-on-surface/80">Primary Node Color</label>
                <input 
                  type="color" 
                  value={visualConfig.primaryColor}
                  onChange={(e) => setVisualConfig({ primaryColor: e.target.value })}
                  className="w-12 h-6 p-0 border-0 rounded cursor-pointer absolute right-0 opacity-0" 
                />
                <div className="w-12 h-5 rounded border border-outline-variant pointer-events-none" style={{ backgroundColor: visualConfig.primaryColor }}></div>
              </div>
              <div className="flex justify-between items-center relative">
                <label className="text-[11px] text-on-surface/80">Secondary Accent</label>
                <input 
                  type="color" 
                  value={visualConfig.secondaryColor}
                  onChange={(e) => setVisualConfig({ secondaryColor: e.target.value })}
                  className="w-12 h-6 p-0 border-0 rounded cursor-pointer absolute right-0 opacity-0" 
                />
                <div className="w-12 h-5 rounded border border-outline-variant pointer-events-none" style={{ backgroundColor: visualConfig.secondaryColor }}></div>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-on-surface/60 uppercase">Node Opacity</span>
                  <span className="text-primary">{Math.round(visualConfig.nodeOpacity * 100)}%</span>
                </div>
                <input 
                  type="range" min="0.1" max="1" step="0.05" 
                  value={visualConfig.nodeOpacity} 
                  onChange={(e) => setVisualConfig({ nodeOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer" 
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-on-surface/60 uppercase">Point Scale</span>
                  <span className="text-primary">{visualConfig.pointScale}x</span>
                </div>
                <input 
                  type="range" min="0.1" max="5" step="0.1" 
                  value={visualConfig.pointScale} 
                  onChange={(e) => setVisualConfig({ pointScale: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer" 
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-on-surface/60 uppercase">Edge Thickness</span>
                  <span className="text-primary">{visualConfig.edgeThickness}px</span>
                </div>
                <input 
                  type="range" min="0.01" max="0.2" step="0.01" 
                  value={visualConfig.edgeThickness} 
                  onChange={(e) => setVisualConfig({ edgeThickness: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer" 
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-6">Camera Settings</h4>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setVisualConfig({ cameraMode: 'orbit' })} className={`px-3 py-2 text-[10px] font-bold uppercase rounded transition-all ${visualConfig.cameraMode === 'orbit' ? 'bg-primary-container text-on-primary-container border border-primary' : 'bg-surface-container-high text-on-surface/80 border border-outline-variant hover:bg-surface-bright'}`}>Orbit</button>
              <button onClick={() => setVisualConfig({ cameraMode: 'firstPerson' })} className={`px-3 py-2 text-[10px] font-bold uppercase rounded transition-all ${visualConfig.cameraMode === 'firstPerson' ? 'bg-primary-container text-on-primary-container border border-primary' : 'bg-surface-container-high text-on-surface/80 border border-outline-variant hover:bg-surface-bright'}`}>First Person</button>
              <button onClick={() => setVisualConfig({ cameraMode: 'axonometric' })} className={`px-3 py-2 text-[10px] font-bold uppercase rounded transition-all ${visualConfig.cameraMode === 'axonometric' ? 'bg-primary-container text-on-primary-container border border-primary' : 'bg-surface-container-high text-on-surface/80 border border-outline-variant hover:bg-surface-bright'}`}>Axonometric</button>
              <button onClick={() => setVisualConfig({ cameraMode: 'topDown' })} className={`px-3 py-2 text-[10px] font-bold uppercase rounded transition-all ${visualConfig.cameraMode === 'topDown' ? 'bg-primary-container text-on-primary-container border border-primary' : 'bg-surface-container-high text-on-surface/80 border border-outline-variant hover:bg-surface-bright'}`}>Top Down</button>
            </div>
          </div>

          <div className="mt-8 pt-4">
            <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 py-3 bg-primary-container text-on-primary-container rounded font-headline text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all">
              <span className="material-symbols-outlined text-[16px]">export_notes</span>
              Export Node
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
