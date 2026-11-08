import { useEffect } from "react"
import Lenis from "lenis"
import "lenis/dist/lenis.css"

/**
 * Défilement « lazy » : la page suit la molette avec inertie au lieu de sauter.
 * - Désactivé si l'utilisateur demande moins d'animations.
 * - Les liens d'ancre (#projets, #contact…) glissent en douceur, en tenant compte de l'en-tête fixe.
 * - Mis en pause automatiquement quand une partie du site verrouille le scroll
 *   (préchargement, menu mobile, fiche projet) via `overflow: hidden` sur <html>.
 * Le scroll reste natif : framer-motion (useScroll, whileInView) continue de fonctionner.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1,
      anchors: { offset: -64 },
      autoRaf: true,
    })

    const html = document.documentElement
    const sync = () => (html.style.overflow === "hidden" ? lenis.stop() : lenis.start())
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(html, { attributes: true, attributeFilter: ["style"] })

    return () => {
      mo.disconnect()
      lenis.destroy()
    }
  }, [])
}
