import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  CreditCard, 
  Award, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Receipt,
  History,
  Sparkles,
  Crown,
  Shield,
  Zap,
  Star,
  ChevronRight,
  Download,
  Mail,
  FileText,
  DollarSign,
  Percent,
  BadgeCheck,
  Wallet,
  ArrowRight
} from "lucide-react";
import { useState } from "react";

export default function SubscriptionSection({ subscription }) {
  const [expandedItem, setExpandedItem] = useState(null);

  if (!subscription || !subscription.subscription?.length) {
    return <EmptyState />;
  }

  return (
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

      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg"/>

      <div className="relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-xl border border-red-600/30">
              <History className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-widest bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
                MEMBERSHIP HISTORY
              </h3>
              <p className="text-xs text-gray-500 mt-1">Your premium journey timeline</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Award className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium text-gray-300">
              {subscription.subscription?.length} {subscription.subscription?.length === 1 ? 'Membership' : 'Memberships'}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8 overflow-hidden rounded-2xl border border-red-600/30 bg-gradient-to-br from-red-600/10 via-neutral-900 to-black p-6"
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-600/30 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-red-400" />
                <h4 className="text-sm font-black tracking-widest text-gray-300">
                  ADMISSION FEE DETAILS
                </h4>
              </div>
              <div className="px-2 py-1 bg-red-600/20 rounded-full border border-red-600/30">
                <span className="text-[10px] font-black text-red-400 tracking-wider">ONE-TIME</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <PremiumStatCard
                icon={<DollarSign className="w-4 h-4" />}
                label="ORIGINAL FEE"
                value={`₹${subscription.admissionFee}`}
                color="blue"
              />
              <PremiumStatCard
                icon={<Percent className="w-4 h-4" />}
                label="DISCOUNT TYPE"
                value={formatDiscountType(subscription.discountTypeOnAdFee)}
                color="purple"
              />
              <PremiumStatCard
                icon={<Sparkles className="w-4 h-4" />}
                label="DISCOUNT"
                value={`₹${subscription.discountOnAdFee || 0}`}
                color="green"
              />
              <PremiumStatCard
                icon={<Crown className="w-4 h-4" />}
                label="FINAL AMOUNT"
                value={`₹${subscription.finalAdFee}`}
                color="red"
                highlight
              />
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black tracking-widest text-gray-400 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-red-500" />
              MEMBERSHIP TIMELINE
            </h4>
            <span className="text-xs text-gray-600">Most recent first</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {[...subscription.subscription].reverse().map((s, index) => (
                <PremiumSubscriptionCard
                  key={s._id}
                  subscription={s}
                  index={index}
                  isExpanded={expandedItem === s._id}
                  onToggle={() => setExpandedItem(expandedItem === s._id ? null : s._id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Secured with blockchain verification</span>
          </div>
          
          <div className="flex gap-2">

          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function PremiumStatCard({ icon, label, value, color, highlight = false }) {
  const colorClasses = {
    red: "from-red-600 to-red-800",
    blue: "from-blue-600 to-blue-800",
    green: "from-green-600 to-green-800",
    purple: "from-purple-600 to-purple-800"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative overflow-hidden rounded-xl p-4 ${
        highlight 
          ? "bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-600/30" 
          : "bg-white/5 border border-white/10"
      }`}
    >
      {highlight && (
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-red-600/30 rounded-full blur-2xl" />
      )}
      <div className="relative z-10">
        <div className={`text-${color}-400 mb-2`}>{icon}</div>
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className={`text-base sm:text-lg font-black ${
          highlight ? "text-white" : "text-gray-300"
        }`}>
          {value}
        </div>
      </div>
    </motion.div>
  );
}

function PremiumSubscriptionCard({ subscription, index, isExpanded, onToggle }) {
  const statusConfig = {
    active: { color: "green", icon: CheckCircle2, text: "ACTIVE" },
    expired: { color: "red", icon: XCircle, text: "EXPIRED" },
    pending: { color: "yellow", icon: AlertCircle, text: "PENDING" },
    cancelled: { color: "gray", icon: XCircle, text: "CANCELLED" }
  };

  const StatusIcon = statusConfig[subscription.status?.toLowerCase()]?.icon || AlertCircle;
  const statusColor = statusConfig[subscription.status?.toLowerCase()]?.color || "gray";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1 }}
      className="group relative"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur" />
      
      <div className="relative bg-gradient-to-b from-neutral-900 to-black p-5 rounded-2xl border border-white/10 group-hover:border-red-600/50 transition-all duration-500">
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-lg border border-red-600/30">
              <FileText className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h4 className="text-base font-black text-white group-hover:text-red-400 transition-colors">
                {subscription.plan?.toUpperCase() || "PREMIUM PLAN"}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full bg-${statusColor}-500/20 border border-${statusColor}-500/30 text-${statusColor}-400`}>
                  <StatusIcon className="w-3 h-3 inline mr-1" />
                  {statusConfig[subscription.status?.toLowerCase()]?.text || subscription.status?.toUpperCase()}
                </span>
                {subscription.isPriority && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400">
                    <Zap className="w-3 h-3 inline mr-1" />
                    PRIORITY
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <motion.button
            animate={{ rotate: isExpanded ? 180 : 0 }}
            onClick={onToggle}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </motion.button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <QuickInfo icon={<DollarSign className="w-3 h-3" />} label="Price" value={`₹${subscription.price}`} />
          <QuickInfo icon={<Percent className="w-3 h-3" />} label="Discount" value={`₹${subscription.discount}`} />
          <QuickInfo icon={<Crown className="w-3 h-3" />} label="Final" value={`₹${subscription.finalAmount}`} highlight />
          <QuickInfo icon={<BadgeCheck className="w-3 h-3" />} label="Type" value={formatDiscountType(subscription.discountType)} />
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-gray-400 tracking-wider mb-2">VALIDITY PERIOD</h5>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-400" />
                        <span className="text-gray-300">{fmt(subscription.startDate)}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-600" />
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-400" />
                        <span className="text-gray-300">{fmt(subscription.endDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* additional info */}
                  {/* <div className="space-y-2">
                    <h5 className="text-xs font-black text-gray-400 tracking-wider mb-2">ADDITIONAL DETAILS</h5>
                    <div className="space-y-1">
                      <DetailRow label="Transaction ID" value={subscription.transactionId || "N/A"} />
                      <DetailRow label="Payment Method" value={subscription.paymentMethod || "Credit Card"} />
                      <DetailRow label="Invoice Number" value={subscription.invoiceNo || `INV-${subscription._id.slice(-6)}`} />
                    </div>
                  </div> */}
                </div>


              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function QuickInfo({ icon, label, value, highlight = false }) {
  return (
    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
      <div className="flex items-center gap-1 text-gray-500 text-[10px] mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`text-xs font-black ${highlight ? "text-red-400" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}


function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 font-medium">{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 p-12 text-center group"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent" />
      
      <div className="absolute inset-0 overflow-hidden">
        <History className="absolute top-10 left-10 w-16 h-16 text-red-600/5 rotate-12" />
        <Receipt className="absolute bottom-10 right-10 w-20 h-20 text-red-600/5 -rotate-12" />
      </div>

      <div className="relative z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-600/20 to-red-800/20 border-2 border-red-600/30 flex items-center justify-center"
        >
          <Crown className="w-14 h-14 text-red-500" />
        </motion.div>

        <h3 className="text-2xl sm:text-3xl font-black mb-4 bg-gradient-to-r from-white via-red-300 to-white bg-clip-text text-transparent">
          NO MEMBERSHIP FOUND
        </h3>
        
        <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
          Start your fitness journey with us today and unlock exclusive premium benefits
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 rounded-xl font-black tracking-widest text-sm overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Sparkles className="w-4 h-4 relative z-10" />
          <span className="relative z-10">EXPLORE MEMBERSHIP PLANS</span>
          <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
}

const fmt = (d) => {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

const formatDiscountType = (type) => {
  if (!type || type === "none") return "—";
  if (type === "percentage") return "% OFF";
  if (type === "flat") return "FLAT ₹";
  return type.toUpperCase();
};


// global css 
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
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(239, 68, 68, 0.3);
    border-radius: 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(239, 68, 68, 0.5);
  }
`;