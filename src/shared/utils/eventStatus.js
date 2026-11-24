export function getEventSaleStatus(event, now = Date.now()) {
  if (!event?.saleStartAt) {
    return { isLive: true, startsAtDate: null, formattedStart: "" };
  }

  const startTimestamp = new Date(event.saleStartAt).getTime();
  if (Number.isNaN(startTimestamp) || now >= startTimestamp) {
    return { isLive: true, startsAtDate: null, formattedStart: "" };
  }

  const startsAtDate = new Date(startTimestamp);
  const formattedStart = startsAtDate.toLocaleString("ka-GE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    isLive: false,
    startsAtDate,
    formattedStart,
  };
}
