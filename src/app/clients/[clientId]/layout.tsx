import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/actions/clients";
import { ClientActions } from "@/components/client-actions";
import { TabNav } from "@/components/tab-nav";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClient(clientId);

  if (!client) notFound();

  const tabs = [
    { label: "Profiles", href: `/clients/${clientId}/profiles` },
    { label: "Compose", href: `/clients/${clientId}/compose` },
    { label: "Posts", href: `/clients/${clientId}/posts` },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-6 pb-0">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-heading text-xl font-semibold tracking-tight">{client.name}</h1>
          <ClientActions clientId={clientId} />
        </div>
        <TabNav tabs={tabs} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
