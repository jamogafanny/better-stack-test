# Eden Treaty Setup Guide

This guide explains how to use the Eden Treaty client to interact with your Elysia API in a type-safe manner from your Next.js web application.

## What is Eden Treaty?

Eden Treaty is a fully type-safe client for Elysia.js that provides end-to-end type safety between your server and client. It automatically infers types from your Elysia server definition, giving you autocomplete and type checking without manual type definitions.

## Installation

The required dependencies have already been added to your project:

```json
{
  "@elysiajs/eden": "^1.2.8",
  "@better-stack-test/api-elysia": "workspace:*"
}
```

## Configuration

### 1. Environment Variables

Create a `.env.local` file in the `apps/web` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For production, set this to your deployed Elysia API URL.

### 2. Eden Client Setup

The Eden client is configured in `src/lib/eden-client.ts`:

```typescript
import { treaty } from "@elysiajs/eden";
import type { App } from "@better-stack-test/api-elysia";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = treaty<App>(BASE_URL);
```

## Usage Examples

### Basic REST API Calls

#### Get All Users

```typescript
import { api } from "@/lib/eden-client";

const { data, error } = await api.users.get();

if (error) {
  console.error("Error:", error);
} else {
  console.log("Users:", data);
}
```

#### Get User by ID

```typescript
const userId = "123";
const { data, error } = await api.users({ id: userId }).get();
```

#### Create a User

```typescript
const { data, error } = await api.users.post({
  name: "John Doe",
  email: "john@example.com",
});
```

#### Update a User

```typescript
const { data, error } = await api.users({ id: userId }).patch({
  name: "Jane Doe",
  email: "jane@example.com",
});
```

#### Delete a User

```typescript
const { data, error } = await api.users({ id: userId }).delete();
```

### Query Parameters

```typescript
const { data, error } = await api.messages.get({
  query: {
    limit: 50,
    offset: 0,
  },
});
```

### File Uploads

#### Upload Single File

```typescript
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  const { data, error } = await api.upload.post({
    file,
  });
}
```

#### Upload Multiple Files

```typescript
const files = Array.from(fileInput.files || []);

const { data, error } = await api.upload.multiple.post({
  files,
});
```

#### Update User Avatar

```typescript
const { data, error } = await api.users({ id: userId }).avatar.post({
  avatar: avatarFile,
});
```

### WebSocket Connection

For WebSocket connections, you'll need to use the native WebSocket API:

```typescript
const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") || "ws://localhost:3000";
const ws = new WebSocket(`${wsUrl}/ws`);

ws.onopen = () => {
  console.log("Connected");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Message:", data);
};

// Send a chat message
ws.send(JSON.stringify({
  type: "chat_message",
  userId: "user-123",
  content: "Hello!",
}));
```

## Using in React Components

### Client Component Example

```typescript
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/eden-client";

export function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await api.users.get();
      if (data) setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}
```

### Server Component / Server Actions

For Next.js Server Components or Server Actions, you can use Eden Treaty as well:

```typescript
// app/users/page.tsx
import { api } from "@/lib/eden-client";

export default async function UsersPage() {
  const { data: users } = await api.users.get();

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### With TanStack Query (Recommended)

For better caching and state management, combine Eden Treaty with TanStack Query:

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/eden-client";

export function UsersWithQuery() {
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await api.users.get();
      if (error) throw error;
      return data;
    },
  });

  // Create user mutation
  const createUser = useMutation({
    mutationFn: async (newUser: { name: string; email: string }) => {
      const { data, error } = await api.users.post(newUser);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.users[id].delete();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## Type Safety Benefits

### 1. Autocomplete

Your IDE will provide autocomplete for all routes and parameters:

```typescript
api.users.             // Autocomplete shows available methods: get, post, etc.
api.users({ id }).     // Autocomplete shows: get, patch, delete, avatar
```

### 2. Type Checking

TypeScript will catch errors at compile time:

```typescript
// ✅ Correct
await api.users.post({
  name: "John",
  email: "john@example.com",
});

// ❌ Error: Type '"invalid"' is not assignable to type 'string'
await api.users.post({
  name: "John",
  email: "invalid",  // Email validation fails
});

// ❌ Error: Property 'foo' does not exist
await api.users.post({
  name: "John",
  email: "john@example.com",
  foo: "bar",  // Unknown property
});
```

### 3. Response Types

Responses are automatically typed:

```typescript
const { data } = await api.users.get();
// data is automatically typed as User[] | undefined

if (data) {
  data.forEach(user => {
    console.log(user.name);   // ✅ TypeScript knows 'name' exists
    console.log(user.email);  // ✅ TypeScript knows 'email' exists
    // console.log(user.foo); // ❌ Error: Property 'foo' does not exist
  });
}
```

## Error Handling

Eden Treaty returns an object with `data` and `error` properties:

```typescript
const { data, error, status, response } = await api.users.get();

if (error) {
  // Handle error
  console.error("Status:", status);
  console.error("Error:", error);
  return;
}

// Use data safely
console.log(data);
```

## Testing Your Setup

1. Start your Elysia API server:
   ```bash
   cd apps/server
   bun run dev
   ```

2. Start your Next.js web app:
   ```bash
   cd apps/web
   bun run dev
   ```

3. Visit the example component at `/eden-example` (if you add it to your routes)

4. Try the example functions in `src/lib/eden-examples.ts`

## Common Issues

### CORS Errors

Make sure your Elysia server has CORS enabled:

```typescript
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
  }))
  // ... routes
```

### Type Import Issues

If you get type errors, make sure you're importing the type correctly:

```typescript
import type { App } from "@better-stack-test/api-elysia";
```

The `type` keyword is important to avoid bundling issues.

### Environment Variables

Remember that `NEXT_PUBLIC_` prefix is required for environment variables that need to be available in the browser.

## Additional Resources

- [Eden Treaty Documentation](https://elysiajs.com/eden/overview.html)
- [Elysia Documentation](https://elysiajs.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

## Example Files

- `src/lib/eden-client.ts` - Client configuration
- `src/lib/eden-examples.ts` - Usage examples
- `src/components/eden-example.tsx` - React component example

## Next Steps

1. Configure your API URL in `.env.local`
2. Start both your Elysia API and Next.js web app
3. Import and use the `api` client in your components
4. Enjoy full type safety across your entire stack!