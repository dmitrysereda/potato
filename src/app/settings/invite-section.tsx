"use client";

import { inviteUser, deleteInvite } from "@/actions/auth";
import { useActionState, useState, useTransition } from "react";

interface Invite {
  id: string;
  email: string;
  token: string;
  created_at: string;
}

export function InviteSection({ invites }: { invites: Invite[] }) {
  const [state, action, pending] = useActionState(inviteUser, undefined);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deletingId, startDelete] = useTransition();

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  function copyLink(email: string, token: string) {
    const link = `${appUrl}/invite?email=${encodeURIComponent(email)}&token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  function handleDelete(id: string) {
    startDelete(async () => {
      await deleteInvite(id);
    });
  }

  // Show the newly created invite link
  const newToken = state?.token;

  return (
    <div className="space-y-4">
      <form action={action} className="flex gap-2">
        <input
          name="email"
          type="email"
          placeholder="colleague@example.com"
          required
          className="flex-1 h-9 px-3 text-sm border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 text-[13px] font-medium rounded-md bg-primary text-white hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {pending ? "Inviting..." : "Invite"}
        </button>
      </form>

      {state?.error && (
        <p className="text-[13px] text-red-600 bg-red-50 rounded px-3 py-2">
          {state.error}
        </p>
      )}

      {newToken && (
        <div className="text-[13px] text-green-700 bg-green-50 rounded px-3 py-2">
          Invite sent! Share the invite link with them — they can find it in the
          list below.
        </div>
      )}

      {invites.length > 0 && (
        <div className="border rounded-md divide-y">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between px-3 py-2"
            >
              <div>
                <p className="text-sm text-foreground">{invite.email}</p>
                <p className="text-[11px] text-muted-foreground/60">
                  Invited{" "}
                  {new Date(invite.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyLink(invite.email, invite.token)}
                  className="h-7 px-2 text-[12px] rounded border text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  {copiedToken === invite.token ? "Copied!" : "Copy link"}
                </button>
                <button
                  onClick={() => handleDelete(invite.id)}
                  disabled={deletingId}
                  className="h-7 px-2 text-[12px] rounded border text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
