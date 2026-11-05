import { useEffect, useId, useMemo, useRef, type MutableRefObject } from "react"
import { logoShapes } from "@/lib/logo-shapes"

/**
 * Logo Manou Dev « tracé à la plume » (façon Apple Hello) : un seul geste continu dessine chaque forme
 * — un masque dévoile le remplissage derrière le stylo, un trait d'encre lumineux le suit, puis le
 * logo complet apparaît en fondu. Rien n'est piloté par React : le parent appelle `draw(p, done)`
 * à chaque image, ce qui garde tout synchronisé sur sa propre horloge.
 *   p    0 → 1.08 : avancement du geste (au-delà de 1 les derniers traits s'effacent)
 *   done 0 → 1    : fondu vers le logo complet
 */
export type GestureHandle = { draw: (p: number, done: number) => void }

/** Fin du geste (p) : un peu au-delà de 1 pour laisser s'éteindre l'encre du dernier trait. */
export const GESTURE_END = 1.08

type Seg = { shape: number; d: string; ink: string; brush: number; w0: number; w1: number }

const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const ramp = (x: number, xs: number[], ys: number[]) => {
  if (x <= xs[0]) return ys[0]
  for (let i = 1; i < xs.length; i++) {
    if (x <= xs[i]) return ys[i - 1] + ((ys[i] - ys[i - 1]) * (x - xs[i - 1])) / (xs[i] - xs[i - 1] || 1)
  }
  return ys[ys.length - 1]
}
const isWhite = (c: string) => c.toLowerCase() === "white" || c.toLowerCase() === "#ffffff"
/** Les lettres blanches du fichier source suivent la couleur du texte du thème. */
const paint = (c: string) => (isWhite(c) ? "currentColor" : c)
const glow = (ink: string) => {
  if (isWhite(ink)) return undefined
  const n = parseInt(ink.slice(1), 16)
  return `drop-shadow(0 0 5px rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0.45))`
}

export function LogoGesture({ handleRef, className }: { handleRef: MutableRefObject<GestureHandle | null>; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "")

  const segs = useMemo<Seg[]>(
    () =>
      logoShapes.flatMap((s, shape) =>
        s.d
          .split(/(?=M)/)
          .map((d) => d.trim())
          .filter(Boolean)
          .map((d) => ({ shape, d, ink: s.ink, brush: s.brushWidth, w0: 0, w1: 0 })),
      ),
    [],
  )

  const maskRefs = useRef<(SVGPathElement | null)[]>([])
  const inkRefs = useRef<(SVGPathElement | null)[]>([])
  const gestureRef = useRef<SVGGElement>(null)
  const finalRef = useRef<SVGGElement>(null)
  const penRef = useRef<SVGGElement>(null)
  const haloRef = useRef<SVGCircleElement>(null)
  const coreRef = useRef<SVGCircleElement>(null)
  const lens = useRef<number[]>([])

  useEffect(() => {
    // Part de chaque segment dans la longueur totale du geste.
    const l = segs.map((_, i) => inkRefs.current[i]?.getTotalLength() ?? 1)
    const total = l.reduce((a, b) => a + b, 0) || 1
    let acc = 0
    segs.forEach((s, i) => {
      s.w0 = acc / total
      acc += l[i]
      s.w1 = acc / total
    })
    lens.current = l

    handleRef.current = {
      draw(p, done) {
        let cur = -1
        for (let i = 0; i < segs.length; i++) {
          const s = segs[i]
          const mask = clamp((p - (s.w0 + 0.012)) / (s.w1 + 0.04 - (s.w0 + 0.012)))
          const m = maskRefs.current[i]
          if (m) m.style.strokeDashoffset = String(1 - mask)
          const ink = clamp((p - s.w0) / (s.w1 - s.w0 || 1))
          const el = inkRefs.current[i]
          if (el) {
            el.style.strokeDashoffset = String(1 - ink)
            el.style.opacity = String(ramp(p, [s.w0, s.w0 + 0.008, s.w1 + 0.045, s.w1 + 0.075], [0, 1, 1, 0]))
          }
          if (p > s.w0 && p <= s.w1) cur = i
        }
        const pen = penRef.current
        if (pen) {
          const vis = ramp(p, [0, 0.008, 0.99, 1.02], [0, 1, 1, 0])
          pen.style.opacity = String(vis)
          const el = cur >= 0 ? inkRefs.current[cur] : null
          if (el && vis > 0) {
            const s = segs[cur]
            const pt = el.getPointAtLength(clamp((p - s.w0) / (s.w1 - s.w0 || 1)) * lens.current[cur])
            for (const c of [haloRef.current, coreRef.current]) {
              c?.setAttribute("cx", pt.x.toFixed(2))
              c?.setAttribute("cy", pt.y.toFixed(2))
            }
          }
        }
        if (gestureRef.current) gestureRef.current.style.opacity = String(1 - done)
        if (finalRef.current) finalRef.current.style.opacity = String(done)
      },
    }
    handleRef.current.draw(0, 0)
    return () => {
      handleRef.current = null
    }
  }, [segs, handleRef])

  return (
    <svg viewBox="0 0 253 79" role="img" aria-label="Manou Dev" className={className} style={{ display: "block", maxWidth: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        {logoShapes.map((s, si) => (
          <mask key={s.name} id={`${uid}-m${si}`} maskUnits="userSpaceOnUse" x={-32} y={-32} width={317} height={143}>
            {segs.map((g, i) =>
              g.shape !== si ? null : (
                <path
                  key={i}
                  ref={(el) => {
                    maskRefs.current[i] = el
                  }}
                  d={g.d}
                  pathLength={1}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={g.brush}
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  style={{ strokeDasharray: "1 1", strokeDashoffset: 1 }}
                />
              ),
            )}
          </mask>
        ))}
      </defs>

      <g ref={gestureRef}>
        {logoShapes.map((s, si) => (
          <g key={s.name}>
            <path d={s.d} fill={paint(s.fill)} mask={`url(#${uid}-m${si})`} />
            {segs.map((g, i) =>
              g.shape !== si ? null : (
                <path
                  key={i}
                  ref={(el) => {
                    inkRefs.current[i] = el
                  }}
                  d={g.d}
                  pathLength={1}
                  fill="none"
                  stroke={paint(g.ink)}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ strokeDasharray: "1 1", strokeDashoffset: 1, opacity: 0, filter: glow(g.ink) }}
                />
              ),
            )}
          </g>
        ))}
        <g ref={penRef} pointerEvents="none" style={{ opacity: 0, color: "var(--accent)" }}>
          <circle ref={haloRef} r={4.5} fill="currentColor" opacity={0.35} style={{ filter: "blur(2.5px)" }} />
          <circle ref={coreRef} r={1.1} fill="currentColor" style={{ filter: "drop-shadow(0 0 6px currentColor)" }} />
        </g>
      </g>

      <g ref={finalRef} style={{ opacity: 0 }}>
        {logoShapes.map((s) => (
          <path key={s.name} d={s.d} fill={paint(s.fill)} />
        ))}
      </g>
    </svg>
  )
}
