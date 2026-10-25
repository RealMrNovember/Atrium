import { useEffect, useState, type ReactElement } from 'react'
import type { CanliDurum, Kat, Komut, SirketProfili } from '@ortak/tipler'
import { SirketLogosu } from '../bilesenler/Kimlik'
import { useDil } from '../dil'
import { Bina } from '../sahne/Bina'
import { KOMUT_ANAHTARI, usd, zamanMetni } from '../yardimci'

interface Props {
  profil: SirketProfili
  katlar: Kat[]
  canli: CanliDurum
  onKatSec: (id: string) => void
}

export function AnaSayfa({ profil, katlar, canli, onKatSec }: Props): ReactElement {
  const { t, dil } = useDil()
  const [raporlar, setRaporlar] = useState<Komut[]>([])
  const aktifSayisi = canli.aktifKomutlar.length
  useEffect(() => { void window.sirket.tumRaporlar().then((r) => setRaporlar(r.slice(0, 8))) }, [aktifSayisi])

  const katAdi = (id: string): string => katlar.find((k) => k.id === id)?.ad ?? id
  const calisan = Object.values(canli.ajanlar).filter((a) => a.durum !== 'bosta').length +
    Object.values(canli.misafirler).reduce((n, l) => n + l.length, 0) + Object.values(canli.aktifSohbetler).reduce((n, l) => n + l.length, 0)
  const hafizali = katlar.filter((k) => k.hafizaVar).length

  return (
    <div className="ana-sayfa">
      <section className="profil-kart">
        <SirketLogosu ad={profil.ad} logo={profil.logo} boyut={64} />
        <div className="profil-bilgi">
          <h1>{profil.ad}</h1>
          <p className="slogan">{profil.slogan}</p>
          <p className="kucuk">{profil.kurucu} · {t('founded', { year: profil.kurulus })} · {profil.projeKlasoru}</p>
        </div>
        <div className="istatistikler">
          <div><b>{katlar.length}</b><span>{t('statFloors')}</span></div>
          <div><b>{calisan}</b><span>{t('statAtWork')}</span></div>
          <div><b>{aktifSayisi}</b><span>{t('statActive')}</span></div>
          <div><b>{hafizali}</b><span>{t('statMemory')}</span></div>
          <div><b>{usd(canli.bugunHarcanan)}</b><span>{t('statSpent')}</span></div>
        </div>
      </section>

      <div className="ana-govde">
        <section className="bina-alani">
          <div className="bolum-baslik">
            <h2>{t('building')}</h2>
            <span className="kucuk">{t('buildingHint')}</span>
          </div>
          <div className="bina-kaydirma">
            {katlar.length ? <Bina ad={profil.ad} logo={profil.logo} katlar={katlar} canli={canli} onKatSec={onKatSec} /> : <p className="bos">{t('noProjects')}</p>}
          </div>
        </section>

        <section className="ana-yan">
          <div className="kart">
            <h3>{t('runningNow')}</h3>
            {canli.aktifKomutlar.length === 0 && <p className="bos">{t('runningEmpty')}</p>}
            {canli.aktifKomutlar.map((k) => (
              <button key={k.id} className="satir-kart" onClick={() => onKatSec(k.katId)}>
                <span className="rozet canli">{t(KOMUT_ANAHTARI[k.durum])}</span>
                <b>{katAdi(k.katId)}</b>
                <span className="metin">{k.metin}</span>
                <span className="kucuk">{t('tasksProgress', { done: k.gorevler.filter((g) => g.durum === 'tamam').length, total: k.gorevler.length || '?' })} · {usd(k.maliyetUsd)}</span>
              </button>
            ))}
          </div>
          <div className="kart">
            <h3>{t('recentReports')}</h3>
            {raporlar.length === 0 && <p className="bos">{t('noReports')}</p>}
            {raporlar.map((k) => (
              <button key={k.id} className="satir-kart" onClick={() => onKatSec(k.katId)}>
                <span className={`rozet ${k.durum}`}>{t(KOMUT_ANAHTARI[k.durum])}</span>
                <b>{katAdi(k.katId)}</b>
                <span className="metin">{k.metin}</span>
                <span className="kucuk">{zamanMetni(k.zaman, t, dil)} · {usd(k.maliyetUsd)}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
