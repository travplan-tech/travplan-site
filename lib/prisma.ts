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

// Conservative Singleton Pattern
if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
        connectionString,
        ssl: isServerless || connectionString.includes("sslmode=require")
            ? { rejectUnauthorized: false }
            : undefined,
        // The database allows only 20 connections in total, shared by every
        // warm serverless instance plus any local dev server. At 5 per
        // instance a handful of instances exhausts it and requests start
        // failing with "remaining connection slots are reserved", so keep the
        // per-instance ceiling low and release idle clients quickly.
        max: isServerless ? 3 : 2,
        min: 0, // Never hold idle connections open
        idleTimeoutMillis: 5000, // Release an idle client after 5s
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
