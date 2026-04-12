import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const CORE_NAV: NavItem[] = [
  { path: '/dashboard',  label: 'Dashboard',  icon: 'space_dashboard' },
  { path: '/datastudio', label: 'Data Studio', icon: 'database' },
  { path: '/editor3d',   label: '3D Editor',  icon: '3d_rotation' },
];

const ANALYSIS_NAV: NavItem[] = [
  { path: '/quality-report',        label: 'Quality Report',    icon: 'shutter_speed' },
  { path: '/distribution-analysis', label: 'Distribution',      icon: 'bar_chart_4_bars' },
];

const COLLAB_NAV: NavItem[] = [
  { path: '/collaborate', label: 'Collaborate', icon: 'group' },
  { path: '/messaging',   label: 'Messaging',   icon: 'chat_bubble' },
  { path: '/library',     label: 'Library',     icon: 'folder_shared' },
  { path: '/settings',    label: 'Settings',    icon: 'settings' },
];

export const SidebarLeft: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, setToastMessage } = useAppStore();
  const [isCollapsed] = useState(false);

  const NavItemEl = ({ path, label, icon }: NavItem) => {
    const isActive = location.pathname === path;
    return (
      <div
        onClick={() => navigate(path)}
        className={`nav-item ${isActive ? 'active' : ''}`}
        title={label}
      >
        <span
          className="material-symbols-outlined text-[18px] shrink-0"
          style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
        >
          {icon}
        </span>
        {!isCollapsed && <span className="truncate">{label}</span>}
        {isActive && !isCollapsed && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan shrink-0" />
        )}
      </div>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-[60] flex flex-col sidebar-glass">
      {/* ─── Brand ─── */}
      <div className="mt-16 px-5 pt-6 pb-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-white/10 flex items-center justify-center shrink-0 glow-cyan">
            <span
              className="material-symbols-outlined text-neon-cyan text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              deployed_code
            </span>
          </div>
          <div>
            <div className="text-[#c3f5ff] font-bold text-sm tracking-tight font-headline">
              Project Alpha
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="pulse-dot-green" style={{ width: 5, height: 5 }} />
              <span className="text-[10px] text-on-surface-variant/50 tracking-widest uppercase">
                V3.2 Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar space-y-0.5">
        {/* Core */}
        <div className="section-label">Core</div>
        {CORE_NAV.map(item => <NavItemEl key={item.path} {...item} />)}

        {/* Analysis */}
        <div className="section-label">Analysis</div>
        {ANALYSIS_NAV.map(item => <NavItemEl key={item.path} {...item} />)}

        {/* Workspace */}
        <div className="section-label">Workspace</div>
        {COLLAB_NAV.map(item => <NavItemEl key={item.path} {...item} />)}
      </nav>

      {/* ─── Dataset Status Strip ─── */}
      {data && (
        <div className="mx-3 mb-3 px-3 py-2.5 rounded-lg bg-neon-cyan/5 border border-neon-cyan/15 flex items-center gap-2.5">
          <div className="pulse-dot" style={{ width: 6, height: 6, flexShrink: 0 }} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neon-cyan truncate">
              Dataset Active
            </p>
            <p className="text-[9px] text-on-surface-variant/50 truncate">{data.length} rows loaded</p>
          </div>
        </div>
      )}

      {/* ─── New Asset CTA ─── */}
      <div className="px-3 pb-4 space-y-2">
        <button
          onClick={() => navigate('/datastudio')}
          className="w-full py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(168,85,247,0.15))',
            border: '1px solid rgba(0,229,255,0.25)',
            color: '#c3f5ff',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0,229,255,0.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Dataset
        </button>

        {/* Footer Links */}
        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
          <button
            onClick={() => setToastMessage('Opening docs...')}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] text-on-surface-variant/40 hover:text-on-surface-variant/70 hover:bg-white/[0.03] transition-all uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-sm">help_outline</span>
            Docs
          </button>
          <button
            onClick={() => {
              useAppStore.getState().setToken(null);
              setToastMessage('Logged out');
            }}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] text-on-surface-variant/40 hover:text-error transition-all uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};
