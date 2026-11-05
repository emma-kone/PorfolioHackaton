import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Typewriter — adapté du composant « Type Writer » (Originkit).
 * Conserve : machine à états frappe → pause → effacement, curseur clignotant.
 * Ajouts : largeur et hauteur réservées d'après le plus long mot (aucun saut de mise en page),
 * `prefers-reduced-motion` (le premier mot s'affiche tel quel), démarrage différé via `start`.
 */
export interface TypewriterProps {
  texts: readonly string[]
  /** Délai par caractère à la frappe (ms). */
  typeMs?: number
  /** Délai par caractère à l'effacement (ms). */
  deleteMs?: number
  /** Pause une fois le mot écrit (ms). */
  holdMs?: number
  cursorChar?: string
  /** Faux = ne démarre pas (ex. pendant le préchargement). */
  start?: boolean
  className?: string
  cursorClassName?: string
}

export function Typewriter({
  texts,
  typeMs = 70,
  deleteMs = 38,
  holdMs = 1700,
  cursorChar = "_",
  start = true,
  className,
  cursorClassName,
}: TypewriterProps) {
  const reduced = useReducedMotion()
  const [text, setText] = useState("")
  const [index, setIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (reduced || !start || texts.length === 0) return
    const full = texts[index]
    let timer: ReturnType<typeof setTimeout>
    if (!deleting) {
      timer =
        text.length < full.length
          ? setTimeout(() => setText(full.slice(0, text.length + 1)), typeMs)
          : setTimeout(() => setDeleting(true), texts.length > 1 ? holdMs : 1e9)
    } else if (text.length > 0) {
      timer = setTimeout(() => setText((t) => t.slice(0, -1)), deleteMs)
    } else {
      timer = setTimeout(() => {
        setDeleting(false)
        setIndex((i) => (i + 1) % texts.length)
      }, 260)
    }
    return () => clearTimeout(timer)
  }, [text, index, deleting, texts, reduced, start, typeMs, deleteMs, holdMs])

  const shown = reduced ? (texts[0] ?? "") : text

  return (
    <span className={cn("inline-grid", className)}>
      <span className="sr-only">{texts.join(", ")}</span>
      {/* Tous les mots, invisibles, empilés : la cellule prend la taille du plus long. */}
      {texts.map((t) => (
        <span key={t} aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {t}
          {cursorChar}
        </span>
      ))}
      <span aria-hidden className="col-start-1 row-start-1 whitespace-nowrap">
        {shown}
        <motion.span
          className={cn("ml-[0.08em] inline-block", cursorClassName)}
          animate={reduced ? undefined : { opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        >
          {cursorChar}
        </motion.span>
      </span>
    </span>
  )
}

export default Typewriter
