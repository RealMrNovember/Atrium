// Simülasyon: claude çağırmadan, para harcamadan ajan koşusu taklidi.
// Arayüzü, animasyonları ve akışı denemek için.
import type { Ajan } from '@ortak/tipler'
import type { Cevirmen } from '@ortak/i18n'
import type { KosuSonucu } from './claude'

type Adim = [anahtar: Parameters<Cevirmen>[0], degerler?: Record<string, string>]

const ADIMLAR: Record<string, Adim[]> = {
  gelistirici: [['toolRead', { f: 'package.json' }], ['toolGlob', { p: 'src/**/*.ts' }], ['toolGrep', { p: 'export function' }], ['toolRead', { f: 'index.ts' }], ['toolTodo']],
  tasarimci: [['toolGlob', { p: '**/*.css' }], ['toolRead', { f: 'App.tsx' }], ['toolGrep', { p: 'button' }], ['toolRead', { f: 'theme.ts' }]],
  test: [['toolGlob', { p: '**/*.test.*' }], ['toolGrep', { p: 'catch' }], ['toolRead', { f: 'api.ts' }], ['toolTodo']],
  arastirmaci: [['toolWebSearch', { q: 'competitors' }], ['toolWebFetch', { u: 'docs.example.com' }], ['toolWebSearch', { q: 'best practices' }]],
  hafiza: [['toolRead', { f: 'README.md' }], ['toolGlob', { p: '**/*' }], ['toolRead', { f: 'package.json' }]],
  lider: [['toolRead', { f: 'memory.md' }], ['toolTodo']],
  uzman: [['toolWebSearch', { q: 'keyword research' }], ['toolRead', { f: 'index.html' }], ['toolGrep', { p: '<meta' }], ['toolTodo']]
}

const bekle = (ms: number, sinyal?: AbortSignal): Promise<void> =>
  new Promise((coz) => {
    const z = setTimeout(coz, ms)
    sinyal?.addEventListener('abort', () => { clearTimeout(z); coz() }, { once: true })
  })

const komutuBul = (istem: string): string => istem.match(/<command>\s*([\s\S]*?)\s*<\/command>/)?.[1] ?? 'command'

function sahtePlan(istem: string, t: Cevirmen): string {
  const komut = komutuBul(istem)
  const k = komut.toLocaleLowerCase()
  const ekip = new Set([...istem.matchAll(/^- id: (\S+)/gm)].map((m) => m[1]))
  const bosOda = Number(istem.match(/(\d+) empty rooms/)?.[1] ?? 0)
  const gorevler: { agent: string; title: string; instructions: string }[] = []
  const hire: { id: string; name: string; role: string; duty: string; model: string; web: boolean }[] = []
  const ekle = (agent: string, title: string): void => {
    if ((ekip.has(agent) || hire.some((h) => h.id === agent)) && !gorevler.some((g) => g.agent === agent)) gorevler.push({ agent, title, instructions: `${title}: ${komut}` })
  }
  if (bosOda > 0 && /seo|uzman|specialist|hire|işe al|experte|esperto|expert|специалист/.test(k)) {
    hire.push({ id: 'seo', name: 'Lina', role: 'SEO', duty: 'Search visibility, keywords, meta tags and site structure.', model: 'sonnet', web: true })
    ekle('seo', 'SEO')
  }
  if (/tasar|ui|ux|ekran|arayüz|design|screen|écran|schermo|дизайн/.test(k)) ekle('tasarimci', 'UI/UX')
  if (/araştır|rakip|pazar|research|competit|recherche|ricerca|исслед/.test(k)) ekle('arastirmaci', 'Research')
  ekle('gelistirici', 'Code')
  if (gorevler.length < 3) ekle('test', 'QA')
  return JSON.stringify({ plan: t('simPlan', { cmd: komut, n: gorevler.length }), hire, tasks: gorevler })
}

export async function simKos(
  tur: 'plan' | 'gorev' | 'rapor' | 'hafiza',
  istem: string,
  ajan: Ajan,
  t: Cevirmen,
  etkinlik: (s: string) => void,
  sinyal?: AbortSignal
): Promise<KosuSonucu> {
  const adimlar = ADIMLAR[ajan.id] ?? (ajan.id.startsWith('h-') ? ADIMLAR.uzman : ADIMLAR.gelistirici)
  const sayi = tur === 'gorev' ? adimlar.length : 2
  for (let i = 0; i < sayi; i++) {
    if (sinyal?.aborted) break
    const [anahtar, degerler] = adimlar[i % adimlar.length]
    etkinlik(t(anahtar, degerler))
    await bekle(900 + Math.random() * 1400, sinyal)
  }
  if (sinyal?.aborted) return { metin: '', maliyetUsd: 0, maliyetTahmini: false, hata: t('errCancelled') }
  const basliklar = [...istem.matchAll(/^### (.+)$/gm)].map((m) => `- ${m[1]}`)
  const metin =
    tur === 'plan' ? sahtePlan(istem, t)
    : tur === 'rapor' ? t('simReport', { cmd: komutuBul(istem), n: basliklar.length, list: basliklar.join('\n') })
    : tur === 'hafiza' ? t('simMemory')
    : `${t('simTaskReport', { role: ajan.rol })}\nMEMORY: simulation`
  return { metin, maliyetUsd: 0, maliyetTahmini: false }
}
