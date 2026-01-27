export default function SubscriptionCard({ subscription, onRenew }) {
  if (!subscription || !subscription.subscription?.length) {
    return (
      <div className="border border-white/10 bg-black p-6 rounded-xl text-gray-400">
        NO SUBSCRIPTION FOUND
      </div>
    );
  }

  const subs = subscription.subscription;
  const current = subs[subs.length - 1]; // latest = active

  return (
    <div className="border border-red-600/30 bg-black p-6 rounded-xl space-y-6">

      {/* ================= HEADER ================= */}
      <div>
        <h3 className="font-black tracking-widest">
          GYM SUBSCRIPTION
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Membership details & history
        </p>
      </div>

      {/* ================= CURRENT SUB ================= */}
      <div className="border border-red-600/40 bg-neutral-950 p-4 rounded-lg space-y-2">
        <p className="text-xs tracking-widest text-red-500">
          CURRENT PLAN
        </p>

        <Row label="Plan" value={current.plan.toUpperCase()} />
        <Row label="Price" value={`₹${current.price}`} />
        <Row
          label="Admission Fee"
          value={`₹${subscription.admissionFee}`}
        />
        <Row label="Status" value={current.status} />
        <Row
          label="Validity"
          value={`${format(current.startDate)} → ${format(
            current.endDate
          )}`}
        />

        <button
          onClick={onRenew}
          className="w-full mt-4 border border-red-600 py-3
                     font-extrabold tracking-widest
                     hover:bg-red-600 transition"
        >
          RENEW MEMBERSHIP
        </button>
      </div>

      {/* ================= HISTORY ================= */}
      {subs.length > 1 && (
        <div className="space-y-4">
          <p className="text-xs tracking-widest text-gray-400">
            SUBSCRIPTION HISTORY
          </p>

          <div className="space-y-3">
            {[...subs]
              .slice(0, -1)
              .reverse()
              .map((s, idx) => (
                <div
                  key={s._id}
                  className="border border-white/10
                             bg-neutral-900 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-sm">
                      {s.plan.toUpperCase()}
                    </p>
                    <span className="text-xs text-gray-400">
                      ₹{s.price}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400 space-y-1">
                    <p>
                      {format(s.startDate)} → {format(s.endDate)}
                    </p>
                    <p>Status: {s.status}</p>
                    <p>Payment: {s.paymentStatus}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= HELPERS ================= */

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

const format = (d) =>
  new Date(d).toLocaleDateString();
