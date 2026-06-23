import React, { useState, useRef, useEffect } from 'react';
import { Holding, CopilotMessage } from '../types';
import { generateAIResponse } from '../lib/analytics';
import { MessageSquare, Send, User, Zap, RotateCcw } from 'lucide-react';

const STARTER_PROMPTS = [
  'Can my portfolio survive a recession?',
  'How diversified am I across sectors?',
  'Which stocks are creating the most risk?',
  'What should I rebalance right now?',
  'How will inflation affect my portfolio?',
  'Should I reduce my crypto allocation?',
];

interface CopilotViewProps {
  holdings: Holding[];
}

function MessageBubble({ msg }: { msg: CopilotMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-slide-up`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser
          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
          : 'bg-gradient-to-br from-slate-700 to-slate-800 border border-[#2a3f5a]'
      }`}>
        {isUser ? <User size={13} /> : <Zap size={13} className="text-cyan-400" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-sm'
            : 'bg-[#1a2332] border border-[#1e2d40] text-slate-200 rounded-tl-sm'
        }`}>
          {msg.content}
        </div>
      </div>
    </div>
  );
}

export default function CopilotView({ holdings }: CopilotViewProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hello! I'm your AlphaTwin AI Copilot. I have full access to your portfolio and can answer questions about risk, performance, diversification, and investment strategy.\n\nYou have ${holdings.length} holdings worth analyzing. What would you like to know?`,
      created_at: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  async function sendMessage(text: string) {
    if (!text.trim() || thinking || holdings.length === 0) return;
    const userMsg: CopilotMessage = { id: Date.now().toString(), role: 'user', content: text.trim(), created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const response = generateAIResponse(text, holdings);
    const aiMsg: CopilotMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, aiMsg]);
    setThinking(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in">
      <div className="mb-4">
        <h1 className="font-display font-bold text-2xl text-white">AI Investment Copilot</h1>
        <p className="text-slate-400 text-sm mt-1">Ask anything about your portfolio — risk, strategy, rebalancing, market scenarios</p>
      </div>

      {holdings.length === 0 ? (
        <div className="card p-16 text-center flex-1">
          <MessageSquare size={40} className="text-slate-600 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-white mb-2">Add portfolio holdings first</h3>
          <p className="text-slate-400 text-sm">The AI Copilot needs your holdings to provide personalized analysis.</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 card overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {thinking && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-[#2a3f5a] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap size={13} className="text-cyan-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#1a2332] border border-[#1e2d40]">
                  <div className="flex gap-1.5 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Starter Prompts */}
          {messages.length === 1 && (
            <div className="px-6 pb-3">
              <div className="text-xs text-slate-500 mb-2">Suggested questions</div>
              <div className="flex flex-wrap gap-2">
                {STARTER_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[#1e2d40] text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-cyan-500/5 transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-[#1e2d40]">
            <div className="flex gap-2">
              <textarea
                className="input-field flex-1 resize-none h-10 pt-2.5 leading-5"
                placeholder="Ask about your portfolio... (Enter to send)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="btn-primary px-3 flex items-center justify-center flex-shrink-0"
                onClick={() => sendMessage(input)}
                disabled={thinking || !input.trim()}
              >
                <Send size={15} />
              </button>
              <button
                className="btn-ghost px-3 flex items-center justify-center flex-shrink-0"
                onClick={() => setMessages([{
                  id: '0', role: 'assistant',
                  content: `Conversation cleared. I'm ready to analyze your ${holdings.length}-holding portfolio again.`,
                  created_at: new Date().toISOString()
                }])}
                title="Clear chat"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
