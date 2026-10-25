import { app, BrowserWindow, dialog, ipcMain, safeStorage, shell } from 'electron'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Ajan, ClaudeDurumu, SaglayiciAyari, SaglayiciDurumu, SaglayiciId, SirketProfili } from '@ortak/tipler'
import { claudeDurumuOku, claudeGirisBaslat, terminaldeCalistir } from './claude'
import { donanimOku } from './donanim'
import { cliBul, saglayiciDurumu, uyumluModeller } from './saglayicilar'
import * as yerel from './yerel'
import { baglanIlerlemeAyarla, tekTiklaBagla } from './baglan'
import { cliKokuAyarla } from './yollar'
import * as erisim from './erisim'
import * as hesap from './hesap'
import { hataKaydet, hataYollariniAyarla } from './hatalar'
import * as depo from './depo'
import * as guncelleme from './guncelleme'
import * as motor from './motor'
import * as oturumlar from './oturumlar'
import * as sohbet from './sohbetler'

let pencere: BrowserWindow | null = null
const ikon = join(__dirname, '../../build/icon.png')

// --- API anahtarı: işletim sisteminin güvenli deposuyla şifrelenir, arayüze hiç gelmez ---

const SAGLAYICI_IDLERI: SaglayiciId[] = ['claude', 'codex', 'gemini', 'ollama', 'openai']
const anahtarDosyasi = (id: SaglayiciId = 'claude'): string => join(depo.veriKlasoru(), id === 'claude' ? 'anahtar.bin' : `anahtar-${id}.bin`)

function apiAnahtariOku(id: SaglayiciId = 'claude'): string | undefined {
  try {
    if (!existsSync(anahtarDosyasi(id)) || !safeStorage.isEncryptionAvailable()) return undefined
    return safeStorage.decryptString(readFileSync(anahtarDosyasi(id)))
  } catch {
    return undefined
  }
}

async function claudeDurumu(): Promise<ClaudeDurumu> {
  return claudeDurumuOku(depo.profilOku().ayarlar.claudeYolu, !!apiAnahtariOku())
}

/** Şirkette en az bir ajanın kullandığı araçlar + varsayılan araç. */
function kullanilanSaglayicilar(): SaglayiciId[] {
  const kume = new Set<SaglayiciId>([depo.profilOku().ayarlar.varsayilanSaglayici ?? 'claude'])
  for (const k of depo.katlariTara()) for (const a of depo.ajanlariOku(k.id)) kume.add(a.saglayici ?? 'claude')
  return [...kume]
}

async function saglayiciDurumlari(): Promise<SaglayiciDurumu[]> {
  const { ayarlar } = depo.profilOku()
  const ayar = (id: SaglayiciId): SaglayiciAyari => ayarlar.saglayicilar?.[id] ?? {}
  return Promise.all(SAGLAYICI_IDLERI.map(async (id): Promise<SaglayiciDurumu> => {
    if (id === 'claude') {
      const c = await claudeDurumu()
      return { id, kurulu: c.kurulu, surum: c.surum, hazir: c.girisli, yontem: c.yontem, anahtar: c.apiAnahtari }
    }
    const d = await saglayiciDurumu(id, ayar(id), !!apiAnahtariOku(id))
    if (id === 'openai' && d.kurulu) {
      const modeller = await uyumluModeller(ayar(id), apiAnahtariOku(id))
      return { ...d, hazir: modeller !== null, modeller: modeller ?? undefined }
    }
    return d
  }))
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
  ipcMain.handle('komutVer', (_e, katId: string, metin: string, yazmaIzni: boolean, ekler?: { ad: string; veri: Uint8Array }[]) =>
    motor.komutVer(katId, metin, yazmaIzni, Array.isArray(ekler) ? ekler.filter((e) => e?.veri instanceof Uint8Array) : []))
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
  ipcMain.handle('planLimitleriYenile', () => motor.planLimitleriYenile())
  ipcMain.handle('saglayiciDurumlari', () => saglayiciDurumlari())
  ipcMain.handle('saglayiciGiris', (_e, id: SaglayiciId) => {
    const ayar = depo.profilOku().ayarlar.saglayicilar?.[id]
    if (id === 'claude') claudeGirisBaslat(depo.profilOku().ayarlar.claudeYolu)
    else if (id === 'codex') terminaldeCalistir(cliBul('codex', ayar?.yol).komut, ['login'], 'Codex login')
    else if (id === 'gemini') terminaldeCalistir(cliBul('gemini', ayar?.yol).komut, [], 'Gemini login')
    else if (id === 'ollama') return yerel.ollamaBaslat(ayar)
  })
  ipcMain.handle('tekTiklaBagla', (_e, id: SaglayiciId) => {
    const p = depo.profilOku().ayarlar
    void tekTiklaBagla(id, { yol: id === 'claude' ? p.claudeYolu : p.saglayicilar?.[id]?.yol })
  })
  ipcMain.handle('saglayiciAnahtari', (_e, id: SaglayiciId, anahtar: string | null) => {
    if (!SAGLAYICI_IDLERI.includes(id)) return saglayiciDurumlari()
    const temiz = String(anahtar ?? '').trim()
    if (!temiz) rmSync(anahtarDosyasi(id), { force: true })
    else if (safeStorage.isEncryptionAvailable()) writeFileSync(anahtarDosyasi(id), safeStorage.encryptString(temiz))
    return saglayiciDurumlari()
  })
  const ollamaAyari = (): SaglayiciAyari | undefined => depo.profilOku().ayarlar.saglayicilar?.ollama
  ipcMain.handle('sirketler', () => depo.sirketler())
  ipcMain.handle('projeOlustur', (_e, kok: string, ad: string) => depo.projeOlustur(String(kok ?? ''), String(ad ?? '')))
  ipcMain.handle('yeniSohbet', (_e, katId: string, mesaj: string, yazma: boolean) => { void motor.yeniSohbet(String(katId), String(mesaj ?? '').slice(0, 20000), !!yazma) })
  // çalışan komut varken şirket değiştirilmez (ajanlar başka şirketin klasöründe çalışıyor olur)
  const mesgulMu = (): void => { if (motor.canliDurum().aktifKomutlar.length) throw new Error(depo.ceviri()('companyBusy')) }
  ipcMain.handle('sirketEkle', () => { mesgulMu(); depo.sirketEkle(); motor.sirketDegisti() })
  ipcMain.handle('sirketSec', (_e, id: string) => { mesgulMu(); depo.sirketSec(String(id)); motor.sirketDegisti() })
  ipcMain.handle('sirketSil', (_e, id: string) => depo.sirketSil(String(id)))
  ipcMain.handle('ekibiGecir', (_e, saglayici: SaglayiciId, model: string) => depo.ekibiGecir(saglayici, String(model ?? '')))
  ipcMain.handle('hesapDurumu', () => hesap.hesapDurumu())
  ipcMain.handle('hesapDenetle', () => hesap.hesapDenetle())
  ipcMain.handle('hesapKayit', (_e, eposta: string, ad: string, sifre: string) => hesap.kayit(String(eposta ?? ''), String(ad ?? ''), String(sifre ?? '')))
  ipcMain.handle('hesapGiris', (_e, eposta: string, sifre: string) => hesap.giris(String(eposta ?? ''), String(sifre ?? '')))
  ipcMain.handle('hesapGoogle', () => hesap.googleGiris())
  ipcMain.handle('hesapCikis', () => hesap.cikis())
  ipcMain.handle('hesapSil', (_e, onay: string) => hesap.hesabiSil(String(onay ?? '')))
  ipcMain.handle('destekListe', () => hesap.destekListe())
  ipcMain.handle('destekGonder', (_e, tur, konu: string, metin: string, tanilama: boolean) => hesap.destekGonder(tur, String(konu ?? ''), String(metin ?? ''), !!tanilama))
  ipcMain.handle('destekYanit', (_e, id: number, metin: string) => hesap.destekYanit(Number(id), String(metin ?? '')))
  ipcMain.handle('destekOkundu', (_e, id: number) => hesap.destekOkundu(Number(id)))
  ipcMain.handle('tanilama', () => hesap.tanilama())
  ipcMain.handle('erisimDurumu', () => erisim.erisimDurumu())
  ipcMain.handle('erisimDenetle', () => erisim.erisimDenetle())
  ipcMain.handle('lisansEtkinlestir', (_e, anahtar: string) => erisim.lisansEtkinlestir(String(anahtar ?? '')))
  ipcMain.handle('donanim', () => donanimOku())
  ipcMain.handle('ollamaKur', () => { void yerel.ollamaKur(ollamaAyari()) })
  ipcMain.handle('ollamaBaslat', () => yerel.ollamaBaslat(ollamaAyari()))
  ipcMain.handle('modelIndir', (_e, model: string) => { void yerel.modelIndir(String(model), ollamaAyari()) })
  ipcMain.handle('modelSil', (_e, model: string) => yerel.modelSil(String(model), ollamaAyari()))
  ipcMain.handle('indirmeIptal', (_e, hedef: string) => yerel.indirmeIptal(String(hedef)))
  ipcMain.handle('yerelDene', (_e, model: string, mesajlar: { rol: 'sen' | 'model'; metin: string }[]) =>
    yerel.yerelDene(String(model), Array.isArray(mesajlar) ? mesajlar : [], ollamaAyari()))
}

/** Claude Code sohbetlerinde açılan alt ajanları 3 saniyede bir tarar. */
function misafirTaramasi(): void {
  let katOnbellek = { zaman: 0, katlar: depo.katlariTara(), sirket: depo.sirketKlasoru() }
  setInterval(() => {
    const p = depo.profilOku()
    if (!p.kurulumTamam) return
    if (Date.now() - katOnbellek.zaman > 60_000 || katOnbellek.sirket !== depo.sirketKlasoru()) katOnbellek = { zaman: Date.now(), katlar: depo.katlariTara(), sirket: depo.sirketKlasoru() }
    void oturumlar.acikOturumlar().then((acik) => {
      try {
        motor.misafirleriGuncelle(sohbet.misafirleriTara(p.sohbetKlasoru, katOnbellek.katlar, depo.ceviri()))
        motor.aktifSohbetleriGuncelle(sohbet.aktifSohbetleriTara(p.sohbetKlasoru, katOnbellek.katlar, depo.ceviri(), acik))
      } catch {
        /* okunamayan kayıt — bir sonraki turda tekrar */
      }
    })
  }, 3000)
}

app.whenReady().then(() => {
  depo.depoBaslat(join(app.getPath('userData'), 'data'), app.getAppPath(), app.getLocale())
  erisim.erisimBaslat(depo.veriKlasoru(), () => depo.profilOku().dil, (d) => pencere?.webContents.send('erisim', d))
  motor.motorBaslat((d) => pencere?.webContents.send('canli', d), apiAnahtariOku, sohbetBaglami)
  yerel.yerelBaslat(depo.veriKlasoru(), (d) => pencere?.webContents.send('indirme', d))
  cliKokuAyarla(join(depo.veriKlasoru(), 'cli'))
  baglanIlerlemeAyarla(yerel.ilerlemeBildir)
  // hata raporlarında kişisel yollar görünmesin
  hataYollariniAyarla(() => { const p = depo.profilOku(); return [p.projeKlasoru, ...p.ekProjeler, p.sohbetKlasoru] })
  process.on('uncaughtException', (e) => hataKaydet('atrium', e?.stack?.split(/\r?\n/).slice(0, 3).join(' ') ?? String(e)))
  motor.aktifSaglayicilarAyarla(kullanilanSaglayicilar)
  hesap.hesapBaslat(depo.veriKlasoru(), () => depo.profilOku().dil, kullanilanSaglayicilar, (d) => pencere?.webContents.send('hesap', d))
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
