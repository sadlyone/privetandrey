import { formatUSD } from '../utils'

interface Props {
  priceKrw: number
  priceUsd: number
  onChange: (v: number) => void
  onCopyUsd: () => void
}

export function SourcePrice({ priceKrw, priceUsd, onChange, onCopyUsd }: Props) {
  return (
    <div className="p-4 rounded border space-y-2">
      <label className="block text-sm font-medium" title="Цена на площадке Encar в KRW">
        Цена на Encar (KRW)
      </label>
      <input
        type="number"
        min={0}
        className="w-full p-2 border rounded"
        value={priceKrw}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
      />
      <div className="flex items-center justify-between text-sm">
        <span title="Расчётная цена в USD">{formatUSD(priceUsd)} USD</span>
        <button
          type="button"
          onClick={onCopyUsd}
          className="px-2 py-1 bg-blue-500 text-white rounded"
        >
          Скопировать USD
        </button>
      </div>
    </div>
  )
}
