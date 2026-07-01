# Growth operating system - 2026-07-01

Goal: make Margin Sentinel measurable, useful in the first 5 minutes, and visible only where buyer intent exists.

## Current truth

- App health is green.
- GA4 realtime showed 0 active users during the last check.
- Shopify Partner analytics was not reachable through the old analytics URL.
- Production app usage is not readable yet: local `METRICS_TOKEN` is prepared, but the live Render service still needs the same `METRICS_TOKEN` value.
- Gmail/Outlook showed no positive buyer replies from the first audit batch yet.
- Reddit is paused because AutoModerator removed replies while post karma is below 10.
- Moca was sent via contact form on 2026-07-01 after the browser reached `contact_posted=true` and showed the thank-you confirmation.

## Daily metrics checklist

Capture these once per day before any outreach:

| Date | Listing views | Install clicks | Installs | Active shops | Scans | Missing-cost events | CSV imports | Scenario runs | Trials | Replies | Audits booked | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 2026-07-01 | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | 0 | 0 | App health is OK; `/internal/metrics` still returns 403 until live Render `METRICS_TOKEN` is set. |

## Operating rules

- No random volume batches.
- Max 5 new prospects per day, only catalog-heavy merchants.
- CTA is always a free margin leak audit, not an app trial.
- X is only for buyer-intent replies.
- Shopify Community is advice-first and only on open relevant threads.
- Reddit stays paused until post karma is above 10.
- LinkedIn remains out of scope.
- Wait 48 hours after an audit batch before following up.

## Founder-led audit offer

Core question:

> Want me to check 20 SKUs for missing costs, low-margin variants, and margin leaks, then send back the findings?

Positive reply flow:

1. Ask whether they prefer a Shopify install + first scan or a small 20-SKU export.
2. Review missing costs, low-margin variants, inventory risk, and suggested first fixes.
3. Send a short findings summary plus the read-only CSV/proof export.
4. Ask one follow-up question: "Is this useful enough that you would want this watched weekly?"

## Product proof loop

- The app now supports active, resolved, and ignored finding statuses.
- Default dashboard view should act like a fix queue: active findings first.
- CSV export includes workflow status so merchants can prove what was reviewed.
- Weekly email remains "Top 5 margin leaks this week."
- Do not build big dashboards until there are at least 20 installs or 5 audit conversations.

## Moca status

Status: sent on 2026-07-01 via contact form.

Message to send:

> Hi Moca team, I am Jonathan, founder of Margin Sentinel. I am offering a free margin leak audit for Shopify catalogs: I will check 20 SKUs for missing costs, low-margin items, and pricing leaks, then send the findings. Want me to run one for Moca?

Confirmation observed: `contact_posted=true` in the URL and "Thanks for contacting us. We'll get back to you as soon as possible." on the page.

## Next 7-day target

- 5 audit starts or calls attempted.
- 1-3 real installs or scans.
- 1 useful proof artifact from a real or sample catalog.
- Daily metrics log filled before more outreach.
- First testimonial/review request only after someone confirms the audit was useful.
