export type Experience = {
  id: string
  /** Année ou période. */
  period: string
  role: string
  company: string
  /** Nom complet de l'entreprise, affiché sous son sigle sur grand écran. */
  companyFull?: string
  description?: string
  /** Position sur le parcours (0 = départ, 1 = arrivée). Par défaut : répartition automatique. */
  at?: number
  /** Côté du chemin où s'affiche le texte. Par défaut : sous le chemin. */
  side?: "above" | "below"
  /** true = exemple à remplacer par une vraie expérience. */
  demo?: boolean
}

/** Image du personnage (ex. "/images/avatar.png"). Sans valeur, le petit personnage dessiné est utilisé. */
export const avatarSrc: string | undefined = undefined

/**
 * ✎ Ajoute, modifie ou supprime des entrées : le parcours se répartit tout seul.
 * Pour une date précise, change `period` (ex. "2024 – 2025").
 */
export const experiences: Experience[] = [
  {
    id: "ciacems",
    period: "Stage · 10 mois",
    role: "Développement web frontend",
    company: "CIACEMS",
    companyFull: "Cabinet d'Ingénierie Avancée et de Conception d'Environnements Multiservices Sécurisés",
  },
  {
    id: "club-info-esatic",
    period: "Club informatique",
    role: "Formatrice frontend & web design",
    company: "Développement web · ESATIC",
    side: "above", // en bas du parcours : sous le chemin, le texte serait coupé par l'écran
  },
]
