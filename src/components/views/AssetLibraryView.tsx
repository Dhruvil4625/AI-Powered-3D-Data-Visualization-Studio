import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const AssetLibraryView: React.FC = () => {
    const { setToastMessage } = useAppStore();
    const [assets, setAssets] = useState([
        { name: 'Neural_Mesh_V4.json', type: 'DATASET', sizeMB: 42.8, modified: '2h ago', icon: 'database', badgeClass: 'secondary', previewUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000' },
        { name: 'Obsidian_Frame_Final.obj', type: '3D MODEL', sizeMB: 156.4, modified: 'Yesterday', icon: '3d_rotation', badgeClass: 'primary', previewUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000' },
        { name: 'Cyberpunk_Lut_Pack.preset', type: 'PRESET', sizeMB: 0.012, modified: 'Oct 12, 2026', icon: 'palette', badgeClass: 'tertiary', previewUrl: 'https://images.unsplash.com/photo-1544256718-3b61027b4ce2?auto=format&fit=crop&q=80&w=1000' },
        { name: 'Lidar_Scan_Sector_7.zip', type: 'ARCHIVE', sizeMB: 2400, modified: 'Oct 08, 2026', icon: 'cloud_download', badgeClass: 'secondary', previewUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000' }
    ]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [menuIndex, setMenuIndex] = useState<number | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [fullscreenOpen, setFullscreenOpen] = useState(false);
    return (
        <div className="flex-1 overflow-y-auto p-8 bg-surface-container-lowest h-full custom-scrollbar">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div className="space-y-2">
                    <span className="text-secondary font-label text-[10px] uppercase tracking-[0.2em]">Storage Management</span>
                    <h1 className="text-5xl font-headline font-bold text-primary tracking-tighter">Asset Library</h1>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-outline text-[10px] uppercase font-label">Storage Used</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-headline font-bold text-on-surface">14.2</span>
                            <span className="text-xs text-outline">GB / 50 GB</span>
                        </div>
                        <div className="w-32 h-1 bg-surface-container-high rounded-full mt-2 overflow-hidden">
                            <div className="bg-primary h-full w-[28%] shadow-[0_0_8px_#c3f5ff]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
                {/* Main Controls Panel */}
                <div className="lg:col-span-8 glass-panel p-6 rounded-xl flex flex-col gap-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 bg-surface-container-lowest p-1 rounded-lg">
                            <button className="px-4 py-2 bg-primary-container text-on-primary-container rounded text-xs font-bold uppercase tracking-tight">All Assets</button>
                            <button className="px-4 py-2 text-outline hover:text-on-surface transition-colors text-xs font-bold uppercase tracking-tight">Datasets</button>
                            <button className="px-4 py-2 text-outline hover:text-on-surface transition-colors text-xs font-bold uppercase tracking-tight">Models</button>
                            <button className="px-4 py-2 text-outline hover:text-on-surface transition-colors text-xs font-bold uppercase tracking-tight">Presets</button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 bg-surface-container-high text-on-surface rounded border border-outline-variant/20 hover:bg-surface-bright transition-all">
                                <span className="material-symbols-outlined">filter_list</span>
                            </button>
                            <button className="p-2 bg-surface-container-high text-on-surface rounded border border-outline-variant/20 hover:bg-surface-bright transition-all">
                                <span className="material-symbols-outlined">grid_view</span>
                            </button>
                        </div>
                    </div>

                    {/* Asset Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-widest text-outline border-b border-outline-variant/10">
                                    <th className="pb-4 font-medium">Name</th>
                                    <th className="pb-4 font-medium">Type</th>
                                    <th className="pb-4 font-medium text-right">Size</th>
                                    <th className="pb-4 font-medium text-right">Last Modified</th>
                                    <th className="pb-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-body">
                                {assets.map((a, idx) => (
                                    <tr key={idx} onClick={() => setSelectedIndex(idx)} className={`group hover:bg-surface-bright/20 transition-all border-b border-outline-variant/5 ${idx === 0 ? 'border-t' : ''}`}>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded ${a.badgeClass === 'primary' ? 'bg-primary/10 text-primary' : a.badgeClass === 'secondary' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'} flex items-center justify-center`}>
                                                    <span className="material-symbols-outlined text-base">{a.icon}</span>
                                                </div>
                                                <span className="font-medium text-on-surface">{a.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`${a.badgeClass === 'primary' ? 'bg-primary-container/30 text-primary' : a.badgeClass === 'secondary' ? 'bg-secondary-container/30 text-secondary' : 'bg-tertiary-container/30 text-on-tertiary-container'} px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest`}>
                                                {a.type}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right text-outline">{a.sizeMB >= 1 ? `${a.sizeMB.toFixed(1)} MB` : `${Math.round(a.sizeMB * 1024)} KB`}</td>
                                        <td className="py-4 text-right text-outline">{a.modified}</td>
                                        <td className="py-4 text-right relative">
                                            <button onClick={(e) => { e.stopPropagation(); setMenuIndex(menuIndex === idx ? null : idx); }} className="text-outline hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">more_vert</span></button>
                                            {menuIndex === idx && (
                                                <div className="absolute right-0 mt-2 bg-surface-container-highest border border-outline-variant/20 rounded-lg shadow-xl z-20 w-40">
                                                    <button onClick={() => { const newName = window.prompt('Rename asset', a.name) || a.name; setAssets(prev => prev.map((it, i) => i === idx ? { ...it, name: newName } : it)); setMenuIndex(null); setToastMessage('Asset renamed'); }} className="w-full text-left px-3 py-2 hover:bg-surface-bright text-sm">Rename</button>
                                                    <button onClick={() => { setAssets(prev => { const copy = { ...a, name: `${a.name.split('.').slice(0,-1).join('.')}_copy.${a.name.split('.').pop()}` }; return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]; }); setMenuIndex(null); setToastMessage('Asset duplicated'); }} className="w-full text-left px-3 py-2 hover:bg-surface-bright text-sm">Duplicate</button>
                                                    <button onClick={() => { setAssets(prev => prev.filter((_, i) => i !== idx)); setMenuIndex(null); setToastMessage('Asset deleted'); }} className="w-full text-left px-3 py-2 hover:bg-error/10 text-error text-sm">Delete</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Secondary Panel: Quick Preview / Upload */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Upload Box */}
                    <div onClick={() => setShowUploadModal(true)} className="glass-panel p-8 rounded-xl border-dashed border-2 border-primary/20 flex flex-col items-center justify-center text-center gap-4 group hover:border-primary/50 transition-all cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">upload_file</span>
                        </div>
                        <div>
                            <h3 className="font-headline font-bold text-lg text-on-surface">Upload Asset</h3>
                            <p className="text-xs text-outline mt-1">Drag and drop or click to browse files</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <span className="text-[9px] bg-surface-container px-2 py-1 rounded border border-outline-variant/10">.JSON</span>
                            <span className="text-[9px] bg-surface-container px-2 py-1 rounded border border-outline-variant/10">.OBJ</span>
                            <span className="text-[9px] bg-surface-container px-2 py-1 rounded border border-outline-variant/10">.CSV</span>
                        </div>
                    </div>

                    {/* Visual Asset Preview */}
                    <div className="glass-panel p-1 rounded-xl overflow-hidden aspect-square relative group">
                        <img alt="Asset Preview" className="w-full h-full object-cover rounded-lg opacity-80 group-hover:scale-105 transition-transform duration-700" src={assets[selectedIndex]?.previewUrl} />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                            <span className="text-[10px] text-primary uppercase font-label tracking-widest">Selected Asset</span>
                            <h4 className="text-xl font-headline font-bold text-on-surface">{assets[selectedIndex]?.name.split('.').slice(0,-1).join('.')}</h4>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-outline uppercase font-bold tracking-widest mb-0.5">Vertices</span>
                                    <span className="text-xs font-bold text-on-surface">1.2M</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-outline uppercase font-bold tracking-widest mb-0.5">Shaders</span>
                                    <span className="text-xs font-bold text-on-surface">PBR Clear</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setFullscreenOpen(true)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-bright/80 backdrop-blur-md flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-all">
                            <span className="material-symbols-outlined text-sm">fullscreen</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bento Grid Section: Custom Color Presets */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">Color & Lighting Presets</h2>
                    <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                        VIEW ALL <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div className="glass-panel p-4 rounded-xl hover:bg-surface-bright/40 transition-all group cursor-pointer border border-outline-variant/5">
                        <div className="flex gap-1 mb-4">
                            <div className="h-8 flex-1 rounded-sm bg-[#00e5ff]"></div>
                            <div className="h-8 flex-1 rounded-sm bg-[#7000ff]"></div>
                            <div className="h-8 flex-1 rounded-sm bg-[#10141a]"></div>
                        </div>
                        <h5 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Neon Void</h5>
                        <p className="text-[10px] text-outline mt-1 font-medium">High-contrast luminescence</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl hover:bg-surface-bright/40 transition-all group cursor-pointer border border-outline-variant/5">
                        <div className="flex gap-1 mb-4">
                            <div className="h-8 flex-1 rounded-sm bg-[#ffe6f2]"></div>
                            <div className="h-8 flex-1 rounded-sm bg-[#d1bcff]"></div>
                            <div className="h-8 flex-1 rounded-sm bg-[#353940]"></div>
                        </div>
                        <h5 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Ethereal Dusk</h5>
                        <p className="text-[10px] text-outline mt-1 font-medium">Soft magenta gradients</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl hover:bg-surface-bright/40 transition-all group cursor-pointer border border-outline-variant/5">
                        <div className="flex gap-1 mb-4">
                            <div className="h-8 flex-1 rounded-sm bg-[#ffb4ab]"></div>
                            <div className="h-8 flex-1 rounded-sm bg-[#93000a]"></div>
                            <div className="h-8 flex-1 rounded-sm bg-[#10141a]"></div>
                        </div>
                        <h5 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Heat Map</h5>
                        <p className="text-[10px] text-outline mt-1 font-medium">Thermal intensity scale</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl hover:bg-surface-bright/40 transition-all group cursor-pointer border border-outline-variant/5">
                        <div className="flex gap-1 mb-4">
                            <div className="h-8 flex-1 rounded-sm bg-[#006875]"></div>
                            <div className="h-8 flex-1 rounded-sm bg-[#c3f5ff]"></div>
                            <div className="h-8 flex-1 rounded-sm bg-[#dfe2eb]"></div>
                        </div>
                        <h5 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Deep Sea</h5>
                        <p className="text-[10px] text-outline mt-1 font-medium">Monochromatic blue depth</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl hover:bg-surface-bright/40 transition-all group cursor-pointer border border-outline-variant/5 flex flex-col items-center justify-center border-dashed border-2 border-outline-variant/20 h-[106px]">
                        <span className="material-symbols-outlined text-outline">add_circle</span>
                        <span className="text-[10px] font-bold text-outline mt-2 tracking-widest">NEW PRESET</span>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button onClick={() => setShowUploadModal(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-[0_8px_32px_rgba(0,218,243,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>upload</span>
            </button>

            {fullscreenOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <img alt="Fullscreen Preview" src={assets[selectedIndex]?.previewUrl} className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-2xl" />
                    <button onClick={() => setFullscreenOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            )}

            {showUploadModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-[420px] bg-surface-container-highest border border-outline-variant/20 rounded-xl p-6 shadow-2xl">
                        <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Upload Asset</h3>
                        <input type="file" onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const name = f.name;
                            const ext = name.split('.').pop()?.toLowerCase() || '';
                            const type = ext === 'json' ? 'DATASET' : ext === 'obj' ? '3D MODEL' : ext === 'csv' ? 'DATASET' : 'ARCHIVE';
                            const badgeClass = type === '3D MODEL' ? 'primary' : type === 'DATASET' ? 'secondary' : 'secondary';
                            const icon = type === '3D MODEL' ? '3d_rotation' : type === 'DATASET' ? 'database' : 'cloud_download';
                            const sizeMB = f.size / (1024 * 1024);
                            const previewUrl = assets[selectedIndex]?.previewUrl;
                            setAssets(prev => [{ name, type, sizeMB, modified: 'Just now', icon, badgeClass, previewUrl }, ...prev]);
                            setToastMessage('Asset uploaded');
                            setShowUploadModal(false);
                        }} className="w-full bg-surface-container-low border border-outline-variant/30 rounded p-3 text-sm text-on-surface mb-4" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-on-surface-variant hover:text-on-surface rounded">Cancel</button>
                            <button onClick={() => setToastMessage('Select a file to upload')} className="px-4 py-2 bg-primary-container text-on-primary-container rounded">Upload</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
