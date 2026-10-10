import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Camera,
  Check,
  Images,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ScanFace,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  getTrainerVerificationPhotos,
  uploadTrainerVerificationAvatar,
} from "../../api/admin.api";

const MAX_FILES = 5;
const MIN_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

function readPhotos(response) {
  const photos = Array.isArray(response)
    ? response
    : response?.data?.data?.photos ?? response?.data?.photos ?? response?.photos ?? [];

  if (!Array.isArray(photos)) return [];
  return photos.filter((photo) => typeof photo?.url === "string" && photo.url.length > 0);
}

export default function TrainerFaceEnrollmentModal({
  trainer,
  canEdit,
  onClose,
  onSaved,
}) {
  const [files, setFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [photosError, setPhotosError] = useState("");
  const [photosRefreshKey, setPhotosRefreshKey] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  const [localPreviews, setLocalPreviews] = useState([]);
  useEffect(() => {
    const previews = files.map((file) => URL.createObjectURL(file));
    setLocalPreviews(previews);
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setPhotosLoading(true);
      setPhotosError("");
      try {
        const response = await getTrainerVerificationPhotos(trainer._id);
        if (!cancelled) setExistingPhotos(readPhotos(response));
      } catch (err) {
        if (!cancelled) {
          setPhotosError(err.response?.data?.message || "Unable to load saved enrollment photos.");
        }
      } finally {
        if (!cancelled) setPhotosLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [trainer._id, photosRefreshKey]);

  const hasChanges = files.length > 0;
  const requestClose = useCallback(() => {
    if (uploading) return;
    if (hasChanges && !window.confirm("Discard the selected reference photos?")) return;
    onClose();
  }, [uploading, hasChanges, onClose]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (previewUrl) setPreviewUrl(null);
        else requestClose();
        return;
      }
      if (event.key !== "Tab" || previewUrl) return;
      const controls = Array.from(dialogRef.current?.querySelectorAll(
        'button:not(:disabled), input:not(:disabled), [tabindex="0"]'
      ) || []).filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [previewUrl, requestClose]);

  const addFiles = (selected) => {
    if (!canEdit || uploading) return;
    const incoming = Array.from(selected || []);
    if (!incoming.length) return;
    const next = [...files];

    for (const file of incoming) {
      if (!ALLOWED_TYPES.has(file.type)) {
        setError("Only JPEG or PNG reference photos are supported.");
        return;
      }
      if (!file.size || file.size > MAX_FILE_SIZE) {
        setError("Each photo must be larger than 0 bytes and at most 5 MB.");
        return;
      }
      const duplicate = next.some((item) =>
        item.name === file.name &&
        item.size === file.size &&
        item.lastModified === file.lastModified
      );
      if (duplicate) continue;
      if (next.length >= MAX_FILES) {
        setError("You can select a maximum of five reference photos.");
        return;
      }
      next.push(file);
    }
    setFiles(next);
    setConfirmed(false);
    setError("");
  };

  const removeFile = (index) => {
    if (uploading) return;
    setFiles((current) => current.filter((_, i) => i !== index));
    setConfirmed(false);
    setError("");
  };

  const save = async (event) => {
    event.preventDefault();
    if (!canEdit || uploading) return;
    if (files.length < MIN_FILES || files.length > MAX_FILES) {
      setError("Select between 3 and 5 reference photos.");
      return;
    }
    if (!confirmed) {
      setError("Confirm the trainer's identity and consent before saving.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      await uploadTrainerVerificationAvatar(trainer._id, files);
      toast.success("Reference photos and face embeddings saved.");
      setFiles([]);
      setConfirmed(false);
      setPhotosRefreshKey((key) => key + 1);
      try {
        await onSaved?.();
      } catch (refreshError) {
        console.warn("Enrollment saved but trainer list refresh failed:", refreshError);
      }
      // Keep this modal open so the admin can verify the saved gallery.
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save face enrollment.");
    } finally {
      setUploading(false);
    }
  };

  const photoCount = useMemo(() => existingPhotos.length, [existingPhotos]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/85 backdrop-blur-xl sm:items-center sm:p-5"
      onMouseDown={(event) => event.target === event.currentTarget && requestClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trainer-enrollment-title"
        className="flex h-[100dvh] w-full max-w-2xl flex-col overflow-hidden border border-white/10 bg-[#0b0c0f] text-white shadow-2xl sm:h-[90dvh] sm:max-h-[840px] sm:rounded-[28px]"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-gradient-to-br from-[#12221f] via-[#111518] to-[#0e0f12] p-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-400">
              <ScanFace size={23} />
            </span>
            <div>
              <p className="text-[10px] font-bold tracking-[.2em] text-emerald-400">ALPHAGYM / IDENTITY ENROLLMENT</p>
              <h2 id="trainer-enrollment-title" className="mt-1 text-lg font-black sm:text-xl">Trainer face enrollment</h2>
              <p className="mt-1 text-xs text-zinc-400">{trainer.fullName}</p>
            </div>
          </div>
          <button ref={closeRef} type="button" disabled={uploading} onClick={requestClose} aria-label="Close enrollment" className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-zinc-400 hover:text-white disabled:opacity-40"><X size={18} /></button>
        </header>

        <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-7">
            {!canEdit && (
              <p className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
                <LockKeyhole size={16} /> View only: this admin account cannot change enrollment.
              </p>
            )}

            <section className="rounded-2xl border border-white/10 bg-[#111316] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold"><Images size={17} className="text-emerald-400" /> Saved verification photos</h3>
                  <p className="mt-1 text-xs text-zinc-500">Previously enrolled reference images stored in Cloudinary.</p>
                </div>
                <button type="button" disabled={photosLoading} onClick={() => setPhotosRefreshKey((key) => key + 1)} className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white disabled:opacity-40" aria-label="Refresh saved photos"><RefreshCw size={16} /></button>
              </div>

              {photosLoading ? (
                <p className="flex items-center gap-2 py-5 text-sm text-zinc-400"><LoaderCircle size={17} className="animate-spin" /> Loading saved photos...</p>
              ) : photosError ? (
                <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{photosError}</p>
              ) : photoCount === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-zinc-500">No saved verification photos found. Re-enroll with 3–5 images to store the full gallery.</p>
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-zinc-400">{photoCount} saved photo{photoCount === 1 ? "" : "s"}</span>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">ENROLLED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {existingPhotos.map((photo, index) => (
                      <button
                        key={photo.public_id || `${photo.url}-${index}`}
                        type="button"
                        onClick={() => setPreviewUrl(photo.url)}
                        aria-label={`View saved face photo ${index + 1}`}
                        className="overflow-hidden rounded-xl border border-white/10 bg-black/30 text-left transition hover:border-emerald-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                      >
                        <img src={photo.url} alt={`Saved reference ${index + 1}`} loading="lazy" className="aspect-square w-full object-cover" />
                        <span className="block p-2 text-center text-[11px] font-semibold text-zinc-300">
                          {index === 0 ? "Primary" : `Photo ${index + 1}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>

            {canEdit && (
              <section className="rounded-2xl border border-white/10 bg-[#111316] p-4 sm:p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold"><Camera size={17} className="text-emerald-400" /> {photoCount ? "Replace enrollment" : "New enrollment"}</h3>
                <p className="mt-2 text-xs leading-5 text-zinc-400">Choose 3–5 clear photos of this trainer. Saving replaces the existing reference gallery and regenerates the face embeddings used for attendance.</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={(event) => {
                    addFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={uploading || files.length >= MAX_FILES}
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(event) => { event.preventDefault(); if (!uploading) setDragging(true); }}
                  onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
                  onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}
                  className={`mt-4 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-emerald-300 transition disabled:opacity-40 ${dragging ? "border-emerald-400 bg-emerald-500/10" : "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-400"}`}
                >
                  <UploadCloud size={27} />
                  <span className="text-sm font-bold">Choose or drop reference images</span>
                  <span className="text-xs">{files.length}/5 selected · JPEG/PNG · up to 5 MB each</span>
                </button>

                {files.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {files.map((file, index) => (
                      <div key={`${file.name}-${file.lastModified}-${index}`} className="overflow-hidden rounded-xl border border-emerald-500/20 bg-black/30">
                        {localPreviews[index] && (
                          <img src={localPreviews[index]} alt={`New reference ${index + 1}`} className="aspect-square w-full object-cover" />
                        )}
                        <div className="flex items-center justify-between gap-2 p-2">
                          <span className="truncate text-xs text-zinc-300">New photo {index + 1}</span>
                          <button type="button" disabled={uploading} onClick={() => removeFile(index)} aria-label={`Remove new photo ${index + 1}`} className="text-red-400 hover:text-red-300 disabled:opacity-50"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {canEdit && (
              <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[.025] p-4">
                <input type="checkbox" checked={confirmed} disabled={uploading || files.length < MIN_FILES} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1 accent-emerald-500" />
                <span className="text-xs leading-6 text-zinc-300">I have verified that the selected photos belong to <strong className="text-white">{trainer.fullName}</strong> and that the trainer consents to biometric attendance enrollment.</span>
              </label>
            )}

            <p className="flex items-start gap-2 text-xs leading-5 text-zinc-400"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-400" /> The uploaded images are stored for authorized viewing; face matching uses the numeric embeddings stored separately in MongoDB.</p>
            {error && <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"><AlertCircle size={17} />{error}</p>}
          </div>

          <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 bg-[#0b0c0f] px-4 py-4 sm:px-7">
            <button type="button" disabled={uploading} onClick={requestClose} className="rounded-xl border border-white/10 px-4 py-3 text-xs font-bold text-zinc-300 disabled:opacity-50">CLOSE</button>
            {canEdit && (
              <button type="submit" disabled={uploading || files.length < MIN_FILES || !confirmed} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40">
                {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}
                {uploading ? "SAVING..." : "SAVE ENROLLMENT"}
              </button>
            )}
          </footer>
        </form>
      </div>

      {previewUrl && (
        <div role="dialog" aria-modal="true" aria-label="Enrollment photo preview" className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 p-4" onMouseDown={(event) => event.target === event.currentTarget && setPreviewUrl(null)}>
          <button type="button" aria-label="Close photo preview" onClick={() => setPreviewUrl(null)} className="absolute right-5 top-5 rounded-xl bg-white/10 p-3 text-white"><X size={20} /></button>
          <img src={previewUrl} alt="Enrolled trainer verification" className="max-h-[85dvh] max-w-full rounded-xl object-contain" />
        </div>
      )}
    </div>,
    document.body
  );
}
