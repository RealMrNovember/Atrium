import type { Dil } from '../i18n'
import { de } from './de'
import { en } from './en'
import { fr } from './fr'
import { it } from './it'
import { ru } from './ru'
import { tr } from './tr'

const KILAVUZ: Record<Dil, string> = { en, tr, de, fr, it, ru }

export const kilavuz = (dil: Dil): string => KILAVUZ[dil] ?? en
