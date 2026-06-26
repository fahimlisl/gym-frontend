import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, X, Send } from "lucide-react";

const WEBHOOK_URL = import.meta.env.VITE_N8N_CHATBOT_WEBHOOK_URL;

function generateSessionId() {
  return "session_" + Math.random().toString(36).slice(2) + Date.now();
}

function BotIcon() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center shadow-lg shadow-red-600/20">
      <Bot size={18} className="text-white" />
    </div>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-red-500/70 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hey! 👋 I'm Alpha Gym's AI assistant. Ask me anything — memberships, trainers, timings, or anything else.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionId = useRef(generateSessionId());
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Show welcome popup when user first visits
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      // Show welcome after 2 seconds
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 2000);
      
      // Auto-hide welcome after 8 seconds
      const hideTimer = setTimeout(() => {
        setShowWelcome(false);
        sessionStorage.setItem("hasSeenWelcome", "true");
      }, 8000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const closeWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem("hasSeenWelcome", "true");
  };

  const handleQuickAction = (text) => {
    setInput(text);
    closeWelcome();
    setOpen(true);
    // Focus input after chat opens
    setTimeout(() => inputRef.current?.focus(), 400);
  };

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatInput: text,
          sessionId: sessionId.current,
        }),
      });

      const data = await res.json();
      const reply =
        data?.output ||
        data?.text ||
        data?.message ||
        "Sorry, I couldn't get a response. Try again!";

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcome && !open && (
          <motion.div
            key="welcome-popup"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 max-w-xs sm:max-w-sm"
          >
            <div className="relative bg-gradient-to-br from-neutral-900 via-black to-neutral-900 border border-red-500/30 rounded-2xl p-4 shadow-2xl shadow-red-500/10">
              {/* Close button */}
              <button 
                onClick={closeWelcome}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-lg"
              >
                <X size={14} />
              </button>
              
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-widest text-white">
                    AI <span className="text-red-500">Assistant</span>
                  </h3>
                  <p className="text-[10px] text-gray-400">Online • Ready to help</p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-3 mb-3">
                <div className="flex items-start gap-2">
                  <Sparkles size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-200 leading-relaxed">
                    Hi there! 👋 I'm your AI assistant. How may I help you today?
                  </p>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleQuickAction("Tell me about gym memberships and pricing")}
                  className="text-[10px] px-3 py-1.5 rounded-full border border-white/10 hover:border-red-500/50 text-gray-300 hover:text-white transition-all hover:bg-red-500/10"
                >
                  💪 Memberships
                </button>
                <button 
                  onClick={() => handleQuickAction("What are your working hours?")}
                  className="text-[10px] px-3 py-1.5 rounded-full border border-white/10 hover:border-red-500/50 text-gray-300 hover:text-white transition-all hover:bg-red-500/10"
                >
                  🕐 Hours
                </button>
                <button 
                  onClick={() => handleQuickAction("Tell me about personal training")}
                  className="text-[10px] px-3 py-1.5 rounded-full border border-white/10 hover:border-red-500/50 text-gray-300 hover:text-white transition-all hover:bg-red-500/10"
                >
                  🏋️ Training
                </button>
                <button 
                  onClick={() => handleQuickAction("Do you have any offers or discounts?")}
                  className="text-[10px] px-3 py-1.5 rounded-full border border-white/10 hover:border-red-500/50 text-gray-300 hover:text-white transition-all hover:bg-red-500/10"
                >
                  🎯 Offers
                </button>
              </div>

              {/* Decorative pulse ring */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-2xl -z-10 blur-sm"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08]"
            style={{ height: "min(520px, 75vh)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600/20 to-purple-600/20 border-b border-white/[0.08] shrink-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">AlphaGym AI</p>
                <p className="text-[10px] text-white/40 tracking-wide uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
                  Online
                </p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  // Show welcome again when chat is closed if not seen
                  if (!sessionStorage.getItem("hasSeenWelcome")) {
                    setTimeout(() => setShowWelcome(true), 300);
                  }
                }}
                className="text-white/40 hover:text-white/80 transition-colors p-1"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-neutral-950 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "bot" && <BotIcon />}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-red-600 text-white rounded-tr-sm"
                        : "bg-neutral-800 text-white/90 rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-2">
                  <BotIcon />
                  <div className="bg-neutral-800 rounded-2xl rounded-tl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 bg-neutral-900 border-t border-white/[0.08] shrink-0">
              <div className="flex items-end gap-2 bg-neutral-800 rounded-xl px-3 py-2 border border-white/[0.06] focus-within:border-red-500/40 transition-colors">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
                  }}
                  onKeyDown={handleKey}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 resize-none outline-none leading-relaxed py-0.5 max-h-24 scrollbar-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="shrink-0 w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-600/30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white mb-0.5"
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </div>
              <p className="text-center text-[9px] text-white/20 mt-1.5 tracking-wider uppercase">
                Powered by AlphaGym AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Trigger */}
      <motion.button
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) {
            setShowWelcome(false);
            sessionStorage.setItem("hasSeenWelcome", "true");
          }
        }}
        className="fixed bottom-5 right-4 sm:right-6 z-50 group"
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <div className="relative">
          {/* Pulse ring */}
          {!open && (
            <div className="absolute inset-0 rounded-full bg-red-600/30 animate-ping"></div>
          )}
          
          {/* Button */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-600/30 flex items-center justify-center transition-all">
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <X size={24} className="text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="relative"
                >
                  <Bot size={28} className="text-white" />
                  <div className="absolute -top-1 -right-1">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.button>
    </>
  );
}