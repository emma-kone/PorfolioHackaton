import { useCallback, useEffect, useRef, useState } from "react";
import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { SectionHead } from "@/components/ui/section-head";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { roadDesktop, roadMobile, slotAt } from "@/lib/road-paths";
import { avatarSrc, experiences as items } from "@/data/experience";
import { certifications, diplomas } from "@/data/education";

/**
 * Parcours d'expérience épinglé.
 * Structure : un conteneur externe haut (la « durée » du scroll) contient un bloc `sticky` de la
 * hauteur de l'écran. Une SEULE progression (0 → 1, lue sur le scroll du conteneur externe) pilote
 * le tracé bleu, la position du personnage sur la longueur réelle du chemin (getPointAtLength) et
 * l'apparition des étapes. Rien n'intercepte la molette : quand la progression atteint 1, le bloc
 * se désépingle et le scroll normal reprend. Réversible en remontant.
 */

const SKY = "#6CC7FF";
const ROSE = "#FFB3CB";
const INK = "#14120f";
/** Une étape apparaît quand le personnage s'en approche de cette fraction du parcours. */
const REVEAL_LEAD = 0.1;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

type Geo = {
  cfgId: string;
  len: number;
  pts: { x: number; y: number; at: number }[];
};

function Avatar({ size }: { size: number }) {
  const s = size / 64;
  return (
    <g transform={`scale(${s})`}>
      <circle r={34} fill="#fff" />
      {avatarSrc ? (
        <image
          href={avatarSrc}
          x={-30}
          y={-30}
          width={60}
          height={60}
          clipPath="circle(30px at 30px 30px)"
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <>
          <circle cx={0} cy={-31} r={9} fill="#2a1d3a" />
          <circle cy={-3} r={29} fill="#2a1d3a" />
          <ellipse cy={4} rx={24} ry={23} fill="#F8C9A8" />
          <path
            d="M-25 -2 Q-12 -19 0 -12 Q12 -19 25 -2 Q11 -9 0 -6 Q-11 -9 -25 -2Z"
            fill="#2a1d3a"
          />
          <circle
            cx={-10}
            cy={5}
            r={8}
            fill="none"
            stroke="#8C52FF"
            strokeWidth={2}
          />
          <circle
            cx={10}
            cy={5}
            r={8}
            fill="none"
            stroke="#8C52FF"
            strokeWidth={2}
          />
          <circle cx={-10} cy={5} r={2} fill="#2a1d3a" />
          <circle cx={10} cy={5} r={2} fill="#2a1d3a" />
          <path
            d="M-5 17 H5"
            stroke="#2a1d3a"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      )}
    </g>
  );
}

export function Experience() {
  const reduced = useReducedMotion();
  const mobile = useMediaQuery("(max-width: 767px)");
  const cfg = mobile ? roadMobile : roadDesktop;

  const outer = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const roadRef = useRef<SVGPathElement>(null);
  const blueRef = useRef<SVGPathElement>(null);
  const walkerRef = useRef<SVGGElement>(null);

  const [box, setBox] = useState({ w: 0, h: 0 });
  const [geo, setGeo] = useState<Geo | null>(null);
  const [mask, setMask] = useState(reduced ? -1 : 0); // bits des étapes déjà atteintes

  // Taille disponible pour le décor.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setBox({ w: e.contentRect.width, h: e.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Longueur réelle du tracé et position des étapes, mesurées sur un chemin hors écran.
  useEffect(() => {
    const probe = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    probe.setAttribute("d", cfg.d);
    const len = probe.getTotalLength();
    const pts = items.map((it, i) => {
      const at = slotAt(cfg, i, items.length, it.at);
      const p = probe.getPointAtLength(at * len);
      return { x: p.x, y: p.y, at };
    });
    setGeo({ cfgId: cfg.id, len, pts });
  }, [cfg]);

  const scale = box.w ? Math.min(box.w / cfg.vbW, box.h / cfg.vbH) : 0;
  const stageW = cfg.vbW * scale;
  const stageH = cfg.vbH * scale;
  const ready = geo?.cfgId === cfg.id && scale > 0;

  const { scrollYProgress } = useScroll({
    target: outer,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 36,
    mass: 0.3,
  });

  const apply = useCallback(
    (raw: number) => {
      const road = roadRef.current;
      if (!ready || !geo || !road) return;
      // Petite pause au départ et à l'arrivée, puis une progression unique 0 → 1.
      const p = reduced ? 1 : clamp((raw - 0.05) / 0.9);
      const at = p * geo.len;
      if (blueRef.current) {
        blueRef.current.style.strokeDasharray = String(geo.len);
        blueRef.current.style.strokeDashoffset = String(geo.len * (1 - p));
      }
      const pt = road.getPointAtLength(at);
      const a = road.getPointAtLength(Math.max(0, at - 4));
      const b = road.getPointAtLength(Math.min(geo.len, at + 4));
      // Le personnage reste droit ; il se penche légèrement dans le sens de la marche.
      const lean = 7 * Math.cos(Math.atan2(b.y - a.y, b.x - a.x));
      walkerRef.current?.setAttribute(
        "transform",
        `translate(${pt.x} ${pt.y}) rotate(${lean})`,
      );
      setMask(
        geo.pts.reduce(
          (m, s, i) => (reduced || p >= s.at - REVEAL_LEAD ? m | (1 << i) : m),
          0,
        ),
      );
    },
    [ready, geo, reduced],
  );

  useMotionValueEvent(progress, "change", apply);
  useEffect(() => {
    apply(progress.get());
  }, [apply, progress, box.w, box.h]);

  const beside = cfg.labelMode === "beside";
  const labelW = beside
    ? (cfg.vbW - (cfg.labelX ?? 0) - 6) * scale
    : Math.min(340, stageW * 0.62);
  const gap = (cfg.road / 2 + 16) * scale;

  return (
    <>
      <div id="parcours" className="wrap pb-12 pt-24 md:pt-36">
        <SectionHead index="02" label="Parcours" />
        <h2 className="display mt-4 text-[clamp(2rem,4.5vw,3.75rem)]">
          Mon <span className="text-accent">parcours.</span>
        </h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label">Formation</p>
            <ol className="mt-4 grid list-none gap-4">
              {diplomas.map((d) => (
                <li key={d.id} className="rounded-[1.5rem] bg-card p-6 md:p-8">
                  <p className="label flex items-center gap-2 !text-accent tabular-nums">
                    {d.period}
                    {d.current && (
                      <span
                        className="size-1.5 animate-pulse rounded-full bg-accent"
                        aria-label="En cours"
                      />
                    )}
                  </p>
                  <p className="display mt-3 text-xl !leading-snug sm:text-2xl">
                    {d.title}
                  </p>
                  <p className="mt-1 text-sm font-medium">{d.short}</p>
                  {(d.school || d.place) && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {[d.school, d.place].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="label">Certifications</p>
            {certifications.length ? (
              <ul className="mt-4 grid list-none gap-4">
                {certifications.map((c) => (
                  <li key={c.id} className="rounded-[1.5rem] bg-card p-6">
                    <p className="label !text-accent tabular-nums">
                      {c.period}
                    </p>
                    <p className="display mt-3 text-xl !leading-snug">
                      {c.title}
                    </p>
                    {c.issuer && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {c.issuer}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
                Mes premières certifications arrivent bientôt.
              </p>
            )}
          </div>
        </div>
      </div>

      <section
        id="experience"
        ref={outer}
        aria-label="Expérience"
        style={reduced ? undefined : { height: mobile ? "260svh" : "320svh" }}
      >
        <div
          className={cn(
            "flex flex-col overflow-hidden",
            reduced ? "min-h-svh py-24" : "sticky top-0 h-svh pt-24",
          )}
        >
          <div className="wrap w-full">
            <SectionHead index="03" label="Expérience" />
            <h2 className="display mt-4 text-[clamp(2rem,4.5vw,3.75rem)]">
              Mon <span className="text-accent">expérience.</span>
            </h2>
          </div>
          <div
            ref={stage}
            className={cn(
              "relative min-h-0 w-full flex-1",
              reduced && "min-h-[70svh]",
            )}
          >
            {scale > 0 && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ width: stageW, height: stageH }}
              >
                <svg
                  viewBox={`0 0 ${cfg.vbW} ${cfg.vbH}`}
                  className="absolute inset-0 h-full w-full overflow-visible"
                  aria-hidden
                >
                  {/* Chemin rose : l'état de départ. */}
                  <path
                    ref={roadRef}
                    d={cfg.d}
                    fill="none"
                    stroke={ROSE}
                    strokeWidth={cfg.road}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Partie bleue : se dessine derrière le personnage. */}
                  <path
                    ref={blueRef}
                    d={cfg.d}
                    fill="none"
                    stroke={SKY}
                    strokeWidth={cfg.road}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: geo?.len,
                      strokeDashoffset: geo?.len,
                    }}
                  />
                  {/* Ligne centrale en pointillés, exactement sur la trajectoire. */}
                  <path
                    d={cfg.d}
                    fill="none"
                    stroke={INK}
                    strokeWidth={cfg.road > 60 ? 3.5 : 2.5}
                    strokeDasharray="12 12"
                    strokeLinecap="butt"
                  />
                  <g ref={walkerRef}>
                    <Avatar size={cfg.avatar} />
                  </g>
                </svg>

                <ol className="absolute inset-0 list-none">
                  {ready &&
                    items.map((it, i) => {
                      const pt = geo!.pts[i];
                      const below = (it.side ?? "below") === "below";
                      const half = (labelW / 2 / stageW) * 100;
                      const left = beside
                        ? ((cfg.labelX ?? 0) / cfg.vbW) * 100
                        : clamp((pt.x / cfg.vbW) * 100, half, 100 - half);
                      const on = (mask & (1 << i)) !== 0;
                      return (
                        <li
                          key={it.id}
                          className={cn(
                            "absolute transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
                            beside ? "text-left" : "text-center",
                            on ? "opacity-100" : "translate-y-3 opacity-0",
                          )}
                          style={{
                            left: `${left}%`,
                            top: `${(pt.y / cfg.vbH) * 100}%`,
                            width: labelW,
                            marginLeft: beside ? 0 : -labelW / 2,
                            marginTop: beside
                              ? undefined
                              : below
                                ? gap
                                : undefined,
                            transform: beside
                              ? "translateY(-50%)"
                              : below
                                ? undefined
                                : `translateY(calc(-100% - ${gap}px))`,
                          }}
                        >
                          <p
                            className={cn(
                              "label flex items-center gap-2 !text-accent tabular-nums",
                              beside ? "justify-start" : "justify-center",
                            )}
                          >
                            {it.period}
                            {it.demo && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[0.6rem] tracking-wider text-muted-foreground">
                                Exemple
                              </span>
                            )}
                          </p>
                          <p className="display mt-1 text-lg !leading-tight sm:text-xl">
                            {it.role}
                          </p>
                          <p className="mt-0.5 text-sm font-medium">
                            {it.companyFull ? (
                              <abbr
                                title={it.companyFull}
                                className="no-underline"
                              >
                                {it.company}
                              </abbr>
                            ) : (
                              it.company
                            )}
                          </p>
                          {it.companyFull && (
                            <p className="mt-1 text-xs leading-snug text-muted-foreground">
                              {it.companyFull}
                            </p>
                          )}
                          {it.description && scale >= 0.95 && (
                            <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
                              {it.description}
                            </p>
                          )}
                        </li>
                      );
                    })}
                </ol>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
