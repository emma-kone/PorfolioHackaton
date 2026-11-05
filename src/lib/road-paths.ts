/**
 * Tracés du chemin d'expérience, dessinés dans leur propre repère (viewBox).
 * `slots` donne les positions (fraction de la longueur) des emplacements de texte pour 3 étapes,
 * choisies sur les lignes droites ; au-delà, la répartition est automatique.
 */
export type RoadConfig = {
  id: "desktop" | "mobile"
  vbW: number
  vbH: number
  d: string
  /** Largeur du chemin, en unités du viewBox. */
  road: number
  /** Taille du personnage, en unités du viewBox. */
  avatar: number
  slots: number[]
  /** below : texte sous le chemin ; beside : texte dans une colonne à droite du chemin. */
  labelMode: "below" | "beside"
  /** Bord gauche de la colonne de texte (mode beside), en unités du viewBox. */
  labelX?: number
}

export const roadDesktop: RoadConfig = {
  id: "desktop",
  vbW: 1000,
  vbH: 780,
  // Trois lignes droites reliées par deux demi-tours, espacées de 300 unités.
  d: "M60 80 H700 C960 80 960 380 700 380 H300 C40 380 40 680 300 680 H940",
  road: 68,
  avatar: 64,
  slots: [0.13, 0.5, 0.87],
  labelMode: "below",
}

export const roadMobile: RoadConfig = {
  id: "mobile",
  vbW: 400,
  vbH: 640,
  // Serpent vertical à gauche ; le texte occupe la colonne de droite, à côté du chemin.
  d: "M70 30 C70 130 160 130 160 230 S70 330 70 430 S160 530 160 610",
  road: 44,
  avatar: 46,
  slots: [0.17, 0.5, 0.83],
  labelMode: "beside",
  labelX: 205,
}

/** Position d'une étape : valeur imposée, sinon créneau prévu, sinon répartition régulière. */
export function slotAt(cfg: RoadConfig, index: number, total: number, override?: number): number {
  if (override !== undefined) return override
  if (total === 1) return cfg.slots[0] // une seule étape : la première, en haut du parcours
  if (total === cfg.slots.length) return cfg.slots[index]
  return total === 1 ? 0.5 : 0.12 + (index * 0.76) / (total - 1)
}
