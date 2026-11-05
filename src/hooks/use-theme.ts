import { useSyncExternalStore } from "react"

type Theme = "light" | "dark"

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => obs.disconnect()
}

const snapshot = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light")

/** Thème actif, lu depuis la classe `.dark` de <html> (posée par le script de index.html et le bouton). */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, snapshot, () => "light")
}
