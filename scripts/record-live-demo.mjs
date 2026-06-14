import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const demoPath = join(root, "marketing", "app-store-live-demo", "index.html");
const outDir = join(root, "marketing", "app-store-walkthrough");
const renderDir = join(outDir, "_render", "live-recording");
const framesDir = join(renderDir, "frames");
const outputVideo = join(outDir, "walkthrough.mp4");

const captureFps = 6;
const chromeCandidates = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  process.env.CHROME_BIN,
].filter(Boolean);

const chromePath = chromeCandidates.find((candidate) => existsSync(candidate));
if (!chromePath) throw new Error("Could not find Google Chrome or Chromium.");
if (!existsSync(demoPath)) throw new Error(`Missing demo HTML: ${demoPath}`);

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: "pipe" });
}

async function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolvePort(address.port));
    });
    server.on("error", reject);
  });
}

async function fetchJson(url, retries = 80) {
  let lastError;
  for (let i = 0; i < retries; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(125);
  }
  throw lastError;
}

function createCdpClient(wsUrl) {
  return new Promise((resolveClient, reject) => {
    const ws = new WebSocket(wsUrl);
    let nextId = 1;
    const pending = new Map();
    const listeners = new Map();

    ws.addEventListener("open", () => {
      resolveClient({
        send(method, params = {}) {
          const id = nextId;
          nextId += 1;
          ws.send(JSON.stringify({ id, method, params }));
          return new Promise((resolve, rejectSend) => {
            pending.set(id, { resolve, reject: rejectSend, method });
          });
        },
        waitFor(method, timeoutMs = 15000) {
          return new Promise((resolve, rejectWait) => {
            const timer = setTimeout(() => {
              const list = listeners.get(method) ?? [];
              listeners.set(method, list.filter((entry) => entry.resolve !== resolve));
              rejectWait(new Error(`Timed out waiting for ${method}`));
            }, timeoutMs);
            const list = listeners.get(method) ?? [];
            list.push({
              resolve(value) {
                clearTimeout(timer);
                resolve(value);
              },
            });
            listeners.set(method, list);
          });
        },
        close() {
          ws.close();
        },
      });
    });

    ws.addEventListener("message", (message) => {
      const payload = JSON.parse(message.data);
      if (payload.id && pending.has(payload.id)) {
        const request = pending.get(payload.id);
        pending.delete(payload.id);
        if (payload.error) request.reject(new Error(`${request.method}: ${payload.error.message}`));
        else request.resolve(payload.result ?? {});
        return;
      }
      if (payload.method && listeners.has(payload.method)) {
        const list = listeners.get(payload.method);
        listeners.set(payload.method, []);
        for (const listener of list) listener.resolve(payload.params ?? {});
      }
    });

    ws.addEventListener("error", reject);
  });
}

function formatSrtTime(seconds) {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function writeCaptionFiles(cues, durationSeconds) {
  if (cues.length) cues[cues.length - 1].end = durationSeconds;
  const srt = [];
  const transcript = [];
  cues.forEach((cue, index) => {
    srt.push(String(index + 1));
    srt.push(`${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}`);
    srt.push(cue.text);
    srt.push("");
    transcript.push(`[${formatSrtTime(cue.start).replace(",", ".")} - ${formatSrtTime(cue.end).replace(",", ".")}] ${cue.text}`);
  });
  writeFileSync(join(outDir, "walkthrough-captions.srt"), srt.join("\n"), "utf8");
  writeFileSync(join(outDir, "walkthrough-transcript.txt"), transcript.join("\n"), "utf8");
}

function writeUploadInstructions() {
  writeFileSync(join(outDir, "youtube-upload-instructions.md"), `# YouTube upload instructions

Upload this file:

\`${outputVideo}\`

Set visibility:

\`Unlisted\`

Recommended title:

\`Margin Sentinel Shopify App Store Screencast\`

Recommended description:

\`\`\`
Margin Sentinel is a Shopify embedded app for catalog margin protection.

This screencast shows real clicks in a local reviewer demo:
1. Dashboard scan with issues, inventory risk, and suggested prices
2. Finding selection and actionable fix list
3. Supplier import preview
4. Cost-change what-if
5. Pricing and Shopify billing path
6. Export CSV and next steps

Margin Sentinel is read-only for product pricing. It reads Shopify product and inventory data, Shopify unit cost, and merchant-imported supplier costs. It does not change product prices automatically.
\`\`\`

After upload:

1. Copy the unlisted YouTube video URL.
2. Paste it into Shopify's Screencast URL field.
3. Click Save.
4. Submit the app listing for review.
`, "utf8");

  writeFileSync(join(outDir, "youtube-url-to-paste.txt"), `Final Shopify Screencast URL:

Paste the unlisted YouTube URL here after upload:

https://youtu.be/REPLACE_AFTER_UPLOAD
`, "utf8");

  writeFileSync(join(outDir, "upload-checklist.txt"), "Upload MP4 to YouTube as Unlisted -> paste link into Shopify Screencast URL -> Save -> Submit.\n", "utf8");
}

async function main() {
  rmSync(renderDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });

  const port = await getFreePort();
  const userDataDir = join(renderDir, "chrome-profile");
  const fileUrl = pathToFileURL(demoPath).href;
  const chrome = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1600,900",
    fileUrl,
  ], { stdio: ["ignore", "ignore", "pipe"] });

  try {
    await fetchJson(`http://127.0.0.1:${port}/json/version`);
    let targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
    let target = targets.find((entry) => entry.type === "page" && entry.url === fileUrl) ?? targets.find((entry) => entry.type === "page");
    if (!target) throw new Error("No Chrome page target found.");

    const cdp = await createCdpClient(target.webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false });
    const loaded = cdp.waitFor("Page.loadEventFired", 15000).catch(() => null);
    await cdp.send("Page.navigate", { url: fileUrl });
    await loaded;
    await sleep(700);

    let mouse = { x: 120, y: 120 };
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: mouse.x, y: mouse.y, button: "none" });

    let recording = true;
    let frame = 0;
    let startTime = Date.now();
    const cues = [];

    const elapsed = () => (Date.now() - startTime) / 1000;
    const captureLoop = (async () => {
      while (recording) {
        const result = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 88, fromSurface: true, captureBeyondViewport: false });
        frame += 1;
        writeFileSync(join(framesDir, `frame_${String(frame).padStart(5, "0")}.jpg`), Buffer.from(result.data, "base64"));
        await sleep(1000 / captureFps);
      }
    })();

    async function evaluate(expression) {
      return cdp.send("Runtime.evaluate", { expression, returnByValue: true });
    }

    async function caption(text) {
      const now = elapsed();
      if (cues.length) cues[cues.length - 1].end = now;
      cues.push({ start: now, end: now + 1, text });
      await evaluate(`window.demoSetCaption(${JSON.stringify(text)})`);
    }

    async function center(selector) {
      const result = await evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), width: Math.round(r.width), height: Math.round(r.height) };
      })()`);
      const value = result.result?.value;
      if (!value) throw new Error(`Could not find selector ${selector}`);
      return value;
    }

    async function moveTo(x, y, durationMs = 900) {
      const steps = Math.max(8, Math.round(durationMs / 45));
      const start = { ...mouse };
      for (let i = 1; i <= steps; i += 1) {
        const progress = i / steps;
        const ease = 1 - Math.pow(1 - progress, 3);
        mouse = {
          x: Math.round(start.x + (x - start.x) * ease),
          y: Math.round(start.y + (y - start.y) * ease),
        };
        await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: mouse.x, y: mouse.y, button: "none" });
        await sleep(durationMs / steps);
      }
    }

    async function clickSelector(selector, durationMs = 900) {
      const point = await center(selector);
      await moveTo(point.x, point.y, durationMs);
      await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
      await sleep(90);
      await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
      await sleep(300);
    }

    async function pause(ms) {
      await sleep(ms);
    }

    startTime = Date.now();

    await caption("Open Margin Sentinel. This is a local reviewer demo with real clicks and real UI state changes.");
    await pause(5500);

    await caption("Click Run profit scan. The dashboard moves from ready state to scanning and then shows real findings.");
    await clickSelector('[data-demo="run-scan"]');
    await pause(3200);

    await caption("After the scan, the Action center shows catalog health, issues to review, and inventory risk.");
    await pause(8500);

    await caption("Click the Fix first card to open the priority finding and suggested minimum price.");
    await clickSelector('[data-demo="fix-first"]');
    await pause(8000);

    await caption("Click a finding row. The table highlights the selected product and keeps price, cost, margin, risk, and suggested price visible.");
    await clickSelector('[data-demo="finding-row-1"]');
    await pause(9500);

    await caption("Open Import costs. Merchants can use variant ID, inventory item ID, or SKU plus cost.");
    await clickSelector('[data-demo="nav-import"]');
    await pause(6000);

    await caption("Click Download variant cost template. This is useful when SKUs are missing or inconsistent.");
    await clickSelector('[data-demo="download-template"]');
    await pause(8500);

    await caption("Click Preview / import costs. The app matches CSV rows to Shopify variants before saving.");
    await clickSelector('[data-demo="preview-import"]');
    await pause(3500);

    await caption("The import preview now shows matched rows, saved costs, warnings, and margin impact.");
    await pause(9500);

    await caption("Open What-if. This models supplier cost increases before low-margin products keep selling.");
    await clickSelector('[data-demo="nav-whatif"]');
    await pause(6500);

    await caption("Click Run what-if. The scenario recalculates at-risk SKUs and inventory risk.");
    await clickSelector('[data-demo="run-whatif"]');
    await pause(3500);

    await caption("The what-if result shows new at-risk SKUs, added inventory risk, and next actions by product.");
    await pause(9500);

    await caption("Open Pricing. Plans are clear: Free, Starter, and Growth.");
    await clickSelector('[data-demo="nav-pricing"]');
    await pause(7000);

    await caption("Click Start 14-day trial on Starter. In production, this opens Shopify managed billing.");
    await clickSelector('[data-demo="plan-starter"]');
    await pause(9500);

    await caption("Close the billing preview and return to the app.");
    await clickSelector('[data-demo="billing-close"]');
    await pause(4500);

    await caption("Open Export. Merchants can download a team-ready CSV fix list.");
    await clickSelector('[data-demo="nav-export"]');
    await pause(6500);

    await caption("Click Download CSV. This generates a saved findings export without changing Shopify prices.");
    await clickSelector('[data-demo="download-csv"]');
    await pause(8500);

    await caption("The export includes issue type, product, cost source, margin gap, inventory risk, suggested price, and next action.");
    await pause(9000);

    await caption("Final reviewer takeaway: Margin Sentinel finds margin leaks, explains what to fix first, and remains read-only.");
    await pause(8500);

    await caption("This walkthrough covered the required review path: dashboard, finding details, supplier import, what-if, pricing, and export.");
    await pause(12000);

    await caption("The important behavior is visible: buttons change state, results appear after clicks, and export confirms a generated download.");
    await pause(12000);

    await caption("Margin Sentinel recommends actions, but merchants stay in control of price and supplier cost changes.");
    await pause(12000);

    const totalDuration = elapsed();
    recording = false;
    await captureLoop;
    cdp.close();

    const targetDuration = Math.max(185, totalDuration);
    const inputFps = Math.max(1, frame / targetDuration);

    run("ffmpeg", [
      "-y",
      "-framerate", inputFps.toFixed(3),
      "-i", join(framesDir, "frame_%05d.jpg"),
      "-vf", "fps=30,format=yuv420p",
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-an",
      outputVideo,
    ]);

    writeCaptionFiles(cues, totalDuration);
    writeUploadInstructions();
    console.log(`Recorded live demo to ${outputVideo}`);
    console.log(`Duration: ${totalDuration.toFixed(1)}s`);
    console.log(`Frames: ${frame}; encoded input fps: ${inputFps.toFixed(3)}`);
  } finally {
    chrome.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
