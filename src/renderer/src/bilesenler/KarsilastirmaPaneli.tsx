// Maliyet ve kalite karşılaştırması: aynı görev iki araç/modelle, sonuçlar yan yana.
import { useState, type ReactElement } from 'react'
import { SAGLAYICILAR, type CanliDurum, type SaglayiciId } from '@ortak/tipler'
import { useDil } from '../dil'
import { hataMetni, usd } from '../yardimci'
import { Markdown } from './Markdown'
import { SaglayiciSecici } from './SaglayiciSecici'

export function KarsilastirmaPaneli({ katId, canli, ilkMetin, onKapat }: { katId: string; canli: CanliDurum; ilkMetin: string; onKapat: () => void }): ReactElement {
  const { t } = useDil()
  const [metin, setMetin] = useState(ilkMetin)
  const [a, setA] = useState<{ saglayici: SaglayiciId; model: string }>({ saglayici: 'claude', model: 'sonnet' })
  const [b, setB] = useState<{ saglayici: SaglayiciId; model: string }>({ saglayici: 'ollama', model: '' })
  const [hata, setHata] = useState('')
  const k = canli.karsilastirmalar[katId]
  const calisiyor = !!k?.sonuclar.some((s) => s.calisiyor)
  const ad = (id: SaglayiciId): string => (id === 'openai' ? t('provOpenai') : SAGLAYICILAR.find((s) => s.id === id)?.ad ?? id)

  return (
    <div className="karsilastirma-paneli">
      <div className="degisiklik-ust"><b>⚖️ {t('compareTitle')}</b><span /><button className="ikincil mini-buyuk" onClick={onKapat}>✕</button></div>
      <p className="kucuk">{t('compareHint')}</p>
      <textarea rows={3} value={metin} placeholder={t('commandPlaceholder')} onChange={(e) => setMetin(e.target.value)} />
      <div className="karsilastirma-secim">
        <div><b>A</b><SaglayiciSecici saglayici={a.saglayici} model={a.model} onDegis={(saglayici, model) => setA({ saglayici, model })} /></div>
        <div><b>B</b><SaglayiciSecici saglayici={b.saglayici} model={b.model} onDegis={(saglayici, model) => setB({ saglayici, model })} /></div>
      </div>
      <div className="form-dugmeler">
        <span className="kucuk">{t('compareNote')}</span>
        <button className="birincil" disabled={calisiyor || !metin.trim()} onClick={() => {
          setHata('')
          void window.sirket.karsilastir(katId, metin, [a, b]).catch((e) => setHata(hataMetni(e)))
        }}>{calisiyor ? t('compareRunning') : t('compareRun')}</button>
      </div>
      {hata && <p className="hata-metni">{hata}</p>}
      {k && (
        <div className="karsilastirma-sonuclari">
          {k.sonuclar.map((s, i) => {
            const enUcuz = !calisiyor && k.sonuclar.every((x) => (x.maliyetUsd ?? 0) >= (s.maliyetUsd ?? 0))
            const enHizli = !calisiyor && k.sonuclar.every((x) => (x.sureMs ?? Infinity) >= (s.sureMs ?? Infinity))
            return (
              <div key={i} className="karsilastirma-karti">
                <div className="karsilastirma-baslik">
                  <b>{i === 0 ? 'A' : 'B'} · {ad(s.saglayici)}</b><span className="kucuk">{s.model || t('providerDefaultModel')}</span>
                </div>
                <div className="karsilastirma-olcu">
                  <span className={enUcuz ? 'etiket iyi' : 'etiket'}>💲 {s.maliyetUsd !== undefined ? usd(s.maliyetUsd) : '…'}</span>
                  <span className={enHizli ? 'etiket iyi' : 'etiket'}>⏱ {s.sureMs !== undefined ? `${(s.sureMs / 1000).toFixed(1)} s` : '…'}</span>
                  <span className="etiket">🔤 {s.token ? s.token.toLocaleString() : '—'}</span>
                </div>
                <div className="karsilastirma-metin">
                  {s.calisiyor ? <div className="yaziyor-gosterge"><span /><span /><span /></div>
                    : s.hata && !s.metin ? <p className="hata-metni">{s.hata}</p> : <Markdown metin={s.metin ?? ''} />}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
