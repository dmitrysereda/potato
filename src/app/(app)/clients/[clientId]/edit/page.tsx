import { notFound } from "next/navigation";
import { getClient, updateClientAction } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClient(clientId);
  if (!client) notFound();

  const updateAction = updateClientAction.bind(null, clientId);

  return (
    <div className="p-8 max-w-lg">
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-heading text-lg font-semibold mb-5">Edit Client</h2>
        <form action={updateAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required defaultValue={client.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={client.notes}
              rows={3}
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </div>
    </div>
  );
}
