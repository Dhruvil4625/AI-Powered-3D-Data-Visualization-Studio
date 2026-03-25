import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const AIChat: React.FC = () => {
  const [input, setInput] = useState('');
  const { chatHistory, addChatMessage, isAiThinking, setIsAiThinking, setChartConfig, columns } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isAiThinking]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isAiThinking) return;

    const userMsg = input.trim();
    setInput('');
    addChatMessage({ role: 'user', content: userMsg });
    setIsAiThinking(true);

    // Simulate AI processing
    setTimeout(() => {
      let aiResponse = "I've updated the visualization based on your request. Let me know what you want to see next.";
      
      // Extremely basic mock logic for demonstration
      const lowerQuery = userMsg.toLowerCase();
      
      if (columns.length >= 3 && lowerQuery.includes('scatter')) {
         setChartConfig({ type: 'scatter', xAxis: columns[0], yAxis: columns[1], zAxis: columns[2]});
         aiResponse = `I've switched the view to a 3D scatter plot using ${columns[0]}, ${columns[1]}, and ${columns[2]}.`;
      } 
      // Add more mock capabilities as needed
      
      addChatMessage({ role: 'assistant', content: aiResponse });
      setIsAiThinking(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <h2 className="text-neon-purple font-semibold text-lg mb-4 tracking-wide drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-neon-purple" /> AI Assistant
      </h2>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-start gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`shrink-0 p-1.5 rounded-full ${msg.role === 'user' ? 'bg-neon-teal/20 text-neon-teal' : 'bg-neon-purple/20 text-neon-purple'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-lg text-sm border shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 rounded-tr-none' 
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 rounded-tl-none'}
              `}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        
        {isAiThinking && (
          <div className="flex items-start gap-2 max-w-[90%] flex-row">
            <div className="shrink-0 p-1.5 rounded-full bg-neon-purple/20 text-neon-purple">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-lg text-sm border bg-slate-900/80 border-slate-700 text-slate-300 rounded-tl-none flex items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin text-neon-purple" />
               <span className="animate-pulse">Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="mt-auto relative">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI..."
          className="w-full bg-slate-900/80 border border-slate-700 focus:border-neon-purple/70 rounded-lg pl-3 pr-10 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-[0_4px_10px_rgba(0,0,0,0.2)] focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:ring-1 focus:ring-neon-purple"
          disabled={isAiThinking}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isAiThinking}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-neon-purple hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
