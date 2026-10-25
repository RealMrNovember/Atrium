// Paylaşılabilir rapor: liderin raporunu tek başına açılan, temiz bir HTML sayfası olarak kaydeder
// (müşteriye ya da ekibe göndermek için). Sayfada dış bağlantı ya da betik yoktur.
import { useState, type ReactElement } from 'react'
import type { Komut } from '@ortak/tipler'
import { useDil } from '../dil'
import { mdHtml } from './Markdown'

const kacir = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

async function sayfaUret(komut: Komut, katAdi: string, dil: string, imza: string): Promise<string> {
  const p = await window.sirket.profil()
  const tarih = new Date(komut.zaman).toLocaleString(dil, { dateStyle: 'long', timeStyle: 'short' })
  const logo = p.logo ? `<img src="${kacir(p.logo)}" alt="" class="logo">` : `<span class="logo harf">${kacir((p.ad.trim()[0] ?? 'A').toUpperCase())}</span>`
  return `<!doctype html>
<html lang="${kacir(dil)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${kacir(katAdi)} — ${kacir(p.ad)}</title>
<style>
:root{--z:#f7f7fb;--k:#fff;--m:#1d2033;--s:#6b7090;--c:#e6e7f0;--v:#6d4cff}
@media (prefers-color-scheme:dark){:root{--z:#0e1220;--k:#151a2c;--m:#e7eaf3;--s:#8e97b3;--c:#2a3150;--v:#9d8bff}}
*{box-sizing:border-box}body{margin:0;background:var(--z);color:var(--m);font:16px/1.65 -apple-system,'Segoe UI',Inter,system-ui,sans-serif}
main{max-width:820px;margin:40px auto;padding:0 20px}
header{display:flex;gap:14px;align-items:center;margin-bottom:24px}
.logo{width:48px;height:48px;border-radius:12px;object-fit:cover}.harf{display:grid;place-items:center;background:var(--v);color:#fff;font-weight:800;font-size:22px}
h1{margin:0;font-size:22px}.alt{color:var(--s);font-size:14px}
.kart{background:var(--k);border:1px solid var(--c);border-radius:16px;padding:24px 28px}
.komut{border-left:3px solid var(--v);padding:6px 14px;margin:0 0 18px;color:var(--s);font-style:italic}
h2,h3{margin:22px 0 8px}code{background:rgba(127,127,127,.15);padding:1px 5px;border-radius:5px;font-size:.9em}
pre{background:rgba(127,127,127,.12);padding:12px;border-radius:10px;overflow:auto}table{border-collapse:collapse;width:100%}td,th{border:1px solid var(--c);padding:6px 8px;text-align:left}
footer{margin:22px 0 40px;text-align:center;color:var(--s);font-size:13px}footer a{color:var(--v);text-decoration:none}
@media print{body{background:#fff}.kart{border:0;padding:0}}
</style></head><body><main>
<header>${logo}<div><h1>${kacir(katAdi)}</h1><div class="alt">${kacir(p.ad)} · ${kacir(tarih)}</div></div></header>
<div class="kart"><p class="komut">“${kacir(komut.metin)}”</p>${mdHtml(komut.rapor ?? '')}</div>
<footer>${kacir(imza)} · <a href="https://atrium.cicibyte.com">atrium.cicibyte.com</a></footer>
</main></body></html>`
}

export function RaporPaylas({ komut, katAdi }: { komut: Komut; katAdi: string }): ReactElement | null {
  const { t, dil } = useDil()
  const [durum, setDurum] = useState('')
  if (!komut.rapor) return null
  const dosyaAdi = `${katAdi}-${komut.zaman.slice(0, 10)}`
  return (
    <span className="rapor-paylas">
      <button className="ikincil mini-buyuk" title={t('shareHint')} onClick={() => void sayfaUret(komut, katAdi, dil, t('shareMadeWith'))
        .then((html) => window.sirket.raporKaydet(html, dosyaAdi)).then((yol) => { if (yol) setDurum(t('shareSaved')) })}>📤 {t('shareReport')}</button>
      <button className="ikincil mini-buyuk" title={t('copyMarkdown')} onClick={() => void navigator.clipboard.writeText(`> ${komut.metin}\n\n${komut.rapor}`).then(() => setDurum(t('mdCopied')))}>📋</button>
      {durum && <span className="kucuk iyi-metin">✓ {durum}</span>}
    </span>
  )
}
