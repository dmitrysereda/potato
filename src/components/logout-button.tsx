"use client";

import { logout } from "@/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex items-center justify-center w-full h-8 text-[13px] text-sidebar-foreground/40 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150"
      >
        Sign out
      </button>
    </form>
  );
}
