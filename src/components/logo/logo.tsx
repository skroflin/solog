import Image from "next/image";
import sologLogo from '../../../public/images/solog-logo.svg';

interface SologLogoProps {
  className?: string,
  width?: number,
  height?: number,
  alt?: string,
}

export default function SologLogo({
  className,
  width = 16,
  height = 16,
  alt = "Solog Logo"
}: SologLogoProps) {
  return (
    <Image
      src={sologLogo}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  )
}