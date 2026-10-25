import type { Dil } from '../../i18n'
import { de } from './de'
import { en, type YerelMetinler } from './en'
import { fr } from './fr'
import { it } from './it'
import { ru } from './ru'
import { tr } from './tr'

const METINLER: Record<Dil, YerelMetinler> = { en, tr, de, fr, it, ru }

export type { YerelMetinler }
export const yerelMetinler = (dil: Dil): YerelMetinler => METINLER[dil] ?? en
