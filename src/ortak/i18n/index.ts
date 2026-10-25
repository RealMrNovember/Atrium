import { de } from './de'
import { en, type Anahtar } from './en'
import { fr } from './fr'
import { it } from './it'
import { ru } from './ru'
import { tr } from './tr'

export type { Anahtar }
export type Dil = 'en' | 'tr' | 'de' | 'fr' | 'it' | 'ru'

export const DILLER: { kod: Dil; ad: string; bayrak: string; ingilizce: string }[] = [
  { kod: 'en', ad: 'English', bayrak: '🇬🇧', ingilizce: 'English' },
  { kod: 'tr', ad: 'Türkçe', bayrak: '🇹🇷', ingilizce: 'Turkish' },
  { kod: 'de', ad: 'Deutsch', bayrak: '🇩🇪', ingilizce: 'German' },
  { kod: 'fr', ad: 'Français', bayrak: '🇫🇷', ingilizce: 'French' },
  { kod: 'it', ad: 'Italiano', bayrak: '🇮🇹', ingilizce: 'Italian' },
  { kod: 'ru', ad: 'Русский', bayrak: '🇷🇺', ingilizce: 'Russian' }
]

const SOZLUK: Record<Dil, Record<Anahtar, string>> = { en, tr, de, fr, it, ru }

export type Cevirmen = (anahtar: Anahtar, degerler?: Record<string, string | number>) => string

export function cevirmen(dil: Dil): Cevirmen {
  const s = SOZLUK[dil] ?? en
  return (anahtar, degerler) => {
    let metin: string = s[anahtar] ?? en[anahtar] ?? anahtar
    if (degerler) for (const [k, v] of Object.entries(degerler)) metin = metin.split(`{${k}}`).join(String(v))
    return metin
  }
}

/** İşletim sisteminin dilinden desteklenen en yakın dil. */
export function dilSec(yerel: string | undefined): Dil {
  const kod = (yerel ?? 'en').slice(0, 2).toLowerCase()
  return (DILLER.find((d) => d.kod === kod)?.kod ?? 'en') as Dil
}

export const dilAdiIngilizce = (dil: Dil): string => DILLER.find((d) => d.kod === dil)?.ingilizce ?? 'English'
