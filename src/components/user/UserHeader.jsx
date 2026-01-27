export default function UserHeader({ user }) {
  return (
    <div className="flex items-center gap-6
                    border border-red-600/30
                    bg-gradient-to-br from-black via-neutral-900 to-black
                    p-6 rounded-xl">

      <img
        src={user.avatar.url}
        alt="avatar"
        className="w-20 h-20 rounded-full border-2 border-red-600 object-cover"
      />

      <div>
        <h1 className="text-2xl font-black tracking-widest">
          {user.username || "MEMBER"}
        </h1>
        <p className="text-sm text-gray-400">{user.email}</p>
        <p className="text-xs text-gray-500">{user.phoneNumber}</p>

        <p className="mt-2 text-xs tracking-widest text-green-500">
          ● ACTIVE MEMBER
        </p>
      </div>
    </div>
  );
}
