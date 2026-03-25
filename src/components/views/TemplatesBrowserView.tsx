import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const TemplatesBrowserView: React.FC = () => {
  const navigate = useNavigate();
  const { setToastMessage } = useAppStore();

  return (
    <div className="flex-1 bg-surface-container-lowest p-6 lg:p-10 overflow-y-auto h-full custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-headline font-bold text-on-surface tracking-tighter mb-2">Templates</h1>
            <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed">
              Deploy pre-configured 3D environments and data pipelines. Switch between architectural frameworks to accelerate your visualization workflow.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setToastMessage('Showing recently used templates')} className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant/30 text-xs font-medium text-on-surface hover:bg-surface-bright transition-colors">Recent</button>
            <button onClick={() => setToastMessage('Opening template marketplace')} className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-xs font-bold hover:opacity-90 transition-colors shadow-[0_0_15px_rgba(0,229,255,0.2)]">Marketplace</button>
          </div>
        </header>

        {/* Filter HUD */}
        <div className="mb-10 flex flex-wrap items-center gap-3 p-1 bg-surface-container-low rounded-xl w-fit border border-outline-variant/10">
          <button className="px-6 py-2 rounded-lg bg-surface-container-highest text-primary text-xs font-bold transition-all shadow-sm">All Templates</button>
          <button className="px-6 py-2 rounded-lg text-on-surface-variant text-xs font-medium hover:text-on-surface hover:bg-surface-bright/50 transition-all">Statistical</button>
          <button className="px-6 py-2 rounded-lg text-on-surface-variant text-xs font-medium hover:text-on-surface hover:bg-surface-bright/50 transition-all">Relational</button>
          <button className="px-6 py-2 rounded-lg text-on-surface-variant text-xs font-medium hover:text-on-surface hover:bg-surface-bright/50 transition-all">Geospatial</button>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {/* Template Card 1 */}
          <div className="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all duration-300">
            <div className="aspect-[16/10] overflow-hidden relative">
              <img alt="Neural Flux" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-80"></div>
              <div className="absolute top-4 left-4 bg-primary/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/30 shadow-sm">Statistical</div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-headline text-xl font-bold text-on-surface">Neural Flux Density</h3>
                <span className="material-symbols-outlined text-on-surface-variant/40 hover:text-secondary cursor-pointer transition-colors">bookmark</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6 flex-1">
                High-frequency stochastic modeling with real-time particle feedback. Optimized for financial market volatility and neural network analysis.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] bg-secondary-container/20 text-secondary-container px-2 py-0.5 rounded border border-secondary-container/30 font-medium tracking-wide">Cuda-Accelerated</span>
                <span className="text-[10px] bg-surface-bright text-on-surface-variant px-2 py-0.5 rounded font-medium tracking-wide">V4 Pipeline</span>
              </div>
              <button onClick={() => { setToastMessage('Deploying template: Neural Flux Density'); navigate('/editor3d'); }} className="w-full py-3 bg-surface-container-highest group-hover:bg-primary-container text-on-surface group-hover:text-on-primary-container font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                Deploy Template
              </button>
            </div>
          </div>

          {/* Template Card 2 */}
          <div className="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all duration-300">
            <div className="aspect-[16/10] overflow-hidden relative">
              <img alt="Orbital Node Mesh" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-80"></div>
              <div className="absolute top-4 left-4 bg-tertiary-container/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-tertiary uppercase tracking-widest border border-tertiary/30 shadow-sm">Geospatial</div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-headline text-xl font-bold text-on-surface">Orbital Node Mesh</h3>
                <span className="material-symbols-outlined text-on-surface-variant/40 hover:text-secondary cursor-pointer transition-colors">bookmark</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6 flex-1">
                Global supply chain visualizer featuring heat-mapped logistics hubs and real-time satellite telemetry integration.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] bg-secondary-container/20 text-secondary-container px-2 py-0.5 rounded border border-secondary-container/30 font-medium tracking-wide">GeoJSON Ready</span>
                <span className="text-[10px] bg-surface-bright text-on-surface-variant px-2 py-0.5 rounded font-medium tracking-wide">Lidar Support</span>
              </div>
              <button onClick={() => { setToastMessage('Deploying template: Orbital Node Mesh'); navigate('/editor3d'); }} className="w-full py-3 bg-surface-container-highest group-hover:bg-primary-container text-on-surface group-hover:text-on-primary-container font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                Deploy Template
              </button>
            </div>
          </div>

          {/* Template Card 3 */}
          <div className="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all duration-300">
            <div className="aspect-[16/10] overflow-hidden relative">
              <img alt="Kinetic Graph" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1544256718-3b61027b4ce2?auto=format&fit=crop&q=80&w=1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-80"></div>
              <div className="absolute top-4 left-4 bg-secondary-container/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-secondary uppercase tracking-widest border border-secondary/30 shadow-sm">Relational</div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-headline text-xl font-bold text-on-surface">Kinetic Graph Theory</h3>
                <span className="material-symbols-outlined text-on-surface-variant/40 hover:text-secondary cursor-pointer transition-colors">bookmark</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6 flex-1">
                Force-directed node clusters for mapping massive social interaction datasets or intricate software architecture dependencies.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] bg-secondary-container/20 text-secondary-container px-2 py-0.5 rounded border border-secondary-container/30 font-medium tracking-wide">Vector-Based</span>
                <span className="text-[10px] bg-surface-bright text-on-surface-variant px-2 py-0.5 rounded font-medium tracking-wide">API-Linked</span>
              </div>
              <button onClick={() => { setToastMessage('Deploying template: Kinetic Graph Theory'); navigate('/editor3d'); }} className="w-full py-3 bg-surface-container-highest group-hover:bg-primary-container text-on-surface group-hover:text-on-primary-container font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                Deploy Template
              </button>
            </div>
          </div>

          {/* Template Card 4 */}
          <div className="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all duration-300">
            <div className="aspect-[16/10] overflow-hidden relative">
              <img alt="Biological Flow" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1558444318-62d2d488582d?auto=format&fit=crop&q=80&w=1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-80"></div>
              <div className="absolute top-4 left-4 bg-primary/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/30 shadow-sm">Statistical</div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-headline text-xl font-bold text-on-surface">Biological Flow Path</h3>
                <span className="material-symbols-outlined text-on-surface-variant/40 hover:text-secondary cursor-pointer transition-colors">bookmark</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6 flex-1">
                Simulates cellular interaction and biochemical signaling pathways with volumetric rendering and interactive flow vectors.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] bg-secondary-container/20 text-secondary-container px-2 py-0.5 rounded border border-secondary-container/30 font-medium tracking-wide">Volumetric</span>
                <span className="text-[10px] bg-surface-bright text-on-surface-variant px-2 py-0.5 rounded font-medium tracking-wide">Bio-Model</span>
              </div>
              <button onClick={() => { setToastMessage('Deploying template: Biological Flow Path'); navigate('/editor3d'); }} className="w-full py-3 bg-surface-container-highest group-hover:bg-primary-container text-on-surface group-hover:text-on-primary-container font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                Deploy Template
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
