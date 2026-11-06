import { useCallback, useEffect, useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Butterflies } from "@/components/ui/butterflies"
import { Scrollbar } from "@/components/ui/scrollbar"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Preloader } from "@/components/layout/preloader"
import { About } from "@/components/sections/about"
import { Contact } from "@/components/sections/contact"
import { Experience } from "@/components/sections/experience"
import { Hero } from "@/components/sections/hero"
import { Process } from "@/components/sections/process"
import { Projects } from "@/components/sections/projects"
import { Skills } from "@/components/sections/skills"
import { useSmoothScroll } from "@/hooks/use-smooth-scroll"

export default function App() {
  useSmoothScroll()

  // Chaque actualisation repart du début : préchargement, puis haut de page.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual"
    window.scrollTo(0, 0)
  }, [])

  const [loaded, setLoaded] = useState(false)

  const onComplete = useCallback(() => {
    setLoaded(true)
  }, [])

  // Pas de défilement pendant le préchargement.
  useEffect(() => {
    if (loaded) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [loaded])

  return (
    <>
      <a
        href="#contenu"
        className="sr-only z-[110] rounded-full bg-foreground px-4 py-2 text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Aller au contenu
      </a>
      {loaded && <Butterflies />}
      {loaded && <Scrollbar />}
      <Header />
      <main id="contenu" className="relative z-10">
        <Hero ready={loaded} />
        <About />
        <Experience />
        <Projects />
        <Process />
        <Skills />
        <Contact />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      <AnimatePresence>{!loaded && <Preloader key="preloader" onComplete={onComplete} />}</AnimatePresence>
    </>
  )
}
