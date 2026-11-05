import { siInstagram, siWhatsapp } from "simple-icons"
import { luminance } from "@/lib/utils"

/**
 * Registre central des logos. Règle : un logo garde sa forme, ses proportions et ses couleurs
 * officielles. Jamais recolorié par le thème ; seules les variantes officielles monochromes
 * (noir ↔ blanc, `invertOnDark`) s'adaptent au mode sombre.
 *
 * Sources : Devicon (SVG officiels multicolores, via le paquet `devicon`) et Simple Icons
 * (Instagram et WhatsApp, absents de Devicon).
 */

export type LogoCategory = "social" | "technology" | "software" | "tool"

type Common = {
  id: string
  name: string
  category: LogoCategory
  /** Couleur officielle principale (#rrggbb). */
  color: string
  /** Autres couleurs de la marque, si elle en a plusieurs. */
  secondary?: string[]
  /** Lien officiel. */
  href: string
  /** Logo officiel noir : on utilise sa variante blanche officielle en mode sombre. */
  invertOnDark?: boolean
}

export type LogoDef = Common &
  (
    | { source: "devicon"; file: string }
    | { source: "path"; path: string; gradient?: { stops: [string, string][] } }
  )

// Uniquement les logos utilisés : importer toute la bibliothèque Devicon (des centaines de SVG)
// bloquait le préchargement, surtout sur mobile.
const devicon = import.meta.glob("/node_modules/devicon/icons/{github,linkedin,html5,css3,javascript,typescript,react,nextjs,vuejs,tailwindcss,figma,canva,cursor,antigravity}/*-original.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>

const dev = (name: string) => {
  const url = devicon[`/node_modules/devicon/icons/${name}/${name}-original.svg`]
  if (!url) throw new Error(`Logo Devicon introuvable : ${name}`)
  return url
}

export const logos = {
  github: { id: "github", name: "GitHub", category: "social", color: "#181717", href: "https://github.com", invertOnDark: true, source: "devicon", file: dev("github") },
  linkedin: { id: "linkedin", name: "LinkedIn", category: "social", color: "#0A66C2", href: "https://www.linkedin.com", source: "devicon", file: dev("linkedin") },
  instagram: {
    id: "instagram",
    name: "Instagram",
    category: "social",
    color: "#E4405F",
    secondary: ["#FED576", "#F47133", "#BC3081", "#4C63D2"],
    href: "https://www.instagram.com",
    source: "path",
    path: siInstagram.path,
    gradient: { stops: [["0", "#FED576"], ["0.26", "#F47133"], ["0.61", "#BC3081"], ["1", "#4C63D2"]] },
  },
  whatsapp: { id: "whatsapp", name: "WhatsApp", category: "social", color: "#25D366", href: "https://www.whatsapp.com", source: "path", path: siWhatsapp.path },

  html: { id: "html", name: "HTML5", category: "technology", color: "#E34F26", href: "https://html.spec.whatwg.org", source: "devicon", file: dev("html5") },
  css: { id: "css", name: "CSS3", category: "technology", color: "#1572B6", href: "https://www.w3.org/Style/CSS/", source: "devicon", file: dev("css3") },
  javascript: { id: "javascript", name: "JavaScript", category: "technology", color: "#F7DF1E", href: "https://developer.mozilla.org/docs/Web/JavaScript", source: "devicon", file: dev("javascript") },
  typescript: { id: "typescript", name: "TypeScript", category: "technology", color: "#3178C6", href: "https://www.typescriptlang.org", source: "devicon", file: dev("typescript") },
  react: { id: "react", name: "React", category: "technology", color: "#61DAFB", href: "https://react.dev", source: "devicon", file: dev("react") },
  nextjs: { id: "nextjs", name: "Next.js", category: "technology", color: "#000000", href: "https://nextjs.org", invertOnDark: true, source: "devicon", file: dev("nextjs") },
  vue: { id: "vue", name: "Vue.js", category: "technology", color: "#4FC08D", href: "https://vuejs.org", source: "devicon", file: dev("vuejs") },
  tailwind: { id: "tailwind", name: "Tailwind CSS", category: "technology", color: "#06B6D4", href: "https://tailwindcss.com", source: "devicon", file: dev("tailwindcss") },

  figma: {
    id: "figma",
    name: "Figma",
    category: "software",
    color: "#F24E1E",
    secondary: ["#FF7262", "#A259FF", "#1ABCFE", "#0ACF83"],
    href: "https://www.figma.com",
    source: "devicon",
    file: dev("figma"),
  },
  canva: { id: "canva", name: "Canva", category: "software", color: "#00C4CC", href: "https://www.canva.com", source: "devicon", file: dev("canva") },
  cursor: { id: "cursor", name: "Cursor", category: "tool", color: "#1A1A1A", href: "https://cursor.com", source: "devicon", file: dev("cursor") },
  antigravity: { id: "antigravity", name: "Antigravity", category: "tool", color: "#4285F4", href: "https://antigravity.google", source: "devicon", file: dev("antigravity") },
} satisfies Record<string, LogoDef>

export type LogoId = keyof typeof logos

/** Couleur d'accentuation (fond plein, contour, infobulle) — jamais appliquée au logo lui-même. */
export function logoTint(id: LogoId): string {
  const l: LogoDef = logos[id]
  return l.color
}

/** Encre lisible posée sur la couleur de la marque (infobulle). */
export function logoInk(id: LogoId): string {
  const l: LogoDef = logos[id]
  return luminance(l.color) > 0.5 ? "#14120f" : "#ffffff"
}
