import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { loginRequest } from "../api/auth.api";
import { ROLE_MAP } from "../utils/roleMap";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

const schema = z.object({
  identifier: z.string().min(3, "Email or phone is required"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

export default function Login() {
  const [role, setRole] = useState("admin");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
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

      await loginRequest(config.endpoint, payload);

      toast.success(`${config.label} logged in successfully`);
      navigate(config.redirect);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Invalid credentials"
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div>
              <label className="block text-[10px] font-bold tracking-[0.25em] text-gray-500 mb-2">
                EMAIL / PHONE
              </label>
              <input
                type="text"
                placeholder="Enter credentials"
                {...register("identifier")}
                className="
                  w-full bg-black border border-white/10 px-4 py-3 text-sm
                  text-white placeholder-gray-600
                  focus:border-red-600 focus:ring-1 focus:ring-red-600/40
                  outline-none transition
                "
              />
              {errors.identifier && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.25em] text-gray-500 mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="
                  w-full bg-black border border-white/10 px-4 py-3 text-sm
                  text-white placeholder-gray-600
                  focus:border-red-600 focus:ring-1 focus:ring-red-600/40
                  outline-none transition
                "
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
              className="
                relative w-full py-4 font-extrabold tracking-widest
                bg-gradient-to-r from-red-700 via-red-600 to-red-700
                text-black
                hover:brightness-110 transition
                disabled:opacity-50
                shadow-[0_0_30px_rgba(255,0,0,0.45)]
              "
            >
              {isSubmitting ? "AUTHORIZING..." : "ENTER THE GYM"}
            </button>
          </form>

          <p className="mt-6 sm:mt-8 text-center text-[10px] tracking-widest text-gray-600">
            UNAUTHORIZED ACCESS IS PROHIBITED
          </p>
        </div>
      </div>
    </div>
  );
}
