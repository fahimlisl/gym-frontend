export default function UserHeader({ user }) {
  return (
    <div className="border border-red-600/30 bg-black p-6 flex gap-6 flex-col md:flex-row">
      
      <img
        src={user.avatar.url}
        className="w-28 h-28 rounded-full border-2 border-red-600 object-cover"
      />

      <div className="flex-1 space-y-2">
        <h2 className="text-2xl font-black tracking-widest">
          {user.username}
        </h2>

        <p className="text-gray-400 text-sm">📧 {user.email || "—"}</p>
        <p className="text-gray-400 text-sm">📱 {user.phoneNumber}</p>
        <p className="text-gray-500 text-xs">
          Joined: {new Date(user.createdAt).toLocaleDateString()}
        </p>

        <div className="flex gap-3 mt-4 flex-wrap">
          <Badge text="MEMBER" />
          {user.subscription && <Badge text="SUBSCRIBED" />}
          {user.personalTraning && <Badge text="PT ACTIVE" active />}
        </div>
      </div>
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
