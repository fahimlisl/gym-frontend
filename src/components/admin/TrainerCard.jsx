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

  return (
    <div className="border border-red-600/30
                    bg-gradient-to-br from-black via-neutral-900 to-black
                    rounded-xl p-6 space-y-5">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <img
          src={trainer.avatar.url}
          className="w-14 h-14 rounded-full border-2 border-red-600 object-cover"
        />

        <div>
          <p className="font-black tracking-wide">
            {trainer.fullName}
          </p>
          <p className="text-xs text-gray-400">
            {trainer.experience}
          </p>
        </div>
      </div>

      {/* INFO */}
      <div className="text-sm space-y-1">
        <p>📞 {trainer.phoneNumber}</p>
        {trainer.email && <p>✉️ {trainer.email}</p>}
        <p>👥 Students: {trainer.students?.length || 0}</p>
        <p>💰 Salary: ₹{trainer.salary || "—"}</p>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={() => setEditOpen(true)}
          className="flex-1 border border-white/20
                     py-2 text-xs font-extrabold tracking-widest
                     hover:border-red-600"
        >
          EDIT
        </button>

        <button
          onClick={destroy}
          className="flex-1 border border-red-600
                     py-2 text-xs font-extrabold tracking-widest
                     hover:bg-red-600"
        >
          DELETE
        </button>
      </div>

      {editOpen && (
        <EditTrainerModal
          trainer={trainer}
          onClose={() => setEditOpen(false)}
          onSuccess={onUpdate}
        />
      )}
    </div>
  );
}
