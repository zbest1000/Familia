// Open-source OCR extraction pipeline.
//
// Strategy:
//   - PDF → pdfjs-dist (Mozilla's PDF.js, Apache-2.0). Robust text-layer
//     extractor used inside Firefox; handles every well-formed PDF we've
//     thrown at it. Most digital lab/discharge PDFs decode in <100ms.
//   - PDF without a usable text layer (scanned) → marked
//     extraction_unavailable. Adding a Poppler/canvas rasterization step
//     to feed Tesseract is Sprint-2 work — the WASM build of Tesseract
//     can't ingest PDFs directly, and node-canvas requires a native
//     toolchain we don't want to mandate on dev laptops.
//   - Image (PNG/JPEG/TIFF/etc.) → Tesseract directly via tesseract.js
//     (Apache-2.0, WASM port of Google's Tesseract).
//
// Structured-field extraction layers regex pattern matching on top of the
// raw text. Phase-2 work would swap regex for a NER model (GLiNER /
// LayoutLM) once we add a Python sidecar. For Sprint-1, regex covers the
// 90/10 case for common lab markers.

import { Logger } from "./logger.js";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createWorker, type Worker } from "tesseract.js";

import {
  isRasterizationAvailable,
  rasterizePdf,
  RasterizationUnavailableError,
} from "./rasterize.js";

const log = new Logger("ocr-extract");

export type ExtractionResult = {
  rawText: string;
  pages: number;
  textLayerSource: "pdf-text-layer" | "tesseract" | "none";
  durationMs: number;
  analytes: ExtractedAnalyte[];
  modelVersion: string;
};

export type ExtractedAnalyte = {
  name: string;
  value: string;
  numericValue: number | null;
  unit: string | null;
  flag: "high" | "low" | "normal" | "unknown" | null;
  confidence: number;
  matchedPattern: string;
};

// Singleton tesseract worker — lazy-initialized on first OCR job.
let tesseractWorker: Worker | null = null;
async function getTesseractWorker(): Promise<Worker> {
  if (tesseractWorker) return tesseractWorker;
  log.info("initializing tesseract worker (eng)");
  tesseractWorker = await createWorker("eng");
  log.info("tesseract worker ready");
  return tesseractWorker;
}

export async function shutdownExtractor(): Promise<void> {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
}

const MIN_USEFUL_TEXT = 40; // chars — below this we treat the text layer as empty

async function ocrPdfViaRasterization(
  buffer: Buffer,
): Promise<{ text: string; pageCount: number }> {
  try {
    const pages = await rasterizePdf({ buffer });
    const worker = await getTesseractWorker();
    const parts: string[] = [];
    for (const p of pages) {
      const result = await worker.recognize(p.png);
      parts.push(result.data.text);
    }
    return { text: parts.join("\n\n"), pageCount: pages.length };
  } catch (err) {
    if (err instanceof RasterizationUnavailableError) {
      log.warn("rasterization unavailable mid-job");
      return { text: "", pageCount: 0 };
    }
    throw err;
  }
}

async function extractPdfText(
  buffer: Buffer,
): Promise<{ text: string; pages: number }> {
  // pdfjs-dist needs a Uint8Array, not a Node Buffer. Slice into a fresh
  // ArrayBuffer to avoid leaking the parent buffer's larger backing store.
  const data = new Uint8Array(buffer.byteLength);
  data.set(buffer);
  const doc = await getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: false,
    disableFontFace: true,
  }).promise;
  try {
    const pages = doc.numPages;
    const parts: string[] = [];
    for (let i = 1; i <= pages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      // pdfjs items have either { str } (TextItem) or { type } (TextMarkedContent).
      const pageText = content.items
        .map((it) => ("str" in it ? it.str : ""))
        .join(" ");
      parts.push(pageText);
      page.cleanup();
    }
    return { text: parts.join("\n"), pages };
  } finally {
    await doc.destroy();
  }
}

export async function extract(args: {
  buffer: Buffer;
  contentType: string;
}): Promise<ExtractionResult> {
  const start = Date.now();
  const isPdf = args.contentType === "application/pdf" || isPdfMagic(args.buffer);
  const isImage = args.contentType.startsWith("image/");

  let rawText = "";
  let pages = 1;
  let source: ExtractionResult["textLayerSource"] = "none";
  let modelVersion = "none";

  if (isPdf) {
    try {
      const parsed = await extractPdfText(args.buffer);
      pages = parsed.pages;
      const usefulChars = parsed.text.replace(/\s+/g, " ").trim().length;
      if (usefulChars >= MIN_USEFUL_TEXT) {
        rawText = parsed.text;
        source = "pdf-text-layer";
        modelVersion = "pdfjs-dist@4";
        log.info({ pages, chars: rawText.length }, "PDF text layer extracted");
      } else if (await isRasterizationAvailable()) {
        // Scanned PDF (no text layer) → rasterize each page and OCR with
        // tesseract. Slower than text-layer extraction (~1-3s/page) but
        // handles the long tail of doctor's-office scans and faxes.
        log.info(
          { pages, textLayerChars: usefulChars },
          "PDF has no text layer; rasterizing for OCR",
        );
        const ocrText = await ocrPdfViaRasterization(args.buffer);
        rawText = ocrText.text;
        pages = ocrText.pageCount;
        source = "tesseract";
        modelVersion = "pdfjs-dist@4+tesseract.js@5/eng";
      } else {
        log.warn(
          { pages, chars: usefulChars },
          "PDF has no text layer and node-canvas unavailable in this runtime; cannot OCR",
        );
      }
    } catch (err) {
      log.warn(
        { err: (err as Error).message },
        "pdfjs-dist failed to parse PDF",
      );
    }
  } else if (isImage) {
    try {
      const worker = await getTesseractWorker();
      const result = await worker.recognize(args.buffer);
      rawText = result.data.text;
      source = "tesseract";
      modelVersion = "tesseract.js@5/eng";
    } catch (err) {
      log.warn({ err: (err as Error).message }, "tesseract failed on image");
    }
  } else {
    log.warn({ contentType: args.contentType }, "unsupported content type");
  }

  const analytes = extractAnalytes(rawText);
  return {
    rawText,
    pages,
    textLayerSource: source,
    durationMs: Date.now() - start,
    analytes,
    modelVersion,
  };
}

function isPdfMagic(buf: Buffer): boolean {
  // PDFs start with %PDF
  return (
    buf.length >= 4 &&
    buf[0] === 0x25 &&
    buf[1] === 0x50 &&
    buf[2] === 0x44 &&
    buf[3] === 0x46
  );
}

// ─── Lab-marker regex extractors ─────────────────────────────────────────

// Pragmatic patterns. Each entry is { pattern, name }. Pattern's first
// capture group is the numeric value, second (optional) is the unit.
// Confidence assigned based on how strict the pattern is.
type Extractor = {
  name: string;
  pattern: RegExp;
  defaultUnit?: string;
  confidence: number;
  flagFromValue?: (n: number) => "high" | "low" | "normal";
};

const EXTRACTORS: Extractor[] = [
  // HbA1c — diabetes
  {
    name: "HbA1c",
    pattern: /\b(?:HbA1c|A1C)[^\d-]{0,15}([0-9]{1,2}\.[0-9])\s*(%)?/i,
    defaultUnit: "%",
    confidence: 0.9,
    flagFromValue: (n) => (n >= 6.5 ? "high" : n < 4 ? "low" : "normal"),
  },
  // Fasting glucose
  {
    name: "Glucose (fasting)",
    pattern: /\b(?:Fasting\s+Glucose|Glucose\s*\(fasting\)|Glucose)[^\d-]{0,15}([0-9]{2,3})\s*(mg\/?dL)?/i,
    defaultUnit: "mg/dL",
    confidence: 0.7,
    flagFromValue: (n) => (n >= 126 ? "high" : n < 70 ? "low" : "normal"),
  },
  // Total cholesterol
  {
    name: "Cholesterol (total)",
    pattern: /\b(?:Total\s+Cholesterol|Cholesterol)[^\d-]{0,15}([0-9]{2,3})\s*(mg\/?dL)?/i,
    defaultUnit: "mg/dL",
    confidence: 0.75,
    flagFromValue: (n) => (n >= 240 ? "high" : "normal"),
  },
  // LDL
  {
    name: "LDL",
    pattern: /\bLDL[^\d-]{0,15}([0-9]{2,3})\s*(mg\/?dL)?/i,
    defaultUnit: "mg/dL",
    confidence: 0.85,
    flagFromValue: (n) => (n >= 160 ? "high" : "normal"),
  },
  // HDL
  {
    name: "HDL",
    pattern: /\bHDL[^\d-]{0,15}([0-9]{2,3})\s*(mg\/?dL)?/i,
    defaultUnit: "mg/dL",
    confidence: 0.85,
    flagFromValue: (n) => (n < 40 ? "low" : "normal"),
  },
  // Triglycerides
  {
    name: "Triglycerides",
    pattern: /\b(?:Triglycerides|TG)[^\d-]{0,15}([0-9]{2,4})\s*(mg\/?dL)?/i,
    defaultUnit: "mg/dL",
    confidence: 0.8,
    flagFromValue: (n) => (n >= 200 ? "high" : "normal"),
  },
  // TSH
  {
    name: "TSH",
    pattern: /\bTSH[^\d-]{0,15}([0-9]+(?:\.[0-9]+)?)\s*(mIU\/?L|µIU\/?mL|uIU\/?mL)?/i,
    defaultUnit: "mIU/L",
    confidence: 0.85,
    flagFromValue: (n) => (n > 4.5 ? "high" : n < 0.4 ? "low" : "normal"),
  },
  // Blood pressure (single shot — captures systolic/diastolic)
  {
    name: "Blood pressure",
    pattern: /\b(?:BP|Blood\s+Pressure)[^\d-]{0,15}([0-9]{2,3}\/[0-9]{2,3})\s*(mmHg)?/i,
    defaultUnit: "mmHg",
    confidence: 0.85,
  },
  // Heart rate
  {
    name: "Heart rate",
    pattern: /\b(?:HR|Heart\s+Rate|Pulse)[^\d-]{0,15}([0-9]{2,3})\s*(bpm)?/i,
    defaultUnit: "bpm",
    confidence: 0.7,
    flagFromValue: (n) => (n > 100 ? "high" : n < 50 ? "low" : "normal"),
  },
  // Vitamin D
  {
    name: "Vitamin D, 25-OH",
    pattern: /\b(?:Vitamin\s+D|25-?OH)[^\d-]{0,15}([0-9]+(?:\.[0-9]+)?)\s*(ng\/?mL)?/i,
    defaultUnit: "ng/mL",
    confidence: 0.75,
    flagFromValue: (n) => (n < 30 ? "low" : "normal"),
  },
];

export function extractAnalytes(text: string): ExtractedAnalyte[] {
  if (!text) return [];
  const found: ExtractedAnalyte[] = [];
  for (const ex of EXTRACTORS) {
    const m = ex.pattern.exec(text);
    if (!m) continue;
    const valueRaw = m[1] ?? "";
    const unitRaw = (m[2] ?? "").trim() || (ex.defaultUnit ?? "") || null;
    const numericValue = /^\d+(\.\d+)?$/.test(valueRaw) ? Number.parseFloat(valueRaw) : null;
    const flag =
      numericValue !== null && ex.flagFromValue ? ex.flagFromValue(numericValue) : null;
    found.push({
      name: ex.name,
      value: valueRaw,
      numericValue,
      unit: unitRaw,
      flag,
      confidence: ex.confidence,
      matchedPattern: ex.pattern.source,
    });
  }
  return found;
}
