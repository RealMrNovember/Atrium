// Profil & Ayarlar → Yapay zeka araçları: her aracın durumu, girişi, adresi ve anahtarı; varsayılan araç.
import { useState, type ReactElement } from 'react'
import { SAGLAYICILAR, type SaglayiciAyari, type SaglayiciDurumu, type SaglayiciId, type SirketProfili } from '@ortak/tipler'
import { useDil } from '../dil'
import { useSaglayicilar, varsayilanModel } from './SaglayiciSecici'
import { TekTiklaDugmesi } from './TekTikla'

const KURULUM: Partial<Record<SaglayiciId, { komut: string; adres: string }>> = {
  codex: { komut: 'npm i -g @openai/codex', adres: 'https://github.com/openai/codex' },
  gemini: { komut: 'npm i -g @google/gemini-cli', adres: 'https://github.com/google-gemini/gemini-cli' }
}

export function AracAyarlari({ p, setP, onYerelYz }: {
  p: SirketProfili; setP: (p: SirketProfili) => void; onYerelYz?: () => void
}): ReactElement {
  const { t } = useDil()
  const [durumlar, yenile] = useSaglayicilar()
  const [anahtarlar, setAnahtarlar] = useState<Partial<Record<SaglayiciId, string>>>({})
  const ayar = (id: SaglayiciId): SaglayiciAyari => p.ayarlar.saglayicilar?.[id] ?? {}
  const ayarla = (id: SaglayiciId, yama: SaglayiciAyari): void =>
    setP({ ...p, ayarlar: { ...p.ayarlar, saglayicilar: { ...p.ayarlar.saglayicilar, [id]: { ...ayar(id), ...yama } } } })

  const rozet = (d?: SaglayiciDurumu): ReactElement => {
    if (!d) return <span className="etiket">…</span>
    if (d.hazir) return <span className="etiket iyi">{t('stReady')}{d.surum ? ` · ${d.surum}` : ''}</span>
    if (d.id === 'openai' && !d.kurulu) return <span className="etiket">{t('stNoUrl')}</span>
    if (d.id === 'ollama' && d.kurulu) return <span className="etiket uyari">{t('stStopped')}</span>
    return <span className={d.kurulu ? 'etiket uyari' : 'etiket'}>{d.kurulu ? t('stLogin') : t('stMissing')}</span>
  }

  const anahtarAlani = (id: SaglayiciId, d?: SaglayiciDurumu): ReactElement => (
    <div className="klasor-satir">
      <input type="password" autoComplete="off" placeholder={d?.anahtar ? t('aiKeySaved') : t('aiKey')}
        value={anahtarlar[id] ?? ''} onChange={(e) => setAnahtarlar({ ...anahtarlar, [id]: e.target.value })} />
      <button className="ikincil" disabled={!anahtarlar[id]?.trim()} onClick={() => void window.sirket.saglayiciAnahtari(id, anahtarlar[id] ?? '')
        .then(() => { setAnahtarlar({ ...anahtarlar, [id]: '' }); yenile() })}>{t('aiKeySave')}</button>
      {d?.anahtar && <button className="ikincil" onClick={() => void window.sirket.saglayiciAnahtari(id, null).then(yenile)}>{t('aiKeyRemove')}</button>}
    </div>
  )

  return (
    <div className="arac-ayarlari">
      <p className="kucuk">{t('aiHint')}</p>
      <label>{t('aiDefault')}
        <select value={p.ayarlar.varsayilanSaglayici ?? 'claude'}
          onChange={(e) => setP({ ...p, ayarlar: { ...p.ayarlar, varsayilanSaglayici: e.target.value as SaglayiciId } })}>
          {SAGLAYICILAR.map((s) => <option key={s.id} value={s.id}>{s.ikon} {s.id === 'openai' ? t('provOpenai') : s.ad}</option>)}
        </select>
      </label>
      {SAGLAYICILAR.filter((s) => s.id !== 'claude').map((s) => {
        const d = durumlar?.find((x) => x.id === s.id)
        const kurulum = KURULUM[s.id]
        return (
          <div key={s.id} className="arac-satir">
            <div className="arac-baslik">
              <b>{s.ikon} {s.id === 'openai' ? t('provOpenai') : s.ad}</b> {rozet(d)}
              {d?.yontem && <span className="kucuk">· {d.yontem}</span>}
              {d?.modeller && <span className="kucuk">· {t('aiModels', { n: d.modeller.length })}</span>}
              <span />
              {(s.id === 'codex' || s.id === 'gemini') && d && !d.hazir && <TekTiklaDugmesi id={s.id} onBitti={yenile} />}
              {s.id === 'ollama' && onYerelYz && <button className="ikincil mini-buyuk" onClick={onYerelYz}>🦙 {t('aiOpenLocal')}</button>}
              {s.id === 'ollama' && d && !d.kurulu && <button className="birincil mini-buyuk" onClick={() => { void window.sirket.ollamaKur(); onYerelYz?.() }}>⚡ {t('engInstall')}</button>}
              {s.id === 'ollama' && d?.kurulu && !d.hazir && <button className="ikincil mini-buyuk" onClick={() => void window.sirket.ollamaBaslat().then(yenile)}>▶ {t('aiStart')}</button>}
            </div>
            {kurulum && d && !d.kurulu && (
              <p className="kucuk">{t('connectExplain')} <a href="#" onClick={(e) => { e.preventDefault(); void window.sirket.disBaglanti(kurulum.adres) }}>GitHub ↗</a></p>
            )}
            {s.id === 'gemini' && d?.kurulu && anahtarAlani('gemini', d)}
            {s.id === 'ollama' && (
              <label className="kucuk">{t('aiUrl')}
                <input value={ayar('ollama').url ?? ''} placeholder="http://127.0.0.1:11434" onChange={(e) => ayarla('ollama', { url: e.target.value.trim() })} />
              </label>
            )}
            {s.id === 'openai' && (
              <>
                <label className="kucuk">{t('aiUrl')}
                  <input value={ayar('openai').url ?? ''} placeholder="http://localhost:1234/v1" onChange={(e) => ayarla('openai', { url: e.target.value.trim() })} />
                </label>
                <span className="kucuk">{t('aiUrlHint')}</span>
                {anahtarAlani('openai', d)}
              </>
            )}
            {(s.id === 'codex' || s.id === 'gemini') && (
              <details className="kucuk">
                <summary>{t('aiPath')}</summary>
                <input value={ayar(s.id).yol ?? ''} placeholder={t('auto')} onChange={(e) => ayarla(s.id, { yol: e.target.value.trim() })} />
              </details>
            )}
          </div>
        )
      })}
      <div className="form-dugmeler">
        <button className="ikincil" onClick={yenile}>↻ {t('aiRefresh')}</button>
        <span />
        {p.kurulumTamam && (
          <button className="ikincil" title={t('aiMoveTeamHint')} onClick={() => {
            const id = p.ayarlar.varsayilanSaglayici ?? 'claude'
            const model = varsayilanModel(id, durumlar?.find((d) => d.id === id))
            if (id !== 'claude' && (id === 'ollama' || id === 'openai') && !model) { alert(t('noLocalModels')); return }
            if (confirm(t('aiMoveTeamConfirm'))) void window.sirket.ekibiGecir(id, model).then((n) => alert(t('aiMovedTeam', { n })))
          }}>⇄ {t('aiMoveTeam')}</button>
        )}
      </div>
      <ul className="guvence"><li>{t('aiNoCost')}</li><li>{t('aiSecretNote')}</li></ul>
    </div>
  )
}
