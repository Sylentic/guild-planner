import Image from 'next/image';

interface GameIconProps {
  icon: string;
  iconUrl?: string;
  alt: string;
  size?: number;
  className?: string;
}

export function GameIcon({ icon, iconUrl, alt, size = 32, className = '' }: GameIconProps) {
  if (iconUrl) {
    return (
      <Image
        src={iconUrl}
        alt={alt}
        width={size}
        height={size}
        className={`object-contain inline-block align-middle ${className}`}
        onError={(e) => {
          // Fallback to emoji if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextSibling) {
            (target.nextSibling as HTMLElement).style.display = 'block';
          }
        }}
      />
    );
  }
  
  return <span className={`inline-block align-middle ${className}`} style={{ fontSize: `${size}px` }}>{icon}</span>;
}
