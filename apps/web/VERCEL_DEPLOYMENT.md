# Vercel Deployment Guide

## 🚀 Overview

This guide explains how to deploy your Next.js web app to Vercel after removing Cloudflare-specific dependencies.

## ✅ Changes Made

### 1. Removed Cloudflare Dependencies

**Removed from `package.json`:**
- `@opennextjs/cloudflare` - Cloudflare-specific adapter
- `wrangler` - Cloudflare CLI tool

**Removed Scripts:**
- `preview` - Cloudflare preview
- `deploy` - Cloudflare deployment
- `upload` - Cloudflare upload
- `cf-typegen` - Cloudflare type generation

**Updated `next.config.ts`:**
- Removed `initOpenNextCloudflareForDev()` call
- Removed Cloudflare imports

### 2. Configured for Vercel

Created `vercel.json` with proper build configuration for monorepo setup.

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Your code should be in GitHub
3. **Elysia API Deployed** - Your backend API should be accessible

## 🔧 Deployment Steps

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
# or
bun add -g vercel
```

### Step 2: Configure Environment Variables

In your Vercel project settings, add:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

**Important:** 
- Use your production API URL
- Do NOT include `/api` - it's automatically added by the client
- Make sure your Elysia API is accessible from the internet

### Step 3: Deploy via Vercel Dashboard

#### Option A: GitHub Integration (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `cd ../.. && turbo run build --filter=web`
   - **Install Command:** `bun install`
   - **Output Directory:** `.next`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`
5. Click **Deploy**

#### Option B: Vercel CLI

```bash
# Navigate to web directory
cd apps/web

# Login to Vercel
vercel login

# Deploy
vercel

# Or deploy to production
vercel --prod
```

### Step 4: Configure Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed

## ⚙️ Configuration Files

### `vercel.json`

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

### Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | Your API URL | `https://api.yourdomain.com` |

**Note:** Add other environment variables as needed for your app.

## 🔍 Troubleshooting

### Build Fails: "Cannot find module"

**Problem:** Workspace dependencies not resolving

**Solution:** The `vercel.json` buildCommand handles this by building from the monorepo root with Turbo.

### API Calls Failing in Production

**Problem:** CORS errors or 404s

**Solutions:**
1. Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
2. Ensure your Elysia API allows CORS from your Vercel domain:
   ```typescript
   import { cors } from "@elysiajs/cors";
   
   const app = new Elysia()
     .use(cors({
       origin: [
         'https://your-app.vercel.app',
         'https://yourdomain.com'
       ]
     }))
   ```
3. Check that your API is publicly accessible

### "GLIBC_2.35 not found" Error

**Problem:** This was caused by Cloudflare dependencies

**Solution:** Already fixed! We removed `@opennextjs/cloudflare` which was causing this issue.

### Build Timeout

**Problem:** Build takes too long

**Solutions:**
1. Upgrade to Vercel Pro for longer build times
2. Optimize dependencies
3. Use build caching

## 🌐 Post-Deployment

### Verify Deployment

1. **Health Check:**
   ```bash
   curl https://your-app.vercel.app
   ```

2. **API Connection:**
   - Open your deployed app
   - Check the health status indicator
   - Verify it shows "Connected"

3. **Test Features:**
   - Create a user
   - Fetch users list
   - Verify all API calls work

### Monitor Performance

1. Go to Vercel Dashboard → Analytics
2. Check:
   - Response times
   - Error rates
   - Page views

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment

### Manual Deployment

```bash
cd apps/web
vercel --prod
```

## 📊 Deployment Checklist

- [x] Removed Cloudflare dependencies
- [x] Updated `next.config.ts`
- [x] Created `vercel.json`
- [ ] Set environment variables in Vercel
- [ ] Configure CORS on Elysia API
- [ ] Deploy Elysia API to production
- [ ] Deploy web app to Vercel
- [ ] Test all features in production
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/analytics

## 🎯 Alternative: Deploy to Cloudflare Pages

If you prefer Cloudflare over Vercel, reinstall the dependencies:

```bash
cd apps/web

# Reinstall Cloudflare packages
bun add @opennextjs/cloudflare wrangler

# Restore next.config.ts Cloudflare init
# Restore Cloudflare scripts in package.json

# Deploy
bun run deploy
```

See Cloudflare Pages documentation for details.

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Turbo + Vercel](https://turbo.build/repo/docs/handbook/deploying-with-docker)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 💡 Tips

1. **Use Preview Deployments** - Test changes in preview URLs before merging to production
2. **Enable Web Analytics** - Free analytics built into Vercel
3. **Set up Monitoring** - Use Vercel's built-in monitoring or integrate with tools like Sentry
4. **Optimize Images** - Use Next.js Image component for automatic optimization
5. **Enable Edge Functions** - For better performance in certain regions

## 🆘 Support

If you encounter issues:

1. Check Vercel build logs in the Dashboard
2. Review the [Vercel Community](https://github.com/vercel/vercel/discussions)
3. Check your API is running and accessible
4. Verify all environment variables are set correctly

---

**Your app is now ready for Vercel deployment!** 🎉