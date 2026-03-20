"use server";

import { cache } from "react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

export async function signup(_state: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();

  // Check if any users exist — only allow signup if none do (owner registration)
  const { count } = await supabase
    .from("app_users")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    return { error: "Signup is closed. Ask the owner to invite you." };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create account" };
  }

  // Create the app_user as owner
  const { error: insertError } = await supabase.from("app_users").insert({
    auth_id: authData.user.id,
    email,
    role: "owner",
  });

  if (insertError) {
    return { error: insertError.message };
  }

  redirect("/clients");
}

export async function login(_state: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/clients");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function inviteUser(_state: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { error: "Email is required" };
  }

  const supabase = await createClient();

  // Verify caller is the owner
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: appUser } = await supabase
    .from("app_users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!appUser || appUser.role !== "owner") {
    return { error: "Only the owner can invite users" };
  }

  // Check if already a user
  const { data: existing } = await supabase
    .from("app_users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return { error: "This email is already registered" };
  }

  // Check if already invited
  const { data: existingInvite } = await supabase
    .from("invites")
    .select("id")
    .eq("email", email)
    .single();

  if (existingInvite) {
    return { error: "This email has already been invited" };
  }

  const token = randomBytes(32).toString("hex");

  const { error: insertError } = await supabase.from("invites").insert({
    email,
    token,
    invited_by: appUser.id,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/settings");
  return { token };
}

export async function deleteInvite(inviteId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: appUser } = await supabase
    .from("app_users")
    .select("role")
    .eq("auth_id", user.id)
    .single();

  if (!appUser || appUser.role !== "owner") {
    return { error: "Only the owner can manage invites" };
  }

  await supabase.from("invites").delete().eq("id", inviteId);
  revalidatePath("/settings");
}

export async function acceptInvite(_state: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const token = formData.get("token") as string;

  if (!email || !password || !token) {
    return { error: "All fields are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();

  // Verify invite
  const { data: invite } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .eq("email", email)
    .single();

  if (!invite) {
    return { error: "Invalid invite link" };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create account" };
  }

  // Create app user
  const { error: insertError } = await supabase.from("app_users").insert({
    auth_id: authData.user.id,
    email,
    role: "member",
  });

  if (insertError) {
    return { error: insertError.message };
  }

  // Delete the used invite
  await supabase.from("invites").delete().eq("id", invite.id);

  redirect("/clients");
}

export const getAppUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("app_users")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  return data;
});

export async function getInvites() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invites")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getUsers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_users")
    .select("*")
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function removeUser(userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: appUser } = await supabase
    .from("app_users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!appUser || appUser.role !== "owner") {
    return { error: "Only the owner can remove users" };
  }

  if (appUser.id === userId) {
    return { error: "You cannot remove yourself" };
  }

  await supabase.from("app_users").delete().eq("id", userId);
  revalidatePath("/settings");
}
