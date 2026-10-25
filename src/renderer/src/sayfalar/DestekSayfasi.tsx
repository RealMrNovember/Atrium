// Destek: gizlilik bildirimi, isteğe bağlı ücretsiz hesap, dilek/istek/şikayet/hata raporu ve cevaplar.
import { useEffect, useState, type ReactElement } from 'react'
import type { DestekBildirimi, DestekTuru, HesapDurumu } from '@ortak/tipler'
import type { Anahtar } from '@ortak/i18n'
import { useDil } from '../dil'
import { hataMetni } from '../yardimci'

export interface DestekTaslagi { tur: DestekTuru; konu: string; metin: string }

const TUR_ANAHTARI: Record<DestekTuru, Anahtar> = { dilek: 'fbWish', istek: 'fbRequest', sikayet: 'fbComplaint', hata: 'fbBug' }
const DURUM_ANAHTARI: Record<DestekBildirimi['durum'], Anahtar> = { acik: 'stOpen', yanitlandi: 'stAnswered', kapali: 'stClosed' }
const HATA_ANAHTARI: Record<string, Anahtar> = {
  baglanti: 'eBaglanti', 'eposta-gecersiz': 'eEposta', 'sifre-kisa': 'eSifreKisa', 'eposta-kayitli': 'eEpostaKayitli',
  'giris-hatali': 'eGiris', engelli: 'eEngelli', 'cok-hizli': 'eCokHizli', 'google-iptal': 'eGoogle', 'google-gecersiz': 'eGoogle', 'google-kapali': 'eGoogle'
}

export function DestekSayfasi({ hesap, taslak }: { hesap: HesapDurumu; taslak?: DestekTaslagi }): ReactElement {
  const { t } = useDil()
  const hataCevir = (e: unknown): string => { const k = hataMetni(e); return HATA_ANAHTARI[k] ? t(HATA_ANAHTARI[k]) : t('eGenel') }
  return (
    <div className="destek-sayfasi">
      <section className="kart destek-giris">
        <h2>💬 {t('supTitle')}</h2>
        <p>{t('supIntro')}</p>
      </section>
      <div className="destek-ust">
        <GizlilikKarti />
        <HesapKarti hesap={hesap} hataCevir={hataCevir} />
      </div>
      {hesap.girisli ? <Mesajlar taslak={taslak} hataCevir={hataCevir} /> : (
        <section className="kart"><p className="kucuk">✉️ {t('fbNeedAccount')}</p></section>
      )}
    </div>
  )
}

export function GizlilikKarti(): ReactElement {
  const { t } = useDil()
  return (
    <section className="kart gizlilik-karti">
      <h2>🔒 {t('privTitle')}</h2>
      <ul>
        <li><b>{t('priv1')}</b></li>
        <li>{t('priv2')}</li>
        <li>{t('priv3')}</li>
        <li>{t('priv4')}</li>
        <li>{t('priv5')}</li>
      </ul>
    </section>
  )
}

function HesapKarti({ hesap, hataCevir }: { hesap: HesapDurumu; hataCevir: (e: unknown) => string }): ReactElement {
  const { t } = useDil()
  const [mod, setMod] = useState<'kayit' | 'giris'>('kayit')
  const [f, setF] = useState({ eposta: '', ad: '', sifre: '' })
  const [bekliyor, setBekliyor] = useState(false)
  const [hata, setHata] = useState('')
  const calistir = async (is: () => Promise<unknown>): Promise<void> => {
    setBekliyor(true); setHata('')
    try { await is(); setF({ eposta: '', ad: '', sifre: '' }) } catch (e) { setHata(hataCevir(e)) } finally { setBekliyor(false) }
  }

  if (hesap.girisli && hesap.kullanici) {
    const k = hesap.kullanici
    return (
      <section className="kart hesap-karti">
        <h2>👤 {t('accTitle')}</h2>
        <div className="hesap-kimlik">
          <span className="avatar buyuk">{(k.ad || k.eposta)[0]?.toUpperCase()}</span>
          <div><b>{k.ad || k.eposta}</b><br /><span className="kucuk">{t('accSignedIn', { email: k.eposta })}{k.google ? ' · Google' : ''}</span></div>
        </div>
        <div className="form-dugmeler">
          <button className="ikincil" disabled={bekliyor} onClick={() => void calistir(() => window.sirket.hesapCikis())}>{t('accSignOut')}</button>
          <span />
          <button className="ikincil tehlike" disabled={bekliyor} onClick={() => {
            const onay = prompt(k.google ? t('accDeleteConfirmGoogle') : t('accDeleteConfirm'))
            if (onay) void calistir(() => window.sirket.hesapSil(onay))
          }}>{t('accDelete')}</button>
        </div>
        {hata && <p className="hata-metni">{hata}</p>}
      </section>
    )
  }

  return (
    <section className="kart hesap-karti">
      <h2>👤 {t('accTitle')}</h2>
      <p className="kucuk">{t('accWhy')}</p>
      {hesap.googleEtkin && (
        <>
          <button className="google-dugme" disabled={bekliyor} onClick={() => void calistir(() => window.sirket.hesapGoogle())}>
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
            {bekliyor ? t('accGoogleWait') : t('accGoogle')}
          </button>
          <div className="ayirac"><span>{t('accOr')}</span></div>
        </>
      )}
      <div className="sekme-dugmeleri">
        <button className={mod === 'kayit' ? 'secili' : ''} onClick={() => setMod('kayit')}>{t('accSignup')}</button>
        <button className={mod === 'giris' ? 'secili' : ''} onClick={() => setMod('giris')}>{t('accLogin')}</button>
      </div>
      <form className="form" onSubmit={(e) => {
        e.preventDefault()
        void calistir(() => mod === 'kayit' ? window.sirket.hesapKayit(f.eposta, f.ad, f.sifre) : window.sirket.hesapGiris(f.eposta, f.sifre))
      }}>
        <label>{t('accEmail')}<input type="email" required autoComplete="email" value={f.eposta} onChange={(e) => setF({ ...f, eposta: e.target.value })} /></label>
        {mod === 'kayit' && <label>{t('accName')}<input autoComplete="name" value={f.ad} onChange={(e) => setF({ ...f, ad: e.target.value })} /></label>}
        <label>{t('accPassword')}<input type="password" required minLength={8} autoComplete={mod === 'kayit' ? 'new-password' : 'current-password'} value={f.sifre} onChange={(e) => setF({ ...f, sifre: e.target.value })} /></label>
        <button className="birincil" disabled={bekliyor}>{mod === 'kayit' ? t('accSignup') : t('accLogin')}</button>
      </form>
      {hata && <p className="hata-metni">{hata}</p>}
    </section>
  )
}

function Mesajlar({ taslak, hataCevir }: { taslak?: DestekTaslagi; hataCevir: (e: unknown) => string }): ReactElement {
  const { t, dil } = useDil()
  const [liste, setListe] = useState<DestekBildirimi[] | null>(null)
  const [f, setF] = useState<DestekTaslagi>(taslak ?? { tur: 'istek', konu: '', metin: '' })
  const [tanilamaEkle, setTanilamaEkle] = useState(taslak?.tur === 'hata')
  const [tanilama, setTanilama] = useState<Record<string, unknown> | null>(null)
  const [durum, setDurum] = useState<'' | 'gonderiliyor' | 'gonderildi'>('')
  const [hata, setHata] = useState('')
  const [acik, setAcik] = useState<number | null>(null)
  const [yanit, setYanit] = useState('')

  const yenile = (): void => { void window.sirket.destekListe().then(setListe).catch((e) => setHata(hataCevir(e))) }
  useEffect(yenile, [])
  useEffect(() => { if (tanilamaEkle) void window.sirket.tanilama().then(setTanilama) }, [tanilamaEkle])

  const gonder = async (): Promise<void> => {
    setDurum('gonderiliyor'); setHata('')
    try {
      await window.sirket.destekGonder(f.tur, f.konu, f.metin, tanilamaEkle)
      setF({ tur: f.tur, konu: '', metin: '' })
      setDurum('gonderildi')
      yenile()
    } catch (e) { setHata(hataCevir(e)); setDurum('') }
  }
  const ac = (b: DestekBildirimi): void => {
    setAcik(acik === b.id ? null : b.id)
    setYanit('')
    if (b.okunmamis) void window.sirket.destekOkundu(b.id).then(yenile)
  }
  const zaman = (s: string): string => new Date(s).toLocaleString(dil, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div className="destek-alt">
      <section className="kart">
        <h2>✉️ {t('fbTitle')}</h2>
        <div className="form">
          <div className="secenekler">
            {(Object.keys(TUR_ANAHTARI) as DestekTuru[]).map((tur) => (
              <button key={tur} className={f.tur === tur ? 'cip secili' : 'cip'} onClick={() => { setF({ ...f, tur }); if (tur === 'hata') setTanilamaEkle(true) }}>{t(TUR_ANAHTARI[tur])}</button>
            ))}
          </div>
          <label>{t('fbSubject')}<input maxLength={150} value={f.konu} onChange={(e) => setF({ ...f, konu: e.target.value })} /></label>
          <label>{t('fbMessage')}<textarea rows={6} maxLength={5000} value={f.metin} onChange={(e) => setF({ ...f, metin: e.target.value })} /></label>
          <label className="onay">
            <input type="checkbox" checked={tanilamaEkle} onChange={(e) => setTanilamaEkle(e.target.checked)} />
            <span>{t('fbDiag')}</span>
          </label>
          {tanilamaEkle && tanilama && (
            <details className="tanilama"><summary>{t('fbDiagShow')}</summary><pre>{JSON.stringify(tanilama, null, 2)}</pre></details>
          )}
          <div className="form-dugmeler">
            {durum === 'gonderildi' ? <span className="iyi-metin">✓ {t('fbSent')}</span> : <span />}
            <button className="birincil" disabled={durum === 'gonderiliyor' || !f.konu.trim() || !f.metin.trim()} onClick={() => void gonder()}>{t('fbSend')}</button>
          </div>
          {hata && <p className="hata-metni">{hata}</p>}
        </div>
      </section>

      <section className="kart">
        <h2>🗂️ {t('myTitle')}</h2>
        {!liste ? <p className="kucuk">…</p> : !liste.length ? <p className="kucuk">{t('myEmpty')}</p> : (
          <ul className="bildirim-listesi">
            {liste.map((b) => (
              <li key={b.id} className={b.okunmamis ? 'yeni' : ''}>
                <button className="bildirim-baslik" onClick={() => ac(b)}>
                  <span>{t(TUR_ANAHTARI[b.tur])}</span>
                  <b>{b.konu}</b>
                  {b.okunmamis > 0 && <span className="etiket oneri">{t('newBadge')}</span>}
                  <span className={`etiket ${b.durum === 'yanitlandi' ? 'iyi' : b.durum === 'acik' ? 'uyari' : ''}`}>{t(DURUM_ANAHTARI[b.durum])}</span>
                  <span className="kucuk">{zaman(b.guncelleme)}</span>
                </button>
                {acik === b.id && (
                  <div className="bildirim-konusma">
                    {b.mesajlar.map((m, i) => (
                      <div key={i} className={`destek-mesaj ${m.yazan}`}>
                        <span className="kucuk">{m.yazan === 'admin' ? t('team') : t('you')} · {zaman(m.olusturma)}</span>
                        <p>{m.metin}</p>
                      </div>
                    ))}
                    <div className="komut-satiri">
                      <input value={yanit} placeholder={t('replyPh')} maxLength={5000} onChange={(e) => setYanit(e.target.value)} />
                      <button className="ikincil" disabled={!yanit.trim()} onClick={() => void window.sirket.destekYanit(b.id, yanit)
                        .then(() => { setYanit(''); yenile() }).catch((e) => setHata(hataCevir(e)))}>{t('replySend')}</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
