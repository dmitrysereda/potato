"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteClientAction } from "@/actions/clients";

export function ClientActions({ clientId }: { clientId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 px-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
        ...
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link href={`/clients/${clientId}/edit`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            if (confirm("Delete this client and all connected accounts?")) {
              await deleteClientAction(clientId);
            }
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
