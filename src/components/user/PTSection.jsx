export default function PTSection({ pt }) {
  if (!pt || !pt.subscription?.length) {
    return EmptyBox("NO PERSONAL TRAINING");
  }

  const current = pt.subscription.at(-1);

  return (
    <div className="border border-red-600/30 bg-black p-6 rounded-xl">
      <h3 className="font-black tracking-widest mb-4">
        PERSONAL TRAINING
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <img
          src={current.trainer.avatar.url}
          className="w-14 h-14 rounded-full border border-red-600 object-cover"
        />

        <div>
          <p className="font-bold">{current.trainer.fullName}</p>
          <p className="text-xs text-gray-400">
            {current.trainer.experience}
          </p>
        </div>
      </div>

      <Row label="PLAN" value={current.plan.toUpperCase()} />
      <Row label="PRICE" value={`₹${current.price}`} />
      <Row label="STATUS" value={current.status} />
      <Row
        label="VALIDITY"
        value={`${fmt(current.startDate)} → ${fmt(current.endDate)}`}
      />
    </div>
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

const EmptyBox = (text) => (
  <div className="border border-white/10 p-10 text-gray-500 text-center">
    {text}
  </div>
);
