import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../../api/axios.api";
import { Menu, X, Lock, LogOut, Home, Apple, Dumbbell, ChevronRight, History, ScanQrCode, MessageSquareWarning, Phone, Mail, Bot, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COMPLAINT_PHONE = "+91 77191 61307";
const COMPLAINT_PHONE_URI = "tel:+917719161307";
const COMPLAINT_EMAIL = "alphagym2001@gmail.com";

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
      if (event.key === "Escape") setShowComplaintModal(false);
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
          onClick={() => setShowComplaintModal(true)}
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
            onClick={() => setShowComplaintModal(false)}
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
              className="w-full min-w-0 max-w-md max-h-[calc(100dvh-24px)] overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950 p-4 shadow-2xl sm:p-6"
            >
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
                  onClick={() => setShowComplaintModal(false)}
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
                <div className="flex min-w-0 items-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 opacity-65 sm:p-4">
                  <span className="rounded-lg bg-violet-500/10 p-2.5 text-violet-400">
                    <Bot className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">AI Assistance</span>
                    <span className="block text-xs text-gray-400 sm:text-sm">Coming soon</span>
                  </span>
                </div>
              </div>
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