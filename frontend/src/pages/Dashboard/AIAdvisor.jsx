import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bot, Send, User, Sparkles, TrendingUp, AlertTriangle, ChevronRight, Zap } from 'lucide-react';

const TypewriterText = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 10); // Speed of typing
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, onComplete]);

  const parseMarkdownLocal = (text) => {
    if (!text) return '';
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-on-surface mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-on-surface mt-5 mb-2 border-b border-glass-border pb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-primary mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-on-surface">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic opacity-90">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1 border-l-2 border-primary/30 pl-2 list-none font-medium">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1 list-decimal font-medium">$1</li>')
      .replace(/`([^`]+)`/gim, '<code class="bg-surface-lowest text-secondary px-1 py-0.5 rounded text-xs font-mono">$1</code>');
  };

  return (
    <div 
      className="markdown-content ai-response-content space-y-2 [&_ul]:space-y-1 [&_ol]:space-y-1" 
      dangerouslySetInnerHTML={{ __html: `<p class="leading-relaxed text-sm font-medium text-on-surface-variant">${parseMarkdownLocal(displayedText)}</p>` }} 
    />
  );
};

const AIAdvisor = () => {
  const { user, API } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'ai', 
      content: `Hi **${user?.fullName || 'there'}**! I'm your AI financial advisor.\n\nI've analyzed your recent financial data and I'm ready to help you save more and spend smarter. Ask me anything!`,
      isNew: false
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { 
    const timeout = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, loading]);

  const sendMessage = async (overrideInput) => {
    const messageText = overrideInput || input;
    if (!messageText.trim()) return;

    const userMsg = { 
      role: 'user', 
      content: messageText, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/v1/ai/chat`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include',
        body: JSON.stringify({ message: messageText }),
      });
      
      if (!res.ok) throw new Error('AI service unavailable');
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.reply || data.message, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNew: true 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "I'm having a little trouble connecting. Could you please try again?", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNew: true
      }]);
    } finally { 
      setLoading(false); 
    }
  };

  const quickActions = [
    { label: 'Deep Health Audit', icon: Zap, color: 'text-primary' },
    { label: 'Spend Breakdown', icon: TrendingUp, color: 'text-secondary' },
    { label: 'Save Money Tips', icon: Sparkles, color: 'text-success' },
  ];

  return (
    <div className="page-container animate-fade-in-up pb-10">

      {/* Dashboard Style Header */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">AI Assistant</span>
          </div>
          <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">AI Advisor</h1>
          <p className="page-subtitle text-sm mt-1 text-on-surface-variant">Get smart financial advice and spending insights.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:h-[calc(100vh-280px)] lg:min-h-[650px] flex-1">
        
        {/* Chat Section - Expanded to col-span-3 */}
        <section className="lg:col-span-3 flex flex-col min-h-0 stat-card !p-0 overflow-hidden relative shadow-2xl shadow-primary/5">
          
          {/* Mobile Suggestions Bar (Horizontal Scroll) */}
          <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-2 px-4 py-3 bg-surface-container/30 border-b border-glass-border shrink-0">
            {[
              { label: 'Check savings', icon: TrendingUp },
              { label: 'Save more', icon: Sparkles },
              { label: 'Audit expenses', icon: ChevronRight }
            ].map((tip, idx) => (
              <button 
                key={idx} 
                onClick={() => sendMessage(tip.label)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-lowest border border-glass-border whitespace-nowrap text-[11px] font-bold text-on-surface-variant hover:text-primary transition-all active:scale-95 shadow-sm"
              >
                <tip.icon size={11} className="text-primary/60" />
                {tip.label}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-8 p-6 sm:p-10 min-h-0 relative z-0 style-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-glass-border ${msg.role === 'ai' ? 'bg-primary/5 text-primary' : 'bg-surface-high text-on-surface-variant'}`}>
                  {msg.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className={`max-w-[85%] sm:max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`px-5 py-4 ${msg.role === 'ai'
                    ? 'bg-surface-lowest text-on-surface rounded-2xl border border-glass-border shadow-sm'
                    : 'bg-primary text-on-primary rounded-2xl shadow-lg shadow-primary/10'}`}>
                    
                    {msg.role === 'user' ? (
                      <p className="text-[13px] font-bold leading-relaxed">{msg.content}</p>
                    ) : (
                      msg.isNew ? (
                        <TypewriterText 
                          text={msg.content} 
                          onComplete={() => {
                            const newMessages = [...messages];
                            newMessages[i].isNew = false;
                            setMessages(newMessages);
                          }}
                        />
                      ) : (
                        <div 
                          className="markdown-content ai-response-content space-y-2 [&_ul]:space-y-1 [&_ol]:space-y-1" 
                          dangerouslySetInnerHTML={{ __html: `<p class="leading-relaxed text-sm font-medium text-on-surface-variant">${msg.content.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>').replace(/\n\n/gim, '</p><p>')}</p>` }} 
                        />
                      )
                    )}

                  </div>
                  <span className="text-[9px] text-on-surface-variant font-bold mt-2 px-1 block opacity-40 uppercase tracking-widest">{msg.time}</span>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4 animate-fade-in">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20"><Bot size={18} className="text-primary" /></div>
                <div className="bg-surface-container/50 px-6 py-4 rounded-3xl rounded-tl-sm border border-glass-border flex items-center gap-2 shadow-sm italic text-xs text-on-surface-variant font-bold">
                  <span>Generating insights</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-primary animate-bounce" />
                    <div className="w-1 h-1 rounded-full bg-primary animate-bounce delay-100" />
                    <div className="w-1 h-1 rounded-full bg-primary animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="bg-surface-container/50 p-4 sm:p-6 border-t border-glass-border shrink-0 z-10 backdrop-blur-xl">
             {/* Quick Actions */}
             {messages.length <= 1 && (
               <div className="flex flex-wrap gap-2 mb-4 justify-center">
                 {quickActions.map((action, idx) => (
                   <button 
                     key={idx} 
                     onClick={() => sendMessage(action.label === 'Deep Health Audit' ? "Run a comprehensive audit on my finances." : action.label)} 
                     className={`flex items-center gap-2 bg-surface-lowest text-on-surface hover:bg-primary hover:text-white border border-glass-border hover:border-primary px-4 py-2 rounded-2xl transition-all group`}
                   >
                     <action.icon size={13} className={`${action.color} group-hover:text-white transition-colors`} />
                     <span className="text-[10px] uppercase tracking-widest font-black">{action.label}</span>
                   </button>
                 ))}
               </div>
             )}

             <div className="max-w-4xl mx-auto flex items-center gap-3 bg-surface-lowest border border-glass-border rounded-xl p-1.5 focus-within:border-primary/50 shadow-sm transition-all focus-within:shadow-lg">
                <input
                  type="text"
                  className="bg-transparent border-none focus:ring-0 focus:outline-none text-on-surface flex-grow py-3 px-5 text-sm font-medium placeholder:text-on-surface-variant/40"
                  placeholder="Ask me anything about your money..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={loading}
                />
                <button 
                  onClick={() => sendMessage()} 
                  disabled={loading || !input.trim()} 
                  className="w-12 h-12 rounded-lg bg-primary hover:bg-primary-hover disabled:bg-surface-high text-on-primary flex items-center justify-center transition-all shadow-md active:scale-95 disabled:scale-100 disabled:opacity-30"
                >
                  <Send size={18} />
                </button>
             </div>
          </div>
        </section>

        {/* Sidebar Insights - Cleaned up */}
        <aside className="lg:col-span-1 space-y-6 hidden lg:block">
          <div className="stat-card space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Zap size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Suggestions</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Check my savings', icon: TrendingUp },
                { label: 'Tips to save more', icon: Sparkles },
                { label: 'Audit expenses', icon: ChevronRight }
              ].map((tip, idx) => (
                <button 
                  key={idx}
                  onClick={() => sendMessage(tip.label)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-low border border-glass-border hover:border-primary/40 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <tip.icon size={12} className="text-primary/60" />
                    <span className="text-[11px] font-bold text-on-surface-variant group-hover:text-on-surface">{tip.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">Assistant Status</h4>
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                     <span className="font-bold text-on-surface-variant uppercase">Data Sync</span>
                     <span className="text-success font-black">Ready</span>
                  </div>
                  <div className="w-full h-1 bg-surface-low rounded-full overflow-hidden">
                     <div className="w-full h-full bg-success"></div>
                  </div>
               </div>
               <p className="text-[10px] font-medium text-on-surface-variant leading-relaxed italic opacity-60">Synchronized with your real-time balance and spending logs.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AIAdvisor;

