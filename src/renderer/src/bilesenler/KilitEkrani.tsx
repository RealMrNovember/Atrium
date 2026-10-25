// Sunucu erişimi kapattığında (lisans gerekli) ya da bu sürüm artık desteklenmediğinde gösterilen ekran.
import { useState, type ReactElement } from 'react'
import type { ErisimDurumu } from '@ortak/tipler'
import { useDil } from '../dil'
import { GITHUB } from '../yardimci'
import { AtriumIsareti } from './Kimlik'

export function KilitEkrani({ erisim, onDegisti }: { erisim: ErisimDurumu; onDegisti: (d: ErisimDurumu) => void }): ReactElement {
  const { t } = useDil()
  const [anahtar, setAnahtar] = useState('')
  const [bekliyor, setBekliyor] = useState(false)
  const [hata, setHata] = useState(false)
  const guncelleme = erisim.durum === 'guncelleme-gerekli'

  const etkinlestir = async (): Promise<void> => {
    setBekliyor(true)
    setHata(false)
    const sonuc = await window.sirket.lisansEtkinlestir(anahtar)
    setBekliyor(false)
    if (sonuc.basarili) onDegisti(sonuc.durum)
    else setHata(true)
  }

  return (
    <div className="kilit-ekrani">
      <div className="kilit-kart">
        <AtriumIsareti boyut={56} />
        <h1>{guncelleme ? t('lockUpdateTitle') : t('lockTitle')}</h1>
        <p>{erisim.mesaj || (guncelleme ? t('lockUpdateText', { v: erisim.enAzSurum ?? '' }) : t('lockText'))}</p>
        {guncelleme ? (
          <button className="birincil" onClick={() => void window.sirket.disBaglanti(`${GITHUB}/releases/latest`)}>{t('updateDownload')}</button>
        ) : (
          <>
            {erisim.satinAl && <button className="birincil" onClick={() => void window.sirket.disBaglanti(erisim.satinAl!)}>{t('lockBuy')}</button>}
            <div className="klasor-satir">
              <input value={anahtar} placeholder={t('lockKey')} onChange={(e) => setAnahtar(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && anahtar.trim()) void etkinlestir() }} />
              <button className="ikincil" disabled={bekliyor || !anahtar.trim()} onClick={() => void etkinlestir()}>{t('lockActivate')}</button>
            </div>
            {hata && <p className="hata-metni">{t('lockInvalid')}</p>}
          </>
        )}
        <button className="ikincil" onClick={() => void window.sirket.erisimDenetle().then(onDegisti)}>↻ {t('lockRetry')}</button>
      </div>
    </div>
  )
}
