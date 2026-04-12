import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { LogIn, UserPlus, Loader2, Database } from 'lucide-react';

export const LoginView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? 'auth/login/' : 'auth/register/';
    try {
      const res = await fetch(`http://localhost:8000/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.access);
        window.location.href = '/dashboard';
      } else {
        alert(data.error || data.detail || 'Authentication failed');
      }
    } catch (e) {
      alert('Connection to server failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-purple/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl border border-white/10 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-neon-cyan/10 rounded-2xl mb-4 border border-neon-cyan/30 shadow-[0_0_20px_rgba(0,245,255,0.2)]">
            <Database className="w-10 h-10 text-neon-cyan" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-white tracking-tighter uppercase">3D Data Studio</h1>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-label opacity-60">Industry-Grade Analytics</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-neon-cyan/50 rounded-xl px-4 py-3 text-white outline-none transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-neon-cyan/50 rounded-xl px-4 py-3 text-white outline-none transition-all"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-purple/80 hover:to-neon-cyan/80 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />)}
            {isLogin ? 'INITIALIZE SESSION' : 'CREATE PROTOCOL'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 text-xs hover:text-neon-cyan transition-colors font-label tracking-wider"
          >
            {isLogin ? "NEW OPERATOR? CREATE ACCOUNT" : "EXISTING OPERATOR? LOG IN"}
          </button>
        </div>
      </div>
    </div>
  );
};
