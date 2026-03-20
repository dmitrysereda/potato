import { createClientAction } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function NewClientPage() {
  return (
    <div className="p-8 max-w-2xl w-full mx-auto flex flex-col items-center justify-center h-full">
      <div className="bg-card border border-border rounded-xl p-8 w-full">
        <h1 className="font-heading text-lg font-semibold mb-5">New Client</h1>
        <form action={createClientAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Acme Corp" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Optional notes about this client"
              rows={3}
            />
          </div>
          <Button type="submit">Create Client</Button>
        </form>
      </div>
    </div>
  );
}
