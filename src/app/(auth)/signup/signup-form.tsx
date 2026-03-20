"use client";

import { signup } from "@/actions/auth";
import { useActionState } from "react";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="text-[13px] text-red-600 bg-red-50 rounded px-3 py-2">
          {state.error}
        </p>
      )}
      <div>
        <label
          htmlFor="email"
          className="block text-[13px] font-medium text-foreground mb-1"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full h-9 px-3 text-sm border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
