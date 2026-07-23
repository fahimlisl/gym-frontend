import { useState, useMemo } from "react";

export default function PTCard({ pt, onRenew, onAssign, isSubActive }) {
  const [showHistory, setShowHistory] = useState(false);

  if (!pt || !pt.subscription?.length) {
    return (
      <div className="border border-red-600/30 bg-black p-6 rounded-xl space-y-4">
        <h3 className="font-black tracking-widest text-lg">
          PERSONAL TRAINING
        </h3>
        <p className="text-gray-400 text-sm">
          No personal training assigned
        </p>
        {isSubActive ? (
          <button 
            onClick={onAssign}
            className="w-full bg-red-600 py-3 font-extrabold tracking-widest hover:bg-red-700 transition"
          >
            ASSIGN TRAINER
          </button>
        ) : (
          <p className="text-xs text-gray-500 tracking-widest text-center">
            Active gym membership required to assign PT
          </p>
        )}
      </div>
    );
  }

  const subs = pt.subscription;
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
      
      if (startDate <= now && endDate >= now) {
        active.push({ ...sub, isFirstEver: index === 0 });
      } else if (startDate > now) {
        upcoming.push({ ...sub, isFirstEver: index === 0 });
      } else if (endDate < now) {
        past.push({ ...sub, isFirstEver: index === 0 });
      }
    });
    
    return { activeSubscriptions: active, upcomingSubscriptions: upcoming, pastSubscriptions: past };
  }, [subs]);

  const currentActive = activeSubscriptions[activeSubscriptions.length - 1];
  const hasActiveSubscription = currentActive !== undefined;
  
  return (
    <div className="border border-red-600/30 bg-black p-6 rounded-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-black tracking-widest text-lg">
          PERSONAL TRAINING
        </h3>
        <button
          onClick={onRenew}
          className="text-xs font-bold tracking-widest text-green-400 
                     border border-green-600/50 px-4 py-2 rounded-lg
                     hover:bg-green-600/20 transition"
        >
          {hasActiveSubscription ? "+ ADVANCE" : "+ RENEW"}
        </button>
      </div>

      {/* 1. CURRENT ACTIVE PT */}
      {currentActive && (
        <div className="border border-green-600/40 bg-neutral-950 p-5 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-widest text-green-500 font-bold">CURRENTLY ACTIVE</p>
            <span className="px-2 py-1 text-[10px] font-bold rounded bg-green-600/20 text-green-400">
              {currentActive.status?.toUpperCase()}
            </span>
          </div>
          
          {/* Trainer Info */}
          {currentActive.trainer && (
            <div className="flex items-center gap-4 p-3 bg-black/50 rounded-lg border border-white/5">
              <img
                src={currentActive.trainer?.avatar?.url}
                className="w-14 h-14 rounded-full border-2 border-red-600 object-cover"
                alt="Trainer"
              />
              <div>
                <p className="font-bold text-base">{currentActive.trainer?.fullName?.toUpperCase()}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {currentActive.trainer?.specialization?.toUpperCase() || "PERSONAL TRAINER"}
                </p>
                <p className="text-xs text-red-400 mt-0.5">
                  {currentActive.trainer?.experience || "N/A"} years experience
                </p>
              </div>
            </div>
          )}

          {/* PT Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Detail label="PLAN" value={currentActive.plan?.toUpperCase()} />
            <Detail label="PRICE" value={`₹${currentActive.finalPrice || currentActive.price}`} />
            <Detail label="START" value={fmt(currentActive.startDate)} />
            <Detail label="END" value={fmt(currentActive.endDate)} />
          </div>
          
          {currentActive.discount?.amount > 0 && (
            <div className="flex justify-between text-sm bg-red-600/10 p-2 rounded">
              <span className="text-gray-400">DISCOUNT</span>
              <span className="font-bold text-red-400">-₹{currentActive.discount.amount}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm pt-2 border-t border-white/10">
            <span className="text-gray-400">PAYMENT</span>
            <span className="font-bold capitalize">{currentActive.paymentStatus || "paid"}</span>
          </div>
        </div>
      )}

      {/* 2. UPCOMING/ADVANCE PT */}
      {upcomingSubscriptions.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs tracking-widest text-yellow-400 font-bold">⏳ UPCOMING</p>
          {upcomingSubscriptions.map((s, idx) => (
            <div 
              key={s._id} 
              className="border border-yellow-600/30 bg-neutral-950 p-5 rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs tracking-widest text-yellow-500 font-bold">
                  STARTS IN FUTURE
                </p>
                <span className="px-2 py-1 text-[10px] font-bold rounded bg-yellow-600/20 text-yellow-400">
                  {s.status?.toUpperCase()}
                </span>
              </div>
              
              {s.trainer && (
                <div className="flex items-center gap-4 p-3 bg-black/50 rounded-lg border border-white/5">
                  <img
                    src={s.trainer?.avatar?.url}
                    className="w-14 h-14 rounded-full border-2 border-yellow-600 object-cover"
                    alt="Trainer"
                  />
                  <div>
                    <p className="font-bold text-base">{s.trainer?.fullName?.toUpperCase()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {s.trainer?.specialization?.toUpperCase() || "PERSONAL TRAINER"}
                    </p>
                    <p className="text-xs text-yellow-400 mt-0.5">
                      {s.trainer?.experience || "N/A"} years experience
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="PLAN" value={s.plan?.toUpperCase()} />
                <Detail label="PRICE" value={`₹${s.finalPrice || s.price}`} />
                <Detail label="START" value={fmt(s.startDate)} />
                <Detail label="END" value={fmt(s.endDate)} />
              </div>
              
              {s.discount?.amount > 0 && (
                <div className="flex justify-between text-sm bg-yellow-600/10 p-2 rounded">
                  <span className="text-gray-400">DISCOUNT</span>
                  <span className="font-bold text-yellow-400">-₹{s.discount.amount}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-gray-400">PAYMENT</span>
                <span className="font-bold capitalize">{s.paymentStatus || "paid"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. PT HISTORY */}
      {pastSubscriptions.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-xs tracking-widest 
                       text-gray-400 hover:text-white transition py-2"
          >
            <span>📜 HISTORY ({pastSubscriptions.length})</span>
            <span className="text-lg">{showHistory ? '−' : '+'}</span>
          </button>
          
          {showHistory && (
            <div className="space-y-2">
              {[...pastSubscriptions].reverse().map((s) => (
                <div 
                  key={s._id} 
                  className="border border-white/10 bg-neutral-900 p-4 rounded-lg space-y-3"
                >
                  {s.trainer && (
                    <div className="flex items-center gap-3">
                      <img
                        src={s.trainer?.avatar?.url}
                        className="w-10 h-10 rounded-full border border-gray-600 object-cover"
                        alt="Trainer"
                      />
                      <div>
                        <p className="text-sm font-bold">{s.trainer?.fullName?.toUpperCase()}</p>
                        <p className="text-[10px] text-gray-400">{s.trainer?.experience || "N/A"} yrs</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Detail label="PLAN" value={s.plan?.toUpperCase()} />
                    <Detail label="PRICE" value={`₹${s.finalPrice || s.price}`} />
                    <Detail label="PERIOD" value={`${fmt(s.startDate)} → ${fmt(s.endDate)}`} />
                    <Detail label="STATUS" value={s.status?.toUpperCase()} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-gray-500 tracking-widest mb-0.5">{label}</p>
      <p className="font-semibold text-sm">{value || "—"}</p>
    </div>
  );
}

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric"
});