// Ana süreç ile arayüz arasında paylaşılan veri modeli.
import type { Dil } from './i18n'

export type { Dil }

export interface SirketProfili {
  ad: string
  slogan: string
  kurucu: string
  kurulus: string
  /** Şirket logosu (data URL) — boşsa baş harf gösterilir. */
  logo: string
  dil: Dil
  /** Projelerin bulunduğu kök klasör; her alt klasör bir kat olur. */
  projeKlasoru: string
  /** Claude Code sohbet kayıtlarının klasörü (~/.claude/projects). */
  sohbetKlasoru: string
  kurulumTamam: boolean
  ayarlar: SirketAyarlari
}

export interface SirketAyarlari {
  /** Tek ajan koşusunun para tavanı (USD). */
  kosuButcesiUsd: number
  /** Bütün şirketin günlük tavanı (USD). */
  gunlukTavanUsd: number
  /** Tek ajan koşusunun süre tavanı (dakika). */
  kosuSuresiDk: number
  /** Aynı katta aynı anda çalışabilecek ajan sayısı (yalnız okuma modunda). */
  esZamanli: number
  /** Açıkken ajanlar claude çağırmaz; sahte iş ve sahte rapor üretir (para harcamaz). */
  simulasyon: boolean
  /** Boşsa otomatik bulunur. */
  claudeYolu: string
}

export interface ClaudeDurumu {
  kurulu: boolean
  surum?: string
  girisli: boolean
  yontem?: string
  /** Atrium'a kaydedilmiş bir API anahtarı var mı (değeri arayüze hiç gelmez). */
  apiAnahtari: boolean
}

export type AjanDurumu =
  | 'bosta'        // masasında, iş yok
  | 'yuruyor'      // bir yere gidiyor
  | 'emir-aliyor'  // liderin odasında talimat alıyor
  | 'calisiyor'    // masasında çalışıyor
  | 'rapor-veriyor'// liderin odasında rapor veriyor
  | 'hata'

export interface Ajan {
  id: string
  ad: string
  rol: string
  /** Ajanın sistem istemi: kim olduğu, ne yaptığı, nasıl çalıştığı. */
  gorevTanimi: string
  model: string
  renk: string
  lider?: boolean
  /** WebSearch / WebFetch kullanabilir mi. */
  web?: boolean
  /** Lider tarafından bir komut sırasında işe alındıysa zamanı. */
  iseAlindi?: string
  /** Kattaki oda numarası (0-7). */
  oda: number
}

export interface Kat {
  id: string
  ad: string
  yol: string
  no: number
  etiketler: string[]
  hafizaVar: boolean
  hafizaGuncelleme?: string
}

export type GorevDurumu = 'bekliyor' | 'calisiyor' | 'tamam' | 'hata' | 'iptal'

export interface Gorev {
  id: string
  ajanId: string
  baslik: string
  talimat: string
  durum: GorevDurumu
  sonuc?: string
  maliyetUsd?: number
  baslangic?: string
  bitis?: string
}

export type KomutDurumu = 'planlaniyor' | 'yurutuluyor' | 'raporlaniyor' | 'tamam' | 'hata' | 'iptal'

export interface Komut {
  id: string
  katId: string
  metin: string
  yazmaIzni: boolean
  durum: KomutDurumu
  zaman: string
  plan?: string
  gorevler: Gorev[]
  rapor?: string
  maliyetUsd: number
  hata?: string
}

export interface AjanCanli {
  durum: AjanDurumu
  /** Karakterin gittiği / durduğu yer. */
  hedef: 'masa' | 'lider'
  /** Şu an ne yapıyor — tek satır ("📄 App.tsx okunuyor"). */
  etkinlik?: string
  gorevId?: string
  komutId?: string
  /** Son 40 etkinlik satırı. */
  gunluk: string[]
}

/** Bir Claude Code sohbetinde açılmış, şu an çalışan alt ajan. */
export interface MisafirAjan {
  id: string
  tur: string
  aciklama: string
  etkinlik?: string
  sohbetBasligi: string
  sonEtkinlik: string
}

/** Arayüze gönderilen canlı durum fotoğrafı. */
export interface CanliDurum {
  ajanlar: Record<string, AjanCanli> // anahtar: `${katId}/${ajanId}`
  aktifKomutlar: Komut[]
  bugunHarcanan: number
  hafizaCalisan: string[] // hafızası çıkarılan katlar
  misafirler: Record<string, MisafirAjan[]> // anahtar: katId
}

export interface KatDetayi {
  kat: Kat
  ajanlar: Ajan[]
  hafiza: string
  komutlar: Komut[]
}

export interface Sohbet {
  id: string
  /** Sohbet klasörü altındaki proje klasörünün adı. */
  klasor: string
  katId: string | null
  baslik: string
  ilk: string
  son: string
  mesajSayisi: number
  altAjanSayisi: number
}

export interface SohbetMesaji {
  rol: 'sen' | 'claude'
  metin: string
  zaman: string
}

export interface SohbetOzeti {
  toplam: number
  eslesen: number
}

export const ajanAnahtari = (katId: string, ajanId: string): string => `${katId}/${ajanId}`

export interface SirketApi {
  profil(): Promise<SirketProfili>
  profilKaydet(p: SirketProfili): Promise<SirketProfili>
  katlar(): Promise<Kat[]>
  katOnizle(klasor: string): Promise<string[]>
  katDetayi(katId: string): Promise<KatDetayi>
  ajanKaydet(katId: string, ajan: Ajan): Promise<Ajan[]>
  ajanSil(katId: string, ajanId: string): Promise<Ajan[]>
  hafizaKaydet(katId: string, metin: string): Promise<void>
  hafizaCikar(katId: string): Promise<void>
  komutVer(katId: string, metin: string, yazmaIzni: boolean): Promise<Komut>
  komutIptal(komutId: string): Promise<void>
  tumRaporlar(): Promise<Komut[]>
  canli(): Promise<CanliDurum>
  klasorAc(yol: string): Promise<void>
  klasorSec(baslangic?: string): Promise<string | null>
  claudeDurumu(): Promise<ClaudeDurumu>
  claudeGiris(): Promise<void>
  apiAnahtariKaydet(anahtar: string): Promise<ClaudeDurumu>
  apiAnahtariSil(): Promise<ClaudeDurumu>
  sohbetOzeti(projeKlasoru: string, sohbetKlasoru: string): Promise<SohbetOzeti>
  /** katId verilirse o kat, null ise hiçbir kata eşlenmeyenler, hiç verilmezse hepsi. */
  sohbetler(katId?: string | null): Promise<Sohbet[]>
  sohbetMesajlari(klasor: string, id: string): Promise<SohbetMesaji[]>
  disBaglanti(url: string): Promise<void>
  canliDinle(cb: (d: CanliDurum) => void): () => void
}
