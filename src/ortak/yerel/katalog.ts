// Yerel model kataloğu (Ollama kütüphanesindeki adlarıyla) ve donanıma uygunluk hesabı.
// Boyutlar Ollama'nın varsayılan 4 bit sürümlerine göredir (GB, yaklaşık).
import type { Donanim } from '../tipler'

export type ModelTuru = 'genel' | 'kod' | 'akil' | 'gorsel' | 'sansursuz' | 'gomme'

export interface KatalogModeli {
  /** `ollama pull` adı */
  id: string
  aile: string
  /** milyar parametre */
  parametre: number
  boyutGb: number
  tur: ModelTuru
  /** Araç (function calling) destekler → Atrium ajanı olarak dosya okuyabilir. */
  arac: boolean
  /** Görsel girdi anlar. */
  gorsel?: boolean
}

export const KATALOG: KatalogModeli[] = [
  { id: 'llama3.2:1b', aile: 'Llama 3.2', parametre: 1, boyutGb: 1.3, tur: 'genel', arac: true },
  { id: 'llama3.2:3b', aile: 'Llama 3.2', parametre: 3, boyutGb: 2.0, tur: 'genel', arac: true },
  { id: 'qwen3:4b', aile: 'Qwen 3', parametre: 4, boyutGb: 2.5, tur: 'genel', arac: true },
  { id: 'gemma3:4b', aile: 'Gemma 3', parametre: 4, boyutGb: 3.3, tur: 'genel', arac: false, gorsel: true },
  { id: 'phi4-mini', aile: 'Phi-4 mini', parametre: 3.8, boyutGb: 2.5, tur: 'genel', arac: true },
  { id: 'llama3.1:8b', aile: 'Llama 3.1', parametre: 8, boyutGb: 4.9, tur: 'genel', arac: true },
  { id: 'qwen3:8b', aile: 'Qwen 3', parametre: 8, boyutGb: 5.2, tur: 'genel', arac: true },
  { id: 'gemma3:12b', aile: 'Gemma 3', parametre: 12, boyutGb: 8.1, tur: 'genel', arac: false, gorsel: true },
  { id: 'qwen3:14b', aile: 'Qwen 3', parametre: 14, boyutGb: 9.3, tur: 'genel', arac: true },
  { id: 'gpt-oss:20b', aile: 'gpt-oss', parametre: 20, boyutGb: 14, tur: 'genel', arac: true },
  { id: 'mistral-small:24b', aile: 'Mistral Small', parametre: 24, boyutGb: 14, tur: 'genel', arac: true },
  { id: 'gemma3:27b', aile: 'Gemma 3', parametre: 27, boyutGb: 17, tur: 'genel', arac: false, gorsel: true },
  { id: 'qwen3:30b', aile: 'Qwen 3 MoE', parametre: 30, boyutGb: 19, tur: 'genel', arac: true },
  { id: 'qwen3:32b', aile: 'Qwen 3', parametre: 32, boyutGb: 20, tur: 'genel', arac: true },
  { id: 'llama3.3:70b', aile: 'Llama 3.3', parametre: 70, boyutGb: 43, tur: 'genel', arac: true },
  { id: 'gpt-oss:120b', aile: 'gpt-oss', parametre: 120, boyutGb: 65, tur: 'genel', arac: true },
  { id: 'qwen2.5-coder:1.5b', aile: 'Qwen 2.5 Coder', parametre: 1.5, boyutGb: 1.0, tur: 'kod', arac: true },
  { id: 'qwen2.5-coder:7b', aile: 'Qwen 2.5 Coder', parametre: 7, boyutGb: 4.7, tur: 'kod', arac: true },
  { id: 'qwen2.5-coder:14b', aile: 'Qwen 2.5 Coder', parametre: 14, boyutGb: 9.0, tur: 'kod', arac: true },
  { id: 'devstral:24b', aile: 'Devstral', parametre: 24, boyutGb: 14, tur: 'kod', arac: true },
  { id: 'qwen2.5-coder:32b', aile: 'Qwen 2.5 Coder', parametre: 32, boyutGb: 20, tur: 'kod', arac: true },
  { id: 'deepseek-r1:1.5b', aile: 'DeepSeek-R1', parametre: 1.5, boyutGb: 1.1, tur: 'akil', arac: false },
  { id: 'deepseek-r1:7b', aile: 'DeepSeek-R1', parametre: 7, boyutGb: 4.7, tur: 'akil', arac: false },
  { id: 'deepseek-r1:14b', aile: 'DeepSeek-R1', parametre: 14, boyutGb: 9.0, tur: 'akil', arac: false },
  { id: 'phi4:14b', aile: 'Phi-4', parametre: 14, boyutGb: 9.1, tur: 'akil', arac: false },
  { id: 'deepseek-r1:32b', aile: 'DeepSeek-R1', parametre: 32, boyutGb: 20, tur: 'akil', arac: false },
  { id: 'qwen2.5vl:7b', aile: 'Qwen 2.5 VL', parametre: 7, boyutGb: 6.0, tur: 'gorsel', arac: false, gorsel: true },
  { id: 'llava:7b', aile: 'LLaVA', parametre: 7, boyutGb: 4.7, tur: 'gorsel', arac: false, gorsel: true },
  // sansürsüz (reddetmeleri azaltılmış) topluluk ince ayarları — Ollama kütüphanesinde herkese açık
  { id: 'dolphin-phi:2.7b', aile: 'Dolphin Phi', parametre: 2.7, boyutGb: 1.6, tur: 'sansursuz', arac: false },
  { id: 'llama2-uncensored:7b', aile: 'Llama 2 Uncensored', parametre: 7, boyutGb: 3.8, tur: 'sansursuz', arac: false },
  { id: 'dolphin-mistral:7b', aile: 'Dolphin Mistral', parametre: 7, boyutGb: 4.1, tur: 'sansursuz', arac: false },
  { id: 'dolphin-llama3:8b', aile: 'Dolphin Llama 3', parametre: 8, boyutGb: 4.7, tur: 'sansursuz', arac: false },
  { id: 'dolphin3:8b', aile: 'Dolphin 3.0', parametre: 8, boyutGb: 4.9, tur: 'sansursuz', arac: false },
  { id: 'wizard-vicuna-uncensored:13b', aile: 'Wizard Vicuna Uncensored', parametre: 13, boyutGb: 7.4, tur: 'sansursuz', arac: false },
  { id: 'dolphin-mixtral:8x7b', aile: 'Dolphin Mixtral', parametre: 47, boyutGb: 26, tur: 'sansursuz', arac: false },
  { id: 'nomic-embed-text', aile: 'Nomic Embed', parametre: 0.14, boyutGb: 0.3, tur: 'gomme', arac: false },
  { id: 'mxbai-embed-large', aile: 'mxbai Embed', parametre: 0.34, boyutGb: 0.7, tur: 'gomme', arac: false }
]

export type Uygunluk = 'hizli' | 'yavas' | 'sigmaz' | 'disk'

/** Modelin çalışırken istediği bellek: ağırlıklar + bağlam ve ara bellek payı. */
export const gerekenBellek = (m: { boyutGb: number }): number => Math.round((m.boyutGb * 1.2 + 0.6) * 10) / 10

/** Bu bilgisayarda en büyük ayrı ekran kartı belleği (2 GB altı tümleşik kartlar sayılmaz). */
export const enIyiVram = (d: Donanim): number => Math.max(0, ...d.gpular.map((g) => g.vramGb ?? 0).filter((v) => v >= 2))

export function uygunluk(m: { boyutGb: number }, d: Donanim): Uygunluk {
  if (d.diskBosGb !== undefined && d.diskBosGb < m.boyutGb + 1) return 'disk'
  const gerek = gerekenBellek(m)
  if (d.birlesikBellek) {
    // Apple Silicon: belleğin ~%70'i ekran kartına ayrılabilir
    if (gerek <= d.ramGb * 0.7) return 'hizli'
    return gerek <= d.ramGb * 0.85 ? 'yavas' : 'sigmaz'
  }
  const vram = enIyiVram(d)
  if (vram && gerek <= vram) return 'hizli'
  // ekran kartına sığmayan kısım işlemci + RAM'de çalışır (sistem ve diğer uygulamalara pay bırakılır)
  return gerek <= vram + d.ramGb * 0.6 ? 'yavas' : 'sigmaz'
}

/** Rahat ve yavaş çalışan en büyük parametre sayıları (özet satırı için). */
export function sinirlar(d: Donanim): { hizli: number; yavas: number } {
  const genel = KATALOG.filter((m) => m.tur !== 'gomme' && m.tur !== 'sansursuz')
  const enBuyuk = (u: Uygunluk[]): number => Math.max(0, ...genel.filter((m) => u.includes(uygunluk(m, d))).map((m) => m.parametre))
  return { hizli: enBuyuk(['hizli']), yavas: enBuyuk(['hizli', 'yavas']) }
}

/** Her türden bilgisayara uyan en güçlü model (önce hızlı, yoksa yavaş). */
export function oneriler(d: Donanim): Set<string> {
  const sonuc = new Set<string>()
  for (const tur of ['genel', 'kod'] as ModelTuru[]) {
    for (const istenen of ['hizli', 'yavas'] as Uygunluk[]) {
      const aday = KATALOG.filter((m) => m.tur === tur && m.arac && uygunluk(m, d) === istenen).sort((a, b) => b.parametre - a.parametre)[0]
      if (aday) { sonuc.add(aday.id); break }
    }
  }
  return sonuc
}
