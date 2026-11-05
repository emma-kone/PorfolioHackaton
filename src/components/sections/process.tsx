import { useCallback, useEffect, useRef, useState } from "react"
import { useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion"
import { Logo } from "@/components/ui/logo"
import { MaskLine, Reveal } from "@/components/ui/reveal"
import { SectionHead } from "@/components/ui/section-head"
import { logos } from "@/lib/logos"
import { cn } from "@/lib/utils"
import { processSteps as steps } from "@/data/process"

/**
 * Parcours au scroll : un tracé SVG qui se dessine au rythme du défilement.
 * - La géométrie est calculée à partir de la position réelle de chaque étape (et recalculée au
 *   redimensionnement) ; la longueur vient de getTotalLength().
 * - Le tracé est révélé par stroke-dasharray / stroke-dashoffset, lié à la progression du scroll
 *   (framer-motion, déjà présent). En remontant, il se rétracte : la progression est réversible.
 * - Aucun calcul de layout pendant le scroll : seuls un attribut de style et la position d'un
 *   point sont écrits, directement dans le DOM, sans re-rendu React.
 */

type Geo = { w: number; h: number; d: string; len: number; markers: { x: number; y: number; at: number }[] }

const SVG_NS = "http://www.w3.org/2000/svg"

/** Courbe de Catmull-Rom passant par tous les points, convertie en Béziers cubiques. */
function smoothPath(p: [number, number][]) {
  let d = `M${p[0][0]} ${p[0][1]}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = p[i + 2] ?? p2
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`
  }
  return d
}

export function Process() {
  const reduced = useReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const stepEls = useRef<(HTMLLIElement | null)[]>([])
  const pathRef = useRef<SVGPathElement>(null)
  const headRef = useRef<SVGCircleElement>(null)
  const [geo, setGeo] = useState<Geo | null>(null)
  // Tant que rien n'est mesuré (ou si les animations sont réduites), tout est visible.
  const [active, setActive] = useState(steps.length)

  const measure = useCallback(() => {
    const el = box.current
    if (!el) return
    const w = el.clientWidth
    const h = el.clientHeight
    const wide = w >= 768
    const cx = wide ? w / 2 : 22
    const amp = wide ? Math.min(w * 0.07, 90) : 7

    const anchors = stepEls.current.map((li, i) => {
      const side = i % 2 === 0 ? 1 : -1 // le contenu est à gauche (pair) ou à droite (impair) du tracé
      return [cx + side * amp, (li?.offsetTop ?? 0) + 30] as [number, number]
    })
    const pts: [number, number][] = [[cx - amp * 0.4, 0]]
    anchors.forEach((a, i) => {
      const prev = pts[pts.length - 1]
      // Point intermédiaire décalé de façon irrégulière : le tracé ondule entre deux étapes.
      const wobble = (((i * 5 + 2) % 7) - 3) / 3
      pts.push([cx + wobble * amp * 1.5, (prev[1] + a[1]) / 2])
      pts.push(a)
    })
    pts.push([cx + amp * 0.3, h])

    const d = smoothPath(pts)
    // Mesure sur un chemin hors écran : aucune dépendance au rendu.
    const probe = document.createElementNS(SVG_NS, "path")
    probe.setAttribute("d", d)
    const len = probe.getTotalLength()
    const samples = 700
    const markers = anchors.map(([x, y]) => {
      let best = 0
      let bestDist = Infinity
      for (let s = 0; s <= samples; s++) {
        const pt = probe.getPointAtLength((s / samples) * len)
        const dist = (pt.x - x) ** 2 + (pt.y - y) ** 2
        if (dist < bestDist) {
          bestDist = dist
          best = (s / samples) * len
        }
      }
      return { x, y, at: best }
    })
    setGeo({ w, h, d, len, markers })
  }, [])

  // Mesure initiale + recalcul au redimensionnement, au changement de contenu et au chargement des polices.
  useEffect(() => {
    measure()
    const el = box.current
    const ro = new ResizeObserver(measure)
    if (el) ro.observe(el)
    stepEls.current.forEach((li) => li && ro.observe(li))
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [measure])

  const { scrollYProgress } = useScroll({ target: box, offset: ["start 70%", "end 60%"] })
  const progress = useSpring(scrollYProgress, { stiffness: 170, damping: 30, mass: 0.3 })

  const apply = useCallback(
    (p: number) => {
      const path = pathRef.current
      if (!geo || !path) return
      const v = reduced ? 1 : Math.min(1, Math.max(0, p))
      path.style.strokeDasharray = String(geo.len)
      path.style.strokeDashoffset = String(geo.len * (1 - v))
      const head = headRef.current
      if (head) {
        const pt = path.getPointAtLength(v * geo.len)
        head.setAttribute("cx", String(pt.x))
        head.setAttribute("cy", String(pt.y))
        head.style.opacity = v > 0.002 && v < 0.998 && !reduced ? "1" : "0"
      }
      setActive(reduced ? steps.length : geo.markers.filter((m) => v * geo.len >= m.at - 2).length)
    },
    [geo, reduced],
  )

  useMotionValueEvent(progress, "change", apply)
  useEffect(() => {
    apply(progress.get())
  }, [apply, progress])

  return (
    <section id="processus" className="py-24 md:py-36">
      <div className="wrap">
        <SectionHead index="05" label="Processus" />

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <h2 className="display text-[clamp(2.5rem,6vw,5.25rem)] lg:col-span-7">
            <MaskLine>De l'idée</MaskLine>
            <MaskLine delay={0.1}>
              <span className="text-accent">à l'écran.</span>
            </MaskLine>
          </h2>
          <Reveal delay={0.15} className="lg:col-span-4 lg:col-start-9 lg:self-end">
            <p className="text-muted-foreground">Six étapes, dans l'ordre où je les vis. Fais défiler : le chemin se dessine avec toi.</p>
          </Reveal>
        </div>

        <div ref={box} className="relative mt-20 pb-16 md:pb-28">
          {geo && (
            <svg
              aria-hidden
              viewBox={`0 0 ${geo.w} ${geo.h}`}
              className="pointer-events-none absolute left-0 top-0 overflow-visible"
              style={{ width: geo.w, height: geo.h }}
            >
              {/* Piste : le chemin à venir, en pointillés discrets. */}
              <path d={geo.d} className="fill-none stroke-muted-foreground/35 [stroke-dasharray:1_10] [stroke-linecap:round]" strokeWidth={2} />
              {/* Tracé révélé au scroll. */}
              <path ref={pathRef} d={geo.d} className="fill-none stroke-accent [stroke-linecap:round]" strokeWidth={3} />
              <circle ref={headRef} r={5} className="fill-accent" style={{ opacity: 0 }} />
              {geo.markers.map((m, i) => {
                const on = i < active
                return (
                  <g key={i} transform={`translate(${m.x} ${m.y})`}>
                    <circle r={15} className={cn("fill-accent transition-opacity duration-700", on ? "opacity-15" : "opacity-0")} />
                    <circle
                      r={7}
                      className={cn(
                        "transition-[fill,stroke,transform] duration-500 [transform-box:fill-box] origin-center",
                        on ? "scale-110 fill-accent stroke-accent" : "fill-background stroke-muted-foreground/60",
                      )}
                      strokeWidth={2}
                    />
                  </g>
                )
              })}
            </svg>
          )}

          <ol className="space-y-24 md:space-y-44">
            {steps.map((s, i) => {
              const on = i < active
              const left = i % 2 === 0
              return (
                <li
                  key={s.id}
                  ref={(el) => {
                    stepEls.current[i] = el
                  }}
                  className="md:grid md:grid-cols-2"
                >
                  <div
                    className={cn(
                      "max-w-md pl-12 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none md:pl-0",
                      left ? "md:col-start-1 md:justify-self-end md:pr-28 md:text-right" : "md:col-start-2 md:pl-28",
                      on ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
                    )}
                  >
                    <p className="label tabular-nums">Étape {String(i + 1).padStart(2, "0")}</p>
                    <h3 className="display mt-2 text-4xl md:text-5xl">{s.title}</h3>
                    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{s.text}</p>
                    {s.tools && (
                      <ul className={cn("mt-5 flex flex-wrap gap-2", left && "md:justify-end")} aria-label="Outils">
                        {s.tools.map((t) => (
                          <li key={t} className="group flex items-center gap-2 rounded-full bg-card py-1.5 pl-2 pr-3.5 text-sm">
                            <Logo id={t} className="size-5" />
                            {logos[t].name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
