import { Mail } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { logoInk, logoTint, type LogoId } from "@/lib/logos"

export type SocialBrand = LogoId | "mail"

/** Logo officiel du réseau ; l'enveloppe générique (Lucide) pour l'email, qui n'est pas une marque. */
export function SocialIcon({ brand, className }: { brand: SocialBrand; className?: string }) {
  if (brand === "mail") return <Mail className={className} aria-hidden strokeWidth={1.6} />
  return <Logo id={brand} className={className} />
}

/** Couleur d'accentuation pour le fond / le contour / l'infobulle. */
export function brandColor(brand: SocialBrand) {
  return brand === "mail" ? "var(--accent)" : logoTint(brand)
}
export function brandInk(brand: SocialBrand) {
  return brand === "mail" ? "var(--accent-foreground)" : logoInk(brand)
}
