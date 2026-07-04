import { useState } from "react";
import ChangePtDateModal from "./ChangePtDateModal";

export default function PTSection({ pt, onAssign, onRenew, onChangeTrainer, onRemove, subscription, userId }) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showChangeDate, setShowChangeDate] = useState(false);
  const [dateOverride, setDateOverride] = useState(null);

  if (!pt) {
    return (
      <div className="rounded-xl border border-red-600/30
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      p-8 text-center space-y-6">
        <p className="text-sm text-gray-400 tracking-widest">
          NO PERSONAL TRAINING ASSIGNED
        </p>
        {subscription?.subscription[subscription?.subscription.length - 1]?.status === "active" ?
        <button
          onClick={onAssign}
          className="bg-red-600 hover:bg-red-700
          px-10 py-4 text-xs font-extrabold tracking-widest
          shadow-[0_0_35px_rgba(239,68,68,0.4)]"
        >
          ASSIGN PERSONAL TRAINING
        </button>
        :
        <p className="text-xs text-gray-500 tracking-widest">To assign Personal training must have a active plan</p>
        }
      </div>
    );
  }

  const current = pt.subscription?.[pt.subscription.length - 1];
  const isPTActive = current?.status?.toLowerCase() === "active";
  const isPTExpired = current?.status?.toLowerCase() === "expired";
  const isSubActive = subscription.subscription[subscription.subscription.length - 1]?.status?.toLowerCase() === "active";
  const canRenew = !isPTActive && isSubActive;

  // use overridden dates if we just changed them, otherwise fall back to server data
  const displayStart = dateOverride?.startDate ?? current.startDate;
  const displayEnd = dateOverride?.endDate ?? current.endDate;

  return (
    <div className="rounded-xl border border-white/10
                    bg-gradient-to-br from-black via-neutral-900 to-black
                    p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <img
            src={current.trainer?.avatar?.url}
            className="w-16 h-16 rounded-full border-2 border-red-600 object-cover"
            alt="Trainer"
          />
          <div>
            <p className="text-lg font-extrabold tracking-wide">
              {current.trainer?.fullName?.toUpperCase()}
            </p>
            <p className="text-xs text-gray-400">
              {current.trainer?.experience?.toUpperCase() || "TRAINER"} years
            </p>
          </div>
        </div>

        {isPTActive && (
          <button
            onClick={() => setShowChangeDate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5
                       text-[10px] font-bold tracking-widest
                       border border-white/10 rounded-lg
                       text-gray-400 hover:border-red-600/50 hover:text-red-400
                       cursor-pointer transition"
          >
            <span>✎</span> EDIT DATES
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <Info label="PLAN" value={current.plan?.toUpperCase()} />
        <Info label="PRICE" value={`₹${current.finalPrice}`} />
        <Info label="START DATE" value={formatDate(displayStart)} />
        <Info label="END DATE" value={formatDate(displayEnd)} />
        <Info label="STATUS" value={current.status?.toUpperCase()} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={canRenew ? onRenew : undefined}
          disabled={!canRenew}
          className={`flex-1 border border-red-600
                      px-6 py-3 text-xs font-extrabold tracking-widest transition
                      ${!canRenew
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-red-600 hover:text-black"
                      }`}
        >
          RENEW PT
        </button>

        {isPTExpired && (
          <button
            onClick={() => setShowRemoveConfirm(true)}
            className="flex-1 border border-red-600 text-red-500
                       px-6 py-3 text-xs font-extrabold tracking-widest transition
                       hover:bg-red-600 hover:text-black"
          >
            REMOVE PT
          </button>
        )}

        {isPTActive && (
          <button
            onClick={onChangeTrainer}
            className="flex-1 border border-white/20 text-white/70
                       px-6 py-3 text-xs font-extrabold tracking-widest
                       hover:border-white/40 hover:text-white transition"
          >
            CHANGE TRAINER
          </button>
        )}
      </div>

      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-red-600/40
                          bg-gradient-to-br from-black via-neutral-900 to-black
                          p-6 space-y-5 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="space-y-2">
              <p className="text-sm font-extrabold tracking-widest text-white">
                REMOVE PERSONAL TRAINING?
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                This will permanently unassign personal training for this member and remove them from the trainer's student list. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 border border-white/20 text-white/70
                           px-4 py-2.5 text-xs font-extrabold tracking-widest
                           hover:border-white/40 hover:text-white transition"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  setShowRemoveConfirm(false);
                  onRemove();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white
                           px-4 py-2.5 text-xs font-extrabold tracking-widest transition"
              >
                YES, REMOVE
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangeDate && (
        <ChangePtDateModal
          userId={userId}
          currentStart={displayStart}
          currentEnd={displayEnd}
          onClose={() => setShowChangeDate(false)}
          onSuccess={(newStart, newEnd) => {
            setDateOverride({ startDate: newStart, endDate: newEnd });
          }}
        />
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 tracking-widest">{label}</p>
      <p className="font-semibold mt-1">{value || "—"}</p>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}