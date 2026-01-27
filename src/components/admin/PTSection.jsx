export default function PTSection({ pt, onAssign, onRenew }) {
  /* ================= NO PT ================= */

  if (!pt) {
    return (
      <div className="rounded-xl border border-red-600/30
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      p-8 text-center space-y-6">

        <p className="text-sm text-gray-400 tracking-widest">
          NO PERSONAL TRAINING ASSIGNED
        </p>

        <button
          onClick={onAssign}
          className="bg-red-600 hover:bg-red-700
                     px-10 py-4 text-xs font-extrabold tracking-widest
                     shadow-[0_0_35px_rgba(239,68,68,0.4)]"
        >
          ASSIGN PERSONAL TRAINING
        </button>
      </div>
    );
  }

  /* ================= HAS PT ================= */

  const current =
    pt.subscription?.[pt.subscription.length - 1];

  return (
    <div className="rounded-xl border border-white/10
                    bg-gradient-to-br from-black via-neutral-900 to-black
                    p-8 space-y-6">

      {/* TRAINER */}
      <div className="flex items-center gap-5">
        <img
          src={current.trainer?.avatar?.url}
          className="w-16 h-16 rounded-full border-2 border-red-600 object-cover"
          alt="Trainer"
        />

        <div>
          <p className="text-lg font-extrabold tracking-wide">
            {current.trainer?.fullName}
          </p>
          <p className="text-xs text-gray-400">
            {current.trainer?.experience || "Trainer"}
          </p>
        </div>
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <Info label="PLAN" value={current.plan} />
        <Info label="PRICE" value={`₹${current.price}`} />
        <Info
          label="START DATE"
          value={formatDate(current.startDate)}
        />
        <Info
          label="END DATE"
          value={formatDate(current.endDate)}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={onRenew}
          className="flex-1 border border-red-600
                     hover:bg-red-600 hover:text-black
                     px-6 py-3 text-xs font-extrabold tracking-widest
                     transition"
        >
          RENEW PT
        </button>

        <button
          onClick={onAssign}
          className="flex-1 border border-white/20
                     hover:border-red-600 hover:text-red-500
                     px-6 py-3 text-xs font-extrabold tracking-widest
                     transition"
        >
          CHANGE TRAINER
        </button>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 tracking-widest">
        {label}
      </p>
      <p className="font-semibold mt-1">
        {value || "—"}
      </p>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}
