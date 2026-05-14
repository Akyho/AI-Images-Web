import { useState } from 'react'
import { ImageOff } from 'lucide-react'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  draggable?: boolean
}

export default function SafeImage({ src, alt, className, style, draggable }: SafeImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-surface-800/50 ${className || ''}`} style={style}>
        <ImageOff className="w-8 h-8 text-surface-600" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      draggable={draggable}
      onError={() => setError(true)}
    />
  )
}
