// İsteğe bağlı ücretsiz Atrium hesabı ve destek (dilek, istek, şikayet, hata raporu).
// Sunucuya yalnızca kullanıcının bilerek gönderdiği şeyler gider: e-posta, ad, mesajlar ve — onay verirse —
// önizlemesini gördüğü tanılama bilgisi. Proje, kod, sohbet, hafıza ya da API anahtarı hiçbir zaman gönderilmez.
import { app, safeStorage, shell } from 'electron'
import { createHash, randomBytes } from 'node:crypto'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { arch, platform, release } from 'node:os'
import { join } from 'node:path'
import type { DestekBildirimi, DestekTuru, Dil, HesapDurumu, SaglayiciId } from '@ortak/tipler'
import { ayikla, sonHatalar } from './hatalar'

const API = (process.env.ATRIUM_API_URL || 'https://atrium.cicibyte.com/api').replace(/\/+$/, '')
const DENETIM_MS = 10 * 60 * 1000

let klasor = ''
let yayinci: (d: HesapDurumu) => void = () => {}
let dilOku: () => Dil = () => 'en'
let saglayicilarOku: () => SaglayiciId[] = () => []
let durum: HesapDurumu = { girisli: false, okunmamis: 0, googleEtkin: false }

const oturumDosyasi = (): string => join(klasor, 'hesap.bin')
const profilDosyasi = (): string => join(klasor, 'hesap.json')
const isletim = (): string => `${platform()} ${release()} ${arch()}`

function belirtecOku(): string | undefined {
  try {
    if (!existsSync(oturumDosyasi()) || !safeStorage.isEncryptionAvailable()) return undefined
    return safeStorage.decryptString(readFileSync(oturumDosyasi()))
  } catch {
    return undefined
  }
}

function oturumuKaydet(token: string, kullanici: HesapDurumu['kullanici']): void {
  if (!safeStorage.isEncryptionAvailable()) throw new Error('sifreleme-yok')
  writeFileSync(oturumDosyasi(), safeStorage.encryptString(token))
  writeFileSync(profilDosyasi(), JSON.stringify(kullanici, null, 2))
}

function oturumuSil(): void {
  rmSync(oturumDosyasi(), { force: true })
  rmSync(profilDosyasi(), { force: true })
}

function ayarla(yama: Partial<HesapDurumu>): HesapDurumu {
  durum = { ...durum, ...yama }
  yayinci(durum)
  return durum
}

/** Sunucuya istek; sunucu hata kodu dönerse Error(kod) fırlatır (arayüz çevirir). */
async function istek<T>(yol: string, secenek: { yontem?: string; govde?: unknown; kimlikli?: boolean } = {}): Promise<T> {
  const token = secenek.kimlikli === false ? undefined : belirtecOku()
  let yanit: Response
  try {
    yanit = await fetch(`${API}${yol}`, {
      method: secenek.yontem ?? (secenek.govde ? 'POST' : 'GET'),
      signal: AbortSignal.timeout(15_000),
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: secenek.govde ? JSON.stringify(secenek.govde) : undefined
    })
  } catch {
    throw new Error('baglanti')
  }
  const veri = (await yanit.json().catch(() => ({}))) as T & { hata?: string }
  if (!yanit.ok) {
    if (yanit.status === 401 && veri.hata === 'oturum-yok') { oturumuSil(); ayarla({ girisli: false, kullanici: undefined, okunmamis: 0 }) }
    throw new Error(veri.hata || (yanit.status === 429 ? 'cok-hizli' : 'sunucu'))
  }
  return veri
}

interface OturumYaniti { token: string; kullanici: NonNullable<HesapDurumu['kullanici']> }

function oturumAcildi(y: OturumYaniti): HesapDurumu {
  oturumuKaydet(y.token, y.kullanici)
  void hesapDenetle()
  return ayarla({ girisli: true, kullanici: y.kullanici })
}

const istemci = (): Record<string, string> => ({ surum: app.getVersion(), isletim: isletim(), dil: dilOku() })

export async function hesapDenetle(): Promise<HesapDurumu> {
  const google = await istek<{ etkin: boolean }>('/hesap/google-ayar', { kimlikli: false }).catch(() => ({ etkin: false }))
  ayarla({ googleEtkin: google.etkin })
  if (!belirtecOku()) return ayarla({ girisli: false, kullanici: undefined, okunmamis: 0 })
  try {
    const y = await istek<{ kullanici: HesapDurumu['kullanici']; okunmamis: number }>(`/hesap/ben?surum=${encodeURIComponent(app.getVersion())}&isletim=${encodeURIComponent(isletim())}`)
    return ayarla({ girisli: true, kullanici: y.kullanici, okunmamis: y.okunmamis })
  } catch {
    // çevrimdışı: son bilinen profil
    let kullanici: HesapDurumu['kullanici']
    try { kullanici = JSON.parse(readFileSync(profilDosyasi(), 'utf-8')) } catch { /* yok */ }
    return ayarla(belirtecOku() ? { girisli: true, kullanici } : { girisli: false, kullanici: undefined })
  }
}

export const hesapDurumu = (): HesapDurumu => durum

export async function kayit(eposta: string, ad: string, sifre: string): Promise<HesapDurumu> {
  return oturumAcildi(await istek<OturumYaniti>('/hesap/kayit', { kimlikli: false, govde: { eposta, ad, sifre, ...istemci() } }))
}

export async function giris(eposta: string, sifre: string): Promise<HesapDurumu> {
  return oturumAcildi(await istek<OturumYaniti>('/hesap/giris', { kimlikli: false, govde: { eposta, sifre, ...istemci() } }))
}

export async function cikis(): Promise<HesapDurumu> {
  await istek('/hesap/cikis', { govde: {} }).catch(() => undefined)
  oturumuSil()
  return ayarla({ girisli: false, kullanici: undefined, okunmamis: 0 })
}

/** Hesabı ve tüm mesajlarını sunucudan kalıcı olarak siler. onay: şifre (Google hesabında e-posta). */
export async function hesabiSil(onay: string): Promise<HesapDurumu> {
  await istek('/hesap/sil', { govde: durum.kullanici?.google ? { eposta: onay } : { sifre: onay } })
  oturumuSil()
  return ayarla({ girisli: false, kullanici: undefined, okunmamis: 0 })
}

/** Google ile giriş: sistem tarayıcısında Google'ın onay sayfası açılır (PKCE + yerel geri dönüş adresi).
 *  Yalnız "openid email profile" istenir; Google parolası Atrium'a hiç gelmez. */
export async function googleGiris(): Promise<HesapDurumu> {
  const ayar = await istek<{ etkin: boolean; client_id?: string; client_secret?: string }>('/hesap/google-ayar', { kimlikli: false })
  if (!ayar.etkin || !ayar.client_id) throw new Error('google-kapali')
  const dogrulayici = randomBytes(32).toString('base64url')
  const meydan = createHash('sha256').update(dogrulayici).digest('base64url')
  const durumAnahtari = randomBytes(16).toString('hex')

  const kod = await new Promise<{ kod: string; adres: string }>((coz, ret) => {
    const sunucu = createServer((istekNesnesi, yanit) => {
      const url = new URL(istekNesnesi.url ?? '/', 'http://127.0.0.1')
      if (url.pathname !== '/') { yanit.writeHead(404); yanit.end(); return }
      const tamam = url.searchParams.get('state') === durumAnahtari && !!url.searchParams.get('code')
      yanit.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      yanit.end(`<!doctype html><meta charset="utf-8"><title>Atrium</title><body style="font-family:system-ui;background:#0e1220;color:#e7eaf3;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><div style="font-size:48px">${tamam ? '✅' : '⚠️'}</div><h2>${tamam ? 'Atrium' : 'Atrium — error'}</h2><p style="color:#8e97b3">${tamam ? 'You can close this tab and return to Atrium.' : 'Sign-in was cancelled. You can close this tab.'}</p></div></body>`)
      clearTimeout(zamanlayici)
      sunucu.close()
      if (tamam) coz({ kod: url.searchParams.get('code')!, adres: `http://127.0.0.1:${(sunucu.address() as AddressInfo | null)?.port ?? port}` })
      else ret(new Error('google-iptal'))
    })
    let port = 0
    const zamanlayici = setTimeout(() => { sunucu.close(); ret(new Error('google-iptal')) }, 5 * 60_000)
    sunucu.listen(0, '127.0.0.1', () => {
      port = (sunucu.address() as AddressInfo).port
      const adres = `http://127.0.0.1:${port}`
      const parametre = new URLSearchParams({
        client_id: ayar.client_id!, redirect_uri: adres, response_type: 'code', scope: 'openid email profile',
        code_challenge: meydan, code_challenge_method: 'S256', state: durumAnahtari, prompt: 'select_account'
      })
      void shell.openExternal(`https://accounts.google.com/o/oauth2/v2/auth?${parametre}`)
    })
  })

  const belirtec = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', signal: AbortSignal.timeout(15_000), headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: ayar.client_id, client_secret: ayar.client_secret ?? '', code: kod.kod, code_verifier: dogrulayici,
      grant_type: 'authorization_code', redirect_uri: kod.adres
    })
  }).then((y) => y.json() as Promise<{ id_token?: string }>).catch(() => ({}) as { id_token?: string })
  if (!belirtec.id_token) throw new Error('google-gecersiz')
  return oturumAcildi(await istek<OturumYaniti>('/hesap/google', { kimlikli: false, govde: { id_token: belirtec.id_token, ...istemci() } }))
}

/** Hata raporuna eklenecek tanılama bilgisinin tamamı — kullanıcı göndermeden önce birebir görür. */
export function tanilama(): Record<string, unknown> {
  return {
    atrium: app.getVersion(),
    isletim: isletim(),
    dil: dilOku(),
    saglayicilar: saglayicilarOku(),
    sonHatalar: sonHatalar(10).map((h) => `${h.zaman.slice(0, 16).replace('T', ' ')} · ${h.kaynak} · ${h.mesaj}`)
  }
}

export async function destekListe(): Promise<DestekBildirimi[]> {
  const y = await istek<{ bildirimler: DestekBildirimi[] }>('/destek')
  ayarla({ okunmamis: y.bildirimler.reduce((t, b) => t + (b.okunmamis ? 1 : 0), 0) })
  return y.bildirimler
}

export async function destekGonder(tur: DestekTuru, konu: string, metin: string, tanilamaEkle: boolean): Promise<number> {
  const y = await istek<{ id: number }>('/destek', {
    govde: { tur, konu: ayikla(konu).slice(0, 150), metin: String(metin).slice(0, 5000), ...(tanilamaEkle ? { ek: tanilama() } : {}) }
  })
  return y.id
}

export async function destekYanit(id: number, metin: string): Promise<void> {
  await istek(`/destek/${Number(id)}/yanit`, { govde: { metin: String(metin).slice(0, 5000) } })
}

export async function destekOkundu(id: number): Promise<void> {
  await istek(`/destek/${Number(id)}/okundu`, { govde: {} })
  ayarla({ okunmamis: Math.max(0, durum.okunmamis - 1) })
}

export function hesapBaslat(veriKlasoru: string, dil: () => Dil, saglayicilar: () => SaglayiciId[], yayinla: (d: HesapDurumu) => void): void {
  klasor = veriKlasoru
  dilOku = dil
  saglayicilarOku = saglayicilar
  yayinci = yayinla
  try { if (belirtecOku()) durum = { ...durum, girisli: true, kullanici: JSON.parse(readFileSync(profilDosyasi(), 'utf-8')) } } catch { /* yok */ }
  setTimeout(() => void hesapDenetle(), 4000)
  setInterval(() => void hesapDenetle(), DENETIM_MS)
}
