import { Inputs, Breakdown } from '../calc'
import { formatKRW, formatUSD, formatRUB } from '../utils'

interface Props {
  inputs: Inputs
  breakdown: Breakdown
  rubDecimals: number
  setRubDecimals: (v: number) => void
  onReset: () => void
  onSave: () => void
  onShare: () => void
}

export function ResultBreakdown({
  inputs,
  breakdown,
  rubDecimals,
  setRubDecimals,
  onReset,
  onSave,
  onShare,
}: Props) {
  return (
    <div className="p-4 rounded border space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Итог</h2>
        <div className="flex items-center gap-1 text-sm">
          <span>RUB decimals:</span>
          {[0, 2].map((d) => (
            <button
              key={d}
              onClick={() => setRubDecimals(d)}
              className={`px-2 py-0.5 border rounded ${rubDecimals === d ? 'bg-blue-500 text-white' : ''}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="text-sm space-y-1">
        <div>Цена Encar: {formatKRW(inputs.priceKrw)} KRW</div>
        <div>Курс KRW→USDT: {inputs.rateKrwToUsdt}</div>
        <div>Цена авто: {formatUSD(breakdown.priceUsd)} USD</div>
        <div>Курс USDT→RUB: {inputs.rateUsdtToRub}</div>
        <div>Цена авто: {formatRUB(breakdown.carRub, rubDecimals)} RUB</div>
        <div>
          Фрахт: {formatUSD(inputs.freightUsd)} USD → {formatRUB(breakdown.freightRub, rubDecimals)} RUB
        </div>
        <div>Таможня: {formatRUB(inputs.customsRub, rubDecimals)} RUB</div>
        <div>Брокер: {formatRUB(inputs.brokerRub, rubDecimals)} RUB</div>
        <div>Автовоз: {formatRUB(inputs.truckRub, rubDecimals)} RUB</div>
      </div>
      <div className="text-center text-2xl font-bold">
        {formatRUB(breakdown.totalRub, rubDecimals)} RUB
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <button onClick={onReset} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">
          Сброс
        </button>
        <button onClick={onSave} className="px-3 py-1 bg-green-500 text-white rounded">
          Сохранить
        </button>
        <button onClick={onShare} className="px-3 py-1 bg-blue-500 text-white rounded">
          Поделиться
        </button>
      </div>
    </div>
  )
}
