// Yerel YZ: donanımı ölçer, Ollama'yı uygulamanın içinden kurar, uygun modelleri indirir, dener ve öğretir.
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import type { Donanim, Indirme } from '@ortak/tipler'
import { KATALOG, gerekenBellek, oneriler, sinirlar, uygunluk, type ModelTuru, type Uygunluk } from '@ortak/yerel/katalog'
import { yerelMetinler } from '@ortak/yerel/metinler'
import { useSaglayicilar } from '../bilesenler/SaglayiciSecici'
import { useDil } from '../dil'

const TURLER: { id: ModelTuru | 'hepsi'; anahtar: 'catAll' | 'catGeneral' | 'catCode' | 'catReason' | 'catVision' | 'catUncensored' | 'catEmbed' }[] = [
  { id: 'hepsi', anahtar: 'catAll' }, { id: 'genel', anahtar: 'catGeneral' }, { id: 'kod', anahtar: 'catCode' },
  { id: 'akil', anahtar: 'catReason' }, { id: 'gorsel', anahtar: 'catVision' }, { id: 'sansursuz', anahtar: 'catUncensored' },
  { id: 'gomme', anahtar: 'catEmbed' }
]
const UYGUNLUK: Record<Uygunluk, { anahtar: 'fitFast' | 'fitSlow' | 'fitNo' | 'fitDisk'; sinif: string; ikon: string }> = {
  hizli: { anahtar: 'fitFast', sinif: 'iyi', ikon: '🟢' },
  yavas: { anahtar: 'fitSlow', sinif: 'uyari', ikon: '🟡' },
  sigmaz: { anahtar: 'fitNo', sinif: 'kotu', ikon: '🔴' },
  disk: { anahtar: 'fitDisk', sinif: 'kotu', ikon: '💾' }
}

/** Ollama adları "qwen3:8b" ya da "qwen3:latest" gibi gelir; katalog adıyla eşleştir. */
const kurulu = (liste: string[], id: string): boolean =>
  liste.some((m) => m === id || m === `${id}:latest` || (!id.includes(':') && m.startsWith(`${id}:`)))

export function YerelYzSayfasi(): ReactElement {
  const { t, dil } = useDil()
  const metin = yerelMetinler(dil)
  const [donanim, setDonanim] = useState<Donanim | null>(null)
  const [durumlar, yenile] = useSaglayicilar()
  const [indirmeler, setIndirmeler] = useState<Record<string, Indirme>>({})
  const [tur, setTur] = useState<ModelTuru | 'hepsi'>('hepsi')
  const [yalnizUyan, setYalnizUyan] = useState(true)
  const [denenen, setDenenen] = useState<string>('')
  const [kopyalanan, setKopyalanan] = useState('')
  const ollama = durumlar?.find((d) => d.id === 'ollama')
  const modeller = ollama?.modeller ?? []

  useEffect(() => { void window.sirket.donanim().then(setDonanim) }, [])
  useEffect(() => window.sirket.indirmeDinle((d) => {
    setIndirmeler(d)
    // kurulum ya da model indirmesi bitince listeyi tazele
    if (Object.values(d).some((i) => i.durum === 'bitti')) yenile()
  }), [])
  useEffect(() => { if (!denenen && modeller.length) setDenenen(modeller[0]) }, [modeller.length])

  const oneri = useMemo(() => (donanim ? oneriler(donanim) : new Set<string>()), [donanim])
  const sinir = donanim ? sinirlar(donanim) : null
  const ollamaKurulum = indirmeler.ollama
  const kuruluyor = ollamaKurulum?.durum === 'iniyor' || ollamaKurulum?.durum === 'kuruluyor'

  const gorunen = KATALOG.filter((m) => (tur === 'hepsi' || m.tur === tur) &&
    (!yalnizUyan || !donanim || ['hizli', 'yavas'].includes(uygunluk(m, donanim)) || kurulu(modeller, m.id)))

  const kopyala = (komut: string): void => {
    void navigator.clipboard.writeText(komut)
    setKopyalanan(komut)
    setTimeout(() => setKopyalanan(''), 1500)
  }

  return (
    <div className="yerel-sayfasi">
      <section className="kart yerel-giris">
        <h2>🦙 {t('locTitle')}</h2>
        <p>{t('locIntro')}</p>
      </section>

      <div className="yerel-ust">
        <section className="kart">
          <h2>💻 {t('hwTitle')}</h2>
          {!donanim ? <p className="kucuk">{t('hwMeasuring')}</p> : (
            <>
              <dl className="donanim">
                <dt>{t('hwCpu')}</dt><dd>{donanim.islemci} <span className="kucuk">· {t('hwCores', { n: donanim.cekirdek })}</span></dd>
                <dt>{t('hwRam')}</dt><dd>{donanim.ramGb} GB {donanim.birlesikBellek && <span className="kucuk">· {t('hwUnified')}</span>}</dd>
                <dt>{t('hwGpu')}</dt><dd>
                  {donanim.gpular.length
                    ? donanim.gpular.map((g, i) => <div key={i}>{g.ad}{g.vramGb ? <span className="kucuk"> · {g.vramGb} GB VRAM</span> : ''}</div>)
                    : '—'}
                  {!donanim.birlesikBellek && !donanim.gpular.some((g) => (g.vramGb ?? 0) >= 2) && <div className="kucuk">{t('hwNoGpu')}</div>}
                </dd>
                {donanim.diskBosGb !== undefined && <><dt>{t('hwDisk')}</dt><dd>{donanim.diskBosGb} GB</dd></>}
              </dl>
              {sinir && (sinir.hizli >= 7 || sinir.yavas >= 7
                ? <p className="yerel-karar">✅ {t('hwVerdict', { fast: sinir.hizli || '—', slow: sinir.yavas })}</p>
                : <p className="yerel-karar">ℹ️ {t('hwVerdictTiny')}</p>)}
            </>
          )}
        </section>

        <section className="kart">
          <h2>⚙️ {t('engTitle')}</h2>
          {!ollama ? <p className="kucuk">…</p>
            : ollama.hazir ? <p><span className="etiket iyi">● {t('engReady', { v: ollama.surum ?? '' })}</span></p>
            : kuruluyor ? (
              <div className="yerel-ilerleme">
                <div className="cubuk"><span style={{ width: `${ollamaKurulum.yuzde}%` }} /></div>
                <span className="kucuk">{ollamaKurulum.durum === 'kuruluyor' ? t('engInstalling') : t('engDownloading', { msg: ollamaKurulum.mesaj ?? `${ollamaKurulum.yuzde}%` })}</span>
                <button className="ikincil mini-buyuk" onClick={() => void window.sirket.indirmeIptal('ollama')}>{t('cancel')}</button>
              </div>
            ) : ollama.kurulu ? (
              <>
                <p>{t('engStopped')}</p>
                <button className="birincil" onClick={() => void window.sirket.ollamaBaslat().then(yenile)}>▶ {t('aiStart')}</button>
              </>
            ) : (
              <>
                <p>{t('engMissing')}</p>
                <button className="birincil" onClick={() => void window.sirket.ollamaKur()}>⬇ {t('engInstall')}</button>
                <p className="kucuk"><a href="#" onClick={(e) => { e.preventDefault(); void window.sirket.disBaglanti('https://ollama.com/download') }}>{t('engManual')} ↗</a></p>
              </>
            )}
          {ollamaKurulum?.durum === 'hata' && <p className="hata-metni">{t('engError', { e: ollamaKurulum.mesaj ?? '' })}</p>}

          {ollama?.hazir && (
            <>
              <h3>{t('myModels')}</h3>
              {!modeller.length ? <p className="kucuk">{t('noModelsYet')}</p> : (
                <ul className="kurulu-modeller">
                  {modeller.map((m) => (
                    <li key={m}>
                      <b>{m}</b>
                      <span />
                      <button className="ikincil mini-buyuk" onClick={() => setDenenen(m)}>💬 {t('mdTry')}</button>
                      <button className="ikincil mini-buyuk" onClick={() => {
                        if (confirm(t('mdDeleteConfirm', { m }))) void window.sirket.modelSil(m).then(yenile)
                      }}>🗑 {t('mdDelete')}</button>
                    </li>
                  ))}
                </ul>
              )}
              {modeller.length > 0 && <p className="kucuk">💡 {t('mdUseHow', { m: denenen || modeller[0] })}</p>}
            </>
          )}
        </section>
      </div>

      {ollama?.hazir && modeller.length > 0 && <DenemeSohbeti modeller={modeller} model={denenen} setModel={setDenenen} />}

      <section className="kart">
        <div className="yerel-katalog-ust">
          <h2>📚 {t('catTitle')}</h2>
          <div className="secenekler">
            {TURLER.map((x) => <button key={x.id} className={tur === x.id ? 'cip secili' : 'cip'} onClick={() => setTur(x.id)}>{t(x.anahtar)}</button>)}
          </div>
          <label className="onay kucuk">
            <input type="checkbox" checked={yalnizUyan} onChange={(e) => setYalnizUyan(e.target.checked)} />
            <span>{t('mdOnlyFits')}</span>
          </label>
        </div>
        {tur === 'sansursuz' && <p className="yerel-uyari">⚠️ {t('uncensoredNote')}</p>}
        <div className="model-kartlari">
          {gorunen.map((m) => {
            const u = donanim ? uygunluk(m, donanim) : null
            const ind = indirmeler[m.id]
            const iniyor = ind?.durum === 'iniyor'
            const var_ = kurulu(modeller, m.id)
            return (
              <div key={m.id} className={`model-karti ${u ?? ''}`}>
                <div className="model-ust">
                  <b>{m.aile}</b>
                  <span className="kucuk">{m.parametre >= 1 ? `${m.parametre}B` : `${Math.round(m.parametre * 1000)}M`} · {m.boyutGb} GB</span>
                  {oneri.has(m.id) && <span className="etiket oneri">⭐ {t('mdRecommended')}</span>}
                </div>
                <p>{metin.modeller[m.id] ?? ''}</p>
                <div className="model-etiketler">
                  {u && <span className={`etiket ${UYGUNLUK[u].sinif}`}>{UYGUNLUK[u].ikon} {t(UYGUNLUK[u].anahtar)}</span>}
                  {m.tur !== 'gomme' && (
                    <span className="etiket" title={m.arac ? t('agentCapableHint') : t('agentNoHint')}>{m.arac ? `🤖 ${t('agentCapable')}` : `💬 ${t('agentNo')}`}</span>
                  )}
                  {m.gorsel && <span className="etiket">🖼️</span>}
                  {m.tur === 'sansursuz' && <span className="etiket uyari" title={t('uncensoredNote')}>🔓 {t('catUncensored')}</span>}
                  <span className="kucuk">{t('mdNeeds', { gb: gerekenBellek(m) })}</span>
                </div>
                <div className="model-alt">
                  <code onClick={() => kopyala(`ollama pull ${m.id}`)} title={t('mdCopy')}>
                    {kopyalanan === `ollama pull ${m.id}` ? `✓ ${t('mdCopied')}` : `ollama pull ${m.id}`}
                  </code>
                  <span />
                  {var_ ? <span className="etiket iyi">✓ {t('mdInstalled')}</span>
                    : iniyor ? (
                      <div className="model-indirme">
                        <div className="cubuk"><span style={{ width: `${ind.yuzde}%` }} /></div>
                        <span className="kucuk">{t('mdDownloading', { n: ind.yuzde })}</span>
                        <button className="ikincil mini-buyuk" onClick={() => void window.sirket.indirmeIptal(m.id)}>✕</button>
                      </div>
                    )
                    : <button className="birincil mini-buyuk" disabled={!ollama?.hazir || u === 'sigmaz' || u === 'disk'}
                        title={!ollama?.hazir ? t('needEngine') : undefined}
                        onClick={() => void window.sirket.modelIndir(m.id)}>⬇ {t('mdDownload')}</button>}
                </div>
                {ind?.durum === 'hata' && <p className="hata-metni kucuk">{ind.mesaj}</p>}
              </div>
            )
          })}
        </div>
      </section>

      <section className="kart yerel-rehber">
        <h2>📖 {t('guideLocalTitle')}</h2>
        <div className="rehber-izgara">
          {metin.rehber.map((b) => (
            <div key={b.baslik}>
              <h3>{b.baslik}</h3>
              <ul>{b.maddeler.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function DenemeSohbeti({ modeller, model, setModel }: { modeller: string[]; model: string; setModel: (m: string) => void }): ReactElement {
  const { t } = useDil()
  const [mesajlar, setMesajlar] = useState<{ rol: 'sen' | 'model'; metin: string }[]>([])
  const [taslak, setTaslak] = useState('')
  const [bekliyor, setBekliyor] = useState(false)
  const alt = useRef<HTMLDivElement>(null)
  useEffect(() => { alt.current?.scrollIntoView({ block: 'nearest' }) }, [mesajlar.length, bekliyor])

  const gonder = async (): Promise<void> => {
    const metin = taslak.trim()
    if (!metin || bekliyor || !model) return
    const yeni = [...mesajlar, { rol: 'sen' as const, metin }]
    setMesajlar(yeni)
    setTaslak('')
    setBekliyor(true)
    try {
      const yanit = await window.sirket.yerelDene(model, yeni)
      setMesajlar([...yeni, { rol: 'model', metin: yanit || '…' }])
    } catch (e) {
      setMesajlar([...yeni, { rol: 'model', metin: `⚠️ ${(e as Error).message.replace(/^Error invoking remote method '[^']+': (Error: )?/, '')}` }])
    } finally {
      setBekliyor(false)
    }
  }

  return (
    <section className="kart deneme-sohbeti">
      <div className="yerel-katalog-ust">
        <h2>💬 {t('tryTitle')}</h2>
        <select value={model} onChange={(e) => { setModel(e.target.value); setMesajlar([]) }}>
          {modeller.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        {mesajlar.length > 0 && <button className="ikincil mini-buyuk" onClick={() => setMesajlar([])}>{t('tryClear')}</button>}
      </div>
      <div className="deneme-mesajlar">
        {mesajlar.map((m, i) => <div key={i} className={`deneme-mesaj ${m.rol}`}>{m.metin}</div>)}
        {bekliyor && <div className="deneme-mesaj model bekliyor">{t('tryThinking')}</div>}
        <div ref={alt} />
      </div>
      <div className="komut-satiri">
        <input value={taslak} placeholder={t('tryPlaceholder')} onChange={(e) => setTaslak(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void gonder() }} />
        <button className="birincil" disabled={bekliyor || !taslak.trim()} onClick={() => void gonder()}>{t('trySend')}</button>
      </div>
    </section>
  )
}
