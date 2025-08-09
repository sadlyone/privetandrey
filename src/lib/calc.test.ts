import { describe, expect, it } from 'vitest'
import { calcPriceUsd, calcRub, calcTotal } from './calc'

describe('calc helpers', () => {
  it('calculates usd and rub prices', () => {
    expect(calcPriceUsd(1_000_000, 0.00074)).toBeCloseTo(740)
    expect(calcRub(100, 90)).toBe(9000)
  })

  it('computes total breakdown', () => {
    const res = calcTotal({
      priceKrw: 15_000_000,
      krwUsd: 0.00074,
      usdRub: 90,
      freightUsd: 1440,
      customsRub: 500_000,
      brokerRub: 110_000,
      truckRub: 220_000,
    })
    expect(res.priceUsd).toBeCloseTo(11_100, 2)
    expect(res.carRub).toBeCloseTo(999_000, 2)
    expect(res.freightRub).toBeCloseTo(129_600, 2)
    expect(res.totalRub).toBeCloseTo(1_958_600, 0)
  })
})
