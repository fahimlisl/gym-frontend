import { useState } from "react";
import DietInfoModal from "./DietInfoModal";

export default function StudentCard({ student }) {
  const [dietOpen, setDietOpen] = useState(false);

  return (
    <>
      <div className="border border-red-600/30
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      rounded-xl p-6 space-y-5">

        <div className="flex items-center gap-4">
          <img
            src={student.avatar?.url}
            className="w-14 h-14 rounded-full border-2 border-red-600 object-cover"
          />

          <div>
            <p className="font-black tracking-wide">
              {student.username || "MEMBER"}
            </p>
            <p className="text-xs text-gray-400">
              {student.phoneNumber}
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <p>
            Joined:{" "}
            {new Date(student.createdAt).toLocaleDateString()}
          </p>
          <p>
            Subscription:{" "}
            {student.subscription ? "ACTIVE" : "—"}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setDietOpen(true)}
            className="flex-1 border border-red-600
                       py-2 text-xs font-extrabold tracking-widest
                       hover:bg-red-600"
          >
            DIET
          </button>

          <button
            disabled
            className="flex-1 border border-white/10
                       py-2 text-xs font-extrabold tracking-widest
                       text-gray-500 cursor-not-allowed"
          >
            PROGRESS
          </button>
        </div>
      </div>

      {dietOpen && (
        <DietInfoModal onClose={() => setDietOpen(false)} />
      )}
    </>
  );
}
