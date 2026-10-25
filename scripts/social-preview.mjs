// GitHub sosyal önizleme kartı (1280×640): assets/brand/social-preview.png
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const kok = join(dirname(fileURLToPath(import.meta.url)), '..')
const b64 = (yol) => readFileSync(join(kok, yol)).toString('base64')
const isaret = readFileSync(join(kok, 'assets/brand/atrium-mark.svg'), 'utf-8')
  .replace(/<svg[^>]*>/, '').replace('</svg>', '')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1280" height="640" viewBox="0 0 1280 640">
  <defs>
    <linearGradient id="z" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2146"/><stop offset="1" stop-color="#0b0e19"/></linearGradient>
    <radialGradient id="h" cx=".18" cy=".2" r=".7"><stop offset="0" stop-color="#7c5cff" stop-opacity=".45"/><stop offset="1" stop-color="#7c5cff" stop-opacity="0"/></radialGradient>
    <linearGradient id="y" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b9a8ff"/></linearGradient>
    <clipPath id="k"><rect x="610" y="120" width="640" height="400" rx="16"/></clipPath>
  </defs>
  <rect width="1280" height="640" fill="url(#z)"/>
  <rect width="1280" height="640" fill="url(#h)"/>
  <g transform="translate(64 96) scale(0.9)">${isaret}</g>
  <text x="180" y="168" font-family="Segoe UI, Inter, Arial" font-size="64" font-weight="800" fill="url(#y)">Atrium</text>
  <text x="68" y="280" font-family="Segoe UI, Inter, Arial" font-size="44" font-weight="700" fill="#ffffff">Your AI agent office.</text>
  <text x="68" y="336" font-family="Segoe UI, Inter, Arial" font-size="24" fill="#c4cae0">Every project is a floor,</text>
  <text x="68" y="370" font-family="Segoe UI, Inter, Arial" font-size="24" fill="#c4cae0">every Claude agent has a room.</text>
  <text x="68" y="440" font-family="Segoe UI, Inter, Arial" font-size="20" fill="#ffd76a">One command · one report · fewer tokens</text>
  <text x="68" y="560" font-family="Segoe UI, Inter, Arial" font-size="18" fill="#98a1c0">Windows · macOS · Linux · 6 languages · atrium.cicibyte.com</text>
  <rect x="604" y="114" width="652" height="412" rx="20" fill="#2a3256"/>
  <image x="610" y="120" width="640" height="400" preserveAspectRatio="xMidYMid slice" clip-path="url(#k)" xlink:href="data:image/png;base64,${b64('docs/screenshots/floor.png')}"/>
</svg>`

writeFileSync(join(kok, 'assets/brand/social-preview.png'), new Resvg(svg, { fitTo: { mode: 'width', value: 1280 }, font: { loadSystemFonts: true } }).render().asPng())
console.log('✓ assets/brand/social-preview.png')
