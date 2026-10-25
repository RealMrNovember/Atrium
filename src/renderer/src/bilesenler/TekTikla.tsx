// Tek tıkla bağlanma düğmesi: gerekirse aracı kurar, sonra tarayıcıda giriş akışını açar.
import { useEffect, useState, type ReactElement } from 'react'
import type { Indirme, SaglayiciId } from '@ortak/tipler'
import type { Anahtar } from '@ortak/i18n'
import { useDil } from '../dil'

const ETIKET: Partial<Record<SaglayiciId, Anahtar>> = { claude: 'connectClaude', codex: 'connectChatGPT', gemini: 'connectGoogle' }

export function TekTiklaDugmesi({ id, onBitti }: { id: SaglayiciId; onBitti: () => void }): ReactElement {
  const { t } = useDil()
  const [durum, setDurum] = useState<Indirme | undefined>()
  useEffect(() => window.sirket.indirmeDinle((d) => {
    const i = d[`cli-${id}`]
    setDurum(i)
    if (i?.durum === 'bitti') onBitti()
  }), [id])
  const calisiyor = durum?.durum === 'kuruluyor' || durum?.durum === 'iniyor'
  return (
    <span className="tek-tikla">
      <button className="birincil mini-buyuk" disabled={calisiyor} onClick={() => void window.sirket.tekTiklaBagla(id)}>
        {calisiyor ? (durum?.durum === 'kuruluyor' ? t('connectInstalling') : t('connectWaiting')) : `⚡ ${t(ETIKET[id] ?? 'aiLogin')}`}
      </button>
      {durum?.durum === 'hata' && <span className="kucuk hata-yazi">{durum.mesaj === 'npm' ? t('connectNeedNode') : durum.mesaj === 'login' ? t('connectLoginTimeout') : t('connectFailed', { e: durum.mesaj ?? '' })}</span>}
    </span>
  )
}
