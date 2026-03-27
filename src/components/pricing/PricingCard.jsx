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
}) {
  const discount =
    basePrice && price
      ? Math.round(((basePrice - price) / basePrice) * 100)
      : null;

  const ADMISSION_FEE = 1099; 

  return (
    <div
      className={clsx(
        "group relative flex flex-col rounded-2xl border bg-gradient-to-b from-neutral-900 to-black p-6 sm:p-8 transition-all duration-500",
        highlighted
          ? "border-red-600 shadow-[0_0_60px_rgba(239,68,68,0.35)] scale-[1.02] sm:scale-105"
          : "border-white/10 hover:border-red-500 hover:-translate-y-3"
      )}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_60%)]"></div>

      {badge && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 text-xs font-extrabold tracking-widest rounded-full shadow-lg">
          {badge}
        </span>
      )}

      <h3 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white">
        {title}
      </h3>

      {subtext && (
        <p className=" text-green-400 text-xl mt-1">
          {subtext}
        </p>
      )}

      <div className="my-7 flex flex-col gap-1">
        <div className="flex items-end gap-2 flex-wrap">
          {basePrice && (
            <span className="text-gray-500 line-through text-sm sm:text-lg">
              ₹{basePrice}
            </span>
          )}

          <span className="text-7xl sm:text-7xl font-black text-white tracking-tight">
            ₹{price}
          </span>

          {discount && (
            <span className="bg-red-600/10 text-red-500 text-xs font-bold px-2 py-1 rounded">
             SAVE MORE
            </span> 
          )}
        </div>

        <span className="text-gray-400 text-sm">
          / {duration}
        </span>
      </div>

      <ul className="space-y-3 text-sm flex-1">
        {features.length > 0 ? (
          features.map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-gray-300"
            >
              <span className="text-red-500 mt-[2px]">✔</span>
              <span className="leading-relaxed">{f}</span>
            </li>
          ))
        ) : (
          <li className="text-gray-500">
            Benefits coming soon
          </li>
        )}
      </ul>

      <div className="my-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
        <p className="font-semibold mb-1">💡 Note:</p>
        <p>Plan Price: ₹{price}</p>
        <p>+ Admission Fee: ₹{ADMISSION_FEE}</p>
        <p className="font-bold mt-1">Total: ₹{price + ADMISSION_FEE}</p>
      </div>

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