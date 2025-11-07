import { treaty } from "@elysiajs/eden";
import type { App } from "@better-stack-test/api-elysia";

// Create the Eden Treaty client
// Update the base URL to match your Elysia server's URL
// Note: /api is included in the base URL to match the Elysia server's route prefix
const BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000") + "/api";

export const api = treaty<App>(BASE_URL);

// Export typed client for easier usage
export type ApiClient = typeof api;
