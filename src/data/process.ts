import type { LogoId } from "@/lib/logos"

export type ProcessStep = {
  id: string
  title: string
  text: string
  /** Logos officiels des outils de l'étape, s'il y en a. */
  tools?: LogoId[]
}

/**
 * ✎ Ma façon de travailler, étape par étape. Ce n'est pas un historique de carrière :
 * ajuste les titres et les textes pour qu'ils décrivent exactement ta méthode.
 */
export const processSteps: ProcessStep[] = [
  {
    id: "ecouter",
    title: "Écouter",
    text: "Comprendre le besoin, le public et le contexte avant de dessiner quoi que ce soit.",
  },
  {
    id: "esquisser",
    title: "Esquisser",
    text: "Parcours, structure des pages, premiers croquis : l'idée prend forme sur le papier.",
  },
  {
    id: "designer",
    title: "Designer",
    text: "Typographie, couleurs, composants : la maquette complète, pensée pour tous les écrans.",
    tools: ["figma"],
  },
  {
    id: "construire",
    title: "Construire",
    text: "Intégration en code propre et responsive dès le départ, du composant à la page.",
    tools: ["react", "typescript", "tailwind"],
  },
  {
    id: "animer",
    title: "Animer",
    text: "Un mouvement n'existe que s'il explique quelque chose : une transition, un retour, une hiérarchie.",
  },
  {
    id: "affiner",
    title: "Affiner",
    text: "Tests sur de vrais écrans, accessibilité, performances, et les petits détails qui font la différence.",
    tools: ["github"],
  },
]
