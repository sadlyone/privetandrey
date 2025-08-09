import { useEffect, useState } from 'react'
import { calcPriceUsd, calcRub, calcTotal } from './lib/calc'
import { calcCustoms, type CustomsOutput, type EngineType } from './lib/customs'
import { fetchKrwToUsd, fetchUsdToRub } from './lib/rates'

interface EncarData {
  priceKrw: number
  year: number
  engineType: EngineType
  displacementCc?: number
  powerHp?: number
  title?: string
  img?: string
}

interface State {
  url: string
  data?: EncarData
  krwUsd: number
  usdRub: number
  freightUsd: number
  brokerRub: number
  truckRub: number
}

const defaults: State = {
  url: '',
  krwUsd: 0.00074,
  usdRub: 90,
  freightUsd: 1440,
  brokerRub: 110000,
  truckRub: 220000,
}

export default function App() {
  const [state, setState] = useState<State>(() => {
    const fromLS = localStorage.getItem('calc-state')
    if (fromLS) return { ...defaults, ...JSON.parse(fromLS) }
    const params = new URLSearchParams(location.search)
    const s: any = { ...defaults }
    params.forEach((v, k) => {
      if (k in s) s[k] = typeof (s as any)[k] === 'number' ? Number(v) : v
    })
    return s
  })
  const [customs, setCustoms] = useState<CustomsOutput | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('calc-state', JSON.stringify(state))
  }, [state])

  const handleCalc = async () => {
    setError(null)
    try {
      const encarUrl = `/api/encar?url=${encodeURIComponent(state.url)}`
      const [encarRes, krwRate, usdRate] = await Promise.all([
        fetch(encarUrl).then((r) => r.json()),
        fetchKrwToUsd(),
        fetchUsdToRub(),
      ])
      if (!encarRes.ok) throw new Error(encarRes.error || 'parse failed')
      const data: EncarData = encarRes.data
      const priceKrw = data.priceKrw
      const krwUsd = krwRate
      const usdRub = usdRate
      const priceUsd = calcPriceUsd(priceKrw, krwUsd)
      const customsRes = calcCustoms({
        year: data.year,
        engineType: data.engineType,
        displacementCc: data.displacementCc,
        powerHp: data.powerHp,
        carUsd: priceUsd,
        usdToRub: usdRub,
      })
      setState((s) => ({
        ...s,
        data,
        krwUsd,
        usdRub,
      }))
      setCustoms(customsRes)
    } catch (e: any) {
      setError(e.message || 'Ошибка')
    }
  }

  const priceUsd = state.data ? calcPriceUsd(state.data.priceKrw, state.krwUsd) : 0
  const carRub = calcRub(priceUsd, state.usdRub)
  const freightRub = calcRub(state.freightUsd, state.usdRub)
  const customsRub = customs?.totalRub ?? 0
  const total = calcTotal({
    priceKrw: state.data?.priceKrw || 0,
    krwUsd: state.krwUsd,
    usdRub: state.usdRub,
    freightUsd: state.freightUsd,
    customsRub,
    brokerRub: state.brokerRub,
    truckRub: state.truckRub,
  })

  const copyUsd = () => navigator.clipboard.writeText(priceUsd.toFixed(2))
  const share = () => {
    const params = new URLSearchParams()
    Object.entries(state).forEach(([k, v]) => params.set(k, String(v)))
    navigator.clipboard.writeText(window.location.origin + '?' + params.toString())
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="Encar URL"
          value={state.url}
          onChange={(e) => setState({ ...state, url: e.target.value })}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleCalc}>
          Посчитать
        </button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {state.data && (
        <div className="border p-4 rounded space-y-2">
          {state.data.img && <img src={state.data.img} alt="car" className="w-full" />}
          <div className="font-bold">{state.data.title}</div>
          <div>
            {state.data.year}, {state.data.engineType}
            {state.data.displacementCc && `, ${state.data.displacementCc}cc`}
            {state.data.powerHp && `, ${state.data.powerHp}hp`}
          </div>
          <div>Цена: {state.data.priceKrw.toLocaleString()} KRW</div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-2">
        <label>
          Курс KRW→USD
          <input
            type="number"
            className="w-full border p-1 rounded"
            value={state.krwUsd}
            onChange={(e) => setState({ ...state, krwUsd: Number(e.target.value) })}
          />
        </label>
        <label>
          Курс USD→RUB
          <input
            type="number"
            className="w-full border p-1 rounded"
            value={state.usdRub}
            onChange={(e) => setState({ ...state, usdRub: Number(e.target.value) })}
          />
        </label>
        <label>
          Фрахт USD
          <input
            type="number"
            className="w-full border p-1 rounded"
            value={state.freightUsd}
            onChange={(e) => setState({ ...state, freightUsd: Number(e.target.value) })}
          />
        </label>
        <label>
          Брокер RUB
          <input
            type="number"
            className="w-full border p-1 rounded"
            value={state.brokerRub}
            onChange={(e) => setState({ ...state, brokerRub: Number(e.target.value) })}
          />
        </label>
        <label>
          Автовоз RUB
          <input
            type="number"
            className="w-full border p-1 rounded"
            value={state.truckRub}
            onChange={(e) => setState({ ...state, truckRub: Number(e.target.value) })}
          />
        </label>
      </div>
      {state.data && (
        <div className="space-y-1 border p-4 rounded">
          <div>Цена авто USD: {priceUsd.toFixed(2)}</div>
          <div>Цена авто RUB: {carRub.toFixed(0)}</div>
          <div>Фрахт RUB: {freightRub.toFixed(0)}</div>
          {customs && (
            <div>
              Таможня RUB: {customs.totalRub}
              <ul className="pl-4 list-disc">
                {Object.entries(customs.breakdown).map(([k, v]) => (
                  <li key={k}>
                    {k}: {v.toFixed(0)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>Брокер RUB: {state.brokerRub}</div>
          <div>Автовоз RUB: {state.truckRub}</div>
          <div className="font-bold">ИТОГ RUB: {total.totalRub}</div>
        </div>
      )}
      {state.data && (
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={copyUsd}>
            Скопировать USD для alta.ru
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={share}>
            Поделиться расчётом
          </button>
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={() => localStorage.setItem('calc-state', JSON.stringify(state))}
          >
            Сохранить
          </button>
        </div>
      )}
    </div>
  )
}
