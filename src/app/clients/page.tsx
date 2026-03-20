import Link from "next/link";
import { getClients } from "@/actions/clients";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="px-8 mt-12 max-w-3xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Clients</h1>
        <Link
          href="/clients/new"
          className="inline-flex items-center h-9 px-5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all duration-150"
        >
          New Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="font-heading text-lg">No clients yet</p>
          <p className="text-sm mt-2">Create your first client to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="group flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-warm-amber/40 hover:shadow-sm transition-all duration-200"
              >
                <div>
                  <span className="text-sm font-medium">{client.name}</span>
                  {client.notes && (
                    <p className="text-sm text-muted-foreground mt-0.5">{client.notes}</p>
                  )}
                </div>
                <span className="text-muted-foreground/40 group-hover:text-warm-amber transition-colors text-sm">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
