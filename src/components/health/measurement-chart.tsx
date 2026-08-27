import { TZ } from "@/lib/today";

/**
 * The progression chart, hand-built as inline SVG.
 *
 * No charting library: every one of them arrives with its own visual system,
 * which is exactly what "one visual system only" rules out. What this needs —
 * a line, some dots, five dashed gridlines — is less code than configuring a
 * library to stop looking like itself.
 *
 * Pure geometry, no hooks, so it renders on the server with the page.
 *
 * It is never the only way to read the data. Every value is listed underneath
 * in the history, so nothing here depends on seeing a line or telling two
 * colours apart, and the whole figure carries a written summary for anyone who
 * cannot see it at all.
 */

/** Matches the Figma frame: 346 wide inside the card, 200 tall. */
const W = 346;
const H = 200;
/**
 * The right edge stops short of the viewBox by the dot radius. Running the
 * plot to the full width put the newest reading's dot half outside the SVG,
 * where it was clipped down the middle — and the newest reading is the one
 * she is most likely to be looking for.
 */
const DOT_R = 4;
const PLOT = { left: 30, right: W - DOT_R - 2, top: 33, bottom: 170 };
const LABEL_Y = 193;
const UNIT_Y = 7;

/** Past this many points the dots merge into the line and only add noise. */
const MAX_DOTS = 15;
/** Older readings than this are still in the history list, just not plotted. */
const MAX_POINTS = 30;

export type Series = {
  label: string;
  color: string;
  values: (number | null)[];
};

export type ChartPoint = { at: number; values: (number | null)[] };

function niceStep(rough: number): number {
  if (!(rough > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

/**
 * A rounded domain that always has height.
 *
 * A flat line — every reading identical, or a single reading — would otherwise
 * give min === max and divide by zero. It gets padded instead, so the line
 * sits sensibly in the middle rather than pinned to an edge or vanishing.
 */
function niceDomain(min: number, max: number, ticks = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 1, step: 1, lines: [0, 1] };
  }
  if (min === max) {
    const pad = Math.abs(min) * 0.1 || 1;
    min -= pad;
    max += pad;
  }
  const step = niceStep((max - min) / (ticks - 1));
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;

  const lines: number[] = [];
  // Rounded at each step: repeated addition of 0.5 drifts, and a gridline
  // labelled 76.50000000000001 is not a gridline anyone wants.
  for (let v = lo; v <= hi + step / 2; v += step) {
    lines.push(Number(v.toFixed(6)));
  }
  return { min: lo, max: hi, step, lines };
}

function labelFor(value: number): string {
  return String(Number(value.toFixed(6)));
}

/** Dates get coarser as the span widens, so labels stay readable and distinct. */
function dateFormatter(spanMs: number): (d: Date) => string {
  const day = 86_400_000;
  if (spanMs <= day) {
    return (d) =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true,
      }).format(d);
  }
  if (spanMs <= 365 * day) {
    return (d) =>
      new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric" }).format(d);
  }
  return (d) =>
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", year: "numeric" }).format(d);
}

export function MeasurementChart({
  points,
  series,
  unit,
  summary,
}: {
  /** Chronological, oldest first. */
  points: ChartPoint[];
  series: Series[];
  unit: string;
  summary: string;
}) {
  // Nothing to plot. The caller shows "No readings yet" instead.
  if (points.length === 0) return null;

  const plotted = points.slice(-MAX_POINTS);
  const showDots = plotted.length <= MAX_DOTS;

  const allValues = plotted.flatMap((p) => p.values.filter((v): v is number => v != null));
  if (allValues.length === 0) return null;

  const y = niceDomain(Math.min(...allValues), Math.max(...allValues));
  const firstAt = plotted[0].at;
  const lastAt = plotted[plotted.length - 1].at;
  const span = lastAt - firstAt;

  const xFor = (at: number) =>
    // A single reading, or several at the same instant, has no span to spread
    // across — it sits in the middle rather than dividing by zero.
    span === 0
      ? (PLOT.left + PLOT.right) / 2
      : PLOT.left + ((at - firstAt) / span) * (PLOT.right - PLOT.left);

  const yFor = (value: number) =>
    PLOT.bottom - ((value - y.min) / (y.max - y.min)) * (PLOT.bottom - PLOT.top);

  const format = dateFormatter(span);
  const xTickCount = span === 0 ? 1 : 5;
  const xTicks = Array.from({ length: xTickCount }, (_, i) => {
    const at = xTickCount === 1 ? firstAt : firstAt + (span * i) / (xTickCount - 1);
    return { at, x: xFor(at), text: format(new Date(at)) };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={summary}
    >
      <text x={0} y={UNIT_Y} dominantBaseline="middle" className="fill-[#333333] text-[12px] font-semibold">
        {unit}
      </text>

      {y.lines.map((value) => (
        <g key={value}>
          <line
            x1={PLOT.left}
            x2={PLOT.right}
            y1={yFor(value)}
            y2={yFor(value)}
            stroke="var(--color-chart-gridline)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <text
            x={0}
            y={yFor(value)}
            dominantBaseline="middle"
            className="fill-[#808080] text-[12px]"
          >
            {labelFor(value)}
          </text>
        </g>
      ))}

      {series.map((s, si) => {
        const pts = plotted
          .map((p, i) => ({ v: p.values[si], x: xFor(p.at), i }))
          .filter((p): p is { v: number; x: number; i: number } => p.v != null);
        if (pts.length === 0) return null;

        return (
          <g key={s.label}>
            {/* One reading draws no line — there is nothing to join. */}
            {pts.length > 1 ? (
              <polyline
                points={pts.map((p) => `${p.x},${yFor(p.v)}`).join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {showDots || pts.length === 1
              ? pts.map((p) => (
                  <circle key={p.i} cx={p.x} cy={yFor(p.v)} r={DOT_R} fill={s.color} />
                ))
              : null}
          </g>
        );
      })}

      {xTicks.map((t, i) => (
        <text
          key={i}
          x={t.x}
          y={LABEL_Y}
          // The end labels would otherwise hang off the plot and get clipped.
          textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
          className="fill-[#808080] text-[12px]"
        >
          {t.text}
        </text>
      ))}
    </svg>
  );
}
