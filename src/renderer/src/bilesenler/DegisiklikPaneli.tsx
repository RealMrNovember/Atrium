// Değişiklik önizlemesi: ajanların önerdiği dosya değişiklikleri, satır satır fark, uygula / vazgeç / geri al.
import { useState, type ReactElement } from 'react'
import type { Komut } from '@ortak/tipler'
import { useDil } from '../dil'
import { hataMetni } from '../yardimci'

const TUR_IKONU = { eklendi: '＋', degisti: '✎', silindi: '－' } as const

export function DegisiklikPaneli({ katId, komut: ilk }: { katId: string; komut: Komut }): ReactElement | null {
  const { t } = useDil()
  // işlemlerden dönen güncel komut (kat ayrıntısı yenilenmeden de doğru durumu göster)
  const [guncel, setGuncel] = useState<Komut | null>(null)
  const komut = guncel?.id === ilk.id ? guncel : ilk
  const d = komut.degisiklik
  const [secili, setSecili] = useState<Set<string>>(() => new Set(d?.dosyalar.map((x) => x.yol)))
  const [acik, setAcik] = useState<string | null>(null)
  const [fark, setFark] = useState<Record<string, string>>({})
  const [bekliyor, setBekliyor] = useState(false)
  const [hata, setHata] = useState('')
  if (!d) return null

  const islem = async (is: () => Promise<Komut>): Promise<void> => {
    setBekliyor(true); setHata('')
    try { setGuncel(await is()) } catch (e) { setHata(hataMetni(e)) } finally { setBekliyor(false) }
  }
  const farkAc = (yol: string): void => {
    setAcik(acik === yol ? null : yol)
    if (fark[yol] === undefined) void window.sirket.degisiklikFarki(katId, komut.id, yol).then((f) => setFark((o) => ({ ...o, [yol]: f })))
  }

  if (d.durum === 'dogrudan') return <p className="kucuk uyari-metin">⚠️ {t('previewSkipped', { why: d.neden ?? '' })}</p>
  if (!d.dosyalar.length) return <p className="kucuk">✓ {t('previewNoChanges')}</p>

  return (
    <div className={`degisiklik-paneli ${d.durum}`}>
      <div className="degisiklik-ust">
        <b>🧾 {t('previewTitle')}</b>
        <span className="kucuk">{t('previewSummary', { n: d.dosyalar.length })} · <span className="ekle-renk">+{d.eklenen}</span> <span className="sil-renk">−{d.silinen}</span></span>
        <span />
        {d.durum === 'bekliyor' && <span className="etiket uyari">{t('previewPending')}</span>}
        {d.durum === 'uygulandi' && <span className="etiket iyi">✓ {t('previewApplied', { n: d.uygulanan?.length ?? 0 })}</span>}
        {d.durum === 'vazgecildi' && <span className="etiket">{t('previewDiscarded')}</span>}
        {d.durum === 'geri-alindi' && <span className="etiket">↩ {t('previewReverted')}</span>}
      </div>
      {d.durum === 'bekliyor' && <p className="kucuk">{t('previewHint')}</p>}
      <ul className="degisen-dosyalar">
        {d.dosyalar.map((f) => (
          <li key={f.yol}>
            <div className="degisen-satir">
              {d.durum === 'bekliyor' && (
                <input type="checkbox" checked={secili.has(f.yol)} onChange={(e) => {
                  const s = new Set(secili)
                  if (e.target.checked) s.add(f.yol); else s.delete(f.yol)
                  setSecili(s)
                }} />
              )}
              <span className={`degisen-tur ${f.tur}`} title={t(f.tur === 'eklendi' ? 'fileAdded' : f.tur === 'silindi' ? 'fileDeleted' : 'fileChanged')}>{TUR_IKONU[f.tur]}</span>
              <button className="degisen-ad" onClick={() => farkAc(f.yol)}>{f.yol}</button>
              {f.ikili ? <span className="kucuk">{t('fileBinary')}</span> : <span className="kucuk"><span className="ekle-renk">+{f.eklenen}</span> <span className="sil-renk">−{f.silinen}</span></span>}
              {d.cakisan?.includes(f.yol) && <span className="etiket uyari" title={t('previewConflictHint')}>⚠️ {t('previewConflict')}</span>}
            </div>
            {acik === f.yol && (
              <pre className="fark">
                {fark[f.yol] === undefined ? '…' : fark[f.yol] === '' ? t('fileBinary') : fark[f.yol].split('\n')
                  .filter((s) => !/^(={3,}|--- |\+\+\+ )/.test(s)).map((s, i) => (
                    <div key={i} className={s.startsWith('+') ? 'f-ekle' : s.startsWith('-') ? 'f-sil' : s.startsWith('@@') ? 'f-baslik' : ''}>{s || ' '}</div>
                  ))}
              </pre>
            )}
          </li>
        ))}
      </ul>
      {d.durum === 'bekliyor' && (
        <div className="form-dugmeler">
          <button className="ikincil" disabled={bekliyor} onClick={() => void islem(() => window.sirket.degisiklikVazgec(katId, komut.id))}>✕ {t('previewDiscard')}</button>
          <span />
          {secili.size < d.dosyalar.length && secili.size > 0 && (
            <button className="ikincil" disabled={bekliyor} onClick={() => void islem(() => window.sirket.degisiklikUygula(katId, komut.id, [...secili]))}>{t('previewApplySelected', { n: secili.size })}</button>
          )}
          <button className="birincil" disabled={bekliyor || !secili.size} onClick={() => void islem(() => window.sirket.degisiklikUygula(katId, komut.id, secili.size === d.dosyalar.length ? undefined : [...secili]))}>✓ {t('previewApply')}</button>
        </div>
      )}
      {d.durum === 'uygulandi' && (
        <div className="form-dugmeler">
          {d.cakisan?.length ? <span className="kucuk uyari-metin">{t('previewConflicts', { n: d.cakisan.length })}</span> : <span />}
          <button className="ikincil" disabled={bekliyor} onClick={() => void islem(() => window.sirket.degisiklikGeriAl(katId, komut.id))}>↩ {t('previewRevert')}</button>
        </div>
      )}
      {hata && <p className="hata-metni">{hata}</p>}
    </div>
  )
}
