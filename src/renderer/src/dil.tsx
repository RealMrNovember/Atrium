import { createContext, useContext, useEffect, useMemo, type ReactElement, type ReactNode } from 'react'
import { cevirmen, type Cevirmen, type Dil } from '@ortak/i18n'

const DilBaglami = createContext<{ dil: Dil; t: Cevirmen }>({ dil: 'en', t: cevirmen('en') })

export function DilSaglayici({ dil, children }: { dil: Dil; children: ReactNode }): ReactElement {
  const deger = useMemo(() => ({ dil, t: cevirmen(dil) }), [dil])
  // büyük harfe çevirme (text-transform) dile göre yapılsın: Türkçede i → İ
  useEffect(() => { document.documentElement.lang = dil }, [dil])
  return <DilBaglami.Provider value={deger}>{children}</DilBaglami.Provider>
}

export const useDil = (): { dil: Dil; t: Cevirmen } => useContext(DilBaglami)
