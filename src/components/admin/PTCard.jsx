export default function PTCard({ pt }) {
  if (!pt) {
    return (
      <div className="border border-white/10 bg-black p-6 space-y-4">
        <h3 className="font-black tracking-widest text-lg">
          PERSONAL TRAINING
        </h3>

        <p className="text-gray-400 text-sm">
          No personal training assigned
        </p>

        <button className="w-full bg-red-600 py-3 font-extrabold tracking-widest hover:bg-red-700">
          ASSIGN TRAINER
        </button>
      </div>
    );
  }

  const current = pt.subscription.at(-1);

  return (
    <div className="border border-red-600/30 bg-black p-6 space-y-4">
      <h3 className="font-black tracking-widest text-lg">
        PERSONAL TRAINING
      </h3>

      <Detail label="PLAN" value={current.plan} />
      <Detail label="PRICE" value={`₹${current.price}`} />
      <Detail
        label="VALIDITY"
        value={`${format(current.startDate)} → ${format(current.endDate)}`}
      />

      <button className="w-full border border-red-600 py-3 font-extrabold tracking-widest hover:bg-red-600">
        RENEW / CHANGE TRAINER
      </button>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function format(date) {
  return new Date(date).toLocaleDateString();
}
