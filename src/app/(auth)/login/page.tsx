import { LoginForm } from "./login-form";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("app_users")
    .select("*", { count: "exact", head: true });

  const hasUsers = (count ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">
          Sign in to Potato
        </h1>
      </div>
      <LoginForm />
      {!hasUsers && (
        <p className="text-center text-[13px] text-muted-foreground">
          No account yet?{" "}
          <Link href="/signup" className="text-foreground font-medium hover:underline">
            Create one
          </Link>
        </p>
      )}
    </div>
  );
}
