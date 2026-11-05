import type { CSSProperties } from "react"
import { SocialIcon, brandColor, brandInk } from "@/components/ui/social-icon"
import { cn } from "@/lib/utils"
import type { Social } from "@/data/site"

/**
 * Bouton social rond : au survol la couleur de marque monte depuis le bas, le contour la reprend
 * et l'infobulle apparaît. Le logo officiel (dégradé Instagram, etc.) n'est jamais recolorié.
 */
export function SocialDot({ social, size = "md", className }: { social: Social; size?: "md" | "lg"; className?: string }) {
  const external = social.href.startsWith("http")
  return (
    <a
      href={social.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={social.label}
      style={{ "--tint": brandColor(social.brand), "--ink": brandInk(social.brand) } as CSSProperties}
      className={cn("group relative inline-flex", className)}
    >
      <span
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full bg-background text-foreground ring-1 ring-border",
          "transition-[transform,box-shadow] duration-300 ease-out motion-reduce:transition-none",
          "group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-(--tint) group-focus-visible:ring-2 group-focus-visible:ring-(--tint)",
          size === "lg" ? "size-14" : "size-11",
        )}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0 bg-(--tint) opacity-40 transition-[height] duration-500 ease-out motion-reduce:transition-none group-hover:h-full group-focus-visible:h-full"
        />
        <SocialIcon
          brand={social.brand}
          className={cn(
            "relative transition-transform duration-300 group-hover:scale-110",
            size === "lg" ? "size-6" : "size-[1.15rem]",
          )}
        />
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded-full bg-(--tint) px-3 py-1.5 text-xs font-medium text-(--ink) opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 max-sm:hidden"
      >
        {social.label}
      </span>
    </a>
  )
}
