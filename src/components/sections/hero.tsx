import type { ReactNode } from "react"
import { FileText } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import ArrowFillButton from "@/components/ui/arrow-fill-button"
import { Typewriter } from "@/components/ui/typewriter"
import { MaskLine } from "@/components/ui/reveal"
import { site } from "@/data/site"

function Enter({ ready, delay = 0, className, children }: { ready: boolean; delay?: number; className?: string; children: ReactNode }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={ready ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Hero({ ready }: { ready: boolean }) {
  return (
    <section id="accueil" className="relative flex min-h-svh flex-col pb-8 pt-24 md:pt-28">
      <div className="wrap flex flex-1 flex-col">
        <div className="grid flex-1 content-center gap-10 lg:grid-cols-12 lg:items-end">
          {/* Le nom : seul très grand élément de la page, il porte la composition. */}
          <div className="lg:col-span-8">
          <h1 className="display whitespace-nowrap text-[clamp(3.5rem,12.5vw,9.5rem)] !leading-[0.9]">
            <span className="sr-only">{site.name}</span>
            <span aria-hidden>
              <MaskLine trigger={ready}>
                Manou <span className="text-accent">Dev</span>
              </MaskLine>
            </span>
          </h1>
          <Enter ready={ready} delay={0.35} className="mt-6 md:mt-8">
            <p className="display text-[1.65rem] !leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl">
              {site.role.split(" & ")[0]}
              <span className="block">& {site.role.split(" & ")[1]}</span>
            </p>
          </Enter>
          </div>

          <div className="lg:col-span-4 lg:pb-5">
            <Enter ready={ready} delay={0.5}>
              <p className="display text-2xl !leading-tight sm:text-3xl">
                Je transforme une idée en{" "}
                <Typewriter texts={site.rotating} start={ready} className="text-accent" />
              </p>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">{site.statement}</p>
            </Enter>
          </div>
        </div>

        <Enter ready={ready} delay={0.75} className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <ArrowFillButton
                btnText="Voir mes projets"
                href="#projets"
                bgColor="var(--foreground)"
                textColor="var(--background)"
                fillBgColor="var(--accent)"
                fillTextColor="var(--accent-foreground)"
                hoverFillBgColor="var(--accent)"
                hoverFillTextColor="var(--accent-foreground)"
              />
              <a href="#contact" className="tap inline-flex items-center rounded-full bg-muted px-6 text-base transition-colors hover:bg-foreground hover:text-background">
                Me contacter
              </a>
              <a
                href={site.cv}
                target="_blank"
                rel="noopener noreferrer"
                className="tap inline-flex items-center gap-2 rounded-full bg-muted px-6 text-base transition-colors hover:bg-foreground hover:text-background"
              >
                <FileText className="size-4" aria-hidden />
                Voir mon CV
              </a>
            </div>
            <span className="label hidden sm:block" aria-hidden>
              Défiler ↓
            </span>
          </div>
        </Enter>
      </div>
    </section>
  )
}
