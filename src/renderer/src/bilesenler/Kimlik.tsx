// Atrium işareti ve şirket logosu (yüklenmediyse baş harf).
import type { ReactElement } from 'react'

export function AtriumIsareti({ boyut = 28 }: { boyut?: number }): ReactElement {
  return <img src="./mark.svg" width={boyut} height={boyut} alt="Atrium" draggable={false} />
}

export function SirketLogosu({ ad, logo, boyut = 38 }: { ad: string; logo: string; boyut?: number }): ReactElement {
  if (logo) return <img className="sirket-logo resim" src={logo} width={boyut} height={boyut} alt={ad} draggable={false} />
  return (
    <span className="sirket-logo" style={{ width: boyut, height: boyut, fontSize: boyut * 0.5, borderRadius: boyut * 0.29 }}>
      {(ad.trim()[0] ?? 'A').toLocaleUpperCase()}
    </span>
  )
}
