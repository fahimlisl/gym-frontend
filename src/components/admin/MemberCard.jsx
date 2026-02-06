import { Link } from "react-router-dom";

export default function MemberCard({ user, latestStatus }) {
  const hasPT = Boolean(user.personalTraning);
  const isExpired = latestStatus === "expired";

  return (
    <div
      className={`group relative rounded-xl
        bg-gradient-to-br from-black via-neutral-900 to-black
        transition-all duration-300
        ${
          isExpired
            ? "border border-red-600 shadow-[0_0_35px_rgba(239,68,68,0.35)]"
            : "border border-white/10 hover:border-red-600/40"
        }
      `}
    >
      {isExpired && (
        <div className="absolute top-3 right-3 z-10">
          <span
            className="bg-red-600 text-black
                       px-4 py-1 rounded-full
                       text-[10px] font-black tracking-widest
                       shadow-[0_0_25px_rgba(239,68,68,0.6)]"
          >
            EXPIRED
          </span>
        </div>
      )}

      <div
        className={`flex flex-col sm:flex-row items-center gap-6 p-5
          ${isExpired ? "opacity-90" : ""}
        `}
      >
        <img
          src={user.avatar?.url}
          className={`w-16 h-16 rounded-full object-cover
            ${
              isExpired
                ? "border-2 border-red-600"
                : "border-2 border-red-600"
            }`}
        />

        <div className="flex-1 w-full">
          <p
            className={`text-lg font-extrabold tracking-wide
              ${isExpired ? "text-gray-300" : ""}
            `}
          >
            {user.username}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {user.email || user.phoneNumber}
          </p>

          <div className="flex gap-3 mt-3 flex-wrap">
            <Badge text="MEMBER" />
            {hasPT
              ? <Badge text="PT ACTIVE" active />
              : <Badge text="NO PT" />}
            {isExpired && <Badge text="SUBSCRIPTION EXPIRED" danger />}
          </div>
        </div>

        <Link
          to={`/admin/members/${user._id}`}
          className={`px-6 py-3 text-xs font-extrabold tracking-widest
            transition shadow-[0_0_25px_rgba(239,68,68,0.3)]
            ${
              isExpired
                ? "border border-red-600 text-red-500 hover:bg-red-600 hover:text-black"
                : "border border-red-600 hover:bg-red-600"
            }
          `}
        >
          MANAGE
        </Link>
      </div>

      <div
        className={`absolute inset-0 pointer-events-none rounded-xl
          transition opacity-0 group-hover:opacity-100
          ${
            isExpired
              ? "shadow-[0_0_60px_rgba(239,68,68,0.15)]"
              : "shadow-[0_0_60px_rgba(239,68,68,0.08)]"
          }
        `}
      />
    </div>
  );
}


function Badge({ text, active, danger }) {
  return (
    <span
      className={`px-3 py-1 text-[10px] font-extrabold tracking-widest rounded-full
        ${
          danger
            ? "bg-red-600 text-black"
            : active
            ? "bg-red-600 text-black"
            : "border border-white/20 text-gray-300"
        }
      `}
    >
      {text}
    </span>
  );
}
