import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const assetDir = join(root, "marketing", "app-store-assets");
const outDir = join(root, "marketing", "app-store-walkthrough");
const renderDir = join(outDir, "_render");

mkdirSync(renderDir, { recursive: true });

const imagePaths = {
  dashboard: firstExisting([
    join(assetDir, "screenshot-1-dashboard.png"),
    join(root, "screenshot-1-dashboard.png"),
  ]),
  pricing: firstExisting([
    join(assetDir, "screenshot-2-pricing.png"),
    join(root, "screenshot-2-pricing.png"),
  ]),
  importWhatIf: firstExisting([
    join(assetDir, "screenshot-3-import-what-if.png"),
    join(assetDir, "screenshot-3-import.png"),
    join(root, "screenshot-3-import.png"),
  ]),
};

function firstExisting(paths) {
  const found = paths.find((path) => existsSync(path));
  if (!found) throw new Error(`Missing required source asset. Tried:\n${paths.join("\n")}`);
  return found;
}

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: "pipe" });
}

function secondsToSrtTime(seconds) {
  const totalMs = Math.round(seconds * 1000);
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function cleanOutDir() {
  for (const file of [
    "walkthrough.mp4",
    "walkthrough-base.mp4",
    "walkthrough-captions.srt",
    "walkthrough-transcript.txt",
    "youtube-upload-instructions.md",
    "youtube-url-to-paste.txt",
  ]) {
    rmSync(join(outDir, file), { force: true });
  }
}

function createCursor() {
  const svgPath = join(renderDir, "cursor.svg");
  const pngPath = join(renderDir, "cursor.png");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#111827" flood-opacity="0.32"/>
  </filter>
  <path filter="url(#shadow)" d="M12 8 L12 62 L27 48 L36 70 L49 65 L39 44 L59 44 Z" fill="#ffffff" stroke="#111827" stroke-width="4" stroke-linejoin="round"/>
</svg>`;
  writeFileSync(svgPath, svg, "utf8");
  run("sips", ["-s", "format", "png", svgPath, "--out", pngPath]);
  return pngPath;
}

function createClickPulse() {
  const svgPath = join(renderDir, "click-pulse.svg");
  const pngPath = join(renderDir, "click-pulse.png");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
  <circle cx="75" cy="75" r="68" fill="#0f766e" opacity="0.10"/>
  <circle cx="75" cy="75" r="52" fill="none" stroke="#0f766e" stroke-width="8" opacity="0.35"/>
  <circle cx="75" cy="75" r="30" fill="none" stroke="#0f766e" stroke-width="7" opacity="0.72"/>
  <circle cx="75" cy="75" r="10" fill="#0f766e" opacity="0.95"/>
</svg>`;
  writeFileSync(svgPath, svg, "utf8");
  run("sips", ["-s", "format", "png", svgPath, "--out", pngPath]);
  return pngPath;
}

const scenes = [
  {
    id: "01-dashboard-overview",
    title: "Dashboard: issues, inventory risk, suggested prices",
    image: imagePaths.dashboard,
    duration: 62,
    pan: { x1: 0, y1: 34, x2: 126, y2: 54 },
    pointer: { x1: 1468, y1: 152, x2: 600, y2: 392, start: 3, end: 56 },
    clicks: [
      { time: 6, x: 1486, y: 152 },
      { time: 33, x: 604, y: 392 },
      { time: 52, x: 134, y: 532 },
    ],
    captions: [
      [0, 13, "Dashboard. Click Run profit scan to refresh the margin scan."],
      [13, 29, "The Action center summarizes catalog health, issues to review, and inventory risk."],
      [29, 45, "Click the Fix first card area to focus on the suggested minimum price and next action."],
      [45, 62, "Click Export full fix list. Margin Sentinel stays read-only and never changes Shopify prices automatically."],
    ],
  },
  {
    id: "02-dashboard-findings",
    title: "Dashboard findings and actionable fix list",
    image: imagePaths.dashboard,
    duration: 48,
    pan: { x1: 26, y1: 72, x2: 132, y2: 90 },
    pointer: { x1: 332, y1: 728, x2: 1480, y2: 728, start: 2, end: 44 },
    clicks: [
      { time: 8, x: 318, y: 728 },
      { time: 21, x: 1028, y: 728 },
      { time: 35, x: 1480, y: 728 },
    ],
    captions: [
      [0, 12, "Click a finding row to see the product that needs attention."],
      [12, 25, "The row shows SKU, price, cost, margin, inventory risk, and suggested minimum price."],
      [25, 38, "Click the suggested price and next-action columns to show what the merchant should do next."],
      [38, 48, "This makes the scan actionable instead of just reporting a number."],
    ],
  },
  {
    id: "03-pricing",
    title: "Pricing page: plans and billing",
    image: imagePaths.pricing,
    duration: 50,
    pan: { x1: 38, y1: 30, x2: 104, y2: 42 },
    pointer: { x1: 285, y1: 566, x2: 806, y2: 568, start: 3, end: 46 },
    clicks: [
      { time: 5, x: 286, y: 568 },
      { time: 25, x: 806, y: 568 },
      { time: 42, x: 1288, y: 568 },
    ],
    captions: [
      [0, 13, "Pricing page. Click each plan to show what the merchant gets."],
      [13, 28, "Free includes a small scan and CSV export. Starter unlocks larger scans, supplier import, what-if, and alerts."],
      [28, 40, "Growth is for bigger catalogs and priority support."],
      [40, 50, "Click Start 14-day trial. Paid plans are handled through Shopify billing."],
    ],
  },
  {
    id: "04-import-what-if",
    title: "Supplier import and cost-change what-if",
    image: imagePaths.importWhatIf,
    duration: 62,
    pan: { x1: 0, y1: 38, x2: 104, y2: 42 },
    pointer: { x1: 238, y1: 366, x2: 1222, y2: 350, start: 3, end: 58 },
    clicks: [
      { time: 7, x: 236, y: 366 },
      { time: 20, x: 138, y: 486 },
      { time: 38, x: 870, y: 350 },
      { time: 53, x: 1232, y: 350 },
    ],
    captions: [
      [0, 15, "Supplier import. Click the CSV area to show the accepted columns: variant ID, inventory item ID, SKU, and cost."],
      [15, 31, "Click the matched count. The preview confirms which rows match Shopify variants before saving."],
      [31, 48, "Click the What-if controls to model supplier cost increases."],
      [48, 62, "This helps merchants respond before low-margin products continue selling."],
    ],
  },
  {
    id: "05-export-actions",
    title: "Export and next steps",
    image: imagePaths.dashboard,
    duration: 44,
    pan: { x1: 80, y1: 84, x2: 0, y2: 36 },
    pointer: { x1: 144, y1: 532, x2: 1458, y2: 878, start: 2, end: 40 },
    clicks: [
      { time: 5, x: 134, y: 532 },
      { time: 19, x: 1458, y: 728 },
      { time: 33, x: 806, y: 878 },
    ],
    captions: [
      [0, 11, "Export. Click Download findings CSV to create the saved fix list."],
      [11, 25, "The CSV includes issue type, product, cost source, margin gap, inventory risk, and next action."],
      [25, 36, "Actionable next steps are clear: raise price, reduce cost, fix missing cost, or review discount rules."],
      [36, 44, "That is the core promise: catch margin leaks before products keep selling."],
    ],
  },
];

function makeScene(scene, cursorPath, clickPulsePath) {
  const output = join(renderDir, `${scene.id}.mp4`);
  const width = 1760;
  const height = 990;
  const pulseLabels = scene.clicks.map((_, index) => `pulse${index}`);
  let filter = [
    `[0:v]scale=${width}:${height},crop=1600:900:x='${scene.pan.x1}+(${scene.pan.x2}-${scene.pan.x1})*t/${scene.duration}':y='${scene.pan.y1}+(${scene.pan.y2}-${scene.pan.y1})*t/${scene.duration}',fps=30,format=yuv420p,fade=t=in:st=0:d=0.45,fade=t=out:st=${(scene.duration - 0.45).toFixed(2)}:d=0.45[bg]`,
    `[1:v]format=rgba,scale=72:72[cur]`,
    `[2:v]format=rgba,scale=150:150,split=${scene.clicks.length}${pulseLabels.map((label) => `[${label}]`).join("")}`,
    `[bg][cur]overlay=x='${scene.pointer.x1}+(${scene.pointer.x2}-${scene.pointer.x1})*(t-${scene.pointer.start})/(${scene.pointer.end}-${scene.pointer.start})':y='${scene.pointer.y1}+(${scene.pointer.y2}-${scene.pointer.y1})*(t-${scene.pointer.start})/(${scene.pointer.end}-${scene.pointer.start})':enable='between(t,${scene.pointer.start},${scene.pointer.end})'[withcursor]`,
  ];

  let lastLabel = "withcursor";
  scene.clicks.forEach((click, index) => {
    const nextLabel = index === scene.clicks.length - 1 ? "v" : `click${index}`;
    filter.push(`[${lastLabel}][${pulseLabels[index]}]overlay=x=${click.x - 75}:y=${click.y - 75}:enable='between(t,${click.time},${(click.time + 0.8).toFixed(1)})'${index === scene.clicks.length - 1 ? ",format=yuv420p" : ""}[${nextLabel}]`);
    lastLabel = nextLabel;
  });
  filter = filter.join(";");

  run("ffmpeg", [
    "-y",
    "-loop", "1",
    "-framerate", "30",
    "-t", String(scene.duration),
    "-i", scene.image,
    "-loop", "1",
    "-framerate", "30",
    "-t", String(scene.duration),
    "-i", cursorPath,
    "-loop", "1",
    "-framerate", "30",
    "-t", String(scene.duration),
    "-i", clickPulsePath,
    "-filter_complex", filter,
    "-map", "[v]",
    "-t", String(scene.duration),
    "-r", "30",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-an",
    output,
  ]);
  return output;
}

function writeCaptions() {
  let index = 1;
  let elapsed = 0;
  const srtLines = [];
  const plainLines = [];

  for (const scene of scenes) {
    plainLines.push(`${scene.title}`);
    for (const [start, end, text] of scene.captions) {
      srtLines.push(String(index));
      srtLines.push(`${secondsToSrtTime(elapsed + start)} --> ${secondsToSrtTime(elapsed + end)}`);
      srtLines.push(text);
      srtLines.push("");
      plainLines.push(`[${secondsToSrtTime(elapsed + start).replace(",", ".")} - ${secondsToSrtTime(elapsed + end).replace(",", ".")}] ${text}`);
      index += 1;
    }
    plainLines.push("");
    elapsed += scene.duration;
  }

  writeFileSync(join(outDir, "walkthrough-captions.srt"), srtLines.join("\n"), "utf8");
  writeFileSync(join(outDir, "walkthrough-transcript.txt"), plainLines.join("\n"), "utf8");
}

function concatScenes(sceneFiles) {
  const concatPath = join(renderDir, "walkthrough-concat.txt");
  const basePath = join(outDir, "walkthrough-base.mp4");
  writeFileSync(concatPath, sceneFiles.map((file) => `file '${file.replace(/'/g, "'\\''")}'`).join("\n") + "\n", "utf8");
  run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatPath, "-c", "copy", basePath]);
  return basePath;
}

function burnCaptions(basePath) {
  const captionPath = join(outDir, "walkthrough-captions.srt");
  const output = join(outDir, "walkthrough.mp4");
  const subtitleFilter = `subtitles='${captionPath}':force_style='FontName=Arial,FontSize=8,PrimaryColour=&H00FFFFFF,OutlineColour=&HAA111827,BorderStyle=1,Outline=2,Shadow=0,Alignment=2,MarginV=34'`;
  run("ffmpeg", [
    "-y",
    "-i", basePath,
    "-vf", subtitleFilter,
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "-an",
    output,
  ]);
}

function writeUploadInstructions() {
  const videoPath = join(outDir, "walkthrough.mp4");
  writeFileSync(join(outDir, "youtube-upload-instructions.md"), `# YouTube upload instructions

Upload this file:

\`${videoPath}\`

Set visibility:

\`Unlisted\`

Recommended title:

\`Margin Sentinel Shopify App Store Screencast\`

Recommended description:

\`\`\`
Margin Sentinel is a Shopify embedded app for catalog margin protection.

This screencast shows:
1. Dashboard with margin issues, inventory risk, and suggested prices
2. Pricing page with Free, Starter, and Growth plans
3. Supplier import and cost-change what-if workflow
4. Export and actionable next steps

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

  writeFileSync(join(outDir, "upload-checklist.txt"), `Upload MP4 to YouTube as Unlisted -> paste link into Shopify Screencast URL -> Save -> Submit.
`, "utf8");
}

cleanOutDir();
const cursorPath = createCursor();
const clickPulsePath = createClickPulse();
const sceneFiles = scenes.map((scene) => makeScene(scene, cursorPath, clickPulsePath));
writeCaptions();
const basePath = concatScenes(sceneFiles);
burnCaptions(basePath);
rmSync(basePath, { force: true });
writeUploadInstructions();

console.log(`Generated walkthrough in ${outDir}`);
