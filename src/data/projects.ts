import avicoo from "@/assets/images/projects/avicoo.jpg"
import kodjara from "@/assets/images/projects/kodjara.png"
import donDeSoi from "@/assets/images/projects/don-de-soi.webp"
import ons from "@/assets/images/projects/ons.webp"
import yagaz from "@/assets/images/projects/yagaz.jpg"
import airCi from "@/assets/images/projects/air-cote-divoire.webp"
import type { ArtPreset } from "@/components/ui/glass-folder-cards"

export type Project = {
  id: string
  title: string
  kind: string
  year?: string
  summary: string
  objective: string
  role: string
  tech: string[]
  /** Images importées depuis src/assets. Vide = emplacements « à ajouter ». */
  screenshots: string[]
  url?: string
  /** Texte du bouton du lien (défaut : « Voir le projet »). */
  urlLabel?: string
  github?: string
  /** Mention affichée sur la fiche (ex. « Projet entrepreneurial », « Concept »). */
  status?: string
}

export type ProjectCategory = {
  id: string
  label: string
  description: string
  art: ArtPreset
  seed: number
  projects: Project[]
}

const WEB_TECH = ["Vue.js", "HTML", "CSS", "TypeScript"]
const WEB_ROLE = "Web designer et développeuse frontend."

/** ✎ Un dossier affiche au maximum ses 4 derniers projets. */
export const categories: ProjectCategory[] = [
  {
    id: "web",
    label: "Sites web",
    description: "Plateformes et sites institutionnels, du design à l'intégration.",
    art: "ember",
    seed: 11,
    projects: [
      {
        id: "avicoo",
        title: "Avicoo",
        kind: "Plateforme e-commerce",
        status: "Projet entrepreneurial",
        summary:
          "Plateforme destinée aux fermiers qui possèdent des poulaillers : ils vendent leurs œufs au prix d'usine, directement à des grossistes, semi-grossistes ou à des clients particuliers qui souhaitent commander quelques plaquettes.",
        objective:
          "Supprimer les intermédiaires entre producteurs et acheteurs : des prix justes pour les fermiers, et une commande simple quelle que soit la quantité.",
        role: WEB_ROLE,
        tech: WEB_TECH,
        screenshots: [avicoo],
      },
      {
        id: "kodjara",
        title: "Kodjara",
        kind: "Plateforme de dématérialisation",
        summary:
          "Plateforme dédiée à la simplification des démarches administratives en Côte d'Ivoire. Pour chaque procédure, le citoyen retrouve toutes les étapes à suivre et la liste des documents requis.",
        objective:
          "Rendre les services administratifs plus accessibles : informer clairement, au même endroit, sans avoir à se déplacer pour savoir comment faire.",
        role: WEB_ROLE,
        tech: WEB_TECH,
        screenshots: [kodjara],
        url: "https://kodjara.com/",
      },
      {
        id: "don-de-soi",
        title: "ONG Le Don de Soi",
        kind: "Site institutionnel",
        summary:
          "Site de l'ONG Le Don de Soi, organisation humanitaire et sociale en Côte d'Ivoire qui vient en aide aux personnes vulnérables : familles démunies, enfants, personnes ayant des difficultés d'accès aux soins.",
        objective:
          "Présenter l'organisation et ses missions, faciliter la collecte de dons et le recrutement de bénévoles, communiquer sur ses activités et renforcer sa crédibilité auprès du public et des partenaires.",
        role: WEB_ROLE,
        tech: WEB_TECH,
        screenshots: [donDeSoi],
        url: "https://ledondesoi.org/",
      },
      {
        id: "ons",
        title: "Office National des Sports",
        kind: "Site institutionnel",
        summary:
          "Site de l'Office National des Sports (ONS), dédié à la promotion et à la gestion des activités sportives en Côte d'Ivoire : institution, missions, infrastructures, actualités et réservation d'espaces.",
        objective:
          "Faciliter l'accès du public aux informations et aux services de l'ONS, et présenter ses infrastructures sportives de façon claire.",
        role: WEB_ROLE,
        tech: WEB_TECH,
        screenshots: [ons],
        url: "https://ons.ms-sigs.org/",
      },
    ],
  },
  {
    id: "mobile",
    label: "Applications mobiles",
    description: "Applications Android, de la conception au développement.",
    art: "dusk",
    seed: 5,
    projects: [
      {
        id: "yagaz",
        title: "YaGaz",
        kind: "Application Android",
        status: "Réalisée avec l'IA",
        summary:
          "Application mobile de recherche de dépôts de gaz en Côte d'Ivoire : localiser les vendeurs à proximité, voir les types de bouteilles disponibles et leurs prix, vérifier la disponibilité et contacter directement les commerçants.",
        objective:
          "Simplifier l'approvisionnement en gaz domestique : trouver vite un dépôt ouvert près de soi, avec la bouteille voulue en stock.",
        role: "Conception de l'application, réalisée avec l'aide de l'IA.",
        tech: ["Android", "IA"],
        screenshots: [yagaz],
      },
    ],
  },
  {
    id: "design",
    label: "Design",
    description: "Maquettes et idées de design.",
    art: "verdant",
    seed: 7,
    projects: [
      {
        id: "air-ci",
        title: "Air Côte d'Ivoire",
        kind: "Concept de site web",
        status: "Concept — idée imaginée",
        summary:
          "Design imaginé pour le site web d'Air Côte d'Ivoire : une page d'accueil immersive, un moteur de réservation de vol intégré et une navigation claire.",
        objective:
          "Un exercice de design, pas une commande : repenser l'expérience de réservation pour qu'elle soit simple et à l'image de la compagnie.",
        role: "Web design.",
        tech: ["UI Design"],
        screenshots: [airCi],
        urlLabel: "Voir la maquette Figma",
        url: "https://www.figma.com/design/mJUCPZv9Jznh68GzAzRdKv/Untitled?node-id=0-1&t=PwHfMxAMDNNhRaCU-1",
      },
    ],
  },
]
