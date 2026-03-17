import { useEffect, useState } from "react";
import api from "../../api/axios.api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dumbbell, 
  Users, 
  Target, 
  Activity, 
  Award, 
  Star,
  ChevronRight,
  Clock,
  TrendingUp,
  Heart,
  Zap,
  Shield,
  Sparkles,
  Crown,
  Medal,
  UserCheck,
  Calendar,
  MessageCircle,
  ThumbsUp,
  Eye,
  X
} from "lucide-react";

export function GetTrainerUI() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hoveredTrainer, setHoveredTrainer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const res = await api.get("/general/fetchAllTrainer");
      setTrainers(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  const viewTrainerProfile = async (trainerId) => {
    try {
      const res = await api.get(`/general/fetchParticularTrainer/${trainerId}`);
      setSelectedTrainer(res.data.data);
      setShowProfileModal(true);
    } catch {
      toast.error("Failed to load trainer profile");
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 p-16 text-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg"/>

        <div className="relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-red-600/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <Dumbbell className="absolute inset-0 m-auto w-8 h-8 text-red-500 animate-pulse" />
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm tracking-widest text-gray-400"
          >
            LOADING ELITE TRAINERS
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-red-600/30 bg-gradient-to-br from-black via-neutral-900 to-black p-4 sm:p-6 md:p-8"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600 to-transparent" />
          <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-red-600 to-transparent" />
        </div>
        
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />

        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-3 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-xl border border-red-600/30">
              <Crown className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-widest bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
                ELITE PERSONAL TRAINING
              </h3>
              <p className="text-xs text-gray-500 mt-1">Transform with the best</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900/90 to-black/90 p-6 sm:p-8"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-red-600/20 px-3 py-1.5 rounded-full border border-red-600/30 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[10px] sm:text-xs tracking-widest text-red-400 font-black">
                    LIMITED SPOTS AVAILABLE
                  </span>
                </div>

                <h4 className="text-xl sm:text-2xl font-black mb-3 text-white">
                  Get Your Personal Trainer
                </h4>

                <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
                  Unlock faster progress with expert guidance. A personal trainer helps you 
                  stay consistent, improve technique and reach your fitness goals quicker.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-2 lg:gap-x-28 sm:gap-3 mt-6">
                  <Benefit icon={<Target className="w-3.5 h-3.5" />} text="Custom Plan" />
                  <Benefit icon={<Heart className="w-3.5 h-3.5" />} text="Diet Support" />
                  <Benefit icon={<TrendingUp className="w-3.5 h-3.5" />} text="Progress Track" />
                  <Benefit icon={<Zap className="w-3.5 h-3.5" />} text="Fast Results" />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/member/pt-plans")}
                className="group relative px-6 sm:px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 rounded-xl font-black tracking-widest text-sm overflow-hidden whitespace-nowrap"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  APPLY FOR PT
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </div>
          </motion.div>
          {trainers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="inline-block p-4 bg-red-600/10 rounded-full mb-4">
                <Users className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-gray-400 text-sm">No trainers available at the moment</p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-red-500" />
                  <h4 className="font-black tracking-widest text-sm text-gray-300">
                    AVAILABLE TRAINERS ({trainers.length})
                  </h4>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span>Elite Certified</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {trainers.map((trainer, index) => (
                  <TrainerCard 
                    key={trainer._id} 
                    trainer={trainer}
                    index={index}
                    onViewProfile={() => viewTrainerProfile(trainer._id)}
                    onHover={() => setHoveredTrainer(trainer._id)}
                    onLeave={() => setHoveredTrainer(null)}
                    isHovered={hoveredTrainer === trainer._id}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showProfileModal && selectedTrainer && (
          <TrainerProfileModal 
            trainer={selectedTrainer}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function TrainerCard({ trainer, index, onViewProfile, onHover, onLeave, isHovered }) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="group relative bg-gradient-to-b from-neutral-900 to-black p-4 sm:p-6 rounded-xl border border-white/5 hover:border-red-600/30 transition h-full flex flex-col lg:w-56"
    >
      {index === 0 && (
        <div className="absolute -top-3 -right-3 z-10 bg-yellow-500 text-black text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full">
          TOP RATED
        </div>
      )}


      <div className="relative mb-4 sm:mb-5 overflow-hidden rounded-lg flex-shrink-0">
        <img
          src={trainer.avatar?.url || "https://via.placeholder.com/300x300?text=Trainer"}
          alt={trainer.fullName}
          className="w-full aspect-square object-cover border border-red-600/20 group-hover:border-red-600/50 transition"
        />
        
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 px-2.5 py-1.5 rounded-full border border-green-500/50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[8px] sm:text-xs text-green-400 font-medium">Active</span>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 px-2.5 py-1.5 rounded-full border border-yellow-500/30">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
          <span className="text-xs sm:text-sm font-bold text-white">4.9</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 truncate group-hover:text-red-400 transition">
          {trainer.fullName}
        </h3>
        
        <p className="text-xs sm:text-sm text-gray-400 mb-3">{trainer.experience} years exp.</p>

        {trainer.specialization && (
          <p className="text-xs sm:text-sm text-gray-500 mb-4 line-clamp-2">
            {trainer.specialization}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
          <div className="text-center">
            <div className="text-sm sm:text-base lg:text-lg font-bold text-white">150+</div>
            <div className="text-[8px] sm:text-xs text-gray-500 mt-1">Clients</div>
          </div>
          <div className="text-center">
            <div className="text-sm sm:text-base lg:text-lg font-bold text-white">98%</div>
            <div className="text-[8px] sm:text-xs text-gray-500 mt-1">Success</div>
          </div>
          <div className="text-center">
            <div className="text-sm sm:text-base lg:text-lg font-bold text-white">4.9⭐</div>
            <div className="text-[8px] sm:text-xs text-gray-500 mt-1">Rating</div>
          </div>
        </div>
      </div>

      <button
        onClick={onViewProfile}
        className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-red-600/10 border border-red-600/30 text-white text-xs sm:text-sm font-bold hover:bg-red-600 hover:border-red-600 hover:text-white transition flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        <span>View Profile</span>
      </button>
    </div>
  );
}


function Benefit({ icon, text }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -2 }}
      className="flex items-center gap-2 text-gray-300 bg-white/5 px-3 py-2 rounded-lg border border-white/5 hover:border-red-600/30 transition-all duration-300"
    >
      <span className="text-red-400">{icon}</span>
      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{text}</span>
    </motion.div>
  );
}

function TrainerProfileModal({ trainer, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-neutral-900 to-black shadow-2xl"
      >
        <div className="relative h-48 sm:h-64">
          <img 
            src={trainer.avatar?.url || "https://via.placeholder.com/1200x400?text=Trainer"}
            alt={trainer.fullName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-red-600/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-end gap-4">
              <img 
                src={trainer.avatar?.url || "https://via.placeholder.com/100x100?text=Trainer"}
                alt={trainer.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-red-600 object-cover"
              />
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
                  {trainer.fullName}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-white ml-1">(4.9)</span>
                  </div>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-400">{trainer.experience} years experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <Users className="w-5 h-5 text-red-400 mx-auto mb-2" />
              <div className="text-xl font-black text-white">150+</div>
              <div className="text-xs text-gray-500">Happy Clients</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <Award className="w-5 h-5 text-red-400 mx-auto mb-2" />
              <div className="text-xl font-black text-white">8</div>
              <div className="text-xs text-gray-500">Certifications</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <Clock className="w-5 h-5 text-red-400 mx-auto mb-2" />
              <div className="text-xl font-black text-white">5k+</div>
              <div className="text-xs text-gray-500">Hours Trained</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <ThumbsUp className="w-5 h-5 text-red-400 mx-auto mb-2" />
              <div className="text-xl font-black text-white">98%</div>
              <div className="text-xs text-gray-500">Success Rate</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-red-500" />
              ABOUT TRAINER
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {trainer.bio || "Dedicated fitness professional with years of experience in transforming lives through personalized training programs. Specialized in strength training, nutrition planning, and holistic wellness."}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-red-500" />
              SPECIALIZATIONS
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Strength Training', 'Weight Loss', 'Nutrition', 'HIIT', 'Yoga', 'Bodybuilding'].map((spec, i) => (
                <span key={i} className="px-3 py-1.5 bg-red-600/10 border border-red-600/30 rounded-full text-xs text-red-400">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              <Medal className="w-4 h-4 text-red-500" />
              ACHIEVEMENTS
            </h3>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Certified Personal Trainer (CPT)</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-xl font-black tracking-widest text-sm"
            >
              BOOK SESSION
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 border border-red-600 rounded-xl font-black tracking-widest text-sm hover:bg-red-600/10 transition-colors"
            >
              CONTACT
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;