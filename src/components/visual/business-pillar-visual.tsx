import { FacilityHudFrame, type HudFocus } from "./facility-hud-frame";

export type PillarVariant = "solution" | "material" | "brand";

type Config = {
  src?: string;
  alt: string;
  tag: string;
  readout: string;
  dataId: string;
  caption: string;
  focal: string;
  focus: HudFocus;
};

const CONFIG: Record<PillarVariant, Config> = {
  solution: {
    src: "/hero-farm-corridor.jpg",
    alt: "정밀 제어 수직 재배 시설",
    tag: "PRECISION FARM",
    readout: "3-IN-1",
    dataId: "FAC-SOL-01",
    caption: "PRECISION CONTROL",
    focal: "center",
    focus: { x: 60, y: 38, metric: "EC 1.4 · 285NM" },
  },
  material: {
    src: "/business-material.jpg",
    alt: "cGMP 원료 표준화 공정",
    tag: "cGMP PROCESS",
    readout: "API",
    dataId: "FAC-MAT-02",
    caption: "QC · STANDARDIZED",
    focal: "center 58%",
    focus: { x: 27, y: 60, metric: "σ < 10%" },
  },
  brand: {
    src: "/scale-hall.jpg",
    alt: "수경 인삼 재배",
    tag: "HYDRO GINSENG",
    readout: "3 SKU",
    dataId: "FAC-BRD-03",
    caption: "BIO-VERIFIED",
    focal: "center 38%",
    focus: { x: 52, y: 46, metric: "Rg1 +8×" },
  },
};

/**
 * Business pillar visual. Thin wrapper over FacilityHudFrame with the per-pillar
 * config (solution / material / brand), so each card head shows a real facility
 * photo under the shared "precisely observed" HUD treatment.
 */
export function BusinessPillarVisual({ variant }: { variant: PillarVariant }) {
  return (
    <FacilityHudFrame
      {...CONFIG[variant]}
      aspectRatio="16 / 9"
      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 90vw, 100vw"
    />
  );
}
