// Claude Code sohbet kayıtları (~/.claude/projects/<kodlanmış-yol>/<oturum>.jsonl).
// Her sohbet çalıştığı klasöre göre bir kata eşlenir; o sohbette açılan alt ajanlar
// (<oturum>/subagents/agent-*.jsonl) canlıysa katta "misafir ajan" olarak görünür.
import { closeSync, existsSync, openSync, readFileSync, readSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { AktifSohbet, Kat, MisafirAjan, Sohbet, SohbetMesaji, SohbetOzeti } from '@ortak/tipler'
import type { Cevirmen } from '@ortak/i18n'
import { aracSatiri, ATRIUM_ISARETI } from './claude'

const GUVENLI_AD = /^[A-Za-z0-9._-]+$/
const CANLI_MS = 40_000
const AKTIF_OTURUM_MS = 15 * 60_000

/** Claude Code'un proje klasörü adlandırması: harf ve rakam dışındaki her karakter '-'. */
export const kodla = (yol: string): string => yol.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

interface OnbellekKaydi { mtime: number; boyut: number; sohbet: Omit<Sohbet, 'katId'> | null }
const onbellek = new Map<string, OnbellekKaydi>()

function klasorler(kok: string): string[] {
  try {
    return readdirSync(kok).filter((d) => GUVENLI_AD.test(d) && statSync(join(kok, d)).isDirectory())
  } catch {
    return []
  }
}

/** Klasör adını kata eşler: tam eşleşme ya da projenin alt klasöründe açılmış sohbet. */
export function katEsle(klasor: string, katlar: Kat[]): string | null {
  const k = klasor.toLowerCase()
  let en: { id: string; uzunluk: number } | null = null
  for (const kat of katlar) {
    const kod = kodla(kat.yol)
    if ((k === kod || k.startsWith(kod + '-')) && (!en || kod.length > en.uzunluk)) en = { id: kat.id, uzunluk: kod.length }
  }
  return en?.id ?? null
}

function metinParcalari(icerik: unknown): string[] {
  if (typeof icerik === 'string') return [icerik]
  if (!Array.isArray(icerik)) return []
  return icerik.filter((p) => p?.type === 'text' && typeof p.text === 'string').map((p) => p.text as string)
}

/** Kullanıcının gerçekten yazdığı metin mi (komut etiketleri, sistem notları, araç sonuçları değil). */
const kullaniciMetni = (m: string): boolean => !!m.trim() && !m.trimStart().startsWith('<') && !m.startsWith('[Request interrupted')

function sohbetiOku(kok: string, klasor: string, dosya: string): Omit<Sohbet, 'katId'> | null {
  const yol = join(kok, klasor, dosya)
  let st
  try { st = statSync(yol) } catch { return null }
  const anahtar = `${klasor}/${dosya}`
  const eski = onbellek.get(anahtar)
  if (eski && eski.mtime === st.mtimeMs && eski.boyut === st.size) return eski.sohbet

  let baslik = ''
  let ilkMetin = ''
  let cwd = ''
  let ilk = ''
  let son = ''
  let mesaj = 0
  let atrium = false
  let ilkKullanici = true
  for (const satir of readFileSync(yol, 'utf-8').split('\n')) {
    if (!satir) continue
    let o: Record<string, any>
    try { o = JSON.parse(satir) } catch { continue }
    if (o.type === 'custom-title' && o.customTitle) baslik = String(o.customTitle)
    if (o.type === 'queue-operation' && ilkKullanici && typeof o.content === 'string' && o.content.startsWith(ATRIUM_ISARETI)) atrium = true
    if ((o.type !== 'user' && o.type !== 'assistant') || o.isSidechain) continue
    if (o.timestamp) { ilk ||= o.timestamp; son = o.timestamp }
    if (typeof o.cwd === 'string') cwd ||= o.cwd
    const metinler = metinParcalari(o.message?.content)
    if (o.type === 'user') {
      const yazilan = metinler.filter(kullaniciMetni)
      if (!yazilan.length) continue
      if (ilkKullanici && yazilan[0].startsWith(ATRIUM_ISARETI)) atrium = true
      ilkKullanici = false
      ilkMetin ||= yazilan[0]
      mesaj++
    } else if (metinler.some((m) => m.trim())) mesaj++
  }
  const id = dosya.replace(/\.jsonl$/, '')
  let altAjan = 0
  try { altAjan = readdirSync(join(kok, klasor, id, 'subagents')).filter((d) => d.endsWith('.jsonl')).length } catch { /* yok */ }
  const sohbet = atrium || !mesaj ? null : {
    id, klasor, cwd, baslik: baslik || ilkMetin.replace(/\s+/g, ' ').slice(0, 90), ilk, son, mesajSayisi: mesaj, altAjanSayisi: altAjan
  }
  onbellek.set(anahtar, { mtime: st.mtimeMs, boyut: st.size, sohbet })
  return sohbet
}

export function sohbetleriListele(kok: string, katlar: Kat[], filtre?: { katId: string | null }): Sohbet[] {
  const sonuc: Sohbet[] = []
  for (const klasor of klasorler(kok)) {
    const katId = katEsle(klasor, katlar)
    if (filtre && filtre.katId !== katId) continue
    let dosyalar: string[] = []
    try { dosyalar = readdirSync(join(kok, klasor)).filter((d) => d.endsWith('.jsonl') && GUVENLI_AD.test(d)) } catch { continue }
    for (const d of dosyalar) {
      const s = sohbetiOku(kok, klasor, d)
      if (s) sonuc.push({ ...s, katId })
    }
  }
  return sonuc.sort((a, b) => b.son.localeCompare(a.son))
}

export function sohbetOzeti(kok: string, katlar: Kat[]): SohbetOzeti {
  const hepsi = existsSync(kok) ? sohbetleriListele(kok, katlar) : []
  return { toplam: hepsi.length, eslesen: hepsi.filter((s) => s.katId).length }
}

/** Bir sohbetin bilgisini (cwd dahil) bulur. */
export function sohbetBul(kok: string, klasor: string, id: string): Omit<Sohbet, 'katId'> | null {
  if (!GUVENLI_AD.test(klasor) || !GUVENLI_AD.test(id)) return null
  return sohbetiOku(kok, klasor, `${id}.jsonl`)
}

export function sohbetMesajlari(kok: string, klasor: string, id: string): SohbetMesaji[] {
  if (!GUVENLI_AD.test(klasor) || !GUVENLI_AD.test(id)) return []
  let metin = ''
  try { metin = readFileSync(join(kok, klasor, `${id}.jsonl`), 'utf-8') } catch { return [] }
  const mesajlar: SohbetMesaji[] = []
  for (const satir of metin.split('\n')) {
    if (!satir) continue
    let o: Record<string, any>
    try { o = JSON.parse(satir) } catch { continue }
    if ((o.type !== 'user' && o.type !== 'assistant') || o.isSidechain) continue
    const parcalar = metinParcalari(o.message?.content).filter((m) => (o.type === 'user' ? kullaniciMetni(m) : m.trim()))
    if (!parcalar.length) continue
    mesajlar.push({ rol: o.type === 'user' ? 'sen' : 'claude', metin: parcalar.join('\n\n').slice(0, 12000), zaman: o.timestamp ?? '' })
  }
  return mesajlar.slice(-400)
}

/** Dosyanın son `n` baytını okur (büyük kayıtları baştan okumamak için). */
function sonunuOku(yol: string, n = 24_000): string {
  let fd: number | null = null
  try {
    const boyut = statSync(yol).size
    const bas = Math.max(0, boyut - n)
    const tampon = Buffer.alloc(boyut - bas)
    fd = openSync(yol, 'r')
    readSync(fd, tampon, 0, tampon.length, bas)
    return tampon.toString('utf-8')
  } catch {
    return ''
  } finally {
    if (fd !== null) closeSync(fd)
  }
}

function sonEtkinlik(yol: string, t: Cevirmen): string | undefined {
  const satirlar = sonunuOku(yol).split('\n').reverse()
  for (const satir of satirlar) {
    let o: Record<string, any>
    try { o = JSON.parse(satir) } catch { continue }
    if (o.type !== 'assistant') continue
    const parcalar = (o.message?.content ?? []) as { type: string; name?: string; input?: Record<string, unknown>; text?: string }[]
    const arac = [...parcalar].reverse().find((p) => p.type === 'tool_use')
    if (arac?.name) return aracSatiri(arac.name, arac.input ?? {}, t)
    const yazi = parcalar.find((p) => p.type === 'text' && p.text?.trim())
    if (yazi?.text) return `💬 ${yazi.text.replace(/\s+/g, ' ').slice(0, 60)}`
  }
  return undefined
}

const AKTIF_SOHBET_MS = 60_000

/** Şu an aktif Claude Code sohbetleri (son dakikada yazılmış), katlara göre. Atrium'un kendi koşuları hariç. */
export function aktifSohbetleriTara(kok: string, katlar: Kat[], t: Cevirmen): Record<string, AktifSohbet[]> {
  const sonuc: Record<string, AktifSohbet[]> = {}
  const simdi = Date.now()
  for (const klasor of klasorler(kok)) {
    const katId = katEsle(klasor, katlar)
    if (!katId) continue
    let dosyalar: string[] = []
    try { dosyalar = readdirSync(join(kok, klasor)).filter((d) => d.endsWith('.jsonl') && GUVENLI_AD.test(d)) } catch { continue }
    for (const d of dosyalar) {
      const yol = join(kok, klasor, d)
      try { if (simdi - statSync(yol).mtimeMs > AKTIF_SOHBET_MS) continue } catch { continue }
      const sohbet = sohbetiOku(kok, klasor, d)
      if (!sohbet) continue // Atrium'un kendi koşusu ya da boş
      ;(sonuc[katId] ??= []).push({ id: sohbet.id, klasor, baslik: sohbet.baslik, etkinlik: sonEtkinlik(yol, t), atriumdan: false })
    }
  }
  return sonuc
}

/** Şu an çalışan alt ajanlar, katlara göre. Yalnız son 15 dakikada yazılmış oturumlara bakar. */
export function misafirleriTara(kok: string, katlar: Kat[], t: Cevirmen): Record<string, MisafirAjan[]> {
  const sonuc: Record<string, MisafirAjan[]> = {}
  const simdi = Date.now()
  for (const klasor of klasorler(kok)) {
    const katId = katEsle(klasor, katlar)
    if (!katId) continue
    let dosyalar: string[] = []
    try { dosyalar = readdirSync(join(kok, klasor)).filter((d) => d.endsWith('.jsonl')) } catch { continue }
    for (const d of dosyalar) {
      const oturum = join(kok, klasor, d)
      try { if (simdi - statSync(oturum).mtimeMs > AKTIF_OTURUM_MS) continue } catch { continue }
      const altKlasor = join(kok, klasor, d.replace(/\.jsonl$/, ''), 'subagents')
      let ajanlar: string[] = []
      try { ajanlar = readdirSync(altKlasor).filter((a) => a.endsWith('.jsonl')) } catch { continue }
      for (const a of ajanlar) {
        const yol = join(altKlasor, a)
        let mtime = 0
        try { mtime = statSync(yol).mtimeMs } catch { continue }
        if (simdi - mtime > CANLI_MS) continue
        let meta: { agentType?: string; description?: string } = {}
        try { meta = JSON.parse(readFileSync(yol.replace(/\.jsonl$/, '.meta.json'), 'utf-8')) } catch { /* meta yok */ }
        const baslik = onbellek.get(`${klasor}/${d}`)?.sohbet?.baslik ?? ''
        ;(sonuc[katId] ??= []).push({
          id: a.replace(/\.jsonl$/, ''),
          tur: meta.agentType || 'agent',
          aciklama: meta.description || '',
          etkinlik: sonEtkinlik(yol, t),
          sohbetBasligi: baslik,
          sonEtkinlik: new Date(mtime).toISOString()
        })
      }
    }
  }
  return sonuc
}
