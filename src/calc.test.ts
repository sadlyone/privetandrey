import { describe, it, expect } from 'vitest'
import { calcTotal } from './calc'

describe('calcTotal', () => {
  it('computes totals with rounding', () => {
    const inputs = {
      priceKrw: 15_000_000,
      rateKrwToUsdt: 0.00074,
      rateUsdtToRub: 90,
      freightUsd: 1440,
      customsRub: 0,
      brokerRub: 110_000,
      truckRub: 220_000,
    }
    const result = calcTotal(inputs)
    expect(result.priceUsd).toBeCloseTo(11_100, 2)
    expect(result.carRub).toBeCloseTo(999_000, 2)
    expect(result.freightRub).toBeCloseTo(129_600, 2)
    expect(result.totalRub).toBeCloseTo(1_458_600, 2)
  })
})
