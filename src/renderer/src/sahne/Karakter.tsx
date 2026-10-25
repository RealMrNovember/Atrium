// Ajan karakteri ve yürüyüş. Bütün karakterler tek animasyon döngüsünde hareket eder;
// sahne anlık konumları bildiği için derinlik sıralaması doğru kalır.
import { useEffect, useRef, useState, type ReactElement } from 'react'
import type { Ajan, AjanCanli } from '@ortak/tipler'
import { koyu } from './sekiller'
import { iso, yolBul, yolNoktasi, yolUzunlugu, type Nokta } from './yerlesim'

export const YURUME_SURESI_MS = 2400

interface Hareket {
  nokta: Nokta
  hedef: Nokta
  yol?: Nokta[]
  t0?: number
  sure?: number
}

export interface Konum { nokta: Nokta; yuruyor: boolean }

/**
 * Her karakteri hedefine yürütür. İlk çizimden sonra beliren karakterler `giris` noktasından
 * (asansör) başlar — işe alınan ya da Claude sohbetinden gelen ajan kapıdan girer.
 */
export function useYurumeler(hedefler: Record<string, Nokta>, giris: Nokta): Record<string, Konum> {
  const durum = useRef<Record<string, Hareket>>({})
  const ilkCizim = useRef(true)
  const [, yenile] = useState(0)
  const anahtar = JSON.stringify(hedefler)

  useEffect(() => {
    const d = durum.current
    const baslat = (id: string, bas: Nokta, h: Nokta): void => {
      const yol = yolBul(bas, h)
      d[id] = { nokta: bas, hedef: h, yol, t0: performance.now(), sure: Math.min(YURUME_SURESI_MS, Math.max(600, yolUzunlugu(yol) * 260)) }
    }
    for (const [id, h] of Object.entries(hedefler)) {
      const s = d[id]
      if (!s) {
        if (ilkCizim.current) d[id] = { nokta: h, hedef: h }
        else baslat(id, giris, h)
        continue
      }
      if (Math.hypot(s.hedef.x - h.x, s.hedef.y - h.y) < 0.01) continue
      baslat(id, s.nokta, h)
    }
    for (const id of Object.keys(d)) if (!(id in hedefler)) delete d[id]
    ilkCizim.current = false
    yenile((x) => x + 1)
  }, [anahtar])

  useEffect(() => {
    let kare = 0
    const adim = (t: number): void => {
      let degisti = false
      for (const s of Object.values(durum.current)) {
        if (!s.yol || s.t0 === undefined || !s.sure) continue
        const oran = Math.min(1, (t - s.t0) / s.sure)
        s.nokta = yolNoktasi(s.yol, oran)
        if (oran >= 1) s.yol = undefined
        degisti = true
      }
      if (degisti) yenile((x) => x + 1)
      kare = requestAnimationFrame(adim)
    }
    kare = requestAnimationFrame(adim)
    return () => cancelAnimationFrame(kare)
  }, [])

  return Object.fromEntries(Object.entries(durum.current).map(([id, s]) => [id, { nokta: s.nokta, yuruyor: !!s.yol }]))
}

const TEN = ['#f1c7a1', '#e0ac7e', '#c68b5e', '#8d5a3b', '#f5d5b8']
const SAC = ['#2b1d16', '#5a3825', '#1c1c1c', '#a0522d', '#d9b26f', '#3b2f2f']

function tohum(metin: string): number {
  let h = 0
  for (const c of metin) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

interface Props {
  ajan: Ajan
  canli?: AjanCanli
  konum: Konum
  secili: boolean
  misafir?: boolean
  onSec: () => void
}

export function Karakter({ ajan, canli, konum, secili, misafir, onSec }: Props): ReactElement {
  const { nokta, yuruyor } = konum
  const p = iso(nokta.x, nokta.y)
  const durum = canli?.durum ?? 'bosta'
  const oturuyor = !yuruyor && (canli?.hedef ?? 'masa') === 'masa' && !(misafir && durum !== 'calisiyor')
  const t = tohum(ajan.id + ajan.ad)
  const ten = TEN[t % TEN.length]
  const sac = SAC[(t >> 3) % SAC.length]
  const sinif = ['karakter', yuruyor ? 'yuruyor' : '', durum === 'calisiyor' && !yuruyor ? 'yaziyor' : '', secili ? 'secili' : '', misafir ? 'misafir' : ''].join(' ')
  const ofset = oturuyor ? 6 : 0
  return (
    <g transform={`translate(${p.sx.toFixed(1)},${p.sy.toFixed(1)})`} className={sinif} onClick={(e) => { e.stopPropagation(); onSec() }}>
      <ellipse cx={0} cy={0} rx={11} ry={5} fill="rgba(0,0,0,.28)" />
      {misafir && <ellipse cx={0} cy={0} rx={14} ry={6.5} fill="none" stroke="#e8875b" strokeWidth={1.5} strokeDasharray="3 3" />}
      {secili && <ellipse cx={0} cy={0} rx={16} ry={7.5} fill="none" stroke="#9d8bff" strokeWidth={2} className="secim-halkasi" />}
      <g transform={`translate(0,${ofset})`}>
        {!oturuyor && (
          <g className="bacaklar">
            <rect className="bacak-sol" x={-6} y={-15} width={5} height={15} rx={2} fill={koyu(ajan.renk, 0.55)} />
            <rect className="bacak-sag" x={1} y={-15} width={5} height={15} rx={2} fill={koyu(ajan.renk, 0.55)} />
          </g>
        )}
        <g className="govde">
          <rect className="kol-sol" x={-12} y={-31} width={4} height={14} rx={2} fill={koyu(ajan.renk, 0.2)} />
          <rect className="kol-sag" x={8} y={-31} width={4} height={14} rx={2} fill={koyu(ajan.renk, 0.2)} />
          <rect x={-9} y={-34} width={18} height={21} rx={6} fill={ajan.renk} />
          <circle cx={0} cy={-42} r={8} fill={ten} />
          <path d="M -8.4 -42 A 8.4 8.8 0 0 1 8.4 -42 Q 0 -46 -8.4 -42 Z" fill={sac} />
          {ajan.lider && <path d="M -5 -52 L -3 -57 L 0 -53.5 L 3 -57 L 5 -52 Z" fill="#ffd43b" stroke="#c99a06" strokeWidth={0.6} />}
          {misafir && <path d="M 0 -59 L 1.6 -55.2 L 5.6 -55 L 2.5 -52.4 L 3.6 -48.5 L 0 -50.7 L -3.6 -48.5 L -2.5 -52.4 L -5.6 -55 L -1.6 -55.2 Z" fill="#e8875b" />}
          {durum === 'rapor-veriyor' && <rect x={10} y={-30} width={9} height={11} rx={1} fill="#fff" stroke="#adb5bd" />}
          {durum === 'emir-aliyor' && <text x={12} y={-30} fontSize={12}>📥</text>}
          {durum === 'hata' && <text x={10} y={-46} fontSize={13}>⚠️</text>}
        </g>
      </g>
    </g>
  )
}

/** Karakterin üstündeki konuşma balonu — en üst katmanda çizilir ki duvarın altında kalmasın. */
export function Balon({ nokta, metin, renk, yukari = 0 }: { nokta: Nokta; metin: string; renk: string; yukari?: number }): ReactElement {
  const p = iso(nokta.x, nokta.y)
  const kisa = metin.length > 34 ? metin.slice(0, 33) + '…' : metin
  const g = Math.max(70, kisa.length * 6.2 + 20)
  return (
    <g transform={`translate(${p.sx.toFixed(1)},${(p.sy - 64 - yukari).toFixed(1)})`} className="balon" pointerEvents="none">
      {yukari > 0 && <line x1={0} y1={8} x2={0} y2={yukari} stroke={renk} strokeDasharray="2 3" opacity={0.7} />}
      <rect x={-g / 2} y={-20} width={g} height={22} rx={11} fill="rgba(255,255,255,.96)" stroke={renk} strokeWidth={1.5} />
      <path d="M -5 1.5 L 0 8 L 5 1.5 Z" fill="rgba(255,255,255,.96)" />
      <text x={0} y={-5} textAnchor="middle" fontSize={11} fill="#1d2233">{kisa}</text>
    </g>
  )
}
