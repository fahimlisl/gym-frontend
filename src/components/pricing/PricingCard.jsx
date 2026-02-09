import clsx from "clsx";

export default function PricingCard({
  title,
  price,
  duration,
  features,
  highlighted,
  badge,
  subtext,
}) {
  return (
    <div
      className={clsx(
        "relative border bg-black p-8 flex flex-col transition-all duration-300",
        highlighted
          ? "border-red-600 scale-105 shadow-[0_0_50px_rgba(239,68,68,0.35)]"
          : "border-white/10 hover:border-red-600 hover:-translate-y-2"
      )}
    >
      {badge && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 px-4 py-1 text-xs font-extrabold tracking-widest">
          {badge}
        </span>
      )}

      <h3 className="text-xl font-extrabold tracking-wide">
        {title}
      </h3>

      {subtext && (
        <p className="text-xs text-gray-400 mt-1">
          {subtext}
        </p>
      )}

      <div className="my-6">
        <span className="text-4xl font-black">
          {/* ₹{price} */}
          ₹ XXXX
        </span>
        <span className="text-gray-400 text-sm">
          {" "}
          / {duration}
        </span>
      </div>

      <ul className="space-y-3 text-sm flex-1">
        {features.map((f, i) => (
          <li key={i} className="text-gray-300">
            ✓ {f}
          </li>
        ))}
      </ul>

      <button
        className={clsx(
          "mt-8 py-3 font-extrabold tracking-widest transition",
          highlighted
            ? "bg-red-600 hover:bg-red-700"
            : "border border-white/20 hover:border-red-600"
        )}
      >
        START NOW <span className="text-gray-500">(COMING SOON)</span> 
      </button>
    </div>
  );
}
