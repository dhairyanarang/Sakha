"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The first page of a PDF, drawn to fit.
 *
 * An iframe was showing the browser's viewer zoomed into the top-left of the
 * page, with its own toolbar, and no way to say "just page one, whole". This
 * renders the first page to a canvas at exactly the width available, so the
 * page arrives as a page — nothing cropped, nothing magnified.
 *
 * Only page one. The screen is a preview, not a reader; Open hands the whole
 * document to the viewer the phone already has, which pages properly and
 * costs nothing to maintain.
 *
 * pdfjs is imported inside the effect so it is fetched only by someone who has
 * actually opened a PDF, rather than riding along with every other screen.
 */
export function PdfPreview({ url, onPageCount }: { url: string; onPageCount: (n: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const loading = pdfjs.getDocument({ url });
        const doc = await loading.promise;
        if (cancelled) return;
        cleanup = () => void doc.cleanup();
        onPageCount(doc.numPages);

        const page = await doc.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;

        // Fit the page to the width we actually have, then draw at device
        // resolution so the text is not soft on a retina screen.
        const available = wrap.clientWidth;
        const base = page.getViewport({ scale: 1 });
        const scale = available / base.width;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: scale * dpr });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${available}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const context = canvas.getContext("2d");
        if (!context) return;
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        if (!cancelled) setState("ready");
      } catch {
        if (!cancelled) setState("failed");
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [url, onPageCount]);

  return (
    <div ref={wrapRef} className="w-full">
      {state === "failed" ? (
        <p className="text-body-secondary text-text-secondary p-4">
          We couldn&apos;t show a preview of this one. You can still open or download it.
        </p>
      ) : null}
      <canvas
        ref={canvasRef}
        aria-label="First page of the document"
        className={state === "ready" ? "block w-full" : "sr-only"}
      />
      {state === "loading" ? (
        /* Not a spinner — a plain reserved area while the page draws, so the
           layout does not jump when it arrives. */
        <div className="bg-surface-subtle h-[420px] w-full" aria-hidden />
      ) : null}
    </div>
  );
}
