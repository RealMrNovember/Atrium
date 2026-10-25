// Tek tıkla bağlanma: araç kurulu değilse Atrium onu kendi klasörüne kurar (npm, yönetici izni gerekmez),
// sonra o aracın kendi giriş akışını başlatır (ChatGPT, Google ya da Claude hesabı — tarayıcıda).
// Giriş bitince durum kendiliğinden "Hazır" olur. Parola Atrium'a hiç gelmez.
import { execFile, spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Indirme, SaglayiciId } from '@ortak/tipler'
import { claudeBul, claudeDurumuOku, claudeGirisBaslat, temizOrtam, terminaldeCalistir } from './claude'
import { cliBul, saglayiciDurumu } from './saglayicilar'
import { cliKoku_ } from './yollar'

const PAKET: Partial<Record<SaglayiciId, string>> = {
  claude: '@anthropic-ai/claude-code',
  codex: '@openai/codex',
  gemini: '@google/gemini-cli'
}

let ilerleme: (hedef: string, yama: Partial<Indirme>) => void = () => {}
export const baglanIlerlemeAyarla = (f: typeof ilerleme): void => { ilerleme = f }
const surenler = new Set<SaglayiciId>()
let codexGiris: ChildProcess | null = null

const npm = (): { komut: string; kabuk: boolean } => ({ komut: process.platform === 'win32' ? 'npm.cmd' : 'npm', kabuk: process.platform === 'win32' })

function calistir(komut: string, kabuk: boolean, args: string[], zamanMs: number): Promise<{ kod: number; cikti: string }> {
  return new Promise((coz) => {
    execFile(komut, args, { timeout: zamanMs, shell: kabuk, windowsHide: true, env: temizOrtam(), maxBuffer: 8 * 1024 * 1024 }, (hata, stdout, stderr) =>
      coz({ kod: hata ? 1 : 0, cikti: `${stdout ?? ''}${stderr ?? ''}` }))
  })
}

async function durum(id: SaglayiciId, ayar?: { yol?: string }): Promise<{ kurulu: boolean; hazir: boolean }> {
  if (id === 'claude') {
    const d = await claudeDurumuOku(ayar?.yol)
    return { kurulu: d.kurulu, hazir: d.girisli }
  }
  const d = await saglayiciDurumu(id, ayar ?? {})
  return { kurulu: d.kurulu, hazir: d.hazir }
}

/** Gemini CLI'ye "Google ile giriş" yöntemini seçtirir; ilk açılışta doğrudan tarayıcıda Google girişi başlar. */
function geminiGoogleSec(): void {
  const klasor = join(homedir(), '.gemini')
  const dosya = join(klasor, 'settings.json')
  let ayar: Record<string, any> = {}
  try { ayar = JSON.parse(readFileSync(dosya, 'utf-8')) } catch { /* yok */ }
  ayar.security = { ...ayar.security, auth: { ...ayar.security?.auth, selectedType: 'oauth-personal' } }
  ayar.selectedAuthType = 'oauth-personal' // eski sürümler
  mkdirSync(klasor, { recursive: true })
  writeFileSync(dosya, JSON.stringify(ayar, null, 2))
}

function girisBaslat(id: SaglayiciId, yol?: string): void {
  if (id === 'claude') return claudeGirisBaslat(yol)
  if (id === 'codex') {
    // `codex login` tarayıcıda ChatGPT girişini açar ve dönüşü kendi yerel sunucusunda bekler
    const { komut, kabuk } = cliBul('codex', yol)
    codexGiris?.kill()
    codexGiris = spawn(komut, ['login'], { shell: kabuk, windowsHide: true, env: temizOrtam(), stdio: 'ignore' })
    setTimeout(() => { codexGiris?.kill(); codexGiris = null }, 10 * 60_000)
    return
  }
  if (id === 'gemini') {
    geminiGoogleSec()
    terminaldeCalistir(cliBul('gemini', yol).komut, [], 'Gemini')
  }
}

/** Kurulu değilse kurar, sonra giriş akışını başlatır; ilerleme 'cli-<id>' hedefiyle yayınlanır. */
export async function tekTiklaBagla(id: SaglayiciId, ayar?: { yol?: string }): Promise<void> {
  const paket = PAKET[id]
  if (!paket || surenler.has(id)) return
  surenler.add(id)
  const hedef = `cli-${id}`
  try {
    let d = await durum(id, ayar)
    if (!d.kurulu) {
      ilerleme(hedef, { durum: 'kuruluyor', yuzde: 0, mesaj: undefined })
      const n = npm()
      if ((await calistir(n.komut, n.kabuk, ['--version'], 20_000)).kod !== 0) throw new Error('npm')
      const kok = cliKoku_()
      mkdirSync(kok, { recursive: true })
      if (!existsSync(join(kok, 'package.json'))) writeFileSync(join(kok, 'package.json'), '{"name":"atrium-cli","private":true}\n')
      const sonuc = await calistir(n.komut, n.kabuk, ['install', '--prefix', kok, '--no-fund', '--no-audit', `${paket}@latest`], 10 * 60_000)
      if (sonuc.kod !== 0) throw new Error(sonuc.cikti.split('\n').filter((s) => /err/i.test(s)).slice(-2).join(' ').slice(0, 200) || 'npm install')
      d = await durum(id, ayar)
      if (!d.kurulu) throw new Error('install')
    }
    if (!d.hazir) {
      ilerleme(hedef, { durum: 'iniyor', yuzde: 50, mesaj: 'login' })
      girisBaslat(id, id === 'claude' ? ayar?.yol : ayar?.yol)
      // giriş tarayıcıda tamamlanınca durum "hazır" olur (en çok 5 dakika bekle)
      for (let i = 0; i < 100 && !d.hazir; i++) {
        await new Promise((r) => setTimeout(r, 3000))
        d = await durum(id, ayar)
      }
      if (!d.hazir) throw new Error('login')
    }
    ilerleme(hedef, { durum: 'bitti', yuzde: 100, mesaj: undefined })
  } catch (e) {
    ilerleme(hedef, { durum: 'hata', mesaj: String((e as Error).message).slice(0, 200) })
  } finally {
    surenler.delete(id)
    if (id === 'codex') { codexGiris?.kill(); codexGiris = null }
  }
}

export const claudeKurulumYolu = (): string => claudeBul().komut
