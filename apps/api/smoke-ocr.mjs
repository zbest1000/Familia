// One-shot OCR smoke test. Run from apps/api directory (where pdfkit is).
// Usage: node smoke-ocr.mjs

import { writeFileSync, readFileSync } from "node:fs";
import PDFDocument from "pdfkit";

const API = "http://localhost:3000";

// 1. Generate the test PDF.
const pdfPath = "smoke-test-lab.pdf";
await new Promise((resolve) => {
  const doc = new PDFDocument({ size: "LETTER", margin: 60 });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  doc.on("end", () => {
    writeFileSync(pdfPath, Buffer.concat(chunks));
    resolve();
  });
  doc.fontSize(20).text("Quest Diagnostics — Lab Report").moveDown();
  doc.fontSize(12).text("Patient: Maya Reyes").moveDown(0.3);
  doc.text("Specimen Date: 2026-04-20").moveDown();
  doc.fontSize(14).text("Results:").moveDown(0.5);
  doc.fontSize(12);
  doc.text("HbA1c: 6.7 %");
  doc.text("Cholesterol: 195 mg/dL");
  doc.text("LDL: 110 mg/dL");
  doc.text("HDL: 55 mg/dL");
  doc.text("Triglycerides: 180 mg/dL");
  doc.text("TSH: 2.1 mIU/L");
  doc.text("Vitamin D: 22 ng/mL");
  doc.end();
});
console.log(`generated ${pdfPath} (${readFileSync(pdfPath).length} bytes)`);

// 2. Sign in as Maya via OTP.
async function signinMaya() {
  const startRes = await fetch(`${API}/auth/signin/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "maya@familia-dev.example.com" }),
  });
  const start = await startRes.json();
  // Read OTP from API stderr file written by the run script.
  const log = readFileSync(
    "C:/Users/Baguocha/AppData/Local/Temp/familia-api.out",
    "utf8",
  );
  const m = /purpose=signin email=maya@familia-dev.example.com code=(\d{6})/g.exec(log);
  // grep all matches and use the LAST one (most recent challenge)
  let lastCode = null;
  const re = /purpose=signin email=maya@familia-dev.example.com code=(\d{6})/g;
  let mm;
  while ((mm = re.exec(log)) !== null) lastCode = mm[1];
  if (!lastCode) throw new Error("no OTP in API log");
  const verifyRes = await fetch(`${API}/auth/signin/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeId: start.challengeId, code: lastCode }),
  });
  if (!verifyRes.ok) throw new Error(`signin verify failed: ${verifyRes.status}`);
  return verifyRes.json();
}

const session = await signinMaya();
console.log(`signed in as ${session.userId}`);

// 3. Multipart upload.
const fd = new FormData();
const fileBlob = new Blob([readFileSync(pdfPath)], { type: "application/pdf" });
fd.append("file", fileBlob, "smoke-test-lab.pdf");
fd.append("kind", "lab_report");
fd.append("title", "Quest Diagnostics 2026-04-20 (smoke)");

const upRes = await fetch(`${API}/vault/documents`, {
  method: "POST",
  headers: { Authorization: `Bearer ${session.accessToken}` },
  body: fd,
});
if (!upRes.ok) {
  console.error("upload failed:", upRes.status, await upRes.text());
  process.exit(1);
}
const doc = await upRes.json();
console.log(`uploaded: id=${doc.id} state=${doc.extractionState} size=${doc.sizeBytes}`);

// 4. Poll for extraction.
let detail = null;
for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 1500));
  const r = await fetch(`${API}/vault/documents/${doc.id}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  detail = await r.json();
  if (detail.extractionState !== "ocr_pending") break;
  process.stdout.write(".");
}
console.log("");
console.log(`final extractionState: ${detail.extractionState}`);
if (detail.extraction) {
  const e = detail.extraction;
  console.log(`  kind: ${e.kind}`);
  console.log(`  modelVersion: ${e.modelVersion}`);
  console.log(`  confidence: ${e.overallConfidence}`);
  console.log(`  pages: ${e.data?.pages}`);
  console.log(`  textLayerSource: ${e.data?.textLayerSource}`);
  console.log(`  rawTextLength: ${e.data?.rawTextLength}`);
  console.log(`  durationMs: ${e.data?.durationMs}`);
  console.log("  analytes:");
  for (const a of e.data?.analytes ?? []) {
    console.log(
      `    - ${a.name}: ${a.value}${a.unit ? " " + a.unit : ""} [flag=${a.flag}, conf=${a.confidence}]`,
    );
  }
} else {
  console.log("(no staged extraction)");
}
