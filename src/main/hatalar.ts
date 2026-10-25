// Son hatalar: kullanıcı isterse bir hata raporuna eklenir. Hiçbir yere kendiliğinden gönderilmez.
// Kaydedilmeden önce kişisel yollar ve anahtara benzeyen her şey ayıklanır.
import { homedir } from 'node:os'

export interface HataKaydi { zaman: string; kaynak: string; mesaj: string }

const SINIR = 20
const kayitlar: HataKaydi[] = []
let gizlenecekYollar: () => string[] = () => []

export const hataYollariniAyarla = (f: () => string[]): void => { gizlenecekYollar = f }

const kacisla = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Metindeki kullanıcı klasörünü, proje yollarını ve anahtar benzeri dizgeleri gizler. */
export function ayikla(metin: string): string {
  let s = String(metin ?? '')
  const yollar = [...gizlenecekYollar().map((y) => [y, '<projeler>'] as const), [homedir(), '~'] as const]
  for (const [yol, yerine] of yollar) {
    if (!yol) continue
    for (const bicim of new Set([yol, yol.replace(/\\/g, '/'), yol.replace(/\//g, '\\')])) s = s.replace(new RegExp(kacisla(bicim), 'gi'), yerine)
  }
  return s
    .replace(/\b(sk|rk|pk|key|token|ghp|gho|xox[abp])[-_][A-Za-z0-9_-]{12,}/gi, '[gizli]')
    .replace(/\bAIza[0-9A-Za-z_-]{20,}/g, '[gizli]')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[e-posta]')
    .slice(0, 600)
}

export function hataKaydet(kaynak: string, mesaj: string): void {
  kayitlar.unshift({ zaman: new Date().toISOString(), kaynak: ayikla(kaynak).slice(0, 60), mesaj: ayikla(mesaj) })
  kayitlar.length = Math.min(kayitlar.length, SINIR)
}

export const sonHatalar = (n = 10): HataKaydi[] => kayitlar.slice(0, n)
