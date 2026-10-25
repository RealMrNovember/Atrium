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
- **Parlak pencereler** şu an birinin çalıştığını, **sıcak ve loş pencereler** ise Claude uygulamasında açık ama boşta duran bir Claude Code sohbetini gösterir.
- Sana ihtiyaç olduğunda — kararını bekleyen bir sohbet ya da sorun yaşayan bir ajan — o katın penceresinden bir ajan uzanır, el sallar ve sana seslenir. Tıklayınca doğrudan o sohbete gidersin.

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

## Yapay zeka araçları
Atrium tek bir yapay zekaya bağlı değil. Her ajanın kendi **yapay zeka aracı** var ve farklı araçlar aynı katta yan yana çalışabilir:
- **Claude Code** — varsayılan; en yetenekli ajan, plan kullanımı göstergesi ve dolar tavanları yalnız onda.
- **OpenAI Codex CLI** — \`npm i -g @openai/codex\` ile kur, sonra Profil & Ayarlar → Yapay zeka araçları'nda **Giriş yap**'a tıkla.
- **Gemini CLI** — \`npm i -g @google/gemini-cli\` ile kur; Google ile giriş yap ya da bir Gemini API anahtarı kaydet.
- **Ollama** — kendi bilgisayarında çalışan ücretsiz modeller (Yerel YZ'ye bak).
- **OpenAI uyumlu** — LM Studio, llama.cpp, vLLM, OpenRouter ya da OpenAI API: adresi ve gerekiyorsa anahtarı gir.

Bir ajanı değiştirmek için ona tıkla, **Yapay zeka aracı** ve **Model**'i seç. **Yeni ajanlar için varsayılan**, işe alınanların ne kullanacağını belirler; lider Claude dışı bir araçla çalışıyorsa işe aldığı ajanlar da aynı araç ve modeli kullanır.

## Yerel YZ
**Yerel YZ** sayfası bilgisayarını ölçer (işlemci, bellek, ekran kartı, boş disk) ve hangi modellerin hızlı, yavaş çalışacağını ya da hiç sığmayacağını gösterir.
1. **Ollama'yı indir ve kur**'a tıkla — Atrium resmi motoru indirip senin için kurar.
2. **Hızlı çalışır** ya da **Sana önerilen** işaretli bir model seçip **İndir**'e tıkla.
3. Deneme sohbetinde dene, sonra bir ajana ver: Yapay zeka aracı **Ollama**, Model **senin modelin**.
**Ajan olabilir** işaretli modeller Atrium'un güvenli dosya araçlarıyla proje dosyalarını açıp okuyabilir; diğerleri yalnız talimat ve proje hafızasından yanıt verir. Sayfada boyutlar, bellek ve ipuçları üzerine kısa bir rehber de var.

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

## Birden fazla şirket
Atrium'da birden fazla şirket yönetebilirsin — örneğin kendi stüdyon ve bir müşterin. Her şirketin **kendi projeleri, ekibi, hafızası, raporları ve varsayılan yapay zeka aracı** vardır.
- Sol üstte şirket adının yanındaki **▾** menüsünden şirketler arasında geçiş yap ya da **Yeni şirket** ekle. Yeni şirket kurulum sihirbazıyla başlar; vazgeçersen sihirbazdaki **… şirketine dön** düğmesini kullan.
- **Profil & Ayarlar → Şirketlerim** hepsini listeler; oradan bir şirketi açabilir ya da kaldırabilirsin. Kaldırmak yalnız Atrium verisini (ekip, hafıza, raporlar) siler — proje klasörlerine asla dokunmaz.
- **Profil & Ayarlar → Yapay zeka araçları**'ndaki **Tüm ekibi varsayılan araca geçir**, o şirketteki bütün ajanları tek seferde geçirir.

## Yeni proje ve yeni sohbet
- Henüz projen yok mu? Kurulum sihirbazında (ya da *Katlar* yanındaki **＋** ile) bir ad yaz ve **Yeni proje**'ye tıkla — Atrium klasörü kısa bir README ile oluşturur. Klasör seçmediysen kullanıcı klasöründeki *Atrium Projects* içine açılır.
- Bir katın **Sohbetler** sekmesinde **＋ Yeni sohbet** var: o proje klasöründe gerçek bir Claude Code sohbeti başlatır. Sohbet kaydedilir, listende görünür ve sonra — Atrium'da ya da Claude Code'da — devam ettirilebilir.

## Komuta dosya eklemek
Komut kutusunun altındaki **📎 Dosya ekle**'ye tıkla ya da dosyaları kutuya bırak — görsel, PDF ve metin dosyaları; en çok 10 dosya, her biri 10 MB. Küçük metin dosyaları ajanlara doğrudan verilir; görselleri ve PDF'leri ajanlar dosya araçlarıyla açar. Ekler projende değil, Atrium'un kendi veri klasöründe durur.

## Yapay zeka araçlarını tek tıkla bağlamak
- **ChatGPT ile bağlan** (Codex), **Google ile bağlan** (Gemini) ve **Claude'u bağla**: araç kurulu değilse Atrium onu kendi klasörüne kurar (yönetici izni gerekmez; Node.js gerekir), sonra aracın giriş sayfasını tarayıcında açar. Girişi bitirince durum kendiliğinden **Hazır** olur.
- Kurulum sihirbazının **Yapay zeka** adımı bütün araçları sunar — birini ya da birkaçını bağla.
- Üst çubukta **kullanılan her yapay zeka aracı için ayrı bir kullanım kartı** görünür: Claude'un oturum ve haftalık limitleri (API anahtarıyla bugünkü dolar), Codex bildirirse limitleri, diğerleri için bugünkü koşu ve token sayısı, Ollama için *yerel · ücretsiz*.

## Destek ve hesabın
**🛟 Destek** sayfasından bize **dilek**, **istek**, **şikayet** ya da **hata raporu** gönderebilir, cevaplarımızı orada okuyabilirsin (yeni cevaplar rozetle görünür).
- Mesaj göndermek için ücretsiz ve isteğe bağlı bir hesap gerekir: e-posta + şifre ya da **Google ile devam et**.
- Hata veren bir komutun yanında **🐞 Bildir** bulunur; hata mesajıyla bir hata raporu açar. **Tanılama bilgisi ekle**'yi yalnız istersen işaretle — tam olarak neyin eklendiğini görürsün (uygulama sürümü, sistem, kişisel yollar ve anahtarlar ayıklanmış son hatalar).
- İstediğin an çıkış yapabilir ya da **hesabını silebilirsin**; hesabın ve tüm mesajların kalıcı olarak silinir.

## Gizlilik
- Projelerin, kodun, dosyaların, sohbetlerin, proje hafızan, komutların, ajan sonuçların ve API anahtarların **bilgisayarından hiç çıkmaz**. Onları göremeyiz, okuyamayız — bize hiç ulaşmazlar.
- Yapay zeka istekleri bilgisayarından doğrudan seçtiğin araca gider (yerel modellerde hiç dışarı çıkmaz). Arada Atrium sunucusu yoktur.
- Atrium internete yalnızca güncellemeleri ve sürüm notlarını denetlemek için, bir de — yalnız kullanırsan — hesabın ve gönderdiğin mesajlar için bağlanır.
- Hesap açarsan yalnızca e-postanı, adını ve uygulama sürümünü saklarız; şifren yalnızca geri çevrilemez bir özet olarak tutulur.

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
