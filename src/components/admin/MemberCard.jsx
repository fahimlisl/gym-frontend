import { Link } from "react-router-dom";

export default function MemberCard({ user }) {
  const hasPT = Boolean(user.personalTraning);

  return (
    <div className="group relative rounded-xl
                    bg-gradient-to-br from-black via-neutral-900 to-black
                    border border-white/10 hover:border-red-600/40
                    transition-all">

      <div className="flex flex-col sm:flex-row items-center gap-6 p-5">

        <img
          src={user.avatar?.url}
          className="w-16 h-16 rounded-full border-2 border-red-600 object-cover"
        />

        <div className="flex-1 w-full">
          <p className="text-lg font-extrabold tracking-wide">
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
          </div>
        </div>

        <Link
          to={`/admin/members/${user._id}`}
          className="px-6 py-3 text-xs font-extrabold tracking-widest
                     border border-red-600 hover:bg-red-600
                     transition shadow-[0_0_25px_rgba(239,68,68,0.3)]">
          MANAGE
        </Link>
      </div>

      {/* hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                      transition pointer-events-none
                      shadow-[0_0_60px_rgba(239,68,68,0.08)] rounded-xl" />
    </div>
  );
}

function Badge({ text, active }) {
  return (
    <span
      className={`px-3 py-1 text-[10px] font-extrabold tracking-widest
        ${active
          ? "bg-red-600 text-black"
          : "border border-white/20 text-gray-300"}
      `}
    >
      {text}
    </span>
  );
}
