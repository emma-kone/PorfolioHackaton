import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight, X } from "lucide-react"
import ArrowFillButton from "@/components/ui/arrow-fill-button"
import { SocialIcon } from "@/components/ui/social-icon"
import type { Project } from "@/data/projects"

/** Fiche détaillée d'un projet : tiroir plein écran sur mobile, grande feuille sur desktop. */
export function ProjectDetail({ project, category, onClose }: { project: Project; category: string; onClose: () => void }) {
  const reduced = useReducedMotion()
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    closeBtn.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose()
      if (e.key !== "Tab" || !panel.current) return
      const f = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.documentElement.style.overflow = prevOverflow
      opener?.focus?.()
    }
  }, [onClose])

  // Rendu directement dans <body> : `main` crée son propre empilement (z-10), l'en-tête fixe
  // passerait sinon par-dessus la fiche et cacherait le bouton « Fermer » sur mobile.
  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <motion.div
        className="absolute inset-0 bg-black/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        data-lenis-prevent
        aria-labelledby="project-title"
        className="absolute inset-x-0 bottom-0 top-0 overflow-y-auto overscroll-contain bg-background md:top-10 md:rounded-t-[2rem]"
        initial={reduced ? false : { y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: reduced ? 0 : 0.7, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-5 py-3 backdrop-blur-sm md:px-10">
          <span className="label">
            {category} · {project.kind}
          </span>
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            className="tap flex items-center gap-2 rounded-full bg-muted px-5 text-sm transition-colors hover:bg-foreground hover:text-background"
          >
            Fermer <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-10 md:px-10 md:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            {project.status && (
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent px-3 py-1 text-xs text-accent">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                {project.status}
              </p>
            )}
            <h3 id="project-title" className="display text-[clamp(2.25rem,4.5vw,4rem)]">
              {project.title}
            </h3>

            <dl className="mt-10 space-y-2 text-sm">
              <div className="grid grid-cols-[6.5rem_1fr] gap-4 rounded-2xl bg-card px-4 py-3">
                <dt className="label pt-0.5">Rôle</dt>
                <dd>{project.role}</dd>
              </div>
              <div className="grid grid-cols-[6.5rem_1fr] gap-4 rounded-2xl bg-card px-4 py-3">
                <dt className="label pt-0.5">Technologies</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span key={t} className="rounded-full bg-background px-3 py-1 text-xs">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
              {project.year && (
                <div className="grid grid-cols-[6.5rem_1fr] gap-4 rounded-2xl bg-card px-4 py-3">
                  <dt className="label pt-0.5">Année</dt>
                  <dd>{project.year}</dd>
                </div>
              )}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              {project.url && (
                <ArrowFillButton
                  btnText={project.urlLabel ?? "Voir le projet"}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  bgColor="var(--foreground)"
                  textColor="var(--background)"
                  fillBgColor="var(--accent)"
                  fillTextColor="var(--accent-foreground)"
                  hoverFillBgColor="var(--accent)"
                  hoverFillTextColor="var(--accent-foreground)"
                />
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group link-draw tap inline-flex items-center gap-2"
                >
                  <SocialIcon brand="github" className="size-4" /> Code sur GitHub <ArrowUpRight className="size-4" aria-hidden />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h4 className="label mb-3">Le projet</h4>
              <p className="text-lg leading-relaxed">{project.summary}</p>
            </section>
            <section>
              <h4 className="label mb-3">Problématique & objectif</h4>
              <p className="text-lg leading-relaxed text-muted-foreground">{project.objective}</p>
            </section>
            <section>
              <h4 className="label mb-3">Captures d'écran</h4>
              <div className={project.screenshots.length > 1 || project.screenshots.length === 0 ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
                {project.screenshots.length > 0
                  ? project.screenshots.map((src, i) => (
                      <img
                        key={src}
                        src={src}
                        alt={`${project.title}, capture ${i + 1}`}
                        loading="lazy"
                        className="w-full rounded-2xl object-cover"
                      />
                    ))
                  : [1, 2].map((n) => (
                      <div
                        key={n}
                        className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-card px-4 text-center text-sm text-muted-foreground"
                      >
                        Capture {n} à ajouter
                      </div>
                    ))}
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
