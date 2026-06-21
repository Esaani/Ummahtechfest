import { useEffect, useState } from 'react'

export default function SkeletonImage({ src, alt = '', className = '', imgClassName = 'object-cover', ...imgProps }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setErrored(false)
  }, [src])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton — fades out once image loads */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-surface-container-high transition-opacity duration-300 ${
          loaded || errored ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {errored ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant/30 text-3xl">broken_image</span>
          </div>
        ) : (
          <div className="absolute inset-0 -translate-x-full animate-skeleton-shimmer bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        )}
      </div>
      {src && (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${imgClassName} ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          {...imgProps}
        />
      )}
    </div>
  )
}
