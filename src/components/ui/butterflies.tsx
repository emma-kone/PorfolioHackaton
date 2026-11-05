import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"
import { startButterflyDrift } from "@/lib/butterfly-drift"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useTheme } from "@/hooks/use-theme"

/**
 * Papillons (WebGL) qui volent derrière tout le portfolio et fuient le curseur.
 * Le canvas est fixe, plein écran et ne capte aucun clic ; les sections étant transparentes,
 * il suffit de placer le contenu au-dessus (z-index) pour qu'ils passent « derrière » les textes.
 */
export function Butterflies() {
  const ref = useRef<HTMLCanvasElement>(null)
  const theme = useTheme()
  const reduced = useReducedMotion()
  const small = useMediaQuery("(max-width: 640px)")

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reduced) return
    const dark = theme === "dark"
    const stop = startButterflyDrift(canvas, null, {
      baseColor: dark ? "#a78bfa" : "#7c4dff",
      accentColor: dark ? "#f0abfc" : "#e9c9ff",
      density: small ? 18 : 34,
      size: small ? 55 : 70,
      speed: 80,
      flap: 8,
      wander: 100,
      depth: 100,
      blur: 0,
      hover: 200,
      reach: 8,
    })
    return () => stop?.()
  }, [theme, reduced, small])

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
}
