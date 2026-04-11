import { useState } from "react";
import toast from "react-hot-toast";
import EditTrainerModal from "./EditTrainerModal";
import { deleteTrainer } from "../../api/admin.api";

export default function TrainerCard({ trainer, onUpdate }) {
  const [editOpen, setEditOpen] = useState(false);

  const destroy = async () => {
    if (!confirm("Delete this trainer?")) return;
    try {
      await deleteTrainer(trainer._id);
      toast.success("Trainer deleted");
      onUpdate();
    } catch {
      toast.error("Failed to delete trainer");
    }
  };

  const totalBonus = trainer.bonus?.totalBonus ?? 0;
  const monthBonus = trainer.bonus?.monthBonus ?? 0;

  return (
    <>
      <div
        className="relative overflow-hidden rounded-xl border border-white/8 group transition-all duration-300 hover:border-red-600/40"
        style={{ background: "linear-gradient(160deg, #0f0f0f 0%, #0a0a0a 100%)" }}
      >
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)" }} />
        <div
          className="absolute inset-x-0 top-0 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(239,68,68,0.06), transparent)" }}
        />

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={trainer.avatar.url}
                className="w-14 h-14 rounded-xl object-cover"
                style={{ border: "1.5px solid rgba(239,68,68,0.4)" }}
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[7px] font-black"
                style={{ background: "#ef4444", borderColor: "#0a0a0a", color: "white" }}
              >
                T
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-black tracking-wide text-white/90 truncate">{trainer.fullName}</p>
              <p className="text-[11px] text-white/35 mt-0.5">{trainer.experience} yrs experience</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider"
                  style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
                >
                  TRAINER
                </span>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  {trainer.students?.length ?? 0} students
                </span>
              </div>
            </div>
          </div>

          <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>📞</span>
              <span className="text-sm text-white/60 truncate">{trainer.phoneNumber}</span>
            </div>
            {trainer.email && (
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>✉️</span>
                <span className="text-sm text-white/60 truncate">{trainer.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>💼</span>
              <span className="text-sm text-white/60">
                Salary: <span className="text-white/80 font-semibold">₹{trainer.salary?.toLocaleString("en-IN") || "—"}</span>
              </span>
            </div>
          </div>

          <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div
            className="rounded-lg p-3.5 flex items-center justify-between gap-3"
            style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}
          >
            <div className="text-center flex-1">
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: "rgba(168,85,247,0.6)" }}>
                This Month
              </p>
              <p className="text-lg font-black" style={{ color: "#a855f7" }}>
                ₹{monthBonus.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="w-px h-8" style={{ background: "rgba(168,85,247,0.2)" }} />
            <div className="text-center flex-1">
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: "rgba(168,85,247,0.4)" }}>
                Total Bonus
              </p>
              <p className="text-lg font-black" style={{ color: "rgba(168,85,247,0.65)" }}>
                ₹{totalBonus.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setEditOpen(true)}
              className="flex-1 py-2.5 text-[11px] font-extrabold tracking-widest rounded-lg transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              EDIT
            </button>
            <button
              onClick={destroy}
              className="flex-1 py-2.5 text-[11px] font-extrabold tracking-widest rounded-lg transition-all duration-200"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#ef4444",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                e.currentTarget.style.borderColor = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
              }}
            >
              DELETE
            </button>
          </div>

        </div>
        <div
          className="h-px w-0 group-hover:w-full transition-all duration-500"
          style={{ background: "linear-gradient(90deg, #ef4444, transparent)" }}
        />
      </div>
      {editOpen && (
        <EditTrainerModal
          trainer={trainer}
          onClose={() => setEditOpen(false)}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
}