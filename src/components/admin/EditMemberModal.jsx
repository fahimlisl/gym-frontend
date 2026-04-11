import { useState, useRef } from "react";
import api from "../../api/axios.api";
import toast from "react-hot-toast";

export default function EditMemberModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
  username: user.username?.toString() || "",
  email: user.email?.toString() || "",
  phoneNumber: user.phoneNumber?.toString() || "",
});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar?.url || null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleSubmit = async () => {
    console.log("ex 1")
    if (!form.username.trim()) {
      toast.error("Username is required");
      return;
    }

    const formData = new FormData();
    formData.append("username", form.username.trim());
formData.append("email", form.email.trim());
formData.append("phoneNumber", form.phoneNumber?.toString().trim() || "");
    if (avatarFile) formData.append("avatar", avatarFile);
    console.log("ex 2")
    try {
      console.log("ex 3")
      setLoading(true);
      await api.patch(`/admin/edit-user/${user._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Member updated successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)",
          border: "1px solid rgba(239,68,68,0.25)",
          boxShadow: "0 0 60px rgba(239,68,68,0.12), 0 25px 50px rgba(0,0,0,0.8)",
        }}
      >
        <div
          className="h-[2px] w-full"
          style={{ background: "linear-gradient(90deg, transparent, #dc2626, #ef4444, transparent)" }}
        />

        <div className="p-7">
          <div className="flex items-start justify-between mb-7">
            <div>
              <h2
                className="text-2xl font-black tracking-widest"
                style={{ color: "#fff", letterSpacing: "0.15em" }}
              >
                EDIT MEMBER
              </h2>
              <p className="text-[11px] tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                UPDATE PROFILE INFORMATION
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-5 mb-7">
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  border: "2px solid rgba(239,68,68,0.4)",
                  background: "#1a1a1a",
                  boxShadow: "0 0 20px rgba(239,68,68,0.15)",
                }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-red-500">
                    {user.username?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all duration-200"
                style={{
                  background: "#dc2626",
                  border: "2px solid #0a0a0a",
                  color: "#fff",
                }}
              >
                ✎
              </button>
            </div>
            <div
              className="flex-1 rounded-xl p-4 text-center cursor-pointer transition-all duration-200"
              style={{
                border: `1.5px dashed ${dragOver ? "rgba(239,68,68,0.7)" : "rgba(255,255,255,0.12)"}`,
                background: dragOver ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.02)",
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <p className="text-[11px] tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                {avatarFile ? (
                  <span style={{ color: "#ef4444" }}>✓ {avatarFile.name}</span>
                ) : (
                  <>DROP IMAGE <span style={{ color: "#ef4444" }}>OR CLICK</span> TO UPLOAD</>
                )}
              </p>
              <p className="text-[9px] mt-1 tracking-wider" style={{ color: "rgba(255,255,255,0.2)" }}>
                JPG, PNG, WEBP
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          <div className="mb-6" style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
          <div className="space-y-4">
            {[
              { label: "USERNAME", name: "username", type: "text", placeholder: "Enter username" },
              { label: "EMAIL ADDRESS", name: "email", type: "email", placeholder: "Enter email" },
              { label: "PHONE NUMBER", name: "phoneNumber", type: "tel", placeholder: "Enter phone number" },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label
                  className="block text-[10px] font-black tracking-widest mb-2"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full rounded-lg px-4 py-3 text-sm transition-all duration-200 outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#fff",
                    caretColor: "#ef4444",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(239,68,68,0.5)";
                    e.target.style.background = "rgba(239,68,68,0.04)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.background = "rgba(255,255,255,0.04)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-7">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-lg text-[11px] font-black tracking-widest transition-all duration-200"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              CANCEL
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 rounded-lg text-[11px] font-black tracking-widest transition-all duration-200 relative overflow-hidden"
              style={{
                background: loading ? "rgba(220,38,38,0.4)" : "linear-gradient(135deg, #dc2626, #b91c1c)",
                color: "#fff",
                border: "1px solid rgba(239,68,68,0.4)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(239,68,68,0.3)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 4px 30px rgba(239,68,68,0.5)";
                  e.currentTarget.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(239,68,68,0.3)";
                  e.currentTarget.style.background = "linear-gradient(135deg, #dc2626, #b91c1c)";
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  SAVING...
                </span>
              ) : (
                "SAVE CHANGES"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}