export const tr = `# Atrium Kullanım Kılavuzu

## Hoş geldin
Atrium senin yapay zekâ ajan ofisin. Her proje şirket binanın bir **katı**, her ajan da kendi **odasında**, kendi masasında çalışır. Proje liderine tek bir komut verirsin; lider ekibi yönetir ve sana **tek**, net bir rapor getirir. Son karar her zaman sende.

## İlk açılış
Kurulum sihirbazı seni altı adımda geçirir:
1. **Dil** — English, Türkçe, Deutsch, Français, Italiano ya da Русский. Ajanlar raporlarını da bu dilde yazar.
2. **Şirket** — ad, slogan, sahip ve isteğe bağlı logo (logo binanın çatısında da görünür).
3. **Projeler** — projelerinin durduğu klasörü seç. Bir projeye tıklayarak dahil et ya da çıkar; başka klasörlerden de proje ekleyebilirsin.
4. **Claude** — Atrium, Claude Code'un kurulu ve giriş yapılmış olduğunu kontrol eder. Buradan giriş yapabilir ya da bir Anthropic API anahtarı kullanabilirsin (bilgisayarında şifreli saklanır).
5. **Sohbetler** — Atrium Claude Code sohbetlerini bulur ve projelere göre ayırır.
6. **Tavanlar** — ajan başına ve günlük harcama sınırları.

Sihirbazı istediğin zaman **Profil & Ayarlar**'dan yeniden çalıştırabilirsin.

## Bina
- Ana sayfada şirket kartın ve binan durur. İçeri girmek için **bir kata tıkla**.
- **Yanan pencereler** o katta birinin çalıştığını gösterir: bir Atrium ajanı, misafir bir alt ajan ya da o an aktif bir Claude Code sohbeti.
- **Katları sırala**: soldaki listede bir katı sürükle ya da üzerine gelince çıkan ▲ ▼ düğmelerini kullan.
- **Logon**, yükledikten sonra çatıdaki tabelada durur.

## Katın içi
Bir katta koridorun çevresinde sekiz oda vardır. 1. oda **proje liderinindir** (taçlı olan). Varsayılan ekip: yazılım geliştirici, UI/UX tasarımcı, test & kalite, araştırmacı ve hafıza sorumlusu.
- **Bir ajana tıkla**: o an ne yaptığını, çalışma günlüğünü ve görev tanımını görürsün.
- **Boş bir odaya tıkla**: yeni bir ajan işe al.
- Konuşma balonları canlı etkinliği gösterir, ör. \`📄 cart.ts okunuyor\` ya da \`🔎 "total" aranıyor\`. Parlayan ekran ajanın çalıştığını gösterir.
- Yıldızlı turuncu ajan bir **misafirdir**: Claude Code sohbetlerinden birinde başlatılmış bir alt ajan. Turuncu **Claude** karakteri ise o an aktif bir Claude Code sohbetidir.

## Komut vermek
1. **Komut** sekmesini aç, ne istediğini yaz ve **Gönder**'e bas (ya da Ctrl+Enter).
2. Lider proje hafızasını okur ve işi en fazla dört göreve böler. Uygun kimse yoksa **bir uzman işe alır** — yeni ajan asansörden çıkıp boş bir odaya yerleşir.
3. Ajanlar görevlerini almak için liderin odasına yürür, masalarına dönüp çalışır, sonra raporla geri gelir.
4. Lider her şeyi tek raporda birleştirir: *Özet · Yapılanlar · Bulgular ve riskler · Kararını bekleyenler · Sıradaki adımlar*.

**Dosya değiştirme izni** varsayılan olarak kapalıdır: ekip yalnız inceler ve önerir. Değişiklik istediğinde aç; o zaman ajanlar sırayla çalışır. **Durdur** çalışan komutu iptal eder.

## Durum turu
Bir projenin ne durumda olduğunu mu merak ediyorsun? **📋 Durum turu**'na bas ya da lidere *"Proje ne durumda? Herkese sor, bana kısaca raporla."* gibi bir şey yaz.
Lider masa masa dolaşır, her ajanın kısa durum raporunu dinler (biten, süren, riskler, sıradaki), odasına döner ve sana tek bir özet sunar. Durum raporları yalnız okumadır ve küçük bir bütçeyle çalışır.

## Proje hafızası ve odak klasörleri
Her kat kısa bir **proje hafızası** tutar: projenin ne olduğu, teknolojisi ve yapısı, nasıl çalıştırıldığı, hedeflerin ve kararların, dikkat edilecekler, son işler ve dersler. Her ajan tüm projeyi taramak yerine **önce bunu okur** — Atrium'un en büyük token tasarrufu budur.
- Bir katta **Hafızayı çıkar**'a basarak oluştur; tazelemek için tekrar bas. **Hafıza** sekmesinden elle de düzenleyebilirsin.
- Her işten sonra hafıza kendini günceller (*Son işler* ve *Öğrenilenler*).
- Hafıza çıkarılırken Atrium her ajan için **odak klasörleri** de önerir (ör. geliştirici → \`src/api\`). Ajanlar işe odak klasörlerinden başlar ve görev gerektirmedikçe dışına çıkmaz. Ajan kartından değiştirebilirsin.

## Claude Code sohbetleri
- **Sohbetler** sayfası bilgisayarındaki bütün Claude Code sohbetlerini projelerine göre listeler. Yeşil nokta sohbetin şu an aktif olduğunu gösterir.
- Bir sohbeti açıp okuyabilirsin. Alttaki kutuya yazarak **sohbete Atrium'dan devam edersin**: Claude o projede çalışır, yanıtlarını ve adımlarını canlı görürsün, aynı anda katta bir Claude karakteri çalışır.
- Sohbete devam ederken aynı güvenlik kuralları geçerlidir: kabuk komutu yok, dosya değişikliği yalnız izin verirsen.
- Sohbetler yalnızca yerelde okunur; hiçbir şey bilgisayarından çıkmaz.

## Ekip
**Ekip** sekmesinde ajanların adını değiştirebilir, görev tanımlarını düzenleyebilir, model seçebilir (Haiku: hızlı ve ucuz · Sonnet: dengeli · Opus: en güçlü), web erişimi verebilir, odak klasörlerini belirleyebilir, başka odaya taşıyabilir ya da çıkarabilirsin. Lider çıkarılamaz.

## Raporlar
**Raporlar** sayfası bütün katlardaki her komutu liderin raporu, ekibin tek tek raporları ve maliyetiyle birlikte toplar.

## Maliyet ve tavanlar
- **Bugün ≈ $X**, Claude Code'un bugünkü ajan koşuları için bildirdiği maliyettir.
  - **Claude aboneliğiyle** (Pro / Max) giriş yaptıysan bu bir **API eşdeğeri tahminidir**: ayrıca ödenmez, onun yerine aboneliğinin kullanım limitine sayılır.
  - **API anahtarı** kullanıyorsan gerçek API harcamasıdır.
- **Tavan**, Atrium'un kendi **günlük güvenlik sınırıdır**. Ajanlar bu sınırı aşabilecek bir işe başlamaz. Bir koşu süre aşımına uğrar ya da iptal edilir ve maliyeti okunamazsa ajan başına tavanın tamamı sayılır; böylece günlük tavan asla eksik sayılmaz.
- İki tavanı da **Profil & Ayarlar → Tavanlar ve güvenlik**'ten değiştirebilirsin.

## Güvenlik
- Ajanlar \`.env\`, anahtar ve parola dosyalarını okuyamaz, kabuk komutu çalıştıramaz ve kendi alt ajanlarını başlatamaz.
- Ajanlar commit atmaz, push etmez, paket kurmaz, kimseye mesaj göndermez, hiçbir şey yayınlamaz.
- Web sayfalarından ve dosyalardan gelen metin veri sayılır, asla talimat sayılmaz.

## Simülasyon
Üst çubuktaki **Simülasyon**'u açarak her şeyi — komutları, işe alımı, durum turunu, animasyonları — Claude'u çağırmadan ve hiç para harcamadan dene. Simülasyon proje hafızasına asla yazmaz.

## Sesler
Adım sesleri, klavye tıkırtısı, asansör zili, işe alım melodisi ve rapor hazır olunca bir zil. Üst çubuktaki 🔊 düğmesinden ya da Ayarlar'dan açıp kapatabilirsin.

## Güncellemeler
Atrium açılışta ve birkaç saatte bir güncelleme olup olmadığına bakar. Yeni sürüm hazır olunca bir şerit görürsün — **Yeniden başlat ve güncelle**'ye bas. **Profil & Ayarlar → Güncellemeler**'den elle de kontrol edebilirsin. macOS'ta güncelleme indirme sayfasını açar.

## Sorun giderme
- **"Claude Code bulunamadı"** — \`npm install -g @anthropic-ai/claude-code\` ile kur ya da yolunu Ayarlar'dan gir.
- **"Claude Code oturumu kapalı"** — Ayarlar → Claude bağlantısı'nı aç, **Claude ile giriş yap**'a bas, sonra **Tekrar kontrol et**.
- **"günlük tavan"** — bugünkü tavan doldu; Ayarlar'dan yükselt ya da yarını bekle.
- **Bir kat görünmüyor** — Ayarlar'da proje klasörünü ve çıkarılan projeleri kontrol et, sonra *Katlar*'ın yanındaki ↻'ye bas.

## Destek
Atrium ücretsiz. İşine yarıyorsa GitHub'da ⭐ yıldız ver, paylaş ve hata ya da fikirlerini GitHub Issues'a yaz.
CiciByte Technology, Inc. ürünü — cicibyte.com
`
