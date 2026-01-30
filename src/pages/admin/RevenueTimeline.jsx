export default function RevenueTimeline({ data }) {
  const items = [
    { label: "TODAY", value: data.today.totalAmount },
    { label: "WEEK", value: data.weekly.totalAmount },
    { label: "MONTH", value: data.monthly.totalAmount },
    { label: "YEAR", value: data.yearly.totalAmount },
  ];

  const max = Math.max(...items.map(i => i.value), 1);

  return (
    <div className="space-y-6">
      {items.map((i, idx) => {
        const percent = (i.value / max) * 100;

        return (
          <div key={i.label}>
            <div className="flex justify-between items-center mb-2">
              <span
                className={`text-xs tracking-widest ${
                  idx === 0 ? "text-red-500 font-bold" : "text-gray-400"
                }`}
              >
                {i.label}
              </span>

              <span
                className={`font-black ${
                  idx === 0 ? "text-red-500 text-lg" : "text-white"
                }`}
              >
                ₹{i.value.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                style={{ width: `${percent}%` }}
                className={`h-full rounded-full transition-all duration-700
                  ${
                    idx === 0
                      ? "bg-gradient-to-r from-red-600 to-red-400 shadow-red-600/50 shadow-lg"
                      : "bg-gradient-to-r from-neutral-500 to-neutral-300"
                  }
                `}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
