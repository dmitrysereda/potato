import Link from "next/link";
import { getClients } from "@/actions/clients";
import { getAppUser } from "@/actions/auth";
import { LogoutButton } from "./logout-button";

export async function Sidebar() {
  const [clients, appUser] = await Promise.all([getClients(), getAppUser()]);

  return (
    <aside className="w-56 bg-sidebar flex flex-col h-full border-r border-sidebar-border">
      <div className="px-5 h-14 flex items-center">
        <Link href="/clients" className="font-heading text-lg font-semibold text-sidebar-foreground tracking-tight">
          Potato
        </Link>
      </div>
      <div className="px-4 mb-2">
        <div className="h-px bg-sidebar-border" />
      </div>
      <p className="px-5 mb-2 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40">
        Clients
      </p>
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="block px-2.5 py-1.5 text-[13px] text-sidebar-foreground/70 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150 truncate"
          >
            {client.name}
          </Link>
        ))}
        {clients.length === 0 && (
          <p className="px-2.5 py-1.5 text-[13px] text-sidebar-foreground/30">
            No clients yet
          </p>
        )}
      </nav>
      <div className="px-3 py-3 space-y-1.5">
        <Link
          href="/clients/new"
          className="flex items-center justify-center w-full h-9 text-[13px] font-medium rounded-lg bg-warm-amber text-warm-amber-foreground hover:opacity-90 transition-all duration-150"
        >
          New Client
        </Link>
        {appUser?.role === "owner" && (
          <Link
            href="/settings"
            className="flex items-center justify-center w-full h-8 text-[13px] text-sidebar-foreground/50 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150"
          >
            Settings
          </Link>
        )}
        <LogoutButton />
      </div>
    </aside>
  );
}
