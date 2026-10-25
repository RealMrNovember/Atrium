// İzometrik yapı taşları: kutu, duvar parçası, saksı.
import type { ReactElement } from 'react'
import { cokgen, iso, zemin } from './yerlesim'

export function koyu(renk: string, oran: number): string {
  const n = parseInt(renk.slice(1), 16)
  const k = (v: number): number => Math.max(0, Math.min(255, Math.round(v * (1 - oran))))
  return `rgb(${k((n >> 16) & 255)},${k((n >> 8) & 255)},${k(n & 255)})`
}

interface KutuProps {
  x: number
  y: number
  g: number
  d: number
  h: number
  z?: number
  renk: string
  onYuz?: string // +y yüzü için özel dolgu (ekran gibi)
  sinif?: string
}

/** Görünen üç yüzüyle izometrik kutu (üst, +y ön, +x sağ). */
export function Kutu({ x, y, g, d, h, z = 0, renk, onYuz, sinif }: KutuProps): ReactElement {
  const x1 = x + g
  const y1 = y + d
  return (
    <g className={sinif}>
      <polygon points={cokgen([iso(x, y1, z + h), iso(x1, y1, z + h), iso(x1, y1, z), iso(x, y1, z)])} fill={onYuz ?? koyu(renk, 0.18)} />
      <polygon points={cokgen([iso(x1, y, z + h), iso(x1, y1, z + h), iso(x1, y1, z), iso(x1, y, z)])} fill={koyu(renk, 0.32)} />
      <polygon points={zemin(x, y, g, d, z + h)} fill={renk} />
    </g>
  )
}

/** (xa,ya)→(xb,yb) arasında h yüksekliğinde dikey duvar parçası. */
export function Duvar({ xa, ya, xb, yb, h, renk, opak = 1 }: { xa: number; ya: number; xb: number; yb: number; h: number; renk: string; opak?: number }): ReactElement {
  return (
    <g opacity={opak}>
      <polygon points={cokgen([iso(xa, ya), iso(xb, yb), iso(xb, yb, h), iso(xa, ya, h)])} fill={renk} />
      <polyline points={cokgen([iso(xa, ya, h), iso(xb, yb, h)])} stroke="rgba(255,255,255,.35)" strokeWidth={1.5} fill="none" />
    </g>
  )
}

export function Saksi({ x, y }: { x: number; y: number }): ReactElement {
  const ust = iso(x + 0.15, y + 0.15, 30)
  return (
    <g>
      <Kutu x={x} y={y} g={0.3} d={0.3} h={12} renk="#b07a4f" />
      <circle cx={ust.sx} cy={ust.sy} r={11} fill="#3f8f5a" />
      <circle cx={ust.sx - 6} cy={ust.sy + 4} r={7} fill="#4fa86b" />
      <circle cx={ust.sx + 6} cy={ust.sy + 2} r={7} fill="#367d4e" />
    </g>
  )
}
