import { SignupForm } from "./signup-form";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("app_users")
    .select("*", { count: "exact", head: true });

  // If users already exist, signup is closed
  if (count && count > 0) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold font-heading text-foreground">
          Create your account
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          You&apos;ll be the owner of this Potato instance.
        </p>
      </div>
      <SignupForm />
      <p className="text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
