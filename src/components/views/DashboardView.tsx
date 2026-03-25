import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { setToastMessage } = useAppStore();
  const [isListView, setIsListView] = useState(false);
  const [nodes, setNodes] = useState([
    { id: 'NODE-992-AX', status: 'OPERATIONAL', statusClass: 'bg-green-500/10 text-green-400 border-green-500/20', uptime: '142h 12m', confidence: 98 },
    { id: 'NODE-410-KL', status: 'SYNCING', statusClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', uptime: '12h 04m', confidence: 45 },
    { id: 'NODE-007-ZZ', status: 'STANDBY', statusClass: 'bg-primary/10 text-primary border-primary/20', uptime: '0h 00m', confidence: 0 }
  ]);
  const [openNodeMenu, setOpenNodeMenu] = useState<number | null>(null);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 space-y-12 pb-24">
      {/* Welcome Hero Section */}
      <section className="relative overflow-hidden rounded-2xl p-10 bg-surface-container-low border border-outline-variant/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/20 text-secondary text-[10px] font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            System Online: 42 Active Nodes
          </div>
          <h1 className="text-5xl font-headline font-bold text-on-surface leading-tight mb-4 tracking-tighter">
            Visualize the <span className="text-primary">Invisible</span>.
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
            Harness the power of AI to transform multi-dimensional data into immersive 3D landscapes. Your latest simulation is ready for review.
          </p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/datastudio')} className="px-6 py-3 bg-primary-container text-on-primary-container font-bold rounded-lg flex items-center gap-2 hover:brightness-110 transition-all">
              Launch Data Studio
              <span className="material-symbols-outlined text-lg">rocket_launch</span>
            </button>
            <button onClick={() => setToastMessage('Analytics engine booting locally...')} className="px-6 py-3 border border-outline-variant text-on-surface font-medium rounded-lg hover:bg-surface-bright transition-all">
              View Analytics
            </button>
          </div>
        </div>
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-primary/20 to-transparent"></div>
          <img 
            alt="3D abstract visualization" 
            className="w-full h-full object-cover mix-blend-screen" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuATI4aAknA5V0_d5QJf-47Aueia8o8aKIYcoj_48vv53QFJODGffj-Lvc1GPts5zZ9qYRZe_lWh0vjI5p_BVqkcIXqLqrf1q1t3NBFZQhVzWX_nhmKbUpJG-YvneTxlSfogzzhqEegcEWhCYjm05KS1TXNW_kkSnYHMMafPQfeAmpYlqEVKmaxmeDSDem5pbD1_xXrhhu_pYeKvPCOHdYEUQx0tKwuJg677sWiYCWTF6OcYEoMCRBNxi1MPTN4v98O6T9mG6nusNA"
          />
        </div>
      </section>

      {/* Quick Start Templates (Bento Grid Style) */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-headline font-bold text-primary tracking-tight">Quick Start Templates</h2>
            <p className="text-on-surface-variant text-sm mt-1">Deploy pre-configured visualization architectures.</p>
          </div>
          <button onClick={() => navigate('/templates')} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            Browse all templates <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Template Card 1 */}
          <div onClick={() => { setToastMessage('Deploying Statistical Block...'); navigate('/editor3d'); }} className="glass-card group p-6 rounded-xl flex flex-col justify-between h-64 cursor-pointer transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-3xl">bubble_chart</span>
              </div>
              <span className="text-[10px] text-outline uppercase tracking-widest">Statistical</span>
            </div>
            <div>
              <h3 className="text-xl font-headline font-bold mb-2">Scatter Plots</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2">High-density 3D cluster mapping for multivariate datasets and outlier detection.</p>
            </div>
            <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between">
              <span className="text-[10px] text-primary font-bold">DEPLOY TEMPLATE</span>
              <span className="material-symbols-outlined text-lg opacity-0 group-hover:opacity-100 transition-all">bolt</span>
            </div>
          </div>
          {/* Template Card 2 */}
          <div onClick={() => { setToastMessage('Deploying Relational Block...'); navigate('/editor3d'); }} className="glass-card group p-6 rounded-xl flex flex-col justify-between h-64 cursor-pointer transition-all hover:-translate-y-1 bg-gradient-to-br from-[#10141a] to-[#1c2026]">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined text-3xl">hub</span>
              </div>
              <span className="text-[10px] text-outline uppercase tracking-widest">Relational</span>
            </div>
            <div>
              <h3 className="text-xl font-headline font-bold mb-2">Network Graphs</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2">Visualize complex interdependencies and neural node architectures in physical space.</p>
            </div>
            <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between">
              <span className="text-[10px] text-secondary font-bold">DEPLOY TEMPLATE</span>
              <span className="material-symbols-outlined text-lg opacity-0 group-hover:opacity-100 transition-all">bolt</span>
            </div>
          </div>
          {/* Template Card 3 */}
          <div onClick={() => { setToastMessage('Deploying Geospatial Block...'); navigate('/editor3d'); }} className="glass-card group p-6 rounded-xl flex flex-col justify-between h-64 cursor-pointer transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-tertiary/10 text-tertiary">
                <span className="material-symbols-outlined text-3xl">map</span>
              </div>
              <span className="text-[10px] text-outline uppercase tracking-widest">Geospatial</span>
            </div>
            <div>
              <h3 className="text-xl font-headline font-bold mb-2">Geographic Maps</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2">Project global data layers onto interactive 3D globes with terrain extrusion.</p>
            </div>
            <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between">
              <span className="text-[10px] text-tertiary font-bold">DEPLOY TEMPLATE</span>
              <span className="material-symbols-outlined text-lg opacity-0 group-hover:opacity-100 transition-all">bolt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Projects Grid */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">Recent Projects</h2>
          <div className="h-px flex-1 bg-outline-variant/20"></div>
          <div className="flex gap-2">
            <button onClick={() => { setIsListView(false); setToastMessage('Switched to grid view'); }} className={`p-2 border border-outline-variant/30 rounded-lg transition-all ${!isListView ? 'bg-primary/10 text-primary' : 'hover:bg-surface-bright'}`}>
              <span className="material-symbols-outlined text-sm">grid_view</span>
            </button>
            <button onClick={() => { setIsListView(true); setToastMessage('Switched to list view'); }} className={`p-2 border border-outline-variant/30 rounded-lg transition-all ${isListView ? 'bg-primary/10 text-primary' : 'hover:bg-surface-bright'}`}>
              <span className="material-symbols-outlined text-sm">list</span>
            </button>
          </div>
        </div>
        <div className={`grid ${isListView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'} gap-6`}>
          {/* Project Item 1 */}
          <div onClick={() => navigate('/editor3d')} className="group relative bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer">
            <div className="aspect-video w-full overflow-hidden">
              <img alt="3D Project Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhG5RRbCxkFSFsX1K4nXcXvmk4wcpD0VRMqSJrwaHLutsX1jHQRy7l117zH_-ThuEp4CVWjWEbhePRzMrx-f67s2JvM5bQ9cFjfqdl5hUjaju-Vf7aCkPROWXluptRIYuDxLcWxxYDMv7tDy1OqLf04TWqOozM7TFOi4RiL6bU_q6QHNQbZSbldvCSBPZZVtg-Qg0cTGzdQb8xgJfMJvK12SLkNVlOvLqMCgcp5Q1Lhf56wBpYWkokWr-Df45s5YF9JdqHnQ4vdw" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest to-transparent opacity-60"></div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-headline font-bold text-on-surface truncate">Neural Stream V2</h4>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">STABLE</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-4">Last edited 2h ago</p>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full border border-background bg-surface-bright flex items-center justify-center overflow-hidden">
                  <img alt="team" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-QfuWm85Zfvw1lOvAbJXqynXul1l0EBUuK7P7dhN4JNAFJiydJzr0IPHluTTkXVkU_RuM_Q7x1fXjThkWf_aCnqZZ-ugTz5fgrmwy_YmOU6tNP3tDQd3V12PqP94isz8KqF-2QtVTUvfVYUhvr4pmNCHH-TBjLCfnbNZ52ieeT_avELsBJ1VOE-gkLmT24yWEuAXtnovvbWhAJvyMyL2oPsXs7mT2P_FTGjBSyuG5UJEQDIxVeLEheHD6zHj9skFiKqeGyQxHTQ" />
                </div>
                <div className="w-6 h-6 rounded-full border border-background bg-surface-bright flex items-center justify-center overflow-hidden text-[8px] font-bold text-on-surface">
                  +3
                </div>
              </div>
            </div>
          </div>
          {/* Project Item 2 */}
          <div onClick={() => navigate('/editor3d')} className="group relative bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/10 hover:border-secondary/30 transition-all cursor-pointer">
            <div className="aspect-video w-full overflow-hidden">
              <img alt="3D Project Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARUbdIbqMuE2A7yxpdKvai_JevwKkyHytKwbftLZH1N8k6brmXPdfxY0HkLK3_Qg6G9MnGXVqmJkxzwPlR9r-KYQlo1ZK_skqveix6Eaa9bedzeUk8y9aLCJ-9WTOpO1eF37pgwlrWDAeVmQpS7AadKdr3d3xDF6_STPClRgfQXjxAQXm2_9e1OShJI6-TN2wAf8uKToJMTb8tAcmctfwC5W01lZUUo2ahOYpOxxNyEM4oUXqm83-wOVico_HkpW_KNOWu_5kmTg" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest to-transparent opacity-60"></div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-headline font-bold text-on-surface truncate">Global Logistics 3D</h4>
                <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[9px] font-bold">RENDERING</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-4">Last edited 5h ago</p>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full border border-background bg-surface-bright flex items-center justify-center overflow-hidden">
                  <img alt="team" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXlrCwyySCjON8AT1sKvQAGlMX1ZdOTk3iIvot62yYWRr9pTHRK_KxM7sjmikNLLpHDsEHgKVIOx4IQ2H1zlpu57R-gWXbLhSWp8z0psf7v3d1UF57gxs8NXug2gIBrq8qt9qYX7QAfSUksQV8vOTCF_ue5Pq7F8G6mqR6KiRDR4_v5LkOzl82sJ0lAVzcdt-pL47N5r62nIj1fhG7bORBYxH51bzgDtwdO43M6PhPlNE6gNIaj3DDwAjOuKDzlkkLS5oa_WGgqQ" />
                </div>
              </div>
            </div>
          </div>
          {/* Project Item 3 */}
          <div onClick={() => navigate('/editor3d')} className="group relative bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/10 hover:border-tertiary/30 transition-all cursor-pointer">
            <div className="aspect-video w-full overflow-hidden">
              <img alt="3D Project Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8y0mzqQkcuAcSunZAPi7BN-gbJ1Z88a6IboqfVONe8SNQns4WcfrCRi8COSplDhXKmPDdcjfML1nqS4qYATVcj5q3tHf2FJKJfh7z7QPih8NHMASzFnaQe9IxmpH9MUEHjKNMGKnuUbjJklk1kJKJ2e_P5qLqFYtrUmtyZermHBTyO6A-h-XKC9KeNi0isDu1d7QitJrREDLW4G3JJYnbec0zV6qTaoXDLeR9kAhDSC-j2SIadA6fQYQDmwCF_9Eo5Arv7uO_gw" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest to-transparent opacity-60"></div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-headline font-bold text-on-surface truncate">Quantum Bit Map</h4>
                <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-[9px] font-bold">DRAFT</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-4">Last edited yesterday</p>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full border border-background bg-surface-bright flex items-center justify-center overflow-hidden text-[8px] font-bold text-on-surface">
                  JD
                </div>
              </div>
            </div>
          </div>
          {/* Project Item 4 - Empty State / Create New */}
          <div onClick={() => navigate('/datastudio')} className="group relative bg-transparent rounded-xl border-2 border-dashed border-outline-variant/30 hover:border-primary/50 transition-all flex flex-col items-center justify-center min-h-[220px] cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">add</span>
            </div>
            <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface">New Experiment</span>
          </div>
        </div>
      </section>

      {/* Data Density Table Section */}
      <section className="glass-panel rounded-xl border border-outline-variant/10 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
          <h3 className="font-headline font-bold text-lg">System Health & Live Feeds</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Compute: 84%
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              Memory: 4.2TB
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label uppercase tracking-widest border-b border-outline-variant/5">
                <th className="px-6 py-4 font-semibold">Instance ID</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Uptime</th>
                <th className="px-6 py-4 font-semibold">AI Confidence</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {nodes.map((n, idx) => (
                <tr key={idx} className="hover:bg-surface-bright/50 transition-all">
                  <td className="px-6 py-4 font-mono text-primary">{n.id}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded border ${n.statusClass} text-[10px]`}>{n.status}</span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{n.uptime}</td>
                  <td className="px-6 py-4">
                    <div className="w-24 h-1 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${n.confidence}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 relative">
                    <button onClick={() => setOpenNodeMenu(openNodeMenu === idx ? null : idx)} className="material-symbols-outlined text-outline hover:text-primary transition-colors">more_vert</button>
                    {openNodeMenu === idx && (
                      <div className="absolute right-6 top-8 bg-surface-container-highest border border-outline-variant/20 rounded-lg shadow-xl z-20 w-40">
                        <button onClick={() => { const newId = window.prompt('Rename instance', n.id) || n.id; setNodes(prev => prev.map((it, i) => i === idx ? { ...it, id: newId } : it)); setOpenNodeMenu(null); setToastMessage('Instance renamed'); }} className="w-full text-left px-3 py-2 hover:bg-surface-bright text-sm">Rename</button>
                        <button onClick={() => { setNodes(prev => { const copy = { ...n, id: `${n.id}-COPY` }; return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]; }); setOpenNodeMenu(null); setToastMessage('Instance duplicated'); }} className="w-full text-left px-3 py-2 hover:bg-surface-bright text-sm">Duplicate</button>
                        <button onClick={() => { setNodes(prev => prev.filter((_, i) => i !== idx)); setOpenNodeMenu(null); setToastMessage('Instance deleted'); }} className="w-full text-left px-3 py-2 hover:bg-error/10 text-error text-sm">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
