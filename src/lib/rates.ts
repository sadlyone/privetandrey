export async function fetchKrwToUsd(): Promise<number> {
  try {
    const r = await fetch('https://api.exchangerate.host/latest?base=KRW&symbols=USD', { cache: 'no-store' });
    if (!r.ok) throw 0;
    const j = await r.json();
    const v = j?.rates?.USD;
    return typeof v === 'number' && isFinite(v) ? v : 0.00074;
  } catch {
    return 0.00074;
  }
}

export async function fetchUsdToRub(): Promise<number> {
  try {
    const r = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=RUB', { cache: 'no-store' });
    if (!r.ok) throw 0;
    const j = await r.json();
    const v = j?.rates?.RUB;
    return typeof v === 'number' && isFinite(v) ? v : 90;
  } catch {
    return 90;
  }
}
