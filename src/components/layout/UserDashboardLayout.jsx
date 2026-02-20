import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../../api/axios.api";

export default function UserDashboardLayout({ children }) {
  const navigate = useNavigate();
  const [showChangeModal, setShowChangeModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  const logout = async () => {
    try {
      await api.post("/user/logout");
      toast.success("Logged out");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleChangePassword = async (data) => {
    try {
      await api.patch("/user/change/password", data);
      toast.success("Password changed successfully");
      setShowChangeModal(false);
      reset();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to change password"
      );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-neutral-950 text-white">
        <header
          className="sticky top-0 z-40
                     border-b border-red-600/30
                     bg-black/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4
                          flex items-center justify-between">

            <div
              className="font-black tracking-widest text-lg cursor-pointer"
              onClick={() => navigate("/user/dashboard")}
            >
              ALPHA <span className="text-red-600">GYM</span>
            </div>

            <div className="flex items-center gap-4">

              <button
                onClick={() => setShowChangeModal(true)}
                className="border border-red-600
                           px-5 py-2 text-xs font-extrabold tracking-widest
                           hover:bg-red-600 transition"
              >
                CHANGE PASSWORD
              </button>

              <button
                onClick={logout}
                className="border border-red-600
                           px-5 py-2 text-xs font-extrabold tracking-widest
                           hover:bg-red-600 transition"
              >
                LOGOUT
              </button>

            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-white/10 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-6
                          text-center text-xs text-gray-500 tracking-widest">
            MEMBER DASHBOARD • POWERED BY ALPHA GYM
          </div>
        </footer>
      </div>

      {showChangeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm
                        flex items-center justify-center z-50">

          <div className="relative w-full max-w-md border border-red-600/30
                          bg-neutral-950 shadow-[0_0_80px_rgba(255,0,0,0.25)]">

            <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

            <div className="p-8">

              <h2 className="text-xl font-black tracking-widest text-red-600 mb-6">
                CHANGE PASSWORD
              </h2>

              <form onSubmit={handleSubmit(handleChangePassword)}>

                <input
                  type="password"
                  placeholder="OLD PASSWORD"
                  {...register("oldPassword", { required: true })}
                  className="w-full mb-4 bg-black border border-white/10 px-4 py-3 text-white"
                />

                <input
                  type="password"
                  placeholder="NEW PASSWORD"
                  {...register("newPassword", { required: true })}
                  className="w-full mb-4 bg-black border border-white/10 px-4 py-3 text-white"
                />

                <input
                  type="password"
                  placeholder="CONFIRM NEW PASSWORD"
                  {...register("confirmNewPassword", { required: true })}
                  className="w-full mb-6 bg-black border border-white/10 px-4 py-3 text-white"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 font-extrabold tracking-widest
                             bg-gradient-to-r from-red-700 via-red-600 to-red-700
                             text-black hover:brightness-110 transition"
                >
                  {isSubmitting ? "UPDATING..." : "UPDATE PASSWORD"}
                </button>

              </form>

              <button
                onClick={() => setShowChangeModal(false)}
                className="absolute top-3 right-4 text-gray-500 hover:text-white"
              >
                ✕
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}