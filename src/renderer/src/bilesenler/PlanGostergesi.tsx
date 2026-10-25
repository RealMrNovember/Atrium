// Claude abonelik kullanım limitleri: oturum (5 saat) ve haftalık — Claude Desktop'taki gösterge gibi.
import { useState, type ReactElement } from 'react'
import type { PlanLimiti, PlanLimitleri } from '@ortak/tipler'
import { useDil } from '../dil'

function sifirlanmaMetni(saniye: number, dil: string): string {
  if (!saniye) return ''
  const t = new Date(saniye * 1000)
  const fark = t.getTime() - Date.now()
  return fark < 20 * 3600 * 1000
    ? t.toLocaleTimeString(dil, { hour: '2-digit', minute: '2-digit' })
    : t.toLocaleDateString(dil, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

function Cubuk({ ad, limit }: { ad: string; limit?: PlanLimiti }): ReactElement {
  const { t, dil } = useDil()
  const yuzde = limit?.yuzde ?? 0
  const renk = yuzde >= 90 ? 'kritik' : yuzde >= 70 ? 'uyari' : ''
  return (
    <div className="plan-satir">
      <span className="plan-ad">{ad}</span>
      <div className="harcama-cubuk"><div style={{ width: `${Math.min(100, yuzde)}%` }} className={renk} /></div>
      <span className="plan-yuzde">{limit ? `%${yuzde}` : '–'}</span>
      {limit?.sifirlanma ? <span className="plan-sifir">{t('planResets', { when: sifirlanmaMetni(limit.sifirlanma, dil) })}</span> : null}
    </div>
  )
}

export function PlanGostergesi({ limitler, ipucu }: { limitler?: PlanLimitleri; ipucu: string }): ReactElement {
  const { t } = useDil()
  const [yenileniyor, setYenileniyor] = useState(false)
  const yenile = (): void => {
    setYenileniyor(true)
    void window.sirket.planLimitleriYenile().finally(() => setYenileniyor(false))
  }
  return (
    <div className="plan-gostergesi" title={ipucu}>
      <Cubuk ad={t('planSession')} limit={limitler?.oturum} />
      <Cubuk ad={t('planWeekly')} limit={limitler?.haftalik} />
      <button className={yenileniyor ? 'plan-yenile donuyor' : 'plan-yenile'} disabled={yenileniyor} onClick={yenile} title={t('planRefresh')}>↻</button>
    </div>
  )
}
