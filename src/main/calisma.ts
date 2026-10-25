// Değişiklik önizlemesi: yazma izinli komutta ajanlar projenin geçici bir kopyasında (çalışma alanı) çalışır.
// İş bitince kopya ile başlangıç durumu karşılaştırılır; sahibi onaylarsa değişen dosyalar projeye yazılır,
// eski hâlleri yedeklenir (Geri al). Onay verilmeden projeye hiçbir şey yazılmaz.
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { createTwoFilesPatch } from 'diff'
import type { DegisenDosya, DegisiklikOzeti } from '@ortak/tipler'

// derleme çıktıları, bağımlılıklar ve sürüm denetimi kopyalanmaz (ajanlar komut çalıştırmaz, kaynakla çalışır)
const ATLANAN = new Set(['node_modules', '.git', 'dist', 'out', '.next', '.nuxt', '.venv', 'venv', '__pycache__', 'target', '.idea', '.vs', '.gradle', 'Pods', '.dart_tool', 'coverage', '.turbo', '.cache'])
const DOSYA_SINIRI = 5 * 1024 * 1024
const ADET_SINIRI = 20_000
const TOPLAM_SINIRI = 400 * 1024 * 1024

interface Kayit { boyut: number; ozet: string }
type Manifest = Record<string, Kayit>

const ozet = (yol: string): string => createHash('sha1').update(readFileSync(yol)).digest('hex')
const goreli = (kok: string, yol: string): string => relative(kok, yol).split(sep).join('/')

function gez(kok: string, f: (tam: string, boyut: number) => void): void {
  const yigin = [kok]
  while (yigin.length) {
    const klasor = yigin.pop()!
    let girdiler: string[]
    try { girdiler = readdirSync(klasor) } catch { continue }
    for (const ad of girdiler) {
      if (ATLANAN.has(ad)) continue
      const tam = join(klasor, ad)
      let st
      try { st = statSync(tam) } catch { continue }
      if (st.isDirectory()) yigin.push(tam)
      else if (st.isFile() && st.size <= DOSYA_SINIRI) f(tam, st.size)
    }
  }
}

export class CalismaAlaniBuyuk extends Error {}

/** Projeyi çalışma alanına kopyalar ve başlangıç manifestini yazar. */
export function calismaAlaniHazirla(proje: string, alan: string): void {
  rmSync(alan, { recursive: true, force: true })
  const dosyalar: { tam: string; boyut: number }[] = []
  let toplam = 0
  gez(proje, (tam, boyut) => { dosyalar.push({ tam, boyut }); toplam += boyut })
  if (dosyalar.length > ADET_SINIRI || toplam > TOPLAM_SINIRI) throw new CalismaAlaniBuyuk(`${dosyalar.length} files, ${Math.round(toplam / 1e6)} MB`)
  const kopya = join(alan, 'proje')
  const manifest: Manifest = {}
  for (const { tam, boyut } of dosyalar) {
    const rel = goreli(proje, tam)
    const hedef = join(kopya, rel)
    mkdirSync(dirname(hedef), { recursive: true })
    copyFileSync(tam, hedef)
    manifest[rel] = { boyut, ozet: ozet(tam) }
  }
  mkdirSync(kopya, { recursive: true })
  writeFileSync(join(alan, 'manifest.json'), JSON.stringify(manifest))
}

export const calismaKopyasi = (alan: string): string => join(alan, 'proje')

function manifestOku(alan: string): Manifest {
  try { return JSON.parse(readFileSync(join(alan, 'manifest.json'), 'utf-8')) as Manifest } catch { return {} }
}

/** Ajanların yaptığı değişiklikler (çalışma alanı ↔ başlangıç). */
export function degisiklikleriBul(alan: string): DegisenDosya[] {
  const manifest = manifestOku(alan)
  const kopya = calismaKopyasi(alan)
  const sonuc: DegisenDosya[] = []
  const gorulen = new Set<string>()
  gez(kopya, (tam) => {
    const rel = goreli(kopya, tam)
    gorulen.add(rel)
    const eski = manifest[rel]
    if (!eski) sonuc.push({ yol: rel, tur: 'eklendi', ...satirSayilari(undefined, tam) })
    else if (eski.ozet !== ozet(tam)) sonuc.push({ yol: rel, tur: 'degisti', ...satirSayilari(eski, tam, alan, rel) })
  })
  for (const rel of Object.keys(manifest)) if (!gorulen.has(rel)) sonuc.push({ yol: rel, tur: 'silindi', eklenen: 0, silinen: 0 })
  return sonuc.sort((a, b) => a.yol.localeCompare(b.yol))
}

const ikiliMi = (b: Buffer): boolean => b.subarray(0, 8000).includes(0)

function satirSayilari(_eski: Kayit | undefined, tam: string, alan?: string, rel?: string): { eklenen: number; silinen: number; ikili?: boolean } {
  const yeni = readFileSync(tam)
  if (ikiliMi(yeni)) return { eklenen: 0, silinen: 0, ikili: true }
  if (!alan || !rel) return { eklenen: yeni.toString('utf-8').split('\n').length, silinen: 0 }
  const eskiMetin = eskiIcerik(alan, rel)
  if (eskiMetin === null) return { eklenen: 0, silinen: 0, ikili: true }
  const yama = createTwoFilesPatch(rel, rel, eskiMetin, yeni.toString('utf-8'), '', '', { context: 0 })
  let eklenen = 0
  let silinen = 0
  for (const s of yama.split('\n').slice(2)) {
    if (s.startsWith('+') && !s.startsWith('+++')) eklenen++
    else if (s.startsWith('-') && !s.startsWith('---')) silinen++
  }
  return { eklenen, silinen }
}

/** Başlangıçtaki içerik: projeden okunur (henüz uygulanmadıysa proje başlangıç hâlindedir). */
function eskiIcerik(alan: string, rel: string): string | null {
  const proje = readFileSync(join(alan, 'proje-yolu.txt'), 'utf-8')
  const yol = join(proje, rel)
  if (!existsSync(yol)) return ''
  const b = readFileSync(yol)
  return ikiliMi(b) ? null : b.toString('utf-8')
}

export function projeYoluKaydet(alan: string, proje: string): void {
  writeFileSync(join(alan, 'proje-yolu.txt'), proje)
}

/** Tek dosyanın birleşik farkı (unified diff). */
export function dosyaFarki(alan: string, rel: string): string {
  const yeniYol = join(calismaKopyasi(alan), rel)
  const eski = eskiIcerik(alan, rel)
  const yeni = existsSync(yeniYol) ? readFileSync(yeniYol) : Buffer.from('')
  if (eski === null || ikiliMi(yeni)) return ''
  return createTwoFilesPatch(`a/${rel}`, `b/${rel}`, eski, yeni.toString('utf-8'), '', '', { context: 3 })
}

/** Seçilen değişiklikleri projeye yazar; projede o arada değişen dosyalar çakışma sayılır ve atlanır. */
export function degisiklikleriUygula(alan: string, proje: string, yedek: string, yollar: string[]): { uygulanan: string[]; cakisan: string[] } {
  const manifest = manifestOku(alan)
  const kopya = calismaKopyasi(alan)
  const uygulanan: string[] = []
  const cakisan: string[] = []
  mkdirSync(yedek, { recursive: true })
  const yedekListesi: Record<string, 'vardi' | 'yoktu'> = {}
  for (const rel of yollar) {
    if (rel.includes('..')) continue
    const hedef = join(proje, rel)
    const kaynak = join(kopya, rel)
    const baslangic = manifest[rel]
    const simdi = existsSync(hedef) ? ozet(hedef) : undefined
    // komut çalışırken sahibi dosyayı değiştirdiyse üzerine yazma
    if ((baslangic?.ozet ?? undefined) !== simdi) { cakisan.push(rel); continue }
    if (existsSync(hedef)) {
      mkdirSync(dirname(join(yedek, rel)), { recursive: true })
      copyFileSync(hedef, join(yedek, rel))
      yedekListesi[rel] = 'vardi'
    } else yedekListesi[rel] = 'yoktu'
    if (existsSync(kaynak)) {
      mkdirSync(dirname(hedef), { recursive: true })
      copyFileSync(kaynak, hedef)
    } else if (existsSync(hedef)) unlinkSync(hedef)
    uygulanan.push(rel)
  }
  writeFileSync(join(yedek, 'yedek.json'), JSON.stringify(yedekListesi))
  return { uygulanan, cakisan }
}

/** Uygulanan değişiklikleri geri alır (yedekten). */
export function geriAl(yedek: string, proje: string): string[] {
  let liste: Record<string, 'vardi' | 'yoktu'> = {}
  try { liste = JSON.parse(readFileSync(join(yedek, 'yedek.json'), 'utf-8')) } catch { return [] }
  const geri: string[] = []
  for (const [rel, durum] of Object.entries(liste)) {
    if (rel.includes('..')) continue
    const hedef = join(proje, rel)
    if (durum === 'vardi') {
      mkdirSync(dirname(hedef), { recursive: true })
      copyFileSync(join(yedek, rel), hedef)
    } else if (existsSync(hedef)) unlinkSync(hedef)
    geri.push(rel)
  }
  return geri
}

export const ozetle = (dosyalar: DegisenDosya[]): Pick<DegisiklikOzeti, 'eklenen' | 'silinen'> =>
  dosyalar.reduce((t, d) => ({ eklenen: t.eklenen + d.eklenen, silinen: t.silinen + d.silinen }), { eklenen: 0, silinen: 0 })
