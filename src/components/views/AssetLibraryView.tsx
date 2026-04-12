import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

/* ─── Types ─────────────────────────────────────────────────────── */
type AssetType = 'DATASET' | '3D MODEL' | 'PRESET' | 'ARCHIVE';
type ViewMode  = 'list' | 'grid';
type FilterTab = 'All Assets' | 'Datasets' | 'Models' | 'Presets';

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  sizeMB: number;
  modified: string;
  icon: string;
  badgeClass: 'primary' | 'secondary' | 'tertiary';
  previewUrl: string;
  vertices?: string;
  shaders?: string;
  objectUrl?: string; // for locally uploaded files
}

interface ColorPreset {
  id: string;
  name: string;
  desc: string;
  colors: string[];
}

/* ─── Constants ─────────────────────────────────────────────────── */
const INITIAL_ASSETS: Asset[] = [
  {
    id: 'a1',
    name: 'Neural_Mesh_V4.json',
    type: 'DATASET',
    sizeMB: 42.8,
    modified: '2h ago',
    icon: 'database',
    badgeClass: 'secondary',
    previewUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    vertices: '1.2M',
    shaders: 'PBR Clear',
  },
  {
    id: 'a2',
    name: 'Obsidian_Frame_Final.obj',
    type: '3D MODEL',
    sizeMB: 156.4,
    modified: 'Yesterday',
    icon: '3d_rotation',
    badgeClass: 'primary',
    previewUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    vertices: '4.7M',
    shaders: 'Obsidian PBR',
  },
  {
    id: 'a3',
    name: 'Cyberpunk_Lut_Pack.preset',
    type: 'PRESET',
    sizeMB: 0.012,
    modified: 'Oct 12, 2026',
    icon: 'palette',
    badgeClass: 'tertiary',
    previewUrl: 'https://images.unsplash.com/photo-1544256718-3b61027b4ce2?auto=format&fit=crop&q=80&w=800',
    vertices: '—',
    shaders: 'LUT/Color',
  },
  {
    id: 'a4',
    name: 'Lidar_Scan_Sector_7.zip',
    type: 'ARCHIVE',
    sizeMB: 2400,
    modified: 'Oct 08, 2026',
    icon: 'cloud_download',
    badgeClass: 'secondary',
    previewUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
    vertices: '8.3M',
    shaders: 'Raw Point Cloud',
  },
];

const COLOR_PRESETS: ColorPreset[] = [
  { id: 'p1', name: 'Neon Void',     desc: 'High-contrast luminescence',   colors: ['#00e5ff', '#7000ff', '#10141a'] },
  { id: 'p2', name: 'Ethereal Dusk', desc: 'Soft magenta gradients',       colors: ['#ffe6f2', '#d1bcff', '#353940'] },
  { id: 'p3', name: 'Heat Map',      desc: 'Thermal intensity scale',      colors: ['#ffb4ab', '#93000a', '#10141a'] },
  { id: 'p4', name: 'Deep Sea',      desc: 'Monochromatic blue depth',     colors: ['#006875', '#c3f5ff', '#dfe2eb'] },
  { id: 'p5', name: 'Solar Flare',   desc: 'Warm amber energy burst',      colors: ['#fbbf24', '#f97316', '#1c0a00'] },
  { id: 'p6', name: 'Neon Forest',   desc: 'Bio-luminescent green',        colors: ['#4ade80', '#166534', '#0a1a0d'] },
];

const TAB_TO_TYPE: Record<FilterTab, AssetType | null> = {
  'All Assets': null,
  'Datasets': 'DATASET',
  'Models': '3D MODEL',
  'Presets': 'PRESET',
};

const fmtSize = (mb: number) =>
  mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` :
  mb >= 1    ? `${mb.toFixed(1)} MB` :
               `${Math.round(mb * 1024)} KB`;

const getBadgeStyle = (cls: string) => {
  if (cls === 'primary')   return 'bg-primary/10 text-primary border-primary/20';
  if (cls === 'tertiary')  return 'bg-tertiary/10 text-tertiary border-tertiary/20';
  return 'bg-secondary/10 text-secondary border-secondary/20';
};

const getTypeBadge = (cls: string) => {
  if (cls === 'primary')   return 'bg-primary/10 text-primary';
  if (cls === 'tertiary')  return 'bg-tertiary/10 text-tertiary';
  return 'bg-secondary/10 text-secondary';
};

/* ─── Component ─────────────────────────────────────────────────── */
export const AssetLibraryView: React.FC = () => {
  const { setToastMessage } = useAppStore();

  // ── Core state ──
  const [assets, setAssets]           = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedId, setSelectedId]   = useState<string>('a1');
  const [menuId, setMenuId]           = useState<string | null>(null);
  const [activeTab, setActiveTab]     = useState<FilterTab>('All Assets');
  const [viewMode, setViewMode]       = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField]     = useState<'name' | 'size' | 'modified'>('name');
  const [sortAsc, setSortAsc]         = useState(true);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('p1');
  const [showAllPresets, setShowAllPresets]      = useState(false);

  // ── Upload state ──
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDragging, setUploadDragging]   = useState(false);
  const [uploadFile, setUploadFile]           = useState<File | null>(null);
  const [uploadProgress, setUploadProgress]   = useState(0);
  const [isUploading, setIsUploading]         = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Lightbox ──
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedId) ?? assets[0], [assets, selectedId]);

  // ── Close menu on outside click ──
  useEffect(() => {
    if (!menuId) return;
    const close = () => setMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuId]);

  // ── Derived / filtered list ──
  const filteredAssets = useMemo(() => {
    let list = assets;
    const typeFilter = TAB_TO_TYPE[activeTab];
    if (typeFilter) list = list.filter(a => a.type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      if (sortField === 'size') cmp = a.sizeMB - b.sizeMB;
      if (sortField === 'modified') cmp = a.modified.localeCompare(b.modified);
      return sortAsc ? cmp : -cmp;
    });
  }, [assets, activeTab, searchQuery, sortField, sortAsc]);

  // ── Storage calculation ──
  const totalStorageGB = useMemo(
    () => assets.reduce((sum, a) => sum + a.sizeMB, 0) / 1024,
    [assets]
  );
  const storagePct = Math.min((totalStorageGB / 50) * 100, 100);

  // ── Toggle sort ──
  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(a => !a);
    else { setSortField(field); setSortAsc(true); }
  };

  // ── Upload logic ──
  const processFile = useCallback((file: File) => {
    setUploadFile(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) { setShowUploadModal(true); processFile(file); }
  };

  const confirmUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadProgress(0);
    // Simulate progress
    for (let i = 1; i <= 10; i++) {
      await new Promise(r => setTimeout(r, 80));
      setUploadProgress(i * 10);
    }
    const ext = uploadFile.name.split('.').pop()?.toLowerCase() || '';
    const type: AssetType = ext === 'obj' ? '3D MODEL' : ext === 'preset' ? 'PRESET' : 'DATASET';
    const badgeClass: 'primary' | 'secondary' | 'tertiary' =
      type === '3D MODEL' ? 'primary' : type === 'PRESET' ? 'tertiary' : 'secondary';
    const icon = type === '3D MODEL' ? '3d_rotation' : type === 'PRESET' ? 'palette' : 'database';
    const objectUrl = type === 'DATASET' ? URL.createObjectURL(uploadFile) : undefined;
    const newAsset: Asset = {
      id: `u-${Date.now()}`,
      name: uploadFile.name,
      type,
      sizeMB: uploadFile.size / (1024 * 1024),
      modified: 'Just now',
      icon,
      badgeClass,
      previewUrl: 'https://images.unsplash.com/photo-1551703599-6b3e8379aa8c?auto=format&fit=crop&q=80&w=800',
      vertices: '—',
      shaders: '—',
      objectUrl,
    };
    setAssets(prev => [newAsset, ...prev]);
    setSelectedId(newAsset.id);
    setIsUploading(false);
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadProgress(0);
    setToastMessage(`Asset "${uploadFile.name}" uploaded successfully`);
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    if (selectedId === id) setSelectedId(assets[0]?.id ?? '');
    setMenuId(null);
    setToastMessage('Asset deleted');
  };

  const renameAsset = (id: string, currentName: string) => {
    const newName = window.prompt('Rename asset:', currentName);
    if (newName && newName !== currentName) {
      setAssets(prev => prev.map(a => a.id === id ? { ...a, name: newName } : a));
      setToastMessage('Asset renamed');
    }
    setMenuId(null);
  };

  const duplicateAsset = (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    const parts = asset.name.split('.');
    const ext   = parts.pop() ?? '';
    const copy: Asset = { ...asset, id: `d-${Date.now()}`, name: `${parts.join('.')}_copy.${ext}`, modified: 'Just now' };
    setAssets(prev => {
      const idx = prev.findIndex(a => a.id === id);
      return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
    });
    setMenuId(null);
    setToastMessage('Asset duplicated');
  };

  const downloadAsset = (asset: Asset) => {
    if (asset.objectUrl) {
      const a = document.createElement('a');
      a.href = asset.objectUrl;
      a.download = asset.name;
      a.click();
    } else {
      setToastMessage(`Downloading ${asset.name}…`);
    }
    setMenuId(null);
  };

  const presetsToShow = showAllPresets ? COLOR_PRESETS : COLOR_PRESETS.slice(0, 5);

  /* ── Render ── */
  return (
    <div
      className="flex-1 overflow-y-auto p-8 bg-surface-container-lowest h-full custom-scrollbar"
      onDragOver={e => { e.preventDefault(); }}
      onDrop={handleDrop}
    >
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-1">
          <span className="text-secondary font-label text-[10px] uppercase tracking-[0.2em]">Storage Management</span>
          <h1 className="text-5xl font-headline font-bold text-primary tracking-tighter">Asset Library</h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-outline text-[10px] uppercase font-label">Storage Used</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-headline font-bold text-on-surface">{totalStorageGB.toFixed(1)}</span>
            <span className="text-xs text-outline">GB / 50 GB</span>
          </div>
          <div className="w-40 h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-700 ${storagePct > 80 ? 'bg-error' : 'bg-primary'} shadow-[0_0_8px_#c3f5ff]`}
              style={{ width: `${storagePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="relative mb-6">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base pointer-events-none">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search assets by name or type…"
          className="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg pl-9 pr-4 py-2.5 text-sm text-on-surface placeholder-outline/50 focus:outline-none focus:border-primary/50"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">

        {/* ── Left panel: Asset table / grid ── */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-xl flex flex-col gap-6">

          {/* Tab bar + view controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg">
              {(['All Assets', 'Datasets', 'Models', 'Presets'] as FilterTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-tight transition-all ${
                    activeTab === tab
                      ? 'bg-primary/15 text-primary border border-primary/25'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}
                title="Toggle grid/list view"
                className={`p-2 rounded border transition-all ${viewMode === 'grid' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface-container-high border-outline-variant/20 text-on-surface hover:bg-surface-bright'}`}
              >
                <span className="material-symbols-outlined text-base">{viewMode === 'grid' ? 'view_list' : 'grid_view'}</span>
              </button>
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-outline/40 gap-3">
              <span className="material-symbols-outlined text-4xl">search_off</span>
              <p className="text-sm">No assets match your filters.</p>
            </div>
          ) : viewMode === 'list' ? (
            /* ── LIST VIEW ── */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-outline border-b border-outline-variant/10">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium text-right cursor-pointer select-none hover:text-on-surface transition-colors" onClick={() => toggleSort('size')}>
                      Size {sortField === 'size' ? (sortAsc ? '↑' : '↓') : ''}
                    </th>
                    <th className="pb-3 font-medium text-right cursor-pointer select-none hover:text-on-surface transition-colors" onClick={() => toggleSort('modified')}>
                      Last Modified {sortField === 'modified' ? (sortAsc ? '↑' : '↓') : ''}
                    </th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-body">
                  {filteredAssets.map(a => (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedId(a.id)}
                      className={`group hover:bg-primary/5 transition-all border-b border-outline-variant/5 cursor-pointer ${selectedId === a.id ? 'bg-primary/8' : ''}`}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${getBadgeStyle(a.badgeClass)}`}>
                            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                          </div>
                          <span className={`font-medium truncate max-w-[200px] ${selectedId === a.id ? 'text-primary' : 'text-on-surface'}`}>{a.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`${getTypeBadge(a.badgeClass)} px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest`}>{a.type}</span>
                      </td>
                      <td className="py-3 text-right text-outline font-mono">{fmtSize(a.sizeMB)}</td>
                      <td className="py-3 text-right text-outline">{a.modified}</td>
                      <td className="py-3 text-right relative">
                        <button
                          onClick={e => { e.stopPropagation(); setMenuId(menuId === a.id ? null : a.id); }}
                          className="text-outline hover:text-primary transition-colors p-1 rounded"
                        >
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                        {menuId === a.id && (
                          <div
                            className="absolute right-0 top-10 bg-surface-container-highest border border-outline-variant/20 rounded-xl shadow-2xl z-20 w-44 py-1 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                          >
                            <button onClick={() => { downloadAsset(a); }} className="w-full text-left px-4 py-2.5 hover:bg-primary/10 text-sm flex items-center gap-2 text-on-surface">
                              <span className="material-symbols-outlined text-sm">download</span> Download
                            </button>
                            <button onClick={() => renameAsset(a.id, a.name)} className="w-full text-left px-4 py-2.5 hover:bg-primary/10 text-sm flex items-center gap-2 text-on-surface">
                              <span className="material-symbols-outlined text-sm">edit</span> Rename
                            </button>
                            <button onClick={() => duplicateAsset(a.id)} className="w-full text-left px-4 py-2.5 hover:bg-primary/10 text-sm flex items-center gap-2 text-on-surface">
                              <span className="material-symbols-outlined text-sm">content_copy</span> Duplicate
                            </button>
                            <div className="border-t border-outline-variant/10 my-1" />
                            <button onClick={() => deleteAsset(a.id)} className="w-full text-left px-4 py-2.5 hover:bg-error/10 text-sm flex items-center gap-2 text-error">
                              <span className="material-symbols-outlined text-sm">delete</span> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* ── GRID VIEW ── */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredAssets.map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`group rounded-xl overflow-hidden border cursor-pointer transition-all hover:border-primary/40 relative ${selectedId === a.id ? 'border-primary/50 ring-1 ring-primary/20' : 'border-outline-variant/10'}`}
                  style={{ background: 'rgba(16,20,26,0.7)' }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={a.previewUrl} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className={`absolute top-2 left-2 ${getTypeBadge(a.badgeClass)} px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest`}>{a.type}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-on-surface truncate">{a.name}</p>
                    <p className="text-[10px] text-outline mt-0.5 font-mono">{fmtSize(a.sizeMB)}</p>
                  </div>
                  {/* Quick actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); downloadAsset(a); }}
                      className="w-7 h-7 rounded-full bg-surface-container-highest/80 backdrop-blur flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deleteAsset(a.id); }}
                      className="w-7 h-7 rounded-full bg-surface-container-highest/80 backdrop-blur flex items-center justify-center text-error hover:bg-error hover:text-on-error transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload drop zone hint at bottom */}
          <div
            className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 transition-all cursor-pointer ${uploadDragging ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-primary/40'}`}
            onDragOver={e => { e.preventDefault(); setUploadDragging(true); }}
            onDragLeave={() => setUploadDragging(false)}
            onDrop={e => { e.preventDefault(); setUploadDragging(false); const f = e.dataTransfer.files?.[0]; if (f) { processFile(f); setShowUploadModal(true); } }}
            onClick={() => { setShowUploadModal(true); }}
          >
            <span className="material-symbols-outlined text-outline text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
            <span className="text-xs text-outline">Drop files here or <span className="text-primary font-bold hover:underline">click to upload</span></span>
            <div className="flex gap-1 ml-2">
              {['.JSON', '.OBJ', '.CSV', '.ZIP'].map(ext => (
                <span key={ext} className="text-[9px] bg-surface-container px-2 py-0.5 rounded border border-outline-variant/10 text-outline">{ext}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel: Preview + Upload box ── */}
        <div className="lg:col-span-4 flex flex-col gap-5">

          {/* Asset Preview */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="relative aspect-square group">
              <img
                alt="Asset Preview"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                src={selectedAsset?.previewUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[9px] text-primary uppercase font-label tracking-widest">Selected Asset</span>
                <h4 className="text-lg font-headline font-bold text-white leading-tight">{selectedAsset?.name?.split('.').slice(0, -1).join('.')}</h4>
                <div className="flex items-center gap-4 mt-1.5">
                  <div>
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest block">Size</span>
                    <span className="text-xs font-bold text-white">{selectedAsset ? fmtSize(selectedAsset.sizeMB) : '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest block">Vertices</span>
                    <span className="text-xs font-bold text-white">{selectedAsset?.vertices ?? '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest block">Shaders</span>
                    <span className="text-xs font-bold text-white">{selectedAsset?.shaders ?? '—'}</span>
                  </div>
                </div>
              </div>
              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => setFullscreenOpen(true)}
                  className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:text-on-primary transition-all"
                >
                  <span className="material-symbols-outlined text-sm">fullscreen</span>
                </button>
                <button
                  onClick={() => selectedAsset && downloadAsset(selectedAsset)}
                  className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-neon-teal hover:text-black transition-all"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
                </button>
              </div>
            </div>
          </div>

          {/* Upload CTA */}
          <div
            onClick={() => setShowUploadModal(true)}
            className="glass-panel p-6 rounded-xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-center gap-3 group hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-on-surface">Upload Asset</h3>
              <p className="text-[10px] text-outline mt-0.5">Drag and drop or click to browse</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Color & Lighting Presets ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">Color &amp; Lighting Presets</h2>
          <button
            onClick={() => setShowAllPresets(v => !v)}
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
          >
            {showAllPresets ? 'SHOW LESS' : 'VIEW ALL'}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {presetsToShow.map(preset => (
            <button
              key={preset.id}
              onClick={() => { setSelectedPresetId(preset.id); setToastMessage(`Preset "${preset.name}" applied`); }}
              className={`glass-panel p-4 rounded-xl transition-all text-left group border-2 ${
                selectedPresetId === preset.id
                  ? 'border-primary shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                  : 'border-transparent hover:border-outline-variant/30'
              }`}
            >
              <div className="flex gap-1 mb-3">
                {preset.colors.map((c, i) => (
                  <div key={i} className="h-8 flex-1 rounded-sm" style={{ background: c }} />
                ))}
              </div>
              <h5 className={`text-xs font-bold transition-colors ${selectedPresetId === preset.id ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>{preset.name}</h5>
              <p className="text-[10px] text-outline mt-0.5">{preset.desc}</p>
              {selectedPresetId === preset.id && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-[9px] text-primary font-bold uppercase tracking-wider">Active</span>
                </div>
              )}
            </button>
          ))}
          {/* Add new preset */}
          <button
            onClick={() => {
              const name = window.prompt('Preset name:');
              if (!name) return;
              setToastMessage(`Custom preset "${name}" added`);
            }}
            className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 hover:border-primary/40 transition-all h-[106px] group"
          >
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">add_circle</span>
            <span className="text-[10px] font-bold text-outline group-hover:text-primary transition-colors mt-2 tracking-widest">NEW PRESET</span>
          </button>
        </div>
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setShowUploadModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-[0_8px_32px_rgba(0,218,243,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>upload</span>
      </button>

      {/* ── Fullscreen lightbox ── */}
      {fullscreenOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center"
          onClick={() => setFullscreenOpen(false)}
        >
          <img
            alt="Fullscreen Preview"
            src={selectedAsset?.previewUrl}
            className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setFullscreenOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center hover:bg-error hover:text-white transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white/80 text-sm font-medium">{selectedAsset?.name}</p>
            <p className="text-white/40 text-xs mt-0.5">{selectedAsset ? fmtSize(selectedAsset.sizeMB) : ''}</p>
          </div>
        </div>
      )}

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          onClick={() => !isUploading && setShowUploadModal(false)}
        >
          <div
            className="w-[460px] rounded-2xl p-6 shadow-2xl border border-outline-variant/20"
            style={{ background: 'rgba(22,26,34,0.98)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-headline text-lg font-bold text-on-surface">Upload Asset</h3>
              {!isUploading && (
                <button onClick={() => { setShowUploadModal(false); setUploadFile(null); setUploadProgress(0); }} className="text-outline hover:text-error transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-10 gap-3 cursor-pointer transition-all mb-4 ${uploadDragging ? 'border-primary bg-primary/5' : uploadFile ? 'border-neon-teal/50 bg-neon-teal/5' : 'border-outline-variant/30 hover:border-primary/40'}`}
              onDragOver={e => { e.preventDefault(); setUploadDragging(true); }}
              onDragLeave={() => setUploadDragging(false)}
              onDrop={e => { e.preventDefault(); setUploadDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); }}
              onClick={() => !uploadFile && fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" className="hidden" accept=".json,.obj,.csv,.zip,.preset" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
              {uploadFile ? (
                <>
                  <span className="material-symbols-outlined text-neon-teal text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <p className="font-medium text-on-surface text-sm">{uploadFile.name}</p>
                  <p className="text-xs text-outline">{fmtSize(uploadFile.size / (1024 * 1024))}</p>
                  {!isUploading && (
                    <button onClick={() => setUploadFile(null)} className="text-xs text-error hover:underline">Remove</button>
                  )}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl text-outline" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
                  <p className="text-sm text-on-surface">Drop your file here</p>
                  <p className="text-xs text-outline">or click to browse — .JSON, .OBJ, .CSV, .ZIP</p>
                </>
              )}
            </div>

            {/* Progress */}
            {isUploading && (
              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-outline uppercase tracking-widest mb-1.5">
                  <span>Uploading…</span>
                  <span className="text-primary font-mono">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-150 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowUploadModal(false); setUploadFile(null); setUploadProgress(0); }} disabled={isUploading} className="px-4 py-2 text-on-surface-variant hover:text-on-surface rounded-lg transition-colors disabled:opacity-40">
                Cancel
              </button>
              <button
                onClick={confirmUpload}
                disabled={!uploadFile || isUploading}
                className="px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-on-primary hover:brightness-110"
              >
                {isUploading ? <span className="material-symbols-outlined animate-spin text-base">sync</span> : <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>upload</span>}
                {isUploading ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
