// Rasterize PDF pages to PNG buffers so tesseract.js can OCR them.
//
// Used when a PDF has no usable text layer (scanned documents). Lazy-imports
// node-canvas so the worker still installs and runs in dev environments where
// the native cairo/pixman toolchain is unavailable (e.g. Windows laptops
// without MSVC + GTK). Production runs in a Linux container where the
// Dockerfile installs libcairo/libjpeg/libpango/libgif and canvas builds.
//
// Types are intentionally loose: canvas is an optional dep so its types
// aren't guaranteed to be present at compile time, and pdfjs-dist's render
// signature doesn't surface `canvasFactory` in its public typings even
// though the runtime accepts it.

import { Logger } from "./logger.js";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const log = new Logger("ocr-rasterize");

export class RasterizationUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RasterizationUnavailableError";
  }
}

// `any` because the optional dep isn't guaranteed to be installed at compile
// time. The runtime type matches the documented node-canvas API.
type CanvasModule = any;

let canvasModulePromise: Promise<CanvasModule | null> | null = null;
async function loadCanvas(): Promise<CanvasModule | null> {
  if (canvasModulePromise) return canvasModulePromise;
  canvasModulePromise = (async () => {
    try {
      // Dynamic import keeps pnpm + tsc happy when the optional dep isn't built.
      const mod = await import("canvas" as string);
      log.info("node-canvas loaded; rasterized OCR available");
      return mod;
    } catch (err) {
      log.warn(
        { err: (err as Error).message },
        "node-canvas not available; rasterized OCR disabled (PDFs without text layers will be marked extraction_unavailable)",
      );
      return null;
    }
  })();
  return canvasModulePromise;
}

export async function isRasterizationAvailable(): Promise<boolean> {
  return (await loadCanvas()) !== null;
}

// pdfjs-dist needs a CanvasFactory abstraction so it can request canvases of
// arbitrary sizes from the host. This is the standard Node shim — see the
// example in pdfjs-dist/examples/node/pdf2png.mjs.
function makeCanvasFactory(canvasMod: CanvasModule) {
  return class NodeCanvasFactory {
    create(width: number, height: number) {
      const c = canvasMod.createCanvas(width, height);
      return { canvas: c, context: c.getContext("2d") };
    }
    reset(canvasAndContext: any, width: number, height: number) {
      canvasAndContext.canvas.width = width;
      canvasAndContext.canvas.height = height;
    }
    destroy(canvasAndContext: any) {
      if (canvasAndContext.canvas) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
      }
      canvasAndContext.canvas = null;
      canvasAndContext.context = null;
    }
  };
}

export type RasterizedPage = {
  pageNumber: number;
  width: number;
  height: number;
  png: Buffer;
};

export async function rasterizePdf(args: {
  buffer: Buffer;
  scale?: number;
  maxPages?: number;
}): Promise<RasterizedPage[]> {
  const canvasMod = await loadCanvas();
  if (!canvasMod) {
    throw new RasterizationUnavailableError(
      "node-canvas is not installed in this runtime",
    );
  }
  const Factory = makeCanvasFactory(canvasMod);

  const data = new Uint8Array(args.buffer.byteLength);
  data.set(args.buffer);

  const factoryInstance = new Factory();
  const docOpts = {
    data,
    isEvalSupported: false,
    useSystemFonts: false,
    disableFontFace: true,
    canvasFactory: factoryInstance,
  } as any;
  const doc = await getDocument(docOpts).promise;

  const scale = args.scale ?? 2; // 2x produces ~150 DPI on letter — good for tesseract
  const maxPages = args.maxPages ?? 20; // hard cap; bigger docs are sliced
  const pageCount = Math.min(doc.numPages, maxPages);
  const pages: RasterizedPage[] = [];

  try {
    for (let i = 1; i <= pageCount; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvasAndContext = factoryInstance.create(
        Math.ceil(viewport.width),
        Math.ceil(viewport.height),
      );
      const renderOpts = {
        canvasContext: canvasAndContext.context,
        viewport,
        canvasFactory: factoryInstance,
      } as any;
      await page.render(renderOpts).promise;
      const png = canvasAndContext.canvas.toBuffer("image/png") as Buffer;
      pages.push({
        pageNumber: i,
        width: canvasAndContext.canvas.width,
        height: canvasAndContext.canvas.height,
        png,
      });
      factoryInstance.destroy(canvasAndContext);
      page.cleanup();
    }
    return pages;
  } finally {
    await doc.destroy();
  }
}
