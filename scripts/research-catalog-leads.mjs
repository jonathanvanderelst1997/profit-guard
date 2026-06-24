import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_INPUT = "marketing/lead-research/shopify_catalog_seed_domains.csv";
const DEFAULT_OUTPUT = "marketing/lead-research/catalog_probe_results.csv";
const MAX_PAGES = Number(process.env.MAX_PAGES || 8);
const USER_AGENT = "MarginSentinelPublicResearch/1.0";

function parseCsvLine(line) {
  const cells = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (quoted && char === "\"" && next === "\"") {
      value += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      quoted = !quoted;
      continue;
    }

    if (!quoted && char === ",") {
      cells.push(value);
      value = "";
      continue;
    }

    value += char;
  }

  cells.push(value);
  return cells;
}

function toCsvValue(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll("\"", "\"\"")}"`;
  }
  return stringValue;
}

function normalizeDomain(domain) {
  return domain
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .trim()
    .toLowerCase();
}

async function readSeeds(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const [headerLine, ...lines] = raw.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(headerLine);

  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "application/json,text/html;q=0.9,*/*;q=0.8" },
    signal: AbortSignal.timeout(10_000),
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok || !contentType.includes("json")) {
    return { ok: response.ok, status: response.status, contentType, json: null };
  }

  return { ok: true, status: response.status, contentType, json: await response.json() };
}

async function urlExists(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "user-agent": USER_AGENT, accept: "text/html,*/*;q=0.8" },
      signal: AbortSignal.timeout(8_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function findContactUrl(domain) {
  const candidates = [
    `https://${domain}/pages/contact`,
    `https://${domain}/pages/contact-us`,
    `https://${domain}/contact`,
    `https://${domain}/pages/support`,
  ];

  for (const candidate of candidates) {
    if (await urlExists(candidate)) {
      return candidate;
    }
  }

  return "";
}

function scoreLead({ productsCounted, variantsCounted, capped, sector }) {
  let score = 0;

  if (productsCounted >= 1000) score += 30;
  else if (productsCounted >= 500) score += 20;
  else if (productsCounted >= 200) score += 10;

  if (variantsCounted >= 5000) score += 25;
  else if (variantsCounted >= 1500) score += 15;
  else if (variantsCounted >= 500) score += 8;

  if (capped) score += 15;

  const supplierHeavySectors = ["auto parts", "lighting", "outdoor", "furniture", "beauty", "apparel", "sporting goods"];
  if (supplierHeavySectors.some((needle) => sector.toLowerCase().includes(needle))) {
    score += 15;
  }

  if (score >= 70) return "A";
  if (score >= 45) return "B";
  if (score >= 25) return "C";
  return "D";
}

async function probeSeed(seed) {
  const domain = normalizeDomain(seed.domain);
  let productsCounted = 0;
  let variantsCounted = 0;
  let pagesCounted = 0;
  let capped = false;
  let endpointStatus = "";
  let sampleProduct = "";
  let error = "";

  try {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const result = await fetchJson(`https://${domain}/products.json?limit=250&page=${page}`);
      endpointStatus = result.status || "error";

      if (!result.ok || !Array.isArray(result.json?.products)) {
        break;
      }

      const products = result.json.products;
      if (products.length === 0) break;

      pagesCounted += 1;
      productsCounted += products.length;
      variantsCounted += products.reduce((sum, product) => sum + (product.variants?.length || 0), 0);
      sampleProduct ||= products[0]?.title || "";

      if (products.length < 250) break;
      if (page === MAX_PAGES) capped = true;
    }
  } catch (caught) {
    error = caught.message;
  }

  const contactUrl = await findContactUrl(domain);
  const leadGrade = scoreLead({
    productsCounted,
    variantsCounted,
    capped,
    sector: seed.sector || "",
  });

  return {
    domain,
    sector: seed.sector,
    source: seed.source,
    productsCounted,
    variantsCounted,
    pagesCounted,
    cappedAtMaxPages: capped ? "yes" : "no",
    productsEndpointStatus: endpointStatus,
    contactUrl,
    leadGrade,
    sampleProduct,
    angle: seed.angle,
    notes: seed.notes,
    error,
  };
}

async function main() {
  const input = path.resolve(ROOT, process.argv[2] || DEFAULT_INPUT);
  const output = path.resolve(ROOT, process.argv[3] || DEFAULT_OUTPUT);
  const seeds = await readSeeds(input);
  const rows = [];

  for (const seed of seeds) {
    rows.push(await probeSeed(seed));
  }

  rows.sort((a, b) => {
    const gradeOrder = { A: 0, B: 1, C: 2, D: 3 };
    return gradeOrder[a.leadGrade] - gradeOrder[b.leadGrade] || b.variantsCounted - a.variantsCounted;
  });

  const headers = Object.keys(rows[0] || {});
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(","))].join("\n");
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${csv}\n`);

  console.table(rows.map(({ domain, sector, productsCounted, variantsCounted, cappedAtMaxPages, leadGrade, contactUrl }) => ({
    domain,
    sector,
    productsCounted,
    variantsCounted,
    cappedAtMaxPages,
    leadGrade,
    contactUrl: contactUrl ? "yes" : "no",
  })));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
