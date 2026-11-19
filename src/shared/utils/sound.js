export function playScanBeep(isValid) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (isValid) {
      // ვალიდური ბილეთი: სუფთა მაღალი "პიპ-პიპ" სიგნალი (880Hz -> 1175Hz)
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.09);

      gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.25);
    } else {
      // არავალიდური / გამოყენებული ბილეთი: დაბალი გამაფრთხილებელი ზუმერი (220Hz)
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(220, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.35);

      gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.35);
    }
  } catch {
    // თუ ბრაუზერმა ხმა დაბლოკა, აპლიკაცია არ გაჩერდეს
  }
}
