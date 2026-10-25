// Atrium'un kendi klasörüne kurduğu yardımcı programların yeri (tek tıkla bağlanma: Claude Code, Codex, Gemini CLI).
import { join } from 'node:path'

let cliKoku = ''
export const cliKokuAyarla = (yol: string): void => { cliKoku = yol }
export const cliKoku_ = (): string => cliKoku

/** Atrium'un npm ile kurduğu bir programın olası yolları (önce yerel ikili, sonra .bin kısayolu). */
export function yonetilenAdaylar(ad: string, paketIci?: string[]): string[] {
  if (!cliKoku) return []
  const bin = join(cliKoku, 'node_modules', '.bin', process.platform === 'win32' ? `${ad}.cmd` : ad)
  return [...(paketIci ? [join(cliKoku, 'node_modules', ...paketIci)] : []), bin]
}
