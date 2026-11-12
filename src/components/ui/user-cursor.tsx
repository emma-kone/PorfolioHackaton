import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

/**
 * UserCursorArea — adapté du composant « User Cursor » (Originkit).
 * Conserve : flèche à ressort, pastille d'étiquette qui traîne et se penche selon la vitesse,
 * rebond à l'appui. Différence : au lieu d'un hôte fixe de 200×200, le curseur est local
 * à n'importe quel contenu (`children`) et rogné à sa zone. Désactivé au tactile.
 */
export interface UserCursorAreaProps {
  label: string
  color?: string
  textColor?: string
  /** Taille de la flèche en px. */
  size?: number
  tiltStrength?: number
  pressScale?: number
  /** Vrai = curseur natif rétabli, rien n'est affiché. */
  disabled?: boolean
  /**
   * Vrai (défaut) = curseur rogné à la zone. Faux = il peut en sortir, pour suivre
   * un contenu qui déborde (ex. les fiches qui sortent d'un dossier ouvert).
   */
  clip?: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
}

const ARROW_SPRING = { stiffness: 380, damping: 32, mass: 0.6 }
const LABEL_SPRING = { stiffness: 220, damping: 26, mass: 0.7 }

export function UserCursorArea({
  label,
  color = "var(--accent)",
  textColor = "var(--accent-foreground)",
  size = 30,
  tiltStrength = 25,
  pressScale = 0.92,
  disabled = false,
  clip = true,
  className,
  style,
  children,
}: UserCursorAreaProps) {
  const host = useRef<HTMLDivElement>(null)
  const coarse = useMediaQuery("(pointer: coarse)")
  const active = !coarse && !disabled

  const [hovering, setHovering] = useState(false)
  const [pressed, setPressed] = useState(false)
  const last = useRef<{ x: number; y: number; t: number } | null>(null)

  const mouseX = useMotionValue(-9999)
  const mouseY = useMotionValue(-9999)
  const arrowX = useSpring(mouseX, ARROW_SPRING)
  const arrowY = useSpring(mouseY, ARROW_SPRING)
  const labelX = useSpring(mouseX, LABEL_SPRING)
  const labelY = useSpring(mouseY, LABEL_SPRING)
  const labelOffsetX = useTransform(labelX, (v) => v + size * 0.9)
  const labelOffsetY = useTransform(labelY, (v) => v + size * 0.2 + 6)

  const tiltTarget = useMotionValue(0)
  const rotate = useSpring(tiltTarget, { stiffness: 200, damping: 24, mass: 0.6 })
  const scale = useMotionValue(1)

  useEffect(() => {
    const c = animate(scale, pressed ? pressScale : 1, { type: "spring", stiffness: 500, damping: 28, mass: 0.5 })
    return () => c.stop()
  }, [pressed, pressScale, scale])

  // Quand on désactive (carte retournée), on repart de zéro.
  useEffect(() => {
    if (!active) {
      setHovering(false)
      setPressed(false)
      last.current = null
      tiltTarget.set(0)
    }
  }, [active, tiltTarget])

  const onMove = (e: React.MouseEvent) => {
    if (!active || !host.current) return
    const r = host.current.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const now = performance.now()
    let vx = 0
    let vy = 0
    if (last.current) {
      const dt = Math.max(1, now - last.current.t)
      vx = ((x - last.current.x) / dt) * 1000
      vy = ((y - last.current.y) / dt) * 1000
    }
    last.current = { x, y, t: now }
    if (!hovering) {
      // Première position : on place sans traîner depuis (-9999).
      arrowX.jump(x)
      arrowY.jump(y)
      labelX.jump(x)
      labelY.jump(y)
      setHovering(true)
    }
    mouseX.set(x)
    mouseY.set(y)
    const norm = Math.min(1, Math.hypot(vx, vy) / 1500)
    tiltTarget.set((vx === 0 ? 0 : vx > 0 ? 1 : -1) * norm * tiltStrength)
  }

  return (
    <div
      ref={host}
      data-cursor={active ? "hide" : undefined}
      className={cn("relative", active && "cursor-none", className)}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={() => {
        setHovering(false)
        setPressed(false)
        last.current = null
        tiltTarget.set(0)
      }}
      onMouseDown={() => active && setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {children}
      {active && (
        <div
          aria-hidden
          className={cn("pointer-events-none absolute inset-0 z-50", clip && "overflow-hidden rounded-[inherit]")}
        >
          <motion.div
            className="absolute left-0 top-0 select-none whitespace-nowrap rounded-full font-semibold"
            style={{
              x: labelOffsetX,
              y: labelOffsetY,
              rotate,
              scale,
              background: color,
              color: textColor,
              padding: `${size * 0.18}px ${size * 0.36}px`,
              fontSize: Math.max(11, size * 0.43),
              lineHeight: 1.1,
              transformOrigin: "0% 50%",
              opacity: hovering ? 1 : 0,
              transition: "opacity 140ms ease",
              boxShadow: "0 4px 12px rgb(0 0 0 / 0.18)",
            }}
          >
            {label}
          </motion.div>
          <motion.div
            className="absolute left-0 top-0"
            style={{
              x: arrowX,
              y: arrowY,
              scale,
              width: size,
              height: size,
              transformOrigin: "0% 0%",
              opacity: hovering ? 1 : 0,
              transition: "opacity 140ms ease",
            }}
          >
            <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{ display: "block", overflow: "visible" }}>
              <path
                d="M5 3 L23 14 L14 16 L11 24 Z"
                fill={color}
                stroke="rgba(0,0,0,0.25)"
                strokeWidth={0.8}
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default UserCursorArea
