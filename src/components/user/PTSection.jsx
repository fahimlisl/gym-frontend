import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.api";
import { GetTrainerUI } from "./GetTrainerUI";
import PTRequestStatus from "../../pages/user/PTRequestStatus";
import { Dumbbell, Calendar, CreditCard, Award, User, Shield, ChevronRight, RotateCcw } from "lucide-react";

const IS_TESTING = process.env.NODE_ENV === "testing";
// const IS_TESTING = true

export default function PTSection({ pt }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await api.get("/user/pt/request/status");
      setStatus(res.data.data);
    } catch (err) {
      if (err.response?.status !== 400) {
        toast.error("Failed to fetch PT request status");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PTSkeleton />;
  }
  if (status) {
    return <PTRequestStatus status={status} />;
  }
  if (pt && pt.subscription?.length && pt.subscription[pt.subscription.length - 1].trainer) {
    const current = pt.subscription.at(-1);
    return <ActivePTSubscription subscription={current} />;
  }

  return <GetTrainerUI />;
}

function ActivePTSubscription({ subscription }) {
  const trainer = subscription.trainer;
  const isExpired = subscription.status?.toLowerCase() === "expired";
  const showRenewalBtn = IS_TESTING || isExpired;
  
  const statusConfig = {
    active: { 
      color: "text-emerald-400", 
      bg: "bg-emerald-500/10", 
      border: "border-emerald-500/20", 
      icon: <Shield className="w-3 h-3" />,
      label: "ACTIVE"
    },
    pending: { 
      color: "text-amber-400", 
      bg: "bg-amber-500/10", 
      border: "border-amber-500/20", 
      icon: <Shield className="w-3 h-3" />,
      label: "PENDING"
    },
    expired: { 
      color: "text-red-400", 
      bg: "bg-red-500/10", 
      border: "border-red-500/20", 
      icon: <Shield className="w-3 h-3" />,
      label: "EXPIRED"
    },
    cancelled: { 
      color: "text-gray-400", 
      bg: "bg-gray-500/10", 
      border: "border-gray-500/20", 
      icon: <Shield className="w-3 h-3" />,
      label: "CANCELLED"
    }
  };

  const status = statusConfig[subscription.status?.toLowerCase()] || statusConfig.active;

  const handleRenewal = () => {
    window.location.href = "/member/pt-plans";
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-red-400/20 
                    rounded-2xl opacity-0 group-hover:opacity-100 blur 
                    transition-all duration-500" />
      
      <div className="relative bg-gradient-to-br from-neutral-900 via-black to-neutral-900 
                    border border-red-600/30 rounded-xl overflow-hidden
                    shadow-xl">
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 
                            rounded-lg flex items-center justify-center
                            shadow-lg shadow-red-500/20">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-400 tracking-wider">
                  PERSONAL TRAINING
                </h3>
                <p className="text-lg font-black tracking-widest text-white">
                  ACTIVE PLAN
                </p>
              </div>
            </div>
            
            <div className={`px-3 py-1.5 rounded-full ${status.bg} ${status.border} border 
                          flex items-center gap-1.5 text-xs font-medium ${status.color}`}>
              {status.icon}
              <span>{status.label}</span>
            </div>
          </div>

          <div className="bg-neutral-800/30 rounded-xl p-4 
                        border border-neutral-700/50 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={trainer.avatar?.url || "/default-avatar.png"}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl 
                           border-2 border-red-600/30 object-cover"
                  alt={trainer.fullName}
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 
                              bg-emerald-500 rounded-full border-2 border-black" />
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg sm:text-xl font-bold text-white mb-1">
                  {trainer.fullName}
                </h4>
                <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-red-400" />
                  {trainer.experience} years experience
                </p>
                {trainer.specialization && (
                  <p className="text-xs text-gray-500 mt-1">
                    {trainer.specialization}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <DetailRow 
              icon={<Calendar className="w-4 h-4 text-red-400" />}
              label="Plan"
              value={subscription.plan?.toUpperCase() || 'N/A'}
            />
            <DetailRow 
              icon={<CreditCard className="w-4 h-4 text-red-400" />}
              label="Price"
              value={`₹${subscription.finalPrice?.toLocaleString() || 0}`}
            />
            <DetailRow 
              icon={<Calendar className="w-4 h-4 text-red-400" />}
              label="Valid From"
              value={fmt(subscription.startDate)}
            />
            <DetailRow 
              icon={<Calendar className="w-4 h-4 text-red-400" />}
              label="Valid Until"
              value={fmt(subscription.endDate)}
            />
          </div>

          {showRenewalBtn && (
            <button
              onClick={handleRenewal}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 
                       hover:from-orange-500 hover:to-red-500 text-white font-bold text-sm
                       rounded-lg transition-all duration-300 flex items-center justify-center gap-2
                       border border-orange-500/50 hover:border-orange-500
                       shadow-lg hover:shadow-orange-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              RENEW PLAN
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

function PTSkeleton() {
  return (
    <div className="border border-neutral-800 rounded-xl p-6
                  bg-gradient-to-br from-neutral-900 to-black
                  animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-neutral-800 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-3 w-24 bg-neutral-800 rounded"></div>
          <div className="h-5 w-32 bg-neutral-800 rounded"></div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-neutral-800 rounded-xl"></div>
        <div className="space-y-2 flex-1">
          <div className="h-5 w-32 bg-neutral-800 rounded"></div>
          <div className="h-3 w-24 bg-neutral-800 rounded"></div>
        </div>
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-8 bg-neutral-800 rounded"></div>
        ))}
      </div>
      
      <div className="h-10 bg-neutral-800 rounded-lg mt-6"></div>
    </div>
  );
}

const fmt = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};