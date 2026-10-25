import type { Dil } from '../i18n'
import { de } from './de'
import { en, type SurumNotu } from './en'
import { fr } from './fr'
import { it } from './it'
import { ru } from './ru'
import { tr } from './tr'

export type { SurumNotu }

const NOTLAR: Record<Dil, SurumNotu[]> = { en, tr, de, fr, it, ru }

/** Bütün sürümler, en yenisi önce, seçilen dilde. */
export const surumNotlari = (dil: Dil): SurumNotu[] => NOTLAR[dil] ?? en

export const surumNotu = (dil: Dil, surum: string): SurumNotu | undefined => surumNotlari(dil).find((n) => n.surum === surum)
