import { useEffect, useState } from "react";
import api from "../../api/axios.api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Dumbbell, Clock, Award, Sparkles, ChevronRight } from "lucide-react";

export default function PTPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await api.get("/user/plans/pt/fetch/all");
      setPlans(res.data.data);
    } catch (error) {
      toast.error("Failed to load PT plans");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
        </div>

        <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg "/>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <button
              onClick={() => navigate("/member/dashboard")}
              className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 mb-8"
            >
              <div className="p-2 rounded-xl border border-red-600/30 group-hover:border-red-600 group-hover:bg-red-600/10 transition-all duration-300">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="text-sm tracking-wider font-medium relative overflow-hidden">
                BACK TO DASHBOARD
                <span className="absolute bottom-0 left-0 w-full h-px bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </span>
            </button>

            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600/20 to-red-800/20 px-4 py-2 rounded-full border border-red-600/30 mb-6"
              >
                <Sparkles className="w-4 h-4 text-red-500" />
                <span className="text-xs tracking-[0.3em] text-red-400 font-bold">PREMIUM TRAINING</span>
                <Sparkles className="w-4 h-4 text-red-500" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-black tracking-tighter mb-4"
              >
                <span className="bg-gradient-to-r from-white via-red-300 to-white bg-clip-text text-transparent">
                  ELITE PERSONAL
                </span>
                <br />
                <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-500 bg-clip-text text-transparent">
                  TRAINING PLANS
                </span>
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex items-center justify-center gap-4 text-gray-500 max-w-2xl mx-auto"
              >
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-600/50 to-red-600" />
                <p className="text-xs tracking-[0.4em] uppercase font-medium">Transform Your Body</p>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-600/50 to-red-600" />
              </motion.div>
            </div>
          </motion.div>

          {loading && (
            <div className="flex justify-center items-center h-96">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                <Dumbbell className="w-8 h-8 text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
            </div>
          )}
          {!loading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {plans.map((plan, index) => (
                <motion.div
                  key={plan._id}
                  variants={itemVariants}
                  className="group relative h-full"
                >
                  <div className="relative h-full flex flex-col">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-800 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl" />
                    
                    <div className="relative flex-1 flex flex-col bg-gradient-to-b from-neutral-900/90 to-black/90 backdrop-blur-sm p-8 rounded-3xl border border-red-600/20 group-hover:border-red-600/40 transition-all duration-500">
                      
                      {index === 1 && (
                        <div className="absolute -top-4 right-6 z-20">
                          <div className="relative">
                            <div className="absolute inset-0 bg-red-600 rounded-full blur-md opacity-70" />
                            <div className="relative bg-gradient-to-r from-red-600 to-red-800 text-white text-xs font-black px-4 py-2 rounded-full tracking-wider flex items-center gap-1 shadow-lg shadow-red-600/30">
                              <Award className="w-3 h-3" />
                              MOST POPULAR
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-6">
                        <div className="p-3 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-2xl border border-red-600/30 group-hover:border-red-600/60 transition-colors">
                          <Dumbbell className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex items-center gap-1.5 bg-neutral-800/50 px-3 py-1.5 rounded-full border border-red-600/20">
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs font-medium text-gray-300">{plan.duration}</span>
                        </div>
                      </div>

                      <h2 className="text-2xl font-black mb-3 tracking-tight text-white group-hover:text-red-400 transition-colors">
                        {plan.title}
                      </h2>
                      
                      <p className="text-gray-400 text-sm mb-6 leading-relaxed flex-1">
                        {plan.bio}
                      </p>

                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black bg-gradient-to-r from-white to-red-300 bg-clip-text text-transparent">
                            ₹{plan.finalPrice}
                          </span>
                          <span className="text-gray-600 text-sm font-medium">/session</span>
                        </div>
                        {plan.originalPrice && (
                          <div className="text-sm text-gray-600 line-through mt-1">
                            ₹{plan.originalPrice}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 mb-8">
                        {plan.benefits?.map((benefit, idx) => (
                          <motion.div
                            key={benefit._id || idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mt-0.5 shadow-lg shadow-red-600/30">
                              <ChevronRight className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-gray-300 text-sm">{benefit.heading}</span>
                          </motion.div>
                        ))}
                      </div>

                      <button
                        onClick={() => navigate(`/member/pt-billing/${plan._id}`)}
                        className="w-full relative overflow-hidden group/btn mt-auto"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-transparent border-2 border-red-600 py-4 px-6 font-black tracking-widest text-sm group-hover/btn:text-white group-hover/btn:border-transparent transition-all duration-300 rounded-xl">
                          SELECT THIS PLAN
                        </div>
                      </button>

                      <div className="mt-6 pt-6 border-t border-red-600/10">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                            ✓ 1-on-1
                          </div>
                          <div className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                            ✓ Flexible
                          </div>
                          <div className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                            ✓ Tracking
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && plans.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-32"
            >
              <div className="inline-block p-8 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-full mb-6 border border-red-600/30">
                <Dumbbell className="w-16 h-16 text-red-500" />
              </div>
              <h3 className="text-3xl font-black mb-3 bg-gradient-to-r from-white to-red-300 bg-clip-text text-transparent">
                No Plans Available
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                Check back soon for exclusive personal training programs tailored for you
              </p>
            </motion.div>
          )}
        </div>
      </div>
  );
}