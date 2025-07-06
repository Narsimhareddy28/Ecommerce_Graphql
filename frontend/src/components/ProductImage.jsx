import { useState } from 'react'

export default function ProductImage({ src, alt, className = "", showHover = false }) {
  const [imageState, setImageState] = useState('loading') // 'loading', 'loaded', 'error'
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageLoad = () => {
    setImageState('loaded')
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageState('error')
    setImageLoaded(false)
  }

  const baseClasses = `w-full h-full object-cover ${showHover ? 'hover:scale-105 transition-transform duration-200' : ''}`
  const combinedClasses = `${baseClasses} ${className}`

  return (
    <div className="relative w-full h-full">
      {/* Loading skeleton */}
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400">
            <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
      )}

      {/* Actual image */}
      {src && (
        <img
          src={src}
          alt={alt}
          className={combinedClasses}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: imageState === 'loaded' ? 'block' : 'none' }}
        />
      )}

      {/* Error/No image fallback */}
      {(imageState === 'error' || !src) && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">
              {imageState === 'error' ? 'Failed to load' : 'No Image'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 