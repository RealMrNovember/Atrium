// Kat olacak projeleri seçme: kök klasör, tek tıkla dahil et / çıkar, başka klasörlerden proje ekle.
import { useEffect, useState, type ReactElement } from 'react'
import type { SirketProfili } from '@ortak/tipler'
import { useDil } from '../dil'

const ad = (yol: string): string => yol.split(/[\\/]/).filter(Boolean).pop() ?? yol

/** Seçili projelerin adları: klasördekiler − hariç tutulanlar + dışarıdan eklenenler. */
export function seciliProjeler(p: SirketProfili, klasordekiler: string[]): string[] {
  const haric = new Set(p.haricTutulan)
  return [...klasordekiler.filter((k) => !haric.has(k)), ...p.ekProjeler.map(ad)].sort((a, b) => a.localeCompare(b))
}

export function useKlasordekiler(klasor: string): string[] {
  const [adlar, setAdlar] = useState<string[]>([])
  useEffect(() => {
    if (klasor) void window.sirket.katOnizle(klasor).then(setAdlar)
    else setAdlar([])
  }, [klasor])
  return adlar
}

export function ProjeSecici({ p, setP }: { p: SirketProfili; setP: (p: SirketProfili) => void }): ReactElement {
  const { t } = useDil()
  const klasordekiler = useKlasordekiler(p.projeKlasoru)
  const haric = new Set(p.haricTutulan)

  const kokSec = async (): Promise<void> => {
    const klasor = await window.sirket.klasorSec(p.projeKlasoru)
    if (klasor && klasor !== p.projeKlasoru) setP({ ...p, projeKlasoru: klasor, haricTutulan: [] })
  }
  const projeEkle = async (): Promise<void> => {
    const klasor = await window.sirket.klasorSec()
    if (!klasor) return
    const ayni = (a: string): boolean => a.toLowerCase() === klasor.toLowerCase()
    // kök klasörün kendi alt klasörüyse ayrı eklemek yerine dahil et
    const kokAlti = p.projeKlasoru && klasordekiler.find((k) => ayni(`${p.projeKlasoru}\\${k}`) || ayni(`${p.projeKlasoru}/${k}`))
    if (kokAlti) setP({ ...p, haricTutulan: p.haricTutulan.filter((h) => h !== kokAlti) })
    else if (!p.ekProjeler.some(ayni)) setP({ ...p, ekProjeler: [...p.ekProjeler, klasor] })
  }
  const degistir = (k: string): void =>
    setP({ ...p, haricTutulan: haric.has(k) ? p.haricTutulan.filter((h) => h !== k) : [...p.haricTutulan, k] })
  const kaldir = (yol: string): void => setP({ ...p, ekProjeler: p.ekProjeler.filter((e) => e !== yol) })

  return (
    <div className="proje-secici">
      <div className="klasor-satir">
        <input readOnly value={p.projeKlasoru} placeholder={t('wzNoFolder')} onClick={() => void kokSec()} />
        <button className="ikincil" onClick={() => void kokSec()}>{t('choose')}</button>
      </div>
      <div className="secici-ust">
        <b className="iyi-metin">{t('projectsSelected', { n: seciliProjeler(p, klasordekiler).length })}</b>
        {p.haricTutulan.length > 0 && <span className="kucuk">{t('excludedHint')}</span>}
      </div>
      <div className="kat-onizleme">
        {klasordekiler.map((k) => (
          <button key={k} type="button" className={haric.has(k) ? 'proje-cip haric' : 'proje-cip'} onClick={() => degistir(k)} title={k}>
            <span className="tik">{haric.has(k) ? '○' : '✓'}</span> {k}
          </button>
        ))}
        {p.ekProjeler.map((yol) => (
          <span key={yol} className="proje-cip harici" title={yol}>
            <span className="tik">✓</span> {ad(yol)} <small>{t('externalProject')}</small>
            <button type="button" className="cip-kaldir" onClick={() => kaldir(yol)} aria-label={t('remove')}>×</button>
          </span>
        ))}
      </div>
      <button type="button" className="ikincil" onClick={() => void projeEkle()}>{t('addProject')}</button>
    </div>
  )
}
