// src/ortak/yenilikler/*.ts → showroom/yenilikler.json
// Eski sürümler, kurulmayı bekleyen yeni sürümün notlarını kendi dillerinde buradan okur.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const kok = join(dirname(fileURLToPath(import.meta.url)), '..')
const sonuc = {}
for (const dil of ['en', 'tr', 'de', 'fr', 'it', 'ru']) {
  const kaynak = readFileSync(join(kok, 'src/ortak/yenilikler', `${dil}.ts`), 'utf-8')
  const js = ts.transpileModule(kaynak, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const modul = { exports: {} }
  new Function('module', 'exports', 'require', js)(modul, modul.exports, () => ({}))
  sonuc[dil] = modul.exports[dil]
}
writeFileSync(join(kok, 'showroom/yenilikler.json'), JSON.stringify(sonuc) + '\n')
console.log('✓ showroom/yenilikler.json', Object.keys(sonuc).map((d) => `${d}:${sonuc[d].length}`).join(' '))
