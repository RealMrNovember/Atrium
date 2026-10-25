import { contextBridge, ipcRenderer } from 'electron'
import type { CanliDurum, SirketApi } from '@ortak/tipler'

const KANALLAR = [
  'profil', 'profilKaydet', 'katlar', 'katOnizle', 'katDetayi', 'ajanKaydet', 'ajanSil', 'hafizaKaydet',
  'hafizaCikar', 'komutVer', 'komutIptal', 'tumRaporlar', 'canli', 'klasorAc', 'klasorSec', 'claudeDurumu',
  'claudeGiris', 'apiAnahtariKaydet', 'apiAnahtariSil', 'sohbetOzeti', 'sohbetler', 'sohbetMesajlari', 'disBaglanti'
] as const satisfies readonly Exclude<keyof SirketApi, 'canliDinle'>[]

const api = Object.fromEntries(
  KANALLAR.map((kanal) => [kanal, (...args: unknown[]) => ipcRenderer.invoke(kanal, ...args)])
) as unknown as SirketApi

api.canliDinle = (cb) => {
  const dinleyici = (_e: unknown, d: CanliDurum): void => cb(d)
  ipcRenderer.on('canli', dinleyici)
  return () => ipcRenderer.removeListener('canli', dinleyici)
}

contextBridge.exposeInMainWorld('sirket', api)
