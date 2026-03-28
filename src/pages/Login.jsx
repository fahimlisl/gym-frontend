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
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords must match",
    path: ["confirmNewPassword"],
  });

function CredentialNoticeBanner({ onDismiss }) {
  return (
    <div
      className="
        relative flex items-start gap-4
        w-full max-w-md mx-auto mb-6
        border border-red-600/25
        bg-neutral-950/90
        px-5 py-4
        rounded-sm
        shadow-[0_0_40px_rgba(220,38,38,0.12)]
        animate-fade-in
      "
      style={{ animation: "fadeSlideDown 0.45s cubic-bezier(0.16,1,0.3,1) both" }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-red-600 via-red-500 to-red-700 rounded-l-sm" />

      <div className="mt-0.5 flex-shrink-0">
        <svg
          className="w-[18px] h-[18px] text-red-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M2 7l10 7 10-7" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold tracking-[0.15em] text-white/90 uppercase mb-1">
          Credentials Dispatched
        </p>
        <p className="text-[12px] text-gray-400 leading-relaxed">
          Your login credentials have been sent to your registered email address.
          Please check your inbox — and your spam folder if you don't see it
          within a few minutes.
        </p>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 mt-0.5 text-gray-600 hover:text-gray-300 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function Login() {
  const [role, setRole] = useState("member");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [bannerVisible, setBannerVisible] = useState(true);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    reset: resetForm,
  } = useForm({ resolver: zodResolver(resetSchema) });

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
      toast.error(err?.response?.data?.message || "Invalid credentials");
      setShowForgot(true);
    }
  };

  const handleSendOTP = async () => {
    try {
      if (!identifier) return toast.error("Enter email or phone");
      const isPhone = /^[0-9]{6,}$/.test(identifier);
      const payload = {
        email: isPhone ? undefined : identifier,
        phoneNumber: isPhone ? identifier : undefined,
      };
      const config = ROLE_MAP[role];
      await requestResetToken(`${config.basePath}/reset/password/token`, payload);
      toast.success("OTP sent successfully");
      setStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleResetPassword = async (data) => {
    try {
      const config = ROLE_MAP[role];
      await resetPasswordRequest(`${config.basePath}/reset/password`, data);
      toast.success("Password reset successful");
      setForgotOpen(false);
      setStep(1);
      setShowForgot(false);
      resetForm();
    } catch (err) {
      toast.error("OTP mismatch");
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="min-h-screen relative flex flex-col items-center justify-center bg-black overflow-hidden px-4 py-10">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] bg-red-700/30 blur-[200px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-red-600/20 blur-[180px]" />
        </div>

        {bannerVisible && (
          <CredentialNoticeBanner onDismiss={() => setBannerVisible(false)} />
        )}

        <div
          className="
            relative w-full max-w-md
            border border-red-600/30
            bg-neutral-950
            shadow-[0_0_60px_rgba(255,0,0,0.18)]
            rounded-sm
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <input
                  type="text"
                  placeholder="EMAIL / PHONE"
                  {...register("identifier")}
                  className="
                    w-full bg-black border border-white/10
                    px-4 py-3 text-sm text-white
                    focus:outline-none focus:border-red-600/60
                    transition-colors placeholder:text-gray-600
                  "
                />
                {errors.identifier && (
                  <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="PASSWORD"
                  {...register("password")}
                  className="
                    w-full bg-black border border-white/10
                    px-4 py-3 text-sm text-white
                    focus:outline-none focus:border-red-600/60
                    transition-colors placeholder:text-gray-600
                  "
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  w-full py-4 font-extrabold tracking-widest
                  bg-gradient-to-r from-red-700 via-red-600 to-red-700
                  text-black hover:brightness-110 transition
                  shadow-[0_0_35px_rgba(255,0,0,0.45)]
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {isSubmitting ? "AUTHORIZING..." : "ENTER THE GYM"}
              </button>
            </form>

            {showForgot && (
              <button
                onClick={() => setForgotOpen(true)}
                className="mt-6 text-xs text-red-500 hover:text-red-400 tracking-widest transition-colors"
              >
                FORGOT PASSWORD?
              </button>
            )}
          </div>
        </div>

        {forgotOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div
              className="
                relative w-full max-w-md border border-red-600/30
                bg-neutral-950 shadow-[0_0_80px_rgba(255,0,0,0.25)]
                rounded-sm
              "
              style={{ animation: "fadeSlideDown 0.35s cubic-bezier(0.16,1,0.3,1) both" }}
            >
              <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

              <div className="p-8">
                {step === 1 && (
                  <>
                    <h2 className="text-xl font-black tracking-widest text-red-600 mb-2">
                      RESET ACCESS
                    </h2>
                    <p className="text-xs text-gray-500 tracking-wider mb-6">
                      Enter your registered email. We'll dispatch a one-time code.
                    </p>
                    <input
                      type="text"
                      placeholder="EMAIL"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="
                        w-full bg-black border border-white/10
                        px-4 py-3 text-white text-sm
                        focus:outline-none focus:border-red-600/60
                        transition-colors placeholder:text-gray-600
                      "
                    />
                    <button
                      onClick={handleSendOTP}
                      className="
                        w-full mt-5 py-4 font-extrabold tracking-widest
                        bg-gradient-to-r from-red-700 via-red-600 to-red-700
                        text-black hover:brightness-110 transition
                      "
                    >
                      SEND OTP
                    </button>
                  </>
                )}

                {step === 2 && (
                  <form onSubmit={handleResetSubmit(handleResetPassword)} className="space-y-4">
                    <h2 className="text-xl font-black tracking-widest text-red-600 mb-2">
                      SET NEW PASSWORD
                    </h2>
                    <p className="text-xs text-gray-500 tracking-wider mb-4">
                      Enter the OTP you received and choose a new password.
                    </p>

                    <div>
                      <input
                        placeholder="ENTER OTP"
                        {...registerReset("otp")}
                        className="
                          w-full bg-black border border-white/10
                          px-4 py-3 text-white text-sm tracking-[0.3em]
                          focus:outline-none focus:border-red-600/60 transition-colors
                          placeholder:text-gray-600 placeholder:tracking-normal
                        "
                      />
                      {resetErrors.otp && (
                        <p className="text-red-500 text-xs mt-1">{resetErrors.otp.message}</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="password"
                        placeholder="NEW PASSWORD"
                        {...registerReset("newPassword")}
                        className="
                          w-full bg-black border border-white/10
                          px-4 py-3 text-white text-sm
                          focus:outline-none focus:border-red-600/60 transition-colors
                          placeholder:text-gray-600
                        "
                      />
                      {resetErrors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">{resetErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="password"
                        placeholder="CONFIRM PASSWORD"
                        {...registerReset("confirmNewPassword")}
                        className="
                          w-full bg-black border border-white/10
                          px-4 py-3 text-white text-sm
                          focus:outline-none focus:border-red-600/60 transition-colors
                          placeholder:text-gray-600
                        "
                      />
                      {resetErrors.confirmNewPassword && (
                        <p className="text-red-500 text-xs mt-1">{resetErrors.confirmNewPassword.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="
                        w-full py-4 font-extrabold tracking-widest
                        bg-gradient-to-r from-red-700 via-red-600 to-red-700
                        text-black hover:brightness-110 transition
                      "
                    >
                      RESET PASSWORD
                    </button>
                  </form>
                )}

                <button
                  onClick={() => { setForgotOpen(false); setStep(1); }}
                  className="absolute top-4 right-5 text-gray-500 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}