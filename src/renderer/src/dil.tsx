import { createContext, useContext, useMemo, type ReactElement, type ReactNode } from 'react'
import { cevirmen, type Cevirmen, type Dil } from '@ortak/i18n'

const DilBaglami = createContext<{ dil: Dil; t: Cevirmen }>({ dil: 'en', t: cevirmen('en') })

export function DilSaglayici({ dil, children }: { dil: Dil; children: ReactNode }): ReactElement {
  const deger = useMemo(() => ({ dil, t: cevirmen(dil) }), [dil])
  return <DilBaglami.Provider value={deger}>{children}</DilBaglami.Provider>
}

export const useDil = (): { dil: Dil; t: Cevirmen } => useContext(DilBaglami)
