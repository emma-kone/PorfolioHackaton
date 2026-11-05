export type ButterflyOptions = Partial<{
  baseColor: string
  accentColor: string
  density: number
  size: number
  speed: number
  flap: number
  wander: number
  depth: number
  blur: number
  hover: number
  reach: number
  vignette: number
}>

export function startButterflyDrift(
  canvas: HTMLCanvasElement,
  keepEl?: Element | null,
  opts?: ButterflyOptions,
): (() => void) | void
