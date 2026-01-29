export default function SubscriptionCard({ subscription, onRenew }) {
  if (!subscription || !subscription.subscription?.length) {
    return (
      <div className="border border-white/10 bg-black p-6 rounded-xl text-gray-400">
        NO SUBSCRIPTION FOUND
      </div>
    );
  }

  const subs = subscription.subscription;
  const current = subs[subs.length - 1];
  const isFirstSubscription = subs.length === 1;

  return (
    <div className="border border-red-600/30 bg-black p-6 rounded-xl space-y-6">
      <div>
        <h3 className="font-black tracking-widest">GYM SUBSCRIPTION</h3>
        <p className="text-xs text-gray-400 mt-1">
          Membership details & history
        </p>
      </div>

      <div className="border border-red-600/40 bg-neutral-950 p-4 rounded-lg space-y-2">
        <p className="text-xs tracking-widest text-red-500">CURRENT PLAN</p>

        <Row label="Plan" value={current.plan.toUpperCase()} />
        <Row label="Base Price" value={`₹${current.price}`} />

        {current.discountType !== "none" && (
          <Row
            label="Discount"
            value={
              current.discountType === "percentage"
                ? `${current.discount}%`
                : `₹${current.discount}`
            }
          />
        )}

        <Row label="Final Amount" value={`₹${current.finalAmount}`} />

        {isFirstSubscription && (
          <>
            <Row
              label="Admission Fee"
              value={`₹${subscription.admissionFee}`}
            />

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

            <Row
              label="Final Admission Fee"
              value={`₹${subscription.finalAdFee}`}
            />
          </>
        )}

        <Row label="Status" value={current.status} />

        <Row
          label="Validity"
          value={`${fmt(current.startDate)} → ${fmt(current.endDate)}`}
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

      {subs.length > 1 && (
        <div className="space-y-3">
          <p className="text-xs tracking-widest text-gray-400">
            SUBSCRIPTION HISTORY
          </p>

          {[...subs]
            .slice(0, -1)
            .reverse()
            .map((s) => {
              const isFirstEver = s._id === subs[0]._id;

              return (
                <div
                  key={s._id}
                  className="border border-white/10 bg-neutral-900 p-4 rounded-lg"
                >
                  <div className="flex justify-between text-sm font-bold">
                    <span>{s.plan.toUpperCase()}</span>
                    <span>₹{s.finalAmount}</span>
                  </div>

                  <div className="text-xs text-gray-400 mt-2 space-y-1">
                    <p>Base: ₹{s.price}</p>

                    {s.discountType !== "none" && (
                      <p>
                        Discount:{" "}
                        {s.discountType === "percentage"
                          ? `${s.discount}%`
                          : `₹${s.discount}`}
                      </p>
                    )}

                    {isFirstEver && (
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

                    <p>
                      {fmt(s.startDate)} → {fmt(s.endDate)}
                    </p>

                    <p>Status: {s.status}</p>
                    <p>Payment: {s.paymentStatus}</p>
                  </div>
                </div>
              );
            })}
        </div>
      )}
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
