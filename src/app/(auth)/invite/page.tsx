import { InviteForm } from "./invite-form";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;
  const email = params.email;

  if (!token || !email) {
    redirect("/login");
  }

  // Verify the invite is valid
  const supabase = await createClient();
  const { data: invite } = await supabase
    .from("invites")
    .select("id")
    .eq("token", token)
    .eq("email", email)
    .single();

  if (!invite) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold font-heading text-foreground">
          Join Potato
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          You&apos;ve been invited. Set a password to get started.
        </p>
      </div>
      <InviteForm email={email} token={token} />
      <p className="text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
