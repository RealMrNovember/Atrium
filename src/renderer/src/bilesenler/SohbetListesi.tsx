// Claude Code sohbetleri: liste, okuyucu ve Atrium içinden canlı devam.
import { useEffect, useRef, useState, type ReactElement } from 'react'
import type { CanliDurum, Kat, Sohbet, SohbetMesaji } from '@ortak/tipler'
import { useDil } from '../dil'
import { hataMetni, zamanMetni } from '../yardimci'
import { Markdown } from './Markdown'

interface Props {
  /** string: o kat · null: hiçbir kata eşlenmeyenler · undefined: hepsi */
  katId?: string | null
  aciklama?: string
  katlar?: Kat[]
  onKatSec?: (id: string, sohbet?: string) => void
  /** Açılışta doğrudan bu sohbeti aç. */
  acik?: string
  canli?: CanliDurum
}

export function SohbetListesi({ katId, aciklama, katlar, onKatSec, acik: ilkAcik, canli }: Props): ReactElement {
  const { t, dil } = useDil()
  const [liste, setListe] = useState<Sohbet[] | null>(null)
  const [acik, setAcik] = useState<Sohbet | null>(null)
  useEffect(() => {
    setListe(null)
    void window.sirket.sohbetler(katId).then((l) => {
      setListe(l)
      if (ilkAcik) setAcik(l.find((s) => s.id === ilkAcik) ?? null)
    })
  }, [katId, ilkAcik])

  if (acik) return <SohbetOkuyucu sohbet={acik} canli={canli} onGeri={() => setAcik(null)} />
  const katAdi = (id: string | null): string => (id ? katlar?.find((k) => k.id === id)?.ad ?? id : t('otherChats'))
  const aktif = new Set(Object.values(canli?.aktifSohbetler ?? {}).flat().map((s) => s.id))

  return (
    <div className="sohbet-listesi">
      {aciklama && <p className="kucuk">{aciklama}</p>}
      {liste === null && <p className="bos">{t('loadingChat')}</p>}
      {liste?.length === 0 && <p className="bos">{t('noChats')}</p>}
      {liste?.map((s) => (
        <button key={`${s.klasor}/${s.id}`} className={aktif.has(s.id) ? 'sohbet-satir aktif' : 'sohbet-satir'}
          // genel listede katı olan sohbet kendi katında açılır: devam ederken ajanlar canlı izlenir
          onClick={() => (onKatSec && s.katId ? onKatSec(s.katId, s.id) : setAcik(s))}>
          <b>{aktif.has(s.id) && <span className="canli-nokta" />}{s.baslik || t('untitled')}</b>
          <span className="kucuk">
            {zamanMetni(s.son, t, dil)} · {t('messages', { n: s.mesajSayisi })}
            {s.altAjanSayisi > 0 && ` · ★ ${t('subagents', { n: s.altAjanSayisi })}`}
          </span>
          {katlar && (
            <span className={s.katId ? 'etiket' : 'etiket uyari'} onClick={(e) => { if (s.katId && onKatSec) { e.stopPropagation(); onKatSec(s.katId, s.id) } }}>
              {katAdi(s.katId)}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

function SohbetOkuyucu({ sohbet, canli, onGeri }: { sohbet: Sohbet; canli?: CanliDurum; onGeri: () => void }): ReactElement {
  const { t, dil } = useDil()
  const [mesajlar, setMesajlar] = useState<SohbetMesaji[] | null>(null)
  const [yazi, setYazi] = useState('')
  const [yazma, setYazma] = useState(false)
  const [hata, setHata] = useState('')
  const alt = useRef<HTMLDivElement>(null)
  const kosu = canli?.sohbetKosulari[sohbet.id]
  const calisiyor = !!kosu?.calisiyor
  const yukle = (): void => { void window.sirket.sohbetMesajlari(sohbet.klasor, sohbet.id).then(setMesajlar) }
  useEffect(yukle, [sohbet])
  // koşu bitince kalıcı kayıttan yeniden yükle
  const oncekiCalisiyor = useRef(calisiyor)
  useEffect(() => {
    if (oncekiCalisiyor.current && !calisiyor) setTimeout(yukle, 800)
    oncekiCalisiyor.current = calisiyor
  }, [calisiyor])
  useEffect(() => { alt.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [mesajlar?.length, kosu?.satirlar.length])

  const gonder = async (): Promise<void> => {
    if (!yazi.trim() || calisiyor) return
    setHata('')
    try {
      await window.sirket.sohbetDevam(sohbet.klasor, sohbet.id, yazi, yazma)
      setYazi('')
    } catch (e) {
      setHata(hataMetni(e))
    }
  }

  return (
    <div className="sohbet-okuyucu">
      <button className="geri" onClick={onGeri}>{t('backChats')}</button>
      <h3>{sohbet.baslik || t('untitled')}</h3>
      <p className="kucuk">{new Date(sohbet.ilk).toLocaleString(dil)} · {t('messages', { n: sohbet.mesajSayisi })}</p>
      {mesajlar === null && <p className="bos">{t('loadingChat')}</p>}
      {mesajlar?.slice(-60).map((m, i) => (
        <div key={i} className={`mesaj ${m.rol}`}>
          <span className="mesaj-kim">{m.rol === 'sen' ? t('you') : t('claude')}</span>
          <Markdown metin={m.metin.length > 4000 ? m.metin.slice(0, 4000) + '…' : m.metin} />
        </div>
      ))}
      {kosu && (calisiyor || kosu.satirlar.length > 1) && (
        <div className="canli-sohbet">
          {kosu.satirlar.map((s, i) => s.rol === 'arac'
            ? <div key={i} className="arac-satiri">{s.metin}</div>
            : s.rol === 'hata'
              ? <p key={i} className="hata-metni">{s.metin}</p>
              : (
                <div key={i} className={`mesaj ${s.rol}`}>
                  <span className="mesaj-kim">{s.rol === 'sen' ? t('you') : t('claude')}</span>
                  <Markdown metin={s.metin} />
                </div>
              ))}
          {calisiyor && <div className="yaziyor-gosterge"><span /><span /><span /></div>}
        </div>
      )}
      <div ref={alt} />
      <div className="sohbet-yazma">
        <textarea rows={3} value={yazi} disabled={calisiyor} placeholder={t('continueChatPlaceholder')}
          onChange={(e) => setYazi(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void gonder() }} />
        <div className="komut-alt">
          <label className="onay"><input type="checkbox" checked={yazma} disabled={calisiyor} onChange={(e) => setYazma(e.target.checked)} /><span>{t('allowWrite')}</span></label>
          {calisiyor
            ? <button className="tehlike" onClick={() => void window.sirket.sohbetDurdur(sohbet.id)}>{t('stop')}</button>
            : <button className="birincil" disabled={!yazi.trim()} onClick={() => void gonder()}>{t('send')}</button>}
        </div>
        <p className="kucuk">{t('continueChatHint')}</p>
        {hata && <p className="hata-metni">{hata}</p>}
      </div>
    </div>
  )
}
