# Eden Treaty Quick Start

## 🚀 What's Been Set Up

Your Next.js web app now has a fully type-safe Eden Treaty client to communicate with your Elysia API!

## 📦 Files Added

- `src/lib/eden-client.ts` - The Eden Treaty client configuration
- `src/lib/eden-examples.ts` - Usage examples and helper functions
- `src/components/eden-example.tsx` - Complete React component example
- `EDEN_TREATY_SETUP.md` - Detailed documentation
- `.env.local.example` - Environment variables template

## ⚙️ Quick Setup

1. **Copy the environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Update the API URL in `.env.local`:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Start your Elysia API server** (in another terminal):
   ```bash
   cd apps/server
   bun run dev
   ```

4. **Start your web app:**
   ```bash
   bun run dev
   ```

## 💡 Basic Usage

### Import the client
```typescript
import { api } from "@/lib/eden-client";
```

### Make API calls
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

## 🎯 Use in React Components

```typescript
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/eden-client";

export function MyComponent() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await api.users.get();
      if (data) setUsers(data);
    }
    fetchUsers();
  }, []);

  return <div>{/* Your JSX */}</div>;
}
```

## ✨ Key Benefits

- ✅ **Full Type Safety** - TypeScript knows all your API routes and types
- ✅ **Autocomplete** - Your IDE suggests available endpoints and parameters
- ✅ **No Manual Types** - Types are automatically inferred from your Elysia server
- ✅ **Compile-Time Errors** - Catch API mismatches before runtime

## 📚 Next Steps

1. Check out `src/lib/eden-examples.ts` for more usage patterns
2. See `src/components/eden-example.tsx` for a complete React example
3. Read `EDEN_TREATY_SETUP.md` for detailed documentation
4. Start building! Import `api` and enjoy type-safe API calls

## 🔧 Common API Patterns

### With Query Parameters
```typescript
const { data } = await api.messages.get({
  query: {
    limit: 50,
    offset: 0,
  },
});
```

### File Upload
```typescript
const { data } = await api.upload.post({
  file: myFile,
});
```

### Error Handling
```typescript
const { data, error, status } = await api.users.get();

if (error) {
  console.error(`Error ${status}:`, error);
  return;
}

// Use data safely
console.log(data);
```

## 🎉 That's It!

You're ready to make type-safe API calls to your Elysia backend. Happy coding!