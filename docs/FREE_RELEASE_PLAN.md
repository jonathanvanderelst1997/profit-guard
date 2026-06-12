# Free release plan

Goal: get as close as possible to Shopify App Store readiness without spending money or needing paid services.

## Done in repo

- Public landing/login page with real Profit Guard positioning.
- Public policy routes:
  - `/privacy`
  - `/terms`
  - `/refund`
  - `/support`
- Support page reads `SUPPORT_EMAIL` so the final contact can be set at deploy time.
- Marketing landing page for beta outreach.
- App Store listing draft.
- Competitor benchmark.
- Go-to-market plan.
- Outreach email and LinkedIn copy.
- Review checklist and reviewer instructions.
- Test coverage for margin helper logic, CSV parsing, export, demo costs, product fetch mapping, and security helpers.

## Still free, but account-dependent

- Use Shopify dev store to record the reviewer screencast.
- Use GitHub Actions CI already configured through the PR.
- Use a free-tier hosting option if available for the chosen stack.
- Use trial/free managed PostgreSQL if available and acceptable for beta.
- Use DNS/domain only if a domain is already owned. Otherwise use the host-provided URL for beta.

## Not safe to do automatically

- Submit the Shopify App Store listing.
- Send outreach emails or LinkedIn messages.
- Enter billing details.
- Buy a domain.
- Create paid infrastructure.
- Publish legal policies as final without business/legal review.

## Suggested beta path

1. Deploy the app on the cheapest acceptable host with managed PostgreSQL.
2. Use the host-provided URL for closed beta.
3. Install on the dev store and record a walkthrough.
4. Ask 10 merchants/agencies to try one margin scan.
5. Only spend money after at least 3 merchants say the scan found something useful.
