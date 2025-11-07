"use client";

import {
  useHealthCheck,
  isApiHealthy,
  formatHealthTimestamp,
} from "@/lib/use-health-check";

/**
 * Simple health status indicator component
 * Shows a colored dot and text based on API health
 */
export function HealthStatusIndicator() {
  const { data, isLoading } = useHealthCheck();
  const healthy = isApiHealthy(data);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 w-2 rounded-full ${
          isLoading ? "bg-yellow-500" : healthy ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-sm text-muted-foreground">
        {isLoading ? "Checking..." : healthy ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
}

/**
 * Detailed health status card component
 * Shows full health information with stats
 */
export function HealthStatusCard() {
  const { data, isLoading, isError, error } = useHealthCheck({
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <h3 className="font-semibold text-red-900 mb-2">
          API Connection Error
        </h3>
        <p className="text-sm text-red-700">
          {error instanceof Error ? error.message : "Failed to connect to API"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-2 font-medium">API Status</h2>
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`h-2 w-2 rounded-full ${
            data?.status === "ok" ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm text-muted-foreground">
          {data?.status === "ok" ? "Connected" : "Disconnected"}
        </span>
      </div>

      {data && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Users:</span>
            <span className="font-medium">{data.users}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Messages:</span>
            <span className="font-medium">{data.messages}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">WebSocket Clients:</span>
            <span className="font-medium">{data.wsClients}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Check:</span>
            <span className="font-medium">
              {formatHealthTimestamp(data.timestamp)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact health badge component
 * Perfect for headers or footers
 */
export function HealthBadge() {
  const { data, isLoading } = useHealthCheck({ refetchInterval: 10000 });
  const healthy = isApiHealthy(data);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isLoading
          ? "bg-yellow-100 text-yellow-800"
          : healthy
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
      }`}
    >
      <div
        className={`h-1.5 w-1.5 rounded-full ${
          isLoading ? "bg-yellow-500" : healthy ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {isLoading ? "Checking" : healthy ? "API Online" : "API Offline"}
    </div>
  );
}

/**
 * Health status with action button
 * Shows status and allows manual refresh
 */
export function HealthStatusWithAction() {
  const { data, isLoading, refetch } = useHealthCheck({
    refetchInterval: undefined, // Manual refresh only - disables auto-refresh
  });
  const healthy = isApiHealthy(data);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              healthy ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">
            {healthy ? "API Connected" : "API Disconnected"}
          </span>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Checking..." : "Refresh"}
        </button>
      </div>

      {data && (
        <div className="text-xs text-muted-foreground">
          Last checked: {formatHealthTimestamp(data.timestamp)}
        </div>
      )}
    </div>
  );
}

/**
 * Minimal health dot component
 * Just a colored dot, perfect for minimalist UIs
 */
export function HealthDot() {
  const { data, isLoading } = useHealthCheck();
  const healthy = isApiHealthy(data);

  return (
    <div
      className={`h-2 w-2 rounded-full ${
        isLoading
          ? "bg-yellow-500 animate-pulse"
          : healthy
            ? "bg-green-500"
            : "bg-red-500"
      }`}
      title={
        isLoading
          ? "Checking..."
          : healthy
            ? "API Connected"
            : "API Disconnected"
      }
    />
  );
}
