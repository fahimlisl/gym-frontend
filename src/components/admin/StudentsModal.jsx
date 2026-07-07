import { X } from "lucide-react";

export default function StudentsModal({ trainer, onClose }) {
  const students = trainer.students || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[80vh] rounded-xl border border-white/10 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0f0f0f 0%, #0a0a0a 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-black tracking-widest text-white">
              STUDENTS OF {trainer.fullName?.toUpperCase() || trainer.username?.toUpperCase() || "TRAINER"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{students.length} members</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-6 space-y-4">
          {students.length === 0 ? (
            <p className="text-center text-gray-500 tracking-widest py-10">
              NO STUDENTS ASSIGNED
            </p>
          ) : (
            students.map((student) => {
              const pt = student?.personalTraning;
              const subs = pt?.subscription || [];
              const latestSub = subs.length > 0 ? subs[subs.length - 1] : null;
              
              const planName = latestSub?.plan || "No active plan";
              
              let expiryDisplay = "N/A";
              if (latestSub?.endDate) {
                try {
                  expiryDisplay = new Date(latestSub.endDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                } catch {
                  expiryDisplay = "Invalid date";
                }
              }

              const avatarUrl = student?.avatar?.url;

              return (
                <div
                  key={student._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-white/5 hover:border-red-600/30 transition-all"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={student.username || "Student"}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {student.username?.charAt(0) || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-white/90 truncate">
                        {student.username || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {student.phoneNumber || "No phone"} {student.email && `| ${student.email}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/70"
                      title="Plan"
                    >
                      {planName}
                    </span>
                    <span
                      className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/70"
                      title="Expiry"
                    >
                      {expiryDisplay}
                    </span>
                    {latestSub?.status && (
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          latestSub.status === "active"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : latestSub.status === "expired"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {latestSub.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-white/5 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold tracking-widest bg-red-600 hover:bg-red-700 transition-colors rounded-md"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}