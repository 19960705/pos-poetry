import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "recordings");
const url = process.env.DEMO_URL || "http://127.0.0.1:8765/pos-poetry/?demo=1";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const events = [];
  const t0 = Date.now();
  const mark = (name) => events.push({ t: +((Date.now() - t0) / 1000).toFixed(3), name });

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--autoplay-policy=no-user-gesture-required",
      "--use-gl=angle",
      "--use-angle=swiftshader-webgl",
      "--ignore-gpu-blocklist",
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: outDir,
      size: { width: 1600, height: 900 },
    },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__posReady === true, null, { timeout: 15000 });
  mark("boot");
  await delay(1800);

  await page.keyboard.press("Enter");
  mark("enter");
  await page.waitForFunction(() => document.getElementById("boot")?.classList.contains("hide"));
  await delay(900);

  await page.mouse.move(380, 360, { steps: 24 });
  await delay(200);
  await page.mouse.move(1280, 500, { steps: 40 });
  await delay(350);
  await page.mouse.move(720, 420, { steps: 28 });
  await delay(400);

  for (const ch of ["6", ".", "6", "6"]) {
    await page.keyboard.press(ch === "." ? "Period" : ch);
    mark("key");
    await delay(280);
  }
  await delay(400);
  await page.keyboard.press("Enter");
  mark("print");
  await page.waitForFunction(
    () => document.getElementById("paper-stage")?.classList.contains("active"),
    null,
    { timeout: 10000 }
  );
  mark("receipt");
  await delay(2800);

  await page.locator("#btn-keep").click({ force: true });
  mark("tear");
  await delay(800);

  for (const ch of ["1", "3", ".", "1", "4"]) {
    await page.keyboard.press(ch === "." ? "Period" : ch);
    mark("key");
    await delay(250);
  }
  await delay(350);
  await page.keyboard.press("Enter");
  mark("print");
  await page.waitForFunction(
    () => document.getElementById("paper-stage")?.classList.contains("active"),
    null,
    { timeout: 10000 }
  );
  mark("receipt");
  await delay(2600);

  await page.locator("#btn-keep").click({ force: true });
  mark("tear");
  await delay(600);
  await page.locator("#btn-drawer").click({ force: true });
  mark("drawer");
  await delay(2400);
  mark("end");

  const video = page.video();
  await page.close();
  const webm = await video.path();
  await context.close();
  await browser.close();

  const eventsPath = path.join(outDir, "demo-events.json");
  fs.writeFileSync(eventsPath, JSON.stringify({ webm, events }, null, 2));
  console.log(webm);
  console.log(eventsPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
