import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TRACKER_PATH = path.join(ROOT, "marketing/launch-outreach/outreach_tracker.md");
const SOCIAL_LOG_PATH = path.join(ROOT, "marketing/launch-outreach/SOCIAL_POST_LOG.md");
const APPROVAL_QUEUE_PATH = path.join(ROOT, "marketing/launch-outreach/APPROVAL_QUEUE_2026-06-25_TO_2026-07-02.md");
const TIME_ZONE = "Europe/Brussels";

function localDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseDate(value) {
  if (!value || value.toLowerCase().includes("manual") || value.toLowerCase().includes("send after")) {
    return null;
  }

  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  if (!match) return null;
  return new Date(`${match[0]}T00:00:00Z`);
}

function daysBetween(a, b) {
  const day = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / day);
}

function parseTracker() {
  if (!fs.existsSync(TRACKER_PATH)) return [];

  return fs
    .readFileSync(TRACKER_PATH, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.startsWith("| 20"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .map(([date, company, contact, channel, status, notes, nextFollowUp]) => ({
      date,
      company,
      contact,
      channel,
      status,
      notes,
      nextFollowUp,
      followUpDate: parseDate(nextFollowUp),
    }));
}

function section(title, rows) {
  console.log(`\n## ${title}`);
  if (!rows.length) {
    console.log("None.");
    return;
  }

  for (const row of rows) {
    console.log(`- ${row.company} | ${row.status} | ${row.channel} | ${row.nextFollowUp} | ${row.notes}`);
  }
}

const todayArg = process.argv[2];
const today = parseDate(todayArg || localDateString()) || new Date();
const tracker = parseTracker();
const due = tracker.filter((row) => row.followUpDate && row.followUpDate <= today);
const upcoming = tracker.filter((row) => {
  if (!row.followUpDate) return false;
  const days = daysBetween(today, row.followUpDate);
  return days > 0 && days <= 7;
});
const prepared = tracker.filter((row) => /draft ready|message prepared/i.test(row.status));

console.log(`# Margin Sentinel daily launch brief`);
console.log(`Date: ${today.toISOString().slice(0, 10)}`);
console.log(`Tracker rows: ${tracker.length}`);
console.log(`Social log present: ${fs.existsSync(SOCIAL_LOG_PATH) ? "yes" : "no"}`);
console.log(`Approval queue present: ${fs.existsSync(APPROVAL_QUEUE_PATH) ? "yes" : "no"}`);

section("Due follow-ups", due);
section("Upcoming follow-ups in next 7 days", upcoming);
section("Prepared but not sent/submitted", prepared);

console.log("\n## Operating rule");
console.log("Send or post only after exact approval for the specific recipient and message.");
