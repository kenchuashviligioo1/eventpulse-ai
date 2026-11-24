import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Calendar,
  MapPin,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { Badge } from "../../shared/components/Badge";
import { formatPrice } from "../../shared/utils/formatters";
import {
  generateRollingTicketCode,
  getTimeWindow,
} from "../../shared/utils/dynamicCode";

export function DynamicTicketCard({ ticket }) {
  const [timeState, setTimeState] = useState(() => getTimeWindow());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ticket.used) return;

    const interval = setInterval(() => {
      setTimeState(getTimeWindow());
    }, 1000);

    return () => clearInterval(interval);
  }, [ticket.used]);

  // ყოველ 30 წამში იცვლება როგორც QR კოდი, ისე ეკრანზე ნაჩვენები ბილეთის კოდი
  const currentRollingCode = generateRollingTicketCode(
    ticket.baseCode,
    timeState.slot
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentRollingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const progressPercent = (timeState.secondsLeft / 30) * 100;

  return (
    <div className="rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* მარცხენა ნაწილი: ბილეთის ინფორმაცია და კატეგორია */}
      <div className="p-6 flex-1 flex flex-col justify-between gap-6 border-b md:border-b-0 md:border-r border-dashed border-zinc-300 dark:border-zinc-700">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {ticket.used ? (
                <Badge variant="default">
                  გამოყენებულია ({ticket.scannedAt})
                </Badge>
              ) : (
                <Badge variant="success">აქტიური საშვი</Badge>
              )}
              <Badge variant="warning">{ticket.tierName || "Standard"}</Badge>
            </div>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono-num shrink-0">
              {ticket.paidPrice === 0
                ? "უფასო / Pass"
                : formatPrice(ticket.paidPrice)}
            </span>
          </div>

          <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-snug">
            {ticket.eventTitle}
          </h3>

          <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>{ticket.eventDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>{ticket.eventLocation}</span>
            </div>
          </div>
        </div>

        {/* მფლობელის დეტალები და 30-წამიანი კოდი */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-zinc-400 dark:text-zinc-500 block">
              მფლობელი
            </span>
            <span className="font-semibold text-zinc-900 dark:text-white mt-0.5 block">
              {ticket.ownerName}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 dark:text-zinc-500 block">
              დინამიკური ID
            </span>
            <button
              onClick={handleCopyCode}
              title="მიმდინარე 30-წამიანი კოდის კოპირება"
              className="mt-0.5 inline-flex items-center gap-1.5 font-mono-num font-bold text-zinc-900 dark:text-white hover:opacity-75 cursor-pointer"
            >
              <span>{ticket.used ? ticket.baseCode : currentRollingCode}</span>
              {!ticket.used &&
                (copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                ))}
            </button>
          </div>
        </div>
      </div>

      {/* მარჯვენა ნაწილი: 30-წამიანი დინამიკური QR */}
      <div className="p-6 md:w-72 bg-zinc-50/70 dark:bg-zinc-950/50 flex flex-col items-center justify-center text-center gap-3">
        <div
          className={`p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-xs transition-opacity ${
            ticket.used ? "opacity-30 grayscale" : ""
          }`}
        >
          <QRCodeSVG
            value={currentRollingCode}
            size={148}
            bgColor="#FFFFFF"
            fgColor="#09090B"
            level="M"
          />
        </div>

        {ticket.used ? (
          <p className="text-xs text-zinc-500 font-medium">
            ბილეთი უკვე დასკანერებულია შესასვლელში
          </p>
        ) : (
          <div className="w-full max-w-45 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <RefreshCw
                  className="w-3 h-3 animate-spin"
                  style={{ animationDuration: "4s" }}
                />
                კოდი და QR ახლდება
              </span>
              <span className="font-mono-num font-bold text-zinc-900 dark:text-white">
                {timeState.secondsLeft}წმ
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-zinc-900 dark:bg-white transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-1 pt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              სქრინშოტი არ მოქმედებს
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
