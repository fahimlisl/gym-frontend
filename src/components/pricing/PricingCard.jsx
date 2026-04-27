import clsx from "clsx";

const PT_PREMIUM_PRICES = [1500, 1999, 4200, 8200, 16000];

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
  const ADMISSION_FEE = 1099;
  const isPT = category === "PT";
  const isPTPremium = isPT && PT_PREMIUM_PRICES.includes(price);
  // price -> final price

  const renderStrikethrough = () => {
    if (!basePrice) return null;
    return (
      <span className="text-gray-500 line-through text-sm sm:text-lg">
        ₹{basePrice}
      </span>
    );
  };

  return (
    <div
      className={clsx(
        "group relative flex flex-col rounded-2xl border bg-gradient-to-b from-neutral-900 to-black p-6 sm:p-8 transition-all duration-500",
        highlighted
          ? "border-red-600 shadow-[0_0_60px_rgba(239,68,68,0.35)] scale-[1.02] sm:scale-105"
          : isPTPremium
          ? "border-yellow-500/60 shadow-[0_0_40px_rgba(234,179,8,0.2)] hover:-translate-y-3"
          : "border-white/10 hover:border-red-500 hover:-translate-y-3"
      )}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_60%)]" />

      {badge && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 text-xs font-extrabold tracking-widest rounded-full shadow-lg">
          {badge}
        </span>
      )}

      {isPTPremium && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-1 text-xs font-extrabold tracking-widest rounded-full shadow-lg whitespace-nowrap">
          ⭐ PREMIUM PLAN
        </span>
      )}

      {/* Category pill */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white">
          {title}
        </h3>
        {isPT && (
          <span className={clsx(
            "text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase border",
            isPTPremium
              ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400"
              : "bg-red-600/15 border-red-600/30 text-red-400"
          )}>
            {isPTPremium ? "PREMIUM PT" : "PT"}
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
          <span className={clsx(
            "text-xs font-bold px-2 py-1 rounded",
            isPTPremium
              ? "bg-yellow-500/10 text-yellow-500"
              : "bg-red-600/10 text-red-500"
          )}>
            SAVE MORE
          </span>
        </div>

        <span className="text-gray-400 text-sm">/ {duration}</span>

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
              <span className={clsx("mt-[2px]", isPTPremium ? "text-yellow-500" : "text-red-500")}>✔</span>
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
            : isPTPremium
            ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black shadow-lg shadow-yellow-500/20"
            : "border border-white/20 hover:border-red-500 hover:bg-red-600/10 text-white"
        )}
      >
        CHOOSE PLAN
      </button>
    </div>
  );
}