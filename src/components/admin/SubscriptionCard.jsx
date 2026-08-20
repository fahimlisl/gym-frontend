import { useState, useMemo } from "react";
import ChangeDateModal from "./ChangeDateModal";

export default function SubscriptionCard({ 
  isSuperAdmin, 
  subscription, 
  userId, 
  onRenew, 
  onRefresh,
  canRenew 
}) {
  const [changeDateOpen, setChangeDateOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (!subscription || !subscription.subscription?.length) {
    return (
      <div className="border border-white/10 bg-black p-6 rounded-xl text-gray-400">
        NO SUBSCRIPTION FOUND
      </div>
    );
  }

  const subs = subscription.subscription;
  const now = new Date();
  
  const { 
    activeSubscriptions, 
    upcomingSubscriptions, 
    pastSubscriptions 
  } = useMemo(() => {
    const active = [];
    const upcoming = [];
    const past = [];
    
    subs.forEach((sub, index) => {
      const startDate = new Date(sub.startDate);
      const endDate = new Date(sub.endDate);
      const isFirstEver = index === 0;
      
      const enrichedSub = { ...sub, isFirstEver, _originalIndex: index };
      
      if (startDate <= now && endDate >= now) {
        active.push(enrichedSub);
      } else if (startDate > now) {
        upcoming.push(enrichedSub);
      } else if (endDate < now) {
        past.push(enrichedSub);
      }
    });
    
    return { activeSubscriptions: active, upcomingSubscriptions: upcoming, pastSubscriptions: past };
  }, [subs]);

  const currentActive = activeSubscriptions[activeSubscriptions.length - 1];
  const lastSub = subs[subs.length - 1];
  const lastSubEndDate = new Date(lastSub.endDate);
  const hasActiveSubscription = currentActive !== undefined;
  
  return (
    <>
      <div className="border border-red-600/30 bg-black p-6 rounded-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black tracking-widest">GYM SUBSCRIPTION</h3>
            <p className="text-xs text-gray-400 mt-1">Membership details & history</p>
          </div>
          <div className="flex gap-2">
            {/* Renew/Advance button – now gated by canRenew */}
            <button
              onClick={onRenew}
              disabled={!canRenew}
              title={!canRenew ? "You don't have permission to renew or advance" : ""}
              className={`
                flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-widest 
                border border-green-600/50 text-green-400 rounded-lg 
                hover:bg-green-600/20 transition cursor-pointer
                ${!canRenew ? "opacity-40 cursor-not-allowed" : ""}
              `}
            >
              {hasActiveSubscription ? "+ ADVANCE" : "+ RENEW"}
            </button>

            {/* Edit Dates – super admin only (keep as is) */}
            <button
              onClick={() => isSuperAdmin && currentActive && setChangeDateOpen(true)}
              disabled={!isSuperAdmin || !currentActive}
              title={!isSuperAdmin ? "Super admin only" : !currentActive ? "No active subscription" : ""}
              className={`
                flex items-center gap-1.5 px-3 py-1.5
                text-[10px] font-bold tracking-widest
                border border-white/10 rounded-lg
                transition
                ${isSuperAdmin && currentActive
                  ? "text-gray-400 hover:border-red-600/50 hover:text-red-400 cursor-pointer"
                  : "text-gray-600 opacity-40 cursor-not-allowed"
                }
              `}
            >
              <span>✎</span> EDIT DATES
            </button>
          </div>
        </div>

        {/* Rest of the component unchanged... */}

        {currentActive && (
          <div className="border border-green-600/40 bg-neutral-950 p-4 rounded-lg space-y-2">
            <p className="text-xs tracking-widest text-green-500">CURRENTLY ACTIVE</p>
            <Row label="Plan" value={currentActive.plan.toUpperCase()} />
            <Row label="Base Price" value={`₹${currentActive.baseAmount}`} />
            {currentActive.discount?.amount > 0 && (
              <Row label="Discount" value={`₹${currentActive.discount.amount}`} />
            )}
            <Row label="Final Amount" value={`₹${currentActive.finalAmount}`} />
            {currentActive.isFirstEver && (
              <>
                <Row label="Admission Fee" value={`₹${subscription.admissionFee}`} />
                {subscription.discountTypeOnAdFee !== "none" && (
                  <Row
                    label="Admission Discount"
                    value={
                      subscription.discountTypeOnAdFee === "percentage"
                        ? `${subscription.discountOnAdFee}%`
                        : `₹${subscription.discountOnAdFee}`
                    }
                  />
                )}
                <Row label="Final Admission Fee" value={`₹${subscription.finalAdFee}`} />
                <Row label="Subtotal" value={`₹${subscription.finalAdFee + currentActive.finalAmount}`} />
              </>
            )}
            <Row label="Status" value={currentActive.status} />
            <Row label="Payment" value={currentActive.paymentStatus} />
            <Row
              label="Validity"
              value={`${fmt(currentActive.startDate)} → ${fmt(currentActive.endDate)}`}
            />
          </div>
        )}

        {/* Upcoming & History sections unchanged... */}
        {upcomingSubscriptions.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs tracking-widest text-yellow-400 flex items-center gap-2">
              <span>⏳</span> UPCOMING SUBSCRIPTIONS
            </p>
            {upcomingSubscriptions.map((s, idx) => (
              <div 
                key={s._id} 
                className="border border-yellow-600/30 bg-neutral-900 p-4 rounded-lg space-y-2"
              >
                <p className="text-xs tracking-widest text-yellow-500">
                  STARTS IN FUTURE • {idx + 1}
                </p>
                <Row label="Plan" value={s.plan.toUpperCase()} />
                <Row label="Base Price" value={`₹${s.baseAmount}`} />
                {s.discount?.amount > 0 && (
                  <>
                    <Row label="Discount" value={`₹${s.discount.amount}`} />
                    {s.discount.code && (
                      <Row label="Coupon" value={s.discount.code} />
                    )}
                  </>
                )}
                <Row label="Final Amount" value={`₹${s.finalAmount}`} />
                <Row label="Status" value={s.status} />
                <Row label="Payment" value={s.paymentStatus} />
                <Row
                  label="Validity"
                  value={`${fmt(s.startDate)} → ${fmt(s.endDate)}`}
                />
              </div>
            ))}
          </div>
        )}

        {pastSubscriptions.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-between w-full text-xs tracking-widest text-gray-400 
                         hover:text-white transition"
            >
              <span>📜 SUBSCRIPTION HISTORY ({pastSubscriptions.length})</span>
              <span className="text-lg">{showHistory ? '−' : '+'}</span>
            </button>
            
            {showHistory && (
              <div className="space-y-3">
                {[...pastSubscriptions].reverse().map((s) => (
                  <div 
                    key={s._id} 
                    className="border border-white/10 bg-neutral-900 p-4 rounded-lg"
                  >
                    <div className="flex justify-between text-sm font-bold">
                      <span>{s.plan.toUpperCase()}</span>
                      <span>₹{s.finalAmount}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 space-y-1">
                      <p>Base: ₹{s.baseAmount}</p>
                      {s.discount?.amount > 0 && <p>Discount: ₹{s.discount.amount}</p>}
                      {s.isFirstEver && (
                        <>
                          <p>Admission Fee: ₹{subscription.admissionFee}</p>
                          {subscription.discountTypeOnAdFee !== "none" && (
                            <p>
                              Admission Discount:{" "}
                              {subscription.discountTypeOnAdFee === "percentage"
                                ? `${subscription.discountOnAdFee}%`
                                : `₹${subscription.discountOnAdFee}`}
                            </p>
                          )}
                          <p>Final Admission Fee: ₹{subscription.finalAdFee}</p>
                        </>
                      )}
                      <p>{fmt(s.startDate)} → {fmt(s.endDate)}</p>
                      <p>Status: {s.status}</p>
                      <p>Payment: {s.paymentStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!currentActive && upcomingSubscriptions.length === 0 && pastSubscriptions.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No subscriptions found
          </div>
        )}
      </div>

      {changeDateOpen && currentActive && (
        <ChangeDateModal
          userId={userId}
          currentStart={currentActive.startDate}
          currentEnd={currentActive.endDate}
          onClose={() => setChangeDateOpen(false)}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

const fmt = (d) => new Date(d).toLocaleDateString();