import { NoticiaSlim } from '@/types/noticias'
import { Clock, Eye, Heart, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { getNoticiaImage } from '@/lib/youtube-utils'
import Link from 'next/link'
import BadgeNoticia from './badge-noticia'
import BadgeCategoria from './badge-categoria-client'
import BadgeMedio from './badge-medio-client'
import { cn } from '@/lib/utils'

type NewsCardProps = {
    noticia: NoticiaSlim & { 
        ciudad?: string | null
        views?: number | null
        likes?: number | null
        written_at_date?: Date | string | null
    }
    variant?: 'featured' | 'normal' | 'default' | 'compact' | 'trending' | 'horizontal' | 'minimal' | 'small' | 'grid'
    showStats?: boolean
}

export const NewsCard = ({
    noticia,
    variant = 'default',
    showStats = false
}: NewsCardProps) => {
    const writtenAtDate = (noticia.written_at_date ? new Date(noticia.written_at_date) : null) || 
                          (noticia.written_at ? new Date(noticia.written_at) : null)

    const hasBadge = noticia.badge !== null && noticia.badge !== undefined

    const getBadgeOutlineColor = () => {
        if (!hasBadge) return ''
        switch (noticia.badge) {
            case 'URGENTE':
                return 'ring-2 ring-red-500 ring-offset-4'
            case 'EN_VIVO':
                return 'ring-2 ring-orange-500 ring-offset-4'
            case 'ULTIMA_HORA':
                return 'ring-2 ring-yellow-500 ring-offset-4'
            case 'EXCLUSIVO':
                return 'ring-2 ring-purple-500 ring-offset-4'
            case 'DESARROLLANDO':
                return 'ring-2 ring-blue-500 ring-offset-4'
            case 'ACTUALIZADO':
                return 'ring-2 ring-green-500 ring-offset-4'
            case 'VERIFICADO':
                return 'ring-2 ring-blue-500 ring-offset-4'
            case 'INVESTIGACION':
                return 'ring-2 ring-indigo-500 ring-offset-4'
            case 'ARCHIVO':
                return 'ring-2 ring-gray-500 ring-offset-4'
            case 'PREMIUM':
                return 'ring-2 ring-amber-500 ring-offset-4'
            default:
                return ''
        }
    }

    return (
        <Link
            href={`/noticias/${noticia.slug}`}
            className={cn(
                "group block bg-card border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200",
                hasBadge && getBadgeOutlineColor()
            )}
        >
            <div className={`flex ${
                variant === 'compact' || variant === 'horizontal' 
                    ? 'gap-3 p-3' 
                    : 'flex-col'
            }`}>
                {getNoticiaImage(noticia) && variant !== 'minimal' && (
                    <div className={cn(
                        'relative overflow-hidden bg-muted',
                        variant === 'compact' || variant === 'horizontal'
                            ? 'rounded-lg'
                            : 'rounded-t-lg',
                        variant === 'compact'
                            ? 'w-20 h-16 flex-shrink-0'
                            : variant === 'horizontal'
                            ? 'w-24 h-20 flex-shrink-0'
                            : variant === 'grid'
                            ? 'w-full aspect-square'
                            : variant === 'small'
                            ? 'w-full aspect-[16/10] min-h-[120px]'
                            : variant === 'featured'
                            ? 'w-full aspect-[16/9] min-h-[280px]'
                            : variant === 'normal'
                            ? 'w-full aspect-[4/3] min-h-[160px] max-h-[220px]'
                            : 'w-full h-32'
                    )}>
                        {variant !== 'compact' && variant !== 'horizontal' && variant !== 'small' && (
                            <>
                                <BadgeCategoria categoria={noticia.categoria || null} />
                                {/* <BadgeMedio medio={noticia.medio || null} /> */}
                            </>
                        )}
                        <BadgeNoticia badge={noticia.badge || null} />
                        <img
                            src={getNoticiaImage(noticia)!}
                            alt={noticia.titulo || ''}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {variant === 'trending' && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                ES TENDENCIA
                            </div>
                        )}
                    </div>
                )}

                <div className={`${
                    variant === 'compact' || variant === 'horizontal'
                        ? 'flex-1 min-w-0' 
                        : variant === 'minimal'
                        ? 'p-3 border-l-2 border-transparent group-hover:border-primary transition-all'
                        : variant === 'featured'
                        ? 'p-4'
                        : variant === 'normal'
                        ? 'p-4'
                        : 'p-4'
                    }`}>
                    {variant !== 'minimal' && (
                        <div className="flex items-center gap-2 mb-2">
                            {noticia.categoria && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                    {noticia.categoria}
                                </span>
                            )}
                            {noticia.ciudad && (
                                <span className="text-xs text-muted-foreground">
                                    {noticia.ciudad}
                                </span>
                            )}
                        </div>
                    )}

                    {variant === 'featured' ? (
                        <h1 className="text-3xl md:text-4xl font-bold group-hover:text-primary transition-colors leading-tight mb-3" dangerouslySetInnerHTML={{ __html: noticia.titulo }} />
                    ) : variant === 'normal' ? (
                        <h2 className="text-xl md:text-2xl font-semibold group-hover:text-primary transition-colors leading-snug line-clamp-3 mb-2" dangerouslySetInnerHTML={{ __html: noticia.titulo }} />
                    ) : variant === 'minimal' ? (
                        <h4 className="text-sm font-semibold group-hover:text-primary transition-colors leading-tight line-clamp-2 mb-1" dangerouslySetInnerHTML={{ __html: noticia.titulo }} />
                    ) : variant === 'horizontal' ? (
                        <h4 className="text-sm font-semibold group-hover:text-primary transition-colors leading-tight line-clamp-2 mb-1" dangerouslySetInnerHTML={{ __html: noticia.titulo }} />
                    ) : variant === 'grid' ? (
                        <h3 className="text-base font-semibold group-hover:text-primary transition-colors leading-tight line-clamp-2 mb-1" dangerouslySetInnerHTML={{ __html: noticia.titulo }} />
                    ) : variant === 'small' ? (
                        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors leading-tight line-clamp-2 mb-1" dangerouslySetInnerHTML={{ __html: noticia.titulo }} />
                    ) : (
                        <h3 className={`font-medium group-hover:text-primary transition-colors line-clamp-2 ${variant === 'compact' ? 'text-sm' : 'text-base'
                            }`} dangerouslySetInnerHTML={{ __html: noticia.titulo }} />
                    )}

                    {variant === 'minimal' && noticia.bajada && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            <span dangerouslySetInnerHTML={{ __html: noticia.bajada }} />
                        </p>
                    )}

                    {(variant === 'default' || variant === 'featured' || variant === 'normal' || variant === 'small' || variant === 'grid') && noticia.bajada && (
                        <p className={`text-muted-foreground mt-2 ${
                            variant === 'featured' 
                                ? 'text-lg line-clamp-3' 
                                : variant === 'normal'
                                ? 'text-base line-clamp-2'
                                : variant === 'small' || variant === 'grid'
                                ? 'text-xs line-clamp-2'
                                : 'text-sm line-clamp-2'
                        }`}>
                            <span dangerouslySetInnerHTML={{ __html: noticia.bajada }} />
                        </p>
                    )}

                    <div className={`flex items-center justify-between text-xs text-muted-foreground ${
                        variant === 'minimal' ? 'mt-2' : 'mt-3'
                    }`}>
                        <div className="flex items-center gap-3">
                            {writtenAtDate && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(writtenAtDate, {
                                        addSuffix: true,
                                        locale: es
                                    })}
                                </span>
                            )}
                            {noticia.medio && variant !== 'minimal' && (
                                <span className="truncate max-w-20">
                                    {noticia.medio}
                                </span>
                            )}
                            {noticia.medio && variant === 'minimal' && (
                                <span className="text-xs font-medium text-foreground/70">
                                    {noticia.medio}
                                </span>
                            )}
                        </div>

                        {showStats && (
                            <div className="flex items-center gap-2">
                                {noticia.views !== null && noticia.views !== undefined && noticia.views > 0 && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <Eye className="w-3 h-3" />
                                        <span>{noticia.views.toLocaleString()}</span>
                                    </span>
                                )}
                                {noticia.likes && noticia.likes > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Heart className="w-3 h-3" />
                                        {noticia.likes}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}

