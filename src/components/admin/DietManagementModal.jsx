import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  generateDiet,
  editDiet,
  approveDiet,
  checkDietExists,
  showParticularDiet,
} from "../../api/admin.api";

import { unlockDiet } from "../../api/admin.api";

const DietManagementModal = ({ userId, onClose }) => {
  const [step, setStep] = useState("loading");
  const [diet, setDiet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load initial diet data
  useEffect(() => {
    const initDiet = async () => {
      try {
        setLoading(true);
        const checkRes = await checkDietExists(userId);

        if (checkRes.data.data.exists) {
          const dietRes = await showParticularDiet(userId);
          setDiet(dietRes.data.data);

          if (dietRes.data.data.status === "approved") {
            setStep("approved");
          } else {
            setStep("edit");
          }
        } else {
          setStep("create");
        }
      } catch (error) {
        console.error("Error loading diet:", error);
        setStep("create");
        toast.error("Failed to load diet data");
      } finally {
        setLoading(false);
      }
    };

    initDiet();
  }, [userId]);

  // File validation
  const isValidFile = (file) => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, and PDF files are allowed");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter(isValidFile);
    if (validFiles.length === 0) return;
    setFiles((prev) => [...prev, ...validFiles]);
    setHasChanges(true);
    toast.success(`${validFiles.length} file(s) added`);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index) => {
    setFilesToRemove((prev) => [...prev, index]);
    setDiet((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const handleCreateDiet = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one photo or PDF");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("userId", userId);
      files.forEach((file) => {
        formData.append("photos", file);
      });

      const res = await generateDiet(userId, formData);
      setDiet(res.data.data);
      setFiles([]);
      setStep("edit");
      toast.success("Diet created successfully!");
    } catch (error) {
      console.error("Error creating diet:", error);
      toast.error(error.response?.data?.message || "Failed to create diet");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDiet = async () => {
    const hasNewFiles = files.length > 0;
    const hasExistingFiles = diet?.photos?.length > 0;

    if (!hasNewFiles && !hasExistingFiles) {
      toast.error("Diet must have at least one photo or PDF");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      if (filesToRemove.length > 0) {
        formData.append("filesToRemove", JSON.stringify(filesToRemove));
      }

      if (hasNewFiles) {
        files.forEach((file) => {
          formData.append("photos", file);
        });
      }

      const res = await editDiet(diet._id, formData);
      setDiet(res.data.data);
      setFiles([]);
      setFilesToRemove([]);
      setHasChanges(false);
      toast.success("Diet updated successfully!");
    } catch (error) {
      console.error("Error updating diet:", error);
      toast.error(error.response?.data?.message || "Failed to update diet");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDiet = async () => {
    try {
      setApproving(true);
      const res = await approveDiet(diet._id);
      setDiet(res.data.data);
      setStep("approved");
      toast.success("Diet approved successfully!");
    } catch (error) {
      console.error("Error approving diet:", error);
      toast.error(error.response?.data?.message || "Failed to approve diet");
    } finally {
      setApproving(false);
    }
  };

  const handleUnlockDiet = async () => {
    try {
      setUnlocking(true);
      const res = await unlockDiet(diet._id);
      setDiet(res.data.data);
      setFiles([]);
      setFilesToRemove([]);
      setHasChanges(false);
      setStep("edit");
      toast.success("Diet unlocked for editing!");
    } catch (error) {
      console.error("Error unlocking diet:", error);
      toast.error(error.response?.data?.message || "Failed to unlock diet");
    } finally {
      setUnlocking(false);
    }
  };

  const getFileIcon = (file) => (file.type === "application/pdf" ? "📄" : "🖼️");

  const getFileName = (file) =>
    file.name.length > 30 ? file.name.substring(0, 27) + "..." : file.name;

  // Loading state
  if (loading && !diet) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-neutral-900 via-red-950/20 to-neutral-900 rounded-3xl p-8 max-w-md w-full mx-4 border border-red-500/20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            <p className="text-gray-300">Loading diet information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-neutral-900 via-red-950/10 to-neutral-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-red-500/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
              {step === "create" && "Create Diet Plan"}
              {step === "edit" && "Edit Diet Plan"}
              {step === "approved" && "Diet Plan Approved ✓"}
            </h2>
            <p className="text-sm text-gray-400">
              {step === "create" && "Upload photos or PDFs for the new diet plan"}
              {step === "edit" && "Update diet files • Status: Draft"}
              {step === "approved" && "This diet plan has been approved"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-neutral-800/50 hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-all"
          >
            ✕
          </button>
        </div>
        {(step === "create" || step === "edit") && (
          <div className="space-y-6">

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer
                ${dragActive
                  ? "border-red-500 bg-red-500/10"
                  : "border-neutral-700 bg-neutral-800/30 hover:border-red-500/50 hover:bg-neutral-800/50"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="text-4xl">📤</div>
                <div>
                  <p className="text-white font-semibold">
                    Drop files here or click to select
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Supports JPEG, PNG (max 3MB each)
                  </p>
                </div>
              </div>
            </div>
            {files.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300">
                  Selected Files ({files.length})
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/50 hover:border-red-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl">{getFileIcon(file)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {getFileName(file)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-2 w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === "edit" && diet?.photos?.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-red-500/20">
                <h3 className="text-sm font-semibold text-gray-300">
                  Current Files
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {diet.photos.map((photo, index) => (
                    <div key={index} className="group relative">
                      {photo.photo.includes(".pdf") ? (
                        <div className="flex flex-col items-center justify-center gap-2 bg-neutral-800/50 rounded-xl border border-neutral-700/50 p-4 aspect-[3/4]">
                          <span className="text-5xl">📄</span>
                          <span className="text-xs text-gray-400">PDF</span>
                        </div>
                      ) : (
                        <div className="relative overflow-hidden rounded-xl border border-neutral-700/50 group-hover:border-red-500/50 transition-all">
                          <img
                            src={photo.photo}
                            alt={`Diet photo ${index + 1}`}
                            className="w-full aspect-[3/4] object-cover rounded-xl transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      <button
                        onClick={() => removeExistingFile(index)}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs shadow-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Remove this file"
                      >
                        ✕
                      </button>
                      <p className="text-xs text-gray-400 mt-2 text-center truncate">
                        File {index + 1}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-red-500/20">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 text-white font-medium transition-all"
              >
                Cancel
              </button>

              <button
                onClick={step === "create" ? handleCreateDiet : handleEditDiet}
                disabled={
                  loading ||
                  (step === "create" && files.length === 0) ||
                  (step === "edit" &&
                    files.length === 0 &&
                    diet?.photos?.length === 0)
                }
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : step === "create" ? (
                  "Create Diet"
                ) : (
                  "Update Diet"
                )}
              </button>

              {step === "edit" && (
                <button
                  onClick={handleApproveDiet}
                  disabled={approving || hasChanges}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title={
                    hasChanges
                      ? "Save changes first before approving"
                      : "Approve this diet plan"
                  }
                >
                  {approving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Approving...
                    </>
                  ) : (
                    "✓ Approve"
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {step === "approved" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-5xl">✅</div>
                <div>
                  <h3 className="text-lg font-bold text-red-400 mb-1">
                    Diet Approved
                  </h3>
                  <p className="text-sm text-gray-300">
                    This diet plan has been successfully approved and is now
                    active for the member.
                  </p>
                </div>
              </div>
            </div>
            {diet?.photos?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300">
                  Diet Files
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {diet.photos.map((photo, index) => (
                    <div key={index}>
                      {photo.photo.includes(".pdf") ? (
                        <a
                          href={photo.photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center gap-2 bg-neutral-800/50 rounded-xl border border-neutral-700/50 hover:border-red-500/50 transition-all cursor-pointer p-4 aspect-[3/4]"
                        >
                          <span className="text-6xl">📄</span>
                          <span className="text-xs text-gray-400 mt-2">Open PDF</span>
                        </a>
                      ) : (
                        <a
                          href={photo.photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden rounded-xl border border-neutral-700/50 hover:border-red-500/50 transition-all cursor-pointer"
                        >
                          <img
                            src={photo.photo}
                            alt={`Diet photo ${index + 1}`}
                            className="w-full aspect-[3/4] object-cover rounded-xl transition-transform hover:scale-105"
                          />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleUnlockDiet}
                disabled={unlocking}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {unlocking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  "🔓 Unlock for Editing"
                )}
              </button>

              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.5);
        }
      `}</style>
    </div>
  );
};

export default DietManagementModal;