import { contextBridge, ipcRenderer } from 'electron'
import type { CanliDurum, ErisimDurumu, GuncellemeDurumu, Indirme, SirketApi } from '@ortak/tipler'

const KANALLAR = [
  'profil', 'profilKaydet', 'katlar', 'katOnizle', 'katDetayi', 'ajanKaydet', 'ajanSil', 'hafizaKaydet',
  'hafizaCikar', 'komutVer', 'komutIptal', 'tumRaporlar', 'canli', 'klasorAc', 'klasorSec', 'claudeDurumu',
  'claudeGiris', 'apiAnahtariKaydet', 'apiAnahtariSil', 'sohbetOzeti', 'sohbetler', 'sohbetMesajlari', 'disBaglanti',
  'katSirala', 'durumTuru', 'sohbetDevam', 'sohbetDurdur', 'guncellemeDurumu', 'guncellemeDenetle', 'guncellemeKur', 'planLimitleriYenile',
  'saglayiciDurumlari', 'saglayiciGiris', 'saglayiciAnahtari', 'donanim', 'ollamaKur', 'ollamaBaslat', 'modelIndir', 'modelSil',
  'indirmeIptal', 'yerelDene', 'erisimDurumu', 'erisimDenetle', 'lisansEtkinlestir'
] as const satisfies readonly Exclude<keyof SirketApi, 'canliDinle' | 'guncellemeDinle' | 'indirmeDinle' | 'erisimDinle'>[]

const api = Object.fromEntries(
  KANALLAR.map((kanal) => [kanal, (...args: unknown[]) => ipcRenderer.invoke(kanal, ...args)])
) as unknown as SirketApi

api.canliDinle = (cb) => {
  const dinleyici = (_e: unknown, d: CanliDurum): void => cb(d)
  ipcRenderer.on('canli', dinleyici)
  return () => ipcRenderer.removeListener('canli', dinleyici)
}

api.guncellemeDinle = (cb) => {
  const dinleyici = (_e: unknown, d: GuncellemeDurumu): void => cb(d)
  ipcRenderer.on('guncelleme', dinleyici)
  return () => ipcRenderer.removeListener('guncelleme', dinleyici)
}

api.indirmeDinle = (cb) => {
  const dinleyici = (_e: unknown, d: Record<string, Indirme>): void => cb(d)
  ipcRenderer.on('indirme', dinleyici)
  return () => ipcRenderer.removeListener('indirme', dinleyici)
}

api.erisimDinle = (cb) => {
  const dinleyici = (_e: unknown, d: ErisimDurumu): void => cb(d)
  ipcRenderer.on('erisim', dinleyici)
  return () => ipcRenderer.removeListener('erisim', dinleyici)
}

contextBridge.exposeInMainWorld('sirket', api)
