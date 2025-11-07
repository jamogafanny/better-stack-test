# Health Check Migration Guide

## Overview

This document explains the migration from tRPC to Eden Treaty for the health check endpoint in the web application.

## What Changed

### Before (tRPC)
```typescript
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

const healthCheck = useQuery(trpc.healthCheck.queryOptions());
```

### After (Eden Treaty)
```typescript
import { useHealthCheck } from "@/lib/use-health-check";

const healthCheck = useHealthCheck({ refetchInterval: 5000 });
```

## Benefits of the Migration

1. **Type Safety** - Eden Treaty provides end-to-end type safety directly from your Elysia server
2. **Simpler Setup** - No need for tRPC middleware and server-side configuration
3. **Direct API Calls** - Communicates directly with your Elysia REST API
4. **Better Performance** - Fewer abstraction layers between client and server
5. **Reusable Hook** - Custom `useHealthCheck` hook can be used throughout the app

## API Endpoint

The health check uses the existing Elysia endpoint at `/health`:

```typescript
// packages/api-elysia/src/index.ts
.get("/health", () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
  users: users.size,
  messages: messages.length,
  wsClients: wsClients.size,
}))
```

## Files Modified

### 1. `apps/web/src/app/page.tsx`
- Replaced tRPC import with Eden Treaty hook
- Enhanced UI to show additional health metrics (users, messages, WebSocket clients)
- Added auto-refresh every 5 seconds
- Improved status indicator logic

### 2. `apps/web/src/lib/use-health-check.ts` (New)
A reusable React hook that:
- Fetches health data from the Elysia API
- Handles errors gracefully
- Supports custom refetch intervals
- Includes retry logic with exponential backoff
- Provides helper functions for health status

## Usage Examples

### Basic Usage
```typescript
function MyComponent() {
  const { data, isLoading, isError } = useHealthCheck();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return <div>Status: {data.status}</div>;
}
```

### Custom Refetch Interval
```typescript
// Refresh every 10 seconds
const health = useHealthCheck({ refetchInterval: 10000 });
```

### Disable Auto-Refetch
```typescript
const health = useHealthCheck({ refetchInterval: false });
```

### Conditional Fetching
```typescript
// Only fetch when user is logged in
const { isAuthenticated } = useAuth();
const health = useHealthCheck({ enabled: isAuthenticated });
```

## Helper Functions

### `isApiHealthy(data)`
```typescript
import { isApiHealthy } from "@/lib/use-health-check";

const { data } = useHealthCheck();
const healthy = isApiHealthy(data);
```

### `formatHealthTimestamp(timestamp)`
```typescript
import { formatHealthTimestamp } from "@/lib/use-health-check";

const { data } = useHealthCheck();
const formattedTime = formatHealthTimestamp(data?.timestamp);
```

## Health Check Response

The Elysia health endpoint returns:

```typescript
interface HealthCheckData {
  status: string;        // "ok" when healthy
  timestamp: string;     // ISO timestamp of the check
  users: number;         // Number of users in memory
  messages: number;      // Number of messages stored
  wsClients: number;     // Active WebSocket connections
}
```

## Testing

1. **Start the Elysia API server:**
   ```bash
   cd apps/server
   bun run dev
   ```

2. **Start the web app:**
   ```bash
   cd apps/web
   bun run dev
   ```

3. **Verify the health check:**
   - Open http://localhost:3001
   - You should see:
     - Green dot with "Connected" status
     - Real-time stats (users, messages, WebSocket clients)
     - Auto-updating timestamp (refreshes every 5 seconds)

## Error Handling

The hook includes built-in error handling:

- **Retry Logic**: Automatically retries failed requests up to 3 times
- **Exponential Backoff**: Wait time increases between retries (1s, 2s, 4s...)
- **Max Retry Delay**: Caps at 30 seconds
- **Error States**: Provides `isError` and `error` in the return value

```typescript
const { data, isError, error } = useHealthCheck();

if (isError) {
  console.error("Health check failed:", error);
}
```

## Troubleshooting

### Health Check Shows "Disconnected"

1. **Check API URL** - Verify `NEXT_PUBLIC_API_URL` in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

2. **Verify API is Running** - Make sure your Elysia server is running on the correct port

3. **Check CORS** - Ensure CORS is properly configured in your Elysia app:
   ```typescript
   import { cors } from "@elysiajs/cors";
   
   const app = new Elysia()
     .use(cors({
       origin: ['http://localhost:3001']
     }))
   ```

4. **Network Tab** - Open browser DevTools → Network tab to see if requests are failing

### TypeScript Errors

If you encounter type errors, ensure:
- `@elysiajs/eden` is installed: `bun add @elysiajs/eden`
- `@better-stack-test/api-elysia` is in your dependencies
- Run `bun install` to sync workspace dependencies

## Migration Checklist

- [x] Install `@elysiajs/eden` package
- [x] Create Eden Treaty client (`src/lib/eden-client.ts`)
- [x] Create `useHealthCheck` hook
- [x] Update `page.tsx` to use new hook
- [x] Test health check functionality
- [x] Verify auto-refresh works
- [x] Update environment variables
- [ ] Remove old tRPC health check endpoint (if no longer needed)
- [ ] Update other components using tRPC (as needed)

## Next Steps

1. Consider migrating other tRPC endpoints to Eden Treaty for consistency
2. Add loading skeletons for better UX during health checks
3. Implement health check notifications for critical failures
4. Add health check history/monitoring dashboard

## Additional Resources

- [Eden Treaty Documentation](https://elysiajs.com/eden/overview.html)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Elysia Documentation](https://elysiajs.com/)