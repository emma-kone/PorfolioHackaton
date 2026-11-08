export type Diploma = {
  id: string
  period: string
  title: string
  short: string
  /** Nom (ou sigle) de l'école, mis en avant sur la carte. */
  school?: string
  /** Nom complet de l'école, affiché sous le sigle. */
  schoolFull?: string
  place?: string
  /** true = formation en cours. */
  current?: boolean
}

/** ✎ Diplômes et certifications. Ajoute une entrée dès qu'un nouveau titre est obtenu. */
export const diplomas: Diploma[] = [
  {
    id: "dasi",
    period: "En cours",
    title: "Licence 3 — Développement d'Applications et Systèmes d'Information",
    short: "DASI",
    school: "ESATIC",
    schoolFull: "École Supérieure Africaine des Technologies de l'Information et de la Communication",
    place: "Abidjan, Côte d'Ivoire",
    current: true,
  },
  {
    id: "bts-ida",
    period: "2023 – 2025",
    title: "BTS Informatique, Développeur d'Application",
    short: "IDA",
    school: "Pigier",
    place: "Yamoussoukro, Côte d'Ivoire",
  },
  {
    id: "formatrice-club-info",
    period: "Club informatique",
    title: "Formatrice frontend & web design",
    short: "Développement web",
    school: "ESATIC",
    schoolFull: "École Supérieure Africaine des Technologies de l'Information et de la Communication",
    place: "Abidjan, Côte d'Ivoire",
  },
]

export type Certification = { id: string; period: string; title: string; issuer?: string }

/** ✎ Ajoute ici tes certifications (ex. { id: "x", period: "2026", title: "…", issuer: "…" }). */
export const certifications: Certification[] = []
