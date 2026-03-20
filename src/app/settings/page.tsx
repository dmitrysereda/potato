import { getAppUser, getInvites, getUsers } from "@/actions/auth";
import { redirect } from "next/navigation";
import { InviteSection } from "./invite-section";
import { UsersList } from "./users-list";

export default async function SettingsPage() {
  const appUser = await getAppUser();

  if (!appUser) {
    redirect("/login");
  }

  if (appUser.role !== "owner") {
    redirect("/clients");
  }

  const [invites, users] = await Promise.all([getInvites(), getUsers()]);

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Settings</h1>

      <section className="mt-8">
        <h2 className="text-sm font-medium mb-4">
          Team members
        </h2>
        <UsersList users={users} currentUserId={appUser.id} />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium mb-4">
          Invite team members
        </h2>
        <InviteSection invites={invites} />
      </section>
    </div>
  );
}
