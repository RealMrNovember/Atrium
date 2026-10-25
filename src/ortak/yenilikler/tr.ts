import type { SurumNotu } from './en'

export const tr: SurumNotu[] = [
  {
    surum: '1.4.2', tarih: '2026-10-25', baslik: "Daha hızlı güncellemeler",
    maddeler: [
      "🔄 Atrium artık açılır açılmaz ve sonra her 10 dakikada bir yeni sürüm olup olmadığına bakıyor.",
      "🛠️ Küçük güvenilirlik düzeltmeleri."
    ]
  },
  {
    surum: '1.4.1', tarih: '2026-10-25', baslik: "Yerel YZ’de sansürsüz modeller",
    maddeler: [
      "🔓 Yerel YZ kataloğunda yeni “Sansürsüz” filtresi: yedi topluluk modeli (Dolphin, Llama 2 Uncensored, Wizard Vicuna), ne anlama geldiğini anlatan açık bir notla.",
      "🛠️ Ollama indirmesi iptal edildiğinde yarım inen dosya artık temizleniyor."
    ]
  },
  {
    surum: '1.4.0', tarih: '2026-10-25', baslik: 'Birçok yapay zeka, tek ofis — üstelik yerel YZ',
    maddeler: [
      "🤝 Ajanlar artık Claude Code, OpenAI Codex CLI, Gemini CLI, Ollama ya da OpenAI uyumlu herhangi bir sunucuyla çalışabilir — aynı katta karışık.",
      "🦙 Yeni Yerel YZ sayfası: bilgisayarını ölçer, hangi modellerin hızlı, yavaş ya da hiç çalışmayacağını gösterir.",
      "⬇️ Atrium Ollama’yı ve modelleri senin için indirip kurar; deneme sohbetinde hemen deneyebilirsin.",
      "🔗 Yerel modeli istediğin ajana ver; araç destekleyen modeller proje dosyalarını güvenli, proje içi araçlarla okur."
    ]
  },
  {
    surum: '1.3.0', tarih: '2026-10-25', baslik: 'Yenilikler artık Atrium’un içinde',
    maddeler: [
      '🎁 Her güncellemeden sonra kendi dilinde bir “Neler yeni?” penceresi.',
      '📜 Profil & Ayarlar → Güncellemeler’de bütün sürüm geçmişi.',
      '🔎 Yeni sürüm bulunduğu anda — daha inmeden — neler getirdiğini gösteren bir pencere açılır.'
    ]
  },
  {
    surum: '1.2.0', tarih: '2026-10-25', baslik: 'Bina seninle konuşuyor',
    maddeler: [
      '🪟 Claude uygulamasında ya da IDE’nde açık sohbetler sıcak, loş pencereler olarak yanar; birinin çalıştığı katlar parlak parlar.',
      '👋 Kararını bekleyen bir sohbet ya da sorun yaşayan bir ajan olunca bir ajan pencereden uzanır, el sallar ve sana seslenir — tıklayınca o sohbete gidersin.',
      '🔔 Hafif bir “hey” sesi ve kat listesinde renkli durum noktaları (seslenen · çalışan · açık).'
    ]
  },
  {
    surum: '1.1.3', tarih: '2026-10-25', baslik: 'Sıradaki adım kutuları',
    maddeler: [
      '🧭 Claude masaüstü uygulamasındaki “sıradaki adım” kutusu (özet, soru, cevap düğmeleri) artık sohbetlerinde görünür.',
      '✅ Bekleyen soruyu tek tıkla cevapla — Claude devam eder, katta canlı izlersin.',
      '⏳ Kararını bekleyen sohbetler listelerde işaretlenir.'
    ]
  },
  {
    surum: '1.1.2', tarih: '2026-10-25', baslik: 'Plan kullanım limitleri',
    maddeler: [
      '📊 Claude aboneliğinde üst çubuk oturum (5 saat) ve haftalık kullanımını sıfırlanma saatleriyle gösterir.',
      '💬 Uzun sohbetlere devam etmenin kendi tavanı var (varsayılan 5 USD).',
      '⚠️ Bütçe mesajları artık hangi tavana çarpıldığını ve nereden değişeceğini söyler.'
    ]
  },
  {
    surum: '1.1.1', tarih: '2026-10-25', baslik: 'Atrium’u destekle',
    maddeler: ['☕ Yan menüde, README’de ve showroom’da “Bir kahve ısmarla” bağlantısı.']
  },
  {
    surum: '1.1.0', tarih: '2026-10-25', baslik: 'Ofis canlanıyor',
    maddeler: [
      '📋 Durum turu: lider masa masa dolaşır ve sana tek bir özet getirir.',
      '💬 Claude Code sohbetlerine Atrium’dan devam et, katta canlı izle.',
      '📁 Her ajana odak klasörleri — daha az token.',
      '↕️ Katları sırala, 🏷️ logon çatıda, 🔊 ses efektleri.',
      '🔄 Otomatik güncelleme ve 6 dilde uygulama içi kullanım kılavuzu.'
    ]
  },
  {
    surum: '1.0.1', tarih: '2026-10-25', baslik: 'Katlarını seç',
    maddeler: [
      '🏢 Projeleri dahil et ya da çıkar, herhangi bir klasörden proje ekle.',
      '🛡️ Ajan koşuları kesinlikle salt okuma kalır, Claude Code geçmişine ya da hafızasına asla yazmaz.'
    ]
  },
  {
    surum: '1.0.0', tarih: '2026-10-25', baslik: 'Merhaba, Atrium',
    maddeler: [
      '🏢 Her proje bir kat, her ajan bir oda.',
      '🧭 Lidere tek komut, geriye tek birleşik rapor — lider uzman bile işe alabilir.',
      '🧠 Proje hafızası, Claude Code sohbetlerinin içe aktarımı, 6 dil, kurulum sihirbazı ve Simülasyon modu.'
    ]
  }
]
