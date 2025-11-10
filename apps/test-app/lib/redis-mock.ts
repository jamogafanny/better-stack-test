import { Static, t } from "elysia";
import { v4 as uuidv4 } from "uuid";

import { ENTRIES_REFETCH_INTERVAL_MS, MAX_TTL } from "@/lib/constants";

export const redisEntrySchema = t.Object({
  id: t.String(),
  text: t.String(),
  createdAt: t.String(),
  expiresAt: t.String(),
  ttl: t.Number(),
  imageUrl: t.Optional(t.String()),
  memberId: t.String(),
});

export type RedisEntry = Static<typeof redisEntrySchema>;

// In-memory storage for mock data
const mockEntries = new Map<string, RedisEntry>();
const mockMembers = new Map<
  string,
  { sessionId: string; memberId: string; lastSeen: number }
>();

// Sample data
const sampleEntries: RedisEntry[] = [
  {
    id: "entry-1",
    text: "Welcome to the session! This is a sample entry.",
    createdAt: new Date(Date.now() - 5000).toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    ttl: 3600,
    imageUrl: "https://picsum.photos/seed/1/400/300",
    memberId: "member-1",
  },
  {
    id: "entry-2",
    text: "This is another sample entry with some interesting content.",
    createdAt: new Date(Date.now() - 10000).toISOString(),
    expiresAt: new Date(Date.now() + 7200000).toISOString(),
    ttl: 7200,
    memberId: "member-2",
  },
  {
    id: "entry-3",
    text: "Mock data is great for testing without external dependencies!",
    createdAt: new Date(Date.now() - 15000).toISOString(),
    expiresAt: new Date(Date.now() + 1800000).toISOString(),
    ttl: 1800,
    imageUrl: "https://picsum.photos/seed/2/400/300",
    memberId: "member-1",
  },
];

export class SessionRedisService {
  private getEntryKey({
    sessionId,
    entryId,
  }: {
    sessionId: string;
    entryId: string;
  }): string {
    return `session:${sessionId}:entry:${entryId}`;
  }

  private getEntryIndexKey({ sessionId }: { sessionId: string }): string {
    return `session:${sessionId}:entries`;
  }

  private getMemberIndexKey({ sessionId }: { sessionId: string }): string {
    return `session:${sessionId}:members`;
  }

  private getMemberKey({
    sessionId,
    memberId,
  }: {
    sessionId: string;
    memberId: string;
  }): string {
    return `session:${sessionId}:member:${memberId}`;
  }

  private getMemberTTL(): number {
    return Math.floor(ENTRIES_REFETCH_INTERVAL_MS / 1000) + 10;
  }

  async trackMember({
    sessionId,
    memberId,
  }: {
    sessionId: string;
    memberId: string;
  }): Promise<void> {
    // Mock implementation - store member with timestamp
    const memberKey = this.getMemberKey({ sessionId, memberId });
    mockMembers.set(memberKey, {
      sessionId,
      memberId,
      lastSeen: Date.now(),
    });

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  async getOnlineMemberCount({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<number> {
    // Mock implementation - return hard-coded value with some variation
    const now = Date.now();
    const memberTTL = this.getMemberTTL() * 1000; // Convert to milliseconds

    // Count members that are still "online" based on last seen time
    let onlineCount = 0;
    for (const [key, member] of mockMembers.entries()) {
      if (member.sessionId === sessionId && now - member.lastSeen < memberTTL) {
        onlineCount++;
      }
    }

    // Return at least 3 as a sample value, or the actual count if higher
    return Math.max(3, onlineCount);
  }

  async addEntry({
    text,
    ttl,
    imageUrl,
    sessionId,
    memberId,
  }: {
    text: string;
    ttl: number;
    imageUrl?: string;
    sessionId: string;
    memberId: string;
  }): Promise<RedisEntry> {
    // Generate a unique ID for the entry
    const entryId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 1000);

    // Create the entry object
    const entry: RedisEntry = {
      id: entryId,
      text,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      ttl,
      ...(imageUrl && { imageUrl }),
      memberId,
    };

    // Store in mock storage
    const entryKey = this.getEntryKey({ sessionId, entryId });
    mockEntries.set(entryKey, entry);

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Return the entry
    return entry;
  }

  async getAllEntries({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<RedisEntry[]> {
    // Get entries from mock storage for this session
    const now = new Date();
    const sessionEntries: RedisEntry[] = [];

    for (const [key, entry] of mockEntries.entries()) {
      if (
        key.startsWith(`session:${sessionId}:entry:`) &&
        new Date(entry.expiresAt) > now
      ) {
        sessionEntries.push(entry);
      }
    }

    // If no entries in storage, return sample entries
    if (sessionEntries.length === 0) {
      return [...sampleEntries].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    // Sort entries by creation date (newest first)
    return sessionEntries.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getEntry({
    sessionId,
    entryId,
  }: {
    sessionId: string;
    entryId: string;
  }): Promise<RedisEntry | null> {
    // Get the entry from mock storage
    const entryKey = this.getEntryKey({ sessionId, entryId });
    const entry = mockEntries.get(entryKey);

    if (!entry) {
      // Return a sample entry if not found
      return sampleEntries[0] || null;
    }

    // Check if entry is expired
    if (new Date(entry.expiresAt) <= new Date()) {
      mockEntries.delete(entryKey);
      return null;
    }

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 5));

    return entry;
  }

  async deleteEntry({
    sessionId,
    entryId,
  }: {
    sessionId: string;
    entryId: string;
  }): Promise<boolean> {
    // Delete the entry from mock storage
    const entryKey = this.getEntryKey({ sessionId, entryId });
    const existed = mockEntries.has(entryKey);
    mockEntries.delete(entryKey);

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 5));

    // Return true if the entry existed and was deleted
    return existed;
  }
}
