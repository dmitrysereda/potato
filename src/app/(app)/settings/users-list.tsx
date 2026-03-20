"use client";

import { removeUser } from "@/actions/auth";
import { useTransition } from "react";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export function UsersList({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const [removing, startRemove] = useTransition();

  function handleRemove(userId: string) {
    startRemove(async () => {
      await removeUser(userId);
    });
  }

  return (
    <div className="border rounded-md divide-y">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between px-3 py-2"
        >
          <div>
            <p className="text-sm text-foreground">
              {user.email}
              {user.id === currentUserId && (
                <span className="ml-2 text-[11px] text-muted-foreground/60">you</span>
              )}
            </p>
            <p className="text-[11px] text-muted-foreground/60">
              {user.role === "owner" ? "Owner" : "Member"}
              {" · "}
              Joined {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          {user.id !== currentUserId && (
            <button
              onClick={() => handleRemove(user.id)}
              disabled={removing}
              className="h-7 px-2 text-[12px] rounded border text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
