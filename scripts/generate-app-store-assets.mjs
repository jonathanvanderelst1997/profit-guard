import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = join(root, "marketing", "app-store-assets");
const renderDir = join(outDir, "_render");
mkdirSync(renderDir, { recursive: true });

for (const file of readdirSync(outDir)) {
  if (/^video-\d+-.*\.png$/.test(file)) rmSync(join(outDir, file), { force: true });
}

const chromeCandidates = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  process.env.CHROME_BIN,
].filter(Boolean);

const chrome = chromeCandidates.find((candidate) => existsSync(candidate));
if (!chrome) {
  throw new Error("Could not find Google Chrome or Chromium for headless screenshots.");
}

const baseCss = `
  :root {
    --ink: #111827;
    --muted: #5b6472;
    --line: #d9dde3;
    --paper: #ffffff;
    --wash: #f4f6f8;
    --green: #146b4b;
    --blue: #2454a6;
    --amber: #8a5a00;
    --red: #9f2414;
    --teal: #0f766e;
  }
  * { box-sizing: border-box; }
  html, body { width: 1600px; height: 900px; margin: 0; overflow: hidden; }
  body {
    color: var(--ink);
    background: #eef1f4;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    letter-spacing: 0;
  }
  .canvas { width: 1600px; height: 900px; overflow: hidden; position: relative; background: var(--wash); }
  .topbar {
    height: 72px;
    padding: 0 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-bottom: 1px solid var(--line);
  }
  .brand { display: flex; align-items: center; gap: 12px; font-weight: 850; font-size: 24px; }
  .mark { width: 38px; height: 38px; border-radius: 9px; background: var(--green); color: #fff; display: grid; place-items: center; font-weight: 900; }
  .nav { display: flex; align-items: center; gap: 24px; color: #59636f; font-size: 15px; }
  .page { padding: 30px 38px 38px; display: grid; gap: 18px; }
  .page-title { display: flex; align-items: end; justify-content: space-between; }
  h1, h2, h3, p { margin: 0; }
  h1 { font-size: 42px; line-height: 1.08; letter-spacing: 0; }
  h2 { font-size: 27px; line-height: 1.18; letter-spacing: 0; }
  h3 { font-size: 19px; line-height: 1.22; letter-spacing: 0; }
  p { color: var(--muted); font-size: 16px; line-height: 1.45; }
  .button { height: 40px; min-width: 136px; padding: 0 16px; border-radius: 7px; background: var(--ink); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 760; }
  .linkrow { display: flex; flex-wrap: wrap; gap: 12px; }
  .link { color: #1453a6; font-weight: 720; font-size: 15px; }
  .section, .card, .panel { background: #fff; border: 1px solid var(--line); border-radius: 8px; }
  .section { padding: 20px; display: grid; gap: 14px; }
  .subtle { background: #f8fafb; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
  .stat { padding: 15px 16px; background: #fff; border: 1px solid var(--line); border-radius: 8px; min-height: 92px; }
  .stat strong { display: block; font-size: 30px; line-height: 1.1; margin-top: 6px; letter-spacing: 0; }
  .stat span { color: #627083; font-size: 13px; font-weight: 690; text-transform: none; }
  .tone-warning strong { color: var(--amber); }
  .tone-critical strong { color: var(--red); }
  .tone-success strong { color: var(--green); }
  .action { border: 1px solid #efd390; background: #fff8df; border-radius: 8px; padding: 18px; display: grid; gap: 7px; }
  .action .label { color: var(--amber); font-size: 13px; font-weight: 850; text-transform: uppercase; }
  .action strong { font-size: 25px; }
  .badge { display: inline-flex; align-items: center; padding: 5px 9px; border: 1px solid; border-radius: 7px; font-weight: 820; font-size: 12px; white-space: nowrap; }
  .loss { color: var(--red); background: #fff1ed; border-color: #ffd0c2; }
  .low { color: var(--amber); background: #fff8db; border-color: #eed283; }
  .ok { color: var(--green); background: #e9f7ef; border-color: #bfe1cc; }
  .blue { color: var(--blue); background: #edf5ff; border-color: #c9dcff; }
  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; font-size: 14px; }
  th, td { padding: 11px 10px; border-bottom: 1px solid #eceff2; text-align: left; vertical-align: middle; }
  th { color: #697383; font-size: 11px; font-weight: 850; text-transform: uppercase; }
  td.num, th.num { text-align: right; }
  tr:last-child td { border-bottom: 0; }
  .table-wrap { overflow: hidden; border-radius: 8px; }
  .caption { display: none; }
  .hero {
    width: 1600px;
    height: 900px;
    padding: 74px;
    display: grid;
    grid-template-columns: 0.82fr 1.18fr;
    gap: 56px;
    align-items: center;
    background: #f4f6f8;
  }
  .hero h1 { font-size: 68px; line-height: 1; margin: 14px 0 20px; max-width: 650px; }
  .hero p { font-size: 21px; line-height: 1.45; max-width: 630px; }
  .hero .eyebrow { color: var(--green); font-size: 17px; font-weight: 860; text-transform: uppercase; }
  .hero-panel { box-shadow: 0 28px 90px rgba(20, 30, 40, .16); }
  .monitor { background: #fff; border: 1px solid #d6dbe0; border-radius: 12px; overflow: hidden; }
  .monitor-head { height: 46px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #dfe3e8; color: #5d6774; font-weight: 730; }
  .monitor-body { padding: 18px; display: grid; gap: 14px; }
  .pillbar { display: flex; gap: 10px; flex-wrap: wrap; }
  .pill { padding: 6px 10px; border-radius: 999px; background: #edf5f2; color: var(--green); font-size: 13px; font-weight: 780; }
  .plan-card { min-height: 424px; padding: 24px; display: grid; grid-template-rows: auto auto 1fr auto; gap: 16px; background: #fff; border: 1px solid var(--line); border-radius: 8px; }
  .price { font-size: 42px; font-weight: 900; letter-spacing: 0; }
  .features { margin: 0; padding-left: 20px; color: #5f6976; font-size: 16px; line-height: 1.62; }
  .import-box { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background: #101827; color: #eaf0f7; border-radius: 8px; padding: 17px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; }
  .video-step { position: absolute; top: 90px; right: 32px; padding: 8px 13px; border-radius: 999px; background: #111827; color: #fff; font-weight: 820; font-size: 14px; }
  .video-note { position: absolute; left: 0; right: 0; bottom: 0; height: 90px; background: rgba(17, 24, 39, .93); color: #fff; padding: 22px 44px; display: flex; align-items: center; justify-content: space-between; gap: 28px; }
  .video-note strong { font-size: 24px; }
  .video-note span { color: #d8dee8; font-size: 17px; }
`;

function shell(strings, ...values) {
  return strings.reduce((result, part, index) => result + part + (values[index] ?? ""), "");
}

const dashboardTable = `
  <div class="table-wrap">
    <table>
      <thead><tr><th>Issue</th><th>Product</th><th>SKU</th><th class="num">Price</th><th class="num">Cost</th><th class="num">Margin</th><th class="num">Risk</th><th class="num">Min price</th></tr></thead>
      <tbody>
        <tr><td><span class="badge loss">Losing money</span></td><td>Red Snowboard</td><td>-</td><td class="num">$100.00</td><td class="num">$120.00</td><td class="num">-20.0%</td><td class="num">$0.00</td><td class="num">$171.43</td></tr>
        <tr><td><span class="badge low">Low margin</span></td><td>The Multi-managed Snowboard</td><td>sku-managed-1</td><td class="num">$629.95</td><td class="num">$500.00</td><td class="num">20.6%</td><td class="num">$5,904</td><td class="num">$714.29</td></tr>
        <tr><td><span class="badge low">Low margin</span></td><td>The Inventory Not Tracked Snowboard</td><td>sku-untracked-1</td><td class="num">$949.95</td><td class="num">$700.00</td><td class="num">26.3%</td><td class="num">$0.00</td><td class="num">$1,000</td></tr>
        <tr><td><span class="badge low">Low margin</span></td><td>Green Snowboard</td><td>GREEN-SNOWBOARD</td><td class="num">$100.00</td><td class="num">$85.00</td><td class="num">15.0%</td><td class="num">$0.00</td><td class="num">$121.43</td></tr>
      </tbody>
    </table>
  </div>
`;

const featureTable = `
  <div class="table-wrap">
    <table>
      <thead><tr><th>Issue</th><th>Product</th><th>Cost source</th><th>Next action</th></tr></thead>
      <tbody>
        <tr><td><span class="badge loss">Losing money</span></td><td>Red Snowboard</td><td>Shopify unit cost</td><td>Raise price or reduce cost</td></tr>
        <tr><td><span class="badge low">Low margin</span></td><td>The Multi-managed Snowboard</td><td>Supplier import</td><td>Review price or cost</td></tr>
        <tr><td><span class="badge low">Low margin</span></td><td>Green Snowboard</td><td>Supplier import</td><td>Use suggested minimum</td></tr>
      </tbody>
    </table>
  </div>
`;

const dashboardShot = shell`
  <div class="canvas">
    <div class="topbar">
      <div class="brand"><span class="mark">M</span>Margin Sentinel</div>
      <div class="nav"><span>Dashboard</span><span>Import costs</span><span>What-if</span><span>Export</span><span>Pricing</span></div>
    </div>
    <div class="page">
      <div class="page-title">
        <div><h1>Automatic profit scan</h1><p>Reads Shopify prices, Shopify unit costs, and imported supplier costs. It never changes prices automatically.</p></div>
        <div class="button">Run profit scan</div>
      </div>
      <div class="grid-2">
        <div class="section">
          <h2>Action center</h2>
          <div class="grid-3">
            <div class="stat tone-success"><span>Catalog healthy</span><strong>86%</strong></div>
            <div class="stat tone-warning"><span>Issues to review</span><strong>4</strong></div>
            <div class="stat tone-warning"><span>Inventory risk</span><strong>$5,904</strong></div>
          </div>
          <div class="action">
            <span class="label">Fix first</span>
            <strong>Red Snowboard</strong>
            <p>Raise price or reduce cost before selling more. Suggested minimum price for 30.0% margin: $171.43.</p>
            <p>Cost source: Shopify unit cost.</p>
            <div class="linkrow"><span class="link">Export full fix list</span><span class="link">Import supplier costs</span><span class="link">Enable weekly alerts</span></div>
          </div>
        </div>
        <div class="section">
          <h2>Latest scan</h2>
          <div class="grid-4">
            <div class="stat"><span>Variants checked</span><strong>29</strong></div>
            <div class="stat tone-critical"><span>Losing money</span><strong>1</strong></div>
            <div class="stat tone-warning"><span>Low margin</span><strong>3</strong></div>
            <div class="stat tone-success"><span>Missing cost</span><strong>0</strong></div>
          </div>
          <div class="grid-4">
            <div class="stat tone-critical"><span>Direct loss</span><strong>$20</strong></div>
            <div class="stat tone-warning"><span>Margin gap</span><strong>$159</strong></div>
            <div class="stat tone-warning"><span>Inventory risk</span><strong>$5,904</strong></div>
            <div class="stat tone-success"><span>OK variants</span><strong>25</strong></div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="page-title"><h2>Review findings</h2><p>Showing 4 of 4 saved findings, sorted by highest priority.</p></div>
        ${dashboardTable}
      </div>
    </div>
    <div class="caption">Screenshot 1: Dashboard with issues, inventory risk, and suggested prices</div>
  </div>
`;

const pricingShot = shell`
  <div class="canvas">
    <div class="topbar">
      <div class="brand"><span class="mark">M</span>Margin Sentinel</div>
      <div class="nav"><span>Dashboard</span><span>Import costs</span><span>What-if</span><span>Pricing</span></div>
    </div>
    <div class="page">
      <div class="page-title">
        <div><h1>Simple catalog-based pricing</h1><p>Built for catalog margin protection, with Shopify-managed billing and a free plan for small stores.</p></div>
      </div>
      <div class="grid-3">
        <div class="plan-card">
          <div><span class="badge blue">Free</span><h2 style="margin-top: 12px;">Free</h2></div>
          <div class="price">$0</div>
          <ul class="features">
            <li>Scan up to 100 variants</li>
            <li>Margin leak dashboard</li>
            <li>CSV findings export</li>
          </ul>
          <div class="button" style="background:#eef2f7;color:#111827;">Current plan</div>
        </div>
        <div class="plan-card" style="border-color:#9ac7b0; box-shadow:0 20px 50px rgba(20, 30, 40, .10);">
          <div><span class="badge ok">Starter</span><h2 style="margin-top: 12px;">Starter</h2></div>
          <div class="price">$15/month</div>
          <ul class="features">
            <li>Scan up to 5,000 variants</li>
            <li>Variant cost template and supplier import</li>
            <li>Suggested minimum prices</li>
            <li>Cost-change what-if</li>
            <li>Weekly alerts</li>
          </ul>
          <div class="button">Start 14-day trial</div>
        </div>
        <div class="plan-card">
          <div><span class="badge blue">Growth</span><h2 style="margin-top: 12px;">Growth</h2></div>
          <div class="price">$39/month</div>
          <ul class="features">
            <li>Scan up to 25,000 variants</li>
            <li>Supplier CSV cost import</li>
            <li>Suggested minimum prices</li>
            <li>Cost-change what-if</li>
            <li>Weekly alerts</li>
            <li>Priority support</li>
          </ul>
          <div class="button">Start 14-day trial</div>
        </div>
      </div>
      <div class="section subtle">
        <h2>Upgrade and downgrade inside the app</h2>
        <p>Paid charges go through Shopify billing. Merchants can return to Free from the Pricing page without contacting support.</p>
      </div>
    </div>
    <div class="caption">Screenshot 2: Pricing page and Shopify-managed plan controls</div>
  </div>
`;

const importWhatIfShot = shell`
  <div class="canvas">
    <div class="topbar">
      <div class="brand"><span class="mark">M</span>Margin Sentinel</div>
      <div class="nav"><span>Import costs</span><span>What-if</span><span>Export</span><span>Alerts</span></div>
    </div>
    <div class="page">
      <div class="page-title">
        <div><h1>Supplier import and cost-change what-if</h1><p>Preview cost rows, save matched costs, and model supplier increases before changing prices elsewhere.</p></div>
      </div>
      <div class="import-box">
        <div class="section">
          <h2>Import supplier costs</h2>
          <p>Upload a CSV with variant_id, inventory_item_id, or SKU plus COST. Preview first, save only when ready.</p>
          <div class="code">variant_id,inventory_item_id,sku,cost
gid://shopify/ProductVariant/123,,GREEN-SNOWBOARD,85.00
,gid://shopify/InventoryItem/456,sku-managed-1,500.00</div>
          <div class="grid-4">
            <div class="stat"><span>CSV rows</span><strong>4</strong></div>
            <div class="stat tone-success"><span>Matched</span><strong>4</strong></div>
            <div class="stat"><span>Saved</span><strong>4</strong></div>
            <div class="stat tone-warning"><span>Warnings</span><strong>0</strong></div>
          </div>
          <div class="action">
            <span class="label">Costs matched</span>
            <p>4 rows matched Shopify variants. Review the margin preview before saving supplier costs.</p>
          </div>
        </div>
        <div class="section">
          <h2>Cost-change what-if</h2>
          <p>Enter a supplier cost increase to see which SKUs would fall below the current target margin.</p>
          <div class="grid-4">
            <div class="stat"><span>Cost increase</span><strong>8%</strong></div>
            <div class="stat tone-warning"><span>New at-risk SKUs</span><strong>2</strong></div>
            <div class="stat tone-warning"><span>Added risk</span><strong>$742</strong></div>
            <div class="stat tone-warning"><span>Total risk</span><strong>$6,646</strong></div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Product</th><th>Issue</th><th class="num">Scenario cost</th><th class="num">Margin</th><th>Next action</th></tr></thead>
              <tbody>
                <tr><td>The Multi-managed Snowboard</td><td><span class="badge low">Low margin</span></td><td class="num">$540.00</td><td class="num">14.3%</td><td>Review price or supplier cost</td></tr>
                <tr><td>Green Snowboard</td><td><span class="badge low">Low margin</span></td><td class="num">$91.80</td><td class="num">8.2%</td><td>Suggested minimum: $131.14</td></tr>
                <tr><td>Red Snowboard</td><td><span class="badge loss">Loss</span></td><td class="num">$129.60</td><td class="num">-29.6%</td><td>Raise price before selling more</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="caption">Screenshot 3: Supplier import and what-if workflow</div>
  </div>
`;

const featureShot = shell`
  <div class="canvas">
    <div class="hero">
      <div>
        <div class="eyebrow">Margin Sentinel</div>
        <h1>Catch margin leaks before products sell.</h1>
        <p>Scan Shopify variants, compare selling price to unit cost or supplier cost, and give merchants a clear fix list with suggested minimum prices.</p>
        <div class="pillbar" style="margin-top: 28px;">
          <span class="pill">Read-only scanning</span>
          <span class="pill">Supplier cost import</span>
          <span class="pill">What-if scenarios</span>
          <span class="pill">CSV export</span>
        </div>
      </div>
      <div class="monitor hero-panel">
        <div class="monitor-head"><span>Latest scan</span><span>Read-only</span></div>
        <div class="monitor-body">
          <div class="grid-3">
            <div class="stat tone-success"><span>Healthy variants</span><strong>OK</strong></div>
            <div class="stat tone-warning"><span>Issues found</span><strong>Review</strong></div>
            <div class="stat tone-warning"><span>Inventory risk</span><strong>Flagged</strong></div>
          </div>
          <div class="action">
            <span class="label">Fix first</span>
            <strong>Red Snowboard</strong>
            <p>Suggested minimum price appears in the fix list. No prices are changed automatically.</p>
          </div>
          ${featureTable}
        </div>
      </div>
    </div>
  </div>
`;

function videoSlide(inner, step, title, subtitle) {
  return shell`
    <div class="canvas">
      ${inner}
      <div class="video-step">Step ${step} of 8</div>
      <div class="video-note"><strong>${title}</strong><span>${subtitle}</span></div>
    </div>
  `;
}

const installSlide = shell`
  <div class="canvas">
    <div class="topbar"><div class="brand"><span class="mark">M</span>Margin Sentinel</div><div class="nav"><span>Embedded app</span><span>Read products</span><span>Read inventory</span></div></div>
    <div class="hero" style="height:828px;padding-top:58px;">
      <div>
        <div class="eyebrow">Reviewer walkthrough</div>
        <h1>Open Margin Sentinel from Apps.</h1>
        <p>After OAuth, the app loads inside Shopify Admin. It asks only for product and inventory read access, plus billing approval when a merchant starts a paid plan.</p>
      </div>
      <div class="monitor hero-panel">
        <div class="monitor-head"><span>App home</span><span>Ready</span></div>
        <div class="monitor-body">
          <div class="section subtle"><h2>Automatic profit scan</h2><p>Run one scan to create a prioritized fix list from product prices, Shopify unit costs, and imported supplier costs.</p></div>
          <div class="grid-3"><div class="stat"><span>Scopes</span><strong>2</strong></div><div class="stat"><span>Data writes</span><strong>0</strong></div><div class="stat"><span>Setup</span><strong>UI</strong></div></div>
          <div class="button">Run profit scan</div>
        </div>
      </div>
    </div>
  </div>
`;

const exportSlide = shell`
  <div class="canvas">
    <div class="topbar"><div class="brand"><span class="mark">M</span>Margin Sentinel</div><div class="nav"><span>Suggested prices</span><span>Export</span><span>Alerts</span></div></div>
    <div class="page">
      <div class="page-title"><div><h1>Suggested prices and export</h1><p>CSV output gives the team a portable fix list with current margin, gap, risk, and next action.</p></div><div class="button">Download findings CSV</div></div>
      <div class="section">
        ${dashboardTable}
      </div>
      <div class="grid-3">
        <div class="section"><h2>Next action</h2><p>Raise price, reduce cost, add missing cost, or review discount rules. Margin Sentinel stays read-only.</p></div>
        <div class="section"><h2>Cost source labels</h2><p>Each row shows Shopify unit cost, supplier import, demo cost, or missing cost so merchants can trust the result.</p></div>
        <div class="section"><h2>Weekly alerts</h2><p>Paid merchants can enable a weekly email for new loss, low-margin, or missing-cost findings.</p></div>
      </div>
    </div>
  </div>
`;

const doneSlide = shell`
  <div class="canvas">
    <div class="hero">
      <div>
        <div class="eyebrow">Submission notes</div>
        <h1>Core functionality is reviewable.</h1>
        <p>Reviewer can install, scan a product catalog, import supplier costs, run a cost scenario, inspect suggested minimum prices, export findings, and test the Pricing page.</p>
      </div>
      <div class="monitor hero-panel">
        <div class="monitor-head"><span>Readiness checklist</span><span>For review</span></div>
        <div class="monitor-body">
          <div class="section subtle"><h2>What the reviewer should verify</h2><ul class="features"><li>OAuth opens the embedded app.</li><li>Scan reads Shopify product and inventory data.</li><li>No product prices are changed automatically.</li><li>Paid plan approval uses Shopify billing.</li><li>Uninstall and privacy webhooks return successfully.</li></ul></div>
          <div class="section"><h2>Manual submission item</h2><p>Upload this video to YouTube as unlisted and paste the URL in the screencast field.</p></div>
        </div>
      </div>
    </div>
  </div>
`;

const shots = [
  { slug: "feature-media-1600x900", html: featureShot },
  { slug: "screenshot-1-dashboard", html: dashboardShot },
  { slug: "screenshot-2-pricing", html: pricingShot },
  { slug: "screenshot-3-import-what-if", html: importWhatIfShot },
];

const videoSlides = [
  { slug: "video-01-open", html: videoSlide(installSlide, 1, "Install and open", "Open the embedded app from Shopify Admin. OAuth happens before app setup.") },
  { slug: "video-02-dashboard", html: videoSlide(dashboardShot, 2, "Dashboard scan", "Run a profit scan and review the action center, inventory risk, and suggested minimum prices.") },
  { slug: "video-03-pricing", html: videoSlide(pricingShot, 3, "Pricing and billing", "Free, Starter, and Growth plans are managed inside the app through Shopify billing.") },
  { slug: "video-04-import", html: videoSlide(importWhatIfShot, 4, "Supplier cost import", "Use variant ID, inventory item ID, or SKU so merchants can import costs even when SKUs are missing.") },
  { slug: "video-05-what-if", html: videoSlide(importWhatIfShot, 5, "Cost-change what-if", "Model a supplier cost increase and see newly at-risk products before changing prices.") },
  { slug: "video-06-export", html: videoSlide(exportSlide, 6, "Suggested prices and export", "Download a CSV fix list with price, cost, margin, inventory risk, and next action.") },
  { slug: "video-07-alerts", html: videoSlide(exportSlide, 7, "Weekly alerts", "Paid merchants can enable a weekly margin report for new loss, low-margin, or missing-cost findings.") },
  { slug: "video-08-ready", html: videoSlide(doneSlide, 8, "Reviewer summary", "This walkthrough covers setup and each core feature needed for review testing.") },
];

function pageHtml(body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1600, initial-scale=1"><title>Margin Sentinel App Store Asset</title><style>${baseCss}</style></head><body>${body}</body></html>`;
}

function renderPng(slug, html, targetDir = outDir) {
  const htmlPath = join(renderDir, `${slug}.html`);
  const outputPath = join(targetDir, `${slug}.png`);
  writeFileSync(htmlPath, pageHtml(html), "utf8");
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-sandbox",
    "--force-device-scale-factor=1",
    "--window-size=1600,900",
    `--screenshot=${outputPath}`,
    pathToFileURL(htmlPath).href,
  ], { stdio: "pipe" });
  return outputPath;
}

for (const shot of shots) {
  renderPng(shot.slug, shot.html);
}

for (const slide of videoSlides) {
  renderPng(slide.slug, slide.html, renderDir);
}

const concatListPath = join(renderDir, "screencast-concat.txt");
const durationSeconds = 25;
const concatLines = [];
for (const slide of videoSlides) {
  concatLines.push(`file '${join(renderDir, `${slide.slug}.png`).replace(/'/g, "'\\''")}'`);
  concatLines.push(`duration ${durationSeconds}`);
}
concatLines.push(`file '${join(renderDir, `${videoSlides[videoSlides.length - 1].slug}.png`).replace(/'/g, "'\\''")}'`);
writeFileSync(concatListPath, `${concatLines.join("\n")}\n`, "utf8");

const videoPath = join(outDir, "margin-sentinel-reviewer-screencast.mp4");
const ffmpegResult = spawnSync("ffmpeg", [
  "-y",
  "-f", "concat",
  "-safe", "0",
  "-i", concatListPath,
  "-vf", "fps=30,format=yuv420p",
  "-c:v", "libx264",
  "-movflags", "+faststart",
  videoPath,
], { cwd: root, encoding: "utf8" });

if (ffmpegResult.status !== 0) {
  throw new Error(`ffmpeg failed:\n${ffmpegResult.stderr}`);
}

writeFileSync(join(outDir, "youtube-upload-instructions.md"), `# YouTube upload instructions

Upload file:

\`${videoPath}\`

Recommended title:

\`Margin Sentinel Shopify App Review Walkthrough\`

Recommended visibility:

\`Unlisted\`

Recommended description:

\`\`\`
Margin Sentinel is a Shopify embedded app for catalog margin protection.

This reviewer walkthrough shows:
1. App install/open flow
2. Dashboard profit scan
3. Pricing and Shopify billing plans
4. Supplier cost import
5. Cost-change what-if
6. Suggested minimum prices
7. Findings CSV export
8. Weekly alerts and reviewer notes

The app is read-only for product pricing. It reads Shopify product and inventory data, Shopify unit cost, and merchant-imported supplier costs. It does not change prices automatically.
\`\`\`

After upload:

1. Open YouTube Studio.
2. Create > Upload videos.
3. Select the MP4 above.
4. Set visibility to Unlisted.
5. Copy the YouTube URL.
6. Paste it into the Shopify App Store screencast URL field.
`, "utf8");

writeFileSync(join(outDir, "asset-manifest.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  imageSize: "1600x900",
  featureMedia: "feature-media-1600x900.png",
  screenshots: [
    "screenshot-1-dashboard.png",
    "screenshot-2-pricing.png",
    "screenshot-3-import-what-if.png",
  ],
  screencast: "margin-sentinel-reviewer-screencast.mp4",
  youtubeInstructions: "youtube-upload-instructions.md",
}, null, 2), "utf8");

console.log(`Generated App Store assets in ${outDir}`);
