import { useEffect, useState } from 'react'
import { calcTotal, Inputs } from './calc'
import { SourcePrice } from './components/SourcePrice'
import { RatesPanel } from './components/RatesPanel'
import { FixedCosts } from './components/FixedCosts'
import { CustomsPanel } from './components/CustomsPanel'
import { ResultBreakdown } from './components/ResultBreakdown'
import { fetchKrwToUsdt, fetchUsdToRub } from './rates'

type Memo = {
  age: string
  engine: string
  volume: string
  power: string
  hybrid: string
  mode: string
}

interface State extends Inputs {
  memo: Memo
}

const defaultState: State = {
  priceKrw: 15_000_000,
  rateKrwToUsdt: 0.00074,
  rateUsdtToRub: 90,
  freightUsd: 1440,
  customsRub: 0,
  brokerRub: 110_000,
  truckRub: 220_000,
  memo: { age: '', engine: '', volume: '', power: '', hybrid: '', mode: '' },
}

export default function App() {
  const [state, setState] = useState<State>(() => {
    const saved = localStorage.getItem('calc-state')
    const fromStorage = saved ? JSON.parse(saved) : defaultState
    const params = new URLSearchParams(window.location.search)
    params.forEach((v, k) => {
      if (k in fromStorage) (fromStorage as any)[k] = Number(v)
    })
    return fromStorage
  })
  const [rubDecimals, setRubDecimals] = useState(0)
  const [krwError, setKrwError] = useState(false)
  const [rubError, setRubError] = useState(false)

  const breakdown = calcTotal(state)

  useEffect(() => {
    localStorage.setItem('calc-state', JSON.stringify(state))
  }, [state])

  const copyUsd = () => {
    navigator.clipboard.writeText(breakdown.priceUsd.toFixed(2))
  }

  const refreshKrw = async () => {
    try {
      const rate = await fetchKrwToUsdt()
      setState((s) => ({ ...s, rateKrwToUsdt: rate }))
      setKrwError(false)
    } catch {
      setKrwError(true)
      alert('Не удалось обновить курс KRW→USDT')
    }
  }

  const refreshRub = async () => {
    try {
      const rate = await fetchUsdToRub()
      setState((s) => ({ ...s, rateUsdtToRub: rate }))
      setRubError(false)
    } catch {
      setRubError(true)
      alert('Не удалось обновить курс USDT→RUB')
    }
  }

  const reset = () => setState(defaultState)

  const save = () => localStorage.setItem('calc-state', JSON.stringify(state))

  const share = () => {
    const params = new URLSearchParams()
    ;['priceKrw', 'rateKrwToUsdt', 'rateUsdtToRub', 'freightUsd', 'customsRub', 'brokerRub', 'truckRub'].forEach((k) =>
      params.set(k, String((state as any)[k])),
    )
    navigator.clipboard.writeText(window.location.origin + '?' + params.toString())
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <SourcePrice
        priceKrw={state.priceKrw}
        priceUsd={breakdown.priceUsd}
        onChange={(v) => setState({ ...state, priceKrw: v })}
        onCopyUsd={copyUsd}
      />
      <RatesPanel
        krwToUsdt={state.rateKrwToUsdt}
        usdtToRub={state.rateUsdtToRub}
        onKrwChange={(v) => setState({ ...state, rateKrwToUsdt: v })}
        onRubChange={(v) => setState({ ...state, rateUsdtToRub: v })}
        onRefreshKrw={refreshKrw}
        onRefreshRub={refreshRub}
        krwError={krwError}
        rubError={rubError}
      />
      <FixedCosts
        freightUsd={state.freightUsd}
        brokerRub={state.brokerRub}
        truckRub={state.truckRub}
        onFreightChange={(v) => setState({ ...state, freightUsd: v })}
        onBrokerChange={(v) => setState({ ...state, brokerRub: v })}
        onTruckChange={(v) => setState({ ...state, truckRub: v })}
        rateUsdtToRub={state.rateUsdtToRub}
      />
      <CustomsPanel
        customsRub={state.customsRub}
        onCustomsChange={(v) => setState({ ...state, customsRub: v })}
        priceUsd={breakdown.priceUsd}
        onCopyUsd={copyUsd}
        memo={state.memo}
        onMemoChange={(f, val) => setState({ ...state, memo: { ...state.memo, [f]: val } })}
      />
      <ResultBreakdown
        inputs={state}
        breakdown={breakdown}
        rubDecimals={rubDecimals}
        setRubDecimals={setRubDecimals}
        onReset={reset}
        onSave={save}
        onShare={share}
      />
      <div className="text-center text-sm text-gray-500">
        Скопируйте USD-цену и откройте alta.ru
      </div>
    </div>
  )
}
