import { useRef, useState } from "react";
import { Camera, Loader2, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../api/axios.api";

export default function UserHeader({ user, onAvatarUpdate }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleAvatarClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      const res = await api.patch("/user/change/pfp", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile photo updated");
      onAvatarUpdate?.((prev) => ({
        ...prev,
        avatar: res.data.data.avatar,
      }));
      setPreviewUrl(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update photo");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const initials = (user.username || "M")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative overflow-hidden border border-red-600/30 bg-gradient-to-br from-black via-neutral-900 to-black rounded-xl">
      <div className="h-px bg-gradient-to-r from-transparent via-red-600/60 to-transparent" />

      <div className="p-4 sm:p-8 flex flex-row sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <div className="relative flex-shrink-0 group">
          <motion.div
            whileHover={{ scale: uploading ? 1 : 1.03 }}
            transition={{ duration: 0.2 }}
            onClick={handleAvatarClick}
            className={`relative w-14 h-14 sm:w-24 sm:h-24 rounded-full cursor-pointer ${
              uploading ? "cursor-wait" : "cursor-pointer"
            }`}
          >
            <AnimatePresence>
              {uploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-red-500 animate-spin z-10"
                />
              )}
            </AnimatePresence>

            <div className="absolute inset-0 rounded-full border-2 border-red-600/50 group-hover:border-red-500 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300" />

            <img
              src={previewUrl || user.avatar?.url}
              alt="avatar"
              className={`w-full h-full rounded-full object-cover transition-opacity duration-300 ${
                uploading ? "opacity-50" : "opacity-100"
              }`}
            />

            <div className="absolute inset-0 rounded-full bg-black/70 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {uploading ? (
                <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
              ) : (
                <>
                  <Camera className="w-5 h-5 text-red-400" />
                  <span className="text-[9px] text-red-400 tracking-widest font-bold">
                    CHANGE
                  </span>
                </>
              )}
            </div>
          </motion.div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-base sm:text-2xl font-black tracking-widest truncate">
              {(user.username || "MEMBER").toUpperCase()}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-[9px] font-bold tracking-widest flex-shrink-0">
              <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <p className="text-[11px] sm:text-sm text-gray-400 truncate">
              {user.email}
            </p>
            <span className="text-gray-600 text-[10px] hidden xs:inline">
              ·
            </span>
            <p className="text-[11px] sm:text-xs text-gray-500 tracking-wider">
              {user.phoneNumber}
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5">
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 flex-shrink-0" />
            <span className="text-[9px] sm:text-[10px] text-gray-500 tracking-widest font-mono truncate">
              ID:{" "}
              {String(user._id || "")
                .slice(-10)
                .toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
    </div>
  );
}
