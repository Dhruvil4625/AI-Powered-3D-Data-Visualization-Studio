import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const SidebarLeft: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToastMessage } = useAppStore();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ease-in-out duration-200 cursor-pointer ${
      isActive 
        ? 'bg-[#c3f5ff]/10 text-[#c3f5ff] border-r-4 border-[#c3f5ff] font-bold' 
        : 'text-[#dfe2eb]/40 hover:bg-[#353940]/10 hover:text-[#dfe2eb]'
    }`;
  };

  const getIconClass = (path: string) => {
    return location.pathname === path 
      ? 'material-symbols-outlined text-lg' 
      : 'material-symbols-outlined text-lg';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col py-8 bg-[#0a0e14] border-r border-[#353940]/20 w-64 z-[60] font-['Inter'] text-xs uppercase tracking-widest mt-0 z-40">
      <div className="px-6 mb-10 flex items-center gap-3 mt-16">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>deployed_code</span>
        </div>
        <div>
          <div className="text-[#c3f5ff] font-bold tracking-normal text-sm normal-case">Project Alpha</div>
          <div className="text-[#dfe2eb]/40 text-[10px] tracking-widest uppercase mt-0.5">V3.2 Active</div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <div className={getLinkClass('/dashboard')} onClick={() => navigate('/dashboard')}>
          <span className={getIconClass('/dashboard')}>dashboard</span>
          <span>Dashboard</span>
        </div>
        
        <div className={getLinkClass('/datastudio')} onClick={() => navigate('/datastudio')}>
          <span className={getIconClass('/datastudio')}>database</span>
          <span>Data Studio</span>
        </div>
        
        <div className={getLinkClass('/editor3d')} onClick={() => navigate('/editor3d')}>
          <span className={getIconClass('/editor3d')}>3d_rotation</span>
          <span>3D Editor</span>
        </div>
        
        <div className={getLinkClass('/collaborate')} onClick={() => navigate('/collaborate')}>
          <span className={getIconClass('/collaborate')}>group</span>
          <span>Collaborate</span>
        </div>

        <div className={getLinkClass('/messaging')} onClick={() => navigate('/messaging')}>
          <span className={getIconClass('/messaging')}>chat_bubble</span>
          <span>Messaging</span>
        </div>

        <div className={getLinkClass('/library')} onClick={() => navigate('/library')}>
          <span className={getIconClass('/library')}>folder_shared</span>
          <span>Library</span>
        </div>

        <div className={getLinkClass('/settings')} onClick={() => navigate('/settings')}>
          <span className={getIconClass('/settings')}>settings</span>
          <span>Settings</span>
        </div>
      </nav>

      <div className="px-4 mt-auto space-y-4">
        <button 
          onClick={() => navigate('/datastudio')}
          className="w-full py-3 bg-primary-container text-on-primary-container font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 text-[11px]"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Asset
        </button>
        <div className="pt-6 border-t border-[#353940]/20 space-y-2">
          <div onClick={() => setToastMessage('Opening documentation...')} className="flex items-center gap-3 px-4 py-2 text-[#dfe2eb]/40 hover:text-[#dfe2eb] transition-all cursor-pointer">
            <span className="material-symbols-outlined text-lg">help</span>
            <span>Documentation</span>
          </div>
          <div onClick={() => { setToastMessage('Logged out'); navigate('/dashboard'); }} className="flex items-center gap-3 px-4 py-2 text-[#dfe2eb]/40 hover:text-error transition-all cursor-pointer">
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Logout</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
