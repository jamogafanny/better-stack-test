# Eden Treaty Quick Reference Card

## ⚠️ Important: API Prefix

All API routes use the `/api` prefix. The Eden Treaty client automatically handles this.

- ✅ Server routes: `/api/users`, `/api/health`, etc.
- ✅ Client calls: `api.users.get()` (prefix added automatically)
- ✅ Environment variable: `NEXT_PUBLIC_API_URL=http://localhost:3000` (no `/api`)

See `API_PREFIX_SETUP.md` for details.

## 🚀 Getting Started

```bash
# 1. Set up environment
cp .env.local.example .env.local

# 2. Start Elysia API (port 3000)
cd apps/server && bun run dev

# 3. Start Next.js app (port 3001)
cd apps/web && bun run dev
```

## 📦 Import the Client

```typescript
import { api } from "@/lib/eden-client";
```

## 🔥 Common API Calls

All calls automatically use the `/api` prefix. No code changes needed!

### Users

```typescript
// Get all users
const { data, error } = await api.users.get();

// Get user by ID
const { data, error } = await api.users({ id: "123" }).get();

// Create user
const { data, error } = await api.users.post({
  name: "John Doe",
  email: "john@example.com",
});

// Update user
const { data, error } = await api.users({ id: "123" }).patch({
  name: "Jane Doe",
});

// Delete user
const { data, error } = await api.users({ id: "123" }).delete();
```

### Messages (with pagination)

```typescript
const { data, error } = await api.messages.get({
  query: {
    limit: 50,
    offset: 0,
  },
});
```

### File Upload

```typescript
// Single file
const { data, error } = await api.upload.post({ file });

// Multiple files
const { data, error } = await api.upload.multiple.post({ files });

// Update avatar
const { data, error } = await api.users({ id: userId }).avatar.post({
  avatar: avatarFile,
});
```

### Health Check

```typescript
const { data, error } = await api.health.get();
```

## 🎣 React Hooks

### Health Check Hook

```typescript
import { useHealthCheck } from "@/lib/use-health-check";

function MyComponent() {
  const { data, isLoading, isError } = useHealthCheck({
    refetchInterval: 5000, // ms or undefined to disable
  });
  
  // data: { status, timestamp, users, messages, wsClients }
}
```

### With TanStack Query

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/eden-client";

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    const { data, error } = await api.users.get();
    if (error) throw error;
    return data;
  },
});

// Mutate data
const createUser = useMutation({
  mutationFn: async (newUser) => {
    const { data, error } = await api.users.post(newUser);
    if (error) throw error;
    return data;
  },
});
```

## 🎨 Components

### Health Status Components

```typescript
import {
  HealthStatusIndicator,  // Simple dot + text
  HealthStatusCard,       // Full card with stats
  HealthBadge,           // Compact badge
  HealthStatusWithAction, // With refresh button
  HealthDot,             // Just a dot
} from "@/components/health-status";

// Use anywhere
<HealthBadge />
<HealthStatusCard />
```

### Example CRUD Component

```typescript
import { EdenExample } from "@/components/eden-example";

<EdenExample />
```

## 🔧 Helper Functions

```typescript
import { 
  isApiHealthy, 
  formatHealthTimestamp 
} from "@/lib/use-health-check";

const healthy = isApiHealthy(healthData);
const time = formatHealthTimestamp(healthData?.timestamp);
```

## 🌐 WebSocket

```typescript
// Note: WebSocket uses /api/ws
const wsUrl = "ws://localhost:3000/api/ws";
const ws = new WebSocket(wsUrl);

ws.onopen = () => console.log("Connected");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};

// Send message
ws.send(JSON.stringify({
  type: "chat_message",
  userId: "user-123",
  content: "Hello!",
}));
```

## ❌ Error Handling

```typescript
const { data, error, status } = await api.users.get();

if (error) {
  console.error(`Error ${status}:`, error);
  return;
}

// Use data safely
console.log(data);
```

## 🔐 Environment Variables

```env
# .env.local
# Important: Do NOT include /api - it's automatically added by the client
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📊 Response Structure

All Eden Treaty calls return:

```typescript
{
  data?: T,           // Response data (if successful)
  error?: any,        // Error object (if failed)
  status: number,     // HTTP status code
  response: Response  // Raw fetch Response
}
```

## 💡 Pro Tips

1. **Always check for errors:**
   ```typescript
   if (error) return;
   ```

2. **Use TypeScript autocomplete:**
   - Type `api.` and let your IDE suggest routes
   - Hover over methods for parameter types

3. **Destructure what you need:**
   ```typescript
   const { data } = await api.users.get();
   ```

4. **Combine with TanStack Query for caching:**
   - Better performance
   - Automatic refetching
   - Built-in loading states

5. **Use helper functions from examples:**
   ```typescript
   import { getAllUsers, createUser } from "@/lib/eden-examples";
   ```

## 📚 Documentation Files

- `API_PREFIX_SETUP.md` - API prefix configuration guide
- `EDEN_TREATY_SETUP.md` - Full setup guide
- `EDEN_QUICK_START.md` - Quick start guide
- `HEALTHCHECK_MIGRATION.md` - tRPC migration guide
- `CHANGES_SUMMARY.md` - Complete changes overview
- `src/lib/eden-examples.ts` - Code examples

## 🎯 Type Safety

```typescript
// ✅ Correct
await api.users.post({
  name: "John",
  email: "john@example.com",
});

// ❌ TypeScript error - missing required field
await api.users.post({
  name: "John",
  // email is required!
});

// ❌ TypeScript error - unknown field
await api.users.post({
  name: "John",
  email: "john@example.com",
  foo: "bar", // doesn't exist in schema
});
```

## 🚨 Troubleshooting

**API not connecting?**
- ✓ Check `NEXT_PUBLIC_API_URL` in `.env.local` (should NOT include `/api`)
- ✓ Verify Elysia server is running
- ✓ Check browser Network tab - requests should go to `/api/*`
- ✓ Test directly: `curl http://localhost:3000/api/health`

**Type errors?**
- ✓ Run `bun install` to sync workspace packages
- ✓ Restart TypeScript server in IDE
- ✓ Check `@better-stack-test/api-elysia` is installed

**Import errors?**
- ✓ Use `@/lib/...` path alias
- ✓ Files are in `src/lib/` directory

## ⚡ Performance Tips

1. Use `refetchInterval: undefined` to disable auto-refresh
2. Implement proper loading states
3. Cache responses with TanStack Query
4. Debounce frequent API calls
5. Use optimistic updates for better UX

---

**Need more help?** Check the full documentation in `EDEN_TREATY_SETUP.md`
