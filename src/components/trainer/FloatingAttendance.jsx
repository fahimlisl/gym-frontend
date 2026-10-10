import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity, ArrowRight, Camera, Check, CheckCircle2, CircleAlert,
  Clock3, Fingerprint, LoaderCircle, MapPin, ScanFace, ShieldCheck, X,
} from "lucide-react";
import { markTrainerAttendance } from "../../api/trainer.api.js";

const stages = [
  { key: "camera", label: "CAMERA", icon: Camera },
  { key: "location", label: "LOCATION", icon: MapPin },
  { key: "verifying", label: "VERIFY", icon: ShieldCheck },
];

const readableType = (type) =>
  String(type || "Attendance").replace(/_/g, " ").toUpperCase();

const showTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const captureFrame = (video) => new Promise((resolve, reject) => {
  if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
    reject(new Error("Camera is still starting. Please try again."));
    return;
  }
  const width = Math.min(720, video.videoWidth);
  const height = Math.round(width * video.videoHeight / video.videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    reject(new Error("Camera capture isn't available on this browser."));
    return;
  }
  ctx.drawImage(video, 0, 0, width, height);
  canvas.toBlob((blob) => {
    if (!blob) reject(new Error("Couldn't capture your face. Please retry."));
    else resolve(blob);
  }, "image/jpeg", 0.88);
});

export default function FloatingAttendance() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const openerRef = useRef(null);
  const closeRef = useRef(null);
  const openRef = useRef(false);
  const submittingRef = useRef(false);

  const busy = ["opening", "capturing", "location", "verifying"].includes(phase);
  const requestInProgress = ["capturing", "location", "verifying"].includes(phase);
  const cameraReady = phase === "ready";
  const success = phase === "success";
  const currentStage = phase === "location" ? 1 : phase === "verifying" || success ? 2 : 0;

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const closeDialog = useCallback(() => {
    if (submittingRef.current) return;
    openRef.current = false;
    stopCamera();
    setOpen(false);
    setPhase("idle");
    setError("");
    setReceipt(null);
    requestAnimationFrame(() => openerRef.current?.focus());
  }, [stopCamera]);

  const openDialog = () => {
    openRef.current = true;
    setOpen(true);
    setPhase("idle");
    setError("");
    setReceipt(null);
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !submittingRef.current) closeDialog();
      if (event.key === "Tab") {
        const dialog = document.getElementById("alphagym-attendance-dialog");
        if (!dialog) return;
        const nodes = Array.from(dialog.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter((element) => element.getClientRects().length);
        if (!nodes.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closeDialog]);

  useEffect(() => () => {
    openRef.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const startCamera = async () => {
    setError("");
    setReceipt(null);
    setPhase("opening");
    stopCamera();
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera requires HTTPS (or localhost) and a supported browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false,
      });
      if (!openRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Camera preview could not start.");
      video.srcObject = stream;
      await video.play();
      if (!openRef.current) { stopCamera(); return; }
      setPhase("ready");
    } catch (err) {
      stopCamera();
      if (!openRef.current) return;
      const message = err.name === "NotAllowedError"
        ? "Camera permission denied. Allow access in your browser settings."
        : err.name === "NotFoundError"
          ? "No camera found on this device."
          : err.message || "Could not start your camera.";
      setError(message);
      setPhase("idle");
    }
  };

  const submitAttendance = async () => {
    if (submittingRef.current || !cameraReady) return;
    submittingRef.current = true;
    setError("");
    setPhase("capturing");
    try {
      // const photo = await captureFrame(videoRef.current);
      // // Stop recording immediately after the frame has been captured.
      // stopCamera();
      // const response = await markTrainerAttendance(photo, { onStage: setPhase });

      const photos = [];

for (let i = 0; i < 3; i++) {
  const photo = await captureFrame(videoRef.current);

  photos.push(photo);

  if (i < 2) {
    await new Promise((resolve) =>
      setTimeout(resolve, 400)
    );
  }
}

stopCamera();

const response = await markTrainerAttendance(photos, {
  onStage: setPhase,
});



      if (response?.success === false || !response?.data?.attendance?.type) {
        throw new Error("Server did not confirm an attendance event.");
      }
      setReceipt(response.data);
      setPhase("success");
    } catch (err) {
  const status = err.response?.status;
  const serverMessage = err.response?.data?.message || "";

  if (
    status === 400 &&
    (
      serverMessage.includes("face enrollment") ||
      serverMessage.includes("verification photo")
    )
  ) {
    setError(
      "Your face verification is not enrolled yet. Please ask your gym administrator to complete face enrollment before marking attendance."
    );
  } else if (status === 401) {
    setError(
      "Your login session has expired. Please log in again."
    );
  } else {
    setError(
      serverMessage ||
      err.message ||
      "Attendance failed. Please try again."
    );
  }

  setPhase("idle");
} finally {
  submittingRef.current = false;
}
  };

  

  // Portal prevents parent overflow/stacking contexts from covering the FAB/modal.
  return createPortal(
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={openDialog}
        aria-label="Open face attendance"
        className="group fixed bottom-[calc(1.15rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-3 rounded-2xl border border-red-400/30 bg-gradient-to-r from-red-600 via-red-600 to-red-700 p-2 pr-4 text-white shadow-[0_14px_50px_rgba(220,38,38,.33)] outline-none transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_70px_rgba(220,38,38,.48)] focus-visible:ring-4 focus-visible:ring-red-300/60 md:bottom-8 md:right-8 md:gap-4 md:rounded-[22px] md:p-3 md:pr-6"
      >
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20 md:h-12 md:w-12">
          <span className="absolute inset-0 animate-ping rounded-xl bg-white/10 [animation-duration:2.8s]" aria-hidden="true" />
          <ScanFace className="relative h-6 w-6" strokeWidth={1.8} />
        </span>
        <span className="text-left">
          <span className="block text-[10px] font-bold uppercase tracking-[.24em] text-red-100/80">ALPHAGYM / LIVE</span>
          <span className="block text-[13px] font-black uppercase tracking-[.08em] md:text-sm">Mark attendance</span>
        </span>
        <ArrowRight className="ml-1 h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/85 p-0 backdrop-blur-lg sm:items-center sm:p-5" onMouseDown={(e) => { if (e.target === e.currentTarget && !requestInProgress) closeDialog(); }}>
          <section
            id="alphagym-attendance-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alphagym-attendance-title"
            className="relative flex max-h-[96dvh] w-full max-w-[470px] flex-col overflow-hidden rounded-t-[30px] border border-white/10 bg-[#0c0c0e] text-white shadow-[0_35px_130px_rgba(0,0,0,.85)] sm:max-h-[92dvh] sm:rounded-[30px]"
          >
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-red-600/15 blur-[80px]" />
            <div className="relative flex items-center justify-between border-b border-white/[.07] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-red-500/25 bg-red-500/10 text-red-400"><Fingerprint size={21} /></div>
                <div>
                  <p className="text-[10px] font-bold tracking-[.24em] text-red-400">ALPHAGYM ID</p>
                  <p className="text-sm font-bold tracking-wide">Secure attendance</p>
                </div>
              </div>
              <button ref={closeRef} type="button" aria-label="Close attendance" onClick={closeDialog} disabled={requestInProgress} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-40"><X size={19} /></button>
            </div>

            <div className="relative overflow-y-auto px-5 pb-6 pt-5 sm:px-6">
              <div className="mb-5">
                <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-white/40"><Activity size={13} className="text-red-500" /> Face + location check</p>
                <h2 id="alphagym-attendance-title" className="text-[26px] font-black leading-[1.12] tracking-tight sm:text-[29px]">One scan.<br/><span className="text-red-500">Smart attendance.</span></h2>
                <p className="mt-2 text-xs leading-relaxed text-white/45">Your schedule decides whether this is check-in, break, excess movement, or check-out.</p>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-2">
                {stages.map(({ key, label, icon: Icon }, index) => {
                  const active = index === currentStage && !success;
                  const completed = success || index < currentStage;
                  return (
                    <div key={key} className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-[9px] font-bold tracking-widest ${completed ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" : active ? "border-red-500/35 bg-red-500/10 text-red-300" : "border-white/[.06] bg-white/[.03] text-white/25"}`}>
                      {completed ? <Check size={13}/> : <Icon size={13}/>} {label}
                    </div>
                  );
                })}
              </div>

              <div className="relative aspect-[5/4.5] overflow-hidden rounded-[22px] border border-white/10 bg-[#151518]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_30%,rgba(130,32,40,.22),transparent_55%)]" />
                <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 h-full w-full object-cover -scale-x-100 ${phase === "ready" || phase === "capturing" ? "opacity-100" : "opacity-0"}`} />
                {phase === "ready" && (
                  <>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="relative h-[80%] w-[58%] rounded-[46%] border border-white/25 shadow-[0_0_0_999px_rgba(0,0,0,.12)]">
                        <i className="absolute -left-px -top-px h-8 w-8 rounded-tl-[30px] border-l-2 border-t-2 border-red-400" />
                        <i className="absolute -right-px -top-px h-8 w-8 rounded-tr-[30px] border-r-2 border-t-2 border-red-400" />
                        <i className="absolute -bottom-px -left-px h-8 w-8 rounded-bl-[30px] border-b-2 border-l-2 border-red-400" />
                        <i className="absolute -bottom-px -right-px h-8 w-8 rounded-br-[30px] border-b-2 border-r-2 border-red-400" />
                      </div>
                    </div>
                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-[10px] font-bold tracking-wider"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> CAMERA ON</div>
                    <p className="absolute inset-x-4 bottom-3 rounded-lg bg-black/60 px-3 py-2 text-center text-[11px] font-medium text-white/85 backdrop-blur-sm">Center your face · Remove sunglasses · Face the light</p>
                  </>
                )}
                {phase === "idle" && !receipt && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-5 text-center">
                    <div className="grid h-20 w-20 place-items-center rounded-[24px] border border-red-500/30 bg-red-500/10 shadow-[0_0_65px_rgba(220,38,38,.13)]"><ScanFace size={39} strokeWidth={1.4} className="text-red-400" /></div>
                    <div><p className="text-sm font-bold">Ready when you are</p><p className="mt-1 text-xs text-white/40">Camera starts only after your permission.</p></div>
                  </div>
                )}
                {busy && phase !== "ready" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#101013]/95 px-5 text-center">
                    <LoaderCircle size={39} className="animate-spin text-red-500" />
                    <p className="text-sm font-bold">{phase === "opening" ? "Opening camera…" : phase === "location" ? "Getting GPS location…" : phase === "verifying" ? "Verifying attendance…" : "Capturing frame…"}</p>
                    <p className="text-xs text-white/40">{phase === "verifying" ? "Face and location are checked by AlphaGym." : "Please keep this screen open."}</p>
                  </div>
                )}
                {success && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0e1512] px-6 text-center">
                    <div className="grid h-20 w-20 place-items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_60px_rgba(16,185,129,.12)]"><CheckCircle2 size={42} className="text-emerald-400" /></div>
                    <p className="text-xl font-black tracking-tight">Attendance recorded</p>
                    <p className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-emerald-300">{readableType(receipt?.attendance?.type)}</p>
                    <p className="text-xs text-white/40">{showTime(receipt?.attendance?.time)}</p>
                  </div>
                )}
              </div>

              {error && (
                <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5 text-xs leading-relaxed text-red-200"><CircleAlert size={16} className="mt-0.5 shrink-0"/><span>{error}</span></div>
              )}

              {success ? (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[.08] bg-white/[.03] p-3.5"><p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Location</p><p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-emerald-300"><MapPin size={14}/> Verified</p></div>
                  <div className="rounded-xl border border-white/[.08] bg-white/[.03] p-3.5"><p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Capture</p><p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-emerald-300"><Clock3 size={14}/> {showTime(receipt?.attendance?.time) || "Recorded"}</p></div>
                </div>
              ) : (
                <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/35"><ShieldCheck size={14} className="text-red-400"/> Image sent for verification · Not stored by this page</p>
              )}

              <div className="mt-5 space-y-3">
                {success ? (
                  <button type="button" onClick={closeDialog} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-black text-black transition hover:bg-emerald-400">Done <Check size={17}/></button>
                ) : cameraReady ? (
                  <button type="button" disabled={busy} onClick={submitAttendance} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-3.5 text-sm font-black tracking-wide shadow-[0_12px_35px_rgba(220,38,38,.22)] transition hover:brightness-110 focus-visible:ring-4 focus-visible:ring-red-400/30 disabled:cursor-not-allowed disabled:opacity-50"><ScanFace size={19}/> CAPTURE & MARK ATTENDANCE <ArrowRight size={17}/></button>
                ) : (
                  <button type="button" disabled={busy} onClick={startCamera} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-3.5 text-sm font-black tracking-wide shadow-[0_12px_35px_rgba(220,38,38,.22)] transition hover:brightness-110 focus-visible:ring-4 focus-visible:ring-red-400/30 disabled:cursor-not-allowed disabled:opacity-50"><Camera size={19}/>{busy ? "PLEASE WAIT…" : "ENABLE FRONT CAMERA"}<ArrowRight size={17}/></button>
                )}
                {!success && <p className="text-center text-[11px] leading-relaxed text-white/25">Permission-based capture · GPS required · Result confirmed by server</p>}
              </div>
            </div>
          </section>
        </div>
      )}
    </>, document.body
  );
}
