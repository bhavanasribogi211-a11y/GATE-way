import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BRANCHES_INFO } from '../data/branchesData';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Volume2,
  VolumeX,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Zap,
} from 'lucide-react';

const DEFAULT_N8N_WEBHOOK = 'https://bhavana21.app.n8n.cloud/webhook/a261534d-90e9-4f50-bc50-21632a487b78/chat';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  error?: boolean;
}

export const AIChatbot: React.FC = () => {
  const { isChatbotOpen, setIsChatbotOpen, selectedBranch, user } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('gate_n8n_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: `Hello! 👋 I'm your **GATE Prep AI Assistant**, powered by n8n.

I can help you with:
• **Topic breakdowns & formulas** for your engineering branch
• **Doubt clearing** and previous year GATE question strategies
• **Study planning & revision tactics** to maximize your score
• **Negative marking reduction** techniques for MCQ/MSQ/NAT

What topic or question are you preparing today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    let sid = localStorage.getItem('gate_n8n_chat_session_id');
    if (!sid) {
      sid = 'gate_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      localStorage.setItem('gate_n8n_chat_session_id', sid);
    }
    return sid;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentBranchInfo = BRANCHES_INFO.find(b => b.code === selectedBranch) || BRANCHES_INFO[0];

  // Save messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem('gate_n8n_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Unable to save chat history:', e);
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isChatbotOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatbotOpen, isLoading]);

  // Auto focus input when opened
  useEffect(() => {
    if (isChatbotOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isChatbotOpen]);

  // Play subtle chime on bot answer
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // ignore audio context restrictions
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsgId = 'msg-user-' + Date.now();
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsLoading(true);

    // Build context prefix if enabled
    let fullPrompt = text;
    if (includeContext) {
      const branchName = currentBranchInfo.name;
      const branchCode = currentBranchInfo.code;
      const targetYear = user?.targetYear || 2027;
      const studentLevel = user?.prepLevel || 'Intermediate';

      fullPrompt = `[Student Context: GATE Paper: ${branchCode} (${branchName}), Target Year: ${targetYear}, Level: ${studentLevel}]\nQuestion: ${text}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 65000); // 65s timeout for deep queries

      const response = await fetch(DEFAULT_N8N_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          chatInput: fullPrompt,
          action: 'sendMessage',
          sessionId: sessionId,
          metadata: {
            branch: selectedBranch,
            targetYear: user?.targetYear || 2027,
            userName: user?.name || 'Aspirant',
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let botReply = '';

      if (typeof data === 'string') {
        botReply = data;
      } else if (data.output && typeof data.output === 'string') {
        botReply = data.output;
      } else if (data.text && typeof data.text === 'string') {
        botReply = data.text;
      } else if (data.message && typeof data.message === 'string') {
        botReply = data.message;
      } else if (Array.isArray(data) && data[0]?.output) {
        botReply = data[0].output;
      } else if (data.response && typeof data.response === 'string') {
        botReply = data.response;
      } else {
        botReply = JSON.stringify(data, null, 2);
      }

      const botMsg: ChatMessage = {
        id: 'msg-bot-' + Date.now(),
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
      playNotificationSound();
    } catch (err: unknown) {
      console.error('n8n chat error:', err);
      let errorMsg = 'Failed to connect to n8n webhook. Please verify your internet connection or retry.';
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMsg = 'The n8n AI agent took more than 60 seconds to respond. Please ask again or try a shorter prompt.';
        } else {
          errorMsg = err.message;
        }
      }

      const errorBotMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'bot',
        text: `⚠️ **Connection Issue**: ${errorMsg}\n\nYou can click **Retry** below or reset the conversation session.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
      };

      setMessages(prev => [...prev, errorBotMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChatSession = () => {
    const newSid = 'gate_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    setSessionId(newSid);
    localStorage.setItem('gate_n8n_chat_session_id', newSid);
    setMessages([
      {
        id: 'msg-welcome-new',
        sender: 'bot',
        text: `New study session started! 🚀 
Target Paper: **${currentBranchInfo.name} (${selectedBranch})** • GATE ${user?.targetYear || 2027}.

How can I help you right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    {
      title: 'High-Yield Topics',
      prompt: `What are the top 5 highest-scoring topics in GATE ${selectedBranch} that I must master first?`,
      icon: Zap,
    },
    {
      title: 'Engg Math Sheet',
      prompt: `Summarize the essential formulas for Linear Algebra and Calculus in GATE ${selectedBranch}.`,
      icon: BookOpen,
    },
    {
      title: 'NAT Question Tactics',
      prompt: `How should I approach Numerical Answer Type (NAT) questions to avoid calculation errors?`,
      icon: HelpCircle,
    },
    {
      title: 'Daily Study Schedule',
      prompt: `Give me a focused 4-hour daily study routine covering syllabus, practice, and revision.`,
      icon: Sparkles,
    },
  ];

  // Helper to format text with simple markdown-like rendering
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');

    return (
      <div className="space-y-1.5 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          // Empty line
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Bullet points
          if (line.trim().startsWith('•') || line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const cleanContent = line.trim().replace(/^[•*-]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-indigo-500 dark:text-indigo-400 font-bold">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineStyles(cleanContent) }} />
              </div>
            );
          }

          // Numbered list
          if (/^\d+\.\s/.test(line.trim())) {
            const num = line.trim().match(/^(\d+)\./)?.[1] || '1';
            const cleanContent = line.trim().replace(/^\d+\.\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold min-w-[1.2rem]">{num}.</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineStyles(cleanContent) }} />
              </div>
            );
          }

          // Headings
          if (line.trim().startsWith('###')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-2 mb-1">
                {line.replace(/^###\s*/, '')}
              </h4>
            );
          }
          if (line.trim().startsWith('##')) {
            return (
              <h3 key={idx} className="font-bold text-slate-900 dark:text-slate-100 text-base mt-2 mb-1 border-b border-slate-200 dark:border-slate-700 pb-1">
                {line.replace(/^##\s*/, '')}
              </h3>
            );
          }

          // Code block indicator
          if (line.trim().startsWith('```')) {
            return null; // Handled simply
          }

          // Standard paragraph
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineStyles(line) }} />
          );
        })}
      </div>
    );
  };

  const formatInlineStyles = (str: string) => {
    // Replace **bold** with <strong>
    let res = str.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>');
    // Replace `code` with styled <code>
    res = res.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 font-mono text-xs">$1</code>');
    return res;
  };

  return (
    <>
      {/* Floating Chat Launcher Button (Bottom Right) */}
      {!isChatbotOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center group">
          <div className="absolute right-full mr-3 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-medium shadow-lg backdrop-blur pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ask GATE AI Assistant</span>
          </div>

          <button
            onClick={() => setIsChatbotOpen(true)}
            className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-purple-600 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
            aria-label="Open GATE AI Chatbot"
          >
            {/* Pulsing ring */}
            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-40 blur-sm animate-pulse" />
            
            <Bot className="relative w-7 h-7" />

            {/* Live Indicator Dot */}
            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Window */}
      {isChatbotOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden ${
            isExpanded
              ? 'inset-4 sm:inset-10 md:inset-x-20 md:inset-y-12'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[440px] h-[640px] max-h-[88vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-indigo-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm leading-tight">GATE Prep AI Mentor</h3>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                    Live n8n
                  </span>
                </div>
                <p className="text-[11px] text-indigo-100/90 leading-tight">
                  {currentBranchInfo.shortName} • GATE {user?.targetYear || 2027}
                </p>
              </div>
            </div>

            {/* Header Control Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                title={soundEnabled ? 'Mute Chime' : 'Unmute Chime'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-60" />}
              </button>

              <button
                onClick={resetChatSession}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                title="Restart Chat Session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:inline-flex p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                title={isExpanded ? 'Minimize Window' : 'Expand Window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsChatbotOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Pill & Webhook status strip */}
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-indigo-50/80 dark:bg-slate-800/80 border-b border-indigo-100 dark:border-slate-800 text-[11px]">
            <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeContext}
                onChange={e => setIncludeContext(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5"
              />
              <span>Include {selectedBranch} syllabus context</span>
            </label>

            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Webhook info</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Webhook info drawer */}
          {showConfig && (
            <div className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Connected Agent Webhook:</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  200 OK
                </span>
              </div>
              <div className="p-1.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px] text-slate-500 dark:text-slate-400 break-all select-all border border-slate-200 dark:border-slate-700">
                {DEFAULT_N8N_WEBHOOK}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Session ID: {sessionId.substring(0, 18)}...</span>
                <button
                  onClick={resetChatSession}
                  className="text-indigo-600 dark:text-indigo-400 underline font-medium"
                >
                  Generate New Session
                </button>
              </div>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[80%]">
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mb-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`relative rounded-2xl px-3.5 py-2.5 shadow-sm group ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                        : msg.error
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-900 rounded-bl-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                    }`}
                  >
                    {renderFormattedText(msg.text)}

                    {/* Copy button */}
                    {msg.sender === 'bot' && !msg.error && (
                      <div className="mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-[10px]">{msg.timestamp}</span>
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                          title="Copy Answer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {msg.error && (
                      <div className="mt-2 pt-1.5 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                        <button
                          onClick={() => handleSendMessage()}
                          className="text-xs font-semibold text-rose-700 dark:text-rose-300 underline"
                        >
                          Retry
                        </button>
                        <span className="text-[10px] text-rose-400">{msg.timestamp}</span>
                      </div>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <span className="text-[10px] text-slate-400 mt-1 mr-1">{msg.timestamp}</span>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-end gap-2 max-w-[85%]">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                    AI Mentor is computing response...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Quick:
              </span>
              {quickPrompts.map((qp, idx) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp.prompt)}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition shadow-xs disabled:opacity-50"
                  >
                    <Icon className="w-3 h-3 text-indigo-500" />
                    <span>{qp.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Form */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask a doubt in ${selectedBranch}, PYQ, or formula...`}
                  rows={2}
                  disabled={isLoading}
                  className="w-full resize-none px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <span className="absolute bottom-1 right-2 text-[10px] text-slate-400 hidden sm:inline">
                  ↵ Enter to send
                </span>
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
