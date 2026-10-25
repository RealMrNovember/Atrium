import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ReactElement } from 'react'
import type { CanliDurum, GuncellemeDurumu, Kat, SirketProfili } from '@ortak/tipler'
import { AtriumIsareti, SirketLogosu } from './bilesenler/Kimlik'
import { PlanGostergesi } from './bilesenler/PlanGostergesi'
import { YeniliklerPenceresi } from './bilesenler/YeniliklerPenceresi'
import { acikSayisi, calisanSayisi, katCagrisi } from './sahne/Bina'
import { DilSaglayici, useDil } from './dil'
import { AnaSayfa } from './sayfalar/AnaSayfa'
import { AyarlarSayfasi } from './sayfalar/AyarlarSayfasi'
import { KatSayfasi } from './sayfalar/KatSayfasi'
import { KilavuzSayfasi } from './sayfalar/KilavuzSayfasi'
import { Kurulum } from './sayfalar/Kurulum'
import { RaporlarSayfasi } from './sayfalar/RaporlarSayfasi'
import { SohbetlerSayfasi } from './sayfalar/SohbetlerSayfasi'
import { useSesler } from './ses'
import { CICIBYTE, GITHUB, KAHVE, SURUM, usd } from './yardimci'

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
  // "Neler yeni?": kurulu sürüm için (güncellemeden sonra ilk açılış) ya da kurulmayı bekleyen sürüm için
  const [yenilik, setYenilik] = useState<{ surum: string; bekleyen: boolean } | null>(
    profil.sonGorulenSurum !== SURUM ? { surum: SURUM, bekleyen: false } : null)
  const gosterilenGuncelleme = useRef<string | null>(null)
  useEffect(() => {
    // yeni sürüm fark edildiği anda (daha inmeden) notlarını bir kez kendiliğinden göster
    const v = guncelleme?.yeniSurum
    if (v && (guncelleme?.durum === 'indiriliyor' || guncelleme?.durum === 'hazir' || guncelleme?.durum === 'mevcut') && gosterilenGuncelleme.current !== v) {
      gosterilenGuncelleme.current = v
      setYenilik({ surum: v, bekleyen: true })
    }
  }, [guncelleme?.durum, guncelleme?.yeniSurum])
  const yenilikKapat = (): void => {
    if (yenilik && !yenilik.bekleyen && profil.sonGorulenSurum !== SURUM) void onKaydet({ ...profil, sonGorulenSurum: SURUM })
    setYenilik(null)
  }

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

  // yan menüdeki nokta: seslenen (sarı) · çalışan (yeşil) · Claude'da açık (turuncu) · hafızalı (gri)
  const katNoktasi = (k: Kat): { sinif: string; baslik: string } | null => {
    const cagri = katCagrisi(canli, k.id)
    if (cagri) return { sinif: 'nokta cagri', baslik: cagri.metin }
    const calisan = calisanSayisi(canli, k.id)
    if (calisan) return { sinif: 'nokta aktif', baslik: t('workingCount', { n: calisan }) }
    const acik = acikSayisi(canli, k.id)
    if (acik) return { sinif: 'nokta acik', baslik: t('openCount', { n: acik }) }
    return k.hafizaVar ? { sinif: 'nokta hafiza', baslik: '' } : null
  }

  const suzulmus = useMemo(() => {
    const a = ara.trim().toLocaleLowerCase()
    return a ? katlar.filter((k) => k.ad.toLocaleLowerCase().includes(a) || k.etiketler.some((e) => e.toLowerCase().includes(a))) : katlar
  }, [ara, katlar])

  const ayarDegistir = (yama: Partial<SirketProfili['ayarlar']>): void => { void onKaydet({ ...profil, ayarlar: { ...profil.ayarlar, ...yama } }) }
  const harcamaOrani = Math.min(1, canli.bugunHarcanan / Math.max(0.01, profil.ayarlar.gunlukTavanUsd))
  const seciliKat = sayfa.tur === 'kat' ? katlar.find((k) => k.id === sayfa.id) : undefined
  const calisanAjan = katlar.reduce((n, k) => n + calisanSayisi(canli, k.id), 0)
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
            const nokta = katNoktasi(k)
            const cagri = katCagrisi(canli, k.id)
            return (
              <li key={k.id} draggable={!ara} onDragStart={() => setSurukle(k.id)} onDragEnd={() => setSurukle(null)}
                onDragOver={(e) => e.preventDefault()} onDrop={(e) => birak(e, k.id)} className={surukle === k.id ? 'surukleniyor' : ''}>
                <button className={sayfa.tur === 'kat' && sayfa.id === k.id ? 'etkin' : ''} onClick={() => katSec(k.id, cagri?.sohbetId)}>
                  <span className="kat-no">{String(k.no).padStart(2, '0')}</span>
                  <span className="kat-ad">{k.ad}</span>
                  {nokta && <span className={nokta.sinif} title={nokta.baslik} />}
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
          <button onClick={() => void window.sirket.disBaglanti(GITHUB)} title="GitHub"><AtriumIsareti boyut={18} /> Atrium {SURUM}</button>
          <button className="kahve-dugmesi" onClick={() => void window.sirket.disBaglanti(KAHVE)}>☕ {t('support')}</button>
          <button onClick={() => void window.sirket.disBaglanti(CICIBYTE)}>{t('madeBy')}</button>
        </div>
      </aside>

      <main className="icerik">
        {guncelleme && (guncelleme.durum === 'hazir' || guncelleme.durum === 'mevcut') && (
          <div className="guncelleme-seridi">
            <span>🎉 {t('updateReady', { v: guncelleme.yeniSurum ?? '' })}</span>
            <button className="ikincil mini-buyuk" onClick={() => setYenilik({ surum: guncelleme.yeniSurum ?? '', bekleyen: true })}>✨ {t('whatsNew')}</button>
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
            {abonelik ? (
              // abonelikte asıl ölçü plan limitleri; dolar tahmini ve Atrium'un günlük tavanı ipucunda
              <PlanGostergesi limitler={canli.planLimitleri}
                ipucu={`${t('planUsageTitle')}\n\n${t('spendEst', { spent: usd(canli.bugunHarcanan) })} · ${t('dailyCap', { cap: usd(profil.ayarlar.gunlukTavanUsd) })}\n${t('spendInfoSub')}`} />
            ) : (
              <div className="harcama" title={t('spendInfoApi')}>
                <span>{t('spendEst', { spent: usd(canli.bugunHarcanan) })} · {t('dailyCap', { cap: usd(profil.ayarlar.gunlukTavanUsd) })} <span className="bilgi-i">ⓘ</span></span>
                <div className="harcama-cubuk"><div style={{ width: `${harcamaOrani * 100}%` }} className={harcamaOrani > 0.8 ? 'kritik' : ''} /></div>
              </div>
            )}
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
      {yenilik && (
        <YeniliklerPenceresi surum={yenilik.surum} bekleyen={yenilik.bekleyen}
          uzakNotlar={yenilik.bekleyen ? guncelleme?.yeniNotlar : undefined}
          dilliNotlar={yenilik.bekleyen ? guncelleme?.yeniNotlarDilli : undefined}
          onKapat={yenilikKapat}
          onGecmis={() => { yenilikKapat(); setSayfa({ tur: 'ayarlar' }) }}
          onKur={yenilik.bekleyen && guncelleme?.durum === 'hazir' ? () => void window.sirket.guncellemeKur() : undefined}
          indirme={yenilik.bekleyen && guncelleme?.durum === 'indiriliyor' ? guncelleme.yuzde ?? 0 : undefined} />
      )}
    </div>
  )
}
