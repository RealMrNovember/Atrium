import { app, BrowserWindow, dialog, ipcMain, safeStorage, shell } from 'electron'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Ajan, ClaudeDurumu, SirketProfili } from '@ortak/tipler'
import { claudeDurumuOku, claudeGirisBaslat } from './claude'
import * as depo from './depo'
import * as guncelleme from './guncelleme'
import * as motor from './motor'
import * as sohbet from './sohbetler'

let pencere: BrowserWindow | null = null
const ikon = join(__dirname, '../../build/icon.png')

// --- API anahtarı: işletim sisteminin güvenli deposuyla şifrelenir, arayüze hiç gelmez ---

const anahtarDosyasi = (): string => join(depo.veriKlasoru(), 'anahtar.bin')

function apiAnahtariOku(): string | undefined {
  try {
    if (!existsSync(anahtarDosyasi()) || !safeStorage.isEncryptionAvailable()) return undefined
    return safeStorage.decryptString(readFileSync(anahtarDosyasi()))
  } catch {
    return undefined
  }
}

async function claudeDurumu(): Promise<ClaudeDurumu> {
  return claudeDurumuOku(depo.profilOku().ayarlar.claudeYolu, !!apiAnahtariOku())
}

/** Hafıza çıkarılırken kullanılacak sohbet bağlamı: başlıklar ve açılış istekleri. */
function sohbetBaglami(katId: string): string {
  const { sohbetKlasoru } = depo.profilOku()
  const liste = sohbet.sohbetleriListele(sohbetKlasoru, depo.katlariTara(), { katId }).slice(0, 15)
  return liste.map((s) => `- ${s.son.slice(0, 10)} · ${s.baslik}`).join('\n')
}

function pencereAc(): void {
  // ATRIUM_GIZLI=1: pencere ekrana gelmez (README ekran görüntüleri için CDP ile sürülür)
  const gizli = process.env.ATRIUM_GIZLI === '1'
  pencere = new BrowserWindow({
    width: 1480,
    height: 920,
    show: !gizli,
    paintWhenInitiallyHidden: true,
    minWidth: 1100,
    minHeight: 700,
    title: 'Atrium',
    icon: existsSync(ikon) ? ikon : undefined,
    backgroundColor: '#0e1220',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: !gizli
    }
  })
  // arayüz dış bağlantıyı kendi içinde açmasın, başka sayfaya da gitmesin
  pencere.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
  pencere.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(process.env.ELECTRON_RENDERER_URL ?? 'file://')) e.preventDefault()
  })
  if (process.env.ELECTRON_RENDERER_URL) void pencere.loadURL(process.env.ELECTRON_RENDERER_URL)
  else void pencere.loadFile(join(__dirname, '../renderer/index.html'))
}

function kanallar(): void {
  ipcMain.handle('profil', () => depo.profilOku())
  ipcMain.handle('profilKaydet', (_e, p: SirketProfili) => depo.profilYaz(p))
  ipcMain.handle('katlar', () => depo.katlariTara())
  ipcMain.handle('katOnizle', (_e, klasor: string) => depo.katAdlari(klasor))
  ipcMain.handle('katDetayi', (_e, katId: string) => ({
    kat: depo.katBul(katId),
    ajanlar: depo.ajanlariOku(katId),
    hafiza: depo.hafizaOku(katId),
    komutlar: depo.komutlariOku(katId)
  }))
  ipcMain.handle('ajanKaydet', (_e, katId: string, ajan: Ajan) => {
    const liste = depo.ajanlariOku(katId)
    const var_ = liste.some((a) => a.id === ajan.id)
    return depo.ajanlariYaz(katId, var_ ? liste.map((a) => (a.id === ajan.id ? ajan : a)) : [...liste, ajan])
  })
  ipcMain.handle('ajanSil', (_e, katId: string, ajanId: string) =>
    depo.ajanlariYaz(katId, depo.ajanlariOku(katId).filter((a) => a.id !== ajanId || a.lider)))
  ipcMain.handle('hafizaKaydet', (_e, katId: string, metin: string) => depo.hafizaYaz(katId, metin))
  ipcMain.handle('hafizaCikar', (_e, katId: string) => { void motor.hafizaCikar(katId) })
  ipcMain.handle('komutVer', (_e, katId: string, metin: string, yazmaIzni: boolean) => motor.komutVer(katId, metin, yazmaIzni))
  ipcMain.handle('komutIptal', (_e, komutId: string) => motor.komutIptal(komutId))
  ipcMain.handle('tumRaporlar', () => depo.tumKomutlar())
  ipcMain.handle('canli', () => motor.canliDurum())
  ipcMain.handle('klasorAc', (_e, yol: string) => {
    // yalnız bir katın klasörü açılır
    const istenen = resolve(yol).toLowerCase()
    if (depo.katlariTara().some((k) => resolve(k.yol).toLowerCase() === istenen)) void shell.openPath(yol)
  })
  ipcMain.handle('klasorSec', async (_e, baslangic?: string) => {
    const sonuc = await dialog.showOpenDialog(pencere!, { properties: ['openDirectory'], defaultPath: baslangic || undefined })
    return sonuc.canceled ? null : sonuc.filePaths[0] ?? null
  })
  ipcMain.handle('claudeDurumu', () => claudeDurumu())
  ipcMain.handle('claudeGiris', () => claudeGirisBaslat(depo.profilOku().ayarlar.claudeYolu))
  ipcMain.handle('apiAnahtariKaydet', (_e, anahtar: string) => {
    const temiz = String(anahtar ?? '').trim()
    if (temiz && safeStorage.isEncryptionAvailable()) writeFileSync(anahtarDosyasi(), safeStorage.encryptString(temiz))
    return claudeDurumu()
  })
  ipcMain.handle('apiAnahtariSil', () => {
    rmSync(anahtarDosyasi(), { force: true })
    return claudeDurumu()
  })
  ipcMain.handle('sohbetOzeti', (_e, p: SirketProfili) => sohbet.sohbetOzeti(p.sohbetKlasoru, depo.katlariTara(p)))
  // katId: string → o kat, null → hiçbir kata eşlenmeyenler, undefined → hepsi
  ipcMain.handle('sohbetler', (_e, katId?: string | null) =>
    sohbet.sohbetleriListele(depo.profilOku().sohbetKlasoru, depo.katlariTara(), katId === undefined ? undefined : { katId }))
  ipcMain.handle('sohbetMesajlari', (_e, klasor: string, id: string) =>
    sohbet.sohbetMesajlari(depo.profilOku().sohbetKlasoru, klasor, id))
  ipcMain.handle('disBaglanti', (_e, url: string) => {
    if (/^https:\/\/[^\s]+$/.test(url)) void shell.openExternal(url)
  })
  ipcMain.handle('katSirala', (_e, siraliYollar: string[]) => depo.katSirala(siraliYollar))
  ipcMain.handle('durumTuru', (_e, katId: string) => motor.durumTuru(katId))
  ipcMain.handle('sohbetDevam', (_e, klasor: string, id: string, mesaj: string, yazma: boolean) => {
    const { sohbetKlasoru } = depo.profilOku()
    const bilgi = sohbet.sohbetBul(sohbetKlasoru, klasor, id)
    if (!bilgi) throw new Error(depo.ceviri()('noChats'))
    const katlar = depo.katlariTara()
    const katId = sohbet.katEsle(klasor, katlar)
    const cwd = bilgi.cwd || katlar.find((k) => k.id === katId)?.yol || ''
    if (!cwd) throw new Error(depo.ceviri()('noFolderSet'))
    void motor.sohbetDevam(id, { katId, cwd }, String(mesaj ?? '').slice(0, 20000), !!yazma)
  })
  ipcMain.handle('sohbetDurdur', (_e, id: string) => motor.sohbetDurdur(id))
  ipcMain.handle('guncellemeDurumu', () => guncelleme.guncellemeDurumu())
  ipcMain.handle('guncellemeDenetle', () => guncelleme.guncellemeDenetle())
  ipcMain.handle('guncellemeKur', () => guncelleme.guncellemeKur())
}

/** Claude Code sohbetlerinde açılan alt ajanları 3 saniyede bir tarar. */
function misafirTaramasi(): void {
  let katOnbellek = { zaman: 0, katlar: depo.katlariTara() }
  setInterval(() => {
    const p = depo.profilOku()
    if (!p.kurulumTamam) return
    if (Date.now() - katOnbellek.zaman > 60_000) katOnbellek = { zaman: Date.now(), katlar: depo.katlariTara() }
    try {
      motor.misafirleriGuncelle(sohbet.misafirleriTara(p.sohbetKlasoru, katOnbellek.katlar, depo.ceviri()))
      motor.aktifSohbetleriGuncelle(sohbet.aktifSohbetleriTara(p.sohbetKlasoru, katOnbellek.katlar, depo.ceviri()))
    } catch {
      /* okunamayan kayıt — bir sonraki turda tekrar */
    }
  }, 3000)
}

app.whenReady().then(() => {
  depo.depoBaslat(join(app.getPath('userData'), 'data'), app.getAppPath(), app.getLocale())
  motor.motorBaslat((d) => pencere?.webContents.send('canli', d), apiAnahtariOku, sohbetBaglami)
  kanallar()
  pencereAc()
  misafirTaramasi()
  guncelleme.guncellemeBaslat((d) => pencere?.webContents.send('guncelleme', d))
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) pencereAc()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
