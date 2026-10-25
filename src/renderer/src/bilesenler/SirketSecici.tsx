// Şirketler: kenar çubuğundaki seçici ve Ayarlar'daki liste. Her şirketin kendi projeleri, ekibi ve yapay zeka aracı vardır.
import { useEffect, useRef, useState, type ReactElement } from 'react'
import type { SirketOzeti } from '@ortak/tipler'
import { useDil } from '../dil'
import { hataMetni } from '../yardimci'
import { SirketLogosu } from './Kimlik'
import { saglayiciIkonu } from './SaglayiciSecici'

/** Şirket değişince her şey (katlar, ekip, canlı durum) baştan yüklenir. */
const yenidenYukle = (): void => { location.reload() }

export function useSirketler(): [{ aktif: string; liste: SirketOzeti[] } | null, () => void] {
  const [veri, setVeri] = useState<{ aktif: string; liste: SirketOzeti[] } | null>(null)
  const yenile = (): void => { void window.sirket.sirketler().then(setVeri) }
  useEffect(yenile, [])
  return [veri, yenile]
}

async function gec(is: () => Promise<unknown>): Promise<void> {
  try { await is(); yenidenYukle() } catch (e) { alert(hataMetni(e)) }
}

export function SirketMenusu(): ReactElement | null {
  const { t } = useDil()
  const [veri] = useSirketler()
  const [acik, setAcik] = useState(false)
  const kutu = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!acik) return
    const kapat = (e: MouseEvent): void => { if (!kutu.current?.contains(e.target as Node)) setAcik(false) }
    document.addEventListener('mousedown', kapat)
    return () => document.removeEventListener('mousedown', kapat)
  }, [acik])
  if (!veri) return null
  return (
    <div className="sirket-menusu" ref={kutu}>
      <button className="sirket-menusu-dugme" title={t('companySwitch')} onClick={() => setAcik(!acik)}>▾</button>
      {acik && (
        <div className="sirket-listesi">
          <span className="kucuk">{t('myCompanies')}</span>
          {veri.liste.map((s) => (
            <button key={s.id} className={s.id === veri.aktif ? 'secili' : ''} onClick={() => { if (s.id !== veri.aktif) void gec(() => window.sirket.sirketSec(s.id)) }}>
              <SirketLogosu ad={s.ad} logo={s.logo} boyut={26} />
              <span className="sirket-ad">{s.ad}{!s.kurulumTamam && <small> · {t('companySetupPending')}</small>}</span>
              <span title={t('aiDefault')}>{saglayiciIkonu(s.saglayici)}</span>
              {s.id === veri.aktif && <span>✓</span>}
            </button>
          ))}
          <button className="yeni-sirket" onClick={() => void gec(() => window.sirket.sirketEkle())}>＋ {t('companyAdd')}</button>
        </div>
      )}
    </div>
  )
}

export function SirketlerKarti(): ReactElement {
  const { t } = useDil()
  const [veri, yenile] = useSirketler()
  return (
    <section className="kart">
      <h2>🏙️ {t('myCompanies')}</h2>
      <p className="kucuk">{t('companiesHint')}</p>
      <ul className="sirket-satirlari">
        {veri?.liste.map((s) => (
          <li key={s.id}>
            <SirketLogosu ad={s.ad} logo={s.logo} boyut={32} />
            <span className="sirket-ad"><b>{s.ad}</b><br /><span className="kucuk">{saglayiciIkonu(s.saglayici)} {t('aiDefault')}{!s.kurulumTamam ? ` · ${t('companySetupPending')}` : ''}</span></span>
            {s.id === veri.aktif ? <span className="etiket iyi">{t('companyActive')}</span> : (
              <>
                <button className="ikincil" onClick={() => void gec(() => window.sirket.sirketSec(s.id))}>{t('companyOpen')}</button>
                <button className="ikincil tehlike" onClick={() => {
                  if (confirm(t('companyRemoveConfirm', { name: s.ad }))) void window.sirket.sirketSil(s.id).then(yenile).catch((e) => alert(hataMetni(e)))
                }}>{t('companyRemove')}</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="form-dugmeler"><span /><button className="birincil" onClick={() => void gec(() => window.sirket.sirketEkle())}>＋ {t('companyAdd')}</button></div>
    </section>
  )
}

/** Kurulum sihirbazında: başka şirket varsa ona geri dön (yarım kalan yeni şirket silinir). */
export function SihirbazdanDon(): ReactElement | null {
  const { t } = useDil()
  const [veri] = useSirketler()
  if (!veri || veri.liste.length < 2) return null
  const onceki = veri.liste.find((s) => s.id !== veri.aktif && s.kurulumTamam)
  if (!onceki) return null
  const yarim = veri.liste.find((s) => s.id === veri.aktif && !s.kurulumTamam)
  return (
    <button className="ikincil sihirbazdan-don" onClick={() => void gec(async () => {
      await window.sirket.sirketSec(onceki.id)
      if (yarim) await window.sirket.sirketSil(yarim.id)
    })}>← {t('companyBack', { name: onceki.ad })}</button>
  )
}
