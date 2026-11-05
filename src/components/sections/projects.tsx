import { useCallback, useMemo, useState } from "react"
import { AnimatePresence } from "framer-motion"
import GlassFolder, { type ArtPreset, type FolderFile } from "@/components/ui/glass-folder-cards"
import { MaskLine, Reveal } from "@/components/ui/reveal"
import { SectionHead } from "@/components/ui/section-head"
import { ProjectDetail } from "@/components/sections/project-detail"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useTheme } from "@/hooks/use-theme"
import { categories, type Project, type ProjectCategory } from "@/data/projects"

const SHEET_ART: ArtPreset[] = ["aurora", "dusk", "glacier", "verdant", "ember"]

// Décalages verticaux : les dossiers ne sont pas alignés sur une ligne de grille.
const STAGGER = ["xl:mt-0", "xl:mt-24", "xl:mt-10"]

function toFiles(cat: ProjectCategory): FolderFile[] {
  return cat.projects.map((p, i) => ({
    name: p.title,
    meta: p.kind,
    ...(p.screenshots[0] ? { image: p.screenshots[0] } : { art: SHEET_ART[(i + cat.seed) % SHEET_ART.length] }),
  }))
}

export function Projects() {
  const theme = useTheme()
  const narrow = useMediaQuery("(max-width: 389px)")
  const [openId, setOpenId] = useState<string | null>(null)
  const [selected, setSelected] = useState<{ project: Project; category: string } | null>(null)
  const close = useCallback(() => setSelected(null), [])

  const files = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, toFiles(c)])), [])

  return (
    <section id="projets" className="py-24 md:py-36">
      <div className="wrap">
        <SectionHead index="04" label="Projets" />

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <h2 className="display text-[clamp(2.5rem,5.5vw,4.75rem)] lg:col-span-7">
            <MaskLine>Trois dossiers,</MaskLine>
            <MaskLine delay={0.1}>
              <span className="">ouvre-les.</span>
            </MaskLine>
          </h2>
          <Reveal delay={0.15} className="lg:col-span-4 lg:col-start-9 lg:self-end">
            <p className="text-muted-foreground">
              Survole un dossier pour le voir bouger, clique pour l'ouvrir, puis choisis un projet pour lire sa fiche.
            </p>
          </Reveal>
        </div>

        <ul className="mt-24 grid justify-items-center gap-x-6 gap-y-24 md:grid-cols-2 xl:grid-cols-3 xl:gap-x-10">
          {categories.map((cat, i) => (
            <li key={cat.id} className={`flex flex-col items-center pt-24 ${STAGGER[i % STAGGER.length]}`}>
              <GlassFolder
                label={cat.label}
                meta={`${cat.projects.length} ${cat.projects.length > 1 ? "projets" : "projet"}`}
                tone={theme === "dark" ? "dark" : "light"}
                art={cat.art}
                seed={cat.seed}
                files={files[cat.id]}
                action="none"
                width={narrow ? 300 : 340}
                appearDelay={i * 140}
                open={openId === cat.id}
                onOpenChange={(o) => setOpenId((cur) => (o ? cat.id : cur === cat.id ? null : cur))}
                onFileSelect={(_, idx) => setSelected({ project: cat.projects[idx], category: cat.label })}
              />
              <p className="mt-6 max-w-[17rem] text-center text-sm text-muted-foreground">{cat.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {selected && <ProjectDetail key={selected.project.id} project={selected.project} category={selected.category} onClose={close} />}
      </AnimatePresence>
    </section>
  )
}
