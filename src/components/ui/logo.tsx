import { useId } from "react"
import { logos, type LogoDef, type LogoId } from "@/lib/logos"
import { cn } from "@/lib/utils"

/**
 * Logo officiel en deux calques : un calque monochrome (gris) et le
 * calque aux couleurs officielles, révélé du bas vers le haut au survol de l'élément ou de son
 * parent `.group` (voir `.logo-fill` dans index.css). Les SVG Devicon sont chargés en <img> :
 * aucune règle CSS du site ne peut en changer les couleurs internes.
 */
export function Logo({ id, className }: { id: LogoId; className?: string }) {
  const gradId = useId()
  const def: LogoDef = logos[id]

  if (def.source === "devicon") {
    const img = (layer: string) => (
      <img src={def.file} alt="" aria-hidden draggable={false} className={cn(layer, "object-contain", def.invertOnDark && (layer === "logo-color" ? "invert" : "logo-inv"))} />
    )
    return (
      <span aria-hidden className={cn("logo-fill", className)}>
        {img("logo-mono")}
        {img("logo-color")}
      </span>
    )
  }
  const svg = (layer: string) => (
    <svg viewBox="0 0 24 24" aria-hidden className={layer}>
      {layer === "logo-color" && def.gradient && (
        <defs>
          <radialGradient id={gradId} cx="0.3" cy="1.05" r="1.3">
            {def.gradient.stops.map(([o, c]) => (
              <stop key={o} offset={o} stopColor={c} />
            ))}
          </radialGradient>
        </defs>
      )}
      <path d={def.path} fill={layer === "logo-color" ? (def.gradient ? `url(#${gradId})` : def.color) : def.color} />
    </svg>
  )
  return (
    <span aria-hidden className={cn("logo-fill", className)}>
      {svg("logo-mono")}
      {svg("logo-color")}
    </span>
  )
}
