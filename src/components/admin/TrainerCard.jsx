import { useState } from "react";
import { CalendarClock, LockKeyhole, ArrowUpRight, ScanFace, ChevronRight, ImagePlus, CheckCircle2 } from "lucide-react";
import TrainerScheduleModal from "./TrainerScheduleModal.jsx";
import TrainerFaceEnrollmentModal from "./TrainerFaceEnrollmentModal.jsx";

import toast from "react-hot-toast";

import EditTrainerModal from "./EditTrainerModal";

import StudentsModal from "./StudentsModal";

import TrainerSponsorsModal from "./TrainerSponsorsModal";

import { deleteTrainer } from "../../api/admin.api";



export default function TrainerCard({ trainer, onUpdate, canEdit = false }) {

  const [editOpen, setEditOpen] = useState(false);

  const [studentsModalOpen, setStudentsModalOpen] = useState(false);

  const [sponsorsModalOpen, setSponsorsModalOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [faceOpen, setFaceOpen] = useState(false);



  const destroy = async () => {

    if (!canEdit) return;
    if (!window.confirm("Delete this trainer?")) return;

    try {

      await deleteTrainer(trainer._id);

      toast.success("Trainer deleted");

      onUpdate();

    } catch {

      toast.error("Failed to delete trainer");

    }

  };



  const totalBonus = Math.floor(trainer.bonus?.totalBonus ?? 0);

  const monthBonus = Math.floor(trainer.bonus?.monthBonus ?? 0);

  const studentCount = trainer.students?.length ?? 0;
  const referencePhoto = trainer.verificationAvatar?.url || null;



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

                src={trainer.avatar?.url}

                className="w-14 h-14 rounded-xl object-cover"

                style={{ border: "1.5px solid rgba(239,68,68,0.4)" }}

                alt={trainer.fullName}

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

                <button

                  onClick={() => studentCount > 0 && setStudentsModalOpen(true)}

                  className={`text-[12px] font-medium px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${

                    studentCount > 0

                      ? "hover:bg-white/15 hover:border-red-600/50 cursor-pointer"

                      : "cursor-not-allowed opacity-50"

                  }`}

                  style={{

                    background: "rgba(255,255,255,0.04)",

                    color: "green",

                    border: "1px solid rgba(255,255,255,0.07)",

                  }}

                  disabled={studentCount === 0}

                  title={studentCount > 0 ? "Click to view students" : "No students assigned"}

                >

                  {studentCount} student{studentCount !== 1 ? "s" : ""}

                  {studentCount > 0 && <span className="text-[8px]">›</span>}

                </button>

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

          {/* Sponsor Bonus Section - Clickable */}

          <button

            onClick={() => setSponsorsModalOpen(true)}

            className="w-full rounded-lg p-3.5 flex items-center justify-between gap-3 transition-all duration-200 hover:opacity-80 hover:scale-[1.02] group/sponsor"

            style={{ 

              background: "rgba(168,85,247,0.06)", 

              border: "1px solid rgba(168,85,247,0.15)",

            }}

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

            <div className="flex items-center gap-1 text-purple-400/50 group-hover/sponsor:text-purple-400 transition-colors">

              <span className="text-[10px] font-bold tracking-wider">VIEW</span>

              <span className="text-xs transform group-hover/sponsor:translate-x-0.5 transition-transform">›</span>

            </div>

          </button>



          <button
          type="button"
          onClick={() => setScheduleOpen(true)}
          className="group/schedule relative flex w-full items-center justify-between overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-r from-red-600/15 via-red-600/10 to-transparent px-4 py-3.5 text-left transition-all duration-300 hover:border-red-500/60 hover:from-red-600/25 hover:shadow-[0_10px_35px_rgba(220,38,38,0.08)]"
        >
          <span className="flex items-center gap-3">
            <span className="rounded-lg border border-red-500/25 bg-red-500/15 p-2 text-red-400"><CalendarClock size={18}/></span>
            <span>
              <span className="block text-[11px] font-black tracking-[0.11em] text-white">MANAGE SCHEDULE</span>
              <span className="mt-0.5 block text-[10px] text-white/40">Shifts, breaks and grace periods</span>
            </span>
          </span>
          <span className="flex items-center gap-1 text-red-400">{!canEdit && <LockKeyhole size={12}/>}<ArrowUpRight size={17} className="transition-transform group-hover/schedule:-translate-y-0.5 group-hover/schedule:translate-x-0.5"/></span>
        </button>

        <button
          type="button"
          onClick={() => setFaceOpen(true)}
          className="group/face relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-[#16191a] via-[#101212] to-[#0c0e10] px-3.5 py-3.5 text-left transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_12px_35px_rgba(16,185,129,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
        >
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#1b1e20] text-emerald-400">
            {referencePhoto ? (
              <img src={referencePhoto} alt="Saved reference" className="h-full w-full object-cover" loading="lazy" />
            ) : <ScanFace size={22} />}
            <span className="absolute inset-0 bg-emerald-500/0 transition-colors group-hover/face:bg-emerald-500/10" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black tracking-[.1em] text-white">FACE VERIFICATION</span>
              {referencePhoto ? <CheckCircle2 size={13} className="text-emerald-400" /> : <ImagePlus size={13} className="text-amber-400" />}
            </span>
            <span className="mt-1 block text-[11px] leading-4 text-zinc-400">
              {referencePhoto ? "Reference photo saved · View or replace" : "No reference photo · Upload and enroll"}
            </span>
            {!canEdit && <span className="mt-1 block text-[10px] text-amber-400/80">View-only access</span>}
          </span>
          <ChevronRight size={18} className="shrink-0 text-zinc-500 transition group-hover/face:translate-x-0.5 group-hover/face:text-emerald-400" />
        </button>

        <div className="flex gap-2 pt-1">

            <button

              onClick={() => canEdit && setEditOpen(true)}
              disabled={!canEdit}
              title={!canEdit ? "Read-only access" : "Edit trainer"}

              className="flex-1 py-2.5 text-[11px] font-extrabold tracking-widest rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-35"

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
              disabled={!canEdit}
              title={!canEdit ? "Read-only access" : "Delete trainer"}

              className="flex-1 py-2.5 text-[11px] font-extrabold tracking-widest rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-35"

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



      {/* Modals */}

      {faceOpen && (
        <TrainerFaceEnrollmentModal
          trainer={trainer}
          canEdit={canEdit}
          onClose={() => setFaceOpen(false)}
          onSaved={onUpdate}
        />
      )}

      {scheduleOpen && (
      <TrainerScheduleModal
        trainer={trainer}
        canEdit={canEdit}
        onClose={() => setScheduleOpen(false)}
        onSaved={onUpdate}
      />
    )}

    {editOpen && canEdit && (

        <EditTrainerModal

          trainer={trainer}

          onClose={() => setEditOpen(false)}

          onSuccess={onUpdate}

        />

      )}



      {studentsModalOpen && (

        <StudentsModal

          trainer={trainer}

          onClose={() => setStudentsModalOpen(false)}

        />

      )}



      {sponsorsModalOpen && (

        <TrainerSponsorsModal

          trainer={trainer}

          onClose={() => setSponsorsModalOpen(false)}

        />

      )}

    </>

  );

}