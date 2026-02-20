import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  loginRequest,
  requestResetToken,
  resetPasswordRequest,
} from "../api/auth.api";
import { ROLE_MAP } from "../utils/roleMap";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

const loginSchema = z.object({
  identifier: z.string().min(3, "Email or phone is required"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

const resetSchema = z
  .object({
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords must match",
    path: ["confirmNewPassword"],
  });

export default function Login() {
  const [role, setRole] = useState("admin");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    reset: resetForm,
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (values) => {
    try {
      const isPhone = /^[0-9]{6,}$/.test(values.identifier);

      const payload = {
        password: values.password,
        email: isPhone ? undefined : values.identifier,
        phoneNumber: isPhone ? values.identifier : undefined,
      };

      const config = ROLE_MAP[role];

      await loginRequest(config.loginEndpoint, payload);

      toast.success(`${config.label} logged in successfully`);
      navigate(config.redirect);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Invalid credentials"
      );
      setShowForgot(true);
    }
  };


  const handleSendOTP = async () => {
    try {
      if (!identifier) {
        return toast.error("Enter email or phone");
      }

      const isPhone = /^[0-9]{6,}$/.test(identifier);

      const payload = {
        email: isPhone ? undefined : identifier,
        phoneNumber: isPhone ? identifier : undefined,
      };

      const config = ROLE_MAP[role];

      await requestResetToken(
        `${config.basePath}/reset/password/token`,
        payload
      );

      toast.success("OTP sent successfully");
      setStep(2);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to send OTP"
      );
    }
  };

  const handleResetPassword = async (data) => {
    try {
      const config = ROLE_MAP[role];

      await resetPasswordRequest(
        `${config.basePath}/reset/password`,
        data
      );

      toast.success("Password reset successful");

      setForgotOpen(false);
      setStep(1);
      setShowForgot(false);
      resetForm();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Reset failed"
      );
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-black overflow-hidden px-4">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] bg-red-700/30 blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-red-600/20 blur-[180px]" />
      </div>

      <div
        className="
          relative w-full max-w-md
          border border-red-600/30
          bg-neutral-950
          shadow-[0_0_60px_rgba(255,0,0,0.18)]
          rounded-lg
        "
      >
        <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

        <div className="p-6 sm:p-10">

          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-black tracking-widest">
              <span className="text-red-600">ALPHA</span> GYM
            </h1>
            <p className="mt-2 text-[10px] tracking-[0.3em] text-gray-500">
              BUILT FOR THE OBSESSED
            </p>
          </div>

          <div className="mb-8">
            <p className="text-[10px] text-gray-500 font-bold tracking-widest mb-3">
              SELECT ACCESS LEVEL
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 border border-white/10">
              {Object.keys(ROLE_MAP).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  className={clsx(
                    "py-3 text-[11px] font-extrabold tracking-widest transition-all",
                    role === key
                      ? "bg-red-600 text-black"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {ROLE_MAP[key].label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div>
              <input
                type="text"
                placeholder="EMAIL / PHONE"
                {...register("identifier")}
                className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white"
              />
              {errors.identifier && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="PASSWORD"
                {...register("password")}
                className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 font-extrabold tracking-widest
                         bg-gradient-to-r from-red-700 via-red-600 to-red-700
                         text-black hover:brightness-110 transition
                         shadow-[0_0_35px_rgba(255,0,0,0.45)]"
            >
              {isSubmitting ? "AUTHORIZING..." : "ENTER THE GYM"}
            </button>
          </form>

          {showForgot && (
            <button
              onClick={() => setForgotOpen(true)}
              className="mt-6 text-xs text-red-500 hover:text-red-400 tracking-widest"
            >
              FORGOT PASSWORD?
            </button>
          )}
        </div>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="relative w-full max-w-md border border-red-600/30
                          bg-neutral-950 shadow-[0_0_80px_rgba(255,0,0,0.25)]">

            <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

            <div className="p-8">

              {step === 1 && (
                <>
                  <h2 className="text-xl font-black tracking-widest text-red-600 mb-6">
                    RESET ACCESS
                  </h2>

                  <input
                    type="text"
                    placeholder="EMAIL / PHONE"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-black border border-white/10 px-4 py-3 text-white"
                  />

                  <button
                    onClick={handleSendOTP}
                    className="w-full mt-6 py-4 font-extrabold tracking-widest
                               bg-gradient-to-r from-red-700 via-red-600 to-red-700
                               text-black hover:brightness-110 transition"
                  >
                    SEND OTP
                  </button>
                </>
              )}

              {step === 2 && (
                <form onSubmit={handleResetSubmit(handleResetPassword)}>

                  <div>
                    <input
                      placeholder="ENTER OTP"
                      {...registerReset("otp")}
                      className="w-full mb-2 bg-black border border-white/10 px-4 py-3 text-white"
                    />
                    {resetErrors.otp && (
                      <p className="text-red-500 text-xs">
                        {resetErrors.otp.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="password"
                      placeholder="NEW PASSWORD"
                      {...registerReset("newPassword")}
                      className="w-full mb-2 bg-black border border-white/10 px-4 py-3 text-white"
                    />
                    {resetErrors.newPassword && (
                      <p className="text-red-500 text-xs">
                        {resetErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="password"
                      placeholder="CONFIRM PASSWORD"
                      {...registerReset("confirmNewPassword")}
                      className="w-full mb-2 bg-black border border-white/10 px-4 py-3 text-white"
                    />
                    {resetErrors.confirmNewPassword && (
                      <p className="text-red-500 text-xs">
                        {resetErrors.confirmNewPassword.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-4 font-extrabold tracking-widest
                               bg-gradient-to-r from-red-700 via-red-600 to-red-700
                               text-black hover:brightness-110 transition"
                  >
                    RESET PASSWORD
                  </button>
                </form>
              )}

              <button
                onClick={() => {
                  setForgotOpen(false);
                  setStep(1);
                }}
                className="absolute top-3 right-4 text-gray-500 hover:text-white"
              >
                ✕
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}