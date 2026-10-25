// İlk açılış sihirbazı: dil → şirket → projeler → Claude → sohbetler → tavanlar.
import { useEffect, useState, type ReactElement } from 'react'
import type { ClaudeDurumu, SirketProfili, SohbetOzeti } from '@ortak/tipler'
import { cevirmen, DILLER, type Dil } from '@ortak/i18n'
import { AtriumIsareti, SirketLogosu } from '../bilesenler/Kimlik'
import { ProjeSecici, seciliProjeler, useKlasordekiler } from '../bilesenler/ProjeSecici'
import { DilSaglayici, useDil } from '../dil'
import { CICIBYTE, hataMetni, logoOku } from '../yardimci'

const ADIM_SAYISI = 6

/** Dil değişince, kullanıcının dokunmadığı varsayılan slogan ve unvan da yeni dile geçer. */
function dilDegistir(p: SirketProfili, dil: Dil): SirketProfili {
  const eski = cevirmen(p.dil)
  const yeni = cevirmen(dil)
  return {
    ...p, dil,
    slogan: p.slogan === eski('defaultSlogan') ? yeni('defaultSlogan') : p.slogan,
    kurucu: p.kurucu === eski('defaultOwner') ? yeni('defaultOwner') : p.kurucu
  }
}

export function Kurulum({ baslangic, onBitti }: { baslangic: SirketProfili; onBitti: (p: SirketProfili) => Promise<void> }): ReactElement {
  const [p, setP] = useState<SirketProfili>(baslangic)
  return (
    <DilSaglayici dil={p.dil}>
      <Sihirbaz p={p} setP={setP} onBitti={onBitti} />
    </DilSaglayici>
  )
}

function Sihirbaz({ p, setP, onBitti }: { p: SirketProfili; setP: (p: SirketProfili) => void; onBitti: (p: SirketProfili) => Promise<void> }): ReactElement {
  const { t } = useDil()
  const [adim, setAdim] = useState(0)
  const [bitiyor, setBitiyor] = useState(false)
  const katlar = seciliProjeler(p, useKlasordekiler(p.projeKlasoru))

  const basliklar = [t('wzLangTitle'), t('wzCompanyTitle'), t('wzProjectsTitle'), t('wzClaudeTitle'), t('wzChatsTitle'), t('wzLimitsTitle')]
  const ilerleyebilir = adim === 1 ? !!p.ad.trim() : adim === 2 ? katlar.length > 0 : true

  const bitir = async (): Promise<void> => {
    setBitiyor(true)
    await new Promise((r) => setTimeout(r, 2400))
    // ilk kurulumda "Neler yeni?" gösterilmez; sonraki güncellemelerde gösterilir
    await onBitti({ ...p, ad: p.ad.trim(), kurulumTamam: true, sonGorulenSurum: __SURUM__ })
  }

  if (bitiyor) {
    return (
      <div className="kurulum-bitis">
        <div className="yukselen-bina">
          {katlar.slice(0, 14).map((k, i) => (
            <div key={k} className="yukselen-kat" style={{ animationDelay: `${i * 0.12}s` }}>
              <span>{String(i + 1).padStart(2, '0')}</span> {k}
            </div>
          ))}
          <div className="yukselen-lobi"><SirketLogosu ad={p.ad} logo={p.logo} boyut={30} /> {p.ad}</div>
        </div>
        <h1>{t('wzReady')}</h1>
      </div>
    )
  }

  return (
    <div className="kurulum">
      <aside className="kurulum-yan">
        <div className="kurulum-marka"><AtriumIsareti boyut={40} /><div><b>Atrium</b><span>{t('appTagline')}</span></div></div>
        <h1>{t('wzWelcome')}</h1>
        <p>{t('wzIntro')}</p>
        <ol className="adimlar">
          {basliklar.map((b, i) => (
            <li key={b} className={i === adim ? 'etkin' : i < adim ? 'bitti' : ''}><span>{i < adim ? '✓' : i + 1}</span>{b}</li>
          ))}
        </ol>
        <button className="kurulum-imza" onClick={() => void window.sirket.disBaglanti(CICIBYTE)}>{t('madeBy')} · cicibyte.com</button>
      </aside>

      <main className="kurulum-govde">
        <div className="kurulum-kart">
          <span className="kucuk">{t('wzStep', { n: adim + 1, total: ADIM_SAYISI })}</span>
          <h2>{basliklar[adim]}</h2>
          {adim === 0 && (
            <div className="dil-izgara">
              {DILLER.map((d) => (
                <button key={d.kod} className={p.dil === d.kod ? 'dil-secenek secili' : 'dil-secenek'} onClick={() => setP(dilDegistir(p, d.kod))}>
                  <span className="bayrak">{d.bayrak}</span>{d.ad}
                </button>
              ))}
            </div>
          )}
          {adim === 1 && <SirketAdimi p={p} setP={setP} />}
          {adim === 2 && (
            <div className="form">
              <p className="kucuk">{t('wzProjectsHint')}</p>
              <ProjeSecici p={p} setP={setP} />
            </div>
          )}
          {adim === 3 && <ClaudeAdimi p={p} setP={setP} />}
          {adim === 4 && <SohbetAdimi p={p} setP={setP} />}
          {adim === 5 && <TavanAdimi p={p} setP={setP} />}
        </div>
        <div className="kurulum-dugmeler">
          {adim > 0 ? <button className="ikincil" onClick={() => setAdim(adim - 1)}>{t('back')}</button> : <span />}
          {adim < ADIM_SAYISI - 1
            ? <button className="birincil" disabled={!ilerleyebilir} onClick={() => setAdim(adim + 1)}>{t('next')}</button>
            : <button className="birincil buyuk" onClick={() => void bitir()}>{t('finish')} →</button>}
        </div>
      </main>
    </div>
  )
}

interface AdimProps { p: SirketProfili; setP: (p: SirketProfili) => void }

function SirketAdimi({ p, setP }: AdimProps): ReactElement {
  const { t } = useDil()
  return (
    <div className="form">
      <p className="kucuk">{t('wzCompanyHint')}</p>
      <div className="logo-satir">
        <SirketLogosu ad={p.ad} logo={p.logo} boyut={64} />
        <label className="ikincil dosya-dugmesi">
          {t('uploadLogo')}
          <input type="file" accept="image/*" hidden onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void logoOku(f).then((logo) => setP({ ...p, logo }))
          }} />
        </label>
        {p.logo && <button className="ikincil" onClick={() => setP({ ...p, logo: '' })}>{t('removeLogo')}</button>}
      </div>
      <label>{t('companyName')}<input autoFocus value={p.ad} placeholder="Acme Inc." onChange={(e) => setP({ ...p, ad: e.target.value })} /></label>
      <label>{t('slogan')}<input value={p.slogan} onChange={(e) => setP({ ...p, slogan: e.target.value })} /></label>
      <div className="form-satir">
        <label>{t('owner')}<input value={p.kurucu} onChange={(e) => setP({ ...p, kurucu: e.target.value })} /></label>
        <label>{t('foundedYear')}<input value={p.kurulus} onChange={(e) => setP({ ...p, kurulus: e.target.value })} /></label>
      </div>
    </div>
  )
}

export function ClaudeAdimi({ p, setP }: AdimProps): ReactElement {
  const { t } = useDil()
  const [durum, setDurum] = useState<ClaudeDurumu | null>(null)
  const [kontrol, setKontrol] = useState(false)
  const [anahtar, setAnahtar] = useState('')
  const [hata, setHata] = useState('')
  const kontrolEt = async (): Promise<void> => {
    setKontrol(true)
    try { setDurum(await window.sirket.claudeDurumu()) } catch (e) { setHata(hataMetni(e)) } finally { setKontrol(false) }
  }
  useEffect(() => { void kontrolEt() }, [])

  return (
    <div className="form claude-adimi">
      <p className="kucuk">{t('wzClaudeHint')}</p>
      <div className="durum-kartlari">
        <div className={durum?.kurulu ? 'durum-karti iyi' : 'durum-karti kotu'}>
          <span>{durum?.kurulu ? '✓' : '✕'}</span>
          <div><b>{durum?.kurulu ? t('clInstalled') : t('clNotInstalled')}</b>{durum?.surum && <small>{t('clVersion', { v: durum.surum })}</small>}</div>
        </div>
        <div className={durum?.girisli ? 'durum-karti iyi' : 'durum-karti kotu'}>
          <span>{durum?.girisli ? '✓' : '✕'}</span>
          <div><b>{durum?.girisli ? t('clLoggedIn', { method: durum.yontem ?? '' }) : t('clNotLoggedIn')}</b></div>
        </div>
      </div>
      {durum && !durum.kurulu && (
        <div className="bilgi-kutu">{t('clInstallHow')} <code>npm install -g @anthropic-ai/claude-code</code></div>
      )}
      {durum?.kurulu && !durum.girisli && (
        <div className="bilgi-kutu">
          <button className="birincil" onClick={() => void window.sirket.claudeGiris()}>{t('clLogin')}</button>
          <span className="kucuk">{t('clLoginHint')}</span>
        </div>
      )}
      <button className="ikincil" disabled={kontrol} onClick={() => void kontrolEt()}>{kontrol ? t('clChecking') : t('clCheck')}</button>
      <details className="api-anahtari">
        <summary>{t('clOrApi')}</summary>
        {durum?.apiAnahtari ? (
          <div className="klasor-satir">
            <span className="iyi-metin">{t('clApiSaved')}</span>
            <button className="tehlike" onClick={() => void window.sirket.apiAnahtariSil().then(setDurum)}>{t('clApiRemove')}</button>
          </div>
        ) : (
          <div className="klasor-satir">
            <input type="password" placeholder="sk-ant-…" value={anahtar} autoComplete="off" onChange={(e) => setAnahtar(e.target.value)} />
            <button className="ikincil" disabled={!anahtar.trim()} onClick={() => void window.sirket.apiAnahtariKaydet(anahtar).then((d) => { setDurum(d); setAnahtar('') })}>{t('clApiSave')}</button>
          </div>
        )}
      </details>
      <label className="onay">
        <input type="checkbox" checked={p.ayarlar.simulasyon} onChange={(e) => setP({ ...p, ayarlar: { ...p.ayarlar, simulasyon: e.target.checked } })} />
        <span>{t('clUseSim')}</span>
      </label>
      {hata && <p className="hata-metni">{hata}</p>}
    </div>
  )
}

function SohbetAdimi({ p, setP }: AdimProps): ReactElement {
  const { t } = useDil()
  const [ozet, setOzet] = useState<SohbetOzeti | null>(null)
  useEffect(() => {
    setOzet(null)
    void window.sirket.sohbetOzeti(p).then(setOzet)
  }, [p.projeKlasoru, p.sohbetKlasoru, p.haricTutulan.length, p.ekProjeler.length])
  const sec = async (): Promise<void> => {
    const klasor = await window.sirket.klasorSec(p.sohbetKlasoru)
    if (klasor) setP({ ...p, sohbetKlasoru: klasor })
  }
  return (
    <div className="form">
      <p className="kucuk">{t('wzChatsHint')}</p>
      <div className="klasor-satir">
        <input readOnly value={p.sohbetKlasoru} onClick={() => void sec()} />
        <button className="ikincil" onClick={() => void sec()}>{t('choose')}</button>
      </div>
      {ozet === null ? <span className="kucuk">{t('loadingChat')}</span>
        : ozet.toplam ? <b className="iyi-metin">{t('wzChatsFound', { sessions: ozet.toplam, matched: ozet.eslesen })}</b>
        : <span className="kucuk">{t('wzChatsNone')}</span>}
    </div>
  )
}

function TavanAdimi({ p, setP }: AdimProps): ReactElement {
  const { t } = useDil()
  const ayar = (k: 'kosuButcesiUsd' | 'gunlukTavanUsd', v: string, min: number): void =>
    setP({ ...p, ayarlar: { ...p.ayarlar, [k]: Math.max(min, Number(v) || min) } })
  return (
    <div className="form">
      <p className="kucuk">{t('wzLimitsHint')}</p>
      <div className="form-satir">
        <label>{t('capRun')}<input type="number" step="0.1" min="0.1" value={p.ayarlar.kosuButcesiUsd} onChange={(e) => ayar('kosuButcesiUsd', e.target.value, 0.1)} /></label>
        <label>{t('capDay')}<input type="number" step="1" min="1" value={p.ayarlar.gunlukTavanUsd} onChange={(e) => ayar('gunlukTavanUsd', e.target.value, 1)} /></label>
      </div>
      <ul className="guvence">
        <li>{t('safe1')}</li><li>{t('safe2')}</li><li>{t('safe3')}</li>
      </ul>
    </div>
  )
}
