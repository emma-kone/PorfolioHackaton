import { useEffect, useMemo, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { GESTURE_END, LogoGesture, type GestureHandle } from "@/components/ui/logo-gesture"
import ParticleTether from "@/components/ui/particle-tether"
import { useMediaQuery } from "@/hooks/use-media-query"
import { site } from "@/data/site"

/** Durée du geste qui trace le logo (s). */
const DRAW_S = 3.4
/** Fondu vers le logo complet (s), puis pause avant d'ouvrir le site (s). */
const FADE_S = 0.6
const HOLD_S = 0.35
/** Au-delà du geste, on n'attend jamais le chargement réel plus longtemps que ça (s). */
const MAX_WAIT_S = 2

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

/** Chargement réel 0..1 : polices + photo + événement load de la fenêtre. */
function realLoad(photoDone: boolean): number {
  if (document.readyState === "complete" && photoDone) return 1
  const fonts = document.fonts?.status === "loaded" ? 1 : 0
  const win = document.readyState === "complete" ? 1 : 0
  return Math.min(0.95, 0.1 + 0.3 * fonts + 0.3 * win + 0.25 * (photoDone ? 1 : 0))
}

/**
 * Écran de préchargement : boule de particules et logo tracé à la plume. Une seule boucle rAF
 * commande le geste et le fondu final ; le site s'ouvre quand le logo est complet ET que le
 * chargement réel est terminé (avec un délai maximum), jamais avant.
 */
export function Preloader({ onComplete }: { onComplete: () => void }) {
  const reduced = useReducedMotion()
  const small = useMediaQuery("(max-width: 640px)")
  const short = useMediaQuery("(max-height: 760px)")

  // Les canvas ne comprennent pas var(--x) : on lit la couleur réelle de l'accent.
  const dot = useMemo(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#6d3fe0", [])

  const gesture = useRef<GestureHandle | null>(null)
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  useEffect(() => {
    let photoDone = false
    const img = new Image()
    img.onload = img.onerror = () => {
      photoDone = true
    }
    img.src = site.photo

    let t = 0
    let last = -1
    let raf = 0
    let stopped = false
    let doneAt = -1

    const tick = (now: number) => {
      if (stopped) return
      const dt = last < 0 ? 0 : Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt
      const drawS = reduced ? 0 : DRAW_S
      const p = drawS ? easeInOut(Math.min(1, t / drawS)) * GESTURE_END : GESTURE_END
      if (doneAt < 0 && t >= drawS && (realLoad(photoDone) >= 1 || t >= drawS + MAX_WAIT_S)) doneAt = t
      const fadeS = reduced ? 0.2 : FADE_S
      const done = doneAt < 0 ? 0 : Math.min(1, (t - doneAt) / fadeS)
      gesture.current?.draw(p, done)
      if (doneAt >= 0 && t - doneAt >= fadeS + HOLD_S) {
        completeRef.current()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      stopped = true
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  const size = small || short ? 150 : 240

  return (
    <motion.div
      role="status"
      aria-label="Chargement du portfolio"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      exit={{ y: "-100%" }}
      transition={{ duration: reduced ? 0.01 : 0.95, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute inset-x-0 top-0 flex justify-between px-6 py-5">
        <span className="label">Portfolio</span>
        <span className="label tabular-nums">{new Date().getFullYear()}</span>
      </div>

      <ParticleTether width={size} height={size} dotColor={dot} density={small ? 180 : 260} speed={reduced ? 10 : 45} />

      <LogoGesture handleRef={gesture} className="mt-8 w-[min(18rem,70vw)] text-foreground sm:w-80" />
    </motion.div>
  )
}
