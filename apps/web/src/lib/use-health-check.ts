"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { api } from "./eden-client";

interface HealthCheckData {
  status: string;
  timestamp: string;
  users: number;
  messages: number;
  wsClients: number;
}

interface UseHealthCheckOptions {
  refetchInterval?: number;
  enabled?: boolean;
}

/**
 * Custom hook to fetch health check data from the Elysia API
 *
 * @param options - Configuration options
 * @param options.refetchInterval - How often to refetch (in ms). Default: 5000
 * @param options.enabled - Whether the query should run. Default: true
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data, isLoading, isError } = useHealthCheck();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (isError) return <div>Error loading health status</div>;
 *
 *   return <div>Status: {data.status}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom refetch interval
 * const health = useHealthCheck({ refetchInterval: 10000 });
 * ```
 *
 * @example
 * ```tsx
 * // Disable auto-refetch
 * const health = useHealthCheck({ refetchInterval: false });
 * ```
 */
export function useHealthCheck(options: UseHealthCheckOptions = {}) {
  const { refetchInterval = 5000, enabled = true } = options;

  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data, error } = await api.health.get();

      if (error) {
        throw new Error("Failed to fetch health status");
      }

      if (!data) {
        throw new Error("No health data received");
      }

      return data as HealthCheckData;
    },
    refetchInterval,
    enabled,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Helper function to determine if the API is healthy
 */
export function isApiHealthy(data?: HealthCheckData): boolean {
  return data?.status === "ok";
}

/**
 * Helper function to format the timestamp
 */
export function formatHealthTimestamp(timestamp?: string): string {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleTimeString();
}
