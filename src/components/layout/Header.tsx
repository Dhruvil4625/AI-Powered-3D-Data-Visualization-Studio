import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, cleaningStats } = useAppStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Derive header breadcrumb from route
  const routeLabels: Record<string, string> = {
    '/dashboard': 'Projects',
    '/datastudio': 'Data Studio',
    '/editor3d': '3D Editor',
    '/quality-report': 'Quality Report',
    '/distribution-analysis': 'Distribution Analysis',
    '/collaborate': 'Collaborate',
    '/messaging': 'Messaging',
    '/library': 'Library',
    '/settings': 'Settings',
  };
  const currentPageLabel = routeLabels[location.pathname] ?? 'Observatory';
  const hasData = !!data;
  const warningCount = cleaningStats?.warnings?.length ?? 0;

  return (
    <header
      className="fixed top-0 right-0 left-64 z-50 h-16 flex items-center justify-between px-6"
      style={{
        background: 'rgba(10, 14, 20, 0.85)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderBottom: '1px solid rgba(195, 245, 255, 0.06)',
        boxShadow: '0 1px 0 rgba(195, 245, 255, 0.04)',
      }}
    >
      {/* ─── Left: Breadcrumb ─── */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-on-surface-variant/35 font-medium">Kinetic Observatory</span>
          <span className="text-on-surface-variant/20">/</span>
          <span className="text-on-surface font-semibold font-headline tracking-tight">{currentPageLabel}</span>
        </div>

        {/* Dataset pill */}
        {hasData && (
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer"
            style={{
              background: 'rgba(0,229,255,0.06)',
              border: '1px solid rgba(0,229,255,0.18)',
            }}
            onClick={() => navigate('/datastudio')}
          >
            <span className="pulse-dot" style={{ width: 5, height: 5 }} />
            <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider">
              {data!.length} rows active
            </span>
          </div>
        )}
      </div>

      {/* ─── Center: Search ─── */}
      <div
        className={`relative hidden lg:flex items-center transition-all duration-300 ${searchFocused ? 'w-80' : 'w-64'}`}
      >
        <span
          className="absolute left-3 material-symbols-outlined text-sm transition-colors duration-200"
          style={{ color: searchFocused ? '#00e5ff' : 'rgba(186, 201, 204, 0.35)' }}
        >
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search experiments..."
          className="w-full pl-9 pr-16 py-2 text-sm rounded-lg outline-none transition-all duration-200 placeholder:text-on-surface-variant/30 font-mono"
          style={{
            background: searchFocused ? 'rgba(0,229,255,0.04)' : 'rgba(195, 245, 255, 0.03)',
            border: searchFocused
              ? '1px solid rgba(0,229,255,0.3)'
              : '1px solid rgba(195, 245, 255, 0.06)',
            color: '#dfe2eb',
            boxShadow: searchFocused ? '0 0 0 3px rgba(0,229,255,0.06)' : 'none',
          }}
        />
        <kbd
          className="absolute right-3 text-[9px] font-mono px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(195,245,255,0.06)',
            border: '1px solid rgba(195,245,255,0.1)',
            color: 'rgba(186,201,204,0.4)',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* ─── Right: Actions ─── */}
      <div className="flex items-center gap-2">
        {/* Warning badge */}
        {warningCount > 0 && (
          <button
            onClick={() => navigate('/quality-report')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-100"
            style={{
              background: 'rgba(255,180,171,0.08)',
              border: '1px solid rgba(255,180,171,0.2)',
            }}
          >
            <span className="material-symbols-outlined text-error text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
            <span className="text-[10px] font-bold text-error uppercase tracking-wider">{warningCount} Warning{warningCount > 1 ? 's' : ''}</span>
          </button>
        )}

        {/* Divider */}
        <div className="h-5 w-px mx-1" style={{ background: 'rgba(195,245,255,0.08)' }} />

        {/* Notifications */}
        <button
          onClick={() => useAppStore.getState().setToastMessage('No new notifications')}
          className="relative p-2 rounded-lg transition-all hover:bg-white/[0.04] active:scale-95 group"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-on-surface-variant/50 group-hover:text-on-surface-variant text-[20px] transition-colors">
            notifications
          </span>
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className={`p-2 rounded-lg transition-all hover:bg-white/[0.04] active:scale-95 group ${location.pathname === '/settings' ? 'bg-neon-cyan/10' : ''}`}
          title="Settings"
        >
          <span
            className={`material-symbols-outlined text-[20px] transition-colors ${location.pathname === '/settings' ? 'text-neon-cyan' : 'text-on-surface-variant/50 group-hover:text-on-surface-variant'}`}
          >
            settings
          </span>
        </button>

        {/* Divider */}
        <div className="h-5 w-px mx-1" style={{ background: 'rgba(195,245,255,0.08)' }} />

        {/* Avatar */}
        <button
          className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/10 hover:ring-neon-cyan/40 transition-all active:scale-95"
          title="Account"
          onClick={() => navigate('/settings')}
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6aUjcSUHRrE8rdSG_hn21MYJ1aFS8f3oOlV5byBm2GAL4xjpq62K0vomu8RkN4xCY2Ox8gYYZEXd8BUzzztyNY8drlR-RE6pD0PvwIfe_RDIFuWlwbxGDbaxodj-nOdJEIekQV9JDYRA1yB9GVoHlHy85fjpXJaVvMCB8vXSdCSQOwikg_6o0i6fkDqQrCU6ukmQgX8bClfOwbSBNy0fY12Gxmbgno7iT4oF5ORqu4Z29ClUttj_Tcwu8w_8sJTSb9I46XIeIsw"
            alt="User"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};
