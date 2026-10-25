import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

const surum = (JSON.parse(readFileSync(resolve('package.json'), 'utf-8')) as { version: string }).version

export default defineConfig({
  main: {
    resolve: { alias: { '@ortak': resolve('src/ortak') } }
  },
  preload: {
    build: { rollupOptions: { output: { format: 'cjs', entryFileNames: '[name].js' } } },
    resolve: { alias: { '@ortak': resolve('src/ortak') } }
  },
  renderer: {
    resolve: { alias: { '@ortak': resolve('src/ortak') } },
    define: { __SURUM__: JSON.stringify(surum) },
    plugins: [react()]
  }
})
