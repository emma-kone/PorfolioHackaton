import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { MaskLine, Reveal } from "@/components/ui/reveal";
import { SectionHead } from "@/components/ui/section-head";
import { SocialDot } from "@/components/ui/social-dot";
import { ContactForm } from "@/components/sections/contact-form";
import { site } from "@/data/site";

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible : le lien mailto: reste utilisable */
    }
  };

  // Section bleu-violet sombre (voir .contact-theme) : la dernière respiration avant le pied de page.
  return (
    <section
      id="contact"
      className="contact-theme mx-3 rounded-[2rem] bg-foreground py-24 text-background sm:mx-6 md:py-36"
    >
      <div className="wrap">
        <SectionHead index="07" label="Contact" tone="inverted" />

        <h2 className="display mt-12 text-[clamp(2.75rem,8vw,7.5rem)] !leading-[0.92]">
          <MaskLine>Une idée, un projet ?</MaskLine>
          <MaskLine delay={0.1}>
            <span className="text-accent">Écrivons-le ensemble.</span>
          </MaskLine>
        </h2>

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <p className="max-w-md text-lg leading-relaxed text-background/75">
              Parle-moi de ton site, de ton application ou de ton identité.
              Dis-moi où tu en es, on voit ensemble par où commencer.
            </p>
            <div className="mt-10 rounded-[1.5rem] bg-background/[0.06] p-6 sm:p-8">
              <p className="label mb-4 !text-background/60">
                Écrire un message
              </p>
              <ContactForm />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
            <p className="label !text-background/60">Email</p>
            <div className="mt-2 flex items-center gap-3">
              <a
                href={`mailto:${site.email}`}
                className="link-draw display break-all text-2xl sm:text-3xl"
              >
                {site.email}
              </a>
              <button
                type="button"
                onClick={copy}
                aria-label={
                  copied ? "Adresse copiée" : "Copier l'adresse email"
                }
                className="tap flex shrink-0 items-center justify-center rounded-full border border-background/30 transition-colors hover:bg-background hover:text-foreground"
              >
                {copied ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <Copy className="size-4" aria-hidden />
                )}
              </button>
              <span className="sr-only" role="status">
                {copied ? "Adresse copiée" : ""}
              </span>
            </div>

            <p className="label mt-10 !text-background/60">Ailleurs</p>
            <div className="mt-3 flex flex-wrap gap-3 pb-8">
              {site.socials.map((s) => (
                <SocialDot key={s.id} social={s} size="lg" />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
