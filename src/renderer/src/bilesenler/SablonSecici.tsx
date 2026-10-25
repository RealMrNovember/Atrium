// Hazır ekip şablonları: katın ekibini tek tıkla kurar.
import { useState, type ReactElement } from 'react'
import { metin, SABLONLAR } from '@ortak/sablonlar'
import { useDil } from '../dil'

export function SablonSecici({ katId, onKuruldu }: { katId: string; onKuruldu: () => void }): ReactElement {
  const { t, dil } = useDil()
  const [acik, setAcik] = useState(false)
  if (!acik) return <button className="ikincil genis" onClick={() => setAcik(true)}>🧩 {t('templatesButton')}</button>
  return (
    <div className="sablon-secici">
      <div className="degisiklik-ust"><b>🧩 {t('templatesTitle')}</b><span /><button className="ikincil mini-buyuk" onClick={() => setAcik(false)}>✕</button></div>
      <p className="kucuk">{t('templatesHint')}</p>
      <div className="sablon-kartlari">
        {SABLONLAR.map((s) => (
          <button key={s.id} className="sablon-karti" onClick={() => {
            if (!confirm(t('templatesConfirm', { name: metin(s.ad, dil) }))) return
            void window.sirket.ekipSablonu(katId, s.id).then(() => { setAcik(false); onKuruldu() })
          }}>
            <span className="sablon-ikon">{s.ikon}</span>
            <b>{metin(s.ad, dil)}</b>
            <span className="kucuk">{metin(s.aciklama, dil)}</span>
            <span className="kucuk sablon-roller">{s.ekip.map((a) => metin(a.rol, dil)).join(' · ')}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
