// Küçük Markdown gösterici: başlık, liste, kalın, kod, tablo. Önce kaçırır, sonra biçimler.
import type { ReactElement } from 'react'

const kacir = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function satirIci(s: string): string {
  return kacir(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
}

export function mdHtml(md: string): string {
  const cikti: string[] = []
  let liste: 'ul' | 'ol' | null = null
  let kod = false
  let tablo: string[][] = []
  const listeKapat = (): void => {
    if (liste) cikti.push(`</${liste}>`)
    liste = null
  }
  const tabloKapat = (): void => {
    if (!tablo.length) return
    const [bas, ...govde] = tablo
    cikti.push('<table><thead><tr>' + bas.map((h) => `<th>${satirIci(h)}</th>`).join('') + '</tr></thead><tbody>' +
      govde.map((r) => '<tr>' + r.map((h) => `<td>${satirIci(h)}</td>`).join('') + '</tr>').join('') + '</tbody></table>')
    tablo = []
  }
  for (const ham of md.split('\n')) {
    if (ham.trim().startsWith('```')) {
      listeKapat(); tabloKapat()
      cikti.push(kod ? '</code></pre>' : '<pre><code>')
      kod = !kod
      continue
    }
    if (kod) { cikti.push(kacir(ham) + '\n'); continue }
    const s = ham.trimEnd()
    if (/^\s*\|.*\|\s*$/.test(s)) {
      listeKapat()
      if (/^\s*\|[\s:|-]+\|\s*$/.test(s)) continue
      tablo.push(s.trim().slice(1, -1).split('|').map((h) => h.trim()))
      continue
    }
    tabloKapat()
    const baslik = s.match(/^(#{1,4})\s+(.*)$/)
    const madde = s.match(/^\s*[-*]\s+(.*)$/)
    const sirali = s.match(/^\s*\d+[.)]\s+(.*)$/)
    if (baslik) { listeKapat(); cikti.push(`<h${baslik[1].length}>${satirIci(baslik[2])}</h${baslik[1].length}>`) }
    else if (madde || sirali) {
      const tur = madde ? 'ul' : 'ol'
      if (liste !== tur) { listeKapat(); cikti.push(`<${tur}>`); liste = tur }
      cikti.push(`<li>${satirIci((madde ?? sirali)![1])}</li>`)
    } else if (!s.trim()) listeKapat()
    else { listeKapat(); cikti.push(`<p>${satirIci(s)}</p>`) }
  }
  listeKapat(); tabloKapat()
  if (kod) cikti.push('</code></pre>')
  return cikti.join('')
}

export function Markdown({ metin }: { metin: string }): ReactElement {
  return <div className="md" dangerouslySetInnerHTML={{ __html: mdHtml(metin) }} />
}
