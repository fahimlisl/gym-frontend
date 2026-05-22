import { Link } from "react-router-dom";

export default function MemberCard({ user, latestStatus }) {
  const hasPT = user?.personalTraning?.subscription[user?.personalTraning?.subscription.length - 1]?.status;
  const isExpired = latestStatus === "expired";
  
  const latestSubscription = user?.subscription?.subscription[user?.subscription?.subscription.length - 1];
  const startDate = latestSubscription?.startDate ? new Date(latestSubscription.startDate).toLocaleDateString() : null;
  const expiryDate = latestSubscription?.endDate ? new Date(latestSubscription.endDate).toLocaleDateString() : null;

  const workoutStatus = user?.workout?.status;
  
  let workoutDisplay = {
    text: "Workout Not Provided",
    type: "warningWorkout"
  };
  
  if (!user?.workout) {
    workoutDisplay = {
      text: "Workout Not Provided",
      type: "warningWorkout"
    };
  } else if (workoutStatus === "Paused") {
    workoutDisplay = {
      text: "Workout Paused",
      type: "paused"
    };
  } else if (workoutStatus === "Completed") {
    workoutDisplay = {
      text: "Workout Completed",
      type: "completed"
    };
  } else if (workoutStatus === "Active") {
    workoutDisplay = {
      text: "Workout Active",
      type: "successWorkout"
    };
  } else {
    workoutDisplay = {
      text: "Workout Not Provided",
      type: "warningWorkout"
    };
  }

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
        <div className="absolute top-2 right-2 z-10">
          <span
            className="bg-red-600 text-black
                       px-3 py-0.5 rounded-full
                       text-[9px] font-black tracking-widest"
          >
            EXPIRED
          </span>
        </div>
      )}

      <div
        className={`flex items-center gap-3 sm:gap-6 
                    p-3 sm:p-5
                    ${isExpired ? "opacity-90" : ""}`}
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
              ${isExpired ? "text-gray-300" : ""}
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
            {isExpired && <Badge text="EXPIRED" danger />}
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

function Badge({ text, active, danger, warning, success, successWorkout, warningWorkout, paused, completed, type }) {
  let badgeStyles = "";
  
  if (danger) {
    badgeStyles = "bg-red-600 text-black";
  } else if (active) {
    badgeStyles = "bg-red-600 text-black";
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