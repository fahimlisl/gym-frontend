import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  Receipt,
  History,
  Sparkles,
  Crown,
  Shield,
  Zap,
  ChevronRight,
  ChevronLeft,
  FileText,
  DollarSign,
  Percent,
  BadgeCheck,
  Wallet,
  ArrowRight,
  TrendingUp,
  Loader,
  Dumbbell,
  User
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.api";

export default function SubscriptionHistory() {
  const [expandedItem, setExpandedItem] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [profileData, setProfileData] = useState(null);
  const [personalTrainingData, setPersonalTrainingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      console.log(`${import.meta.env.VITE_API_URL}/user/getProfile`)
      const response = await api.get(`${import.meta.env.VITE_API_URL}/user/getProfile`)
      console.log(response)
      if (response.data?.data) {
        setProfileData(response.data.data.subscription);
        setPersonalTrainingData(response.data.data.personalTraning);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!profileData?.subscription?.length && !personalTrainingData?.subscription?.length) {
    return <EmptyState />;
  }

  const subscription = profileData;
  const sortedSubscriptions = profileData?.subscription ? [...profileData.subscription].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  }) : [];

  const sortedPersonalTraining = personalTrainingData?.subscription ? [...personalTrainingData.subscription].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  }) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black p-4 sm:p-6 md:p-8"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link 
              to="/member/dashboard"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-red-400" />
            </Link>
            <div className="p-3 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-xl border border-red-600/30">
              <History className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-widest bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
                YOUR HISTORY
              </h1>
              <p className="text-xs text-gray-500 mt-1">Subscriptions & Personal Training</p>
            </div>
          </div>
        </div>
      </motion.div>

      {profileData?.subscription?.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600/20 rounded-lg border border-red-600/30">
                  <Crown className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-red-400">GYM MEMBERSHIP HISTORY</h2>
                  <p className="text-xs text-gray-500">{profileData.subscription.length} records</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatBox 
                icon={<CheckCircle2 className="w-4 h-4" />}
                label="Active"
                value={sortedSubscriptions.filter(s => s.status?.toLowerCase() === 'active').length}
                color="green"
              />
              <StatBox 
                icon={<XCircle className="w-4 h-4" />}
                label="Expired"
                value={sortedSubscriptions.filter(s => s.status?.toLowerCase() === 'expired').length}
                color="red"
              />
              <StatBox 
                icon={<AlertCircle className="w-4 h-4" />}
                label="Pending"
                value={sortedSubscriptions.filter(s => s.status?.toLowerCase() === 'pending').length}
                color="yellow"
              />
              <StatBox 
                icon={<Zap className="w-4 h-4" />}
                label="Total"
                value={sortedSubscriptions.length}
                color="purple"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-400 tracking-wider">SORT BY:</span>
                <button
                  onClick={() => setSortOrder("desc")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    sortOrder === "desc"
                      ? "bg-red-600/30 border border-red-600/50 text-red-300"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  NEWEST FIRST
                </button>
                <button
                  onClick={() => setSortOrder("asc")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    sortOrder === "asc"
                      ? "bg-red-600/30 border border-red-600/50 text-red-300"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  OLDEST FIRST
                </button>
              </div>
            </motion.div>

            <div className="space-y-3 relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-600 via-red-600/50 to-transparent hidden sm:block" />

              <AnimatePresence>
                {sortedSubscriptions.map((sub, index) => (
                  <SubscriptionCard
                    key={sub._id}
                    subscription={sub}
                    index={index}
                    isExpanded={expandedItem === sub._id}
                    onToggle={() => setExpandedItem(expandedItem === sub._id ? null : sub._id)}
                    admissionFee={subscription.admissionFee}
                    discountTypeOnAdFee={subscription.discountTypeOnAdFee}
                    discountOnAdFee={subscription.discountOnAdFee}
                    finalAdFee={subscription.finalAdFee}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="my-12 border-t border-white/10" />
        </>
      )}

      {personalTrainingData?.subscription?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-600/30">
                <Dumbbell className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-blue-400">PERSONAL TRAINING HISTORY</h2>
                <p className="text-xs text-gray-500">{personalTrainingData.subscription.length} records</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatBox 
              icon={<CheckCircle2 className="w-4 h-4" />}
              label="Active"
              value={sortedPersonalTraining.filter(s => s.status?.toLowerCase() === 'active').length}
              color="green"
            />
            <StatBox 
              icon={<XCircle className="w-4 h-4" />}
              label="Completed"
              value={sortedPersonalTraining.filter(s => s.status?.toLowerCase() === 'completed').length}
              color="blue"
            />
            <StatBox 
              icon={<User className="w-4 h-4" />}
              label="Trainers"
              value={new Set(sortedPersonalTraining.map(p => p.trainer?._id)).size}
              color="purple"
            />
            <StatBox 
              icon={<Dumbbell className="w-4 h-4" />}
              label="Total"
              value={sortedPersonalTraining.length}
              color="yellow"
            />
          </div>

          <div className="space-y-3 relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-blue-600/50 to-transparent hidden sm:block" />

            <AnimatePresence>
              {sortedPersonalTraining.map((pt, index) => (
                <PersonalTrainingCard
                  key={pt._id}
                  personalTraining={pt}
                  index={index}
                  isExpanded={expandedItem === pt._id}
                  onToggle={() => setExpandedItem(expandedItem === pt._id ? null : pt._id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-12 pt-6 border-t border-white/10 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4">
          <Shield className="w-3.5 h-3.5" />
          <span>Secured with blockchain verification</span>
        </div>
        <Link 
          to="/member/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-red-600/30 bg-red-600/10 hover:bg-red-600/20 transition-all duration-300 group"
        >
          <ChevronLeft className="w-4 h-4 text-red-400 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black text-red-400">BACK TO DASHBOARD</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function SubscriptionCard({ 
  subscription, 
  index, 
  isExpanded, 
  onToggle,
  admissionFee,
  discountTypeOnAdFee,
  discountOnAdFee,
  finalAdFee
}) {
  const statusConfig = {
    active: { color: "green", icon: CheckCircle2, label: "ACTIVE", bg: "bg-green-500/20", border: "border-green-500/30", text: "text-green-400" },
    expired: { color: "red", icon: XCircle, label: "EXPIRED", bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400" },
    pending: { color: "yellow", icon: AlertCircle, label: "PENDING", bg: "bg-yellow-500/20", border: "border-yellow-500/30", text: "text-yellow-400" },
    cancelled: { color: "gray", icon: XCircle, label: "CANCELLED", bg: "bg-gray-500/20", border: "border-gray-500/30", text: "text-gray-400" }
  };

  const config = statusConfig[subscription.status?.toLowerCase()] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="group relative sm:pl-8"
    >
      <div className="absolute -left-8 top-6 w-4 h-4 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-2 border-black hidden sm:block" />

      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur" />
      
      <div className="relative bg-gradient-to-b from-neutral-900 to-black p-5 sm:p-6 rounded-2xl border border-white/10 group-hover:border-red-600/50 transition-all duration-500">
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-red-600/20 rounded-lg border border-red-600/30">
              <FileText className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-black text-white group-hover:text-red-400 transition-colors">
                {subscription.plan?.toUpperCase() || "PREMIUM PLAN"}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} border ${config.border} ${config.text}`}>
                  <StatusIcon className="w-3 h-3 inline mr-1" />
                  {config.label}
                </span>
              </div>
            </div>
          </div>
          
          <motion.button
            animate={{ rotate: isExpanded ? 180 : 0 }}
            onClick={onToggle}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 ml-2"
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

        <div className="flex items-center text-xs text-gray-400 gap-1 mb-4 pb-4 border-b border-white/10">
          <Calendar className="w-3 h-3 text-red-400" />
          <span>{fmt(subscription.startDate)}</span>
          <ArrowRight className="w-3 h-3 text-gray-600 mx-1" />
          <span>{fmt(subscription.endDate)}</span>
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
              <div className="space-y-4 pt-2">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h5 className="text-xs font-black text-gray-400 tracking-wider mb-3">ADMISSION FEE</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-xs">
                      <div className="text-gray-500 mb-1">Original Fee</div>
                      <div className="font-black text-white">₹{admissionFee}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500 mb-1">Type</div>
                      <div className="font-black text-white">{formatDiscountType(discountTypeOnAdFee)}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500 mb-1">Discount</div>
                      <div className="font-black text-white">₹{discountOnAdFee || 0}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500 mb-1">Final Amount</div>
                      <div className="font-black text-red-400">₹{finalAdFee}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h5 className="text-xs font-black text-gray-400 tracking-wider mb-3">VALIDITY DETAILS</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Start Date</span>
                      <span className="text-gray-300">{fmt(subscription.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">End Date</span>
                      <span className="text-gray-300">{fmt(subscription.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="text-gray-300">{getDuration(subscription.startDate, subscription.endDate)} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PersonalTrainingCard({ 
  personalTraining, 
  index, 
  isExpanded, 
  onToggle
}) {
  const statusConfig = {
    active: { color: "green", icon: CheckCircle2, label: "ACTIVE", bg: "bg-green-500/20", border: "border-green-500/30", text: "text-green-400" },
    completed: { color: "blue", icon: CheckCircle2, label: "COMPLETED", bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400" },
    pending: { color: "yellow", icon: AlertCircle, label: "PENDING", bg: "bg-yellow-500/20", border: "border-yellow-500/30", text: "text-yellow-400" },
    cancelled: { color: "gray", icon: XCircle, label: "CANCELLED", bg: "bg-gray-500/20", border: "border-gray-500/30", text: "text-gray-400" }
  };

  const config = statusConfig[personalTraining.status?.toLowerCase()] || statusConfig.pending;
  const StatusIcon = config.icon;
  const trainer = personalTraining.trainer;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="group relative sm:pl-8"
    >
      <div className="absolute -left-8 top-6 w-4 h-4 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-black hidden sm:block" />

      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur" />
      
      <div className="relative bg-gradient-to-b from-neutral-900 to-black p-5 sm:p-6 rounded-2xl border border-white/10 group-hover:border-blue-600/50 transition-all duration-500">
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {trainer?.avatar?.url ? (
              <img 
                src={trainer.avatar.url} 
                alt={trainer.fullName}
                className="w-10 h-10 rounded-lg object-cover border border-blue-600/30"
              />
            ) : (
              <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-600/30">
                <Dumbbell className="w-4 h-4 text-blue-500" />
              </div>
            )}
            <div className="flex-1">
              <h4 className="text-base font-black text-white group-hover:text-blue-400 transition-colors">
                {trainer?.fullName || "Personal Training"}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} border ${config.border} ${config.text}`}>
                  <StatusIcon className="w-3 h-3 inline mr-1" />
                  {config.label}
                </span>
                {personalTraining.plan && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400">
                    {personalTraining.plan.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <motion.button
            animate={{ rotate: isExpanded ? 180 : 0 }}
            onClick={onToggle}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 ml-2"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </motion.button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <QuickInfo icon={<DollarSign className="w-3 h-3" />} label="Base Price" value={`₹${personalTraining.basePrice}`} />
          <QuickInfo icon={<Percent className="w-3 h-3" />} label="Discount" value={`₹${personalTraining.discount?.amount?.toFixed(2) || 0}`} />
          <QuickInfo icon={<Crown className="w-3 h-3" />} label="Final" value={`₹${personalTraining.finalPrice?.toFixed(2)}`} highlight />
          <QuickInfo icon={<BadgeCheck className="w-3 h-3" />} label="Payment" value={personalTraining.paymentMethod?.toUpperCase() || "N/A"} />
        </div>

        <div className="flex items-center text-xs text-gray-400 gap-1 mb-4 pb-4 border-b border-white/10">
          <Calendar className="w-3 h-3 text-blue-400" />
          <span>{fmt(personalTraining.startDate)}</span>
          <ArrowRight className="w-3 h-3 text-gray-600 mx-1" />
          <span>{fmt(personalTraining.endDate)}</span>
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
              <div className="space-y-4 pt-2">
                {trainer && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h5 className="text-xs font-black text-gray-400 tracking-wider mb-3">TRAINER INFO</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name</span>
                        <span className="text-gray-300 font-black">{trainer.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Experience</span>
                        <span className="text-gray-300">{trainer.experience}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Contact</span>
                        <span className="text-gray-300">{trainer.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h5 className="text-xs font-black text-gray-400 tracking-wider mb-3">PRICING DETAILS</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base Price</span>
                      <span className="text-gray-300">₹{personalTraining.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount Type</span>
                      <span className="text-gray-300">{personalTraining.discount?.typeOfDiscount?.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount Value</span>
                      <span className="text-gray-300">
                        {personalTraining.discount?.typeOfDiscount === 'percentage' 
                          ? `${personalTraining.discount.value}%` 
                          : `₹${personalTraining.discount?.value}`}
                      </span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between font-black">
                      <span className="text-gray-400">Final Price</span>
                      <span className="text-blue-400">₹{personalTraining.finalPrice?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h5 className="text-xs font-black text-gray-400 tracking-wider mb-3">DETAILS</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="text-gray-300">{getDuration(personalTraining.startDate, personalTraining.endDate)} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Method</span>
                      <span className="text-gray-300 font-black">{personalTraining.paymentMethod?.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reference</span>
                      <span className="text-gray-300 font-mono text-[9px]">{personalTraining.ref}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function StatBox({ icon, label, value, color }) {
  const colorClasses = {
    red: "from-red-600/20 to-red-800/20 border-red-600/30",
    green: "from-green-600/20 to-green-800/20 border-green-600/30",
    yellow: "from-yellow-600/20 to-yellow-800/20 border-yellow-600/30",
    purple: "from-purple-600/20 to-purple-800/20 border-purple-600/30",
    blue: "from-blue-600/20 to-blue-800/20 border-blue-600/30"
  };

  const iconColorClasses = {
    red: "text-red-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    purple: "text-purple-400",
    blue: "text-blue-400"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${colorClasses[color]} border`}
    >
      <div className="relative z-10 flex items-center gap-2">
        <div className={iconColorClasses[color]}>{icon}</div>
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-lg font-black text-white">{value}</div>
        </div>
      </div>
    </motion.div>
  );
}

function QuickInfo({ icon, label, value, highlight = false }) {
  return (
    <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
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

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center p-4"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 p-12 text-center max-w-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent" />
        
        <div className="relative z-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-600/20 to-red-800/20 border-2 border-red-600/30 flex items-center justify-center"
          >
            <History className="w-14 h-14 text-red-500" />
          </motion.div>

          <h3 className="text-2xl sm:text-3xl font-black mb-4 bg-gradient-to-r from-white via-red-300 to-white bg-clip-text text-transparent">
            NO HISTORY FOUND
          </h3>
          
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
            No subscriptions or personal training records available.
          </p>

          <Link 
            to="/member/dashboard"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 rounded-xl font-black tracking-widest text-sm hover:from-red-800 hover:to-red-600 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            BACK TO DASHBOARD
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center p-4"
    >
      <div className="relative overflow-hidden rounded-3xl border border-red-600/30 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 p-12 text-center max-w-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent" />
        
        <div className="relative z-10">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-8"
          >
            <Loader className="w-full h-full text-red-500" />
          </motion.div>

          <h3 className="text-xl font-black mb-2 text-white">
            Loading Your History
          </h3>
          
          <p className="text-gray-400 text-sm">
            Fetching your membership records...
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ErrorState({ error }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center p-4"
    >
      <div className="relative overflow-hidden rounded-3xl border border-red-600/30 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 p-12 text-center max-w-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent" />
        
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-red-600/20 border-2 border-red-600/30 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          <h3 className="text-xl font-black mb-2 text-white">
            Error Loading History
          </h3>
          
          <p className="text-gray-400 text-sm mb-8">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-lg font-black text-sm hover:from-red-800 hover:to-red-600 transition-all text-white"
          >
            <ArrowRight className="w-4 h-4" />
            RETRY
          </button>
        </div>
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

const getDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "N/A";
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff;
};

const formatDiscountType = (type) => {
  if (!type || type === "none") return "—";
  if (type === "percentage") return "% OFF";
  if (type === "flat") return "FLAT ₹";
  return type.toUpperCase();
};