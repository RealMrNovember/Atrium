// Otomatik güncelleme: GitHub Releases'tan yeni sürümü denetler, indirir, kurmayı teklif eder.
// macOS'ta uygulama imzasız olduğu için kendini güncelleyemez; orada yalnızca bildirir.
import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { GuncellemeDurumu } from '@ortak/tipler'

const DENETLEME_ARALIGI_MS = 4 * 60 * 60 * 1000
const kendiniGuncelleyebilir = process.platform !== 'darwin'

let durum: GuncellemeDurumu = { durum: 'yok', mevcutSurum: app.getVersion() }
let yayinci: (d: GuncellemeDurumu) => void = () => {}

function ayarla(yama: Partial<GuncellemeDurumu>): void {
  durum = { ...durum, ...yama }
  yayinci(durum)
}

export const guncellemeDurumu = (): GuncellemeDurumu => durum

export function guncellemeBaslat(yayinla: (d: GuncellemeDurumu) => void): void {
  yayinci = yayinla
  if (!app.isPackaged) return // geliştirmede denetleme yok
  autoUpdater.autoDownload = kendiniGuncelleyebilir
  autoUpdater.autoInstallOnAppQuit = kendiniGuncelleyebilir
  autoUpdater.on('checking-for-update', () => ayarla({ durum: 'denetleniyor' }))
  autoUpdater.on('update-not-available', () => ayarla({ durum: 'guncel', sonDenetim: new Date().toISOString() }))
  autoUpdater.on('update-available', (bilgi) =>
    ayarla({ durum: kendiniGuncelleyebilir ? 'indiriliyor' : 'mevcut', yeniSurum: bilgi.version, yuzde: 0, sonDenetim: new Date().toISOString() }))
  autoUpdater.on('download-progress', (p) => ayarla({ durum: 'indiriliyor', yuzde: Math.round(p.percent) }))
  autoUpdater.on('update-downloaded', (bilgi) => ayarla({ durum: 'hazir', yeniSurum: bilgi.version, yuzde: 100 }))
  autoUpdater.on('error', (e) => ayarla({ durum: 'hata', hata: String(e?.message ?? e).slice(0, 200) }))
  setTimeout(() => void guncellemeDenetle(), 10_000)
  setInterval(() => void guncellemeDenetle(), DENETLEME_ARALIGI_MS)
}

export async function guncellemeDenetle(): Promise<GuncellemeDurumu> {
  if (!app.isPackaged) {
    ayarla({ durum: 'guncel', sonDenetim: new Date().toISOString() })
    return durum
  }
  if (durum.durum === 'indiriliyor' || durum.durum === 'hazir') return durum
  try {
    await autoUpdater.checkForUpdates()
  } catch (e) {
    ayarla({ durum: 'hata', hata: String((e as Error)?.message ?? e).slice(0, 200) })
  }
  return durum
}

export function guncellemeKur(): void {
  if (durum.durum === 'hazir') autoUpdater.quitAndInstall(false, true)
}
