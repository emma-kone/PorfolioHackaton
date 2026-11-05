import { ArrowUp } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { SocialDot } from "@/components/ui/social-dot";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="wrap pb-8 pt-16">
      <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <BrandLogo className="h-14 w-auto text-foreground" />
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {site.role}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {site.socials.map((s) => (
            <SocialDot key={s.id} social={s} />
          ))}
          <a
            href="#accueil"
            className="tap ml-2 flex items-center gap-2 rounded-full bg-muted px-5 text-sm transition-colors hover:bg-foreground hover:text-background"
          >
            Haut de page <ArrowUp className="size-4" aria-hidden />
          </a>
        </div>
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-2">
        <span className="label">
          © {new Date().getFullYear()} {site.name}
        </span>
      </div>
    </footer>
  );
}
