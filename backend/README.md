# FinSight AI - Backend Core 🧱

The backend is built with **NestJS**, **Prisma ORM**, and connected statically to **Supabase** (PostgreSQL). It acts as the backbone handling authentication, role validation, global search, business workflows, and API forwarding to the Python AI engine.

## Setup & Running
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file containing:
   ```env
   DATABASE_URL="postgres://..."
   DIRECT_URL="postgres://..."
   JWT_SECRET="supersecret_hash"
   ```

3. Generate the Prisma Client and Sync Schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Populate Mock Showcase Data for 4 roles:
   ```bash
   npx prisma db seed
   ```

5. Run in Development Mode:
   ```bash
   npm run start:dev
   ```

The backend runs centrally on port `3000`.
