// Katın zamanlanmış işleri: durum turu, hafıza güncellemesi ya da komut — seçilen günlerde, seçilen saatte.
import { useEffect, useState, type ReactElement } from 'react'
import type { Zamanlama } from '@ortak/tipler'
import type { Anahtar } from '@ortak/i18n'
import { useDil } from '../dil'

const TUR_ANAHTARI: Record<Zamanlama['tur'], Anahtar> = { tur: 'schedTour', hafiza: 'schedMemory', komut: 'schedCommand' }
const HAFTA = [1, 2, 3, 4, 5, 6, 0]

export function ZamanlamaPaneli({ katId }: { katId: string }): ReactElement {
  const { t, dil } = useDil()
  const [liste, setListe] = useState<Zamanlama[]>([])
  const bos = (): Zamanlama => ({ id: '', katId, tur: 'tur', saat: '09:00', gunler: [1, 2, 3, 4, 5], acik: true })
  const [f, setF] = useState<Zamanlama>(bos())
  const yenile = (): void => { void window.sirket.zamanlamalar(katId).then(setListe) }
  useEffect(yenile, [katId])

  const gunAdi = (g: number): string => new Date(2024, 0, 7 + g).toLocaleDateString(dil, { weekday: 'short' })
  const kaydet = async (z: Zamanlama): Promise<void> => { await window.sirket.zamanlamaKaydet(z); yenile() }
  const gunMetni = (z: Zamanlama): string => z.gunler.length === 7 ? t('schedEveryDay') : HAFTA.filter((g) => z.gunler.includes(g)).map(gunAdi).join(' · ')

  return (
    <div className="zamanlama-paneli">
      <p className="kucuk">{t('schedHint')}</p>
      {liste.length > 0 && (
        <ul className="zamanlama-listesi">
          {liste.map((z) => (
            <li key={z.id} className={z.acik ? '' : 'kapali'}>
              <label className="onay"><input type="checkbox" checked={z.acik} onChange={(e) => void kaydet({ ...z, acik: e.target.checked })} /></label>
              <div>
                <b>⏰ {z.saat} · {t(TUR_ANAHTARI[z.tur])}</b>
                <div className="kucuk">{gunMetni(z)}{z.tur === 'komut' && z.metin ? ` · “${z.metin.slice(0, 60)}”` : ''}</div>
                {z.sonCalisma && <div className="kucuk">{t('schedLastRun', { when: new Date(z.sonCalisma).toLocaleString(dil, { dateStyle: 'short', timeStyle: 'short' }) })}{z.sonHata ? ` · ⚠️ ${z.sonHata}` : ''}</div>}
              </div>
              <button className="ikincil mini-buyuk" onClick={() => void window.sirket.zamanlamaSil(z.id).then(setListe)}>✕</button>
            </li>
          ))}
        </ul>
      )}
      <div className="form zamanlama-formu">
        <b>＋ {t('schedNew')}</b>
        <div className="secenekler">
          {(Object.keys(TUR_ANAHTARI) as Zamanlama['tur'][]).map((tur) => (
            <button key={tur} className={f.tur === tur ? 'cip secili' : 'cip'} onClick={() => setF({ ...f, tur })}>{t(TUR_ANAHTARI[tur])}</button>
          ))}
        </div>
        {f.tur === 'komut' && <label>{t('schedCommandText')}<textarea rows={3} value={f.metin ?? ''} onChange={(e) => setF({ ...f, metin: e.target.value })} /></label>}
        <div className="form-satir">
          <label>{t('schedTime')}<input type="time" value={f.saat} onChange={(e) => setF({ ...f, saat: e.target.value })} /></label>
        </div>
        <div className="secenekler">
          {HAFTA.map((g) => (
            <button key={g} className={f.gunler.includes(g) ? 'cip secili' : 'cip'}
              onClick={() => setF({ ...f, gunler: f.gunler.includes(g) ? f.gunler.filter((x) => x !== g) : [...f.gunler, g] })}>{gunAdi(g)}</button>
          ))}
        </div>
        <div className="form-dugmeler">
          <span className="kucuk">{t('schedNote')}</span>
          <button className="birincil" disabled={!f.gunler.length || (f.tur === 'komut' && !f.metin?.trim())}
            onClick={() => void kaydet(f).then(() => setF(bos()))}>{t('schedAdd')}</button>
        </div>
      </div>
    </div>
  )
}
