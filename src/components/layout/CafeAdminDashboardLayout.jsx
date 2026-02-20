import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../../api/axios.api.js";

export default function CafeAdminDashboardLayout({ title, children }) {
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
      await api.post("/cafe/admin/logout");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleChangePassword = async (data) => {
    try {
      await api.patch("/cafe/admin/change/password", data);
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
      <div className="min-h-screen bg-gray-100">

        <header className="bg-black text-white px-6 py-4 flex items-center justify-between">

          <h1 className="text-lg font-semibold">{title}</h1>

          <div className="flex items-center gap-4">

            <NavLink
              to="/cafe/dashboard"
              className="text-sm bg-green-600 hover:bg-white hover:text-black px-3 py-1 rounded"
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/cafe/payments"
              className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              Payments
            </NavLink>

            <button
              onClick={() => setShowChangeModal(true)}
              className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
            >
              Change Password
            </button>

            <button
              onClick={handleLogout}
              className="text-sm bg-gray-700 hover:bg-gray-800 px-3 py-1 rounded"
            >
              Logout
            </button>

            <span className="text-sm opacity-80">
              Cafe Admin
            </span>

          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>

      {showChangeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm
                        flex items-center justify-center z-50">

          <div className="relative w-full max-w-md border border-gray-300
                          bg-white shadow-xl rounded">

            <div className="bg-black text-white px-6 py-4 rounded-t">
              <h2 className="font-semibold">
                Change Password
              </h2>
            </div>

            <div className="p-6">

              <form onSubmit={handleSubmit(handleChangePassword)}>

                <input
                  type="password"
                  placeholder="Old Password"
                  {...register("oldPassword", { required: true })}
                  className="w-full mb-4 border px-4 py-2 rounded"
                />

                <input
                  type="password"
                  placeholder="New Password"
                  {...register("newPassword", { required: true })}
                  className="w-full mb-4 border px-4 py-2 rounded"
                />

                <input
                  type="password"
                  placeholder="Confirm New Password"
                  {...register("confirmNewPassword", { required: true })}
                  className="w-full mb-6 border px-4 py-2 rounded"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-2 rounded hover:opacity-90"
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>

              </form>

              <button
                onClick={() => setShowChangeModal(false)}
                className="absolute top-3 right-4 text-gray-500 hover:text-black"
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