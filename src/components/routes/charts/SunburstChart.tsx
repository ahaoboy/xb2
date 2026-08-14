import { useMemo } from "react";
import { Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ELEMENT_META } from "../../../data/elements";
import type { ElementId } from "../../../types";
import type { ComboTreeNode } from "../../../utils/combo";

interface SunburstChartProps {
  roots: ComboTreeNode[];
}

const SIZE = 460;
const R1 = 72; // stage 1 ring
const R2 = 138; // stage 2 ring
const R3 = 200; // stage 3 ring

interface Segment {
  element: ElementId;
  r0: number;
  r1: number;
  a0: number;
  a1: number;
  label: string;
  count: number;
}

function arcPath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const p0 = [cx + r1 * Math.cos(a0), cy + r1 * Math.sin(a0)];
  const p1 = [cx + r1 * Math.cos(a1), cy + r1 * Math.sin(a1)];
  const p2 = [cx + r0 * Math.cos(a1), cy + r0 * Math.sin(a1)];
  const p3 = [cx + r0 * Math.cos(a0), cy + r0 * Math.sin(a0)];
  return `M ${p0[0]} ${p0[1]} L ${p1[0]} ${p1[1]} A ${r1} ${r1} 0 ${large} 1 ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} A ${r0} ${r0} 0 ${large} 0 ${p0[0]} ${p0[1]} Z`;
}

/** Sunburst (radial) chart: center = start element, outward = stages 2 & 3. */
export default function SunburstChart({ roots }: SunburstChartProps) {
  const { t } = useTranslation();
  const center = SIZE / 2;

  const { segments } = useMemo(() => {
    const segments: Segment[] = [];
    const total = roots.reduce((sum, root) => sum + root.routeCount, 0);
    if (total === 0) return { segments };

    let angle = -Math.PI / 2;

    for (const root of roots) {
      const rootSweep = (root.routeCount / total) * Math.PI * 2;
      const rootStart = angle;
      const stage2Total = root.children.reduce((s, c) => s + c.routeCount, 0);

      let a2 = rootStart;
      for (const stage2 of root.children) {
        const s2Sweep = (stage2.routeCount / stage2Total) * rootSweep;
        const s2Start = a2;
        const stage3Total = stage2.children.reduce((s, c) => s + c.routeCount, 0);

        let a3 = s2Start;
        for (const leaf of stage2.children) {
          const s3Sweep = (leaf.routeCount / stage3Total) * s2Sweep;
          segments.push({
            element: leaf.element,
            r0: R2,
            r1: R3,
            a0: a3,
            a1: a3 + s3Sweep,
            label: t(`elements.${leaf.element}`),
            count: leaf.routeCount,
          });
          a3 += s3Sweep;
        }

        segments.push({
          element: stage2.element,
          r0: R1,
          r1: R2,
          a0: s2Start,
          a1: s2Start + s2Sweep,
          label: t(`elements.${stage2.element}`),
          count: stage2.routeCount,
        });
        a2 += s2Sweep;
      }

      segments.push({
        element: root.element,
        r0: 0,
        r1: R1,
        a0: rootStart,
        a1: rootStart + rootSweep,
        label: t(`elements.${root.element}`),
        count: root.routeCount,
      });
      angle += rootSweep;
    }
    return { segments };
  }, [roots, t]);

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, display: "flex", justifyContent: "center", width: "100%" }}
    >
      <Stack spacing={1} sx={{ alignItems: "center", width: "100%" }}>
        {/* Logical coordinates stay fixed; the viewBox scales the whole chart.
            Width = up to the viewport height minus the header (~65px),
            container padding (~48px) and paper padding (~16px), so the chart
            fits the screen exactly. Shrinks only when the container is
            narrower. */}
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{
            width: "min(100%, calc(100vh - 140px))",
            height: "auto",
            maxWidth: "100%",
            display: "block",
          }}
        >
          {segments.map((seg, i) => (
            <path
              key={`${seg.element}-${i}`}
              d={arcPath(center, center, seg.r0, seg.r1, seg.a0, seg.a1)}
              fill={ELEMENT_META[seg.element].color}
              stroke="var(--mui-palette-background-paper)"
              strokeWidth={1.5}
            >
              <title>{`${seg.label} · ${seg.count}`}</title>
            </path>
          ))}
          <circle cx={center} cy={center} r={R1 - 14} fill="var(--mui-palette-background-paper)" />
        </svg>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "center" }}>
          {roots.map((root) => {
            const meta = ELEMENT_META[root.element];
            return (
              <Stack key={root.element} direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: meta.color,
                    display: "inline-block",
                  }}
                />
                <Typography variant="caption">{t(`elements.${root.element}`)}</Typography>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}
