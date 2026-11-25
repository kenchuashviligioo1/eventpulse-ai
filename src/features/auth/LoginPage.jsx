import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Globe, ArrowLeft } from "lucide-react";
import { useEventStore } from "../../store/useEventStore";

const USER_STORAGE_KEY = "eventpulse_public_user";

export function LoginPage() {
  const navigate = useNavigate();
  const tickets = useEventStore((state) => state.tickets);

  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lang, setLang] = useState("ქარ");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const completeLogin = (nameValue, contactValue) => {
    const trimmedContact = contactValue.trim();
    const trimmedName = nameValue.trim();

    if (!trimmedContact || trimmedContact.length < 5) {
      setError("შეიყვანეთ ელ-ფოსტა ან მობილურის ნომერი");
      return;
    }

    if (!isRegister && password.trim().length < 4) {
      setError("შეიყვანეთ პაროლი (მინიმუმ 4 სიმბოლო)");
      return;
    }

    const matchedTicket = tickets.find(
      (t) =>
        t.ownerPhone?.toLowerCase() === trimmedContact.toLowerCase() ||
        t.ownerEmail?.toLowerCase() === trimmedContact.toLowerCase(),
    );

    const userPayload = {
      name: trimmedName || matchedTicket?.ownerName || "გიორგი კენჭუაშვილი",
      contact: trimmedContact,
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userPayload));
    window.dispatchEvent(new Event("ep-user-updated"));
    navigate("/profile");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    completeLogin(fullName, identifier);
  };

  const handleQuickAuth = (provider) => {
    setError("");
    setInfoMessage("");
    const demoUser = {
      name: "გიორგი კენჭუაშვილი",
      contact: `597-13-23-21 (${provider})`,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(demoUser));
    window.dispatchEvent(new Event("ep-user-updated"));
    navigate("/profile");
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim()) {
      setError("პაროლის აღსადგენად ჯერ მიუთითეთ ელ-ფოსტა ან მობილურის ნომერი");
      return;
    }
    setInfoMessage("აღდგენის ინსტრუქცია გამოიგზავნა მითითებულ მისამართზე.");
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between bg-[#0B1226] text-white overflow-hidden">
      {/* წერტილოვანი ბადე და დახრილი კონტურები */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(rgba(129, 140, 248, 0.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="pointer-events-none absolute -left-24 top-1/4 w-80 h-80 rounded-3xl border border-indigo-400/15 rotate-12" />
      <div className="pointer-events-none absolute -left-14 top-1/4 w-80 h-80 rounded-3xl border border-indigo-400/10 rotate-24" />
      <div className="pointer-events-none absolute -right-20 bottom-12 w-96 h-64 rounded-3xl border border-indigo-400/15 -rotate-12" />
      <div className="pointer-events-none absolute right-24 -top-16 w-72 h-72 rounded-2xl border border-white/[0.06] rotate-45" />

      {/* ზედა ზოლი */}
      <div className="relative z-10 w-full px-6 sm:px-10 py-5 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>მთავარი</span>
        </Link>

        <button
          type="button"
          onClick={() => setLang((prev) => (prev === "ქარ" ? "ENG" : "ქარ"))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-200 transition cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>{lang}</span>
        </button>
      </div>

      {/* ცენტრალური ბარათი */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[440px] rounded-xl bg-white dark:bg-[#14161F] text-zinc-900 dark:text-white shadow-2xl px-7 sm:px-10 py-9">
          {/* EventPulse ლოგო */}
          <div className="flex items-center justify-center mb-7">
            <img
              src="/EventPulse-logo-black.png"
              alt="EventPulse"
              className="h-11 w-auto object-contain"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="სახელი და გვარი"
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-indigo-600 transition"
                />
              </div>
            )}

            <div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ელ-ფოსტა / მობილურის ნომერი"
                className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="პაროლი"
                className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-indigo-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="პაროლის ჩვენება"
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {!isRegister && (
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  პაროლის აღდგენა
                </button>
              </div>
            )}

            {error && <p className="text-xs text-rose-500 pt-0.5">{error}</p>}
            {infoMessage && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 pt-0.5">
                {infoMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-11 mt-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              {isRegister ? "რეგისტრაცია" : "შესვლა"}
            </button>
          </form>

          {/* სოციალური შესვლის 3 ღილაკი რეალური ბრენდ-ლოგოებით */}
          <div className="grid grid-cols-3 gap-2.5 mt-4">
            <button
              type="button"
              onClick={() => handleQuickAuth("Google")}
              aria-label="Google შესვლა"
              className="h-10 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-4 h-4 object-contain"
              />
            </button>

            <button
              type="button"
              onClick={() => handleQuickAuth("Facebook")}
              aria-label="Facebook შესვლა"
              className="h-10 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
            >
              <img
                src="https://cdn.simpleicons.org/facebook/1877F2"
                alt="Facebook"
                className="w-4 h-4 object-contain"
              />
            </button>

            <button
              type="button"
              onClick={() => handleQuickAuth("Apple")}
              aria-label="Apple შესვლა"
              className="h-10 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
            >
              <img
                src="https://cdn.simpleicons.org/apple/000000"
                alt="Apple"
                className="w-4 h-4 object-contain dark:invert"
              />
            </button>
          </div>

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
            {isRegister ? "უკვე გაქვს ანგარიში? " : "არ გაქვს ანგარიში? "}
            <button
              type="button"
              onClick={() => {
                setIsRegister((prev) => !prev);
                setError("");
                setInfoMessage("");
              }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
            >
              {isRegister ? "შედი" : "შექმენი"}
            </button>
          </p>

          <div className="mt-7 pt-5 border-t border-zinc-100 dark:border-zinc-800 text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-indigo-600 dark:text-indigo-400">
              <span className="w-4 h-4 rounded-full border-2 border-indigo-600 dark:border-indigo-400 inline-block" />
              <span>EVENTPULSE ID</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              ერთი ანგარიში ბილეთებისა და ციფრული საშვებისთვის
            </p>
          </div>
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}

export default LoginPage;
