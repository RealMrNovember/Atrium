import type { YerelMetinler } from './en'

export const tr: YerelMetinler = {
  modeller: {
    'llama3.2:1b': 'Minik ve çok hızlı; kısa sorular, özetler ve eski dizüstüler için yeterli.',
    'llama3.2:3b': 'Meta’nın küçük çok yönlü modeli; boyutuna göre kaliteli, neredeyse her yerde çalışır.',
    'qwen3:4b': 'Şaşırtıcı derecede yetenekli küçük model, düşünme modu var; mütevazı donanımda harika bir ilk ajan.',
    'gemma3:4b': 'Google’ın küçük modeli; görselleri de anlar, yazı ve özette iyidir.',
    'phi4-mini': 'Microsoft’un kompakt modeli; boyutuna göre akıl yürütme ve matematikte güçlü.',
    'llama3.1:8b': 'Meta’nın klasik 8B modeli; araç kullanımı sağlam, güvenilir genel model.',
    'qwen3:8b': 'En iyi 8B modellerden; kod, akıl yürütme ve birçok dilde güçlü.',
    'gemma3:12b': 'Görsel anlayan orta boy Google modeli; çok doğal yazar.',
    'qwen3:14b': '8B modellerden belirgin şekilde akıllı; 12–16 GB ekran kartı için ideal.',
    'gpt-oss:20b': 'OpenAI’ın açık ağırlıklı modeli; akıl yürütme ve araç kullanımı iyi, ~16 GB ister.',
    'mistral-small:24b': 'Hızlı, çok dilli ve talimatlara güvenilir şekilde uyar.',
    'gemma3:27b': 'En büyük Gemma; mükemmel yazı ve görsel anlama.',
    'qwen3:30b': 'Uzmanlar karışımı: büyük model kalitesi ama aynı anda yalnız 3B etkin, bu yüzden hızlı.',
    'qwen3:32b': '24 GB kart için birinci sınıf açık model; kod ve uzun işlerde güçlü.',
    'llama3.3:70b': 'Kalitede büyük bulut modellerine yakın; iş istasyonu ya da 64 GB Mac ister.',
    'gpt-oss:120b': 'OpenAI’ın büyük açık modeli; 80 GB üzeri belleği olan güçlü makineler için.',
    'qwen2.5-coder:1.5b': 'Minik kod modeli; zayıf donanımda hızlı kod soruları için.',
    'qwen2.5-coder:7b': 'Boyutuna göre çok iyi kod modeli; kodu iyi okur ve açıklar.',
    'qwen2.5-coder:14b': 'Gerçek projelerle başa çıkan güçlü kodlayıcı; geliştirici ajan için harika.',
    'devstral:24b': 'Mistral’in ajan tarzı kodlama için yaptığı model: kod tabanını gezer, dosya düzenler.',
    'qwen2.5-coder:32b': 'En iyi açık kod modellerinden; kod işlerinde bulut kalitesine yakın.',
    'deepseek-r1:1.5b': 'Adım adım düşünen minik akıl yürütme modeli; çoğunlukla deneme amaçlı.',
    'deepseek-r1:7b': 'Yanıtlamadan önce düşünür; matematik, mantık ve planlamada iyi.',
    'deepseek-r1:14b': 'Daha güçlü adım adım akıl yürütme; daha yavaş ama daha dikkatli yanıtlar.',
    'phi4:14b': 'Microsoft’un akıl yürütme odaklı modeli; matematik ve mantıkta mükemmel.',
    'deepseek-r1:32b': 'Zor problemler için derin akıl yürütme; 24 GB kart ister.',
    'qwen2.5vl:7b': 'Ekran görüntüsü, belge ve grafik okur; metin tanıma (OCR) iyi.',
    'llava:7b': 'Klasik görsel model; resimleri anlatır, onlarla ilgili soruları yanıtlar.',
    'nomic-embed-text': 'Metni arama için vektöre çevirir (RAG); sohbet modeli değildir.',
    'mxbai-embed-large': 'Anlamsal arama için kaliteli gömme modeli; sohbet modeli değildir.'
  },
  rehber: [
    {
      baslik: '🧠 Yerel yapay zeka nedir?',
      maddeler: [
        'Yerel model tamamen senin bilgisayarında çalışan bir yapay zekadır. İndirildikten sonra hesap, abonelik ya da internet gerekmez.',
        'Kodun ve belgelerin bilgisayardan hiç çıkmaz — gizli ya da müşteri projeleri için faydalı.',
        'Yerel modeller Claude veya GPT’den küçüktür; onlara odaklı işler ver: kod okuma ve açıklama, inceleme, özet, taslak.'
      ]
    },
    {
      baslik: '📏 Parametre, boyut ve bellek',
      maddeler: [
        '“8B” 8 milyar parametre demek. Parametre arttıkça model akıllanır ama daha çok bellek ister ve yavaşlar.',
        'Atrium, Ollama’nın varsayılan 4 bit sürümlerini gösterir: milyar parametre başına yaklaşık 0,6 GB.',
        'Model belleğe sığmalı. En hızlısı ekran kartı belleğidir (VRAM); sığmazsa geri kalanı işlemci ve sistem belleğinde çalışır, bu birkaç kat yavaştır.',
        'Apple Silicon Mac’lerde bellek paylaşımlıdır; RAM’in yaklaşık %70’i model için kullanılabilir.'
      ]
    },
    {
      baslik: '⬇️ Kurulum — tek tık',
      maddeler: [
        '“Ollama’yı indir ve kur”a tıkla. Atrium resmi sürümü GitHub’dan indirip kurar (Windows: kullanıcı hesabına, yönetici izni gerekmez · macOS: Uygulamalar klasörüne · Linux: Atrium’un veri klasörüne).',
        'Motor “çalışıyor” görününce “Hızlı çalışır” (ya da “Sana önerilen”) işaretli bir model seç ve İndir’e tıkla.',
        'Modeller büyük dosyalardır (1–40 GB). İndirme arka planda sürer; çalışmaya devam edebilirsin.'
      ]
    },
    {
      baslik: '🔗 Modeli bir ajana bağlamak',
      maddeler: [
        'Bir kata gir, ajana tıkla, “Yapay zeka aracı”nı Ollama yap ve modelini seç.',
        '“Ajan olabilir” işaretli bir model seç: Atrium’un güvenli dosya araçlarıyla proje dosyalarını açıp okuyabilir. Diğer modeller yalnız talimat ve proje hafızasından yanıt verir.',
        'Aynı katta araçları karıştırabilirsin — örneğin lider Claude, geliştirici yerel bir kod modeli.',
        'Yeni işe alınanların da kullanması için Profil & Ayarlar → Yapay zeka araçları’nda “Yeni ajanlar için varsayılan”ı ayarla.'
      ]
    },
    {
      baslik: '🔌 LM Studio ve diğer sunucular',
      maddeler: [
        'Zaten LM Studio, llama.cpp, vLLM ya da bir bulut API’si mi kullanıyorsun? Yapay zeka araçları’nda “OpenAI uyumlu”yu seçip adresini gir.',
        'LM Studio: yerel sunucusunu başlat, sonra http://localhost:1234/v1 adresini kullan.',
        'Model listesi sunucudan otomatik okunur.'
      ]
    },
    {
      baslik: '💡 İpuçları',
      maddeler: [
        'İlk yanıt, model belleğe yüklenirken yavaştır; sonrakiler çok daha hızlı gelir.',
        'Büyük modeller için belleği boşaltmak üzere ağır uygulamaları (çok sekmeli tarayıcı, oyun) kapat.',
        'Dizüstünde şarj aletini tak — pil modu ekran kartını yavaşlatır.',
        'Küçükten başla: 4B model yeterince hızlıysa bir üst boyutu dene.'
      ]
    }
  ]
}
