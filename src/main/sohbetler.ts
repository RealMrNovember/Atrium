// Claude Code sohbet kayıtları (~/.claude/projects/<kodlanmış-yol>/<oturum>.jsonl).
// Her sohbet çalıştığı klasöre göre bir kata eşlenir; o sohbette açılan alt ajanlar
// (<oturum>/subagents/agent-*.jsonl) canlıysa katta "misafir ajan" olarak görünür.
import { closeSync, existsSync, openSync, readFileSync, readSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { AktifSohbet, Kat, MisafirAjan, SiradakiAdim, Sohbet, SohbetMesaji, SohbetOzeti } from '@ortak/tipler'
import type { Cevirmen } from '@ortak/i18n'
import { aracSatiri, ATRIUM_ISARETI } from './claude'
import type { AcikOturum } from './oturumlar'

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

/** Asistan mesajındaki "sıradaki adım" kutusu (Claude Desktop'ın wrap_up aracı). */
function siradakiAdim(icerik: unknown): SiradakiAdim | null {
  if (!Array.isArray(icerik)) return null
  const p = icerik.find((x) => x?.type === 'tool_use' && /wrap_up$/.test(String(x.name ?? '')))
  const g = p?.input as { recap?: string; ask?: string; actions?: { label?: string; message?: string }[] } | undefined
  if (!g?.recap) return null
  return {
    ozet: String(g.recap),
    soru: g.ask ? String(g.ask) : undefined,
    dugmeler: (g.actions ?? []).filter((a) => a?.label).slice(0, 3)
      .map((a) => ({ etiket: String(a.label), mesaj: String(a.message || a.label) }))
  }
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
  let bekleyenSoru = ''
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
      bekleyenSoru = '' // kullanıcı yazdıysa önceki soru cevaplanmıştır
      mesaj++
    } else {
      if (metinler.some((m) => m.trim())) mesaj++
      const kutu = siradakiAdim(o.message?.content)
      if (kutu) bekleyenSoru = kutu.soru ?? ''
    }
  }
  const id = dosya.replace(/\.jsonl$/, '')
  let altAjan = 0
  try { altAjan = readdirSync(join(kok, klasor, id, 'subagents')).filter((d) => d.endsWith('.jsonl')).length } catch { /* yok */ }
  const sohbet = atrium || !mesaj ? null : {
    id, klasor, cwd, baslik: baslik || ilkMetin.replace(/\s+/g, ' ').slice(0, 90), ilk, son, mesajSayisi: mesaj, altAjanSayisi: altAjan,
    bekleyenSoru: bekleyenSoru || undefined
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
    if (parcalar.length) mesajlar.push({ rol: o.type === 'user' ? 'sen' : 'claude', metin: parcalar.join('\n\n').slice(0, 12000), zaman: o.timestamp ?? '' })
    const kutu = o.type === 'assistant' ? siradakiAdim(o.message?.content) : null
    if (kutu) mesajlar.push({ rol: 'kutu', metin: kutu.ozet, zaman: o.timestamp ?? '', kutu })
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

/**
 * Claude Code'da şu an açık ya da çalışan sohbetler, katlara göre (Atrium'un kendi koşuları hariç).
 * - çalışıyor: kaydı son dakikada yazılmış
 * - açık: Claude Desktop / IDE'de oturumu açık (süreç listesinden), ama o an boşta
 */
export function aktifSohbetleriTara(kok: string, katlar: Kat[], t: Cevirmen, acik: AcikOturum[] = []): Record<string, AktifSohbet[]> {
  const simdi = Date.now()
  const kimlikli = new Set(acik.filter((o) => o.id).map((o) => o.id!))
  const kimliksiz = acik.filter((o) => !o.id && o.baslangic).sort((a, b) => a.baslangic - b.baslangic)
  const enEski = kimliksiz.length ? kimliksiz[0].baslangic - 10_000 : Infinity

  // adaylar: son dakikada yazılmışlar, kimliği açık listede olanlar ve kimliksiz süreçlerden sonra başlamış olanlar
  const adaylar: { katId: string; klasor: string; yol: string; mtime: number; sohbet: Omit<Sohbet, 'katId'> }[] = []
  for (const klasor of klasorler(kok)) {
    const katId = katEsle(klasor, katlar)
    if (!katId) continue
    let dosyalar: string[] = []
    try { dosyalar = readdirSync(join(kok, klasor)).filter((d) => d.endsWith('.jsonl') && GUVENLI_AD.test(d)) } catch { continue }
    for (const d of dosyalar) {
      const yol = join(kok, klasor, d)
      let mtime = 0
      try { mtime = statSync(yol).mtimeMs } catch { continue }
      const id = d.replace(/\.jsonl$/, '')
      if (simdi - mtime > AKTIF_SOHBET_MS && !kimlikli.has(id) && mtime < enEski) continue
      const sohbet = sohbetiOku(kok, klasor, d)
      if (sohbet) adaylar.push({ katId, klasor, yol, mtime, sohbet })
    }
  }

  const secilen = new Map<string, (typeof adaylar)[number]>()
  for (const a of adaylar) if (simdi - a.mtime <= AKTIF_SOHBET_MS || kimlikli.has(a.sohbet.id)) secilen.set(a.sohbet.id, a)
  // yeni açılan oturumlar: Claude Desktop süreci ilk mesajla başlatır, kayıt da hemen ardından açılır.
  // Her süreç, başlangıcından sonraki 2 dakika içinde başlamış, ona en yakın eşleşmemiş sohbete eşlenir.
  for (const o of kimliksiz) {
    const fark = (a: (typeof adaylar)[number]): number => Date.parse(a.sohbet.ilk) - o.baslangic
    const aday = adaylar
      .filter((a) => !secilen.has(a.sohbet.id) && a.sohbet.ilk && fark(a) >= -10_000 && fark(a) <= 120_000)
      .sort((a, b) => Math.abs(fark(a)) - Math.abs(fark(b)))[0]
    if (aday) secilen.set(aday.sohbet.id, aday)
  }

  const sonuc: Record<string, AktifSohbet[]> = {}
  for (const a of secilen.values()) {
    const calisiyor = simdi - a.mtime <= AKTIF_SOHBET_MS
    ;(sonuc[a.katId] ??= []).push({
      id: a.sohbet.id, klasor: a.klasor, baslik: a.sohbet.baslik, atriumdan: false,
      durum: calisiyor ? 'calisiyor' : 'acik',
      etkinlik: calisiyor ? sonEtkinlik(a.yol, t) : undefined,
      bekleyenSoru: a.sohbet.bekleyenSoru
    })
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
