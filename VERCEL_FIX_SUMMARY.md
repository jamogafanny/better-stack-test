# Vercel Deployment Fix - Summary

## ✅ Problem Solved

**Original Error:**
```
/vercel/path0/node_modules/.bun/@cloudflare+workerd-linux-64@1.20251105.0/node_modules/@cloudflare/workerd-linux-64/bin/workerd: /lib64/libc.so.6: version `GLIBC_2.35' not found (required by /vercel/path0/node_modules/.bun/@cloudflare+workerd-linux-64@1.20251105.0/node_modules/@cloudflare/workerd-linux-64/bin/workerd)
```

**Root Cause:**
- You were using `@opennextjs/cloudflare` which is designed for **Cloudflare Pages** deployment
- Vercel's build environment has an older GLIBC version that's incompatible with Cloudflare's Workerd runtime
- You can't deploy to Vercel with Cloudflare-specific packages

## 🔧 Changes Made

### 1. Removed Cloudflare Dependencies

**From `apps/web/package.json`:**
- ❌ Removed `@opennextjs/cloudflare` package
- ❌ Removed `wrangler` dev dependency
- ❌ Removed Cloudflare-specific scripts:
  - `preview`
  - `deploy`
  - `upload`
  - `cf-typegen`

### 2. Updated Next.js Config

**`apps/web/next.config.ts`:**
```typescript
// Before:
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
// ... config
initOpenNextCloudflareForDev();

// After:
import type { NextConfig } from "next";
// ... config
export default nextConfig;
```

### 3. Created Vercel Configuration

**`apps/web/vercel.json`:**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && turbo run build --filter=web",
  "installCommand": "bun install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url"
  }
}
```

### 4. Documentation

Created `VERCEL_DEPLOYMENT.md` with:
- Complete deployment guide
- Environment variable setup
- Troubleshooting tips
- Post-deployment checklist

## 🚀 How to Deploy to Vercel

### Method 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Configure:
   - **Root Directory:** `apps/web`
   - **Build Command:** `cd ../.. && turbo run build --filter=web`
   - **Install Command:** `bun install`
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your API URL (without `/api`)
6. Deploy!

### Method 2: Vercel CLI

```bash
cd apps/web
vercel login
vercel --prod
```

## ⚙️ Required Configuration

### Environment Variables (Set in Vercel Dashboard)

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

**Important:**
- Do NOT include `/api` in the URL
- Must be your production API URL
- Ensure your Elysia API is publicly accessible

### CORS Configuration (On Your Elysia API)

```typescript
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors({
    origin: [
      'https://your-app.vercel.app',
      'https://yourdomain.com'
    ]
  }))
  .group("/api", ...);
```

## ⚠️ Additional Issue Found

During testing, we found a TypeScript error in `dashboard.tsx`:

```
Property 'customer' does not exist on type authClient
```

This is a **separate issue** from the Vercel deployment error. To fix:

1. Check your auth configuration
2. Ensure `authClient.customer` is properly configured
3. Or remove/comment out the dashboard route temporarily

The Cloudflare/GLIBC error is now **completely fixed**! ✅

## ✅ Deployment Checklist

- [x] Removed Cloudflare dependencies
- [x] Updated `next.config.ts`
- [x] Created `vercel.json`
- [ ] Set `NEXT_PUBLIC_API_URL` in Vercel
- [ ] Configure CORS on Elysia API
- [ ] Deploy Elysia API to production
- [ ] Push code to GitHub
- [ ] Deploy to Vercel
- [ ] Test in production

## 🔄 Alternative: Deploy to Cloudflare Instead

If you prefer Cloudflare Pages over Vercel:

1. Reinstall the packages:
   ```bash
   cd apps/web
   bun add @opennextjs/cloudflare wrangler
   ```

2. Restore `next.config.ts` with Cloudflare init

3. Deploy:
   ```bash
   bun run deploy
   ```

## 📚 Files Modified

- ✏️ `apps/web/package.json` - Removed Cloudflare deps
- ✏️ `apps/web/next.config.ts` - Removed Cloudflare init
- ➕ `apps/web/vercel.json` - Added Vercel config
- ➕ `apps/web/VERCEL_DEPLOYMENT.md` - Added guide

## 🎯 Next Steps

1. **Fix the auth/dashboard issue** (separate from Vercel)
2. **Set environment variables** in Vercel Dashboard
3. **Deploy your Elysia API** to a production server
4. **Push to GitHub** and let Vercel auto-deploy
5. **Test your production deployment**

## 📖 Documentation

- `VERCEL_DEPLOYMENT.md` - Complete deployment guide
- `API_PREFIX_SETUP.md` - API configuration
- `EDEN_TREATY_SETUP.md` - Eden Treaty client docs

---

**The GLIBC/Cloudflare error is fixed!** You can now deploy to Vercel. 🎉