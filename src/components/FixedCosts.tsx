interface Props {
  freightUsd: number
  brokerRub: number
  truckRub: number
  onFreightChange: (v: number) => void
  onBrokerChange: (v: number) => void
  onTruckChange: (v: number) => void
  rateUsdtToRub: number
}

export function FixedCosts({
  freightUsd,
  brokerRub,
  truckRub,
  onFreightChange,
  onBrokerChange,
  onTruckChange,
  rateUsdtToRub,
}: Props) {
  return (
    <div className="p-4 rounded border space-y-4">
      <div>
        <label className="block text-sm font-medium" title="Стоимость морского фрахта в USD">
          Море Корея→Владивосток (USD)
        </label>
        <input
          type="number"
          min={0}
          className="w-full p-2 border rounded"
          value={freightUsd}
          onChange={(e) => onFreightChange(Math.max(0, Number(e.target.value)))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium" title="Услуги брокера в рублях">
          Брокер (RUB)
        </label>
        <input
          type="number"
          min={0}
          className="w-full p-2 border rounded"
          value={brokerRub}
          onChange={(e) => onBrokerChange(Math.max(0, Number(e.target.value)))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium" title="Стоимость автотранспорта в рублях">
          Автовоз (RUB)
        </label>
        <input
          type="number"
          min={0}
          className="w-full p-2 border rounded"
          value={truckRub}
          onChange={(e) => onTruckChange(Math.max(0, Number(e.target.value)))}
        />
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400" title="Фрахт пересчитан в RUB по текущему курсу">
        Фрахт: {(freightUsd * rateUsdtToRub).toFixed(2)} RUB
      </div>
    </div>
  )
}
