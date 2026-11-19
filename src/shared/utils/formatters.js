export function formatPrice(amount) {
  return `${Number(amount).toFixed(2)} ₾`;
}

export function calculateDynamicPrice(basePrice, demandLevel) {
  if (demandLevel <= 30) {
    return {
      price: +(basePrice * 0.85).toFixed(2),
      isDiscounted: true,
      badgeText: "Smart Drop • -15%",
      isHighDemand: false,
    };
  }
  if (demandLevel >= 75) {
    return {
      price: +(basePrice * 1.2).toFixed(2),
      isDiscounted: false,
      badgeText: null,
      isHighDemand: true,
    };
  }
  return {
    price: basePrice,
    isDiscounted: false,
    badgeText: null,
    isHighDemand: false,
  };
}
