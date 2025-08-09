export type EngineType = 'petrol' | 'diesel' | 'hybrid' | 'ev';

export type CustomsInput = {
  year: number;
  engineType: EngineType;
  displacementCc?: number;
  powerHp?: number;
  carUsd: number;
  usdToRub: number;
};

export type CustomsOutput = { totalRub: number; breakdown: Record<string, number> };

function dutyRate(cc: number, age: number) {
  const young = [
    { limit: 1000, rate: 1.5 },
    { limit: 1500, rate: 1.7 },
    { limit: 1800, rate: 2.5 },
    { limit: 2300, rate: 2.7 },
    { limit: 3000, rate: 3 },
    { limit: Infinity, rate: 5.7 },
  ];
  const old = [
    { limit: 1000, rate: 3 },
    { limit: 1500, rate: 3.2 },
    { limit: 1800, rate: 3.5 },
    { limit: 2300, rate: 4.8 },
    { limit: 3000, rate: 5 },
    { limit: Infinity, rate: 5.7 },
  ];
  const set = age > 5 ? old : young;
  return set.find((r) => cc <= r.limit)?.rate ?? 5.7;
}

export function calcCustoms(i: CustomsInput): CustomsOutput {
  const now = new Date().getFullYear();
  const age = Math.max(0, now - i.year);
  const priceRub = i.carUsd * i.usdToRub;

  let duty = 0;
  if (i.engineType === 'ev') {
    duty = 0;
  } else if (age < 3) {
    duty = priceRub * 0.15;
  } else {
    const rate = dutyRate(i.displacementCc ?? 0, age);
    duty = (i.displacementCc ?? 0) * rate * i.usdToRub;
  }

  let excise = 0;
  if (i.engineType !== 'ev') {
    const hp = i.powerHp ?? 0;
    if (hp > 150) excise = hp * 98;
    else if (hp > 90) excise = hp * 49;
  }

  const util = age < 3 ? 34800 : 52800;
  const vatBase = priceRub + duty + excise + util;
  const vat = vatBase * 0.2;

  const totalRub = Math.round(duty + excise + util + vat);
  const breakdown = {
    duty: Math.round(duty),
    excise: Math.round(excise),
    utilization: util,
    vat: Math.round(vat),
  };
  return { totalRub, breakdown };
}
