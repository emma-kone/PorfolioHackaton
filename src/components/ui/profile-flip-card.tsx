import { useRef, useState, type MouseEvent } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight, RotateCw, Undo2 } from "lucide-react"
import { UserCursorArea } from "@/components/ui/user-cursor"
import { SocialIcon, brandColor } from "@/components/ui/social-icon"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Social } from "@/data/site"

/**
 * ProfileFlipCard — adapté du composant « Flip Gallery » (Originkit).
 * Conserve : perspective 3D, inclinaison qui suit la souris, rotation Y animée avec backface-visibility.
 * Change : la carte se retourne au clic/au toucher (pas au demi-bord) et le verso n'est plus une
 * deuxième photo mais un panneau de liens sociaux. Le curseur « Clique moi » est local au recto.
 */
export interface ProfileFlipCardProps {
  photo: string
  photoAlt: string
  name: string
  role: string
  socials: readonly Social[]
  cursorLabel?: string
}

const TILT = 7

export function ProfileFlipCard({ photo, photoAlt, name, role, socials, cursorLabel = "Clique moi" }: ProfileFlipCardProps) {
  const reduced = useReducedMotion()
  const touch = useMediaQuery("(pointer: coarse)")
  const [flipped, setFlipped] = useState(false)
  const tilt = useRef<HTMLDivElement>(null)
  const backBtn = useRef<HTMLButtonElement>(null)
  const frontBtn = useRef<HTMLButtonElement>(null)

  const flip = (to: boolean) => {
    setFlipped(to)
    // Le focus suit la face visible, pour la navigation au clavier.
    window.setTimeout(() => (to ? backBtn : frontBtn).current?.focus({ preventScroll: true }), reduced ? 0 : 380)
  }

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = tilt.current
    if (!el || flipped || reduced || touch) return
    const r = el.getBoundingClientRect()
    const rx = ((e.clientY - r.top) / r.height - 0.5) * TILT * 2
    const ry = ((e.clientX - r.left) / r.width - 0.5) * -TILT * 2
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`
  }
  const onLeave = () => {
    if (tilt.current) tilt.current.style.transform = "rotateX(0) rotateY(0) scale3d(1,1,1)"
  }

  const face = "absolute inset-0 overflow-hidden rounded-[1.25rem] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"

  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[22rem] [perspective:900px]">
      <div
        ref={tilt}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative h-full w-full transition-transform duration-200 ease-out [transform-style:preserve-3d] will-change-transform"
      >
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: reduced ? 0 : 0.75, ease: [0.44, 0, 0.56, 1] }}
        >
          {/* RECTO */}
          <UserCursorArea label={cursorLabel} disabled={flipped} className={face}>
            <button
              ref={frontBtn}
              type="button"
              onClick={() => flip(true)}
              inert={flipped}
              aria-label={`${name}, ${role}. Retourner la carte pour voir mes liens.`}
              className="group absolute inset-0 block h-full w-full cursor-[inherit] text-left"
            >
              <img src={photo} alt={photoAlt} draggable={false} className="h-full w-full object-cover object-[50%_28%]" />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
                <span>
                  <span className="display block text-3xl">{name}</span>
                  <span className="mt-1 block text-sm text-white/80">{role}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/35 bg-black/30 px-3 py-1.5 text-xs backdrop-blur-sm">
                  <RotateCw className="size-3.5 transition-transform duration-500 group-hover:rotate-180" aria-hidden />
                  {touch ? "Touche pour retourner" : "Retourner"}
                </span>
              </span>
            </button>
          </UserCursorArea>

          {/* VERSO */}
          <div
            inert={!flipped}
            aria-hidden={!flipped}
            className={`${face} flex flex-col bg-card text-card-foreground [transform:rotateY(180deg)]`}
          >
            <div className="flex items-baseline justify-between px-6 pt-6">
              <h3 className="display text-2xl">Retrouve-moi</h3>
              <span className="label">{socials.length} liens</span>
            </div>
            <ul className="mt-3 flex flex-1 flex-col justify-center gap-1 px-3">
              {socials.map((s) => {
                const color = brandColor(s.brand)
                return (
                  <li key={s.id}>
                    <a
                      href={s.href}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="group/link flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2 transition-colors duration-300 hover:bg-background focus-visible:bg-background"
                    >
                      <span
                        className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background ring-1 ring-border transition-shadow duration-300 group-hover/link:ring-2 group-hover/link:ring-(--tint) group-focus-visible/link:ring-2 group-focus-visible/link:ring-(--tint)"
                        style={{ "--tint": color } as React.CSSProperties}
                      >
                        <span
                          aria-hidden
                          className="absolute inset-x-0 bottom-0 h-0 bg-(--tint) opacity-40 transition-[height] duration-500 group-hover/link:h-full group-focus-visible/link:h-full"
                        />
                        <SocialIcon brand={s.brand} className="relative size-[1.1rem] transition-transform duration-300 group-hover/link:scale-110" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium leading-tight">{s.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">{s.handle}</span>
                      </span>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                        aria-hidden
                      />
                    </a>
                  </li>
                )
              })}
            </ul>
            <button
              ref={backBtn}
              type="button"
              onClick={() => flip(false)}
              className="tap m-5 mt-2 flex items-center justify-center gap-2 rounded-full bg-background text-sm transition-colors hover:bg-foreground hover:text-background"
            >
              <Undo2 className="size-4" aria-hidden />
              Retourner la carte
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfileFlipCard
