import type { ReactElement } from 'react'
import type { CanliDurum, Kat } from '@ortak/tipler'
import { SohbetListesi } from '../bilesenler/SohbetListesi'
import { useDil } from '../dil'

export function SohbetlerSayfasi({ katlar, canli, onKatSec }: { katlar: Kat[]; canli: CanliDurum; onKatSec: (id: string, sohbet?: string) => void }): ReactElement {
  const { t } = useDil()
  return (
    <div className="sohbetler-sayfasi">
      <h2>{t('allChats')}</h2>
      <SohbetListesi aciklama={t('chatsPageHint')} katlar={katlar} canli={canli} onKatSec={onKatSec} />
    </div>
  )
}
