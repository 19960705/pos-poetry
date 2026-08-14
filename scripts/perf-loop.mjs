import { chromium } from "playwright";

const url = process.env.DEMO_URL || "http://127.0.0.1:8765/pos-poetry/?perf=1";

function stats(ms) {
  const s = [...ms].sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))];
  const avg = s.reduce((a, b) => a + b, 0) / s.length;
  return {
    n: s.length,
    avg: +avg.toFixed(1),
    p50: +q(0.5).toFixed(1),
    p95: +q(0.95).toFixed(1),
    max: +s[s.length - 1].toFixed(1),
  };
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader-webgl", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__posReady === true, null, { timeout: 15000 });
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.getElementById("boot")?.classList.contains("hide"));
  await page.waitForTimeout(400);

  const idle = await page.evaluate(async () => {
    const samples = [];
    let last = performance.now();
    await new Promise((resolve) => {
      const start = performance.now();
      const tick = (t) => {
        samples.push(t - last);
        last = t;
        if (t - start < 1500) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    return samples.slice(2);
  });

  await page.keyboard.type("6.66", { delay: 20 });
  const printP = page.evaluate(async () => {
    const samples = [];
    let last = performance.now();
    const start = performance.now();
    await new Promise((resolve) => {
      const tick = (t) => {
        samples.push(t - last);
        last = t;
        const active = document.getElementById("paper-stage")?.classList.contains("active");
        if (active || t - start > 5000) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    return samples.slice(2);
  });
  await page.keyboard.press("Enter");
  const printing = await printP;

  const report = { idle: stats(idle), print: stats(printing) };
  console.log(JSON.stringify(report, null, 2));

  const fail =
    report.idle.p95 > 28 ||
    report.print.p95 > 40 ||
    report.idle.max > 50 ||
    report.print.max > 80;
  await browser.close();
  process.exit(fail ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
