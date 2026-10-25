// Claude Desktop / IDE'de şu an AÇIK olan Claude Code oturumları. Her açık oturum ayrı bir
// `claude --input-format stream-json …` süreci olarak çalışır; sürdürülen oturumun kimliği komut
// satırında (`--resume=<id>`) yazar. Yeni açılan oturumlarda kimlik yoktur; onlar sürecin başlangıç
// zamanıyla eşlenir (sohbetler.ts).
import { execFile } from 'node:child_process'

export interface AcikOturum {
  /** Komut satırından okunan oturum kimliği (yeni oturumlarda yok). */
  id?: string
  /** Sürecin başlangıcı (epoch ms). */
  baslangic: number
}

const KIMLIK = /--(?:resume|session-id)[= ]"?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
const ETKILESIMLI = /--input-format[= ]"?stream-json/i // Atrium'un kendi `-p` koşuları bu kalıba uymaz

function calistir(komut: string, args: string[]): Promise<string> {
  return new Promise((coz) => {
    execFile(komut, args, { timeout: 8000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 }, (_h, stdout) => coz(String(stdout ?? '')))
  })
}

async function surecler(): Promise<{ baslangic: number; komut: string }[]> {
  if (process.platform === 'win32') {
    const json = await calistir('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      "Get-CimInstance Win32_Process -Filter \"Name='claude.exe'\" | Select-Object CommandLine,@{n='B';e={[DateTimeOffset]::new($_.CreationDate).ToUnixTimeMilliseconds()}} | ConvertTo-Json -Compress"])
    try {
      const veri = JSON.parse(json || '[]') as { CommandLine?: string; B?: number } | { CommandLine?: string; B?: number }[]
      return (Array.isArray(veri) ? veri : [veri]).map((s) => ({ komut: s.CommandLine ?? '', baslangic: Number(s.B ?? 0) }))
    } catch {
      return []
    }
  }
  const cikti = await calistir('ps', ['-axo', 'lstart=,args='])
  return cikti.split('\n').filter((s) => /claude/i.test(s)).map((s) => {
    // "Sun Oct 25 14:02:11 2026 /path/claude --input-format …" → ilk 24 karakter tarih
    const tarih = Date.parse(s.slice(0, 24).trim())
    return { komut: s.slice(24), baslangic: Number.isNaN(tarih) ? 0 : tarih }
  })
}

let onbellek: { zaman: number; liste: AcikOturum[] } = { zaman: 0, liste: [] }
let suruyor: Promise<AcikOturum[]> | null = null

/** Açık oturumlar; 15 saniyede bir yeniden okunur (süreç listesi pahalı). */
export async function acikOturumlar(): Promise<AcikOturum[]> {
  if (Date.now() - onbellek.zaman < 15_000) return onbellek.liste
  suruyor ??= surecler()
    .then((l) => l.filter((s) => ETKILESIMLI.test(s.komut)).map((s) => ({ id: s.komut.match(KIMLIK)?.[1], baslangic: s.baslangic })))
    .then((liste) => { onbellek = { zaman: Date.now(), liste }; return liste })
    .catch(() => onbellek.liste)
    .finally(() => { suruyor = null })
  return suruyor
}
