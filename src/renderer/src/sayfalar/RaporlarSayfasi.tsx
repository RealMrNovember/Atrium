import { useEffect, useState, type ReactElement } from 'react'
import type { Kat, Komut } from '@ortak/tipler'
import { Markdown } from '../bilesenler/Markdown'
import { useDil } from '../dil'
import { KOMUT_ANAHTARI, usd, zamanMetni } from '../yardimci'

export function RaporlarSayfasi({ katlar, onKatSec }: { katlar: Kat[]; onKatSec: (id: string) => void }): ReactElement {
  const { t, dil } = useDil()
  const [liste, setListe] = useState<Komut[]>([])
  const [secili, setSecili] = useState<Komut | null>(null)
  useEffect(() => {
    void window.sirket.tumRaporlar().then((r) => { setListe(r); setSecili(r[0] ?? null) })
  }, [])
  const katAdi = (id: string): string => katlar.find((k) => k.id === id)?.ad ?? id

  return (
    <div className="raporlar-sayfasi">
      <ul className="rapor-listesi">
        {liste.length === 0 && <li className="bos">{t('reportsEmpty')}</li>}
        {liste.map((k) => (
          <li key={k.id}>
            <button className={secili?.id === k.id ? 'etkin' : ''} onClick={() => setSecili(k)}>
              <span className={`rozet ${k.durum}`}>{t(KOMUT_ANAHTARI[k.durum])}</span>
              <b>{katAdi(k.katId)}</b>
              <span className="metin">{k.metin}</span>
              <span className="kucuk">{zamanMetni(k.zaman, t, dil)} · {usd(k.maliyetUsd)}</span>
            </button>
          </li>
        ))}
      </ul>
      <article className="rapor-detay">
        {secili ? (
          <>
            <div className="rapor-ust">
              <div>
                <h2>{katAdi(secili.katId)}</h2>
                <p className="komut-alinti">“{secili.metin}”</p>
                <p className="kucuk">{new Date(secili.zaman).toLocaleString(dil)} · {usd(secili.maliyetUsd)} · {secili.yazmaIzni ? t('hadWrite') : t('readOnly')}</p>
              </div>
              <button className="ikincil" onClick={() => onKatSec(secili.katId)}>{t('goFloor')}</button>
            </div>
            {secili.rapor ? <Markdown metin={secili.rapor} /> : <p className="bos">{secili.hata ?? t('reportNotReady')}</p>}
            {secili.gorevler.length > 0 && (
              <details className="gorev-ayrinti">
                <summary>{t('teamReports', { n: secili.gorevler.length })}</summary>
                {secili.gorevler.map((g) => (
                  <div key={g.id} className="gorev-raporu">
                    <h4>{g.baslik} <span className="kucuk">· {g.ajanId} · {usd(g.maliyetUsd ?? 0)}</span></h4>
                    <Markdown metin={g.sonuc ?? '-'} />
                  </div>
                ))}
              </details>
            )}
          </>
        ) : <p className="bos">{t('pickReport')}</p>}
      </article>
    </div>
  )
}
