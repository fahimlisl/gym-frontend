import { useEffect, useState } from "react";
import api from "../../api/axios.api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dumbbell, 
  Clock, 
  CheckCircle2, 
  X, 
  UserCheck, 
  Loader2,
  Award,
  Calendar,
  TrendingUp,
  Target,
  Heart,
  Users,
  Star,
  Zap,
  Shield,
  Sparkles,
  Crown,
  Flame,
  Medal,
  ChevronRight,
  Activity,
  BarChart3
} from "lucide-react";

export default function PTRequestStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState([]);
  const [openTrainerModal, setOpenTrainerModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [hoveredTrainer, setHoveredTrainer] = useState(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await api.get("/user/pt/request/status");
      const data = res.data.data;
      setStatus(data);

      if (data.isApproved) {
        loadTrainers();
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setStatus(null);
      } else {
        toast.error("Failed to fetch PT status");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTrainers = async () => {
    try {
      const res = await api.get("/general/fetchAllTrainer");
      setTrainers(res.data.data);
    } catch {
      toast.error("Failed to load trainers");
    }
  };

  const assignTrainer = async (trainerId) => {
    try {
      setAssigning(true);
      await api.patch(`/user/pt/assign/trainer/${trainerId}`);
      toast.success("Trainer assigned successfully");
      setOpenTrainerModal(false);
      loadStatus();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign trainer");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-16 text-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg" />

        <div className="relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-red-600/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-red-600/40 border-b-transparent border-l-transparent animate-spin animation-delay-150" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Dumbbell className="w-10 h-10 text-red-500 animate-pulse" />
            </div>
          </div>

          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-black tracking-widest bg-gradient-to-r from-white via-red-300 to-white bg-clip-text text-transparent mb-3"
          >
            LOADING ELITE TRAINING STATUS
          </motion.h3>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-2"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                className="w-2 h-2 bg-red-500 rounded-full"
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (!status) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-12 text-center group"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent" />
        
        <div className="absolute inset-0 overflow-hidden">
          <Dumbbell className="absolute top-10 left-10 w-16 h-16 text-red-600/5 rotate-12" />
          <Dumbbell className="absolute bottom-10 right-10 w-20 h-20 text-red-600/5 -rotate-12" />
        </div>

        <div className="relative z-10">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-600/20 to-red-800/20 border-2 border-red-600/30 flex items-center justify-center"
          >
            <Crown className="w-14 h-14 text-red-500" />
          </motion.div>

          <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-white via-red-300 to-white bg-clip-text text-transparent">
            NO TRAINING REQUEST
          </h3>
          
          <p className="text-gray-400 text-lg max-w-md mx-auto mb-8 leading-relaxed">
            Begin your transformation journey by selecting an elite personal training plan
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/member/pt-plans")}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 rounded-xl font-black tracking-widest text-sm overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles className="w-4 h-4 relative z-10" />
            <span className="relative z-10">EXPLORE PREMIUM PLANS</span>
            <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (!status.isApproved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-neutral-900 to-black p-10"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
          <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-yellow-500 to-transparent" />
        </div>

        <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-600/20 rounded-full blur-3xl animate-pulse animation-delay-1000" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 border-2 border-yellow-500/50 flex items-center justify-center"
            >
              <Clock className="w-16 h-16 text-yellow-400" />
            </motion.div>
            
            <div className="absolute inset-0 rounded-full border-2 border-yellow-500/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border-2 border-yellow-500/20 animate-ping animation-delay-500" />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/30 mb-4"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs tracking-widest text-yellow-400 font-black">PENDING VERIFICATION</span>
            </motion.div>

            <h3 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
              UNDER REVIEW
            </h3>
            
            <p className="text-gray-300 text-lg max-w-2xl mb-6 leading-relaxed">
              Your payment proof has been received. Our elite admin team is currently 
              verifying your transaction. This premium process ensures 100% security.
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">Payment Received</span>
              </div>
              <div className="w-12 h-px bg-gradient-to-r from-yellow-500/50 to-transparent" />
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-2 h-2 bg-gray-600 rounded-full" />
                <span className="text-sm text-gray-600">Verification</span>
              </div>
              <div className="w-12 h-px bg-gradient-to-r from-gray-700 to-transparent" />
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-2 h-2 bg-gray-600 rounded-full" />
                <span className="text-sm text-gray-600">Approval</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <Calendar className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">
                Submitted on {new Date(status.createdAt).toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-black text-yellow-400 mb-2">≈5min</div>
            <div className="text-xs text-gray-500 tracking-widest">ESTIMATED REVIEW TIME</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-green-500/30 bg-gradient-to-br from-green-500/10 via-neutral-900 to-black p-8 md:p-12 mb-8"
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg"/>
        </div>

        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-10 right-10 text-green-500/10"
        >
          <Award className="w-24 h-24" />
        </motion.div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-36 h-36 rounded-full bg-gradient-to-br from-green-500/30 to-green-600/30 border-4 border-green-500/50 flex items-center justify-center"
            >
              <CheckCircle2 className="w-20 h-20 text-green-400" />
            </motion.div>
            
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{ delay: i * 0.1, duration: 1 }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full"
                style={{
                  transform: `rotate(${i * 45}deg) translateX(60px)`
                }}
              />
            ))}
          </div>

          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30 mb-4"
            >
              <Crown className="w-4 h-4 text-green-400" />
              <span className="text-xs tracking-widest text-green-400 font-black">ELITE ACCESS GRANTED</span>
            </motion.div>

            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-green-400 via-green-300 to-green-400 bg-clip-text text-transparent">
              REQUEST APPROVED
            </h3>
            
            <p className="text-gray-300 text-lg max-w-2xl mb-8 leading-relaxed">
              Congratulations! Your personal training request has been approved. 
              Select your elite trainer to begin your transformation journey.
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mb-8">
              {[
                { icon: Users, label: "Elite Trainers", value: trainers.length },
                { icon: Star, label: "Avg Rating", value: "4.9" },
                { icon: Award, label: "Certified", value: "100%" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-3 bg-white/5 rounded-xl border border-white/10"
                >
                  <stat.icon className="w-5 h-5 text-green-400 mx-auto mb-2" />
                  <div className="text-lg font-black text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpenTrainerModal(true)}
            className="group relative px-10 py-5 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl font-black tracking-widest text-sm overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-green-800 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-3">
              <UserCheck className="w-5 h-5" />
              SELECT YOUR TRAINER
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {openTrainerModal && (
          <TrainerModal
            trainers={trainers}
            onClose={() => setOpenTrainerModal(false)}
            onSelect={assignTrainer}
            assigning={assigning}
            hoveredTrainer={hoveredTrainer}
            setHoveredTrainer={setHoveredTrainer}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function TrainerModal({ trainers, onClose, onSelect, assigning, hoveredTrainer, setHoveredTrainer }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-red-600/20 bg-black shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-red-600/10 bg-gradient-to-r from-black via-neutral-900 to-black">
          <div>
            <h2 className="text-2xl font-bold text-white">Select Trainer</h2>
            <p className="text-xs text-gray-400 mt-1">Choose your trainer</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainers.map((trainer) => (
              <div
                key={trainer._id}
                onMouseEnter={() => setHoveredTrainer(trainer._id)}
                onMouseLeave={() => setHoveredTrainer(null)}
                className="group relative bg-gradient-to-b from-neutral-900 to-black p-5 rounded-xl border border-white/5 hover:border-red-600/30 transition"
              >
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  <img
                    src={trainer.avatar?.url || "/default-avatar.jpg"}
                    alt={trainer.fullName}
                    className="w-full h-40 object-cover border border-red-600/20 group-hover:border-red-600/50 transition"
                  />
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{trainer.fullName}</h3>
                <p className="text-xs text-gray-400 mb-3">{trainer.experience} years experience</p>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div>
                    <div className="text-sm font-bold text-white">150+</div>
                    <div className="text-[10px] text-gray-500">Clients</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">98%</div>
                    <div className="text-[10px] text-gray-500">Success</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">4.9⭐</div>
                    <div className="text-[10px] text-gray-500">Rating</div>
                  </div>
                </div>

                <button
                  disabled={assigning}
                  onClick={() => onSelect(trainer._id)}
                  className="w-full py-2 px-3 rounded-lg bg-red-600/10 border border-red-600/30 text-white text-sm font-bold hover:bg-red-600 hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {assigning ? "Assigning..." : "Select"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


const styles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-150 {
    animation-delay: 150ms;
  }
  .animation-delay-500 {
    animation-delay: 500ms;
  }
  .animation-delay-1000 {
    animation-delay: 1000ms;
  }
`;