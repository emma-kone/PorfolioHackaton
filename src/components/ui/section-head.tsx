import { cn } from "@/lib/utils"

/** Étiquette de section : une pastille arrondie avec l'index et le nom. Pas de filet. */
export function SectionHead({ index, label, className, tone = "default" }: { index: string; label: string; className?: string; tone?: "default" | "inverted" }) {
  return (
    <p
      className={cn(
        "label inline-flex items-center gap-2.5 rounded-full px-4 py-2",
        tone === "inverted" ? "bg-background/10 !text-background/80" : "bg-muted",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      <span className="tabular-nums">{index}</span>
      <span>{label}</span>
    </p>
  )
}
