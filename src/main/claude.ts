// `claude -p` sürücüsü. İstem stdin'den verilir (Windows komut satırı sınırına takılmasın),
// çıktı stream-json olarak satır satır okunur; araç çağrıları canlı etkinlik satırına dönüşür.
import { execFile, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, join } from 'node:path'
import type { Cevirmen } from '@ortak/i18n'

export interface KosuSecenegi {
  cwd: string
  istem: string
  model: string
  butceUsd: number
  araclar: string[]
  yazma: boolean
  sureMs: number
  t: Cevirmen
  claudeYolu?: string
  /** Kullanıcı API anahtarıyla bağlandıysa çözülmüş değer (yalnız alt sürecin ortamına gider). */
  apiAnahtari?: string
  sinyal?: AbortSignal
  etkinlik?: (satir: string) => void
}

export interface KosuSonucu {
  metin: string
  maliyetUsd: number
  /** Maliyet claude'dan okunamadıysa (süre aşımı, iptal) tavan yazılır ve bu alan true olur. */
  maliyetTahmini: boolean
  hata?: string
}

// Ajan hiçbir koşulda gizli dosya okuyamaz, kabuk komutu çalıştıramaz, kendi alt ajanını açamaz
// (alt ajan bütçe ve denetimin dışına taşar; iş bölmeyi lider yapar).
const YASAK_ARACLAR = [
  'Bash', 'PowerShell', 'Agent', 'Task',
  'Read(**/.env)', 'Read(**/.env.*)', 'Read(**/*.pem)', 'Read(**/*.key)', 'Read(**/id_rsa*)', 'Read(**/id_ed25519*)',
  'Edit(**/.env*)', 'Write(**/.env*)'
]

/** Atrium'un kendi koşularını Claude Code sohbet listesinden ayırmak için istemin ilk satırı. */
export const ATRIUM_ISARETI = '[atrium-agent]'

export function claudeBul(ayar?: string): { komut: string; kabuk: boolean } {
  if (ayar && existsSync(ayar)) return { komut: ayar, kabuk: false }
  const ev = homedir()
  const adaylar =
    process.platform === 'win32'
      ? [join(process.env.APPDATA ?? '', 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe'),
         join(ev, '.local', 'bin', 'claude.exe')]
      : [join(ev, '.local', 'bin', 'claude'), join(ev, '.claude', 'local', 'claude'),
         '/opt/homebrew/bin/claude', '/usr/local/bin/claude', '/usr/bin/claude', join(ev, '.npm-global', 'bin', 'claude')]
  const bulunan = adaylar.find((a) => a && existsSync(a))
  if (bulunan) return { komut: bulunan, kabuk: false }
  return { komut: 'claude', kabuk: process.platform === 'win32' }
}

function calistir(args: string[], ayar?: string, zamanMs = 15000): Promise<{ kod: number; cikti: string }> {
  const { komut, kabuk } = claudeBul(ayar)
  return new Promise((coz) => {
    execFile(komut, args, { timeout: zamanMs, shell: kabuk, windowsHide: true, env: temizOrtam() }, (hata, stdout, stderr) => {
      const kod = hata ? (typeof (hata as NodeJS.ErrnoException).code === 'number' ? Number((hata as NodeJS.ErrnoException).code) : 1) : 0
      coz({ kod: hata && !stdout ? -1 : kod, cikti: `${stdout ?? ''}${stderr ?? ''}` })
    })
  })
}

export async function claudeDurumuOku(ayar?: string, apiAnahtari = false): Promise<{ kurulu: boolean; surum?: string; girisli: boolean; yontem?: string; apiAnahtari: boolean }> {
  const surum = await calistir(['--version'], ayar)
  const eslesme = surum.cikti.match(/(\d+\.\d+\.\d+)/)
  if (surum.kod === -1 || !eslesme) return { kurulu: false, girisli: false, apiAnahtari }
  const durum = await calistir(['auth', 'status'], ayar)
  let girisli = false
  let yontem: string | undefined
  try {
    const json = JSON.parse(durum.cikti.slice(durum.cikti.indexOf('{'), durum.cikti.lastIndexOf('}') + 1)) as { loggedIn?: boolean; authMethod?: string }
    girisli = !!json.loggedIn
    yontem = json.authMethod
  } catch {
    girisli = false
  }
  if (!girisli && apiAnahtari) return { kurulu: true, surum: eslesme[1], girisli: true, yontem: 'Atrium API key', apiAnahtari }
  return { kurulu: true, surum: eslesme[1], girisli, yontem, apiAnahtari }
}

/** `claude auth login`'i kullanıcının görebileceği bir terminal penceresinde başlatır. */
export function claudeGirisBaslat(ayar?: string): void {
  const { komut } = claudeBul(ayar)
  const tirnakli = komut.includes(' ') ? `"${komut}"` : komut
  if (process.platform === 'win32') {
    spawn('cmd.exe', ['/c', `start "Claude login" cmd /k ${tirnakli} auth login`],
      { detached: true, windowsHide: false, windowsVerbatimArguments: true }).unref()
  } else if (process.platform === 'darwin') {
    spawn('osascript', ['-e', `tell application "Terminal" to do script "${tirnakli.replace(/"/g, '\\"')} auth login"`, '-e', 'tell application "Terminal" to activate'], { detached: true }).unref()
  } else {
    for (const terminal of ['x-terminal-emulator', 'gnome-terminal', 'konsole', 'xterm']) {
      try {
        const args = terminal === 'gnome-terminal' ? ['--', komut, 'auth', 'login'] : ['-e', `${komut} auth login`]
        spawn(terminal, args, { detached: true }).unref()
        return
      } catch {
        /* bir sonrakini dene */
      }
    }
  }
}

function temizOrtam(ekler: Record<string, string> = {}): NodeJS.ProcessEnv {
  // iç içe oturum algılaması alt süreci engellemesin
  const ortam = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('CLAUDECODE')))
  return { ...ortam, ...ekler }
}

function kisalt(metin: string, n = 70): string {
  const tek = metin.replace(/\s+/g, ' ').trim()
  return tek.length > n ? tek.slice(0, n - 1) + '…' : tek
}

function hataMetni(ham: string, t: Cevirmen): string {
  if (/authenticat|oauth|log ?in|api key|not logged/i.test(ham)) return t('errLogin')
  if (/budget/i.test(ham)) return `${t('errBudget')} (${kisalt(ham, 120)})`
  return kisalt(ham, 400)
}

export function aracSatiri(ad: string, girdi: Record<string, unknown>, t: Cevirmen): string {
  const s = (k: string): string => String(girdi[k] ?? '')
  switch (ad) {
    case 'Read': return t('toolRead', { f: basename(s('file_path')) })
    case 'Grep': return t('toolGrep', { p: kisalt(s('pattern'), 40) })
    case 'Glob': return t('toolGlob', { p: kisalt(s('pattern'), 40) })
    case 'Edit': case 'MultiEdit': return t('toolEdit', { f: basename(s('file_path')) })
    case 'Write': return t('toolWrite', { f: basename(s('file_path')) })
    case 'WebSearch': return t('toolWebSearch', { q: kisalt(s('query'), 40) })
    case 'WebFetch': return t('toolWebFetch', { u: kisalt(s('url'), 50) })
    case 'TodoWrite': return t('toolTodo')
    case 'Task': case 'Agent': return t('toolTask')
    case 'Bash': case 'PowerShell': return t('toolBash')
    default: return t('toolOther', { name: ad })
  }
}

export function claudeKos(s: KosuSecenegi): Promise<KosuSonucu> {
  const { komut, kabuk } = claudeBul(s.claudeYolu)
  // salt okuma koşusunda yazma araçları açıkça yasak (izin listesine güvenmek yetmez)
  const yasak = s.yazma ? YASAK_ARACLAR : [...YASAK_ARACLAR, 'Write', 'Edit', 'MultiEdit', 'NotebookEdit']
  const args = [
    '-p', '--output-format', 'stream-json', '--verbose',
    '--model', s.model,
    '--max-budget-usd', String(s.butceUsd),
    '--permission-mode', s.yazma ? 'acceptEdits' : 'default',
    '--no-session-persistence', // ajan koşuları kullanıcının Claude Code sohbet geçmişine düşmesin
    '--allowedTools', s.araclar.join(','),
    '--disallowedTools', yasak.join(',')
  ]
  // Claude Code'un yerleşik otomatik hafızası kapalı: ajan ~/.claude altına kendi hafıza dosyalarını
  // yazmasın, proje hafızası yalnızca Atrium'da dursun.
  const ortam = temizOrtam({ CLAUDE_CODE_DISABLE_AUTO_MEMORY: '1', ...(s.apiAnahtari ? { ANTHROPIC_API_KEY: s.apiAnahtari } : {}) })

  return new Promise((coz) => {
    let bitti = false
    let sonuc: KosuSonucu = { metin: '', maliyetUsd: 0, maliyetTahmini: false }
    let tampon = ''
    let hataCiktisi = ''
    const tahmini = (hata: string): KosuSonucu => ({ metin: sonuc.metin, maliyetUsd: s.butceUsd, maliyetTahmini: true, hata })

    const surec = spawn(komut, kabuk ? args.map((a) => (/[\s(),*]/.test(a) ? `"${a}"` : a)) : args, {
      cwd: s.cwd, env: ortam, shell: kabuk, windowsHide: true
    })

    const bitir = (r: KosuSonucu): void => {
      if (bitti) return
      bitti = true
      clearTimeout(zamanlayici)
      s.sinyal?.removeEventListener('abort', iptal)
      coz(r)
    }
    const oldur = (): void => {
      try { surec.kill() } catch { /* zaten bitmiş */ }
    }
    const zamanlayici = setTimeout(() => {
      oldur()
      bitir(tahmini(s.t('errTimeout', { n: Math.round(s.sureMs / 60000) })))
    }, s.sureMs)
    const iptal = (): void => {
      oldur()
      bitir(tahmini(s.t('errCancelled')))
    }
    if (s.sinyal?.aborted) return iptal()
    s.sinyal?.addEventListener('abort', iptal)

    const satirIsle = (satir: string): void => {
      if (!satir.trim()) return
      let olay: Record<string, any>
      try { olay = JSON.parse(satir) } catch { return }
      if (olay.type === 'assistant') {
        for (const parca of olay.message?.content ?? []) {
          if (parca.type === 'tool_use') s.etkinlik?.(aracSatiri(parca.name, parca.input ?? {}, s.t))
          else if (parca.type === 'text' && parca.text?.trim()) s.etkinlik?.(`💬 ${kisalt(parca.text)}`)
        }
      } else if (olay.type === 'result') {
        // hata durumunda `result` hata metnidir; rapor gibi işlenmesin
        sonuc = {
          metin: olay.is_error ? '' : String(olay.result ?? ''),
          maliyetUsd: Number(olay.total_cost_usd ?? 0),
          maliyetTahmini: false,
          hata: olay.is_error ? hataMetni(String(olay.result || olay.subtype || 'error'), s.t) : undefined
        }
      }
    }

    surec.stdout.setEncoding('utf-8')
    surec.stdout.on('data', (parca: string) => {
      tampon += parca
      const satirlar = tampon.split('\n')
      tampon = satirlar.pop() ?? ''
      satirlar.forEach(satirIsle)
    })
    surec.stderr.setEncoding('utf-8')
    surec.stderr.on('data', (p: string) => { hataCiktisi = (hataCiktisi + p).slice(-2000) })
    surec.on('error', (e) => bitir({ metin: '', maliyetUsd: 0, maliyetTahmini: false, hata: s.t('errStart', { e: e.message }) }))
    surec.on('close', (kod) => {
      satirIsle(tampon)
      if (!sonuc.metin && !sonuc.hata && kod !== 0) sonuc = { ...sonuc, hata: hataMetni(hataCiktisi || `claude exit ${kod}`, s.t) }
      bitir(sonuc)
    })
    surec.stdin.on('error', () => { /* süreç erken kapandıysa */ })
    surec.stdin.end(`${ATRIUM_ISARETI}\n${s.istem}`, 'utf-8')
  })
}
