import TelegramBot from 'node-telegram-bot-api'
import type { Inputs } from './calc'
import { calcTotal } from './calc'
import { fetchKrwToUsdt, fetchUsdToRub } from './rates'

const token = process.env.BOT_TOKEN
if (!token) {
  throw new Error('Не задан токен бота в переменной BOT_TOKEN')
}

const bot = new TelegramBot(token, { polling: true })

interface Session {
  step: number
  inputs: Partial<Inputs>
}

const sessions = new Map<number, Session>()

const questions = [
  'Введите стоимость автомобиля в KRW:',
  'Введите сумму таможенных платежей в RUB:',
  'Введите стоимость фрахта в USD:',
  'Введите услуги брокера в RUB:',
  'Введите стоимость доставки по РФ (автовоз) в RUB:',
]

bot.setMyCommands([
  { command: '/start', description: 'Приветствие' },
  { command: '/calc', description: 'Рассчитать стоимость' },
])

bot.onText(/\/start/, msg => {
  bot.sendMessage(
    msg.chat.id,
    'Привет! Я помогу рассчитать стоимость авто из Южной Кореи. Напишите /calc, чтобы начать.'
  )
})

bot.onText(/\/calc/, msg => {
  sessions.set(msg.chat.id, { step: 0, inputs: {} })
  bot.sendMessage(msg.chat.id, questions[0])
})

bot.on('message', async msg => {
  const chatId = msg.chat.id
  const session = sessions.get(chatId)
  if (!session || !msg.text || msg.text.startsWith('/')) return

  const value = parseFloat(msg.text.replace(',', '.'))
  if (Number.isNaN(value)) {
    bot.sendMessage(chatId, 'Пожалуйста, введите число.')
    return
  }

  switch (session.step) {
    case 0:
      session.inputs.priceKrw = value
      break
    case 1:
      session.inputs.customsRub = value
      break
    case 2:
      session.inputs.freightUsd = value
      break
    case 3:
      session.inputs.brokerRub = value
      break
    case 4:
      session.inputs.truckRub = value
      break
  }

  session.step++

  if (session.step < questions.length) {
    bot.sendMessage(chatId, questions[session.step])
    return
  }

  try {
    const [rateKrwToUsdt, rateUsdtToRub] = await Promise.all([
      fetchKrwToUsdt(),
      fetchUsdToRub(),
    ])

    const result = calcTotal({
      priceKrw: session.inputs.priceKrw!,
      customsRub: session.inputs.customsRub!,
      freightUsd: session.inputs.freightUsd!,
      brokerRub: session.inputs.brokerRub!,
      truckRub: session.inputs.truckRub!,
      rateKrwToUsdt,
      rateUsdtToRub,
    })

    const text =
      `Курс KRW→USD: ${rateKrwToUsdt.toFixed(4)}\n` +
      `Курс USD→RUB: ${rateUsdtToRub.toFixed(2)}\n\n` +
      `Цена авто: ${result.priceUsd.toLocaleString('ru-RU')} $\n` +
      `Фрахт: ${result.freightRub.toLocaleString('ru-RU')} ₽\n` +
      `Авто в РФ: ${result.carRub.toLocaleString('ru-RU')} ₽\n` +
      `Итого под ключ: ${result.totalRub.toLocaleString('ru-RU')} ₽`

    bot.sendMessage(chatId, text)
  } catch {
    bot.sendMessage(chatId, 'Не удалось получить курсы валют.')
  }

  sessions.delete(chatId)
})
