"use client";
import { useHealthCheck } from "@/lib/use-health-check";

const TITLE_TEXT = `
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 `;

export default function Home() {
  const healthCheck = useHealthCheck({ refetchInterval: 5000 });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Elysia API Status</h2>
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`h-2 w-2 rounded-full ${healthCheck.data?.status === "ok" ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-sm text-muted-foreground">
              {healthCheck.isLoading
                ? "Checking..."
                : healthCheck.data?.status === "ok"
                  ? "Connected"
                  : "Disconnected"}
            </span>
          </div>

          {healthCheck.data && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Users:</span>
                <span className="font-medium">{healthCheck.data.users}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Messages:</span>
                <span className="font-medium">{healthCheck.data.messages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  WebSocket Clients:
                </span>
                <span className="font-medium">
                  {healthCheck.data.wsClients}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Check:</span>
                <span className="font-medium">
                  {new Date(healthCheck.data.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
