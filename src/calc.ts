export interface Inputs {
  priceKrw: number
  rateKrwToUsdt: number
  rateUsdtToRub: number
  freightUsd: number
  customsRub: number
  brokerRub: number
  truckRub: number
}

export interface Breakdown {
  priceUsd: number
  freightRub: number
  carRub: number
  totalRub: number
}

function round(value: number, decimals = 2) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals
}

export function calcTotal(i: Inputs): Breakdown {
  const priceUsd = i.priceKrw * i.rateKrwToUsdt
  const freightRub = i.freightUsd * i.rateUsdtToRub
  const carRub = priceUsd * i.rateUsdtToRub
  const totalRub = carRub + i.customsRub + freightRub + i.brokerRub + i.truckRub
  return {
    priceUsd: round(priceUsd, 2),
    freightRub: round(freightRub, 2),
    carRub: round(carRub, 2),
    totalRub: round(totalRub, 2),
  }
}
