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
    "walkthrough-captions.srt",
    "walkthrough-transcript.txt",
    "youtube-upload-instructions.md",
    "youtube-url-to-paste.txt",
    "upload-checklist.txt",
  ]) {
    rmSync(join(outDir, file), { force: true });
  }
}

function createClickPulse() {
  const svgPath = join(renderDir, "click-pulse.svg");
  const pngPath = join(renderDir, "click-pulse.png");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="190" height="190" viewBox="0 0 190 190">
  <circle cx="95" cy="95" r="86" fill="#0f766e" opacity="0.10"/>
  <circle cx="95" cy="95" r="67" fill="none" stroke="#0f766e" stroke-width="10" opacity="0.30"/>
  <circle cx="95" cy="95" r="43" fill="none" stroke="#0f766e" stroke-width="8" opacity="0.70"/>
  <circle cx="95" cy="95" r="14" fill="#0f766e"/>
</svg>`;
  writeFileSync(svgPath, svg, "utf8");
  run("sips", ["-s", "format", "png", svgPath, "--out", pngPath]);
  return pngPath;
}

function createExportScreen() {
  const svgPath = join(renderDir, "export-next-steps.svg");
  const pngPath = join(renderDir, "export-next-steps.png");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="#f4f6f8"/>
  <rect x="0" y="0" width="1600" height="72" fill="#ffffff"/>
  <line x1="0" y1="72" x2="1600" y2="72" stroke="#d9dde3"/>
  <rect x="44" y="18" width="38" height="38" rx="9" fill="#146b4b"/>
  <text x="63" y="44" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="800" fill="#ffffff">M</text>
  <text x="94" y="45" font-family="Arial, sans-serif" font-size="25" font-weight="800" fill="#111827">Margin Sentinel</text>
  <text x="1180" y="42" font-family="Arial, sans-serif" font-size="16" fill="#475467">Dashboard</text>
  <text x="1274" y="42" font-family="Arial, sans-serif" font-size="16" fill="#475467">Import costs</text>
  <text x="1384" y="42" font-family="Arial, sans-serif" font-size="16" fill="#475467">What-if</text>
  <text x="1456" y="42" font-family="Arial, sans-serif" font-size="16" fill="#475467">Export</text>
  <text x="38" y="140" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#111827">Export findings CSV</text>
  <text x="38" y="166" font-family="Arial, sans-serif" font-size="17" fill="#5b6472">Download a clean fix list for pricing review, supplier follow-up, or team action.</text>
  <rect x="38" y="190" width="1524" height="164" rx="8" fill="#ffffff" stroke="#d9dde3"/>
  <text x="60" y="238" font-family="Arial, sans-serif" font-size="28" font-weight="800" fill="#111827">Download complete fix list</text>
  <text x="60" y="270" font-family="Arial, sans-serif" font-size="17" fill="#5b6472">CSV includes issue type, product, SKU, price, cost, cost source, margin, inventory risk, suggested minimum price, and next action.</text>
  <rect x="1310" y="224" width="212" height="48" rx="8" fill="#111827"/>
  <text x="1416" y="255" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" font-weight="800" fill="#ffffff">Download CSV</text>
  <rect x="60" y="300" width="220" height="34" rx="17" fill="#e9f7ef"/>
  <text x="170" y="323" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="#146b4b">Read-only export</text>
  <rect x="300" y="300" width="238" height="34" rx="17" fill="#fff8db"/>
  <text x="419" y="323" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="#8a5a00">Suggested prices included</text>
  <rect x="38" y="378" width="1524" height="412" rx="8" fill="#ffffff" stroke="#d9dde3"/>
  <text x="60" y="426" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="#111827">Actionable next steps</text>
  <text x="1215" y="426" font-family="Arial, sans-serif" font-size="16" fill="#5b6472">4 findings ready for review</text>
  <line x1="60" y1="456" x2="1540" y2="456" stroke="#e6e9ee"/>
  <text x="70" y="488" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="#667085">ISSUE</text>
  <text x="260" y="488" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="#667085">PRODUCT</text>
  <text x="650" y="488" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="#667085">COST SOURCE</text>
  <text x="870" y="488" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="#667085">MARGIN</text>
  <text x="1040" y="488" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="#667085">RISK</text>
  <text x="1210" y="488" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="#667085">NEXT ACTION</text>
  ${exportRow(515, "#fff1ed", "#9f2414", "Losing money", "Red Snowboard", "Shopify unit cost", "-20.0%", "$0.00", "Raise price or reduce cost before selling more")}
  ${exportRow(578, "#fff8db", "#8a5a00", "Low margin", "The Multi-managed Snowboard", "Supplier import", "20.6%", "$5,904", "Review price, supplier cost, or discount rules")}
  ${exportRow(641, "#fff8db", "#8a5a00", "Low margin", "The Inventory Not Tracked Snowboard", "Supplier import", "26.3%", "$0.00", "Review supplier cost or target margin")}
  ${exportRow(704, "#fff8db", "#8a5a00", "Low margin", "Green Snowboard", "Supplier import", "15.0%", "$0.00", "Suggested minimum price: $121.43")}
  <rect x="38" y="812" width="1524" height="58" rx="8" fill="#ffffff" stroke="#d9dde3"/>
  <text x="60" y="848" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#111827">Reviewer note:</text>
  <text x="190" y="848" font-family="Arial, sans-serif" font-size="18" fill="#5b6472">Export is a download-only action. Margin Sentinel never changes Shopify prices automatically.</text>
</svg>`;
  writeFileSync(svgPath, svg, "utf8");
  run("sips", ["-s", "format", "png", svgPath, "--out", pngPath]);
  return pngPath;
}

function exportRow(y, badgeFill, badgeText, issue, product, source, margin, risk, action) {
  return `<line x1="60" y1="${y - 16}" x2="1540" y2="${y - 16}" stroke="#eef1f4"/>
  <rect x="70" y="${y - 20}" width="150" height="28" rx="7" fill="${badgeFill}" stroke="${badgeText}" opacity="0.95"/>
  <text x="145" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="800" fill="${badgeText}">${issue}</text>
  <text x="260" y="${y}" font-family="Arial, sans-serif" font-size="16" fill="#111827">${product}</text>
  <text x="650" y="${y}" font-family="Arial, sans-serif" font-size="16" fill="#111827">${source}</text>
  <text x="870" y="${y}" font-family="Arial, sans-serif" font-size="16" fill="#111827">${margin}</text>
  <text x="1040" y="${y}" font-family="Arial, sans-serif" font-size="16" fill="#111827">${risk}</text>
  <text x="1210" y="${y}" font-family="Arial, sans-serif" font-size="16" fill="#111827">${action}</text>`;
}

const scenes = [
  {
    id: "01-dashboard-overview",
    title: "Dashboard: issues, inventory risk, suggested prices",
    image: imagePaths.dashboard,
    duration: 46,
    clicks: [
      { time: 5, x: 1486, y: 151 },
      { time: 20, x: 630, y: 456 },
      { time: 35, x: 637, y: 309 },
    ],
    captions: [
      [0, 11, "Dashboard. Click Run profit scan to refresh the margin scan."],
      [11, 24, "The Action center shows catalog health, issues to review, and inventory risk."],
      [24, 36, "The Fix first card shows the suggested minimum price and next action."],
      [36, 46, "Margin Sentinel is read-only. It does not change Shopify prices automatically."],
    ],
  },
  {
    id: "02-findings-list",
    title: "Findings table: actionable fix list",
    image: imagePaths.dashboard,
    duration: 38,
    clicks: [
      { time: 6, x: 136, y: 728 },
      { time: 17, x: 1368, y: 728 },
      { time: 29, x: 1510, y: 728 },
    ],
    captions: [
      [0, 10, "The findings table lists losing-money and low-margin variants."],
      [10, 23, "Each row includes price, cost, margin, inventory risk, and suggested minimum price."],
      [23, 38, "The merchant can use this as a concrete fix list for pricing or supplier review."],
    ],
  },
  {
    id: "03-pricing",
    title: "Pricing: plans and billing",
    image: imagePaths.pricing,
    duration: 42,
    clicks: [
      { time: 5, x: 286, y: 568 },
      { time: 19, x: 805, y: 568 },
      { time: 33, x: 1288, y: 568 },
    ],
    captions: [
      [0, 10, "Pricing page. Free, Starter, and Growth plans are shown clearly."],
      [10, 25, "Starter unlocks larger scans, supplier import, what-if checks, suggested prices, and weekly alerts."],
      [25, 42, "Paid plan actions go through Shopify billing with a 14-day trial."],
    ],
  },
  {
    id: "04-import-what-if",
    title: "Supplier import and what-if",
    image: imagePaths.importWhatIf,
    duration: 52,
    clicks: [
      { time: 6, x: 392, y: 365 },
      { time: 19, x: 314, y: 496 },
      { time: 32, x: 970, y: 348 },
      { time: 43, x: 1230, y: 350 },
    ],
    captions: [
      [0, 13, "Supplier import accepts variant ID, inventory item ID, SKU, and cost."],
      [13, 25, "The preview shows matched rows before costs are saved."],
      [25, 40, "The what-if panel models supplier cost increases and newly at-risk SKUs."],
      [40, 52, "This helps merchants act before low-margin products keep selling."],
    ],
  },
  {
    id: "05-export-next-steps",
    title: "Export and next steps",
    image: null,
    duration: 42,
    clicks: [
      { time: 6, x: 1416, y: 248 },
      { time: 20, x: 146, y: 515 },
      { time: 33, x: 1320, y: 704 },
    ],
    captions: [
      [0, 11, "Export. Click Download CSV to create the full saved fix list."],
      [11, 25, "The CSV includes cost source, margin gap, inventory risk, suggested price, and next action."],
      [25, 42, "Final steps are clear: raise price, reduce cost, add missing cost, or review discount rules."],
    ],
  },
];

function makeScene(scene, clickPulsePath) {
  const output = join(renderDir, `${scene.id}.mp4`);
  const pulseLabels = scene.clicks.map((_, index) => `pulse${index}`);
  let filter = [
    `[0:v]scale=1600:900,fps=30,format=yuv420p,fade=t=in:st=0:d=0.28,fade=t=out:st=${(scene.duration - 0.28).toFixed(2)}:d=0.28[base]`,
    `[1:v]format=rgba,scale=190:190,split=${scene.clicks.length}${pulseLabels.map((label) => `[${label}]`).join("")}`,
  ];

  let lastLabel = "base";
  scene.clicks.forEach((click, index) => {
    const nextLabel = index === scene.clicks.length - 1 ? "v" : `click${index}`;
    filter.push(`[${lastLabel}][${pulseLabels[index]}]overlay=x=${click.x - 95}:y=${click.y - 95}:enable='between(t,${click.time},${(click.time + 1.15).toFixed(2)})'${index === scene.clicks.length - 1 ? ",format=yuv420p" : ""}[${nextLabel}]`);
    lastLabel = nextLabel;
  });

  run("ffmpeg", [
    "-y",
    "-loop", "1",
    "-framerate", "30",
    "-t", String(scene.duration),
    "-i", scene.image,
    "-loop", "1",
    "-framerate", "30",
    "-t", String(scene.duration),
    "-i", clickPulsePath,
    "-filter_complex", filter.join(";"),
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
    plainLines.push(scene.title);
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
  const output = join(outDir, "walkthrough.mp4");
  writeFileSync(concatPath, sceneFiles.map((file) => `file '${file.replace(/'/g, "'\\''")}'`).join("\n") + "\n", "utf8");
  run("ffmpeg", [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatPath,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
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
2. Findings table with actionable fix list
3. Pricing page with Free, Starter, and Growth plans
4. Supplier import and cost-change what-if workflow
5. Export and actionable next steps

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

cleanOutDir();
const clickPulsePath = createClickPulse();
scenes[4].image = createExportScreen();
const sceneFiles = scenes.map((scene) => makeScene(scene, clickPulsePath));
writeCaptions();
concatScenes(sceneFiles);
writeUploadInstructions();

console.log(`Generated clean full-screen walkthrough in ${outDir}`);
