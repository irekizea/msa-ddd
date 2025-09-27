full request test - dahye

🚀 MSA DDD/CQRS — NestJS + Prisma + Kafka

Build microservice-ready backends with:
NestJS ⚡ DDD + CQRS 🧠 Prisma 🗄️ Outbox 📬 Kafka/Redpanda 🧵 pnpm 📦

This starter uses one Nest app (order-service) containing:

✍️ Write model: domain, use cases, repositories, outbox

🔎 Read model: projectors (Kafka consumers) + read API / query DB

You can split read/write into separate services later — start simple, scale when needed.

🔭 At a Glance

Language: TypeScript (Node 18/20+)

Framework: NestJS + @nestjs/microservices

DB: Postgres (Prisma ×2 clients: write & read)

Messaging: Kafka/Redpanda

Pattern: DDD + CQRS + Hexagonal + Outbox

Package Manager: pnpm (Corepack recommended)

🧩 Architecture
flowchart LR
subgraph Write[✍️ order-service (write model)]
A[Use Case] --> B[Domain (Order aggregate)]
B --> C[Repository (Prisma: write)]
C --> D[(order_write DB)]
B --> E[Domain Events]
E --> F[OutboxEvent row]
F -->|publisher| K{{Kafka: order.status.changed}}
end

subgraph Read[🔎 order-service (read model)]
K --> G[Projector (Kafka consumer)]
G --> H[(order_query DB: OrderPaymentView)]
I[Read API (GET /orders/:id)] --> H
end

subgraph Payment[💳 payment-service (later)]
P[Outbox: payment.status.changed] --> K2{{Kafka: payment.status.changed}}
end

K2 --> G


Legend

🗄️ Write DB: Order, OrderItem, OutboxEvent

📚 Read DB: OrderPaymentView (denormalized, query-optimized)

📬 Outbox: reliable “state change → event” guarantee

🧵 Kafka: async events between services

📁 Repository Layout
root/
pnpm-workspace.yaml
docker-compose.yml      # Postgres + Redpanda
apps/
order-service/
.env
src/
prisma/
write.prisma.ts
read.prisma.ts
modules/
order-write/     # domain, use cases, repos, outbox publisher
order-read/      # projectors + read controllers
app.module.ts
main.ts            # HTTP + Kafka microservice
prisma/
write/schema.prisma   # Order, OrderItem, OutboxEvent
read/schema.prisma    # OrderPaymentView, ProcessedEvent
package.json

✅ Prerequisites

🟢 Node 18+/20+

📦 pnpm

corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
# or: npm i -g pnpm


🐳 Docker (Postgres + Redpanda)

🏁 Quick Start (Local)
1) Start Infra
   docker compose up -d   # Postgres (5432), Redpanda (9092)

2) Install Deps
   pnpm install

3) Environment Vars (apps/order-service/.env)
# HTTP + Kafka
PORT=3001
KAFKA_BROKER=localhost:9092

# Write model (schema=order_write)
WRITE_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=order_write"
WRITE_DIRECT_URL="postgresql://postgres:postgres@localhost:5432/app?schema=order_write"

# Read model (schema=order_query)
READ_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=order_query"
READ_DIRECT_URL="postgresql://postgres:postgres@localhost:5432/app?schema=order_query"

# Optional (safer diffs)
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_shadow"


💡 If you use Prisma Accelerate (prisma://…) for runtime, keep the *_DIRECT_URL as postgresql://… — migrate uses directUrl.

4) Generate Clients & Run Migrations
# from apps/order-service

# ✍️ write model
pnpm prisma generate --schema prisma/write/schema.prisma
pnpm prisma migrate dev --name init_write --schema prisma/write/schema.prisma

# 🔎 read model
pnpm prisma generate --schema prisma/read/schema.prisma
pnpm prisma migrate dev --name init_read --schema prisma/read/schema.prisma

5) Run the App
   pnpm --filter @apps/order-service start:dev


HTTP: http://localhost:3001

Kafka consumer group: order-service

🧱 Database & Migrations (DDL)

Edit schema.prisma → run Prisma Migrate (no manual DDL for app tables).

Write schema: Order, OrderItem, OutboxEvent

Read schema: OrderPaymentView, ProcessedEvent

# Add/change write tables
pnpm prisma migrate dev --name <change> --schema prisma/write/schema.prisma

# Add/change read tables
pnpm prisma migrate dev --name <change> --schema prisma/read/schema.prisma


🛡️ If your DB role can’t create schemas, run once:

CREATE SCHEMA IF NOT EXISTS order_write;
CREATE SCHEMA IF NOT EXISTS order_query;

🧵 Kafka Topics & Event Contracts

Topics

order.status.changed (key = orderId)

payment.status.changed (key = orderId)

Payloads

// order.status.changed
{ eventId: string, orderId: string, status: 'CREATED'|'PAID'|'CANCELLED', version: number, occurredAt: string }

// payment.status.changed
{ eventId: string, orderId: string, status: 'PENDING'|'AUTHORIZED'|'CAPTURED'|'FAILED'|'REFUNDED', version: number, occurredAt: string }


🧭 Use partition key = orderId to preserve per-order event order.

🔁 Typical Flow

Use Case → Domain validates & mutates aggregate

Repository saves state and appends OutboxEvent in the same transaction

Outbox Publisher reads PENDING → emits to Kafka → marks SENT

Projector (Kafka consumer) upserts the read table with idempotency + version guard

Read API serves from the read DB only

🔍 Read API
GET /orders/:id  → returns OrderPaymentView row


⏳ If projection hasn’t arrived yet, you may see 404. That’s normal with eventual consistency.

🧪 Testing

🧠 Domain unit tests: pure TS (no DB) — e.g., Order.cancel() rules

🔌 Integration: repository save + outbox in one tx; projector idempotency

☁️ Deploy Notes

Per env:

pnpm prisma migrate deploy  # write schema
pnpm prisma migrate deploy  # read schema


(Use the correct *_DIRECT_URL.)

Scale:

Read controllers: horizontally (stateless)

Projectors: single consumer group unless partitioned by orderId

Zero-downtime:

Additive migrations → deploy → destructive cleanup later

Enum/column rename: add → backfill → switch → drop

🧰 Scripts (examples)

root package.json

{
"scripts": {
"dev:order": "pnpm --filter @apps/order-service start:dev",
"prisma:gen": "pnpm -r --filter ./apps/** run prisma:generate",
"prisma:migrate:write": "pnpm --filter @apps/order-service prisma migrate dev -- --schema prisma/write/schema.prisma",
"prisma:migrate:read": "pnpm --filter @apps/order-service prisma migrate dev -- --schema prisma/read/schema.prisma"
}
}


apps/order-service package.json

{
"name": "@apps/order-service",
"scripts": {
"start": "nest start",
"start:dev": "nest start --watch",
"prisma:generate": "prisma generate",
"prisma:migrate": "prisma migrate dev"
}
}

🛟 Troubleshooting

❌ P1010: User was denied access
➜ You’re using Data Proxy for migrate or lack privileges.
✅ Add directUrl (postgresql://…?schema=…) in datasource db and ensure the user can create in that schema.

🔎 Schema not created
➜ Misspelled schema= in connection string (not shcema).
✅ Pre-create with SQL above or fix URL.

🧭 WebStorm can’t find pnpm
➜ PATH issue.
✅ Enable Corepack in WebStorm terminal, or add npm global bin to PATH.

🔐 Corepack “Cannot find matching keyid”
➜ Old Corepack vs rotated keys.
✅ npm i -g corepack@^0.31 then corepack prepare pnpm@latest --activate, or npm i -g pnpm.

🗺️ Next Steps

⚙️ Implement OutboxPublisher (interval worker)

🧭 Wire Order projector + Read controller

💳 Add payment-service later; emit payment.status.changed

👀 Add health checks, metrics, retries (backoff) in publisher/consumers

Want a ready-to-paste Outbox publisher + Projector? Say the word and I’ll drop the files.
before database connect by 3rd party

export DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=API_KEY"
npx @prisma/ppg-tunnel --host 127.0.0.1 --port 52604
