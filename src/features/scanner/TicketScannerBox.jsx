import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  Search,
  Volume2,
  VolumeX,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { useEventStore } from "../../store/useEventStore";
import { playScanBeep } from "../../shared/utils/sound";
import {
  generateRollingTicketCode,
  getTimeWindow,
} from "../../shared/utils/dynamicCode";

export function TicketScannerBox() {
  const tickets = useEventStore((state) => state.tickets);
  const markTicketUsed = useEventStore((state) => state.markTicketUsed);
  const logoutScanner = useEventStore((state) => state.logoutScanner);

  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [shouldResumeCamera, setShouldResumeCamera] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraError, setCameraError] = useState("");
  const [scanResult, setScanResult] = useState(null);

  const scannerRef = useRef(null);

  const verifyPayload = useCallback(
    async (rawInput, fromCamera = false) => {
      const cleaned = rawInput.trim().toUpperCase();
      if (!cleaned) return;

      setShouldResumeCamera(fromCamera);

      // კოდის ფორმატია "EP-4829-731" -> baseCode არის "EP-4829"
      const parts = cleaned.split("-");
      if (parts.length !== 3) {
        if (soundEnabled) playScanBeep(false);
        setScanResult({
          status: "invalid",
          title: "არავალიდური ფორმატი",
          message: "შეიყვანეთ სრული დინამიკური კოდი (მაგ. EP-4829-731)",
        });
        return;
      }

      const baseCode = `${parts[0]}-${parts[1]}`;
      const foundTicket = tickets.find((t) => t.baseCode === baseCode);

      if (!foundTicket) {
        if (soundEnabled) playScanBeep(false);
        setScanResult({
          status: "invalid",
          title: "არავალიდური ბილეთი",
          message: "ბილეთი ბაზაში ვერ მოიძებნა",
        });
        return;
      }

      // ვამოწმებთ მიმდინარე (და წინა 1 სლოტის) 30-წამიან დინამიკურ კოდს
      const { slot } = getTimeWindow();
      const validCurrentCode = generateRollingTicketCode(baseCode, slot);
      const validPreviousCode = generateRollingTicketCode(baseCode, slot - 1);

      if (cleaned !== validCurrentCode && cleaned !== validPreviousCode) {
        if (soundEnabled) playScanBeep(false);
        setScanResult({
          status: "expired",
          title: "კოდს ვადა გაუვიდა",
          message:
            "30-წამიანი ფანჯარა ამოიწურა — სთხოვეთ განახლებული კოდის ჩვენება.",
          ticket: foundTicket,
        });
        return;
      }

      if (foundTicket.used) {
        if (soundEnabled) playScanBeep(false);
        setScanResult({
          status: "used",
          title: "უკვე გამოყენებულია",
          message: `ბილეთი დასკანერდა ${foundTicket.scannedAt}-ზე`,
          ticket: foundTicket,
        });
        return;
      }

      // ბაზაში (Firebase Firestore) ვნიშნავთ გამოყენებულად
      await markTicketUsed(foundTicket.id);
      if (soundEnabled) playScanBeep(true);
      setScanResult({
        status: "valid",
        title: "დაშვებულია",
        message: "ბილეთი ვალიდურია • სტუმარს შეუძლია შესვლა",
        ticket: foundTicket,
      });
    },
    [tickets, markTicketUsed, soundEnabled]
  );

  const handleNextGuest = () => {
    setScanResult(null);
    if (shouldResumeCamera) {
      setCameraActive(true);
    }
  };

  const handleToggleCamera = () => {
    if (cameraActive) {
      setCameraActive(false);
      return;
    }

    if (!window.isSecureContext) {
      setCameraError(
        "ტელეფონის ბრაუზერი კამერას ბლოკავს HTTP-ზე. გახსენით HTTPS-ზე ან localhost-ზე."
      );
      return;
    }

    setCameraError("");
    setCameraActive(true);
  };

  useEffect(() => {
    if (!cameraActive) return;

    let isMounted = true;
    const html5QrCode = new Html5Qrcode("qr-reader-region");
    scannerRef.current = html5QrCode;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!isMounted) return;
        if (!devices || devices.length === 0) {
          setCameraError("მოწყობილობაზე კამერა ვერ მოიძებნა.");
          setCameraActive(false);
          return;
        }

        const backCamera = devices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("environment")
        );
        const cameraId = backCamera ? backCamera.id : devices[0].id;

        return html5QrCode.start(
          cameraId,
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            verifyPayload(decodedText, true);
            setCameraActive(false);
          },
          () => {}
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setCameraError(
          "კამერა დაბლოკილია ბრაუზერის მიერ. შეამოწმეთ კამერის ნებართვა."
        );
        setCameraActive(false);
      });

    return () => {
      isMounted = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [cameraActive, verifyPayload]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    verifyPayload(manualCode, false);
    setManualCode("");
  };

  const scannedCount = tickets.filter((t) => t.used).length;
  const isValidResult = scanResult?.status === "valid";

  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-4 sm:p-5 space-y-4">
          {/* ზედა კომპაქტური ზოლი: მრიცხველი + ხმა + გასვლა */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-mono-num text-xl font-bold text-zinc-900 dark:text-white">
                {scannedCount}/{tickets.length}
              </span>
              <span className="text-xs text-zinc-400">შემოსული</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSoundEnabled((prev) => !prev)}
                aria-label="ხმის გადართვა"
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition cursor-pointer"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              <button
                type="button"
                onClick={logoutScanner}
                aria-label="გასვლა"
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* კამერის არეალი */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 flex flex-col items-center justify-center min-h-62.5">
            {cameraActive ? (
              <div
                id="qr-reader-region"
                className="w-full max-w-67.5 overflow-hidden rounded-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 my-6">
                <Camera className="w-6 h-6" />
              </div>
            )}

            {cameraError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 text-center">
                {cameraError}
              </p>
            )}

            <button
              type="button"
              onClick={handleToggleCamera}
              className="mt-3 w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {cameraActive ? (
                <>
                  <CameraOff className="w-4 h-4" />
                  <span>კამერის გამორთვა</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>კამერის ჩართვა</span>
                </>
              )}
            </button>
          </div>

          {/* კოდის ხელით შეყვანა */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="EP-4829-731"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white font-mono-num uppercase focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
            />
            <button
              type="submit"
              aria-label="შემოწმება"
              className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-900 dark:hover:border-white text-zinc-900 dark:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* სრულეკრანიანი (Fullscreen) შედეგი */}
      {scanResult && (
        <div
          className={`fixed inset-0 z-50 h-dvh overflow-hidden flex flex-col justify-between p-6 sm:p-10 text-white ${
            isValidResult ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest opacity-85">
            <span>EventPulse</span>
            <span className="font-mono-num">
              {new Date().toLocaleTimeString("ka-GE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="max-w-md w-full mx-auto text-center space-y-5 my-auto">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto">
              {isValidResult ? (
                <CheckCircle2 className="w-14 h-14 text-white" />
              ) : (
                <XCircle className="w-14 h-14 text-white" />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {scanResult.title}
              </h2>
              <p className="text-sm sm:text-base text-white/90">
                {scanResult.message}
              </p>
            </div>

            {scanResult.ticket && (
              <div className="mt-6 p-5 rounded-2xl bg-black/20 border border-white/20 text-left space-y-2.5 text-sm">
                <div className="flex justify-between items-center gap-4 pb-2.5 border-b border-white/15">
                  <span className="text-white/70">კატეგორია:</span>
                  <span className="px-3 py-1 rounded-lg bg-white text-zinc-950 font-extrabold uppercase tracking-wider text-xs">
                    {scanResult.ticket.tierName || "Standard"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/70">სტუმარი:</span>
                  <span className="font-bold text-right">
                    {scanResult.ticket.ownerName}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/70">ღონისძიება:</span>
                  <span className="font-semibold text-right line-clamp-1">
                    {scanResult.ticket.eventTitle}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/70">ბილეთის ID:</span>
                  <span className="font-mono-num font-bold">
                    {scanResult.ticket.baseCode}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="max-w-md w-full mx-auto">
            <button
              type="button"
              onClick={handleNextGuest}
              className="w-full py-4 px-6 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.99] text-base font-bold flex items-center justify-center gap-2 shadow-xl transition cursor-pointer"
            >
              <span>შემდეგი სტუმარი</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
