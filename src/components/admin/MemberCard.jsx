import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import api from "../../api/axios.api";

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

export default function MemberCard({
  user,
  latestStatus,
  isInactiveTab,
  daysExpired,
  membershipExpiringSoon,
  ptExpiringSoon,
}) {
  const [whatsappStatus, setWhatsappStatus] = useState("idle");
  const [alreadySentMsg, setAlreadySentMsg] = useState("");
  console.log(user)
  const ptSubs = user?.personalTraning?.subscription;
  const latestPT = ptSubs?.[ptSubs?.length - 1];
  const hasPT = latestPT?.status;
  const isPTExpired = hasPT === "expired";

  const isExpired = latestStatus === "expired";
  const isInactiveView = isInactiveTab === true;

  const latestSubscription =
    user?.subscription?.subscription?.[
      user?.subscription?.subscription?.length - 1
    ];
  const startDate = latestSubscription?.startDate
    ? new Date(latestSubscription.startDate).toLocaleDateString()
    : null;
  const expiryDate = latestSubscription?.endDate
    ? new Date(latestSubscription.endDate).toLocaleDateString()
    : null;

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
    type: "warningWorkout",
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
    if (isInactiveView)
      return "border border-gray-600 shadow-[0_0_35px_rgba(107,114,128,0.35)] opacity-75";
    if (isExpired)
      return "border border-red-600 shadow-[0_0_35px_rgba(239,68,68,0.35)]";
    if (membershipExpiringSoon)
      return "border border-yellow-500/40 shadow-[0_0_18px_rgba(234,179,8,0.10)]";
    if (isPTExpired)
      return "border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.12)]";
    if (ptExpiringSoon)
      return "border border-yellow-500/25 shadow-[0_0_14px_rgba(234,179,8,0.07)]";
    return "border border-white/10 hover:border-red-600/40";
  };

  const getHoverGlowStyle = () => {
    if (isInactiveView) return "shadow-[0_0_60px_rgba(107,114,128,0.15)]";
    if (isExpired) return "shadow-[0_0_60px_rgba(239,68,68,0.15)]";
    if (membershipExpiringSoon)
      return "shadow-[0_0_35px_rgba(234,179,8,0.08)]";
    if (isPTExpired) return "shadow-[0_0_40px_rgba(249,115,22,0.10)]";
    if (ptExpiringSoon) return "shadow-[0_0_30px_rgba(234,179,8,0.06)]";
    return "shadow-[0_0_60px_rgba(239,68,68,0.08)]";
  };

  const buildWhatsAppMessage = () => {
  const name = user?.username?.trim() || "Member";
  const messages = [];

  const membershipPlan = latestSubscription?.plan || "membership";
  const membershipEndDate = latestSubscription?.endDate
    ? new Date(latestSubscription.endDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const ptPlan = latestPT?.plan || "personal training";
  const ptEndDate = latestPT?.endDate
    ? new Date(latestPT.endDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  if (isExpired && isPTExpired) {
    messages.push(
      `🔔 Dear ${name},\n\n` +
      `This is to inform you that both your gym membership and personal training subscription have expired. Please renew them to continue enjoying our services.\n\n` +
      `📋 Expired Details:\n` +
      `💪 Gym Membership — ${membershipPlan} plan (expired on ${membershipEndDate})\n` +
      `🏋️ Personal Training — ${ptPlan} plan (expired on ${ptEndDate})\n\n` +
      `We miss you at the gym! 🥺 Renew now to regain access to your workouts, personalised guidance, and all club facilities.\n\n` +
      `📲 For renewal, visit the front desk or contact us anytime. Let’s get you back on track! 💯`
    );
  } else if (isExpired) {
    messages.push(
      `🔔 Dear ${name},\n\n` +
      `Your gym membership (${membershipPlan} plan) has expired on ${membershipEndDate}. 💔\n\n` +
      `We’ve loved having you as a member and would love to see you back! Renew today to continue accessing.\n` +
      `📞 Walk in or call us to renew your membership and keep your fitness journey going strong. 💪😊`
    );
  } else if (isPTExpired) {
    messages.push(
      `🔔 Dear ${name},\n\n` +
      `Your personal training subscription (${ptPlan} plan) has expired on ${ptEndDate}. ⏰\n\n` +
      `Don’t let your hard work stop! Renew your PT package to keep receiving:\n` +
      `🔥 Customised workout plans\n` +
      `🔥 One-on-one attention from your dedicated trainer\n` +
      `🔥 Faster progress toward your fitness goals\n\n` +
      `📲 Get in touch with us to renew and continue smashing your goals! 🏆`
    );
  }

  if (messages.length > 0) {
    messages.push(`\n– THE ALPHA (A) FITNESS & EDUCATION 💚`);
    return messages.join("\n\n");
  }

  return null;
};
const handleWhatsAppSend = async () => {
  if (!user.phoneNumber || whatsappStatus !== "idle") return;

  const message = buildWhatsAppMessage();
  if (!message) return;

  setWhatsappStatus("sending");

  try {
    const response = await api.post("/admin/api/send-whatsapp", {
      phone: user.phoneNumber,
      userId: user._id,
      message: message,
    });

    if (response.data.success) {
      setWhatsappStatus("sent");
      setTimeout(() => setWhatsappStatus("idle"), 2500);
    } else {
      throw new Error("Send failed");
    }
  } catch (err) {
    // If already sent today (429)
    if (err.response?.status === 429) {
      const backendMsg = err.response?.data?.error || "Already sent today";
      setWhatsappStatus("alreadySent");
      // Store the message somewhere or just use it in the button below
      // We'll use a separate state for the error text
      setAlreadySentMsg(backendMsg);
      setTimeout(() => {
        setWhatsappStatus("idle");
        setAlreadySentMsg("");
      }, 3000);
    } else {
      setWhatsappStatus("error");
      setTimeout(() => setWhatsappStatus("idle"), 2500);
    }
    console.error("got error", err);
  }
};
  const showWhatsAppButton = user.phoneNumber && (isExpired || isPTExpired);

  return (
    <div
      className={`group relative rounded-xl
        bg-gradient-to-br from-black via-neutral-900 to-black
        transition-all duration-300
        ${getBorderStyle()}
      `}
    >
      <div
        className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 
                    p-3 sm:p-5
                    ${isExpired || isInactiveView ? "opacity-90" : ""}`}
      >
        <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
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

            {user.phoneNumber && (
              <p className="text-[11px] sm:text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 flex-shrink-0" />
                {user.phoneNumber}
              </p>
            )}

            {startDate && expiryDate && (
              <div className="flex gap-2 mt-1 text-[9px] sm:text-[10px] font-mono">
                <span className="text-gray-500">
                  📅 {startDate} → {expiryDate}
                </span>
              </div>
            )}
            {(isExpired || isPTExpired) && user?.reminderSentAt && (
              <div className="flex gap-2 mt-1 text-[9px] sm:text-[10px] font-mono">
                <span className="text-gray-500">
                  📨 Reminder sent:{" "}
                  {new Date(user.reminderSentAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}

            <div className="flex gap-2 mt-2 flex-wrap">
              {hasPT === "active" ? (
                <Badge text="PT ACTIVE" active />
              ) : hasPT === "expired" ? (
                <Badge text="PT EXPIRED" ptExpired />
              ) : (
                <Badge text="NO PT" />
              )}
              {user?.personalTraning &&
                (user?.diet ? (
                  <Badge text="Diet Provided" success />
                ) : (
                  <Badge text="Diet Not Provided" warning />
                ))}
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
        </div>

        <div className="flex gap-2 sm:flex-shrink-0">
          {showWhatsAppButton && (
            <button
              onClick={handleWhatsAppSend}
              disabled={whatsappStatus !== "idle"}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5
                px-3 sm:px-5 py-2 sm:py-3 
                text-[10px] sm:text-xs 
                font-extrabold tracking-widest
                whitespace-nowrap
                border border-green-500 text-green-500
                hover:bg-green-500 hover:text-black
                transition
                ${whatsappStatus !== "idle" ? "opacity-70 cursor-not-allowed" : ""}
              `}
            >
              {whatsappStatus === "sending" ? (
                <span className="animate-pulse">⏳</span>
              ) : whatsappStatus === "sent" ? (
                <span>✓</span>
              ) : whatsappStatus === "error" ? (
                <span>⚠️</span>
              ) : (
                <WhatsAppIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">
                {whatsappStatus === "sending"
                  ? "SENDING..."
                  : whatsappStatus === "sent"
                  ? "SENT"
                  : whatsappStatus === "error"
                  ? "FAILED"
                  : whatsappStatus === "alreadySent"
                  ? alreadySentMsg || "ALREADY SENT"
                  : "WHATSAPP"}
              </span>
            </button>
          )}

          {user.phoneNumber && (
            <a
              href={`tel:${user.phoneNumber}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5
                px-3 sm:px-5 py-2 sm:py-3 
                text-[10px] sm:text-xs 
                font-extrabold tracking-widest
                whitespace-nowrap
                border border-green-600 text-green-500
                hover:bg-green-600 hover:text-black
                transition"
            >
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              CALL
            </a>
          )}

          <Link
            to={`/admin/members/${user._id}`}
            className={`flex-1 sm:flex-none text-center px-3 sm:px-6 py-2 sm:py-3 
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
            VIEW
          </Link>
        </div>
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

function Badge({
  text,
  active,
  danger,
  warning,
  success,
  successWorkout,
  warningWorkout,
  paused,
  completed,
  ptExpired,
  expiringSoon,
}) {
  let badgeStyles = "";

  if (danger) {
    badgeStyles =
      "bg-gradient-to-r from-red-600 to-red-700 font-bold tracking-wide shadow-sm border border-red-400/30";
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
    badgeStyles =
      "bg-yellow-950/60 border border-yellow-500/40 text-yellow-400";
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