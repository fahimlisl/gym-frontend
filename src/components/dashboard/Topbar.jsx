import { Menu, LogOut, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { adminLogout, changePasswordRequest } from "../../api/auth.api.js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const [showChangeModal, setShowChangeModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  const handleLogout = async () => {
    try {
      await adminLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleChangePassword = async (data) => {
    try {
      await changePasswordRequest(data);
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
      <header
        className="h-16 flex items-center justify-between
                   px-4 md:px-6
                   border-b border-white/10 bg-black
                   sticky top-0 z-20"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden text-gray-400 hover:text-red-500"
          >
            <Menu />
          </button>

          <h2 className="font-bold tracking-wide">
            Admin Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-6">

          <button
            onClick={() => setShowChangeModal(true)}
            className="flex items-center gap-2 text-sm font-bold
                       text-gray-400 hover:text-red-500"
          >
            <KeyRound size={18} />
            Change Password
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-bold
                       text-gray-400 hover:text-red-500"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

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
