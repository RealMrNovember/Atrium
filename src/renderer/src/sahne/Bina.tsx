// Şirket binası: her proje bir kat. Çalışan ajanı olan katın pencereleri yanar.
import { useState, type ReactElement } from 'react'
import type { CanliDurum, Kat } from '@ortak/tipler'
import { useDil } from '../dil'
import { cokgen } from './yerlesim'

const G = 7      // kat genişliği (karo)
const D = 4      // kat derinliği (karo)
const KAT_H = 34 // ekranda kat yüksekliği
const KX = 30
const KY = 15

interface Props {
  ad: string
  logo?: string
  katlar: Kat[]
  canli: CanliDurum
  onKatSec: (id: string) => void
}

export function Bina({ ad, logo, katlar, canli, onKatSec }: Props): ReactElement {
  const { t } = useDil()
  const [uzerinde, setUzerinde] = useState<string | null>(null)
  const lobiH = 56
  const catiH = logo ? 170 : 70 // çatı tabelası için yer
  const toplamH = lobiH + katlar.length * KAT_H + catiH
  const genislik = (G + D) * KX + 360
  const yukseklik = toplamH + (G + D) * KY + 40
  const ox = D * KX + 30
  const tabanY = yukseklik - (G + D) * KY - 20
  const p = (x: number, y: number, z: number): { sx: number; sy: number } => ({ sx: (x - y) * KX + ox, sy: (x + y) * KY + tabanY - z })

  const aktifSayisi = (katId: string): number =>
    Object.entries(canli.ajanlar).filter(([k, a]) => k.startsWith(katId + '/') && a.durum !== 'bosta').length +
    (canli.misafirler[katId]?.length ?? 0) + (canli.aktifSohbetler[katId]?.length ?? 0)

  const kutu = (z: number, h: number, ust: string, sol: string, sag: string): ReactElement => (
    <>
      <polygon points={cokgen([p(0, D, z + h), p(G, D, z + h), p(G, D, z), p(0, D, z)])} fill={sol} />
      <polygon points={cokgen([p(G, 0, z + h), p(G, D, z + h), p(G, D, z), p(G, 0, z)])} fill={sag} />
      <polygon points={cokgen([p(0, 0, z + h), p(G, 0, z + h), p(G, D, z + h), p(0, D, z + h)])} fill={ust} />
    </>
  )

  const katlarCiz = katlar.map((kat, i) => {
    const z = lobiH + i * KAT_H
    const aktif = aktifSayisi(kat.id)
    const isik = uzerinde === kat.id
    const pencereler = []
    for (let w = 0; w < 6; w++) {
      const x = 0.4 + w * 1.1
      const yanik = w < aktif * 2 || (aktif > 0 && w === 5)
      pencereler.push(
        <polygon key={w} className={yanik ? 'bina-pencere yanik' : 'bina-pencere'}
          points={cokgen([p(x, D, z + 8), p(x + 0.75, D, z + 8), p(x + 0.75, D, z + KAT_H - 8), p(x, D, z + KAT_H - 8)])} />
      )
    }
    for (let w = 0; w < 3; w++) {
      const y = 0.4 + w * 1.15
      pencereler.push(
        <polygon key={`s${w}`} className={aktif > w ? 'bina-pencere yanik' : 'bina-pencere'}
          points={cokgen([p(G, y, z + 8), p(G, y + 0.8, z + 8), p(G, y + 0.8, z + KAT_H - 8), p(G, y, z + KAT_H - 8)])} />
      )
    }
    const etiket = p(G, D, z + KAT_H / 2)
    return (
      <g key={kat.id} className="bina-kat" onClick={() => onKatSec(kat.id)}
        onMouseEnter={() => setUzerinde(kat.id)} onMouseLeave={() => setUzerinde(null)}>
        {kutu(z, KAT_H, '#3a4460', isik ? '#4c5a85' : '#2a3350', isik ? '#3a4670' : '#202842')}
        <polyline points={cokgen([p(0, D, z), p(G, D, z), p(G, 0, z)])} stroke="#151a2b" strokeWidth={2} fill="none" />
        {pencereler}
        <line x1={etiket.sx + 6} y1={etiket.sy} x2={etiket.sx + 40} y2={etiket.sy} stroke={isik ? '#9d8bff' : '#3b4566'} />
        <text x={etiket.sx + 46} y={etiket.sy + 4} className={isik ? 'bina-etiket isik' : 'bina-etiket'}>
          <tspan className="bina-no">{String(kat.no).padStart(2, '0')}</tspan> {kat.ad}
          {aktif > 0 && <tspan className="bina-aktif"> ● {t('workingCount', { n: aktif })}</tspan>}
        </text>
      </g>
    )
  })

  const catiZ = lobiH + katlar.length * KAT_H
  const tabela = p(G / 2, D, lobiH - 18)
  const anten = p(G / 2, D / 2, catiZ + 26)
  const kisaAd = ad.length > 18 ? ad.split(/[\s,]/)[0] : ad
  return (
    // az katlı binada tamamı görünsün diye ölçeklenir; çok katlıda kaydırılır
    <svg className="bina" viewBox={`0 0 ${genislik} ${yukseklik}`} height={Math.min(yukseklik, Math.max(500, katlar.length * 24 + 240))}>
      <ellipse cx={p(G / 2, D / 2, 0).sx} cy={p(G / 2, D / 2, 0).sy + 10} rx={(G + D) * KX * 0.75} ry={(G + D) * KY * 0.75} fill="rgba(124,92,255,.08)" />
      {kutu(0, lobiH, '#2e3652', '#1d2440', '#161c33')}
      <polygon points={cokgen([p(2.6, D, 0), p(4.4, D, 0), p(4.4, D, 30), p(2.6, D, 30)])} fill="#a5d8ff" opacity={0.55} />
      <text x={tabela.sx} y={tabela.sy - 2} textAnchor="middle" className="bina-tabela">{kisaAd.toLocaleUpperCase()}</text>
      {katlarCiz}
      {kutu(catiZ, 10, '#4a5578', '#2c3554', '#232b47')}
      {logo ? (() => {
        // çatıdaki tabela: iki direk üzerinde şirket logosu
        const m = p(G / 2, D / 2 + 0.6, catiZ + 10)
        const tg = 104
        const ty = 58
        return (
          <g className="cati-tabela">
            <line x1={m.sx - 30} y1={m.sy} x2={m.sx - 30} y2={m.sy - 26} stroke="#6c7799" strokeWidth={3} />
            <line x1={m.sx + 30} y1={m.sy} x2={m.sx + 30} y2={m.sy - 26} stroke="#6c7799" strokeWidth={3} />
            <rect x={m.sx - tg / 2} y={m.sy - 26 - ty} width={tg} height={ty} rx={8} fill="#141a2e" stroke="#7c5cff" strokeWidth={2} />
            <image href={logo} x={m.sx - tg / 2 + 6} y={m.sy - 26 - ty + 6} width={tg - 12} height={ty - 12} preserveAspectRatio="xMidYMid meet" />
          </g>
        )
      })() : (
        <>
          <line x1={anten.sx} y1={anten.sy + 26} x2={anten.sx} y2={anten.sy - 20} stroke="#9aa5c4" strokeWidth={2} />
          <circle cx={anten.sx} cy={anten.sy - 22} r={4} className="anten-isik" />
        </>
      )}
    </svg>
  )
}
