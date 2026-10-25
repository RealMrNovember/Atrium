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
  /** Proje klasöründe olup kat yapılmayacak alt klasör adları. */
  haricTutulan: string[]
  /** Proje klasörünün dışından eklenen projelerin tam yolları. */
  ekProjeler: string[]
  /** Kullanıcının belirlediği kat sırası (proje yolları, alttan üste). Listede olmayanlar sona, ada göre. */
  katSirasi: string[]
  /** Claude Code sohbet kayıtlarının klasörü (~/.claude/projects). */
  sohbetKlasoru: string
  kurulumTamam: boolean
  /** "Neler yeni?" penceresinin en son gösterildiği sürüm. */
  sonGorulenSurum: string
  ayarlar: SirketAyarlari
}

export interface SirketAyarlari {
  /** Tek ajan koşusunun para tavanı (USD). */
  kosuButcesiUsd: number
  /** Bütün şirketin günlük tavanı (USD). */
  gunlukTavanUsd: number
  /** Atrium'dan bir Claude Code sohbetine devam ederken tek mesajın tavanı (USD). Uzun sohbetler
   *  geçmişi yeniden yüklediği için ajan koşusundan pahalıdır. */
  sohbetButcesiUsd: number
  /** Tek ajan koşusunun süre tavanı (dakika). */
  kosuSuresiDk: number
  /** Aynı katta aynı anda çalışabilecek ajan sayısı (yalnız okuma modunda). */
  esZamanli: number
  /** Açıkken ajanlar claude çağırmaz; sahte iş ve sahte rapor üretir (para harcamaz). */
  simulasyon: boolean
  /** Boşsa otomatik bulunur. */
  claudeYolu: string
  /** Ses efektleri açık mı. */
  ses: boolean
  /** Yazma izinli komutlarda değişiklikleri projeye yazmadan önce göster (önerilen). */
  onizleme: boolean
  /** Yeni ajanların ve lider işe alımlarının varsayılan yapay zeka aracı. */
  varsayilanSaglayici: SaglayiciId
  /** Claude dışındaki araçların ayarları (yol, adres). */
  saglayicilar: Partial<Record<SaglayiciId, SaglayiciAyari>>
}

/** Ajanları çalıştırabilen yapay zeka araçları. */
export type SaglayiciId = 'claude' | 'codex' | 'gemini' | 'ollama' | 'openai'

export const SAGLAYICILAR: { id: SaglayiciId; ad: string; ikon: string; yerel?: boolean }[] = [
  { id: 'claude', ad: 'Claude Code', ikon: '✳️' },
  { id: 'codex', ad: 'OpenAI Codex CLI', ikon: '🌀' },
  { id: 'gemini', ad: 'Gemini CLI', ikon: '♊' },
  { id: 'ollama', ad: 'Ollama', ikon: '🦙', yerel: true },
  { id: 'openai', ad: 'OpenAI compatible', ikon: '🔌' }
]

export interface SaglayiciAyari {
  /** CLI'nin tam yolu (boşsa otomatik bulunur). */
  yol?: string
  /** HTTP adresi (Ollama: http://127.0.0.1:11434 · OpenAI uyumlu: …/v1). */
  url?: string
}

export interface SaglayiciDurumu {
  id: SaglayiciId
  kurulu: boolean
  surum?: string
  /** Oturum açık / anahtar var / sunucu çalışıyor. */
  hazir: boolean
  yontem?: string
  /** Kullanılabilir modeller (Ollama'da kurulu olanlar). */
  modeller?: string[]
  /** Atrium'a kaydedilmiş bir anahtar var mı. */
  anahtar?: boolean
  hata?: string
}

/** Bilgisayarın yerel yapay zeka için önemli donanımı. */
export interface Donanim {
  isletim: string
  mimari: string
  islemci: string
  cekirdek: number
  ramGb: number
  bosRamGb: number
  diskBosGb?: number
  gpular: { ad: string; vramGb?: number }[]
  /** Apple Silicon: ekran kartı ana belleği paylaşır. */
  birlesikBellek: boolean
}

export interface DegisenDosya {
  yol: string
  tur: 'eklendi' | 'degisti' | 'silindi'
  eklenen: number
  silinen: number
  ikili?: boolean
}

export interface DegisiklikOzeti {
  /** bekliyor: onay bekliyor · uygulandi · vazgecildi · geri-alindi · dogrudan: önizleme yapılamadı, doğrudan yazıldı */
  durum: 'bekliyor' | 'uygulandi' | 'vazgecildi' | 'geri-alindi' | 'dogrudan'
  dosyalar: DegisenDosya[]
  eklenen: number
  silinen: number
  uygulanan?: string[]
  cakisan?: string[]
  /** dogrudan: neden (ör. proje çok büyük) */
  neden?: string
}

/** Aynı görevin iki araç/modelle karşılaştırması. */
export interface Karsilastirma {
  id: string
  katId: string
  metin: string
  zaman: string
  sonuclar: {
    saglayici: SaglayiciId
    model: string
    calisiyor: boolean
    metin?: string
    hata?: string
    maliyetUsd?: number
    sureMs?: number
    token?: number
  }[]
}

/** Zamanlanmış iş: bir katta belirli gün ve saatte durum turu, hafıza güncellemesi ya da komut. */
export interface Zamanlama {
  id: string
  katId: string
  tur: 'tur' | 'hafiza' | 'komut'
  /** tur 'komut' ise verilecek komut */
  metin?: string
  /** "09:00" (yerel saat) */
  saat: string
  /** 0 = Pazar … 6 = Cumartesi */
  gunler: number[]
  acik: boolean
  sonCalisma?: string
  sonHata?: string
}

/** Komuta eklenen dosya (arayüzden ana sürece). */
export interface KomutEki { ad: string; veri: Uint8Array }

/** Şirket seçicide görünen özet. */
export interface SirketOzeti { id: string; ad: string; logo: string; saglayici: SaglayiciId; kurulumTamam: boolean }

/** İsteğe bağlı ücretsiz Atrium hesabı. */
export interface HesapDurumu {
  girisli: boolean
  kullanici?: { id: number; eposta: string; ad: string; olusturma: string; google?: boolean }
  /** Cevabı okunmamış destek mesajı sayısı. */
  okunmamis: number
  /** Sunucuda Google ile giriş açık mı. */
  googleEtkin: boolean
}

export type DestekTuru = 'dilek' | 'istek' | 'sikayet' | 'hata'

export interface DestekBildirimi {
  id: number
  tur: DestekTuru
  konu: string
  durum: 'acik' | 'yanitlandi' | 'kapali'
  olusturma: string
  guncelleme: string
  okunmamis: number
  mesajlar: { yazan: 'kullanici' | 'admin'; metin: string; olusturma: string }[]
}

/** Açılışta sunucudan alınan erişim kararı. */
export interface ErisimDurumu {
  durum: 'acik' | 'kilitli' | 'guncelleme-gerekli'
  /** Sunucudan gelen, kullanıcının dilindeki mesaj. */
  mesaj?: string
  satinAl?: string
  enAzSurum?: string
  lisansVar: boolean
}

/** Uygulama içinden Ollama ya da model indirme ilerlemesi. */
export interface Indirme {
  /** 'ollama' ya da model adı. */
  hedef: string
  durum: 'iniyor' | 'kuruluyor' | 'bitti' | 'hata' | 'iptal'
  yuzde: number
  mesaj?: string
}

export interface ClaudeDurumu {
  kurulu: boolean
  surum?: string
  girisli: boolean
  yontem?: string
  /** Atrium'a kaydedilmiş bir API anahtarı var mı (değeri arayüze hiç gelmez). */
  apiAnahtari: boolean
}

export interface GuncellemeDurumu {
  durum: 'yok' | 'denetleniyor' | 'guncel' | 'mevcut' | 'indiriliyor' | 'hazir' | 'hata'
  mevcutSurum: string
  yeniSurum?: string
  /** Yeni sürümün GitHub sürüm notları (Markdown) — dilli not yoksa yedek. */
  yeniNotlar?: string
  /** Yeni sürümün 6 dildeki notları (showroom/yenilikler.json'dan), dil kodu → not. */
  yeniNotlarDilli?: Record<string, { baslik: string; maddeler: string[] }>
  yuzde?: number
  sonDenetim?: string
  hata?: string
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
  /** Ajanı çalıştıran yapay zeka aracı (yoksa Claude Code). */
  saglayici?: SaglayiciId
  renk: string
  lider?: boolean
  /** WebSearch / WebFetch kullanabilir mi. */
  web?: boolean
  /** İşini bitirince bu ajana devreder (ör. geliştirici → test uzmanı). */
  devret?: string
  /** Lider tarafından bir komut sırasında işe alındıysa zamanı. */
  iseAlindi?: string
  /** Ajanın asıl çalıştığı klasörler (proje köküne göre). Ajan önce bunlarda arar → daha az token. */
  odak?: string[]
  /** Odak klasörlerini kullanıcı elle belirlediyse hafıza çıkarımı üzerine yazmaz. */
  odakElle?: boolean
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
  /** Bu görev başka bir ajanın devriyle açıldıysa devreden ajan. */
  devredenId?: string
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
  /** 'gorev': lider işi böler · 'tur': lider masa masa dolaşıp durum raporu toplar. */
  tur?: 'gorev' | 'tur'
  /** Sahibinin komuta eklediği dosyaların adları. */
  ekler?: string[]
  /** Yazma izinli komutta ajanların önerdiği değişiklikler (önizleme). */
  degisiklik?: DegisiklikOzeti
  zaman: string
  plan?: string
  gorevler: Gorev[]
  rapor?: string
  maliyetUsd: number
  hata?: string
}

export interface AjanCanli {
  durum: AjanDurumu
  /** Karakterin gittiği / durduğu yer: kendi masası, liderin odası ya da (durum turunda) başka bir oda. */
  hedef: 'masa' | 'lider' | 'ziyaret'
  /** hedef 'ziyaret' iken gidilen oda. */
  ziyaretOda?: number
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
  /** Açık ama boşta (Claude uygulamasında duran sohbet): karakter masasında oturur, ekranı sönük. */
  bosta?: boolean
}

/** Claude Code'da şu an aktif bir sohbet (son dakikada yazılmış ya da Atrium'dan sürdürülen). */
export interface AktifSohbet {
  id: string
  klasor: string
  baslik: string
  etkinlik?: string
  /** Atrium içinden sürdürülüyor mu. */
  atriumdan: boolean
  /** 'calisiyor': şu an çalışıyor · 'acik': Claude uygulamasında açık, boşta */
  durum?: 'calisiyor' | 'acik'
  /** Son "sıradaki adım" kutusundaki cevaplanmamış soru — katta bir ajan pencereden seslenir. */
  bekleyenSoru?: string
}

/** Atrium'dan sürdürülen bir sohbetin canlı çıktısı. */
export interface SohbetKosusu {
  id: string
  katId: string | null
  calisiyor: boolean
  /** Bu turda gönderilen mesaj ve gelen yanıtlar (araç satırları dahil). */
  satirlar: { rol: 'sen' | 'claude' | 'arac' | 'hata'; metin: string }[]
  /** Yeni açılan sohbetin Claude oturum kimliği (bitince listede açmak için). */
  oturum?: string
}

/** Claude aboneliğinin kullanım limitleri (Claude Code'un rate_limit_event olayından). */
export interface PlanLimiti {
  /** 0-100 */
  yuzde: number
  /** Sıfırlanma zamanı (epoch saniye). */
  sifirlanma: number
}

export interface PlanLimitleri {
  oturum?: PlanLimiti
  haftalik?: PlanLimiti
  /** allowed · allowed_warning · rejected */
  durum?: string
  guncelleme: string
}

/** Arayüze gönderilen canlı durum fotoğrafı. */
export interface CanliDurum {
  ajanlar: Record<string, AjanCanli> // anahtar: `${katId}/${ajanId}`
  aktifKomutlar: Komut[]
  bugunHarcanan: number
  hafizaCalisan: string[] // hafızası çıkarılan katlar
  misafirler: Record<string, MisafirAjan[]> // anahtar: katId
  aktifSohbetler: Record<string, AktifSohbet[]> // anahtar: katId
  sohbetKosulari: Record<string, SohbetKosusu> // anahtar: sohbet id
  planLimitleri?: PlanLimitleri
  /** Kat başına son karşılaştırma. */
  karsilastirmalar: Record<string, Karsilastirma>
  /** Bugünkü kullanım, araç başına (koşu ve token). */
  kullanim: Partial<Record<SaglayiciId, { kosu: number; token: number }>>
  /** Claude dışındaki araçların bildirdiği kullanım limitleri (ör. Codex). */
  saglayiciLimitleri: Partial<Record<SaglayiciId, PlanLimitleri>>
  /** Etkin şirkette kullanılan araçlar (sağ üstteki göstergeler). */
  aktifSaglayicilar: SaglayiciId[]
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
  /** Sohbetin çalıştığı klasör (kayıttan) — devam ederken burada çalıştırılır. */
  cwd: string
  baslik: string
  ilk: string
  son: string
  mesajSayisi: number
  altAjanSayisi: number
  /** Son "sıradaki adım" kutusu bir soru soruyor ve henüz cevaplanmadıysa o soru. */
  bekleyenSoru?: string
}

/** Claude Desktop'ın "sıradaki adım" kutusu (sohbet kaydındaki wrap_up çağrısı). */
export interface SiradakiAdim {
  ozet: string
  soru?: string
  dugmeler: { etiket: string; mesaj: string }[]
}

export interface SohbetMesaji {
  rol: 'sen' | 'claude' | 'kutu'
  metin: string
  zaman: string
  kutu?: SiradakiAdim
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
  /** Klasördeki aday proje adları (hariç tutulanlar dahil — seçim ekranı için). */
  katOnizle(klasor: string): Promise<string[]>
  katDetayi(katId: string): Promise<KatDetayi>
  ajanKaydet(katId: string, ajan: Ajan): Promise<Ajan[]>
  ajanSil(katId: string, ajanId: string): Promise<Ajan[]>
  hafizaKaydet(katId: string, metin: string): Promise<void>
  hafizaCikar(katId: string): Promise<void>
  komutVer(katId: string, metin: string, yazmaIzni: boolean, ekler?: KomutEki[]): Promise<Komut>
  /** Katın ekibini hazır bir şablonla değiştirir. */
  ekipSablonu(katId: string, sablonId: string): Promise<Ajan[]>
  /** Raporu bağımsız bir HTML dosyası olarak kaydeder (kaydetme penceresi); kaydedilen yol ya da null. */
  raporKaydet(html: string, onerilenAd: string): Promise<string | null>
  /** Aynı görevi iki araç/modelle (salt okuma) çalıştırır; ilerleme canli.karsilastirmalar[katId]. */
  karsilastir(katId: string, metin: string, secenekler: { saglayici: SaglayiciId; model: string }[]): Promise<void>
  /** Zamanlanmış işler (katId verilirse yalnız o kat). */
  zamanlamalar(katId?: string): Promise<Zamanlama[]>
  zamanlamaKaydet(z: Zamanlama): Promise<Zamanlama[]>
  zamanlamaSil(id: string): Promise<Zamanlama[]>
  /** Önizlemedeki bir dosyanın birleşik farkı. */
  degisiklikFarki(katId: string, komutId: string, yol: string): Promise<string>
  /** Değişiklikleri projeye yazar (yollar verilmezse hepsi). */
  degisiklikUygula(katId: string, komutId: string, yollar?: string[]): Promise<Komut>
  degisiklikVazgec(katId: string, komutId: string): Promise<Komut>
  degisiklikGeriAl(katId: string, komutId: string): Promise<Komut>
  komutIptal(komutId: string): Promise<void>
  tumRaporlar(): Promise<Komut[]>
  canli(): Promise<CanliDurum>
  klasorAc(yol: string): Promise<void>
  klasorSec(baslangic?: string): Promise<string | null>
  claudeDurumu(): Promise<ClaudeDurumu>
  claudeGiris(): Promise<void>
  apiAnahtariKaydet(anahtar: string): Promise<ClaudeDurumu>
  apiAnahtariSil(): Promise<ClaudeDurumu>
  /** Taslak profile göre (kurulum sırasında) kaç sohbet bulunduğu ve kaçının katlara eşlendiği. */
  sohbetOzeti(p: SirketProfili): Promise<SohbetOzeti>
  /** katId verilirse o kat, null ise hiçbir kata eşlenmeyenler, hiç verilmezse hepsi. */
  sohbetler(katId?: string | null): Promise<Sohbet[]>
  sohbetMesajlari(klasor: string, id: string): Promise<SohbetMesaji[]>
  disBaglanti(url: string): Promise<void>
  katSirala(siraliYollar: string[]): Promise<Kat[]>
  durumTuru(katId: string): Promise<Komut>
  sohbetDevam(klasor: string, id: string, mesaj: string, yazma: boolean): Promise<void>
  sohbetDurdur(id: string): Promise<void>
  guncellemeDurumu(): Promise<GuncellemeDurumu>
  guncellemeDenetle(): Promise<GuncellemeDurumu>
  guncellemeKur(): Promise<void>
  /** Plan limitlerini anlık öğrenmek için çok küçük bir Haiku çağrısı yapar. */
  planLimitleriYenile(): Promise<PlanLimitleri | null>
  saglayiciDurumlari(): Promise<SaglayiciDurumu[]>
  saglayiciGiris(id: SaglayiciId): Promise<void>
  /** Tek tıkla bağlan: gerekirse aracı Atrium'un klasörüne kurar, sonra giriş akışını açar (ilerleme: indirmeDinle 'cli-<id>'). */
  tekTiklaBagla(id: SaglayiciId): Promise<void>
  saglayiciAnahtari(id: SaglayiciId, anahtar: string | null): Promise<SaglayiciDurumu[]>
  donanim(): Promise<Donanim>
  /** Ollama'yı uygulamanın içinden indirip kurar. */
  ollamaKur(): Promise<void>
  ollamaBaslat(): Promise<void>
  modelIndir(model: string): Promise<void>
  modelSil(model: string): Promise<void>
  indirmeIptal(hedef: string): Promise<void>
  /** Yerel modelle tek mesajlık deneme sohbeti; yanıt metnini döndürür. */
  yerelDene(model: string, mesajlar: { rol: 'sen' | 'model'; metin: string }[]): Promise<string>
  erisimDurumu(): Promise<ErisimDurumu>
  sirketler(): Promise<{ aktif: string; liste: SirketOzeti[] }>
  /** Proje klasöründe yeni bir proje klasörü açar (kök boşsa ~/Atrium Projects). Kök ve ad döner. */
  projeOlustur(kok: string, ad: string): Promise<{ kok: string; ad: string }>
  /** Katın klasöründe yeni bir Claude Code sohbeti başlatır (canlı çıktı: sohbetKosulari['yeni-<katId>']). */
  yeniSohbet(katId: string, mesaj: string, yazma: boolean): Promise<void>
  /** Yeni şirket açar ve ona geçer (kurulum sihirbazıyla başlar). */
  sirketEkle(): Promise<void>
  sirketSec(id: string): Promise<void>
  sirketSil(id: string): Promise<void>
  /** Etkin şirketteki bütün ajanları tek yapay zeka aracına geçirir; geçirilen ajan sayısı. */
  ekibiGecir(saglayici: SaglayiciId, model: string): Promise<number>
  hesapDurumu(): Promise<HesapDurumu>
  hesapDenetle(): Promise<HesapDurumu>
  hesapKayit(eposta: string, ad: string, sifre: string): Promise<HesapDurumu>
  hesapGiris(eposta: string, sifre: string): Promise<HesapDurumu>
  hesapGoogle(): Promise<HesapDurumu>
  hesapCikis(): Promise<HesapDurumu>
  /** onay: şifre (Google hesabında e-posta) */
  hesapSil(onay: string): Promise<HesapDurumu>
  destekListe(): Promise<DestekBildirimi[]>
  destekGonder(tur: DestekTuru, konu: string, metin: string, tanilama: boolean): Promise<number>
  destekYanit(id: number, metin: string): Promise<void>
  destekOkundu(id: number): Promise<void>
  /** Hata raporuna eklenecek tanılama bilgisinin birebir önizlemesi. */
  tanilama(): Promise<Record<string, unknown>>
  erisimDenetle(): Promise<ErisimDurumu>
  lisansEtkinlestir(anahtar: string): Promise<{ basarili: boolean; durum: ErisimDurumu; neden?: string; sinir?: number }>
  canliDinle(cb: (d: CanliDurum) => void): () => void
  guncellemeDinle(cb: (d: GuncellemeDurumu) => void): () => void
  indirmeDinle(cb: (d: Record<string, Indirme>) => void): () => void
  erisimDinle(cb: (d: ErisimDurumu) => void): () => void
  hesapDinle(cb: (d: HesapDurumu) => void): () => void
}
