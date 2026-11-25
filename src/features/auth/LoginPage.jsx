import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Globe,
  ArrowLeft,
  MailCheck,
  RefreshCw,
  Loader2,
} from "lucide-react";
import emailjs from "@emailjs/browser";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../shared/lib/firebase";

const USER_STORAGE_KEY = "eventpulse_public_user";

const EMAILJS_SERVICE_ID = "service_30m1xpe";
const EMAILJS_TEMPLATE_ID = "template_kw9vgtj";
const EMAILJS_PUBLIC_KEY = "OWORvgBWI8FytyVi0";

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function LoginPage() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState("credentials"); // 'credentials' | 'verify'

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [generatedCode, setGeneratedCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const [lang, setLang] = useState("ქარ");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const saveSessionAndRedirect = (userData) => {
    const sessionPayload = {
      id: userData.id,
      name: userData.name,
      contact: userData.email,
      email: userData.email,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionPayload));
    window.dispatchEvent(new Event("ep-user-updated"));
    navigate("/profile");
  };

  const sendVerificationEmail = async (recipientEmail, recipientName, code) => {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: recipientEmail,
        to_name: recipientName,
        code: code,
      },
      { publicKey: EMAILJS_PUBLIC_KEY },
    );
  };

  // ნაბიჯი 1: შესვლა ან რეგისტრაციის კოდის გაგზავნა
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    const trimmedPassword = password.trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("შეიყვანეთ სწორი ელ-ფოსტის მისამართი");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან");
      return;
    }

    if (isRegister && trimmedName.length < 2) {
      setError("შეიყვანეთ სახელი და გვარი");
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", normalizedEmail));
      const snapshot = await getDocs(q);

      if (isRegister) {
        if (!snapshot.empty) {
          setError("ეს ელ-ფოსტა უკვე რეგისტრირებულია. გაიარეთ ავტორიზაცია.");
          setLoading(false);
          return;
        }

        const code = generateOtpCode();
        await sendVerificationEmail(normalizedEmail, trimmedName, code);

        setGeneratedCode(code);
        setEnteredCode("");
        setResendTimer(60);
        setStep("verify");
        setInfoMessage(
          `დადასტურების 6-ნიშნა კოდი გაიგზავნა მისამართზე: ${normalizedEmail}`,
        );
      } else {
        if (snapshot.empty) {
          setError("ამ ელ-ფოსტით ანგარიში ვერ მოიძებნა");
          setLoading(false);
          return;
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        if (userData.password !== trimmedPassword) {
          setError("ელ-ფოსტა ან პაროლი არასწორია");
          setLoading(false);
          return;
        }

        saveSessionAndRedirect({
          id: userDoc.id,
          name: userData.name,
          email: userData.email,
        });
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(
        err?.text ||
          err?.message ||
          "შეცდომა სერვერთან დაკავშირებისას. სცადეთ თავიდან.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ნაბიჯი 2: მეილზე მიღებული კოდის შემოწმება და Firebase-ში შენახვა
  const handleVerifyCodeSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanInput = enteredCode.trim();
    if (cleanInput !== generatedCode) {
      setError("შეყვანილი კოდი არასწორია. შეამოწმეთ მეილი და სცადეთ თავიდან.");
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedName = fullName.trim();

      const docRef = await addDoc(collection(db, "users"), {
        name: trimmedName,
        email: normalizedEmail,
        password: password.trim(),
        emailVerified: true,
        provider: "email",
        createdAt: serverTimestamp(),
      });

      saveSessionAndRedirect({
        id: docRef.id,
        name: trimmedName,
        email: normalizedEmail,
      });
    } catch (err) {
      console.error("Firestore save error:", err);
      setError("მონაცემების შენახვა ვერ მოხერხდა Firebase-ში.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || loading) return;
    setError("");
    setLoading(true);
    try {
      const newCode = generateOtpCode();
      await sendVerificationEmail(
        email.trim().toLowerCase(),
        fullName.trim(),
        newCode,
      );
      setGeneratedCode(newCode);
      setEnteredCode("");
      setResendTimer(60);
      setInfoMessage("ახალი კოდი გაიგზავნა თქვენს ელ-ფოსტაზე.");
    } catch {
      setError("კოდის ხელახლა გაგზავნა ვერ მოხერხდა.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAuth = async (provider) => {
    setError("");
    setLoading(true);
    try {
      const demoEmail = `giorgi.${provider.toLowerCase()}@eventpulse.ge`;
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", demoEmail));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const existing = snapshot.docs[0];
        saveSessionAndRedirect({
          id: existing.id,
          ...existing.data(),
        });
      } else {
        const docRef = await addDoc(usersRef, {
          name: "გიორგი კენჭუაშვილი",
          email: demoEmail,
          emailVerified: true,
          provider,
          createdAt: serverTimestamp(),
        });
        saveSessionAndRedirect({
          id: docRef.id,
          name: "გიორგი კენჭუაშვილი",
          email: demoEmail,
        });
      }
    } catch {
      setError("ავტორიზაცია ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
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

          {step === "verify" ? (
            <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
              <div className="text-center space-y-1.5 pb-1">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <MailCheck className="w-5 h-5" />
                </div>
                <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  ელ-ფოსტის დადასტურება
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  შეიყვანეთ 6-ნიშნა კოდი, რომელიც გამოიგზავნა მისამართზე{" "}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {email}
                  </span>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  value={enteredCode}
                  onChange={(e) =>
                    setEnteredCode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="000000"
                  className="w-full h-12 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-center font-mono-num text-xl font-extrabold tracking-[0.45em] text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600 transition"
                />
              </div>

              {error && (
                <p className="text-xs text-rose-500 text-center">{error}</p>
              )}
              {infoMessage && !error && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center">
                  {infoMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || enteredCode.length !== 6}
                className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-400 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>დადასტურება და შესვლა</span>
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setError("");
                    setInfoMessage("");
                  }}
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
                >
                  ← უკან დაბრუნება
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleResendCode}
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 disabled:text-zinc-400 font-semibold hover:underline cursor-pointer disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>
                    {resendTimer > 0
                      ? `ხელახლა გაგზავნა (${resendTimer}წმ)`
                      : "კოდის ხელახლა გაგზავნა"}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
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
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ელ-ფოსტა"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-indigo-600 transition"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="პაროლი (მინ. 6 სიმბოლო)"
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

                {error && (
                  <p className="text-xs text-rose-500 pt-0.5">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isRegister ? "კოდის გაგზავნა" : "შესვლა"}</span>
                </button>
              </form>

              {/* სოციალური შესვლის 3 ღილაკი */}
              <div className="grid grid-cols-3 gap-2.5 mt-4">
                <button
                  type="button"
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
            </>
          )}

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
