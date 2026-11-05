export type Diploma = {
  id: string
  period: string
  title: string
  short: string
  school?: string
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
]

export type Certification = { id: string; period: string; title: string; issuer?: string }

/** ✎ Ajoute ici tes certifications (ex. { id: "x", period: "2026", title: "…", issuer: "…" }). */
export const certifications: Certification[] = []
