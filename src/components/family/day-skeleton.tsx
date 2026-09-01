/**
 * The shape of a day, while the day is being fetched.
 *
 * Only the two things that belong to a date — the medicines and the
 * measurements. The date bar above it and the documents below it are not
 * waiting on anything, so neither is skeletonised: documents are not date
 * specific and blanking them would suggest they had gone.
 *
 * Static, not pulsing. A placeholder that moves is one more thing happening on
 * a screen somebody is trying to read, and this is usually on screen for a few
 * hundred milliseconds. The blocks are sized to the rows they stand in for, so
 * the content does not jump when it arrives.
 */
function Line({ className }: { className: string }) {
  return <span className={`bg-surface-subtle block rounded-full ${className}`} />;
}

function Row({ lines }: { lines: string[] }) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-surface-subtle block size-11 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {lines.map((w, i) => (
          <Line key={i} className={`h-3 ${w}`} />
        ))}
      </div>
    </div>
  );
}

function Card({ rows, lines }: { rows: number; lines: string[] }) {
  return (
    <div className="bg-surface-default border-border-soft flex flex-col gap-[18px] rounded-xl border-[0.5px] px-3 py-[18px]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex flex-col gap-[18px]">
          {i > 0 ? <div className="border-border-default border-t" /> : null}
          <Row lines={lines} />
        </div>
      ))}
    </div>
  );
}

export function DaySkeleton() {
  return (
    <div aria-hidden className="flex shrink-0 flex-col gap-6">
      <section className="flex shrink-0 flex-col gap-3">
        <Line className="h-3 w-[120px]" />
        <Card rows={3} lines={["w-[45%]", "w-[30%]"]} />
      </section>
      <section className="flex shrink-0 flex-col gap-2.5">
        <Line className="h-3 w-[100px]" />
        <Card rows={3} lines={["w-[35%]", "w-[55%]", "w-[40%]"]} />
      </section>
    </div>
  );
}
