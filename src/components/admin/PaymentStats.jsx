export default function PaymentStats({ total, transactions }) {
  const subsTotal = transactions
    .filter(t => t.source === "subscription")
    .reduce((a, b) => a + b.amount, 0);

  const ptTotal = transactions
    .filter(t => t.source === "personal-training")
    .reduce((a, b) => a + b.amount, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

      <Stat
        label="TOTAL REVENUE"
        value={`₹${total.toLocaleString()}`}
      />

      <Stat
        label="TRANSACTIONS"
        value={transactions.length}
      />

      <Stat
        label="SUBSCRIPTIONS"
        value={`₹${subsTotal.toLocaleString()}`}
      />

      <Stat
        label="PERSONAL TRAINING"
        value={`₹${ptTotal.toLocaleString()}`}
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-white/10 bg-black p-5">
      <p className="text-xs text-gray-400 tracking-widest">
        {label}
      </p>
      <p className="text-2xl font-black mt-2">
        {value}
      </p>
    </div>
  );
}
