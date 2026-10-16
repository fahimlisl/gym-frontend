import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../../api/axios.api";
import { Menu, X, Lock, LogOut, Home, Apple, Dumbbell, ChevronRight, History, ScanQrCode, MessageSquareWarning, Phone, Mail, Bot, ArrowUpRight, ArrowLeft, Send, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COMPLAINT_PHONE = "+91 77191 61307";
const COMPLAINT_PHONE_URI = "tel:+917719161307";
const COMPLAINT_EMAIL = "alphagym2001@gmail.com";
const COMPLAINT_CATEGORIES = [
  { value: "trainer", label: "Trainer" },
  { value: "equipment", label: "Equipment" },
  { value: "membership", label: "Membership" },
  { value: "personal_training", label: "Personal Training" },
  { value: "payment", label: "Payment" },
  { value: "website", label: "Website" },
  { value: "staff", label: "Staff" },
  { value: "other", label: "Other" },
];

const MEMBER_DESTINATIONS = [
  { label: "Dashboard", path: "/member/dashboard" },
  { label: "Diet Chart", path: "/member/diet-chart" },
  { label: "Workout Plans", path: "/member/workout-plans" },
  { label: "History", path: "/member/history" },
  { label: "Scan QR", path: "/member/scan-qr" },
];

const makeAiSessionId = () => crypto.randomUUID();
const initialAiMessages = () => [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi! I'm AlphaGym AI. Ask me about your membership, PT, renewals, or gym services. I can also help you prepare and submit a complaint.",
  },
];

const aiErrorMessage = (err, fallback) => {
  if (err?.response?.status === 401) return "Your login has expired. Please sign in again.";
  if (err?.response?.status === 403) return "Your account cannot access this assistant right now.";
  return err?.response?.data?.message || fallback;
};

const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(
  COMPLAINT_EMAIL
)}&su=${encodeURIComponent(
  "AlphaGym Member Complaint"
)}`;

export default function UserDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintView, setComplaintView] = useState("options");
  const [aiSessionId, setAiSessionId] = useState(makeAiSessionId);
  const [aiMessages, setAiMessages] = useState(initialAiMessages);
  const [aiDraft, setAiDraft] = useState("");
  const [aiInitState, setAiInitState] = useState("idle");
  const [aiInitError, setAiInitError] = useState("");
  const [aiSending, setAiSending] = useState(false);
  const [complaintDraft, setComplaintDraft] = useState(null);
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const complaintSubmitLock = useRef(false);
  const aiMessageListRef = useRef(null);

  const closeComplaintModal = () => {
    setShowComplaintModal(false);
    setComplaintView("options");
  };

  const startAiAssistant = async () => {
    setComplaintView("ai");
    if (aiInitState === "ready" || aiInitState === "loading") return;

    setAiInitState("loading");
    setAiInitError("");

    try {
      const { data } = await api.post("/user/ai/open");
      if (!data?.success) throw new Error("Member AI initialization failed");
      setAiInitState("ready");
    } catch (err) {
      setAiInitState("error");
      setAiInitError(aiErrorMessage(err, "Couldn't start AI Assistance. Please try again."));
    }
  };

  const sendAiMessage = async (event) => {
    event.preventDefault();
    const message = aiDraft.trim();
    if (!message || aiSending || complaintSubmitting || aiInitState !== "ready") return;
    if (message.length > 2000) {
      toast.error("Your message must be 2,000 characters or fewer.");
      return;
    }

    setComplaintDraft(null);
    setAiDraft("");
    setAiSending(true);
    setAiMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: message },
    ]);

    try {
      const { data } = await api.post("/user/ai/chat", {
        message,
        sessionId: aiSessionId,
      });

      if (!data?.success || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("Invalid reply from AI service");
      }

      const proposedPath = data?.action?.type === "navigate" ? data.action.path : null;
      const allowed = MEMBER_DESTINATIONS.find((item) => item.path === proposedPath);

      setAiMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: data.reply,
          action: allowed ? allowed : null,
        },
      ]);
      if (data.complaintDraft && data.complaintDraft.ready !== false &&
          COMPLAINT_CATEGORIES.some((cat) => cat.value === data.complaintDraft.category) &&
          typeof data.complaintDraft.description === "string" &&
          data.complaintDraft.description.trim().length >= 10) {
        setComplaintDraft({
          category: data.complaintDraft.category,
          description: data.complaintDraft.description.trim().slice(0, 2000),
        });
      }
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          error: true,
          text: aiErrorMessage(err, "I couldn't respond right now. Please try sending your message again."),
        },
      ]);
    } finally {
      setAiSending(false);
    }
  };

  const startNewAiChat = () => {
    if (aiSending || complaintSubmitting) return;
    setAiSessionId(makeAiSessionId());
    setAiMessages(initialAiMessages());
    setAiDraft("");
    setComplaintDraft(null);
    // Only reset conversation memory. Redis's member snapshot stays cached.
  };

  const openManualComplaintDraft = () => {
    // Manual fallback: never copy an unrelated chat message into a complaint.
    setComplaintDraft({ category: "other", description: "" });
  };

  const submitComplaint = async () => {
    if (complaintSubmitLock.current || aiSending || !complaintDraft) return;
    const description = complaintDraft.description.trim();
    if (description.length < 10 || description.length > 2000) {
      toast.error("Please describe your complaint in 10–2000 characters.");
      return;
    }
    if (!COMPLAINT_CATEGORIES.some((c) => c.value === complaintDraft.category)) {
      toast.error("Please select a valid category.");
      return;
    }

    complaintSubmitLock.current = true;
    setComplaintSubmitting(true);
    try {
      const { data } = await api.post("/user/ai/complaint", {
        category: complaintDraft.category,
        description,
      });
      if (!data?.success || !data.data?.complaintId) {
        throw new Error("Complaint confirmation missing");
      }
      setComplaintDraft(null);
      setAiMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `Your complaint has been submitted successfully.\n\nComplaint ID: ${data.data.complaintId}\nStatus: Open\n\nKeep this reference for your records.`,
        },
      ]);
      toast.success("Complaint submitted");
    } catch (err) {
      // Keep the draft so it can be reviewed or retried.
      toast.error(aiErrorMessage(err, "Could not save the complaint. Please try again."));
    } finally {
      complaintSubmitLock.current = false;
      setComplaintSubmitting(false);
    }
  };

  const navigateFromAi = (path) => {
    if (!MEMBER_DESTINATIONS.some((item) => item.path === path)) return;
    closeComplaintModal();
    navigate(path);
  };

  useEffect(() => {
    if (!showComplaintModal || complaintView !== "ai") return;
    const list = aiMessageListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [showComplaintModal, complaintView, aiMessages, aiSending, aiInitState]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();
  useEffect(() => {
    if (!showComplaintModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeComplaintModal();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showComplaintModal]);

  const logout = async () => {
    try {
      await api.post("/user/logout");
      toast.success("Logged out");
      setComplaintDraft(null);
      setAiMessages(initialAiMessages());
      setAiSessionId(makeAiSessionId());
      setAiInitState("idle");
      setComplaintView("options");
      setShowComplaintModal(false);
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };
  const handleChangePassword = async (data) => {
    try {
      await api.patch("/user/change/password", data);
      toast.success("Password changed successfully");
      setShowChangeModal(false);
      reset();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to change password"
      );
    }
  };
  const closeMobileSidebar = () => setShowSidebar(false);
  const handleNavigate = (path) => {
    navigate(path);
    closeMobileSidebar();
  };
  const handlePasswordClick = () => {
    setShowChangeModal(true);
    closeMobileSidebar();
  };
  const handleLogoutClick = () => {
    closeMobileSidebar();
    logout();
  };
  const isActive = (path) => location.pathname === path;
  const navigationItems = [
    { icon: Home, label: "Dashboard", path: "/member/dashboard" },
    { icon: Apple, label: "Diet Chart", path: "/member/diet-chart" },
    { icon: Dumbbell, label: "Workout Plans", path: "/member/workout-plans" },
    { icon: History, label: "History", path: "/member/history" },
      { icon: ScanQrCode , label: "Scan QR", path: "/member/scan-qr" },
  ];
  return (
    <>
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col lg:flex-row">
        <header className="lg:hidden sticky top-0 z-40 border-b border-red-600/30 bg-black/80 backdrop-blur">
          <div className="px-4 py-4 flex items-center justify-between">
            <div
              className="font-black tracking-widest text-lg cursor-pointer hover:text-red-500 transition-colors"
              onClick={() => handleNavigate("/member/dashboard")}
            >
              ALPHA <span className="text-red-600">GYM</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 border border-red-600/30 hover:border-red-600 hover:bg-red-600/10 rounded-lg transition-all"
            >
              {showSidebar ? (
                <X className="w-5 h-5 text-red-500" />
              ) : (
                <Menu className="w-5 h-5 text-red-500" />
              )}
            </motion.button>
          </div>
        </header>
        <AnimatePresence>
          {showSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={closeMobileSidebar}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-gradient-to-b from-black via-neutral-900 to-black border-r border-red-600/30 z-50 lg:hidden flex flex-col"
              >
                <SidebarContent
                  navigationItems={navigationItems}
                  isActive={isActive}
                  onNavigate={handleNavigate}
                  onPasswordClick={handlePasswordClick}
                  onLogoutClick={handleLogoutClick}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        <aside className="hidden lg:flex flex-col w-64 border-r border-red-600/30 bg-gradient-to-b from-black via-neutral-900 to-black sticky top-0 h-screen">
          <div className="px-6 py-6 border-b border-red-600/30">
            <div
              className="font-black tracking-widest text-lg cursor-pointer hover:text-red-500 transition-colors"
              onClick={() => handleNavigate("/member/dashboard")}
            >
              ALPHA <span className="text-red-600">GYM</span>
            </div>
          </div>
          <SidebarContent
            navigationItems={navigationItems}
            isActive={isActive}
            onNavigate={handleNavigate}
            onPasswordClick={handlePasswordClick}
            onLogoutClick={handleLogoutClick}
          />
        </aside>
        <div className="flex flex-col flex-1">
          <header className="hidden lg:block sticky top-0 z-40 border-b border-red-600/30 bg-black/80 backdrop-blur px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">
                <span className="font-semibold text-white">Member Dashboard</span>
              </div>
              <div className="text-xs text-gray-500 tracking-widest">
                POWERED BY ALPHA GYM
              </div>
            </div>
          </header>
          <main className="flex-1 min-w-0 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
            <Outlet />
          </main>
          <footer className="border-t border-white/10 mt-12 sm:mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 text-center text-xs text-gray-500 tracking-widest">
              MEMBER DASHBOARD • POWERED BY ALPHA GYM
            </div>
          </footer>
        </div>
      </div>
      {/* Floating complaint button: stays visible while scrolling. */}
      {!showSidebar && !showComplaintModal && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setComplaintView("options"); setShowComplaintModal(true); }}
          aria-label="Raise a complaint"
          aria-haspopup="dialog"
          className="fixed bottom-5 right-4 z-50 inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500 px-4 py-3 text-xs font-bold text-neutral-950 shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:bottom-8 sm:right-8 sm:px-5 sm:text-sm"
        >
          <MessageSquareWarning className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
          Raise Complaint
        </motion.button>
      )}
      <AnimatePresence>
        {showComplaintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeComplaintModal}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-4"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="complaint-modal-title"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              className={`w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl ${
                complaintView === "ai"
                  ? "max-w-2xl"
                  : "max-w-md max-h-[calc(100dvh-24px)] overflow-y-auto p-4 sm:p-6"
              }`}
            >
              {complaintView === "options" ? (
              <>
              <div className="mb-1 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2">
                    <MessageSquareWarning className="h-5 w-5 text-amber-400" />
                  </div>
                  <h2 id="complaint-modal-title" className="text-lg font-bold text-white sm:text-xl">
                    Raise a Complaint
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close complaint options"
                  autoFocus
                  onClick={closeComplaintModal}
                  className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mb-5 text-sm leading-6 text-gray-400">
                Having an issue? Contact our team using either option below.
              </p>

              <div className="space-y-3">
                <a
                  href={COMPLAINT_PHONE_URI}
                  className="group flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-emerald-500/40 hover:bg-emerald-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:p-4"
                >
                  <span className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400">
                    <Phone className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">Call Support</span>
                    <span className="block break-words text-xs text-gray-400 sm:text-sm">{COMPLAINT_PHONE}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-500 transition group-hover:text-emerald-400" />
                </a>

                <a
                  href={gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-blue-500/40 hover:bg-blue-500/5 sm:p-4"
                >
                  <Mail className="h-5 w-5 shrink-0 text-blue-400" />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">Email Support</p>
                    <p className="break-all text-xs text-gray-400">
                      {COMPLAINT_EMAIL}
                    </p>
                  </div>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-400" />
                </a>
                <button
                  type="button"
                  onClick={startAiAssistant}
                  className="group flex w-full min-w-0 items-center gap-3 rounded-xl border border-violet-500/30 bg-violet-500/[0.07] p-3 text-left transition hover:border-violet-400/60 hover:bg-violet-500/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:p-4"
                >
                  <span className="rounded-lg bg-violet-500/15 p-2.5 text-violet-300">
                    <Bot className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">AI Assistance</span>
                    <span className="block text-xs text-gray-400 sm:text-sm">Member questions, subscriptions and PT support</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-violet-300" />
                </button>
              </div>
              </>
              ) : (
                <section className="flex h-[calc(100dvh-24px)] max-h-[780px] min-h-0 flex-col sm:h-[min(760px,calc(100dvh-32px))]" aria-label="AlphaGym AI chat">
                  <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-neutral-950 px-3 py-3 sm:px-5 sm:py-4">
                    <button
                      type="button"
                      onClick={() => setComplaintView("options")}
                      aria-label="Back to complaint support options"
                      className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10">
                      <Bot className="h-5 w-5 text-violet-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 id="complaint-modal-title" className="truncate font-bold text-white">AlphaGym AI Assistant</h2>
                      <p className="flex items-center gap-1.5 text-xs text-gray-400">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        {aiInitState === "ready" ? "Connected to your member account" : aiInitState === "loading" ? "Connecting securely..." : "Member support"}
                      </p>
                    </div>
                    <button
                      type="button"
                      title="Start new conversation"
                      aria-label="Start new conversation"
                      disabled={aiSending || complaintSubmitting}
                      onClick={startNewAiChat}
                      className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-40"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Close AI Assistant"
                      onClick={closeComplaintModal}
                      className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div
                    ref={aiMessageListRef}
                    role="log"
                    aria-label="AI conversation"
                    aria-live="polite"
                    className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-gradient-to-b from-neutral-950 to-[#101015] px-3 py-4 sm:px-6"
                  >
                    {aiMessages.map((item) => (
                      <div
                        key={item.id}
                        className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[88%] break-words rounded-2xl px-3.5 py-3 text-sm leading-6 shadow-sm sm:max-w-[80%] ${
                          item.role === "user"
                            ? "rounded-br-md bg-red-600 text-white"
                            : item.error
                              ? "rounded-bl-md border border-red-500/30 bg-red-500/10 text-red-100"
                              : "rounded-bl-md border border-white/10 bg-white/[0.055] text-gray-100"
                        }`}>
                          <p className="whitespace-pre-wrap">{item.text}</p>
                          {item.action && (
                            <button
                              type="button"
                              onClick={() => navigateFromAi(item.action.path)}
                              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-violet-400/40 bg-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-200 hover:bg-violet-500/25"
                            >
                              Open {item.action.label}
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {aiInitState === "loading" && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                        Loading your account information...
                      </div>
                    )}
                    {aiInitState === "error" && (
                      <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                        <p>{aiInitError}</p>
                        <button
                          type="button"
                          onClick={startAiAssistant}
                          className="mt-2 rounded-lg border border-red-400/40 px-3 py-1.5 text-xs font-bold hover:bg-red-500/10"
                        >
                          Retry connection
                        </button>
                      </div>
                    )}
                    {aiSending && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                        AlphaGym AI is typing...
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 border-t border-white/10 bg-neutral-950 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pb-4">
                    {complaintDraft && (
                      <div className="mb-3 max-h-[38dvh] overflow-y-auto rounded-xl border border-violet-400/40 bg-violet-500/[0.08] p-3 sm:p-4" role="region" aria-label="Review complaint before submitting">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-violet-200">Review your complaint</p>
                          <button type="button" onClick={() => setComplaintDraft(null)} disabled={complaintSubmitting} className="text-xs text-gray-400 hover:text-white">Cancel</button>
                        </div>
                        <label htmlFor="ai-complaint-category" className="mb-1 block text-xs text-gray-300">Category</label>
                        <select
                          id="ai-complaint-category"
                          value={complaintDraft.category}
                          disabled={complaintSubmitting}
                          onChange={(e) => setComplaintDraft((prev) => ({ ...prev, category: e.target.value }))}
                          className="mb-2 w-full rounded-lg border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white"
                        >
                          {COMPLAINT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <label htmlFor="ai-complaint-description" className="mb-1 block text-xs text-gray-300">Description</label>
                        <textarea
                          id="ai-complaint-description"
                          value={complaintDraft.description}
                          disabled={complaintSubmitting}
                          rows={3}
                          maxLength={2000}
                          onChange={(e) => setComplaintDraft((prev) => ({ ...prev, description: e.target.value }))}
                          className="mb-2 w-full resize-y rounded-lg border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white"
                        />
                        <p className="mb-3 text-xs text-gray-400">Your registered member identity is attached securely by AlphaGym. Nothing is submitted until you click the button.</p>
                        <button
                          type="button"
                          onClick={submitComplaint}
                          disabled={complaintSubmitting || aiSending || complaintDraft.description.trim().length < 10}
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {complaintSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Confirm & Submit Complaint"}
                        </button>
                      </div>
                    )}
                    {!complaintDraft && (
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-gray-400">For a complaint, describe the issue to the AI. Review it before submitting.</p>
                        <button type="button" onClick={openManualComplaintDraft} disabled={aiSending || complaintSubmitting || aiInitState !== "ready"} className="rounded-lg border border-violet-400/40 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-500/10 disabled:opacity-40">Write complaint</button>
                      </div>
                    )}
                    <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                      {MEMBER_DESTINATIONS.map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => navigateFromAi(item.path)}
                          className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-violet-400/40 hover:text-white"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <form onSubmit={sendAiMessage} className="flex min-w-0 items-center gap-2">
                      <label htmlFor="alphagym-ai-message" className="sr-only">Message AlphaGym AI</label>
                      <input
                        id="alphagym-ai-message"
                        type="text"
                        autoComplete="off"
                        maxLength={2000}
                        value={aiDraft}
                        onChange={(event) => setAiDraft(event.target.value)}
                        disabled={aiInitState !== "ready" || aiSending || complaintSubmitting}
                        placeholder={aiInitState === "ready" ? "Ask about your membership..." : "Connecting to AI..."}
                        className="h-12 min-w-0 flex-1 rounded-xl border border-white/15 bg-white/[0.055] px-3.5 text-sm text-white placeholder:text-gray-500 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/40 disabled:opacity-60"
                      />
                      <button
                        type="submit"
                        disabled={aiInitState !== "ready" || aiSending || complaintSubmitting || !aiDraft.trim()}
                        aria-label="Send message"
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {aiSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      </button>
                    </form>
                  </div>
                </section>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showChangeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowChangeModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md border border-red-600/30 bg-gradient-to-b from-neutral-900 to-black rounded-xl overflow-hidden shadow-[0_0_80px_rgba(239,68,68,0.25)]"
            >
              <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-600/20 rounded-lg border border-red-600/30">
                    <Lock className="w-5 h-5 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold tracking-widest text-white">
                    Change Password
                  </h2>
                </div>
                <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      placeholder="OLD PASSWORD"
                      {...register("oldPassword", { required: "Old password is required" })}
                      className="w-full bg-black border border-white/10 hover:border-red-600/30 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/30 px-4 py-3 text-white rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="NEW PASSWORD"
                      {...register("newPassword", { required: "New password is required" })}
                      className="w-full bg-black border border-white/10 hover:border-red-600/30 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/30 px-4 py-3 text-white rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="CONFIRM NEW PASSWORD"
                      {...register("confirmNewPassword", { required: "Please confirm your password" })}
                      className="w-full bg-black border border-white/10 hover:border-red-600/30 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/30 px-4 py-3 text-white rounded-lg transition-all"
                    />
                  </div>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 sm:py-4 font-extrabold tracking-widest bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-black hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg mt-6"
                  >
                    {isSubmitting ? "UPDATING..." : "UPDATE PASSWORD"}
                  </motion.button>
                </form>
                <button
                  onClick={() => setShowChangeModal(false)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-red-600/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
function SidebarContent({ navigationItems, isActive, onNavigate, onPasswordClick, onLogoutClick }) {
  return (
    <>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <motion.button
              key={item.path}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                active
                  ? "bg-red-600/20 border border-red-600/50 text-red-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-red-500" : "group-hover:text-red-500"}`} />
              <span className="font-semibold flex-1 text-left">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 text-red-500" />}
            </motion.button>
          );
        })}
      </nav>
      <div className="border-t border-red-600/30 px-4 py-4 space-y-2">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPasswordClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300 group"
        >
          <Lock className="w-5 h-5 flex-shrink-0 group-hover:text-red-500 transition-colors" />
          <span className="font-semibold flex-1 text-left">Change Password</span>
        </motion.button>
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:text-red-500 transition-colors" />
          <span className="font-semibold flex-1 text-left">Logout</span>
        </motion.button>
      </div>
    </>
  );
}