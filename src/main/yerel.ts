// Yerel yapay zeka: Ollama'yı uygulamanın içinden indirip kurar, başlatır, model indirir / siler ve dener.
// İndirmeler resmi kaynaklardan yapılır (GitHub'daki ollama/ollama sürümleri); ilerleme arayüze yayınlanır.
import { execFile, spawn } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, rmSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import type { ReadableStream as WebStream } from 'node:stream/web'
import type { Indirme, SaglayiciAyari } from '@ortak/tipler'
import { cliBul, dusunceyiAt, ollamaAdresi, yonetilenOllamaAyarla } from './saglayicilar'

const indirmeler: Record<string, Indirme> = {}
const iptaller = new Map<string, AbortController>()
let yayinci: (d: Record<string, Indirme>) => void = () => {}
let klasor = ''

export function yerelBaslat(veriKlasoru: string, yayinla: (d: Record<string, Indirme>) => void): void {
  klasor = join(veriKlasoru, 'ollama')
  yayinci = yayinla
  yonetilenOllamaAyarla(join(klasor, 'bin', 'ollama'))
}

export const indirmeDurumu = (): Record<string, Indirme> => indirmeler
/** Başka modüllerin (tek tıkla bağlanma) ilerlemesi de aynı kanaldan yayınlanır. */
export const ilerlemeBildir = (hedef: string, yama: Partial<Indirme>): void => guncelle(hedef, yama)

function guncelle(hedef: string, yama: Partial<Indirme>): void {
  const onceki: Indirme = indirmeler[hedef] ?? { hedef, durum: 'iniyor', yuzde: 0 }
  indirmeler[hedef] = { ...onceki, ...yama, hedef }
  yayinci({ ...indirmeler })
}

export function indirmeIptal(hedef: string): void {
  iptaller.get(hedef)?.abort()
}

const surumVar = async (ayar?: SaglayiciAyari): Promise<boolean> => {
  try {
    return (await fetch(`${ollamaAdresi(ayar)}/api/version`, { signal: AbortSignal.timeout(1500) })).ok
  } catch {
    return false
  }
}

async function bekleCalisana(ayar: SaglayiciAyari | undefined, saniye: number, sinyal?: AbortSignal): Promise<boolean> {
  for (let i = 0; i < saniye; i++) {
    if (sinyal?.aborted) return false
    if (await surumVar(ayar)) return true
    await new Promise((r) => setTimeout(r, 1000))
  }
  return false
}

/** Bu platform için resmi Ollama paketinin adresi (GitHub'daki son sürüm). */
async function paketAdresi(): Promise<{ url: string; ad: string }> {
  const istenen = process.platform === 'win32' ? ['OllamaSetup.exe']
    : process.platform === 'darwin' ? ['Ollama-darwin.zip']
    : [`ollama-linux-${process.arch === 'arm64' ? 'arm64' : 'amd64'}.tgz`]
  try {
    const yanit = await fetch('https://api.github.com/repos/ollama/ollama/releases/latest',
      { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Atrium' }, signal: AbortSignal.timeout(15000) })
    const veri = (await yanit.json()) as { assets?: { name: string; browser_download_url: string }[] }
    const paket = veri.assets?.find((a) => istenen.includes(a.name))
    if (paket) return { url: paket.browser_download_url, ad: paket.name }
  } catch { /* yedek adres */ }
  if (process.platform === 'linux') throw new Error('Linux paketi bulunamadı — https://ollama.com/download')
  return { url: `https://ollama.com/download/${istenen[0]}`, ad: istenen[0] }
}

async function dosyaIndir(url: string, hedefDosya: string, hedef: string, sinyal: AbortSignal): Promise<void> {
  const yanit = await fetch(url, { signal: sinyal, redirect: 'follow' })
  if (!yanit.ok || !yanit.body) throw new Error(`HTTP ${yanit.status}`)
  const toplam = Number(yanit.headers.get('content-length')) || 0
  let inen = 0
  let son = 0
  const akis = Readable.fromWeb(yanit.body as unknown as WebStream)
  const yazici = createWriteStream(hedefDosya)
  await new Promise<void>((coz, ret) => {
    akis.on('data', (parca: Buffer) => {
      inen += parca.length
      if (toplam && Date.now() - son > 400) {
        son = Date.now()
        guncelle(hedef, { yuzde: Math.round((inen / toplam) * 100), mesaj: `${(inen / 1e6).toFixed(0)} / ${(toplam / 1e6).toFixed(0)} MB` })
      }
    })
    // hata ya da iptalde dosya kapatılmadan bırakılırsa Windows silmeye izin vermez
    const kapatVeReddet = (e: Error): void => { akis.destroy(); yazici.destroy(); yazici.once('close', () => ret(e)) }
    akis.on('error', kapatVeReddet)
    yazici.on('error', kapatVeReddet)
    yazici.on('finish', () => coz())
    akis.pipe(yazici)
  })
}

const calistir = (dosya: string, args: string[]): Promise<number> =>
  new Promise((coz) => { execFile(dosya, args, { windowsHide: true, timeout: 15 * 60_000 }, (h) => coz(h ? 1 : 0)) })

/** Ollama'yı indirir ve kurar. Windows: resmi kurucu (kullanıcı hesabına, yönetici izni gerekmez) ·
 *  macOS: Ollama.app Uygulamalar klasörüne · Linux: Atrium'un veri klasörüne, Atrium başlatır. */
export async function ollamaKur(ayar?: SaglayiciAyari): Promise<void> {
  if (indirmeler.ollama?.durum === 'iniyor' || indirmeler.ollama?.durum === 'kuruluyor') return
  const denetim = new AbortController()
  iptaller.set('ollama', denetim)
  guncelle('ollama', { durum: 'iniyor', yuzde: 0, mesaj: undefined })
  const gecici = join(tmpdir(), `atrium-ollama-${Date.now()}`)
  mkdirSync(gecici, { recursive: true })
  try {
    const paket = await paketAdresi()
    const dosya = join(gecici, paket.ad)
    await dosyaIndir(paket.url, dosya, 'ollama', denetim.signal)
    guncelle('ollama', { durum: 'kuruluyor', yuzde: 100, mesaj: undefined })
    if (process.platform === 'win32') {
      await calistir(dosya, ['/SILENT', '/SUPPRESSMSGBOXES', '/NORESTART'])
    } else if (process.platform === 'darwin') {
      const uygulamalar = existsSync('/Applications') ? '/Applications' : join(homedir(), 'Applications')
      if (await calistir('ditto', ['-xk', dosya, uygulamalar]) !== 0) await calistir('ditto', ['-xk', dosya, join(homedir(), 'Applications')])
      spawn('open', ['-a', 'Ollama'], { detached: true }).unref()
    } else {
      mkdirSync(klasor, { recursive: true })
      if (await calistir('tar', ['-xzf', dosya, '-C', klasor]) !== 0) throw new Error('tar')
    }
    if (!(await surumVar(ayar))) await ollamaBaslat(ayar)
    if (!(await bekleCalisana(ayar, 60, denetim.signal))) throw new Error('Ollama did not start')
    guncelle('ollama', { durum: 'bitti', yuzde: 100 })
  } catch (e) {
    guncelle('ollama', { durum: denetim.signal.aborted ? 'iptal' : 'hata', mesaj: String((e as Error).message).slice(0, 200) })
  } finally {
    iptaller.delete('ollama')
    try { rmSync(gecici, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }) } catch { /* bir sonraki açılışta işletim sistemi temizler */ }
  }
}

/** Kurulu ama çalışmayan Ollama sunucusunu arka planda başlatır. */
export async function ollamaBaslat(ayar?: SaglayiciAyari): Promise<void> {
  if (await surumVar(ayar)) return
  const { komut, kabuk } = cliBul('ollama', ayar?.yol)
  try {
    spawn(komut, ['serve'], { detached: true, stdio: 'ignore', windowsHide: true, shell: kabuk }).unref()
  } catch { /* bulunamadı — durum ekranı "kurulu değil" der */ }
  await bekleCalisana(ayar, 15)
}

const GECERLI_MODEL = /^[a-z0-9][a-z0-9._\-/]*(:[a-z0-9._-]+)?$/i

/** Ollama kütüphanesinden model indirir (ilerleme canlı yayınlanır). */
export async function modelIndir(model: string, ayar?: SaglayiciAyari): Promise<void> {
  if (!GECERLI_MODEL.test(model) || indirmeler[model]?.durum === 'iniyor') return
  const denetim = new AbortController()
  iptaller.set(model, denetim)
  guncelle(model, { durum: 'iniyor', yuzde: 0, mesaj: undefined })
  try {
    const yanit = await fetch(`${ollamaAdresi(ayar)}/api/pull`, {
      method: 'POST', signal: denetim.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, stream: true })
    })
    if (!yanit.ok || !yanit.body) throw new Error(`HTTP ${yanit.status}`)
    const okuyucu = Readable.fromWeb(yanit.body as unknown as WebStream)
    let tampon = ''
    let son = 0
    let hata = ''
    for await (const parca of okuyucu) {
      tampon += parca.toString()
      const satirlar = tampon.split('\n')
      tampon = satirlar.pop() ?? ''
      for (const satir of satirlar) {
        if (!satir.trim()) continue
        let o: { status?: string; total?: number; completed?: number; error?: string }
        try { o = JSON.parse(satir) } catch { continue }
        if (o.error) hata = o.error
        if (o.total && o.completed !== undefined && Date.now() - son > 400) {
          son = Date.now()
          guncelle(model, { yuzde: Math.round((o.completed / o.total) * 100), mesaj: `${(o.completed / 1e9).toFixed(2)} / ${(o.total / 1e9).toFixed(2)} GB` })
        } else if (o.status && !o.total) {
          guncelle(model, { mesaj: o.status })
        }
      }
    }
    if (hata) throw new Error(hata)
    guncelle(model, { durum: 'bitti', yuzde: 100, mesaj: undefined })
  } catch (e) {
    guncelle(model, { durum: denetim.signal.aborted ? 'iptal' : 'hata', mesaj: String((e as Error).message).slice(0, 200) })
  } finally {
    iptaller.delete(model)
  }
}

export async function modelSil(model: string, ayar?: SaglayiciAyari): Promise<void> {
  if (!GECERLI_MODEL.test(model)) return
  await fetch(`${ollamaAdresi(ayar)}/api/delete`, {
    method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model })
  })
  delete indirmeler[model]
  yayinci({ ...indirmeler })
}

/** Yerel modelle kısa bir deneme sohbeti (araçsız). */
export async function yerelDene(model: string, mesajlar: { rol: 'sen' | 'model'; metin: string }[], ayar?: SaglayiciAyari): Promise<string> {
  if (!GECERLI_MODEL.test(model)) throw new Error('model')
  const yanit = await fetch(`${ollamaAdresi(ayar)}/api/chat`, {
    method: 'POST', signal: AbortSignal.timeout(5 * 60_000), headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model, stream: false, options: { num_ctx: 8192 },
      messages: mesajlar.slice(-20).map((m) => ({ role: m.rol === 'sen' ? 'user' : 'assistant', content: String(m.metin).slice(0, 8000) }))
    })
  })
  const veri = (await yanit.json()) as { message?: { content?: string }; error?: string }
  if (!yanit.ok || veri.error) throw new Error(veri.error ?? `HTTP ${yanit.status}`)
  return dusunceyiAt(veri.message?.content ?? '')
}
