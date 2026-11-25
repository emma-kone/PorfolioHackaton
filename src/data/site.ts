import type { LogoId } from "@/lib/logos"
import profilePhoto from "@/assets/images/profile.jpeg"

/**
 * ✎ Tout ce qui est personnel se règle ici.
 * Les valeurs marquées « À REMPLACER » sont des emplacements, pas de vraies coordonnées.
 */

export type Social = {
  id: string
  label: string
  /** Texte secondaire affiché au verso de la carte. */
  handle: string
  href: string
  brand: LogoId | "mail"
}

const EMAIL = "kignelemma@gmail.com"

export const site = {
  name: "Manou Dev",
  role: "Développeuse Web Frontend & Web Designer",
  statement: "Je dessine l'interface, puis je la code — pour que l'idée arrive intacte à l'écran.",
  /** Mots qui défilent dans « Je transforme une idée en … ». */
  rotating: ["interface", "expérience", "identité visuelle", "interaction"],
  email: EMAIL,
  /** CV en PDF : public/cv-manou-dev.pdf (remplace le fichier pour le mettre à jour). */
  cv: "/cv-manou-dev.pdf",
  /** Photo de profil : src/assets/images/profile.jpeg (remplace le fichier pour la changer). */
  photo: profilePhoto,
  photoAlt: "Portrait de Manou Dev",
  about: {
    title: "Une designer qui code, ou l'inverse.",
    paragraphs: [
      "Je suis développeuse web frontend et web designer. Je conçois les interfaces et je les construis moi-même, du premier croquis au dernier détail d'interaction.",
      "Ce qui m'intéresse : les écrans qui se comprennent sans mode d'emploi, une typographie qui a une raison d'être, un mouvement qui explique plutôt qu'il ne décore.",
    ],
  },
  socials: [
    { id: "github", label: "GitHub", handle: "@emma-kone", href: "https://github.com/emma-kone", brand: "github" },
    {
      id: "linkedin",
      label: "LinkedIn",
      handle: "Kignelman Grâce Emmanuella Koné",
      href: "https://www.linkedin.com/in/kignelman-gr%C3%A2ce-emmanuella-kon%C3%A9-976b0b37b/",
      brand: "linkedin",
    },
    { id: "whatsapp", label: "WhatsApp", handle: "+225 07 13 77 73 18", href: "https://wa.me/2250713777318", brand: "whatsapp" },
    { id: "email", label: "Email", handle: EMAIL, href: `mailto:${EMAIL}`, brand: "mail" },
  ] satisfies Social[],
} as const

export const nav = [
  { id: "accueil", label: "Accueil" },
  { id: "a-propos", label: "À propos" },
  { id: "experience", label: "Expérience" },
  { id: "projets", label: "Projets" },
  { id: "processus", label: "Processus" },
  { id: "competences", label: "Compétences" },
  { id: "contact", label: "Contact" },
] as const

export type SectionId = (typeof nav)[number]["id"]
