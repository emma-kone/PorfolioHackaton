import * as React from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * IconGrid — adapté du composant « Icon Set ».
 * Conserve : grille d'icônes, apparition en cascade.
 * Ajouts : principe du « Social Media Tooltip » — au survol (ou au focus), la couleur de marque
 * monte depuis le bas du rond, le contour prend cette couleur, l'icône grossit légèrement et le
 * nom apparaît. Le fond s'anime ; le logo n'est jamais recolorié ni déformé.
 * Sur écran tactile le nom reste affiché sous l'icône.
 */
export interface IconGridItem {
  id: string
  name: string
  icon: React.ReactNode
  /** Couleur d'accentuation (fond, contour, infobulle). */
  tint: string
  /** Couleur du texte de l'infobulle, lisible sur `tint`. */
  ink: string
  /** Logo de marque : ne reçoit aucune teinte ; sinon icône générique teintée au survol. */
  brand: boolean
  href?: string
}

export interface IconGridProps {
  items: IconGridItem[]
  className?: string
}

const container: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 14 } },
}

const IconGrid = React.forwardRef<HTMLUListElement, IconGridProps>(({ items, className }, ref) => {
  const reduced = useReducedMotion()
  return (
    <motion.ul
      ref={ref}
      variants={container}
      initial={reduced ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      className={cn("grid grid-cols-3 gap-x-2 gap-y-8 sm:flex sm:flex-wrap sm:gap-x-5 sm:gap-y-14", className)}
    >
      {items.map((it) => (
        <motion.li key={it.id} variants={item} className="group relative">
          <div
            tabIndex={0}
            role="img"
            aria-label={it.name}
            style={{ "--tint": it.tint } as React.CSSProperties}
            className={cn(
              "relative mx-auto flex size-[4.75rem] items-center justify-center overflow-hidden rounded-full bg-background ring-1 ring-border",
              "transition-[transform,box-shadow] duration-300 ease-out motion-reduce:transition-none",
              "group-hover:-translate-y-1 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-(--tint)",
              "group-focus-within:-translate-y-1 group-focus-within:shadow-lg group-focus-within:ring-2 group-focus-within:ring-(--tint)",
            )}
          >
            {/* Calque de révélation indépendant du logo. */}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-0 bg-(--tint) opacity-40 transition-[height] duration-500 ease-out motion-reduce:transition-none group-hover:h-full group-focus-within:h-full"
            />
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-110 group-focus-within:scale-110",
                !it.brand && "text-foreground transition-colors group-hover:text-(--tint)",
              )}
            >
              {it.icon}
            </span>
          </div>
          <span
            aria-hidden
            style={{ backgroundColor: it.tint, color: it.ink }}
            className={cn(
              "icon-name pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium",
              "-translate-y-1 opacity-0 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
              "group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100",
              "[@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100",
            )}
          >
            {it.name}
          </span>
        </motion.li>
      ))}
    </motion.ul>
  )
})

IconGrid.displayName = "IconGrid"

export { IconGrid }
