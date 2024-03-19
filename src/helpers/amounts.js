export function claimedAmount(r) {
  const { qtyProvided, priceAsked } = r;
  return qtyProvided && priceAsked ? qtyProvided * Number(priceAsked) : 0;
}

export function approvedAmount(r) {
  if (r.status === 2) return 0;
  const qty = r.qtyApproved ?? r.qtyProvided;
  const price = r.priceApproved ?? r.priceAsked;
  return qty * Number(price);
}
