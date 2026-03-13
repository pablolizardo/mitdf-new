'use client'

import { NoticiaSlim } from '@/types/noticias'
import Link from 'next/link'
import { useState } from 'react'
import BadgeCategoria from './badge-categoria-client'

interface MarqueeProps {
  noticias: NoticiaSlim[]
}

export default function Marquee({ noticias }: MarqueeProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className=" -mx-4 md:-mx-6 text-[10px] sm:text-xs overflow-x-hidden relative  hidden md:block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex items-center whitespace-nowrap animate-marquee`} style={{ animationPlayState: isHovered ? 'paused' : 'running' }}>
        {[...noticias, ...noticias].map((noticia, i) => (
          <Link
            href={`/noticias/${noticia.slug}`}
            key={`${noticia.id}-${i}`}
            className="mx-4 hover:bg-foreground/5 hover:text-foreground rounded-md px-2 py-1 opacity-90 hover:opacity-100 underline-offset-2 flex items-center gap-2"
          >
            <BadgeCategoria categoria={noticia.categoria} absolute={false} />
            <span className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: noticia.titulo.slice(0, 150) }} />
            {noticia.titulo.length > 150 && '...'}
          </Link>
        ))}
      </div>
    </div>
  )
}
