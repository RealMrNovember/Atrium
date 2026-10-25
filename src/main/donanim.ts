// Yerel yapay zeka için donanım ölçümü: işlemci, bellek, disk ve ekran kartı belleği (VRAM).
import { execFile } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statfsSync } from 'node:fs'
import { arch, cpus, freemem, homedir, platform, release, totalmem } from 'node:os'
import { join } from 'node:path'
import type { Donanim } from '@ortak/tipler'

const GB = 1024 ** 3
const yuvarla = (n: number): number => Math.round(n * 10) / 10

function komut(dosya: string, args: string[], zamanMs = 8000): Promise<string> {
  return new Promise((coz) => {
    execFile(dosya, args, { timeout: zamanMs, windowsHide: true }, (hata, stdout) => coz(hata ? '' : String(stdout)))
  })
}

async function nvidia(): Promise<{ ad: string; vramGb?: number }[]> {
  const cikti = await komut('nvidia-smi', ['--query-gpu=name,memory.total', '--format=csv,noheader,nounits'])
  return cikti.split('\n').map((s) => s.trim()).filter(Boolean).map((s) => {
    const [ad, mb] = s.split(',').map((x) => x.trim())
    return { ad, vramGb: Number(mb) ? yuvarla(Number(mb) / 1024) : undefined }
  })
}

async function windowsGpu(): Promise<{ ad: string; vramGb?: number }[]> {
  // Win32_VideoController.AdapterRAM 4 GB'ta takılır; kayıt defterindeki 64 bit değer doğrudur
  const ps = "Get-ItemProperty 'HKLM:\\SYSTEM\\ControlSet001\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0*' -ErrorAction SilentlyContinue | " +
    "Where-Object { $_.DriverDesc } | ForEach-Object { [pscustomobject]@{ ad = $_.DriverDesc; v = $_.'HardwareInformation.qwMemorySize' } } | ConvertTo-Json -Compress"
  const cikti = await komut('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], 12000)
  try {
    const veri = JSON.parse(cikti || '[]') as { ad: string; v?: number } | { ad: string; v?: number }[]
    return (Array.isArray(veri) ? veri : [veri])
      .filter((g) => g.ad && !/basic display|remote|virtual|parsec|meta/i.test(g.ad))
      .map((g) => ({ ad: g.ad, vramGb: typeof g.v === 'number' && g.v > 0 ? yuvarla(g.v / GB) : undefined }))
  } catch {
    return []
  }
}

function linuxAmd(): { ad: string; vramGb?: number }[] {
  const sonuc: { ad: string; vramGb?: number }[] = []
  try {
    for (const kart of readdirSync('/sys/class/drm').filter((k) => /^card\d+$/.test(k))) {
      const dosya = join('/sys/class/drm', kart, 'device', 'mem_info_vram_total')
      if (!existsSync(dosya)) continue
      const bayt = Number(readFileSync(dosya, 'utf-8').trim())
      if (bayt > 0) sonuc.push({ ad: 'AMD Radeon', vramGb: yuvarla(bayt / GB) })
    }
  } catch { /* yoksa boş */ }
  return sonuc
}

export async function donanimOku(): Promise<Donanim> {
  const islemci = cpus()
  const apple = platform() === 'darwin' && arch() === 'arm64'
  let gpular: { ad: string; vramGb?: number }[] = await nvidia()
  if (!gpular.length) {
    if (platform() === 'win32') gpular = await windowsGpu()
    else if (platform() === 'linux') gpular = linuxAmd()
    else if (apple) gpular = [{ ad: `${islemci[0]?.model ?? 'Apple Silicon'} GPU` }]
  }
  let diskBosGb: number | undefined
  try {
    const d = statfsSync(homedir())
    diskBosGb = yuvarla((d.bavail * d.bsize) / GB)
  } catch { /* ölçülemedi */ }
  return {
    isletim: `${platform()} ${release()}`,
    mimari: arch(),
    islemci: (islemci[0]?.model ?? '').replace(/\s+/g, ' ').trim(),
    cekirdek: islemci.length,
    ramGb: yuvarla(totalmem() / GB),
    bosRamGb: yuvarla(freemem() / GB),
    diskBosGb,
    gpular,
    birlesikBellek: apple
  }
}
