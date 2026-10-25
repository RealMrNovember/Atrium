// Sağ üst: şirkette kullanılan her yapay zeka aracı için ayrı, sade bir kullanım göstergesi.
// Claude aboneliği → oturum/haftalık limit · Claude API → bugünkü dolar / tavan · Codex → limit (bildirirse)
// · diğerleri → bugünkü koşu ve token · yerel modeller → "yerel · ücretsiz".
import { useState, type ReactElement } from 'react'
import { SAGLAYICILAR, type CanliDurum, type PlanLimiti, type SaglayiciId, type SirketProfili } from '@ortak/tipler'
import { useDil } from '../dil'
import { usd } from '../yardimci'

const kisaSayi = (n: number): string => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n))

function Cubuk({ yuzde }: { yuzde: number }): ReactElement {
  const sinif = yuzde >= 90 ? 'kritik' : yuzde >= 70 ? 'uyari' : ''
  return <div className="harcama-cubuk"><div style={{ width: `${Math.min(100, Math.max(0, yuzde))}%` }} className={sinif} /></div>
}

function sifirlanma(l: PlanLimiti | undefined, dil: string): string {
  if (!l?.sifirlanma) return ''
  const t = new Date(l.sifirlanma * 1000)
  return t.getTime() - Date.now() < 20 * 3600 * 1000
    ? t.toLocaleTimeString(dil, { hour: '2-digit', minute: '2-digit' })
    : t.toLocaleDateString(dil, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

export function KullanimGostergesi({ canli, profil, abonelik }: { canli: CanliDurum; profil: SirketProfili; abonelik: boolean }): ReactElement {
  const { t, dil } = useDil()
  const [yenileniyor, setYenileniyor] = useState(false)
  const araclar = canli.aktifSaglayicilar.length ? canli.aktifSaglayicilar : ['claude' as SaglayiciId]

  const kart = (id: SaglayiciId): ReactElement => {
    const tanim = SAGLAYICILAR.find((s) => s.id === id)
    const ad = id === 'openai' ? t('provOpenai') : id === 'claude' ? 'Claude' : id === 'codex' ? 'Codex' : id === 'gemini' ? 'Gemini' : 'Ollama'
    const k = canli.kullanim[id] ?? { kosu: 0, token: 0 }
    const sayac = t('usageToday', { runs: k.kosu, tokens: kisaSayi(k.token) })

    if (id === 'claude' && abonelik) {
      const l = canli.planLimitleri
      return (
        <div key={id} className="kullanim-karti" title={`${t('planUsageTitle')}\n${t('planSession')}: ${l?.oturum ? `%${l.oturum.yuzde} · ${t('planResets', { when: sifirlanma(l.oturum, dil) })}` : '–'}\n${t('planWeekly')}: ${l?.haftalik ? `%${l.haftalik.yuzde} · ${t('planResets', { when: sifirlanma(l.haftalik, dil) })}` : '–'}\n${sayac}`}>
          <span className="kullanim-ad">{tanim?.ikon} {ad}</span>
          <Cubuk yuzde={l?.oturum?.yuzde ?? 0} />
          <span className="kullanim-deger">{l?.oturum ? `%${l.oturum.yuzde}` : '–'} <small>· {t('planWeekly')} {l?.haftalik ? `%${l.haftalik.yuzde}` : '–'}</small></span>
          <button className={yenileniyor ? 'plan-yenile donuyor' : 'plan-yenile'} disabled={yenileniyor} title={t('planRefresh')}
            onClick={() => { setYenileniyor(true); void window.sirket.planLimitleriYenile().finally(() => setYenileniyor(false)) }}>↻</button>
        </div>
      )
    }
    if (id === 'claude') {
      const oran = Math.min(1, canli.bugunHarcanan / Math.max(0.01, profil.ayarlar.gunlukTavanUsd)) * 100
      return (
        <div key={id} className="kullanim-karti" title={`${t('spendInfoApi')}\n${sayac}`}>
          <span className="kullanim-ad">{tanim?.ikon} {ad}</span>
          <Cubuk yuzde={oran} />
          <span className="kullanim-deger">{usd(canli.bugunHarcanan)} <small>/ {usd(profil.ayarlar.gunlukTavanUsd)}</small></span>
        </div>
      )
    }
    const l = canli.saglayiciLimitleri[id]
    if (l?.oturum || l?.haftalik) {
      return (
        <div key={id} className="kullanim-karti" title={`${ad}\n${t('planSession')}: ${l.oturum ? `%${l.oturum.yuzde}` : '–'}\n${t('planWeekly')}: ${l.haftalik ? `%${l.haftalik.yuzde}` : '–'}\n${sayac}`}>
          <span className="kullanim-ad">{tanim?.ikon} {ad}</span>
          <Cubuk yuzde={l.oturum?.yuzde ?? l.haftalik?.yuzde ?? 0} />
          <span className="kullanim-deger">{l.oturum ? `%${l.oturum.yuzde}` : '–'} <small>· {t('planWeekly')} {l.haftalik ? `%${l.haftalik.yuzde}` : '–'}</small></span>
        </div>
      )
    }
    return (
      <div key={id} className="kullanim-karti sade" title={`${ad} · ${tanim?.yerel ? t('usageLocalHint') : t('usageNoLimitHint')}\n${sayac}`}>
        <span className="kullanim-ad">{tanim?.ikon} {ad}</span>
        <span className="kullanim-deger">{tanim?.yerel ? <b>{t('usageLocal')}</b> : null}{k.kosu > 0 && <small>{sayac}</small>}</span>
      </div>
    )
  }

  return <div className="kullanim-gostergesi">{araclar.map(kart)}</div>
}
