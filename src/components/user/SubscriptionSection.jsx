export default function SubscriptionSection({ subscription }) {
  if (!subscription || !subscription.subscription?.length) {
    return EmptyBox("NO MEMBERSHIP FOUND");
  }

  return (
    <div className="border border-red-600/30 bg-black p-6 rounded-xl space-y-6">

      <h3 className="font-black tracking-widest">
        MEMBERSHIP HISTORY
      </h3>

      <div className="border border-white/10 bg-neutral-900/40 p-4 text-sm">
        <h4 className="font-extrabold tracking-widest mb-3">
          ADMISSION FEE
        </h4>

        <Row label="ORIGINAL" value={`₹${subscription.admissionFee}`} />
        <Row
          label="DISCOUNT TYPE"
          value={formatDiscountType(subscription.discountTypeOnAdFee)}
        />
        <Row
          label="DISCOUNT"
          value={`₹${subscription.discountOnAdFee || 0}`}
        />
        <Row
          label="FINAL AMOUNT"
          value={`₹${subscription.finalAdFee}`}
          strong
        />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {[...subscription.subscription].reverse().map((s) => (
          <div
            key={s._id}
            className="border border-white/10 p-4 text-sm bg-neutral-900/40 space-y-1"
          >
            <Row label="PLAN" value={s.plan.toUpperCase()} />
            <Row label="ORIGINAL PRICE" value={`₹${s.price}`} />

            <Row
              label="DISCOUNT TYPE"
              value={formatDiscountType(s.discountType)}
            />

            <Row
              label="DISCOUNT"
              value={`₹${s.discount}`}
            />

            <Row
              label="FINAL AMOUNT"
              value={`₹${s.finalAmount}`}
              strong
            />

            <Row label="STATUS" value={s.status.toUpperCase()} />

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

function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={strong ? "font-black" : "font-bold"}>
        {value}
      </span>
    </div>
  );
}

const fmt = (d) => new Date(d).toLocaleDateString();

const formatDiscountType = (type) => {
  if (!type || type === "none") return "—";
  if (type === "percentage") return "PERCENTAGE";
  if (type === "flat") return "FLAT";
  return "—";
};

const EmptyBox = (text) => (
  <div className="border border-white/10 p-10 text-gray-500 text-center">
    {text}
  </div>
);
