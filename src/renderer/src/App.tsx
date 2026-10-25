import { useCallback, useEffect, useMemo, useState, type DragEvent, type ReactElement } from 'react'
import type { CanliDurum, GuncellemeDurumu, Kat, SirketProfili } from '@ortak/tipler'
import { AtriumIsareti, SirketLogosu } from './bilesenler/Kimlik'
import { DilSaglayici, useDil } from './dil'
import { AnaSayfa } from './sayfalar/AnaSayfa'
import { AyarlarSayfasi } from './sayfalar/AyarlarSayfasi'
import { KatSayfasi } from './sayfalar/KatSayfasi'
import { KilavuzSayfasi } from './sayfalar/KilavuzSayfasi'
import { Kurulum } from './sayfalar/Kurulum'
import { RaporlarSayfasi } from './sayfalar/RaporlarSayfasi'
import { SohbetlerSayfasi } from './sayfalar/SohbetlerSayfasi'
import { useSesler } from './ses'
import { CICIBYTE, GITHUB, SURUM, usd } from './yardimci'

export type Sayfa =
  | { tur: 'ana' } | { tur: 'kat'; id: string; sohbet?: string } | { tur: 'raporlar' } | { tur: 'sohbetler' }
  | { tur: 'ayarlar' } | { tur: 'kilavuz' }

const BOS_CANLI: CanliDurum = {
  ajanlar: {}, aktifKomutlar: [], bugunHarcanan: 0, hafizaCalisan: [], misafirler: {}, aktifSohbetler: {}, sohbetKosulari: {}
}

export function App(): ReactElement {
  const [profil, setProfil] = useState<SirketProfili | null>(null)
  useEffect(() => { void window.sirket.profil().then(setProfil) }, [])

  if (!profil) return <div className="yukleniyor"><AtriumIsareti boyut={48} /></div>
  const kaydet = async (p: SirketProfili): Promise<void> => setProfil(await window.sirket.profilKaydet(p))
  return (
    <DilSaglayici dil={profil.dil}>
      {profil.kurulumTamam ? <Sirket profil={profil} onKaydet={kaydet} /> : <Kurulum baslangic={profil} onBitti={kaydet} />}
    </DilSaglayici>
  )
}

function Sirket({ profil, onKaydet }: { profil: SirketProfili; onKaydet: (p: SirketProfili) => Promise<void> }): ReactElement {
  const { t } = useDil()
  const [katlar, setKatlar] = useState<Kat[]>([])
  const [canli, setCanli] = useState<CanliDurum>(BOS_CANLI)
  const [sayfa, setSayfa] = useState<Sayfa>({ tur: 'ana' })
  const [ara, setAra] = useState('')
  const [abonelik, setAbonelik] = useState(false)
  const [guncelleme, setGuncelleme] = useState<GuncellemeDurumu | null>(null)
  const [surukle, setSurukle] = useState<string | null>(null)

  const katlariYenile = useCallback(() => { void window.sirket.katlar().then(setKatlar) }, [])
  useEffect(katlariYenile, [katlariYenile, profil.projeKlasoru, profil.haricTutulan.length, profil.ekProjeler.length])
  useEffect(() => {
    void window.sirket.canli().then(setCanli)
    void window.sirket.claudeDurumu().then((d) => setAbonelik(d.girisli && /claude\.ai|subscription|oauth/i.test(d.yontem ?? '')))
    void window.sirket.guncellemeDurumu().then(setGuncelleme)
    const kapat1 = window.sirket.canliDinle(setCanli)
    const kapat2 = window.sirket.guncellemeDinle(setGuncelleme)
    return () => { kapat1(); kapat2() }
  }, [])
  useSesler(canli, profil.ayarlar.ses, sayfa.tur === 'kat' ? sayfa.id : null)

  const aktifKat = (katId: string): number =>
    Object.entries(canli.ajanlar).filter(([k, a]) => k.startsWith(katId + '/') && a.durum !== 'bosta').length +
    (canli.misafirler[katId]?.length ?? 0) + (canli.aktifSohbetler[katId]?.length ?? 0)

  const suzulmus = useMemo(() => {
    const a = ara.trim().toLocaleLowerCase()
    return a ? katlar.filter((k) => k.ad.toLocaleLowerCase().includes(a) || k.etiketler.some((e) => e.toLowerCase().includes(a))) : katlar
  }, [ara, katlar])

  const ayarDegistir = (yama: Partial<SirketProfili['ayarlar']>): void => { void onKaydet({ ...profil, ayarlar: { ...profil.ayarlar, ...yama } }) }
  const harcamaOrani = Math.min(1, canli.bugunHarcanan / Math.max(0.01, profil.ayarlar.gunlukTavanUsd))
  const seciliKat = sayfa.tur === 'kat' ? katlar.find((k) => k.id === sayfa.id) : undefined
  const calisanAjan = Object.values(canli.ajanlar).filter((a) => a.durum !== 'bosta').length +
    Object.values(canli.misafirler).reduce((n, l) => n + l.length, 0) + Object.values(canli.aktifSohbetler).reduce((n, l) => n + l.length, 0)
  const katSec = (id: string, sohbet?: string): void => setSayfa({ tur: 'kat', id, sohbet })

  // kat sırası: katlar alttan üste; listede üstteki kat en üstte görünür
  const tasi = (id: string, hedefId: string | null, yon?: 1 | -1): void => {
    const sira = [...katlar]
    const i = sira.findIndex((k) => k.id === id)
    if (i < 0) return
    const [kat] = sira.splice(i, 1)
    if (yon) sira.splice(Math.max(0, Math.min(sira.length, i + yon)), 0, kat)
    else {
      const j = sira.findIndex((k) => k.id === hedefId)
      sira.splice(j < 0 ? sira.length : j + 1, 0, kat)
    }
    setKatlar(sira.map((k, n) => ({ ...k, no: n + 1 })))
    void window.sirket.katSirala(sira.map((k) => k.yol)).then(setKatlar)
  }
  const birak = (e: DragEvent, hedefId: string): void => {
    e.preventDefault()
    if (surukle && surukle !== hedefId) tasi(surukle, hedefId)
    setSurukle(null)
  }

  return (
    <div className="uygulama">
      <aside className="kenar">
        <button className="logo" onClick={() => setSayfa({ tur: 'ana' })}>
          <SirketLogosu ad={profil.ad} logo={profil.logo} />
          <span>
            <strong>{profil.ad}</strong>
            <small>{t('sidebarSummary', { floors: katlar.length, agents: calisanAjan })}</small>
          </span>
        </button>
        <nav className="ana-menu">
          <button className={sayfa.tur === 'ana' ? 'etkin' : ''} onClick={() => setSayfa({ tur: 'ana' })}>🏢 {t('navCompany')}</button>
          <button className={sayfa.tur === 'raporlar' ? 'etkin' : ''} onClick={() => setSayfa({ tur: 'raporlar' })}>📨 {t('navReports')}</button>
          <button className={sayfa.tur === 'sohbetler' ? 'etkin' : ''} onClick={() => setSayfa({ tur: 'sohbetler' })}>💬 {t('navChats')}</button>
          <button className={sayfa.tur === 'ayarlar' ? 'etkin' : ''} onClick={() => setSayfa({ tur: 'ayarlar' })}>⚙️ {t('navSettings')}</button>
          <button className={sayfa.tur === 'kilavuz' ? 'etkin' : ''} onClick={() => setSayfa({ tur: 'kilavuz' })}>📖 {t('navGuide')}</button>
        </nav>
        <div className="kat-baslik">
          <span title={t('reorderHint')}>{t('floors')}</span>
          <button className="mini" title={t('rescan')} onClick={katlariYenile}>↻</button>
        </div>
        <input className="ara" placeholder={t('searchProjects')} value={ara} onChange={(e) => setAra(e.target.value)} />
        <ul className="kat-listesi">
          {[...suzulmus].reverse().map((k) => {
            const aktif = aktifKat(k.id)
            return (
              <li key={k.id} draggable={!ara} onDragStart={() => setSurukle(k.id)} onDragEnd={() => setSurukle(null)}
                onDragOver={(e) => e.preventDefault()} onDrop={(e) => birak(e, k.id)} className={surukle === k.id ? 'surukleniyor' : ''}>
                <button className={sayfa.tur === 'kat' && sayfa.id === k.id ? 'etkin' : ''} onClick={() => katSec(k.id)}>
                  <span className="kat-no">{String(k.no).padStart(2, '0')}</span>
                  <span className="kat-ad">{k.ad}</span>
                  {aktif > 0 ? <span className="nokta aktif" title={t('workingCount', { n: aktif })} /> : k.hafizaVar ? <span className="nokta hafiza" /> : null}
                </button>
                {!ara && (
                  <span className="sira-dugmeleri">
                    <button title={t('moveUp')} disabled={k.no === katlar.length} onClick={() => tasi(k.id, null, 1)}>▲</button>
                    <button title={t('moveDown')} disabled={k.no === 1} onClick={() => tasi(k.id, null, -1)}>▼</button>
                  </span>
                )}
              </li>
            )
          })}
        </ul>
        <div className="kenar-alt">
          <button onClick={() => void window.sirket.disBaglanti(GITHUB)} title={t('support')}><AtriumIsareti boyut={18} /> Atrium {SURUM}</button>
          <button onClick={() => void window.sirket.disBaglanti(CICIBYTE)}>{t('madeBy')}</button>
        </div>
      </aside>

      <main className="icerik">
        {guncelleme && (guncelleme.durum === 'hazir' || guncelleme.durum === 'mevcut') && (
          <div className="guncelleme-seridi">
            <span>🎉 {t('updateReady', { v: guncelleme.yeniSurum ?? '' })}</span>
            {guncelleme.durum === 'hazir'
              ? <button className="birincil mini-buyuk" onClick={() => void window.sirket.guncellemeKur()}>{t('updateRestart')}</button>
              : <button className="birincil mini-buyuk" onClick={() => void window.sirket.disBaglanti(`${GITHUB}/releases/latest`)}>{t('updateDownload')}</button>}
          </div>
        )}
        <header className="ust">
          <div className="yol">
            <button onClick={() => setSayfa({ tur: 'ana' })}>{profil.ad}</button>
            {seciliKat && <><span>›</span><b>{t('floorN', { n: seciliKat.no })} · {seciliKat.ad}</b></>}
            {sayfa.tur === 'raporlar' && <><span>›</span><b>{t('navReports')}</b></>}
            {sayfa.tur === 'sohbetler' && <><span>›</span><b>{t('navChats')}</b></>}
            {sayfa.tur === 'ayarlar' && <><span>›</span><b>{t('navSettings')}</b></>}
            {sayfa.tur === 'kilavuz' && <><span>›</span><b>{t('navGuide')}</b></>}
          </div>
          <div className="ust-sag">
            <div className="harcama" title={abonelik ? t('spendInfoSub') : t('spendInfoApi')}>
              <span>{t('spendEst', { spent: usd(canli.bugunHarcanan) })} · {t('dailyCap', { cap: usd(profil.ayarlar.gunlukTavanUsd) })} <span className="bilgi-i">ⓘ</span></span>
              <div className="harcama-cubuk"><div style={{ width: `${harcamaOrani * 100}%` }} className={harcamaOrani > 0.8 ? 'kritik' : ''} /></div>
              {abonelik && <small className="abonelik-notu">{t('subscriptionNote')}</small>}
            </div>
            <button className="ikon-dugme" onClick={() => ayarDegistir({ ses: !profil.ayarlar.ses })} title={t('soundToggle')}>
              {profil.ayarlar.ses ? '🔊' : '🔇'}
            </button>
            <button className={profil.ayarlar.simulasyon ? 'anahtar acik' : 'anahtar'} onClick={() => ayarDegistir({ simulasyon: !profil.ayarlar.simulasyon })} title={t('simulationTitle')}>
              <span className="anahtar-top" /> {t('simulation')}
            </button>
          </div>
        </header>

        {sayfa.tur === 'ana' && <AnaSayfa profil={profil} katlar={katlar} canli={canli} onKatSec={katSec} />}
        {sayfa.tur === 'kat' && <KatSayfasi key={sayfa.id} katId={sayfa.id} acilacakSohbet={sayfa.sohbet} profil={profil} canli={canli} onDegisti={katlariYenile} />}
        {sayfa.tur === 'raporlar' && <RaporlarSayfasi katlar={katlar} onKatSec={katSec} />}
        {sayfa.tur === 'sohbetler' && <SohbetlerSayfasi katlar={katlar} canli={canli} onKatSec={katSec} />}
        {sayfa.tur === 'ayarlar' && <AyarlarSayfasi profil={profil} guncelleme={guncelleme} onKaydet={onKaydet} />}
        {sayfa.tur === 'kilavuz' && <KilavuzSayfasi />}
      </main>
    </div>
  )
}
