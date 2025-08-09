export function calcPriceUsd(priceKrw: number, krwUsd: number) {
  return priceKrw * krwUsd;
}

export function calcRub(usd: number, usdRub: number) {
  return usd * usdRub;
}

export function calcTotal(params: {
  priceKrw: number;
  krwUsd: number;
  usdRub: number;
  freightUsd: number;
  customsRub: number;
  brokerRub: number;
  truckRub: number;
}) {
  const priceUsd = calcPriceUsd(params.priceKrw, params.krwUsd);
  const carRub = calcRub(priceUsd, params.usdRub);
  const freightRub = calcRub(params.freightUsd, params.usdRub);
  const totalRub = Math.round(
    carRub + freightRub + params.customsRub + params.brokerRub + params.truckRub,
  );
  return { priceUsd, carRub, freightRub, totalRub };
}
