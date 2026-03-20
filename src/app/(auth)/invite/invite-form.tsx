"use client";

import { acceptInvite } from "@/actions/auth";
import { useActionState } from "react";

export function InviteForm({ email, token }: { email: string; token: string }) {
  const [state, action, pending] = useActionState(acceptInvite, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />
      {state?.error && (
        <p className="text-[13px] text-red-600 bg-red-50 rounded px-3 py-2">
          {state.error}
        </p>
      )}
      <div>
        <label className="block text-[13px] font-medium text-foreground mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full h-9 px-3 text-sm border rounded-md bg-muted/50 text-muted-foreground"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-[13px] font-medium text-foreground mb-1"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full h-9 px-3 text-sm border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full h-9 text-[13px] font-medium rounded-md bg-primary text-white hover:opacity-90 transition-colors disabled:opacity-50"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
