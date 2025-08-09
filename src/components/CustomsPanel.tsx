interface Memo {
  age: string
  engine: string
  volume: string
  power: string
  hybrid: string
  mode: string
}

interface Props {
  customsRub: number
  onCustomsChange: (v: number) => void
  priceUsd: number
  onCopyUsd: () => void
  memo: Memo
  onMemoChange: (field: keyof Memo, value: string) => void
}

export function CustomsPanel({
  customsRub,
  onCustomsChange,
  priceUsd,
  onCopyUsd,
  memo,
  onMemoChange,
}: Props) {
  const memoField = (
    name: keyof Memo,
    label: string,
  ) => (
    <input
      type="text"
      placeholder={label}
      className="w-full p-2 border rounded"
      value={memo[name]}
      onChange={(e) => onMemoChange(name, e.target.value)}
    />
  )

  return (
    <div className="p-4 rounded border space-y-4">
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => window.open('https://www.alta.ru/auto-vat/', '_blank')}
          className="px-2 py-1 bg-blue-500 text-white rounded"
        >
          Открыть таможенный калькулятор
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span>{priceUsd.toFixed(2)} USD</span>
          <button
            type="button"
            onClick={onCopyUsd}
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Скопировать USD
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">
          Сумма таможенных платежей (RUB)
        </label>
        <input
          type="number"
          min={0}
          className="w-full p-2 border rounded"
          value={customsRub}
          onChange={(e) => onCustomsChange(Math.max(0, Number(e.target.value)))}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {memoField('age', 'Возраст')}
        {memoField('engine', 'Двигатель (тип)')}
        {memoField('volume', 'Объём, см³')}
        {memoField('power', 'Мощность, л.с.')}
        {memoField('hybrid', 'Тип гибрида')}
        {memoField('mode', 'Режим ввоза')}
      </div>
    </div>
  )
}
