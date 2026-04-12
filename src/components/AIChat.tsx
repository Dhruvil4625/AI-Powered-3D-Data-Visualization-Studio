import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const AIChat: React.FC = () => {
  const [input, setInput] = useState('');
  const { setData, datasetId, token, chatHistory, addChatMessage, isAiThinking, setIsAiThinking, setChartConfig, columns } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isAiThinking]);

  const handleQuickAction = async (action: string) => {
    if (!datasetId) return;
    setIsAiThinking(true);
    addChatMessage({ role: 'user', content: `Run Fix: ${action}` });
    try {
      const response = await fetch('http://localhost:8000/api/apply-fix/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ dataset_id: useAppStore.getState().datasetId, action })
      });
      const result = await response.json();
      if (response.ok) {
        // Use undefined for datasetId to keep the existing one in the store
        setData(result.data, Object.keys(result.data[0] || {}), undefined, result.cleaning_stats);
        
        let colorAxis = undefined;
        if (Object.keys(result.data[0] || {}).includes('cluster')) {
           colorAxis = 'cluster';
        }
        
        if (result.numeric_columns && result.numeric_columns.length >= 3) {
          setChartConfig({ type: 'scatter', xAxis: result.numeric_columns[0], yAxis: result.numeric_columns[1], zAxis: result.numeric_columns[2], colorAxis });
        } else if (result.numeric_columns && result.numeric_columns.length > 0) {
          setChartConfig({ type: 'scatter', xAxis: result.numeric_columns[0], yAxis: result.numeric_columns[0], zAxis: result.numeric_columns[0], colorAxis });
        }
        
        addChatMessage({
          role: 'assistant',
          content: `Success! I have executed the **${action}** protocol and mapped the optimized topology.`
        });
      } else {
        addChatMessage({ role: 'assistant', content: `Kinetic API Error: ${result.error}` });
      }
    } catch (e) {
      addChatMessage({ role: 'assistant', content: 'Connection failed during processing.' });
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isAiThinking || !datasetId) return;

    const userMsg = input.trim();
    setInput('');
    addChatMessage({ role: 'user', content: userMsg });
    setIsAiThinking(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat-with-data/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dataset_id: useAppStore.getState().datasetId, prompt: userMsg })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        let aiReply = result.reply;
        let suggestionsList = undefined;
        try {
          const parsed = JSON.parse(aiReply);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type === 'suggestion') {
               aiReply = "I have some suggestions based on the analysis:";
               suggestionsList = parsed;
          }
        } catch (e) {
          // Keep raw string
        }

        const lowerQuery = userMsg.toLowerCase();
        if (columns.length >= 3) {
          if (lowerQuery.includes('scatter')) {
             setChartConfig({ type: 'scatter', xAxis: columns[0], yAxis: columns[1], zAxis: columns[2]});
          } else if (lowerQuery.includes('bar')) {
             setChartConfig({ type: 'bar', xAxis: columns[0], yAxis: columns[1], zAxis: columns[2]});
          } else if (lowerQuery.includes('line')) {
             setChartConfig({ type: 'line', xAxis: columns[0], yAxis: columns[1], zAxis: columns[2]});
          } else if (lowerQuery.includes('surface')) {
             setChartConfig({ type: 'surface', xAxis: columns[0], yAxis: columns[1], zAxis: columns[2]});
          }
        }

        addChatMessage({ role: 'assistant', content: aiReply, suggestions: suggestionsList });
      } else {
        addChatMessage({ role: 'assistant', content: `API Error: ${result.error}` });
      }
    } catch (error) {
      addChatMessage({ role: 'assistant', content: 'Connection to API failed. Ensure Django server is running.' });
    } finally {
      setIsAiThinking(false);
    }
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
                
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2">
                    {msg.suggestions.map((s, idx) => (
                      <div key={idx} className="bg-slate-800 p-3 rounded border border-neon-purple/40">
                        <h4 className="font-bold text-neon-teal text-xs mb-1">{s.title}</h4>
                        <p className="text-[10px] text-slate-400 mb-3">{s.description}</p>
                        <button 
                          onClick={() => handleQuickAction(s.action)}
                          className="px-4 py-2 bg-neon-purple/20 hover:bg-neon-purple text-white text-xs rounded transition-all w-full uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                        >
                          {s.actionLabel || 'Fix Now'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
