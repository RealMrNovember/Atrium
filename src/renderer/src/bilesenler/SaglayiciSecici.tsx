// Ajanın yapay zeka aracı ve modeli: Claude Code, Codex, Gemini, Ollama ya da OpenAI uyumlu uç nokta.
import { useEffect, useState, type ReactElement } from 'react'
import { SAGLAYICILAR, type SaglayiciDurumu, type SaglayiciId } from '@ortak/tipler'
import { useDil } from '../dil'

let onbellek: { zaman: number; durumlar: SaglayiciDurumu[] } | null = null

/** Araçların durumu (15 sn önbellekli — her form açılışında CLI'ler yeniden çalıştırılmasın). */
export function useSaglayicilar(): [SaglayiciDurumu[] | null, () => void] {
  const [durumlar, setDurumlar] = useState<SaglayiciDurumu[] | null>(onbellek?.durumlar ?? null)
  const yenile = (zorla = true): void => {
    if (!zorla && onbellek && Date.now() - onbellek.zaman < 15_000) return
    void window.sirket.saglayiciDurumlari().then((d) => { onbellek = { zaman: Date.now(), durumlar: d }; setDurumlar(d) })
  }
  useEffect(() => yenile(false), [])
  return [durumlar, () => yenile(true)]
}

export const saglayiciIkonu = (id?: SaglayiciId): string => SAGLAYICILAR.find((s) => s.id === (id ?? 'claude'))?.ikon ?? '✳️'

const ONERILER: Partial<Record<SaglayiciId, string[]>> = {
  codex: ['gpt-5-codex', 'gpt-5', 'gpt-5-mini'],
  gemini: ['gemini-2.5-pro', 'gemini-2.5-flash']
}

export const varsayilanModel = (id: SaglayiciId, durum?: SaglayiciDurumu): string =>
  id === 'claude' ? 'sonnet' : id === 'ollama' || id === 'openai' ? durum?.modeller?.[0] ?? '' : ''

export function SaglayiciSecici({ saglayici, model, onDegis }: {
  saglayici?: SaglayiciId; model: string; onDegis: (saglayici: SaglayiciId, model: string) => void
}): ReactElement {
  const { t } = useDil()
  const [durumlar] = useSaglayicilar()
  const id = saglayici ?? 'claude'
  const durum = durumlar?.find((d) => d.id === id)
  const liste = id === 'ollama' || id === 'openai' ? durum?.modeller ?? [] : []

  // yerel modeli boş kalan ajana kurulu ilk modeli öner
  useEffect(() => {
    if (!model && liste.length && (id === 'ollama' || id === 'openai')) onDegis(id, liste[0])
  }, [id, liste.length])

  return (
    <div className="form-satir">
      <label>{t('fProvider')}
        <select value={id} onChange={(e) => {
          const yeni = e.target.value as SaglayiciId
          onDegis(yeni, varsayilanModel(yeni, durumlar?.find((d) => d.id === yeni)))
        }}>
          {SAGLAYICILAR.map((s) => {
            const d = durumlar?.find((x) => x.id === s.id)
            return <option key={s.id} value={s.id}>{s.ikon} {s.id === 'openai' ? t('provOpenai') : s.ad}{d ? (d.hazir ? ' ✓' : ` — ${d.kurulu ? t('stLogin') : t('stMissing')}`) : ''}</option>
          })}
        </select>
      </label>
      <label>{id === 'claude' ? t('fModel') : t('fModelFree')}
        {id === 'claude' ? (
          <select value={model} onChange={(e) => onDegis(id, e.target.value)}>
            <option value="haiku">{t('mHaiku')}</option>
            <option value="sonnet">{t('mSonnet')}</option>
            <option value="opus">{t('mOpus')}</option>
          </select>
        ) : id === 'ollama' ? (
          liste.length
            ? <select value={model} onChange={(e) => onDegis(id, e.target.value)}>
                {!liste.includes(model) && model && <option value={model}>{model}</option>}
                {liste.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            : <span className="kucuk uyari-metin">{t('noLocalModels')}</span>
        ) : (
          <>
            <input value={model} list={`modeller-${id}`} placeholder="—" onChange={(e) => onDegis(id, e.target.value.trim())} />
            <datalist id={`modeller-${id}`}>
              {[...liste, ...(ONERILER[id] ?? [])].map((m) => <option key={m} value={m} />)}
            </datalist>
          </>
        )}
      </label>
    </div>
  )
}
