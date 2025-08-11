export async function fetchKrwToUsdt(): Promise<number> {
  try {
    const res = await fetch('https://api.exchangerate.host/latest?base=KRW&symbols=USD')
    const data = await res.json()
    const rate = data?.rates?.USD
    if (typeof rate !== 'number') throw new Error('No rate')
    return rate
  } catch {
    throw new Error('Failed to fetch KRW→USD')
  }
}

export async function fetchUsdToRub(): Promise<number> {
  try {
    const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=RUB')
    const data = await res.json()
    const rate = data?.rates?.RUB
    if (typeof rate !== 'number') throw new Error('No rate')
    return rate
  } catch {
    throw new Error('Failed to fetch USD→RUB')
  }
}
