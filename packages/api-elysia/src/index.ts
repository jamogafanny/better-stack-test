// server.ts
import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { z } from "zod";

// Shared Zod schemas
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  avatarUrl: z.string().optional(),
});

export const CreateUserSchema = UserSchema.omit({ id: true, avatarUrl: true });

export const MessageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  content: z.string(),
  timestamp: z.string(),
});

export const UploadResponseSchema = z.object({
  url: z.string(),
  filename: z.string(),
  size: z.number(),
});

// In-memory storage (use database in production)
const users = new Map<string, z.infer<typeof UserSchema>>([
  [
    "1",
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
    },
  ],
  [
    "2",
    {
      id: "2",
      name: "Bob Smith",
      email: "bob.smith@example.com",
      avatarUrl: "https://i.pravatar.cc/150?img=2",
    },
  ],
  [
    "3",
    {
      id: "3",
      name: "Carol Williams",
      email: "carol.williams@example.com",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
    },
  ],
]);
const messages: z.infer<typeof MessageSchema>[] = [];
const wsClients = new Set<any>();

export const app = new Elysia().use(cors()).group("/api", (app) =>
  app
    // ============================================
    // REST API Routes with Type Safety
    // ============================================

    // Get all users
    .get("/users", () => {
      return Array.from(users.values());
    })

    // Get user by ID
    .get(
      "/users/:id",
      ({ params, set }) => {
        const user = users.get(params.id);
        if (!user) {
          set.status = 404;
          return { error: "User not found" };
        }
        return user;
      },
      {
        params: t.Object({
          id: t.String(),
        }),
      },
    )

    // Create user
    .post(
      "/users",
      ({ body }) => {
        const user: z.infer<typeof UserSchema> = {
          id: crypto.randomUUID(),
          ...body,
        };
        users.set(user.id, user);
        return user;
      },
      {
        body: t.Object({
          name: t.String({ minLength: 2 }),
          email: t.String({ format: "email" }),
        }),
      },
    )

    // Update user
    .patch(
      "/users/:id",
      ({ params, body, set }) => {
        const user = users.get(params.id);
        if (!user) {
          set.status = 404;
          return { error: "User not found" };
        }

        const updated = { ...user, ...body };
        users.set(params.id, updated);
        return updated;
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        body: t.Partial(
          t.Object({
            name: t.String(),
            email: t.String(),
            avatarUrl: t.String(),
          }),
        ),
      },
    )

    // Delete user
    .delete(
      "/users/:id",
      ({ params, set }) => {
        const deleted = users.delete(params.id);
        if (!deleted) {
          set.status = 404;
          return { error: "User not found" };
        }
        return { success: true };
      },
      {
        params: t.Object({
          id: t.String(),
        }),
      },
    )

    // Get messages with pagination
    .get(
      "/messages",
      ({ query }) => {
        const limit = query.limit || 50;
        const offset = query.offset || 0;
        return {
          messages: messages.slice(offset, offset + limit),
          total: messages.length,
        };
      },
      {
        query: t.Object({
          limit: t.Optional(t.Number()),
          offset: t.Optional(t.Number()),
        }),
      },
    )

    // ============================================
    // File Upload
    // ============================================

    .post(
      "/upload",
      async ({ body }) => {
        const file = body.file;

        // In production, upload to S3/Cloudflare R2/etc
        // For demo, we'll just return metadata
        const filename = file.name;
        const size = file.size;

        // Simulate file processing
        const buffer = await file.arrayBuffer();
        console.log(`Uploaded ${filename}: ${size} bytes`);

        // Return file URL (in production this would be your CDN URL)
        return {
          url: `https://cdn.example.com/uploads/${crypto.randomUUID()}-${filename}`,
          filename,
          size,
        };
      },
      {
        body: t.Object({
          file: t.File({
            maxSize: "5m", // 5MB max
            type: ["image/jpeg", "image/png", "image/gif", "image/webp"],
          }),
        }),
      },
    )

    // Upload multiple files
    .post(
      "/upload/multiple",
      async ({ body }) => {
        const files = body.files;

        const results = await Promise.all(
          files.map(async (file) => {
            const buffer = await file.arrayBuffer();
            return {
              url: `https://cdn.example.com/uploads/${crypto.randomUUID()}-${file.name}`,
              filename: file.name,
              size: file.size,
            };
          }),
        );

        return { uploads: results };
      },
      {
        body: t.Object({
          files: t.Files({
            maxSize: "10m",
            maxItems: 5,
          }),
        }),
      },
    )

    // Update user avatar (file upload + user update)
    .post(
      "/users/:id/avatar",
      async ({ params, body, set }) => {
        const user = users.get(params.id);
        if (!user) {
          set.status = 404;
          return { error: "User not found" };
        }

        const file = body.avatar;
        const avatarUrl = `https://cdn.example.com/avatars/${crypto.randomUUID()}-${file.name}`;

        // Update user with new avatar
        const updated = { ...user, avatarUrl };
        users.set(params.id, updated);

        // Notify all WebSocket clients
        wsClients.forEach((ws) => {
          ws.send(
            JSON.stringify({
              type: "user_updated",
              user: updated,
            }),
          );
        });

        return updated;
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        body: t.Object({
          avatar: t.File({
            maxSize: "2m",
            type: ["image/jpeg", "image/png"],
          }),
        }),
      },
    )

    // ============================================
    // WebSocket for Real-time Chat
    // ============================================

    .ws("/ws", {
      open(ws) {
        wsClients.add(ws);
        console.log("Client connected. Total clients:", wsClients.size);

        // Send welcome message
        ws.send(
          JSON.stringify({
            type: "connected",
            message: "Welcome to the chat!",
          }),
        );
      },

      message(ws, message) {
        try {
          const data = JSON.parse(message as string);

          switch (data.type) {
            case "chat_message":
              // Create new message
              const newMessage: z.infer<typeof MessageSchema> = {
                id: crypto.randomUUID(),
                userId: data.userId,
                content: data.content,
                timestamp: new Date().toISOString(),
              };

              messages.push(newMessage);

              // Broadcast to all clients
              wsClients.forEach((client) => {
                client.send(
                  JSON.stringify({
                    type: "new_message",
                    message: newMessage,
                  }),
                );
              });
              break;

            case "typing":
              // Broadcast typing indicator (except to sender)
              wsClients.forEach((client) => {
                if (client !== ws) {
                  client.send(
                    JSON.stringify({
                      type: "user_typing",
                      userId: data.userId,
                    }),
                  );
                }
              });
              break;

            default:
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Unknown message type",
                }),
              );
          }
        } catch (err) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid message format",
            }),
          );
        }
      },

      close(ws) {
        wsClients.delete(ws);
        console.log("Client disconnected. Total clients:", wsClients.size);
      },
    })

    // ============================================
    // Webhooks
    // ============================================

    .post("/webhooks/stripe", async ({ body, headers }) => {
      // Verify webhook signature (in production)
      const signature = headers["stripe-signature"];

      // Process webhook event
      const event = body as any;

      console.log("Received Stripe webhook:", event.type);

      switch (event.type) {
        case "payment_intent.succeeded":
          console.log("Payment succeeded:", event.data.object.id);
          // Update order status, send confirmation email, etc.
          break;

        case "customer.subscription.created":
          console.log("New subscription:", event.data.object.id);
          break;

        default:
          console.log("Unhandled event type:", event.type);
      }

      return { received: true };
    })

    .post("/webhooks/github", async ({ body, headers }) => {
      const event = headers["x-github-event"];

      console.log("Received GitHub webhook:", event);

      switch (event) {
        case "push":
          console.log("Push event:", (body as any).repository.name);
          // Trigger CI/CD pipeline
          break;

        case "pull_request":
          console.log("PR event:", (body as any).action);
          // Run tests, post comments
          break;

        default:
          console.log("Unhandled GitHub event:", event);
      }

      return { received: true };
    })

    // Health check
    .get("/health", () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
      users: users.size,
      messages: messages.length,
      wsClients: wsClients.size,
    })),
);

// Export type for Eden Treaty client
export type App = typeof app;
