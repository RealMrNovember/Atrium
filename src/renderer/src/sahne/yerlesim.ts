// Kat planı ve izometrik dönüşüm. Kat 16×10 karo: üstte 4 oda, ortada koridor, altta 4 oda.
// Oda 0 her zaman liderin odasıdır.

export const KARO_G = 56 // karo genişliği (ekranda)
export const KARO_Y = 28 // karo yüksekliği (ekranda)
export const KAT_G = 16
export const KAT_D = 10
export const ODA_G = 4
export const ODA_D = 4
export const KORIDOR_Y = 5 // koridorun orta çizgisi (y=4..6)
export const DUVAR_DIS = 64
export const DUVAR_IC = 30
export const ODA_SAYISI = 8

export interface Nokta { x: number; y: number }
export interface Ekran { sx: number; sy: number }

const KAYDIR_X = KAT_D * (KARO_G / 2) + 20
const KAYDIR_Y = DUVAR_DIS + 30

export function iso(x: number, y: number, z = 0): Ekran {
  return { sx: (x - y) * (KARO_G / 2) + KAYDIR_X, sy: (x + y) * (KARO_Y / 2) + KAYDIR_Y - z }
}

export const SAHNE_G = (KAT_G + KAT_D) * (KARO_G / 2) + 40
export const SAHNE_Y = (KAT_G + KAT_D) * (KARO_Y / 2) + KAYDIR_Y + 30

export const cokgen = (noktalar: Ekran[]): string => noktalar.map((n) => `${n.sx.toFixed(1)},${n.sy.toFixed(1)}`).join(' ')

/** Zemin dikdörtgeni (x0,y0)-(x0+g,y0+d) için izometrik çokgen. */
export function zemin(x0: number, y0: number, g: number, d: number, z = 0): string {
  return cokgen([iso(x0, y0, z), iso(x0 + g, y0, z), iso(x0 + g, y0 + d, z), iso(x0, y0 + d, z)])
}

export interface Oda {
  no: number
  x0: number
  y0: number
  ust: boolean // üst sıra mı (kapısı önde) — alt sıranın kapısı arkada
  /** Ajanın oturduğu yer. */
  koltuk: Nokta
  /** Masanın merkezi. */
  masa: Nokta
  /** Kapının oda içindeki ve koridordaki noktası. */
  kapiIc: Nokta
  kapiDis: Nokta
}

export function odalar(): Oda[] {
  return Array.from({ length: ODA_SAYISI }, (_, no) => {
    const ust = no < 4
    const x0 = (no % 4) * ODA_G
    const y0 = ust ? 0 : 6
    const kapiX = x0 + 0.9
    return {
      no, x0, y0, ust,
      masa: { x: x0 + 2.5, y: y0 + 1.2 },
      koltuk: { x: x0 + 2.5, y: y0 + 2.05 },
      kapiIc: { x: kapiX, y: ust ? y0 + ODA_D - 0.6 : y0 + 0.6 },
      kapiDis: { x: kapiX, y: ust ? 4.6 : 5.4 }
    }
  })
}

const ODALAR = odalar()

/** Lider odasında rapor/emir için bekleme noktaları (sıra numarasına göre). */
export function liderOnu(sira: number): Nokta {
  // liderin iki yanında, tabeladan (ön köşe) uzakta
  const yerler: Nokta[] = [
    { x: 1.1, y: 2.5 }, { x: 3.45, y: 1.9 }, { x: 1.0, y: 3.3 }, { x: 3.5, y: 2.7 }, { x: 0.6, y: 1.8 }
  ]
  return yerler[sira % yerler.length]
}

function odaNo(n: Nokta): number | null {
  if (n.y > 4 && n.y < 6) return null
  const sutun = Math.min(3, Math.max(0, Math.floor(n.x / ODA_G)))
  return n.y <= 4 ? sutun : sutun + 4
}

/** İki nokta arası kapılardan ve koridordan geçen yol. */
export function yolBul(bas: Nokta, son: Nokta): Nokta[] {
  const a = odaNo(bas)
  const b = odaNo(son)
  if (a !== null && a === b) return [bas, son]
  const yol: Nokta[] = [bas]
  if (a !== null) yol.push(ODALAR[a].kapiIc, ODALAR[a].kapiDis)
  if (b !== null) yol.push({ x: ODALAR[b].kapiDis.x, y: a !== null ? ODALAR[a].kapiDis.y : bas.y }, ODALAR[b].kapiDis, ODALAR[b].kapiIc)
  yol.push(son)
  return yol
}

export function yolUzunlugu(yol: Nokta[]): number {
  let t = 0
  for (let i = 1; i < yol.length; i++) t += Math.hypot(yol[i].x - yol[i - 1].x, yol[i].y - yol[i - 1].y)
  return t
}

/** Yol üzerinde 0..1 oranındaki nokta. */
export function yolNoktasi(yol: Nokta[], oran: number): Nokta {
  const toplam = yolUzunlugu(yol)
  if (toplam === 0) return yol[yol.length - 1]
  let kalan = Math.min(1, Math.max(0, oran)) * toplam
  for (let i = 1; i < yol.length; i++) {
    const p = yol[i - 1]
    const q = yol[i]
    const d = Math.hypot(q.x - p.x, q.y - p.y)
    if (kalan <= d) {
      const t = d === 0 ? 1 : kalan / d
      return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t }
    }
    kalan -= d
  }
  return yol[yol.length - 1]
}
