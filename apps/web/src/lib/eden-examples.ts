/**
 * Eden Treaty Usage Examples
 *
 * This file demonstrates how to use the Eden Treaty client to interact
 * with your Elysia API in a type-safe manner.
 */

import { api } from "./eden-client";

// ============================================
// REST API Examples
// ============================================

/**
 * Fetch all users
 */
export async function getAllUsers() {
  const { data, error } = await api.users.get();

  if (error) {
    console.error("Error fetching users:", error);
    return null;
  }

  return data;
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string) {
  const { data, error } = await api.users({ id }).get();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data;
}

/**
 * Create a new user
 */
export async function createUser(name: string, email: string) {
  const { data, error } = await api.users.post({
    name,
    email,
  });

  if (error) {
    console.error("Error creating user:", error);
    return null;
  }

  return data;
}

/**
 * Update a user
 */
export async function updateUser(
  id: string,
  updates: { name?: string; email?: string; avatarUrl?: string },
) {
  const { data, error } = await api.users({ id }).patch(updates);

  if (error) {
    console.error("Error updating user:", error);
    return null;
  }

  return data;
}

/**
 * Delete a user
 */
export async function deleteUser(id: string) {
  const { data, error } = await api.users({ id }).delete();

  if (error) {
    console.error("Error deleting user:", error);
    return false;
  }

  return data?.success ?? false;
}

/**
 * Get messages with pagination
 */
export async function getMessages(limit = 50, offset = 0) {
  const { data, error } = await api.messages.get({
    query: {
      limit,
      offset,
    },
  });

  if (error) {
    console.error("Error fetching messages:", error);
    return null;
  }

  return data;
}

// ============================================
// File Upload Examples
// ============================================

/**
 * Upload a single file
 */
export async function uploadFile(file: File) {
  const { data, error } = await api.upload.post({
    file,
  });

  if (error) {
    console.error("Error uploading file:", error);
    return null;
  }

  return data;
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(files: File[]) {
  const { data, error } = await api.upload.multiple.post({
    files,
  });

  if (error) {
    console.error("Error uploading files:", error);
    return null;
  }

  return data;
}

/**
 * Update user avatar
 */
export async function updateUserAvatar(userId: string, avatarFile: File) {
  const { data, error } = await api.users({ id: userId }).avatar.post({
    avatar: avatarFile,
  });

  if (error) {
    console.error("Error updating avatar:", error);
    return null;
  }

  return data;
}

// ============================================
// WebSocket Example
// ============================================

/**
 * Connect to WebSocket for real-time chat
 */
export function connectToChat(
  userId: string,
  onMessage: (message: any) => void,
) {
  // Note: WebSocket connection with Eden Treaty
  // For WebSocket, you might need to use the native WebSocket API
  const wsUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") ||
    "ws://localhost:3000";
  const ws = new WebSocket(`${wsUrl}/api/ws`);

  ws.onopen = () => {
    console.log("Connected to chat");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("Disconnected from chat");
  };

  // Return helper functions
  return {
    sendMessage: (content: string) => {
      ws.send(
        JSON.stringify({
          type: "chat_message",
          userId,
          content,
        }),
      );
    },
    sendTyping: () => {
      ws.send(
        JSON.stringify({
          type: "typing",
          userId,
        }),
      );
    },
    close: () => {
      ws.close();
    },
  };
}

// ============================================
// Health Check
// ============================================

/**
 * Check API health
 */
export async function checkHealth() {
  const { data, error } = await api.health.get();

  if (error) {
    console.error("Health check failed:", error);
    return null;
  }

  return data;
}

// ============================================
// React Hook Example (for use in components)
// ============================================

/**
 * Example of how to use Eden Treaty in a React component with hooks
 *
 * import { useState, useEffect } from 'react';
 * import { getAllUsers } from '@/lib/eden-examples';
 *
 * export function UsersList() {
 *   const [users, setUsers] = useState([]);
 *   const [loading, setLoading] = useState(true);
 *
 *   useEffect(() => {
 *     async function fetchUsers() {
 *       const data = await getAllUsers();
 *       if (data) setUsers(data);
 *       setLoading(false);
 *     }
 *     fetchUsers();
 *   }, []);
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <ul>
 *       {users.map(user => (
 *         <li key={user.id}>{user.name} - {user.email}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 */
