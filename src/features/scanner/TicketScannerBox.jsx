import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  Search,
  RotateCcw,
} from "lucide-react";
import { useEventStore } from "../../store/useEventStore";

export function TicketScannerBox() {
  const tickets = useEventStore((state) => state.tickets);
  const markTicketUsed = useEventStore((state) => state.markTicketUsed);

  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanResult, setScanResult] = useState(null); // { status: 'valid' | 'used' | 'expired' | 'invalid', message, ticket? }

  const scannerRef = useRef(null);

  // ბილეთის ვალიდაციის მთავარი ლოგიკა
  const verifyPayload = (rawInput) => {
    const cleaned = rawInput.trim();
    if (!cleaned) return;

    // QR კოდის ფორმატია "EP-123456:58943210" (კოდი + 30-წამიანი სლოტი), ხელით შეყვანისას კი მხოლოდ "EP-123456"
    const [ticketCode, scannedSlotStr] = cleaned.split(":");
    const foundTicket = tickets.find(
      (t) => t.code.toUpperCase() === ticketCode.toUpperCase()
    );

    if (!foundTicket) {
      setScanResult({
        status: "invalid",
        message: "ბილეთი ბაზაში ვერ მოიძებნა (არავალიდური კოდი)",
      });
      return;
    }

    // თუ QR კამერით დასკანერდა, ვამოწმებთ 30-წამიან დინამიკურ ფანჯარას (ვაძლევთ 1 სლოტის ცდომილებას დაყოვნებისთვის)
    if (scannedSlotStr) {
      const currentSlot = Math.floor(Date.now() / 30000);
      const scannedSlot = Number(scannedSlotStr);
      if (Math.abs(currentSlot - scannedSlot) > 1) {
        setScanResult({
          status: "expired",
          message:
            "QR კოდს ვადა გაუვიდა! სავარაუდო სქრინშოტი — სთხოვეთ ცოცხალი საშვის ჩვენება.",
          ticket: foundTicket,
        });
        return;
      }
    }

    if (foundTicket.used) {
      setScanResult({
        status: "used",
        message: `ბილეთი უკვე გამოყენებულია (${foundTicket.scannedAt}-ზე)!`,
        ticket: foundTicket,
      });
      return;
    }

    // წარმატებული ვალიდაცია -> ვნიშნავთ გამოყენებულად
    markTicketUsed(foundTicket.code);
    setScanResult({
      status: "valid",
      message: "ბილეთი ვალიდურია • სტუმარი დაშვებულია",
      ticket: foundTicket,
    });
  };

  // კამერის ჩართვა/გამორთვა
  useEffect(() => {
    if (!cameraActive) return;

    setCameraError("");
    const html5QrCode = new Html5Qrcode("qr-reader-region");
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          verifyPayload(decodedText);
          setCameraActive(false);
        },
        () => {}
      )
      .catch(() => {
        setCameraError(
          "კამერაზე წვდომა ვერ მოხერხდა. გამოიყენეთ კოდის ხელით შეყვანა."
        );
        setCameraActive(false);
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [cameraActive]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    verifyPayload(manualCode);
    setManualCode("");
  };

  const scannedCount = tickets.filter((t) => t.used).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* მარცხენა ბლოკი: სკანერი და კოდის შეყვანა */}
      <div className="rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              ბილეთის შემოწმება
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              დაასკანერეთ დინამიკური QR ან შეიყვანეთ ბილეთის ID
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-zinc-400 block">
              შემოსული სტუმრები
            </span>
            <span className="font-mono-num text-sm font-bold text-zinc-900 dark:text-white">
              {scannedCount} / {tickets.length}
            </span>
          </div>
        </div>

        {/* კამერის არეალი */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 flex flex-col items-center justify-center min-h-[240px]">
          {cameraActive ? (
            <div
              id="qr-reader-region"
              className="w-full max-w-[280px] overflow-hidden rounded-lg"
            />
          ) : (
            <div className="text-center space-y-3 py-6">
              <div className="w-12 h-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center mx-auto text-zinc-500">
                <Camera className="w-5 h-5" />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                ჩართეთ კამერა სმარტფონის ეკრანიდან QR კოდის წასაკითხად
              </p>
            </div>
          )}

          {cameraError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 text-center">
              {cameraError}
            </p>
          )}

          <button
            type="button"
            onClick={() => setCameraActive((prev) => !prev)}
            className="mt-3 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-900 dark:hover:border-white text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-2 transition cursor-pointer"
          >
            {cameraActive ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                <span>კამერის გამორთვა</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>კამერის ჩართვა</span>
              </>
            )}
          </button>
        </div>

        {/* ხელით შეყვანის ფორმა */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            ბილეთის კოდით შემოწმება
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="მაგ. EP-482910"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white font-mono-num uppercase focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>შემოწმება</span>
            </button>
          </div>
        </form>
      </div>

      {/* მარჯვენა ბლოკი: სკანირების შედეგი */}
      <div className="rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              ვალიდაციის სტატუსი
            </h2>
            {scanResult && (
              <button
                onClick={() => setScanResult(null)}
                className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>გასუფთავება</span>
              </button>
            )}
          </div>

          {!scanResult ? (
            <div className="py-16 text-center text-xs text-zinc-400 dark:text-zinc-500">
              მოლოდინის რეჟიმი — დაასკანერეთ ბილეთი შედეგის სანახავად
            </div>
          ) : (
            <div
              className={`mt-6 p-6 rounded-2xl border-[1.5px] space-y-4 ${
                scanResult.status === "valid"
                  ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-500/10"
                  : "border-rose-300 dark:border-rose-500/40 bg-rose-50/70 dark:bg-rose-500/10"
              }`}
            >
              <div className="flex items-start gap-3">
                {scanResult.status === "valid" ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <div>
                  <h3
                    className={`text-base font-bold ${
                      scanResult.status === "valid"
                        ? "text-emerald-900 dark:text-emerald-200"
                        : "text-rose-900 dark:text-rose-200"
                    }`}
                  >
                    {scanResult.status === "valid"
                      ? "დაშვებულია"
                      : "უარყოფილია"}
                  </h3>
                  <p
                    className={`text-xs mt-1 ${
                      scanResult.status === "valid"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {scanResult.message}
                  </p>
                </div>
              </div>

              {scanResult.ticket && (
                <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-70">სტუმარი:</span>
                    <span className="font-semibold">
                      {scanResult.ticket.ownerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">ღონისძიება:</span>
                    <span className="font-semibold">
                      {scanResult.ticket.eventTitle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">ბილეთის ID:</span>
                    <span className="font-mono-num font-bold">
                      {scanResult.ticket.code}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ბოლო ბილეთების სწრაფი სია ტესტირებისთვის */}
        {tickets.length > 0 && (
          <div className="pt-5 mt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
              გაყიდული ბილეთები (სწრაფი ტესტი)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tickets.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => verifyPayload(t.code)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono-num transition cursor-pointer ${
                    t.used
                      ? "border-zinc-200 dark:border-zinc-800 text-zinc-400 line-through"
                      : "border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-zinc-900 dark:hover:border-white"
                  }`}
                >
                  {t.code}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
