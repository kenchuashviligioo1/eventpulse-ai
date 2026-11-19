import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Lock, AlertCircle, ArrowRight } from "lucide-react";
import { useEventStore } from "../../store/useEventStore";

const loginSchema = yup.object({
  username: yup.string().trim().required("მომხმარებლის სახელი სავალდებულოა"),
  password: yup.string().required("პაროლი სავალდებულოა"),
});

export function ScannerLogin() {
  const loginScanner = useEventStore((state) => state.loginScanner);
  const [authError, setAuthError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = (data) => {
    setAuthError("");
    // ორგანიზატორის სპეციალური მონაცემები
    if (data.username === "admin" && data.password === "event2026") {
      loginScanner();
    } else {
      setAuthError("არასწორი მომხმარებლის სახელი ან პაროლი");
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white pt-1">
            ორგანიზატორის პანელი
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            შეიყვანეთ სპეციალური წვდომის მონაცემები კარის სკანერისა და AI
            ფასების სამართავად.
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              მომხმარებელი
            </label>
            <input
              type="text"
              placeholder="admin"
              {...register("username")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
            />
            {errors.username && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              პაროლი
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
            />
            {errors.password && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>შესვლა</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
          <span>სატესტო წვდომა:</span>
          <span className="font-mono-num text-zinc-600 dark:text-zinc-300">
            admin / event2026
          </span>
        </div>
      </div>
    </div>
  );
}
