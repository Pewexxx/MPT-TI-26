# Architecture

## 1. System context

```mermaid
flowchart LR
    student([Student<br/>browser / phone])
    subgraph app[Promki dla studenta]
        web[Web app<br/>React + Vite]
        api[REST API<br/>Fastify + TS]
        db[(PostgreSQL)]
        scraper[Scraper worker<br/>Node + Cheerio / Playwright]
    end
    bied[biedronka.pl]
    lidl[lidl.pl]

    student -->|HTTPS| web
    web -->|/api/offers?filters| api
    api -->|SQL| db
    scraper -->|upsert offers| db
    scraper -->|HTTP GET, rate-limited| bied
    scraper -->|HTTP GET, rate-limited| lidl
```

Key idea: **scraping and serving are decoupled.** The scraper runs on a schedule
(promotions change roughly weekly) and writes normalized data to the database.
The API only reads from the database, so users never wait on — or trigger — a
request to Biedronka/Lidl, and a broken scraper doesn't take the site down.

## 2. Containers (docker compose)

```mermaid
flowchart TB
    subgraph compose[docker compose]
        web["web<br/>nginx :80 → host :8080<br/>serves static build, proxies /api"]
        api["api<br/>node :3000"]
        scraper["scraper<br/>node + node-cron"]
        db[("db<br/>postgres :5432<br/>volume: pgdata")]
    end
    web --> api --> db
    scraper --> db
```

## 3. Scraping pipeline

```mermaid
flowchart LR
    cron[[cron trigger<br/>e.g. daily 06:00]] --> loop{for each<br/>StoreAdapter}
    loop --> fetch[Fetch pages<br/>respect robots.txt,<br/>delay between requests]
    fetch --> parse[Parse HTML / JSON<br/>Cheerio, or Playwright<br/>if JS-rendered]
    parse --> normalize[Normalize<br/>price, unit, dates,<br/>category mapping]
    normalize --> validate[Validate with<br/>zod OfferSchema]
    validate -->|valid| upsert[(Upsert offers<br/>by store + source id)]
    validate -->|invalid| log[Log + count<br/>in scrape_runs]
    upsert --> expire[Mark offers past<br/>valid_to as expired]
```

Each store is an **adapter** implementing the same interface
(`apps/scraper/src/adapters/types.ts`). Adding a new store (Żabka, Aldi, Kaufland…)
means adding one file, not changing the pipeline.

## 4. Request flow — filtering offers

```mermaid
sequenceDiagram
    actor S as Student
    participant W as Web (React)
    participant A as API (Fastify)
    participant D as PostgreSQL

    S->>W: Pick filters (store, category, max price, sort)
    W->>W: Update URL query string (shareable link)
    W->>A: GET /api/offers?store=lidl&maxPrice=5&sort=pricePerUnit
    A->>A: Validate query with zod (OfferFiltersSchema)
    A->>D: SELECT … WHERE … ORDER BY … LIMIT/OFFSET
    D-->>A: rows
    A-->>W: { items, total }
    W-->>S: Offer grid (cached by TanStack Query)
```

## 5. Data model (draft)

```mermaid
erDiagram
    STORE ||--o{ OFFER : publishes
    CATEGORY ||--o{ OFFER : groups
    SCRAPE_RUN ||--o{ OFFER : "last seen in"
    USER ||--o{ FAVORITE : has
    OFFER ||--o{ FAVORITE : "is saved as"
    USER ||--o{ SAVED_FILTER : has

    STORE {
        text id PK "biedronka | lidl"
        text name
        text base_url
    }
    OFFER {
        uuid id PK
        text store_id FK
        text source_id "id/slug on the store site"
        text name
        text category_id FK
        numeric price_regular
        numeric price_promo
        text unit "kg | l | szt"
        numeric unit_quantity
        text conditions "np. przy zakupie 2 szt."
        bool requires_app "Lidl Plus / Moja Biedronka"
        text image_url
        text source_url
        date valid_from
        date valid_to
        uuid last_scrape_run_id FK
    }
    CATEGORY {
        text id PK "makaron, nabiał, napoje…"
        text name
    }
    SCRAPE_RUN {
        uuid id PK
        text store_id
        timestamptz started_at
        timestamptz finished_at
        int offers_found
        int offers_invalid
        text status
    }
    USER {
        uuid id PK
        text email
    }
    FAVORITE {
        uuid user_id FK
        uuid offer_id FK
    }
    SAVED_FILTER {
        uuid id PK
        uuid user_id FK
        jsonb filters
        bool notify "e-mail when new matches appear"
    }
```

`USER`, `FAVORITE` and `SAVED_FILTER` are for later milestones — the MVP works
without accounts (filters live in the URL).

Constraint worth having from day one: `UNIQUE (store_id, source_id, valid_from)` so
re-running the scraper is idempotent.
