import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight, X } from "lucide-react"
import TumbleDeckShowcase, { type TumbleCard } from "@/components/ui/tumble-deck-showcase"
import type { Project, ProjectCategory } from "@/data/projects"

/**
 * Page d'un dossier : tous ses projets en pile qui bascule (TumbleDeckShowcase).
 * Molette, glisser, clic ou flèches font défiler ; le projet du premier plan est
 * nommé en bas, avec un bouton vers sa fiche détaillée.
 * `covered` = une fiche est ouverte par-dessus : Échap et Tab lui reviennent.
 */
export function FolderShowcase({
  category,
  covered = false,
  onOpenProject,
  onClose,
}: {
  category: ProjectCategory
  covered?: boolean
  onOpenProject: (project: Project) => void
  onClose: () => void
}) {
  const reduced = useReducedMotion()
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const [index, setIndex] = useState(0)

  const cards = useMemo<TumbleCard[]>(
    () =>
      category.projects.map((p) => ({
        // Sans capture : une page neutre du site (jamais d'image cassée).
        src: p.screenshots[0] ?? "/images/manou-placeholder.svg",
        alt: `${p.title}, ${p.kind}`,
      })),
    [category],
  )
  const project = category.projects[index] ?? category.projects[0]
  const total = category.projects.length

  const coveredRef = useRef(covered)
  coveredRef.current = covered

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    closeBtn.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (coveredRef.current) return
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

  return createPortal(
    <div className="fixed inset-0 z-[65]">
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
        aria-labelledby="folder-title"
        className="absolute inset-x-0 bottom-0 top-0 flex flex-col overflow-hidden bg-background md:top-10 md:rounded-t-[2rem]"
        initial={reduced ? false : { y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: reduced ? 0 : 0.7, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3 md:px-10">
          <span className="label">
            Dossier · {total} {total > 1 ? "projets" : "projet"}
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

        <div className="px-5 md:px-10">
          <h3 id="folder-title" className="display text-[clamp(2rem,4.5vw,3.75rem)]">
            {category.label}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
        </div>

        <div className="relative min-h-0 flex-1">
          <TumbleDeckShowcase
            cards={cards}
            height="100%"
            aspect={1.6}
            depth={Math.min(5, Math.max(1, total - 1))}
            background="transparent"
            ariaLabel={`Projets du dossier ${category.label}`}
            onIndexChange={setIndex}
          />
        </div>

        <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <div aria-live="polite">
            <p className="label">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {project.kind}
            </p>
            <p className="display mt-1 text-2xl">{project.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {total > 1 && (
              <p className="text-sm text-muted-foreground">Fais défiler, glisse ou clique sur la pile.</p>
            )}
            <button
              type="button"
              onClick={() => onOpenProject(project)}
              className="tap inline-flex items-center gap-2 rounded-full bg-foreground px-5 text-sm text-background transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Voir la fiche <ArrowUpRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
