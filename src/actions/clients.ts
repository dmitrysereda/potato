"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import getPostProxy from "@/lib/postproxy";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/supabase/types";

export async function createClientAction(formData: FormData) {
  const name = formData.get("name") as string;
  const notes = (formData.get("notes") as string) ?? "";

  if (!name?.trim()) {
    throw new Error("Name is required");
  }

  const group = await getPostProxy().profileGroups.create(name.trim());

  const supabase = await createClient();
  const { error } = await supabase.from("clients").insert({
    name: name.trim(),
    notes: notes.trim(),
    postproxy_profile_group_id: group.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateClientAction(clientId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const notes = (formData.get("notes") as string) ?? "";

  if (!name?.trim()) {
    throw new Error("Name is required");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ name: name.trim(), notes: notes.trim() })
    .eq("id", clientId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
  redirect(`/clients/${clientId}`);
}

export async function deleteClientAction(clientId: string) {
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("postproxy_profile_group_id")
    .eq("id", clientId)
    .single();

  if (client) {
    try {
      await getPostProxy().profileGroups.delete(
        (client as { postproxy_profile_group_id: string }).postproxy_profile_group_id
      );
    } catch {
      // best-effort cleanup
    }
  }

  await supabase.from("clients").delete().eq("id", clientId);

  revalidatePath("/clients");
  redirect("/clients");
}

export async function getClient(clientId: string): Promise<Client | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Client;
}

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as Client[]) ?? [];
}
