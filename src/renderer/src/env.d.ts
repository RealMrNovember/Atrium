import type { SirketApi } from '@ortak/tipler'

declare global {
  interface Window {
    sirket: SirketApi
  }
  const __SURUM__: string
}

export {}
