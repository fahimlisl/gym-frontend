export default function RevenueTimeline({ data }) {
  const items = [
    { label: "TODAY", value: data.today.totalAmount },
    { label: "WEEK", value: data.weekly.totalAmount },
    { label: "MONTH", value: data.monthly.totalAmount },
    { label: "YEAR", value: data.yearly.totalAmount },
  ];

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-5 sm:space-y-6">
      {items.map((item, idx) => {
        const percent = (item.value / max) * 100;

        return (
          <div key={item.label} className="space-y-2">
            
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <span
                className={`text-[10px] sm:text-xs tracking-widest ${
                  idx === 0 ? "text-red-500 font-bold" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>

              <span
                className={`font-black break-all text-sm sm:text-base lg:text-lg ${
                  idx === 0 ? "text-red-500" : "text-white"
                }`}
              >
                ₹{item.value.toLocaleString()}
              </span>
            </div>

            <div className="w-full h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                style={{ width: `${percent}%` }}
                className={`h-full rounded-full transition-all duration-700
                  ${
                    idx === 0
                      ? "bg-gradient-to-r from-red-600 to-red-400 shadow-lg shadow-red-600/40"
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