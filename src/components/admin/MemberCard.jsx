import { Link } from "react-router-dom";

export default function MemberCard({ user, latestStatus, isInactiveTab, daysExpired, membershipExpiringSoon, ptExpiringSoon }) {
  const ptSubs = user?.personalTraning?.subscription;
  const latestPT = ptSubs?.[ptSubs?.length - 1];
  const hasPT = latestPT?.status;
  const isPTExpired = hasPT === "expired";

  const isExpired = latestStatus === "expired";
  const isInactiveView = isInactiveTab === true;

  const latestSubscription = user?.subscription?.subscription?.[user?.subscription?.subscription?.length - 1];
  const startDate = latestSubscription?.startDate ? new Date(latestSubscription.startDate).toLocaleDateString() : null;
  const expiryDate = latestSubscription?.endDate ? new Date(latestSubscription.endDate).toLocaleDateString() : null;

  const getDaysLeft = (endDate) => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const membershipDaysLeft = getDaysLeft(latestSubscription?.endDate);
  const ptDaysLeft = getDaysLeft(latestPT?.endDate);

  const workoutStatus = user?.workout?.status;

  let workoutDisplay = {
    text: "Workout Not Provided",
    type: "warningWorkout"
  };

  if (!user?.workout) {
    workoutDisplay = { text: "Workout Not Provided", type: "warningWorkout" };
  } else if (workoutStatus === "Paused") {
    workoutDisplay = { text: "Workout Paused", type: "paused" };
  } else if (workoutStatus === "Completed") {
    workoutDisplay = { text: "Workout Completed", type: "completed" };
  } else if (workoutStatus === "Active") {
    workoutDisplay = { text: "Workout Active", type: "successWorkout" };
  } else {
    workoutDisplay = { text: "Workout Not Provided", type: "warningWorkout" };
  }

  const getBorderStyle = () => {
    if (isInactiveView) return "border border-gray-600 shadow-[0_0_35px_rgba(107,114,128,0.35)] opacity-75";
    if (isExpired) return "border border-red-600 shadow-[0_0_35px_rgba(239,68,68,0.35)]";
    if (membershipExpiringSoon) return "border border-yellow-500/40 shadow-[0_0_18px_rgba(234,179,8,0.10)]";
    if (isPTExpired) return "border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.12)]";
    if (ptExpiringSoon) return "border border-yellow-500/25 shadow-[0_0_14px_rgba(234,179,8,0.07)]";
    return "border border-white/10 hover:border-red-600/40";
  };

  const getHoverGlowStyle = () => {
    if (isInactiveView) return "shadow-[0_0_60px_rgba(107,114,128,0.15)]";
    if (isExpired) return "shadow-[0_0_60px_rgba(239,68,68,0.15)]";
    if (membershipExpiringSoon) return "shadow-[0_0_35px_rgba(234,179,8,0.08)]";
    if (isPTExpired) return "shadow-[0_0_40px_rgba(249,115,22,0.10)]";
    if (ptExpiringSoon) return "shadow-[0_0_30px_rgba(234,179,8,0.06)]";
    return "shadow-[0_0_60px_rgba(239,68,68,0.08)]";
  };

  return (
    <div
      className={`group relative rounded-xl
        bg-gradient-to-br from-black via-neutral-900 to-black
        transition-all duration-300
        ${getBorderStyle()}
      `}
    >
      <div
        className={`flex items-center gap-3 sm:gap-6 
                    p-3 sm:p-5
                    ${isExpired || isInactiveView ? "opacity-90" : ""}`}
      >
        <img
          src={user.avatar?.url}
          className="w-12 h-12 sm:w-16 sm:h-16 
                     rounded-full object-cover 
                     border-2 border-red-600
                     flex-shrink-0"
          alt={user.username}
        />

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm sm:text-lg font-extrabold tracking-wide truncate
              ${isExpired || isInactiveView ? "text-gray-300" : ""}
            `}
          >
            {user.username}
          </p>

          <p className="text-[11px] sm:text-xs text-gray-400 truncate">
            {user.email || user.phoneNumber}
          </p>

          {startDate && expiryDate && (
            <div className="flex gap-2 mt-1 text-[9px] sm:text-[10px] font-mono">
              <span className="text-gray-500">
                📅 {startDate} → {expiryDate}
              </span>
            </div>
          )}

          <div className="flex gap-2 mt-2 flex-wrap">
            {hasPT === "active"
              ? <Badge text="PT ACTIVE" active />
              : hasPT === "expired"
              ? <Badge text="PT EXPIRED" ptExpired />
              : <Badge text="NO PT" />}
            {user?.personalTraning && (
              user?.diet
                ? <Badge text="Diet Provided" success />
                : <Badge text="Diet Not Provided" warning />
            )}
            {user?.personalTraning && (
              <Badge
                text={workoutDisplay.text}
                type={workoutDisplay.type}
                successWorkout={workoutDisplay.type === "successWorkout"}
                warningWorkout={workoutDisplay.type === "warningWorkout"}
                paused={workoutDisplay.type === "paused"}
                completed={workoutDisplay.type === "completed"}
              />
            )}
            {isExpired && !isInactiveView && (
              <Badge
                text={`EXPIRED · ${daysExpired || 0}d ago`}
                danger
              />
            )}
            {membershipExpiringSoon && !isExpired && !isInactiveView && (
              <Badge
                text={`MEMBERSHIP EXPIRING · ${membershipDaysLeft ?? 0}d left`}
                expiringSoon
              />
            )}
            {ptExpiringSoon && !isPTExpired && (
              <Badge
                text={`PT EXPIRING · ${ptDaysLeft ?? 0}d left`}
                expiringSoon
              />
            )}
            {isInactiveView && (
              <Badge
                text={`INACTIVE · ${daysExpired || 0} DAYS EXPIRED`}
                danger
              />
            )}
          </div>
        </div>

        <Link
          to={`/admin/members/${user._id}`}
          className={`px-3 sm:px-6 py-2 sm:py-3 
            text-[10px] sm:text-xs 
            font-extrabold tracking-widest
            whitespace-nowrap
            transition
            ${
              isInactiveView
                ? "border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
                : isExpired
                ? "border border-red-600 text-red-500 hover:bg-red-600 hover:text-black"
                : isPTExpired
                ? "border border-orange-500/50 text-orange-400 hover:bg-orange-500/20 hover:text-white"
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
          ${getHoverGlowStyle()}
        `}
      />
    </div>
  );
}

function Badge({ text, active, danger, warning, success, successWorkout, warningWorkout, paused, completed, ptExpired, expiringSoon, type }) {
  let badgeStyles = "";

  if (danger) {
    badgeStyles = "bg-gradient-to-r from-red-600 to-red-700 font-bold tracking-wide shadow-sm border border-red-400/30";
  } else if (active) {
    badgeStyles = "bg-green-600 text-black";
  } else if (success) {
    badgeStyles = "bg-green-500 text-black";
  } else if (warning) {
    badgeStyles = "bg-yellow-400 text-black";
  } else if (successWorkout) {
    badgeStyles = "bg-blue-500 text-white";
  } else if (warningWorkout) {
    badgeStyles = "bg-orange-500 text-white";
  } else if (paused) {
    badgeStyles = "bg-purple-500 text-white";
  } else if (completed) {
    badgeStyles = "bg-emerald-500 text-white";
  } else if (ptExpired) {
    badgeStyles = "bg-orange-950 border border-orange-500/50 text-orange-400";
  } else if (expiringSoon) {
    badgeStyles = "bg-yellow-950/60 border border-yellow-500/40 text-yellow-400";
  } else {
    badgeStyles = "border border-white/20 text-gray-300";
  }

  return (
    <span
      className={`px-2 sm:px-3 py-0.5 sm:py-1 
        text-[9px] sm:text-[10px]
        font-extrabold tracking-widest 
        rounded-full whitespace-nowrap
        ${badgeStyles}
      `}
    >
      {text}
    </span>
  );
}