// assets/brand/*.svg → build/icon.png (512), build/icon.ico, src/renderer/public/*.png
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import pngToIco from 'png-to-ico'

const kok = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = (ad) => readFileSync(join(kok, 'assets', 'brand', ad), 'utf-8')
const png = (kaynak, genislik) => new Resvg(kaynak, { fitTo: { mode: 'width', value: genislik } }).render().asPng()
const yaz = (yol, veri) => {
  mkdirSync(dirname(join(kok, yol)), { recursive: true })
  writeFileSync(join(kok, yol), veri)
  console.log('✓', yol)
}

const ikon = svg('atrium-icon.svg')
yaz('build/icon.png', png(ikon, 512))
yaz('build/icon.ico', await pngToIco([16, 24, 32, 48, 64, 128, 256].map((b) => png(ikon, b))))
yaz('src/renderer/public/icon.png', png(ikon, 256))
yaz('src/renderer/public/mark.svg', svg('atrium-mark.svg'))
yaz('assets/brand/atrium-icon-512.png', png(ikon, 512))
yaz('assets/brand/atrium-wordmark.png', png(svg('atrium-wordmark.svg'), 1040))
