---
description: Performance optimization and audit checklist for Next.js + Prisma + PostgreSQL projects
---

# Next.js + Prisma Project Optimization Audit

This workflow contains a comprehensive checklist for optimizing Next.js applications using Prisma ORM with PostgreSQL. Run through this checklist before production deployment or when experiencing performance issues.

---

## 🔧 Phase 1: Database & Prisma Configuration

### 1.1 Connection Pool Optimization (`lib/prisma.ts`)

```typescript
// Optimized settings for serverless (Vercel) environments
const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,                        // Max 5 connections in pool
    min: 1,                        // Keep 1 warm connection
    idleTimeoutMillis: 30000,      // 30s idle timeout
    connectionTimeoutMillis: 10000, // 10s connection timeout (allow cold starts)
    query_timeout: 15000,          // 15s max query time
});
```

**Key Points:**
- [ ] Connection timeout should be 10s+ for cold starts
- [ ] Query timeout should be 15s+ for complex queries
- [ ] Use singleton pattern to prevent connection leaks
- [ ] Enable SSL for production databases

### 1.2 Database Indexes (`prisma/schema.prisma`)

Add indexes for frequently queried columns:

```prisma
model Package {
  // ... fields
  
  @@index([destinationId])
  @@index([price])
  @@index([rating])
  @@index([tourCategory])
  @@index([tourType])
  @@index([createdAt])
}

model Destination {
  // ... fields
  
  @@index([name])
  @@index([country])
  @@index([region])
}

model Review {
  // ... fields
  
  @@index([packageId])
  @@index([userId])
}
```

**Index Checklist:**
- [ ] Add indexes for all foreign key columns
- [ ] Add indexes for columns used in WHERE clauses
- [ ] Add indexes for columns used in ORDER BY
- [ ] Add indexes for columns used in search/filter operations
- [ ] Run `npx prisma db push` or create migration to apply

---

## 🚀 Phase 2: API Route Optimization

### 2.1 Use Select Instead of Include

**Before (fetches all fields):**
```typescript
const pkg = await prisma.package.findUnique({
    where: { id },
    include: { destination: true, reviews: true }
});
```

**After (fetches only needed fields):**
```typescript
const pkg = await prisma.package.findUnique({
    where: { id },
    select: {
        id: true,
        title: true,
        price: true,
        destination: {
            select: { id: true, name: true }
        }
    }
});
```

### 2.2 Add Cache Headers

```typescript
// For data that changes frequently (60s cache)
return NextResponse.json(data, {
    headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    }
});

// For data that rarely changes (5 min cache)
return NextResponse.json(data, {
    headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
    }
});
```

### 2.3 Error Handling Template

```typescript
export async function GET(request: Request) {
    try {
        const data = await prisma.model.findMany({...});
        
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            }
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json(
            { error: "Failed to fetch data" },
            { status: 500 }
        );
    }
}
```

**API Route Checklist:**
- [ ] Replace `include` with `select` in all Prisma queries
- [ ] Add cache headers to public GET endpoints
- [ ] Add try-catch with proper error logging
- [ ] Limit results with `take` for large datasets
- [ ] Use pagination for list endpoints

---

## 📄 Phase 3: Server Components Optimization

### 3.1 Convert Data-Fetching Pages to Server Components

**Before (Client Component with API call):**
```tsx
"use client";
const { data } = useQuery(id);
```

**After (Server Component with direct Prisma):**
```tsx
// page.tsx (Server Component)
import { cache } from "react";

const getData = cache(async (id: number) => {
    try {
        return await prisma.model.findUnique({...});
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
});

export async function generateMetadata({ params }) {
    const data = await getData(params.id);
    return { title: data?.title };
}

export default async function Page({ params }) {
    const data = await getData(params.id);
    if (!data) notFound();
    return <ClientComponent initialData={data} />;
}
```

### 3.2 Add Error Boundaries

Create `error.tsx` in route folders:

```tsx
'use client';

export default function Error({ error, reset }) {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center">
            <h2>Something went wrong</h2>
            <button onClick={reset}>Try Again</button>
        </div>
    );
}
```

**Server Component Checklist:**
- [ ] Use React `cache()` for request deduplication
- [ ] Implement `generateMetadata` for SEO
- [ ] Add JSON-LD structured data
- [ ] Create error.tsx for error handling
- [ ] Pass initial data to client components

---

## 🎨 Phase 4: Frontend Optimization

### 4.1 Component Lazy Loading

```tsx
import dynamic from 'next/dynamic';

// Lazy load below-the-fold components
const ReviewSection = dynamic(() => import("@/components/reviews"), {
    loading: () => <Skeleton />,
    ssr: false,
});
```

### 4.2 Image Optimization

```tsx
<Image
    src={url}
    alt={description}
    width={800}
    height={600}
    sizes="(max-width: 768px) 100vw, 50vw"
    priority={isAboveFold}
    loading={isAboveFold ? "eager" : "lazy"}
    quality={75}
/>
```

**Next.js Config (`next.config.mjs`):**
```javascript
images: {
    qualities: [70, 75],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
        { protocol: 'https', hostname: 'res.cloudinary.com' },
        { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
},
```

### 4.3 Fallback Data Pattern

Always provide fallback data for critical UI:

```tsx
const fallbackSlides = [
    { id: 0, image: '/default-hero.jpg', title: 'Welcome' },
];

const slides = data?.slides?.length > 0 ? data.slides : fallbackSlides;
```

**Frontend Checklist:**
- [ ] Lazy load below-the-fold components
- [ ] Use `priority` for above-fold images
- [ ] Configure image domains in next.config
- [ ] Add loading skeletons
- [ ] Implement fallback data for critical sections

---

## 🧹 Phase 5: Code Cleanup

### 5.1 Remove Unused Components

```bash
# List all components
ls components/

# Search for usage of each component
grep -r "ComponentName" --include="*.tsx" --include="*.ts" .

# Delete unused components
rm components/unused-component.tsx
```

### 5.2 Remove Unused Dependencies

```bash
# Check for unused packages
npx depcheck

# Remove unused packages
pnpm remove package-name
```

**Cleanup Checklist:**
- [ ] Remove unused components
- [ ] Remove unused API routes
- [ ] Remove unused dependencies
- [ ] Remove console.logs (except errors)
- [ ] Remove commented-out code

---

## 🔒 Phase 6: Security & Production

### 6.1 Environment Variables

Required environment variables:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - For authentication
- [ ] `NEXTAUTH_URL` - Production URL

### 6.2 Database SSL

Ensure DATABASE_URL includes SSL:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

### 6.3 Production Build Test

```bash
# Build and check for errors
pnpm build

# Test production locally
pnpm start
```

---

## 📊 Phase 7: Performance Testing

### 7.1 Lighthouse Audit

Run Lighthouse on:
- [ ] Home page
- [ ] List pages (packages, destinations)
- [ ] Detail pages

Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### 7.2 API Response Times

Check these endpoints respond in < 500ms:
- [ ] GET /api/packages
- [ ] GET /api/packages/[id]
- [ ] GET /api/destinations
- [ ] All public GET endpoints

### 7.3 Database Query Analysis

```sql
-- Check slow queries in PostgreSQL
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 📋 Quick Reference Commands

```bash
# Prisma
npx prisma db push          # Push schema changes
npx prisma generate         # Regenerate client
npx prisma studio           # Visual database browser

# Build & Deploy
pnpm build                  # Production build
pnpm start                  # Start production server
vercel --prod               # Deploy to Vercel

# Type Checking
npx tsc --noEmit            # Check TypeScript errors

# Dependencies
npx depcheck                # Find unused dependencies
pnpm update --interactive   # Update packages
```

---

## 🚨 Common Issues & Solutions

### Connection Timeout
**Problem:** "Connection terminated due to connection timeout"
**Solution:** Increase `connectionTimeoutMillis` to 10000+ in prisma.ts

### Cold Start Latency
**Problem:** First request takes 5+ seconds
**Solution:** 
- Use connection pooling (Neon/Supabase pooler)
- Add cache headers
- Convert to server components

### Large Bundle Size
**Problem:** Slow page loads
**Solution:**
- Use dynamic imports
- Check bundle with `npx @next/bundle-analyzer`

### Database in Wrong Region
**Problem:** High latency on all queries
**Solution:** Deploy database in same region as Vercel deployment

---

## ✅ Final Checklist

Before production deployment, ensure:

- [ ] All Prisma queries use `select` instead of `include`
- [ ] Database indexes added for common queries
- [ ] Connection pool settings optimized
- [ ] Cache headers on public API routes
- [ ] Server components for data-heavy pages
- [ ] Error boundaries (error.tsx) added
- [ ] Images optimized with proper sizes
- [ ] Unused components removed
- [ ] Environment variables configured
- [ ] Production build passes without errors
- [ ] Lighthouse scores above 90
- [ ] API response times under 500ms
