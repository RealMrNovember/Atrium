import { useCallback, useEffect, useState, type ReactElement } from 'react'
import type { Ajan, CanliDurum, KatDetayi, MisafirAjan, SirketProfili } from '@ortak/tipler'
import { ajanAnahtari } from '@ortak/tipler'
import { Markdown } from '../bilesenler/Markdown'
import { SaglayiciSecici, saglayiciIkonu } from '../bilesenler/SaglayiciSecici'
import { DegisiklikPaneli } from '../bilesenler/DegisiklikPaneli'
import { ZamanlamaPaneli } from '../bilesenler/ZamanlamaPaneli'
import { KarsilastirmaPaneli } from '../bilesenler/KarsilastirmaPaneli'
import { RaporPaylas } from '../bilesenler/RaporPaylas'
import { SablonSecici } from '../bilesenler/SablonSecici'
import { SohbetListesi } from '../bilesenler/SohbetListesi'
import { useDil } from '../dil'
import { KatSahnesi } from '../sahne/KatSahnesi'
import { DURUM_ANAHTARI, GOREV_ANAHTARI, hataMetni, KOMUT_ANAHTARI, RENKLER, usd, zamanMetni } from '../yardimci'

type Sekme = 'komut' | 'ajan' | 'raporlar' | 'hafiza' | 'sohbetler' | 'zaman'

interface Props {
  katId: string
  /** Açılınca doğrudan bu Claude sohbeti açılsın (sohbet id). */
  acilacakSohbet?: string
  profil: SirketProfili
  canli: CanliDurum
  onDegisti: () => void
  /** Komut hatasını Destek sayfasında hata raporu taslağı olarak açar. */
  onHataBildir?: (konu: string, metin: string) => void
}

export function KatSayfasi({ katId, acilacakSohbet, profil, canli, onDegisti, onHataBildir }: Props): ReactElement {
  const { t, dil } = useDil()
  const [detay, setDetay] = useState<KatDetayi | null>(null)
  const [sekme, setSekme] = useState<Sekme>(acilacakSohbet ? 'sohbetler' : 'komut')
  const [acikSohbet, setAcikSohbet] = useState<string | undefined>(acilacakSohbet)
  const [seciliAjan, setSeciliAjan] = useState<string | null>(null)
  const [taslakAjan, setTaslakAjan] = useState<Ajan | null>(null)

  const yenile = useCallback(() => { void window.sirket.katDetayi(katId).then(setDetay) }, [katId])
  const aktifKomut = canli.aktifKomutlar.find((k) => k.katId === katId)
  const hafizaCalisiyor = canli.hafizaCalisan.includes(katId)
  // işe alınan ajan canlı duruma düştüğünde ekip listesi de tazelensin
  const canliAjanSayisi = Object.keys(canli.ajanlar).filter((k) => k.startsWith(katId + '/')).length
  useEffect(yenile, [yenile, aktifKomut?.durum, hafizaCalisiyor, canliAjanSayisi])

  if (!detay) return <div className="yukleniyor">{t('floorLoading')}</div>
  const { kat, ajanlar } = detay
  // misafirler: sohbetlerde açılan alt ajanlar + o an aktif Claude Code sohbetlerinin kendisi
  // (oda sınırlı: sohbetin kendisi alt ajanlarından önce yer alır)
  const misafirler: MisafirAjan[] = [
    ...(canli.aktifSohbetler[katId] ?? []).map((s) => ({
      id: `sohbet-${s.id}`, tur: 'Claude', aciklama: s.baslik, sohbetBasligi: s.baslik, sonEtkinlik: '',
      bosta: s.durum === 'acik',
      // kararını bekleyen sohbet balonla sorusunu sorar
      etkinlik: s.bekleyenSoru && s.durum === 'acik' ? `❓ ${s.bekleyenSoru}` : s.etkinlik
    })),
    ...(canli.misafirler[katId] ?? [])
  ]

  const ajanSec = (id: string | null): void => {
    setSeciliAjan(id)
    setTaslakAjan(null)
    if (id) setSekme('ajan')
  }
  const bosOda = (oda: number): void => {
    setSeciliAjan(null)
    setTaslakAjan({
      id: `ajan-${Date.now().toString(36)}`, ad: t('newAgentName'), rol: t('newAgentRole'), oda,
      saglayici: profil.ayarlar.varsayilanSaglayici ?? 'claude',
      model: (profil.ayarlar.varsayilanSaglayici ?? 'claude') === 'claude' ? 'sonnet' : '',
      renk: RENKLER[(oda + 3) % RENKLER.length], gorevTanimi: t('newAgentDuty')
    })
    setSekme('ajan')
  }
  const hafizaCikar = (): void => { void window.sirket.hafizaCikar(katId) }
  const seciliMisafir = seciliAjan?.startsWith('m-') ? misafirler.find((m) => `m-${m.id}` === seciliAjan) : undefined

  return (
    <div className="kat-sayfasi">
      <div className="kat-ust">
        <div>
          <h1><span className="kat-no buyuk">{t('floorN', { n: kat.no })}</span> {kat.ad}</h1>
          <div className="etiketler">
            {kat.etiketler.map((e) => <span key={e} className="etiket">{e}</span>)}
            <span className={kat.hafizaVar ? 'etiket iyi' : 'etiket uyari'}>
              🧠 {kat.hafizaVar ? t('memoryAgo', { when: zamanMetni(kat.hafizaGuncelleme, t, dil) }) : t('noMemory')}
            </span>
            {misafirler.length > 0 && <span className="etiket misafir">★ {t('guestAgent')} × {misafirler.length}</span>}
          </div>
        </div>
        <div className="kat-dugmeler">
          <button className="ikincil" onClick={() => void window.sirket.klasorAc(kat.yol)}>📁 {t('openFolder')}</button>
          <button className="ikincil" disabled={hafizaCalisiyor} onClick={hafizaCikar}>
            🧠 {hafizaCalisiyor ? t('extractingMemory') : kat.hafizaVar ? t('updateMemory') : t('extractMemory')}
          </button>
        </div>
      </div>

      <div className="kat-govde">
        <div className="sahne-alani">
          <KatSahnesi katId={katId} ajanlar={ajanlar} canli={canli.ajanlar} misafirler={misafirler}
            seciliAjan={seciliAjan} onAjanSec={ajanSec} onBosOda={bosOda} />
          <div className="sahne-ipucu">{t('sceneHint')}</div>
        </div>
        <aside className="sag-panel">
          <div className="sekmeler">
            {(['komut', 'ajan', 'raporlar', 'hafiza', 'sohbetler', 'zaman'] as Sekme[]).map((s) => (
              <button key={s} className={sekme === s ? 'etkin' : ''} onClick={() => setSekme(s)} title={s === 'zaman' ? t('tabSchedule') : undefined}>
                {{ komut: t('tabCommand'), ajan: t('tabTeam'), raporlar: t('tabReports'), hafiza: t('tabMemory'), sohbetler: t('tabChats'), zaman: '⏰' }[s]}
              </button>
            ))}
          </div>
          <div className="panel-icerik">
            {sekme === 'komut' && <KomutPaneli detay={detay} canli={canli} profil={profil} onAjanSec={ajanSec} onHataBildir={onHataBildir} />}
            {sekme === 'ajan' && (seciliMisafir
              ? <MisafirPaneli m={seciliMisafir} onGeri={() => ajanSec(null)}
                  onSohbetAc={seciliMisafir.id.startsWith('sohbet-') ? () => { setAcikSohbet(seciliMisafir.id.slice(7)); setSekme('sohbetler') } : undefined} />
              : <EkipPaneli detay={detay} canli={canli} seciliAjan={seciliAjan} taslak={taslakAjan}
                  onSec={ajanSec} onYeni={() => {
                    const bos = [0, 1, 2, 3, 4, 5, 6, 7].find((n) => !ajanlar.some((a) => a.oda === n))
                    if (bos !== undefined) bosOda(bos)
                  }}
                  onKaydedildi={(id) => { setTaslakAjan(null); setSeciliAjan(id); yenile(); onDegisti() }} />)}
            {sekme === 'raporlar' && <KatRaporlari detay={detay} />}
            {sekme === 'zaman' && <ZamanlamaPaneli katId={detay.kat.id} />}
            {sekme === 'hafiza' && <HafizaPaneli detay={detay} calisiyor={hafizaCalisiyor} onCikar={hafizaCikar} onKaydedildi={() => { yenile(); onDegisti() }} />}
            {sekme === 'sohbetler' && <SohbetListesi key={acikSohbet ?? 'liste'} katId={katId} aciklama={t('chatsExplain')} acik={acikSohbet} canli={canli} />}
          </div>
        </aside>
      </div>
    </div>
  )
}

// --- Komut ---------------------------------------------------------------------

function KomutPaneli({ detay, canli, profil, onAjanSec, onHataBildir }: {
  detay: KatDetayi; canli: CanliDurum; profil: SirketProfili; onAjanSec: (id: string) => void; onHataBildir?: (konu: string, metin: string) => void
}): ReactElement {
  const { t, dil } = useDil()
  const [metin, setMetin] = useState('')
  const [yazma, setYazma] = useState(false)
  const [hata, setHata] = useState('')
  const [ekler, setEkler] = useState<File[]>([])
  const [surukleniyor, setSurukleniyor] = useState(false)
  const [karsilastirma, setKarsilastirma] = useState(false)
  const ekle = (liste: FileList | File[]): void => {
    const yeni = [...ekler]
    for (const d of Array.from(liste)) {
      if (d.size > 10 * 1024 * 1024) { setHata(t('attachTooBig', { name: d.name })); continue }
      if (yeni.length < 10 && !yeni.some((x) => x.name === d.name && x.size === d.size)) yeni.push(d)
    }
    setEkler(yeni)
  }
  const aktif = canli.aktifKomutlar.find((k) => k.katId === detay.kat.id)
  const lider = detay.ajanlar.find((a) => a.lider) ?? detay.ajanlar[0]
  const komut = aktif ?? detay.komutlar[0]
  const ajanBul = (id: string): Ajan | undefined => detay.ajanlar.find((a) => a.id === id)

  const gonder = async (): Promise<void> => {
    if (!metin.trim()) return
    setHata('')
    try {
      const veri = await Promise.all(ekler.map(async (d) => ({ ad: d.name, veri: new Uint8Array(await d.arrayBuffer()) })))
      await window.sirket.komutVer(detay.kat.id, metin, yazma, veri)
      setMetin('')
      setEkler([])
    } catch (e) {
      setHata(hataMetni(e))
    }
  }

  return (
    <div className={surukleniyor ? 'komut-paneli surukleniyor' : 'komut-paneli'}
      onDragOver={(e) => { if (!aktif && e.dataTransfer.types.includes('Files')) { e.preventDefault(); setSurukleniyor(true) } }}
      onDragLeave={() => setSurukleniyor(false)}
      onDrop={(e) => { e.preventDefault(); setSurukleniyor(false); if (!aktif) ekle(e.dataTransfer.files) }}>
      <label className="etiket-ust">{lider ? t('commandTo', { name: lider.ad, role: lider.rol }) : t('commandGeneric')}</label>
      <textarea value={metin} disabled={!!aktif} onChange={(e) => setMetin(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void gonder() }}
        placeholder={t('commandPlaceholder')} rows={5} />
      <div className="ek-satiri">
        <label className={aktif ? 'ikincil mini-buyuk dosya-dugmesi pasif' : 'ikincil mini-buyuk dosya-dugmesi'} title={t('attachHint')}>
          📎 {t('attach')}
          <input type="file" multiple hidden disabled={!!aktif} onChange={(e) => { if (e.target.files) ekle(e.target.files); e.target.value = '' }} />
        </label>
        {ekler.map((d, i) => (
          <span key={i} className="ek-cip" title={`${d.name} · ${Math.max(1, Math.round(d.size / 1024))} KB`}>
            {d.type.startsWith('image/') ? '🖼️' : d.type === 'application/pdf' ? '📄' : '📝'} {d.name}
            <button className="cip-kaldir" onClick={() => setEkler(ekler.filter((_, j) => j !== i))} aria-label={t('remove')}>×</button>
          </span>
        ))}
        {!ekler.length && <span className="kucuk">{t('attachDrop')}</span>}
      </div>
      <label className="onay">
        <input type="checkbox" checked={yazma} disabled={!!aktif} onChange={(e) => setYazma(e.target.checked)} />
        <span>{t('allowWrite')} <small>{t('allowWriteHint')}</small></span>
      </label>
      <div className="komut-alt">
        <span className="kucuk">
          {profil.ayarlar.simulasyon ? `🧪 ${t('simNoSpend')}` : t('perAgentCap', { cap: usd(profil.ayarlar.kosuButcesiUsd) })} · Ctrl+Enter
        </span>
        <span className="komut-dugmeleri">
          <button className="ikincil" title={t('compareHint')} onClick={() => setKarsilastirma(!karsilastirma)}>⚖️ {t('compareButton')}</button>
          <button className="ikincil" disabled={!!aktif} title={t('tourHint')} onClick={() => void window.sirket.durumTuru(detay.kat.id).catch((e) => setHata(hataMetni(e)))}>📋 {t('tourButton')}</button>
          <button className="birincil" disabled={!!aktif || !metin.trim()} onClick={() => void gonder()}>{t('send')}</button>
        </span>
      </div>
      {hata && <p className="hata-metni">{hata}</p>}
      {(karsilastirma || canli.karsilastirmalar[detay.kat.id]?.sonuclar.some((x) => x.calisiyor)) && (
        <KarsilastirmaPaneli katId={detay.kat.id} canli={canli} ilkMetin={metin} onKapat={() => setKarsilastirma(false)} />
      )}

      {komut && (
        <div className="komut-kart">
          <div className="komut-kart-ust">
            <span className={`rozet ${komut.durum} ${aktif ? 'canli' : ''}`}>{t(KOMUT_ANAHTARI[komut.durum])}</span>
            {komut.tur === 'tur' && <span className="rozet tur">📋 {t('tourBadge')}</span>}
            <span className="kucuk">{zamanMetni(komut.zaman, t, dil)} · {usd(komut.maliyetUsd)}</span>
            {aktif && <button className="tehlike mini" onClick={() => void window.sirket.komutIptal(aktif.id)}>{t('stop')}</button>}
          </div>
          <p className="komut-alinti">“{komut.metin}”</p>
          {komut.ekler?.length ? <p className="kucuk">📎 {komut.ekler.join(' · ')}</p> : null}
          {komut.plan && <p className="plan">🧭 {komut.plan}</p>}
          <ul className="gorev-listesi">
            {komut.gorevler.map((g) => {
              const a = ajanBul(g.ajanId)
              const c = canli.ajanlar[ajanAnahtari(detay.kat.id, g.ajanId)]
              return (
                <li key={g.id} onClick={() => onAjanSec(g.ajanId)}>
                  <span className="ajan-nokta" style={{ background: a?.renk }} />
                  <div>
                    <b>{a?.ad ?? g.ajanId}</b> <span className="kucuk">{a?.rol}</span> {a?.iseAlindi && <span className="etiket iyi">🎉</span>}
                    <div className="gorev-baslik">{g.devredenId && <span title={t('handoffBadge')}>↪ </span>}{g.baslik}</div>
                    {aktif && c?.etkinlik && g.durum === 'calisiyor' && <div className="kucuk canli-satir">{c.etkinlik}</div>}
                  </div>
                  <span className={`rozet ${g.durum}`}>{t(GOREV_ANAHTARI[g.durum])}</span>
                </li>
              )
            })}
          </ul>
          {komut.hata && (
            <p className="hata-metni">{komut.hata}
              {onHataBildir && <button className="ikincil mini-buyuk hata-bildir" onClick={() => onHataBildir(t('bugSubject'), komut.hata ?? '')}>🐞 {t('reportBug')}</button>}
            </p>
          )}
          {!aktif && komut.degisiklik && <DegisiklikPaneli key={`${komut.id}-${komut.degisiklik.durum}`} katId={detay.kat.id} komut={komut} />}
          {!aktif && komut.rapor && (
            <details open className="rapor-kutu">
              <summary>📨 {t('leadReport')}</summary>
              <RaporPaylas komut={komut} katAdi={detay.kat.ad} />
              <Markdown metin={komut.rapor} />
            </details>
          )}
        </div>
      )}
    </div>
  )
}

// --- Misafir -------------------------------------------------------------------

function MisafirPaneli({ m, onGeri, onSohbetAc }: { m: MisafirAjan; onGeri: () => void; onSohbetAc?: () => void }): ReactElement {
  const { t } = useDil()
  const sohbet = !!onSohbetAc
  return (
    <div className="ajan-formu">
      <button className="geri" onClick={onGeri}>{t('backTeam')}</button>
      <div className="ajan-kimlik">
        <span className={sohbet ? 'avatar buyuk claude' : 'avatar buyuk misafir'}>{sohbet ? 'C' : '★'}</span>
        <div>
          <h3>{sohbet ? t('claudeChat') : m.tur}</h3>
          <span className="kucuk">{sohbet ? t('claudeChatLive') : `${t('guestAgent')} · ${t('guestFrom')}`}</span>
          <div className="durum calisiyor">{t('stWorking')}</div>
        </div>
      </div>
      {m.etkinlik && <div className="canli-kutu">{m.etkinlik}</div>}
      {!sohbet && m.aciklama && <p>{m.aciklama}</p>}
      {m.sohbetBasligi && <p className="kucuk">💬 {m.sohbetBasligi}</p>}
      {onSohbetAc && <button className="birincil" onClick={onSohbetAc}>💬 {t('openChat')}</button>}
    </div>
  )
}

// --- Ekip ----------------------------------------------------------------------

interface EkipProps {
  detay: KatDetayi
  canli: CanliDurum
  seciliAjan: string | null
  taslak: Ajan | null
  onSec: (id: string | null) => void
  onYeni: () => void
  onKaydedildi: (id: string | null) => void
}

function EkipPaneli({ detay, canli, seciliAjan, taslak, onSec, onYeni, onKaydedildi }: EkipProps): ReactElement {
  const { t } = useDil()
  const ajan = taslak ?? detay.ajanlar.find((a) => a.id === seciliAjan)
  if (!ajan) {
    return (
      <div className="ekip-listesi">
        {detay.ajanlar.map((a) => {
          const c = canli.ajanlar[ajanAnahtari(detay.kat.id, a.id)]
          return (
            <button key={a.id} className="ajan-satir" onClick={() => onSec(a.id)}>
              <span className="avatar" style={{ background: a.renk }}>{a.ad[0]}</span>
              <span>
                <b>{a.ad}</b> {a.lider && '👑'} {a.iseAlindi && '🎉'}<br />
                <span className="kucuk">{a.rol} · {saglayiciIkonu(a.saglayici)} {a.model || '—'}{a.odak?.length ? ` · 📁 ${a.odak.slice(0, 2).join(', ')}` : ''}</span>
              </span>
              <span className={`durum ${c?.durum ?? 'bosta'}`}>{t(DURUM_ANAHTARI[c?.durum ?? 'bosta'])}</span>
            </button>
          )
        })}
        {detay.ajanlar.length < 8 && <button className="ikincil genis" onClick={onYeni}>{t('addAgent')}</button>}
        <SablonSecici katId={detay.kat.id} onKuruldu={() => onKaydedildi(null)} />
      </div>
    )
  }
  return <AjanFormu key={ajan.id} katId={detay.kat.id} ajan={ajan} yeni={!!taslak} canli={canli}
    doluOdalar={detay.ajanlar.filter((a) => a.id !== ajan.id).map((a) => a.oda)} ekip={detay.ajanlar} onGeri={() => onSec(null)} onKaydedildi={onKaydedildi} />
}

function AjanFormu({ katId, ajan, yeni, canli, doluOdalar, ekip, onGeri, onKaydedildi }: {
  katId: string; ajan: Ajan; yeni: boolean; canli: CanliDurum; doluOdalar: number[]; ekip: Ajan[]; onGeri: () => void; onKaydedildi: (id: string | null) => void
}): ReactElement {
  const { t } = useDil()
  const [f, setF] = useState<Ajan>(ajan)
  const c = canli.ajanlar[ajanAnahtari(katId, ajan.id)]
  const degisti = JSON.stringify(f) !== JSON.stringify(ajan) || yeni
  const kaydet = async (): Promise<void> => {
    await window.sirket.ajanKaydet(katId, f)
    onKaydedildi(f.id)
  }
  const sil = async (): Promise<void> => {
    if (!confirm(t('confirmRemove', { name: ajan.ad }))) return
    await window.sirket.ajanSil(katId, ajan.id)
    onKaydedildi(null)
  }
  return (
    <div className="ajan-formu">
      <button className="geri" onClick={onGeri}>{t('backTeam')}</button>
      <div className="ajan-kimlik">
        <span className="avatar buyuk" style={{ background: f.renk }}>{f.ad[0]}</span>
        <div>
          <h3>{f.ad} {f.lider && '👑'} {f.iseAlindi && '🎉'}</h3>
          <span className="kucuk">{f.rol} · {t('roomN', { n: f.oda + 1 })}</span>
          {!yeni && <div className={`durum ${c?.durum ?? 'bosta'}`}>{t(DURUM_ANAHTARI[c?.durum ?? 'bosta'])}</div>}
        </div>
      </div>
      {!yeni && c?.etkinlik && c.durum !== 'bosta' && <div className="canli-kutu">{c.etkinlik}</div>}
      {!yeni && (c?.gunluk.length ?? 0) > 0 && (
        <details className="gunluk" open={c?.durum !== 'bosta'}>
          <summary>{t('workLog')}</summary>
          <ul>{[...(c?.gunluk ?? [])].reverse().map((s, i) => <li key={i}>{s}</li>)}</ul>
        </details>
      )}
      <div className="form">
        <label>{t('fName')}<input value={f.ad} onChange={(e) => setF({ ...f, ad: e.target.value })} /></label>
        <label>{t('fRole')}<input value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value })} /></label>
        <SaglayiciSecici saglayici={f.saglayici} model={f.model} onDegis={(saglayici, model) => setF((o) => ({ ...o, saglayici, model }))} />
        <div className="form-satir">
          <label>{t('fRoom')}
            <select value={f.oda} onChange={(e) => setF({ ...f, oda: Number(e.target.value) })} disabled={f.lider}>
              {[0, 1, 2, 3, 4, 5, 6, 7].filter((n) => !doluOdalar.includes(n) && (n !== 0 || f.lider)).map((n) => <option key={n} value={n}>{t('roomN', { n: n + 1 })}</option>)}
            </select>
          </label>
        </div>
        <label>{t('fColor')}
          <div className="renkler">
            {RENKLER.map((r) => <button key={r} className={f.renk === r ? 'renk secili' : 'renk'} style={{ background: r }} onClick={() => setF({ ...f, renk: r })} />)}
          </div>
        </label>
        <label className="onay">
          <input type="checkbox" checked={!!f.web} onChange={(e) => setF({ ...f, web: e.target.checked })} />
          <span>{t('fWeb')}</span>
        </label>
        <label>{t('fHandoff')} <small>{t('fHandoffHint')}</small>
          <select value={f.devret ?? ''} onChange={(e) => setF({ ...f, devret: e.target.value || undefined })}>
            <option value="">—</option>
            {ekip.filter((a) => a.id !== f.id).map((a) => <option key={a.id} value={a.id}>{a.ad} · {a.rol}</option>)}
          </select>
        </label>
        <label>{t('fDuty')}
          <textarea rows={7} value={f.gorevTanimi} onChange={(e) => setF({ ...f, gorevTanimi: e.target.value })} />
        </label>
        <label>{t('fFocus')} <small>{t('fFocusHint')}</small>
          <input value={(f.odak ?? []).join(', ')} placeholder="src/api, src/lib"
            onChange={(e) => setF({ ...f, odak: e.target.value.split(',').map((s) => s.trim()).filter(Boolean), odakElle: true })} />
        </label>
        <div className="form-dugmeler">
          {!yeni && !ajan.lider && <button className="tehlike" onClick={() => void sil()}>{t('remove')}</button>}
          <span />
          <button className="birincil" disabled={!degisti || !f.ad.trim()} onClick={() => void kaydet()}>{yeni ? t('hire') : t('save')}</button>
        </div>
      </div>
    </div>
  )
}

// --- Raporlar & Hafıza -------------------------------------------------------------

function KatRaporlari({ detay }: { detay: KatDetayi }): ReactElement {
  const { t, dil } = useDil()
  if (!detay.komutlar.length) return <p className="bos">{t('noCommandsFloor')}</p>
  return (
    <div className="kat-raporlari">
      {detay.komutlar.map((k, i) => (
        <details key={k.id} open={i === 0} className="rapor-kutu">
          <summary>
            <span className={`rozet ${k.durum}`}>{t(KOMUT_ANAHTARI[k.durum])}</span> {k.metin.slice(0, 60)}
            <span className="kucuk"> · {zamanMetni(k.zaman, t, dil)} · {usd(k.maliyetUsd)}</span>
          </summary>
          {k.rapor ? <><RaporPaylas komut={k} katAdi={detay.kat.ad} /><Markdown metin={k.rapor} /></> : <p className="bos">{k.hata ?? t('noReport')}</p>}
        </details>
      ))}
    </div>
  )
}

function HafizaPaneli({ detay, calisiyor, onCikar, onKaydedildi }: { detay: KatDetayi; calisiyor: boolean; onCikar: () => void; onKaydedildi: () => void }): ReactElement {
  const { t } = useDil()
  const [duzenle, setDuzenle] = useState(false)
  const [metin, setMetin] = useState(detay.hafiza)
  useEffect(() => { if (!duzenle) setMetin(detay.hafiza) }, [detay.hafiza, duzenle])
  const kaydet = async (): Promise<void> => {
    await window.sirket.hafizaKaydet(detay.kat.id, metin)
    setDuzenle(false)
    onKaydedildi()
  }
  return (
    <div className="hafiza-paneli">
      <p className="kucuk">{t('memoryExplain')}</p>
      {!detay.hafiza && !duzenle && (
        <div className="bos-kutu">
          <p>{t('noMemoryYet')}</p>
          <button className="birincil" disabled={calisiyor} onClick={onCikar}>🧠 {calisiyor ? t('extracting') : t('extractMemory')}</button>
        </div>
      )}
      {duzenle ? (
        <>
          <textarea className="hafiza-metni" value={metin} onChange={(e) => setMetin(e.target.value)} />
          <div className="form-dugmeler">
            <button className="ikincil" onClick={() => setDuzenle(false)}>{t('cancel')}</button>
            <span />
            <button className="birincil" onClick={() => void kaydet()}>{t('save')}</button>
          </div>
        </>
      ) : detay.hafiza ? (
        <>
          <div className="form-dugmeler">
            <button className="ikincil" onClick={() => setDuzenle(true)}>✏️ {t('edit')}</button>
            <span />
            <button className="ikincil" disabled={calisiyor} onClick={onCikar}>↻ {calisiyor ? t('updating') : t('reextract')}</button>
          </div>
          <Markdown metin={detay.hafiza} />
        </>
      ) : (
        <button className="ikincil" onClick={() => setDuzenle(true)}>✏️ {t('writeManually')}</button>
      )}
    </div>
  )
}
