// Kalıcı veri: şirket profili, katlar (projeler), ajanlar, hafıza, komut geçmişi, maliyet.
// Her şey kullanıcının uygulama veri klasöründe düz JSON / Markdown dosyası olarak durur.
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import type { Ajan, Kat, Komut, PlanLimitleri, SaglayiciId, SirketOzeti, SirketProfili } from '@ortak/tipler'
import { cevirmen, dilSec, type Cevirmen, type Dil } from '@ortak/i18n'

/** Uygulama geneli veri (anahtarlar, hesap, maliyet, plan limitleri). */
let VERI = ''
/** Etkin şirketin klasörü: sirket.json + katlar/ (her şirketin kendi projeleri, ekibi, hafızası, varsayılan aracı). */
let SIRKET = ''
let UYGULAMA = ''
let YEREL: string | undefined

interface SirketKaydi { aktif: string; liste: { id: string }[] }
const kayitDosyasi = (): string => join(VERI, 'sirketler.json')

export function depoBaslat(veriKlasoru: string, uygulamaKoku: string, yerel?: string): void {
  VERI = veriKlasoru
  UYGULAMA = resolve(uygulamaKoku).toLowerCase()
  YEREL = yerel
  mkdirSync(join(VERI, 'sirketler'), { recursive: true })
  // tek şirketli eski düzen → sirketler/ana (bir kez)
  if (!existsSync(kayitDosyasi())) {
    const ana = join(VERI, 'sirketler', 'ana')
    mkdirSync(ana, { recursive: true })
    for (const ad of ['sirket.json', 'katlar']) if (existsSync(join(VERI, ad))) renameSync(join(VERI, ad), join(ana, ad))
    jsonYaz(kayitDosyasi(), { aktif: 'ana', liste: [{ id: 'ana' }] } satisfies SirketKaydi)
  }
  const kayit = jsonOku<SirketKaydi>(kayitDosyasi(), { aktif: 'ana', liste: [{ id: 'ana' }] })
  SIRKET = join(VERI, 'sirketler', kayit.liste.some((k) => k.id === kayit.aktif) ? kayit.aktif : kayit.liste[0]?.id ?? 'ana')
  mkdirSync(join(SIRKET, 'katlar'), { recursive: true })
}

export const veriKlasoru = (): string => VERI
export const sirketKlasoru = (): string => SIRKET

// --- şirketler -------------------------------------------------------------------

export function sirketler(): { aktif: string; liste: SirketOzeti[] } {
  const kayit = jsonOku<SirketKaydi>(kayitDosyasi(), { aktif: 'ana', liste: [{ id: 'ana' }] })
  return {
    aktif: kayit.aktif,
    liste: kayit.liste.map(({ id }) => {
      const p = jsonOku<Partial<SirketProfili>>(join(VERI, 'sirketler', id, 'sirket.json'), {})
      return { id, ad: p.ad || '—', logo: p.logo ?? '', saglayici: (p.ayarlar?.varsayilanSaglayici ?? 'claude') as SaglayiciId, kurulumTamam: !!p.kurulumTamam }
    })
  }
}

/** Yeni şirket: kurulum sihirbazıyla başlar; dil, sohbet klasörü ve tavanlar etkin şirketten devralınır. */
export function sirketEkle(): string {
  const simdiki = profilOku()
  const kayit = jsonOku<SirketKaydi>(kayitDosyasi(), { aktif: 'ana', liste: [{ id: 'ana' }] })
  let id = `s-${Date.now().toString(36)}`
  while (kayit.liste.some((k) => k.id === id)) id += 'x'
  const yeni: SirketProfili = { ...varsayilanProfil(), dil: simdiki.dil, sohbetKlasoru: simdiki.sohbetKlasoru, ayarlar: { ...simdiki.ayarlar } }
  jsonYaz(join(VERI, 'sirketler', id, 'sirket.json'), yeni)
  jsonYaz(kayitDosyasi(), { aktif: id, liste: [...kayit.liste, { id }] } satisfies SirketKaydi)
  SIRKET = join(VERI, 'sirketler', id)
  mkdirSync(join(SIRKET, 'katlar'), { recursive: true })
  return id
}

export function sirketSec(id: string): void {
  const kayit = jsonOku<SirketKaydi>(kayitDosyasi(), { aktif: 'ana', liste: [{ id: 'ana' }] })
  if (!kayit.liste.some((k) => k.id === id)) throw new Error('company')
  jsonYaz(kayitDosyasi(), { ...kayit, aktif: id })
  SIRKET = join(VERI, 'sirketler', id)
  mkdirSync(join(SIRKET, 'katlar'), { recursive: true })
}

/** Şirketi Atrium'dan kaldırır (yalnız Atrium verisi: ekip, hafıza, raporlar — proje klasörlerine dokunulmaz). */
export function sirketSil(id: string): void {
  const kayit = jsonOku<SirketKaydi>(kayitDosyasi(), { aktif: 'ana', liste: [{ id: 'ana' }] })
  if (kayit.aktif === id || kayit.liste.length < 2 || !/^[a-z0-9-]+$/i.test(id)) throw new Error('company')
  jsonYaz(kayitDosyasi(), { ...kayit, liste: kayit.liste.filter((k) => k.id !== id) })
  rmSync(join(VERI, 'sirketler', id), { recursive: true, force: true })
}

/** Komut eklerinin klasörü (Atrium verisinde; proje klasörüne hiçbir şey yazılmaz). */
export const ekKlasoru = (katId: string, komutId: string): string => join(SIRKET, 'katlar', katId, 'ekler', komutId)

export function ekleriKaydet(katId: string, komutId: string, ekler: { ad: string; veri: Uint8Array }[]): string[] {
  const klasor = ekKlasoru(katId, komutId)
  mkdirSync(klasor, { recursive: true })
  const adlar: string[] = []
  for (const e of ekler.slice(0, 10)) {
    if (!e?.veri || e.veri.byteLength > 10 * 1024 * 1024) continue
    let ad = basename(String(e.ad || 'dosya')).replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').slice(0, 120) || 'dosya'
    while (adlar.includes(ad)) ad = `_${ad}`
    writeFileSync(join(klasor, ad), Buffer.from(e.veri))
    adlar.push(ad)
  }
  return adlar
}

/** Yeni proje klasörü (kısa bir README ile). Ad yalnız klasör adı olabilir; kök boşsa ~/Atrium Projects kullanılır. */
export function projeOlustur(kok: string, ad: string): { kok: string; ad: string } {
  const temiz = ad.trim().replace(/\s+/g, ' ')
  if (!temiz || temiz.length > 80 || /[\\/:*?"<>|\x00-\x1f]/.test(temiz) || /^\.+$/.test(temiz) || /[. ]$/.test(temiz)
    || /^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i.test(temiz)) throw new Error(ceviri()('projectNameInvalid'))
  const hedefKok = kok.trim() || join(homedir(), 'Atrium Projects')
  mkdirSync(hedefKok, { recursive: true })
  const yol = join(hedefKok, temiz)
  if (existsSync(yol)) throw new Error(ceviri()('projectExists'))
  mkdirSync(yol)
  writeFileSync(join(yol, 'README.md'), `# ${temiz}
`, 'utf-8')
  return { kok: hedefKok, ad: temiz }
}

/** Şirketteki bütün ajanları tek araca geçirir. */
export function ekibiGecir(saglayici: SaglayiciId, model: string): number {
  let n = 0
  for (const k of katlariTara()) {
    const ajanlar = ajanlariOku(k.id).map((a) => ({ ...a, saglayici, model }))
    n += ajanlar.length
    ajanlariYaz(k.id, ajanlar)
  }
  return n
}

function jsonOku<T>(yol: string, varsayilan: T): T {
  try {
    return JSON.parse(readFileSync(yol, 'utf-8')) as T
  } catch {
    return varsayilan
  }
}

function jsonYaz(yol: string, veri: unknown): void {
  mkdirSync(dirname(yol), { recursive: true })
  writeFileSync(yol, JSON.stringify(veri, null, 2) + '\n', 'utf-8')
}

// --- şirket profili ---------------------------------------------------------

function varsayilanProfil(): SirketProfili {
  const dil = dilSec(YEREL)
  const t = cevirmen(dil)
  return {
    ad: '',
    slogan: t('defaultSlogan'),
    kurucu: t('defaultOwner'),
    kurulus: String(new Date().getFullYear()),
    logo: '',
    dil,
    projeKlasoru: '',
    haricTutulan: [],
    ekProjeler: [],
    katSirasi: [],
    sohbetKlasoru: join(homedir(), '.claude', 'projects'),
    kurulumTamam: false,
    sonGorulenSurum: '',
    ayarlar: {
      kosuButcesiUsd: 1,
      gunlukTavanUsd: 10,
      sohbetButcesiUsd: 5,
      kosuSuresiDk: 15,
      esZamanli: 2,
      simulasyon: false,
      claudeYolu: '',
      ses: true,
      varsayilanSaglayici: 'claude',
      saglayicilar: {}
    }
  }
}

export function profilOku(): SirketProfili {
  const v = varsayilanProfil()
  const p = jsonOku<Partial<SirketProfili>>(join(SIRKET, 'sirket.json'), {})
  return { ...v, ...p, ayarlar: { ...v.ayarlar, ...(p.ayarlar ?? {}) } }
}

export function profilYaz(p: SirketProfili): SirketProfili {
  jsonYaz(join(SIRKET, 'sirket.json'), p)
  return p
}

export const ceviri = (): Cevirmen => cevirmen(profilOku().dil)
export const dil = (): Dil => profilOku().dil

// --- katlar -----------------------------------------------------------------

const TR: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' }

export function slug(ad: string): string {
  return ad
    .replace(/[çğıöşüİ]/g, (h) => TR[h] ?? h)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'proje'
}

function etiketleriBul(yol: string): string[] {
  const var_ = (ad: string): boolean => existsSync(join(yol, ad))
  const etiket = new Set<string>()
  if (var_('package.json')) {
    etiket.add('Node')
    const pkg = jsonOku<{ dependencies?: Record<string, string>; devDependencies?: Record<string, string> }>(
      join(yol, 'package.json'),
      {}
    )
    const bag = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
    for (const [paket, ad] of [
      ['next', 'Next.js'], ['react', 'React'], ['vue', 'Vue'], ['svelte', 'Svelte'],
      ['electron', 'Electron'], ['express', 'Express'], ['react-native', 'React Native'],
      ['remotion', 'Remotion'], ['vite', 'Vite']
    ] as const) {
      if (paket in bag) etiket.add(ad)
    }
  }
  if (var_('tsconfig.json')) etiket.add('TypeScript')
  if (var_('pyproject.toml') || var_('requirements.txt')) etiket.add('Python')
  if (var_('Cargo.toml')) etiket.add('Rust')
  if (var_('go.mod')) etiket.add('Go')
  if (var_('pubspec.yaml')) etiket.add('Flutter')
  if (var_('composer.json')) etiket.add('PHP')
  if (!etiket.size && var_('index.html')) etiket.add('Web')
  try {
    if (readdirSync(yol).some((d) => d.endsWith('.sln') || d.endsWith('.csproj'))) etiket.add('.NET')
  } catch {
    /* okunamayan klasör */
  }
  if (var_('.git')) etiket.add('git')
  return [...etiket]
}

/** Bir klasörün kat olacak alt klasör adları (gizli, `_` ile başlayan ve Atrium'un kendisi hariç). */
export function katAdlari(klasor: string): string[] {
  if (!klasor) return []
  try {
    return readdirSync(klasor)
      .filter((ad) => {
        if (ad.startsWith('.') || ad.startsWith('_') || ad === 'node_modules') return false
        const yol = join(klasor, ad)
        if (resolve(yol).toLowerCase() === UYGULAMA) return false
        try {
          return statSync(yol).isDirectory()
        } catch {
          return false
        }
      })
      .sort((a, b) => a.localeCompare(b))
  } catch {
    return []
  }
}

type KatKaynagi = Pick<SirketProfili, 'projeKlasoru' | 'haricTutulan' | 'ekProjeler'> & Partial<Pick<SirketProfili, 'katSirasi'>>

/** Kat olacak projeler (ad + yol): klasördekiler − hariç tutulanlar + dışarıdan eklenenler.
 *  Sıra: kullanıcının kat sırası, listede olmayanlar sona ada göre. */
export function projeListesi(p: KatKaynagi): { ad: string; yol: string }[] {
  const haric = new Set(p.haricTutulan ?? [])
  const klasordekiler = katAdlari(p.projeKlasoru).filter((ad) => !haric.has(ad)).map((ad) => ({ ad, yol: join(p.projeKlasoru, ad) }))
  const gorulen = new Set(klasordekiler.map((k) => resolve(k.yol).toLowerCase()))
  const ekler = (p.ekProjeler ?? [])
    .filter((yol) => {
      const anahtar = resolve(yol).toLowerCase()
      if (gorulen.has(anahtar) || anahtar === UYGULAMA) return false
      gorulen.add(anahtar)
      try { return statSync(yol).isDirectory() } catch { return false }
    })
    .map((yol) => ({ ad: basename(yol), yol }))
  const sira = new Map((p.katSirasi ?? []).map((yol, i) => [resolve(yol).toLowerCase(), i]))
  const yer = (yol: string): number => sira.get(resolve(yol).toLowerCase()) ?? Number.MAX_SAFE_INTEGER
  return [...klasordekiler, ...ekler].sort((a, b) => yer(a.yol) - yer(b.yol) || a.ad.localeCompare(b.ad))
}

/** Kat sırasını kaydeder (alttan üste proje yolları). */
export function katSirala(siraliYollar: string[]): Kat[] {
  profilYaz({ ...profilOku(), katSirasi: siraliYollar })
  return katlariTara()
}

export function katlariTara(kaynak: KatKaynagi = profilOku()): Kat[] {
  const kullanilan = new Set<string>()
  return projeListesi(kaynak).map(({ ad, yol }, i) => {
    let id = slug(ad)
    while (kullanilan.has(id)) id += '-2'
    kullanilan.add(id)
    const hafizaYolu = join(SIRKET, 'katlar', id, 'hafiza.md')
    const hafizaVar = existsSync(hafizaYolu)
    return {
      id,
      ad,
      yol,
      no: i + 1,
      etiketler: etiketleriBul(yol),
      hafizaVar,
      hafizaGuncelleme: hafizaVar ? statSync(hafizaYolu).mtime.toISOString() : undefined
    }
  })
}

export function katBul(katId: string): Kat {
  const kat = katlariTara().find((k) => k.id === katId)
  if (!kat) throw new Error(`Floor not found: ${katId}`)
  return kat
}

// --- ajanlar ----------------------------------------------------------------

/** Hazır ekip, şirketin varsayılan yapay zeka aracıyla kurulur (Claude dışında model aracın varsayılanıdır). */
export function varsayilanEkip(t: Cevirmen, saglayici: SaglayiciId = 'claude'): Ajan[] {
  const ekip: Ajan[] = [
    { id: 'lider', ad: 'Atlas', rol: t('teamLeadRole'), lider: true, oda: 0, renk: '#7c5cff', model: 'sonnet', gorevTanimi: t('teamLeadDuty') },
    { id: 'gelistirici', ad: 'Nova', rol: t('teamDevRole'), oda: 1, renk: '#2f9e6e', model: 'sonnet', gorevTanimi: t('teamDevDuty') },
    { id: 'tasarimci', ad: 'Iris', rol: t('teamUxRole'), oda: 2, renk: '#e8590c', model: 'sonnet', gorevTanimi: t('teamUxDuty') },
    { id: 'test', ad: 'Orion', rol: t('teamQaRole'), oda: 3, renk: '#1c7ed6', model: 'sonnet', gorevTanimi: t('teamQaDuty') },
    { id: 'arastirmaci', ad: 'Sage', rol: t('teamResRole'), oda: 4, renk: '#c2255c', model: 'sonnet', web: true, gorevTanimi: t('teamResDuty') },
    { id: 'hafiza', ad: 'Echo', rol: t('teamMemRole'), oda: 5, renk: '#868e96', model: 'haiku', gorevTanimi: t('teamMemDuty') }
  ]
  return saglayici === 'claude' ? ekip : ekip.map((a) => ({ ...a, saglayici, model: '' }))
}

const katDosyasi = (katId: string, ad: string): string => join(SIRKET, 'katlar', katId, ad)

export function ajanlariOku(katId: string): Ajan[] {
  return jsonOku<Ajan[] | null>(katDosyasi(katId, 'ajanlar.json'), null) ?? varsayilanEkip(ceviri(), profilOku().ayarlar.varsayilanSaglayici ?? 'claude')
}

export function ajanlariYaz(katId: string, ajanlar: Ajan[]): Ajan[] {
  jsonYaz(katDosyasi(katId, 'ajanlar.json'), ajanlar)
  return ajanlar
}

// --- hafıza -----------------------------------------------------------------

export function hafizaOku(katId: string): string {
  try {
    return readFileSync(katDosyasi(katId, 'hafiza.md'), 'utf-8')
  } catch {
    return ''
  }
}

export function hafizaYaz(katId: string, metin: string): void {
  mkdirSync(dirname(katDosyasi(katId, 'hafiza.md')), { recursive: true })
  writeFileSync(katDosyasi(katId, 'hafiza.md'), metin.trimEnd() + '\n', 'utf-8')
}

/** Hafızadaki bir `## Başlık` bölümünün sonuna satır ekler; bölüm yoksa açar. */
export function hafizayaEkle(katId: string, baslik: string, satirlar: string[], tavan = 30): void {
  if (!satirlar.length) return
  const metin = hafizaOku(katId) || `# Project Memory\n`
  const kacik = baslik.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const desen = new RegExp(`^## ${kacik}\\s*$`, 'm')
  if (!desen.test(metin)) {
    hafizaYaz(katId, `${metin.trimEnd()}\n\n## ${baslik}\n${satirlar.join('\n')}`)
    return
  }
  const [once, sonra] = metin.split(desen)
  const sonrakiBolum = sonra.search(/^## /m)
  const govde = (sonrakiBolum === -1 ? sonra : sonra.slice(0, sonrakiBolum)).trim()
  const kalan = sonrakiBolum === -1 ? '' : sonra.slice(sonrakiBolum)
  const yeni = [...govde.split('\n').filter(Boolean), ...satirlar].slice(-tavan)
  hafizaYaz(katId, `${once}## ${baslik}\n${yeni.join('\n')}\n\n${kalan}`)
}

// --- komutlar ---------------------------------------------------------------

export function komutlariOku(katId: string): Komut[] {
  return jsonOku<Komut[]>(katDosyasi(katId, 'komutlar.json'), [])
}

export function komutKaydet(komut: Komut): void {
  const liste = komutlariOku(komut.katId).filter((k) => k.id !== komut.id)
  jsonYaz(katDosyasi(komut.katId, 'komutlar.json'), [komut, ...liste].slice(0, 200))
}

export function tumKomutlar(): Komut[] {
  let katlar: string[] = []
  try {
    katlar = readdirSync(join(SIRKET, 'katlar'))
  } catch {
    return []
  }
  return katlar.flatMap((k) => komutlariOku(k)).sort((a, b) => b.zaman.localeCompare(a.zaman))
}

// --- plan limitleri -----------------------------------------------------------

export const planLimitleriOku = (): PlanLimitleri | undefined =>
  jsonOku<PlanLimitleri | undefined>(join(VERI, 'limitler.json'), undefined)

export const planLimitleriYaz = (l: PlanLimitleri): void => jsonYaz(join(VERI, 'limitler.json'), l)

// --- maliyet ----------------------------------------------------------------

export const bugun = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type GunlukKullanim = Partial<Record<SaglayiciId, { kosu: number; token: number }>>

/** Araç başına günlük kullanım (koşu ve token), son 30 gün. */
export function kullanimEkle(saglayici: SaglayiciId, token: number): void {
  const yol = join(VERI, 'kullanim.json')
  const veri = jsonOku<Record<string, GunlukKullanim>>(yol, {})
  const gun = (veri[bugun()] ??= {})
  const o = (gun[saglayici] ??= { kosu: 0, token: 0 })
  o.kosu += 1
  o.token += Math.max(0, Math.round(token || 0))
  for (const k of Object.keys(veri).sort().slice(0, -30)) delete veri[k]
  jsonYaz(yol, veri)
}

export const bugunKullanim = (): GunlukKullanim => jsonOku<Record<string, GunlukKullanim>>(join(VERI, 'kullanim.json'), {})[bugun()] ?? {}

export function bugunHarcanan(): number {
  return jsonOku<Record<string, number>>(join(VERI, 'maliyet.json'), {})[bugun()] ?? 0
}

export function maliyetEkle(usd: number): number {
  if (!usd) return bugunHarcanan()
  const yol = join(VERI, 'maliyet.json')
  const kayit = jsonOku<Record<string, number>>(yol, {})
  kayit[bugun()] = Math.round(((kayit[bugun()] ?? 0) + usd) * 10000) / 10000
  jsonYaz(yol, kayit)
  return kayit[bugun()]
}
