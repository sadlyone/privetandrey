interface Props {
  krwToUsdt: number
  usdtToRub: number
  onKrwChange: (v: number) => void
  onRubChange: (v: number) => void
  onRefreshKrw: () => void
  onRefreshRub: () => void
  krwError?: boolean
  rubError?: boolean
}

export function RatesPanel({
  krwToUsdt,
  usdtToRub,
  onKrwChange,
  onRubChange,
  onRefreshKrw,
  onRefreshRub,
  krwError,
  rubError,
}: Props) {
  return (
    <div className="p-4 rounded border space-y-4">
      <div>
        <label className="block text-sm font-medium" title="Курс KRW в USDT (USDT≈USD)">
          Курс KRW→USDT
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            min={0}
            className={`w-full p-2 border rounded ${krwError ? 'bg-yellow-100' : ''}`}
            value={krwToUsdt}
            onChange={(e) => onKrwChange(Math.max(0, Number(e.target.value)))}
          />
          <button
            type="button"
            onClick={onRefreshKrw}
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Обновить
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium" title="Курс USDT в RUB">
          Курс USDT→RUB
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            min={0}
            className={`w-full p-2 border rounded ${rubError ? 'bg-yellow-100' : ''}`}
            value={usdtToRub}
            onChange={(e) => onRubChange(Math.max(0, Number(e.target.value)))}
          />
          <button
            type="button"
            onClick={onRefreshRub}
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Обновить
          </button>
        </div>
      </div>
    </div>
  )
}
