// Ses efektleri: dosya yok, WebAudio ile sentezlenir. Hepsi kısık ve kısa.
import { useEffect, useRef } from 'react'
import type { CanliDurum } from '@ortak/tipler'

let baglam: AudioContext | null = null
const ac = (): AudioContext => (baglam ??= new AudioContext())

function ton(frekans: number, sure: number, ses = 0.05, tip: OscillatorType = 'sine', gecikme = 0): void {
  const c = ac()
  const t0 = c.currentTime + gecikme
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = tip
  o.frequency.setValueAtTime(frekans, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(ses, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + sure)
  o.connect(g).connect(c.destination)
  o.start(t0)
  o.stop(t0 + sure + 0.02)
}

function gurultu(sure: number, ses: number, filtre: number, gecikme = 0): void {
  const c = ac()
  const t0 = c.currentTime + gecikme
  const tampon = c.createBuffer(1, Math.ceil(c.sampleRate * sure), c.sampleRate)
  const veri = tampon.getChannelData(0)
  for (let i = 0; i < veri.length; i++) veri[i] = (Math.random() * 2 - 1) * (1 - i / veri.length)
  const kaynak = c.createBufferSource()
  kaynak.buffer = tampon
  const f = c.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = filtre
  const g = c.createGain()
  g.gain.value = ses
  kaynak.connect(f).connect(g).connect(c.destination)
  kaynak.start(t0)
}

export const SES = {
  adim: () => gurultu(0.07, 0.18, 380 + Math.random() * 120),
  tus: () => gurultu(0.025, 0.12, 2400 + Math.random() * 1600),
  asansor: () => { ton(1318.5, 0.5, 0.04); ton(1046.5, 0.7, 0.035, 'sine', 0.18) },
  isAlim: () => [523.3, 659.3, 784, 1046.5].forEach((f, i) => ton(f, 0.25, 0.035, 'triangle', i * 0.09)),
  rapor: () => { ton(880, 0.18, 0.035, 'triangle'); ton(1318.5, 0.35, 0.03, 'triangle', 0.12) },
  bitti: () => [659.3, 784, 987.8].forEach((f, i) => ton(f, 0.4, 0.035, 'sine', i * 0.12)),
  hata: () => { ton(220, 0.25, 0.04, 'sawtooth'); ton(196, 0.3, 0.035, 'sawtooth', 0.15) }
}

/**
 * Canlı durumdaki değişimleri sese çevirir. Adım ve klavye sesleri yalnız açık kattaki ajanlar için;
 * işe alım, rapor, bitiş ve misafir gelişi her katta duyulur.
 */
export function useSesler(canli: CanliDurum, acik: boolean, katId: string | null): void {
  const onceki = useRef<CanliDurum | null>(null)
  const durumRef = useRef({ canli, acik, katId })
  durumRef.current = { canli, acik, katId }

  // olay sesleri
  useEffect(() => {
    const o = onceki.current
    onceki.current = canli
    if (!o || !acik) return
    let rapor = false
    let isAlim = false
    let hata = false
    for (const [k, a] of Object.entries(canli.ajanlar)) {
      const eski = o.ajanlar[k]
      if (a.durum === 'rapor-veriyor' && eski?.durum !== 'rapor-veriyor') rapor = true
      if (a.durum === 'hata' && eski?.durum !== 'hata') hata = true
      if (a.gunluk.length > (eski?.gunluk.length ?? 0) && a.gunluk[a.gunluk.length - 1]?.includes('🎉')) isAlim = true
    }
    const bitenler = o.aktifKomutlar.filter((k) => !canli.aktifKomutlar.some((y) => y.id === k.id))
    const misafir = (c: CanliDurum): number =>
      Object.values(c.misafirler).reduce((n, l) => n + l.length, 0) + Object.values(c.aktifSohbetler).reduce((n, l) => n + l.length, 0)
    if (isAlim) SES.isAlim()
    else if (misafir(canli) > misafir(o)) SES.asansor()
    if (bitenler.length) SES.bitti()
    else if (rapor) SES.rapor()
    if (hata) SES.hata()
  }, [canli, acik])

  // sürekli sesler: yürüyen varsa adım, çalışan varsa klavye
  useEffect(() => {
    let adimSayaci = 0
    const z = setInterval(() => {
      const { canli: c, acik: a, katId: k } = durumRef.current
      if (!a || !k) return
      const buKat = Object.entries(c.ajanlar).filter(([ad]) => ad.startsWith(k + '/')).map(([, v]) => v)
      if (buKat.some((v) => v.durum === 'yuruyor') && adimSayaci++ % 3 === 0) SES.adim()
      const calisan = buKat.filter((v) => v.durum === 'calisiyor').length + (c.misafirler[k]?.length ?? 0) + (c.aktifSohbetler[k]?.length ?? 0)
      if (calisan && Math.random() < Math.min(0.8, 0.25 * calisan)) SES.tus()
    }, 130)
    return () => clearInterval(z)
  }, [])
}
