// import { useEffect, useRef, useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import { loginRequest, requestResetToken, resetPasswordRequest } from "../api/auth.api";
// import { api } from "../api/axios.api.js";
// import { ROLE_MAP } from "../utils/roleMap";
// import { getPanelScope } from "../utils/panelScope";

// const loginSchema = z.object({
//   identifier: z.string().min(3, "Email or phone is required"),
//   password: z.string().min(3, "Password must be at least 3 characters"),
// });

// const resetSchema = z.object({
//   otp: z.string().length(6, "OTP must be exactly 6 digits"),
//   newPassword: z.string().min(6, "Password must be at least 6 characters"),
//   confirmNewPassword: z.string(),
// }).refine((data) => data.newPassword === data.confirmNewPassword, {
//   message: "Passwords must match",
//   path: ["confirmNewPassword"],
// });

// function CredentialNoticeBanner({ onDismiss }) {
//   return (
//     <div
//       className="relative flex items-start gap-3 sm:gap-4 w-full max-w-md mx-auto mb-5 sm:mb-6 border border-red-600/25 bg-neutral-950/90 px-4 sm:px-5 py-4 rounded-sm shadow-[0_0_40px_rgba(220,38,38,0.12)]"
//       style={{ animation: "fadeSlideDown 0.45s cubic-bezier(0.16,1,0.3,1) both" }}
//     >
//       <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-red-600 via-red-500 to-red-700 rounded-l-sm" />
//       <div className="mt-0.5 flex-shrink-0">
//         <svg className="w-[18px] h-[18px] text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//           <rect x="2" y="4" width="20" height="16" rx="2" />
//           <path d="M2 7l10 7 10-7" />
//         </svg>
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="text-[11px] font-bold tracking-[0.15em] text-white/90 uppercase mb-1">Credentials Dispatched</p>
//         <p className="text-[12px] text-gray-400 leading-relaxed">
//           Your login credentials have been sent to your registered email address. Please check your inbox — and your spam folder if you don't see it within a few minutes.
//         </p>
//       </div>
//       {onDismiss && (
//         <button type="button" onClick={onDismiss} className="flex-shrink-0 mt-0.5 text-gray-600 hover:text-gray-300 transition-colors" aria-label="Dismiss">
//           <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//             <path d="M18 6L6 18M6 6l12 12" />
//           </svg>
//         </button>
//       )}
//     </div>
//   );
// }

// function SessionLoader() {
//   return (
//     <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center gap-4">
//       <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-red-600 animate-spin" />
//       <p className="text-[10px] tracking-[0.25em] text-gray-500">CHECKING SESSION</p>
//     </div>
//   );
// }

// export default function Login() {
//   const role = getPanelScope();
//   const config = ROLE_MAP[role];
//   const navigate = useNavigate();
//   const [checkingSession, setCheckingSession] = useState(Boolean(config?.sessionEndpoint));
//   const sessionChecked = useRef(false);

//   useEffect(() => {
//     if (sessionChecked.current) return;
//     sessionChecked.current = true;

//     const restoreSession = async () => {
//       if (!config?.sessionEndpoint) {
//         setCheckingSession(false);
//         return;
//       }
//       try {
//         await api.get(config.sessionEndpoint);
//         navigate(config.redirect, { replace: true });
//       } catch (error) {
//         setCheckingSession(false);
//       }
//     };

//     restoreSession();
//   }, [config?.sessionEndpoint, config?.redirect, navigate]);

//   const [showForgot, setShowForgot] = useState(false);
//   const [forgotOpen, setForgotOpen] = useState(false);
//   const [step, setStep] = useState(1);
//   const [identifier, setIdentifier] = useState("");
//   const [bannerVisible, setBannerVisible] = useState(true);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm({ resolver: zodResolver(loginSchema) });

//   const {
//     register: registerReset,
//     handleSubmit: handleResetSubmit,
//     formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
//     reset: resetForm,
//   } = useForm({ resolver: zodResolver(resetSchema) });

//   const onSubmit = async (values) => {
//     try {
//       const cleanedIdentifier = values.identifier.trim();
//       const isPhone = /^[0-9]{6,}$/.test(cleanedIdentifier);
//       const payload = {
//         password: values.password,
//         email: isPhone ? undefined : cleanedIdentifier,
//         phoneNumber: isPhone ? cleanedIdentifier : undefined,
//         scope: role,
//       };
//       await loginRequest(config.loginEndpoint, payload);
//       toast.success(`${config.label} logged in successfully`);
//       navigate(config.redirect, { replace: true });
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Invalid credentials");
//       setShowForgot(true);
//     }
//   };

//   const handleSendOTP = async () => {
//     try {
//       const cleanedIdentifier = identifier.trim();
//       if (!cleanedIdentifier) return toast.error("Enter email or phone");
//       const isPhone = /^[0-9]{6,}$/.test(cleanedIdentifier);
//       const payload = {
//         email: isPhone ? undefined : cleanedIdentifier,
//         phoneNumber: isPhone ? cleanedIdentifier : undefined,
//         scope: role,
//       };
//       await requestResetToken(`${config.basePath}/reset/password/token`, payload);
//       toast.success("OTP sent successfully");
//       setStep(2);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to send OTP");
//     }
//   };

//   const handleResetPassword = async (data) => {
//     try {
//       await resetPasswordRequest(`${config.basePath}/reset/password`, { ...data, scope: role });
//       toast.success("Password reset successful");
//       setForgotOpen(false);
//       setStep(1);
//       setShowForgot(false);
//       setIdentifier("");
//       resetForm();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Unable to reset password");
//     }
//   };

//   if (checkingSession) return <SessionLoader />;

//   return (
//     <>
//       <style>
//         {`
//           @keyframes fadeSlideDown {
//             from { opacity: 0; transform: translateY(-10px); }
//             to { opacity: 1; transform: translateY(0); }
//           }
//         `}
//       </style>

//       <div className="min-h-[100dvh] relative flex flex-col items-center justify-center bg-black overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
//         <div className="absolute inset-0 pointer-events-none">
//           <div className="absolute -top-32 -left-32 sm:-top-40 sm:-left-40 w-[320px] h-[320px] sm:w-[600px] sm:h-[600px] bg-red-700/30 blur-[160px] sm:blur-[200px]" />
//           <div className="absolute bottom-0 right-0 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] bg-red-600/20 blur-[140px] sm:blur-[180px]" />
//         </div>

//         {bannerVisible && <CredentialNoticeBanner onDismiss={() => setBannerVisible(false)} />}

//         <div className="relative w-full max-w-md border border-red-600/30 bg-neutral-950 shadow-[0_0_60px_rgba(255,0,0,0.18)] rounded-sm">
//           <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />
//           <div className="p-5 sm:p-8 md:p-10">
//             <div className="text-center mb-7 sm:mb-10">
//               <h1 className="text-[clamp(1.75rem,8vw,2.5rem)] leading-none font-black tracking-widest">
//                 <span className="text-red-600">ALPHA</span> GYM
//               </h1>
//               <p className="mt-2 text-[10px] tracking-[0.3em] text-gray-500">BUILT FOR THE OBSESSED</p>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
//               <div>
//                 <input
//                   type="text"
//                   placeholder="EMAIL / PHONE"
//                   autoComplete="username"
//                   autoCapitalize="none"
//                   {...register("identifier")}
//                   className="w-full bg-black border border-white/10 px-4 py-3.5 sm:py-3 text-base sm:text-sm text-white focus:outline-none focus:border-red-600/60 transition-colors placeholder:text-gray-600"
//                 />
//                 {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>}
//               </div>

//               <div>
//                 <input
//                   type="password"
//                   placeholder="PASSWORD"
//                   autoComplete="current-password"
//                   {...register("password")}
//                   className="w-full bg-black border border-white/10 px-4 py-3.5 sm:py-3 text-base sm:text-sm text-white focus:outline-none focus:border-red-600/60 transition-colors placeholder:text-gray-600"
//                 />
//                 {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
//               </div>

//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="w-full py-3.5 sm:py-4 text-sm sm:text-base font-extrabold tracking-widest bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-black hover:brightness-110 transition shadow-[0_0_35px_rgba(255,0,0,0.45)] disabled:opacity-60 disabled:cursor-not-allowed"
//               >
//                 {isSubmitting ? "AUTHORIZING..." : "ENTER THE GYM"}
//               </button>
//             </form>

//             {showForgot && (
//               <button
//                 type="button"
//                 onClick={() => setForgotOpen(true)}
//                 className="mt-6 text-xs text-red-500 hover:text-red-400 tracking-widest transition-colors"
//               >
//                 FORGOT PASSWORD?
//               </button>
//             )}
//           </div>
//         </div>

//         {forgotOpen && (
//           <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 px-4">
//             <div
//               className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto border border-red-600/30 bg-neutral-950 shadow-[0_0_80px_rgba(255,0,0,0.25)] rounded-sm"
//               style={{ animation: "fadeSlideDown 0.35s cubic-bezier(0.16,1,0.3,1) both" }}
//             >
//               <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />
//               <div className="p-6 sm:p-8">
//                 {step === 1 && (
//                   <>
//                     <h2 className="text-xl font-black tracking-widest text-red-600 mb-2">RESET ACCESS</h2>
//                     <p className="text-xs text-gray-500 tracking-wider mb-6">
//                       Enter your registered email or phone number. We'll dispatch a one-time code.
//                     </p>
//                     <input
//                       type="text"
//                       placeholder="EMAIL / PHONE"
//                       value={identifier}
//                       onChange={(e) => setIdentifier(e.target.value)}
//                       className="w-full bg-black border border-white/10 px-4 py-3.5 sm:py-3 text-white text-base sm:text-sm focus:outline-none focus:border-red-600/60 transition-colors placeholder:text-gray-600"
//                     />
//                     <button
//                       type="button"
//                       onClick={handleSendOTP}
//                       className="w-full mt-5 py-3.5 sm:py-4 font-extrabold tracking-widest bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-black hover:brightness-110 transition"
//                     >
//                       SEND OTP
//                     </button>
//                   </>
//                 )}

//                 {step === 2 && (
//                   <form onSubmit={handleResetSubmit(handleResetPassword)} className="space-y-4">
//                     <h2 className="text-xl font-black tracking-widest text-red-600 mb-2">SET NEW PASSWORD</h2>
//                     <p className="text-xs text-gray-500 tracking-wider mb-4">
//                       Enter the OTP you received and choose a new password.
//                     </p>

//                     <div>
//                       <input
//                         type="text"
//                         inputMode="numeric"
//                         maxLength={6}
//                         autoComplete="one-time-code"
//                         placeholder="ENTER OTP"
//                         {...registerReset("otp")}
//                         className="w-full bg-black border border-white/10 px-4 py-3.5 sm:py-3 text-white text-base sm:text-sm tracking-[0.3em] focus:outline-none focus:border-red-600/60 transition-colors placeholder:text-gray-600 placeholder:tracking-normal"
//                       />
//                       {resetErrors.otp && <p className="text-red-500 text-xs mt-1">{resetErrors.otp.message}</p>}
//                     </div>

//                     <div>
//                       <input
//                         type="password"
//                         placeholder="NEW PASSWORD"
//                         autoComplete="new-password"
//                         {...registerReset("newPassword")}
//                         className="w-full bg-black border border-white/10 px-4 py-3.5 sm:py-3 text-white text-base sm:text-sm focus:outline-none focus:border-red-600/60 transition-colors placeholder:text-gray-600"
//                       />
//                       {resetErrors.newPassword && <p className="text-red-500 text-xs mt-1">{resetErrors.newPassword.message}</p>}
//                     </div>

//                     <div>
//                       <input
//                         type="password"
//                         placeholder="CONFIRM PASSWORD"
//                         autoComplete="new-password"
//                         {...registerReset("confirmNewPassword")}
//                         className="w-full bg-black border border-white/10 px-4 py-3.5 sm:py-3 text-white text-base sm:text-sm focus:outline-none focus:border-red-600/60 transition-colors placeholder:text-gray-600"
//                       />
//                       {resetErrors.confirmNewPassword && <p className="text-red-500 text-xs mt-1">{resetErrors.confirmNewPassword.message}</p>}
//                     </div>

//                     <button
//                       type="submit"
//                       disabled={isResetSubmitting}
//                       className="w-full py-3.5 sm:py-4 font-extrabold tracking-widest bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-black hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
//                     >
//                       {isResetSubmitting ? "RESETTING..." : "RESET PASSWORD"}
//                     </button>
//                   </form>
//                 )}

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setForgotOpen(false);
//                     setStep(1);
//                     resetForm();
//                   }}
//                   className="absolute top-4 right-5 text-gray-500 hover:text-white transition-colors"
//                   aria-label="Close"
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }


import { useEffect, useRef, useState } from "react";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";

import { loginRequest, requestResetToken, resetPasswordRequest } from "../api/auth.api";

import { api } from "../api/axios.api.js";

import { ROLE_MAP } from "../utils/roleMap";

import { getPanelScope } from "../utils/panelScope";

const PANEL_THEMES = {
  admin: {
    noticeBorder: "border-red-600/25",
    cardBorder: "border-red-600/30",
    spinnerBorder: "border-t-red-600",
    focusBorder: "focus:border-red-600/60",
    glowTop: "bg-red-700/30",
    glowBottom: "bg-red-600/20",
    fromStrong: "from-red-600",
    fromDark: "from-red-700",
    viaBright: "via-red-500",
    viaStrong: "via-red-600",
    toDark: "to-red-700",
    textHover: "hover:text-red-400",
    textSoft: "text-red-500",
    textStrong: "text-red-600",
    noticeShadow: "shadow-[0_0_40px_rgba(220,38,38,0.12)]",
    cardShadow: "shadow-[0_0_60px_rgba(255,0,0,0.18)]",
    modalShadow: "shadow-[0_0_80px_rgba(255,0,0,0.25)]",
    buttonShadow: "shadow-[0_0_35px_rgba(255,0,0,0.45)]",
  },
  trainer: {
    noticeBorder: "border-sky-600/25",
    cardBorder: "border-sky-600/30",
    spinnerBorder: "border-t-sky-600",
    focusBorder: "focus:border-sky-600/60",
    glowTop: "bg-sky-700/30",
    glowBottom: "bg-sky-600/20",
    fromStrong: "from-sky-600",
    fromDark: "from-sky-700",
    viaBright: "via-sky-500",
    viaStrong: "via-sky-600",
    toDark: "to-sky-700",
    textHover: "hover:text-sky-400",
    textSoft: "text-sky-500",
    textStrong: "text-sky-600",
    noticeShadow: "shadow-[0_0_40px_rgba(2,132,199,0.12)]",
    cardShadow: "shadow-[0_0_60px_rgba(14,165,233,0.18)]",
    modalShadow: "shadow-[0_0_80px_rgba(14,165,233,0.25)]",
    buttonShadow: "shadow-[0_0_35px_rgba(14,165,233,0.45)]",
  },
  member: {
    noticeBorder: "border-emerald-600/25",
    cardBorder: "border-emerald-600/30",
    spinnerBorder: "border-t-emerald-600",
    focusBorder: "focus:border-emerald-600/60",
    glowTop: "bg-emerald-700/30",
    glowBottom: "bg-emerald-600/20",
    fromStrong: "from-emerald-600",
    fromDark: "from-emerald-700",
    viaBright: "via-emerald-500",
    viaStrong: "via-emerald-600",
    toDark: "to-emerald-700",
    textHover: "hover:text-emerald-400",
    textSoft: "text-emerald-500",
    textStrong: "text-emerald-600",
    noticeShadow: "shadow-[0_0_40px_rgba(5,150,105,0.12)]",
    cardShadow: "shadow-[0_0_60px_rgba(16,185,129,0.18)]",
    modalShadow: "shadow-[0_0_80px_rgba(16,185,129,0.25)]",
    buttonShadow: "shadow-[0_0_35px_rgba(16,185,129,0.45)]",
  },
};

const loginSchema = z.object({

  identifier: z.string().min(3, "Email or phone is required"),

  password: z.string().min(3, "Password must be at least 3 characters"),

});

const resetSchema = z.object({

  otp: z.string().length(6, "OTP must be exactly 6 digits"),

  newPassword: z.string().min(6, "Password must be at least 6 characters"),

  confirmNewPassword: z.string(),

}).refine((data) => data.newPassword === data.confirmNewPassword, {

  message: "Passwords must match",

  path: ["confirmNewPassword"],

});

function CredentialNoticeBanner({ onDismiss, theme }) {

  return (

    <div

      className={`relative flex items-start gap-3 sm:gap-4 w-full max-w-md mx-auto mb-5 sm:mb-6 border ${theme.noticeBorder} bg-neutral-950/90 px-4 sm:px-5 py-4 rounded-sm ${theme.noticeShadow}`}

      style={{ animation: "fadeSlideDown 0.45s cubic-bezier(0.16,1,0.3,1) both" }}

    >

      <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${theme.fromStrong} ${theme.viaBright} ${theme.toDark} rounded-l-sm`} />

      <div className="mt-0.5 flex-shrink-0">

        <svg className={`w-[18px] h-[18px] ${theme.textSoft}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">

          <rect x="2" y="4" width="20" height="16" rx="2" />

          <path d="M2 7l10 7 10-7" />

        </svg>

      </div>

      <div className="flex-1 min-w-0">

        <p className="text-[11px] font-bold tracking-[0.15em] text-white/90 uppercase mb-1">Credentials Dispatched</p>

        <p className="text-[12px] text-gray-400 leading-relaxed">

          Your login credentials have been sent to your registered email address. Please check your inbox — and your spam folder if you don't see it within a few minutes.

        </p>

      </div>

      {onDismiss && (

        <button type="button" onClick={onDismiss} className="flex-shrink-0 mt-0.5 text-gray-600 hover:text-gray-300 transition-colors" aria-label="Dismiss">

          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">

            <path d="M18 6L6 18M6 6l12 12" />

          </svg>

        </button>

      )}

    </div>

  );

}

function SessionLoader({ theme }) {

  return (

    <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center gap-4">

      <div className={`w-8 h-8 rounded-full border-2 border-white/10 ${theme.spinnerBorder} animate-spin`} />

      <p className="text-[10px] tracking-[0.25em] text-gray-500">CHECKING SESSION</p>

    </div>

  );

}

export default function Login() {

  const role = getPanelScope();

 const theme = role === "admin" ? PANEL_THEMES.admin : role === "trainer" ? PANEL_THEMES.trainer : PANEL_THEMES.member;

  const config = ROLE_MAP[role];

  const navigate = useNavigate();

  const [checkingSession, setCheckingSession] = useState(Boolean(config?.sessionEndpoint));

  const sessionChecked = useRef(false);

  useEffect(() => {

    if (sessionChecked.current) return;

    sessionChecked.current = true;

    const restoreSession = async () => {

      if (!config?.sessionEndpoint) {

        setCheckingSession(false);

        return;

      }

      try {

        await api.get(config.sessionEndpoint);

        navigate(config.redirect, { replace: true });

      } catch (error) {

        setCheckingSession(false);

      }

    };

    restoreSession();

  }, [config?.sessionEndpoint, config?.redirect, navigate]);

  const [showForgot, setShowForgot] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);

  const [step, setStep] = useState(1);

  const [identifier, setIdentifier] = useState("");

  const [bannerVisible, setBannerVisible] = useState(true);

  const {

    register,

    handleSubmit,

    formState: { errors, isSubmitting },

  } = useForm({ resolver: zodResolver(loginSchema) });

  const {

    register: registerReset,

    handleSubmit: handleResetSubmit,

    formState: { errors: resetErrors, isSubmitting: isResetSubmitting },

    reset: resetForm,

  } = useForm({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (values) => {

    try {

      const cleanedIdentifier = values.identifier.trim();

      const isPhone = /^[0-9]{6,}$/.test(cleanedIdentifier);

      const payload = {

        password: values.password,

        email: isPhone ? undefined : cleanedIdentifier,

        phoneNumber: isPhone ? cleanedIdentifier : undefined,

        scope: role,

      };

      await loginRequest(config.loginEndpoint, payload);

      toast.success(`${config.label} logged in successfully`);

      navigate(config.redirect, { replace: true });

    } catch (err) {

      toast.error(err?.response?.data?.message || "Invalid credentials");

      setShowForgot(true);

    }

  };

  const handleSendOTP = async () => {

    try {

      const cleanedIdentifier = identifier.trim();

      if (!cleanedIdentifier) return toast.error("Enter email or phone");

      const isPhone = /^[0-9]{6,}$/.test(cleanedIdentifier);

      const payload = {

        email: isPhone ? undefined : cleanedIdentifier,

        phoneNumber: isPhone ? cleanedIdentifier : undefined,

        scope: role,

      };

      await requestResetToken(`${config.basePath}/reset/password/token`, payload);

      toast.success("OTP sent successfully");

      setStep(2);

    } catch (err) {

      toast.error(err?.response?.data?.message || "Failed to send OTP");

    }

  };

  const handleResetPassword = async (data) => {

    try {

      await resetPasswordRequest(`${config.basePath}/reset/password`, { ...data, scope: role });

      toast.success("Password reset successful");

      setForgotOpen(false);

      setStep(1);

      setShowForgot(false);

      setIdentifier("");

      resetForm();

    } catch (err) {

      toast.error(err?.response?.data?.message || "Unable to reset password");

    }

  };

  if (checkingSession) return <SessionLoader theme={theme} />;

  return (

    <>

      <style>

        {`

          @keyframes fadeSlideDown {

            from { opacity: 0; transform: translateY(-10px); }

            to { opacity: 1; transform: translateY(0); }

          }

        `}

      </style>

      <div className="min-h-[100dvh] relative flex flex-col items-center justify-center bg-black overflow-hidden px-4 py-8 sm:px-6 sm:py-12">

        <div className="absolute inset-0 pointer-events-none">

          <div className={`absolute -top-32 -left-32 sm:-top-40 sm:-left-40 w-[320px] h-[320px] sm:w-[600px] sm:h-[600px] ${theme.glowTop} blur-[160px] sm:blur-[200px]`} />

          <div className={`absolute bottom-0 right-0 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] ${theme.glowBottom} blur-[140px] sm:blur-[180px]`} />

        </div>

        {bannerVisible && <CredentialNoticeBanner theme={theme} onDismiss={() => setBannerVisible(false)} />}

        <div className={`relative w-full max-w-md border ${theme.cardBorder} bg-neutral-950 ${theme.cardShadow} rounded-sm`}>

          <div className={`h-1 bg-gradient-to-r ${theme.fromDark} ${theme.viaBright} ${theme.toDark}`} />

          <div className="p-5 sm:p-8 md:p-10">

            <div className="text-center mb-7 sm:mb-10">

              <h1 className="text-[clamp(1.75rem,8vw,2.5rem)] leading-none font-black tracking-widest">

                <span className={`${theme.textStrong}`}>ALPHA</span> GYM

              </h1>

              <p className="mt-2 text-[10px] tracking-[0.3em] text-gray-500">BUILT FOR THE OBSESSED</p>

            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">

              <div>

                <input

                  type="text"

                  placeholder="EMAIL / PHONE"

                  autoComplete="username"

                  autoCapitalize="none"

                  {...register("identifier")}

                  className={`w-full bg-black border border-white/10 px-4 py-3.5 sm:py-3 text-base sm:text-sm text-white focus:outline-none ${theme.focusBorder} transition-colors placeholder:text-gray-600`}

                />

                {errors.identifier && <p className={`${theme.textSoft} text-xs mt-1`}>{errors.identifier.message}</p>}

              </div>

              <div>

                <input

                  type="password"

                  placeholder="PASSWORD"

                  autoComplete="current-password"

                  {...register("password")}

                  className={`w-full bg-black border border-white/10 px-4 py-3.5 sm:py-3 text-base sm:text-sm text-white focus:outline-none ${theme.focusBorder} transition-colors placeholder:text-gray-600`}

                />

                {errors.password && <p className={`${theme.textSoft} text-xs mt-1`}>{errors.password.message}</p>}

              </div>

              <button

                type="submit"

                disabled={isSubmitting}

                className={`w-full py-3.5 sm:py-4 text-sm sm:text-base font-extrabold tracking-widest bg-gradient-to-r ${theme.fromDark} ${theme.viaStrong} ${theme.toDark} text-black hover:brightness-110 transition ${theme.buttonShadow} disabled:opacity-60 disabled:cursor-not-allowed`}

              >

                {isSubmitting ? "AUTHORIZING..." : "ENTER THE GYM"}

              </button>

            </form>

            {showForgot && (

              <button

                type="button"

                onClick={() => setForgotOpen(true)}

                className={`mt-6 text-xs ${theme.textSoft} ${theme.textHover} tracking-widest transition-colors`}

              >

                FORGOT PASSWORD?

              </button>

            )}

          </div>

        </div>

        {forgotOpen && (

          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 px-4">

            <div

              className={`relative w-full max-w-md max-h-[90dvh] overflow-y-auto border ${theme.cardBorder} bg-neutral-950 ${theme.modalShadow} rounded-sm`}

              style={{ animation: "fadeSlideDown 0.35s cubic-bezier(0.16,1,0.3,1) both" }}

            >

              <div className={`h-1 bg-gradient-to-r ${theme.fromDark} ${theme.viaBright} ${theme.toDark}`} />

              <div className="p-6 sm:p-8">

                {step === 1 && (

                  <>

                    <h2 className={`text-xl font-black tracking-widest ${theme.textStrong} mb-2`}>RESET ACCESS</h2>

                    <p className="text-xs text-gray-500 tracking-wider mb-6">

                      Enter your registered email or phone number. We'll dispatch a one-time code.

                    </p>

                    <input

                      type="text"

                      placeholder="EMAIL / PHONE"

                      value={identifier}

                      onChange={(e) => setIdentifier(e.target.value)}

                      className={`w-full bg-black border border-white/10 px-4 py-3.5 sm:py-3 text-white text-base sm:text-sm focus:outline-none ${theme.focusBorder} transition-colors placeholder:text-gray-600`}

                    />

                    <button

                      type="button"

                      onClick={handleSendOTP}

                      className={`w-full mt-5 py-3.5 sm:py-4 font-extrabold tracking-widest bg-gradient-to-r ${theme.fromDark} ${theme.viaStrong} ${theme.toDark} text-black hover:brightness-110 transition`}

                    >

                      SEND OTP

                    </button>

                  </>

                )}

                {step === 2 && (

                  <form onSubmit={handleResetSubmit(handleResetPassword)} className="space-y-4">

                    <h2 className={`text-xl font-black tracking-widest ${theme.textStrong} mb-2`}>SET NEW PASSWORD</h2>

                    <p className="text-xs text-gray-500 tracking-wider mb-4">

                      Enter the OTP you received and choose a new password.

                    </p>

                    <div>

                      <input

                        type="text"

                        inputMode="numeric"

                        maxLength={6}

                        autoComplete="one-time-code"

                        placeholder="ENTER OTP"

                        {...registerReset("otp")}

                        className={`w-full bg-black border border-white/10 px-4 py-3.5 sm:py-3 text-white text-base sm:text-sm tracking-[0.3em] focus:outline-none ${theme.focusBorder} transition-colors placeholder:text-gray-600 placeholder:tracking-normal`}

                      />

                      {resetErrors.otp && <p className={`${theme.textSoft} text-xs mt-1`}>{resetErrors.otp.message}</p>}

                    </div>

                    <div>

                      <input

                        type="password"

                        placeholder="NEW PASSWORD"

                        autoComplete="new-password"

                        {...registerReset("newPassword")}

                        className={`w-full bg-black border border-white/10 px-4 py-3.5 sm:py-3 text-white text-base sm:text-sm focus:outline-none ${theme.focusBorder} transition-colors placeholder:text-gray-600`}

                      />

                      {resetErrors.newPassword && <p className={`${theme.textSoft} text-xs mt-1`}>{resetErrors.newPassword.message}</p>}

                    </div>

                    <div>

                      <input

                        type="password"

                        placeholder="CONFIRM PASSWORD"

                        autoComplete="new-password"

                        {...registerReset("confirmNewPassword")}

                        className={`w-full bg-black border border-white/10 px-4 py-3.5 sm:py-3 text-white text-base sm:text-sm focus:outline-none ${theme.focusBorder} transition-colors placeholder:text-gray-600`}

                      />

                      {resetErrors.confirmNewPassword && <p className={`${theme.textSoft} text-xs mt-1`}>{resetErrors.confirmNewPassword.message}</p>}

                    </div>

                    <button

                      type="submit"

                      disabled={isResetSubmitting}

                      className={`w-full py-3.5 sm:py-4 font-extrabold tracking-widest bg-gradient-to-r ${theme.fromDark} ${theme.viaStrong} ${theme.toDark} text-black hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed`}

                    >

                      {isResetSubmitting ? "RESETTING..." : "RESET PASSWORD"}

                    </button>

                  </form>

                )}

                <button

                  type="button"

                  onClick={() => {

                    setForgotOpen(false);

                    setStep(1);

                    resetForm();

                  }}

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