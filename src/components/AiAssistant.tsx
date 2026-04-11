import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ArrowUp, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

type Message = { role: 'user' | 'assistant'; content: string };

export default function AiAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic context based on current route
  let contextInsight = "";
  let suggestedPrompts: string[] = [];
  let systemContext = "";

  if (location.pathname.includes('/app/team')) {
    contextInsight = "Looking at the collaboration graph, I noticed Marketing is operating in isolation this week, and Design-to-Engineering handoffs are delayed. Would you like me to draft a quick alignment update?";
    systemContext = "The user is viewing Team Insights. Marketing is isolated. Design-to-Engineering handoffs are delayed. You are the Founder Assistant agent within KarmaOS, an expert workforce intelligence AI.";
    suggestedPrompts = [
      "Why is Marketing isolated?",
      "Show me the delayed handoffs.",
      "Draft an alignment update."
    ];
  } else if (location.pathname.includes('/app/talent')) {
    contextInsight = "The Recruiter Agent has screened 42 candidates for the Senior Backend role. Two candidates strongly match the 'High Deep Work' DNA profile of your current top performers.";
    systemContext = "The user is viewing Talent Intelligence. The Recruiter Agent has screened 42 candidates for Senior Backend. 2 match the 'High Deep Work' DNA profile. You are the Founder Assistant agent within KarmaOS.";
    suggestedPrompts = [
      "Show me the top DNA matches.",
      "What is the status of the PM role?",
      "Any interview friction detected?"
    ];
  } else if (location.pathname.includes('/app/employee/1')) {
    contextInsight = "Alex scored 95% on the technical screen during hiring. His current output perfectly matches expectations. His high deep work ratio confirms the 'Maker' DNA profile identified by the Recruiter Agent.";
    systemContext = "The user is viewing Alex Chen's profile (Senior Engineer). He scored 95% in hiring. His Work DNA is 'Maker'. He has 65% deep work and is highly productive. His post-hire performance matches his hiring signals. You are the Founder Assistant agent within KarmaOS.";
    suggestedPrompts = [
      "What is Alex currently building?",
      "Does his output match his hiring score?",
      "Are there any upcoming meetings I should cancel for him?"
    ];
  } else if (location.pathname.includes('/app/employee/2')) {
    contextInsight = "Sarah scored highly on cross-functional communication during hiring. However, current data shows severe context-switching fatigue. The Operations Agent suggests she is trapped in low-impact alignment meetings.";
    systemContext = "The user is viewing Sarah Miller's profile (Product Manager). She scored highly in communication during hiring. Her Work DNA is 'Synchronizer'. She has 18 meetings, high context-switching, and high burnout risk. There is a mismatch between her hiring expectations and her current reality. You are the Founder Assistant agent within KarmaOS.";
    suggestedPrompts = [
      "Which of Sarah's meetings can be async?",
      "Why is there a mismatch with her hiring data?",
      "Draft a message suggesting she take time off."
    ];
  } else {
    // Default / Dashboard
    contextInsight = "I'm orchestrating data from the Recruiter Agent, Analyst Agent, and Operations Agent. Engineering is highly focused, but they are currently blocked on design approvals for the new checkout flow.";
    systemContext = "The user is viewing the main Dashboard. You are the Founder Assistant agent within KarmaOS. KarmaOS is an AI Workforce Operating System that combines Talent Intelligence (hiring) and Work Intelligence (post-hire performance). Engineering is focused but blocked on Design approvals for the checkout flow. Keep responses concise, insightful, and focused on the connection between hiring and actual work output.";
    suggestedPrompts = [
      "Which specific PRs are blocked?",
      "Who is the bottleneck in Design?",
      "Summarize this week's overall health."
    ];
  }

  // Initialize chat with context when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: contextInsight }]);
    }
  }, [isOpen, contextInsight, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg = text.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMsg,
        config: {
          systemInstruction: `You are the Founder Assistant agent within KarmaOS, an expert workforce intelligence AI. 
          Keep answers concise, professional, and insightful. Speak directly to the founder/manager.
          Do not use heavy markdown formatting unless necessary.
          Current Context: ${systemContext}`,
        }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "I couldn't process that." }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to my intelligence core." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/5 z-40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-8 right-8 w-[440px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-black/[0.04] z-50 overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black/60" />
                <span className="font-medium text-sm">Founder Assistant</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-black/[0.04] rounded-full transition-colors">
                <X className="w-4 h-4 text-black/40" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 min-h-[300px]">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {msg.role === 'assistant' && <div className="text-sm text-black/40 font-medium px-4">Founder Assistant</div>}
                  <div className={`border border-black/[0.04] p-4 text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-black text-white rounded-2xl rounded-tr-none'
                    : 'bg-[#FAFAFA] text-black/80 rounded-2xl rounded-tl-none'
                    }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2 items-start">
                  <div className="text-sm text-black/40 font-medium px-4">Founder Assistant</div>
                  <div className="bg-[#FAFAFA] border border-black/[0.04] rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-black/40" />
                    <span className="text-sm text-black/40">Thinking...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />

              {/* Suggested Prompts - Only show if it's just the initial message */}
              {messages.length <= 1 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col gap-2 mt-auto pt-4"
                >
                  {suggestedPrompts.map((text, i) => (
                    <SuggestedPrompt key={i} text={text} onClick={() => { handleSend(text); }} />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-black/[0.04] bg-[#FAFAFA]/50 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(query)}
                  placeholder="Ask anything about your team..."
                  className="w-full bg-white border border-black/[0.08] rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/5 transition-all shadow-sm"
                />
                <button
                  onClick={() => handleSend(query)}
                  disabled={isLoading || !query.trim()}
                  className={`absolute right-2 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${query.trim() && !isLoading ? 'bg-black text-white hover:bg-black/90' : 'bg-black/5 text-black/20 cursor-not-allowed'
                    }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SuggestedPrompt({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left px-4 py-3 rounded-xl border border-black/[0.04] bg-white hover:bg-[#FAFAFA] hover:border-black/[0.08] transition-all text-sm text-black/60 hover:text-black"
    >
      {text}
    </button>
  );
}
