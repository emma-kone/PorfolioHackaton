import type { LogoId } from "@/lib/logos"

export type LucideKey = "pen" | "layout" | "responsive" | "prototype"

/**
 * Une compétence est soit un logo officiel (couleurs lues dans `lib/logos.ts`),
 * soit un concept sans marque (UI, UX…) avec une icône Lucide et sa propre couleur.
 */
export type Skill = {
  id: string
  name: string
} & ({ logo: LogoId } | { lucide: LucideKey; color: string })

export type SkillGroup = { id: string; label: string; note: string; skills: Skill[] }

/** ✎ Retire ou ajoute ici uniquement ce que tu maîtrises vraiment. */
export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    label: "Frontend",
    note: "Ce que j'écris",
    skills: [
      { id: "html", name: "HTML", logo: "html" },
      { id: "css", name: "CSS", logo: "css" },
      { id: "js", name: "JavaScript", logo: "javascript" },
      { id: "ts", name: "TypeScript", logo: "typescript" },
      { id: "react", name: "React", logo: "react" },
      { id: "vue", name: "Vue.js", logo: "vue" },
      { id: "next", name: "Next.js", logo: "nextjs" },
      { id: "tailwind", name: "Tailwind CSS", logo: "tailwind" },
    ],
  },
  {
    id: "design",
    label: "Design",
    note: "Ce que je dessine",
    skills: [
      { id: "figma", name: "Figma", logo: "figma" },
      { id: "canva", name: "Canva", logo: "canva" },
      { id: "ui", name: "UI Design", lucide: "pen", color: "#6D3FE0" },
      { id: "ux", name: "UX Design", lucide: "layout", color: "#B8741A" },
      { id: "responsive", name: "Responsive Design", lucide: "responsive", color: "#2F7D6B" },
      { id: "proto", name: "Prototypage", lucide: "prototype", color: "#3D5A9E" },
    ],
  },
  {
    id: "outils",
    label: "Outils",
    note: "Où je travaille",
    skills: [
      { id: "github", name: "GitHub", logo: "github" },
      { id: "cursor", name: "Cursor", logo: "cursor" },
      { id: "antigravity", name: "Antigravity", logo: "antigravity" },
    ],
  },
]
