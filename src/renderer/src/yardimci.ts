import type { AjanDurumu, GorevDurumu, KomutDurumu } from '@ortak/tipler'
import type { Anahtar, Cevirmen, Dil } from '@ortak/i18n'

export const DURUM_ANAHTARI: Record<AjanDurumu, Anahtar> = {
  bosta: 'stIdle',
  yuruyor: 'stWalking',
  'emir-aliyor': 'stOrders',
  calisiyor: 'stWorking',
  'rapor-veriyor': 'stReporting',
  hata: 'stError'
}

export const KOMUT_ANAHTARI: Record<KomutDurumu, Anahtar> = {
  planlaniyor: 'cmdPlanning',
  yurutuluyor: 'cmdRunning',
  raporlaniyor: 'cmdReporting',
  tamam: 'cmdDone',
  hata: 'cmdError',
  iptal: 'cmdCancelled'
}

export const GOREV_ANAHTARI: Record<GorevDurumu, Anahtar> = {
  bekliyor: 'tQueued',
  calisiyor: 'tWorking',
  tamam: 'tDone',
  hata: 'tError',
  iptal: 'tCancelled'
}

export const usd = (n: number): string => `$${n.toFixed(n < 1 ? 3 : 2)}`

export function zamanMetni(iso: string | undefined, t: Cevirmen, dil: Dil): string {
  if (!iso) return '-'
  const d = new Date(iso)
  const fark = (Date.now() - d.getTime()) / 1000
  if (fark < 60) return t('justNow')
  if (fark < 3600) return t('minAgo', { n: Math.floor(fark / 60) })
  if (fark < 86400) return t('hrAgo', { n: Math.floor(fark / 3600) })
  return d.toLocaleDateString(dil, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const RENKLER = ['#7c5cff', '#2f9e6e', '#e8590c', '#1c7ed6', '#c2255c', '#868e96', '#f08c00', '#0c8599', '#9c36b5', '#5c940d']

export const GITHUB = 'https://github.com/RealMrNovember/Atrium'
export const CICIBYTE = 'https://cicibyte.com'
export const SHOWROOM = 'https://atrium.cicibyte.com'
export const KAHVE = 'https://buymeacoffee.com/mikeross'
export const SURUM = __SURUM__

/** Hata mesajından Electron'un IPC önekini temizler. */
export const hataMetni = (e: unknown): string =>
  (e instanceof Error ? e.message : String(e)).replace(/^Error invoking remote method '[^']+': (Error: )?/, '')

/** Bilgisayardan seçilen görseli en fazla 256px'lik PNG data URL'ine indirir. */
export function logoOku(dosya: File): Promise<string> {
  return new Promise((coz, red) => {
    const okuyucu = new FileReader()
    okuyucu.onerror = () => red(okuyucu.error)
    okuyucu.onload = () => {
      const img = new Image()
      img.onerror = () => red(new Error('image'))
      img.onload = () => {
        const olcek = Math.min(1, 256 / Math.max(img.width, img.height))
        const tuval = document.createElement('canvas')
        tuval.width = Math.max(1, Math.round(img.width * olcek))
        tuval.height = Math.max(1, Math.round(img.height * olcek))
        tuval.getContext('2d')!.drawImage(img, 0, 0, tuval.width, tuval.height)
        coz(tuval.toDataURL('image/png'))
      }
      img.src = String(okuyucu.result)
    }
    okuyucu.readAsDataURL(dosya)
  })
}
