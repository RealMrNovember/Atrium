// Zamanlanmış işler: "her sabah 09:00 durum turu", "her cuma hafızayı güncelle", zamanlanmış komut.
// Uygulama açıkken çalışır; vakti geldiğinde kat meşgulse ya da uygulama kapalıysa 30 dakika içinde telafi edilir.
import type { Zamanlama } from '@ortak/tipler'
import * as depo from './depo'
import { hataKaydet } from './hatalar'
import * as motor from './motor'

const TELAFI_DK = 30

const gunAnahtari = (t: Date): string => `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`

/** Bu zamanlamanın bugünkü vakti geldi mi (ve bugün daha çalışmadı mı)? */
function vakti(z: Zamanlama, simdi: Date): boolean {
  if (!z.acik || !z.gunler.includes(simdi.getDay())) return false
  const [s, d] = z.saat.split(':').map(Number)
  const hedef = new Date(simdi)
  hedef.setHours(s || 0, d || 0, 0, 0)
  const fark = (simdi.getTime() - hedef.getTime()) / 60_000
  if (fark < 0 || fark > TELAFI_DK) return false
  return !z.sonCalisma || gunAnahtari(new Date(z.sonCalisma)) !== gunAnahtari(simdi)
}

async function calistir(z: Zamanlama): Promise<void> {
  if (z.tur === 'tur') await motor.durumTuru(z.katId)
  else if (z.tur === 'hafiza') await motor.hafizaCikar(z.katId)
  else await motor.komutVer(z.katId, z.metin ?? '', false)
}

async function tur(): Promise<void> {
  const profil = depo.profilOku()
  if (!profil.kurulumTamam) return
  const simdi = new Date()
  const katlar = new Set(depo.katlariTara().map((k) => k.id))
  for (const z of depo.zamanlamalar()) {
    if (!katlar.has(z.katId) || !vakti(z, simdi)) continue
    // kat meşgulse işaretleme yok: bir sonraki turda (telafi süresi içinde) yeniden denenir
    if (motor.canliDurum().aktifKomutlar.some((k) => k.katId === z.katId)) continue
    try {
      await calistir(z)
      depo.zamanlamaKaydet({ ...z, sonCalisma: simdi.toISOString() })
    } catch (e) {
      hataKaydet('schedule', e instanceof Error ? e.message : String(e))
      depo.zamanlamaKaydet({ ...z, sonCalisma: simdi.toISOString(), sonHata: String((e as Error)?.message ?? e).slice(0, 200) })
    }
  }
}

export function zamanlayiciBaslat(): void {
  setTimeout(() => void tur(), 15_000)
  setInterval(() => void tur(), 30_000)
}
