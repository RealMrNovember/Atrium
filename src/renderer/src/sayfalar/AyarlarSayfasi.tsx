import { useState, type ReactElement } from 'react'
import type { GuncellemeDurumu, SirketAyarlari, SirketProfili } from '@ortak/tipler'
import { DILLER, type Dil } from '@ortak/i18n'
import { SirketLogosu } from '../bilesenler/Kimlik'
import { ProjeSecici } from '../bilesenler/ProjeSecici'
import { useDil } from '../dil'
import { GITHUB, logoOku, SURUM } from '../yardimci'
import { ClaudeAdimi } from './Kurulum'

export function AyarlarSayfasi({ profil, guncelleme, onKaydet }: {
  profil: SirketProfili; guncelleme: GuncellemeDurumu | null; onKaydet: (p: SirketProfili) => Promise<void>
}): ReactElement {
  const { t, dil } = useDil()
  const [denetleniyor, setDenetleniyor] = useState(false)
  const guncellemeDurumMetni = (g: GuncellemeDurumu | null): string => {
    if (!g) return ''
    switch (g.durum) {
      case 'denetleniyor': return t('updChecking')
      case 'guncel': return t('updUpToDate')
      case 'mevcut': return t('updAvailable', { v: g.yeniSurum ?? '' })
      case 'indiriliyor': return t('updDownloading', { n: g.yuzde ?? 0 })
      case 'hazir': return t('updateReady', { v: g.yeniSurum ?? '' })
      case 'hata': return `${t('updError')} ${g.hata ?? ''}`
      default: return ''
    }
  }
  const [f, setF] = useState<SirketProfili>(profil)
  const [kaydedildi, setKaydedildi] = useState(false)
  const ayar = <K extends keyof SirketAyarlari>(k: K, v: SirketAyarlari[K]): void => setF({ ...f, ayarlar: { ...f.ayarlar, [k]: v } })
  const sayi = (v: string, min: number): number => Math.max(min, Number(v) || min)
  const kaydet = async (): Promise<void> => {
    await onKaydet(f)
    setKaydedildi(true)
    setTimeout(() => setKaydedildi(false), 1800)
  }
  const klasorSec = async (alan: 'sohbetKlasoru'): Promise<void> => {
    const klasor = await window.sirket.klasorSec(f[alan])
    if (klasor) setF({ ...f, [alan]: klasor })
  }

  return (
    <div className="ayarlar-sayfasi">
      <section className="kart">
        <h2>{t('profileTitle')}</h2>
        <div className="form">
          <div className="logo-satir">
            <SirketLogosu ad={f.ad} logo={f.logo} boyut={56} />
            <label className="ikincil dosya-dugmesi">
              {t('uploadLogo')}
              <input type="file" accept="image/*" hidden onChange={(e) => {
                const dosya = e.target.files?.[0]
                if (dosya) void logoOku(dosya).then((logo) => setF({ ...f, logo }))
              }} />
            </label>
            {f.logo && <button className="ikincil" onClick={() => setF({ ...f, logo: '' })}>{t('removeLogo')}</button>}
          </div>
          <label>{t('companyName')}<input value={f.ad} onChange={(e) => setF({ ...f, ad: e.target.value })} /></label>
          <label>{t('slogan')}<input value={f.slogan} onChange={(e) => setF({ ...f, slogan: e.target.value })} /></label>
          <div className="form-satir">
            <label>{t('owner')}<input value={f.kurucu} onChange={(e) => setF({ ...f, kurucu: e.target.value })} /></label>
            <label>{t('foundedYear')}<input value={f.kurulus} onChange={(e) => setF({ ...f, kurulus: e.target.value })} /></label>
          </div>
          <label>{t('language')}
            <select value={f.dil} onChange={(e) => setF({ ...f, dil: e.target.value as Dil })}>
              {DILLER.map((d) => <option key={d.kod} value={d.kod}>{d.bayrak} {d.ad}</option>)}
            </select>
          </label>
          <div className="alan">
            <span className="alan-etiket">{t('projectFolder')} <small>{t('projectFolderHint')}</small></span>
            <ProjeSecici p={f} setP={setF} />
          </div>
          <label>{t('chatsFolder')}
            <div className="klasor-satir">
              <input readOnly value={f.sohbetKlasoru} onClick={() => void klasorSec('sohbetKlasoru')} />
              <button className="ikincil" onClick={() => void klasorSec('sohbetKlasoru')}>{t('choose')}</button>
            </div>
          </label>
        </div>
      </section>

      <section className="kart">
        <h2>{t('claudeTitle')}</h2>
        <ClaudeAdimi p={f} setP={setF} />
        <div className="form">
          <label>{t('claudePath')} <small>{t('claudePathHint')}</small>
            <input value={f.ayarlar.claudeYolu} placeholder={t('auto')} onChange={(e) => ayar('claudeYolu', e.target.value)} />
          </label>
        </div>
      </section>

      <section className="kart">
        <h2>{t('limitsTitle')}</h2>
        <div className="form">
          <div className="form-satir">
            <label>{t('capRun')}
              <input type="number" step="0.1" min="0.1" value={f.ayarlar.kosuButcesiUsd} onChange={(e) => ayar('kosuButcesiUsd', sayi(e.target.value, 0.1))} />
            </label>
            <label>{t('capDay')}
              <input type="number" step="1" min="1" value={f.ayarlar.gunlukTavanUsd} onChange={(e) => ayar('gunlukTavanUsd', sayi(e.target.value, 1))} />
            </label>
          </div>
          <div className="form-satir">
            <label>{t('capTime')}
              <input type="number" min="1" value={f.ayarlar.kosuSuresiDk} onChange={(e) => ayar('kosuSuresiDk', sayi(e.target.value, 1))} />
            </label>
            <label>{t('parallel')}
              <input type="number" min="1" max="6" value={f.ayarlar.esZamanli} onChange={(e) => ayar('esZamanli', Math.min(6, sayi(e.target.value, 1)))} />
            </label>
          </div>
          <label className="onay">
            <input type="checkbox" checked={f.ayarlar.simulasyon} onChange={(e) => ayar('simulasyon', e.target.checked)} />
            <span>{t('simMode')} <small>{t('simModeHint')}</small></span>
          </label>
          <label className="onay">
            <input type="checkbox" checked={f.ayarlar.ses} onChange={(e) => ayar('ses', e.target.checked)} />
            <span>{t('soundToggle')}</span>
          </label>
        </div>
        <ul className="guvence">
          <li>{t('safe1')}</li><li>{t('safe2')}</li><li>{t('safe3')}</li><li>{t('safe4')}</li>
        </ul>
      </section>

      <section className="kart">
        <h2>{t('updTitle')}</h2>
        <p>Atrium {SURUM} · <span className="kucuk">{guncellemeDurumMetni(guncelleme)}</span>
          {guncelleme?.sonDenetim && <span className="kucuk"> · {new Date(guncelleme.sonDenetim).toLocaleString(dil)}</span>}</p>
        <div className="form-dugmeler">
          <button className="ikincil" disabled={denetleniyor} onClick={() => { setDenetleniyor(true); void window.sirket.guncellemeDenetle().finally(() => setDenetleniyor(false)) }}>
            ↻ {t('updCheck')}
          </button>
          <span />
          {guncelleme?.durum === 'hazir' && <button className="birincil" onClick={() => void window.sirket.guncellemeKur()}>{t('updateRestart')}</button>}
          {guncelleme?.durum === 'mevcut' && <button className="birincil" onClick={() => void window.sirket.disBaglanti(`${GITHUB}/releases/latest`)}>{t('updateDownload')}</button>}
        </div>
        <p className="kucuk">{t('updHint')}</p>
      </section>

      <div className="kaydet-cubugu">
        <button className="ikincil" onClick={() => void onKaydet({ ...f, kurulumTamam: false })}>{t('rerunSetup')}</button>
        <span />
        {kaydedildi && <span className="iyi-metin">{t('saved')}</span>}
        <button className="birincil" onClick={() => void kaydet()}>{t('save')}</button>
      </div>
    </div>
  )
}
