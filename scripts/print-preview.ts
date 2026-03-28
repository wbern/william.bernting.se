/**
 * Print-layout preview: generates a PDF and full-page screenshot
 * for visual verification of @media print styles.
 *
 * Usage:
 *   pnpm print:preview                # builds site, captures main page
 *   pnpm print:preview --dev          # uses running dev server at localhost:4321
 *   pnpm print:preview --page=/cv     # captures /cv route
 *   pnpm print:preview --dev --page=/cv
 *
 * Output (gitignored, not served):
 *   print-preview.pdf / cv-preview.pdf   — A4 PDF
 *   print-preview.png / cv-preview.png   — full-page screenshot
 */

import { chromium } from "playwright";
import { execSync, spawn, type ChildProcess } from "child_process";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");

const isDev = process.argv.includes("--dev");
const pageArg = process.argv.find((a) => a.startsWith("--page="));
const pagePath = pageArg ? pageArg.replace("--page=", "") : "/";

// Derive output filenames from page path
const prefix = pagePath === "/" ? "print-preview" : pagePath.replace(/^\//, "").replace(/\//g, "-") + "-preview";
const PDF_OUT = resolve(ROOT, `${prefix}.pdf`);
const PNG_OUT = resolve(ROOT, `${prefix}.png`);

const PORT = 4400 + Math.floor(Math.random() * 100);
const BASE_URL = isDev ? "http://localhost:4321" : `http://localhost:${PORT}`;

let server: ChildProcess | null = null;

async function waitForServer(url: string, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

function cleanup() {
  if (server && !server.killed) {
    server.kill("SIGKILL");
  }
}

async function main() {
  process.on("exit", cleanup);
  process.on("SIGINT", () => { cleanup(); process.exit(1); });
  process.on("SIGTERM", () => { cleanup(); process.exit(1); });

  try {
    if (!isDev) {
      console.log("Building site...");
      execSync("pnpm build", { cwd: ROOT, stdio: "inherit" });

      console.log(`Starting preview server on port ${PORT}...`);
      server = spawn("pnpm", ["preview", "--port", String(PORT)], {
        cwd: ROOT,
        stdio: "pipe",
      });
    }

    const targetUrl = `${BASE_URL}${pagePath}`;
    console.log(`Waiting for server at ${BASE_URL}...`);
    await waitForServer(BASE_URL);
    console.log("Server ready.");

    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    await page.emulateMedia({ media: "print", colorScheme: "light" });
    await page.waitForTimeout(300); // let print layout settle

    await page.screenshot({ path: PNG_OUT, fullPage: true });
    console.log(`Screenshot: ${PNG_OUT}`);

    await page.pdf({
      path: PDF_OUT,
      format: "A4",
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
      printBackground: true,
      preferCSSPageSize: true,
    });

    console.log(`PDF: ${PDF_OUT}`);
    await browser.close();
  } finally {
    cleanup();
  }
}

main().catch((err) => {
  console.error(err);
  cleanup();
  process.exit(1);
});
