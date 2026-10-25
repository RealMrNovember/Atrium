// Şirket binası: her proje bir kat. Çalışılan katın pencereleri parlak, Claude uygulamasında açık
// duran sohbetin katı loş yanar. Kararını bekleyen bir şey varsa bir ajan pencereden uzanıp seslenir.
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
  onKatSec: (id: string, sohbet?: string) => void
}

export interface Cagri { sohbetId?: string; metin: string; hata?: boolean }

/** Bir katta sahibinin bakması gereken şey: cevap bekleyen sohbet ya da sorun yaşayan ajan. */
export function katCagrisi(canli: CanliDurum, katId: string): Cagri | null {
  const bekleyen = (canli.aktifSohbetler[katId] ?? []).find((s) => s.bekleyenSoru && s.durum === 'acik')
  if (bekleyen) return { sohbetId: bekleyen.id, metin: bekleyen.bekleyenSoru! }
  const hatali = Object.entries(canli.ajanlar).find(([k, a]) => k.startsWith(katId + '/') && a.durum === 'hata')
  if (hatali) return { metin: hatali[1].etkinlik ?? '', hata: true }
  return null
}

export function calisanSayisi(canli: CanliDurum, katId: string): number {
  return Object.entries(canli.ajanlar).filter(([k, a]) => k.startsWith(katId + '/') && a.durum !== 'bosta' && a.durum !== 'hata').length +
    (canli.misafirler[katId]?.length ?? 0) + (canli.aktifSohbetler[katId] ?? []).filter((s) => s.durum !== 'acik').length
}

export const acikSayisi = (canli: CanliDurum, katId: string): number =>
  (canli.aktifSohbetler[katId] ?? []).filter((s) => s.durum === 'acik').length

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

  const kutu = (z: number, h: number, ust: string, sol: string, sag: string): ReactElement => (
    <>
      <polygon points={cokgen([p(0, D, z + h), p(G, D, z + h), p(G, D, z), p(0, D, z)])} fill={sol} />
      <polygon points={cokgen([p(G, 0, z + h), p(G, D, z + h), p(G, D, z), p(G, 0, z)])} fill={sag} />
      <polygon points={cokgen([p(0, 0, z + h), p(G, 0, z + h), p(G, D, z + h), p(0, D, z + h)])} fill={ust} />
    </>
  )
  const pencere = (x: number, z: number): string => cokgen([p(x, D, z + 8), p(x + 0.75, D, z + 8), p(x + 0.75, D, z + KAT_H - 8), p(x, D, z + KAT_H - 8)])

  const cagrilar: { kat: Kat; z: number; cagri: Cagri }[] = []
  const katlarCiz = katlar.map((kat, i) => {
    const z = lobiH + i * KAT_H
    const calisan = calisanSayisi(canli, kat.id)
    const acik = acikSayisi(canli, kat.id)
    const cagri = katCagrisi(canli, kat.id)
    if (cagri) cagrilar.push({ kat, z, cagri })
    const isik = uzerinde === kat.id
    const pencereler = []
    for (let w = 0; w < 6; w++) {
      const parlak = w < calisan * 2 || (calisan > 0 && w === 5)
      const los = !parlak && w < (calisan + acik) * 2
      pencereler.push(
        <polygon key={w} className={parlak ? 'bina-pencere yanik' : los ? 'bina-pencere los' : 'bina-pencere'} points={pencere(0.4 + w * 1.1, z)} />
      )
    }
    for (let w = 0; w < 3; w++) {
      const y = 0.4 + w * 1.15
      const sinif = calisan > w ? 'bina-pencere yanik' : calisan + acik > w ? 'bina-pencere los' : 'bina-pencere'
      pencereler.push(
        <polygon key={`s${w}`} className={sinif}
          points={cokgen([p(G, y, z + 8), p(G, y + 0.8, z + 8), p(G, y + 0.8, z + KAT_H - 8), p(G, y, z + KAT_H - 8)])} />
      )
    }
    const etiket = p(G, D, z + KAT_H / 2)
    return (
      <g key={kat.id} className="bina-kat" onClick={() => onKatSec(kat.id, cagri?.sohbetId)}
        onMouseEnter={() => setUzerinde(kat.id)} onMouseLeave={() => setUzerinde(null)}>
        {kutu(z, KAT_H, '#3a4460', isik ? '#4c5a85' : '#2a3350', isik ? '#3a4670' : '#202842')}
        <polyline points={cokgen([p(0, D, z), p(G, D, z), p(G, 0, z)])} stroke="#151a2b" strokeWidth={2} fill="none" />
        {pencereler}
        <line x1={etiket.sx + 6} y1={etiket.sy} x2={etiket.sx + 40} y2={etiket.sy} stroke={isik ? '#9d8bff' : '#3b4566'} />
        <text x={etiket.sx + 46} y={etiket.sy + 4} className={isik ? 'bina-etiket isik' : 'bina-etiket'}>
          <tspan className="bina-no">{String(kat.no).padStart(2, '0')}</tspan> {kat.ad}
          {calisan > 0 && <tspan className="bina-aktif"> ● {t('workingCount', { n: calisan })}</tspan>}
          {acik > 0 && <tspan className="bina-acik"> ◐ {t('openCount', { n: acik })}</tspan>}
          {cagri && <tspan className="bina-cagri"> ❗</tspan>}
        </text>
      </g>
    )
  })

  // seslenen ajanlar en üst katmanda: katın etiketine yakın bir pencereden uzanıp el sallar
  const PENCERE = 4
  const seslenenler = cagrilar.map(({ kat, z, cagri }, i) => {
    const m = p(0.4 + PENCERE * 1.1 + 0.375, D, z + KAT_H / 2)
    const renk = cagri.hata ? '#f0506e' : '#d97757'
    const metin = cagri.hata ? t('callError') : t('callingYou')
    const bg = Math.max(70, metin.length * 5 + 16)
    return (
      <g key={kat.id} className="seslenen" style={{ animationDelay: `${i * 0.35}s` }}
        onClick={(e) => { e.stopPropagation(); onKatSec(kat.id, cagri.sohbetId) }}>
        <title>{cagri.metin}</title>
        <polygon points={pencere(0.4 + PENCERE * 1.1, z)} className="seslenen-pencere" />
        <ellipse cx={m.sx} cy={m.sy + 9} rx={18} ry={7} className="seslenen-hale" />
        <g transform={`translate(${m.sx.toFixed(1)},${(m.sy + 4).toFixed(1)}) scale(1.7)`}>
          {/* pencereden uzanan gövde ve baş */}
          <rect x={-6} y={-2} width={12} height={10} rx={4} fill={renk} />
          <circle cx={0} cy={-8} r={6.5} fill="#f1c7a1" />
          <path d="M -6.6 -8.5 A 6.6 7 0 0 1 6.6 -8.5 Q 0 -12 -6.6 -8.5 Z" fill="#3b2f2f" />
          <circle cx={-2.2} cy={-8} r={0.9} fill="#1d2233" /><circle cx={2.2} cy={-8} r={0.9} fill="#1d2233" />
          <path d="M -2 -5 Q 0 -3.2 2 -5" stroke="#1d2233" strokeWidth={0.9} fill="none" />
          {/* el sallayan kol */}
          <g className="seslenen-kol">
            <rect x={4} y={-14} width={3.5} height={13} rx={1.7} fill={renk} />
            <circle cx={5.8} cy={-15} r={2.6} fill="#f1c7a1" />
          </g>
          {/* balon */}
          {/* balon: başın tam üstünde, kuyruğu aşağıda */}
          <g className="seslenen-balon">
            <path d="M -4 -24 L 0 -18 L 4 -24 Z" fill="#fff" stroke={renk} strokeWidth={1.4} strokeLinejoin="round" />
            <rect x={-bg / 2} y={-44} width={bg} height={20} rx={10} fill="#fff" stroke={renk} strokeWidth={1.4} />
            <rect x={-5} y={-25.5} width={10} height={2.5} fill="#fff" />
            <text x={0} y={-30.5} textAnchor="middle" className="seslenen-yazi">{metin}</text>
          </g>
        </g>
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
      {seslenenler}
    </svg>
  )
}
