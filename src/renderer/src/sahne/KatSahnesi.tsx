// Bir katın izometrik sahnesi: 8 oda, koridor, masalar, ekranlar, canlı ajanlar ve
// Claude Code sohbetlerinden gelen misafir alt ajanlar.
import { useEffect, useRef, useState, type ReactElement } from 'react'
import type { Ajan, AjanCanli, MisafirAjan } from '@ortak/tipler'
import { ajanAnahtari } from '@ortak/tipler'
import { useDil } from '../dil'
import { Balon, Karakter, useYurumeler } from './Karakter'
import { Duvar, koyu, Kutu, Saksi } from './sekiller'
import {
  cokgen, DUVAR_DIS, DUVAR_IC, iso, KAT_D, KAT_G, liderOnu, ODA_D, ODA_G, ODA_SAYISI, odalar,
  SAHNE_G, SAHNE_Y, zemin, type Nokta
} from './yerlesim'

const ODALAR = odalar()
const KAPI_GENISLIGI = 1.0
const ASANSOR: Nokta = { x: 0.45, y: 5 }
const MISAFIR_RENGI = '#e8875b'
const CLAUDE_RENGI = '#d97757'
const AYRILMA_MS = 2600

export const misafirId = (id: string): string => `m-${id}`

interface Props {
  katId: string
  ajanlar: Ajan[]
  canli: Record<string, AjanCanli>
  misafirler: MisafirAjan[]
  seciliAjan: string | null
  onAjanSec: (id: string | null) => void
  onBosOda: (oda: number) => void
}

interface Ciz { derinlik: number; el: ReactElement }

/** Kapı boşluğu bırakarak bir kenarı yarım karoluk duvar parçalarına böler. */
function duvarParcalari(
  sabit: 'x' | 'y', deger: number, bas: number, son: number, h: number, renk: string,
  bosluk: [number, number] | null, anahtar: string, opak = 1
): Ciz[] {
  const parcalar: Ciz[] = []
  for (let a = bas; a < son; a += 0.5) {
    const b = Math.min(son, a + 0.5)
    if (bosluk && b > bosluk[0] && a < bosluk[1]) continue
    const [xa, ya, xb, yb] = sabit === 'y' ? [a, deger, b, deger] : [deger, a, deger, b]
    parcalar.push({
      derinlik: (xa + xb) / 2 + (ya + yb) / 2 - 0.01,
      el: <Duvar key={`${anahtar}-${a}`} xa={xa} ya={ya} xb={xb} yb={yb} h={h} renk={renk} opak={opak} />
    })
  }
  return parcalar
}

/** Misafirleri boş odalara yerleştirir; ayrılanları asansöre yürüterek sahneden çıkarır. */
function useMisafirler(misafirler: MisafirAjan[], doluOdalar: number[]): { ajan: Ajan; m: MisafirAjan; ayriliyor: boolean }[] {
  const odaHaritasi = useRef(new Map<string, number>())
  const [ayrilanlar, setAyrilanlar] = useState<Record<string, { m: MisafirAjan; oda: number }>>({})
  const onceki = useRef<MisafirAjan[]>([])

  useEffect(() => {
    const simdiki = new Set(misafirler.map((m) => m.id))
    const giden = onceki.current.filter((m) => !simdiki.has(m.id))
    if (giden.length) {
      setAyrilanlar((a) => ({ ...a, ...Object.fromEntries(giden.map((m) => [m.id, { m, oda: odaHaritasi.current.get(m.id) ?? 0 }])) }))
      const zaman = setTimeout(() => {
        setAyrilanlar((a) => Object.fromEntries(Object.entries(a).filter(([id]) => !giden.some((g) => g.id === id))))
        for (const g of giden) odaHaritasi.current.delete(g.id)
      }, AYRILMA_MS)
      onceki.current = misafirler
      return () => clearTimeout(zaman)
    }
    onceki.current = misafirler
  }, [misafirler])

  // kalıcı bir ajan (ör. yeni işe alınan) misafirin odasını aldıysa misafir başka boş odaya geçer
  for (const [id, oda] of odaHaritasi.current) if (doluOdalar.includes(oda)) odaHaritasi.current.delete(id)
  const kullanilan = new Set([...doluOdalar, ...odaHaritasi.current.values()])
  const sonuc: { ajan: Ajan; m: MisafirAjan; ayriliyor: boolean }[] = []
  const ajanYap = (m: MisafirAjan, oda: number): Ajan => ({
    id: misafirId(m.id), ad: m.tur, rol: m.aciklama || m.tur, gorevTanimi: m.aciklama, model: '',
    renk: m.id.startsWith('sohbet-') ? CLAUDE_RENGI : MISAFIR_RENGI, oda
  })
  for (const m of misafirler) {
    let oda = odaHaritasi.current.get(m.id)
    if (oda === undefined) {
      oda = Array.from({ length: ODA_SAYISI }, (_, i) => i).find((i) => !kullanilan.has(i))
      if (oda === undefined) continue // kat dolu
      odaHaritasi.current.set(m.id, oda)
      kullanilan.add(oda)
    }
    sonuc.push({ ajan: ajanYap(m, oda), m, ayriliyor: false })
  }
  for (const { m, oda } of Object.values(ayrilanlar)) sonuc.push({ ajan: ajanYap(m, oda), m, ayriliyor: true })
  return sonuc
}

export function KatSahnesi({ katId, ajanlar, canli, misafirler, seciliAjan, onAjanSec, onBosOda }: Props): ReactElement {
  const { t } = useDil()
  const misafirListesi = useMisafirler(misafirler, ajanlar.map((a) => a.oda))
  const odaSahibi = new Map<number, Ajan>(ajanlar.map((a) => [a.oda, a]))
  const misafirOdasi = new Map(misafirListesi.filter((x) => !x.ayriliyor).map((x) => [x.ajan.oda, x]))
  const canliOf = (a: Ajan): AjanCanli | undefined => canli[ajanAnahtari(katId, a.id)]
  const misafirCanli = (ayriliyor: boolean, m: MisafirAjan): AjanCanli =>
    ({ durum: ayriliyor ? 'yuruyor' : 'calisiyor', hedef: 'masa', etkinlik: ayriliyor ? undefined : m.etkinlik, gunluk: [] })

  // hedefler: masa, liderin önü ya da (ayrılan misafir için) asansör
  const ziyaretciler = ajanlar.filter((a) => !a.lider && canliOf(a)?.hedef === 'lider').sort((a, b) => a.oda - b.oda)
  const hedefler: Record<string, Nokta> = {}
  for (const a of ajanlar) {
    const c = canliOf(a)
    // durum turu: lider ziyaret ettiği ajanın masasının yanında durur
    if (c?.hedef === 'ziyaret' && c.ziyaretOda !== undefined && ODALAR[c.ziyaretOda]) {
      const k = ODALAR[c.ziyaretOda].koltuk
      hedefler[a.id] = { x: k.x - 1.0, y: k.y + 0.35 }
      continue
    }
    const sira = ziyaretciler.indexOf(a)
    hedefler[a.id] = sira >= 0 ? liderOnu(sira) : ODALAR[a.oda]?.koltuk ?? ODALAR[0].koltuk
  }
  for (const { ajan, ayriliyor } of misafirListesi) hedefler[ajan.id] = ayriliyor ? ASANSOR : ODALAR[ajan.oda].koltuk
  const konumlar = useYurumeler(hedefler, ASANSOR)

  // --- sıralanan nesneler ---
  const ciz: Ciz[] = []
  const IC_DUVAR = '#c9d3e3'
  for (const oda of ODALAR) {
    const { x0, y0, ust, no } = oda
    const bosluk: [number, number] = [oda.kapiIc.x - KAPI_GENISLIGI / 2, oda.kapiIc.x + KAPI_GENISLIGI / 2]
    if (ust) {
      if (x0 > 0) ciz.push(...duvarParcalari('x', x0, 0, ODA_D, DUVAR_IC, IC_DUVAR, null, `sol${no}`))
      ciz.push(...duvarParcalari('y', ODA_D, x0, x0 + ODA_G, 14, '#a5d8ff', bosluk, `cam${no}`, 0.45))
    } else {
      ciz.push(...duvarParcalari('y', y0, x0, x0 + ODA_G, DUVAR_IC, IC_DUVAR, bosluk, `arka${no}`))
      if (x0 > 0) ciz.push(...duvarParcalari('x', x0, y0, y0 + ODA_D, DUVAR_IC, IC_DUVAR, null, `sol${no}`))
    }

    const sahip = odaSahibi.get(no) ?? misafirOdasi.get(no)?.ajan
    const calisiyor = odaSahibi.has(no) ? canliOf(sahip!)?.durum === 'calisiyor' : misafirOdasi.has(no)
    const { masa, koltuk } = oda
    const masaRengi = sahip?.lider ? '#6b4f3a' : '#8a6a4f'
    const mg = sahip?.lider ? 2 : 1.6
    ciz.push({
      derinlik: masa.x + masa.y,
      el: (
        <g key={`masa${no}`} opacity={sahip ? 1 : 0.45}>
          <Kutu x={masa.x - mg / 2} y={masa.y - 0.35} g={mg} d={0.7} h={18} renk={masaRengi} />
          <Kutu x={masa.x - 0.32} y={masa.y - 0.3} g={0.64} d={0.07} h={22} z={18} renk="#2a3142"
            onYuz={calisiyor ? (sahip?.renk ?? '#7fdcff') : '#1b2333'} sinif={calisiyor ? 'ekran-acik' : ''} />
          <Kutu x={masa.x + 0.45} y={masa.y - 0.05} g={0.25} d={0.18} h={6} z={18} renk="#e9ecef" />
          {sahip?.lider && <Kutu x={masa.x - 0.85} y={masa.y - 0.1} g={0.3} d={0.22} h={4} z={18} renk="#ffd43b" />}
        </g>
      )
    })
    ciz.push({
      derinlik: koltuk.x + koltuk.y - 0.2,
      el: <Kutu key={`koltuk${no}`} x={koltuk.x - 0.25} y={koltuk.y - 0.2} g={0.5} d={0.4} h={9} renk="#3b4256" />
    })
    ciz.push({ derinlik: x0 + 3.5 + y0 + (ust ? 0.4 : 3.4), el: <Saksi key={`saksi${no}`} x={x0 + 3.45} y={y0 + (ust ? 0.25 : 3.35)} /> })
  }

  const ciziliAjanlar: { ajan: Ajan; c?: AjanCanli; misafir: boolean }[] = [
    ...ajanlar.map((a) => ({ ajan: a, c: canliOf(a), misafir: false })),
    ...misafirListesi.map((x) => ({ ajan: x.ajan, c: misafirCanli(x.ayriliyor, x.m), misafir: true }))
  ]
  for (const { ajan, c, misafir } of ciziliAjanlar) {
    const k = konumlar[ajan.id]
    if (!k) continue
    ciz.push({
      derinlik: k.nokta.x + k.nokta.y + 0.05,
      el: <Karakter key={`ajan-${ajan.id}`} ajan={ajan} canli={c} konum={k} misafir={misafir} secili={seciliAjan === ajan.id} onSec={() => onAjanSec(ajan.id)} />
    })
  }
  ciz.sort((p, q) => p.derinlik - q.derinlik)

  // --- zemin katmanı ---
  const zeminler = ODALAR.map((oda) => {
    const sahip = odaSahibi.get(oda.no) ?? misafirOdasi.get(oda.no)?.ajan
    const renk = sahip ? koyu(sahip.renk, 0.62) : '#1f2535'
    return (
      <g key={`zemin${oda.no}`} className={sahip ? 'oda' : 'oda bos'} onClick={(e) => { e.stopPropagation(); sahip ? onAjanSec(sahip.id) : onBosOda(oda.no) }}>
        <polygon points={zemin(oda.x0, oda.y0, ODA_G, ODA_D)} fill={renk} stroke="rgba(255,255,255,.08)" />
        <polygon points={zemin(oda.x0 + 0.3, oda.y0 + 0.3, ODA_G - 0.6, ODA_D - 0.6)} fill="rgba(255,255,255,.035)" />
        {sahip?.lider && <ellipse cx={iso(2.5, 2.9).sx} cy={iso(2.5, 2.9).sy} rx={64} ry={30} fill="rgba(255,212,59,.10)" stroke="rgba(255,212,59,.25)" />}
      </g>
    )
  })

  // konuşma balonları: üst üste binenleri yukarı kaydır
  const gen = (m: string): number => Math.max(70, Math.min(34, m.length) * 6.2 + 20)
  const balonlar = ciziliAjanlar
    .map(({ ajan, c }) => ({ ajan, c, k: konumlar[ajan.id] }))
    .filter((b) => !!b.k && !!b.c?.etkinlik && b.c.durum !== 'bosta')
    .map((b) => ({ ...b, metin: b.c!.etkinlik!, p: iso(b.k!.nokta.x, b.k!.nokta.y), yukari: 0 }))
    .sort((a, b) => b.p.sy - a.p.sy)
  balonlar.forEach((b, i) => {
    for (let j = 0; j < i; j++) {
      const o = balonlar[j]
      const ustY = b.p.sy - b.yukari
      const oY = o.p.sy - o.yukari
      if (Math.abs(b.p.sx - o.p.sx) < (gen(b.metin) + gen(o.metin)) / 2 + 4 && Math.abs(ustY - oY) < 26) b.yukari += 26 - (oY - ustY)
    }
  })

  // oda tabelaları: duvarların altında kalmasın diye üst katmanda, odanın ön köşesinde
  const tabelalar = ODALAR.map((oda) => {
    const sahip = odaSahibi.get(oda.no)
    const misafir = misafirOdasi.get(oda.no)
    const p = iso(oda.x0 + ODA_G - 0.35, oda.y0 + ODA_D - 0.35)
    const yazi = sahip ? sahip.rol : misafir ? (misafir.m.id.startsWith('sohbet-') ? t('claudeChat') : t('guestAgent')) : t('emptyRoom')
    const alt = sahip ? sahip.ad : misafir ? (misafir.m.id.startsWith('sohbet-') ? misafir.m.aciklama.slice(0, 28) : misafir.ajan.ad) : ''
    const cerceve = sahip ? sahip.renk : misafir ? misafir.ajan.renk : 'rgba(157,139,255,.5)'
    const g = Math.max(64, Math.min(30, yazi.length) * 6.6 + 16)
    return (
      <g key={`tabela${oda.no}`} className={sahip || misafir ? 'tabela' : 'tabela bos'} transform={`translate(${p.sx.toFixed(1)},${(p.sy - 4).toFixed(1)})`}
        onClick={(e) => { e.stopPropagation(); if (sahip) onAjanSec(sahip.id); else if (misafir) onAjanSec(misafir.ajan.id); else onBosOda(oda.no) }}>
        <rect x={-g / 2} y={-15} width={g} height={alt ? 30 : 20} rx={7} fill="rgba(11,15,26,.78)" stroke={cerceve} />
        <text x={0} y={-1} textAnchor="middle" className="oda-etiketi">{yazi.length > 30 ? yazi.slice(0, 29) + '…' : yazi}</text>
        {alt && <text x={0} y={11} textAnchor="middle" className="oda-etiketi alt">{alt}</text>}
      </g>
    )
  })

  const pencereler = []
  for (let x = 0.5; x < KAT_G; x += 2) {
    pencereler.push(<polygon key={`p${x}`} points={cokgen([iso(x, 0, 20), iso(x + 1.2, 0, 20), iso(x + 1.2, 0, DUVAR_DIS - 12), iso(x, 0, DUVAR_DIS - 12)])} className="pencere" />)
  }
  for (const y of [0.8, 2.4, 7, 8.6]) {
    pencereler.push(<polygon key={`ps${y}`} points={cokgen([iso(0, y, 20), iso(0, y + 1, 20), iso(0, y + 1, DUVAR_DIS - 12), iso(0, y, DUVAR_DIS - 12)])} className="pencere" />)
  }
  const asansorEtiketi = iso(0, 5, 58)

  return (
    <svg className="kat-sahnesi" viewBox={`0 0 ${SAHNE_G} ${SAHNE_Y}`} preserveAspectRatio="xMidYMid meet" onClick={() => onAjanSec(null)}>
      <defs>
        <linearGradient id="zeminIsik" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a3247" />
          <stop offset="1" stopColor="#1a2032" />
        </linearGradient>
      </defs>
      {/* taban */}
      <polygon points={zemin(0, 0, KAT_G, KAT_D, -10)} fill="#0b0f1a" />
      <polygon points={cokgen([iso(0, KAT_D, 0), iso(KAT_G, KAT_D, 0), iso(KAT_G, KAT_D, -10), iso(0, KAT_D, -10)])} fill="#151b2b" />
      <polygon points={cokgen([iso(KAT_G, 0, 0), iso(KAT_G, KAT_D, 0), iso(KAT_G, KAT_D, -10), iso(KAT_G, 0, -10)])} fill="#10141f" />
      <polygon points={zemin(0, 0, KAT_G, KAT_D)} fill="url(#zeminIsik)" />
      {/* dış duvarlar */}
      <Duvar xa={0} ya={0} xb={KAT_G} yb={0} h={DUVAR_DIS} renk="#d9e1ee" />
      <Duvar xa={0} ya={0} xb={0} yb={KAT_D} h={DUVAR_DIS} renk="#b8c4d6" />
      {pencereler}
      <polygon points={cokgen([iso(0, 4.3, 0), iso(0, 5.7, 0), iso(0, 5.7, 50), iso(0, 4.3, 50)])} fill="#8795ab" />
      <polyline points={cokgen([iso(0, 5, 0), iso(0, 5, 50)])} stroke="#5c6880" strokeWidth={2} />
      <text x={asansorEtiketi.sx - 4} y={asansorEtiketi.sy} textAnchor="middle" className="oda-etiketi">{t('elevator')}</text>
      {/* koridor */}
      <polygon points={zemin(0, 4, KAT_G, 2)} fill="#2b3550" />
      <polygon points={zemin(0, 4.9, KAT_G, 0.2)} fill="rgba(124,92,255,.35)" />
      {zeminler}
      {ciz.map((c) => c.el)}
      {tabelalar}
      {balonlar.map((b) => <Balon key={`balon-${b.ajan.id}`} nokta={b.k!.nokta} metin={b.metin} renk={b.ajan.renk} yukari={b.yukari} />)}
    </svg>
  )
}
