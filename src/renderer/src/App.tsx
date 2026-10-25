import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import type { CanliDurum, Kat, SirketProfili } from '@ortak/tipler'
import { AtriumIsareti, SirketLogosu } from './bilesenler/Kimlik'
import { DilSaglayici, useDil } from './dil'
import { AnaSayfa } from './sayfalar/AnaSayfa'
import { AyarlarSayfasi } from './sayfalar/AyarlarSayfasi'
import { KatSayfasi } from './sayfalar/KatSayfasi'
import { Kurulum } from './sayfalar/Kurulum'
import { RaporlarSayfasi } from './sayfalar/RaporlarSayfasi'
import { SohbetlerSayfasi } from './sayfalar/SohbetlerSayfasi'
import { CICIBYTE, GITHUB, SURUM, usd } from './yardimci'

export type Sayfa = { tur: 'ana' } | { tur: 'kat'; id: string } | { tur: 'raporlar' } | { tur: 'sohbetler' } | { tur: 'ayarlar' }

const BOS_CANLI: CanliDurum = { ajanlar: {}, aktifKomutlar: [], bugunHarcanan: 0, hafizaCalisan: [], misafirler: {} }

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

  const katlariYenile = useCallback(() => { void window.sirket.katlar().then(setKatlar) }, [])
  useEffect(katlariYenile, [katlariYenile, profil.projeKlasoru])
  useEffect(() => {
    void window.sirket.canli().then(setCanli)
    return window.sirket.canliDinle(setCanli)
  }, [])

  const aktifKat = (katId: string): number =>
    Object.entries(canli.ajanlar).filter(([k, a]) => k.startsWith(katId + '/') && a.durum !== 'bosta').length + (canli.misafirler[katId]?.length ?? 0)

  const suzulmus = useMemo(() => {
    const a = ara.trim().toLocaleLowerCase()
    return a ? katlar.filter((k) => k.ad.toLocaleLowerCase().includes(a) || k.etiketler.some((e) => e.toLowerCase().includes(a))) : katlar
  }, [ara, katlar])

  const simulasyonDegistir = (): void => {
    void onKaydet({ ...profil, ayarlar: { ...profil.ayarlar, simulasyon: !profil.ayarlar.simulasyon } })
  }
  const harcamaOrani = Math.min(1, canli.bugunHarcanan / Math.max(0.01, profil.ayarlar.gunlukTavanUsd))
  const seciliKat = sayfa.tur === 'kat' ? katlar.find((k) => k.id === sayfa.id) : undefined
  const calisanAjan = Object.values(canli.ajanlar).filter((a) => a.durum !== 'bosta').length +
    Object.values(canli.misafirler).reduce((n, l) => n + l.length, 0)
  const katSec = (id: string): void => setSayfa({ tur: 'kat', id })

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
        </nav>
        <div className="kat-baslik">
          <span>{t('floors')}</span>
          <button className="mini" title={t('rescan')} onClick={katlariYenile}>↻</button>
        </div>
        <input className="ara" placeholder={t('searchProjects')} value={ara} onChange={(e) => setAra(e.target.value)} />
        <ul className="kat-listesi">
          {[...suzulmus].reverse().map((k) => {
            const aktif = aktifKat(k.id)
            return (
              <li key={k.id}>
                <button className={sayfa.tur === 'kat' && sayfa.id === k.id ? 'etkin' : ''} onClick={() => katSec(k.id)}>
                  <span className="kat-no">{String(k.no).padStart(2, '0')}</span>
                  <span className="kat-ad">{k.ad}</span>
                  {aktif > 0 ? <span className="nokta aktif" title={t('workingCount', { n: aktif })} /> : k.hafizaVar ? <span className="nokta hafiza" /> : null}
                </button>
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
        <header className="ust">
          <div className="yol">
            <button onClick={() => setSayfa({ tur: 'ana' })}>{profil.ad}</button>
            {seciliKat && <><span>›</span><b>{t('floorN', { n: seciliKat.no })} · {seciliKat.ad}</b></>}
            {sayfa.tur === 'raporlar' && <><span>›</span><b>{t('navReports')}</b></>}
            {sayfa.tur === 'sohbetler' && <><span>›</span><b>{t('navChats')}</b></>}
            {sayfa.tur === 'ayarlar' && <><span>›</span><b>{t('navSettings')}</b></>}
          </div>
          <div className="ust-sag">
            <div className="harcama" title={t('todaySpendTitle')}>
              <span>{t('todaySpend', { spent: usd(canli.bugunHarcanan), cap: usd(profil.ayarlar.gunlukTavanUsd) })}</span>
              <div className="harcama-cubuk"><div style={{ width: `${harcamaOrani * 100}%` }} className={harcamaOrani > 0.8 ? 'kritik' : ''} /></div>
            </div>
            <button className={profil.ayarlar.simulasyon ? 'anahtar acik' : 'anahtar'} onClick={simulasyonDegistir} title={t('simulationTitle')}>
              <span className="anahtar-top" /> {t('simulation')}
            </button>
          </div>
        </header>

        {sayfa.tur === 'ana' && <AnaSayfa profil={profil} katlar={katlar} canli={canli} onKatSec={katSec} />}
        {sayfa.tur === 'kat' && <KatSayfasi key={sayfa.id} katId={sayfa.id} profil={profil} canli={canli} onDegisti={katlariYenile} />}
        {sayfa.tur === 'raporlar' && <RaporlarSayfasi katlar={katlar} onKatSec={katSec} />}
        {sayfa.tur === 'sohbetler' && <SohbetlerSayfasi katlar={katlar} onKatSec={katSec} />}
        {sayfa.tur === 'ayarlar' && <AyarlarSayfasi profil={profil} onKaydet={onKaydet} />}
      </main>
    </div>
  )
}
