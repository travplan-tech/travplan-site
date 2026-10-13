import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// For development only
if (process.env.NODE_ENV !== "production") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const globalForPrisma = global as unknown as { prisma: PrismaClient; pool: Pool };

const connectionString = process.env.DATABASE_URL!;
const isServerless = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
// `next build` prerenders with one worker per CPU, and each worker builds its
// own pool. At 3 connections each that alone overshoots the database's 20, and
// prerendering then fails with P2037 and bakes empty data into the static
// pages, so a build gets a single connection per worker.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

// Conservative Singleton Pattern
if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
        connectionString,
        ssl: isServerless || connectionString.includes("sslmode=require")
            ? { rejectUnauthorized: false }
            : undefined,
        // The database allows only 20 connections in total, shared by every
        // warm serverless instance plus any local dev server.
        //
        // One connection per instance on Vercel, not three. The platform
        // freezes the Node process between invocations, so idleTimeoutMillis
        // never fires while frozen: a warm instance holds whatever it opened
        // until it is recycled. Measured on a saturated database, ten Vercel
        // instances were each sitting on idle connections six minutes old.
        // Capping at one means an instance can squat on at most one slot.
        max: isBuild || isServerless ? 1 : 2,
        min: 0, // Never hold idle connections open
        // Still worth setting for long-running processes (local dev, scripts),
        // where the timer does run.
        idleTimeoutMillis: 5000,
        connectionTimeoutMillis: 10000, // 10s for cold starts
        query_timeout: 15000, // 15s max query time
    });
}

const pool = globalForPrisma.pool;

if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({
        adapter,
        log: ["error"],
    });
}

export const prisma = globalForPrisma.prisma;
