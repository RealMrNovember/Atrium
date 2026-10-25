// Claude dışındaki yapay zeka araçları: OpenAI Codex CLI, Gemini CLI, Ollama (yerel) ve OpenAI uyumlu uç noktalar.
// Hepsi Claude koşusuyla aynı sözleşmeyi (KosuSecenegi → KosuSonucu) uygular; motor hangisinin çalıştığını bilmez.
import { execFile, spawn } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Cevirmen } from '@ortak/i18n'
import { SAGLAYICILAR, type SaglayiciAyari, type SaglayiciDurumu, type SaglayiciId } from '@ortak/tipler'
import { aracSatiri, claudeKos, kisalt, temizOrtam, type KosuSecenegi, type KosuSonucu } from './claude'
import { aracCalistir, araclar, claudeAdi } from './dosyaAraclari'

export const OLLAMA_ADRESI = 'http://127.0.0.1:11434'

export interface GenelKosu extends KosuSecenegi {
  saglayici: SaglayiciId
  ayar: SaglayiciAyari
  /** Sağlayıcının Atrium'da saklanan anahtarı (Gemini, OpenAI uyumlu). */
  anahtar?: string
}

let ceviri: Cevirmen | null = null
const ad = (id: SaglayiciId): string => (id === 'openai' && ceviri ? ceviri('provOpenai') : SAGLAYICILAR.find((s) => s.id === id)?.ad ?? id)

/** Ajanı seçili araçla çalıştırır. */
export function kos(s: GenelKosu): Promise<KosuSonucu> {
  ceviri = s.t
  switch (s.saglayici) {
    case 'codex': return codexKos(s)
    case 'gemini': return geminiKos(s)
    case 'ollama': case 'openai': return uyumluKos(s)
    default: return claudeKos(s)
  }
}

// --- CLI bulma ve durum ---------------------------------------------------------------

/** Atrium'un kendi indirdiği Ollama (macOS/Linux) burada durur; index.ts başlarken ayarlar. */
let yonetilenOllama = ''
export const yonetilenOllamaAyarla = (yol: string): void => { yonetilenOllama = yol }

export function cliBul(adi: 'codex' | 'gemini' | 'ollama', ayar?: string): { komut: string; kabuk: boolean } {
  if (ayar && existsSync(ayar)) return { komut: ayar, kabuk: /\.(cmd|bat)$/i.test(ayar) }
  const ev = homedir()
  const adaylar: string[] = process.platform === 'win32'
    ? [join(process.env.APPDATA ?? '', 'npm', `${adi}.cmd`), join(ev, '.local', 'bin', `${adi}.exe`),
       ...(adi === 'ollama' ? [join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Ollama', 'ollama.exe')] : [])]
    : [join(ev, '.local', 'bin', adi), '/opt/homebrew/bin/' + adi, '/usr/local/bin/' + adi, '/usr/bin/' + adi,
       join(ev, '.npm-global', 'bin', adi), join(ev, '.bun', 'bin', adi),
       ...(adi === 'ollama' ? ['/Applications/Ollama.app/Contents/Resources/ollama', yonetilenOllama] : [])]
  const bulunan = adaylar.find((a) => a && existsSync(a))
  if (bulunan) return { komut: bulunan, kabuk: /\.(cmd|bat)$/i.test(bulunan) }
  return { komut: adi, kabuk: process.platform === 'win32' }
}

function calistir(komut: string, kabuk: boolean, args: string[], zamanMs = 15000): Promise<{ kod: number; cikti: string }> {
  return new Promise((coz) => {
    execFile(komut, args, { timeout: zamanMs, shell: kabuk, windowsHide: true, env: temizOrtam() }, (hata, stdout, stderr) => {
      const kod = hata ? (typeof (hata as NodeJS.ErrnoException).code === 'number' ? Number((hata as NodeJS.ErrnoException).code) : 1) : 0
      coz({ kod: hata && !stdout && !stderr ? -1 : kod, cikti: `${stdout ?? ''}${stderr ?? ''}` })
    })
  })
}

async function jsonGetir<T>(url: string, anahtar?: string, zamanMs = 2500): Promise<T | null> {
  try {
    const yanit = await fetch(url, { signal: AbortSignal.timeout(zamanMs), headers: anahtar ? { Authorization: `Bearer ${anahtar}` } : {} })
    return yanit.ok ? ((await yanit.json()) as T) : null
  } catch {
    return null
  }
}

export const ollamaAdresi = (ayar?: SaglayiciAyari): string => (ayar?.url || OLLAMA_ADRESI).replace(/\/+$/, '')

export async function ollamaModelleri(ayar?: SaglayiciAyari): Promise<{ ad: string; boyut: number }[] | null> {
  const r = await jsonGetir<{ models?: { name: string; size: number }[] }>(`${ollamaAdresi(ayar)}/api/tags`)
  return r ? (r.models ?? []).map((m) => ({ ad: m.name, boyut: m.size })) : null
}

export async function saglayiciDurumu(id: SaglayiciId, ayar: SaglayiciAyari = {}, anahtarVar = false): Promise<SaglayiciDurumu> {
  if (id === 'codex' || id === 'gemini') {
    const { komut, kabuk } = cliBul(id, ayar.yol)
    const surum = await calistir(komut, kabuk, ['--version'])
    const eslesme = surum.cikti.match(/(\d+\.\d+\.\d+)/)
    if (surum.kod === -1 || !eslesme) return { id, kurulu: false, hazir: false, anahtar: anahtarVar }
    if (id === 'codex') {
      const giris = await calistir(komut, kabuk, ['login', 'status'])
      const hazir = giris.kod === 0 && !/not logged/i.test(giris.cikti)
      return { id, kurulu: true, surum: eslesme[1], hazir, yontem: hazir ? kisalt(giris.cikti.trim().split('\n').pop() ?? '', 50) : undefined }
    }
    const kimlik = ['oauth_creds.json', 'google_accounts.json'].some((f) => existsSync(join(homedir(), '.gemini', f)))
    const hazir = kimlik || anahtarVar || !!process.env.GEMINI_API_KEY
    return { id, kurulu: true, surum: eslesme[1], hazir, anahtar: anahtarVar,
      yontem: anahtarVar ? 'Atrium API key' : kimlik ? 'Google' : process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : undefined }
  }
  if (id === 'ollama') {
    const surum = await jsonGetir<{ version: string }>(`${ollamaAdresi(ayar)}/api/version`)
    if (surum) {
      const modeller = await ollamaModelleri(ayar)
      return { id, kurulu: true, surum: surum.version, hazir: true, modeller: (modeller ?? []).map((m) => m.ad) }
    }
    const { komut } = cliBul('ollama', ayar.yol)
    return { id, kurulu: existsSync(komut), hazir: false }
  }
  if (id === 'openai') {
    if (!ayar.url) return { id, kurulu: false, hazir: false, anahtar: anahtarVar }
    return { id, kurulu: true, hazir: true, anahtar: anahtarVar }
  }
  return { id, kurulu: false, hazir: false }
}

/** OpenAI uyumlu uç noktanın model listesi (anahtar main süreçte kalır). */
export async function uyumluModeller(ayar: SaglayiciAyari, anahtar?: string): Promise<string[] | null> {
  if (!ayar.url) return null
  const r = await jsonGetir<{ data?: { id: string }[] }>(`${ayar.url.replace(/\/+$/, '')}/models`, anahtar, 5000)
  return r ? (r.data ?? []).map((m) => m.id).slice(0, 80) : null
}

// --- ortak CLI koşucusu --------------------------------------------------------------------

interface CliSonucu { kod: number | null; stdout: string; stderr: string; zamanAsimi?: string; hataBaslangic?: string }

function cliKostur(s: KosuSecenegi, komut: string, kabuk: boolean, args: string[], ortam: NodeJS.ProcessEnv,
  satirIsle: (satir: string) => void): Promise<CliSonucu> {
  return new Promise((coz) => {
    let bitti = false
    let tampon = ''
    let stdout = ''
    let stderr = ''
    const surec = spawn(komut, kabuk ? args.map((a) => (/[\s(),*&|<>^]/.test(a) ? `"${a}"` : a)) : args,
      { cwd: s.cwd, env: ortam, shell: kabuk, windowsHide: true })
    const bitir = (r: CliSonucu): void => {
      if (bitti) return
      bitti = true
      clearTimeout(zamanlayici)
      s.sinyal?.removeEventListener('abort', iptal)
      coz(r)
    }
    const oldur = (): void => { try { surec.kill() } catch { /* bitmiş */ } }
    const zamanlayici = setTimeout(() => { oldur(); bitir({ kod: null, stdout, stderr, zamanAsimi: s.t('errTimeout', { n: Math.round(s.sureMs / 60000) }) }) }, s.sureMs)
    const iptal = (): void => { oldur(); bitir({ kod: null, stdout, stderr, zamanAsimi: s.t('errCancelled') }) }
    if (s.sinyal?.aborted) return iptal()
    s.sinyal?.addEventListener('abort', iptal)
    surec.stdout.setEncoding('utf-8')
    surec.stdout.on('data', (p: string) => {
      stdout = (stdout + p).slice(-200_000)
      tampon += p
      const satirlar = tampon.split('\n')
      tampon = satirlar.pop() ?? ''
      satirlar.forEach((l) => l.trim() && satirIsle(l))
    })
    surec.stderr.setEncoding('utf-8')
    surec.stderr.on('data', (p: string) => { stderr = (stderr + p).slice(-4000) })
    surec.on('error', (e) => bitir({ kod: -1, stdout, stderr, hataBaslangic: s.t('errStart', { e: e.message }) }))
    surec.on('close', (kod) => { if (tampon.trim()) satirIsle(tampon); bitir({ kod, stdout, stderr }) })
    surec.stdin.on('error', () => { /* erken kapandı */ })
    surec.stdin.end(s.istem, 'utf-8')
  })
}

function cliHatasi(id: SaglayiciId, ham: string, t: Cevirmen): string {
  if (/log ?in|auth|unauthori[sz]ed|401|api key|credential/i.test(ham)) return t('errProviderLogin', { name: ad(id) })
  if (/not recognized|ENOENT|command not found|bulunamad/i.test(ham)) return t('errProviderMissing', { name: ad(id) })
  return kisalt(ham, 400)
}

// --- OpenAI Codex CLI ------------------------------------------------------------------

async function codexKos(s: GenelKosu): Promise<KosuSonucu> {
  const { komut, kabuk } = cliBul('codex', s.ayar.yol)
  const sonDosya = join(tmpdir(), `atrium-codex-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.txt`)
  let metin = ''
  let hata: string | undefined
  const args = ['exec', '--json', '--skip-git-repo-check', '--sandbox', s.yazma ? 'workspace-write' : 'read-only',
    ...(s.model ? ['-m', s.model] : []), '-o', sonDosya, '-']
  const r = await cliKostur(s, komut, kabuk, args, temizOrtam(), (satir) => {
    let o: Record<string, any>
    try { o = JSON.parse(satir) } catch { return }
    const oge = o.item
    if (oge && (o.type === 'item.started' || o.type === 'item.completed')) {
      if (oge.type === 'command_execution' && o.type === 'item.started') s.etkinlik?.(s.t('toolBash'))
      else if (oge.type === 'file_change' && o.type === 'item.completed')
        for (const d of oge.changes ?? []) s.etkinlik?.(aracSatiri('Edit', { file_path: d.path ?? '' }, s.t))
      else if (oge.type === 'web_search') s.etkinlik?.(aracSatiri('WebSearch', { query: oge.query ?? '' }, s.t))
      else if (oge.type === 'agent_message' && o.type === 'item.completed' && oge.text) {
        metin = String(oge.text)
        s.etkinlik?.(`💬 ${kisalt(metin)}`)
        s.metinParcasi?.(metin)
      }
    } else if (o.type === 'turn.failed' || o.type === 'error') {
      hata = String(o.error?.message ?? o.message ?? 'error')
    } else if (o.msg) {
      // eski sürümlerin olay biçimi
      if (o.msg.type === 'agent_message' && o.msg.message) { metin = String(o.msg.message); s.etkinlik?.(`💬 ${kisalt(metin)}`) }
      else if (o.msg.type === 'exec_command_begin') s.etkinlik?.(s.t('toolBash'))
      else if (o.msg.type === 'error') hata = String(o.msg.message ?? 'error')
    }
  })
  try {
    if (existsSync(sonDosya)) metin = readFileSync(sonDosya, 'utf-8').trim() || metin
  } catch { /* yoksa olaylardan gelen metin */ }
  rmSync(sonDosya, { force: true })
  if (r.hataBaslangic) return { metin: '', maliyetUsd: 0, maliyetTahmini: false, hata: cliHatasi('codex', r.hataBaslangic, s.t) }
  if (r.zamanAsimi) return { metin, maliyetUsd: 0, maliyetTahmini: false, hata: r.zamanAsimi }
  if (hata || (!metin && r.kod !== 0)) return { metin: '', maliyetUsd: 0, maliyetTahmini: false, hata: cliHatasi('codex', hata || r.stderr || `codex exit ${r.kod}`, s.t) }
  return { metin, maliyetUsd: 0, maliyetTahmini: false }
}

// --- Gemini CLI --------------------------------------------------------------------------

const GEMINI_ARACLARI: Record<string, string> = {
  read_file: 'Read', read_many_files: 'Read', list_directory: 'Glob', glob: 'Glob', search_file_content: 'Grep', grep: 'Grep',
  write_file: 'Write', replace: 'Edit', edit: 'Edit', run_shell_command: 'Bash', web_fetch: 'WebFetch', google_web_search: 'WebSearch'
}

async function geminiKos(s: GenelKosu): Promise<KosuSonucu> {
  const { komut, kabuk } = cliBul('gemini', s.ayar.yol)
  const ortam = temizOrtam(s.anahtar ? { GEMINI_API_KEY: s.anahtar } : {})
  let metin = ''
  let hata: string | undefined
  let olayVar = false
  // salt okumada onay isteyen araçlar (kabuk, yazma) başsız modda hiç çalışmaz; yazma izninde yalnız düzenlemeler onaylanır
  const args = ['--output-format', 'stream-json', '--approval-mode', s.yazma ? 'auto_edit' : 'default', ...(s.model ? ['-m', s.model] : [])]
  const r = await cliKostur(s, komut, kabuk, args, ortam, (satir) => {
    let o: Record<string, any>
    try { o = JSON.parse(satir) } catch { return }
    olayVar = true
    if (o.type === 'message' && o.role === 'assistant' && typeof o.content === 'string') {
      metin = o.delta ? metin + o.content : o.content
      s.metinParcasi?.(o.content)
    } else if (o.type === 'tool_use') {
      s.etkinlik?.(aracSatiri(GEMINI_ARACLARI[o.tool_name] ?? String(o.tool_name), o.parameters ?? {}, s.t))
    } else if (o.type === 'error') {
      hata = String(o.message ?? o.error?.message ?? 'error')
    } else if (o.type === 'result' && o.status === 'error') {
      hata = String(o.error?.message ?? hata ?? 'error')
    }
  })
  if (r.hataBaslangic) return { metin: '', maliyetUsd: 0, maliyetTahmini: false, hata: cliHatasi('gemini', r.hataBaslangic, s.t) }
  if (r.zamanAsimi) return { metin, maliyetUsd: 0, maliyetTahmini: false, hata: r.zamanAsimi }
  // stream-json'u bilmeyen eski sürüm: düz metin çıktısı yanıttır
  if (!olayVar && r.kod === 0 && r.stdout.trim()) metin = r.stdout.trim()
  if (hata || (!metin && r.kod !== 0)) return { metin: '', maliyetUsd: 0, maliyetTahmini: false, hata: cliHatasi('gemini', hata || r.stderr || `gemini exit ${r.kod}`, s.t) }
  if (metin) s.etkinlik?.(`💬 ${kisalt(metin)}`)
  return { metin, maliyetUsd: 0, maliyetTahmini: false }
}

// --- Ollama ve OpenAI uyumlu uç noktalar: Atrium'un kendi araç döngüsü --------------------------

interface Cagri { id?: string; ad: string; girdi: Record<string, any> }
interface Cevap { metin: string; cagrilar: Cagri[]; ham: Record<string, any> }

const SISTEM = (yazma: boolean, araclarVar: boolean): string => [
  'You are an AI agent working inside a software project folder for the Atrium app.',
  araclarVar
    ? 'Use the tools to look at the files instead of guessing. Paths are relative to the project root. Open only what you need.'
    : 'You have no file access in this run; work from the information in the message.',
  araclarVar && yazma ? 'You may change files with write_file / replace_in_file, only as much as the task needs.' : '',
  'When you are done, reply with your final answer as plain text (no tool call).'
].filter(Boolean).join('\n')

/** Düşünen modellerin <think> bölümünü yanıttan ayıklar. */
export const dusunceyiAt = (m: string): string => m.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

async function istekGonder(s: GenelKosu, mesajlar: Record<string, any>[], tanimlar: unknown[] | null, sinyal: AbortSignal): Promise<Cevap> {
  const ollama = s.saglayici === 'ollama'
  const url = ollama ? `${ollamaAdresi(s.ayar)}/api/chat` : `${(s.ayar.url ?? '').replace(/\/+$/, '')}/chat/completions`
  const govde = ollama
    ? { model: s.model, messages: mesajlar, stream: false, options: { num_ctx: 16384 }, ...(tanimlar ? { tools: tanimlar } : {}) }
    : { model: s.model, messages: mesajlar, stream: false, ...(tanimlar ? { tools: tanimlar } : {}) }
  const yanit = await fetch(url, {
    method: 'POST', signal: sinyal,
    headers: { 'Content-Type': 'application/json', ...(s.anahtar && !ollama ? { Authorization: `Bearer ${s.anahtar}` } : {}) },
    body: JSON.stringify(govde)
  })
  const metin = await yanit.text()
  if (!yanit.ok) throw Object.assign(new Error(kisalt(metin || `HTTP ${yanit.status}`, 300)), { durum: yanit.status })
  const veri = JSON.parse(metin) as Record<string, any>
  const mesaj = ollama ? veri.message : veri.choices?.[0]?.message
  if (!mesaj) throw new Error(kisalt(metin, 300))
  const cagrilar: Cagri[] = (mesaj.tool_calls ?? []).map((c: Record<string, any>) => {
    let girdi = c.function?.arguments ?? {}
    if (typeof girdi === 'string') { try { girdi = JSON.parse(girdi) } catch { girdi = {} } }
    return { id: c.id, ad: String(c.function?.name ?? ''), girdi }
  })
  return { metin: String(mesaj.content ?? ''), cagrilar, ham: mesaj }
}

async function uyumluKos(s: GenelKosu): Promise<KosuSonucu> {
  const ollama = s.saglayici === 'ollama'
  if (!s.model) return { metin: '', maliyetUsd: 0, maliyetTahmini: false, hata: s.t('errNoModel', { name: ad(s.saglayici) }) }
  if (!ollama && !s.ayar.url) return { metin: '', maliyetUsd: 0, maliyetTahmini: false, hata: s.t('errProviderMissing', { name: ad(s.saglayici) }) }
  const sinyal = AbortSignal.any([AbortSignal.timeout(s.sureMs), ...(s.sinyal ? [s.sinyal] : [])])
  let tanimlar: unknown[] | null = s.araclar.length ? araclar(s.yazma) : null
  const mesajlar: Record<string, any>[] = [{ role: 'system', content: SISTEM(s.yazma, !!tanimlar) }, { role: 'user', content: s.istem }]
  try {
    for (let adim = 0; adim < 40; adim++) {
      let cevap: Cevap
      try {
        cevap = await istekGonder(s, mesajlar, tanimlar, sinyal)
      } catch (e) {
        // araç desteklemeyen model: dosya erişimi olmadan, yalnız istemdeki bilgiyle devam
        if (tanimlar && /tool/i.test((e as Error).message) && (e as { durum?: number }).durum === 400) {
          tanimlar = null
          mesajlar[0] = { role: 'system', content: SISTEM(s.yazma, false) }
          s.etkinlik?.(s.t('toolsUnsupported'))
          continue
        }
        throw e
      }
      if (!cevap.cagrilar.length) {
        const metin = dusunceyiAt(cevap.metin)
        if (metin) { s.etkinlik?.(`💬 ${kisalt(metin)}`); s.metinParcasi?.(metin) }
        return { metin, maliyetUsd: 0, maliyetTahmini: false }
      }
      mesajlar.push(ollama ? cevap.ham : { role: 'assistant', content: cevap.metin || null, tool_calls: cevap.ham.tool_calls })
      for (const c of cevap.cagrilar) {
        const etiket = claudeAdi(c.ad, c.girdi)
        s.etkinlik?.(aracSatiri(etiket.ad, etiket.girdi, s.t))
        const sonuc = aracCalistir(s.cwd, c.ad, c.girdi, s.yazma)
        mesajlar.push(ollama ? { role: 'tool', content: sonuc, tool_name: c.ad } : { role: 'tool', tool_call_id: c.id, content: sonuc })
      }
    }
    return { metin: '', maliyetUsd: 0, maliyetTahmini: false, hata: s.t('errTooManySteps') }
  } catch (e) {
    if (s.sinyal?.aborted) return { metin: '', maliyetUsd: 0, maliyetTahmini: false, hata: s.t('errCancelled') }
    if ((e as Error).name === 'TimeoutError') return { metin: '', maliyetUsd: 0, maliyetTahmini: false, hata: s.t('errTimeout', { n: Math.round(s.sureMs / 60000) }) }
    const mesaj = (e as Error).message
    if (/fetch failed|ECONNREFUSED|ENOTFOUND/i.test(mesaj + String((e as { cause?: unknown }).cause ?? '')))
      return { metin: '', maliyetUsd: 0, maliyetTahmini: false, hata: s.t('errProviderDown', { name: ad(s.saglayici) }) }
    return { metin: '', maliyetUsd: 0, maliyetTahmini: false, hata: cliHatasi(s.saglayici, mesaj, s.t) }
  }
}
