import { useEffect, useRef, useState, type PointerEvent } from "react"
import { cn } from "@/lib/utils"

const MIN_THUMB = 48
const IDLE_MS = 1200

/**
 * Barre de défilement personnalisée (remplace celle du navigateur, masquée dans index.css).
 * - Pouce violet fin qui s'élargit au survol / pendant le glisser.
 * - Visible pendant le défilement, puis s'efface après un court instant d'inactivité.
 * - Glisser le pouce ou cliquer sur la piste fait défiler la page.
 * - Sur la barre, le curseur du navigateur remplace le curseur point (voir dot-cursor.tsx).
 * - Retirée tant que la page est verrouillée par une fiche ouverte, qui a sa propre barre.
 * Cachée sur écran tactile, où le défilement se fait au doigt.
 */
export function Scrollbar() {
  const thumb = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startY: number; startScroll: number } | null>(null)
  const [active, setActive] = useState(false)
  const [hover, setHover] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [scrollable, setScrollable] = useState(false)
  const [locked, setLocked] = useState(false)

  // Page verrouillée (fiche projet, page d'un dossier, menu mobile… via `overflow: hidden` sur <html>) :
  // la barre de la page se retire, sinon sa piste invisible recouvre la barre de défilement de la fiche
  // ouverte et empêche de l'attraper.
  useEffect(() => {
    const html = document.documentElement
    const sync = () => setLocked(html.style.overflow === "hidden")
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(html, { attributes: true, attributeFilter: ["style"] })
    return () => mo.disconnect()
  }, [])

  // Géométrie du pouce, mise à jour au défilement et au redimensionnement.
  useEffect(() => {
    let idle = 0
    let frame = 0
    const update = () => {
      frame = 0
      const el = thumb.current
      const doc = document.documentElement
      const view = window.innerHeight
      const total = doc.scrollHeight
      const max = total - view
      setScrollable(max > 1)
      if (!el || max <= 1) return
      const h = Math.max(MIN_THUMB, (view / total) * view)
      const y = (window.scrollY / max) * (view - h)
      el.style.height = `${h}px`
      el.style.transform = `translateY(${y}px)`
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onScroll = () => {
      schedule()
      setActive(true)
      window.clearTimeout(idle)
      idle = window.setTimeout(() => setActive(false), IDLE_MS)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", schedule)
    const ro = new ResizeObserver(schedule)
    ro.observe(document.body)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", schedule)
      ro.disconnect()
      cancelAnimationFrame(frame)
      window.clearTimeout(idle)
    }
  }, [])

  const ratio = () => {
    const doc = document.documentElement
    const h = thumb.current?.offsetHeight ?? MIN_THUMB
    return (doc.scrollHeight - window.innerHeight) / (window.innerHeight - h)
  }

  const onThumbDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { startY: e.clientY, startScroll: window.scrollY }
    setDragging(true)
    // Le curseur du navigateur reste affiché pendant tout le glisser, même si la souris quitte la barre.
    document.documentElement.setAttribute("data-native-cursor", "")
  }
  const onThumbMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const { startY, startScroll } = drag.current
    window.scrollTo({ top: startScroll + (e.clientY - startY) * ratio(), behavior: "instant" })
  }
  const onThumbUp = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = null
    setDragging(false)
    document.documentElement.removeAttribute("data-native-cursor")
    e.currentTarget.releasePointerCapture(e.pointerId)
  }
  // Clic sur la piste : centre le pouce à cet endroit.
  const onTrackDown = (e: PointerEvent<HTMLDivElement>) => {
    const h = thumb.current?.offsetHeight ?? MIN_THUMB
    window.scrollTo({ top: (e.clientY - h / 2) * ratio(), behavior: "smooth" })
  }

  if (!scrollable) return null
  const shown = active || hover || dragging

  return (
    <div
      aria-hidden
      data-cursor="native"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={onTrackDown}
      // Verrouillée : on la garde montée (le pouce conserve sa géométrie) mais invisible et traversée par la souris.
      className={cn(
        "fixed inset-y-0 right-0 z-[90] hidden w-3.5 cursor-default [@media(pointer:fine)]:block",
        locked && "pointer-events-none invisible",
      )}
    >
      <div
        ref={thumb}
        onPointerDown={onThumbDown}
        onPointerMove={onThumbMove}
        onPointerUp={onThumbUp}
        onPointerCancel={onThumbUp}
        className="absolute right-0 top-0 flex w-full cursor-grab justify-center py-1 will-change-transform active:cursor-grabbing"
      >
        <span
          className={cn(
            "block h-full rounded-full bg-accent transition-[width,opacity] duration-300 ease-out",
            dragging || hover ? "w-2 opacity-100" : "w-1",
            shown ? "opacity-90" : "opacity-0",
          )}
        />
      </div>
    </div>
  )
}
