import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { BrandLogo } from "@/components/ui/brand-logo"
import { SunMoonThemeToggle } from "@/components/ui/sun-moon-theme-toggle"
import { useActiveSection } from "@/hooks/use-active-section"
import { nav, site } from "@/data/site"
import { cn } from "@/lib/utils"

const ids = nav.map((n) => n.id)

export function Header() {
  const active = useActiveSection(ids)
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Menu mobile : Échap ferme, le défilement du fond est bloqué.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.documentElement.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <>
      <header className="fixed inset-x-0 top-3 z-50 px-3 sm:px-6">
        <div
          className={cn(
            "mx-auto flex h-14 max-w-[1100px] items-center justify-between gap-4 rounded-full pl-5 pr-2 transition-[background-color,box-shadow] duration-500",
            scrolled || open ? "bg-background/80 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur-md" : "bg-transparent",
          )}
        >
          <a href="#accueil" onClick={() => setOpen(false)} className="flex items-center gap-2.5" aria-label={`${site.name} — retour à l'accueil`}>
            <BrandLogo className="h-9 w-auto text-foreground" />
          </a>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((n) => {
                const current = active === n.id
                return (
                  <li key={n.id}>
                    <a
                      href={`#${n.id}`}
                      aria-current={current ? "true" : undefined}
                      className="relative flex items-center px-3.5 py-2 text-sm"
                    >
                      {current && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-muted"
                          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
                        />
                      )}
                      <span className={cn("relative transition-colors", current ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                        {n.label}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <SunMoonThemeToggle storageKey="manou-theme" size={40} />
            <button
              type="button"
              className="tap flex items-center justify-center rounded-full bg-muted lg:hidden"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            className="fixed inset-0 z-40 flex flex-col justify-center bg-background px-6 pt-16 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: reduced ? 0 : 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Navigation mobile">
              <ul className="space-y-1">
                {nav.map((n, i) => (
                  <motion.li
                    key={n.id}
                    initial={reduced ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduced ? 0 : 0.2 + i * 0.06, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <a
                      href={`#${n.id}`}
                      onClick={() => setOpen(false)}
                      aria-current={active === n.id ? "true" : undefined}
                      className="flex min-h-16 items-baseline gap-4 py-3"
                    >
                      <span className="label tabular-nums">{String(i).padStart(2, "0")}</span>
                      <span className={cn("display text-4xl", active === n.id && "text-accent")}>{n.label}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <p className="label mt-8">{site.role}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
