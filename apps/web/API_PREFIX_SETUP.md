# API Prefix Setup Guide

## Overview

All Elysia API routes are now prefixed with `/api`. This means all endpoints are accessed via `/api/*` instead of directly at the root path.

## What Changed

### Elysia API Routes

**Before:**
```
http://localhost:3000/users
http://localhost:3000/health
http://localhost:3000/messages
```

**After:**
```
http://localhost:3000/api/users
http://localhost:3000/api/health
http://localhost:3000/api/messages
```

## Implementation Details

### 1. Elysia Server (`packages/api-elysia/src/index.ts`)

All routes are now wrapped in a `.group("/api", ...)` call:

```typescript
export const app = new Elysia()
  .use(cors())
  .group("/api", (app) =>
    app
      .get("/users", () => { ... })
      .get("/health", () => { ... })
      // ... all other routes
  );
```

### 2. Eden Treaty Client (`apps/web/src/lib/eden-client.ts`)

The base URL automatically includes `/api`:

```typescript
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000") + "/api";
export const api = treaty<App>(BASE_URL);
```

### 3. WebSocket Connections

WebSocket connections also use the `/api` prefix:

```typescript
const wsUrl = "ws://localhost:3000/api/ws";
const ws = new WebSocket(wsUrl);
```

## Why This Change?

1. **Standard Convention** - Most REST APIs use a prefix like `/api` for versioning and organization
2. **Clear Separation** - Distinguishes API routes from other server routes
3. **Future Proofing** - Easy to version later (e.g., `/api/v1`, `/api/v2`)
4. **Proxying** - Easier to set up reverse proxies and API gateways
5. **Next.js Compatibility** - Aligns with Next.js conventions for API routes

## Configuration

### Environment Variables

**Important:** Do NOT include `/api` in your environment variable!

```env
# ✅ Correct
NEXT_PUBLIC_API_URL=http://localhost:3000

# ❌ Wrong - will result in /api/api/users
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

The `/api` prefix is automatically added by the Eden Treaty client.

## Usage Examples

### REST API Calls

All your existing code works the same way:

```typescript
import { api } from "@/lib/eden-client";

// These automatically hit /api/users
const { data } = await api.users.get();
const { data } = await api.users({ id: "123" }).get();
const { data } = await api.users.post({ name: "John", email: "john@example.com" });
```

### Health Check

```typescript
// Hits /api/health
const { data } = await api.health.get();
```

### WebSocket

```typescript
// Connects to ws://localhost:3000/api/ws
const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") || "ws://localhost:3000";
const ws = new WebSocket(`${wsUrl}/api/ws`);
```

## Testing

### 1. Test Direct API Calls

Using curl or your browser:

```bash
# Health check
curl http://localhost:3000/api/health

# Get users
curl http://localhost:3000/api/users

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

### 2. Test Eden Treaty Client

In your Next.js app:

```typescript
import { api } from "@/lib/eden-client";

// Should work without any code changes
const { data, error } = await api.health.get();
console.log(data); // { status: "ok", ... }
```

### 3. Test WebSocket

```typescript
const wsUrl = "ws://localhost:3000/api/ws";
const ws = new WebSocket(wsUrl);

ws.onopen = () => console.log("Connected to /api/ws");
ws.onmessage = (event) => console.log("Message:", event.data);
```

## Route Structure

Your API now has this structure:

```
http://localhost:3000/
├── api/
│   ├── users
│   │   ├── GET /api/users (list all)
│   │   ├── POST /api/users (create)
│   │   └── :id/
│   │       ├── GET /api/users/:id (get one)
│   │       ├── PATCH /api/users/:id (update)
│   │       ├── DELETE /api/users/:id (delete)
│   │       └── avatar/
│   │           └── POST /api/users/:id/avatar (upload)
│   ├── messages
│   │   └── GET /api/messages?limit=50&offset=0
│   ├── upload
│   │   ├── POST /api/upload (single file)
│   │   └── multiple/
│   │       └── POST /api/upload/multiple
│   ├── webhooks/
│   │   ├── POST /api/webhooks/stripe
│   │   └── POST /api/webhooks/github
│   ├── health
│   │   └── GET /api/health
│   └── ws
│       └── WebSocket /api/ws
```

## Migration Checklist

If you had existing code before this change:

- [x] Updated Elysia routes to use `.group("/api", ...)`
- [x] Updated Eden Treaty client to append `/api` to base URL
- [x] Updated WebSocket connections to use `/api/ws`
- [x] Updated environment variable examples
- [x] Tested all endpoints with new prefix
- [ ] Update any external API documentation
- [ ] Update any API consumers (if applicable)
- [ ] Update reverse proxy/load balancer config (if applicable)

## Troubleshooting

### 404 Errors

**Problem:** Getting 404 errors on all API calls

**Solution:** 
1. Make sure your Elysia server is running with the updated code
2. Verify the client is using the `/api` prefix
3. Check that `NEXT_PUBLIC_API_URL` doesn't already include `/api`

### CORS Errors

**Problem:** CORS errors after adding prefix

**Solution:**
CORS should still work the same way. If you have issues, ensure your CORS config allows the routes:

```typescript
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors({
    origin: ['http://localhost:3001']
  }))
  .group("/api", ...);
```

### WebSocket Connection Fails

**Problem:** WebSocket won't connect

**Solution:**
Ensure you're using the full path including `/api`:

```typescript
const ws = new WebSocket("ws://localhost:3000/api/ws");
```

### Type Errors

**Problem:** TypeScript complains about route types

**Solution:**
1. Restart your TypeScript server in your IDE
2. Run `bun install` to ensure workspace packages are linked
3. The `App` type export should automatically reflect the grouped routes

## Production Considerations

### Reverse Proxy

If using nginx or another reverse proxy:

```nginx
# Proxy all /api requests to Elysia
location /api/ {
    proxy_pass http://localhost:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Environment Variables

For different environments:

```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Staging
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com

# Production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Remember: Never include `/api` in the URL - it's added automatically!

## Future: API Versioning

With this setup, you can easily add versioning in the future:

```typescript
// Current
export const app = new Elysia()
  .group("/api", ...);

// Future v1
export const app = new Elysia()
  .group("/api/v1", ...);

// Or multiple versions
export const app = new Elysia()
  .group("/api/v1", (app) => app.get("/users", ...))
  .group("/api/v2", (app) => app.get("/users", ...));
```

## Summary

- ✅ All API routes now have `/api` prefix
- ✅ Eden Treaty client automatically handles the prefix
- ✅ No changes needed to your API call code
- ✅ WebSocket connections use `/api/ws`
- ✅ Environment variables should NOT include `/api`
- ✅ Better organization and future-proofing

Your API is now following REST best practices! 🎉