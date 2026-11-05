import { LayoutTemplate, MousePointerClick, PenTool, Smartphone, type LucideIcon } from "lucide-react"
import { IconGrid, type IconGridItem } from "@/components/ui/icon-set"
import { Logo } from "@/components/ui/logo"
import { MaskLine, Reveal } from "@/components/ui/reveal"
import { SectionHead } from "@/components/ui/section-head"
import { logos, logoInk, logoTint } from "@/lib/logos"
import { skillGroups, type Skill, type LucideKey } from "@/data/skills"

const lucide: Record<LucideKey, LucideIcon> = {
  pen: PenTool,
  layout: LayoutTemplate,
  responsive: Smartphone,
  prototype: MousePointerClick,
}

function toItem(s: Skill): IconGridItem {
  if ("logo" in s) {
    return { id: s.id, name: s.name, tint: logoTint(s.logo), ink: logoInk(s.logo), brand: true, icon: <Logo id={s.logo} className="size-full" />, href: logos[s.logo].href }
  }
  const Icon = lucide[s.lucide]
  return { id: s.id, name: s.name, tint: s.color, ink: "#ffffff", brand: false, icon: <Icon className="size-full" strokeWidth={1.6} aria-hidden /> }
}

export function Skills() {
  return (
    <section id="competences" className="py-24 md:py-36">
      <div className="wrap">
        <SectionHead index="06" label="Compétences" />

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <h2 className="display text-[clamp(2.5rem,6vw,5.25rem)] lg:col-span-7">
            <MaskLine>La boîte</MaskLine>
            <MaskLine delay={0.1}>
              <span className="text-accent">à outils.</span>
            </MaskLine>
          </h2>
          <Reveal delay={0.15} className="lg:col-span-4 lg:col-start-9 lg:self-end">
            <p className="text-muted-foreground">Survole une icône : sa couleur de marque éclaire le fond, le logo, lui, ne change jamais.</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4">
          {skillGroups.map((g) => (
            <div key={g.id} className="grid gap-8 rounded-[2rem] bg-card p-6 md:grid-cols-[13rem_1fr] md:gap-12 md:p-10">
              <div>
                <h3 className="display text-3xl">{g.label}</h3>
                <p className="label mt-2">{g.note}</p>
              </div>
              <IconGrid items={g.skills.map(toItem)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
