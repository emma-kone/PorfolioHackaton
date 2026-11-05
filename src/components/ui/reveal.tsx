import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

const EASE = [0.2, 0.8, 0.2, 1] as const

/** Apparition au scroll (fondu + léger glissement). Désactivée si l'utilisateur réduit les animations. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Une ligne de titre qui monte depuis un masque — réservé aux titres de section. */
export function MaskLine({
  children,
  delay = 0,
  className,
  trigger = "scroll",
}: {
  children: ReactNode
  delay?: number
  className?: string
  /** `scroll` = au défilement ; un booléen = piloté (ex. fin du préchargement). */
  trigger?: "scroll" | boolean
}) {
  const reduced = useReducedMotion()
  const box = cn("block overflow-hidden pb-[0.12em] -mb-[0.12em]", className)
  if (reduced) return <span className={box}>{children}</span>

  // Le déclencheur est sur le masque (visible), pas sur le texte : un élément entièrement
  // rogné par `overflow: hidden` n'est jamais « dans la vue » pour IntersectionObserver.
  const wrapperProps =
    trigger === "scroll"
      ? { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } }
      : { animate: trigger ? "show" : "hidden" }
  return (
    <motion.span className={box} initial="hidden" {...wrapperProps}>
      <motion.span
        className="block"
        variants={{
          hidden: { y: "115%" },
          show: { y: "0%", transition: { duration: 1, delay, ease: EASE } },
        }}
      >
        {children}
      </motion.span>
    </motion.span>
  )
}
