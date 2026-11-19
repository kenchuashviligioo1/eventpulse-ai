// აბრუნებს მიმდინარე 30-წამიან ინტერვალს და დარჩენილ წამებს
export function getTimeWindow(offsetSlots = 0) {
  const nowSec = Math.floor(Date.now() / 1000);
  const slot = Math.floor(nowSec / 30) + offsetSlots;
  const secondsLeft = 30 - (nowSec % 30);
  return { slot, secondsLeft };
}

// აგენერირებს 30-წამიან ცვლად კოდს (მაგ: "EP-4829-731")
export function generateRollingTicketCode(baseCode, slot) {
  const seedStr = `${baseCode}-${slot}-EVENTPULSE_SECRET`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) % 1000;
  }
  const dynamicSuffix = String(Math.abs(hash)).padStart(3, "0");
  return `${baseCode}-${dynamicSuffix}`;
}

// აგენერირებს ბილეთის უნიკალურ საბაზისო ნომერს (მაგ: "EP-4829")
export function generateTicketBaseCode() {
  const randomBase = Math.floor(1000 + Math.random() * 9000);
  return `EP-${randomBase}`;
}
