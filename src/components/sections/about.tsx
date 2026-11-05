import ProfileFlipCard from "@/components/ui/profile-flip-card"
import { MaskLine, Reveal } from "@/components/ui/reveal"
import { SectionHead } from "@/components/ui/section-head"
import { site } from "@/data/site"

const focus = ["Interfaces web", "Applications mobiles", "Design d'interface", "Identités visuelles"]

export function About() {
  return (
    <section id="a-propos" className="py-24 md:py-36">
      <div className="wrap">
        <SectionHead index="01" label="À propos" />

        <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-8">
          {/* La carte descend un peu : asymétrie volontaire par rapport au texte. */}
          <Reveal className="lg:col-span-5 lg:mt-16">
            <ProfileFlipCard
              photo={site.photo}
              photoAlt={site.photoAlt}
              name={site.name}
              role={site.role}
              socials={site.socials}
            />
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="display text-[clamp(2.5rem,5.5vw,4.75rem)]">
              <MaskLine>Une designer qui</MaskLine>
              <MaskLine delay={0.1}>
                <span className="">code, ou l'inverse.</span>
              </MaskLine>
            </h2>

            <div className="mt-10 max-w-xl space-y-5 text-lg leading-relaxed">
              {site.about.paragraphs.map((p, i) => (
                <Reveal key={i} delay={0.1 * i}>
                  <p className={i > 0 ? "text-muted-foreground" : ""}>{p}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1} className="mt-12 max-w-xl">
              <p className="label mb-3">Ce que je fais</p>
              <ul className="flex flex-wrap gap-2">
                {focus.map((f) => (
                  <li key={f} className="rounded-full bg-card px-5 py-2.5 text-base">
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
