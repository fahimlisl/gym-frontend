export default function SubscriptionSection({ subscription }) {
  if (!subscription || !subscription.subscription?.length) {
    return EmptyBox("NO MEMBERSHIP FOUND");
  }

  return (
    <div className="border border-red-600/30 bg-black p-6 rounded-xl">
      <h3 className="font-black tracking-widest mb-4">
        MEMBERSHIP HISTORY
      </h3>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {[...subscription.subscription].reverse().map((s) => (
          <div
            key={s._id}
            className="border border-white/10 p-4 text-sm bg-neutral-900/40"
          >
            <Row label="PLAN" value={s.plan.toUpperCase()} />
            <Row label="PRICE" value={`₹${s.price}`} />
            <Row label="STATUS" value={s.status} />
            <Row
              label="VALIDITY"
              value={`${fmt(s.startDate)} → ${fmt(s.endDate)}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

const fmt = (d) => new Date(d).toLocaleDateString();

const EmptyBox = (text) => (
  <div className="border border-white/10 p-10 text-gray-500 text-center">
    {text}
  </div>
);
