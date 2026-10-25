import { contextBridge, ipcRenderer } from 'electron'
import type { CanliDurum, ErisimDurumu, GuncellemeDurumu, HesapDurumu, Indirme, SirketApi } from '@ortak/tipler'

const KANALLAR = [
  'profil', 'profilKaydet', 'katlar', 'katOnizle', 'katDetayi', 'ajanKaydet', 'ajanSil', 'hafizaKaydet',
  'hafizaCikar', 'komutVer', 'ekipSablonu', 'raporKaydet', 'karsilastir', 'zamanlamalar', 'zamanlamaKaydet', 'zamanlamaSil', 'degisiklikFarki', 'degisiklikUygula', 'degisiklikVazgec', 'degisiklikGeriAl', 'komutIptal', 'tumRaporlar', 'canli', 'klasorAc', 'klasorSec', 'claudeDurumu',
  'claudeGiris', 'apiAnahtariKaydet', 'apiAnahtariSil', 'sohbetOzeti', 'sohbetler', 'sohbetMesajlari', 'disBaglanti',
  'katSirala', 'durumTuru', 'sohbetDevam', 'sohbetDurdur', 'guncellemeDurumu', 'guncellemeDenetle', 'guncellemeKur', 'planLimitleriYenile',
  'saglayiciDurumlari', 'saglayiciGiris', 'tekTiklaBagla', 'saglayiciAnahtari', 'donanim', 'ollamaKur', 'ollamaBaslat', 'modelIndir', 'modelSil',
  'indirmeIptal', 'yerelDene', 'erisimDurumu', 'erisimDenetle', 'lisansEtkinlestir',
  'sirketler', 'projeOlustur', 'yeniSohbet', 'sirketEkle', 'sirketSec', 'sirketSil', 'ekibiGecir',
  'hesapDurumu', 'hesapDenetle', 'hesapKayit', 'hesapGiris', 'hesapGoogle', 'hesapCikis', 'hesapSil',
  'destekListe', 'destekGonder', 'destekYanit', 'destekOkundu', 'tanilama'
] as const satisfies readonly Exclude<keyof SirketApi, 'canliDinle' | 'guncellemeDinle' | 'indirmeDinle' | 'erisimDinle' | 'hesapDinle'>[]

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

api.hesapDinle = (cb) => {
  const dinleyici = (_e: unknown, d: HesapDurumu): void => cb(d)
  ipcRenderer.on('hesap', dinleyici)
  return () => ipcRenderer.removeListener('hesap', dinleyici)
}

contextBridge.exposeInMainWorld('sirket', api)
