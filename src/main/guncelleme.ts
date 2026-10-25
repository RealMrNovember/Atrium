// Otomatik güncelleme: GitHub Releases'tan yeni sürümü denetler, indirir, kurmayı teklif eder.
// macOS'ta uygulama imzasız olduğu için kendini güncelleyemez; orada yalnızca bildirir.
import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { GuncellemeDurumu } from '@ortak/tipler'

// açılışta hemen, sonra 10 dakikada bir (GitHub sürüm akışı; inme/kurulum sürerken atlanır)
const DENETLEME_ARALIGI_MS = 10 * 60 * 1000
const kendiniGuncelleyebilir = process.platform !== 'darwin'

let durum: GuncellemeDurumu = { durum: 'yok', mevcutSurum: app.getVersion() }
let yayinci: (d: GuncellemeDurumu) => void = () => {}

function ayarla(yama: Partial<GuncellemeDurumu>): void {
  durum = { ...durum, ...yama }
  yayinci(durum)
}

export const guncellemeDurumu = (): GuncellemeDurumu => durum

/** Yeni sürümün 6 dildeki notları showroom'da yayımlanır; bulunamazsa GitHub notları kullanılır. */
async function dilliNotlariGetir(surum: string): Promise<void> {
  try {
    const yanit = await fetch(`https://atrium.cicibyte.com/yenilikler.json?v=${encodeURIComponent(surum)}`, { signal: AbortSignal.timeout(10_000) })
    if (!yanit.ok) return
    const veri = (await yanit.json()) as Record<string, { surum: string; baslik: string; maddeler: string[] }[]>
    const dilli: Record<string, { baslik: string; maddeler: string[] }> = {}
    for (const [dil, liste] of Object.entries(veri)) {
      const not = Array.isArray(liste) ? liste.find((n) => n.surum === surum) : undefined
      if (not) dilli[dil] = { baslik: String(not.baslik).slice(0, 200), maddeler: (not.maddeler ?? []).slice(0, 12).map((m) => String(m).slice(0, 400)) }
    }
    if (Object.keys(dilli).length) ayarla({ yeniNotlarDilli: dilli })
  } catch {
    /* çevrimdışı — GitHub notları yeter */
  }
}

/** electron-updater sürüm notlarını HTML (GitHub) ya da dizi olarak verir → sade Markdown'a yakın metin. */
function notMetni(notlar: unknown): string | undefined {
  const ham = Array.isArray(notlar)
    ? notlar.map((n: { version?: string; note?: string | null }) => `## ${n.version ?? ''}\n${n.note ?? ''}`).join('\n\n')
    : typeof notlar === 'string' ? notlar : ''
  if (!ham) return undefined
  return ham
    .replace(/<h[1-3][^>]*>/gi, '\n## ').replace(/<\/h[1-3]>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n')
    .replace(/<(strong|b)>/gi, '**').replace(/<\/(strong|b)>/gi, '**')
    .replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n').trim().slice(0, 6000)
}

export function guncellemeBaslat(yayinla: (d: GuncellemeDurumu) => void): void {
  yayinci = yayinla
  if (!app.isPackaged) {
    // geliştirmede denetleme yok; ATRIUM_SAHTE_GUNCELLEME=<sürüm> "yeni sürüm iniyor" durumunu taklit eder
    const sahte = process.env.ATRIUM_SAHTE_GUNCELLEME
    if (sahte) setTimeout(() => {
      ayarla({ durum: 'indiriliyor', yeniSurum: sahte, yuzde: 37, sonDenetim: new Date().toISOString() })
      void dilliNotlariGetir(sahte)
    }, 3000)
    return
  }
  autoUpdater.autoDownload = kendiniGuncelleyebilir
  autoUpdater.autoInstallOnAppQuit = kendiniGuncelleyebilir
  autoUpdater.on('checking-for-update', () => ayarla({ durum: 'denetleniyor' }))
  autoUpdater.on('update-not-available', () => ayarla({ durum: 'guncel', sonDenetim: new Date().toISOString() }))
  autoUpdater.on('update-available', (bilgi) => {
    ayarla({ durum: kendiniGuncelleyebilir ? 'indiriliyor' : 'mevcut', yeniSurum: bilgi.version, yeniNotlar: notMetni(bilgi.releaseNotes),
      yuzde: 0, sonDenetim: new Date().toISOString() })
    void dilliNotlariGetir(bilgi.version)
  })
  autoUpdater.on('download-progress', (p) => ayarla({ durum: 'indiriliyor', yuzde: Math.round(p.percent) }))
  autoUpdater.on('update-downloaded', (bilgi) => ayarla({ durum: 'hazir', yeniSurum: bilgi.version, yuzde: 100 }))
  autoUpdater.on('error', (e) => ayarla({ durum: 'hata', hata: String(e?.message ?? e).slice(0, 200) }))
  setTimeout(() => void guncellemeDenetle(), 3_000)
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
