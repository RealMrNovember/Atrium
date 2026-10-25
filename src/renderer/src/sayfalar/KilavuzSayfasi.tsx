// Uygulama içi kullanım kılavuzu: solda içindekiler, sağda bölümler.
import { useMemo, useRef, type ReactElement } from 'react'
import { kilavuz } from '@ortak/kilavuz'
import { Markdown } from '../bilesenler/Markdown'
import { useDil } from '../dil'

export function KilavuzSayfasi(): ReactElement {
  const { t, dil } = useDil()
  const govde = useRef<HTMLDivElement>(null)
  const { baslik, bolumler } = useMemo(() => {
    const [ust, ...parcalar] = kilavuz(dil).split(/^## /m)
    return {
      baslik: ust.replace(/^#\s*/, '').trim(),
      bolumler: parcalar.map((p, i) => {
        const [ilk, ...geri] = p.split('\n')
        return { id: `bolum-${i}`, ad: ilk.trim(), icerik: geri.join('\n') }
      })
    }
  }, [dil])
  const git = (id: string): void => { govde.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  return (
    <div className="kilavuz-sayfasi">
      <nav className="kilavuz-icindekiler">
        <span className="kat-baslik">{t('guideToc')}</span>
        {bolumler.map((b) => <button key={b.id} onClick={() => git(b.id)}>{b.ad}</button>)}
      </nav>
      <article className="kilavuz-govde" ref={govde}>
        <h1>{baslik}</h1>
        {bolumler.map((b) => (
          <section key={b.id} id={b.id} className="kilavuz-bolum">
            <h2>{b.ad}</h2>
            <Markdown metin={b.icerik} />
          </section>
        ))}
      </article>
    </div>
  )
}
