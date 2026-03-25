import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToastMessage } = useAppStore();

  const isPathActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 right-0 left-64 z-50 h-16 bg-[#10141a]/80 backdrop-blur-xl flex justify-between items-center px-6 shadow-[0_0_20px_rgba(0,229,255,0.05)] bg-gradient-to-b from-[#353940]/10 to-transparent">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tighter text-[#c3f5ff] font-headline">Kinetic Observatory</span>
        
        <div className="relative group hidden md:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm">search</span>
          <input 
            type="text" 
            placeholder="Search experiments..." 
            className="bg-surface-container-lowest border-none rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:ring-1 focus:ring-primary transition-all text-on-surface placeholder:text-outline/50 outline-none" 
          />
        </div>

        <nav className="hidden lg:flex items-center gap-6 font-headline tracking-tight text-sm">
          <span 
            onClick={() => navigate('/dashboard')}
            className={`cursor-pointer transition-all ${isPathActive('/dashboard') ? 'text-[#c3f5ff] border-b-2 border-[#c3f5ff] pb-1 font-medium' : 'text-[#dfe2eb]/60 hover:text-[#dfe2eb]'}`}
          >
            Projects
          </span>
          <span 
            onClick={() => navigate('/templates')}
            className={`cursor-pointer transition-all ${isPathActive('/templates') ? 'text-[#c3f5ff] border-b-2 border-[#c3f5ff] pb-1 font-medium' : 'text-[#dfe2eb]/60 hover:text-[#dfe2eb]'}`}
          >
            Templates
          </span>
          <span 
            onClick={() => navigate('/library')}
            className={`cursor-pointer transition-all ${isPathActive('/library') ? 'text-[#c3f5ff] border-b-2 border-[#c3f5ff] pb-1 font-medium' : 'text-[#dfe2eb]/60 hover:text-[#dfe2eb]'}`}
          >
            Library
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => setToastMessage('No new notifications')} className="p-2 text-[#dfe2eb]/60 hover:bg-[#353940]/30 transition-all active:scale-95 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button 
          onClick={() => navigate('/settings')}
          className={`p-2 transition-all active:scale-95 rounded-full flex items-center justify-center ${isPathActive('/settings') ? 'text-primary bg-primary/10' : 'text-[#dfe2eb]/60 hover:bg-[#353940]/30'}`}
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden border border-primary/20">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6aUjcSUHRrE8rdSG_hn21MYJ1aFS8f3oOlV5byBm2GAL4xjpq62K0vomu8RkN4xCY2Ox8gYYZEXd8BUzzztyNY8drlR-RE6pD0PvwIfe_RDIFuWlwbxGDbaxodj-nOdJEIekQV9JDYRA1yB9GVoHlHy85fjpXJaVvMCB8vXSdCSQOwikg_6o0i6fkDqQrCU6ukmQgX8bClfOwbSBNy0fY12Gxmbgno7iT4oF5ORqu4Z29ClUttj_Tcwu8w_8sJTSb9I46XIeIsw" 
            alt="User avatar" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" 
          />
        </div>
      </div>
    </header>
  );
};
