export interface EncarData {
  priceKrw: number
  year: number
  engineType: 'petrol' | 'diesel' | 'hybrid' | 'ev'
  displacementCc?: number
  powerHp?: number
  title?: string
  img?: string
}

function parse(html: string): EncarData {
  const get = (re: RegExp) => {
    const m = html.match(re)
    return m ? m[1] : undefined
  }
  const priceKrw = Number(get(/"price"\s*:\s*(\d+)/))
  const year = Number(get(/"year"\s*:\s*(\d{4})/))
  const fuelRaw = get(/"fuelType"\s*:\s*"(\w+)"/i) || ''
  const map: Record<string, EncarData['engineType']> = {
    gasoline: 'petrol',
    petrol: 'petrol',
    diesel: 'diesel',
    hybrid: 'hybrid',
    electric: 'ev',
    ev: 'ev',
  }
  const engineType = map[fuelRaw.toLowerCase()] || 'petrol'
  const displacementCc = Number(get(/"displacement"\s*:\s*(\d+)/)) || undefined
  const powerHp = Number(get(/"power"\s*:\s*(\d+)/)) || undefined
  const title = get(/<meta property="og:title" content="([^"]+)"/i)
  const img = get(/<meta property="og:image" content="([^"]+)"/i)
  return { priceKrw, year, engineType, displacementCc, powerHp, title, img }
}

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const target = url.searchParams.get('url') || ''
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=600',
    }
    if (!/^https?:\/\/[^/]*encar\.com/i.test(target)) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid url' }), {
        status: 400,
        headers,
      })
    }
    try {
      const res = await fetch(target, { headers: { 'user-agent': 'Mozilla/5.0' } })
      const html = await res.text()
      const data = parse(html)
      return new Response(JSON.stringify({ ok: true, data }), { headers })
    } catch (e: any) {
      return new Response(JSON.stringify({ ok: false, error: 'fetch failed' }), {
        status: 500,
        headers,
      })
    }
  },
}
