import clsx from "clsx";

export default function PricingCard({
  title,
  price,
  basePrice,
  duration,
  features = [],
  highlighted,
  badge,
  subtext,
  onStartNow,
  category,
}) {
  const discount =
    basePrice && price
      ? Math.round(((basePrice - price) / basePrice) * 100)
      : null;

  const ADMISSION_FEE = 1099;
  const isPT = category === "PT";

  const renderStrikethrough = () => {
    if (!basePrice) return null;

    if (isPT) {
      return (
        <span className="text-gray-500 line-through text-sm sm:text-lg">
          ₹{basePrice}
        </span>
      );
    }

    // if (duration === "monthly") {
    //   return (
    //     <span className="text-gray-500 line-through text-sm sm:text-lg">
    //       ₹{basePrice}
    //     </span>
    //   );
    // }

      return (
        <span className="text-gray-500 line-through text-sm sm:text-lg">
          ₹{basePrice}
        </span>
      );

    // return (
    //   <div className="flex flex-col gap-0.5">
    //     <span className="text-gray-500 line-through text-xs sm:text-sm leading-tight">
    //       admission ₹{ADMISSION_FEE} + fees ₹{basePrice}
    //     </span>
    //     <span className="text-gray-600 text-xs">
    //       was ₹{basePrice + ADMISSION_FEE}
    //     </span>
    //   </div>
    // );
  };

  return (
    <div
      className={clsx(
        "group relative flex flex-col rounded-2xl border bg-gradient-to-b from-neutral-900 to-black p-6 sm:p-8 transition-all duration-500",
        highlighted
          ? "border-red-600 shadow-[0_0_60px_rgba(239,68,68,0.35)] scale-[1.02] sm:scale-105"
          : "border-white/10 hover:border-red-500 hover:-translate-y-3"
      )}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_60%)]" />

      {badge && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 text-xs font-extrabold tracking-widest rounded-full shadow-lg">
          {badge}
        </span>
      )}

      {/* Category pill */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white">
          {title}
        </h3>
        {isPT && (
          <span className="text-[10px] font-bold tracking-widest bg-red-600/15 border border-red-600/30 text-red-400 px-2 py-0.5 rounded-full uppercase">
            PT
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-green-400 text-xl mt-1">{subtext}</p>
      )}

      <div className="my-7 flex flex-col gap-1.5">
        {renderStrikethrough()}

        <div className="flex items-end gap-2 flex-wrap">
          <span className="text-7xl sm:text-7xl font-black text-white tracking-tight">
            ₹{price}
          </span>

          {/* {discount > 0 && ( */}
            <span className="bg-red-600/10 text-red-500 text-xs font-bold px-2 py-1 rounded">
              SAVE MORE
            </span>
          {/* // )} */}
        </div>

        <span className="text-gray-400 text-sm">/ {duration}</span>

        {/* {!isPT && duration === "monthly" && ( */}
        {!isPT && !(duration === "yearly") && (
          <p className="text-xs text-white/90 mt-1">
            + ₹{ADMISSION_FEE} admission fee on checkout
          </p>
        )}
      </div>

      <ul className="space-y-3 text-sm flex-1">
        {features.length > 0 ? (
          features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-300">
              <span className="text-red-500 mt-[2px]">✔</span>
              <span className="leading-relaxed">{f}</span>
            </li>
          ))
        ) : (
          <li className="text-gray-500">Benefits coming soon</li>
        )}
      </ul>

      <button
        onClick={onStartNow}
        className={clsx(
          "mt-4 py-3 rounded-lg font-extrabold tracking-widest text-sm transition-all duration-300 w-full",
          highlighted
            ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/40 text-white"
            : "border border-white/20 hover:border-red-500 hover:bg-red-600/10 text-white"
        )}
      >
        CHOOSE PLAN
      </button>
    </div>
  );
}