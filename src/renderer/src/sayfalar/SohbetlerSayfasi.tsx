import type { ReactElement } from 'react'
import type { Kat } from '@ortak/tipler'
import { SohbetListesi } from '../bilesenler/SohbetListesi'
import { useDil } from '../dil'

export function SohbetlerSayfasi({ katlar, onKatSec }: { katlar: Kat[]; onKatSec: (id: string) => void }): ReactElement {
  const { t } = useDil()
  return (
    <div className="sohbetler-sayfasi">
      <h2>{t('allChats')}</h2>
      <SohbetListesi aciklama={t('chatsPageHint')} katlar={katlar} onKatSec={onKatSec} />
    </div>
  )
}
