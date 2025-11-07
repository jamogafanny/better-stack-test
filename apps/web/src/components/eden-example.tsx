"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/eden-client";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export function EdenExample() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await api.users.get();

    if (apiError) {
      setError("Failed to fetch users");
      console.error(apiError);
    } else if (data) {
      setUsers(data);
    }

    setLoading(false);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const { data, error: apiError } = await api.users.post({
      name: newUserName,
      email: newUserEmail,
    });

    if (apiError) {
      setError("Failed to create user");
      console.error(apiError);
    } else if (data) {
      setUsers([...users, data]);
      setNewUserName("");
      setNewUserEmail("");
    }

    setCreating(false);
  }

  async function handleDeleteUser(id: string) {
    const { error: apiError } = await api.users({ id }).delete();

    if (apiError) {
      setError("Failed to delete user");
      console.error(apiError);
    } else {
      setUsers(users.filter((user) => user.id !== id));
    }
  }

  async function handleUpdateUser(id: string, name: string) {
    const { data, error: apiError } = await api.users({ id }).patch({
      name,
    });

    if (apiError) {
      setError("Failed to update user");
      console.error(apiError);
    } else if (data && "id" in data && "name" in data && "email" in data) {
      setUsers(users.map((user) => (user.id === id ? (data as User) : user)));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Eden Treaty Example</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create User Form */}
      <form
        onSubmit={handleCreateUser}
        className="mb-8 p-6 bg-gray-50 rounded-lg"
      >
        <h2 className="text-xl font-semibold mb-4">Create New User</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            required
            minLength={2}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            required
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {creating ? "Creating..." : "Create User"}
        </button>
      </form>

      {/* Users List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Users ({users.length})</h2>
        {users.length === 0 ? (
          <div className="text-gray-600 text-center py-8">
            No users found. Create one above!
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-400 mt-1">ID: {user.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newName = prompt("Enter new name:", user.name);
                        if (newName && newName !== user.name) {
                          handleUpdateUser(user.id, newName);
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete user ${user.name}?`)) {
                          handleDeleteUser(user.id);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">🚀 Type-Safe API Calls</h3>
        <p className="text-sm text-gray-700">
          All API calls are fully type-safe thanks to Eden Treaty! The client
          automatically infers types from your Elysia server definition.
        </p>
      </div>
    </div>
  );
}
