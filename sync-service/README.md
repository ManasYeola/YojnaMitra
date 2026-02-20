# YojanaMitra — Scheme Sync Service

Automated daily synchronisation service that fetches all government scheme data from the [MyScheme public API](https://api.myscheme.gov.in) and upserts it into the shared MongoDB `schemes` collection.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Project Structure](#project-structure)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Service](#running-the-service)
6. [Testing & Dry-Run](#testing--dry-run)
7. [Data Model](#data-model)
8. [Error Handling](#error-handling)
9. [Deployment](#deployment)
10. [Scaling](#scaling)

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        scheduler.js                            │
│  node-cron  ─►  0 2 * * *  (02:00 IST daily)                  │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                       syncSchemes.js                           │
│                                                                │
│  1. fetchAllSlugs()  ────►  /search/v6/schemes  (paginated)    │
│                                                                │
│  2. For each batch of 3 slugs (800 ms between batches):        │
│      a. fetchSchemeBySlug() ►  /schemes/v6/public/schemes      │
│      b. fetchDocuments()    ►  /schemes/v6/…/{id}/documents    │
│      c. fetchFaqs()         ►  /schemes/v6/…/{id}/faqs         │
│      d. Scheme.updateOne()  ►  MongoDB upsert                  │
│                                                                │
│  3. Mark unlisted slugs as isActive=false                      │
│  4. Write SyncLog record                                       │
└────────────────────────────────────────────────────────────────┘
```

**Rate limiting:**  3 concurrent requests · 800 ms pause between batches
**Retry policy:**   2 total attempts · 1.5 s exponential back-off (skip 4xx)
**Timeout:**        10 seconds per API call

---

## Project Structure

```
sync-service/
├── src/
│   ├── config/
│   │   └── db.js                 ← MongoDB singleton connection
│   ├── models/
│   │   ├── Scheme.js             ← Mongoose scheme model  (→ `schemes`)
│   │   └── SyncLog.js            ← Mongoose sync log model (→ `sync_logs`)
│   ├── services/
│   │   ├── apiClient.js          ← Shared Axios instance (auth, timeout, logging)
│   │   ├── fetchSearch.js        ← Paginated slug fetcher
│   │   ├── fetchScheme.js        ← Scheme detail fetcher + transformer
│   │   ├── fetchDocuments.js     ← Documents fetcher
│   │   └── fetchFaqs.js          ← FAQ fetcher
│   ├── utils/
│   │   ├── delay.js              ← setTimeout promise wrapper
│   │   ├── logger.js             ← Winston structured logger (console + rotating files)
│   │   └── retry.js              ← Configurable async retry with back-off
│   ├── syncSchemes.js            ← Main orchestration (importable + standalone)
│   └── scheduler.js              ← Entry point: cron + graceful shutdown
├── logs/                         ← Auto-created; rotating daily log files
├── .env.example                  ← Copy to .env
├── package.json
└── README.md
```

---

## Installation

### Prerequisites

| Requirement | Minimum version |
|-------------|-----------------|
| Node.js     | 18.x            |
| npm         | 9.x             |
| MongoDB     | 5.x             |

### Steps

```bash
# 1. Navigate to the sync service directory
cd sync-service

# 2. Install dependencies
npm install

# 3. Copy and configure environment
cp .env.example .env
# → Edit .env with your MONGO_URI and API_KEY
```

---

## Configuration

Edit `sync-service/.env`:

```dotenv
# MongoDB connection — must point at the `yojanamitra` database
MONGO_URI=mongodb://localhost:27017/yojanamitra

# MyScheme API key — never commit this to version control
API_KEY=your_key_here

# development | production
NODE_ENV=production

# Logging level: error | warn | info | debug
LOG_LEVEL=info

# Set true to run a sync immediately when the scheduler starts
SYNC_ON_START=false
```

> **Security:** Add `.env` to `.gitignore`. Never commit credentials.

---

## Running the Service

### Start the scheduler (keeps running, triggers daily at 02:00 IST)

```bash
npm start
# or
node src/scheduler.js
```

### Run a one-shot sync immediately (then exit)

```bash
npm run sync
# or
node src/syncSchemes.js
```

### Run with an immediate sync on start

```bash
npm run sync:now
# or
SYNC_ON_START=true node src/scheduler.js
```

### Development (auto-restart on file changes)

```bash
npm run dev
```

---

## Testing & Dry-Run

### Test mode — processes only 5 schemes

```bash
npm run sync:test
# or
TEST_MODE=true node src/syncSchemes.js
```

Use this to verify your API key and MongoDB connection are working before a full run.

### Dry-run mode — no database writes

```bash
npm run sync:dry
# or
DRY_RUN=true node src/syncSchemes.js
```

Use this to inspect what the sync *would* do without touching the database.

---

## Data Model

Each document in the `schemes` collection:

```json
{
  "_id": "<schemeId from API>",
  "slug": "pm-kisan",
  "name": "PM KISAN",
  "level": "Central",
  "state": "",
  "category": ["Agriculture"],
  "tags": ["farmers", "income support"],

  "basicDetails": { "...raw API block..." },

  "description_md":        "## About\n...",
  "benefits_md":           "₹6000/year direct transfer...",
  "eligibility_md":        "Small and marginal farmers...",
  "exclusions_md":         "Income tax payers...",
  "applicationProcess_md": "Visit nearest CSC...",
  "documentsRequired_md":  "Aadhaar card, bank passbook...",

  "documents": [{ "name": "Aadhaar Card", "mandatory": true }],
  "faqs": [{ "question": "Who is eligible?", "answer_md": "..." }],

  "lastSyncedAt": "2026-02-21T02:03:45.000Z",
  "sourceVersion": "v6",
  "isActive": true
}
```

**Sync logs** (`sync_logs` collection):

```json
{
  "syncedAt": "2026-02-21T02:00:00.000Z",
  "durationSeconds": 312.5,
  "totalSchemes": 1200,
  "totalSynced": 1198,
  "failedCount": 2,
  "failedSlugs": ["some-broken-slug"],
  "mode": "production",
  "status": "partial"
}
```

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| API 4xx (bad slug) | Skip + log; no retry |
| API 5xx / network | Retry once after 1.5 s; skip if still fails |
| API timeout (10 s) | Counts as network error → retry |
| Documents API fails | Scheme saved without documents (soft fail) |
| FAQs API fails | Scheme saved without FAQs (soft fail) |
| MongoDB write fails | Scheme counted as failed; loop continues |
| Critical / all fail | `sync_logs` status = `"failed"`; error re-thrown |
| SIGTERM / SIGINT | Cron stops; waits up to 5 min for active sync; exits cleanly |

---

## Deployment

### PM2 (recommended for VPS / bare metal)

```bash
npm install -g pm2

# Start
pm2 start src/scheduler.js --name yojanamitra-sync --time

# Auto-start on server reboot
pm2 save
pm2 startup

# Logs
pm2 logs yojanamitra-sync

# Restart / stop
pm2 restart yojanamitra-sync
pm2 stop    yojanamitra-sync
```

PM2 ecosystem file (`ecosystem.config.js`):

```js
module.exports = {
  apps: [{
    name:        'yojanamitra-sync',
    script:      'src/scheduler.js',
    cwd:         '/app/sync-service',
    instances:   1,       // always 1 — prevents duplicate syncs
    watch:       false,
    env: {
      NODE_ENV:       'production',
      SYNC_ON_START:  'false',
    },
  }],
};
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
CMD ["node", "src/scheduler.js"]
```

```bash
docker build -t yojanamitra-sync .
docker run -d \
  --name yojanamitra-sync \
  --env-file .env \
  --restart unless-stopped \
  yojanamitra-sync
```

### Systemd unit (Linux VPS)

```ini
[Unit]
Description=YojanaMitra Sync Service
After=network.target

[Service]
Type=simple
WorkingDirectory=/app/sync-service
ExecStart=/usr/bin/node src/scheduler.js
EnvironmentFile=/app/sync-service/.env
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable yojanamitra-sync
sudo systemctl start  yojanamitra-sync
sudo journalctl -u yojanamitra-sync -f
```

---

## Scaling

| Concern | Recommendation |
|---|---|
| 10,000+ schemes | The batch loop handles any count; increase `MAX_CONCURRENCY` to 5 if the API allows |
| Faster syncs | Reduce `BATCH_DELAY_MS` if rate limits permit; never go below 200 ms |
| Multiple regions | Run one instance per region; each writes to the same MongoDB |
| Horizontal scale | Do NOT run multiple instances simultaneously — they'll duplicate writes and race on `updateMany` |
| DB write throughput | MongoDB `upsert` is O(log n) on `_id`; 10k schemes ≈ 2–5 min at current tuning |
| Log aggregation | Point `logs/` at a mounted volume; or stream Winston output to Datadog / CloudWatch |
| Alerting | Add a webhook call in `syncSchemes.js` when `status === 'failed'` |
