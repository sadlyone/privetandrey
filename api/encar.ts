export interface EncarData {
  priceKrw: number
  year: number
  engineType: 'petrol' | 'diesel' | 'hybrid' | 'ev'
  displacementCc?: number
  powerHp?: number
  title?: string
  img?: string
}

function toNum(v: any): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^\d.]/g, ''))
    return isFinite(n) ? n : 0
  }
  return 0
}

function parse(html: string): EncarData {
  const jsons: any[] = []
  const addJson = (s?: string) => {
    if (!s) return
    try {
      jsons.push(JSON.parse(s))
    } catch {}
  }

  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    addJson(m[1])
  }
  for (const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)) {
    const txt = m[1]
    const m1 = txt.match(/window.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/)
    if (m1) addJson(m1[1])
    const m2 = txt.match(/__NUXT__\s*=\s*(\{[\s\S]*?\});/)
    if (m2) addJson(m2[1])
  }

  const pick = (...paths: string[][]): any => {
    for (const p of paths) {
      for (const j of jsons) {
        let v: any = j
        for (const k of p) v = v?.[k]
        if (v !== undefined) return v
      }
    }
    return undefined
  }

  let priceKrw = toNum(pick(['price'], ['offers', 'price']))
  let year = toNum(pick(['year'], ['productionDate']))
  let fuelRaw = (pick(['fuelType'], ['fuel'], ['vehicleEngine', 'fuelType']) || '') as string
  let displacementCc = toNum(pick(['displacement'], ['vehicleEngine', 'displacement']))
  let powerHp = toNum(pick(['power'], ['vehicleEngine', 'power'], ['power', 'value']))

  if (!priceKrw) {
    const nums = [...html.matchAll(/([\d.,]+)\s*원/g)].map((m) => toNum(m[1])).filter((n) => n >= 100_000 && n <= 500_000_000)
    if (nums.length) priceKrw = Math.max(...nums)
  }
  if (!year) {
    const years = [...html.matchAll(/(20\d{2})/g)].map((m) => Number(m[1])).filter((n) => n >= 2005 && n <= 2025)
    if (years.length) year = Math.max(...years)
  }

  const map: Record<string, EncarData['engineType']> = {
    gasoline: 'petrol',
    petrol: 'petrol',
    diesel: 'diesel',
    hybrid: 'hybrid',
    electric: 'ev',
    ev: 'ev',
  }

  let engineType = map[fuelRaw.toLowerCase()]
  if (!engineType) {
    if (/디젤|diesel/i.test(html)) engineType = 'diesel'
    else if (/하이브리드|hybrid/i.test(html)) engineType = 'hybrid'
    else if (/전기|electric|ev/i.test(html)) engineType = 'ev'
    else engineType = 'petrol'
  }

  const title = html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1]
  const img = html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1]

  return {
    priceKrw,
    year,
    engineType,
    displacementCc: displacementCc || undefined,
    powerHp: powerHp || undefined,
    title,
    img,
  }
}

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    let target = url.searchParams.get('url') || ''
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Vary: 'Origin',
    }
    if (!/^https?:\/\/[^/]*encar\.com/i.test(target)) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid url' }), {
        status: 400,
        headers,
      })
    }
    target = target.replace(/^https?:\/\//, '')
    target = target.replace(/^(fem|m)\./, 'www.')
    target = 'https://' + target

    const UA =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      'Chrome/124 Safari/537.36'

    try {
      let html = ''
      try {
        const resp = await fetch(target, { headers: { 'user-agent': UA } })
        if (!resp.ok) throw new Error('direct fetch ' + resp.status)
        html = await resp.text()
      } catch {
        const proxied = 'https://r.jina.ai/http://' + target.replace(/^https?:\/\//, '')
        const resp2 = await fetch(proxied, { headers: { 'user-agent': UA } })
        html = await resp2.text()
      }
      const data = parse(html)
      if (!data.priceKrw || !data.year) throw new Error('parse failed')
      return new Response(JSON.stringify({ ok: true, data }), { headers })
    } catch (e: any) {
      return new Response(
        JSON.stringify({ ok: false, error: e.message || 'fetch failed' }),
        { status: 500, headers },
      )
    }
  },
}
