// Açılışta sunucudan erişim denetimi: Atrium ücretsiz mi, lisans mı istiyor, bu sürüm hâlâ destekleniyor mu?
// Sunucudaki https://atrium.cicibyte.com/durum.json tek kaynaktır:
//   { "erisim": "acik" | "lisans", "enAzSurum": "1.4.1", "satinAl": "https://…", "lisansDogrula": "https://…",
//     "mesaj": { "tr": "…", "en": "…" } }
// Çevrimdışıyken son bilinen durum kullanılır; doğrulanmış lisans 14 gün çevrimdışı çalışır.
import { app, safeStorage } from 'electron'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { hostname, userInfo } from 'node:os'
import { join } from 'node:path'
import type { Dil, ErisimDurumu } from '@ortak/tipler'

const ADRES = process.env.ATRIUM_ERISIM_URL || 'https://atrium.cicibyte.com/durum.json'
const DENETIM_ARALIGI_MS = 6 * 60 * 60 * 1000
const CEVRIMDISI_LISANS_GUN = 14

interface SunucuDurumu {
  erisim?: 'acik' | 'lisans'
  enAzSurum?: string
  satinAl?: string
  lisansDogrula?: string
  mesaj?: Partial<Record<Dil, string>>
}

interface Onbellek {
  sunucu: SunucuDurumu
  sonDenetim: string
  /** Lisansın sunucuda en son doğrulandığı an. */
  lisansDogrulandi?: string
}

let klasor = ''
let yayinci: (d: ErisimDurumu) => void = () => {}
let dilOku: () => Dil = () => 'en'
let durum: ErisimDurumu = { durum: 'acik', lisansVar: false }

const onbellekDosyasi = (): string => join(klasor, 'erisim.json')
const lisansDosyasi = (): string => join(klasor, 'lisans.bin')

function onbellekOku(): Onbellek | null {
  try { return JSON.parse(readFileSync(onbellekDosyasi(), 'utf-8')) as Onbellek } catch { return null }
}
const onbellekYaz = (o: Onbellek): void => writeFileSync(onbellekDosyasi(), JSON.stringify(o, null, 2))

function lisansOku(): string | undefined {
  try {
    if (!existsSync(lisansDosyasi()) || !safeStorage.isEncryptionAvailable()) return undefined
    return safeStorage.decryptString(readFileSync(lisansDosyasi()))
  } catch {
    return undefined
  }
}

/** Makineyi tanıtan, kişisel bilgi taşımayan kısa özet. */
const makineKimligi = (): string => createHash('sha256').update(`${hostname()}|${userInfo().username}|atrium`).digest('hex').slice(0, 32)

/** "1.4.10" > "1.4.9" */
function eskiMi(surum: string, enAz?: string): boolean {
  if (!enAz) return false
  const a = surum.split('.').map(Number)
  const b = enAz.split('.').map(Number)
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) < (b[i] ?? 0)
  }
  return false
}

function hesapla(o: Onbellek | null): ErisimDurumu {
  const s = o?.sunucu ?? {}
  const mesaj = s.mesaj?.[dilOku()] ?? s.mesaj?.en
  const lisansVar = !!lisansOku()
  const temel = { mesaj, satinAl: s.satinAl, lisansVar }
  if (eskiMi(app.getVersion(), s.enAzSurum)) return { ...temel, durum: 'guncelleme-gerekli', enAzSurum: s.enAzSurum }
  if (s.erisim !== 'lisans') return { ...temel, durum: 'acik' }
  const dogrulama = o?.lisansDogrulandi ? Date.parse(o.lisansDogrulandi) : 0
  const gecerli = lisansVar && Date.now() - dogrulama < CEVRIMDISI_LISANS_GUN * 86_400_000
  return { ...temel, durum: gecerli ? 'acik' : 'kilitli' }
}

function ayarla(d: ErisimDurumu): void {
  durum = d
  yayinci(d)
}

export const erisimDurumu = (): ErisimDurumu => durum

interface Dogrulama {
  /** true/false: sunucu karar verdi · null: karar verilemedi (çevrimdışı, hız sınırı, sunucu hatası) */
  sonuc: boolean | null
  neden?: string
  sinir?: number
}

async function lisansiSunucudaDogrula(s: SunucuDurumu, anahtar: string): Promise<Dogrulama> {
  // yalnız https; geliştirmede yerel test sunucusuna da izin var
  const guvenli = /^https:\/\//.test(s.lisansDogrula ?? '') || (!app.isPackaged && /^http:\/\/127\.0\.0\.1[:/]/.test(s.lisansDogrula ?? ''))
  if (!s.lisansDogrula || !guvenli) return { sonuc: null }
  try {
    const yanit = await fetch(s.lisansDogrula, {
      method: 'POST', signal: AbortSignal.timeout(10_000), headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anahtar, makine: makineKimligi(), surum: app.getVersion() })
    })
    // yalnız 200 + JSON karardır; 429 (hız sınırı), 4xx/5xx kayıtlı lisansı asla silmez
    if (!yanit.ok) return { sonuc: null }
    const veri = (await yanit.json()) as { gecerli?: boolean; neden?: string; sinir?: number }
    if (typeof veri.gecerli !== 'boolean') return { sonuc: null }
    return { sonuc: veri.gecerli, neden: veri.neden, sinir: veri.sinir }
  } catch {
    return { sonuc: null } // çevrimdışı: karar verilemedi
  }
}

/** Sunucudan durumu çeker (çevrimdışıysa son bilinen durum geçerli kalır). */
export async function erisimDenetle(): Promise<ErisimDurumu> {
  let o = onbellekOku()
  try {
    const yanit = await fetch(`${ADRES}?v=${app.getVersion()}&t=${Date.now()}`, { signal: AbortSignal.timeout(8000), cache: 'no-store' })
    if (yanit.ok) {
      const sunucu = (await yanit.json()) as SunucuDurumu
      o = { ...o, sunucu, sonDenetim: new Date().toISOString() }
      // ücretli dönemde kayıtlı lisans her denetimde yeniden doğrulanır (iptal edilen lisans kapanır)
      const anahtar = lisansOku()
      if (sunucu.erisim === 'lisans' && anahtar) {
        const { sonuc } = await lisansiSunucudaDogrula(sunucu, anahtar)
        if (sonuc === true) o.lisansDogrulandi = new Date().toISOString()
        else if (sonuc === false) { o.lisansDogrulandi = undefined; rmSync(lisansDosyasi(), { force: true }) }
      }
      onbellekYaz(o)
    }
  } catch {
    /* çevrimdışı */
  }
  ayarla(hesapla(o))
  return durum
}

/** Kullanıcının girdiği lisans anahtarını doğrular ve şifreli saklar. */
export async function lisansEtkinlestir(anahtar: string): Promise<{ basarili: boolean; durum: ErisimDurumu; neden?: string; sinir?: number }> {
  const temiz = String(anahtar ?? '').trim().slice(0, 200)
  const o = onbellekOku()
  if (!temiz || !o) return { basarili: false, durum }
  const { sonuc, neden, sinir } = await lisansiSunucudaDogrula(o.sunucu, temiz)
  if (sonuc !== true || !safeStorage.isEncryptionAvailable()) return { basarili: false, durum, neden: sonuc === null ? 'baglanti' : neden, sinir }
  writeFileSync(lisansDosyasi(), safeStorage.encryptString(temiz))
  onbellekYaz({ ...o, lisansDogrulandi: new Date().toISOString() })
  ayarla(hesapla(onbellekOku()))
  return { basarili: true, durum }
}

export function erisimBaslat(veriKlasoru: string, dil: () => Dil, yayinla: (d: ErisimDurumu) => void): void {
  klasor = veriKlasoru
  dilOku = dil
  yayinci = yayinla
  // ilk kararı hemen ver (önbellekten), sonra sunucuya sor
  durum = hesapla(onbellekOku())
  void erisimDenetle()
  setInterval(() => void erisimDenetle(), DENETIM_ARALIGI_MS)
}
