// Kendi araç döngüsü olmayan modeller (Ollama, OpenAI uyumlu uç noktalar) için dosya araçları.
// Her yol proje klasörünün içinde kalmak zorunda; gizli dosyalar hiç açılmaz, kabuk komutu yoktur.
import { existsSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

const ATLANAN = new Set(['node_modules', '.git', 'dist', 'out', 'build', '.next', '.venv', 'venv', '__pycache__', 'target', '.idea', '.vs'])
const GIZLI = [/(^|[\\/])\.env(\..*)?$/i, /\.pem$/i, /\.key$/i, /(^|[\\/])id_(rsa|ed25519|ecdsa)[^\\/]*$/i, /\.p12$/i, /\.pfx$/i, /(^|[\\/])\.npmrc$/i, /(^|[\\/])credentials(\.json)?$/i]
const OKUMA_SINIRI = 60_000
const DOSYA_SINIRI = 1_500_000

export interface AracTanimi {
  type: 'function'
  function: { name: string; description: string; parameters: Record<string, unknown> }
}

const tanim = (name: string, description: string, ozellikler: Record<string, unknown>, gerekli: string[]): AracTanimi => ({
  type: 'function', function: { name, description, parameters: { type: 'object', properties: ozellikler, required: gerekli } }
})

export function araclar(yazma: boolean): AracTanimi[] {
  const metin = { type: 'string' }
  return [
    tanim('list_files', 'List files and folders under a path of the project (relative to the project root). Use "." for the root.',
      { path: metin, depth: { type: 'integer', description: '1-3, default 2' } }, ['path']),
    tanim('read_file', 'Read a text file of the project. Large files are cut; use start_line to read further.',
      { path: metin, start_line: { type: 'integer' } }, ['path']),
    tanim('search_text', 'Search all project text files for a word or phrase (case-insensitive). Returns file:line matches.',
      { query: metin, path: { type: 'string', description: 'optional folder to search in' } }, ['query']),
    ...(yazma
      ? [
          tanim('write_file', 'Create or overwrite a project file with the given full content.', { path: metin, content: metin }, ['path', 'content']),
          tanim('replace_in_file', 'Replace an exact piece of text in a project file (old_text must appear exactly once).',
            { path: metin, old_text: metin, new_text: metin }, ['path', 'old_text', 'new_text'])
        ]
      : [])
  ]
}

/** Göreli yolu proje içinde çözer; dışarı çıkan ya da gizli dosyaya giden yolu reddeder. */
function guvenliYol(kok: string, yol: string): string {
  const kokGercek = realpathSync(kok)
  const hedef = resolve(kokGercek, String(yol || '.'))
  const gercek = existsSync(hedef) ? realpathSync(hedef) : hedef
  const rel = relative(kokGercek, gercek)
  if (rel.startsWith('..') || resolve(kokGercek, rel) !== gercek) throw new Error('path is outside the project')
  if (GIZLI.some((r) => r.test(gercek))) throw new Error('secret files are never opened')
  return gercek
}

function listele(kok: string, klasor: string, derinlik: number, satirlar: string[], girinti = ''): void {
  let girdiler: string[]
  try { girdiler = readdirSync(klasor).sort() } catch { return }
  for (const ad of girdiler) {
    if (satirlar.length >= 400) return
    if (ATLANAN.has(ad)) continue
    const tam = join(klasor, ad)
    if (GIZLI.some((r) => r.test(tam))) continue // gizli dosyanın adı bile gösterilmez
    let klasorMu = false
    try { klasorMu = statSync(tam).isDirectory() } catch { continue }
    satirlar.push(`${girinti}${ad}${klasorMu ? '/' : ''}`)
    if (klasorMu && derinlik > 1) listele(kok, tam, derinlik - 1, satirlar, girinti + '  ')
  }
}

function ara(kok: string, klasor: string, aranan: string, sonuc: string[], sayac: { dosya: number }): void {
  let girdiler: string[]
  try { girdiler = readdirSync(klasor) } catch { return }
  for (const ad of girdiler) {
    if (sonuc.length >= 150 || sayac.dosya > 4000) return
    if (ATLANAN.has(ad)) continue
    const tam = join(klasor, ad)
    let st
    try { st = statSync(tam) } catch { continue }
    if (st.isDirectory()) { ara(kok, tam, aranan, sonuc, sayac); continue }
    if (st.size > DOSYA_SINIRI || GIZLI.some((r) => r.test(tam))) continue
    sayac.dosya++
    let icerik: string
    try { icerik = readFileSync(tam, 'utf-8') } catch { continue }
    if (icerik.includes('\u0000')) continue
    const satirlar = icerik.split('\n')
    for (let i = 0; i < satirlar.length && sonuc.length < 150; i++) {
      if (satirlar[i].toLowerCase().includes(aranan)) sonuc.push(`${relative(kok, tam).split(sep).join('/')}:${i + 1}: ${satirlar[i].trim().slice(0, 200)}`)
    }
  }
}

/** Bir araç çağrısını çalıştırır; hata da modelin okuyacağı metin olarak döner. */
export function aracCalistir(kok: string, ad: string, girdi: Record<string, any>, yazma: boolean): string {
  try {
    switch (ad) {
      case 'list_files': {
        const klasor = guvenliYol(kok, girdi.path)
        const satirlar: string[] = []
        listele(kok, klasor, Math.min(3, Math.max(1, Number(girdi.depth) || 2)), satirlar)
        return satirlar.join('\n') || '(empty)'
      }
      case 'read_file': {
        const dosya = guvenliYol(kok, girdi.path)
        if (statSync(dosya).size > DOSYA_SINIRI * 4) return 'file is too large'
        const satirlar = readFileSync(dosya, 'utf-8').split('\n')
        const bas = Math.max(1, Number(girdi.start_line) || 1)
        let cikti = ''
        let i = bas - 1
        for (; i < satirlar.length && cikti.length < OKUMA_SINIRI; i++) cikti += `${i + 1}\t${satirlar[i]}\n`
        return i < satirlar.length ? `${cikti}… (cut at line ${i}; ${satirlar.length} lines total — call again with start_line=${i + 1})` : cikti
      }
      case 'search_text': {
        const aranan = String(girdi.query ?? '').toLowerCase()
        if (aranan.length < 2) return 'query is too short'
        const sonuc: string[] = []
        ara(kok, guvenliYol(kok, girdi.path || '.'), aranan, sonuc, { dosya: 0 })
        return sonuc.join('\n') || 'no matches'
      }
      case 'write_file': {
        if (!yazma) return 'writing is not allowed in this run'
        const dosya = guvenliYol(kok, girdi.path)
        mkdirSync(dirname(dosya), { recursive: true })
        writeFileSync(dosya, String(girdi.content ?? ''), 'utf-8')
        return 'written'
      }
      case 'replace_in_file': {
        if (!yazma) return 'writing is not allowed in this run'
        const dosya = guvenliYol(kok, girdi.path)
        const icerik = readFileSync(dosya, 'utf-8')
        const eski = String(girdi.old_text ?? '')
        const adet = eski ? icerik.split(eski).length - 1 : 0
        if (adet !== 1) return `old_text found ${adet} times; it must be exactly once`
        writeFileSync(dosya, icerik.replace(eski, () => String(girdi.new_text ?? '')), 'utf-8')
        return 'replaced'
      }
      default:
        return `unknown tool ${ad}`
    }
  } catch (e) {
    return `error: ${(e as Error).message}`
  }
}

/** Araç adını Atrium'un etkinlik satırı adlarına çevirir (Claude araç adlarıyla aynı çeviri anahtarları). */
export function claudeAdi(ad: string, girdi: Record<string, any>): { ad: string; girdi: Record<string, unknown> } {
  switch (ad) {
    case 'list_files': return { ad: 'Glob', girdi: { pattern: girdi.path ?? '.' } }
    case 'read_file': return { ad: 'Read', girdi: { file_path: girdi.path ?? '' } }
    case 'search_text': return { ad: 'Grep', girdi: { pattern: girdi.query ?? '' } }
    case 'write_file': return { ad: 'Write', girdi: { file_path: girdi.path ?? '' } }
    case 'replace_in_file': return { ad: 'Edit', girdi: { file_path: girdi.path ?? '' } }
    default: return { ad, girdi }
  }
}
