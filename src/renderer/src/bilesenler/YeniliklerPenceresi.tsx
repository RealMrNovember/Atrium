// "Neler yeni?" penceresi: güncellemeden sonra ilk açılışta (uygulamadaki notlar, kendi dilinde)
// ya da yeni sürüm fark edildiği anda, daha inmeden (showroom'daki dilli notlar, yoksa GitHub notları).
import type { ReactElement } from 'react'
import { surumNotu } from '@ortak/yenilikler'
import { useDil } from '../dil'
import { AtriumIsareti } from './Kimlik'
import { Markdown } from './Markdown'

interface Props {
  surum: string
  /** Uygulamada notu olmayan (henüz kurulmamış) sürüm için GitHub notları. */
  uzakNotlar?: string
  /** Kurulmamış sürümün 6 dildeki notları (showroom'dan). */
  dilliNotlar?: Record<string, { baslik: string; maddeler: string[] }>
  onKapat: () => void
  onGecmis?: () => void
  onKur?: () => void
  /** Yeni sürüm iniyorsa yüzdesi. */
  indirme?: number
  /** Henüz kurulmamış sürüm mü (başlık "neler geliyor" olur). */
  bekleyen?: boolean
}

export function YeniliklerPenceresi({ surum, uzakNotlar, dilliNotlar, onKapat, onGecmis, onKur, indirme, bekleyen }: Props): ReactElement {
  const { t, dil } = useDil()
  const not = surumNotu(dil, surum) ?? dilliNotlar?.[dil] ?? dilliNotlar?.en
  return (
    <div className="pencere-arka" onClick={onKapat}>
      <div className="yenilikler-penceresi" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="yenilikler-ust">
          <AtriumIsareti boyut={44} />
          <div>
            <span className="kucuk">{t('whatsNew')}</span>
            <h2>{t(bekleyen ? 'whatsComing' : 'whatsNewIn', { v: surum })}</h2>
            {not && <b className="yenilikler-baslik">{not.baslik}</b>}
          </div>
        </div>
        {not ? (
          <ul className="yenilikler-maddeler">
            {not.maddeler.map((m, i) => <li key={i} style={{ animationDelay: `${0.08 * i}s` }}>{m}</li>)}
          </ul>
        ) : uzakNotlar ? (
          <div className="yenilikler-uzak"><Markdown metin={uzakNotlar} /></div>
        ) : null}
        {indirme !== undefined && (
          <div className="yenilikler-indirme">
            <div className="cubuk"><span style={{ width: `${indirme}%` }} /></div>
            <span className="kucuk">{t('updDownloading', { n: indirme })} · {t('updBackground')}</span>
          </div>
        )}
        <div className="form-dugmeler">
          {onGecmis && <button className="ikincil" onClick={onGecmis}>📜 {t('seeHistory')}</button>}
          <span />
          {onKur && <button className="birincil" onClick={onKur}>{t('updateRestart')}</button>}
          {!onKur && <button className="birincil" onClick={onKapat}>{t('gotIt')}</button>}
        </div>
      </div>
    </div>
  )
}
