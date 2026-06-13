# START HIER - stap voor stap

Rustig. Doe alleen stap 1, dan stap 2, enzovoort. Als iets anders toont dan hieronder: stop, maak screenshot, stuur naar Codex.

Repo link:
https://github.com/jonathanvanderelst1997/profit-guard

## Wat jij moet hebben

- Shopify Partner account: https://partners.shopify.com/
- GitHub account met deze repo.
- Render account: https://dashboard.render.com/
- Neon account voor PostgreSQL: https://console.neon.tech/
- Optioneel later: Resend voor emails: https://resend.com/

## Stap 1 - Shopify API gegevens kopieren

1. Open Shopify Partners:
   https://partners.shopify.com/
2. Klik links op **Apps**.
3. Open jouw app **Margin Sentinel**.
4. Zoek **Client ID** en **Client secret**.
5. Zet ze even in een notitie:

```text
SHOPIFY_API_KEY=plak_client_id_hier
SHOPIFY_API_SECRET=plak_client_secret_hier
SCOPES=read_products,read_inventory
```

Niet naar mij sturen in chat als je dat niet wil. Je plakt ze straks zelf in Render.

## Stap 2 - Database maken in Neon

1. Open Neon:
   https://console.neon.tech/
2. Log in met GitHub of email.
3. Klik **New Project**.
4. Project name:

```text
margin-sentinel
```

5. Kies regio dicht bij jou, liefst Europe als dat kan.
6. Klik **Create project**.
7. Zoek **Connection string** of **DATABASE_URL**.
8. Kopieer die. Ze lijkt ongeveer zo:

```text
postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

Bewaar die als:

```text
DATABASE_URL=plak_neon_database_url_hier
```

## Stap 3 - App deployen op Render

1. Open Render:
   https://dashboard.render.com/
2. Klik **New**.
3. Kies **Blueprint** als je die ziet.
   Als je geen Blueprint ziet, kies **Web Service**.
4. Connect GitHub.
5. Kies repo:

```text
jonathanvanderelst1997/profit-guard
```

6. Als Render vraagt welke branch:

```text
main
```

7. Als Render vraagt naar service name:

```text
margin-sentinel
```

8. Als Render vraagt naar plan: kies **Free** als dat kan.
9. Voeg deze Environment Variables toe:

```text
NODE_ENV=production
SCOPES=read_products,read_inventory
DATABASE_URL=plak_neon_database_url_hier
SHOPIFY_API_KEY=plak_shopify_client_id_hier
SHOPIFY_API_SECRET=plak_shopify_client_secret_hier
SUPPORT_EMAIL=jouw_email_hier
```

10. Voor `SHOPIFY_APP_URL`: wacht tot Render een URL geeft, bijvoorbeeld:

```text
https://margin-sentinel.onrender.com
```

11. Voeg daarna toe:

```text
SHOPIFY_APP_URL=https://jouw-render-url-hier.onrender.com
```

12. Klik **Deploy** of **Create Web Service**.
13. Wacht tot Render zegt **Live**.
14. Open je Render URL. Test:

```text
https://jouw-render-url-hier.onrender.com/healthz
```

Die pagina moet iets gezonds tonen of status 200 geven.

## Stap 4 - Shopify app URL goedzetten

Je moet nu dezelfde Render URL in Shopify zetten.

1. Open Shopify Partners:
   https://partners.shopify.com/
2. Open **Apps** > **Margin Sentinel**.
3. Open **Configuration**.
4. Zet **App URL** op:

```text
https://jouw-render-url-hier.onrender.com
```

5. Zet **Allowed redirection URL(s)** op deze drie regels:

```text
https://jouw-render-url-hier.onrender.com/auth/callback
https://jouw-render-url-hier.onrender.com/auth/shopify/callback
https://jouw-render-url-hier.onrender.com/api/auth/callback
```

6. Klik **Save** of **Save and release**.

## Stap 5 - Shopify CLI deploy doen

Open Terminal en plak dit:

```bash
cd ~/Documents/profid-guard
npx shopify app config validate
shopify app deploy
```

Als Shopify vraagt:

```text
Release a new version?
```

Kies:

```text
y
```

## Stap 6 - App installeren en testen

1. Open Shopify Partners:
   https://partners.shopify.com/
2. Open **Apps** > **Margin Sentinel**.
3. Zoek **Test your app**.
4. Kies je development store.
5. Klik **Install app**.
6. In Shopify Admin open je de app.

Test in deze volgorde:

1. Klik **Dashboard**.
2. Klik **Run profit scan**.
3. Klik **Import costs**.
4. Upload CSV als je er een hebt.
5. Klik **What-if**.
6. Vul in:

```text
8
```

7. Klik **Run what-if**.
8. Klik **Export**.
9. Klik **Alerts**.
10. Klik **Pricing**.
11. Klik **Setup**.

## Stap 7 - Public pages testen

Open deze links met jouw Render URL:

```text
https://jouw-render-url-hier.onrender.com/privacy
https://jouw-render-url-hier.onrender.com/terms
https://jouw-render-url-hier.onrender.com/refund
https://jouw-render-url-hier.onrender.com/support
```

Als alle pagina's werken, goed.

## Stap 8 - Shopify App Pricing

1. Open Shopify Partners:
   https://partners.shopify.com/
2. Open **Apps** > **Margin Sentinel**.
3. Zoek **Pricing** of **App pricing**.
4. Maak deze plannen:

```text
Free
$0
Scan up to 100 variants
```

```text
Starter
$15/month
Scan up to 5,000 variants
Supplier CSV cost import
Suggested minimum prices
Cost-change what-if
Weekly alerts
```

```text
Growth
$39/month
Scan up to 25,000 variants
Supplier CSV cost import
Suggested minimum prices
Cost-change what-if
Weekly alerts
Priority support
```

Docs:
https://shopify.dev/docs/apps/launch/billing/shopify-app-pricing

## Stap 9 - Email alerts later pas

Dit mag je overslaan voor de eerste beta.

Als je weekly alert emails live wil:

1. Open Resend:
   https://resend.com/
2. Add domain.
3. Volg deze docs:
   https://resend.com/docs/dashboard/domains/introduction
4. Voeg DNS records toe.
5. Zet in Render:

```text
RESEND_API_KEY=plak_resend_api_key_hier
ALERTS_FROM_EMAIL=alerts@jouwdomein.com
```

## Stap 10 - Screenshots maken

Maak screenshots van:

1. Dashboard met Action Center.
2. Findings table met inventory risk.
3. What-if pagina.
4. Import costs pagina.
5. Alerts pagina.

Bewaar ze voor Shopify App Store.

## Stap 11 - Shopify App Store indienen

1. Lees requirements:
   https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements
2. Gebruik tekst uit:

```text
docs/APP_STORE_LISTING.md
```

3. Reviewer instructies uit:

```text
docs/REVIEWER_DEMO_SCRIPT.md
```

4. Voeg public links toe:

```text
https://jouw-render-url-hier.onrender.com/privacy
https://jouw-render-url-hier.onrender.com/terms
https://jouw-render-url-hier.onrender.com/refund
https://jouw-render-url-hier.onrender.com/support
```

5. Upload screenshots.
6. Submit.

## Stap 12 - Plugins koppelen voor marketing

Koppel later deze plugins/accounts:

- Browser
- Shopify
- GitHub
- Email/Outlook of Gmail als beschikbaar
- LinkedIn/X/social scheduler als beschikbaar

Daarna kan Codex dit doen:

- prospects zoeken;
- berichten personaliseren;
- posts klaarzetten;
- goedgekeurde emails sturen;
- replies samenvatten;
- beta tracker bijwerken;
- mensen opvolgen.

Belangrijk: Codex stuurt geen bulkspam zonder jouw akkoord op lijst + tekst.

## Als je vastzit

Stuur gewoon:

```text
Ik zit vast bij stap X, dit zie ik:
```

En plak screenshot of tekst.
