// Claude Code sohbetleri: liste ve okuyucu.
import { useEffect, useState, type ReactElement } from 'react'
import type { Kat, Sohbet, SohbetMesaji } from '@ortak/tipler'
import { useDil } from '../dil'
import { zamanMetni } from '../yardimci'
import { Markdown } from './Markdown'

interface Props {
  /** string: o kat · null: hiçbir kata eşlenmeyenler · undefined: hepsi */
  katId?: string | null
  aciklama?: string
  katlar?: Kat[]
  onKatSec?: (id: string) => void
}

export function SohbetListesi({ katId, aciklama, katlar, onKatSec }: Props): ReactElement {
  const { t, dil } = useDil()
  const [liste, setListe] = useState<Sohbet[] | null>(null)
  const [acik, setAcik] = useState<Sohbet | null>(null)
  useEffect(() => {
    setListe(null)
    void window.sirket.sohbetler(katId).then(setListe)
  }, [katId])

  if (acik) return <SohbetOkuyucu sohbet={acik} onGeri={() => setAcik(null)} />
  const katAdi = (id: string | null): string => (id ? katlar?.find((k) => k.id === id)?.ad ?? id : t('otherChats'))

  return (
    <div className="sohbet-listesi">
      {aciklama && <p className="kucuk">{aciklama}</p>}
      {liste === null && <p className="bos">{t('loadingChat')}</p>}
      {liste?.length === 0 && <p className="bos">{t('noChats')}</p>}
      {liste?.map((s) => (
        <button key={`${s.klasor}/${s.id}`} className="sohbet-satir" onClick={() => setAcik(s)}>
          <b>{s.baslik || t('untitled')}</b>
          <span className="kucuk">
            {zamanMetni(s.son, t, dil)} · {t('messages', { n: s.mesajSayisi })}
            {s.altAjanSayisi > 0 && ` · ★ ${t('subagents', { n: s.altAjanSayisi })}`}
          </span>
          {katlar && (
            <span className={s.katId ? 'etiket' : 'etiket uyari'} onClick={(e) => { if (s.katId && onKatSec) { e.stopPropagation(); onKatSec(s.katId) } }}>
              {katAdi(s.katId)}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

function SohbetOkuyucu({ sohbet, onGeri }: { sohbet: Sohbet; onGeri: () => void }): ReactElement {
  const { t, dil } = useDil()
  const [mesajlar, setMesajlar] = useState<SohbetMesaji[] | null>(null)
  useEffect(() => { void window.sirket.sohbetMesajlari(sohbet.klasor, sohbet.id).then(setMesajlar) }, [sohbet])
  return (
    <div className="sohbet-okuyucu">
      <button className="geri" onClick={onGeri}>{t('backChats')}</button>
      <h3>{sohbet.baslik || t('untitled')}</h3>
      <p className="kucuk">{new Date(sohbet.ilk).toLocaleString(dil)} · {t('messages', { n: sohbet.mesajSayisi })}</p>
      {mesajlar === null && <p className="bos">{t('loadingChat')}</p>}
      {mesajlar?.map((m, i) => (
        <div key={i} className={`mesaj ${m.rol}`}>
          <span className="mesaj-kim">{m.rol === 'sen' ? t('you') : t('claude')}</span>
          <Markdown metin={m.metin.length > 4000 ? m.metin.slice(0, 4000) + '…' : m.metin} />
        </div>
      ))}
    </div>
  )
}
