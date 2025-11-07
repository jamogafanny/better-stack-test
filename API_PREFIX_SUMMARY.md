# API Prefix Changes - Summary

## 🎯 What Was Done

All Elysia API routes now use the `/api` prefix for better organization and REST API best practices.

## 📝 Changes Made

### 1. Elysia Server (`packages/api-elysia/src/index.ts`)

**Wrapped all routes in `.group("/api", ...)`**

```typescript
export const app = new Elysia()
  .use(cors())
  .group("/api", (app) =>
    app
      .get("/users", () => { ... })
      .get("/health", () => { ... })
      .ws("/ws", { ... })
      // ... all other routes
  );
```

### 2. Eden Treaty Client (`apps/web/src/lib/eden-client.ts`)

**Automatically appends `/api` to base URL**

```typescript
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000") + "/api";
export const api = treaty<App>(BASE_URL);
```

### 3. WebSocket URL (`apps/web/src/lib/eden-examples.ts`)

**Updated to use `/api/ws`**

```typescript
const ws = new WebSocket(`${wsUrl}/api/ws`);
```

### 4. Documentation

Created `API_PREFIX_SETUP.md` with complete implementation details.

## 🔄 Before vs After

### API Endpoints

| Before | After |
|--------|-------|
| `http://localhost:3000/users` | `http://localhost:3000/api/users` |
| `http://localhost:3000/health` | `http://localhost:3000/api/health` |
| `http://localhost:3000/messages` | `http://localhost:3000/api/messages` |
| `ws://localhost:3000/ws` | `ws://localhost:3000/api/ws` |

### Client Code

**No changes needed!** All your existing code works the same way:

```typescript
// Still works exactly the same
const { data } = await api.users.get();
const { data } = await api.health.get();
```

The Eden Treaty client automatically handles the `/api` prefix.

## ⚙️ Configuration

### Environment Variables

**IMPORTANT:** Do NOT include `/api` in your environment variable!

```env
# ✅ Correct
NEXT_PUBLIC_API_URL=http://localhost:3000

# ❌ Wrong - will result in /api/api/users
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

The `/api` prefix is automatically added by the Eden Treaty client.

## ✅ Benefits

1. **Standard Convention** - Follows REST API best practices
2. **Clear Separation** - Distinguishes API routes from other server routes  
3. **Future Proofing** - Easy to add versioning (`/api/v1`, `/api/v2`)
4. **Better Proxying** - Easier to configure reverse proxies
5. **Next.js Alignment** - Matches Next.js API route conventions

## 🧪 Testing

### Test the Elysia Server Directly

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

### Test the Eden Treaty Client

```typescript
import { api } from "@/lib/eden-client";

// All calls automatically use /api prefix
const { data } = await api.health.get();
const { data } = await api.users.get();
```

### Test WebSocket

```typescript
const ws = new WebSocket("ws://localhost:3000/api/ws");
ws.onopen = () => console.log("Connected to /api/ws");
```

## 🗺️ Complete Route Structure

```
http://localhost:3000/
└── api/
    ├── users/
    │   ├── GET /api/users (list all)
    │   ├── POST /api/users (create)
    │   └── :id/
    │       ├── GET /api/users/:id (get one)
    │       ├── PATCH /api/users/:id (update)
    │       ├── DELETE /api/users/:id (delete)
    │       └── avatar/
    │           └── POST /api/users/:id/avatar
    ├── messages/
    │   └── GET /api/messages?limit=50&offset=0
    ├── upload/
    │   ├── POST /api/upload (single)
    │   └── multiple/
    │       └── POST /api/upload/multiple
    ├── webhooks/
    │   ├── POST /api/webhooks/stripe
    │   └── POST /api/webhooks/github
    ├── health/
    │   └── GET /api/health
    └── ws/
        └── WebSocket /api/ws
```

## 🚨 Common Issues & Solutions

### Issue: 404 on all endpoints

**Cause:** Server not running with updated code or client not using `/api` prefix

**Solution:**
1. Restart your Elysia server
2. Clear browser cache
3. Check Network tab - requests should go to `/api/*`

### Issue: CORS errors

**Cause:** CORS configuration might need updating

**Solution:** Ensure CORS is configured before the group:
```typescript
const app = new Elysia()
  .use(cors({ origin: ['http://localhost:3001'] }))
  .group("/api", ...);
```

### Issue: WebSocket won't connect

**Cause:** Using old WebSocket URL without `/api` prefix

**Solution:** Update WebSocket URL to include `/api`:
```typescript
const ws = new WebSocket("ws://localhost:3000/api/ws");
```

## 📚 Related Documentation

- **`API_PREFIX_SETUP.md`** - Detailed setup and migration guide
- **`EDEN_TREATY_SETUP.md`** - Complete Eden Treaty documentation
- **`QUICK_REFERENCE.md`** - Quick reference for common operations
- **`CHANGES_SUMMARY.md`** - Overview of all changes

## ✨ Key Takeaways

- ✅ All API routes now have `/api` prefix
- ✅ Eden Treaty client handles the prefix automatically
- ✅ No code changes needed in your components
- ✅ Environment variable should NOT include `/api`
- ✅ WebSocket uses `/api/ws`
- ✅ All existing functionality preserved with better organization

## 🚀 Next Steps

1. Restart your Elysia server: `cd apps/server && bun run dev`
2. Restart your Next.js app: `cd apps/web && bun run dev`
3. Test health check: Visit http://localhost:3001
4. Verify API calls in browser Network tab show `/api/*`
5. You're done! Everything should work seamlessly.

---

**Questions?** Check the full guide in `API_PREFIX_SETUP.md`
